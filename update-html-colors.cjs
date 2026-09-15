const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/#c56d3b/gi, '#F39A5A');
html = html.replace(/#e39d63/gi, '#FFB578');
html = html.replace(/#f4f1e8/gi, '#101714');
html = html.replace(/#f8f5ed/gi, '#101714');

fs.writeFileSync('index.html', html);
console.log('HTML colors updated!');
