# World Cup 2026 投注收益台账

一个静态前端 + Node/Vercel API 的世界杯投注记录页面。

## 功能

- 只展示 2026 世界杯场次。
- 通过 `/api/worldcup/matches` 获取完整赛程，并合并已开放的中国体彩赔率。
- 支持每场独立选择胜平负、让球胜平负、比分，多场组合成购买方案。
- 投注方案和结算结果保存在浏览器本地。

## 本地运行

```powershell
npm run dev
```

打开：

```text
http://127.0.0.1:8124/
```

本地服务由 `server.js` 提供，负责静态页面和 `/api/worldcup/matches` 接口。

## 数据来源

- `worldcup_matches_cache.json`：完整世界杯赛程底表。
- sporttery 官方计算器接口：用于合并已开放的体彩赔率。
- `FOOTBALL_DATA_API_KEY`：可选，仅作为更新世界杯赛程的备用接口。

## 部署到 GitHub + Vercel

1. 推送代码到 GitHub。
2. 在 Vercel 导入仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 留空，Output Directory 留空。
5. 可选环境变量：

```text
FOOTBALL_DATA_API_KEY=你的 Football-Data API Key
```

## 文件说明

- `index.html` / `styles.css` / `app.js`：前端页面。
- `api/worldcup/matches.js`：Vercel API，同时被本地 Node 服务复用。
- `server.js`：本地开发服务。
- `worldcup_matches_cache.json`：完整世界杯赛程缓存。
