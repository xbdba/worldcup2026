# World Cup 2026 投注收益台账

一个静态前端 + Vercel API 的世界杯投注记录页面。

## 数据来源

- 页面通过 `/api/worldcup/matches` 获取 2026 世界杯赛程与赔率。
- API 优先读取 sporttery 官方计算器接口，并只保留世界杯场次。
- 页面支持胜平负、让球胜平负、比分赔率点选录入；投注金额和结算结果仍保存在浏览器本地。

## 本地运行

```powershell
python -B server.py --host 127.0.0.1 --port 8124
```

打开：

```text
http://127.0.0.1:8124/
```

本地服务会优先读取 sporttery 官方赔率。下面这个配置只作为 Football-Data 备用赛程源使用：

```text
C:\Users\Administrator\.codex\skills\soccer-lottery\config.yaml
```

## 部署到 GitHub + Vercel

1. 在 GitHub 创建一个仓库，把本目录提交并推送上去。
2. 在 Vercel 选择 `Add New Project`，导入这个 GitHub 仓库。
3. Framework Preset 选择 `Other`，Build Command 留空，Output Directory 留空。
4. Vercel 可直接部署。`FOOTBALL_DATA_API_KEY` 仅作为 sporttery 临时不可用时的备用赛程源：

```text
FOOTBALL_DATA_API_KEY=你的 Football-Data API Key
```

5. 点击 Deploy。之后每次 push 到 GitHub，Vercel 会自动重新部署。

## 文件说明

- `index.html` / `styles.css` / `app.js`：前端页面。
- `api/worldcup/matches.js`：Vercel 云端 API，优先转发 sporttery 官方赔率。
- `server.py`：本地开发服务。
- `worldcup_matches_cache.json`：本地缓存的世界杯赛程备用数据。
