下面是第一版**《胰腺肿瘤 OSINT War Room 项目设计文档 V0.1》**。我把它定位成：**不是“新闻聚合器”，而是面向胰腺肿瘤患者、家属、医生伙伴和社区运营者的“全球治疗情报驾驶舱”**。

---

# 胰腺肿瘤 OSINT War Room 项目设计文档 V0.1

## 1. 项目定位

### 项目名称建议

可以先叫：

**Pancreas Intel War Room / 小胰宝全球胰腺肿瘤情报室**

中文表达可以更患者友好：

**小胰宝·全球胰腺肿瘤治疗情报室**

核心不是“战争”，而是把“战场态势”转译为医疗场景：

| War Room 概念 | 胰腺肿瘤场景转译                     |
| ----------- | ---------------------------- |
| 战场地图        | 全球胰腺肿瘤诊疗生态地图                 |
| 热点冲突        | 临床突破、会议数据、指南变化、治疗事故、药物进展     |
| 部队调动        | 医院科室、专家团队、药企研发、试验中心活跃度       |
| 情报源         | 指南、会议、论文、临床试验、官网、公众号、视频、患者社区 |
| 战损/风险       | 不良事件、治疗失败、假信息、夸大宣传、过度治疗风险    |
| 战果          | ORR、DCR、PFS、OS、生存期提升、可及性提升   |

项目最终目标：

> 让患者和社区每天登陆后，像看“全球医疗作战态势图”一样，快速知道：
> **哪里有新进展，哪些方案值得关注，哪些风险正在出现，哪些医生/中心/药物/会议正在形成趋势。**

---

## 2. 对标项目分析

你给的几个参考方向是对的，可以分成三类学习。

### 2.1 Polyglobe / PizzINT

Polyglobe 的核心是把 Polymarket 的地缘事件预测市场数据映射到 3D 地球上，形成实时 OSINT 市场追踪界面；它强调的是**“实时数据 + 地图 + 市场情绪”**。([PizzINT - Pentagon Pizza Index][1])

对我们有用的点：

* 用地图承载全球事件。
* 把“热度”视觉化。
* 用市场/事件信号做态势判断。
* 适合做“全球临床突破热区”。

不适合直接照搬的点：

* 胰腺肿瘤不是金融预测市场，不能只做情绪热度。
* 医疗需要证据等级、来源可靠性、患者适用性分层。

### 2.2 QueWi War Room

QueWi War Room 宣称使用多模型进行 OSINT 分析，每 6 小时自动追踪并生成战情分析，重点是**自动化、多模型、周期性报告、战情推演**。([QueWi][2])

对我们有用的点：

* 每 6 小时 / 每日自动生成 briefing。
* 多模型交叉分析，减少单模型偏差。
* 适合形成“今日胰腺癌治疗情报简报”。

需要改造的点：

* 医疗不能做军事式“推演结论”直接指导治疗。
* 应改成“证据分级 + 适用场景 + 需医生评估”。

### 2.3 WorldWideView

WorldWideView 是一个面向实时地理情报的平台，强调 CesiumJS 3D 地球、插件化、追踪飞机/船只/信号等全球事件。([WorldWideView][3])

对我们有用的点：

* 3D 地球 / 全球视图。
* 插件化数据源。
* 可扩展到不同地区、会议、医院、试验中心。

对应改造：

* 飞机/船只/信号 → 医院、专家、临床试验、指南、药企、会议、患者舆情。
* 地缘热点 → 医疗创新热点。
* 事件流 → 临床证据流。

### 2.4 Digital War Room / World Monitor

Digital War Room 的描述很接近你的目标：它把碎片化 OSINT 信号融合为一个态势图，输出 escalation score、theater context、BLUF-style briefings，而且强调方法和来源可检查。([GitHub][4])
World Monitor 类项目则偏“AI 新闻聚合 + 地缘监控 + 基础设施追踪”的统一态势界面。([GitHub][5])

对我们最关键的启发：

> 医疗 OSINT 项目最重要的不是“酷”，而是：
> **每一个结论都能回溯来源、证据等级、时间、地域、适用人群。**

---

## 3. 产品核心定义

### 一句话定义

**一个自动监控全球胰腺肿瘤诊疗进展、临床试验、指南更新、药物突破、医生/中心活跃度、患者舆情和治疗风险的多智能体情报平台。**

### 用户角色

| 用户         | 核心需求                          |
| ---------- | ----------------------------- |
| 患者/家属      | 看懂新方案、新药、新试验、风险提示，知道是否值得和医生讨论 |
| 社区运营者      | 每日发现高价值信息，生成公众号、小红书、群内简报      |
| 医生伙伴       | 快速看到会议/指南/研究更新，减少信息过载         |
| 研究志愿者      | 协助标注、核查、翻译、结构化信息              |
| 药物/临床研究关注者 | 跟踪药物管线、试验进度、数据读出              |

---

## 4. 信息源体系设计

### 4.1 第一层：权威指南与学会

这是最高优先级。

| 地区 | 来源                      | 监控内容                                |
| -- | ----------------------- | ----------------------------------- |
| 美国 | NCCN                    | 胰腺癌指南版本更新、治疗路径变化、分子检测建议             |
| 美国 | ASCO                    | 年会摘要、GI 会议、临床指南、Post 报道             |
| 美国 | AACR                    | 胰腺癌专题会议、基础研究、转化医学、新靶点               |
| 欧洲 | ESMO                    | 指南、Pan-Asian adapted guideline、会议摘要 |
| 中国 | CSCO                    | 胰腺癌指南、年会摘要、专家共识                     |
| 中国 | CACA                    | 整合诊治指南、共识、会议报告                      |
| 日本 | JSMO / JSGE / JSCO      | 日本胰腺癌指南、临床试验、外科/内镜相关进展              |
| 澳洲 | Cancer Australia / eviQ | 治疗建议、用药方案、患者信息                      |

ESMO 2025 胰腺癌指南更新明确聚焦转移性胰腺癌管理，包含一线 NALIRIFOX 获批后的推荐更新和治疗算法变化，这类内容非常适合做“指南雷达”。([欧洲肿瘤学会][6])
NCCN 胰腺癌指南本身覆盖诊断、评估、治疗和随访，是结构化治疗路径库的重要来源。([PubMed][7])

### 4.2 第二层：临床试验与注册数据库

| 来源                                 | 价值                  |
| ---------------------------------- | ------------------- |
| ClinicalTrials.gov                 | 全球最大临床试验注册与结果信息来源之一 |
| EU Clinical Trials Register / CTIS | 欧洲试验                |
| jRCT / JapicCTI                    | 日本试验                |
| ChiCTR                             | 中国临床试验注册            |
| WHO ICTRP                          | 多国注册聚合              |
| 药企官网                               | 试验启动、入组、终止、数据读出     |
| 医院临床试验中心                           | 本地可及性               |

ClinicalTrials.gov 提供公开数据和 API，可用于程序化检索试验状态、入组条件、中心、终点和结果信息。([临床试验.gov][8])

### 4.3 第三层：会议与摘要

重点会议：

* ASCO Annual Meeting
* ASCO GI
* ESMO Congress
* ESMO GI
* AACR Annual Meeting
* AACR Pancreatic Cancer Special Conference
* CSCO
* CACA
* JSMO
* JSCO
* DDW / AGA / EUS / 消化内镜会议
* SSO / IHPBA / HPB 外科会议

AACR 有专门的 pancreatic cancer conference，2026 年会议页面显示主题为“New Frontiers in Biology and Therapeutic Development”，适合重点纳入。([美国癌症研究协会][9])
ASCO 摘要库可以按 GI、胰腺、肝胆胰等方向追踪会议内容。([ASCO][10])

### 4.4 第四层：论文与预印本

| 来源                                         | 用途      |
| ------------------------------------------ | ------- |
| PubMed                                     | 正式论文    |
| PMC                                        | 可读全文    |
| medRxiv / bioRxiv                          | 早期研究信号  |
| Nature / Lancet / JCO / Annals of Oncology | 高级别证据   |
| NEJM / JAMA Oncology                       | 重大临床结果  |
| Google Scholar / Crossref                  | 引文与更新追踪 |

### 4.5 第五层：中文生态

这部分是你的项目差异化核心。

| 类型             | 来源                      |
| -------------- | ----------------------- |
| 微信公众号          | 医院科室、医生个人号、学会号、药企号、患者组织 |
| 视频号 / B站 / 抖音  | 直播、科普、会议回放、专家访谈         |
| 医院官网           | 门诊、MDT、临床试验、学术会议        |
| 好大夫 / 互联网医院    | 医生热度、患者问答、口碑信号          |
| 小红书 / 知乎 / 病友群 | 患者体验、治疗事故、真实世界问题        |
| 药企中国官网         | 药物适应症、试验招募、医保、可及性       |

注意：微信公众号、视频平台和患者社区需要特别注意**平台规则、版权、隐私与个人信息保护**。建议只抓取公开页面、公开标题、摘要、链接和元数据；涉及患者个人经历时，默认脱敏，不直接展示原文隐私内容。

---

## 5. 数据分层与知识库架构

建议不要只做 RAG。应该是：

> **数据库 + 搜索引擎 + 向量库 + 图谱 + RAG + 人工校验层**

### 5.1 数据层结构

```text
Raw Layer 原始层
  - HTML / PDF / 视频字幕 / 微信文章 / 会议摘要 / 试验注册页

Parsed Layer 解析层
  - 标题、作者、机构、时间、国家、疾病、药物、靶点、方案、终点

Evidence Layer 证据层
  - 研究类型、样本量、分期、一线/后线、ORR、DCR、PFS、OS、安全性

Knowledge Layer 知识层
  - 药物卡片、方案卡片、医生卡片、医院卡片、试验卡片、指南卡片

Intelligence Layer 情报层
  - 今日简报、趋势指数、风险预警、治疗机会、患者可读解释
```

### 5.2 推荐技术组件

| 模块       | 推荐                                               |
| -------- | ------------------------------------------------ |
| 抓取调度     | Firecrawl / Playwright / Crawlee / RSSHub / 自建爬虫 |
| PDF 解析   | MinerU / Marker / PyMuPDF / GROBID               |
| OCR      | PaddleOCR / Surya OCR                            |
| 视频字幕     | Whisper / YouTube transcript / 平台字幕              |
| 数据库      | PostgreSQL                                       |
| 向量库      | pgvector / Qdrant                                |
| 搜索       | Meilisearch / Elasticsearch / OpenSearch         |
| 图谱       | Neo4j / PostgreSQL graph schema                  |
| RAG 框架   | LlamaIndex / Haystack / LangGraph                |
| Agent 编排 | LangGraph / CrewAI / AutoGen                     |
| 前端       | Next.js + Tailwind + shadcn/ui                   |
| 可视化      | ECharts + Deck.gl + CesiumJS                     |
| 后台       | FastAPI / NestJS                                 |
| 队列       | Redis Queue / Celery / Temporal                  |
| 部署       | Docker Compose 起步，后期 Kubernetes                  |

---

## 6. 多智能体系统设计

建议不要做“一个大模型全干”，而是拆成多个专职 Agent。

### 6.1 Agent 角色

| Agent                    | 职责                   |
| ------------------------ | -------------------- |
| Source Scout 信息源侦察员      | 发现新来源、新文章、新会议、新试验    |
| Ingestion Agent 采集员      | 抓取网页、PDF、字幕、图片       |
| Parser Agent 解析员         | 抽取结构化字段              |
| Evidence Agent 证据评估员     | 判断研究等级、样本量、终点、偏倚     |
| Oncology Agent 肿瘤专家代理    | 分析胰腺癌适用场景            |
| Trial Agent 临床试验代理       | 识别可入组人群、试验状态、地区      |
| Drug Agent 药物管线代理        | 跟踪靶点、药物、公司、适应症       |
| Safety Agent 风险代理        | 监控 AE、不良事件、治疗事故、监管风险 |
| Social Signal Agent 舆情代理 | 分析患者讨论、医生热度、争议       |
| Report Agent 简报代理        | 生成日报、周报、专题报告         |
| Fact-check Agent 核查代理    | 多源验证、证据冲突提示          |
| Patient Translator 患者翻译员 | 把专业内容转成患者能懂的解释       |

### 6.2 Agent 输出原则

每条情报必须有：

```text
1. 结论
2. 原始来源
3. 发布时间
4. 证据等级
5. 涉及药物/方案/靶点
6. 涉及患者分型
7. 潜在价值
8. 潜在风险
9. 是否可用于患者咨询医生
10. 不确定性说明
```

---

## 7. 核心指数体系设计

这是项目价值的关键。指数不是为了炫酷，而是为了把碎片信息变成趋势判断。

### 7.1 全球胰腺癌突破指数 PCI

**Pancreatic Cancer Breakthrough Index**

衡量某一时间窗口内，全球胰腺癌治疗突破强度。

组成：

| 维度             | 权重建议 |
| -------------- | ---- |
| III 期阳性结果      | 高    |
| OS/PFS 显著提升    | 高    |
| 指南更新           | 高    |
| 药物获批 / 突破性疗法认定 | 高    |
| II 期高质量数据      | 中    |
| 早期机制研究         | 低-中  |
| 患者可及性          | 中    |

输出：

```text
今日 PCI：72 / 100
趋势：较上周 +18%
主要驱动：NALIRIFOX 指南更新、KRAS/RAS 抑制剂数据、CLDN18.2 ADC 试验活跃
```

---

### 7.2 临床试验机会指数 CTOI

**Clinical Trial Opportunity Index**

衡量患者可能获得新治疗机会的程度。

维度：

* 新开胰腺癌试验数量
* 中国/美国/欧洲/日本/澳洲可入组中心数量
* 是否有明确分子标志物
* 是否适合后线患者
* 是否允许既往 AG / FOLFIRINOX / NALIRIFOX
* 是否覆盖腹膜转移、胆道梗阻、消化道出血等真实复杂患者
* 入组门槛友好度

---

### 7.3 药物科技突破指数 DTI

**Drug Technology Index**

按药物和靶点追踪：

| 靶点/方向          | 关注内容                                          |
| -------------- | --------------------------------------------- |
| KRAS / pan-RAS | RMC-6236、RMC-9805、RAS(ON)、RAS multi-selective |
| MEK / ERK      | next-gen MEK、dual-MEK、脉冲式抑制                   |
| SHP2 / SOS1    | 联合 KRAS / EGFR / MEK                          |
| CLDN18.2       | ADC、双抗、CAR-T                                  |
| HER2 / ERBB2   | ADC、双抗、抗体联合                                   |
| DNA 修复         | BRCA、PALB2、ATM、PARP、ATR                       |
| 免疫微环境          | CD40、CXCR4、TGFβ、CSF1R、疫苗                      |
| 放疗/局部治疗        | SBRT、粒子、Alpha DaRT、消融                         |

---

### 7.4 医生/中心热度指数 DHI

**Doctor & Hospital Influence Index**

不是简单排名，而是“学术与患者可及性雷达”。

维度：

| 维度      | 示例                |
| ------- | ----------------- |
| 学术输出    | 论文、会议发言、指南/共识参与   |
| 临床试验    | PI / Sub-I / 中心入组 |
| 患者口碑    | 公开评价、病友讨论，需脱敏     |
| 直播/科普   | 视频号、B站、公众号        |
| MDT 能力  | 外科、内科、介入、内镜、营养、心理 |
| 复杂并发症能力 | 出血、梗阻、感染、黄疸、腹水    |
| 地区可及性   | 城市、挂号难度、异地就医成本    |

注意：医生指数必须避免变成“流量榜”。建议叫：

**胰腺专科可及性与影响力指数**

---

### 7.5 治疗风险预警指数 TRI

**Treatment Risk Index**

监控：

* 药物严重 AE 报道
* 临床试验暂停/终止
* 医疗事故公开报道
* 患者群体集中反馈
* 过度宣传风险
* “神药”“治愈率夸大”内容
* 非法招募、收费试验、灰色用药

输出示例：

```text
TRI 风险等级：中
本周新增信号：
1. 某类局部治疗在患者社区出现多例严重疼痛反馈，需要核查。
2. 某药物公众号宣传明显夸大 ORR，原始研究仅 n=18。
3. 某临床试验状态由 Recruiting 改为 Suspended。
```

---

### 7.6 患者生存改善指数 PSI

**Patient Survival Improvement Index**

这个指数很有传播价值。

它回答：

> 过去 3 年，哪些新方案真正可能让患者活得更久？

维度：

* mOS 提升
* mPFS 提升
* 长尾生存
* 生活质量
* 毒性可控性
* 中国可及性
* 医保/慈善/试验可获得性
* 真实世界复杂患者适用性

---

## 8. 前端 War Room 设计

参考你上传的视觉图，建议做成**暗色科幻医疗指挥中心**，但不要太军事化。可以是：

> 医院胰腺中心 × 全球情报雷达 × 临床研究交易终端

### 8.1 首页结构

```text
左侧导航
- 总览 War Room
- 指南雷达
- 临床试验
- 药物管线
- 医生/医院热度
- 治疗风险
- 患者舆情
- 会议追踪
- 报告中心
- 信息源管理

顶部
- 时间范围
- 地区筛选：全球 / 中国 / 美国 / 欧洲 / 日本 / 澳洲
- 疾病阶段：可切除 / 边界可切除 / 局晚 / 转移 / 术后辅助 / 复发
- 分子分型：KRAS、BRCA、ATM、HER2、CLDN18.2、MSI、NTRK 等

中间
- 全球态势地图
- 今日突破指数
- 今日风险指数
- 临床试验机会指数
- 热点治疗方案

右侧
- 今日最重要 10 条情报
- 待核查情报
- 可转化为公众号/群公告/小红书内容
```

### 8.2 医疗 War Room 画面转译

| 原 War Room 视觉 | 医疗版                  |
| ------------- | -------------------- |
| 全球地图红点        | 临床试验中心、会议、医院、药物突破地   |
| 热度颜色          | 信息强度 / 证据强度 / 患者关注度  |
| 军事情报卡片        | 临床情报卡片               |
| 战区            | 美国区、欧洲区、中国区、日本区、澳洲区  |
| 升级警报          | 指南更新、试验暂停、重大 AE、药物获批 |
| 今日作战简报        | 今日胰腺肿瘤情报简报           |

---

## 9. 核心数据结构设计

### 9.1 情报事件表 Intelligence Event

```json
{
  "event_id": "evt_20260613_001",
  "title": "ESMO 更新转移性胰腺癌治疗建议",
  "source_type": "guideline",
  "source_name": "ESMO",
  "url": "...",
  "published_at": "2025-04-09",
  "region": "Europe",
  "disease": "pancreatic adenocarcinoma",
  "stage": "metastatic",
  "topic": ["guideline", "NALIRIFOX", "first-line"],
  "evidence_level": "guideline_update",
  "impact_score": 92,
  "patient_relevance": "high",
  "summary_professional": "...",
  "summary_patient": "...",
  "uncertainty": "需结合国内可及性和患者体能状态",
  "review_status": "machine_reviewed"
}
```

### 9.2 药物卡片 Drug Intelligence Card

```json
{
  "drug": "RMC-6236",
  "company": "Revolution Medicines",
  "class": "RAS(ON) multi-selective inhibitor",
  "targets": ["KRAS", "NRAS", "HRAS"],
  "disease": ["PDAC", "NSCLC", "CRC"],
  "development_stage": "Phase I/II",
  "latest_signal": "...",
  "key_data": {
    "orr": null,
    "dcr": null,
    "mpfs": null,
    "mos": null
  },
  "combination_strategies": ["SHP2", "MEK", "EGFR", "chemotherapy"],
  "risk_notes": ["耐药机制需持续追踪", "需关注毒性和适用突变谱"]
}
```

### 9.3 医生/中心卡片

```json
{
  "doctor_name": "匿名示例",
  "hospital": "某三甲医院",
  "region": "Shanghai, China",
  "specialty": ["pancreatic surgery", "medical oncology", "endoscopy"],
  "signals": {
    "publications": 12,
    "conference_talks": 3,
    "clinical_trials": 2,
    "patient_mentions": 41,
    "video_education": 5
  },
  "strength_tags": ["MDT", "复杂梗阻", "临床试验"],
  "risk_flags": [],
  "last_updated": "2026-06-13"
}
```

---

## 10. 报告输出结构

建议固定 5 类报告模板。

### 10.1 每日情报简报

```text
小胰宝全球胰腺肿瘤情报简报
日期：

一、今日最高优先级情报
1. ...
2. ...

二、临床突破
- 药物：
- 方案：
- 数据：

三、指南与共识变化
- ...

四、临床试验机会
- 中国：
- 美国：
- 欧洲：
- 日本/澳洲：

五、治疗风险与争议
- ...

六、患者可读解释
- 这件事对患者意味着什么？
- 哪类患者可以和医生讨论？
- 哪些患者暂时不适合盲目跟进？

七、证据来源
- ...
```

### 10.2 周度趋势报告

更适合公众号或社区内部：

* 本周全球胰腺癌治疗进展 Top 10
* 本周最值得关注药物
* 本周最值得关注临床试验
* 本周医生/中心活跃度
* 本周患者舆情风险
* 下周会议/数据预告

### 10.3 专题深度报告

例如：

* KRAS 抑制剂全球进展专题
* CLDN18.2 胰腺癌治疗专题
* ATM/BRCA/PALB2 DNA 修复通路专题
* HER2/ERBB2 消化道肿瘤专题
* 局晚胰腺癌局部治疗专题
* 胰腺癌出血/梗阻/感染并发症专题

### 10.4 患者咨询医生版

输出目的不是给患者自行用药，而是帮助患者问医生：

```text
我是否属于这个研究覆盖的人群？
我的分期/体能/肝肾功能是否符合？
是否需要做 NGS / HER2 / CLDN18.2 / MSI / BRCA / PALB2 / ATM？
这个方案在国内是否可及？
相比当前治疗，潜在收益和风险是什么？
有没有临床试验可考虑？
```

### 10.5 小红书/公众号转化版

自动生成：

* 小红书标题
* 3 张图卡内容
* 公众号长文结构
* 患者提醒语
* 信源列表
* 医疗免责声明

---

## 11. MVP 阶段规划

### Phase 0：信息源清单与数据模型，1-2 周

目标：

* 建立 100-300 个高价值信息源。
* 设计事件表、药物表、试验表、医生表、报告表。
* 先不追求全自动，先做“半自动 OSINT 工作台”。

产出：

* 信息源 CSV
* 数据库 schema
* 情报事件模板
* 每日简报模板
* War Room 首页原型图

---

### Phase 1：自动采集 + 每日简报，3-6 周

优先接入：

1. ClinicalTrials.gov API
2. PubMed
3. ASCO / ESMO / AACR 公开页面
4. 药企官网新闻
5. 医院官网
6. 你提供的微信公众号清单
7. 小胰宝社区手工输入信号

产出：

* 自动抓取
* 去重
* 摘要
* 证据分级
* 每日简报
* 简单仪表盘

---

### Phase 2：RAG + 多智能体分析，6-10 周

新增：

* 向量库
* 药物知识库
* 指南知识库
* 临床试验 RAG
* 多 Agent 交叉核查
* “患者可读解释”生成

产出：

* 问答系统
* 专题报告自动生成
* 可追溯引用
* 证据冲突提醒

---

### Phase 3：War Room 可视化，10-16 周

新增：

* 全球地图
* 指数系统
* 医院/医生/试验中心地图
* 药物管线雷达
* 热点事件流
* 风险预警面板

产出：

* 登录后首页
* 暗色科幻医疗驾驶舱
* 指数趋势图
* 全球态势地图

---

### Phase 4：社区协作与人工校验，长期

新增：

* 志愿者标注系统
* 医生顾问审核
* 可信来源评分
* 错误反馈机制
* 公众号/小红书一键生成
* 患者问题转医生咨询清单

---

## 12. 推荐信息源首批清单

### 12.1 国际权威

| 来源                 | 类型        |
| ------------------ | --------- |
| NCCN               | 指南        |
| ASCO               | 会议、指南、摘要  |
| ASCO Post          | 专业报道      |
| AACR               | 会议、论文、专题  |
| ESMO               | 指南、会议     |
| Annals of Oncology | 论文        |
| JCO                | 论文        |
| ClinicalTrials.gov | 临床试验      |
| NCI                | 患者/专业治疗信息 |
| FDA                | 药物审批、不良事件 |
| EMA                | 欧洲药物审批    |
| WHO ICTRP          | 临床试验聚合    |

NCI 的胰腺癌患者版 PDQ 会持续更新疾病、诊断、治疗和分期相关信息，适合作为患者友好解释的底层参考之一。([医学百科全书][11])

### 12.2 中国来源

| 来源                              | 类型          |
| ------------------------------- | ----------- |
| CSCO 官网/公众号                     | 指南、会议       |
| CACA 官网/公众号                     | 指南、共识       |
| 国家药监局 NMPA                      | 药物审批        |
| CDE 药审中心                        | 临床试验登记与审评信息 |
| 中国临床试验注册中心                      | 试验注册        |
| 复旦肿瘤、中山、瑞金、长海、华山、同济、北大肿瘤、医科院肿瘤等 | 医院动态        |
| 医生公众号/视频号                       | 科普、会议信号     |
| 药企公众号                           | 药物数据、招募信息   |

### 12.3 药企与管线

首批可以监控：

* Revolution Medicines
* Mirati / BMS
* Amgen
* Eli Lilly
* AstraZeneca
* Merck
* Roche / Genentech
* Novartis
* Daiichi Sankyo
* Hengrui / 恒瑞
* Innovent / 信达
* Kelun-Biotech / 科伦博泰
* Alphamab / 康宁杰瑞
* Alphatau
* BioNTech
* Arcus
* Verastem
* Elicio
* Astellas
* Zymeworks

---

## 13. 关键风险与边界

### 13.1 医疗合规风险

必须明确：

* 平台不是诊断工具。
* 不直接推荐患者用药。
* 所有治疗建议必须由医生结合病情判断。
* 平台提供的是公开信息整理、证据分级和患者咨询准备。

### 13.2 数据版权风险

尤其是：

* NCCN 指南全文不可随意复制传播。
* 会议摘要可能有版权限制。
* 微信文章、视频字幕不能直接大规模搬运。
* 建议存储元数据、摘要、链接、关键结构化字段，不展示大段原文。

### 13.3 隐私风险

患者社区、群聊、问答、口碑内容必须：

* 脱敏。
* 不展示患者姓名、头像、联系方式。
* 不把个案当作普遍证据。
* 风险事件需要“待核查”标签。

### 13.4 幻觉风险

多智能体输出必须强制：

* 引用来源。
* 标注不确定性。
* 区分“原始证据”“模型推断”“人工审核”。
* 高风险内容进入人工复核队列。

---

## 14. MVP 首页建议

第一版首页可以做 8 个核心卡片：

1. **今日全球胰腺癌突破指数**
2. **今日临床试验机会指数**
3. **今日治疗风险预警**
4. **本周最热药物/靶点**
5. **本周最活跃医生/中心**
6. **指南/共识更新雷达**
7. **患者舆情热点**
8. **可转化内容：公众号/小红书/群公告**

中间放一张全球地图：

* 美国：ASCO、NCCN、ClinicalTrials、FDA、药企
* 欧洲：ESMO、EMA、Annals of Oncology
* 中国：CSCO、CACA、NMPA、医院公众号
* 日本：JSMO、jRCT、药企
* 澳洲：Cancer Australia、eviQ、临床试验中心

---

## 15. 第一批真正值得做的专题

建议 MVP 不要贪多，先做 5 个“能立刻体现价值”的专题：

### 专题 1：KRAS / pan-RAS 胰腺癌治疗雷达

追踪：

* RMC-6236
* RMC-9805
* RMC-5127
* KRAS G12D / G12R / G12C
* SHP2 / SOS1 / MEK 联合
* 耐药机制

### 专题 2：DNA 修复通路患者雷达

追踪：

* BRCA1/2
* PALB2
* ATM
* PARP
* ATR
* 铂类敏感性
* 维持治疗

### 专题 3：CLDN18.2 / HER2 / ADC 胰腺癌雷达

追踪：

* CLDN18.2 ADC
* HER2 ADC
* 胃肠道跨癌种数据
* 胰腺癌亚组数据

### 专题 4：局晚/不可切除胰腺癌局部治疗雷达

追踪：

* SBRT
* IRE
* Alpha DaRT
* 粒子治疗
* 消融
* 转化手术

### 专题 5：真实世界并发症风险雷达

追踪：

* 消化道出血
* 胆道梗阻
* 肠梗阻
* 腹水
* 感染
* 门静脉高压
* 支架相关并发症

这个专题非常适合小胰宝社区，因为它比单纯“新药新闻”更贴近患者真实痛点。

---

## 16. 我建议的项目突破结构

可以按照这个逻辑推进：

```text
第一步：做信息源雷达
解决“从哪里来”的问题。

第二步：做结构化知识库
解决“是什么”的问题。

第三步：做证据分级和指数
解决“重要不重要”的问题。

第四步：做多智能体报告
解决“如何理解”的问题。

第五步：做 War Room 可视化
解决“一眼看懂态势”的问题。

第六步：做患者咨询医生清单
解决“我该怎么行动”的问题。
```

---

## 17. 最小可行版本建议

第一版不要直接做大而全。我建议你的 MVP 是：

> **每日自动生成《全球胰腺肿瘤情报简报》 + 一个暗色 War Room 首页 + 5 个指数 + 100 个核心信息源。**

MVP 功能：

* 每日自动抓取 100 个源。
* 自动生成 20-50 条候选情报。
* Agent 过滤出 Top 10。
* 每条情报给出：

  * 来源
  * 摘要
  * 证据等级
  * 患者意义
  * 是否值得医生咨询
  * 风险提示
* 首页展示：

  * 今日突破指数
  * 今日风险指数
  * 临床试验机会指数
  * 药物突破指数
  * 医生/中心热度指数
* 可一键生成：

  * 群内简报
  * 公众号草稿
  * 小红书卡片文案

---

## 18. 结论

这个项目最有价值的地方不是“像战争地图一样酷”，而是把胰腺癌患者最缺的三件事系统化：

**第一，信息差。**
全球指南、会议、药物、试验、医生、医院、患者经验都很分散。

**第二，理解差。**
患者看到 ORR、PFS、OS、RP2D、DCR、IHC、NGS，常常不知道和自己有什么关系。

**第三，行动差。**
知道一个新药不等于能用，真正需要的是：
“我是否适合？哪里有？证据够不够？风险是什么？我该如何问医生？”

所以这个项目的核心产品价值应该定义为：

> **用 OSINT 方法，把全球胰腺癌诊疗进展变成患者可理解、医生可核查、社区可传播、趋势可追踪的智能情报系统。**

[1]: https://www.pizzint.watch/about/polyglobe?utm_source=chatgpt.com "What is Polyglobe?"
[2]: https://quewi.ai/warroom/?lang=en&utm_source=chatgpt.com "QueWi War Room — Real-Time AI War Intel Dashboard"
[3]: https://worldwideview.dev/download?utm_source=chatgpt.com "Download"
[4]: https://github.com/lina767/digital-war-room?utm_source=chatgpt.com "lina767/digital-war-room: Multi-agent platform using OSINT ..."
[5]: https://github.com/koala73/worldmonitor?utm_source=chatgpt.com "koala73/worldmonitor: Real-time global intelligence ..."
[6]: https://www.esmo.org/guidelines/express-update-pancreatic-cancer?utm_source=chatgpt.com "Express Update: Pancreatic Cancer"
[7]: https://pubmed.ncbi.nlm.nih.gov/33845462/?utm_source=chatgpt.com "Pancreatic Adenocarcinoma, Version 2.2021, NCCN ..."
[8]: https://clinicaltrials.gov/data-api/api?utm_source=chatgpt.com "ClinicalTrials.gov API"
[9]: https://www.aacr.org/meeting/aacr-conference-on-pancreatic-cancer/abstracts/?utm_source=chatgpt.com "Abstracts Panc 26 | Meetings | AACR"
[10]: https://www.asco.org/abstracts?utm_source=chatgpt.com "Annual Meeting Search Results"
[11]: https://emedicine.medscape.com/article/280605-guidelines?utm_source=chatgpt.com "Pancreatic Cancer Guidelines"

