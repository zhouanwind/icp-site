/**
 * 前台页面渲染：根据 config 与主题生成完整 HTML
 */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 将正文按空行分段、换行转 br 渲染 */
function renderContent(content) {
  const blocks = String(content || '')
    .split(/\n{2,}/)
    .map((b) => `<p>${esc(b).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return blocks || '<p style="color:var(--muted)">暂无内容，请管理员在后台添加。</p>';
}

module.exports = function renderIndex(cfg, theme, themes) {
  const icon = cfg.icon
    ? `<img class="logo-icon" src="${esc(cfg.icon)}" alt="logo">`
    : `<span class="logo-badge">${esc(cfg.logoText || '备')}</span>`;
  const imagesHtml = (cfg.images || [])
    .map(
      (img) => `
      <figure class="gallery-item">
        <img src="${esc(img)}" alt="网站图片" loading="lazy">
      </figure>`
    )
    .join('');
  const linksHtml = (cfg.footer && cfg.footer.links ? cfg.footer.links : [])
    .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join('<span class="sep">|</span>');
  const gaHtml = cfg.ga && cfg.ga.number
    ? `<a class="icp-card ga" href="${esc(cfg.ga.url || 'https://www.beian.gov.cn/')}" target="_blank" rel="noopener">
         <span class="icp-label">公安备案</span>
         <span class="icp-num">${esc(cfg.ga.number)}</span>
       </a>`
    : '';

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
<title>${esc(cfg.title)}</title>
<meta name="description" content="${esc(cfg.title)} - ICP备案核验">
${cfg.icon ? `<link rel="icon" href="${esc(cfg.icon)}">` : ''}
<style>
@font-face {
  font-family: 'Noto Sans SC';
  src: url('/fonts/noto-sans-sc.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Noto Sans SC';
  src: url('/fonts/noto-sans-sc.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
}
:root{${themeVars}
  --radius:12px;
  --shadow:0 2px 12px rgba(0,0,0,.08);
  --shadow-lg:0 8px 30px rgba(0,0,0,.12);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.75;min-height:100vh;display:flex;flex-direction:column}
a{color:var(--primary);text-decoration:none;transition:opacity .2s}
a:hover{opacity:.8}

/* 头部 */
header{background:var(--header-bg);box-shadow:var(--shadow);position:sticky;top:0;z-index:10}
.header-inner{max-width:1000px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:12px}
.logo-badge{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex:none;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.logo-icon{width:42px;height:42px;border-radius:10px;object-fit:cover;flex:none}
.site-title{font-size:20px;font-weight:700;color:var(--text)}
.site-title small{display:block;font-size:12px;font-weight:400;color:var(--muted);margin-top:2px}

/* 主体 */
main{flex:1;width:100%;max-width:1000px;margin:0 auto;padding:28px 20px 40px}
.hero{background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);color:#fff;border-radius:var(--radius);padding:40px 32px;margin-bottom:24px;box-shadow:var(--shadow-lg);position:relative;overflow:hidden}
.hero::after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.12)}
.hero::before{content:"";position:absolute;right:30px;bottom:-80px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.08)}
.hero h1{font-size:28px;margin-bottom:10px;position:relative;z-index:1}
.hero p{opacity:.92;position:relative;z-index:1;font-size:15px}
.hero .hero-tag{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:4px 14px;border-radius:999px;font-size:13px;margin-bottom:14px;position:relative;z-index:1}

.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:26px 28px;margin-bottom:22px;box-shadow:var(--shadow)}
.card h2{font-size:18px;color:var(--primary);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.card h2::before{content:"";width:4px;height:18px;background:var(--primary);border-radius:2px;display:inline-block}
.card p{margin-bottom:10px;font-size:15px}
.card p:last-child{margin-bottom:0}

/* 备案卡片 */
.icp-row{display:flex;gap:16px;flex-wrap:wrap}
.icp-card{flex:1;min-width:260px;background:var(--card);border:1px solid var(--border);border-left:4px solid var(--primary);border-radius:var(--radius);padding:18px 22px;display:flex;flex-direction:column;gap:6px;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s}
.icp-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.icp-card.ga{border-left-color:#22c55e}
.icp-label{font-size:13px;color:var(--muted);letter-spacing:2px}
.icp-num{font-size:17px;font-weight:700;color:var(--text)}
.badge-ok{align-self:flex-start;background:rgba(34,197,94,.12);color:#16a34a;font-size:12px;padding:2px 10px;border-radius:999px;margin-top:4px}

/* 图片 */
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.gallery-item{border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow)}
.gallery-item img{width:100%;height:170px;object-fit:cover;display:block;transition:transform .3s}
.gallery-item:hover img{transform:scale(1.05)}

/* 页脚 */
footer{background:var(--footer-bg);color:var(--footer-text);padding:26px 20px;text-align:center}
.footer-links{margin-bottom:12px;font-size:14px}
.footer-links a{color:var(--footer-text);margin:0 4px}
.footer-links a:hover{color:#fff}
.footer-links .sep{opacity:.35;margin:0 8px}
.footer-copy{font-size:13px;opacity:.85}

@media (max-width:600px){
  .hero{padding:28px 22px}
  .hero h1{font-size:22px}
  .card{padding:20px}
  .site-title{font-size:17px}
}
</style>
</head>
<body>
<header>
  <div class="header-inner">
    ${icon}
    <div class="site-title">
      ${esc(cfg.title)}
      <small>ICP备案核验 · ICP Verification</small>
    </div>
  </div>
</header>
<main>
  <section class="hero">
    <span class="hero-tag">已核验</span>
    <h1>${esc(cfg.title)}</h1>
    <p>本网站信息已根据《互联网信息服务管理办法》完成ICP备案核验</p>
  </section>

  <section class="card">
    <h2>网站信息</h2>
    ${renderContent(cfg.content)}
  </section>

  <section class="icp-row">
    <a class="icp-card" href="${esc(cfg.icp.url || 'https://beian.miit.gov.cn/')}" target="_blank" rel="noopener">
      <span class="icp-label">ICP备案号</span>
      <span class="icp-num">${esc(cfg.icp.number)}</span>
      <span class="badge-ok">✓ 备案有效</span>
    </a>
    ${gaHtml}
  </section>

  ${imagesHtml ? `<section class="card">
    <h2>图片展示</h2>
    <div class="gallery">${imagesHtml}</div>
  </section>` : ''}
</main>
<footer>
  <div class="footer-links">${linksHtml}</div>
  <div class="footer-copy">${esc(cfg.footer ? cfg.footer.text : '')}</div>
</footer>
</body>
</html>`;
};
