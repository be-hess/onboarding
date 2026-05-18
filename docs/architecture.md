# Architecture: Wio Business SME Onboarding

**Version:** 0.2
**Date:** 2026-05-18

---

## Overview

The onboarding platform is a modular, event-driven system organized around three independent compliance pillars — **KYB** (Know Your Business), **KYI** (Know Your Individual), and **WWMA** (Who Will Manage the Account) — coordinated by a central Pillar Orchestrator.

The architecture prioritizes:
- **Pillar independence** — each pillar progresses asynchronously; a delay in one does not block others
- **Registry-first** — entity data comes from UAE registries (TAMM, DET, ADGM, DIFC, MOEC, top free zones); document upload is a fallback only
- **UAE Pass first** — Step 01 is always UAE Pass authentication; no data is collected before the customer is verified
- **Platform agnosticism** — all business logic lives in backend services; clients (web, mobile, partner embed) are thin shells over the same APIs
- **Agent-first operations** — AI agents act as the primary reviewer layer; humans review by exception
- **Auditability by design** — every state change is an immutable event in an append-only event store
- **Mock-first integrations** — all third-party services (registries, UAE Pass, screening, fraud) are behind adapter interfaces and mocked in MVP
- **Policies as code** — CRAM, EDD trigger logic, and field expiry rules live in OPA/Rego; no compliance logic is hardcoded

---

## System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │  Applicant Web  │  │  Back Office UI │  │  Partner Embed SDK   │ │
│  │  / Mobile App   │  │  (Unified Case  │  │  (iframe / API-first)│ │
│  │                 │  │   Workspace)    │  │                      │ │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬───────────┘ │
└───────────┼─────────────────────┼───────────────────────┼────────────┘
            │                     │                       │
            └─────────────────────┼───────────────────────┘
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                 │
│           Auth (UAE Pass OIDC / JWT) · Rate Limiting · Routing       │
└──────────────────────────────────────────────────────────────────────┘
                  │                              │
       ┌──────────┘                              └────────────┐
       ▼                                                      ▼
┌─────────────────────┐                          ┌───────────────────────┐
│  Applicant API      │                          │  Back Office API      │
│  - Step 01: UAE Pass│                          │  - Unified Case Queue │
│  - Step 02: Registry│                          │  - Maker/Checker ops  │
│  - Step 03: CRAM    │                          │  - Audit log access   │
│  - Step 04-05-06    │                          │  - EDD review         │
│  - Re-ask response  │                          │  - Case Officer tools │
└──────────┬──────────┘                          └──────────┬────────────┘
           │                                                │
           └───────────────────┬────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│               Pillar Orchestrator (Temporal / Step Functions)        │
│                                                                      │
│  - Classifies tier (Express / Standard / Complex) at Step 03         │
│  - Routes based on entity type, registry data, CRAM output           │
│  - Dispatches agents and tracks agent run status                     │
│  - Publishes pillar.X.status_changed events to the event bus         │
│  - Enforces gate dependencies (e.g. KYB pre-screen → WWMA provision) │
│  - SLA monitor: breach → auto-escalation + customer notification     │
└──────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Event Bus       │
                    │  (Kafka / EventBridge│
                    │   async pub/sub)     │
                    └──┬────────┬──────────┘
                       │        │        │
          ┌────────────┘        │        └────────────────────┐
          ▼                     ▼                             ▼
  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────┐
  │  KYB Service │    │  KYI Service     │    │  WWMA Service        │
  │              │    │  (Know Your      │    │  (Who Will Manage    │
  │  Entity verif│    │   Individual)    │    │   the Account)       │
  │  Registry pull    │  UAE Pass/Onfido │    │  CRAM · EDD · AML    │
  │  UBO graph   │    │  CPR management  │    │  AECB · Provisioning │
  │  KYB score   │    │  Signatory flow  │    │  Activation          │
  └──────┬───────┘    └──────┬───────────┘    └──────────┬───────────┘
         │                   │                           │
         └───────────────────┴───────────────────────────┘
                       │ read/write canonical records
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                  │
│                                                                      │
│  ┌──────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │ Canonical Person │  │ Canonical Business│  │  Event Store      │ │
│  │ DB (CPR)         │  │ DB (CBR)          │  │  (append-only /   │ │
│  │ persons table +  │  │ KYB score, UBO    │  │   EventStoreDB /  │ │
│  │ person_biz_roles │  │ graph, CRAM input)│  │   Kafka topics)   │ │
│  └──────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌──────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │ Application DB   │  │ Document Store     │  │ OPA/Rego Policy   │ │
│  │ (pillar states,  │  │ (uploads + agent   │  │ Engine (CRAM,     │ │
│  │  reviews, reasks,│  │  extraction output)│  │ EDD triggers,     │ │
│  │  CRAM outputs)   │  │                    │  │ expiry rules)     │ │
│  └──────────────────┘  └───────────────────┘  └───────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│              Integration Layer  [MVP: all adapters mocked]           │
│                                                                      │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │ Registry       │  │ UAE Pass   │  │ OCR /        │  │ Screening│ │
│  │ Adapter        │  │ OIDC       │  │ Liveness     │  │ Adapter  │ │
│  │ (TAMM/DET/ADGM │  │ Adapter    │  │ Adapter      │  │ (LSEG/DJ │ │
│  │ /DIFC/MOEC +   │  │ SOP3/High  │  │ (Onfido /    │  │ /ComplyAdv│ │
│  │ top free zones)│  │ Assurance  │  │  Textract)   │  │ webhooks)│ │
│  └────────────────┘  └────────────┘  └──────────────┘  └─────────┘  │
│                                                                      │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │ Fraud Signal   │  │ AECB       │  │ KYB API      │  │ Nomad / │  │
│  │ Adapter        │  │ Adapter    │  │ (Moody's /   │  │ IDfy    │  │
│  │ (Sift/Seon/    │  │ (TTL cache)│  │  Refinitiv / │  │ Adapter │  │
│  │  Feedzai)      │  │            │  │  D&B intl)   │  │         │  │
│  └────────────────┘  └────────────┘  └──────────────┘  └─────────┘  │
│                                                                      │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────┐               │
│  │ Notification   │  │ Core       │  │ Contentful   │               │
│  │ Adapter        │  │ Banking    │  │ (EDD question│               │
│  │ (push/email/   │  │ Stub       │  │  bank CMS)   │               │
│  │  bilingual SMS)│  │            │  │              │               │
│  └────────────────┘  └────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Pillar Orchestrator (Temporal / AWS Step Functions)

The central coordinator. Stateful per application. Responsibilities:
- Classify application tier (Express / Standard / Complex) at Step 03 after CRAM output
- Route modules and agents based on entity type, registry data, and risk signals
- Track per-pillar statuses; decide when a pillar is unblocked to progress
- Dispatch agent runs and consume agent outputs
- Publish `pillar.X.status_changed` events consumed by downstream services
- Enforce SLA thresholds per pillar; breach → auto-escalation event

The Orchestrator does not contain compliance logic. Compliance rules live in OPA/Rego — the Orchestrator calls the policy engine and consumes the output.

### Pillar Services (KYB / KYI / WWMA)

Three independent services, each with its own data, state machine, and API surface.

- **KYB Service**: Registry pull (TAMM, DET, ADGM, DIFC, MOEC, top free zones), UBO graph traversal (≥25% direct + indirect), continuous KYB score computation. Document upload is a fallback path only.
- **KYI Service**: UAE Pass OIDC auth, liveness verification (Onfido NIST PAD L2), Canonical Person Record management, signatory invitation flow (tokenised deep-links), non-UAE attestation routing (Nomad / IDfy).
- **WWMA Service**: CRAM computation via OPA/Rego, EDD scoping and questionnaire (Contentful CMS), AML/PEP/adverse media screening (LSEG WorldCheck / Dow Jones / ComplyAdvantage — webhook-based), AECB credit pre-check (TTL-cached), async IBAN pre-reservation and account provisioning, activation state flip.

Each service:
- Subscribes to orchestration events on the event bus
- Reads from and writes to the Canonical Business and Person DBs
- Calls integration adapters (mocked in MVP) for external checks
- Emits its own status events when milestones are reached
- Exposes REST endpoints consumed by the Back Office API and Orchestration Engine

### Agent Service

Manages agent dispatch, execution, and output persistence. Each agent is a named worker with a defined input schema, output schema, and verdict enum (pass / flag / fail / requires_input).

In MVP, agents are implemented as deterministic rule-based workers or calls to a hosted LLM API. Swappable without changing the contract.

### Audit / Event Store

Append-only. Every event written by any service — agent output, human decision, status change, document upload, data access — is persisted here with actor, timestamp, and payload. No event is ever modified or deleted. The event store is the source of truth for the audit trail.

### Notification Service

Sends push notifications, email, and bilingual SMS (AR/EN) triggered by application state changes. In MVP: email only, with stub SMS/push.

---

## Event Flow: Typical Application Lifecycle

```
1. Step 01 — Applicant authenticates via UAE Pass (OIDC SOP3)
        │
        ▼
2. Step 02 — Applicant enters Trade Licence number + grants consent
        │
        ├──► KYB Service: registry pull (TAMM/DET/ADGM/etc.) [MOCK]
        │         returns: entity data, ISIC activities, owner list, expiry
        │
        ├──► WWMA Service: sanctions/PEP screening fires immediately [MOCK]
        │         AECB pre-check on EID + TL [MOCK]
        │
        └──► WWMA Service: IBAN reserved in pending_activation state
                           account row created (pre-provisioning begins)
        │
        ▼  Pre-screen outcome displayed: Eligible / Needs review / Cannot proceed
        │  (Tier + estimated T2FT shown to customer)
        │
3. Step 03 — Customer answers 3 CDD questions
        │
        └──► WWMA Service: CRAM engine (OPA/Rego) computes risk tier
                           EDD trigger evaluated
                           FATCA/CRS classification derived
                           Plan recommendation generated
        │
        ▼  For Sole Est (Tier 1): skip Step 04 → go directly to Step 05 tracker
        │  For Tier 2/3: proceed to Step 04
        │
4. Step 04 — Who needs access? (UBO/signatory management)
        │
        ├──► KYI Service: per-person CDD (UAE Pass + liveness + screening)
        │         Canonical Person Records created / matched
        │
        └──► KYI Service: tokenised invite links sent to each signatory
                          (each completes independently; owner is not blocked)
        │
        ▼
5. Step 05 — Applicant sees 3-lane tracker (KYB · KYI · Account)
        │
        ├──► All events → Event Store (immutable, append-only)
        │
        ├──► Back Office API surfaces case when any pillar flags
        │         → Case Officer auto-assigned
        │         → LLM triage drafts case summary
        │         → Unified Case Workspace: Maker opens case
        │
        ├──► Auto-approve path: all pillars pass → skip to Step 06
        │
        └──► Review path: Maker reviews AI summary → Checker validates
        │
        ▼
6. Step 06 — Activation
        │
        └──► WWMA Service: pending_activation → active (state flip)
                           FATCA/CRS + Account Agreement e-signed via UAE Pass
                           Transaction monitoring engine subscription
                           T2FT recorded
```

---

## Key Design Decisions

### UAE Pass first, registry second, upload last
Step 01 is always UAE Pass OIDC authentication — no form, no document upload. Step 02 is always TL number entry → registry pull. Document upload exists only as a fallback for unsupported jurisdictions or registry API downtime. The customer is never asked to provide data the system can obtain authoritatively.

### Platform-agnostic by design
All business logic is in backend services. The Applicant API and Back Office API are the only surface; clients are rendering shells. Partner embedding is supported via the same Applicant API behind an SDK wrapper or iframe.

### Mock adapters from day one
Every external integration (registries, UAE Pass, AECB, screening, fraud, OCR) is accessed through an adapter interface with a mock implementation. Real adapters are swapped in per integration without changing service logic.

### Per-pillar state, not application-level
Expiry, status, and progress are tracked per pillar. A stale proof of address in KYB does not invalidate verified liveness in KYI. The 60-day full application reset is replaced by granular per-field, per-pillar expiry rules in OPA/Rego.

### Canonical records as shared truth
A Person is created once (anchored to UAE Pass EID) and reused across all roles — owner, director, signatory, UBO — via `person_business_roles`. A Business record is created once and reused across all pillars. No cross-pillar re-collection of data already captured.

### Policies as code, not playbooks
CRAM scoring, EDD trigger logic, and field expiry rules live in OPA/Rego in a versioned repository. Compliance edits via Admin UI — no app release needed. Every automated decision carries the policy version ID that produced it.

### Maker/Checker as a workflow, not a role
Maker and Checker are workflow states on a CaseReview, not fixed user roles. The same analyst can be a Maker on one case and a Checker on another. This allows flexible queue management without rigid role assignment.

### No-tipping-off by design
When a sanctions match causes an application freeze, the applicant-facing message must not reveal the specific match, list, or reason. The Applicant API enforces a fixed response template. The specific reason is communicated only to the MLRO via the internal Compliance Service.

### Sole Establishment express path is mandatory
Any feature that adds steps, screens, or data requirements must explicitly short-circuit for Tier 1 (Sole Est) cases. The Orchestrator skips Step 04 (KYI people management) entirely for Tier 1. The express path cannot regress to a slower flow.

---

## MVP Constraints

| Constraint | Rationale |
|---|---|
| All external integrations mocked | Avoids vendor dependency blocking launch; adapters are real, data is stubbed |
| English-only UI | Arabic support is Phase 2; i18n keys in place from day one |
| Web only for applicant (no native app) | Reduces initial surface; mobile-responsive web covers most use cases |
| Group 1 agents only | Groups 2 and 3 are post-MVP (see agent delivery roadmap in product brief) |
| UAE top-10 registry coverage only | Smaller free zones → documental fallback path |
| No real-time fraud streaming | Fraud adapter accepts events; scoring logic is mocked |
| OPA/Rego CRAM in place but admin UI for Phase 2 | Compliance must go via engineering to update rules in MVP; admin UI ships Phase 2 |

---

## Future Considerations

- **Multi-entity support**: Application model already includes `entity_group_id` hook; parent–subsidiary structures require no architectural refactor
- **Real adapter rollout**: Replace mock adapters one by one as vendor contracts are signed; no service logic changes required
- **ML feedback loop**: Human decisions fed back into agent training; auto-approval thresholds evolve with data
- **Multi-language**: i18n keys in place from day one; Arabic (RTL) strings added in Phase 2
- **Continuous CDD**: Post-activation `feature_odd` / `feature_annual_kyc` subscribes to TL renewal webhooks for delta CDD — Phase 2
