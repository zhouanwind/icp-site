# ICP 备案核验静态网站与后台管理系统

这是一个专为 **ICP 备案核验** 量身定制的轻量级网站系统，包含优雅现代的备案展示前台和便捷的在线后台管理中心。

---

## 🌟 核心特性

1. **合规美观的前台**：
   - 专为工信部与通信管理局备案审核设计，界面现代、简约大方。
   - 响应式布局，完美适配手机、平板及电脑各种屏幕。
   - 突出展示 ICP 备案号、公安备案号（点击直达官方查询平台）。
   - 标准页脚：版权信息、超链接（如关于我们、隐私说明、备案链接等）。

2. **后台管理中心（`/admin`）**：
   - **网址后缀直达**：通过 `http://你的域名/admin` 即可直接进入管理后台。
   - **安全认证**：采用 JWT 令牌与安全加密，支持登录会话与密码修改。
   - **默认管理员**：首次运行自动生成默认账号密码：
     - **用户名**：`admin`
     - **密　码**：`admin123`
     - 可在后台「安全设置」一键修改密码。

3. **丰富的后台可配置项**：
   - **基本设置**：网站标题（Title）、网站 Favicon 图标（支持 URL 或本地文件上传）、Logo 文字。
   - **正文内容**：网站介绍、备案声明、单位/个人联系信息（支持多段落与换行）。
   - **图片管理**：支持上传本地图片展示在前台（支持拖拽上传、多选、删除，单张最大 5MB）。
   - **页脚与超链接**：自定义版权文字，自由添加/删除/编辑多条页脚超链接。
   - **备案信息**：单独配置 ICP 备案号、公安备案号及其官方查询跳转 URL。

4. **内置 5 套精美主题**：
   - 💼 **商务蓝**（默认经典、严谨稳重，适合各类企事业单位备案）
   - 🌌 **暗黑科技**（高雅深色风格）
   - 🍃 **自然绿**（清新自然、健康环保风）
   - 🍊 **活力橙**（温暖明朗、富有活力）
   - 🔮 **优雅紫**（现代优雅、创意科技）
   - 后台一键点击即生效，实时持久化。

5. **轻量文件数据持久化**：
   - 无需安装和配置臃肿的 MySQL / MongoDB 等数据库。
   - 所有设置持久化存储在 `data/config.json` 与 `data/users.json` 文件中，安全原子化写入。
   - 备份与迁移极其简单，只需复制 `data/` 目录即可！

---

## 🚀 快速启动

### 1. 环境要求
- Node.js 18+ (推荐 Node.js 20 或更高版本)
- npm 或 pnpm / yarn

### 2. 安装依赖并启动
```bash
# 一条命令即可：npm start 会自动安装依赖，然后启动服务
npm start

# 手动分步执行（效果相同）
npm install   # 安装依赖包
node server.js

# 或开发模式（热重载）
npm run dev
```

### 3. 访问地址
- **前台展示页**：`http://localhost:3000/`
- **后台管理系统**：`http://localhost:3000/admin`
  - 默认用户名：`admin`
  - 默认密码：`admin123`

---

## 📁 目录结构

```text
├── server.js              # 服务端主入口（Express 服务、API 鉴权与配置读写）
├── package.json           # 项目配置与依赖说明
├── views/
│   └── index.render.js    # 前台页面服务端动态渲染引擎
├── public/
│   ├── admin.html         # 后台管理单页（SPA，登录、设置、主题、预览等）
│   └── favicon.ico        # 默认站点图标
├── data/                  # 数据持久化目录（自动创建）
│   ├── config.json        # 网站配置（标题、内容、图标、页脚、主题等）
│   ├── users.json         # 管理员账号与密码（bcrypt 哈希存储）
│   └── themes.json        # 内置主题预设
├── uploads/               # 上传的图片与图标文件存放目录
└── README.md              # 说明文档
```

---

## 🌐 线上部署建议

### 使用 PM2 进行守护进程常驻运行
```bash
npm install -g pm2
pm2 start server.js --name "icp-site"
pm2 save
pm2 startup
```

### Nginx 反向代理配置参考
```nginx
server {
    listen 80;
    server_name yourdomain.com; # 替换为你的备案域名

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 💡 提示与说明
- 首次部署上线后，请立即登录后台（`/admin`）进入「安全设置」修改默认密码 `admin123`。
- 上传的图片存放在 `uploads/` 目录，建议定期备份 `data/` 和 `uploads/` 目录。
