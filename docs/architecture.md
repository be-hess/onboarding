# Architecture: Wio Business SME Onboarding

**Version:** 0.1 (MVP)
**Date:** 2026-05-08

---

## Overview

The onboarding platform is a modular, event-driven system organized around four independent compliance pillars — KYB, KYC, Compliance/Risk/Fraud, and Account Setup — coordinated by a central Smart Orchestration Engine.

The architecture prioritizes:
- **Pillar independence** — each pillar progresses asynchronously; a delay in one does not block others
- **Platform agnosticism** — all business logic lives in backend services; clients (web, mobile, partner embed) are thin shells over the same APIs
- **Agent-first operations** — AI agents act as the primary reviewer layer; humans review by exception
- **Auditability by design** — every state change is an immutable event in an append-only event store
- **Mock-first integrations** — all third-party services (registries, UAE Pass, screening, fraud) are behind adapter interfaces and mocked in MVP

---

## System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐ │
│  │  Applicant Web  │  │  Back Office UI │  │  Partner Embed SDK   │ │
│  │  / Mobile App   │  │  (Ops / Makers) │  │  (iframe / API-first)│ │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬───────────┘ │
└───────────┼─────────────────────┼───────────────────────┼────────────┘
            │                     │                       │
            └─────────────────────┼───────────────────────┘
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                 │
│              Auth (JWT / UAE Pass) · Rate Limiting · Routing         │
└──────────────────────────────────────────────────────────────────────┘
                  │                              │
       ┌──────────┘                              └────────────┐
       ▼                                                      ▼
┌─────────────────────┐                          ┌───────────────────────┐
│  Applicant API      │                          │  Back Office API      │
│  - Application CRUD │                          │  - Case queue         │
│  - Document upload  │                          │  - Maker/Checker ops  │
│  - Status polling   │                          │  - Audit log access   │
│  - Re-ask response  │                          │  - EDD review         │
└──────────┬──────────┘                          └──────────┬────────────┘
           │                                                │
           └───────────────────┬────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Smart Orchestration Engine                         │
│                                                                      │
│  - Determines application tier (Express / Standard / Complex)        │
│  - Routes modules based on entity type, doc content, risk signals    │
│  - Dispatches agents and tracks agent run status                     │
│  - Publishes pillar.X.status_changed events to the event bus         │
│  - Decides when pillars can progress in parallel                     │
└──────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Event Bus       │
                    │  (async pub/sub)     │
                    └──┬──┬──┬──┬──┬──────┘
                       │  │  │  │  │
          ┌────────────┘  │  │  │  └─────────────────────┐
          ▼               ▼  │  ▼                         ▼
  ┌──────────────┐  ┌──────┐ │ ┌──────────────┐  ┌─────────────────┐
  │  P1 KYB      │  │  P2  │ │ │  P3 Comp/    │  │  P4 Account     │
  │  Service     │  │  KYC │ │ │  Risk/Fraud  │  │  Service        │
  └──────┬───────┘  └──┬───┘ │ └──────┬───────┘  └────────┬────────┘
         │             │     │        │                    │
         └─────────────┴─────┘        └────────────────────┘
                       │ read/write canonical records
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                  │
│                                                                      │
│  ┌──────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │ Canonical Person │  │ Canonical Business│  │  Event Store      │ │
│  │ DB               │  │ DB                │  │  (append-only)    │ │
│  └──────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌──────────────────┐  ┌───────────────────┐                        │
│  │ Application DB   │  │ Document Store     │                        │
│  │ (pillar states,  │  │ (uploads + agent   │                        │
│  │  reviews, reasks)│  │  extraction output)│                        │
│  └──────────────────┘  └───────────────────┘                        │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│              Integration Layer  [MVP: all adapters mocked]           │
│                                                                      │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │ Registry       │  │ UAE Pass / │  │ OCR /        │  │ AML /   │  │
│  │ Adapter        │  │ Emirates ID│  │ Liveness     │  │ PEP /   │  │
│  │ (DED/ADGM/DIFC)│  │ Adapter    │  │ Adapter      │  │ Adverse │  │
│  └────────────────┘  └────────────┘  └──────────────┘  └─────────┘  │
│                                                                      │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────┐               │
│  │ Fraud Signal   │  │ AECB       │  │ Notification │               │
│  │ Adapter        │  │ Adapter    │  │ Adapter      │               │
│  └────────────────┘  └────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Smart Orchestration Engine

The central coordinator. Stateful per application. Responsibilities:
- Classify incoming application into a complexity tier (Express / Standard / Complex)
- Determine which modules and agents to activate based on entity type, document content, and risk signals
- Track pillar statuses and decide when a pillar is unblocked to progress
- Dispatch agent runs and consume agent outputs
- Publish `pillar.X.status_changed` events consumed by downstream services

The engine does not contain compliance logic. Compliance rules live in the Compliance Service (P3).

### Pillar Services (P1 – P4)

Each pillar is an independent service with its own data, state machine, and API surface.

- Subscribe to orchestration events on the event bus
- Read from and write to the Canonical Business and Person DBs
- Call integration adapters (mocked in MVP) for external checks
- Emit their own status events when milestones are reached
- Expose REST endpoints consumed by the Back Office API and Orchestration Engine

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
1. Applicant uploads Trade License
        │
        ▼
2. Orchestration Engine creates Application record, assigns tier
        │
        ├──► Dispatches Is doc? agent
        │           │
        │           └──► Trade License processing agent
        │                       │
        │                       └──► Orchestration Engine receives TL data
        │
        ├──► P1 KYB Service: registry lookup (mocked), builds business profile
        │
        ├──► P2 KYC Service: emits signatory invitations, waits for liveness
        │
        ├──► P3 Compliance: fires AML/PEP/fraud screening (mocked)
        │
        └──► P4 Account: reserves IBAN, creates account in "pending" state
                │
                ▼
        All events → Event Store (immutable)
                │
                ▼
        Back Office API surfaces case when any pillar flags or all pass
                │
                ├──► Auto-approve path: all pillars pass → account activated
                │
                └──► Review path: Maker assigned → reviews AI summary → Checker validates
```

---

## Key Design Decisions

### Platform-agnostic by design
All business logic is in backend services. The Applicant API and Back Office API are the only surface; clients are rendering shells. Partner embedding is supported via the same Applicant API behind an SDK wrapper or iframe.

### Mock adapters from day one
Every external integration (registries, UAE Pass, AECB, screening, fraud, OCR) is accessed through an adapter interface with a mock implementation. Real adapters are swapped in per integration without changing service logic.

### Per-pillar state, not application-level
Expiry, status, and progress are tracked per pillar. A stale proof of address in P1 does not invalidate verified liveness in P2. The 60-day full application reset is replaced by granular per-pillar expiry.

### Canonical records as shared truth
A Person is created once (anchored to UAE Pass ID or Emirates ID) and reused across all roles — owner, director, signatory, UBO. A Business record is created once and reused across all pillars. No cross-pillar re-collection.

### Maker/Checker as a workflow, not a role
Maker and Checker are workflow states on a CaseReview, not fixed user roles. The same analyst can be a Maker on one case and a Checker on another. This allows flexible queue management without rigid role assignment.

---

## MVP Constraints

| Constraint | Rationale |
|---|---|
| All external integrations mocked | Avoids vendor dependency blocking launch; adapters are real, data is stubbed |
| English-only UI | Arabic support is Phase 2 |
| Web only for applicant (no native app) | Reduces initial surface; mobile-responsive web covers most use cases |
| Group 1 agents only | Groups 2 and 3 are post-MVP (see agent delivery roadmap in product brief) |
| Single jurisdiction (UAE mainland) | Free zone and offshore entity support is Phase 2 |
| No real-time fraud streaming | Fraud adapter accepts events; scoring logic is mocked |

---

## Future Considerations

- **Multi-entity support**: Application model extended with `entity_group_id`; a parent company can have child entities sharing canonical business records
- **Real adapter rollout**: Replace mock adapters one by one as vendor contracts are signed; no service changes required
- **Policy-as-code engine**: CRAM and compliance rules move from hardcoded logic to a versioned OPA/Rego ruleset editable by Compliance without engineering involvement
- **ML feedback loop**: Human decisions fed back into agent training; auto-approval thresholds evolve with data
- **Multi-language**: i18n keys already in place from day one; Arabic strings added in Phase 2
