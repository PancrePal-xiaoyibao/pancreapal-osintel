# 微信公众号信源获取需求

## 1. 模块定位

微信公众号信源模块用于补充 `City Pancreatic Treatment Resource Layer` 的医院、科室、专家团队和患者支持类公开信息。

核心目标：

- 发现并维护医院/科室/专家团队公众号。
- 拉取公众号最新文章元数据。
- 识别与胰腺肿瘤、临床试验、并发症支持、营养、心理支持相关的文章。
- 将公众号作为 source registry 的一种来源，服务城市资源热度、科室详情抽屉和内容选题。

边界：

- 只保存文章元数据、链接、摘要、标签和结构化字段。
- 不保存完整公众号文章正文，除非确认版权和使用权限。
- 不把公众号活跃度等同于医院真实水平或医疗质量。
- 不把患者留言、私域群聊或未匿名截图作为公开信源。

## 2. 现有资源

### 2.1 MPText API

入口：

```text
https://down.mptext.top/dashboard/api
```

文档：

```text
https://docs.mptext.top/advanced/api
```

认证方式：

```http
X-Auth-Key: ${MP_API_KEY}
```

配置要求：

- `MP_API_KEY` 必须放在 `.env.local`、本地 shell 环境变量或密钥管理系统中。
- 禁止把真实 API key 写入仓库文档、脚本默认值或 `.env.example`。
- `.env.example` 只能保留空占位。
- API key 可能随登录状态或服务端规则变化，需要支持轮换。

### 2.2 本地参考项目

本地项目：

```text
/Users/qinxiaoqiang/Downloads/采集/wechat-mp-monitor
```

可复用文件：

```text
/Users/qinxiaoqiang/Downloads/采集/wechat-mp-monitor/scripts/mp-monitor.py
/Users/qinxiaoqiang/Downloads/采集/wechat-mp-monitor/.env.template
/Users/qinxiaoqiang/Downloads/采集/wechat-mp-monitor/templates/mp-dashboard_xyb_style.html
/Users/qinxiaoqiang/Downloads/采集/wechat-mp-monitor/templates/mp-article_inline.html
```

当前脚本已验证的核心模式：

- 从 `.env` 读取 `MP_API_KEY`。
- 用 `MP_ACCOUNTS_JSON` 维护公众号名称到 `fakeid` 的映射。
- 请求 `/api/public/v1/account` 获取账号信息。
- 请求 `/api/public/v1/article` 获取最新文章。
- 使用关键词和正则进行胰腺相关性过滤。
- 输出 dashboard HTML 和公众号 inline HTML。

## 3. API 规范

### 3.1 Account Search

用途：通过公众号名称或关键词查找账号信息，补全 `fakeid`、头像、简介等。

```http
GET /api/public/v1/account
Host: down.mptext.top
X-Auth-Key: ${MP_API_KEY}
```

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | string | 是 | 公众号名称或关键词 |
| `size` | integer | 否 | 返回数量，默认建议 1-10 |

参考调用：

```python
requests.get(
    f"{MP_API_BASE}/api/public/v1/account",
    params={"keyword": account_name, "size": 1},
    headers={"X-Auth-Key": api_key},
    timeout=25,
)
```

目标字段：

| 字段 | 用途 |
| --- | --- |
| `fakeid` | 后续拉取文章 |
| `nickname` / `name` | 公众号名称 |
| `alias` | 公众号微信号 |
| `signature` | 简介 |
| `round_head_img` | 头像 |

### 3.2 Article List

用途：按 `fakeid` 拉取公众号最新文章。

```http
GET /api/public/v1/article
Host: down.mptext.top
X-Auth-Key: ${MP_API_KEY}
```

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `fakeid` | string | 是 | 公众号 fakeid |
| `size` | integer | 否 | 拉取文章数量，MVP 建议 12 |

参考调用：

```python
requests.get(
    f"{MP_API_BASE}/api/public/v1/article",
    params={"fakeid": fakeid, "size": 12},
    headers={"X-Auth-Key": api_key},
    timeout=25,
)
```

目标字段：

| 字段 | 用途 |
| --- | --- |
| `title` | 文章标题 |
| `link` | 原文链接 |
| `cover` | 封面图 |
| `update_time` | 发布时间 |
| `digest` | 摘要，如接口返回 |

### 3.3 Download / Content Fetch

用途：如接口支持下载文章内容，只能用于本地分析和 RAG 清洗，默认不入库全文。

要求：

- 保存前必须经过版权和使用权限判断。
- 对外展示只用短摘要、结构化字段和原文链接。
- 进入 RAG 的内容需要通过清洗脚本去除广告、二维码、引导关注和模板尾部。

## 4. 配置规范

推荐 `.env.local`：

```env
MP_API_BASE=https://down.mptext.top
MP_API_KEY=
MP_ACCOUNTS_JSON={}
MP_SEARCH_KEYWORDS=胰腺癌,胰腺肿瘤,pancreatic cancer,PDAC,胰腺外科,胰腺中心,临床试验,胆道梗阻,营养支持,姑息治疗
MP_PRIORITY_KEYWORDS=胰腺癌,临床试验,招募,胰腺外科,胰腺中心,MDT,胆道梗阻,肠梗阻,腹膜转移
MP_NEGATIVE_PATTERNS=节日,祝福,招聘,招生,团建,会议通知,护理风采
```

`MP_ACCOUNTS_JSON` 示例：

```json
{
  "长海医院胰腺肝胆外科": "MzAwNDUyNzAyMw==",
  "复旦大学附属华山医院胰腺外科": "Mzg5MDczMzc3NQ==",
  "中山胰腺肿瘤中心": "MjM5MjUyNDc2Nw=="
}
```

## 5. 数据模型建议

### 5.1 `wechat_public_accounts`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `account_key` | text | 稳定键 |
| `account_name` | text | 公众号名称 |
| `fakeid` | text | MPText fakeid |
| `alias` | text | 微信号 |
| `signature` | text | 简介 |
| `avatar_url` | text | 头像 |
| `account_type` | enum | `hospital`、`department`、`doctor_team`、`trial_center`、`patient_support`、`media` |
| `country_id` | uuid | 国家 |
| `city_id` | uuid | 城市 |
| `treatment_center_id` | uuid | 关联治疗中心 |
| `department_key` | text | 关联科室资源 |
| `verification_status` | enum | `official_verified`、`public_claim`、`unverified` |
| `last_checked_at` | timestamptz | 最近检查时间 |
| `metadata` | jsonb | 额外字段 |

### 5.2 `wechat_articles`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `article_key` | text | `fakeid + title/link` 去重键 |
| `account_key` | text | 关联公众号 |
| `title` | text | 标题 |
| `url` | text | 原文链接 |
| `cover_url` | text | 封面图 |
| `published_at` | timestamptz | 发布时间 |
| `digest` | text | 摘要 |
| `topic_tags` | text[] | 主题标签 |
| `resource_tags` | text[] | 医院/科室/支持资源标签 |
| `relevance_score` | numeric | 相关性分 |
| `risk_flags` | text[] | 风险标记 |
| `data_quality` | enum | 数据质量 |
| `raw_payload` | jsonb | 接口原始元数据，不含全文 |

### 5.3 `wechat_monitor_runs`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `run_key` | text | 运行 ID |
| `started_at` | timestamptz | 开始时间 |
| `finished_at` | timestamptz | 结束时间 |
| `account_count` | integer | 检查账号数 |
| `article_count` | integer | 拉取文章数 |
| `new_article_count` | integer | 新文章数 |
| `error_count` | integer | 错误数 |
| `errors` | jsonb | 错误详情 |

## 6. 调用逻辑

```text
Load config
  -> Validate MP_API_KEY
  -> Load account registry from database or MP_ACCOUNTS_JSON
  -> For each account:
       -> Fetch account profile by keyword or fakeid
       -> Fetch latest articles by fakeid
       -> Normalize article metadata
       -> Deduplicate by article_key
       -> Score relevance
       -> Tag topics and resource categories
       -> Store metadata and source links
  -> Update department public account mappings
  -> Update resource heat snapshots
  -> Emit monitor run summary
```

## 7. 相关性规则

硬相关词：

- 胰腺癌。
- 胰腺肿瘤。
- 胰腺导管腺癌。
- PDAC。
- pancreatic cancer。
- 胰腺外科。
- 胰腺中心。

高优先级词：

- 临床试验。
- 招募。
- 受试者。
- MDT。
- 胆道梗阻。
- 肠梗阻。
- 消化道出血。
- 腹膜转移。
- 营养支持。
- 姑息治疗。
- 疼痛。
- 免疫治疗。
- 靶向治疗。

降权词：

- 节日祝福。
- 招聘招生。
- 团建。
- 单纯会议通知。
- 医院文化宣传。
- 与胰腺无关的其他癌种文章。

## 8. 关键代码要求

- 不硬编码 API key。
- `MP_API_BASE` 默认 `https://down.mptext.top`，允许环境变量覆盖。
- 请求必须设置超时，建议 25 秒以内。
- 每个账号失败不得中断全局任务，要记录错误并继续。
- API 返回结构变化时，保留 `raw_payload` 并记录解析错误。
- 文章去重键必须稳定，建议 `sha256(fakeid + url)`，没有 URL 时用 `sha256(fakeid + title + update_time)`。
- 公众号账号必须支持手工确认 `verification_status`。
- 热度计算要区分文章活跃度、胰腺相关度、临床试验相关度和患者支持相关度。
- 对接 `hospital_source.md` 时，公众号只作为科室/医院公开信源，不作为医疗能力证明。

## 9. 输出

MVP 输出：

- 公众号账号清单。
- 最近文章元数据。
- 每个账号最新 3-12 篇文章。
- 胰腺相关 top articles。
- 新增文章列表。
- 监控运行摘要。
- 可写入 `department_public_accounts` 和 `resource_heat_snapshots` 的结构化数据。

HTML 输出可以复用本地 `wechat-mp-monitor` 的 dashboard 和 inline 模板，但 pposintel 后续应优先输出结构化 JSON/API，再由前端渲染。

## 10. 验收标准

- 能用 `MP_API_KEY` 环境变量完成账号搜索和文章拉取。
- 能从 `MP_ACCOUNTS_JSON` 加载至少 3 个公众号。
- 单账号失败不影响其他账号。
- 每篇文章保留标题、链接、发布时间、公众号、相关性分和标签。
- 能识别胰腺癌、临床试验、并发症支持、营养/心理/姑息等主题。
- 能把公众号映射到城市、医院、科室资源。
- 不写入真实 API key 到仓库。
- 输出能被城市胰腺治疗资源层读取，用于科室详情抽屉和热度条。

## 11. 待确认

- MPText API key 是否需要定期自动刷新，还是手工从 dashboard 更新。
- 是否将医院/科室公众号加入 `sources` 主表，还是单独维护 `wechat_public_accounts`。
- 是否需要对文章正文做 RAG 清洗；若需要，需先明确版权边界。
- 第一批公众号账号清单是否以用户补充上海六家中心为起点。
