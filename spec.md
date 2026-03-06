# Omnis Sovereign OS

## Current State

The onboarding flow is complete: new users register, complete the 3-step onboarding wizard (org selection), and land on the pending verification page. The PersonnelPage has an "Onboarding Queue" tab (S2 only) that lists users with `isValidatedByCommander = false && !isS2Admin` and shows a "Verify & Activate" button that calls `validateS2Admin`. However, this workflow has a critical gap:

- The S2 **cannot deny** a user — only approve
- There is **no deny flow with a reason**
- There is **no in-app notification to the user** upon approval or denial
- The pending user has **no way to know their status changed** except by refreshing
- S2 has **no way to see what organization a user requested** — the request is stored in localStorage only, not surfaced in the queue

## Requested Changes (Diff)

### Add
- Deny action with a reason input on each queue row (alongside "Verify & Activate")
- Deny confirmation dialog: reason text input (required), confirm deny button
- On approval: create an in-app notification to the approved user (via `createSystemNotification`) confirming activation
- On denial: create an in-app notification to the denied user explaining they were denied and why, with instruction to contact their S2
- "Requested Org" column in the onboarding queue table, sourced from `localStorage` (`omnis_org_request_<principalId>`)
- Visual status badges on queue rows: "Pending" (amber pulse), differentiated from future "Denied" state
- Denial creates a localStorage record (`omnis_denial_<principalId>`) so PendingVerificationPage can detect and show denial messaging

### Modify
- `OnboardingQueue` component: add Deny button + requested org column + notification calls on both approve and deny
- `PendingVerificationPage`: check for denial record in localStorage; if present, show a distinct "Access Denied" state with the denial reason and instruction to contact S2
- Queue table column layout: expand from 5 columns to 6 (add Org Request)

### Remove
- Nothing removed

## Implementation Plan

1. Update `OnboardingQueue` in `PersonnelPage.tsx`:
   - Add "Org Request" column reading from `localStorage`
   - Add "Deny" button per row (red-tinted, beside Verify & Activate)
   - Add deny confirmation dialog with reason `<Input>` (required before confirming)
   - On verify: after `validateS2Admin`, call `createSystemNotification` to the approved user with type "access_request", title "Access Approved", body confirming activation
   - On deny: write denial record to localStorage, call `createSystemNotification` to the denied user with title "Access Denied" and the reason
   - Invalidate query after deny same as after verify

2. Update `PendingVerificationPage.tsx`:
   - On mount, check `localStorage` for `omnis_denial_<principalId>`
   - If found: show "Access Denied" state with reason text and "Contact your S2 or security officer" instruction; show a "Request Review" button that clears the denial record and returns to onboarding
   - If not found: show existing "Pending Verification" state (unchanged)

3. Add `data-ocid` markers to all new interactive surfaces (deny button, deny dialog, reason input, confirm/cancel, request review button)
