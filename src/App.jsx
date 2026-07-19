import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- API FETCHERS ---
const fetchPulse = async () => (await fetch('/api/pulse')).json();
const fetchStats = async () => (await fetch('/api/stats')).json();
const fetchTransport = async () => (await fetch('/api/transport')).json();
const fetchAnnouncements = async () => (await fetch('/api/announcements')).json();

const broadcastAnnouncement = async (notes) => {
  const res = await fetch('/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  return res.json();
};

const sendSos = async (location) => {
  const res = await fetch('/api/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });
  return res.json();
};

const fetchSos = async () => (await fetch('/api/sos')).json();

const resolveSos = async (id) => {
  const res = await fetch('/api/sos/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return res.json();
};

const askClaude = async (systemPrompt, userPrompt, persona) => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userPrompt, system: systemPrompt, persona })
    });
    const data = await res.json();
    return data.text;
  } catch (err) {
    return "The backend assistant is currently unreachable.";
  }
};

// --- COMPONENTS ---

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="17" rx="10" ry="4" />
    <ellipse cx="12" cy="17" rx="5" ry="1.5" strokeOpacity="0.5" />
    <path d="M14 2L6 11h6l-1 6 9-10h-6l1-5z" fill="currentColor" stroke="none" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const SettingsModal = ({ onClose, onLogout, theme, setTheme, pushEnabled, setPushEnabled, syncActive, setSyncActive, onProfileChange }) => {
  const [name, setName] = useState(localStorage.getItem('profileName') || '');
  const [email, setEmail] = useState(localStorage.getItem('profileEmail') || '');
  const [age, setAge] = useState(localStorage.getItem('profileAge') || '');
  const [contact, setContact] = useState(localStorage.getItem('profileContact') || '');

  const handleSaveProfile = () => {
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileEmail', email);
    localStorage.setItem('profileAge', age);
    localStorage.setItem('profileContact', contact);
    if (onProfileChange) onProfileChange(name);
    alert('Profile saved successfully!');
  };

  return (
    <div style={{ zIndex: 99999, cursor: 'pointer', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ maxWidth: '380px', width: '100%', padding: '32px', cursor: 'default', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', margin: 'auto', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', margin: 0, fontFamily: 'var(--display)' }}>App Settings</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
        </div>

        <div className="auth-divider" style={{ margin: '16px 0 24px 0' }}><span>USER PROFILE</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', color: '#f8fafc', borderRadius: '8px' }} />
          <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', color: '#f8fafc', borderRadius: '8px' }} />
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', color: '#f8fafc', borderRadius: '8px' }} />
          <input type="tel" placeholder="Contact No" value={contact} onChange={e => setContact(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', color: '#f8fafc', borderRadius: '8px' }} />
          <button onClick={handleSaveProfile} style={{ padding: '10px', background: 'var(--pitch)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Profile</button>
        </div>
        
        <div className="auth-divider" style={{ margin: '24px 0' }}><span>PREFERENCES</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Theme Mode</span>
            <button style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--pitch)', fontWeight: 'bold', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Push Notifications</span>
            <input type="checkbox" checked={pushEnabled} onChange={e => setPushEnabled(e.target.checked)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Data Sync</span>
            <button style={{ background: syncActive ? 'var(--pitch)' : 'var(--bg)', color: syncActive ? '#000' : 'var(--muted)', border: 'none', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setSyncActive(!syncActive)}>
              {syncActive ? 'Active' : 'Paused'}
            </button>
          </div>
        </div>
        
        <div className="auth-divider" style={{ margin: '24px 0' }}><span>ACCOUNT</span></div>
        
        <button className="btn" style={{ width: '100%', background: 'var(--bg-panel-raised)', color: 'var(--red)', border: '1px solid rgba(255,51,51,0.2)' }} onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Topbar = ({ role, setRole, onLogout, theme, setTheme, pushEnabled, setPushEnabled, syncActive, setSyncActive, notifications }) => {
  const [time, setTime] = useState('--:--:--');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [profileName, setProfileName] = useState(localStorage.getItem('profileName') || '');
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="topbar" style={{
      background: 'linear-gradient(135deg, #020617, #0f172a)',
      position: 'relative',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      padding: '20px 32px',
      zIndex: 10
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1), transparent 70%)', borderRadius: '50%' }}></div>
      </div>
      
      <div className="brand" style={{ position: 'relative', zIndex: 1 }}>
        <div className="brand-mark" style={{ background: '#34d399', color: '#022c22', boxShadow: '0 4px 12px rgba(52, 211, 153, 0.4)' }}><LogoIcon /></div>
        <div className="brand-text">
          <div className="kicker" style={{ color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>FIFA World Cup 2026</div>
          <h1 style={{ color: '#f8fafc', fontWeight: '900', letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>STADIUMGENIE | MATCHDAY LIVE OVERVIEW</h1>
        </div>
      </div>
      <div className="venue-meta">
        <span><span className="dot" style={{ background: syncActive ? 'var(--pitch)' : 'var(--amber)', boxShadow: syncActive ? '0 0 10px var(--pitch)' : 'none' }}></span>London, UK {syncActive ? '(LIVE)' : '(PAUSED)'}</span>
        <span>{time}</span>
        <span>Kickoff <b style={{ color: 'var(--floodlight)' }}>19:00</b></span>
      </div>
      <div className="role-switch" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', background: 'var(--bg-panel)', borderRadius: '12px', padding: '4px' }}>
          <button className={role === 'fan' ? 'active' : ''} onClick={() => setRole('fan')} style={{ padding: '6px 12px', border: 'none', background: role === 'fan' ? 'var(--bg-panel-raised)' : 'transparent', color: role === 'fan' ? 'var(--floodlight)' : 'var(--muted)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Fan</button>
          <button className={role === 'staff' ? 'active' : ''} onClick={() => setRole('staff')} style={{ padding: '6px 12px', border: 'none', background: role === 'staff' ? 'var(--bg-panel-raised)' : 'transparent', color: role === 'staff' ? 'var(--floodlight)' : 'var(--muted)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Staff / Organizer</button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{ position: 'relative', background: 'transparent', border: 'none', color: showNotifs ? 'var(--pitch)' : 'var(--muted)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }} onClick={() => setShowNotifs(!showNotifs)}>
            <BellIcon />
            {unreadCount > 0 && <span className="notif-badge"></span>}
          </button>
          
          {profileName && (
            <span style={{ color: 'var(--pitch)', fontWeight: 'bold', marginLeft: '4px', marginRight: '4px', fontSize: '14px' }}>
              Hi, {profileName.split(' ')[0]}
            </span>
          )}

          <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }} onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </button>
        </div>
      </div>
      
      {showNotifs && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <h3>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</h3>
            {unreadCount > 0 && <button style={{ background: 'none', border: 'none', color: 'var(--pitch)', fontSize: '12px', cursor: 'pointer' }} onClick={() => notifications.forEach(n => n.read = true)}>Mark all read</button>}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No new notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="notif-item" style={{ opacity: n.read ? 0.6 : 1 }} onClick={() => n.read = true}>
                  <span className="notif-time">{n.time}</span>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-body">{n.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onLogout={onLogout} theme={theme} setTheme={setTheme} pushEnabled={pushEnabled} setPushEnabled={setPushEnabled} syncActive={syncActive} setSyncActive={setSyncActive} onProfileChange={setProfileName} />}
    </div>
  );
};

const FanTicker = () => {
  const [ann, setAnn] = useState(null);
  const [lang, setLang] = useState('english');

  useEffect(() => {
    const load = async () => {
      const data = await fetchAnnouncements();
      if (data && data.english) {
        setAnn(data);
      } else {
        setAnn(null);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!ann) return null;

  return (
    <div className="fan-ticker" style={{ background: 'var(--amber)', color: '#0B1220', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Live Stadium Announcement</strong>
        <span style={{ fontSize: '15px', fontWeight: '500' }}>{ann[lang]}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['english', 'spanish', 'french'].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#000' : 'rgba(0,0,0,0.1)', color: lang === l ? '#fff' : '#000', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>
            {l.slice(0,2)}
          </button>
        ))}
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #020617, #0f172a)',
      borderRadius: '24px',
      padding: '48px',
      marginBottom: '32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-100px', left: '-50px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 16px 0', letterSpacing: '-2px', color: '#f8fafc', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          Welcome to <span style={{ color: '#34d399' }}>StadiumGenie</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#94a3b8', margin: '0 0 32px 0', maxWidth: '600px', lineHeight: '1.6' }}>
          Your ultimate digital companion for the FIFA World Cup 2026. Navigate the stadium, beat the queues, and catch every live update effortlessly.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', background: '#34d399', color: '#022c22', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(52, 211, 153, 0.4)' }}>
            Explore Match Data
          </button>
          <button style={{ padding: '16px 32px', fontSize: '16px', fontWeight: 'bold', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            Talk to AI Copilot
          </button>
        </div>
      </div>
    </div>
  );
};

const StadiumPulse = ({ persona }) => {
  const [densities, setDensities] = useState({ F: 0.8, G: 0.9, H: 0.3, K: 0.2 });
  const [pulseT, setPulseT] = useState(0);
  const [tip, setTip] = useState('Select a gate node to get an AI wait-time recommendation.');
  const [mapMode, setMapMode] = useState('heatmap'); // 'heatmap' or 'sos'
  const [sosAlerts, setSosAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPulse();
      setDensities(data);
      const alerts = await fetchSos();
      setSosAlerts(alerts);
    };
    load();
    const interval = setInterval(() => {
      load();
      setPulseT(p => p + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleGateClick = async (gate) => {
    const d = densities[gate] || 0;
    const level = d < 0.4 ? 'Optimal' : d < 0.7 ? 'Moderate' : 'Congested';
    const waitMin = Math.round(2 + d * 22);
    setTip(`Gate ${gate}: ${level} flow, ~${waitMin} min queue. Loading AI tip...`);
    
    let best = 'K';
    if(Object.keys(densities).length > 0) best = Object.entries(densities).sort((a, b) => a[1] - b[1])[0][0];
    const prompt = `A fan is near Gate ${gate} (${level}, ~${waitMin}m wait). Best is Gate ${best}. Generate a dynamic, personalized routing suggestion to get them inside safely and quickly. Mention transport if relevant.`;
    const reply = await askClaude("Stadium assistant.", prompt, persona);
    setTip(`Gate ${gate}: ${level} flow, ~${waitMin} min queue. — ${reply}`);
  };

  const getStatusColor = (d) => {
    if (d < 0.4) return 'var(--pitch)';
    if (d < 0.7) return 'var(--amber)';
    return 'var(--red)';
  };
  const getGlowClass = (d) => {
    if (d < 0.4) return 'glow-green';
    if (d < 0.7) return 'glow-amber';
    return 'glow-red';
  };

  const renderComplexSvg = () => {
    const cx = 300, cy = 250;
    
    // Gate positions mapped to stadium entrances
    const gates = [
      { id: 'G_top', label: 'G', angle: -90, d: densities['G'] || 0.9 },
      { id: 'K_tl', label: 'K', angle: -140, d: densities['K'] || 0.2 },
      { id: 'F_bl', label: 'F', angle: 140, d: densities['F'] || 0.8 },
      { id: 'G_bot', label: 'G', angle: 90, d: densities['G'] || 0.6 },
      { id: 'K_br', label: 'K', angle: 40, d: densities['K'] || 0.3 },
      { id: 'H_r', label: 'H', angle: 0, d: densities['H'] || 0.4 },
      { id: 'F_tr', label: 'F', angle: -40, d: densities['F'] || 0.5 },
    ];

    // Player positions
    const players = [
      { x: 220, y: 220, emoji: '🏃‍♂️' },
      { x: 380, y: 260, emoji: '🏃‍♀️' },
      { x: 280, y: 240, emoji: '⚽' },
      { x: 340, y: 200, emoji: '🏃‍♂️' },
      { x: 250, y: 280, emoji: '🏃‍♀️' },
    ];

    return (
      <svg viewBox="0 0 600 500" id="emiratesSvg">
        {/* Background / Base Layer */}
        <rect width="600" height="500" fill="transparent" />

        {/* Grandstands (Outer) */}
        <path d="M 50 250 A 250 200 0 1 1 550 250 A 250 200 0 1 1 50 250" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="8" />
        <path d="M 70 250 A 230 180 0 1 1 530 250 A 230 180 0 1 1 70 250" fill="#EF4444" stroke="#DC2626" strokeWidth="4" />
        <path d="M 90 250 A 210 160 0 1 1 510 250 A 210 160 0 1 1 90 250" fill="#3B82F6" stroke="#2563EB" strokeWidth="4" />
        <path d="M 110 250 A 190 140 0 1 1 490 250 A 190 140 0 1 1 110 250" fill="#FBBF24" stroke="#F59E0B" strokeWidth="4" />
        
        {/* Pitch (Inner) */}
        <rect x="150" y="150" width="300" height="200" rx="20" fill="#22C55E" stroke="#166534" strokeWidth="4" />
        {/* Pitch Pattern (Stripes) */}
        <rect x="170" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />
        <rect x="210" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />
        <rect x="250" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />
        <rect x="290" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />
        <rect x="330" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />
        <rect x="370" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />
        <rect x="410" y="152" width="20" height="196" fill="#15803D" opacity="0.4" />

        {/* Pitch Lines (White) */}
        <rect x="160" y="160" width="280" height="180" fill="transparent" stroke="#FFF" strokeWidth="2" />
        <line x1="300" y1="160" x2="300" y2="340" stroke="#FFF" strokeWidth="2" />
        <circle cx="300" cy="250" r="30" fill="none" stroke="#FFF" strokeWidth="2" />
        <circle cx="300" cy="250" r="4" fill="#FFF" />
        {/* Penalty boxes */}
        <rect x="160" y="200" width="40" height="100" fill="none" stroke="#FFF" strokeWidth="2" />
        <rect x="400" y="200" width="40" height="100" fill="none" stroke="#FFF" strokeWidth="2" />

        {/* Cartoon Players */}
        {players.map((p, i) => (
          <text key={`player-${i}`} x={p.x + Math.sin(pulseT + i) * 10} y={p.y + Math.cos(pulseT + i) * 10} fontSize="20" textAnchor="middle">{p.emoji}</text>
        ))}

        {/* Floating LIVE SENSOR FEED Badge */}
        <g transform="translate(20, 20)">
          <rect width="180" height="30" rx="15" fill="var(--bg-panel-raised)" stroke="var(--pitch)" strokeWidth="2" />
          <circle cx="35" cy="15" r="5" fill="var(--red)" className="glow-red" />
          <text x="50" y="19" fontSize="12" fontWeight="bold" fill="var(--floodlight)" fontFamily="var(--display)">LIVE SENSOR FEED</text>
        </g>

        {/* Gate Nodes (Live Data Overlay) */}
        {gates.map((g, i) => {
          const rad = (g.angle * Math.PI) / 180;
          const rNode = 220; // Radius of the gate on the grandstand rim
          const gx = cx + rNode * Math.cos(rad);
          const gy = cy + rNode * Math.sin(rad);
          const color = getStatusColor(g.d);
          const glowClass = getGlowClass(g.d);
          const animR = 12 + g.d * 8 + Math.sin(pulseT / 3 + i) * 3;

          return (
            <g key={i} className="gate-node" style={{ cursor: 'pointer' }} onClick={() => handleGateClick(g.label)}>
              {/* Connecting Path to Stadium Center */}
              <line x1={cx + 120 * Math.cos(rad)} y1={cy + 120 * Math.sin(rad)} x2={gx} y2={gy} stroke={color} strokeWidth="3" strokeDasharray="4 4" opacity="0.5" />
              
              {/* Gate Hub Base */}
              <circle cx={gx} cy={gy} r="18" fill="var(--bg-panel-raised)" stroke={color} strokeWidth="2" />
              
              {/* Glowing Aura (Congestion Level) */}
              <circle cx={gx} cy={gy} r={animR + 6} fill={color} opacity="0.2" className={glowClass} />
              
              {/* Inner Node Activity */}
              <circle cx={gx} cy={gy} r="6" fill={color} className={glowClass} />
              
              {/* Gate Label Text */}
              <text x={gx + (gx > cx ? 28 : -28)} y={gy + 5} textAnchor="middle" fontFamily="var(--display)" fontWeight="900" fontSize="16" fill="var(--floodlight)" stroke="#FFF" strokeWidth="1">{g.label}</text>
            </g>
          );
        })}

        {/* SOS Alert Blips */}
        {(mapMode === 'sos' || sosAlerts.length > 0) && sosAlerts.map((a, i) => {
          const ax = cx + (Math.random() - 0.5) * 300;
          const ay = cy + (Math.random() - 0.5) * 200;
          return (
            <g key={a.id}>
              <circle cx={ax} cy={ay} r={12 + Math.abs(Math.sin(pulseT))*4} fill="var(--red)" opacity="0.8" className="glow-red" />
              <text x={ax} y={ay + 5} textAnchor="middle" fontSize="14">🚨</text>
              <rect x={ax - 40} y={ay - 35} width="80" height="20" rx="4" fill="var(--bg-panel-raised)" />
              <text x={ax} y={ay - 22} textAnchor="middle" fill="var(--red)" fontSize="10" fontWeight="bold">SOS: {a.location}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="pulse-card">
      <div className="pulse-head">
        <h2>EMIRATES STADIUM | MATCHDAY LIVE OVERVIEW</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{ background: mapMode === 'heatmap' ? 'var(--line)' : 'transparent', border: '1px solid var(--muted)', color: mapMode === 'heatmap' ? '#fff' : 'var(--muted)', borderRadius: '4px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}
            onClick={() => setMapMode('heatmap')}
          >
            Live Heatmap
          </button>
          <button 
            style={{ background: mapMode === 'sos' ? 'var(--red)' : 'transparent', border: '1px solid ' + (mapMode === 'sos' ? 'var(--red)' : 'var(--muted)'), color: mapMode === 'sos' ? '#fff' : 'var(--muted)', borderRadius: '4px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}
            onClick={() => setMapMode('sos')}
          >
            {sosAlerts.length > 0 ? `🚨 SOS (${sosAlerts.length})` : 'SOS Mode'}
          </button>
        </div>
      </div>

      {/* Floating HUD Legends */}
      <div className="hud-panel hud-legend">
        <div className="hud-title">GLOWS ALERT</div>
        <div className="hud-row"><div className="hud-dot" style={{ background: 'var(--pitch)', boxShadow: '0 0 8px var(--pitch)' }}></div> Optimal</div>
        <div className="hud-row"><div className="hud-dot" style={{ background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)' }}></div> Busy</div>
        <div className="hud-row"><div className="hud-dot" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }}></div> Congested</div>
      </div>

      <div className="hud-panel hud-status">
        <div className="hud-title">GATE STATUS</div>
        <div className="hud-row">
          <span className="hud-gate-badge" style={{ background: 'var(--red)' }}>G</span> 198 Users <span style={{ color: 'var(--red)' }}>Slow Flow</span>
        </div>
        <div className="hud-row">
          <span className="hud-gate-badge" style={{ background: 'var(--amber)' }}>F</span> 142 Users <span style={{ color: 'var(--amber)' }}>Moderate</span>
        </div>
      </div>

      {renderComplexSvg()}
      <div className="gate-tip" dangerouslySetInnerHTML={{ __html: tip.replace(/Gate ([A-Z])/g, 'Gate <b>$1</b>') }} />
    </div>
  );
};

const ChatAssistant = ({ persona }) => {
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([{ who: 'ai', tag: 'Matchday Assistant', text: 'Welcome to Emirates Stadium! Ask me anything about seating, food, accessibility, or getting home — in any language.' }]);
  const [input, setInput] = useState('');
  const logRef = useRef(null);

  const langs = [
    { code: 'en', label: 'English' }, { code: 'es', label: 'Español' }, { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' }, { code: 'ar', label: 'العربية' }, { code: 'ja', label: '日本語' }
  ];

  const handleSend = async (query) => {
    if (!query.trim()) return;
    const newMsgs = [...messages, { who: 'user', text: query }, { who: 'ai', tag: 'Matchday Assistant', text: 'Thinking...' }];
    setMessages(newMsgs);
    setInput('');
    setTimeout(() => { if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);

    const reply = await askClaude(`Translate output to ${langs.find(l=>l.code===lang).label}.`, query, persona);
    setMessages(msgs => {
      const updated = [...msgs];
      updated[updated.length - 1].text = reply;
      return updated;
    });
  };

  return (
    <div className="panel chat-card">
      <span className="eyebrow">GenAI · Multilingual</span>
      <h2>Ask the Matchday Assistant</h2>
      <p className="desc">Wayfinding, accessibility, food, transit, and rules — answered instantly in your language, powered by AI.</p>
      <div className="lang-row">
        {langs.map(l => <button key={l.code} className={`lang-pill ${lang === l.code ? 'active' : ''}`} onClick={() => setLang(l.code)}>{l.label}</button>)}
      </div>
      <div className="quick-row">
        <button className="quick-chip" onClick={() => handleSend("How do I get to Section 218 from Gate C?")}>Find my seat</button>
        <button className="quick-chip" onClick={() => handleSend("Where is the nearest wheelchair-accessible restroom and companion seating?")}>Accessible restroom</button>
        <button className="quick-chip" onClick={() => handleSend("What time should I leave to catch the last shuttle after the match?")}>Last shuttle time</button>
        <button className="quick-chip" onClick={() => handleSend("Can I bring an empty water bottle and a small bag into the stadium?")}>Bag policy</button>
      </div>
      <div className="chat-log" ref={logRef}>
        {messages.map((m, i) => <div key={i} className={`msg ${m.who}`}>{m.tag && <b className="tag">{m.tag}</b>}{m.text}</div>)}
      </div>
      <div className="chat-input-row">
        <input type="text" placeholder="Type your question…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend(input)} />
        <button onClick={() => handleSend(input)}>Ask</button>
      </div>
    </div>
  );
};

const AccessPlanner = () => {
  const [out, setOut] = useState('Choose a profile above — the assistant will draft a step-by-step accessible route from the nearest transit stop to your seat.');
  const handleNeed = async (need) => {
    setOut('Drafting accessible route...');
    const reply = await askClaude("sys", need);
    setOut(reply);
  };
  return (
    <div className="panel">
      <span className="eyebrow">Accessibility</span>
      <h2>Accessible Journey Planner</h2>
      <p className="desc">Personalized routing that avoids stairs, crowding, and long queues.</p>
      <div className="quick-row">
        <button className="quick-chip" onClick={() => handleNeed('wheelchair')}>Wheelchair user</button>
        <button className="quick-chip" onClick={() => handleNeed('vision')}>Low vision</button>
        <button className="quick-chip" onClick={() => handleNeed('sensory')}>Sensory sensitivity</button>
        <button className="quick-chip" onClick={() => handleNeed('stroller')}>Traveling with a stroller</button>
      </div>
      <div className="report-out">{out}</div>
    </div>
  );
};

const Transport = () => {
  const [times, setTimes] = useState({ rail: '--', ride: '--', shuttle: '--' });
  const [out, setOut] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await fetchTransport();
      setTimes(data);
    };
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRecommend = async () => {
    setOut('Modeling post-match surge...');
    const reply = await askClaude("sys", "surge");
    setOut(reply);
  };

  return (
    <div className="panel">
      <span className="eyebrow">Transportation</span>
      <h2>Getting Home</h2>
      <p className="desc">Live-modeled departure windows, adjusted for match-end surge.</p>
      <div className="route-list">
        <div className="route">
          <div><div className="r-name">Piccadilly Line</div><div className="r-sub">Arsenal Station</div></div>
          <div className="r-time">{times.rail} min</div>
        </div>
        <div className="route">
          <div><div className="r-name">Ride-share pickup</div><div className="r-sub">Surge easing after 21:40</div></div>
          <div className="r-time">{times.ride} min</div>
        </div>
        <div className="route">
          <div><div className="r-name">Express Shuttle</div><div className="r-sub">Departs every 12 min</div></div>
          <div className="r-time">{times.shuttle} min</div>
        </div>
      </div>
      <button className="btn ghost" onClick={handleRecommend} style={{ alignSelf: 'flex-start', marginTop: 6 }}>Get AI departure recommendation</button>
      {out && <div className="report-out" style={{ marginTop: 12 }}>{out}</div>}
    </div>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState({ temp: '--', code: 0, feelsLike: '--', humidity: '--', precip: '--', wind: '--' });
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/weather');
        if(res.ok) setWeather(await res.json());
      } catch (e) {}
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️'; // Clear
    if (code >= 1 && code <= 3) return '⛅'; // Partly cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 67) return '🌧️'; // Rain
    if (code >= 71 && code <= 82) return '🌨️'; // Snow
    if (code >= 95) return '⛈️'; // Thunderstorm
    return '🌡️';
  };

  return (
    <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(3, 105, 161, 0.1))', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '140px', opacity: 0.05, filter: 'blur(2px)' }}>{getWeatherIcon(weather.code)}</div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div>
          <span className="eyebrow" style={{ color: '#38bdf8' }}>Local Weather</span>
          <h2 style={{ fontSize: '48px', margin: '4px 0 0 0', fontWeight: '900', textShadow: '0 2px 10px rgba(0,0,0,0.3)', letterSpacing: '-1px' }}>{weather.temp}°C</h2>
          <p className="desc" style={{ margin: '0', fontWeight: '600', color: '#bae6fd' }}>Emirates Stadium</p>
        </div>
        <div style={{ fontSize: '56px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>{getWeatherIcon(weather.code)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px', zIndex: 1 }}>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🌡️</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feels Like</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{weather.feelsLike}°C</div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>💧</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Humidity</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{weather.humidity}%</div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>💨</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wind</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{weather.wind} km/h</div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🌧️</span>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precip</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{weather.precip} mm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchScoreWidget = () => {
  const [score, setScore] = useState({ home: { team: '--', score: 0, flag: '' }, away: { team: '--', score: 0, flag: '' }, clock: '--', status: '--' });
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/scores');
        if(res.ok) setScore(await res.json());
      } catch (e) {}
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel" style={{ background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid #1e293b', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow" style={{ color: '#fbbf24', letterSpacing: '1px' }}>LIVE BROADCAST</span>
        <div style={{ background: '#000', border: '1px solid #334155', color: '#ef4444', fontSize: '12px', fontWeight: '900', padding: '4px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px' }}>
          <span className="pulsing-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></span>
          {score.clock}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '16px' }}>
        {/* Home Team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #334155', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {score.home.flag.startsWith('http') ? <img src={score.home.flag} alt={score.home.team} style={{ height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize: '32px'}}>{score.home.flag}</span>}
          </div>
          <div style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '12px', fontSize: '14px', color: '#f8fafc' }}>{score.home.team}</div>
        </div>
        
        {/* Score Board */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#000', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)' }}>
          <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'monospace', padding: '8px 24px', color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
            {score.home.score}
          </div>
          <div style={{ width: '1px', height: '40px', background: '#334155' }}></div>
          <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'monospace', padding: '8px 24px', color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,1)' }}>
            {score.away.score}
          </div>
        </div>
        
        {/* Away Team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #334155', background: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {score.away.flag.startsWith('http') ? <img src={score.away.flag} alt={score.away.team} style={{ height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize: '32px'}}>{score.away.flag}</span>}
          </div>
          <div style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '12px', fontSize: '14px', color: '#f8fafc' }}>{score.away.team}</div>
        </div>
      </div>
      
      <div style={{ background: '#1e293b', margin: '24px -24px -24px -24px', padding: '12px', textAlign: 'center', borderTop: '1px solid #334155', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
        FIFA World Cup 2026
      </div>
    </div>
  );
};

const StaffStats = () => {
  const [stats, setStats] = useState({ occ: '--', rate: '--', qAvg: '--', qLanes: '--', medOpen: '--', medEta: '--' });
  useEffect(() => {
    const load = async () => setStats(await fetchStats());
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="grid3">
      <div className="panel">
        <span className="eyebrow">Capacity</span>
        <h2>Occupancy</h2>
        <div className="stat-row">
          <div className="stat up"><div className="num">{Number(stats.occ).toLocaleString() || '--'}</div><div className="label">Current / 60,704</div></div>
          <div className="stat"><div className="num">{stats.rate}</div><div className="label">Entries / min</div></div>
        </div>
        <div className="sbar-track"><div className="sbar-fill" style={{ width: `${(stats.occ / 60704) * 100 || 0}%` }}></div></div>
      </div>
      <div className="panel">
        <span className="eyebrow">Security</span>
        <h2>Screening Queue</h2>
        <div className="stat-row">
          <div className="stat warn"><div className="num">{stats.qAvg}</div><div className="label">Avg wait (min)</div></div>
          <div className="stat"><div className="num">{stats.qLanes}</div><div className="label">Lanes open</div></div>
        </div>
      </div>
      <div className="panel">
        <span className="eyebrow">Medical</span>
        <h2>Response</h2>
        <div className="stat-row">
          <div className="stat"><div className="num">{stats.medOpen}</div><div className="label">Open incidents</div></div>
          <div className="stat up"><div className="num">{stats.medEta}</div><div className="label">Avg response (min)</div></div>
        </div>
      </div>
    </div>
  );
};

const BroadcastCenter = () => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const handleBroadcast = async () => {
    setStatus('Generating and publishing multilingual broadcast...');
    const res = await broadcastAnnouncement(notes);
    if (res.success) {
      setStatus(`Published successfully in EN, ES, and FR!`);
      setNotes('');
    } else {
      setStatus('Failed to publish.');
    }
  };

  const clearBroadcast = async () => {
    setStatus('Clearing active PA...');
    try {
      await fetch('/api/broadcast', { method: 'DELETE' });
      setStatus('Active PA cleared.');
    } catch (e) {
      setStatus('Failed to clear PA.');
    }
  };

  return (
    <div className="panel" style={{ gridColumn: 'span 2' }}>
      <span className="eyebrow">Global Broadcast System</span>
      <h2>Generate PA Announcement</h2>
      <p className="desc">Type a short staff directive. The AI will translate it into a formal, multilingual announcement and broadcast it to all fans.</p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <input style={{ flex: 1, padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', color: '#fff', borderRadius: '8px' }} type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Severe lightning near venue, seek shelter in concourse..." />
        <button className="btn" onClick={handleBroadcast}>Broadcast Live</button>
        <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={clearBroadcast}>Clear Active PA</button>
      </div>
      {status && <div style={{ marginTop: '12px', color: 'var(--pitch)' }}>{status}</div>}
    </div>
  );
};

const FlowAndSustainability = () => {
  const labels = Array.from({ length: 12 }, (_, i) => (i * 5) + 'm');
  const data = labels.map(() => 200 + Math.random() * 600);
  const [flowOut, setFlowOut] = useState('');
  const [susOut, setSusOut] = useState('');

  const chartData = {
    labels,
    datasets: [{ label: 'Entries/5min', data, borderColor: '#3CB878', backgroundColor: 'rgba(60,184,120,0.12)', tension: 0.35, fill: true, pointRadius: 0, borderWidth: 2 }]
  };
  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: '#243146' }, ticks: { color: '#8793A8', font: { family: 'IBM Plex Mono', size: 10 } } }, y: { grid: { color: '#243146' }, ticks: { color: '#8793A8', font: { family: 'IBM Plex Mono', size: 10 } } } }
  };

  return (
    <div className="grid2">
      <div className="panel">
        <span className="eyebrow">Crowd Management</span>
        <h2>Concourse Flow — Last 60 min</h2>
        <Line data={chartData} options={chartOpts} height={160} />
      </div>

      <div className="panel">
        <span className="eyebrow">Sustainability</span>
        <h2>Venue Footprint — Live</h2>
        <div className="sustain-bars">
          {[
            { label: 'Grid energy from renewables', v: 78 },
            { label: 'Waste diverted from landfill', v: 64 },
            { label: 'Reusable cup adoption', v: 52 },
            { label: 'Water reclamation', v: 41 }
          ].map((s, i) => (
            <div key={i} className="sbar-row">
              <div className="sb-label"><span>{s.label}</span><span>{s.v}%</span></div>
              <div className="sbar-track"><div className="sbar-fill" style={{ width: s.v + '%' }}></div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const InteractiveMap = ({ title, desc }) => {
  return (
    <div className="panel" style={{ gridColumn: '1 / -1' }}>
      <span className="eyebrow">Interactive Map</span>
      <h2>{title || 'Navigate Emirates Stadium'}</h2>
      {desc && <p className="desc">{desc}</p>}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--bg)' }}>
        <iframe
          width="100%"
          height="450"
          frameBorder="0"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%) brightness(110%)' }}
          src="https://maps.google.com/maps?width=100%25&amp;height=450&amp;hl=en&amp;q=Emirates%20Stadium,%20London+(Emirates%20Stadium)&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};


const SOSButton = () => {
  const [status, setStatus] = useState('idle'); // idle, locating, sending, sent
  const [loc, setLoc] = useState('');

  const triggerSOS = async () => {
    if (!loc) return alert('Please enter a location or use GPS.');
    setStatus('sending');
    await sendSos(loc);
    setStatus('sent');
  };

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        setLoc(`GPS: Lat ${lat}, Lng ${lng}`);
        setStatus('idle');
      },
      () => {
        alert('Unable to retrieve your location. Please type it manually.');
        setStatus('idle');
      }
    );
  };

  if (status === 'sent') {
    return (
      <div className="panel" style={{ background: 'rgba(225, 75, 75, 0.1)', border: '1px solid var(--red)' }}>
        <h2 style={{ color: 'var(--red)' }}>Staff Alerted</h2>
        <p className="desc" style={{ color: '#fff' }}>Please stay exactly where you are. Security staff have been dispatched to your location ({loc}).</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <span className="eyebrow" style={{ color: 'var(--red)' }}>Emergency SOS</span>
      <h2>Lost or Need Help?</h2>
      <p className="desc">Enter your closest gate, or use GPS to dispatch a staff member to you immediately.</p>
      
      <button 
        className="btn ghost" 
        style={{ width: '100%', marginBottom: '12px', borderColor: 'var(--red)', color: 'var(--red)' }}
        onClick={getGPSLocation}
        disabled={status === 'locating'}
      >
        {status === 'locating' ? '📍 Locating you...' : '📍 Use My Exact Location (GPS)'}
      </button>

      <div style={{ display: 'flex', gap: '12px' }}>
        <input type="text" placeholder="e.g. Near Section 218" value={loc} onChange={e => setLoc(e.target.value)} style={{ flex: 1, padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', color: '#fff', borderRadius: '8px' }} />
        <button className="btn" style={{ background: 'var(--red)', color: '#fff' }} onClick={triggerSOS}>
          {status === 'sending' ? 'Sending...' : 'Trigger SOS Alert'}
        </button>
      </div>
    </div>
  );
};

const StaffSOSDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const isInitialLoad = useRef(true);
  const prevCount = useRef(0);

  useEffect(() => {
    const load = async () => {
      const newAlerts = await fetchSos();
      
      // Play a siren/beep sound if a new alert arrives after initial load
      if (!isInitialLoad.current && newAlerts.length > prevCount.current) {
        // A sharp alert beep
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio blocked by browser:', e));
      }
      
      prevCount.current = newAlerts.length;
      setAlerts(newAlerts);
      isInitialLoad.current = false;
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    await resolveSos(id);
    setAlerts(await fetchSos());
  };

  return (
    <div className="panel" style={{ gridColumn: 'span 1', border: alerts.length > 0 ? '2px solid var(--red)' : '1px solid var(--line)' }}>
      <span className="eyebrow" style={{ color: alerts.length > 0 ? 'var(--red)' : 'var(--muted)' }}>Live Emergency Monitoring</span>
      <h2>Active SOS Alerts ({alerts.length})</h2>
      {alerts.length === 0 ? (
        <p className="desc">No active alerts. All clear.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {alerts.map(a => (
            <div key={a.id} className="alert sev-high">
              <div className="a-head">
                <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>UNRESOLVED</span>
              </div>
              <div className="a-title">Fan needs assistance</div>
              <div className="a-body">Location reported: <b>{a.location}</b></div>
              <button className="btn ghost" style={{ marginTop: '8px', width: '100%', borderColor: 'var(--line)', color: '#fff' }} onClick={() => handleResolve(a.id)}>
                Acknowledge & Dispatch Help
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const TacticalBriefing = () => {
  const [briefing, setBriefing] = useState('');
  const [loading, setLoading] = useState(false);

  const generateBriefing = async () => {
    setLoading(true);
    setBriefing('Synthesizing live data, alerts, and bottlenecks...');
    try {
      const res = await fetch('/api/briefing', { method: 'POST' });
      const data = await res.json();
      setBriefing(data.briefing);
    } catch (e) {
      setBriefing('Failed to generate briefing.');
    }
    setLoading(false);
  };

  return (
    <div className="panel" style={{ gridColumn: 'span 2', border: '1px solid var(--amber)' }}>
      <span className="eyebrow" style={{ color: 'var(--amber)' }}>GenAI Command Intelligence</span>
      <h2>AI Tactical Operational Briefing</h2>
      <p className="desc">Instantly synthesize all active SOS alerts, transport delays, and gate bottlenecks into a rapid tactical summary for security staff.</p>
      
      <button className="btn" style={{ background: 'var(--amber)', color: '#fff', marginBottom: '16px' }} onClick={generateBriefing} disabled={loading}>
        {loading ? 'Generating Briefing...' : 'Generate Live Tactical Briefing'}
      </button>

      {briefing && (
        <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--pitch)' }}>
          {briefing}
        </div>
      )}
    </div>
  );
};


const AuthScreen = ({ onLogin, setTab }) => {
  const [role, setLocalRole] = useState('fan');
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTab(role === 'staff' ? 'staff' : 'live');
      onLogin();
    }, 1500);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg">
        <div className="auth-orb orb1"></div>
        <div className="auth-orb orb2"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-mark" style={{ background: 'var(--pitch)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}><LogoIcon /></div>
          <h1>STADIUMGENIE</h1>
          <p>FIFA World Cup 2026 Official Platform</p>
        </div>

        <div className="auth-tabs">
          <button className={role === 'fan' ? 'active' : ''} onClick={() => setLocalRole('fan')}>Fan</button>
          <button className={role === 'staff' ? 'active' : ''} onClick={() => setLocalRole('staff')}>Staff</button>
        </div>

        <div className="auth-modes">
          <button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create Account</button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {mode === 'signup' && (
            <input type="text" placeholder="Full Name" required />
          )}
          <input type="text" placeholder="Email or Phone Number" required />
          <input type="password" placeholder="Password" required />
          
          <button type="submit" className="btn submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <button className="btn google-btn" onClick={handleLogin} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
};


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState('live');
  const [persona, setPersona] = useState('Standard Fan');

  // Global Settings & Notification State
  const [theme, setTheme] = useState('dark');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [syncActive, setSyncActive] = useState(true);
  
  const initialName = localStorage.getItem('profileName');
  const welcomeText = initialName ? `Welcome ${initialName} to StadiumGenie Live Overview.` : 'Welcome to StadiumGenie Live Overview.';

  const [notifications, setNotifications] = useState([
    { id: 1, time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}), title: 'Welcome', body: welcomeText, read: false }
  ]);

  // Apply Theme
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  // Simulate Push Notifications
  useEffect(() => {
    if (!pushEnabled || !isAuthenticated) return;
    const msgs = [
      "Gate E is currently congested. Please use Gate K.",
      "Match starting in 15 minutes! Please take your seats.",
      "Security alert at concourse B cleared.",
      "Merchandise stall near section 112 has a 50% discount!"
    ];
    let count = 0;
    const interval = setInterval(() => {
      const msg = msgs[count % msgs.length];
      setNotifications(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}), title: 'Live Update', body: msg, read: false }, ...prev]);
      count++;
    }, 20000); // simulate a new notification every 20s
    return () => clearInterval(interval);
  }, [pushEnabled, isAuthenticated]);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} setTab={setTab} />;
  }

  return (
    <>
      <Topbar role={tab === 'staff' ? 'staff' : 'fan'} setRole={(r) => setTab(r === 'staff' ? 'staff' : 'live')} onLogout={() => setIsAuthenticated(false)} theme={theme} setTheme={setTheme} pushEnabled={pushEnabled} setPushEnabled={setPushEnabled} syncActive={syncActive} setSyncActive={setSyncActive} notifications={notifications} />
      <div className="wrap">
        
        {/* FAN TABS */}
        <div className={`view ${['live', 'map', 'copilot'].includes(tab) ? 'active' : ''}`}>
          
          {/* Persona Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center', marginRight: '8px', whiteSpace: 'nowrap' }}>AI PERSONA:</span>
            {['Standard Fan', 'VIP / Hospitality', 'Accessibility / Wheelchair', 'Family with Stroller'].map(p => (
              <button 
                key={p} 
                onClick={() => setPersona(p)}
                style={{ background: persona === p ? 'var(--pitch)' : 'var(--bg-panel)', color: persona === p ? '#000' : 'var(--muted)', border: '1px solid ' + (persona === p ? 'var(--pitch)' : 'var(--line)'), padding: '6px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Desktop Tab Switcher */}
          <div className="desktop-tabs" style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <button style={{ background: 'none', border: 'none', color: tab === 'live' ? 'var(--pitch)' : 'var(--muted)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setTab('live')}>
              🏟️ Live Stadium
            </button>
            <button style={{ background: 'none', border: 'none', color: tab === 'map' ? 'var(--pitch)' : 'var(--muted)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setTab('map')}>
              🗺️ Map
            </button>
            <button style={{ background: 'none', border: 'none', color: tab === 'copilot' ? 'var(--pitch)' : 'var(--muted)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }} onClick={() => setTab('copilot')}>
              🤖 AI Copilot & SOS
            </button>
          </div>

          <FanTicker />
          
          <div style={{ display: tab === 'live' ? 'block' : 'none' }}>
            <StadiumPulse persona={persona} />
            <div className="grid2" style={{ marginTop: '24px' }}>
              <Transport />
              <AccessPlanner />
            </div>
            <div className="grid2" style={{ marginTop: '24px' }}>
              <MatchScoreWidget />
              <WeatherWidget />
            </div>
          </div>

          <div style={{ display: tab === 'copilot' ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>
            <SOSButton />
            <ChatAssistant persona={persona} />
          </div>

          <div style={{ display: tab === 'map' ? 'block' : 'none' }}>
            <InteractiveMap desc="Explore the surrounding area, transit stops, and main thoroughfares." />
          </div>
        </div>
        
        {/* STAFF TAB */}
        <div className={`view ${tab === 'staff' ? 'active' : ''}`}>
          <StaffStats />
          <div className="grid2">
            <TacticalBriefing />
            <StaffSOSDashboard />
            <BroadcastCenter />
          </div>
          <FlowAndSustainability />
          <div className="grid2" style={{ marginTop: '24px' }}>
            <InteractiveMap title="External Logistics Map" desc="Monitor traffic congestion, road closures, and staging areas around the venue perimeter." />
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <button className={`nav-item ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
          <div className="nav-icon">🏟️</div>
          Live
        </button>
        <button className={`nav-item ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
          <div className="nav-icon">🗺️</div>
          Map
        </button>
        <button className={`nav-item ${tab === 'copilot' ? 'active' : ''}`} onClick={() => setTab('copilot')}>
          <div className="nav-icon">🤖</div>
          Copilot
        </button>
        <button className={`nav-item ${tab === 'staff' ? 'active' : ''}`} onClick={() => setTab('staff')}>
          <div className="nav-icon">🛡️</div>
          Staff
        </button>
      </div>

      <footer>STADIUMGENIE — PULSE AI · REAL-TIME SERVER DATA · GENAI RESPONSES</footer>
    </>
  );
};

export default App;
