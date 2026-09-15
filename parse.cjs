const fs = require('fs');
const html = fs.readFileSync('/tmp/C2/index.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

let jsx = bodyContent
  .replace(/class=/g, 'className=')
  .replace(/for=/g, 'htmlFor=')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/style="([^"]*)"/g, (match, styleStr) => {
    const styles = styleStr.split(';').filter(Boolean).map(s => {
      const parts = s.split(':');
      if(parts.length !== 2) return '';
      let key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      let val = parts[1].trim();
      return `"${key}": "${val}"`;
    }).filter(Boolean).join(', ');
    return `style={{ ${styles} }}`;
  })
  .replace(/stroke-width/g, 'strokeWidth')
  .replace(/stroke-linecap/g, 'strokeLinecap')
  .replace(/stroke-linejoin/g, 'strokeLinejoin')
  .replace(/stop-color/g, 'stopColor')
  .replace(/stop-opacity/g, 'stopOpacity')
  .replace(/<br>/g, '<br />')
  .replace(/<hr>/g, '<hr />');

fs.writeFileSync('parsed.jsx', jsx);
console.log("Parsed JSX saved");
