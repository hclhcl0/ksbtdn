const fs = require('fs');
const lines = fs.readFileSync('src/admin.css', 'utf8').split('\n');
const goodLines = lines.slice(0, 515);
const fix = `
/* ==========================================
   FIX PAYLOAD CMS LIST TABLES IN DARK MODE
   ========================================== */
html[data-theme="dark"] .collection-list .table,
html[data-theme="dark"] .collection-list table {
  background-color: transparent !important;
  color: var(--theme-text) !important;
}

html[data-theme="dark"] .collection-list th,
html[data-theme="dark"] .collection-list .table-header {
  background-color: var(--theme-elevation-100) !important;
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}

html[data-theme="dark"] .collection-list td,
html[data-theme="dark"] .collection-list .cell {
  color: var(--theme-text) !important;
  border-color: var(--theme-border) !important;
}

html[data-theme="dark"] .collection-list tr,
html[data-theme="dark"] .collection-list .row {
  background-color: transparent !important;
  border-color: var(--theme-border) !important;
}

html[data-theme="dark"] .collection-list tr:nth-child(even),
html[data-theme="dark"] .collection-list .row:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

html[data-theme="dark"] .collection-list tr:hover,
html[data-theme="dark"] .collection-list .row:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Fix text colors inside the table */
html[data-theme="dark"] .collection-list th *,
html[data-theme="dark"] .collection-list td * {
  color: inherit;
}

html[data-theme="dark"] .collection-list a {
  color: #60a5fa !important;
}
html[data-theme="dark"] .collection-list a:hover {
  color: #93c5fd !important;
  text-decoration: underline;
}

html[data-theme="dark"] .collection-list input[type="checkbox"],
html[data-theme="dark"] .checkbox-input {
  background-color: var(--theme-elevation-150) !important;
  border: 1px solid var(--theme-border) !important;
  color: var(--tw-primary) !important;
}

html[data-theme="dark"] .collection-list input[type="checkbox"]:checked,
html[data-theme="dark"] .checkbox-input--checked {
  background-color: var(--tw-primary) !important;
  border-color: var(--tw-primary) !important;
}

/* Fix generic payload table row */
html[data-theme="dark"] table tr {
  background-color: transparent !important;
}
html[data-theme="dark"] table th {
  background-color: var(--theme-elevation-50) !important;
  color: var(--theme-text) !important;
}
html[data-theme="dark"] table td {
  color: var(--theme-text) !important;
}
`;
fs.writeFileSync('src/admin.css', goodLines.join('\n') + '\n' + fix);
console.log('Fixed admin.css');
