# Service Map: Wio Business SME Onboarding

**Version:** 0.2
**Date:** 2026-05-18

---

## Service Inventory

| Service | Type | Owns | Consumes | MVP Status |
|---|---|---|---|---|
| Pillar Orchestrator | Internal core | Application state, tier classification, agent dispatch, SLA enforcement | All pillar events, agent outputs, OPA/Rego policy engine | MVP |
| Applicant API | Internal API | Applicant-facing routes (Steps 01–06) | Orchestrator, Document Service, Notification Service | MVP |
| Back Office API | Internal API | Unified Case Workspace routes, case queue | All pillar services, Audit Service | MVP |
| KYB Service | Internal pillar | Business profile, UBO graph, TL registry validation, KYB score | Registry Adapter, Document Service, KYB Intl Adapter, Canonical Business DB | MVP |
| KYI Service | Internal pillar | Person verification, signatory status, CPR management | UAE Pass Adapter, OCR/Liveness Adapter, Nomad/IDfy Adapter, Canonical Person DB | MVP |
| WWMA Service | Internal pillar | CRAM, EDD, AML/PEP screening, AECB, IBAN pre-reservation, activation | OPA/Rego Engine, Screening Adapter, Fraud Adapter, AECB Adapter, Contentful, Core Banking Stub, Canonical records | MVP |
| OPA/Rego Policy Engine | Internal service | CRAM scoring, EDD trigger logic, field expiry rules — all pinned to policy version | Versioned policy repo; all pillar services call it | MVP (read-only, no admin UI in MVP) |
| Agent Service | Internal core | Agent run lifecycle, agent output store | All pillar services, Document Service | MVP (Group 1 agents) |
| Document Service | Internal core | Document storage, type validation, extraction results | OCR Adapter, Document Store | MVP |
| Canonical Person DB | Internal data | Person records (CPR) across all roles | KYI, WWMA, KYB (UBO) | MVP |
| Canonical Business DB | Internal data | Business entity records (CBR) including KYB score | KYB, WWMA | MVP |
| Audit / Event Store | Internal data | Immutable event log (EventStoreDB / Kafka log-compacted) | All services (write); Back Office API (read) | MVP |
| Notification Service | Internal utility | Outbound comms (email, bilingual SMS AR/EN, push) | Application state events | MVP (email only; SMS/push stub) |
| Registry Adapter | External adapter | — | TAMM (ADDED), DET Dubai, ADGM, DIFC, MOEC, DMCC, JAFZA, RAK ICC, UAQ FTZ, SHAMS | **Mocked in MVP** |
| UAE Pass Adapter | External adapter | — | UAE Pass OIDC SOP3 / High Assurance | **Mocked in MVP** |
| OCR / Liveness Adapter | External adapter | — | Onfido (NIST PAD Level 2) / AWS Textract / Klippa / Hyperscience | **Mocked in MVP** |
| Screening Adapter | External adapter | — | LSEG WorldCheck · Dow Jones Risk Center · ComplyAdvantage (webhook-based) | **Mocked in MVP** |
| Fraud Adapter | External adapter | — | Sift / Seon / Feedzai (SDK in-app + server-side API) | **Mocked in MVP** |
| AECB Adapter | External adapter | — | AECB Credit Bureau API (TTL-cached 24h) | **Mocked in MVP** |
| KYB Intl Adapter | External adapter | — | Moody's KYB / Refinitiv / D&B — international UBO resolution | **Mocked in MVP** |
| Nomad / IDfy Adapter | External adapter | — | Remote attestation for non-UAE individuals | **Mocked in MVP** |
| Contentful CMS | External service | — | EDD question bank (sector × jurisdiction, versioned) | **Mocked in MVP** |
| Core Banking Stub | External adapter | — | Core banking provisioning system (IBAN allocation, account creation) | **Stubbed in MVP** |

---

## Service Interaction Map

```
                        ┌─────────────────────────┐
                        │   Pillar Orchestrator   │
                        │  (Temporal / Step Fn)   │
                        └──┬──────────┬───────────┘
                           │          │          │
            ┌──────────────┘          │          └──────────────────┐
            │                         │                             │
            ▼                         ▼                             ▼
     ┌────────────┐         ┌──────────────────┐      ┌────────────────────┐
     │  KYB       │         │  KYI Service     │      │  WWMA Service      │
     │  Service   │         │  (Know Your      │      │  (Who Will Manage  │
     │            │         │   Individual)    │      │   the Account)     │
     └──────┬─────┘         └────────┬─────────┘      └──────────┬─────────┘
            │                        │                           │
     ┌──────┴──────┐  ┌─────────────┐│  ┌──────────┐   ┌────────┴───────────┐
     │ Registry    │  │ UAE Pass    ││  │ Nomad/   │   │ Screening Adapter  │
     │ Adapter     │  │ Adapter     ││  │ IDfy     │   │ LSEG/DJ/ComplyAdv  │
     │ (TAMM/DET/  │  │ (OIDC SOP3) ││  │ Adapter  │   │ [MOCK]             │
     │  ADGM/DIFC/ │  │ [MOCK]      ││  │ [MOCK]   │   ├────────────────────┤
     │  top zones) │  ├─────────────┘│  └──────────┘   │ Fraud Adapter      │
     │ [MOCK]      │  │ OCR/Liveness │                  │ (Sift/Seon/Feedzai)│
     ├─────────────┤  │ Adapter      │                  │ [MOCK]             │
     │ KYB Intl    │  │ (Onfido /    │                  ├────────────────────┤
     │ (Moody's /  │  │  Textract)   │                  │ AECB Adapter       │
     │  Refinitiv/ │  │ [MOCK]       │                  │ (TTL-cached 24h)   │
     │  D&B)       │  └──────────────┘                  │ [MOCK]             │
     │ [MOCK]      │                                     ├────────────────────┤
     └─────────────┘                                     │ OPA/Rego Engine    │
                                                         │ (CRAM, EDD, expiry)│
                                                         └────────────────────┘
            │                        │                           │
            └────────────────────────┴───────────────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │           Canonical Records            │
                  │  Person DB (CPR)   Business DB (CBR)  │
                  └───────────────────────────────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  │         Audit / Event Store            │
                  │  (EventStoreDB / Kafka log-compacted)  │
                  │       all services write here          │
                  └───────────────────────────────────────┘

 ┌─────────────────┐       ┌──────────────────────────────────────────┐
 │  Document       │◄──────│  Agent Service                           │
 │  Service        │       │  Group 1: Is doc? · TL processing        │
 │  - Upload       │       │           Business Activity · Personal OCR│
 │  - Storage      │       │  Group 2+: (post-MVP stubs only)         │
 │  - Extraction   │       └──────────────────────────────────────────┘
 └────────┬────────┘
          │
     ┌────┴───────────┐
     │ OCR Adapter    │
     │ [MOCK]         │
     └────────────────┘

 ┌──────────────┐     ┌──────────────────────────────────────────────┐
 │ Applicant    │────►│  Applicant API                               │
 │ Web / App    │     │  POST /auth/uae-pass                         │
 │ Partner SDK  │     │  POST /pre-screen                            │
 └──────────────┘     │  POST /applications                          │
                      │  POST /applications/:id/documents            │
                      │  GET  /applications/:id/status               │
                      │  POST /applications/:id/reask-response       │
                      │  GET  /signatories/invitation/:token         │
                      │  POST /signatories/invitation/:token/complete│
                      └──────────────────────────────────────────────┘

 ┌──────────────┐     ┌──────────────────────────────────────────────┐
 │ Back Office  │────►│  Back Office API                             │
 │ Unified Case │     │  GET  /cases                                 │
 │ Workspace    │     │  GET  /cases/:id  (3-pillar view)            │
 └──────────────┘     │  POST /cases/:id/reask                       │
                      │  POST /cases/:id/decision                    │
                      │  POST /cases/:id/escalate                    │
                      │  GET  /cases/:id/audit-log                   │
                      │  GET  /cases/:id/audit-log/export            │
                      └──────────────────────────────────────────────┘
```

---

## API Surface (MVP)

### Applicant API

| Method | Route | Description |
|---|---|---|
| POST | `/auth/uae-pass` | UAE Pass OIDC callback; creates/matches CPR; returns session token |
| POST | `/pre-screen` | Submit TL number + consent; triggers registry pull + screening; returns pre-screen outcome + tier |
| POST | `/applications` | Create application after successful pre-screen |
| POST | `/applications/:id/cdd-answers` | Submit 3 CDD questions (Step 03); triggers CRAM |
| POST | `/applications/:id/documents` | Upload a document (fallback path only) |
| GET | `/applications/:id/status` | Per-pillar status (KYB · KYI · WWMA) + next actions + ETA |
| GET | `/applications/:id/reasks` | Fetch open re-ask items |
| POST | `/applications/:id/reask-response` | Submit response to a re-ask |
| POST | `/applications/:id/activate` | Trigger e-signature + activation (Step 06) |
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
- **Input:** trade_license_number, authority (tamm_added, det_dubai, adgm, difc, moec, dmcc, jafza, rak_icc, uaq_ftz, shams)
- **Output:** legal_name_ar, legal_name_en, entity_type, isic_activities, expiry_date, owners_list, registered_address, license_status, is_valid
- **Mock:** returns hardcoded valid TL data for any input; configurable to return expired/suspended for testing

### UAE Pass Adapter
- **Input:** OIDC authorization code (SOP3 / High Assurance flow)
- **Output:** uae_pass_id, emirates_id, full_name_ar, full_name_en, date_of_birth, nationality, mobile, email, assurance_level
- **Mock:** returns a preset verified UAE national identity

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
| `auth.uae_pass.completed` | Applicant API | UAE Pass OIDC flow completed; CPR created or matched |
| `application.pre_screen.eligible` | WWMA Service | Pre-screen result: eligible |
| `application.pre_screen.needs_review` | WWMA Service | Pre-screen result: needs review |
| `application.pre_screen.cannot_proceed` | WWMA Service | Pre-screen result: blocked (no tipping off on reason) |
| `application.created` | Orchestrator | Application record created after pre-screen pass |
| `application.cram_computed` | WWMA Service | CRAM score + tier assigned; policy_version logged |
| `application.edd_triggered` | WWMA Service | EDD questionnaire triggered by CRAM/sector |
| `application.tier_assigned` | Orchestrator | Tier (express/standard/complex) finalised at Step 03 |
| `application.submitted` | Applicant API | Applicant confirms submission |
| `document.uploaded` | Document Service | Document received (fallback path) |
| `agent.run.dispatched` | Agent Service | Agent dispatched |
| `agent.run.completed` | Agent Service | Agent finished with verdict + policy_version |
| `pillar.kyb.started` | KYB Service | Pillar begins processing |
| `pillar.kyb.registry_fetched` | KYB Service | Registry pull completed |
| `pillar.kyb.passed` | KYB Service | All KYB checks clear |
| `pillar.kyb.flagged` | KYB Service | One or more checks flagged |
| `pillar.kyi.started` | KYI Service | — |
| `pillar.kyi.passed` | KYI Service | All people verified |
| `pillar.kyi.flagged` | KYI Service | — |
| `pillar.wwma.started` | WWMA Service | — |
| `pillar.wwma.iban_reserved` | WWMA Service | IBAN pre-reserved in pending_activation |
| `pillar.wwma.passed` | WWMA Service | All WWMA checks clear |
| `pillar.wwma.flagged` | WWMA Service | — |
| `pillar.wwma.account_activated` | WWMA Service | Account flipped to active; T2FT recorded |
| `signatory.invited` | KYI Service | Tokenised UAE Pass deep-link sent |
| `signatory.completed` | KYI Service | Signatory completed KYI |
| `screening.pep_match` | WWMA Service | PEP match found — mandatory Compliance review triggered |
| `screening.sanctions_match` | WWMA Service | Sanctions match — application frozen; STR to be filed by MLRO |
| `reask.sent` | Back Office API | Re-ask sent to applicant |
| `reask.responded` | Applicant API | Applicant responded |
| `case.officer_assigned` | Back Office API | Named Case Officer assigned |
| `case.maker_started` | Back Office API | Maker opens case |
| `case.maker_completed` | Back Office API | Maker submits decision |
| `case.checker_completed` | Back Office API | Checker validates or overrides |
| `case.escalated` | Back Office API | Case escalated to Compliance Manager / MLRO |
| `case.approved` | Back Office API | Final approval recorded |
| `case.declined` | Back Office API | Final decline recorded |
| `account.first_transaction_completed` | Transaction Monitor | T2FT milestone recorded |
