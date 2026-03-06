# Omnis Sovereign OS

## Current State

Full-stack sovereign cloud platform with Motoko backend and React/TypeScript frontend. Step 1 (Tier 1 critical bugs) is complete and verified. The frontend covers: Login, Registration, Hub, Documents, Messaging, Personnel, Email Directory, File Storage, and Access Monitoring modules. All 44 backend API functions are wired.

Key files:
- `src/frontend/src/contexts/PermissionsContext.tsx` — profile + folder permissions context
- `src/frontend/src/components/layout/TopNav.tsx` — navigation, notifications, messages dropdown, profile sheet
- `src/frontend/src/pages/AccessMonitoringPage.tsx` — anomaly events, audit trail, AI demo panel
- `src/frontend/src/pages/MessagesPage.tsx` — inbox, sent, thread view, compose
- `src/frontend/src/pages/FileStoragePage.tsx` — vault init, drag-drop upload, file table
- `src/frontend/src/pages/DocumentsPage.tsx` — folder sidebar, document list, permissions tab

## Requested Changes (Diff)

### Add
- Nothing new — bug fixes only.

### Modify

**BUG-007 — AccessMonitoringPage setState-in-render anti-pattern**
Lines 1160–1163 call `setHasInitializedEvents(true)` and `setEvents(rawEvents)` directly in the render function body (conditional outside useEffect). This is a React anti-pattern causing double-renders. Replace with a `useEffect` that watches `eventsLoading` and `rawEvents`.

**BUG-008 — PermissionsContext `refreshProfile` race condition**
`refreshProfile` sets `hasFetched=false`, calls async `fetchProfile()`, then immediately sets `hasFetched=true` — but `fetchProfile` is async so `hasFetched=true` fires before the fetch completes. The useEffect then sees `hasFetched=true` and never re-fetches. Fix: remove the manual `hasFetched=true` call at the end of `refreshProfile`; instead let `fetchProfile` set `hasFetched=true` at the end of the `finally` block (which it already does).

**BUG-016 — TopNav single-item `markReadMutation` doesn't refetch notification list**
`markReadMutation.onSuccess` only invalidates the unread count query, but doesn't trigger a `refetchNotifications()`. This means the notification list in the open dropdown shows stale unread state until it's closed and reopened. Fix: add `void refetchNotifications()` in `markReadMutation.onSuccess`.

**BUG-003 — MessagesPage `handleMessageDeleted` doesn't clear selectedMessage properly**
`handleMessageDeleted` sets `selectedMessage(null)` unconditionally, but should also handle the case where the deleted message is not the currently selected one. Additionally, `handleSelectMessage` calls `markMessageRead` even on sent-tab messages — add a guard: only call `markMessageRead` if the current tab is "inbox" and the message is unread.

**BUG-004 — ProfileSheet form fields empty when profile loads after sheet opens**
The `initialized` flag in `ProfileSheet` only syncs form state once per open. If `profile` is null when the sheet first opens and loads later (late API response), form fields remain empty. Fix: change the sync condition to also re-initialize when `profile` changes while the sheet is open (remove the `!initialized` guard, use `useEffect` with `[open, profile]` dep).

**BUG-018 — TopNav `displayName` renders blank for profiles with no rank/name**
`${profile.rank} ${profile.name}`.trim() produces a blank string if both fields are empty, which causes the avatar dropdown to show nothing. Fix: fall back to `"Unknown"` when the computed string is empty.

**BUG-009 — FileStoragePage vault doesn't recover when `storageClient` becomes ready after initial render**
`initializeVaultAndLoadFiles` includes `storageClient` in its dependency array. If `storageClient` becomes ready after the initial actor-ready trigger, the callback is rebuilt but `initializingRef.current` may already be `false` — the `useEffect` will not re-run because deps haven't changed since the last run. Fix: remove `storageClient` from the `initializeVaultAndLoadFiles` deps and instead read it inside the callback via a ref, so vault init reruns properly when storageClient becomes available.

**BUG-019 — DocumentsPage `activeTab` doesn't reset to "documents" when folder is deselected**
If user switches to the "permissions" tab then navigates away and back (deselecting the folder), `activeTab` stays as "permissions". Next time a folder is selected, the permissions tab opens immediately instead of the documents tab. Fix: reset `activeTab` to "documents" in the `setSelectedFolder` handler when a new folder is selected.

### Remove
- Nothing removed.

## Implementation Plan

1. **PermissionsContext.tsx** — Fix `refreshProfile`: remove the redundant `setHasFetched(true)` at the end; the `fetchProfile` `finally` block already handles it.
2. **AccessMonitoringPage.tsx** — Move the `hasInitializedEvents` initialization logic into a `useEffect([rawEvents, eventsLoading])` so it doesn't run in the render body.
3. **TopNav.tsx** — `markReadMutation.onSuccess`: add `void refetchNotifications()` call. Also fix `displayName` fallback: `|| "Unknown"`.
4. **MessagesPage.tsx** — `handleSelectMessage`: add `activeTab === "inbox"` guard before calling `markMessageRead`. `handleMessageDeleted`: only set `selectedMessage(null)` if the deleted id matches the current `selectedMessage?.id`.
5. **TopNav.tsx (ProfileSheet)** — Replace `initialized` flag pattern with a `useEffect([open, profile])` that syncs form fields whenever the sheet is open and profile changes.
6. **FileStoragePage.tsx** — Store `storageClient` in a ref; remove it from `initializeVaultAndLoadFiles` deps; add a separate `useEffect` that triggers re-init when `storageClient` becomes ready and vault is not yet ready.
7. **DocumentsPage.tsx** — In `setSelectedFolder` call sites, also call `setActiveTab("documents")`.
