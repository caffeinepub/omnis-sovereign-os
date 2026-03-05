# Omnis Sovereign OS

## Current State
All modules through Message 7 are deployed:
- Global foundation (constants, theme tokens)
- Shared components (SkeletonCard, EmptyState, ConfirmDialog, ClearanceBadge, ClassificationBadge, FormError)
- PermissionsProvider context (getMyProfile once on login)
- Session guard (5-min inactivity, warning at 4 min, expiry modal)
- Login screen (Internet Identity, Three.js starfield warp, three-line branding)
- Registration gate (self-service form pending future provisioning refactor)
- Commander validation banner + /validate-commander route
- TopNav (Omnis logo left, Hub dropdown left, Messages dropdown, Notification bell, User avatar)
- Hub page (6 tiles, S2 checklist, welcome banner)
- Routing: / /documents /messages /personnel /email-directory /file-storage /monitoring
- Documents module (two-panel, classification sidebar, upload, delete, S2 permissions tab)
- Messaging module (inbox/sent tabs, thread view, reply, compose modal, top-nav dropdown)
- Notifications system (bell dropdown, unread badge, 30s poll, per-item read, mark-all-read)
- Personnel Directory (card grid, search, clearance filter, S2 edit modal)
- Email Directory (table, search, mailto links)
- File Storage (drag-and-drop upload, file list persisted via createDocument, delete)
- /monitoring route exists but shows StubPage

## Requested Changes (Diff)

### Add
- Full AccessMonitoringPage at /monitoring replacing the StubPage
- Stat cards row: Total Users, Total Sections, Total Folders, Total Documents, Unresolved Anomalies, Total Messages from getPlatformStats()
- Anomaly events table: columns Event Type, Severity badge, Source (Manual/System), Affected User, Affected Folder, Timestamp, Status (Resolved/Unresolved), Action
- Amber left row highlight for high severity + isSystemGenerated=true rows
- Per-user filter dropdown above table (All Users + individual names from getAllProfiles())
- Summary line when user selected: "User [name] has accessed classified resources [X] times"
- Resolve button per unresolved row: ConfirmDialog then resolveAnomalyEvent(id)
- Log Anomaly modal: Event Type, Affected User (optional dropdown), Affected Folder (optional dropdown), Severity, Description. Calls createAnomalyEvent
- Audit trail section: read-only log of privilege change events (updateUserProfile / setFolderPermission) surfaced from AnomalyEvents filtered by eventType
- Folder activity feed: per-folder log filtered by affectedFolderId from AnomalyEvents
- S2-exclusive access enforcement: non-S2 users redirected to / (already in Router.tsx but StubPage replaced with real page)
- Commander verification UI note: delegation of monitoring access requires commander verification (enforced by S2-only gate)
- All privilege escalation attempts logged via createAnomalyEvent

### Modify
- Router.tsx: MonitoringPage component updated to render AccessMonitoringPage instead of StubPage
- TopNav hub dropdown: Access Monitoring link already hidden for non-S2, no change needed

### Remove
- StubPage render at /monitoring

## Implementation Plan
1. Create src/pages/AccessMonitoringPage.tsx with:
   - S2-only guard (redirect if !isS2Admin)
   - Stat cards row from getPlatformStats() with skeleton loading
   - Anomaly events table with all columns, severity badges, source badges, amber row highlights
   - Per-user filter dropdown from getAllProfiles()
   - Summary line for selected user
   - Resolve button with ConfirmDialog calling resolveAnomalyEvent
   - Log Anomaly button opening modal with full form calling createAnomalyEvent
   - Audit trail tab filtered from AnomalyEvents by privilege-change eventTypes
   - Folder activity feed tab filtered by affectedFolderId
   - All data-ocid markers per deterministic marker spec
2. Update Router.tsx MonitoringPage component to lazy-import and render AccessMonitoringPage
3. Validate, fix any type errors, deploy
