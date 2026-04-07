import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";

module {
  public type OldDocumentPermission = {
    #Owner;
    #Editor;
    #Viewer;
    #NoAccess;
  };

  public type OldUserProfile = {
    name : Text;
    email : Text;
    rank : Text;
    orgRole : Text;
    avatarUrl : ?Text;
  };

  public type OldExtendedProfile = {
    principalId : Principal;
    name : Text;
    rank : Text;
    email : Text;
    orgRole : Text;
    clearanceLevel : Nat;
    isS2Admin : Bool;
    isValidatedByCommander : Bool;
    registered : Bool;
    avatarUrl : ?Text;
    lastName : Text;
    firstName : Text;
    middleInitial : Text;
    branch : Text;
    rankCategory : Text;
    dodId : Text;
    mos : Text;
    uic : Text;
    orgId : Text;
    registrationStatus : Text;
    denialReason : Text;
    verifiedBy : ?Principal;
    verifiedAt : ?Nat;
    clearanceExpiry : ?Nat;
    networkEmail : Text;
    unitPhone : Text;
  };

  public type OldSection = {
    id : Text;
    name : Text;
    description : Text;
    createdBy : Principal;
    createdAt : Int;
    parentSectionId : ?Text;
    iconName : Text;
  };

  public type OldFolder = {
    id : Text;
    sectionId : Text;
    name : Text;
    description : Text;
    isPersonal : Bool;
    assignedUserId : ?Principal;
    requiredClearanceLevel : Nat;
    createdBy : Principal;
    createdAt : Int;
  };

  public type OldFolderPermission = {
    folderId : Text;
    userId : Principal;
    role : OldDocumentPermission;
    needToKnow : Bool;
    grantedBy : Principal;
    grantedAt : Int;
  };

  public type OldDocument = {
    id : Text;
    folderId : Text;
    name : Text;
    description : Text;
    uploadedBy : Principal;
    uploadedAt : Int;
    fileSize : Nat;
    mimeType : Text;
    blobStorageKey : ?Text;
    classificationLevel : Nat;
    version : Nat;
    documentStatus : Text;
    sha256Hash : Text;
    downloadCount : Nat;
    orgId : Text;
  };

  public type OldNotification = {
    id : Text;
    userId : Principal;
    notificationType : Text;
    title : Text;
    body : Text;
    read : Bool;
    createdAt : Int;
    metadata : ?Text;
  };

  public type OldMessage = {
    id : Text;
    fromUserId : Principal;
    toUserId : Principal;
    subject : Text;
    body : Text;
    sentAt : Int;
    read : Bool;
    parentMessageId : ?Text;
    deleted : Bool;
  };

  public type OldAnomalyEvent = {
    id : Text;
    detectedAt : Int;
    eventType : Text;
    affectedUserId : ?Principal;
    affectedFolderId : ?Text;
    severity : Text;
    description : Text;
    resolved : Bool;
    resolvedBy : ?Principal;
    isSystemGenerated : Bool;
  };

  public type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    profiles : Map.Map<Principal, OldExtendedProfile>;
    sections : Map.Map<Text, OldSection>;
    folders : Map.Map<Text, OldFolder>;
    folderPermissions : Map.Map<Text, OldFolderPermission>;
    documents : Map.Map<Text, OldDocument>;
    notifications : Map.Map<Text, OldNotification>;
    messages : Map.Map<Text, OldMessage>;
    anomalyEvents : Map.Map<Text, OldAnomalyEvent>;
  };

  public type NewDocumentPermission = {
    #Owner;
    #Editor;
    #Viewer;
    #NoAccess;
  };

  public type NewUserProfile = {
    name : Text;
    email : Text;
    rank : Text;
    orgRole : Text;
    avatarUrl : ?Text;
  };

  public type NewExtendedProfile = {
    principalId : Principal;
    name : Text;
    rank : Text;
    email : Text;
    orgRole : Text;
    clearanceLevel : Nat;
    isS2Admin : Bool;
    isValidatedByCommander : Bool;
    registered : Bool;
    avatarUrl : ?Text;
    lastName : Text;
    firstName : Text;
    middleInitial : Text;
    branch : Text;
    rankCategory : Text;
    dodId : Text;
    mos : Text;
    uic : Text;
    orgId : Text;
    registrationStatus : Text;
    denialReason : Text;
    verifiedBy : ?Principal;
    verifiedAt : ?Nat;
    clearanceExpiry : ?Nat;
    networkEmail : Text;
    unitPhone : Text;
  };

  public type NewSection = {
    id : Text;
    name : Text;
    description : Text;
    createdBy : Principal;
    createdAt : Int;
    parentSectionId : ?Text;
    iconName : Text;
  };

  public type NewFolder = {
    id : Text;
    sectionId : Text;
    name : Text;
    description : Text;
    isPersonal : Bool;
    assignedUserId : ?Principal;
    requiredClearanceLevel : Nat;
    createdBy : Principal;
    createdAt : Int;
  };

  public type NewFolderPermission = {
    folderId : Text;
    userId : Principal;
    role : NewDocumentPermission;
    needToKnow : Bool;
    grantedBy : Principal;
    grantedAt : Int;
  };

  public type NewDocument = {
    id : Text;
    folderId : Text;
    name : Text;
    description : Text;
    uploadedBy : Principal;
    uploadedAt : Int;
    fileSize : Nat;
    mimeType : Text;
    blobStorageKey : ?Text;
    classificationLevel : Nat;
    version : Nat;
    documentStatus : Text;
    sha256Hash : Text;
    downloadCount : Nat;
    orgId : Text;
  };

  public type NewNotification = {
    id : Text;
    userId : Principal;
    notificationType : Text;
    title : Text;
    body : Text;
    read : Bool;
    createdAt : Int;
    metadata : ?Text;
  };

  public type NewMessage = {
    id : Text;
    fromUserId : Principal;
    toUserId : Principal;
    subject : Text;
    body : Text;
    sentAt : Int;
    read : Bool;
    parentMessageId : ?Text;
    deleted : Bool;
  };

  public type NewAnomalyEvent = {
    id : Text;
    detectedAt : Int;
    eventType : Text;
    affectedUserId : ?Principal;
    affectedFolderId : ?Text;
    severity : Text;
    description : Text;
    resolved : Bool;
    resolvedBy : ?Principal;
    isSystemGenerated : Bool;
  };

  public type Organization = {
    id : Text;
    name : Text;
    orgType : Text;
    address : Text;
    jurisdiction : Text;
    createdBy : Principal;
    createdAt : Int;
    adminUserId : Principal;
    uic : Text;
    commander : Text;
    commanderPrincipal : Text;
    authCode : Text;
    pendingRequests : [Text];
  };

  public type OrgAccessRequest = {
    id : Text;
    requestorId : Principal;
    requestedAt : Int;
    requestedOrgId : Text;
    requestedOrgRole : Text;
    uic : Text;
    requestorName : Text;
    requestorRank : Text;
    requestorEmail : Text;
    reason : Text;
    requestorMfcCode : Text;
    requestorCommanderName : Text;
    requestorCommanderEmail : Text;
    requestorSignature : Text;
    status : Text;
    deniedReason : Text;
  };

  public type DocumentVersion = {
    id : Text;
    documentId : Text;
    version : Nat;
    uploadedBy : Principal;
    uploadedAt : Int;
    fileSize : Nat;
    mimeType : Text;
    blobStorageKey : Text;
    classificationLevel : Nat;
    documentStatus : Text;
    sha256Hash : Text;
  };

  public type DocumentAccessEntry = {
    documentId : Text;
    userId : Principal;
    accessLevel : NewDocumentPermission;
    grantedBy : Principal;
    grantedAt : Int;
  };

  public type MessageGroup = {
    id : Text;
    ownerId : Principal;
    participantIds : [Principal];
    groupType : Text;
    orgId : Text;
    isPrivate : Bool;
    createdBy : Principal;
    createdAt : Int;
    lastMessage : ?GroupMessage;
    lastActivity : Int;
    unreadCount : Nat;
    lastReadAt : Int;
    lastReadBy : Principal;
  };

  public type GroupMessage = {
    id : Text;
    groupId : Text;
    senderId : Principal;
    senderPrincipal : Principal;
    senderName : Text;
    senderEmail : Text;
    contentType : Text;
    title : Text;
    body : Text;
    sentAt : Int;
    readBy : [Principal];
    parentMessageId : ?Text;
    deleted : Bool;
  };

  public type BroadcastMessage = {
    id : Text;
    orgId : Text;
    senderId : Principal;
    contentType : Text;
    title : Text;
    body : Text;
    sentAt : Int;
    readBy : [Principal];
    isActive : Bool;
    isDeleted : Bool;
    deletedAt : Int;
  };

  public type CalendarEvent = {
    id : Text;
    orgId : Text;
    createdBy : Principal;
    createdAt : Int;
    eventName : Text;
    startTime : Int;
    endTime : Int;
    eventStatus : Text;
    description : Text;
    visibility : Text;
    calendarType : Text;
    attendees : [CalendarAttendee];
  };

  public type CalendarAttendee = {
    userId : Principal;
    name : Text;
    email : Text;
    accepted : Bool;
    responseDate : Int;
    isExternal : Bool;
    eventTime : Int;
  };

  public type Task = {
    id : Text;
    userId : Principal;
    orgId : Text;
    createdBy : Principal;
    createdAt : Int;
    taskName : Text;
    taskType : Text;
    dueDate : Int;
    status : Text;
    description : Text;
    priority : Text;
    visibility : Text;
    recurrence : ?Text;
    reminderTime : ?Int;
    isActive : Bool;
    lastModifiedBy : Principal;
    lastModifiedAt : Int;
    taskCategory : Text;
  };

  public type KeywordWatchEntry = {
    id : Text;
    detectedAt : Int;
    detectedBy : Principal;
    searchKeyword : Text;
    alertType : Text;
    trackingType : Text;
    severity : Text;
    isActive : Bool;
  };

  public type GovernanceRecord = {
    id : Text;
    orgId : Text;
    eventType : Text;
    eventTime : Int;
    userId : ?Principal;
    userName : Text;
    userEmail : Text;
    eventData : ?Text;
    eventStatus : Text;
    statusDetails : Text;
    actionTakenBy : ?Principal;
    actionTakenTime : ?Int;
  };

  public type UserPresence = {
    userId : Principal;
    status : Text;
    lastUpdated : Int;
    orgId : Text;
    designator : Text;
    priority : Text;
    isActive : Bool;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    profiles : Map.Map<Principal, NewExtendedProfile>;
    sections : Map.Map<Text, NewSection>;
    folders : Map.Map<Text, NewFolder>;
    folderPermissions : Map.Map<Text, NewFolderPermission>;
    documents : Map.Map<Text, NewDocument>;
    notifications : Map.Map<Text, NewNotification>;
    messages : Map.Map<Text, NewMessage>;
    anomalyEvents : Map.Map<Text, NewAnomalyEvent>;
    organizations : Map.Map<Text, Organization>;
    orgAccessRequests : Map.Map<Text, OrgAccessRequest>;
    documentVersions : Map.Map<Text, DocumentVersion>;
    documentAccessEntries : Map.Map<Text, DocumentAccessEntry>;
    messageGroups : Map.Map<Text, MessageGroup>;
    groupMessages : Map.Map<Text, GroupMessage>;
    broadcastMessages : Map.Map<Text, BroadcastMessage>;
    calendarEvents : Map.Map<Text, CalendarEvent>;
    tasks : Map.Map<Text, Task>;
    keywordWatchList : Map.Map<Text, KeywordWatchEntry>;
    governanceLog : Map.Map<Text, GovernanceRecord>;
    presenceMap : Map.Map<Principal, UserPresence>;
    activeSessions : Map.Map<Principal, Text>;
    commanderAuthCode : Text;
    commanderAuthCodeUsed : Bool;
    roleApprovalRequests : Map.Map<Text, RoleApprovalRequest>;
  };

  public type RoleRequestStatus = {
    #pending;
    #approved;
    #denied;
    #cancelled;
    #expired;
  };

  public type RoleApprovalRequest = {
    id : Text;
    initiatedBy : Principal;
    requestedRole : Text;
    status : RoleRequestStatus;
    initiatedAt : Int;
    reviewedAt : ?Int;
    reviewedBy : ?Principal;
    denialReason : ?Text;
    reviewNotes : ?Text;
    validatingMfcCode : ?Text;
    requestType : Text;
    validatingCommander : ?Text;
    commanderEmail : ?Text;
    commanderRank : ?Text;
    approvingOfficer : ?Principal;
    officerRank : ?Text;
    validity : ?Int;
    supportingDocs : ?Text;
    recommendations : ?Text;
    addressingPOC : ?Text;
    pocUnitCode : ?Text;
    statusHistory : ?[Text];
  };

  private func convertIterToArray<T>(iter : Iter.Iter<T>) : [T] {
    List.fromIter(iter).toArray();
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      profiles = old.profiles;
      sections = old.sections;
      folders = old.folders;
      folderPermissions = old.folderPermissions;
      documents = old.documents;
      notifications = old.notifications;
      messages = old.messages;
      anomalyEvents = old.anomalyEvents;
      organizations = Map.empty<Text, Organization>();
      orgAccessRequests = Map.empty<Text, OrgAccessRequest>();
      documentVersions = Map.empty<Text, DocumentVersion>();
      documentAccessEntries = Map.empty<Text, DocumentAccessEntry>();
      messageGroups = Map.empty<Text, MessageGroup>();
      groupMessages = Map.empty<Text, GroupMessage>();
      broadcastMessages = Map.empty<Text, BroadcastMessage>();
      calendarEvents = Map.empty<Text, CalendarEvent>();
      tasks = Map.empty<Text, Task>();
      keywordWatchList = Map.empty<Text, KeywordWatchEntry>();
      governanceLog = Map.empty<Text, GovernanceRecord>();
      presenceMap = Map.empty<Principal, UserPresence>();
      activeSessions = Map.empty<Principal, Text>();
      commanderAuthCode = "";
      commanderAuthCodeUsed = false;
      roleApprovalRequests = Map.empty<Text, RoleApprovalRequest>();
    };
  };
};
