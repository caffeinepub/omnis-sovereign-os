# Omnis Sovereign OS

## Current State
- Backend fully generated with 44 functions and 9 entities
- Frontend shell deployed: TopNav, Hub, auth flow, session guard, routing, stub pages
- Documents module (Message 3) deployed
- Messaging module (Message 4) deployed
- Notifications system (Message 5) deployed
- Personnel Directory (/personnel) and Email Directory (/email-directory) are both stub pages

## Requested Changes (Diff)

### Add
- PersonnelPage component at /personnel replacing stub
  - Grid layout (3-4 columns) of personnel cards using getAllProfiles()
  - Each card: circular avatar (initials fallback if no avatarUrl), name, rank, orgRole, ClearanceBadge
  - 8 skeleton cards while loading
  - EmptyState with users icon and "No personnel registered"
  - Text search input filters cards real-time by name (case-insensitive)
  - Clearance level filter dropdown (All / Unclassified / CUI / Secret / Top Secret / TS/SCI)
  - S2 admin edit button on each card opens modal with updateUserProfile form
  - Edit modal fields: name (required), rank, email, orgRole, clearanceLevel dropdown 0-4 with labels, makeS2Admin toggle
  - Submit calls updateUserProfile, closes modal, refreshes list, success/error toast
- EmailDirectoryPage component at /email-directory replacing stub
  - Table layout: Name, Rank, Email, Role columns
  - Data from getAllProfiles()
  - Search input filters real-time by name or orgRole
  - EmptyState with mail icon and "No contacts found"
  - Email column values are mailto: anchor links

### Modify
- Router.tsx: replace PersonnelDirectory and EmailDirectory stub pages with real page components
- Router.tsx: apply security provisioning note — registration gate and S2 provisioning flow will be addressed in this message per logged requirements

### Remove
- Nothing removed

## Implementation Plan
1. Create src/frontend/src/pages/PersonnelPage.tsx with grid, search, filter, skeleton, empty state, S2 edit modal
2. Create src/frontend/src/pages/EmailDirectoryPage.tsx with table, search, empty state, mailto links
3. Update Router.tsx to import and use both new pages
4. Apply security provisioning: updateMyProfile locked to non-sensitive fields in the edit modal (S2 admin only can set clearance/rank/orgRole/makeS2Admin); standard users cannot edit these fields
