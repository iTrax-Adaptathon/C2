const fs = require('fs');
const html = fs.readFileSync('/tmp/C2/index.html', 'utf8');

// extract content inside <body>
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// remove script tags
bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// Convert common HTML attributes to JSX
let jsx = bodyContent
  .replace(/class=/g, 'className=')
  .replace(/for=/g, 'htmlFor=')
  .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
  .replace(/style="([^"]*)"/g, (match, styleStr) => {
    // Basic inline style to object converter
    const styles = styleStr.split(';').filter(Boolean).map(s => {
      const parts = s.split(':');
      if(parts.length !== 2) return '';
      let key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      let val = parts[1].trim();
      return `"${key}": "${val}"`;
    }).filter(Boolean).join(', ');
    return `style={{ ${styles} }}`;
  })
  .replace(/xmlns:xlink/g, 'xmlnsXlink')
  .replace(/xlink:href/g, 'xlinkHref')
  .replace(/stroke-width/g, 'strokeWidth')
  .replace(/stroke-linecap/g, 'strokeLinecap')
  .replace(/stroke-linejoin/g, 'strokeLinejoin')
  .replace(/stroke-color/g, 'strokeColor')
  .replace(/stop-color/g, 'stopColor')
  .replace(/stop-opacity/g, 'stopOpacity')
  .replace(/viewBox/g, 'viewBox') // viewBox is correct in JSX
  .replace(/preserveAspectRatio/g, 'preserveAspectRatio') // correct
  .replace(/<br>/g, '<br />')
  .replace(/<hr>/g, '<hr />')
  .replace(/<img([^>]*[^/])>/g, '<img$1/>')
  .replace(/<input([^>]*[^/])>/g, '<input$1/>');

// A little formatting to make it readable
fs.writeFileSync('parsed.jsx', jsx);
console.log("Parsed JSX saved");
