# Product Brief: Wio Business — AI-Powered SME Onboarding

**Version:** 0.3
**Date:** 2026-05-18
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

## Architecture: Four-Pillar Platform

Every application progresses across four independent service pillars that run **in parallel** once the customer passes the pre-screen. A Pillar Orchestrator (Temporal / AWS Step Functions) coordinates gate dependencies and SLA enforcement. Pillars communicate via the shared event bus — they never call each other directly and a bottleneck in one cannot freeze the others.

| Pillar | Abbreviation | Scope |
|---|---|---|
| **Know Your Business** | KYB | Entity verification — trade licence pulled from UAE registry, UBO graph traversal (≥25% direct + indirect), sector/jurisdiction classification, continuous KYB score. CRAM scoring (OPA/Rego policy-as-code) → Low / Medium / High customer risk rating, pinned to policy version ID. EDD trigger evaluation and questionnaire delivery (sector + turnover + jurisdiction rules). Registry-first; document upload is a fallback for unsupported jurisdictions only. |
| **Know Your Individual** | KYI | People verification — owner, all UBOs ≥25%, signatories, directors. UAE Pass OIDC for UAE residents; Onfido remote liveness (NIST PAD Level 2) + Nomad/IDfy remote attestation for non-UAE individuals. Canonical Person Record: one record per natural person reused across all roles. AML/PEP/adverse media screening per individual (FATF Rec. 12). AECB pre-check per individual (explicit consent, Federal Law 6/2010). FATCA/CRS classification auto-derived from individual and entity structure. |
| **Who Will Manage the Account** | WWMA | Mandate configuration — who has the power to open and operate the account, at what level, and under what conditions. Covers: signing authority type (sole, joint, threshold-based), access levels per person (full mandate, limited mandate, authorized user, read-only), power of attorney validation, and the complete mandate policy stored as configuration. Drawn from the KYI-verified signatory list and MOA signing rules. |
| **Account Setup** | ACCT | Product selection and commercial configuration. Product fit recommendation (CRAM tier + AECB + turnover cohort). Customer confirms plan; fee schedule bound at selection (KFS generated before signing). IBAN pre-reservation from CBUAE-allocated block; account provisioned in `pending_activation` state from Step 02. Virtual card personalised, cheque book template generated. Payment rails enabled per plan. Account Agreement, KFS, T&Cs, and FATCA/CRS self-certs e-signed via UAE Pass (Federal Decree-Law 46/2021). Activation = state flip `pending_activation → active` once all pillars clear. |

---

## Customer Complexity Tiers

Tier is determined at Step 03 (CRAM output) and communicated to the customer immediately. No surprises after the fact.

| Tier | Profile | T2FT Target | Handling |
|---|---|---|---|
| **Tier 1 — Express** | Sole Establishment, UAE national, standard sector, clean screening | < 1 hour | Fully automated. UAE Pass → TL number → registry → 3 questions → CRAM pass → account active. Step 04 (people) skipped entirely — no UBO or signatory step. |
| **Tier 2 — Standard** | LLC, all UAE shareholders, standard sector | < 24 hours | Semi-automated. Agents handle all checks; human review on flagged items only. |
| **Tier 3 — Complex** | International UBOs, high-risk sector (crypto, gold, real estate, charities, MSB), PEP exposure | < 72 hours | Specialist review. Agents prepare full dossier; named Case Officer owns the case end-to-end with cross-pillar visibility. |

T2FT (Time to First Transaction) is the north-star metric — measured at p-90, not mean, to protect the tail.

---

## Users

| User | Role | Context |
|---|---|---|
| **Business Applicant** | SME owner, sole proprietor, CFO, or authorized representative | Starting application; uploads Trade License and MOA as first action |
| **Signatory / UBO** | Co-owner, director, or authorized signatory who is not the applicant | Invited via self-serve link; completes their own identity verification independently |
| **Compliance Analyst (Maker)** | Back office reviewer | Works through the ops queue; uses AI-drafted summaries to verify and populate case data |
| **Compliance Analyst (Checker)** | Second-line reviewer | Validates Maker's work; approves, declines, or escalates with a recorded reason |
| **Compliance Manager** | Team lead | Monitors queue health and SLAs; reviews escalations; oversees EDD cases |
| **Case Officer** | Named single owner for escalated cases | Assigned by routing engine (complexity + language + sector + load); sole customer-facing contact for Tier 2/3 review |
| **AI Agent Workforce** | Orchestrated set of specialized agents | Runs checks, extracts data, drafts assessments, triages re-asks — invisible to applicants, visible to ops |
| **Auditor** | Internal or regulatory | Reads immutable event log; reconstructs any application state at any point in time |

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

## The Six Customer-Visible Steps

The customer sees exactly six steps. Every compliance check, registry pull, screening run, and provisioning action happens silently in the background.

### Step 01 — Sign in with UAE Pass
The customer authenticates via UAE Pass (sovereign IdP, SOP3 / High Assurance). This is the first and only action required before any business data is entered.

**What runs behind:** UAE Pass OIDC flow hydrates the Canonical Person Record (verified EID, full legal name AR/EN, DOB, nationality, mobile, email). If an existing Wio Personal CPR exists with fresh KYC (<12 months), it is offered for reuse with **explicit new consent** — never auto-imported. Device fingerprint bound to session. Continuous fraud stream starts here (Sift / Seon / Feedzai).

**Fallback:** Non-UAE residents or customers without UAE Pass → Onfido passport scan + remote liveness (NIST PAD Level 2) + step-up KYC track.

**SLA:** ~30s user flow, 5–10s backend verification.

---

### Step 02 — Find your business
The customer enters their trade licence number and grants explicit PDPL-compliant consent. The system runs a registry pull and pre-screen in parallel — no document upload required.

**What runs behind (~60s, parallel):**
- **Registry pull** (KybRegistryService): TAMM (Abu Dhabi / ADDED), DET (Dubai mainland), ADGM, DIFC, MOEC, DMCC, JAFZA, RAK ICC, UAQ FTZ, SHAMS. Returns: TL number, legal name (AR/EN), licence type, expiry, status, ISIC activities, partners, capital, address.
- **Sanctions screening**: LSEG WorldCheck + Dow Jones Risk Center + ComplyAdvantage — UN, OFAC, EU, UK HMT, UAE local lists.
- **PEP + adverse media screening** (FATF Rec. 12).
- **AECB pre-check** on EID + TL (explicit consent, Federal Law 6/2010).
- **Internal Wio block list check**.
- **Continuous KYB Score** computed: jurisdiction risk + sector risk + age of business + activities count + ownership depth.
- **Foreign parent detection**: resolved via Moody's KYB / Refinitiv / D&B.

**Three pre-screen outcomes displayed:**
- ✓ Eligible — customer tier and estimated T2FT shown
- ⚠ Needs review — reason category + what will be needed (no sensitive data disclosed)
- ✗ Cannot proceed — compliant reason under Federal Decree-Law 20/2018 (no tipping off on sanctions matches)

**Fallback:** Registry API down or jurisdiction unsupported → customer uploads TL/MOA/BR → AWS Textract + LLM extractor + Klippa/Hyperscience for non-standard templates.

**SLA:** Under 60s for ~85% of UAE volume.

---

### Step 03 — Tell us about your business (3 questions)
Three mandatory CDD questions required by CBUAE AML/CFT. These questions are not optional and cannot be skipped regardless of tier.

**The 3 questions:**
1. Primary business activity (ISIC-mapped chips, pre-selected from registry data)
2. Expected monthly turnover band
3. Source of funds

**What runs behind:**
- **CRAM engine** (OPA/Rego policy-as-code): sector risk + jurisdiction + ownership + answers → Low / Medium / High customer risk rating. Each output pinned to a policy version ID.
- **EDD trigger logic**: `IF sector IN (crypto, gold, real_estate, charities, MSB, gaming, oil_gas) OR turnover > 5M OR international = true THEN require sector-specific questionnaire` — delivered via Contentful CMS question bank.
- **FATCA/CRS classification** auto-derived (Active NFFE / Passive NFFE / FI).
- **Product fit recommender** suggests a plan based on CRAM + AECB + turnover cohort.
- **Sole Est express path confirmed**: Tier 1 CRAM + sole owner + standard sector + UAE national → no Step 04.

**EDD disclosure:** If sector triggers additional questions, the customer is warned upfront at Step 02 result screen before committing to proceed. They see how many extra questions and estimated extra time. No mid-flow surprises.

**SLA:** 1–3 min user flow, <2s CRAM scoring.

---

### Step 04 — Who needs access?
The customer reviews the pre-populated UBO list from the registry, adds anyone missing, and sends self-invite UAE Pass deep-links. **Sole Establishment / Tier 1 applicants skip this step entirely.**

**What runs behind:**
- **UBO graph engine**: traverses UAE registries → resolves 25% threshold (direct + indirect). Foreign parents queried via Moody's KYB / Refinitiv / D&B.
- **Per-person CDD**: UAE Pass auth → liveness (Onfido NIST PAD L2) → sanctions/PEP/adverse media → AECB pull (individual consent).
- **Canonical Person Record**: each individual gets one record reused across all roles (owner, director, signatory, attorney). Single `persons` table + `person_business_roles` for many-to-many.
- **Non-UAE individuals**: Onfido remote KYC + Nomad / IDfy remote attestation where supported. Documental path (notary + embassy) disclosed upfront with cost + timeline.
- **Signing rules engine**: single / joint / threshold-based signing rules captured and stored as policy.

The owner's flow continues to Step 05 immediately after sending invites. Activation is gated by the slowest signatory — not the owner's progress.

**Compliance hard stop:** PEP or sanctions hit on any individual = mandatory Compliance review. Cannot be auto-approved.

---

### Step 05 — Track everything
The customer sees three real-time progress lanes — KYB · KYI · Account setup — each with a status label, progress indicator, and ETA. A named Case Officer is shown and reachable for Tier 2/3 cases.

**What runs behind:**
- **Pillar Orchestrator** (Temporal / AWS Step Functions): each pillar publishes `pillar.X.status_changed` events to Kafka / EventBridge.
- Customer tracker and ops **Unified Case Workspace** consume the same event stream — single source of truth.
- **Case Officer auto-assigned**: rotation by CRAM tier + language preference (AR/EN) + sector specialisation + current load.
- **SLA monitor**: per-pillar SLA thresholds in OPA/Rego. Breach → auto-escalation + customer notification + Compliance/Legal/Senior Management notified.
- **In-app chat**: MQTT-backed, transcripts retained 5 years (CBUAE record-keeping).
- **Granular save & resume**: only perishable fields (PoA >90d, stale AML screening) need refreshing — not the whole application. Magic-link resume via UAE Pass or SMS OTP.

---

### Step 06 — Activate and move money
Account, IBAN, and virtual card flip to live. First transaction possible immediately.

**What runs behind:**
- **Pre-provisioning** started at Step 02: IBAN reserved (CBUAE-allocated block), account row in `pending_activation`, virtual card personalised, cheque-book template generated.
- **Activation = state flip**: `pending_activation → active`. Triggers fee schedule, card visibility, transaction-monitoring engine subscription, Apple Pay / Samsung Pay tokenisation eligibility.
- **FATCA/CRS self-certs** e-signed via UAE Pass digital signature (Federal Decree-Law 46/2021).
- **Account Agreement + KFS + T&Cs** e-signed via UAE Pass.
- **Continuous transaction monitoring** subscribes to account event stream (CBUAE AML/CFT Articles 16–18).
- **T2FT recorded** as the primary success metric.

**Compliance constraint:** No activation until ALL CDD pillars clear (CBUAE Cabinet Decision 10/2019 Article 5).

**SLA:** Activation flip <30 seconds once all gates clear.

---

## Eight Silent Background Systems

These run continuously across the entire flow — not discrete steps. They are what make the flow safe, auditable, and regulatorily defensible.

| System | What it does | Key compliance anchor |
|---|---|---|
| **Continuous fraud monitoring** | Behavioural biometrics, device fingerprint, IP reputation, velocity from Step 01 to post-activation | Hits reviewed by Fraud Ops. Right-to-explanation honoured. Not a substitute for CDD. |
| **Real-time sanctions & PEP screening** | Every person and business screened on every list. Daily refresh. New match on existing customer = automatic case. | CBUAE Notice 35/2014 · Federal Decree-Law 20/2018. Sanctions match → mandatory STR to UAE FIU. |
| **AECB credit pre-check** | Background pull once EID + TL available. TTL-cached 24h. Shared across KYI (individuals) + KYB (business). | Federal Law 6/2010. Explicit mandate required per person. Customer right to dispute via AECB. |
| **Granular save & resume** | Per-pillar state persisted. Only perishable fields expire — not the whole application. Magic-link resume. | PDPL data minimisation: abandoned apps not held indefinitely. Default 12-month retention. |
| **Agent-assisted ops with named ownership** | Cases requiring humans go to one named Case Officer. LLM triage drafts case summary so the human starts from context. | LLM outputs are advisory only. Human approves PEP, sanctions, complex UBO, EDD finalisation. |
| **Policies as code** | CBUAE rule changes go live without an app release. Every decision pinned to policy version. | Admin UI for Compliance edits. Dual sign-off required (Compliance Officer + MLRO). |
| **Audit-ready event sourcing** | Every decision, consent, screening result, human approval — immutable event with actor identity. | CBUAE record-keeping (5 years minimum) · FATF Rec. 11 · PDPL data subject access requests. |
| **Continuous CDD post-activation** | Ongoing CDD per CBUAE refresh schedule (Low 36m / Medium 24m / High 12m). TL renewal triggers delta CDD. | CBUAE AML/CFT Cabinet Decision 10/2019 Article 6. STR obligation on suspicious activity during refresh. |

---

## Core Back-Office Flows

### Flow A — Unified Case Workspace (Maker / Checker)

1. Agent-powered triage classifies each case and drafts a structured case summary before a human opens it: entity name + jurisdiction + CRAM score + screening hits + UBO structure + open questions + recommended regulatory treatment.
2. Maker opens case: sees AI summary across all three pillar lanes (KYB · KYI · Account), not raw documents.
3. **Re-ask Agent** identifies missing or inconsistent information; Maker reviews and sends a single targeted re-ask.
4. Maker records decision (Recommend Approve / Recommend Decline / Escalate) with mandatory reason.
5. Checker validates or overrides — mandatory reason on any override.
6. Decision logged with actor identity; applicant notified automatically.
7. EDD cases: EDD Maker reviews Q&A, orchestrates re-asks, prepares assessment; EDD Checker validates before human finalisation.

### Flow B — Signatory Self-Serve (KYI Pillar)

1. Signatory receives tokenised UAE Pass deep-link via push + bilingual SMS (AR/EN). Signed JWT, short-lived, bound to role + application.
2. Completes their own KYC on their own device: UAE Pass auth → liveness → screening → CPR created or matched.
3. Non-UAE residents: Onfido remote KYC + Nomad / IDfy remote attestation where supported; documental path otherwise.
4. Status posted back to application event stream. Ops only involved on escalation (72h timeout or anomaly).
5. Main applicant's flow continues in parallel — not blocked.

### Flow C — Audit Trail Access (Auditor)

1. Every event persisted as immutable, timestamped record: submissions, check results, agent outputs, analyst actions, status changes, data accesses, overrides.
2. Actor tagged on every event: system / agent name / human user ID.
3. Auditor filters by application, pillar, actor, date range, event type.
4. Full application state reconstructable at any past moment by replaying events.
5. Export to CBUAE-ready format (JSON / CSV) without manual assembly.

---

## AI Agent Workforce

The Pillar Orchestrator coordinates a named set of specialized agents. Agents are invisible to applicants; their outputs and reasoning are fully visible to the ops team in the Unified Case Workspace.

**Pillar Orchestrator** (Temporal / AWS Step Functions) — the central brain. Determines which modules activate and in what sequence. Publishes `pillar.X.status_changed` events to Kafka / EventBridge. Enforces gate dependencies (e.g. KYB pre-screen pass required before WWMA provisions IBAN). Does not contain compliance logic — rules live in OPA/Rego.

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

## Regulatory Framework

Every solution must respect these constraints. Non-negotiable.

| Framework | Constraint |
|---|---|
| CBUAE AML/CFT — Cabinet Decision 10/2019 | CDD mandatory before account activation. Risk-based approach: CDD proportional to risk. No auto-approval for PEP, sanctions, or EDD cases — human review required. |
| CBUAE AML/CFT — Federal Decree-Law 20/2018 | Sanctions match = immediate freeze + STR to UAE FIU. No tipping off: do not tell the customer the specific reason for a sanctions block. |
| UAE Cabinet Decision 58/2020 | Beneficial Ownership ≥25% must be identified and verified — direct AND indirect. |
| UAE PDPL — Federal Decree-Law 45/2021 | Granular consent per processing purpose. Data minimisation. Right-to-explanation (Article 25). Right-to-deletion after retention period. |
| AECB — Federal Law 6/2010 | Explicit customer mandate required for every AECB pull. Customer right to dispute directly with AECB. |
| FATF 40 Recommendations | Risk-based approach. PEP screening mandatory. Source of Wealth for PEP + high-risk sector. Ongoing monitoring. |
| UAE Federal Decree-Law 46/2021 | UAE Pass digital signature is legally binding for account agreements, KFS, and FATCA/CRS self-certs. |
| CBUAE record-keeping | 5 years minimum retention for all CDD records, decisions, and communications from relationship end. |

**What cannot be automated (human review mandatory):**
- PEP cases (CBUAE Article 19 + FATF Recommendation 12)
- Confirmed sanctions matches (STR/SAR — MLRO sign-off only)
- Complex UBO chain approval (Compliance sign-off required)
- EDD finalisation for high-risk sectors (Senior Management sign-off)

---

## Out of Scope (MVP)

| Out of scope | Reason |
|---|---|
| Auto-approval of PEP / sanctions / EDD cases | CBUAE + FATF mandate human review — not automatable |
| STR / SAR filing automation | MLRO must approve content and sign off — Federal Decree-Law 20/2018 |
| Full registry coverage for all free zones | MVP covers top 10 by volume. Smaller free zones → documental fallback |
| Remote attestation for every non-UAE jurisdiction | Nomad/IDfy coverage is broad but not universal — documental path as fallback |
| Arabic language support in applicant UI | English-first for MVP; i18n keys in place from day one, Arabic strings in Phase 2 |
| Full Group 3 agent suite (Corporate Structure, AI RM, Ops automation) | Phased delivery — Group 2 agents required first |
| Advanced BI / reporting dashboards | Basic queue and SLA metrics only in MVP |
| FATCA/CRS reporting output to regulatory authority | Canonical data capture in scope; report generation is not |
| Ongoing / periodic KYB refresh | Post-activation monitoring is Phase 2 (post-onboarding feature_odd / feature_annual_kyc) |

---

## Phased Delivery

| Phase | Scope | Agent Groups |
|---|---|---|
| **Phase 1 — Registry-First MVP** | UAE Pass auth → TL number → registry pull → pre-screen → 3 CDD questions → CRAM → KYB/KYI/WWMA parallel pillars. Express path for Tier 1 (Sole Est). Back office Unified Case Workspace (Maker/Checker). Basic audit log. | Group 1 agents |
| **Phase 2 — Operational Efficiency** | EDD automation, MOA digestion, Powers Resolution verification, Re-ask Agent, per-pillar SLA tracker, OPA/Rego CRAM policy editor for Compliance, per-pillar expiry (replacing 60-day full-reset) | Group 2 agents |
| **Phase 3 — Complex Companies & Ops Automation** | Corporate Structure agent, Shareholders KYC, AI RM, Ops Maker/Checker agents, EDD Maker/Checker, Onboarding quality + escalation agents | Group 3 agents |
| **Phase 4 — Continuous & Cross-Cutting** | Continuous fraud signal streaming, ML feedback loop on auto-rejection rules, multi-language (AR), advanced audit export, post-activation ongoing CDD | Cross-cutting |

Each phase ships independently deployable modules. Phase N+1 depends on Phase N's core but does not require simultaneous rollout.

---

## Success Metrics

T2FT p-90 (not mean) is the governing metric. The tail (complex cases, edge jurisdictions) must be controlled, not averaged away.

| Dimension | Metric | Current (implied) | Target |
|---|---|---|---|
| **North Star** | T2FT — Sole Est (p-90) | Days | < **1 hour** |
| **North Star** | T2FT — Standard LLC (p-90) | Days | < **24 hours** |
| **North Star** | T2FT — Complex (p-90) | Weeks | < **72 hours** |
| **Growth & Conversion** | Conversion rate (start → activation) | ~75% | **85%+** |
| **Experience** | Onboarding NPS | Unknown | **80+** |
| **Efficiency** | Ops touches per Tier 1 case | Multiple | **0** |
| **Efficiency** | Re-ask rate | High | **< 5%** |
| **Efficiency** | Analyst review time per Tier 2 case | Unknown | ≤ 20 minutes median |
| **Compliance** | Audit log coverage | Partial | 100% of state changes and decisions |
| **Quality** | AI false positive rate (flags on clean applications) | Unknown | ≤ 15% (monitored monthly) |

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
