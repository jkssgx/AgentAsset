# 工业动态调度智能体资产管理模块架构

## 1. 架构定位

资产管理模块不应只作为人工维护知识、规则、文档和案例的后台，也不应直接绑定某一个 Agent 框架。

本模块的核心定位是：

> 面向工业动态调度 Agent 的长期任务记忆、能力供给层、治理层和资产沉淀闭环。

对人，它提供资产维护、验证、审批、发布、版本、审计和价值度量能力。

对 Agent，它提供可检索、可读取、可调用、可校验、可追踪、可沉淀的资产协议。

## 2. 核心原则

### 2.1 Agent 框架无关

资产管理模块不直接依赖 `deepagents`、LangGraph、AutoGen、CrewAI 或其他具体 Agent 框架。

系统应采用如下结构：

```text
Agent 框架
  -> Agent Asset Adapter
  -> Asset Gateway
  -> 资产检索 / 资产详情 / 工具调用 / 治理校验 / 使用记录 / 候选沉淀
  -> 资产库与候选资产池
```

近期可以基于 `langchain-ai/deepagents` 落地，但 `deepagents` 只应位于 Agent 框架适配层，不能反向决定资产对象模型、治理流程和沉淀机制。

### 2.2 服务职责独立，部署形态渐进

资产管理模块与 Agent Runtime 在领域职责上应保持独立。

Agent Runtime 负责：

- 任务理解。
- 推理规划。
- 对话交互。
- 工具调用编排。
- 调度方案生成。
- 任务执行过程管理。

资产管理模块负责：

- 资产对象管理。
- 资产检索与上下文组装。
- 权限、审批、版本和发布治理。
- 工具目录和工具调用治理。
- Agent 资产使用记录。
- 候选资产沉淀。
- 资产价值度量。

因此，长期架构上，二者应视为两个独立服务：

```text
Agent Runtime Service
  -> Agent Asset Adapter
  -> Asset Gateway
  -> Asset Management Service
```

但首期不一定必须拆成两个独立部署。可以采用“逻辑独立、部署可合并”的方式：

```text
同一个后端工程
  - agent-runtime 模块
  - asset-service 模块
  - asset-gateway 接口
  - asset-db 表结构
```

首期要求是：

- 代码模块边界独立。
- 接口协议边界独立。
- 数据模型边界独立。
- Agent 只能通过 Asset Gateway 使用资产能力。
- 资产治理流程不依赖具体 Agent 框架。

当出现多 Agent 接入、独立审批治理、跨系统审计、高并发调用或资产能力需要被其他系统复用时，再演进为独立部署的资产管理服务。

### 2.3 正式资产与候选资产隔离

Agent 可以自主提出候选资产，但不应直接修改正式资产库。

正式资产必须经过验证、审批和发布流程后，才能影响后续正式调度任务。

### 2.4 资产使用必须可审计

Agent 在任务中使用了哪些资产、为何使用、如何影响决策、是否被人工采纳，都应被记录。

这些记录既用于审计，也用于后续资产价值度量和候选资产沉淀。

### 2.5 治理优先于自动化

工业调度涉及生产计划、交期承诺、跨车间协同、物料替代、系统写回等高风险动作。

资产模块不仅要告诉 Agent “可以用什么”，也要告诉 Agent “哪些动作不能直接做，哪些动作必须审批”。

## 3. 总体架构

```mermaid
flowchart LR
  A["Agent 框架<br/>DeepAgents / LangGraph / AutoGen / 自研"] --> B["Agent Asset Adapter<br/>框架适配层"]
  B --> C["Asset Gateway<br/>资产服务网关"]
  C --> D["资产检索服务"]
  C --> E["资产详情服务"]
  C --> F["资产工具服务"]
  C --> G["治理与权限服务"]
  C --> H["资产使用记录服务"]
  C --> I["候选资产沉淀服务"]
  D --> J["正式资产库"]
  E --> J
  F --> J
  G --> J
  H --> K["任务轨迹与审计记录"]
  I --> L["候选资产池"]
  L --> M["验证 / 审批 / 发布"]
  M --> J
```

## 4. Agent 与资产模块的交互方式

### 4.1 Agent 使用资产

Agent 使用资产不应只等同于 RAG 检索。资产在任务中至少有三种使用方式。

#### 4.1.1 作为上下文

Agent 在处理调度任务时，根据任务上下文检索相关资产。

示例任务：

```text
设备 E-17 故障，预计停机 46 分钟，请评估是否需要重排。
```

Agent 调用资产检索接口：

```text
search_assets(task_context)
```

资产模块返回相关规则、工作流、案例、接口、评测资产等。

Agent 再读取资产详情：

```text
get_asset(asset_id)
```

资产详情中应包含：

- 人类可读说明。
- 结构化条件和适用范围。
- 规则约束或执行步骤。
- 可调用工具。
- 风险边界。
- 人工审批点。
- 版本和证据链。

#### 4.1.2 作为工具

部分资产本身是能力入口，例如：

- MES 设备状态查询接口。
- ERP 订单查询接口。
- APS 排程求解器。
- 规则校验器。
- 交期风险巡检工作流。

Agent 不应直接耦合底层系统接口，而应通过资产模块暴露的工具清单和调用协议使用这些能力。

```text
list_asset_tools(context)
call_asset_tool(tool_id, input)
```

这样底层工具的鉴权、参数映射、错误处理、审计和风险控制都可以由资产模块统一治理。

#### 4.1.3 作为治理约束

Agent 在生成方案、调用工具、发起审批或写回计划前，需要进行治理校验。

```text
check_policy(action, context)
```

示例返回：

```json
{
  "allowed": false,
  "reason": "跨车间调拨必须经过人工审批",
  "required_approval": ["生产经理", "计划主管"],
  "next_action": "create_plan_change_request"
}
```

治理校验应覆盖：

- Agent 是否可读取该资产。
- Agent 是否可调用该工具。
- 当前任务是否落在资产适用范围内。
- 是否涉及高风险动作。
- 是否需要人工审批。
- 是否允许写回业务系统。
- 是否需要记录审计证据。

### 4.2 Agent 自主更新与沉淀资产

Agent 不直接更新正式资产，而是提交候选资产。

推荐闭环：

```text
真实任务执行
  -> Agent 运行轨迹
  -> 资产候选识别
  -> 候选资产生成
  -> 自动验证
  -> 人工审批
  -> 发布为正式资产
  -> 后续任务复用
```

Agent 可在以下场景提出候选资产：

- 某类调度经验被多次采纳。
- 某条规则在真实任务中反复出现。
- 某个接口字段或业务术语被用户纠正。
- 某个 Agent 建议被否决且原因具有复用价值。
- 某个异常处理案例适合作为未来参考。
- 某个高风险错误应加入回归评测集。

候选资产提交接口：

```text
propose_asset_candidate(candidate)
```

示例：

```json
{
  "candidate_type": "rule",
  "title": "高价值急单插入时冻结低优先级尾单",
  "source": "agent_task_trace",
  "evidence": ["TASK-20260518-001", "TASK-20260521-004"],
  "suggested_scope": {
    "factory": "苏州一厂",
    "line": "总装一线",
    "order_type": "急单"
  },
  "risk_level": "medium",
  "human_review_required": true
}
```

候选资产状态建议：

```text
草稿 -> 候选 -> 验证中 -> 待审批 -> 已发布
```

异常状态建议：

```text
退回修改 / 冲突待解 / 停用 / 废止
```

## 5. 标准 Agent 资产接口

为了支持未来切换不同 Agent 框架，资产模块对 Agent 暴露的接口应保持稳定。

第一版建议抽象为 6 个核心接口。

### 5.1 search_assets

根据任务上下文检索相关资产。

输入包括：

- 工厂、车间、产线、设备、产品、订单、客户、异常类型。
- 当前任务目标。
- Agent 身份与权限。
- 是否为正式任务或仿真任务。

输出包括：

- 资产列表。
- 匹配原因。
- 推荐使用方式。
- 置信度。
- 风险提示。

### 5.2 get_asset

读取单个资产详情。

输出包括：

- 基础信息。
- 适用范围。
- 内容载体。
- 结构化规则或流程。
- 关联工具。
- 治理状态。
- 权限要求。
- 版本信息。
- 证据链。

### 5.3 resolve_context

根据任务上下文组装 Agent 可直接使用的资产包。

资产包可包含：

- 任务相关规则。
- 推荐工作流。
- 可调用工具清单。
- 风险边界。
- 审批要求。
- 相关历史案例。
- 输出格式要求。

### 5.4 check_policy

校验 Agent 的计划、工具调用或动作是否允许执行。

输出包括：

- 是否允许。
- 不允许原因。
- 必须满足的前置条件。
- 所需审批角色。
- 推荐下一步动作。
- 审计记录要求。

### 5.5 record_usage

记录 Agent 在任务中如何使用资产。

记录内容包括：

- 任务编号。
- Agent 框架与版本。
- 使用的资产编号和版本。
- 使用阶段。
- 使用方式。
- 对输出方案的影响。
- 用户是否采纳。
- 执行结果。

### 5.6 propose_candidate

提交候选资产。

候选资产应包含：

- 候选类型。
- 来源任务。
- 提炼内容。
- 证据链。
- 适用范围建议。
- 风险等级。
- 冲突资产。
- 建议验证方式。

## 6. 基于 DeepAgents 的近期落地方式

当前选型准备基于 `langchain-ai/deepagents`，建议采用适配层方式接入。

### 6.1 封装为 DeepAgents 工具

将资产模块标准接口包装为 DeepAgents 可调用工具：

```text
search_assets
get_asset
resolve_context
check_policy
record_usage
propose_asset_candidate
list_asset_tools
call_asset_tool
```

DeepAgents 负责在任务执行过程中调用这些工具，但资产模块负责返回可治理、可审计、可复用的资产结果。

### 6.2 使用文件系统上下文承载资产包

DeepAgents 支持类似文件系统的上下文表面，可以将任务相关资产整理为可读文件。

示例：

```text
/assets/relevant_rules.md
/assets/workflow_WF-RES-032.md
/assets/policy_boundaries.md
/assets/tool_manifest.json
/assets/related_cases.md
```

这样 Agent 在复杂任务中可以像读取项目文件一样读取资产上下文，同时资产模块仍然保持独立。

### 6.3 使用子 Agent 分工

在 DeepAgents 内部可以设计专门的子 Agent：

- `AssetRetrieverAgent`：检索和组装任务相关资产。
- `PolicyGuardAgent`：检查权限、风险和审批要求。
- `ReflectionAgent`：任务结束后提炼候选资产。
- `EvaluationAgent`：基于历史案例验证候选资产。

这些子 Agent 属于 DeepAgents 适配实现，不应成为资产模块的核心领域模型。

## 7. 业务 Skill 资产与 Agent Skills 投影机制

### 7.1 基本判断

主流 Agent Skills 机制通常采用文件化的消费形态：

```text
Skill 目录
  -> SKILL.md
  -> scripts/
  -> references/
  -> templates/
```

Agent 运行时先根据 Skill 的名称和描述判断是否相关，再按需读取 `SKILL.md`，最后渐进式访问脚本、参考资料、模板和工具。这种机制的核心价值是：

- 避免一次性把全部能力塞进上下文。
- 让 Agent 能按任务需要渐进读取能力说明。
- 让复杂能力可以携带脚本、模板、参考文件和示例。
- 让 Skill 成为 Agent 可发现、可执行、可复用的能力包。

资产管理服务与这种机制不冲突。二者解决的问题不同：

```text
Agent Skills 机制：解决 Agent 如何按需发现和使用能力。
资产管理服务：解决这些能力从哪里来、谁审批、哪个版本有效、谁能用、用了以后效果如何。
```

因此，资产服务不应替代 Agent Skills 机制，而应作为业务 Skill 的治理源头。

### 7.2 Source of Truth 与 Runtime Projection

推荐将业务 Skill 拆成两个层次：

```text
资产管理服务：Source of Truth
Agent Skills 目录或后端：Runtime Projection
Agent Runtime：Consumer
```

也就是说，正式发布的业务 Skill 资产存放在资产管理服务中，经过投影后生成 Agent 可识别的 Skill Bundle。

```mermaid
flowchart LR
  A["资产管理服务<br/>正式资产库"] --> B["Skill Projection Service<br/>技能投影服务"]
  B --> C["Skill Bundle<br/>SKILL.md + scripts + references"]
  C --> D["DeepAgents Backend<br/>/skills/ 或 StoreBackend"]
  D --> E["Agent Runtime"]
  E --> F["按 description 匹配"]
  F --> G["读取 SKILL.md"]
  G --> H["按需调用脚本 / 参考文件 / 工具"]
  H --> I["Asset Gateway<br/>权限校验与使用记录"]
```

这样，Agent 运行时仍然遵循 Skills 的渐进式披露方式；资产服务则负责企业级治理、版本、权限、审计和发布。

### 7.3 Skill Projection Service

`Skill Projection Service` 负责把资产服务中的业务 Skill 资产转换为 Agent 可消费的文件化结构。

示例输出：

```text
/skills/
  schedule-disruption-reschedule/
    SKILL.md
    references/
      workflow.md
      policy.md
      examples.md
    scripts/
      validate_input.py
      build_impact_report.py
    manifest.json
```

`SKILL.md` 应保持轻量，只放 Agent 选择和启动该 Skill 所需的说明。

示例：

```markdown
---
name: schedule-disruption-reschedule
description: 当设备故障、插单、物料短缺导致计划变更时，用于评估影响范围、加载调度约束、生成重排建议并检查审批边界。
---

## 使用方式

1. 读取任务上下文中的工厂、产线、设备、订单和异常类型。
2. 调用 Asset Gateway 获取当前发布版本的规则、案例和工具清单。
3. 生成候选方案前必须调用 `check_policy`。
4. 涉及跨车间调拨、交期承诺修改、正式计划写回时，必须发起审批。
5. 输出方案时说明引用的资产编号、版本和证据链。

## 支持文件

- 完整流程说明见 `references/workflow.md`
- 风险边界见 `references/policy.md`
- 历史案例见 `references/examples.md`
```

### 7.4 哪些资产应转成 Skill

不是所有资产都应转成 Agent Skill。

适合转成 Skill 的资产：

- 工作流资产。
- 调度技能资产。
- 可重复任务处理流程。
- 带脚本或工具调用步骤的能力包。
- 需要 Agent 自主选择调用的业务能力。

示例：

- 设备故障重排 Skill。
- 插单影响评估 Skill。
- 物料短缺分析 Skill。
- 交期风险巡检 Skill。
- 计划变更审批 Skill。

不适合直接转成 Skill 的资产：

- 单条规则。
- 单个接口定义。
- 单个历史案例。
- 指标口径。
- 术语解释。
- 主数据语义映射。

这些更适合作为 Skill 运行时检索、读取或引用的支撑资产。

推荐关系：

```text
Skill 资产 = 可执行业务能力包
规则 / 案例 / 接口 / 指标 / 术语 = Skill 可引用的支撑资产
```

### 7.5 DeepAgents 下的落地方式

结合 `langchain-ai/deepagents`，首期建议：

1. 资产服务维护正式 Skill 资产。
2. Agent 启动或任务开始时，根据用户权限、工厂、产线和任务场景，从资产服务获取可用 Skill 列表。
3. Agent Asset Adapter 调用 Skill Projection Service，将可用 Skill 投影到 DeepAgents 可读取的 `/skills/` 目录或后端存储。
4. 创建 DeepAgent 时传入 Skill 路径和资产网关工具。
5. Agent 根据 Skill 描述自主选择是否读取并调用 Skill。
6. Skill 内部如需读取规则、案例、工具清单或执行业务工具，必须通过 Asset Gateway。
7. 任务结束后，通过 `record_usage` 和 `propose_candidate` 回传使用情况和候选资产。

示意：

```python
create_deep_agent(
    model=model,
    backend=backend,
    skills=["/skills/"],
    tools=[
        search_assets,
        get_asset,
        resolve_context,
        check_policy,
        record_usage,
        propose_candidate,
    ],
)
```

### 7.6 需要遵守的边界

为了不违背 Agent Skills 的设计初衷，需要遵守以下边界：

- 不把资产服务当成巨型知识库一次性塞给 Agent。
- 不绕过 Skill 的渐进式披露机制。
- 不把每个资产都包装成 Skill，避免 Skill 列表爆炸。
- Skill Bundle 在运行时仍然表现为 `SKILL.md`、支撑文件和脚本。
- 只有正式发布且当前用户有权使用的 Skill 资产，才能投影给正式任务 Agent。
- 候选资产不能直接影响正式调度任务。
- Skill 内脚本和业务工具调用必须受权限、审批和审计约束。
- Agent 对 Skill 的使用结果必须回传资产模块，用于审计、价值度量和后续沉淀。

## 8. 典型交互流程

### 8.1 Agent 执行调度任务

```mermaid
sequenceDiagram
  participant U as 用户
  participant A as Agent
  participant AG as Asset Gateway
  participant AL as 资产库
  participant T as 工具服务
  participant P as 治理服务

  U->>A: 提交调度任务
  A->>AG: resolve_context(task_context)
  AG->>AL: 检索规则、工作流、案例、工具
  AL-->>AG: 返回资产包
  AG-->>A: 返回任务相关资产上下文
  A->>P: check_policy(plan)
  P-->>A: 返回风险边界和审批要求
  A->>T: call_asset_tool(tool_id, input)
  T-->>A: 返回分析结果
  A->>U: 输出方案、依据和待审批动作
  A->>AG: record_usage(asset_usage)
```

### 8.2 Agent 沉淀候选资产

```mermaid
sequenceDiagram
  participant A as Agent
  participant AG as Asset Gateway
  participant C as 候选资产池
  participant V as 验证审批服务
  participant AL as 正式资产库

  A->>AG: propose_candidate(candidate)
  AG->>C: 写入候选资产
  C->>V: 发起验证
  V-->>C: 返回验证结果
  V->>C: 人工审批
  C->>AL: 发布为正式资产
```

### 8.3 业务 Skill 资产投影给 Agent

```mermaid
sequenceDiagram
  participant A as Agent Runtime
  participant AD as Agent Asset Adapter
  participant AG as Asset Gateway
  participant SP as Skill Projection Service
  participant SB as Skill Backend

  A->>AD: 请求当前任务可用 Skills
  AD->>AG: 查询用户、工厂、场景可用的正式 Skill 资产
  AG-->>AD: 返回 Skill 资产清单与版本
  AD->>SP: projection(skills, runtime_context)
  SP->>SB: 写入 SKILL.md、references、scripts
  SB-->>A: 暴露 /skills/ 或后端 Skill 文件
  A->>A: 根据 description 匹配并渐进读取 Skill
  A->>AG: record_usage(skill_asset_id, version, task_id)
```

## 9. 技术选型建议

### 9.1 DeepAgents 支持 Python

当前选型准备基于 `langchain-ai/deepagents`。根据 DeepAgents Python 文档，Python 版本支持以下核心能力：

- `create_deep_agent` 创建 Agent。
- 工具调用。
- 文件系统上下文。
- 子 Agent。
- memory。
- human-in-the-loop。
- skills。

其中 Skills 机制也支持 Python 路径：

```text
Skill 目录
  -> SKILL.md
  -> scripts/
  -> references/
  -> templates / assets
```

Agent 启动时读取 `SKILL.md` frontmatter，根据名称和描述判断是否相关；任务匹配后，再渐进式读取完整 `SKILL.md`、脚本、参考文件和模板。

因此，首期 DeepAgents Runtime、Agent Asset Adapter 和 Skill Projection Service 都可以优先采用 Python 实现。

### 9.2 首期推荐技术栈

首期目标是尽快验证以下闭环：

```text
资产定义
  -> Skill 投影
  -> Agent 调用资产
  -> 治理校验
  -> 使用记录
  -> 候选资产沉淀
```

推荐首期技术栈：

```text
后端服务：Python FastAPI
Agent Runtime：Python DeepAgents
Agent Asset Adapter：Python
Skill Projection Service：Python 模块
数据库：PostgreSQL + pgvector
缓存 / 轻量队列：Redis
文件与附件存储：MinIO 或 S3 兼容对象存储
接口协议：OpenAPI / HTTP JSON
```

这种方案的优点：

- 语言栈统一，开发效率高。
- 更贴近 DeepAgents Python 文档和生态。
- Skill 投影、脚本执行、资产检索、Agent 编排都可以在 Python 内快速打通。
- 适合早期验证资产协议和业务闭环。

首期仍需保持清晰边界：

```text
Asset Management Service
  -> Asset Gateway
  -> Agent Asset Adapter
  -> Python DeepAgents Runtime
```

也就是说，即使语言统一，也不能把资产管理逻辑直接写死在 Agent Runtime 内。

### 9.3 长期演进选项

如果后续资产管理模块变成企业级治理系统，并且需要重度处理以下能力：

- 复杂权限。
- 审批流。
- 版本治理。
- 审计合规。
- 多系统集成。
- 多 Agent 共用资产。
- 高并发资产检索和工具治理。

则可以考虑将资产管理核心服务演进为：

```text
Java 21 / Kotlin + Spring Boot
```

同时保留：

```text
Agent Runtime：Python DeepAgents
Skill Projection Service：Python
Asset Gateway：OpenAPI / HTTP JSON / 后续可扩展 MCP
```

这种长期形态可以理解为：

```text
资产管理服务按企业级工业系统建设。
Agent Runtime 按 DeepAgents Python 生态建设。
二者通过稳定 Asset Gateway 协议解耦。
```

### 9.4 当前建议

当前阶段更推荐：

```text
Python FastAPI + Python DeepAgents + PostgreSQL + pgvector
```

但架构上保留独立服务边界和 Asset Gateway 协议边界。这样既能快速形成 MVP，又不会阻塞后续将资产管理核心迁移或拆分为更重的企业级服务。

## 10. 后续需要细化的问题

- 资产对象模型字段和不同资产类型的专属字段。
- Agent 身份、权限和任务上下文模型。
- 候选资产自动识别规则。
- 正式任务、仿真任务和测试任务的隔离机制。
- 资产包的结构化格式。
- DeepAgents 工具封装方式和错误处理规范。
- 资产价值度量指标和任务结果回传口径。
- 首期工程部署形态：单体模块化部署，还是 Agent Runtime 与 Asset Management 分服务部署。
- 业务 Skill 资产的字段模型、投影规则、版本同步策略和运行时缓存策略。
- 首期是否统一采用 Python FastAPI + Python DeepAgents，长期是否保留 Java/Kotlin 资产治理服务演进路径。
