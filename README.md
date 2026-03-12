<h1 align="center">✋ GestureFlow</h1>

<p align="center">
  <strong>Control your Windows PC seamlessly with hand gestures! Built with Electron, React, and Python (MediaPipe).</strong>
</p>

---

## 📸 App Screenshots

> **Note**: To add your own screenshots, place them in the `assets/screenshots/` folder and name them `welcome.png`, `setup.png`, and `dashboard.png`.

| Welcome Screen | Setup Gestures | Live Dashboard |
| :---: | :---: | :---: |
| <img src="assets/screenshots/welcome.png" width="250" alt="GestureFlow Welcome Screen"> | <img src="assets/screenshots/setup.png" width="250" alt="Gesture Setup Mapping Screen"> | <img src="assets/screenshots/dashboard.png" width="250" alt="Live Camera Dashboard"> |

---

## ✨ Features

- **Intuitive Gesture Control**: Map specific hand gestures to perform PC operations natively (e.g., volume control, brightness).
- **Interactive Setup**: Configure your own gesture mappings visually using an easy-to-use React UI.
- **Live Feed Dashboard**: See your webcam feed and detected gestures in real-time.
- **Clean Architecture**: Python backend (FastAPI + MediaPipe) running seamlessly alongside an Electron/React front-end.
- **Persistent Configuration**: Your customized gesture preferences are saved locally to `gesture_config.json`.

---

## 🛠️ Built With & Architecture

### Tech Stack
- **Frontend**: React, Vite
- **Desktop Framework**: Electron
- **Backend API**: Python, FastAPI, Uvicorn, WebSockets
- **Gesture Detection AI**: OpenCV, MediaPipe
- **System Control Tools**: PyAutoGUI, Pycaw, Screen-Brightness-Control

### How I Packaged It As A Desktop App

The magic of turning this Python/React project into a seamless Windows desktop application lies in **Electron** and **electron-builder**:

1. **Two-Part Architecture**: The app runs a Node.js frontend (Electron/React) side-by-side with a Python backend (FastAPI + MediaPipe). 
2. **Inter-Process Communication**: When the Electron `.exe` starts, its main process silently spawns the Python backend server as a background child process. The React UI then communicates with this Python engine via WebSockets and HTTP requests.
3. **Packaging the App**: To make it a standalone executable, `package.json` uses `electron-builder` configured to copy the entire Python `backend/` folder into the final build's `resources` directory (`extraResources: [{from: "backend", to: "backend"}]`). This ensures the user doesn't need to manually run a separate Python script—the Electron app handles everything internally!

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites
- **Node.js**: v16 or higher (contains `npm`)
- **Python**: v3.8 or higher 
- A working **Webcam**

### 2. Install Project Dependencies

**A. Python Backend Setup**

Open a terminal and navigate to the `backend` folder to install the required Python libraries:

```bash
cd backend

# (Optional but recommended: Create a virtual environment first, depending on your OS)
# python -m venv venv
# .\venv\Scripts\activate   (Windows)
# source venv/bin/activate  (Mac/Linux)

pip install -r requirements.txt
```

**B. Node/Electron Setup**

Open another terminal at the root of the project to install the frontend Node modules:

```bash
# Ensure you are at "d:\hand gesture project" or your root directory
npm install
```

---

## 💻 Running the Application

### Development Mode

To run the app in development mode (this will start both the Vite dev server and the Electron application simultaneously with hot-reloading enabled):

```bash
npm run dev
```

### Production Build

To run the production-built React UI or to fully package the application into a standalone executable:

```bash
# 1. First, build the React frontend for production
npm run build

# 2. Run the built Electron app locally
npm start

# OR to generate a complete Windows installer (.exe files):
npm run package
```
*Notice: The compiled installer will be saved inside the automatically generated `release/` folder.*

---

## 🎮 How to Operate the App

Here is a step-by-step guide on how to use GestureFlow once it is installed and running:

1. **Launch the App**: Open the `GestureFlow.exe` file (or run `npm start` in dev mode). Ensure your webcam is connected and unobstructed.
2. **Welcome Screen**: On your first launch, the app checks if you have existing configurations. Click **Get Started** to begin mapping your gestures.
3. **Setup Wizard**: Choose a hand gesture from the visual list (e.g., Peace ✌️, Fist ✊, Open Palm ✋) and map it to a specific PC shortcut (like Volume Up, Volume Down, or Mute). Your preferences are saved automatically to the `gesture_config.json` file.
4. **Dashboard Activation**: Click **Start** on the main dashboard to fire up the Python gesture detection engine. The camera feed will appear on-screen, showing real-time hand tracking landmarks.
5. **Control Your PC**: Perform your mapped gestures in front of the camera. The app will instantly detect the gesture and execute the corresponding system command on your Windows PC!
6. **Background Operation**: You can minimize the app while it runs in the background. The gesture detection will remain active as long as the dashboard is running.
7. **Quit Safely**: Always press the **Quit** button inside the app. This safely shuts down both the React UI and the background Python process, freeing up system resources and releasing the webcam.

*To reset your gesture mappings, click the "Reset Setup" option in the UI, or simply delete the `gesture_config.json` file manually.*

---

## 👐 Supported Gestures Reference

| Gesture | Emoji |
|---------|-------|
| Open Palm | ✋ |
| Fist | ✊ |
| Point Up | ☝️ |
| Peace | ✌️ |
| 3 Fingers | 🤟 |
| 4 Fingers | 🖐️ |
| Thumbs Up | 👍 |
| Thumbs Down | 👎 |
| Hang Loose | 🤙 |
| Rock On | 🤘 |
| Pinch Close | 🤏 |
| Pinch Open | 🫰 |
| OK Sign | 👌 |
| Vulcan | 🖖 |
| Point Sideways | 👉 |

---

*Made by Mouli.*
