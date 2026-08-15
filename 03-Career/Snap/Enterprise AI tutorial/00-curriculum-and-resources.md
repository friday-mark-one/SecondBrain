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

### Topic 1 — Enterprise AI rollout & governance (maps to: vendor ownership + consolidate/sunset)

Snap's arc: built SEAI chatbot (Q3 2024, OpenAI/DeepSeek wrapper + homegrown RAG) → bought wave 2025-26 (ChatGPT Enterprise all-FTE, Glean, Gemini/NotebookLM, Cursor/Claude Code/Codex seats, Slack AI & Agentspace & Agentforce pilots) → overlap pressure → consolidation posture ("still learning which solutions work best"), channel/docs consolidation, ENTAI Jira program, AI Champions, AICOE. Governance: no user data in AI tools, 90-day retention, connector-by-connector security review, Okta SSO/SCIM, per-feature disablement, Glean Protect redaction, human review of AI output.

### Topic 2 — MCP & tool connectivity (the crown-jewel evolution story; maps to: MCP servers + Slack/Jira connectivity)

Ad-hoc per-team MCP (Snapchat/mcp, Java, ads-domain) and grassroots snap-bridge-mcp (one laptop server, ~724 tools, Chrome-cookie auth — later removed) → security-owned local MCP Proxy in snapaccess (approved catalog, auth injection, audit; Aug 2025) → MCP Golden Path RFC (Jan 2026) → central MCP Gateway on the mesh (Docker enterprise gateway + Snap auth sidecar, Feb 2026) → per-service MCP identity (Mar 2026) → CP/DP split + Spanner + gwctl (v2) → single local entry consolidations (Jun 2026) → Casper agents as first-class consumers → Guard RBAC, code-mode token optimization. Auth spine: LCA → SecProxy signed context → sidecar authenticate → Guard policy → ATS for per-user OAuth to 3P (servers never see tokens).

### Topic 3 — RAG & enterprise knowledge (maps to: RAG pillar)

Three generations: SEAI homegrown RAG (Flowrida DAGs ingest wiki/GHE/Drive → embeddings → BigQuery vector search) → RAGnarok platform (GCS→Pub/Sub→Cloud Tasks ingestion into Vertex AI RAG Engine, nightly Ragas evals → BQ → Looker) → Glean (bought; permissions-mirroring connectors, no-code agents). Plus SnappyBot (production IT-support RAG agent on Google ADK w/ 4-layer defense), ai-rag-api (ads support), and the fragmented vector-store landscape (BQ Vector Search vs Vertex Vector Search vs pgvector vs S3 Vectors — with a real bake-off: BQ VS won on 4.3x throughput, ~10% cost). AWS translation: Bedrock Knowledge Bases, OpenSearch, pgvector on RDS, Kendra/Q.

### Topic 4 — LLM serving & model access (maps to: owning a vendor's platform)

No single gateway; layered policy instead: Vertex AI as the only prod LLM transport (compliance: data residency, audit) → ATS as the auth-translation chokepoint for OpenAI API → AGI-Inference (self-hosted OSS models, OpenAI-compatible API, model-registry YAML onboarding) → gke-llm-gateway (LiteLLM-style, evals cluster only) → LLM router in design (spend policy, model routing) → GenAI Proxy (product-side My AI: key custody, masking, rate limits, cost metering). AWS translation: Bedrock (+ inference profiles), API Gateway/ALB proxy patterns, LiteLLM/Portkey.

### Topic 5 — LLM observability, evals & cost (maps to: observability pipeline ownership)

Langfuse self-hosted (traces, scores, prompt mgmt; per-project keys in Spookey; off-mesh behind secproxy) as the standard; Opik playground for prompt iteration; AGI Eval (config-based harness, Kubeflow/Barista runners, results in BQ); Ragas for RAG quality; claudenomics (org-wide token-spend dashboard, "signal not score"), Manager AI Engagement Dashboard (BQ + Flowrida + Looker; usage data treated as sensitive), per-review cost footers in CodePal (model routing saved ~$730k). AWS translation: Langfuse on ECS/EKS, Bedrock invocation logs → CloudWatch/Athena, cost allocation tags.

### Topic 6 — Data pipelines for AI (maps to: data pipelines pillar)

Flowrida = managed Airflow (the workhorse): 2x-daily doc-ingestion DAGs (Confluence/GHE/Drive → chunk → embed → index), embedding backfills, usage-metrics DAGs. BigQuery-centric patterns: remote Vertex embedding models callable in SQL, incremental embedding (anti-join), TreeAH vector indexes, in-warehouse VECTOR_SEARCH, eval + token logs landing in BQ feeding Looker. Temporal where fixed-schedule doesn't fit. AWS translation: MWAA/Step Functions, Glue, Redshift/Athena, OpenSearch ingestion pipelines.

### Topic 7 — AI coding agents & vibe coding for non-devs (maps to: vertical 2 — Claude Code apps to production standard)

CodePal evolution (Aug 2025 single-pass Gemini PR reviewer at $0.005/review → configs & auto-review → multi-pass + code-search tools → conversational reviews → risk triage → auto-approval as a quality gate; 45k reviews/1,100 repos). Casper (autonomous agent: Temporal + ephemeral k8s jobs running Claude Code; per-run identities; 500+ prod PRs). Agent Sandbox "abox" (egress filtering, prompt-injection threat model). Error.AI (CI failure analysis). Non-dev enablement: Glean no-code agents (tiered publishing governance), Google Workspace Studio, vibe-coding office hours, autohost (paste-a-prompt deployment for non-engineers — grassroots), AI Hackathon with shared GCP project + credits. The "productionize safely" playbook: sandboxing, human review requirement, guardrailed hosting paths, snap-semgrep scanning.

## Cross-topic themes (the senior lens, distilled)
These patterns repeated in every topic; recognizing them is most of the seniority:

1. **Paved road** — when every team needs the same machinery, run it once centrally as a product (service mesh, Flowrida, MCP catalog, model-registry, autohost).
2. **Blast radius shrinks as systems mature** — one cluster → fleets; one shared service account → per-service identity; one corpus → per-bot corpora.
3. **Shadow usage is a demand signal** — absorb it into the paved road, don't just ban it (snap-bridge → MCP gateway; consumer ChatGPT → enterprise rollout).
4. **Rehearse before enforcing** — shadow mode for Guard policies, CodePal auto-approval, eval gates. Evidence earns authority.
5. **Swap credentials, never forward them** — SecProxy → gateway → ATS; IAM roles over API keys everywhere.
6. **Data gravity** — move compute to where the data lives (vector search in the warehouse; embeddings via SQL).
7. **Quality is uptime; cost is a metric** — nightly evals with alerts; routing, caching, and batching as the three cost levers.
8. **Ownership or rot** — agents funded by owning teams' KTLO; vibe-coded apps need named owners; unowned AI is risk with a login page.