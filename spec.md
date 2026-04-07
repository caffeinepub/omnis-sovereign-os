# Omnis Sovereign OS

## Current State
The frontend has 100+ functions defined in backend.d.ts but the deployed Motoko backend only implements the base authorization mixin (~5 functions). All calls to registerProfile, getMyProfile, validateS2Admin, etc. fail at runtime. The S2 bootstrap is completely blocked because validateS2Admin requires admin role but new users are registered as #user with no path to become admin.

## Requested Changes (Diff)

### Add
- `bootstrapFirstAdmin()` function: callable by anyone, grants caller #admin role only if no admins have been assigned yet (adminAssigned == false in accessControlState), then sets adminAssigned = true. This is the solo bootstrap path.
- All profile CRUD functions: registerProfile, getMyProfile, updateMyProfile, getAllProfiles, getProfileByPrincipal, updateUserProfile, updateRegistrationStatus, getPendingUsers, getDeniedUsers
- All section/folder/document functions: createSection, getSections, getSection, updateSection, deleteSection, createFolder, getAllFolders, getFolder, getFoldersBySection, getMyFolders, updateFolder, deleteFolder, setFolderPermission, batchSetFolderPermissions, getFolderPermissions, getMyFolderPermission, revokeFolderPermission, createDocument, getDocument, getDocumentsByFolder, updateDocument, deleteDocument, setDocumentAccessList, getDocumentAccessList, addDocumentAccess, removeDocumentAccess, createDocumentVersion, getDocumentVersions, updateDocumentStatus, incrementDocumentDownloadCount
- All messaging: sendMessage, getInboxMessages, getSentMessages, getMessage, replyToMessage, markMessageRead, deleteMessage, createMessageGroup, getMessageGroup, deleteMessageGroup, getMyMessageGroups, sendGroupMessage, getGroupMessages, markGroupMessageRead, createBroadcastMessage, getBroadcastMessages, markBroadcastRead
- Notifications: getMyNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount, createSystemNotification
- Organization: createOrganization, getOrganization, getOrganizationByUIC, updateOrganization, requestOrgAccess, approveOrgAccess, denyOrgAccess, getOrgAccessRequests
- Role approvals: createRoleApprovalRequest, approveRoleRequest, denyRoleRequest, getRoleApprovalRequests, getRoleApprovalPool, submitTpiApproval
- Commander Auth Code: generateCommanderAuthCode, validateCommanderAuthCode, rotateCommanderAuthCode, getCommanderAuthCodeStatus
- Calendar: createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent, getMyCalendarEvents
- Tasks: createTask, updateTask, deleteTask, getMyTasks, getOrgTasks, updateTaskStatus
- Anomaly/AI: createAnomalyEvent, getAnomalyEvents, resolveAnomalyEvent, addKeywordWatch, removeKeywordWatch, getKeywordWatchList, flagAnomalyForEscalation, quarantineDocument, clearDocumentQuarantine
- Governance: logGovernanceEvent, getGovernanceLog, getWasmHash
- Presence: setPresence, getPresence, getOrgPresence
- Session: registerActiveSession, invalidateOtherSessions, getPendingRegistrationExpiry
- Platform stats: getPlatformStats
- validateS2Admin: sets isS2Admin=true on target profile, requires caller to be admin
- saveCallerUserProfile, getCallerUserProfile: simple profile helpers

### Modify
- main.mo: implement all functions above using stable Maps already defined

### Remove
- Nothing

## Implementation Plan
1. Generate complete Motoko backend implementing all 100+ functions with bootstrapFirstAdmin() as the key addition
2. Update frontend ValidateCommanderPage to call bootstrapFirstAdmin() before validateS2Admin
3. Deploy and go live
