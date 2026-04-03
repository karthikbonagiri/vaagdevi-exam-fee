# Master Minds – Exam Fee Manager
### Setup & Troubleshooting Guide

---

## 📁 Files in this project

| File | Purpose |
|------|---------|
| `index.html` | Main dashboard – search students, record payments |
| `notpaid.html` | View & export students who haven't paid |
| `payment-history.html` | Full payment records with delete & filters |
| `style.css` | Shared stylesheet |
| `firebase-config.js` | Firebase config (edit here if you change project) |
| `utils.js` | Shared utility functions |
| `cors.json` | Used to fix the CORS error (see below) |

---

## 🚀 How to use

1. Host all files on **Firebase Hosting** or any web server (e.g. `npx serve .`)
2. Open `index.html`
3. Upload `students.xlsx` using the Cloud Storage section
4. Start recording payments

---

## ❌ "Failed to fetch" / CORS Error

This happens when the browser blocks downloading `students.xlsx` from Firebase Storage.

### Option A – Quick workaround (no setup needed)
When you see the error, a yellow box appears with a **"Click to load students.xlsx from your computer"** button.  
Pick your local `students.xlsx` file → students load instantly.  
Payments still save to the cloud normally. ✅

### Option B – Fix CORS permanently (recommended)

Run these commands **once** in your terminal:

```bash
# Install Google Cloud SDK (if not installed)
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Apply CORS config to your Firebase Storage bucket
gsutil cors set cors.json gs://exam-fee-management.firebasestorage.app
```

After this runs, reload the page — cloud loading will work automatically forever.

---

## 🔒 Firebase Storage Rules

Make sure your Storage rules allow public reads. In Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;  // Tighten this in production
    }
  }
}
```

---

## 📞 Support
Developed by Karthik Bonagiri | Master Minds – The Learning Hub | +91 90148 95357
