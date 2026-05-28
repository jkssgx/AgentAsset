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

## 后续规划

- 根据评审反馈确定主视觉方向、信息密度和页面结构。
- 继续补齐候选资产沉淀、验证审批、Agent 引用链、治理配置等关键页面。
- 将确认后的产品需求沉淀到 `PRD.md`。
- 继续细化 `architecture.md` 中的资产对象模型、业务 Skill 资产模型、Agent 任务上下文模型、权限模型、候选资产验证机制、DeepAgents 适配实现和首期技术栈边界。

## 遗留问题

- 需要确认目标用户角色的优先级，例如计划员、计划主管、工艺专家、IT 管理员、生产经理。
- 需要确认首期范围是否聚焦资产管理闭环，还是同步覆盖对话式调度任务页面。
- 需要进一步定义资产状态流转、审批权限、Agent 可用权限分级和价值度量口径。
- 需要确认 DeepAgents 首期接入形态：工具调用为主，还是同时使用文件系统上下文承载资产包。
- 需要确认 Agent 自主沉淀候选资产的触发规则、证据要求和人工审批角色。
- 需要确认首期工程部署策略：单体后端内模块化实现，还是直接拆分为 Agent Runtime Service 与 Asset Management Service。
- 需要确认哪些资产类型可以发布为业务 Skill，哪些只作为 Skill 运行时引用的支撑资产。
- 需要确认 Skill Projection Service 的实现方式：任务开始时动态投影、Agent 启动时预投影，还是按版本变更增量同步。
- 需要确认 Skill Bundle 中脚本的安全沙箱、权限边界和审计要求。
- 需要确认首期是否统一采用 Python FastAPI + Python DeepAgents，还是资产管理核心服务一开始就采用 Java/Kotlin 与 Agent Runtime 分离。
