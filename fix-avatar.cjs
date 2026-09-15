const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/#d2cfc3/gi, 'var(--line)');
css = css.replace(/#e9e6da/gi, 'var(--raised)');
css = css.replace(/#66705d/gi, 'var(--muted)');

fs.writeFileSync('styles.css', css);
console.log('Avatar colors fixed!');
