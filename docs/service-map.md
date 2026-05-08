# Service Map: Wio Business SME Onboarding

**Version:** 0.1 (MVP)
**Date:** 2026-05-08

---

## Service Inventory

| Service | Type | Owns | Consumes | MVP Status |
|---|---|---|---|---|
| Orchestration Engine | Internal core | Application state, tier classification, agent dispatch | All pillar events, agent outputs | MVP |
| Applicant API | Internal API | Applicant-facing routes | Orchestration Engine, Document Service, Notification Service | MVP |
| Back Office API | Internal API | Ops-facing routes, case queue | All pillar services, Audit Service | MVP |
| P1 KYB Service | Internal pillar | Business profile, UBO graph, TL validation | Registry Adapter, Document Service, Canonical Business DB | MVP |
| P2 KYC Service | Internal pillar | Person verification, signatory status | UAE Pass Adapter, OCR/Liveness Adapter, Canonical Person DB | MVP |
| P3 Compliance Service | Internal pillar | CRAM, EDD, AML/PEP/fraud scoring | Screening Adapter, Fraud Adapter, Canonical records | MVP |
| P4 Account Service | Internal pillar | IBAN reservation, account state, AECB result | AECB Adapter, Core Banking stub | MVP |
| Agent Service | Internal core | Agent run lifecycle, agent output store | All pillar services, Document Service | MVP (Group 1 agents) |
| Document Service | Internal core | Document storage, type validation, extraction results | OCR Adapter, Document Store | MVP |
| Canonical Person DB | Internal data | Person records across all roles | P2 KYC, P3 Compliance, P1 KYB (UBO) | MVP |
| Canonical Business DB | Internal data | Business entity records | P1 KYB, P3 Compliance | MVP |
| Audit / Event Store | Internal data | Immutable event log | All services (write); Back Office API (read) | MVP |
| Notification Service | Internal utility | Outbound comms (email, SMS, push) | Application state events | MVP (email only) |
| Registry Adapter | External adapter | — | DED / DET / ADGM / DIFC / MOEC APIs | **Mocked in MVP** |
| UAE Pass Adapter | External adapter | — | UAE Pass Auth & Identity API | **Mocked in MVP** |
| OCR / Liveness Adapter | External adapter | — | Onfido / AWS Textract or equivalent | **Mocked in MVP** |
| Screening Adapter | External adapter | — | LSEG WorldCheck / ComplyAdvantage / Dow Jones | **Mocked in MVP** |
| Fraud Adapter | External adapter | — | Sift / Seon / Feedzai | **Mocked in MVP** |
| AECB Adapter | External adapter | — | AECB Credit Bureau API | **Mocked in MVP** |
| Core Banking Stub | External adapter | — | Core banking provisioning system | **Stubbed in MVP** |

---

## Service Interaction Map

```
                        ┌─────────────────────────┐
                        │   Smart Orchestration   │
                        │         Engine          │
                        └──┬──────┬──────┬───┬───┘
                           │      │      │   │
            ┌──────────────┘  ┌───┘  ┌───┘   └──────────────────┐
            │                 │      │                           │
            ▼                 ▼      ▼                           ▼
     ┌────────────┐    ┌──────────┐ ┌─────────────┐     ┌──────────────┐
     │  P1 KYB    │    │  P2 KYC  │ │P3 Compliance│     │ P4 Account   │
     │  Service   │    │  Service │ │  Service    │     │ Service      │
     └──────┬─────┘    └────┬─────┘ └──────┬──────┘     └──────┬───────┘
            │               │              │                    │
     ┌──────┴──────┐  ┌─────┴──────┐  ┌───┴──────────┐  ┌──────┴──────┐
     │ Registry    │  │ UAE Pass   │  │ Screening    │  │ AECB        │
     │ Adapter     │  │ Adapter    │  │ Adapter      │  │ Adapter     │
     │ [MOCK]      │  │ OCR/Live   │  │ [MOCK]       │  │ [MOCK]      │
     └─────────────┘  │ Adapter    │  │ Fraud        │  └─────────────┘
                      │ [MOCK]     │  │ Adapter      │
                      └────────────┘  │ [MOCK]       │
                                      └──────────────┘
            │               │              │                    │
            └───────────────┴──────────────┴────────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │           Canonical Records            │
                  │   Person DB        Business DB         │
                  └───────────────────────────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │             Audit Event Store          │
                  │         (all services write here)      │
                  └───────────────────────────────────────┘

 ┌─────────────────┐       ┌──────────────────────────────────────────┐
 │  Document       │◄──────│  Agent Service                           │
 │  Service        │       │  - Is doc?                               │
 │  - Upload       │       │  - Trade License processing              │
 │  - Storage      │       │  - Business Activity agent               │
 │  - Extraction   │       │  - Personal Documents OCR                │
 └────────┬────────┘       └──────────────────────────────────────────┘
          │
     ┌────┴───────────┐
     │ OCR Adapter    │
     │ [MOCK]         │
     └────────────────┘

 ┌──────────────┐     ┌──────────────────────────────────────────────┐
 │ Applicant    │────►│  Applicant API                               │
 │ Web / App    │     │  POST /applications                          │
 │ Partner SDK  │     │  POST /documents                             │
 └──────────────┘     │  GET  /applications/:id/status              │
                      │  POST /applications/:id/reask-response       │
                      └──────────────────────────────────────────────┘

 ┌──────────────┐     ┌──────────────────────────────────────────────┐
 │ Back Office  │────►│  Back Office API                             │
 │ UI           │     │  GET  /cases                                 │
 └──────────────┘     │  GET  /cases/:id                             │
                      │  POST /cases/:id/reask                       │
                      │  POST /cases/:id/decision                    │
                      │  GET  /cases/:id/audit-log                   │
                      └──────────────────────────────────────────────┘
```

---

## API Surface (MVP)

### Applicant API

| Method | Route | Description |
|---|---|---|
| POST | `/applications` | Create application, triggers orchestration |
| POST | `/applications/:id/documents` | Upload a document |
| GET | `/applications/:id/status` | Per-pillar status + next actions |
| GET | `/applications/:id/reasks` | Fetch open re-ask items |
| POST | `/applications/:id/reask-response` | Submit response to a re-ask |
| GET | `/signatories/invitation/:token` | Load signatory invitation context |
| POST | `/signatories/invitation/:token/complete` | Submit signatory KYC |

### Back Office API

| Method | Route | Description |
|---|---|---|
| GET | `/cases` | Queue with filters (tier, pillar status, SLA, assignee) |
| GET | `/cases/:id` | Full case view: AI summary, pillars, documents, audit |
| POST | `/cases/:id/reask` | Send targeted re-ask to applicant |
| POST | `/cases/:id/decision` | Record Maker or Checker decision |
| POST | `/cases/:id/escalate` | Escalate to Compliance Manager |
| GET | `/cases/:id/audit-log` | Full immutable event log for a case |
| GET | `/cases/:id/audit-log/export` | Export audit log (JSON / CSV) |

### Internal (Service-to-Service)

| Method | Route | Service | Description |
|---|---|---|---|
| POST | `/orchestration/events` | All → Orchestration | Publish pillar/agent status events |
| POST | `/agents/dispatch` | Orchestration → Agent Service | Dispatch a named agent run |
| GET | `/agents/runs/:id` | Orchestration → Agent Service | Poll agent run result |
| POST | `/audit/events` | All → Audit Store | Write immutable event |

---

## External Adapter Contracts (MVP: all return mock data)

### Registry Adapter
- **Input:** trade_license_number, authority (ded_ad, det_dubai, adgm, difc, moec, free_zone)
- **Output:** company_name, entity_type, activities, expiry_date, owners, is_valid, status
- **Mock:** returns hardcoded valid TL data for any input

### UAE Pass Adapter
- **Input:** redirect flow or token
- **Output:** emirates_id, full_name, date_of_birth, nationality, liveness_score
- **Mock:** returns a preset verified identity

### OCR / Liveness Adapter
- **Input:** document image or video
- **Output:** extracted_fields (JSON), document_type, is_authentic, liveness_passed, confidence
- **Mock:** returns extracted fields from a fixture set

### Screening Adapter
- **Input:** person or business name + nationality / jurisdiction
- **Output:** pep_match (bool), sanctions_match (bool), adverse_media_hits (list), risk_level
- **Mock:** returns clean result for all inputs by default; configurable to return hits for testing

### Fraud Adapter
- **Input:** device_fingerprint, ip, behavioural_signals, applicant_id
- **Output:** fraud_score (0–1), signals (list), recommendation (pass / step_up / block)
- **Mock:** always returns score 0.05 (pass)

### AECB Adapter
- **Input:** emirates_id
- **Output:** credit_status (clear / flagged / blocked), score (nullable)
- **Mock:** returns clear for all inputs

---

## Event Schema (Core Events)

All events are written to the Audit/Event Store with this envelope:

```json
{
  "id": "uuid",
  "application_id": "uuid",
  "pillar": "kyb | kyc | compliance | account | null",
  "actor_type": "system | agent | analyst | applicant | signatory | manager",
  "actor_id": "string",
  "actor_name": "string",
  "event_type": "string",
  "payload": {},
  "created_at": "ISO8601"
}
```

### Core event types (MVP)

| Event Type | Emitted By | Trigger |
|---|---|---|
| `application.created` | Orchestration | Application record created |
| `application.tier_assigned` | Orchestration | Tier determined from TL + entity type |
| `application.submitted` | Applicant API | Applicant confirms submission |
| `document.uploaded` | Document Service | Document received |
| `agent.run.dispatched` | Agent Service | Agent dispatched |
| `agent.run.completed` | Agent Service | Agent finished with verdict |
| `pillar.kyb.started` | P1 KYB | Pillar begins processing |
| `pillar.kyb.passed` | P1 KYB | All KYB checks clear |
| `pillar.kyb.flagged` | P1 KYB | One or more checks flagged |
| `pillar.kyc.started` | P2 KYC | — |
| `pillar.kyc.passed` | P2 KYC | — |
| `pillar.kyc.flagged` | P2 KYC | — |
| `pillar.compliance.started` | P3 Compliance | — |
| `pillar.compliance.passed` | P3 Compliance | — |
| `pillar.compliance.flagged` | P3 Compliance | — |
| `pillar.account.iban_reserved` | P4 Account | IBAN pre-reserved |
| `pillar.account.activated` | P4 Account | Account flipped to active |
| `signatory.invited` | P2 KYC | Invitation link sent |
| `signatory.completed` | P2 KYC | Signatory completed KYC |
| `reask.sent` | Back Office API | Re-ask sent to applicant |
| `reask.responded` | Applicant API | Applicant responded |
| `case.maker_started` | Back Office API | Maker opens case |
| `case.maker_completed` | Back Office API | Maker submits decision |
| `case.checker_completed` | Back Office API | Checker validates or overrides |
| `case.escalated` | Back Office API | Case escalated to manager |
| `case.approved` | Back Office API | Final approval recorded |
| `case.declined` | Back Office API | Final decline recorded |
