# Domain Models: Wio Business SME Onboarding

**Version:** 0.1 (MVP)
**Date:** 2026-05-08

---

## Entity Relationship Overview

```
Application ──────────────────── Business (Canonical Business Record)
     │                                    │
     │                           PersonBusinessRole
     │                                    │
     ├── PillarStatus (×4)          Person (Canonical Person Record)
     │
     ├── Document (×N)
     │       └── AgentRun
     │
     ├── CaseReview
     │       ├── Maker (User)
     │       └── Checker (User)
     │
     ├── ReAsk (×N)
     │
     └── AuditEvent (×N, append-only)
```

---

## Entities

### Application

The root record for a single onboarding attempt by one business.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `business_id` | UUID FK → Business | The entity being onboarded |
| `applicant_person_id` | UUID FK → Person | The person who initiated the application |
| `tier` | enum | `express` · `standard` · `complex` |
| `entity_type` | enum | `sole_establishment` · `llc` · `free_zone_llc` · `corporate_group` |
| `status` | enum | `draft` · `in_progress` · `pending_review` · `approved` · `declined` · `cancelled` |
| `jurisdiction` | string | e.g. `uae_mainland` · `adgm` · `difc` · `rak_icc` |
| `submitted_at` | timestamp | Set when applicant confirms submission |
| `decision_at` | timestamp | Set on final approve/decline |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**State machine:**
```
draft ──► in_progress ──► pending_review ──► approved
                                        └──► declined
                                        └──► escalated
```

**Notes:**
- One business may have only one active application at a time
- Historical applications are retained for audit; only status changes, nothing is deleted
- Future multi-entity support: add `entity_group_id` FK to group related applications under a parent company

---

### Business (Canonical Business Record)

A single source of truth for a legal entity. Created once; shared across pillars, applications, and future product surfaces.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `trade_license_number` | string | Unique per authority |
| `trade_license_authority` | enum | `ded_ad` · `det_dubai` · `adgm` · `difc` · `moec` · `uaq_ftz` · `rak_icc` · `jafza` · `dmcc` · other |
| `legal_name` | string | As on registry |
| `trade_name` | string | May differ from legal name |
| `entity_type` | enum | See Application |
| `jurisdiction` | string | |
| `incorporated_at` | date | |
| `trade_license_expiry` | date | |
| `trade_license_status` | enum | `active` · `expired` · `suspended` |
| `primary_business_activity` | string | Applicant-confirmed from TL activities |
| `business_activities` | string[] | Full list from TL |
| `compliance_activity_category` | enum | Derived by Business Activity agent |
| `ubo_graph` | JSON | Ownership tree: nodes (Person/Entity) + edges (ownership_pct, role) |
| `registry_data_source` | enum | `registry_api` · `document_upload` · `manual` |
| `registry_data_fetched_at` | timestamp | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Notes:**
- If the business already exists in Wio's system (e.g. has another product), the existing record is reused — no re-collection
- `ubo_graph` is built by the Corporate Structure agent (Group 3); in MVP it is a flat list of owners from the TL

---

### Person (Canonical Person Record)

A single source of truth for a natural person. Created once and reused across all roles they play (owner, director, signatory, UBO). If a person has been KYC-verified in another Wio product, that record is imported — zero re-collection.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `uae_pass_id` | string | nullable; primary identifier for UAE residents |
| `emirates_id` | string | nullable |
| `passport_number` | string | nullable; for non-UAE residents |
| `passport_country` | string | nullable |
| `full_name` | string | |
| `date_of_birth` | date | |
| `nationality` | string | ISO 3166-1 |
| `kyc_status` | enum | `pending` · `verified` · `failed` · `expired` |
| `kyc_verified_at` | timestamp | |
| `kyc_expires_at` | timestamp | Per-record expiry, not application-level |
| `liveness_verified` | bool | |
| `liveness_verified_at` | timestamp | |
| `is_pep` | bool | nullable until screened |
| `is_sanctioned` | bool | nullable until screened |
| `screening_last_run_at` | timestamp | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### PersonBusinessRole

Links a Person to a Business within the context of an Application. A person can hold multiple roles on the same application (e.g. owner + authorized signatory).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `person_id` | UUID FK → Person | |
| `business_id` | UUID FK → Business | |
| `application_id` | UUID FK → Application | |
| `role` | enum | `owner` · `director` · `ubo` · `signatory` · `representative` · `authorized_user` |
| `ownership_pct` | decimal | nullable; required if role is `owner` or `ubo` |
| `signing_authority` | bool | Whether this person can sign on behalf of the business |
| `invitation_status` | enum | `not_required` · `pending` · `sent` · `accepted` · `completed` · `expired` |
| `invitation_sent_at` | timestamp | |
| `invitation_token` | string | Unique per invitation; expires |
| `invitation_expires_at` | timestamp | |
| `completed_at` | timestamp | When this person completed their verification |

**Notes:**
- `signatory` and `representative` roles trigger an invitation flow; others are derived from documents
- Future preparer role (someone who fills the form on behalf of the applicant) maps here as `representative`

---

### PillarStatus

Tracks the state of each pillar independently per application.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `application_id` | UUID FK → Application | |
| `pillar` | enum | `kyb` · `kyc` · `compliance` · `account` |
| `status` | enum | `not_started` · `in_progress` · `passed` · `flagged` · `failed` · `awaiting_input` · `expired` |
| `started_at` | timestamp | |
| `completed_at` | timestamp | |
| `expires_at` | timestamp | Per-pillar expiry; only perishable data triggers re-validation |
| `assigned_to` | UUID FK → User | nullable; set when a human is assigned for review |
| `last_agent_run_id` | UUID FK → AgentRun | nullable |
| `notes` | text | nullable; analyst notes |
| `updated_at` | timestamp | |

---

### Document

A document uploaded by the applicant or fetched from a registry.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `application_id` | UUID FK → Application | |
| `type` | enum | `trade_license` · `moa` · `board_resolution` · `emirates_id` · `passport` · `proof_of_address` · `powers_of_attorney` · `shareholder_register` · `audited_financials` · `other` |
| `storage_url` | string | Secure internal URL; not publicly accessible |
| `uploaded_by_person_id` | UUID FK → Person | The person who uploaded |
| `source` | enum | `applicant_upload` · `registry_api` · `internal` |
| `is_valid` | bool | nullable until validated by Is doc? agent |
| `extraction` | JSON | Agent extraction output (fields + confidence scores) |
| `validation_verdict` | enum | nullable; `pass` · `flag` · `fail` |
| `agent_run_id` | UUID FK → AgentRun | nullable; the agent run that validated/extracted this doc |
| `uploaded_at` | timestamp | |
| `expires_at` | timestamp | nullable; for time-limited documents (e.g. Proof of Address <90d) |

---

### AgentRun

Records a single execution of a named agent, its inputs, outputs, and verdict.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `application_id` | UUID FK → Application | |
| `agent_name` | enum | `is_doc` · `tl_processing` · `business_activity` · `personal_ocr` · `moa_digestion` · `powers_resolution` · `edd_agent` · `public_domain_search` · `reask_agent` · `corporate_structure` · `shareholders_kyc` · `signing_powers_kyc` · `mandates` · `ai_rm` · `maker_agent` · `checker_agent` · `edd_maker` · `edd_checker` · `quality_agent` · `escalations_agent` |
| `pillar` | enum | Which pillar this agent serves |
| `delivery_group` | enum | `group_1` · `group_2` · `group_3` |
| `status` | enum | `pending` · `running` · `completed` · `failed` |
| `input` | JSON | Snapshot of input data at time of run |
| `output` | JSON | Structured agent output |
| `verdict` | enum | `pass` · `flag` · `fail` · `requires_input` |
| `confidence` | float | 0–1; nullable for rule-based agents |
| `reasoning` | text | Human-readable summary of why the agent reached its verdict |
| `started_at` | timestamp | |
| `completed_at` | timestamp | |
| `error` | text | nullable; populated on failure |

---

### ReAsk

A targeted request for missing or inconsistent information sent to the applicant.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `application_id` | UUID FK → Application | |
| `pillar` | enum | Which pillar the re-ask pertains to |
| `initiated_by` | enum | `agent` · `analyst` |
| `initiated_by_id` | string | Agent name or User ID |
| `items` | JSON | Array of `{ field, reason, document_type_required }` |
| `status` | enum | `pending` · `sent` · `responded` · `resolved` · `expired` |
| `sent_at` | timestamp | |
| `responded_at` | timestamp | |
| `resolved_at` | timestamp | |
| `expires_at` | timestamp | If not responded to, triggers escalation |

**Constraint:** Only one open ReAsk per application at a time. Multiple outstanding items are batched into a single ReAsk.

---

### CaseReview

The workflow record for human Maker/Checker review of an application.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `application_id` | UUID FK → Application | |
| `maker_id` | UUID FK → User | Analyst assigned as Maker |
| `checker_id` | UUID FK → User | nullable; assigned when Maker submits |
| `status` | enum | `maker_in_progress` · `awaiting_checker` · `approved` · `declined` · `escalated` |
| `decision` | enum | nullable; `approve` · `decline` · `escalate` |
| `decision_reason` | text | Mandatory on any decision |
| `ai_summary_acknowledged` | bool | Maker confirms they read the AI summary |
| `maker_started_at` | timestamp | |
| `maker_completed_at` | timestamp | |
| `checker_completed_at` | timestamp | |
| `escalated_to_id` | UUID FK → User | nullable; Compliance Manager |
| `escalation_reason` | text | nullable |

**Notes:**
- For Tier 1 Express, CaseReview is auto-generated with `maker_id = system` and `status = approved` — the record still exists for auditability
- Checker may approve, override the Maker's decision, or escalate — all paths require a `decision_reason`

---

### AuditEvent

Append-only. Never updated or deleted. Every significant state change, agent output, human action, and data access is written here.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `application_id` | UUID FK → Application | |
| `pillar` | enum | nullable |
| `actor_type` | enum | `system` · `agent` · `analyst` · `applicant` · `signatory` · `manager` |
| `actor_id` | string | User ID, agent name, or "system" |
| `actor_name` | string | Human-readable actor label |
| `event_type` | string | Namespaced string e.g. `pillar.kyb.passed`, `case.approved` |
| `payload` | JSON | Full snapshot of relevant data at time of event |
| `created_at` | timestamp | Immutable; set on write |

**Storage:** append-only log with no UPDATE or DELETE permissions at the database level. The full application state can be reconstructed by replaying events in `created_at` order.

---

### User

An internal Wio ops user (Maker, Checker, Compliance Manager).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `email` | string | |
| `name` | string | |
| `role` | enum | `analyst` · `compliance_manager` · `auditor` · `admin` |
| `is_active` | bool | |
| `created_at` | timestamp | |

**Notes:**
- Maker and Checker are workflow states on `CaseReview`, not User roles. Any `analyst` can be a Maker or Checker.
- Compliance Manager role grants access to escalation queue, EDD oversight, and queue configuration.

---

## Key Relationships Summary

```
Application
  ├── 1   Business                   (many applications can reference one Business over time)
  ├── 1   Person (applicant)
  ├── N   PersonBusinessRole         (all people involved: owners, signatories, UBOs)
  │         └── 1 Person             (reused from Canonical Person DB)
  ├── 4   PillarStatus               (one per pillar, independent lifecycle)
  ├── N   Document
  │         └── 0..1 AgentRun        (the run that validated/extracted this doc)
  ├── N   AgentRun                   (all agent runs for this application)
  ├── 0..N ReAsk                     (at most one open at a time)
  ├── 0..1 CaseReview                (created when application enters review queue)
  └── N   AuditEvent                 (append-only; written by all services)
```

---

## Enumerations Reference

### Application / Entity Types
`sole_establishment` · `llc` · `free_zone_llc` · `free_zone_est` · `corporate_group` · `branch` · `ngo`

### Pillar
`kyb` · `kyc` · `compliance` · `account`

### Pillar / Application Status
`not_started` · `draft` · `in_progress` · `passed` · `flagged` · `failed` · `awaiting_input` · `pending_review` · `approved` · `declined` · `expired` · `cancelled`

### Person Role
`owner` · `director` · `ubo` · `signatory` · `representative` · `preparer` · `authorized_user`

### Document Type
`trade_license` · `moa` · `board_resolution` · `emirates_id` · `passport` · `proof_of_address` · `powers_of_attorney` · `shareholder_register` · `audited_financials` · `edd_response` · `other`

### Trade License Authority
`ded_ad` · `det_dubai` · `adgm` · `difc` · `moec` · `uaq_ftz` · `rak_icc` · `jafza` · `dmcc` · `other_free_zone` · `other`
