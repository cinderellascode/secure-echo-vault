# 🔒 Secure Echo Vault (Audio-Biometric 2FA)

> **"Sound is the most secure channel."**
> A Full-Stack security system that replaces visual passwords with Voice Biometrics and "Invisible" Audio OTPs.

---

## 🚀 Overview

**Secure Echo Vault** is a concept security application designed to solve the vulnerability of **Visual Hacking** (Screen-scraping malware, shoulder surfing). 

Instead of displaying sensitive 2FA codes on a screen—where they can be intercepted—this system utilizes **Blind Audio Authentication**. The OTP is generated server-side and spoken directly to the user via the browser's audio channel, leaving no visual footprint for malware to capture.

**Built for the ToneTag Engineering Challenge.**

---

## ⚡ Key Innovations

### 1. 🗣️ Voice-Activated Entry
No keyboard required. The system uses the **Web Speech API** to listen for the secure phrase (`"Hello World"`). It converts the voice input to text and verifies it against the backend hash.

### 2. 🕵️ "Invisible" Audio OTP (The Novelty)
Upon voice verification, the system does **not** show the 2FA code.
* **The Problem:** Malware takes screenshots every second to steal SMS codes.
* **The Solution:** The server sends the code (e.g., `4-2-9-1`) to the frontend, which **speaks** it to the user. The code never renders as pixels on the screen.

### 3. 🛡️ Forensic Audit Logging
Every attempt is logged in the Django database with:
* **Real IP Tracking:** Uses `HTTP_X_FORWARDED_FOR` logic to identify users behind proxies/VPNs.
* **Status Codes:** Differentiates between `ACCESS_DENIED`, `STEP_1_PASSED`, and `ACCESS_GRANTED`.
* **Latency Metrics:** Tracks server processing time (ms) for performance auditing.

---

## 🛠️ Tech Stack

### **Frontend (The Interface)**
* **React.js**: Functional components with Hooks (`useState`, `useEffect`).
* **Web Speech API**: Native browser support for Speech-to-Text (STT) and Text-to-Speech (TTS).
* **Axios**: For secure HTTP requests.

### **Backend (The Core)**
* **Django**: High-level Python framework for security logic.
* **Django REST Framework (DRF)**: For building the API endpoints.
* **SQLite**: Lightweight database for audit logs.
* **CORS Headers**: Configured to allow secure cross-origin requests.

---

## 📸 Screenshots
*(Add screenshots of your "Locked" screen, the "Listening" state, and the Django Admin Panel logs here)*

---

## 💻 Installation & Setup

Follow these steps to run the "Vault" locally.

### Prerequisites
* Python 3.x
* Node.js & npm
* Google Chrome (Required for Web Speech API)

### 1. Backend Setup (Django)
```bash
# Navigate to the backend folder
cd backend

# Create & Activate Virtual Environment
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install Dependencies
pip install -r ../requirements.txt

# Run Migrations & Start Server
python manage.py migrate
python manage.py runserver
