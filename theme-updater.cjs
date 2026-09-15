const fs = require('fs');

let css = fs.readFileSync('styles_formatted.css', 'utf8');

// 1. Update :root variables
css = css.replace(/:root\s*\{([\s\S]*?)\}/, `:root {
  --ink: #F0F4EA;
  --muted: #B8C6B9;
  --muted-text: #819184;
  --paper: #101714;
  --panel: #17231E;
  --raised: #203129;
  --line: #31463A;
  --orange: #F39A5A;
  --orange-light: #FFB578;
  --sage: #91C788;
  --yellow: #F2C86B;
  --red: #E07A68;
  --focus: #9BE0A1;
  --serif: Georgia, "Times New Roman", serif;
  --sans: "Manrope", sans-serif;
  --mono: "DM Mono", monospace;
}`);

// 2. Replace hardcoded colors with CSS variables. 
// Note: we can use a lookup table.
const colorMap = [
  // Backgrounds & Surfaces
  { match: /#f0dfc7/gi, replace: 'var(--raised)' }, // .primary-metric background
  { match: /#ead4b7/gi, replace: 'var(--line)' }, // .primary-metric border
  { match: /#f1e4cf/gi, replace: 'var(--raised)' }, // .insight-panel background
  { match: /#e9e4d7/gi, replace: 'var(--raised)' }, // .day-badge background
  { match: /#eee8da/gi, replace: 'var(--raised)' }, // .range-switcher button.selected background
  { match: /#eadcc0/gi, replace: 'var(--raised)' }, // .orbit-center background
  { match: /#ddd5c5/gi, replace: 'var(--line)' }, // .orbit border
  { match: /#dddcd1/gi, replace: 'var(--line)' }, // .streak-bars i.empty background
  { match: /#e4e2d8/gi, replace: 'var(--line)' }, // .grid-line border
  { match: /#ddcdb4/gi, replace: 'var(--line)' }, // .breakdown border
  { match: /#e5e3d9/gi, replace: 'var(--line)' }, // .mini-bar background
  
  // Text Colors
  { match: /#8c765f/gi, replace: 'var(--muted-text)' }, // .orbit-center span
  { match: /#77776d/gi, replace: 'var(--muted)' }, // .metric-label, etc
  { match: /#87877d/gi, replace: 'var(--muted-text)' }, // .metric-foot
  { match: /#aaa99e/gi, replace: 'var(--muted-text)' }, // .info border/text
  { match: /#aaa99f/gi, replace: 'var(--muted-text)' }, // axis labels, row arrow
  { match: /#777267/gi, replace: 'var(--muted)' }, // .insight-copy
  { match: /#98978e/gi, replace: 'var(--muted-text)' }, // .row-tag
  { match: /#94938a/gi, replace: 'var(--muted)' }, // footer
  
  // Accent Colors
  { match: /#ca9b37/gi, replace: 'var(--yellow)' }, // .metric-icon.sun
  { match: /#bd963c/gi, replace: 'var(--yellow)' }, // .home-icon
  { match: /#bd6640/gi, replace: 'var(--orange)' }, // .metric-icon.flame
  { match: /#687f59/gi, replace: 'var(--sage)' }, // .trend-down
  { match: /#687957/gi, replace: 'var(--sage)' }, // .neutral-pill color
  { match: /#bdc9ad/gi, replace: 'var(--line)' }, // .neutral-pill border
  { match: /#789267/gi, replace: 'var(--sage)' }, // .food-icon
  
  // Specific Overrides for dark mode legibility
  // White text on orange button needs to be dark
  { match: /color:\s*#fff/gi, replace: 'color: var(--paper)' },
  { match: /stroke="#c56d3b"/gi, replace: 'stroke="var(--orange)"' },
  { match: /fill="#f8f5ed"/gi, replace: 'fill="var(--paper)"' },
  { match: /stop-color="#e39d63"/gi, replace: 'stop-color="var(--orange-light)"' }
];

colorMap.forEach(item => {
  css = css.replace(item.match, item.replace);
});

// Write it back
fs.writeFileSync('styles.css', css);
console.log('Theme updated!');
