# 🔐 Password Generator + Secure Vault (MVP)

> **Live Demo**: [https://password-vault-alpha.vercel.app](https://password-vault-alpha.vercel.app)  
> **GitHub Repo**: [Github](https://github.com/Anirban642/password-vault)  
> **Screen Recording (60–90s)**: [Watch Flow → Generate → Save → Search → Edit → Delete](https://your-screen-recording-link.com) *(replace with actual link)*

---

## 🎯 Goal

Build a fast, minimal, privacy-first web app where users can:

- ✅ Generate strong passwords with customizable options  
- ✅ Save entries securely to a personal vault (client-side encrypted)  
- ✅ View, edit, delete saved items in a clean panel  
- ✅ Copy passwords with auto-clear (~10–20s)  
- ✅ Search/filter through vault items  

---

## ⚙️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS  
- **Backend**: Next.js API Routes (Server Actions)  
- **Database**: MongoDB (via MongoDB Atlas)  
- **Auth**: Email + Password (NextAuth.js / Credentials Provider)  
- **Encryption**: `crypto-js` AES (client-side only — server never sees plaintext)  
- **UI**: Minimal, no heavy themes.  
- **Hosting**: Vercel (free tier)

---

## ✅ Must-Haves Implemented

- **🔐 Password Generator**  
  - Slider for length (8–64)  
  - Toggles: Include Numbers, Letters, Symbols, Exclude Ambiguous (e.g., 0/O, l/1)  
  - Instant generation on toggle/slider change  

- **👤 Simple Auth**  
  - Sign up / Log in with email + password  
  - Session management via NextAuth.js  

- **🗄️ Vault Items Structure**  
  - Title (required)  
  - Username  
  - Password (encrypted client-side)  
  - URL  
  - Notes (optional)  

- **🔒 Client-Side Encryption**  
  - All sensitive fields encrypted before hitting the server  
  - Decrypted only in browser memory during view/edit  
  - Server stores only encrypted blobs → verified in DB & network tab  

- **📋 Copy to Clipboard + Auto-Clear**  
  - One-click copy for passwords/usernames  
  - Clears clipboard automatically after 15 seconds  

- **🔍 Basic Search/Filter**  
  - Real-time filter by title or URL as you type  

---

## 📦 Deliverables Checklist

- [x] Live demo URL accessible  
- [x] Public GitHub repo with full source + README  
- [x] Short crypto note (see below)  
- [x] 60–90s screen recording showing core flow  
- [x] No secrets in logs or code  
- [x] UI is minimal, fast, responsive  

---

## 🔐 Crypto Note

> Used `crypto-js` AES encryption with PBKDF2-derived key from user’s password. All encryption/decryption happens client-side — server only ever handles encrypted blobs. Ensures zero plaintext exposure even if DB is compromised.

---

## ▶️ Quick Start (Local Setup)

```bash
git clone https://github.com/your-username/password-vault-mvp.git
cd password-vault-mvp
cp .env.local.example .env.local
# Fill in MONGODB_URI and NEXTAUTH_SECRET
npm install
npm run dev
