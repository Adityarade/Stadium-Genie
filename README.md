# 🧞‍♂️ StadiumGenie

> **The Ultimate AI-Powered Matchday Companion for the FIFA World Cup 2026**

![StadiumGenie Banner](./public/football_bg.png)

## 🏆 The Problem
The modern sports stadium is a marvel of engineering, but for fans and staff, matchday can still be chaotic. Navigating massive crowds of 80,000+ people, finding your seats, avoiding bottlenecks, and managing emergencies often turns into a stressful guessing game. Legacy stadium apps are static, unresponsive, and lack real-time context.

## 💡 The Solution
**StadiumGenie** is a cutting-edge, real-time stadium management and fan engagement platform. By aggregating simulated live IoT sensor data and pairing it with a powerful AI Assistant, StadiumGenie dynamically routes fans away from bottlenecks and gives stadium staff a God's-eye view of emergencies as they happen.

## ✨ Key Features

### 🔄 Dual-Persona Architecture
With a single click, the interface adapts entirely depending on who is using it:
- **Fan Mode:** Focuses on seating, food routing, and minimizing wait times.
- **Staff / Organizer Mode:** Focuses on crowd densities, SOS emergency alerts, and gate congestion management.

### 🏟️ Live Sensor Feed & Cartoon Map
We replaced boring static maps with a beautiful, real-time cartoon visualization of the pitch and grandstands. 
- Gate congestion is mapped directly onto the stadium entrances, pulsing intelligently (Green = Optimal, Red = Congested).
- Staff can see live SOS alerts projected directly onto physical coordinates on the map.

### 🤖 AI Matchday Assistant
A built-in AI Chat Assistant acts as a personal concierge. Fans can ask natural language questions (e.g., *"What's the fastest way to my seat in Section 112?"*) and receive real-time, context-aware routing instructions in any language.

### 🔔 Real-Time Notification Engine
A robust notification system pushes live updates directly to users. If a gate becomes congested, fans are instantly alerted via a sleek notification dropdown.

### 🎨 Premium UI/UX & Theming
Built with a modern "glassmorphism" aesthetic, featuring smooth micro-animations, cinematic backgrounds, and fully integrated **Dark Mode** and **Light Mode** to ensure perfect legibility under bright stadium floodlights or at night.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite
- **Styling:** Vanilla CSS (Glassmorphism, CSS Variables, Responsive Design)
- **State Management:** React Hooks (Global context lifting)
- **Visualizations:** Inline dynamic SVG rendering

---

## 🚀 How to Run Locally

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **View the app:**
   Open `http://localhost:5173` in your browser.

---
*Built with ❤️ for the Hackathon.*
