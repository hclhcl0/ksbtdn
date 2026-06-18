const fs = require('fs');
let css = fs.readFileSync('src/admin.css', 'utf8');

const oldLight = `.nav__link {
  border-radius: 8px !important;
  margin: 2px 12px !important;
  padding: 8px 12px !important;
  color: var(--tw-text-muted) !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important; /* Fix mobile font boosting */
}

.nav__link:hover {
  background-color: var(--tw-bg) !important;
  color: var(--tw-text-hover) !important;
}

.nav__link--active, .nav__link.active {
  background-color: var(--tw-nav-active-bg) !important;
  color: var(--tw-nav-active-text) !important;
  font-weight: 600 !important;
}`;

const newLight = `.nav__link {
  border-radius: 0 !important;
  margin: 2px 0 !important;
  padding: 8px 16px !important;
  color: var(--tw-text-muted) !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important; /* Fix mobile font boosting */
  border: none !important;
}

.nav__link:hover {
  background-color: var(--tw-bg) !important;
  color: var(--tw-text-hover) !important;
}

.nav__link--active, .nav__link.active {
  background-color: transparent !important;
  color: var(--tw-text-hover) !important;
  font-weight: 600 !important;
  border-left: 2px solid var(--tw-primary) !important;
}`;

const oldDark = `html[data-theme="dark"] .nav__link--active, 
html[data-theme="dark"] .nav__link.active {
  background-color: rgba(99, 102, 241, 0.15) !important; /* Subtle indigo tint */
  color: #a5b4fc !important; /* Indigo 300 */
  border: 1px solid rgba(99, 102, 241, 0.2) !important;
}`;

const newDark = `html[data-theme="dark"] .nav__link--active, 
html[data-theme="dark"] .nav__link.active {
  background-color: transparent !important;
  color: var(--theme-text-hover) !important;
  border: none !important;
  border-left: 2px solid var(--tw-primary) !important;
}`;

css = css.replace(oldLight, newLight);
css = css.replace(oldDark, newDark);

fs.writeFileSync('src/admin.css', css);
console.log('Fixed nav__link in admin.css');
