require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      report TEXT
    );
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      english TEXT,
      spanish TEXT,
      french TEXT
    );
  `);
  console.log("✅ SQLite Database connected.");
})();

// Initialize Gemini Client safely
let ai = null;
try {
  const { GoogleGenAI } = require('@google/genai');
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("✅ Google Gemini SDK Initialized successfully.");
  } else {
    console.log("⚠️  GEMINI_API_KEY not found or default. Using simulated fallback responses.");
  }
} catch (e) {
  console.log("⚠️  Failed to load @google/genai. Using simulated fallback responses.", e.message);
}

// --- Simulation State ---
let stadiumState = {
  densities: { F: 0.8, G: 0.9, H: 0.3, K: 0.2 },
  stats: {
    occ: 41000,
    rate: 450,
    qAvg: 8.2,
    qLanes: 18,
    medOpen: 2,
    medEta: 4.5
  },
  transport: {
    rail: 6,
    ride: 15,
    shuttle: 4
  },
  emergencies: [] // Store active SOS alerts
};

// --- Simulation Loop ---
setInterval(() => {
  Object.keys(stadiumState.densities).forEach(g => {
    stadiumState.densities[g] = Math.min(1, Math.max(0.05, stadiumState.densities[g] + (Math.random() - 0.5) * 0.12));
  });
  stadiumState.stats.occ = Math.min(82500, stadiumState.stats.occ + Math.floor(Math.random() * 900));
  stadiumState.stats.rate = 300 + Math.floor(Math.random() * 400);
  stadiumState.stats.qAvg = (6 + Math.random() * 9).toFixed(1);
  stadiumState.stats.medEta = (3 + Math.random() * 3).toFixed(1);

  stadiumState.transport.rail = 4 + Math.floor(Math.random() * 6);
  stadiumState.transport.ride = 12 + Math.floor(Math.random() * 10);
  stadiumState.transport.shuttle = 2 + Math.floor(Math.random() * 10);
}, 3000);

// --- Endpoints ---
app.get('/api/pulse', (req, res) => res.json(stadiumState.densities));
app.get('/api/stats', (req, res) => res.json(stadiumState.stats));
app.get('/api/transport', (req, res) => res.json(stadiumState.transport));

// --- External API Integrations ---
app.get('/api/weather', async (req, res) => {
  try {
    // Open-Meteo API for London Coordinates (Emirates Stadium)
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.5549&longitude=-0.1084&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Europe%2FLondon';
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API failed");
    const data = await response.json();
    res.json({
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weather_code,
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      precip: data.current.precipitation,
      wind: data.current.wind_speed_10m
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    res.status(500).json({ temp: '--', code: 0, feelsLike: '--', humidity: '--', precip: '--', wind: '--' });
  }
});

let matchClock = 74;
setInterval(() => { if(matchClock < 90) matchClock++; }, 60000); // increment every minute

app.get('/api/scores', (req, res) => {
  // Mocking realistic live match data
  res.json({
    home: { team: 'England', score: 2, flag: 'https://flagcdn.com/w160/gb-eng.png' },
    away: { team: 'Brazil', score: 1, flag: 'https://flagcdn.com/w160/br.png' },
    clock: `${matchClock}'`,
    status: 'LIVE'
  });
});

app.get('/api/announcements', async (req, res) => {
  if (!db) return res.json([]);
  const rows = await db.all('SELECT * FROM announcements ORDER BY timestamp DESC LIMIT 1');
  res.json(rows[0] || null);
});

app.post('/api/broadcast', async (req, res) => {
  const { notes } = req.body;
  if (ai) {
    try {
      const prompt = `Translate and expand the following short staff note into a professional, formal public address announcement for a stadium. 
Return EXACTLY a JSON object with three keys: "english", "spanish", and "french". Do not wrap it in markdown.
Staff Note: "${notes}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      await db.run('INSERT INTO announcements (english, spanish, french) VALUES (?, ?, ?)', [parsed.english, parsed.spanish, parsed.french]);
      return res.json({ success: true, ...parsed });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Broadcast translation failed' });
    }
  }

  // Fallback
  await db.run('INSERT INTO announcements (english, spanish, french) VALUES (?, ?, ?)', [notes, 'Aviso: ' + notes, 'Avis: ' + notes]);
  res.json({ success: true, english: notes });
});

app.delete('/api/broadcast', async (req, res) => {
  if (!db) return res.json({ success: false });
  // We can just clear the whole announcements table to effectively "remove" the active PA
  await db.run('DELETE FROM announcements');
  res.json({ success: true });
});

app.post('/api/chat', async (req, res) => {
  const { query, system, persona } = req.body;
  
  if (ai) {
    try {
      // Inject live state into prompt
      const liveContext = `
      --- LIVE STADIUM CONTEXT ---
      Occupancy: ${stadiumState.stats.occ}/82500
      Gate Densities (0 to 1): ${JSON.stringify(stadiumState.densities)}
      Transport Wait Times (mins): Rail ${stadiumState.transport.rail}, Ride ${stadiumState.transport.ride}, Shuttle ${stadiumState.transport.shuttle}
      `;
      
      let personaContext = "";
      if (persona) {
        personaContext = `The user you are speaking to has the following persona/accessibility needs: ${persona}. YOU MUST tailor all routing, seating, and stadium advice specifically for this persona (e.g. if wheelchair, recommend elevators and ramps; if VIP, recommend lounges and expedited entry).`;
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS: You are the intelligent StadiumGenie Command Center AI for the FIFA World Cup 2026 at MetLife Stadium. ${system}\n\n${personaContext}\n\n${liveContext}\n\nUSER PROMPT: ${query}` }] }
        ]
      });
      return res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error.message);
      return res.json({ text: "Error connecting to Gemini. Falling back to local data..." });
    }
  }

  // Fallback
  const lower = query.toLowerCase();
  let response = "I couldn't generate a response just now — please try again.";
  if (lower.includes("gate")) response = "Head to the less congested gate to save time.";
  else if (lower.includes("accessible") || lower.includes("wheelchair") || lower.includes("stroller")) response = "1. Exit transit drop-off.\n2. Proceed to Gate C Accessible Entrance.\n3. Take Elevator B12 to Club Level.\n4. Follow concourse to Section 218.";
  else if (lower.includes("match ends") || lower.includes("surge")) response = "NJ Transit Rail is currently your fastest option. To beat the surge, depart immediately or wait 45 minutes for crowds to clear.";
  else if (lower.includes("field notes")) response = "INCIDENT: Crowd bottleneck forming\nLOCATION: Gate D, Section 130\nSEVERITY: Medium\nIMMEDIATE ACTION: Dispatch staff to redirect fans.\nRECOMMENDED FOLLOW-UP: Re-open concessions.";
  else if (lower.includes("concourse entry counts")) response = "Entries surged then stabilized. Recommend opening auxiliary lanes during the next 20 minutes to handle late arrivals.";
  else if (lower.includes("venue sustainability")) response = "Strength: Grid energy from renewables is excellent (78%). Action: Increase water reclamation by checking for leaks in concourse restrooms.";
  else response = "I've logged your query. As an AI assistant, I can help analyze crowd flows, generate announcements, or suggest emergency protocols.";
  
  setTimeout(() => res.json({ text: response }), 1000);
});

app.get('/api/sos', (req, res) => res.json(stadiumState.emergencies));

app.post('/api/briefing', async (req, res) => {
  if (ai) {
    try {
      const liveContext = `
      Gate Densities: ${JSON.stringify(stadiumState.densities)}
      Transport Delays (mins): Rail ${stadiumState.transport.rail}, Ride ${stadiumState.transport.ride}
      Active SOS Alerts: ${JSON.stringify(stadiumState.emergencies)}
      `;
      const prompt = `You are the AI Tactical Commander for StadiumGenie. Generate a rapid, 3-bullet point tactical operational briefing for stadium security staff based on this live data:\n${liveContext}\nFocus on critical bottlenecks, active SOS alerts, and immediate actions required. Keep it strictly to 3 bullet points, concise, military precision.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return res.json({ briefing: response.text });
    } catch (e) {
      return res.json({ briefing: "Error generating briefing via AI." });
    }
  }
  return res.json({ briefing: "1. Monitor Gate G closely.\n2. Respond to SOS at Section 112.\n3. Transport flowing normally." });
});

app.post('/api/sos', (req, res) => {
  const { location } = req.body;
  const newSos = { id: Date.now(), location, timestamp: new Date().toISOString() };
  stadiumState.emergencies.unshift(newSos);
  res.json({ success: true });
});

app.post('/api/sos/resolve', (req, res) => {
  const { id } = req.body;
  stadiumState.emergencies = stadiumState.emergencies.filter(e => e.id !== id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Command Center API listening at http://localhost:${PORT}`));
}
module.exports = app;
