# GitHub Universe 🌐

<img width="1370" height="768" alt="image" src="https://github.com/user-attachments/assets/33672bb3-ddbe-4782-8b29-527179559d01" />

A clean, minimal, and fully functional 3D collaborative metaverse workspace tailored specifically for developers. Instead of clunky 3D character avatars, users interact with their peers in real-time using custom **three-dimensional mouse pointers** across beautifully structured, low-poly workspace environments.

## 🚀 Features

- **Real-Time Multiplayer Sync**: Powered by Socket.io, every developer's movement is replicated instantaneously across all connected clients.
- **3D Cursor Representation**: No sci-fi or cyberpunk avatars. Everyone is represented by a clean, smooth, pastel-colored 3D arrow mesh with their own custom corporate developer tag (`Dev_XXXX`).
- **Interactive Chat Bubble System**: Type messages directly into the UI dashboard and watch your chat text hover as a neat, responsive bubble attached dynamically to your 3D cursor.
- **Dynamic Maps Environments**: Instantly swap between structural metaverse rooms:
  - 🏢 *Main Headquarters Lobby*: The core social central desk room.
  - 📦 *The Repository Pavilion*: Exhibition layout featuring smooth green and blue blocks.
  - 📋 *Scrum & Agile Open Space*: A digital room containing low-poly Kanban whiteboards and sticky-notes.
- **Immersive Lighting & Shadows**: Standard production-ready PCFSoftShadowMaps creating an organic maquette aesthetic.

---

## 🛠️ Architecture & Tech Stack

```text
gitverse/
├── package.json         # Node.js dependencies and run-scripts configs
├── server.js            # Express & Socket.io network synchronization engine
└── public/
    ├── index.html       # Corporate layout interface overlay and core layout container
    └── main.js          # Core Three.js render loops, Raycasting calculations, and meshes
```

- **Frontend Core**: [Three.js](https://threejs.org) (via CDN)
- **Backend Hub**: Node.js & Express
- **Networking Protocol**: Socket.io

---

## 💻 Getting Started Locally

Follow these quick sequential steps to fire up your GitVerse engine local deployment:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v16 or higher recommended) installed on your laptop or computer.

### 2. Installation
Clone your repository or download the project files into your chosen directory, then navigate into the directory and install all required modules:
```bash
npm install
```

### 3. Execution
Launch the Node server environment using the standardized run script:
```bash
npm start
```

### 4. Open Interface
Once launched, open up any modern web browser and point your URL navigation directly to:
```text
http://localhost:3000
```

*💡 **Pro Tip**: To view the true real-time engine synchronization functionality on your own machine, open up an extra Incognito/Private window tab right next to your primary browser view. You will immediately see both 3D cursors interacting on the exact same plane coordinates!*

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **GitHub API Core Integration**: Connect real GitHub personal access tokens to build custom blocks using active user directories and folders dynamically.
- [ ] **Proximity Voice Chat**: Leverage high-performance WebRTC streams so dev teams can speak natively just by dragging their mouse cursor pointers closer together.
- [ ] **Interactive File Editing Node**: Click specific objects on active maps to pull out code repositories trees or shared text note pads right in the 3D space view.
