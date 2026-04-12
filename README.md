# 🏟️ Sanchara — The Ultimate Stadium Super App

**🚀 Live Production Deployment:** [https://sanchara-web-c7zpilarrq-uc.a.run.app](https://sanchara-web-c7zpilarrq-uc.a.run.app)

## 📖 Brutally Honest Overview

Sanchara is an ultra-premium, hyper-realistic frontend-first stadium application. It was built aggressively for the **Prompt Wars** competition with a strict **$0 Cloud Budget** requirement. 

To achieve an industry-grade, enterprise feel without paying for centralized backend servers or hosted databases, **Sanchara fakes the entire backend using pure localized browser capabilities.** It seamlessly fuses native OS APIs, Zustand persistence engines, and mathematical simulation loops to make judges and users believe they are inside a massive physical arena equipped with real-time operations.

### How to Install it Natively
You do not need an App Store to install Sanchara.
1. Open the [Live Web URL](https://sanchara-web-c7zpilarrq-uc.a.run.app) directly on an iOS (Safari) or Android (Chrome) smartphone.
2. Tap the **Share / Options** button on your browser.
3. Select **"Add to Home Screen"**.
4. Sanchara will now download locally as a **Progressive Web App (PWA)**. When you open it from your home screen, it will launch fullscreen, flawlessly mimicking a native application. 

---

## ⚡ How It Actually Works (The Engineering Secrets)

Every feature in Sanchara was engineered to simulate a live server connection organically. Here is a breakdown of what happens under the hood:

### 1. The Real-Time Event Simulation Engine
**What you see:** Heatmaps shifting color, crowd density alerts popping up, wait times at "Restroom 1A" decreasing naturally.
**How it works:** A React background worker `useSimulationEngine.ts` ticks indefinitely every 15 seconds. It randomizes wait times using tightly clamped boundary values and mathematically triggers organic "Flash Deals" or "Crowd Clearings" notifications via localized Sonner Toasts.

### 2. The Kitchen Fulfillment Timeline
**What you see:** When you buy a "Stadium Burger", your Active Orders progress authentically from *Preparing* → *On the Way* → *Delivered*.
**How it works:** Sanchara constantly scans its local order registry and randomly shifts orders across the lifecycle states based on physical elapsed time, allowing you to walk away from the app, open it 10 minutes later, and see your hotdog actively "Delivering".

### 3. Deep Offline Persistence (Zustand)
**What you see:** Everything you do — buying seats, spending Arena points, editing your Profile, registering payment cards — is saved forever.
**How it works:** The platform utilizes the `zustand/middleware` engine to aggressively cast JSON data directly into the user device's `localStorage`. Sanchara fundamentally uses the user's hard drive as its global backend cluster.

### 4. Native iOS/Android Geo-Fencing
**What you see:** When you open the Sanchara Dashboard, a prompt appears verifying whether you are "Inside" the Stadium. It grants you a glowing `Verified In-Venue` badge.
**How it works:** Rather than just mocking it with a timer, Sanchara directly fires `navigator.geolocation` on mount, triggering an authentic, OS-level popup asking the user for literal GPS permission. It intercepts the API payload to trick mobile Operating Systems into believing the application is geographically aware.

---

## 🛠 Tech Stack

- **Framework:** React 18 / Vite 
- **Styling:** Tailwind CSS + Framer Motion (Heavy reliance on Glassmorphism & Micro-animations)
- **State Backbone:** Zustand (`localStorage` persist layer)
- **Infrastructure:** Google Cloud Run containerized deployment
- **Design Tokens:** Lucide Icons, pure Custom CSS Glow injections.

Built to brutally crush the competition. Enjoy the game! 🏀
