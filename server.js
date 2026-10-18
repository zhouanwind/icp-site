/**
 * ICP备案核验网站 - 服务端
 * 静态页面 + 在线管理后台（/admin）
 * 数据持久化：JSON 文件（data/config.json, data/users.json, data/themes.json）
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const PUBLIC_DIR = path.join(ROOT, 'public');

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const THEMES_FILE = path.join(DATA_DIR, 'themes.json');
const SECRET_FILE = path.join(DATA_DIR, 'secret.json');

// ---------- 初始化 ----------
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function getJwtSecret() {
  const s = readJson(SECRET_FILE, null);
  if (s && s.secret) return s.secret;
  const secret = crypto.randomBytes(32).toString('hex');
  writeJson(SECRET_FILE, { secret });
  return secret;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES = '7d';

// 确保默认管理员存在：admin / admin123
function ensureDefaultUser() {
  const db = readJson(USERS_FILE, { users: [] });
  const admin = db.users.find((u) => u.username === 'admin');
  if (!admin) {
    db.users.push({
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    writeJson(USERS_FILE, db);
    console.log('已创建默认管理员账号：admin / admin123');
  }
}
ensureDefaultUser();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 静态资源
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR));

// 确保字体文件正确响应
app.use((req, res, next) => {
  if (req.path.endsWith('.woff2')) {
    res.setHeader('Content-Type', 'font/woff2');
  } else if (req.path.endsWith('.woff')) {
    res.setHeader('Content-Type', 'font/woff');
  } else if (req.path.endsWith('.ttf')) {
    res.setHeader('Content-Type', 'font/ttf');
  }
  next();
});

// ---------- 认证中间件 ----------
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: '未登录或登录已过期' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

// ---------- 配置读写 ----------
function getConfig() {
  return readJson(CONFIG_FILE, null) || defaultConfig();
}
function defaultConfig() {
  return {
    title: 'ICP备案核验平台',
    icon: '',
    logoText: '备案',
    theme: 'blue',
    content: '欢迎访问本网站。\n\n本页面用于展示ICP备案信息核验结果。',
    images: [],
    footer: { text: 'Copyright © 2026 我的网站 版权所有', links: [] },
    icp: { number: '京ICP备00000000号', url: 'https://beian.miit.gov.cn/' },
    ga: { number: '', url: 'https://www.beian.gov.cn/' },
    updatedAt: new Date().toISOString(),
  };
}
function saveConfig(partial) {
  const cfg = getConfig();
  const next = { ...cfg, ...partial };
  if (partial.footer) next.footer = { ...cfg.footer, ...partial.footer };
  if (partial.icp) next.icp = { ...cfg.icp, ...partial.icp };
  if (partial.ga) next.ga = { ...cfg.ga, ...partial.ga };
  // 为 text 类型链接分配/保持稳定 id（/page/:id 静态页依赖）
  if (next.footer && Array.isArray(next.footer.links)) {
    next.footer.links = next.footer.links.map((l) => {
      if (l.type === 'text' && !l.id) {
        return { ...l, id: crypto.randomBytes(4).toString('hex') };
      }
      return l;
    });
  }
  next.updatedAt = new Date().toISOString();
  writeJson(CONFIG_FILE, next);
  return next;
}

// ---------- 认证 API ----------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: '请输入用户名和密码' });
  const db = readJson(USERS_FILE, { users: [] });
  const user = db.users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  res.json({ token, username: user.username, role: user.role });
});

app.put('/api/auth/password', authRequired, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: '请输入原密码和新密码' });
  if (newPassword.length < 6) return res.status(400).json({ error: '新密码长度至少6位' });
  const db = readJson(USERS_FILE, { users: [] });
  const user = db.users.find((u) => u.username === req.user.username);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (!bcrypt.compareSync(oldPassword, user.passwordHash)) {
    return res.status(401).json({ error: '原密码错误' });
  }
  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeJson(USERS_FILE, db);
  res.json({ ok: true, message: '密码修改成功' });
});

// ---------- 配置 API ----------
app.get('/api/config', (req, res) => res.json(getConfig()));

app.get('/api/themes', (req, res) => {
  const t = readJson(THEMES_FILE, { themes: {}, defaultTheme: 'blue' });
  res.json(t);
});

app.put('/api/config', authRequired, (req, res) => {
  try {
    const next = saveConfig(req.body || {});
    res.json({ ok: true, config: next });
  } catch (e) {
    res.status(500).json({ error: '保存失败：' + e.message });
  }
});

// ---------- 图片上传 ----------
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error('仅支持 png/jpg/gif/webp/svg 图片'), ok);
  },
});

app.post('/api/upload', authRequired, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: '上传失败：' + err.message });
    if (!req.file) return res.status(400).json({ error: '请选择要上传的图片' });
    res.json({ ok: true, url: '/uploads/' + req.file.filename });
  });
});

app.delete('/api/upload/:name', authRequired, (req, res) => {
  const name = path.basename(req.params.name);
  const file = path.join(UPLOAD_DIR, name);
  if (name && name !== '.' && name !== '..' && fs.existsSync(file)) {
    fs.unlinkSync(file);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: '文件不存在' });
  }
});

// ---------- 前台首页（服务端渲染，内容来自 config.json） ----------
app.get('/', (req, res) => {
  const cfg = getConfig();
  const themes = readJson(THEMES_FILE, { themes: {}, defaultTheme: 'blue' });
  const theme = themes.themes[cfg.theme] || themes.themes[themes.defaultTheme] || themes.themes.blue;
  const html = require('./views/index.render.js')(cfg, theme, themes);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ---------- 静态文字页（/page/:id，如“关于我们”“联系我们”） ----------
app.get('/page/:id', (req, res) => {
  const cfg = getConfig();
  const links = (cfg.footer && cfg.footer.links) || [];
  const item = links.find((l) => l.type === 'text' && String(l.id) === String(req.params.id));
  if (!item) return res.status(404).send('404 - 页面不存在');
  const themes = readJson(THEMES_FILE, { themes: {}, defaultTheme: 'blue' });
  const theme = themes.themes[cfg.theme] || themes.themes[themes.defaultTheme] || themes.themes.blue;
  const html = require('./views/page.render.js')(cfg, theme, item);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ---------- 后台（/admin） ----------
app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// /admin/* 子路径也返回后台页面（SPA 兼容）
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/admin')) {
    return res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
  }
  next();
});

// 404
app.use((req, res) => res.status(404).send('404 - 页面不存在'));

app.listen(PORT, () => {
  console.log('====================================');
  console.log('  ICP备案核验网站已启动');
  console.log(`  前台地址: http://localhost:${PORT}/`);
  console.log(`  后台地址: http://localhost:${PORT}/admin`);
  console.log('  默认账号: admin');
  console.log('  默认密码: admin123');
  console.log('====================================');
});
