# 项目进展

## 已完成

- 基于现有 `README.md` 中的工业动态调度智能体资产管理定位，完成首版界面视觉探索。
- 在 `prototype` 目录中沉淀三张原型界面截图：
  - `01-asset-workbench.png`：资产工作台，展示资产总览、资产清单与候选资产队列。
  - `02-asset-detail.png`：资产详情，展示资产说明、执行链路、治理信息与证据链。
  - `03-value-analytics.png`：资产价值度量，展示引用趋势、场景贡献与资产飞轮健康度。
- 保留 `prototype/index.html` 作为可继续迭代的静态原型源文件。
- 沉淀资产管理模块与 Agent 的交互架构到 `architecture.md`，明确资产模块应作为框架无关的资产协议层，而不是直接绑定某个 Agent 框架。
- 明确近期可基于 `langchain-ai/deepagents` 落地，但通过 Agent Asset Adapter 接入，避免资产对象模型、治理流程和沉淀闭环被具体框架绑定。
- 初步定义 Agent 使用资产的三种方式：作为上下文、作为工具、作为治理约束。
- 初步定义 Agent 自主沉淀资产的边界：Agent 可以提交候选资产，但不能直接修改正式资产库。
- 初步抽象 6 个核心接口：`search_assets`、`get_asset`、`resolve_context`、`check_policy`、`record_usage`、`propose_candidate`。
- 明确资产管理模块与 Agent Runtime 的服务边界：领域职责独立，长期可拆为两个独立服务，首期可采用“逻辑独立、部署可合并”的模块化落地方式。
- 沉淀业务 Skill 资产与 Agent Skills 机制的关系：资产管理服务作为 Source of Truth，Agent Skills 目录或后端作为 Runtime Projection，Agent Runtime 作为 Consumer。
- 明确资产服务不替代 Skills 的渐进式披露机制，而是负责业务 Skill 的治理、版本、权限、审批、审计和价值度量。
- 初步定义 Skill Projection Service：将正式发布且当前 Agent 有权使用的业务 Skill 资产投影为 `SKILL.md`、`references/`、`scripts/` 等运行时文件结构。
- 修正 DeepAgents 技术判断：DeepAgents Python 支持 Agent、tools、filesystem、subagents、memory、human-in-the-loop 和 skills，首期 Agent Runtime、Agent Asset Adapter 与 Skill Projection Service 可优先采用 Python。
- 初步沉淀首期技术栈建议：Python FastAPI + Python DeepAgents + PostgreSQL + pgvector，长期保留 Java/Kotlin + Spring Boot 作为企业级资产治理服务的演进选项。
- 确认前端交互页面首期技术选型：React + TypeScript + Vite + Ant Design，配套 React Router、TanStack Query、Zustand、ECharts / Ant Design Charts、React Flow 等能力。
- 明确前端首期优先采用 Ant Design 的原因：适合企业级中后台资产台账、表单筛选、审批流、版本记录、治理配置和价值分析等高频页面，能够提升交互页面落地效率。
- 完成 `PRD.md` 产品需求文档，覆盖产品定位、用户角色、资产范围、核心功能、MVP 范围、验收标准和待确认问题。
- 按 `AGENTS.md` 文档归属要求新增 `SDD.md` 系统设计文档，沉淀交互逻辑、页面信息架构、页面草图、数据模型、表结构、前端页面数据结构和 Asset Gateway 接口数据结构。
- 根据第三方设计评审意见优化 `SDD.md`：明确审批实例保留多态对象引用且不做数据库外键，补充业务校验和索引要求；新增资产关系、操作日志、资产检索记录、验证任务、候选证据来源类型；完善工具调用与治理校验、审批实例的关联，并修正候选资产与正式资产状态边界。
- 补充 `SDD.md` 中每张数据表的作用说明，明确各表在资产生命周期、版本治理、范围权限、证据链、候选沉淀、Agent 审计、验证审批和价值度量中的职责。
- 补充 `asset_version_status` 枚举和资产版本状态说明，明确资产整体状态与资产版本状态的边界。
- 补充 `scope_type` 枚举，并新增 `scope_node`、`scope_closure` 范围层级模型，明确 `asset_scope.include_children` 需要依赖范围层级表或外部主数据服务才能生效。
- 为 `asset_evidence` 增加 `ref_type` 字段和 `evidence_ref_type` 枚举，明确正式资产证据链中 `ref_id` 指向的对象类型。
- 补充 `evidence_type` 枚举，并统一 `asset_evidence` 与 `candidate_evidence` 中证据业务类型字段的说明。
- 在 `asset_permission` 表后补充 `subject_type + subject_id` 权限主体说明，明确用户、角色、组织和 Agent 授权主体的表达方式。
- 在 `asset_operation_log` 表后补充 `object_id` 与 `asset_id` 的对象归属说明，明确精确操作对象与资产聚合索引的区别。
- 扩展 `tool_asset_detail` 设计，新增 `tool_endpoint_type` 枚举并支持 `python_script`，补充脚本引用、入口函数、运行时、依赖、沙箱和输入输出约束说明。
- 在 `asset_candidate` 表后补充候选版本设计说明，明确首期不单独设计候选版本表和类型扩展表，以及后续可扩展 `asset_candidate_revision` 的触发条件。
- 新增 `governance_policy` 和 `policy_check_hit` 设计，明确治理策略与资产/资产版本的可选关联关系，并将 `policy_check_record` 定位为一次治理校验结果记录。
- 细化 `SDD.md` 中 `4.10 前端页面数据结构`，按资产工作台、资产台账、资产详情、新建编辑、候选资产池、验证审批、Agent 使用记录、价值分析和治理配置页面补充页面级数据结构。
- 根据 `SDD.md` 中的功能模块与页面数据结构，生成 9 张页面原型图片并沉淀到 `prototype/2026-06-23`，覆盖资产工作台、资产台账、资产详情、新建编辑、候选资产池、验证审批、Agent 使用记录、价值分析和治理配置。
- 补充智能体辅助新增资产的产品边界、流程和架构定位，明确 Hermes、DeerFlow 等 Harness 可作为可替换的编排执行层，但正式资产库仍以资产管理系统为权威来源，正式发布必须经过人工确认、验证和审批。
- 2026-06-24 生成 1920×1080 资产工作台页面原型图，系统名称调整为“Agent资产管理系统”，并使用用户提供的 HGTECH 图标风格，图片沉淀到 `prototype/2026-06-24/01-asset-workbench.png`。
- 2026-06-24 调整资产工作台页面配色，保留 HGTECH 系统图标红色，将菜单高亮、主按钮、普通操作按钮、分页和用户头像改为青蓝色系，并保留上一版红色方案备份 `prototype/2026-06-24/01-asset-workbench-red-v1.png`。
- 2026-06-24 参考用户提供图片中的红框区域结构，调整资产工作台为左侧导航、顶部操作栏和二级页签栏布局，视觉风格继续保持深色侧栏、白色卡片和青蓝交互色。
- 2026-06-25 根据用户确认的目标图片结构，调整资产工作台为“左侧深色导航 + 右侧顶部页签栏 + 页签下方搜索操作区 + 看板内容区”的布局，并备份上一版顶部操作栏结构为 `prototype/2026-06-24/01-asset-workbench-topbar-v3.png`。
- 2026-06-25 生成资产台账中的资产列表页面原型图，覆盖筛选区、资产统计、批量操作、可勾选资产表格和分页，图片沉淀到 `prototype/2026-06-24/02-asset-ledger-list.png`。
- 2026-06-25 根据反馈调整资产列表页面，移除资产统计卡区域，将纵向空间用于展示更多资产行和最近更新等列表字段，并保留上一版带统计卡方案备份 `prototype/2026-06-24/02-asset-ledger-list-with-summary-v1.png`。
- 2026-06-25 根据反馈移除资产列表表格卡片左上角标题“资产列表”，并保留调整前版本备份 `prototype/2026-06-24/02-asset-ledger-list-title-v2.png`。
- 2026-06-25 生成新增资产页面原型图，采用紧凑步骤指引导航，将主要空间留给业务描述表单、规则初稿、AI 辅助建议、相似资产和治理预检查，图片沉淀到 `prototype/2026-06-24/03-asset-create.png`。
- 2026-06-25 生成新增资产流程中“AI结构化”步骤页面原型图，展示结构化字段确认、条件与约束编辑、参数样例、未确认项、相似资产和 AI 预检查结果，图片沉淀到 `prototype/2026-06-24/04-asset-create-ai-structure.png`。
- 2026-06-25 生成新增资产流程中“范围权限”步骤页面原型图，展示适用范围树、已选范围表、Agent 可用权限矩阵、风险与审批边界以及治理与权限助手，图片沉淀到 `prototype/2026-06-24/05-asset-create-scope-permission.png`。
- 2026-06-25 根据反馈移除“范围权限”页面顶部重复的横向步骤条，仅保留左侧竖向步骤指引，并将范围权限配置内容上移；保留调整前版本备份 `prototype/2026-06-24/05-asset-create-scope-permission-with-top-step-v1.png`。
- 2026-06-25 生成新增资产流程中“校验提交”步骤页面原型图，仅保留左侧竖向步骤指引，展示校验总览、待处理问题、证据链、测试样例、版本提交说明、审批链路和发布影响，图片沉淀到 `prototype/2026-06-24/06-asset-create-validation-submit.png`。
- 2026-06-25 生成候选资产池中的候选列表页面原型图，展示候选状态页签、筛选区、批量处理、候选资产表格、置信度、证据数、相似资产提示和右侧候选预览，图片沉淀到 `prototype/2026-06-24/07-candidate-assets-list.png`。
- 2026-06-25 生成候选资产池中的候选详情/转正页面原型图，展示候选概览、智能体提炼内容、证据链、相似资产对比、转正配置、转正预检查和操作确认，图片沉淀到 `prototype/2026-06-24/08-candidate-asset-detail-convert.png`。
- 2026-06-25 生成验证与审批中的待验证页面原型图，展示验证队列、筛选区、批量启动验证、验证状态、校验项和右侧验证详情预览，图片沉淀到 `prototype/2026-06-24/09-validation-pending.png`。
- 2026-06-25 生成验证与审批中的待审批页面原型图，展示审批队列、审批类型、当前步骤、验证结果、等待时长和右侧审批详情预览，图片沉淀到 `prototype/2026-06-24/10-approval-pending.png`。
- 2026-06-25 生成验证与审批中的审批记录页面原型图，展示历史审批查询、审批结果、审批链路、审批意见、关联验证结果和操作日志，图片沉淀到 `prototype/2026-06-24/11-approval-records.png`。
- 2026-06-26 补充 Agent 使用记录模块设计，将子页面从任务引用、工具调用、治理校验扩展为任务轨迹总览、资产引用记录、工具调用记录、治理校验记录和人工反馈记录，并同步更新 `PRD.md` 与 `SDD.md` 的页面信息架构和页面数据结构。
- 2026-06-26 生成 Agent 使用记录中的任务轨迹总览页面原型图，展示任务筛选、任务轨迹列表、任务全过程时间线、资产引用、工具调用、治理校验和人工反馈摘要，图片沉淀到 `prototype/2026-06-24/12-agent-task-trace-overview.png`。
- 2026-06-26 生成 Agent 使用记录中的资产引用记录页面原型图，展示资产引用筛选、引用流水、检索分数、引用状态、引用原因、引用影响、命中信息和关联任务轨迹，图片沉淀到 `prototype/2026-06-24/13-agent-asset-usage-records.png`。
- 2026-06-26 调整 Agent 使用记录中的资产引用记录页面原型，将页面从资产流水视角改为任务主线视角，突出单个任务执行过程中引用了哪些资产、为什么引用以及对任务结果产生的影响；原资产流水版本备份为 `prototype/2026-06-24/13-agent-asset-usage-records-asset-centric-v1.png`。
- 2026-06-26 依据任务轨迹详情结构再次调整资产引用记录页面原型，采用顶部任务基本信息、中部任务节点流程图、底部节点记录明细的布局，底部默认展示当前节点的资产引用记录、引用解释与产生效果；任务主线版本备份为 `prototype/2026-06-24/13-agent-asset-usage-records-taskline-v2.png`。
- 2026-06-26 生成任务轨迹详情中的工具调用记录、治理校验记录和人工反馈记录三个页签状态页面原型图，统一沿用任务基本信息、任务节点轨迹和节点记录明细结构，图片分别沉淀到 `prototype/2026-06-24/14-agent-tool-call-records.png`、`prototype/2026-06-24/15-agent-governance-check-records.png`、`prototype/2026-06-24/16-agent-human-feedback-records.png`。

## 后续规划

- 根据评审反馈确定主视觉方向、信息密度和页面结构。
- 基于 `SDD.md` 中已补充的数据结构，继续推导接口清单、页面字段映射和后端模块划分。
- 进一步评估 Hermes、DeerFlow 等 Harness 的接入条件，包括 human-in-the-loop、结构化输出、运行轨迹、工具权限控制、可观测性和部署方式。
- 基于当前 `prototype/index.html`，规划并搭建 `frontend/` 前端工程骨架，将静态原型迁移为 React + Ant Design 可交互页面。
- 继续细化 `architecture.md` 中的资产对象模型、业务 Skill 资产模型、Agent 任务上下文模型、权限模型、候选资产验证机制、DeepAgents 适配实现和首期技术栈边界。

## 遗留问题

- 需要确认目标用户角色的优先级，例如计划员、计划主管、工艺专家、IT 管理员、生产经理。
- 需要确认首期范围是否聚焦资产管理闭环，还是同步覆盖对话式调度任务页面。
- 需要进一步定义资产状态流转、审批权限、Agent 可用权限分级和价值度量口径。
- 需要确认 DeepAgents 首期接入形态：工具调用为主，还是同时使用文件系统上下文承载资产包。
- 需要确认 Agent 自主沉淀候选资产的触发规则、证据要求和人工审批角色。
- 需要确认首期资产新增辅助优先接入 Hermes、DeerFlow 还是 DeepAgents/LangGraph 等其他 Harness，以及是否需要先做 Harness Adapter 抽象层。
- 需要确认首期工程部署策略：单体后端内模块化实现，还是直接拆分为 Agent Runtime Service 与 Asset Management Service。
- 需要确认哪些资产类型可以发布为业务 Skill，哪些只作为 Skill 运行时引用的支撑资产。
- 需要确认 Skill Projection Service 的实现方式：任务开始时动态投影、Agent 启动时预投影，还是按版本变更增量同步。
- 需要确认 Skill Bundle 中脚本的安全沙箱、权限边界和审计要求。
- 需要确认前端首期页面范围和路由结构：资产工作台、资产详情、价值分析、候选资产审批、治理配置、Agent 使用记录是否全部进入首期。
- 需要确认首期是否统一采用 Python FastAPI + Python DeepAgents，还是资产管理核心服务一开始就采用 Java/Kotlin 与 Agent Runtime 分离。
