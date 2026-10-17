# 围城大作战 · SIEGE.IO

一个纯前端、单文件运行的「轨迹圈地」小游戏。地图上四名玩家（你 + 3 个 AI）各操控一个方块，
带着半透明轨迹出门，绕一圈回到自己的地盘，轨迹与地盘围出的区域就全部归你——包括圈在里面的敌人地盘。
头部碰到别人的轨迹会让对方当场阵亡，正面相撞则同归于尽。限时结束时，地盘面积最大者获胜。

> 直接双击 **`index.html`** 即可游玩，无需安装、无需服务器、无需联网。建议 Chrome / Edge 全屏（F11）体验。

---

## 操作

| 按键 | 作用 |
| --- | --- |
| `W` `A` `S` `D` / 方向键 | 上下左右移动（方块会持续前进） |
| 按住 `空格` | 消耗能量加速，无冷却、无能量门槛 |
| `P` / `Esc` | 暂停 / 继续 |
| `M` | 静音开关 |
| `Enter` | 主菜单开始比赛 / 结算界面再来一局 |

菜单里可选 **3 / 4 / 5 分钟** 与 **简单 / 普通 / 困难**，设置会被记住。

---

## 规则细节

- **圈地**：离开自己的地盘后开始留下轨迹；回到任意一块自己的地盘时，轨迹 + 地盘围出的封闭区域全部变成你的地。
  被围在里面的敌方地盘也会被你抢走，这是翻盘的主要手段。
- **切断**：任何玩家的头部碰到你的轨迹，**你**死亡（切轨迹的人安全）。头部正面相撞，双方死亡。
- **复活**：死亡 3.2 秒后在自己地盘内复活；能量清零，地盘保留。如果地盘被别人全部夺走，会获得一块新的初始地盘。
- **能量**：0–100 线性回复/消耗（回复 21/秒，加速消耗 29/秒）；按住空格时速度变为 1.55 倍，能量耗尽需要回复一点才能再次点火，没有冷却、也没有启动门槛。
- **边界收束**：如果轨迹把自己的所有地图边界格全部封死（例如贴边绕整圈），这次圈地会判定失败——防止一局游戏被一个 60 秒的退化策略直接结束。
- **排名**：先按地盘面积，再按击杀数排序；倒计时结束后结算。
- **地图**：140 × 140 格，四角出生，初始地盘 11 × 11 格。地图大小与速度按「3 分钟能频繁遭遇但不至于出生即贴脸」调过。

---

## 玩法建议

1. **大圈收益高，但轨迹长、容易被切**。看到别人的头部靠近你的轨迹时，界面会闪红并提示，立刻按加速回家。
2. **起点在四角**，前期沿地图边缘绕大圈效率最高，但要提防贴边摸过来的 AI；把地图边界整个封死的一圈会被判失败。
3. **AI 的轨迹是单向的**：你碰到它，死的是它。看到远处 AI 拉出长轨迹，可以加速过去切断，还能拿 +16 能量。
4. **能量别一直满着**：回程或抢地时加速，收益通常比省着不用高；但把能量一次烧空，遇到危险时就没有爆发力了。
5. **终局前 30 秒**：与其冒险开大圈，不如把已经围到的地守住；也可以用一个大圈把对手的地盘整个圈走。

---

## 项目结构

```
围城大作战/
├─ index.html            # 构建产物：单文件游戏（交付物，直接打开）
├─ build.mjs             # 把 src/ 内联进 index.html
├─ src/
│  ├─ engine.js          # 纯逻辑模拟核心（无 DOM，可在 Node 中运行/测试）
│  ├─ ui.js              # Canvas 渲染、HUD、菜单、音效、输入、状态机
│  ├─ style.css          # 界面样式
│  └─ template.html      # HTML 模板
├─ tests/
│  └─ engine.test.cjs    # 引擎单元测试（Node 直接运行）
├─ tools/
│  └─ cdp-test.mjs       # Chrome DevTools Protocol 端到端测试脚本
├─ screenshots/          # 预览截图（主菜单 / 对局 / 结算 / 窄屏）
└─ README.md
```

### 重新构建

```bash
node build.mjs
```

### 运行引擎测试

```bash
node tests/engine.test.cjs
```

覆盖：初始地盘、移动与轨迹、圈地洪水填充（含夺取敌地/不越界）、切轨迹死亡、相撞、能量线性增减与加速、死亡复活、地盘清空重开、排行榜一致性、玩家威胁提示、边界封死防退化、多 seed 全 AI 对局不变量与 AI 卡死回归。

### 端到端测试（可选，需要本机 Chrome 允许无头启动）

```bash
node tools/cdp-test.mjs <file-index.html 的绝对 URL> shots
```

用 CDP 驱动真实浏览器完成：开始比赛 → 倒计时 → 键盘移动并圈地 → 加速/能量 → 死亡复活 → 暂停 → 结算 → 重开/返回菜单，并检查页面无 JS 报错。

---

## 可调参数

绝大多数手感参数在 `src/engine.js` 顶部：

| 常量 | 当前值 | 含义 |
| --- | --- | --- |
| `GRID` | 140 | 地图边长（格） |
| `CELL` | 10 | 每格世界尺寸 |
| `RULES.baseSize` | 11 | 初始地盘边长（格） |
| `RULES.baseSpeed` | 92 | 基础速度（世界单位/秒，≈9.2 格/秒） |
| `RULES.boostMul` | 1.55 | 加速时的速度倍率 |
| `RULES.energyRegen` / `energyDrain` | 21 / 29 | 每秒线性回复 / 加速消耗 |
| `RULES.respawnTime` | 3.2 | 死亡复活等待（秒） |
| `RULES.bodyHit` | 0.84 | 头部碰撞判定（格） |
| `DIFFICULTY` | easy/normal/hard | AI 扩张距离、切轨迹概率、加速阈值 |

`SPAWNS` 为四名玩家的出生格坐标，`PLAYER_DEFS` 为颜色与名字。

---

## 实现要点

- **圈地判定**：以「自己的地盘 + 自己的 pending 轨迹」为墙，从地图四边做洪水填充；所有不可达的格子即为被围区域，一次性划给自己（可覆盖敌方地盘）。算法简单、无自交/贴边漏格问题。若边界种子全部被自己封死（贴边绕整圈），本次圈地判失败，避免一次吞掉全图。
- **碰撞**：头部进入格子的瞬间记录 pending 归属，每帧统一结算「谁的头在谁的轨迹上」，避免同帧处理顺序偏差；正面相撞按双方中心距离判定，同时死亡。
- **AI**：状态机（扩张 → 折返 → 回家 / 切轨迹），扩张目标按「开阔度 + 远离自家重心」打分；回家路径会绕开自己的轨迹（避免只圈出 1 格宽的细长走廊）；发现敌人靠近自己轨迹会立刻折返并加速，发现敌人拉着超长轨迹时会扩大追杀范围。带有「目标已变成自家地」「连续无进展」两类看门狗，长时间卡死会在 2 秒内重规划。
- **渲染**：地盘用四张 140×140 的离屏 ImageData 重建 + drawImage 放大；轨迹同时用 pending 格铺底与三段描边发光，保证「看得见的轨迹」覆盖「真正致命的格子」；头部/粒子/结算均有动效；HUD 使用 DOM + CSS，保证文字清晰。
- **性能**：在无头 Chrome 1418×746 下实测约 61 FPS；拖影/圈地闪光/粒子上限均有控制。
- **自动验证**：引擎单测 14 项；CDP 端到端 36 项（真实浏览器键盘操作、圈地、能量、死亡复活、暂停、结算、重开/回菜单、无 JS 报错）；额外 70+ 局离线 AI 对局扫描，AI 停摆 0 次、无 NaN/越界/记账错误。

---

## 已知限制

- 仅支持键盘，没有做移动端触屏摇杆（手机打开会提示「建议使用电脑键盘游玩」）。
- 首次点击/按键后才会初始化 WebAudio；静音设置存在 localStorage（个别浏览器 `file://` 下可能不可用，不影响游戏）。
- 结算界面的统计为「本局地盘占比 / 击杀 / 阵亡」，没有做历史战绩。

---

## 部署成网页版（GitHub Pages）

`index.html` 是完整的单文件游戏，放到任意静态托管都能直接运行。GitHub Pages 免费、够用：

### 方式 A：网页上传（不装 Git，最快）

1. 登录 GitHub → 右上角 `+` → **New repository**。
2. Repository name 填 `siege-io`（建议英文）；选 **Public**；创建时**不要勾选** Add a README / .gitignore / license；点 **Create repository**。
3. 在新仓库页点 **uploading an existing file**，把 `index.html` 拖进去（想公开源码就把 `README.md`、`src/`、`tests/`、`tools/`、`screenshots/` 一起拖；文件夹可以直接拖拽上传），点 **Commit changes**。
4. 进入仓库 **Settings → Pages → Build and deployment**：
   - Source 选 **Deploy from a branch**
   - Branch 选 `main`，目录选 `/ (root)`，点 **Save**
5. 等 1–2 分钟，访问 **`https://<你的用户名>.github.io/<仓库名>/`**。

> 免费账号的 GitHub Pages 只能部署 **Public** 仓库；Private 仓库需要 GitHub Pro / Team / Enterprise。

### 方式 B：Git 命令行（推荐，后续更新方便）

本机已装 Git（2.46）。在 `围城大作战` 目录打开 PowerShell：

```powershell
# 首次使用 Git 需要配置身份（换成你自己的）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

git init -b main
git add .
git commit -m "feat: 围城大作战"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

首次 `push` 会弹 GitHub 登录窗口，用浏览器授权即可；也可以在 GitHub → Settings → Developer settings 生成 Personal Access Token，用它当密码。

推送成功后，按「方式 A」第 4 步开启 Pages。以后每次更新：

```powershell
git add .
git commit -m "update"
git push
```

Pages 会在 1–2 分钟内自动重新构建。

### 常见问题

- **404**：确认 Settings → Pages 已经 Save、分支和目录正确，并等 1–2 分钟；访问地址末尾要有 `/`。
- **仓库名建议用英文**，否则 Pages 网址里会出现 `%E5%9B%B4...` 这种编码，虽然能用但不好看。
- **push 被拒绝**：如果创建仓库时勾了 README，先 `git pull --rebase origin main`，再 `git push -u origin main`。
- **打开还是旧版本**：按 `Ctrl + F5` 强制刷新（Pages 有缓存）。
- **想让网址更短**：把仓库命名为 `<你的用户名>.github.io`，网址就是 `https://<你的用户名>.github.io/`。
- 本项目没有任何外部依赖，不需要 npm / 构建步骤；`index.html` 本体即可运行。`src/` 只是源码，改完后跑 `node build.mjs` 重新生成 `index.html` 再提交。

### 不想用 GitHub？

Netlify Drop、Cloudflare Pages、Vercel 都支持把 `index.html` 直接拖进去，几十秒出网址。国内访问 GitHub Pages 有时不稳定，Cloudflare Pages 通常更快。

---

## 目录里已准备好的部署文件

- `.nojekyll`：让 GitHub Pages 跳过 Jekyll，直接按静态文件发布。
- `.gitignore`：忽略 Windows/macOS 杂物与编辑器目录。
