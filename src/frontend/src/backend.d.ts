import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AnomalyEvent {
    id: string;
    resolved: boolean;
    detectedAt: bigint;
    description: string;
    isSystemGenerated: boolean;
    affectedFolderId?: string;
    severity: string;
    affectedUserId?: Principal;
    resolvedBy?: Principal;
    eventType: string;
}
export interface Document {
    id: string;
    classificationLevel: bigint;
    name: string;
    mimeType: string;
    description: string;
    blobStorageKey?: string;
    fileSize: bigint;
    version: bigint;
    folderId: string;
    uploadedAt: bigint;
    uploadedBy: Principal;
    documentStatus: string;
    sha256Hash: string;
    downloadCount: bigint;
    orgId: string;
}
export interface FolderPermission {
    grantedAt: bigint;
    grantedBy: Principal;
    userId: Principal;
    role: DocumentPermission;
    needToKnow: boolean;
    folderId: string;
}
export interface ExtendedProfile {
    clearanceLevel: bigint;
    orgRole: string;
    name: string;
    rank: string;
    isValidatedByCommander: boolean;
    isS2Admin: boolean;
    email: string;
    avatarUrl?: string;
    principalId: Principal;
    registered: boolean;
    lastName: string;
    firstName: string;
    middleInitial: string;
    branch: string;
    rankCategory: string;
    dodId: string;
    mos: string;
    uic: string;
    orgId: string;
    registrationStatus: string;
    denialReason: string;
    verifiedBy?: Principal;
    verifiedAt?: bigint;
    clearanceExpiry?: bigint;
    networkEmail: string;
    unitPhone: string;
}
export interface Notification {
    id: string;
    title: string;
    metadata?: string;
    body: string;
    userId: Principal;
    notificationType: string;
    createdAt: bigint;
    read: boolean;
}
export interface Message {
    id: string;
    deleted: boolean;
    subject: string;
    parentMessageId?: string;
    body: string;
    read: boolean;
    toUserId: Principal;
    sentAt: bigint;
    fromUserId: Principal;
}
export interface Folder {
    id: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
    sectionId: string;
    assignedUserId?: Principal;
    requiredClearanceLevel: bigint;
    isPersonal: boolean;
}
export interface Section {
    id: string;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
    iconName: string;
    parentSectionId?: string;
}
export interface PlatformStats {
    unresolvedAnomalies: bigint;
    totalFolders: bigint;
    totalMessages: bigint;
    totalUsers: bigint;
    totalDocuments: bigint;
    totalSections: bigint;
}
export interface UserProfile {
    orgRole: string;
    name: string;
    rank: string;
    email: string;
    avatarUrl?: string;
}
export interface Organization {
    orgId: string;
    name: string;
    uic: string;
    orgType: string;
    networkMode: string;
    adminPrincipal: Principal;
    createdAt: bigint;
}
export interface OrgAccessRequest {
    requestId: string;
    orgId: string;
    requestorPrincipal: Principal;
    status: string;
    requestedAt: bigint;
    reviewedAt?: bigint;
    reviewedBy?: Principal;
}
export interface RoleApprovalRequest {
    requestId: string;
    requestorPrincipal: Principal;
    targetPrincipal: Principal;
    requestedRole: string;
    approverPrincipal?: Principal;
    status: string;
    requestedAt: bigint;
    resolvedAt?: bigint;
    notes: string;
}
export interface DocumentVersion {
    versionId: string;
    documentId: string;
    version: bigint;
    uploadedBy: Principal;
    uploadedAt: bigint;
    changeNote: string;
}
export interface DocumentAccessEntry {
    entryId: string;
    documentId: string;
    userId: Principal;
    grantedBy: Principal;
    grantedAt: bigint;
    clearanceLevelRequired: bigint;
}
export interface MessageGroup {
    groupId: string;
    orgId: string;
    name: string;
    createdBy: Principal;
    createdAt: bigint;
    memberPrincipals: Principal[];
}
export interface GroupMessage {
    messageId: string;
    groupId: string;
    fromUserId: Principal;
    body: string;
    sentAt: bigint;
}
export interface BroadcastMessage {
    messageId: string;
    orgId: string;
    fromUserId: Principal;
    title: string;
    body: string;
    sentAt: bigint;
    classification: string;
}
export interface CalendarEvent {
    eventId: string;
    orgId: string;
    title: string;
    description: string;
    startTime: bigint;
    endTime: bigint;
    createdBy: Principal;
    classification: string;
    isOrgWide: boolean;
}
export interface Task {
    taskId: string;
    orgId: string;
    title: string;
    description: string;
    assignedTo: Principal;
    assignedBy: Principal;
    dueDate?: bigint;
    status: string;
    priority: string;
    createdAt: bigint;
}
export interface KeywordWatchEntry {
    keyword: string;
    addedBy: Principal;
    addedAt: bigint;
    severity: string;
    active: boolean;
}
export interface GovernanceRecord {
    recordId: string;
    eventType: string;
    description: string;
    triggeredBy: Principal;
    timestamp: bigint;
    wasmHash: string;
}
export interface UserPresence {
    userId: Principal;
    status: string;
    lastSeen: bigint;
}
export enum DocumentPermission {
    Viewer = "Viewer",
    Editor = "Editor",
    NoAccess = "NoAccess",
    Owner = "Owner"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    // Bootstrap -- grants caller #admin if no admins assigned yet
    bootstrapFirstAdmin(): Promise<void>;
    // Auth
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    // Profile
    batchSetFolderPermissions(permissions: Array<FolderPermission>): Promise<void>;
    createAnomalyEvent(event: AnomalyEvent): Promise<string>;
    createDocument(document: Document): Promise<string>;
    createFolder(folder: Folder): Promise<string>;
    createSection(section: Section): Promise<string>;
    createSystemNotification(notification: Notification): Promise<void>;
    deleteDocument(documentId: string): Promise<void>;
    deleteFolder(folderId: string): Promise<void>;
    deleteMessage(messageId: string): Promise<void>;
    deleteSection(sectionId: string): Promise<void>;
    getAllFolders(): Promise<Array<Folder>>;
    getAllProfiles(): Promise<Array<ExtendedProfile>>;
    getAnomalyEvents(): Promise<Array<AnomalyEvent>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getDocument(documentId: string): Promise<Document | null>;
    getDocumentsByFolder(folderId: string): Promise<Array<Document>>;
    getFolder(folderId: string): Promise<Folder | null>;
    getFolderPermissions(folderId: string): Promise<Array<FolderPermission>>;
    getFoldersBySection(sectionId: string): Promise<Array<Folder>>;
    getInboxMessages(): Promise<Array<Message>>;
    getMessage(messageId: string): Promise<Message | null>;
    getMyFolderPermission(): Promise<Array<FolderPermission>>;
    getMyFolders(): Promise<Array<Folder>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyProfile(): Promise<ExtendedProfile | null>;
    getPlatformStats(): Promise<PlatformStats>;
    getProfileByPrincipal(user: Principal): Promise<ExtendedProfile | null>;
    getSection(sectionId: string): Promise<Section | null>;
    getSections(): Promise<Array<Section>>;
    getSentMessages(): Promise<Array<Message>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    markAllNotificationsRead(): Promise<void>;
    markMessageRead(messageId: string): Promise<void>;
    markNotificationRead(notificationId: string): Promise<void>;
    registerProfile(profile: ExtendedProfile): Promise<void>;
    replyToMessage(message: Message): Promise<string>;
    resolveAnomalyEvent(eventId: string, resolvedBy: Principal): Promise<void>;
    revokeFolderPermission(folderId: string, userId: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(message: Message): Promise<string>;
    setFolderPermission(permission: FolderPermission): Promise<void>;
    updateDocument(document: Document): Promise<void>;
    updateFolder(folder: Folder): Promise<void>;
    updateMyProfile(profile: ExtendedProfile): Promise<void>;
    updateSection(section: Section): Promise<void>;
    updateUserProfile(profile: ExtendedProfile): Promise<void>;
    validateS2Admin(callerId: Principal): Promise<void>;
    // Organization
    createOrganization(org: Organization): Promise<string>;
    getOrganization(orgId: string): Promise<Organization | null>;
    getOrganizationByUIC(uic: string): Promise<Organization | null>;
    updateOrganization(org: Organization): Promise<void>;
    requestOrgAccess(request: OrgAccessRequest): Promise<string>;
    approveOrgAccess(requestId: string): Promise<void>;
    denyOrgAccess(requestId: string, reason: string): Promise<void>;
    getOrgAccessRequests(orgId: string): Promise<Array<OrgAccessRequest>>;
    // Profile/Registration
    updateRegistrationStatus(userId: Principal, status: string, reason: string): Promise<void>;
    getPendingUsers(): Promise<Array<ExtendedProfile>>;
    getDeniedUsers(): Promise<Array<ExtendedProfile>>;
    // Commander Auth Code
    generateCommanderAuthCode(): Promise<string>;
    validateCommanderAuthCode(code: string): Promise<boolean>;
    rotateCommanderAuthCode(): Promise<string>;
    getCommanderAuthCodeStatus(): Promise<boolean>;
    // Role Approval
    createRoleApprovalRequest(request: RoleApprovalRequest): Promise<string>;
    approveRoleRequest(requestId: string): Promise<void>;
    denyRoleRequest(requestId: string, notes: string): Promise<void>;
    getRoleApprovalRequests(): Promise<Array<RoleApprovalRequest>>;
    // Document Enhancements
    setDocumentAccessList(documentId: string, entries: Array<DocumentAccessEntry>): Promise<void>;
    getDocumentAccessList(documentId: string): Promise<Array<DocumentAccessEntry>>;
    addDocumentAccess(entry: DocumentAccessEntry): Promise<void>;
    removeDocumentAccess(documentId: string, userId: Principal): Promise<void>;
    createDocumentVersion(version: DocumentVersion): Promise<string>;
    getDocumentVersions(documentId: string): Promise<Array<DocumentVersion>>;
    updateDocumentStatus(documentId: string, status: string): Promise<void>;
    incrementDocumentDownloadCount(documentId: string): Promise<void>;
    // Group Messaging
    createMessageGroup(group: MessageGroup): Promise<string>;
    getMessageGroup(groupId: string): Promise<MessageGroup | null>;
    deleteMessageGroup(groupId: string): Promise<void>;
    getMyMessageGroups(): Promise<Array<MessageGroup>>;
    sendGroupMessage(message: GroupMessage): Promise<string>;
    getGroupMessages(groupId: string): Promise<Array<GroupMessage>>;
    markGroupMessageRead(messageId: string): Promise<void>;
    createBroadcastMessage(message: BroadcastMessage): Promise<string>;
    getBroadcastMessages(): Promise<Array<BroadcastMessage>>;
    markBroadcastRead(messageId: string): Promise<void>;
    // Presence
    setPresence?(status: string): Promise<void>;
    getPresence?(userId: Principal): Promise<UserPresence | null>;
    getOrgPresence?(): Promise<Array<UserPresence>>;
    // Calendar
    createCalendarEvent(event: CalendarEvent): Promise<string>;
    getCalendarEvents(orgId: string): Promise<Array<CalendarEvent>>;
    updateCalendarEvent(event: CalendarEvent): Promise<void>;
    deleteCalendarEvent(eventId: string): Promise<void>;
    getMyCalendarEvents(): Promise<Array<CalendarEvent>>;
    // Tasks
    createTask(task: Task): Promise<string>;
    updateTask(task: Task): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
    getMyTasks(): Promise<Array<Task>>;
    getOrgTasks(orgId: string): Promise<Array<Task>>;
    updateTaskStatus(taskId: string, status: string): Promise<void>;
    // AI / Anomaly
    addKeywordWatch(entry: KeywordWatchEntry): Promise<void>;
    removeKeywordWatch(keyword: string): Promise<void>;
    getKeywordWatchList(): Promise<Array<KeywordWatchEntry>>;
    flagAnomalyForEscalation(eventId: string): Promise<void>;
    quarantineDocument(documentId: string, reason: string): Promise<void>;
    clearDocumentQuarantine(documentId: string): Promise<void>;
    // Governance
    logGovernanceEvent(record: GovernanceRecord): Promise<void>;
    getGovernanceLog(): Promise<Array<GovernanceRecord>>;
    getWasmHash(): Promise<string>;
    getRoleApprovalPool(): Promise<Array<RoleApprovalRequest>>;
    submitTpiApproval(requestId: string, approved: boolean, notes: string): Promise<void>;
    // Session
    registerActiveSession(sessionToken: string): Promise<void>;
    invalidateOtherSessions(): Promise<void>;
    getPendingRegistrationExpiry(userId: Principal): Promise<bigint | null>;
}
