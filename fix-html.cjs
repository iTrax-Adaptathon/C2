const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<button class="avatar" aria-label="Open profile menu">AS<\/button>/, '<button class="avatar" id="btn-back-landing" aria-label="Go back">←</button>');

fs.writeFileSync('index.html', html);
console.log('Fixed btn-back-landing in index.html');
