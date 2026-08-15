# Enterprise AI Prep — Curriculum & Source Index

Generated 2026-08-09 from four parallel research sweeps over Glean, Slack, GitHub Enterprise, and codesearch.

## Framing

Bharath is joining a new company's Enterprise AI team (roadmap: enterprise AI rollout for a major LLM vendor — observability, data pipelines, MCP, RAG, tool connectivity — plus vibe-coding enablement for non-developers, productionized safely; AWS-based). 

We can't see that company's internals, so we study **Snap's analogous systems**, which cover every pillar 1:1. Concepts transfer; only vendor names change (GCP→AWS translations included per topic).

Learning style: beginner-friendly on cloud infra, step-by-step, one topic per session, told as an **evolution story** — initial problem → candidate solutions → what was chosen and why → what broke next → how that was solved.

## Binder map (all 8 topics taught 2026-08-09)


| File | Topic | One-liner |
| --- | --- | --- |
| 01 | 0 — Cloud infra | one machine → k8s → multi-cluster paved road |
| 02 | 2 — MCP & connectivity | credential-swapping gateway chain; EKS-vs-ECS + sequence Q&A |
| 03 | 3 — RAG | SEAI → RAGnarok → Glean; permissions & evals |
| 04 | 5 — Observability | traces, eval ladder, cost levers, claudenomics |
| 05 | 6 — Data pipelines | Airflow/Flowrida, three pipeline shapes, LLM-as-step |
| 06 | 4 — LLM serving | three roads to models; the gateway gaps |
| 07 | 7 — Agents & vibe coding | trust ladder, Casper infra, the deployment gap |
| 08 | 1 — Rollout & governance | build→buy→sprawl→ consolidate; vendor ownership |

​

Each notes file contains: the evolution story condensed, a Mermaid diagram, AWS translation, day-1 senior questions, a recap-in-one-breath, and self-tests with answers.
​

## Curriculum (recommended order)
### Topic 0 — Cloud infra fundamentals, told through Snap's stack

The substrate everything else runs on. One machine → fleet → Kubernetes → many clusters → service mesh with a paved road: Switchboard (service registry), Service Mesh + Mesh CI/CD (Spinnaker), Bootstrap (scaffolding), Workload Identity (no exported keys), Spookey (secrets), Spanner/BigQuery/GCS (state/analytics/blobs), Temporal (durable workflows), SecProxy (authn edge). AWS translation: EKS, IAM roles/IRSA, Secrets Manager, DynamoDB/Redshift/S3, ALB+OIDC, Step Functions/Temporal Cloud.

​### Topic 1 — Enterprise AI rollout & governance (maps to: vendor ownership + consolidate/sunset)

Snap's arc: built SEAI chatbot (Q3 2024, OpenAI/DeepSeek wrapper + homegrown RAG) → bought wave 2025-26 (ChatGPT Enterprise all-FTE, Glean, Gemini/NotebookLM, Cursor/Claude Code/Codex seats, Slack AI & Agentspace & Agentforce pilots) → overlap pressure → consolidation posture ("still learning which solutions work best"), channel/docs consolidation, ENTAI Jira program, AI Champions, AICOE. Governance: no user data in AI tools, 90-day retention, connector-by-connector security review, Okta SSO/SCIM, per-feature disablement, Glean Protect redaction, human review of AI output.

### Topic 2 — MCP & tool connectivity (the crown-jewel evolution story; maps to: MCP servers + Slack/Jira connectivity)

Ad-hoc per-team MCP (Snapchat/mcp, Java, ads-domain) and grassroots snap-bridge-mcp (one laptop server, ~724 tools, Chrome-cookie auth — later removed) → security-owned local MCP Proxy in snapaccess (approved catalog, auth injection, audit; Aug 2025) → MCP Golden Path RFC (Jan 2026) → central MCP Gateway on the mesh (Docker enterprise gateway + Snap auth sidecar, Feb 2026) → per-service MCP identity (Mar 2026) → CP/DP split + Spanner + gwctl (v2) → single local entry consolidations (Jun 2026) → Casper agents as first-class consumers → Guard RBAC, code-mode token optimization. Auth spine: LCA → SecProxy signed context → sidecar authenticate → Guard policy → ATS for per-user OAuth to 3P (servers never see tokens).

### Topic 3 — RAG & enterprise knowledge (maps to: RAG pillar)

Three generations: SEAI homegrown RAG (Flowrida DAGs ingest wiki/GHE/Drive → embeddings → BigQuery vector search) → RAGnarok platform (GCS→Pub/Sub→Cloud Tasks ingestion into Vertex AI RAG Engine, nightly Ragas evals → BQ → Looker) → Glean (bought; permissions-mirroring connectors, no-code agents). Plus SnappyBot (production IT-support RAG agent on Google ADK w/ 4-layer defense), ai-rag-api (ads support), and the fragmented vector-store landscape (BQ Vector Search vs Vertex Vector Search vs pgvector vs S3 Vectors — with a real bake-off: BQ VS won on 4.3x throughput, ~10% cost). AWS translation: Bedrock Knowledge Bases, OpenSearch, pgvector on RDS, Kendra/Q.

### Topic 4 — LLM serving & model access (maps to: owning a vendor's platform)

No single gateway; layered policy instead: Vertex AI as the only prod LLM transport (compliance: data residency, audit) → ATS as the auth-translation chokepoint for OpenAI API → AGI-Inference (self-hosted OSS models, OpenAI-compatible API, model-registry YAML onboarding) → gke-llm-gateway (LiteLLM-style, evals cluster only) → LLM router in design (spend policy, model routing) → GenAI Proxy (product-side My AI: key custody, masking, rate limits, cost metering). AWS translation: Bedrock (+ inference profiles), API Gateway/ALB proxy patterns, LiteLLM/Portkey.

### Topic 5 — LLM observability, evals & cost (maps to: observability pipeline ownership)

Langfuse self-hosted (traces, scores, prompt mgmt; per-project keys in Spookey; off-mesh behind secproxy) as the standard; Opik playground for prompt iteration; AGI Eval (config-based harness,

Kubeflow/Barista runners, results in BQ); Ragas for RAG quality; claudenomics (org-wide token-spend

dashboard, "signal not score"), Manager AI Engagement Dashboard (BQ + Flowrida + Looker; usage data

treated as sensitive), per-review cost footers in CodePal (model routing saved ~$730k). AWS

translation: Langfuse on ECS/EKS, Bedrock invocation logs → CloudWatch/Athena, cost allocation tags.

​

### Topic 6 — Data pipelines for AI (maps to: data pipelines pillar)

Flowrida = managed Airflow (the workhorse): 2x-daily doc-ingestion DAGs (Confluence/GHE/Drive →

chunk → embed → index), embedding backfills, usage-metrics DAGs. BigQuery-centric patterns: remote

Vertex embedding models callable in SQL, incremental embedding (anti-join), TreeAH vector indexes,

in-warehouse VECTOR_SEARCH, eval + token logs landing in BQ feeding Looker. Temporal where

fixed-schedule doesn't fit. AWS translation: MWAA/Step Functions, Glue, Redshift/Athena,

OpenSearch ingestion pipelines.

​

### Topic 7 — AI coding agents & vibe coding for non-devs (maps to: vertical 2 — Claude Code apps to production standard)

CodePal evolution (Aug 2025 single-pass Gemini PR reviewer at $0.005/review → configs & auto-review

→ multi-pass + code-search tools → conversational reviews → risk triage → auto-approval as a

quality gate; 45k reviews/1,100 repos). Casper (autonomous agent: Temporal + ephemeral k8s jobs

running Claude Code; per-run identities; 500+ prod PRs). Agent Sandbox "abox" (egress filtering,

prompt-injection threat model). Error.AI (CI failure analysis). Non-dev enablement: Glean no-code

agents (tiered publishing governance), Google Workspace Studio, vibe-coding office hours,

autohost (paste-a-prompt deployment for non-engineers — grassroots), AI Hackathon with shared GCP

project + credits. The "productionize safely" playbook: sandboxing, human review requirement,

guardrailed hosting paths, snap-semgrep scanning.

​

## Cross-topic themes (the senior lens, distilled)

​

These patterns repeated in every topic; recognizing them is most of the seniority:

1. **Paved road** — when every team needs the same machinery, run it once centrally as a

   product (service mesh, Flowrida, MCP catalog, model-registry, autohost).

2. **Blast radius shrinks as systems mature** — one cluster → fleets; one shared service

   account → per-service identity; one corpus → per-bot corpora.

3. **Shadow usage is a demand signal** — absorb it into the paved road, don't just ban it

   (snap-bridge → MCP gateway; consumer ChatGPT → enterprise rollout).

4. **Rehearse before enforcing** — shadow mode for Guard policies, CodePal auto-approval,

   eval gates. Evidence earns authority.

5. **Swap credentials, never forward them** — SecProxy → gateway → ATS; IAM roles over API

   keys everywhere.

6. **Data gravity** — move compute to where the data lives (vector search in the warehouse;

   embeddings via SQL).

7. **Quality is uptime; cost is a metric** — nightly evals with alerts; routing, caching,

   and batching as the three cost levers.

8. **Ownership or rot** — agents funded by owning teams' KTLO; vibe-coded apps need named

   owners; unowned AI is risk with a login page.

​

## Flags / access gaps (as of 2026-08-09)

- Wiki (Confluence) direct reads fail: snap-bridge auth expired → log into wiki.sc-corp.net in

  Chrome to fix. Glean still surfaces most wiki content.

- No read permission: Joe Quinn's "MCPs at Snap" product spec

  (docs.google.com/document/d/1I3Vw5ovGspNA3iH7bFaZQG470j2gBN7Q9-VA7xECxP0) and

  devprod-project-tracking Q3 roadmap file (via Glean).

​

---

​

# Source index

​

## Topic 1 — Enterprise AI rollout & governance

Wikis: /display/Engineering/Internal+AI+at+Snap (go/genAI) • /display/Engineering/ChatGPT+Enterprise •

/display/Engineering/Glean+at+Snap + Glean Roadmap (Engineering & IT spaces) • /display/IT/Guide+to+AI •

/display/Engineering/AI+Champions • /display/SA/Snap+Enterprise+AI • /display/TOOL/Enterprise+AI+FAQs •

/display/TOOL/AI+Code+Assistants • /display/TOOL/Claude+Code (go/claudewiki) • /display/TOOL/Codex+CLI •

/display/TOOL/The+AI+Loop (go/loop) • /display/IT/Enterprise+AI+Tool+Guide+for+Snap • AI Learning Center (IT space).

Docs: Snap Policy on Generative AI Use (gdoc 1MjEGHe8tEuSX_qCXOc6gLpIBOPFqckC-oq5WbeUhmeE) •

Responsible AI Principles (1sK4jeANHgqIu…) • Cursor Security Review REV-34197 (16M55QlaFHdGZ…) •

Glean Agents Day-1 Governance (1w5vhHRdOM2h…) • AI Business Tools MVP (16KQ65LtJTlme…) •

Agentic AI Progress Tracker + squad charter (Coda docs.superhuman.com/d/_dSGpGNMsDJw) • DevProd AI Roadmap (Coda _d-E78_MEHTR).

Jira: ENTAI project (id 34903) — ENTAI-34/35/36 (Cursor), 43/44 (MCP/agentic), 46 (Agentspace/Agentforce),

50–58 (ChatGPT connectors), 65 (Slack AI closeout), 66–69; ITPMO-933; ITPA-7378; CREATE-87321.

Repos: Snapchat/dev-ai-orchestrator (SEAI) • Snapchat/enterprise-ai-agents (+ go/ai-docs site) • Snapchat/snap-ai-plugins.

Slack: #ai-general, #ai-eng, #gen-ai-eng-support, #internal-ai-support, #chatgpt-announcements,

#chatgpt-discuss, #glean-discuss, #ai-wins, #techlounge, #claudenomics-support.

People: Andy Donovan, Aaron Daly, Jenny Tang, Ray Timmons, Emily Vanidestine/Ines Czechowski (AICOE),

Stephanie Luna/Tommy Mulder (Glean); dev side: Kwesi Morgan-Arhin, Dani Hreha, Kirandeep Paul,

Prudhvi Vatala (EM), Joe Quinn (PM).

​

## Topic 2 — MCP & tool connectivity

Design docs: Snap MCP Gateway Design (go/mcp-gateway; gdoc 18olhzkZouM-Fuxu3CphPLGHwcLaMfW7WDymBjlyT6b8, Kevin London, Feb 2026) •

[RFC] MCP Golden Path (go/mcp-golden-path; 1bjVzoqc37HTG4I63xZjZ0Yt_tGS1M8HNmnDSMw54G9E, Jan 2026) •

Per-Service MCP Identity (1eJsTuPnGzytHF6jFRo-XChBel2c4C1aZGt1so7kP39I, Mar 2026) •

Gateway v2 Migration (go/mcp-gateway-v2; 1Ayl_QYlR5Si1jzCIZUX-2kn31oN1Ecd49TkryOfx-jY) •

Credential Delegation Options (1OgK7VS_y5PDieMkpa8mEtN-WJF-i1yvi85k858x3TEU) •

SNAP x Docker BYOC (1_T5dSlgnDWduPFEFMV_GZJvb9zteawenn4ViIqKHAuU) •

Security reviews REV-39285 (appsec), REV-39287 (infra sec).

Wikis/docs: /display/SEC/MCP+Proxy (wiki.sc-corp.net/x/CojTJ) • ai-docs.sc-corp.net/docs/mcp/gateway/ • go/casper-docs.

Repos & key files: Snapchat/mcp-servers — mcp-gateway/README.md, mcp-gateway/servers.yaml,

mcp-catalog/mcp-catalog.yaml, tools/guard-setup/main.go, docs/bootstrapping-new-mcp-mesh-service.md •

Snapchat/mcp (Java, ads) • Snapchat/snap-bridge-mcp (docs/system-design.md) • Snapchat/mcp-sentinel •

Snapchat/snapaccess • docker/mcp-gateway-enterprise-snap (github.com) • Snapchat/sc-ats(-service) •

Snapchat/agentic-ai (Auton SDK).

Dashboards: grafana.sc-corp.net/d/mcp-gateway-overview • /d/mcp-fleet-ops.

Slack: #mcp-support (C09DF1UPELE), #mcp-servers, #ai-agent-infra, #casper-support, #ai-eng.

People: Kevin London (gateway), Jeffrey Lee-Chan (snap-bridge), Yuan Yan (ATS per-user OAuth),

Luka Zdilar (attested context propagation), Devesh Yamparala (agent ledger).

​

## Topic 3 — RAG & enterprise knowledge

RAGnarok: /display/ITI/RAGnarok+-+The+knowledge+keeper • repo Snapchat/sc-it-ragnarok.

SnappyBot: repo Snapchat/snappybot-reasoning. ai-rag-api: repo Snapchat/ai-rag-api (#ai-rag-api-ops;

token logs ai-rag-api-prd.openai_usage.token_counts). SEAI RAG: Snapchat/dev-ai-orchestrator.

Vector bake-offs: Snapchat/seo-ml-retrieval (sources/bqvs, sources/vvs2) • Bento embedding store

design (1M150kzKtFIzEf4nIvEjm27WVLJTht-5zsW_s2RPW2NM).

Glean: tenant snap-prod-be.glean.com, go/glean; agent frameworks wiki pageId=858917118.

Slack: #glean-discuss, #internal-ai-support, #casper-support.

​

## Topic 4 — LLM serving & model access

LLM Hub: /display/GME/LLM+Hub • AGI-Inference: /display/GME/AGI-Inference+Service (go/agi-inference-wiki),

endpoint prod--agi-inference.mesh.sc-corp.net/v1/chat/completions • repo Snapchat/model-registry.

ATS: go/ats — /display/SEC/Auth+Translation+Service+%28ATS%29+User+Guide • /display/SEC/OpenAI+via+ATS •

/display/SEC/Guidelines+for+OpenAI+access • playground.sc-corp.net.

Gateways/routers: Snapchat/gke-llm-gateway (README, docs/deployment.md) •

Snapchat/snap_bench/docs/design/research/oss-survey.md (LLM router design) •

GenAI Proxy (My AI; gdoc 1vMm9C7Wg5vAMgy6XqF9OdEcCJ_c4Uw8h6Je_Me4Qtqg).

Vertex policy exemplars: SnapIAM agent doc (1W5fW4QWj51OkzZltohXlAVnOfpzUPyPVvNqilc59OMY) •

Snapchat/easylens-qa-agent/docs/vertex-ai-data-handling.md • training-platform PR #24170.

Slack: #llm-platform-guests, #eis-guests (OpenAI keys), #prodsec (ATS).

​

## Topic 5 — LLM observability, evals & cost

Langfuse: langfuse.sc-corp.net • integration guide gdoc 1hL2e5ZMaEHG6N2BdlqOV5j75BwHoOe2jX_mTj4jBpZw •

mesh endpoint http://langfuse.snap • secproxy allowlist via Snapchat/secproxyconfig • owners Ryan So,

Michael Hankin • adopters: Casper, sigma-agents, SnapOS/jtbdos (issue jtbdos#1099), agent-dredd.

Opik: llm-evaluation-platform.sc-corp.net • /display/TIKB/Opik • REV-35775 • owner Saurabh Thakur.

AGI Eval: repo Snapchat/llm-tools • design gdoc 1WYFndvaYWt67mK7XzNnVryHuenqYLI-bVXwPv3Nv85E.

Cost: claudenomics (#claudenomics-support) • Manager AI Engagement Dashboard (BQ + Flowrida + Looker) •

CodePal per-review cost footers. Slack: #langfuse, #ai-general.

​

## Topic 6 — Data pipelines for AI

Flowrida: flowrida.sc-corp.net • /display/DATAHELP/Flowrida+v2 • repo Snapchat/flowrida •

#flowrida / #flowrida-v2, go/datahelp. Patterns: BQ remote embedding models (us.vertex_ai_conn),

TreeAH indexes, VECTOR_SEARCH; RAGnarok SEAI ingestion DAGs; CUP (Snapchat/cup, #cup-xfn) for

product-side LLM feature extraction; Bento Workflow/Barista for training/eval orchestration.

​

## Topic 7 — AI coding agents & vibe coding

CodePal: docs github.sc-corp.net/pages/snapchat/enterprise-ai-agents/docs/codepal/overview/ •

/display/TOOL/AI+Code+Reviews • Snapchat/build-infra cmd/codereview/README.md (+ internal/app/codereview) •

best independent deep-dive: Snapchat/mesh-slack-bot/docs/codepal-codesearch-learnings.md •

"Transforming the PR Review at Snap" (1Ptc30FwUA6btZk4ugCnzu9_fnZMc6JPkddH5Y_2F5cQ) •

PR Approvals by AI (1c7dp4gxKi1dH4iwLLHawU4OIfYG3QN82GG8HavVa-Ao) •

Semantic Code Search Vision (1Dic9EwOz0qE9k8pz64hwtCzXrVBzrFF44c9FJ11csZk) •

Code Platforms 2026 Plans (1S9KXGX2VgbrPoRUtlusMQw57Gn5niNFlsS-tdxswRw — verify id) •

example config Snapchat/training-platform/.github/codepal.yaml • lead Casey Duquette • #codepal.

Casper: ai-docs.sc-corp.net/docs/casper • repos Snapchat/coding_agents, agents_portal •

agents-portal.mesh.sc-corp.net • DRI Cristian Hancila • #casper-support.

Error.AI: /display/TOOL/Error.AI (go/error.ai) • spec 1yiN_YOevnS2SINaci789oUHVZYFUyipWF2GWGmclGfc •

owner Ivy Li • #error-ai-support.

Sandbox/safety: Snapchat/abox (#agent-sandbox-beta) • snap-semgrep.

Non-dev: Snapchat/autohost (autohost.sc-corp.net, Matt Saunders; UNVERIFIED sanction status) •

Glean no-code agents + trainings • Google Workspace Studio • #ct-ai-workstream vibe-coding doc •

AI Hackathon (go/hackathon, #hackathon, shared project snap-it-dev).

Newsletters: ai-docs.sc-corp.net/newsletter/ (go/ai-docs).

​

## Cross-cutting reading

- Unified Data Classification Policy (org guardrails; Tier 0/1 rules).

- go/ihub — security/privacy/legal intake for new AI use cases.

- ENTAI Jira project — the entire enterprise rollout as tickets.