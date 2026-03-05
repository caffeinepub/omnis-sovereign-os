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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
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
    getCallerUserRole(): Promise<UserRole>;
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
    isCallerAdmin(): Promise<boolean>;
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
}
