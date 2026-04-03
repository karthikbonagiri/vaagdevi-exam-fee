// ─── Master Minds | Shared Firebase Configuration ───
// Include this file AFTER the firebase SDK scripts on every page.

const firebaseConfig = {
  apiKey: "AIzaSyAATwPr-KzsNecJzGPiGi0uJvfLfSSt_c4",
  authDomain: "exam-fee-management.firebaseapp.com",
  projectId: "exam-fee-management",
  storageBucket: "exam-fee-management.firebasestorage.app",
  messagingSenderId: "1047560994816",
  appId: "1:1047560994816:web:27cad679785d64f26a18e5"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db      = firebase.firestore();
const storage = firebase.storage();
const paymentsCollection = db.collection('payments');
const studentsExcelRef   = storage.ref('students.xlsx');
