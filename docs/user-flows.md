# User Flows: Wio Business SME Onboarding

**Version:** 0.1 (MVP)
**Date:** 2026-05-08

---

## Flow Index

1. [Tier 1 — Express Onboarding (Freelancer Permit / Sole Est.)](#flow-1--tier-1-express-onboarding-freelancer-permit--sole-establishment)
2. [Tier 2 — Standard Onboarding (LLC)](#flow-2--tier-2-standard-onboarding-llc)
3. [Signatory Self-Serve Verification](#flow-3--signatory-self-serve-verification)
4. [Back Office — Maker Review](#flow-4--back-office--maker-review)
5. [Back Office — Checker Validation](#flow-5--back-office--checker-validation)
6. [Re-Ask Response (Applicant)](#flow-6--re-ask-response-applicant)
7. [Auditor — Audit Trail Access](#flow-7--auditor--audit-trail-access)

---

## Flow 1 — Tier 1: Express Onboarding (Freelancer Permit / Sole Establishment)

**Who:** A UAE freelancer (freelancer permit) or sole proprietor (sole establishment license). Single owner, single authorised signatory — same person.
**Target:** Account active in < 1 hour.
**Automation:** Fully automated — no human review if all signals are clean.
**Key difference from Tier 2:** No MOA is required. License type is confirmed at step 1.

```
Applicant                          System / Agents
────────────────────────────────   ─────────────────────────────────────────
1. Opens Wio Business app or web
   Selects document type:
   [Business License] or
   [Freelancer Permit]           → Document kind stored in application state
   → Selects "Freelancer Permit"

2. Uploads / scans Freelancer      → Is doc? agent validates file type
   Permit                         → TL processing agent:
                                       checks validity with issuing authority
                                       [MOCK]
                                       extracts all 8 fields:
                                         Licensing Authority
                                         License Number
                                         Legal Type / Form
                                         Trade Name / Permit Holder Name
                                         Issue Date
                                         Expiry Date
                                         Commercial Activities
                                         Address
                                         Owner (single, 100%)
                                       checks for duplicate in Wio system

                                   → No MOA requested (documentKind =
                                       freelancer_permit → requiresMoa = false)
                                   → Tier classified = express

3. Sees pre-filled Business        → Business Activity agent:
   Details screen:                     maps activities to compliance list
   - All 8 extracted fields        → Orchestration Engine:
   - Single owner listed               starts P1, P2, P3, P4 in parallel
   Reviews and corrects if needed

4. Answers 3 upfront questions:
   - Main business activities (free text)
   - Expected monthly turnover (range)
   - Where will you transact? (regions)

5. Scans Emirates ID               → Personal Documents OCR agent:
                                       extracts name, DOB, EID number
                                   → UAE Pass auth [MOCK]:
                                       validates identity + liveness

6. Reviews pre-filled personal     ┌──────────────────────────────────────┐
   details and confirms            │ P1 KYB: registry data populated      │
                                   │ P2 KYC: EID + liveness verified      │
7. "All done — we're checking      │ P3 Compliance: AML/PEP clean [MOCK]  │
    your details"                  │         CRAM computed                │
   Real-time pillar progress       │         Fraud score = pass [MOCK]    │
   tracker shown                   │ P4 Account: AECB clear [MOCK]        │
                                   │           IBAN reserved              │
                                   └──────────────────────────────────────┘

                                   → All 4 pillars pass
                                   → Orchestration Engine:
                                       CaseReview auto-created (actor = system)
                                       Application status = approved
                                       Account status flipped to active
                                       AuditEvent: application.approved (system)

8. Receives: "Your account is      → Notification sent (email + push)
   ready. Start banking."          → Virtual card issued
   Sees IBAN, virtual card         → AuditEvent: pillar.account.activated
```

**Decision points:**
- If `is doc?` fails → applicant prompted to re-upload with guidance
- If TL expired or suspended → application halted with explanation; support contact shown
- If duplicate business found → applicant routed to existing account recovery flow
- If any pillar flags → tier upgraded to `standard`; enters back office queue

---

## Flow 2 — Tier 2: Standard Onboarding (LLC)

**Who:** A UAE LLC with 1–3 UAE shareholders, standard ownership structure.
**Target:** Decision within 24 hours.
**Automation:** Agents handle all checks; human (Maker/Checker) reviews flagged items or makes final decision.
**Key difference from Tier 1:** MOA is required. Prompted immediately after Trade License scan (before Business Details).

```
Applicant                          System / Agents
────────────────────────────────   ─────────────────────────────────────────
1. Opens Wio Business app or web
   Selects document type:
   → Selects "Business License"  → Document kind stored in application state

2. Uploads / scans Trade License   → Is doc? agent validates file type
                                   → TL processing agent:
                                       checks validity with registry [MOCK]
                                       extracts all 8 fields:
                                         Licensing Authority
                                         License Number
                                         Legal Type / Form (LLC)
                                         Trade Name
                                         Issue Date
                                         Expiry Date
                                         Commercial Activities
                                         Address
                                         Owners list with % ownership
                                       checks for duplicate in Wio system

                                   → documentKind = business_license
                                       → requiresMoa = true
                                   → Orchestration Engine:
                                       tier = standard (LLC, 2+ owners)

3. Prompted to upload MOA          → Is doc? agent validates MOA
   (same start screen, step 2):    → MOA digestion agent [Group 2, MVP stub]:
   "One more document needed"          extracts: shareholders, directors,
   Can upload now or skip to            signing authority, capital
   Documents step later

4. Sees pre-filled Business
   Details screen — all 8 fields
   from TL extraction shown.
   Owners list shown read-only
   (editing happens next screen).
   Reviews and corrects if needed.

5. Answers 3 upfront questions:
   - Main business activities (free text)
   - Expected monthly turnover (range)
   - Where will you transact? (regions)
   ⚠ If "International" selected:
     inline warning shown about EDD

6. Shareholders screen:
   Both owners pre-populated       → P2 KYC Service emits invitations
   from TL extraction.                 for non-applicant owners
   "Send KYC invite" per person    → PersonBusinessRole created per owner
   Can add additional signatories

7. Reviews extracted ownership
   structure: confirms or corrects

9. For each owner / UBO:           → P2 KYC Service emits invitations
   - UAE owner (same session):         for non-applicant owners
     scans Emirates ID + liveness  → PersonBusinessRole created per owner
   - Additional owners: sees
     "We've invited [Name] to
      complete their verification"

                                   ┌──────────────────────────────────────┐
                                   │ P1 KYB:                              │
                                   │   registry data from TL [MOCK]       │
                                   │   MOA validated                      │
                                   │   UBO graph built (flat, MVP)        │
                                   │ P2 KYC:                              │
                                   │   Applicant KYC verified             │
                                   │   Awaiting co-owner verification     │
                                   │ P3 Compliance:                       │
                                   │   AML/PEP screened [MOCK]            │
                                   │   CRAM score computed                │
                                   │   EDD triggered if score ≥ threshold │
                                   │ P4 Account:                          │
                                   │   AECB checked [MOCK]                │
                                   │   IBAN reserved in pending state     │
                                   └──────────────────────────────────────┘

10. Sees per-pillar progress        → KYC pillar status = awaiting_input
    tracker with ETAs                   (waiting on co-owner)

── After co-owner completes their verification (see Flow 3) ──────────────

11. All pillars pass or flag        If any flag:
                                   → Application enters back office queue
                                   → CaseReview created, Maker assigned
                                   → AuditEvent: case.maker_assigned

    If all pass (clean):
                                   → Auto-approve path (same as Tier 1)
                                   → Application status = approved
                                   → Account flipped to active

12. On approval:
    "Your Wio Business account
     is ready."
    Sees IBAN, plan recommendation → Plan shown post-approval, not before
    Confirms or adjusts plan
```

**Decision points:**
- If EDD triggered: applicant receives sector-specific questionnaire before case goes to review
- If MOA conflicts with TL data: P1 flags; Maker resolves in back office
- If co-owner does not complete verification within SLA: ReAsk sent; escalation triggered on expiry

---

## Flow 3 — Signatory Self-Serve Verification

**Who:** A co-owner, director, or authorized signatory who is not the main applicant.
**Trigger:** Invitation sent by P2 KYC Service when their role is identified.
**Platform:** Works on any device — the invitation link opens in browser (no app required).

```
Signatory                          System
────────────────────────────────   ──────────────────────────────────
1. Receives bilingual SMS + email:
   "Wio Business: [Company Name]
    is opening a business account.
    You've been added as [role].
    Complete your verification: [link]"

2. Opens unique invitation link    → System validates token not expired
                                   → PersonBusinessRole.invitation_status
                                       = accepted

3. Sees context:
   "[Company Name] is applying for
    a Wio Business account. You are
    listed as [role].
    Here's what we need from you:"

4. Scans Emirates ID or passport   → Personal Documents OCR agent
                                   → UAE Pass auth [MOCK] (if UAE resident)
                                       or passport + liveness (non-resident)

5. Completes liveness check        → Liveness Adapter [MOCK]:
   (camera-based)                      liveness_passed = true

6. Reviews extracted details and   → Canonical Person Record created or
   confirms                            matched to existing record
                                   → PersonBusinessRole.invitation_status
                                       = completed
                                   → AuditEvent: signatory.completed

7. "You're all done. [Company]     → P2 KYC Service checks: all required
    will hear from us soon."           signatories completed
                                   → If all complete: pillar.kyc.passed
                                   → Applicant notified of progress

```

**Decision points:**
- If token expired: signatory sees expiry message; applicant notified to re-trigger invitation
- If liveness fails: signatory can retry up to 3 times; after 3 failures, case flagged for human review
- Non-UAE residents: passport + remote notarization path shown upfront with timeline (MVP: remote KYC only, notarization is manual)

---

## Flow 4 — Back Office: Maker Review

**Who:** A Compliance Analyst assigned as Maker to a queued case.
**Trigger:** Any pillar flags, or Tier 3 application submitted.
**Target:** Review completed in ≤ 20 minutes for Tier 2 cases.

```
Maker (Analyst)                    System / Agents
────────────────────────────────   ──────────────────────────────────
1. Opens Back Office queue         → Queue shows: tier, TAT, SLA status,
   Filters by: tier / SLA breach /     pillar flags, assigned cases
   unassigned

2. Opens a case                    → CaseReview.status = maker_in_progress
                                   → AuditEvent: case.maker_started

3. Sees AI Summary panel:          → Agent outputs surfaced per pillar:
   ┌──────────────────────────┐       P1 KYB: ✓ Registry match · ⚠ MOA
   │ [Business Name]          │           discrepancy on signatory
   │ Tier: Standard           │       P2 KYC: ✓ Applicant · ✓ Co-owner
   │ Submitted: 2h ago        │       P3 Compliance: ✓ AML · ⚠ PEP
   │                          │           proximity flagged
   │ P1 KYB    ⚠ 1 flag       │       P4 Account: ✓ AECB clear
   │ P2 KYC    ✓ Passed       │
   │ P3 Comp   ⚠ 1 flag       │
   │ P4 Acct   ✓ Passed       │
   │                          │
   │ [View AI Reasoning]      │
   └──────────────────────────┘

4. Reviews each flagged item:
   - Expands flag detail: "MOA
     signatory [Name] not on TL"
   - Reviews document side-by-side
   - Sees agent reasoning and
     confidence score

5a. If resolvable:
    Maker marks flag as reviewed:
    "Discrepancy explained — MOA
     pre-dates TL renewal"
    Records note

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

**Decision points:**
- Maker cannot approve — they can only recommend; final approval requires Checker
- If Maker marks a flag as reviewed without explanation, system prompts for mandatory note
- EDD cases: Maker reviews EDD Q&A before making recommendation; EDD Maker agent (Group 2) pre-populates this in later phases

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

2. Opens case — sees:
   ┌──────────────────────────┐
   │ Maker: [Name]            │
   │ Maker decision: Approve  │
   │ Maker reason: [text]     │
   │                          │
   │ What Maker reviewed:     │
   │ ✓ MOA flag resolved      │
   │   Note: [text]           │
   │ ✓ PEP proximity reviewed │
   │   Note: [text]           │
   └──────────────────────────┘
   Full AI summary and documents
   also available

3. Checker reviews Maker's work
   and the underlying evidence

4. Selects decision:               → If Approve:
   ○ Approve                           Application status = approved
   ○ Override — Decline                Account flipped to active
   ○ Override — Escalate               AuditEvent: case.approved
   Mandatory: enters reason text       Applicant notified
                                   → If Override:
                                       AuditEvent: case.checker_override
                                       Decision + reason logged
                                       Applicant notified accordingly
                                   → If Escalate:
                                       Escalated to Compliance Manager
                                       AuditEvent: case.escalated
```

**Decision points:**
- Checker override requires a more detailed reason (character minimum enforced)
- Escalation routes to Compliance Manager queue with full case history
- A Checker cannot review a case they were the Maker on (enforced at API level)

---

## Flow 6 — Re-Ask Response (Applicant)

**Who:** An applicant who has received a targeted re-ask for missing or inconsistent information.
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
                                   → Affected agents re-run
                                   → AuditEvent: reask.responded

4. "Thanks — we've received
    your document and are
    reviewing it."
   Returns to status tracker

                                   → If re-run resolves the flag:
                                       PillarStatus updated
                                       ReAsk.status = resolved
                                       Maker/Queue notified of delta
                                   → If flag persists:
                                       Case returned to Maker for decision
```

**Decision points:**
- Only one open ReAsk at a time; multiple outstanding items are batched
- If applicant does not respond within SLA: escalation triggered; applicant re-notified at 7-day warning
- Applicant can add a clarification note alongside the document upload

---

## Flow 7 — Auditor: Audit Trail Access

**Who:** An internal auditor or Compliance Manager running a case review or regulatory check.
**Access:** Read-only. Cannot modify any record.

```
Auditor                            System
────────────────────────────────   ──────────────────────────────────
1. Logs into Back Office with
   auditor role

2. Searches for a case by:         → Query against Audit Event Store
   - Application ID                → AuditEvent: audit.log_accessed
   - Business name                    (access itself is logged)
   - Date range
   - Applicant name

3. Opens case audit view:
   ┌──────────────────────────────────────────────────────┐
   │ Application: [ID]  Business: [Name]  Tier: Standard  │
   ├──────────────────────────────────────────────────────┤
   │ 2026-05-01 09:12  system          application.created │
   │ 2026-05-01 09:12  system          application.tier_assigned: standard │
   │ 2026-05-01 09:13  applicant/[ID]  document.uploaded: trade_license    │
   │ 2026-05-01 09:13  agent/is_doc    agent.run.completed: pass           │
   │ 2026-05-01 09:14  agent/tl_proc   agent.run.completed: pass           │
   │ 2026-05-01 09:15  agent/biz_act   agent.run.completed: flag           │
   │   └─ payload: { activity: "real_estate", risk: "high" }               │
   │ 2026-05-01 10:30  analyst/[ID]    case.maker_started                  │
   │ 2026-05-01 10:48  analyst/[ID]    reask.sent                          │
   │   └─ payload: { items: [{ field: "board_resolution", ... }] }         │
   │ 2026-05-01 14:02  applicant/[ID]  reask.responded                     │
   │ 2026-05-01 14:04  agent/is_doc    agent.run.completed: pass           │
   │ 2026-05-01 14:30  analyst/[ID]    case.maker_completed: recommend_approve │
   │   └─ payload: { reason: "..." }                                        │
   │ 2026-05-01 15:12  analyst/[ID2]   case.approved                       │
   │   └─ payload: { reason: "..." }                                        │
   │ 2026-05-01 15:12  system          pillar.account.activated             │
   └──────────────────────────────────────────────────────┘

4. Filters events by:
   - Pillar
   - Actor (system / agent / analyst / applicant)
   - Event type
   - Date range

5. Expands any event to see
   full payload snapshot

6. Exports audit log               → JSON or CSV export generated
   [Export JSON] [Export CSV]      → AuditEvent: audit.log_exported
                                       (export action itself is logged)
```

**Guarantees:**
- Every event in the log is immutable — no event can be modified or deleted after write
- The full state of any application at any past moment is reconstructable by replaying events in order
- The auditor's own access and export actions are themselves logged as AuditEvents

---

## Application State Summary

```
                    ┌─────────┐
                    │  draft  │  (created, not yet submitted)
                    └────┬────┘
                         │ applicant confirms
                         ▼
                  ┌─────────────┐
                  │ in_progress │  (pillars running)
                  └──────┬──────┘
                         │ all pillars complete
              ┌──────────┴────────────┐
              │ all pass              │ any flag
              ▼                       ▼
         ┌──────────┐        ┌──────────────────┐
         │ approved │        │  pending_review   │  (enters back office queue)
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
                    account activated     applicant notified
```
