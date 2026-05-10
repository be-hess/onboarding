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

## Key concepts

**Four pillars** — the application progresses across four independent services in parallel:
- P1 KYB (business verification via UAE registries)
- P2 KYC (people verification — UAE Pass, Emirates ID, liveness)
- P3 Compliance / Risk / Fraud (EDD, AML/PEP screening, CRAM, fraud signals)
- P4 Account Setup (IBAN pre-reservation, AECB, plan selection post-approval)

**Three complexity tiers:**
- Tier 1 Express — Sole Establishment, fully automated, T2FT < 1h
- Tier 2 Standard — LLC, semi-automated, T2FT < 24h
- Tier 3 Complex — international ownership / high-risk sectors, specialist review, T2FT < 72h

**Agent delivery groups:**
- Group 1 (MVP): Is doc?, Trade License processing, Business Activity agent, Personal Documents OCR
- Group 2: EDD agent, MOA digestion, Powers Resolution, Re-ask Agent, Public domain search
- Group 3: Corporate Structure, Shareholders KYC, AI RM, Maker/Checker agents, EDD Maker/Checker, Quality + Escalations agents

**Smart Orchestration Engine** — central coordinator that classifies tier, routes modules, dispatches agents, and tracks pillar status.

**Canonical records** — a Person and a Business are created once and reused across all pillars and roles. No cross-pillar re-collection.

**Audit Event Store** — append-only, immutable log of every state change, agent output, and human decision. CBUAE audit-ready.

## MVP constraints

- All external integrations are **mocked** (UAE registries, UAE Pass, AECB, AML screening, fraud signals, OCR/liveness)
- Group 1 agents only in MVP; Groups 2 and 3 are phased
- English-only UI; web-first (mobile-responsive)
- Single jurisdiction: UAE mainland

## Context

- Company: Wio (wio.io), UAE sovereign digital bank
- UAE-specific: UAE Pass, Emirates ID, DED/ADGM/DIFC/MOEC registries, AECB, CBUAE regulations, FATCA/CRS
- Target metrics: conversion 75%→85%, TAT p-90→24h, Onboarding NPS→80
