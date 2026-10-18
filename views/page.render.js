/**
 * 静态文字页渲染：/page/:id 新页展示后台配置的静态文字（如“关于我们”“联系我们”）
 */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderContent(content) {
  const blocks = String(content || '')
    .split(/\n{2,}/)
    .map((b) => `<p>${esc(b).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return blocks || '<p style="color:var(--muted)">暂无内容，请管理员在后台添加。</p>';
}

module.exports = function renderPage(cfg, theme, item) {
  const icon = cfg.icon
    ? `<img class="logo-icon" src="${esc(cfg.icon)}" alt="logo">`
    : `<span class="logo-badge">${esc(cfg.logoText || '备')}</span>`;
  const themeVars = `
    --primary:${theme.primary};
    --primary-dark:${theme.primaryDark};
    --bg:${theme.bg};
    --card:${theme.cardBg};
    --text:${theme.text};
    --muted:${theme.textMuted};
    --border:${theme.border};
    --footer-bg:${theme.footerBg};
    --footer-text:${theme.footerText};
    --header-bg:${theme.headerBg};`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(item.label)} - ${esc(cfg.title)}</title>
${cfg.icon ? `<link rel="icon" href="${esc(cfg.icon)}">` : ''}
<style>
@font-face{font-family:'Noto Sans SC';src:url('/fonts/noto-sans-sc.woff2') format('woff2');font-weight:400;font-style:normal}
@font-face{font-family:'Noto Sans SC';src:url('/fonts/noto-sans-sc.woff2') format('woff2');font-weight:700;font-style:normal}
:root{${themeVars}
  --radius:12px;
  --shadow:0 2px 12px rgba(0,0,0,.08);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.75;min-height:100vh;display:flex;flex-direction:column}
a{color:var(--primary);text-decoration:none;transition:opacity .2s}
a:hover{opacity:.8}
header{background:var(--header-bg);box-shadow:var(--shadow);position:sticky;top:0;z-index:10}
.header-inner{max-width:1000px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:12px}
.logo-badge{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex:none;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.logo-icon{width:42px;height:42px;border-radius:10px;object-fit:cover;flex:none}
.site-title{font-size:20px;font-weight:700;color:var(--text)}
main{flex:1;width:100%;max-width:1000px;margin:0 auto;padding:28px 20px 40px}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:30px 32px;box-shadow:var(--shadow)}
.card h1{font-size:24px;color:var(--primary);margin-bottom:8px;display:flex;align-items:center;gap:10px}
.card h1::before{content:"";width:5px;height:22px;background:var(--primary);border-radius:3px;display:inline-block}
.page-updated{font-size:12px;color:var(--muted);margin-bottom:20px}
.page-body p{margin-bottom:12px;font-size:15px}
.page-body p:last-child{margin-bottom:0}
.back{display:inline-flex;align-items:center;gap:6px;margin-bottom:18px;font-size:14px}
footer{background:var(--footer-bg);color:var(--footer-text);padding:20px;text-align:center;font-size:13px}
@media (max-width:600px){.card{padding:20px}.card h1{font-size:20px}}
</style>
</head>
<body>
<header>
  <div class="header-inner">
    ${icon}
    <div class="site-title">${esc(cfg.title)}</div>
  </div>
</header>
<main>
  <a class="back" href="/">← 返回首页</a>
  <article class="card">
    <h1>${esc(item.label)}</h1>
    <div class="page-updated">更新时间：${esc((cfg.updatedAt || '').slice(0, 10))}</div>
    <div class="page-body">${renderContent(item.text)}</div>
  </article>
</main>
<footer>${esc(cfg.footer ? cfg.footer.text : '')}</footer>
</body>
</html>`;
};
