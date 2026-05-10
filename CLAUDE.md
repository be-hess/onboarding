# Wio Business — SME Onboarding

This repository contains product and technical documentation for the Wio Business AI-Powered SME Onboarding platform.

## What this is

A modular, AI-powered onboarding platform for Wio Business (UAE digital bank). The goal is to replace a rigid, manual, one-size-fits-all SME onboarding flow with an adaptive, document-first, agent-powered experience.

## Repository structure

```
docs/
  product-brief.md   — Product scope, users, JTBD, flows, metrics, phasing
  architecture.md    — System design, component diagram, event flow, design decisions
  service-map.md     — Service inventory, API surface, adapter contracts, event schema
  domain-models.md   — Entity definitions, field-level detail, relationships
  user-flows.md      — Step-by-step flows for all 7 key journeys
```

---

## Architecture Principles

- **Pillar independence** — KYB, KYC, Compliance, and Account are independent services. A delay or failure in one must not block progress in others. Pillars communicate via events, never direct calls.
- **Event-driven** — state changes are published as events on a central bus. Services subscribe; they do not poll or call each other synchronously outside of clear API boundaries.
- **Modular and phased** — each service and agent group ships as an independently deployable unit. Phase N+1 must not require simultaneous rollout of Phase N.
- **Platform agnostic** — all business logic lives in backend services. Clients (web, mobile, partner embed) are thin rendering shells over the same APIs. No logic in the client that would need to be duplicated per platform.
- **Mock-first integrations** — every external dependency (UAE registries, UAE Pass, AECB, AML, fraud, OCR) is accessed through an adapter interface. Mock implementations are production-quality and config-switchable. Real adapters replace mocks without service changes.
- **Canonical records, not re-collection** — a Person is created once (anchored to UAE Pass or Emirates ID) and reused across all roles and pillars. A Business is created once and reused across applications. No cross-pillar re-collection of data already captured.
- **Per-pillar state** — expiry, progress, and status are tracked per pillar, not per application. A stale document in P1 does not invalidate verified liveness in P2.
- **Future multi-entity readiness** — data models include an `entity_group_id` hook from day one. No architectural refactor should be required to support parent–subsidiary structures in a later phase.

---

## Frontend Standards

- **API-first** — the frontend never owns business logic or compliance rules. Every decision, validation, and routing rule comes from the backend. The UI renders state, it does not compute it.
- **Platform agnostic** — the same component library and flow logic must work across web browser, mobile web, and partner-embedded surfaces (iframe or SDK wrapper). Build once; render anywhere.
- **Mobile-first, responsive** — design and build for the smallest screen first. The primary use case is a business owner onboarding on their phone.
- **Progressive disclosure** — show only what the user needs to act on right now. Do not present all steps, fields, or requirements upfront. Each screen has one primary action.
- **i18n from day one** — all user-facing strings are externalized to a translation layer from the first line of code. Arabic (RTL) support will be added in Phase 2; the architecture must not need retrofitting.
- **Accessibility** — WCAG 2.1 AA minimum. All form inputs have labels. All interactive elements are keyboard-navigable. Camera/liveness flows have a fallback path for unsupported devices.
- **No loading spinners without context** — when the system is processing (e.g. extracting TL data), show what is happening: "Checking document validity…", "Extracting company details…". Never a blank spinner.
- **Error states are actionable** — every error message tells the user what went wrong and what to do next. Never show a raw error code or a generic "something went wrong".

---

## Backend Standards

- **REST for external-facing APIs** — Applicant API and Back Office API are REST. Use standard HTTP verbs and status codes. No GraphQL in MVP.
- **Event bus for internal communication** — pillar services and the Orchestration Engine communicate via async events. No synchronous cross-service calls for non-critical paths.
- **Adapter pattern for all integrations** — every third-party service has an interface and a mock implementation. The interface is the contract; the adapter is the detail. Services import the interface, never the concrete adapter.
- **Idempotent agent dispatch** — dispatching the same agent run twice must produce the same result and not create duplicate records. Agent runs are keyed on `(application_id, agent_name, input_hash)`.
- **No soft deletes on compliance data** — Application, Document, AgentRun, AuditEvent, and CaseReview records are never deleted. Use status fields for lifecycle management.
- **Secrets never in code** — all credentials, API keys, and tokens are environment variables or a secrets manager. No exceptions.
- **SLAs as first-class config** — per-pillar SLA thresholds (e.g. KYB auto-check in 5 min, Compliance review in 24h) are configuration values, not hardcoded. Breaches trigger automated escalation.

---

## AI Orchestration Principles

- **Agents are workers, not decision-makers** — every agent produces a structured verdict (`pass / flag / fail / requires_input`) plus reasoning. Final decisions (approve, decline, escalate) are always made by a human or an explicitly configured auto-approve rule. Agents recommend; they do not decide.
- **Defined contracts** — every agent has a typed input schema, typed output schema, verdict enum, and confidence score. Changing an agent's internal logic must not change its contract.
- **All agent runs are logged** — every dispatch, input snapshot, output, verdict, confidence, and reasoning string is persisted in `AgentRun`. Ops can inspect any agent's reasoning for any case at any time.
- **Agents are swappable** — the Agent Service dispatches by `agent_name`. The underlying implementation (rule-based, LLM, fine-tuned model) is an internal detail. Swapping implementations requires no changes outside the Agent Service.
- **Human override is always available** — any agent verdict can be overridden by an analyst. Overrides are logged with a mandatory reason and feed back into agent quality tracking.
- **Graceful degradation** — if an agent fails or times out, the pillar falls back to the human review queue. A failed agent run must never silently stall an application.
- **Group 1 agents in MVP; Groups 2 and 3 are phased** — do not build Group 2 or 3 agent logic into the MVP architecture. Placeholders are acceptable; premature implementation is not.

---

## Auditability Requirements

These are non-negotiable. Audit is a regulatory requirement (CBUAE), not a feature.

- **Every state change is an AuditEvent** — submissions, pillar status changes, agent outputs, human decisions, re-asks, document uploads, data accesses, and overrides. No exceptions.
- **Append-only** — the AuditEvent table has no UPDATE or DELETE permissions at the database level. Events are written once and never modified.
- **Actor always tagged** — every AuditEvent carries `actor_type` (system / agent / analyst / applicant / signatory / manager) and `actor_id`. Anonymous events are not permitted.
- **Payload snapshot** — the `payload` field captures a snapshot of the relevant data at the time of the event, not a pointer to a mutable record. The audit log must be self-contained and not depend on current record state.
- **Access is itself audited** — when an auditor reads or exports an audit log, that access is recorded as an AuditEvent.
- **Full state reconstructability** — replaying all AuditEvents for an application in `created_at` order must reproduce the complete application state at any past moment.
- **Export must be regulator-ready** — the Back Office API must support structured export (JSON and CSV) filtered by application, pillar, actor, date range, and event type. No manual assembly required.

---

## Coding Conventions

- **Naming** — use `snake_case` for database fields and API JSON keys. Use `camelCase` for in-code variables and functions. Use `PascalCase` for types, classes, and components.
- **Enumerations over strings** — all status fields, pillar identifiers, actor types, document types, and agent names are enums, not free-text strings. Define enums in a shared types package.
- **No logic in migrations** — database migrations contain only schema changes. Data migrations are separate, versioned scripts run explicitly.
- **No secrets in logs** — personally identifiable information (names, EID numbers, passport numbers) must not appear in application logs. Use redaction middleware.
- **Explicit over implicit** — prefer verbose, readable code over clever abstractions. Onboarding logic must be auditable by a compliance engineer, not just a software engineer.
- **Test coverage for compliance paths** — every agent verdict path, every pillar state transition, and every auto-approve/decline rule must have a test. UI tests are optional in MVP; compliance logic tests are not.
- **Adapter mocks are test-quality** — mock adapters must behave exactly as the real adapters would in the happy path and in configurable failure modes. A mock that always returns success is not a complete mock.

---

## UX Philosophy

- **Document-first, not form-first** — the applicant's first action is scanning or uploading their Trade License. The system extracts and pre-fills; the applicant reviews and corrects. Never ask for information the system can extract.
- **No surprises** — if a sector triggers EDD questions, warn the applicant when they select their sector. If a document will take time to verify, show a realistic ETA. Reveal requirements progressively, not all at once.
- **One re-ask, not a batch** — when additional information is needed, send a single, targeted, clearly explained request. Multiple re-asks sent at different times are a failure mode, not a feature.
- **Progress is always visible** — the applicant sees a per-pillar status tracker with ETAs and next actions at all times. "We're reviewing your application" with no further detail is not acceptable.
- **Clarity over cleverness** — use plain language. Avoid banking jargon where possible. If a compliance term (e.g. EDD, UBO) must be used, define it inline.
- **Inclusive by default** — the flow must work for a sole proprietor with a basic smartphone and for a CFO on a desktop. Avoid features that require high-end devices (e.g. NFC-only ID scanning without a fallback).
- **Continuity** — applicants can pause and resume without losing progress. Returning to an in-progress application shows exactly where they left off. Per-pillar expiry applies only to perishable data, not the full application.
- **Tone** — warm, confident, and direct. Wio's voice is supportive, not corporate. The experience should feel like a knowledgeable guide, not a bureaucratic form.

---

## Design System

- **Follow Wio's design system** — all UI components, typography, colour tokens, spacing scales, and iconography come from Wio's established design system. Do not introduce custom components where a system component exists.
- **Component-first** — build with existing design system components. New patterns require design review before implementation. Do not style one-offs in component code.
- **Tokens, not hardcoded values** — use design tokens for all colours, spacing, border radii, and type sizes. Never hardcode hex values or pixel values in component styles.
- **Dark mode / theming** — components must consume theme tokens. Light mode is the default; the architecture must not prevent dark mode or white-label partner theming in future.
- **Motion** — use motion purposefully. Loading states and transitions should communicate what is happening (e.g. "Extracting company details…" with a subtle animation), not just fill time. Respect `prefers-reduced-motion`.
- **Partner embedding** — when the flow is embedded in a partner surface, Wio's design system components render inside the embed. The partner can supply a colour theme via the SDK config; they cannot override component structure or behaviour.

---

## Key Context

- **Company:** Wio (wio.io), UAE sovereign digital bank
- **UAE-specific:** UAE Pass, Emirates ID, DED / DET / ADGM / DIFC / MOEC registries, AECB, CBUAE regulations, FATCA/CRS
- **MVP constraints:** all external integrations mocked, Group 1 agents only, English-only UI, web-first, UAE mainland jurisdiction
- **Target metrics:** conversion 75%→85%, TAT p-90→24h, Onboarding NPS→80, T2FT Tier 1 <1h / Tier 2 <24h / Tier 3 <72h
