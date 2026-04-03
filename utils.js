// ─── Master Minds | Shared Utilities ───
// Include this file after firebase-config.js on every page.

/* ── HTML escape ── */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
  );
}

/* ── Toast notifications ── */
function showToast(message, type = 'success') {
  const icons = { success:'check-circle', error:'times-circle', warning:'exclamation-triangle', info:'info-circle' };
  let t = document.getElementById('_toast');
  if (!t) { t = document.createElement('div'); t.id = '_toast'; document.body.appendChild(t); }
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${message}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── Excel export ── */
function exportToExcel(data, filename, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ── Currency format ── */
function formatINR(amount) {
  return '₹' + (parseFloat(amount) || 0).toLocaleString('en-IN');
}

/* ── Parse student rows from XLSX sheet ── */
function parseStudentRows(rows) {
  const out = [];
  rows.forEach(row => {
    let ht = row['Hall Ticket'] || row['HALL TICKET'] || row['HT'] || row['ht'];
    if (!ht) return;
    out.push({
      'Hall Ticket' : String(ht).trim(),
      'Name'        : row['Name']        || row['NAME']        || '',
      'Father Name' : row['Father Name'] || row['FATHER NAME'] || '',
      'Group'       : row['Group']       || row['GROUP']       || '',
      'Result'      : row['Result']      || row['RESULT']      || ''
    });
  });
  return out;
}

/* ── Parse students from an ArrayBuffer (local fallback) ── */
function parseStudentsFromBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const rows     = XLSX.utils.sheet_to_json(sheet);
  const students = parseStudentRows(rows);
  if (students.length === 0)
    throw new Error('No valid records found. Check headers: Hall Ticket, Name, Father Name, Group, Result');
  return students;
}

/* ─────────────────────────────────────────────────────────────
   loadStudentsFromCloud()
   Throws an Error with .type:
     'NOT_FOUND'     – file not in Storage yet
     'CORS_ERROR'    – fetch blocked by browser CORS policy
     'FIREBASE_ERROR'– Storage unreachable / auth issue
     'PARSE_ERROR'   – file exists but can't be read as Excel
   ───────────────────────────────────────────────────────────── */
async function loadStudentsFromCloud() {
  // 1. Get signed download URL
  let url;
  try {
    url = await studentsExcelRef.getDownloadURL();
  } catch (err) {
    const notFound = err.code === 'storage/object-not-found';
    const e = new Error(notFound
      ? 'students.xlsx not found in cloud. Upload it in the Cloud Storage section.'
      : 'Cannot reach Firebase Storage: ' + err.message);
    e.type = notFound ? 'NOT_FOUND' : 'FIREBASE_ERROR';
    throw e;
  }

  // 2. Download file bytes
  let arrayBuffer;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    arrayBuffer = await res.arrayBuffer();
  } catch (fetchErr) {
    // "Failed to fetch" almost always means CORS is not configured
    const e = new Error(
      'Download blocked by browser (CORS). ' +
      'Use the local file option shown below, or fix CORS — see README.md.'
    );
    e.type   = 'CORS_ERROR';
    e.detail = fetchErr.message;
    throw e;
  }

  // 3. Parse Excel
  try {
    return parseStudentsFromBuffer(arrayBuffer);
  } catch (parseErr) {
    const e = new Error('Cannot parse file: ' + parseErr.message);
    e.type = 'PARSE_ERROR';
    throw e;
  }
}
