# 🧞‍♂️ StadiumGenie

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/Platform-Web-gray.svg)

---

## 📋 Table of Contents

- [Description](#-description)
- [Demo Video](#-demo-video)
- [Features](#-features)
- [User Journey](#-user-journey)
- [Project Structure](#-project-structure)
- [Built With](#-built-with)
- [Installation & Setup](#-installation--setup)

---

## 📚 Description

**StadiumGenie** is an intelligent matchday companion that empowers fans and stadium staff. It uses real-time simulated IoT sensor data to analyze crowd congestion, build dynamic live stadium maps, generate optimal routing instructions, and automatically alert security to SOS emergencies. Whether you're a fan looking for your seat or an organizer managing 80,000 people, StadiumGenie guides you every step of the way.

---

## 🎥 Demo Video

See StadiumGenie in Action!

📺 [Watch Demo Video](#) *(Coming soon)*

*Experience the power of real-time crowd mapping, dynamic dual-personas, and AI-driven routing.*

---

## ✨ Features

*   🧞‍♂️ **Dual-Persona Dashboard**: Instantly switch between Fan and Staff modes to see tailored data.
*   🏟️ **Live Sensor Feed**: Dynamic cartoon stadium map projecting live gate congestion and crowd densities.
*   🤖 **AI Matchday Assistant**: An integrated conversational AI to help you find seats, food, and optimal routes.
*   🔔 **Real-Time Notification Engine**: Push notifications for live alerts, bottlenecks, and SOS emergencies.
*   🎨 **Premium Glassmorphism UI**: Beautiful, modern interface with seamless Dark Mode and Light Mode toggles.

---

## 🗺️ User Journey

**Login as Fan → Ask AI for Route → View Live Gate Congestion → Navigate to Seat**

**Login as Staff → Monitor Crowd Densities → Receive SOS Alert → Dispatch Security**

The journey transforms the chaotic matchday process into a structured science. Users enter the app, instantly see how the stadium flows, and interact with the AI to optimize their experience. Staff can monitor the entire venue from a God's-eye view, ensuring safety and efficiency.

---

## 📁 Project Structure

```text
StadiumGenie/
├── public/                 # Static assets (images, icons, manifest)
├── src/                    # React Application
│   ├── assets/             # SVGs and logos
│   ├── App.jsx             # Main Application Logic & Routing
│   ├── index.css           # Global Styles & Theming
│   └── main.jsx            # React Entry Point
├── server/                 # Node.js Backend
│   ├── server.js           # Express API and Database Logic
│   └── database.sqlite     # SQLite Local Database
├── package.json            # Dependencies & Scripts
└── vite.config.js          # Vite Configuration
```

---

## 🛠️ Built With

Here are the major tools and technologies used to build StadiumGenie:

### Frontend & Build Tools

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Backend & Database

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

### Artificial Intelligence

![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

---

## 📦 Installation & Setup

You can run StadiumGenie locally by following these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/stadium-genie.git
   cd stadium-genie
   ```

2. **Install frontend and backend dependencies:**
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

3. **Configure Environment Variables:**
   Inside the `server/` directory, create a `.env` file (or edit the existing one) to include your Gemini API key for real-time NLP:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the backend server:**
   ```bash
   cd server
   node server.js
   ```

5. **Start the frontend application:**
   (In a new terminal tab/window from the root directory)
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

---
*Built with ❤️ for the Hackathon.*
