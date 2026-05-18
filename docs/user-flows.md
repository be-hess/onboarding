# User Flows: Wio Business SME Onboarding

**Version:** 0.2
**Date:** 2026-05-18

---

## Flow Index

1. [Tier 1 — Express Onboarding (Sole Establishment)](#flow-1--tier-1-express-onboarding-sole-establishment)
2. [Tier 2 — Standard Onboarding (LLC)](#flow-2--tier-2-standard-onboarding-llc)
3. [Signatory Self-Serve Verification (KYI Pillar)](#flow-3--signatory-self-serve-verification-kyi-pillar)
4. [Back Office — Maker Review (Unified Case Workspace)](#flow-4--back-office--maker-review-unified-case-workspace)
5. [Back Office — Checker Validation](#flow-5--back-office--checker-validation)
6. [Re-Ask Response (Applicant)](#flow-6--re-ask-response-applicant)
7. [Auditor — Audit Trail Access](#flow-7--auditor--audit-trail-access)

---

## Flow 1 — Tier 1: Express Onboarding (Sole Establishment)

**Who:** A UAE sole proprietor or freelancer. Single owner, no additional UBOs or signatories.
**Target:** Account active in < 1 hour.
**Automation:** Fully automated — no human review if all signals are clean.
**Key difference from Tier 2:** Step 04 (Who needs access?) is skipped entirely. No MOA, no signatory invitations.

```
Applicant                          System / Services
────────────────────────────────   ─────────────────────────────────────────

── STEP 01 — Sign in with UAE Pass ──────────────────────────────────────────

1. Opens Wio Business app or web   → UAE Pass OIDC flow (SOP3 / High Assurance)
   Taps "Sign in with UAE Pass"        [MOCK]
                                       CPR hydrated: verified EID, legal name
                                       (AR/EN), DOB, nationality, mobile, email.
                                       Device fingerprint bound to session.
                                       Continuous fraud stream starts (Sift/
                                       Seon/Feedzai) [MOCK]
                                   → If existing Wio Personal CPR with fresh
                                       KYC (<12 months): offered for reuse
                                       with explicit new consent — never auto-
                                       imported.

── STEP 02 — Find your business ────────────────────────────────────────────

2. Enters trade licence number     → KYB Service: TAMM/DET/ADGM registry pull
   Reviews consent screen              [MOCK] returns: legal name (AR/EN),
   Taps "I agree, continue"            licence type, expiry, ISIC activities,
                                       owner list (single owner 100%), address.
                                   → WWMA Service (parallel, ~60s):
                                       ✓ Sanctions screening (LSEG/DJ/
                                         ComplyAdvantage) [MOCK]
                                       ✓ PEP + adverse media screening [MOCK]
                                       ✓ AECB pre-check on EID + TL [MOCK]
                                       ✓ Internal Wio block list check
                                       ✓ KYB Score computed
                                   → WWMA Service: IBAN reserved in
                                       pending_activation state (pre-
                                       provisioning begins now)

3. Pre-screen result displayed:    ── Pre-screen outcomes ──────────────────
   ✓ Eligible                       → Tier shown: "Express path (~5 min)"
     Tier + estimated T2FT shown       Estimated T2FT: < 1 hour
   ⚠ Needs review → reason shown
   ✗ Cannot proceed → compliant
     reason (no tipping off on
     sanctions matches)

── STEP 03 — Tell us about your business ───────────────────────────────────

4. Answers 3 mandatory questions:  → WWMA Service: CRAM engine (OPA/Rego)
   1. Primary business activity        computes risk: Low/Medium/High
      (ISIC chips, pre-selected    → Result pinned to policy version ID
       from registry data)         → EDD trigger evaluated: no extra
   2. Expected monthly turnover         questions for standard sector
      (range selector)             → FATCA/CRS classification derived:
   3. Source of funds                   Active NFFE (auto-derived from registry)
                                   → Tier 1 confirmed:
                                       Sole Est + Low CRAM + UAE national +
                                       standard sector → express path
                                       Step 04 SKIPPED

── STEP 05 — Track everything (Step 04 skipped for Tier 1) ─────────────────

5. Sees 3-lane tracker:            ┌────────────────────────────────────────┐
   KYB  ████████████  ✓ Passed     │ KYB:  Registry data clean              │
   KYI  ████████████  ✓ Passed     │       Single owner verified via UAE Pass│
   Acct ████████████  ✓ Passed     │ KYI:  UAE Pass liveness passed [MOCK]  │
                                   │ WWMA: AML/PEP clean · AECB clear       │
                                   │       CRAM: Low · No EDD               │
                                   │       IBAN reserved · account pending  │
                                   └────────────────────────────────────────┘
                                   → All 3 pillars pass
                                   → Orchestrator: CaseReview auto-created
                                       (actor = system, status = approved)
                                   → Application status = approved

── STEP 06 — Activate and move money ───────────────────────────────────────

6. Prompted to e-sign:             → UAE Pass digital signature
   · FATCA/CRS self-cert             (Federal Decree-Law 46/2021)
   · Account Agreement + KFS       → WWMA Service: state flip
   · T&Cs                            pending_activation → active
                                   → Fee schedule activated
                                   → Virtual card personalised
                                   → Transaction monitoring engine subscribes
                                   → T2FT timestamp recorded

7. "Your Wio Business account      → Notification sent (email)
    is ready. Start banking."      → AuditEvent: pillar.wwma.account_activated
   Sees IBAN, virtual card         → AuditEvent: account.first_transaction_
   Activation time < 1 hour           completed (on first txn)
```

**Decision points:**
- If UAE Pass auth fails → Onfido passport + liveness fallback track
- If registry returns expired/suspended licence → application halted; support contact shown
- If duplicate business in Wio system → routed to existing account recovery flow
- If any pillar flags → tier upgraded to `standard`; Case Officer assigned; enters Unified Case Workspace
- If sanctions/PEP hit → hard stop; "We're unable to continue at this time. Our Compliance team will contact you within 5 business days." MLRO notified separately.

---

## Flow 2 — Tier 2: Standard Onboarding (LLC)

**Who:** A UAE LLC with 1–3 UAE shareholders, standard ownership structure.
**Target:** Decision within 24 hours.
**Automation:** Agents handle all checks; human (Maker/Checker) reviews flagged items or makes final decision.
**Key difference from Tier 1:** Step 04 is active — UBO list shown, signatories invited.

```
Applicant                          System / Services
────────────────────────────────   ─────────────────────────────────────────

── STEP 01 — Sign in with UAE Pass ──────────────────────────────────────────

1. Opens Wio Business app or web   → Same as Tier 1 Step 01
   Taps "Sign in with UAE Pass"       UAE Pass OIDC [MOCK] → CPR hydrated

── STEP 02 — Find your business ────────────────────────────────────────────

2. Enters trade licence number     → KYB Service: DET/ADGM registry pull [MOCK]
   Reviews consent screen              Returns: LLC name, activities, owners
   Taps "I agree, continue"            list (multiple owners with % ownership),
                                       address, expiry
                                   → WWMA Service (parallel, ~60s):
                                       Sanctions + PEP screening [MOCK]
                                       AECB pre-check [MOCK]
                                       KYB Score computed
                                       IBAN reserved in pending_activation

3. Pre-screen result:              → Tier shown: "Standard verification
   ✓ Eligible — standard path         (~same day)"
                                       Estimated T2FT: < 24 hours

── STEP 03 — Tell us about your business ───────────────────────────────────

4. Answers 3 mandatory questions:  → WWMA Service: CRAM computed → Medium
   1. Primary business activity    → Tier 2 confirmed
   2. Expected monthly turnover    → EDD trigger evaluated:
   3. Source of funds                  standard sector → no extra questions
                                   → FATCA/CRS: Active NFFE
                                   → Plan recommendation generated

── STEP 04 — Who needs access? ─────────────────────────────────────────────

5. Sees pre-populated UBO list     → KYB Service: ownership data from registry
   from registry:                  → KYI Service: per-person CDD pipeline
   · Owner A (applicant) — 60%         begins for each person
   · Owner B — 40%

6. Applicant (Owner A) completes   → KYI Service:
   their own KYI in session:           UAE Pass auth [MOCK]
   · UAE Pass auth                     Liveness check (Onfido) [MOCK]
   · Liveness check                    CPR created/matched (EID dedup)
   · Reviews extracted details         AML/PEP/adverse media screening [MOCK]
   · Confirms                      → PersonBusinessRole created for Owner A
                                   → AuditEvent: signatory.completed

7. For Owner B:                    → KYI Service: tokenised UAE Pass deep-link
   "We've sent [Name] an invite       generated (signed JWT, short-lived,
    to verify their identity."         bound to role + application)
                                   → Push + bilingual SMS (AR/EN) sent
                                   → AuditEvent: signatory.invited

8. Can add additional signatories  → KYI Service: additional invite per person
   if needed                       → Signing rules captured (single / joint /
                                       threshold-based)

── STEP 05 — Track everything ──────────────────────────────────────────────

9. Sees 3-lane tracker with ETAs:  ┌────────────────────────────────────────┐
   KYB  ████████████  ✓ Passed     │ KYB: Registry clean · UBO graph built  │
   KYI  ████░░░░░░░░  Waiting...   │ KYI: Owner A verified                  │
   Acct ████████░░░░  In progress  │      Owner B: invite sent              │
                                   │ WWMA: IBAN reserved · AECB clear       │
   Case Officer visible if         │       Awaiting KYI completion          │
   assigned: "[Name], KYB Team"    └────────────────────────────────────────┘
   In-app chat available

── After Owner B completes their verification (see Flow 3) ──────────────────

10. KYI pillar passes              → All 3 pillars pass (or one flags):
                                   → If all pass (clean):
                                       Auto-approve path → Step 06
                                   → If any pillar flags:
                                       Back office queue entry
                                       Case Officer assigned
                                       LLM triage drafts case summary

── STEP 06 — Activate and move money ───────────────────────────────────────

11. Prompted to e-sign:            → Same as Tier 1 Step 06
    · FATCA/CRS self-cert          → Account activates, IBAN live
    · Account Agreement + T&Cs    → T2FT recorded
    Plan recommendation shown      → Plan confirmed at activation (not before)
```

**Decision points:**
- If EDD triggered at Step 03: customer sees sector questionnaire (Contentful CMS) before tracker
- If MOA conflicts with TL data: KYB flags; Maker resolves in Unified Case Workspace
- If Owner B does not complete within 72h: ReAsk sent; Orchestrator auto-escalates
- If CRAM returns High: tier upgraded to Complex; specialist Case Officer assigned

---

## Flow 3 — Signatory Self-Serve Verification (KYI Pillar)

**Who:** A co-owner, UBO, director, or authorized signatory who is not the main applicant.
**Trigger:** Invitation sent by KYI Service when their role is identified at Step 04.
**Platform:** Works on any device — the invitation link opens in browser (no app required).

```
Signatory                          System
────────────────────────────────   ──────────────────────────────────
1. Receives bilingual SMS + email:
   "Wio Business: [Company Name]
    is opening a business account.
    You've been added as [role].
    Complete your verification: [link]"

2. Opens unique invitation link    → KYI Service validates token (signed JWT):
                                       not expired · bound to this application
                                   → PersonBusinessRole.invitation_status
                                       = accepted
                                   → AuditEvent: signatory.invited (if not
                                       already recorded)

3. Sees context screen:
   "[Company Name] is applying for
    a Wio Business account. You are
    listed as [role].
    Here's what we need from you:"

4. UAE resident → UAE Pass auth    → KYI Service: UAE Pass OIDC [MOCK]
                                       CPR matched or created
   Non-UAE resident →               → Onfido passport scan + liveness [MOCK]
   passport + liveness                 Nomad/IDfy remote attestation [MOCK]
                                       Documental path shown upfront if
                                       attestation unsupported (cost + SLA)

5. Completes liveness check        → Liveness Adapter [MOCK]:
   (camera-based)                      liveness_passed = true
                                       NIST PAD Level 2

6. Reviews extracted details       → CPR created or matched (EID dedup key)
   and confirms                    → AML/PEP/adverse media screening [MOCK]
                                   → PersonBusinessRole.invitation_status
                                       = completed
                                   → AuditEvent: signatory.completed

7. "You're all done. [Company]     → KYI Service checks: all required
    will hear from us soon."           persons completed?
                                   → If yes: pillar.kyi.passed event emitted
                                   → Applicant notified of progress update
```

**Decision points:**
- Token expired: signatory sees expiry message; applicant notified to re-trigger invitation
- Liveness fails 3× → case flagged for human review; not silently rejected
- PEP or sanctions hit on signatory → hard stop; mandatory Compliance review; applicant not told the specific reason

---

## Flow 4 — Back Office: Maker Review (Unified Case Workspace)

**Who:** A Compliance Analyst assigned as Maker to a queued case.
**Trigger:** Any pillar flags, or Tier 3 application submitted, or sanctions/PEP hit.
**Target:** Review completed in ≤ 20 minutes for Tier 2 cases.
**Interface:** Unified Case Workspace — three-pillar view (KYB · KYI · WWMA) per case.

```
Maker (Analyst)                    System / Agents
────────────────────────────────   ──────────────────────────────────
1. Opens Unified Case Workspace    → Queue shows: tier, TAT, SLA status,
   Filters by: tier / SLA breach /     pillar flags, assigned Case Officer
   unassigned

2. Opens a case                    → CaseReview.status = maker_in_progress
                                   → AuditEvent: case.maker_started

3. Sees AI Summary panel           → LLM triage pre-populated case summary:
   (Anthropic Claude [MOCK]):         Entity name · jurisdiction · CRAM tier
   ┌──────────────────────────┐      Screening hits · UBO structure
   │ [Business Name]          │      Open questions · recommended treatment
   │ Tier: Standard · CRAM: Med│
   │ Submitted: 2h ago        │   → Agent outputs surfaced per pillar lane:
   │                          │      KYB: ✓ Registry match
   │ KYB    ✓ Passed          │           ⚠ MOA not yet uploaded
   │ KYI    ⚠ 1 flag          │      KYI: ✓ Owner A verified
   │ WWMA   ⚠ 1 flag          │           ⚠ Owner B — liveness retry 2/3
   │                          │      WWMA: ✓ AECB clear
   │ [View AI Reasoning]      │            ⚠ PEP proximity flagged
   └──────────────────────────┘

4. Reviews each flagged item:
   - Expands flag detail: "Owner B
     liveness retry 2 of 3"
   - Reviews liveness video (if
     applicable) + OCR output
   - Sees agent reasoning +
     confidence score

5a. If resolvable:
    Maker marks flag as reviewed:
    "Retry 2 accepted — face match
     within threshold"
    Records mandatory note

5b. If missing info needed:
    Maker opens Re-Ask panel        → ReAsk created, status = pending
    Selects field + reason +        → Applicant notified (email)
    document type required          → AuditEvent: reask.sent
    Sends single targeted re-ask

6. After reviewing all items:      → CaseReview.status = awaiting_checker
   Maker selects decision:         → Checker auto-assigned (or manually)
   ○ Recommend Approve             → AuditEvent: case.maker_completed
   ○ Recommend Decline
   ○ Escalate to Manager
   Mandatory: enters reason text

7. Confirms submission             → Checker notified
```

**Compliance constraints:**
- LLM triage summary is advisory only — Maker must review underlying evidence
- PEP case → mandatory Compliance Manager escalation, cannot be approved by Maker/Checker alone
- Sanctions match → mandatory MLRO review; STR filed by MLRO; no tipping off in any customer-facing communication

---

## Flow 5 — Back Office: Checker Validation

**Who:** A second Compliance Analyst validating the Maker's work.
**Trigger:** Maker completes their review and submits.
**Target:** Validation in ≤ 10 minutes for standard cases.

```
Checker (Analyst)                  System
────────────────────────────────   ──────────────────────────────────
1. Notified: "Case [ID] is ready
   for your review"

2. Opens case — sees diff view:
   ┌──────────────────────────┐
   │ Maker: [Name]            │
   │ Decision: Recommend Appr.│
   │ Reason: [text]           │
   │                          │
   │ What Maker reviewed:     │
   │ ✓ KYI flag resolved      │
   │   Note: [text]           │
   │ ✓ WWMA PEP proximity     │
   │   Note: [text]           │
   └──────────────────────────┘
   Full AI summary + 3-pillar
   view also available

3. Checker reviews Maker's work
   and the underlying evidence
   (A Checker cannot review a
   case they were the Maker on —
   enforced at API level)

4. Selects decision:               → If Approve:
   ○ Approve                           Application status = approved
   ○ Override — Decline                WWMA Service: activation triggered
   ○ Override — Escalate               AuditEvent: case.approved
   Mandatory: enters reason text       Applicant notified
                                   → If Override:
                                       AuditEvent: case.checker_override
                                       Decision + reason logged
                                       Applicant notified accordingly
                                   → If Escalate:
                                       Escalated to Compliance Manager / MLRO
                                       AuditEvent: case.escalated
```

**Decision points:**
- Override requires a more detailed reason (character minimum enforced)
- Escalation routes to Compliance Manager queue with full case history
- EDD finalisation (high-risk sector) requires Senior Management sign-off — escalation is mandatory

---

## Flow 6 — Re-Ask Response (Applicant)

**Who:** An applicant who received a targeted re-ask for missing or inconsistent information.
**Trigger:** ReAsk created by Maker or Re-ask Agent.

```
Applicant                          System
────────────────────────────────   ──────────────────────────────────
1. Receives notification:
   "We need a bit more from you
    to complete your application.
    [View request →]"

2. Opens re-ask link               → Token validated
   Sees targeted item(s):          → ReAsk.status = viewed
   ┌──────────────────────────┐
   │ We need the following:   │
   │                          │
   │ ⚠ Board Resolution       │
   │   We need a signed board │
   │   resolution authorizing │
   │   [Name] as signatory.   │
   │                          │
   │ [Upload document]        │
   └──────────────────────────┘

3. Uploads requested document      → Document Service stores upload
                                   → Is doc? agent validates
                                   → Affected agents re-run automatically
                                   → AuditEvent: reask.responded

4. "Thanks — we've received
    your document and are
    reviewing it."
   Returns to Step 05 tracker
                                   → If re-run resolves the flag:
                                       PillarStatus updated
                                       ReAsk.status = resolved
                                       Maker/Queue notified of delta only
                                   → If flag persists:
                                       Case returned to Maker for decision
```

**Constraints:**
- Only one open ReAsk at a time; multiple items batched into a single ReAsk
- If applicant does not respond within SLA: Orchestrator triggers escalation; re-notification at 7-day warning
- Per-field expiry (OPA/Rego): only genuinely perishable data (PoA >90d, stale AML refresh) requires re-entry — never the whole application

---

## Flow 7 — Auditor: Audit Trail Access

**Who:** An internal auditor or Compliance Manager running a regulatory check.
**Access:** Read-only. Cannot modify any record. Access itself is logged.

```
Auditor                            System
────────────────────────────────   ──────────────────────────────────
1. Logs into Back Office with
   auditor role

2. Searches for a case by:         → Query against Audit/Event Store
   - Application ID                → AuditEvent: audit.log_accessed
   - Business name                    (access itself is logged)
   - Date range
   - Applicant name / EID

3. Opens case audit view:
   ┌──────────────────────────────────────────────────────────────┐
   │ Application: [ID]  Business: [Name]  Tier: Standard          │
   ├──────────────────────────────────────────────────────────────┤
   │ 2026-05-01 09:10  system          auth.uae_pass.completed     │
   │ 2026-05-01 09:11  system          application.pre_screen.eligible │
   │ 2026-05-01 09:11  system          pillar.wwma.iban_reserved   │
   │ 2026-05-01 09:13  system          application.created         │
   │ 2026-05-01 09:14  system          application.cram_computed:  │
   │   └─ payload: { score: "medium", tier: "standard",           │
   │                 policy_version: "cram-v2.1.0" }              │
   │ 2026-05-01 09:14  agent/tl_proc   agent.run.completed: pass   │
   │ 2026-05-01 10:30  applicant/[EID] pillar.kyi.started          │
   │ 2026-05-01 10:48  kyi_service     signatory.invited           │
   │ 2026-05-01 14:02  signatory/[EID] signatory.completed         │
   │ 2026-05-01 14:30  analyst/[ID]    case.maker_completed:       │
   │   └─ payload: { decision: "recommend_approve", reason: "..." }│
   │ 2026-05-01 15:12  analyst/[ID2]   case.approved               │
   │ 2026-05-01 15:12  system          pillar.wwma.account_activated│
   └──────────────────────────────────────────────────────────────┘

4. Filters events by:
   - Pillar (kyb · kyi · wwma)
   - Actor (system / agent / analyst / applicant)
   - Event type
   - Date range

5. Expands any event to see
   full payload snapshot
   (self-contained; does not
   depend on current record state)

6. Exports audit log               → JSON or CSV export generated
   [Export JSON] [Export CSV]      → AuditEvent: audit.log_exported
                                       (export itself logged)
```

**Guarantees:**
- Every event in the log is immutable — no UPDATE or DELETE at the database level
- Full application state at any past moment reconstructable by replaying events in `created_at` order
- CRAM decisions pinned to `policy_version` — "which rule version applied to customer X on date Y" answerable in seconds
- Auditor's own access and export actions are themselves logged as AuditEvents

---

## Application State Summary

```
                    ┌─────────┐
                    │  draft  │  (created after pre-screen eligible)
                    └────┬────┘
                         │ customer completes Step 03 CDD answers
                         ▼
                  ┌─────────────┐
                  │ in_progress │  (pillars running in parallel)
                  └──────┬──────┘
                         │ all pillars complete or any flag
              ┌──────────┴────────────┐
              │ all pass              │ any pillar flags
              ▼                       ▼
         ┌──────────┐        ┌──────────────────┐
         │ approved │        │  pending_review   │  (Unified Case Workspace)
         └──────────┘        └────────┬─────────┘
                                      │ Maker → Checker
                             ┌────────┴─────────┐
                             │                  │
                             ▼                  ▼
                        ┌──────────┐      ┌──────────┐
                        │ approved │      │ declined │
                        └──────────┘      └──────────┘
                             │                  │
                             ▼                  ▼
                 WWMA activation flip    Applicant notified
                 T2FT timestamp set      (no tipping off on
                 (Step 06 complete)       sanctions reason)
```
