# 🎯 Event Registration Portal — Setup Guide

## Files
| File | Purpose |
|------|---------|
| `index.html` | Main registration form |
| `style.css` | All styles (dark mode, animations, responsive) |
| `app.js` | JavaScript logic (validation, sheets, localStorage) |
| `google-apps-script.js` | Paste this into Google Apps Script editor |

---

## 🔌 Google Sheets Setup (Step-by-Step)

### 1. Create the Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com) → Create a blank spreadsheet.
2. Rename the **sheet tab** at the bottom to `Registrations`.

### 2. Set Up the Apps Script
1. In the spreadsheet, click **Extensions → Apps Script**.
2. Delete all existing code in the editor.
3. Open `google-apps-script.js` from this folder and **paste the entire content**.
4. Press **Ctrl+S** to save. Name the project `EventRegistration`.

### 3. Deploy as Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon ⚙ → select **Web App**.
3. Set:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**.
5. Authorize access when prompted.
6. **Copy the Web App URL** that appears.

### 4. Update `app.js`
Open `app.js` and replace:
```js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
```
with your actual Web App URL.

---

## 📱 QR Code Generation

1. Host your `index.html` online (see options below).
2. Go to [qr-code-generator.com](https://www.qr-code-generator.com/).
3. Paste your website URL → Download the QR code image.

### Free Hosting Options
| Service | Steps |
|---------|-------|
| **GitHub Pages** | Push files to a GitHub repo → Settings → Pages → Deploy |
| **Netlify Drop** | Go to [app.netlify.com/drop](https://app.netlify.com/drop) → drag & drop your folder |
| **Vercel** | `npx vercel` in the folder |

---

## 🗂 Google Sheet Columns
The script auto-creates these columns if the sheet is empty:

| Col | Data |
|-----|------|
| A | Timestamp |
| B | Name |
| C | Roll Number |
| D | Phone |
| E | College |
| F | Event Name |
| G | Event Date |
| H | Selected Events (comma-separated) |

---

## ✅ Features Checklist
- [x] Auto-fill Name, Roll No, Phone from localStorage
- [x] Today's date auto-filled (editable)
- [x] Multi-select event checkboxes
- [x] "Other" event custom text input
- [x] 10-digit phone validation
- [x] Real-time field error clearing
- [x] Toast error/success notifications
- [x] Loading spinner on submit
- [x] Double-submit prevention
- [x] Success popup with animation
- [x] Partial reset after submit (keeps localStorage data)
- [x] Full form reset button
- [x] Dark mode toggle (saved preference)
- [x] Mobile responsive
