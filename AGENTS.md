# AGENTS.md — 血龙狂舞：铁王座之争

> 基于乔治·R·R·马丁《冰与火之歌·血龙狂舞》时期的文字冒险视觉小说  
> **buaa · 葳蕤 · 出品**

---

## 一、项目目标

开发一款 **单人完成** 的 Web 端文字冒险视觉小说，聚焦坦格利安内战「血龙狂舞」时期。玩家通过 3 种身份进入维斯特洛的权力漩涡，经历 6 个剧情点，导向 4 种主结局（含权力代理与感情线变体）。

**核心体验**：分支叙事 + ASCII 艺术 + AI 绘画增强层 + 逐字打印沉浸感

**发布形态**：单页 Web 应用，浏览器直接运行，零依赖部署

---

## 二、技术栈

| 层 | 技术 | 备注 |
|----|------|------|
| 前端 | HTML5 + CSS3 + Vanilla JS | 零框架，零运行时依赖 |
| 剧本数据 | JSON | 单一数据文件驱动全部剧情 |
| 存档 | localStorage | 浏览器本地持久化 |
| ASCII 艺术 | 等宽字体 CSS + JS 模板字符串 | 龙/城堡/铁王座/阵营徽章 |
| AI 绘画增强 | Node.js 生成脚本 → Replicate / 硅基流动 API | 开发阶段预生成，运行时本地加载 |
| 版本控制 | Git | — |

---

## 三、文件结构

```
dance-of-dragons/
├── AGENTS.md                   # 项目规划文档（本文件）
├── index.html                  # 入口页面，挂载游戏根节点
├── css/
│   ├── main.css                # 全局样式 + 阵营主题配色（绿/黑/血红/铁灰）
│   └── ascii.css               # ASCII 艺术等宽字体样式
├── js/
│   ├── main.js                 # 游戏主控制器：初始化、启动、读取存档
│   ├── engine.js               # 剧本引擎：场景推进、选择分发、flag 管理、结局判定
│   ├── renderer.js             # 渲染模块：打字机效果、ASCII/图片渲染、UI 更新
│   ├── state.js                # 全局状态管理：gameState getter/setter + localStorage 读写
│   └── ascii-art.js            # ASCII 艺术资源库：所有画稿以字符串模板存储
├── data/
│   └── script.json             # 完整剧本数据（identities + scenes + endings + flags）
├── assets/
│   └── images/                 # AI 绘画产出目录（运行时按需加载，回退到 ASCII）
│       ├── bg_dragonstone.png
│       ├── bg_kings_landing.png
│       ├── char_rhaenyra.png
│       ├── char_aegon.png
│       ├── cg_dragon_seed.png
│       ├── cg_dragon_duel.png
│       └── cg_iron_throne.png
└── scripts/
    └── generate_images.js      # Node.js 脚本：调用 AI API 批量生成场景图
```

---

## 四、游戏叙事设计

### 4.1 三种开局身份

| ID | 身份 | 初始立场 | 背景 | 特色路径 |
|----|------|----------|------|----------|
| `dragon_seed` | 龙种私生子 | 中立 | 龙石岛坦格利安散落血脉，居龙山 | 唯一可驯龙 → 合法化 → 👑铁王座 |
| `kingsguard` | 御林铁卫骑士 | 绿党 | 效忠铁王座，见证宫廷密谋 | 叛誓/死忠 → 权力代理→实质摄政 |
| `noble_lord` | 贵族领主 | 中立 | 暮谷城/鸦栖城小领主，有封地与军队 | 合纵连横 → 国王之手/女王之手 |

### 4.2 六个剧情点

| # | 名称 | 原著事件 | 核心选择 |
|----|------|----------|----------|
| P1 | 序幕·龙王之死 | 韦赛里斯一世驾崩，绿党秘不发丧 | 相信绿党消息 / 相信黑党消息 / 观望 |
| P2 | 风暴聚集·双王加冕 | 伊耿二世君临加冕 vs 雷妮拉龙石岛加冕 | 效忠伊耿二世(绿) / 效忠雷妮拉(黑) / 保持中立 |
| P3 | 鸦栖城之血 | 鸦栖城之战，雷妮丝与阳炎战死 | 正面迎战 / 迂回奇袭 / 拒不出战 |
| P4 | 龙种播种 | 黑党征召私生子驯龙（原著龙种计划） | 响应征召驯龙 / 拒绝 / 劝他人去 |
| P5 | 君临陷落 | 雷妮拉攻陷君临，国库空虚 | 开城迎王师 / 死守 / 趁乱夺权 |
| P6 | 终局·铁王座前的抉择 | 龙穴暴动，伊耿二世归来 | 最终抉择 → 导向结局 |

### 4.3 四种主结局

#### 结局一：🟢 绿党胜利 — `ending_green_victory`
- **条件**：效忠绿党 + 存活
- **子变体**：
  - *标准*：战后获封赏，绿龙旗飘扬
  - *权力代理（骑士）*：晋升御林铁卫队长，实质摄政
  - *权力代理（领主）*：出任国王之手
  - *感情线*：与海伦娜·坦格利安 / 某海塔尔家族成员联姻

#### 结局二：⚫ 黑党胜利 — `ending_black_victory`
- **条件**：效忠黑党 + 雷妮拉存活
- **子变体**：
  - *标准*：战后获封赏，红龙旗飘扬
  - *权力代理（骑士）*：女王护卫队长
  - *权力代理（领主）*：女王之手
  - *感情线*：与雷妮拉 / 某瓦列利安家族成员结缘

#### 结局三：👑 铁王座 — `ending_iron_throne`
- **条件**：**仅龙种身份** → 走黑党线 → P4 合法化 → 驯龙成功 → P6 宣布自立
- **专属标语**："血火同源，新王登临"

#### 结局四：💀 死亡 — `ending_death`
- **触发条件**：
  1. 龙焰焚身（P3/P4/P5 关键战役战败）
  2. 背叛处决（阵营叛变被识破）
  3. 沙场战死（纯战斗判定失败）
  4. 暗杀毒亡（宫廷线选错盟友）

### 4.4 龙种专属路径：通往铁王座

```
龙种私生子开局 (龙山)
  │
  P1 序幕 ── 选择「观望」
  │
  P2 双王加冕 ── 选择「效忠雷妮拉(黑党)」
  │
  P3 鸦栖城 ── 存活
  │
  P4 龙种播种 ── 响应征召 → 驯服野龙「灰影」
  │                 ↑ 此时雷妮拉合法化私生子身份
  P5 君临陷落 ── 趁乱夺权 / 笼络人心
  │
  P6 终局抉择 ── 宣布自立
  │
  👑 铁王座结局
```

### 4.5 感情线标记

通过剧情选择累积隐式好感度，在结局文本中影响 epilogue 内容：

| 阵营 | 角色 | flag 键 | 触发场景 |
|------|------|---------|----------|
| 绿党 | 海伦娜公主 | `helaena_affection` | P3/P5 互动选项 |
| 黑党 | 雷妮拉女王 | `rhaenyra_affection` | P2/P4/P5 互动选项 |
| 绿党 | 海塔尔家族 | `hightower_affection` | P2/P3 |
| 黑党 | 瓦列利安家族 | `velaryon_affection` | P2/P4 |

---

## 五、剧本数据结构

### 5.1 顶层结构

```json
{
  "meta": { "title": "血龙狂舞 - 铁王座之争", "version": "1.0.0", "author": "buaa · 葳蕤" },
  "identities": [],
  "scenes": {},
  "endings": {},
  "flags": {}
}
```

### 5.2 身份定义

```json
{
  "id": "dragon_seed",
  "name": "龙种私生子",
  "tagline": "龙石岛的坦格利安散落血脉",
  "description": "你是散落在龙石岛的坦格利安私生血脉...",
  "starting_scene": "prologue_dragon_seed",
  "allowed_endings": ["green", "black", "iron_throne", "death"],
  "traits": { "can_tame_dragon": true, "legitimacy": false }
}
```

### 5.3 场景节点

```json
{
  "prologue_dragon_seed": {
    "id": "prologue_dragon_seed",
    "title": "序幕 · 龙王之死",
    "image": "assets/images/bg_dragonstone.png",
    "fallback_ascii": "dragonstone_castle",
    "narrative": [
      "韦赛里斯一世驾崩的消息如野火般传遍七国...",
      "你站在龙山之巅，望着远方龙石岛的烽烟..."
    ],
    "choices": [
      {
        "text": "前往君临，探明真相",
        "next_scene": "kings_landing_green",
        "set_flag": { "leaning": "green" },
        "condition": null
      },
      {
        "text": "航向龙石岛，面见雷妮拉公主",
        "next_scene": "dragonstone_black",
        "set_flag": { "leaning": "black" },
        "condition": null
      },
      {
        "text": "深入龙山，寻找野龙",
        "next_scene": "dragon_mount",
        "set_flag": { "leaning": "neutral" },
        "condition": null
      }
    ]
  }
}
```

### 5.4 结局定义

```json
{
  "ending_iron_throne": {
    "id": "ending_iron_throne",
    "title": "铁王座 — 血火同源",
    "image": "assets/images/cg_iron_throne.png",
    "fallback_ascii": "iron_throne_cg",
    "conditions": {
      "identity": "dragon_seed",
      "faction": "black",
      "legitimized": true,
      "tamed_dragon": true,
      "declared_self": true
    },
    "epilogue": {
      "standard": "你坐在铁王座上，龙焰为你加冕...",
      "variant_key": null
    }
  }
}
```

### 5.5 Flag 管理

```json
{
  "flags": {
    "identity": "dragon_seed",
    "name": "戴伦·坦格利安",
    "leaning": null,
    "faction": null,
    "legitimized": false,
    "tamed_dragon": false,
    "survived": true,
    "helaena_affection": 0,
    "rhaenyra_affection": 0,
    "hightower_affection": 0,
    "velaryon_affection": 0,
    "alliance": [],
    "betrayal_count": 0,
    "battles_won": 0,
    "scene_history": []
  }
}
```

---

## 六、AI 绘画生成脚本设计

### 6.1 工具链

- **运行时**：Node.js >= 18
- **API 提供商**：Replicate（推荐）或 硅基流动
- **模型**：Stable Diffusion XL / Flux.1-dev
- **Prompt 模板**：中译英 + 风格约束

### 6.2 脚本工作流 (`scripts/generate_images.js`)

```
读取 data/script.json → 提取所有 scene.image 字段
                        ↓
                   构建英文 Prompt（风格：dark fantasy, oil painting, George R.R. Martin aesthetic）
                        ↓
                   调用 Replicate API 生成
                        ↓
                   下载并覆盖到 assets/images/
                        ↓
                   输出生成报告
```

### 6.3 Prompt 模板示例

```js
const promptTemplates = {
  bg_dragonstone: "Dark fantasy oil painting, Dragonstone castle on volcanic island, stormy sky, smoking mountain, gothic architecture, George R.R. Martin aesthetic, moody atmosphere, 16:9",
  cg_iron_throne: "The Iron Throne of Westeros, forged from a thousand swords, looming over a dark hall lit by dragonfire, dramatic shadows, epic scale, dark fantasy art style",
  cg_dragon_duel: "Two dragons battling in the sky above a medieval castle, fire and blood, sunset backdrop, epic fantasy battle, dramatic composition"
};
```

---

## 七、开发里程碑

### M1 · 骨架搭建
**目标**：项目结构 + 剧本引擎核心可跑通

| 任务 | 产出 |
|------|------|
| 初始化项目目录结构 | 全部文件夹和空文件就位 |
| 实现 `state.js` | gameState 对象 + flag 读写 + localStorage 存读档 |
| 实现 `engine.js` | 场景加载、选择分发、next_scene 跳转、条件判断 |
| 实现 `main.js` | 初始化 → 身份选择 → 启动游戏循环 |
| 编写 `script.json` 骨架 | 3 个身份 + P1~P2 共 ~8 个场景节点 |
| 编写 `index.html` 基础结构 | 游戏根节点 DOM 挂载 |

**验收标准**：身份选择 → P1 → 选择 → P2 → 分支可走通（console 输出即可，无需 UI）

---

### M2 · 渲染与视觉
**目标**：UI 层完成，游戏可玩

| 任务 | 产出 |
|------|------|
| 实现 `renderer.js` — 打字机效果 | 逐字符打印叙事文本 |
| 实现 `renderer.js` — 选择面板 | 选项按钮渲染，click → engine |
| 实现 `renderer.js` — ASCII 渲染 | 读取 fallback_ascii 键 → `ascii-art.js` |
| 实现 `renderer.js` — 图片加载 | `<img>` 加载，失败回退 ASCII |
| 编写 `ascii-art.js` | 龙、城堡、铁王座、阵营徽章等 10+ 画稿 |
| 编写 `main.css` | 阵营主题配色 + 全局布局 |
| 编写 `ascii.css` | 等宽字体 + ASCII 艺术容器样式 |
| 横幅水印 | 启动画面：「buaa · 葳蕤 · 出品」 |

**验收标准**：P1→P2→P3 可完整游玩，有打字机效果和 ASCII 插图

---

### M3 · 剧本填充
**目标**：完整剧本数据，全路径可通

| 任务 | 产出 |
|------|------|
| P1~P6 全部场景节点 | ~30-40 个场景，覆盖 3 身份全分支 |
| 4 种结局及其子变体 | 结局条件 + epilogue 文本完整 |
| 感情线 flag 触发 | 好感度增减逻辑写入场景 choice |
| 龙种专属路径 | P4 驯龙 → P5 夺权 → P6 自立 通路 |
| 结局判定逻辑 (`engine.js` 增强) | endGame() 方法根据 flags 判定结局 |

**验收标准**：3 身份 × 全部可达结局，每条路径可完整通关

---

### M4 · 存档打磨 + AI 图片
**目标**：可发布 v1.0

| 任务 | 产出 |
|------|------|
| 存档/读档 UI | 存读档面板，显示进度摘要 |
| 回退功能 | 返回上一场景（scene_history 弹栈） |
| AI 生成脚本 | `scripts/generate_images.js` 完成并测试 |
| 图片回退逻辑测试 | 断网 / 图片缺失时自动回退 ASCII |
| 全路径测试 | 枚举所有分支，确保无死节点、无闪退 |
| 移动端适配 | 响应式布局基础支持 |
| 部署说明 | 静态文件托管（GitHub Pages / Vercel） |

**验收标准**：完整可玩、存档正常、可部署公网访问

---

### M5 · 增强扩展（可选 v1.1+）
- 更多分支场景与隐藏结局
- BGM 背景音乐（`<audio>` 标签，公共领域/自制）
- 成就系统
- 更多 AI 插画（角色立绘、CG 事件图）
- 英文版本翻译

---

## 八、水印规范

**文字水印**：

```
buaa · 葳蕤 · 出品
```

**位置**：
- 片头启动画面（居中，ASCII 等宽字体）
- HUD 栏底部（小字）

**阵营适配**：
- 绿党背景 → 墨绿底白字
- 黑党背景 → 暗红底黑字
- 铁王座结局 → 铁灰底金纹
- 死亡结局 → 血红底黑字

---

## 九、核心流程图

```
┌──────────────┐
│  启动画面     │  ← water: buaa · 葳蕤 · 出品
│  身份选择     │
└──────┬───────┘
       │
  ┌────┼────┐
  ▼    ▼    ▼
龙种  骑士  领主
  │    │    │
  └────┼────┘
       ▼
  ┌─────────┐
  │  P1 序幕 │
  └────┬────┘
       ▼
  ┌──────────────┐
  │  P2 双王加冕  │  ← 阵营选择关键点
  └──┬──────┬────┘
     ▼      ▼
   绿党   黑党(龙种唯一合法化路径)
     │      │
     ▼      ▼
  ┌──────────────┐
  │  P3 鸦栖城   │
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ P4 龙种播种   │  ← 龙种专属驯龙节点
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ P5 君临陷落   │
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ P6 终局抉择   │
  └──┬──┬──┬──┬──┘
     ▼  ▼  ▼  ▼
    🟢 ⚫ 👑 💀
```
