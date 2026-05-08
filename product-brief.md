# Product Brief: Wio Business — AI-Powered SME Onboarding

**Version:** 0.2
**Date:** 2026-05-08
**Status:** Draft

---

## Problem Statement

Current SME onboarding at Wio is rigid, manual, and one-size-fits-all. It fails to adapt to the wide spectrum of customer complexity — from a UAE sole proprietor to a multi-entity corporate group with international shareholders.

As a result:
- **Simple businesses** (Sole Establishments, ~90% of volume) face the same heavy flow as complex corporates, creating unnecessary friction and drop-off.
- **Complex businesses** are not adequately supported digitally — repeated re-asks, uncoordinated multi-team handoffs, and opaque case escalations produce a poor experience and long turnaround times.
- The journey relies on **manual data entry, static document checklists, and post-submission reviews** rather than real-time data extraction, registry integrations, and adaptive decisioning.

The north-star outcome: transform onboarding from a bottleneck into a growth engine — faster time to first transaction (T2FT), lower operational cost, and an experience that builds trust from minute one.

---

## Design Principles

| Principle | What it means |
|---|---|
| **Adaptive by design** | A single flow that dynamically adjusts to each business's complexity — speed for simple cases, full support for complex ones |
| **Smart** | AI extracts, pre-fills, and reduces manual input; real-time decisioning shapes the most efficient journey per customer |
| **Understandable** | Customers see what matters, know what's next, and receive timely communications; progress and steps are always clear |
| **Embedded compliance** | Compliance is built into the journey with real-time validation and smart requirement triggering — not layered on top |
| **Platform agnostic** | The experience works seamlessly across mobile app, web browser, and embedded in partner surfaces — same flows, same logic, same data, different shell |

---

## Architecture: Four Independent Pillars

Every application progresses across four pillars that run **in parallel** wherever possible. A Smart Orchestration Engine coordinates which modules activate, in what order, based on customer profile and incoming data.

| Pillar | Scope |
|---|---|
| **P1 — Verify Business (KYB)** | Business identity, corporate structure, ownership mapping. Entity type, jurisdiction, trade licence status. Parents, subsidiaries, UBOs, beneficial chains. Registry-sourced data with document upload as fallback. |
| **P2 — Identify & Verify People (KYC)** | Owners, directors, signatories — identity and liveness. Emirates ID / UAE Pass. Liveness / video KYC. Real-time signatory matches. Non-UAE shareholders → eIDV / attestation. Canonical Person Record reused across roles. |
| **P3 — Compliance, Risk & Fraud** | EDD, AML screening, fraud signals, risk classification. PEP · sanctions · adverse media in real-time. Device · behaviour · network signals. CRAM encoded in product. FATCA/CRS derived from canonical records. Policies as code, not playbooks. |
| **P4 — Account Setup & Product** | Provisioning, plan selection, activation, first transaction. Accounts · IBANs · cards · cheque books. AECB wired-in from day one. Reason of relationship captured upfront. Success metric = first transaction enabled, not "approved". |

---

## Users

| User | Role | Context |
|---|---|---|
| **Business Applicant** | SME owner, sole proprietor, CFO, or authorized representative | Starting application; uploads Trade License and MOA as first action |
| **Signatory / UBO** | Co-owner, director, or authorized signatory who is not the applicant | Invited via self-serve link; completes their own identity verification independently |
| **Compliance Analyst (Maker)** | Back office reviewer | Works through the ops queue; uses AI-drafted summaries to verify and populate case data |
| **Compliance Analyst (Checker)** | Second-line reviewer | Validates Maker's work; approves, declines, or escalates with a recorded reason |
| **Compliance Manager** | Team lead | Monitors queue health and SLAs; reviews escalations; oversees EDD cases |
| **AI Agent Workforce** | Orchestrated set of specialized agents | Runs checks, extracts data, drafts assessments, triages re-asks — invisible to applicants, visible to ops |
| **Auditor** | Internal or regulatory | Reads immutable event log; reconstructs any application state at any point in time |

---

## Corporate Complexity Tiers

The orchestration engine routes each application into one of three tiers based on entity type, ownership structure, and risk signals. This prevents simple cases from bearing the cost of complex ones.

| Tier | Profile | Target T2FT | Handling |
|---|---|---|---|
| **Tier 1 — Express** | Sole Establishment / single UAE owner / single signatory | < 1 hour | Fully automated. TL scan → AI extraction → UAE Pass auth → instant eligibility → account active. |
| **Tier 2 — Standard** | Standard LLC, UAE shareholders, simple ownership chain | < 24 hours | Semi-automated. Agents handle all checks; human review only on flagged items. |
| **Tier 3 — Complex** | International ownership chains, high-risk sectors (crypto, real estate, gold, charities), multi-entity groups | < 72 hours | Specialist review. Agents prepare full dossier; assigned Case Officer with cross-pillar visibility owns the case end-to-end. |

---

## Jobs To Be Done

### Business Applicant
- Start onboarding without manual data entry — scan my Trade License and let the system extract and pre-fill my company details
- Know immediately whether I'm eligible before investing time in a full application
- Understand exactly what I need to provide and why, with no surprises mid-flow
- Track each pillar's progress in real time with clear ETAs and next actions
- Pause and resume without losing progress or triggering a full restart
- Get re-asked for information in a single, targeted request — not in repeated batches

### Signatory / UBO
- Complete my identity verification from my own device without needing to visit a branch or wait for the main applicant to do it for me
- Receive a clear invitation with instructions in Arabic or English
- Understand what I'm signing and why

### Compliance Analyst (Maker)
- Open a case and see an AI-drafted summary of risk signals, extracted data, and outstanding issues — not raw documents
- See what each agent checked, what it concluded, and with what confidence
- Request additional information from the applicant in a single targeted re-ask, not a batch
- Complete a Tier 1/2 review in under 20 minutes with agent support; focus my time on Tier 3 exceptions

### Compliance Analyst (Checker)
- Validate a Maker's work with a clear diff view — what changed, what the agent flagged, what the Maker concluded
- Approve, reject, or escalate with a mandatory decision reason that feeds the audit log

### Compliance Manager
- Monitor queue health: volume, SLA compliance, TAT per tier, pending escalations
- See which agent groups are producing value vs. where human intervention is still concentrated
- Access EDD case status and quality scoring without manual reporting

### Auditor
- Access a tamper-evident, immutable event log for any application
- Filter by pillar, actor (agent or human), date range, or decision type
- Export a CBUAE-ready audit package without manual assembly

---

## Core Flows (MVP — Tier 1 & Tier 2)

### Flow 1 — Document-First Application Start (Applicant)

The applicant does not fill in a form. They scan or upload their Trade License first.

1. Applicant lands on Wio Business onboarding ("Let's get started")
2. Prompted to scan / upload Trade License (or Permit)
3. **Is doc? agent** validates the upload is a genuine document of the correct type
4. **Trade License processing agent** checks TL validity with the licensing authority (DED / DET / ADGM / DIFC / MOEC / free zone), extracts business name, activity, expiry, owner details, and checks for duplicates in Wio's system
5. **Business Activity agent** maps extracted activities against the compliance list and prompts the applicant to confirm their primary business activity
6. System presents pre-filled company profile: "Looking good, [Business Name]" — applicant reviews, confirms or corrects
7. Three upfront questions personalise the flow and feed CRAM, EDD scoping, and plan recommendation:
   - What do you plan to use Wio for? (transactional / FX / e-commerce / payroll)
   - Expected monthly volume?
   - Do you operate internationally?
8. Orchestration engine determines: entity tier, required modules, which pillars can run in parallel
9. Applicant receives a per-pillar progress tracker with explicit SLAs

### Flow 2 — Parallel Pillar Execution (AI Agents)

Once the TL is processed, pillars fire in parallel:

**P1 (KYB):**
- Registry data pre-populates business profile; upload used only as fallback
- **MOA digestion agent** compares MOA against TL, validates stamps, extracts ownership and signing authority data
- **Powers Resolution verification agent** checks Board/Shareholder resolutions and delegation of power documents
- UBO graph built automatically (≥25% threshold); non-UAE parents resolved via external KYB APIs

**P2 (KYC):**
- **Personal Documents OCR agent** extracts data from Emirates ID / passport
- UAE Pass authentication used where available
- Signatory invitation links issued per signatory; each completes their own verification independently
- Canonical Person Record created once; reused across all roles (owner, director, signatory)

**P3 (Compliance, Risk & Fraud):**
- AML / PEP / adverse media screening fires continuously — not as a discrete step
- Fraud signals (device fingerprint, behavioural biometrics, IP reputation) captured from the first tap
- CRAM computed from canonical business + person records
- EDD triggered dynamically based on sector and risk score
- FATCA/CRS derived from canonical records; customer just confirms

**P4 (Account Setup):**
- AECB wired-in as soon as Emirates ID + TL are available
- IBAN reserved and account created in "pending activation" state in parallel with P1-P3
- Plan recommendation derived from sector + expected volume (not selected upfront)
- Activation = state flip when P1-P3 close; not a sequential post-approval process

### Flow 3 — Signatory Self-Serve (Signatory / UBO)

1. Signatory receives unique link via push notification + bilingual SMS (AR/EN)
2. Completes Emirates ID / passport scan and UAE Pass liveness independently
3. Non-UAE residents: passport + remote KYC (Onfido or equivalent)
4. Status visible in real time to the main applicant and the ops team
5. Main applicant's flow continues in parallel — not blocked by pending signatories

### Flow 4 — Back Office Review (Maker / Checker)

1. Agent-powered triage classifies each case, fires automatic verifications, and drafts a structured summary before a human opens it
2. Maker opens case: sees AI summary (risk signals, extracted data, open items), not raw documents
3. **Re-ask Agent** identifies missing or inconsistent information; Maker reviews and sends a single targeted re-ask to the applicant
4. Maker populates and verifies case data (automated by **Onboarding Maker/Checker agents** for Tier 1/2)
5. Maker records decision; **Checker agent** or human Checker validates
6. Decision (Approve / Decline / Escalate) logged with mandatory reason; applicant notified automatically
7. For EDD cases: **EDD Maker** reviews EDD questions and answers, orchestrates re-asks, prepares assessment; **EDD Checker** validates before human review

### Flow 5 — Applicant Re-Ask Response

1. Applicant receives notification with a direct link to the specific item requiring action
2. Re-ask is targeted (one item or a coherent set) — never a batch of unrelated requests
3. Applicant uploads / responds; affected agents re-run automatically
4. Analyst reviews only the delta — not the full case again

### Flow 6 — Audit Trail Access (Auditor)

1. Every event is persisted as an immutable, timestamped record: submissions, check results, agent outputs, analyst actions, status changes, data accesses, overrides
2. Actor tagged on every event: system / agent name / human user
3. Auditor filters by application, pillar, actor, date range, or decision type
4. Full application state reconstructable at any past moment
5. Export to CBUAE-ready format without manual assembly

---

## AI Agent Workforce

The orchestration engine coordinates a named set of specialized agents. Agents are invisible to applicants; their outputs and reasoning are fully visible to the ops team.

**Smart Orchestration Engine** — the central brain. Determines which modules activate and in what sequence based on customer profile, document contents, and real-time risk signals.

### Group 1 — Low-Hanging Fruit (unlock value in existing journey)

| Module | Agent | Description | Status |
|---|---|---|---|
| Document Upload | **Is doc?** | Validates uploaded file is a genuine, correctly-typed document (TL, MOA, BR, Proof of Address, etc.) | Implementation in progress |
| Document Upload | **Trade License processing** | Checks TL validity with licensing authority, extracts company information, checks for duplicate entities | Exists for Account Maintenance; adapt for onboarding |
| KYB | **Business Activity agent** | Consumes business activities from TL, prompts primary activity selection, maps against compliance list | Implementation in progress |
| KYC | **Personal Documents OCR** | Extracts data from Emirates ID and passport | Operational |

### Group 2 — Operational Efficiency

| Module | Agent | Description | Status |
|---|---|---|---|
| EDD | **EDD agent** | Builds EDD profile from company information, digests public domain data, produces recommendation; routes to Re-ask Agent when additional info is needed | Not started |
| EDD | **Public domain search agent** | Searches public domain for company, shareholders, and adverse information; generates structured report | Not started |
| Document Upload | **MOA digestion** | Compares MOA against TL, validates stamps, extracts MOA data and ownership structure | Not started |
| Document Upload | **Powers Resolution verification** | Validates Board/Shareholder resolutions and delegation of power documents | AI model in progress |
| Support | **Re-ask Agent** | Identifies missing or inconsistent information; validates and routes a single targeted re-ask to the applicant | Not started |

### Group 3 — Complex Companies & Operations Automation

| Module | Agent | Description | Status |
|---|---|---|---|
| Corporate Structure | **Corporate Structure agent** | Digests corporate structure from MOA; prompts additional docs when needed; organizes ownership output with layers, jurisdictions, shareholders, and directors | Not started |
| Corporate Structure | **Shareholders KYC** | Prompts, collects, and analyzes shareholder/director information | Not started |
| Corporate Structure | **Signing powers & Signatories KYC** | Validates MOA and signing powers documents; organizes authorized signatories and triggers invitation + KYC | Not started |
| Corporate Structure | **Mandates** | Validates mandates; extracts information and maps against mandate configuration forms | Not started |
| Support | **AI RM** | Proactive, always-on assistant that guides applicants through the journey, answers questions, and interacts with the Re-ask Agent when re-ask is needed | Not started |
| Operations | **Onboarding Maker/Checker agents** | Automates operational work of populating and verifying information in back office, and verifying application | Not started |
| Operations | **EDD Maker Checker** | Reviews EDD Q&A, orchestrates re-asks, prepares human-ready assessment | Not started |
| Operations | **Onboarding quality agent** | Audits onboarding cases; assesses feedback and core metrics | Not started |
| Operations | **Onboarding escalations agent** | Tracks critical applications and overall TAT; escalates and prioritizes based on risk score | Not started |

**Human override is always available and always logged.** Agents recommend; humans decide. After sufficient data, auto-approve thresholds are calibrated by Compliance.

---

## Out of Scope (MVP)

- Ongoing / periodic KYB refresh (post-onboarding monitoring and re-screening)
- Self-service Compliance configuration of risk thresholds and CRAM rules (managed via config)
- Multi-jurisdiction compliance ruleset management UI
- Arabic language support in applicant UI (English-first for MVP)
- Full Group 3 agent suite (Corporate Structure, AI RM, Ops automation agents)
- Integration with plan upgrades and cross-sell post-activation
- Advanced BI / reporting dashboards (basic queue and SLA metrics only in MVP)
- FATCA/CRS reporting output to regulatory authority (canonical data capture in scope; report generation is not)
- Pricing selection UI (plan recommended post-approval, confirmed at activation)

---

## Phased Delivery

| Phase | Scope | Agent Groups |
|---|---|---|
| **Phase 1 — Document-First MVP** | TL scan → AI extraction → adaptive flow for Tier 1 (Sole Est) and Tier 2 (standard LLC). P1/P2/P3/P4 pillar framework. Back office Maker/Checker queue. Basic audit log. | Group 1 agents |
| **Phase 2 — Operational Efficiency** | EDD automation, MOA digestion, Powers Resolution, Re-ask Agent, signatory self-serve portal, per-pillar status tracker with SLAs | Group 2 agents |
| **Phase 3 — Complex Companies & Ops Automation** | Corporate Structure processing, Shareholder KYC, AI RM, Ops Maker/Checker agents, EDD automation, Onboarding quality + escalation agents | Group 3 agents |
| **Phase 4 — Structural & Cross-Cutting** | Policy-as-code CRAM engine, continuous fraud signal streaming, ML feedback loop on auto-rejection rules, per-pillar expiry (replacing 60-day full-reset), advanced audit export | Cross-cutting |

Each phase ships independently deployable modules. Phase N+1 depends on Phase N's core but does not require simultaneous rollout.

---

## Success Metrics

| Dimension | Metric | Target |
|---|---|---|
| **Growth & Conversion** | Application submission completion rate | 75% → **85%** |
| **Growth & Conversion** | Applicant drop-off during document upload | < 15% |
| **Efficiency** | TAT p-90 (application to decision) | → **24 hours** |
| **Efficiency** | T2FT — Sole Establishment (Tier 1) | < **1 hour** |
| **Efficiency** | T2FT — Standard LLC (Tier 2) | < **24 hours** |
| **Efficiency** | T2FT — Complex / Tier 3 | < **72 hours** |
| **Efficiency** | % of cases requiring no human touch (Tier 1) | ≥ 70% auto-approved |
| **Efficiency** | Analyst review time per Tier 2 case | ≤ 20 minutes median |
| **Experience** | Onboarding NPS | → **80** |
| **Compliance** | Audit log coverage | 100% of state changes and decisions |
| **Compliance** | % of cases with a single targeted re-ask (vs. batch) | ≥ 80% |
| **Quality** | AI false positive rate (flags on clean applications) | ≤ 15% (monitored monthly) |

---

## Key Assumptions & Risks

| Assumption / Risk | Notes |
|---|---|
| UAE registry API availability | Priority integrations: DED Abu Dhabi, DET Dubai, ADGM, DIFC, MOEC + top-10 free zones. Cost and SLA per API to be confirmed. Upload fallback required at launch. |
| UAE Pass as auth provider | Validates identity + enables pre-fill for the majority of UAE-based applicants. Viability for signatory invitation flow to be confirmed. |
| Group 1 agents de-risk delivery | Group 1 agents (Is doc?, TL processing, Business Activity, Personal OCR) are partially built. MVP viability depends on their readiness. |
| AECB wired-in from day one | Requires Emirates ID + TL to be available early in the flow; architecture must not gate AECB on downstream steps. |
| Canonical Person Record design | Must be agreed before P2 is built. Retroactive migration of existing KYC records is out of scope for MVP but must not be blocked by the new schema. |
| Analyst trust in AI summaries | UX and onboarding for ops team required. If analysts distrust the AI summary and revert to reading raw documents, the efficiency gains are not realized. |
| Audit log immutability | Requires append-only / event-sourced storage from day one. Cannot be retrofitted. |
| 60-day expiry rule | Current rule resets the entire application. Per-pillar expiry (only perishable data expires) requires a policy change confirmed with Compliance and CBUAE. |

---

## Open Questions

- Which UAE registry partners are contracted or available (DED Abu Dhabi, DET, ADGM, DIFC, MOEC, free zones)? Cost and SLA per API?
- Is UAE Pass viable for signatory invitation and liveness — including non-resident signatories?
- What is the current case volume distribution across complexity tiers (Low / Medium / High)? This drives prioritization.
- What are current real TAT and drop-off benchmarks per stage (especially Re-Ask loops and 60-day expiry)?
- Which pillars already expose APIs vs. which are still "human playbook" (to be confirmed with Engineering)?
- Who owns the auto-approve threshold decision — Compliance, Risk, or joint sign-off?
- Can the per-pillar expiry policy (vs. full 60-day application reset) be approved by Compliance/CBUAE for MVP?
- For EDD: is the question bank maintained in a CMS today, or hardcoded?
- Benchmark targets to validate against: ENBD Business, Mashreq NeoBiz, Liv Business — T2FT and dropout rate?
