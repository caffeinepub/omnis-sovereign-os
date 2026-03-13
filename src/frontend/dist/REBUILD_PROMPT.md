# OMNIS SOVEREIGN OS — COMPLETE REBUILD PROMPT

Paste this entire document into a new Caffeine session with the message:
"Build Omnis Sovereign OS exactly as specified in this document."


---

## FILE: src/backend/main.mo

```motoko
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type DocumentPermission = {
    #Owner;
    #Editor;
    #Viewer;
    #NoAccess;
  };

  module DocumentPermission {
    public func compare(p1 : DocumentPermission, p2 : DocumentPermission) : Order.Order {
      Nat.compare(variantToNatIndex(p1), variantToNatIndex(p2));
    };

    func variantToNatIndex(perm : DocumentPermission) : Nat {
      switch (perm) {
        case (#Owner) { 0 };
        case (#Editor) { 1 };
        case (#Viewer) { 2 };
        case (#NoAccess) { 3 };
      };
    };
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    rank : Text;
    orgRole : Text;
    avatarUrl : ?Text;
  };

  public type ExtendedProfile = {
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
  };

  public type Section = {
    id : Text;
    name : Text;
    description : Text;
    createdBy : Principal;
    createdAt : Int;
    parentSectionId : ?Text;
    iconName : Text;
  };

  public type Folder = {
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

  public type FolderPermission = {
    folderId : Text;
    userId : Principal;
    role : DocumentPermission;
    needToKnow : Bool;
    grantedBy : Principal;
    grantedAt : Int;
  };

  public type Document = {
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
  };

  public type Notification = {
    id : Text;
    userId : Principal;
    notificationType : Text;
    title : Text;
    body : Text;
    read : Bool;
    createdAt : Int;
    metadata : ?Text;
  };

  public type Message = {
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

  public type AnomalyEvent = {
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

  public type PlatformStats = {
    totalUsers : Nat;
    totalSections : Nat;
    totalFolders : Nat;
    totalDocuments : Nat;
    unresolvedAnomalies : Nat;
    totalMessages : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let profiles = Map.empty<Principal, ExtendedProfile>();
  let sections = Map.empty<Text, Section>();
  let folders = Map.empty<Text, Folder>();
  let folderPermissions = Map.empty<Text, FolderPermission>();
  let documents = Map.empty<Text, Document>();
  let notifications = Map.empty<Text, Notification>();
  let messages = Map.empty<Text, Message>();
  let anomalyEvents = Map.empty<Text, AnomalyEvent>();

  func isS2Admin(caller : Principal) : Bool {
    switch (profiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.isS2Admin };
    };
  };

  func getUserClearanceLevel(caller : Principal) : Nat {
    switch (profiles.get(caller)) {
      case (null) { 0 };
      case (?profile) { profile.clearanceLevel };
    };
  };

  func hasFolderAccess(caller : Principal, folderId : Text, minRole : DocumentPermission) : Bool {
    switch (folders.get(folderId)) {
      case (null) { false };
      case (?folder) {
        if (isS2Admin(caller)) { return true };
        if (folder.createdBy == caller) { return true };
        if (folder.isPersonal and folder.assignedUserId == ?caller) { return true };
        
        let userClearance = getUserClearanceLevel(caller);
        if (userClearance < folder.requiredClearanceLevel) { return false };

        for ((permId, perm) in folderPermissions.entries()) {
          if (perm.folderId == folderId and perm.userId == caller) {
            return switch (minRole, perm.role) {
              case (#Owner, #Owner) { true };
              case (#Editor, #Owner) { true };
              case (#Editor, #Editor) { true };
              case (#Viewer, #Owner) { true };
              case (#Viewer, #Editor) { true };
              case (#Viewer, #Viewer) { true };
              case (_, _) { false };
            };
          };
        };
        false;
      };
    };
  };

  func hasDocumentAccess(caller : Principal, documentId : Text) : Bool {
    switch (documents.get(documentId)) {
      case (null) { false };
      case (?doc) {
        if (isS2Admin(caller)) { return true };
        if (doc.uploadedBy == caller) { return true };
        
        let userClearance = getUserClearanceLevel(caller);
        if (userClearance < doc.classificationLevel) { return false };

        hasFolderAccess(caller, doc.folderId, #Viewer);
      };
    };
  };

  // UserProfile functions for frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ExtendedProfile CRUD Functions
  public shared ({ caller }) func registerProfile(profile : ExtendedProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register profiles");
    };
    if (caller != profile.principalId) {
      Runtime.trap("Unauthorized: Can only register own profile");
    };
    profiles.add(profile.principalId, {
      profile with
      registered = true;
      isS2Admin = false;
      isValidatedByCommander = false;
    });
  };

  public shared ({ caller }) func validateS2Admin(callerId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can validate S2 admins");
    };
    profiles.add(
      callerId,
      switch (profiles.get(callerId)) {
        case (null) { Runtime.trap("User cannot be validated as S2 admin, because it does not exist") };
        case (?profile) {
          {
            profile with
            isS2Admin = true;
          };
        };
      },
    );
  };

  public shared ({ caller }) func updateMyProfile(profile : ExtendedProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    if (caller != profile.principalId) {
      Runtime.trap("Unauthorized: Can only update own profile");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?existingProfile) {
        profiles.add(profile.principalId, {
          profile with
          isS2Admin = existingProfile.isS2Admin;
          isValidatedByCommander = existingProfile.isValidatedByCommander;
        });
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?ExtendedProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getAllProfiles() : async [ExtendedProfile] {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can view all profiles");
    };
    profiles.values().toArray();
  };

  public query ({ caller }) func getProfileByPrincipal(user : Principal) : async ?ExtendedProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Can only view own profile or be S2 admin");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func updateUserProfile(profile : ExtendedProfile) : async () {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can update user profiles");
    };
    profiles.add(profile.principalId, profile);
  };

  // Section CRUD Functions
  public shared ({ caller }) func createSection(section : Section) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sections");
    };
    let id = Time.now().toText();
    sections.add(id, { section with id; createdBy = caller; createdAt = Time.now() });
    id;
  };

  public shared ({ caller }) func updateSection(section : Section) : async () {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can update sections");
    };
    sections.add(section.id, section);
  };

  public shared ({ caller }) func deleteSection(sectionId : Text) : async () {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can delete sections");
    };
    sections.remove(sectionId);
  };

  public query ({ caller }) func getSections() : async [Section] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sections");
    };
    sections.values().toArray();
  };

  public query ({ caller }) func getSection(sectionId : Text) : async ?Section {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sections");
    };
    sections.get(sectionId);
  };

  // Folder CRUD Functions
  public shared ({ caller }) func createFolder(folder : Folder) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create folders");
    };
    let userClearance = getUserClearanceLevel(caller);
    if (userClearance < folder.requiredClearanceLevel) {
      Runtime.trap("Unauthorized: Insufficient clearance level to create this folder");
    };
    let id = Time.now().toText();
    folders.add(id, { folder with id; createdBy = caller; createdAt = Time.now() });
    id;
  };

  public shared ({ caller }) func updateFolder(folder : Folder) : async () {
    if (not hasFolderAccess(caller, folder.id, #Owner)) {
      Runtime.trap("Unauthorized: Only folder owners or S2 admins can update folders");
    };
    folders.add(folder.id, folder);
  };

  public shared ({ caller }) func deleteFolder(folderId : Text) : async () {
    if (not hasFolderAccess(caller, folderId, #Owner)) {
      Runtime.trap("Unauthorized: Only folder owners or S2 admins can delete folders");
    };
    folders.remove(folderId);
  };

  public query ({ caller }) func getFoldersBySection(sectionId : Text) : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view folders");
    };
    let userClearance = getUserClearanceLevel(caller);
    folders.values().toArray().filter(func(folder) { 
      folder.sectionId == sectionId and 
      (isS2Admin(caller) or userClearance >= folder.requiredClearanceLevel or hasFolderAccess(caller, folder.id, #Viewer))
    });
  };

  public query ({ caller }) func getFolder(folderId : Text) : async ?Folder {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view folders");
    };
    if (not hasFolderAccess(caller, folderId, #Viewer)) {
      Runtime.trap("Unauthorized: Insufficient permissions to view this folder");
    };
    folders.get(folderId);
  };

  public query ({ caller }) func getMyFolders() : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view folders");
    };
    folders.values().toArray().filter(func(folder) { 
      folder.assignedUserId == ?caller or folder.createdBy == caller
    });
  };

  public query ({ caller }) func getAllFolders() : async [Folder] {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can view all folders");
    };
    folders.values().toArray();
  };

  // FolderPermission CRUD Functions
  public shared ({ caller }) func setFolderPermission(permission : FolderPermission) : async () {
    if (not hasFolderAccess(caller, permission.folderId, #Owner)) {
      Runtime.trap("Unauthorized: Only folder owners or S2 admins can set permissions");
    };
    let key = permission.folderId # "-" # permission.userId.toText();
    folderPermissions.add(key, { permission with grantedBy = caller; grantedAt = Time.now() });
  };

  public shared ({ caller }) func revokeFolderPermission(folderId : Text, userId : Principal) : async () {
    if (not hasFolderAccess(caller, folderId, #Owner)) {
      Runtime.trap("Unauthorized: Only folder owners or S2 admins can revoke permissions");
    };
    let key = folderId # "-" # userId.toText();
    folderPermissions.remove(key);
  };

  public query ({ caller }) func getFolderPermissions(folderId : Text) : async [FolderPermission] {
    if (not hasFolderAccess(caller, folderId, #Viewer)) {
      Runtime.trap("Unauthorized: Insufficient permissions to view folder permissions");
    };
    folderPermissions.values().toArray().filter(func(perm) { perm.folderId == folderId });
  };

  public query ({ caller }) func getMyFolderPermission() : async [FolderPermission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view permissions");
    };
    folderPermissions.values().toArray().filter(func(perm) { perm.userId == caller });
  };

  public shared ({ caller }) func batchSetFolderPermissions(permissions : [FolderPermission]) : async () {
    for (permission in permissions.vals()) {
      if (not hasFolderAccess(caller, permission.folderId, #Owner)) {
        Runtime.trap("Unauthorized: Only folder owners or S2 admins can set permissions");
      };
    };
    let entries = permissions.map(func(p) { 
      let key = p.folderId # "-" # p.userId.toText();
      (key, { p with grantedBy = caller; grantedAt = Time.now() })
    });
    // Fix: Replace addAll with a loop to add entries to the existing map
    entries.forEach(func((key, permission)) { folderPermissions.add(key, permission) });
  };

  // Document CRUD Functions
  public shared ({ caller }) func createDocument(document : Document) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };
    if (not hasFolderAccess(caller, document.folderId, #Editor)) {
      Runtime.trap("Unauthorized: Insufficient permissions to create documents in this folder");
    };
    let userClearance = getUserClearanceLevel(caller);
    if (userClearance < document.classificationLevel) {
      Runtime.trap("Unauthorized: Insufficient clearance level to create this document");
    };
    let id = Time.now().toText();
    documents.add(id, { document with id; uploadedBy = caller; uploadedAt = Time.now() });
    id;
  };

  public shared ({ caller }) func updateDocument(document : Document) : async () {
    if (not hasDocumentAccess(caller, document.id)) {
      Runtime.trap("Unauthorized: Insufficient permissions to update this document");
    };
    if (not hasFolderAccess(caller, document.folderId, #Editor)) {
      Runtime.trap("Unauthorized: Insufficient permissions to update documents in this folder");
    };
    documents.add(document.id, document);
  };

  public shared ({ caller }) func deleteDocument(documentId : Text) : async () {
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document does not exist") };
      case (?doc) {
        if (doc.uploadedBy != caller and not hasFolderAccess(caller, doc.folderId, #Owner)) {
          Runtime.trap("Unauthorized: Only document owner or folder owner can delete documents");
        };
      };
    };
    documents.remove(documentId);
  };

  public query ({ caller }) func getDocumentsByFolder(folderId : Text) : async [Document] {
    if (not hasFolderAccess(caller, folderId, #Viewer)) {
      Runtime.trap("Unauthorized: Insufficient permissions to view documents in this folder");
    };
    let userClearance = getUserClearanceLevel(caller);
    documents.values().toArray().filter(func(doc) { 
      doc.folderId == folderId and (isS2Admin(caller) or userClearance >= doc.classificationLevel)
    });
  };

  public query ({ caller }) func getDocument(documentId : Text) : async ?Document {
    if (not hasDocumentAccess(caller, documentId)) {
      Runtime.trap("Unauthorized: Insufficient permissions to view this document");
    };
    documents.get(documentId);
  };

  // Notification CRUD Functions
  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    notifications.values().toArray().filter(func(notification) { notification.userId == caller });
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification does not exist") };
      case (?notification) {
        if (notification.userId != caller) {
          Runtime.trap("Unauthorized: Can only mark own notifications as read");
        };
        notifications.add(notificationId, { notification with read = true });
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    for ((id, notification) in notifications.entries()) {
      if (notification.userId == caller and not notification.read) {
        notifications.add(id, { notification with read = true });
      };
    };
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notification count");
    };
    notifications.values().toArray().filter(
      func(notification) {
        notification.userId == caller and not notification.read;
      }
    ).size();
  };

  public shared ({ caller }) func createSystemNotification(notification : Notification) : async () {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can create system notifications");
    };
    let id = Time.now().toText();
    notifications.add(id, { notification with id; createdAt = Time.now() });
  };

  // Message CRUD Functions
  public shared ({ caller }) func sendMessage(message : Message) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (caller != message.fromUserId) {
      Runtime.trap("Unauthorized: Can only send messages from own account");
    };
    let id = Time.now().toText();
    messages.add(id, { message with id; sentAt = Time.now() });
    id;
  };

  public query ({ caller }) func getInboxMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.values().toArray().filter(func(msg) { msg.toUserId == caller and not msg.deleted });
  };

  public query ({ caller }) func getSentMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.values().toArray().filter(func(msg) { msg.fromUserId == caller });
  };

  public query ({ caller }) func getMessage(messageId : Text) : async ?Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    switch (messages.get(messageId)) {
      case (null) { null };
      case (?msg) {
        if (msg.fromUserId != caller and msg.toUserId != caller) {
          Runtime.trap("Unauthorized: Can only view own messages");
        };
        ?msg;
      };
    };
  };

  public shared ({ caller }) func markMessageRead(messageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };
    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message does not exist") };
      case (?msg) {
        if (msg.toUserId != caller) {
          Runtime.trap("Unauthorized: Can only mark received messages as read");
        };
        messages.add(messageId, { msg with read = true });
      };
    };
  };

  public shared ({ caller }) func deleteMessage(messageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete messages");
    };
    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message does not exist") };
      case (?msg) {
        if (msg.toUserId != caller and msg.fromUserId != caller) {
          Runtime.trap("Unauthorized: Can only delete own messages");
        };
        messages.add(messageId, { msg with deleted = true });
      };
    };
  };

  public shared ({ caller }) func replyToMessage(message : Message) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reply to messages");
    };
    if (caller != message.fromUserId) {
      Runtime.trap("Unauthorized: Can only send messages from own account");
    };
    switch (message.parentMessageId) {
      case (null) { Runtime.trap("Reply must have a parent message") };
      case (?parentId) {
        switch (messages.get(parentId)) {
          case (null) { Runtime.trap("Parent message does not exist") };
          case (?parentMsg) {
            if (parentMsg.toUserId != caller and parentMsg.fromUserId != caller) {
              Runtime.trap("Unauthorized: Can only reply to messages you are part of");
            };
          };
        };
      };
    };
    await sendMessage(message);
  };

  // AnomalyEvent CRUD Functions
  public query ({ caller }) func getAnomalyEvents() : async [AnomalyEvent] {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can view anomaly events");
    };
    anomalyEvents.values().toArray();
  };

  public shared ({ caller }) func resolveAnomalyEvent(eventId : Text, resolvedBy : Principal) : async () {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can resolve anomaly events");
    };
    anomalyEvents.add(
      eventId,
      switch (anomalyEvents.get(eventId)) {
        case (null) { Runtime.trap("Event does not exist") };
        case (?event) {
          {
            event with
            resolved = true;
            resolvedBy = ?resolvedBy;
          };
        };
      },
    );
  };

  public shared ({ caller }) func createAnomalyEvent(event : AnomalyEvent) : async Text {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can create anomaly events");
    };
    let id = Time.now().toText();
    anomalyEvents.add(id, { event with id; detectedAt = Time.now() });
    id;
  };

  // Platform Stats
  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not isS2Admin(caller)) {
      Runtime.trap("Unauthorized: Only S2 admins can view platform stats");
    };
    {
      totalUsers = profiles.size();
      totalSections = sections.size();
      totalFolders = folders.size();
      totalDocuments = documents.size();
      unresolvedAnomalies = anomalyEvents.values().toArray().filter(func(event) { not event.resolved }).size();
      totalMessages = messages.size();
    };
  };
};

```

---

## FILE: frontend/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: "JetBrains Mono";
  src: url("/assets/fonts/JetBrainsMono[wght].woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: "Sora";
  src: url("/assets/fonts/Sora[wght].woff2") format("woff2");
  font-weight: 100 800;
  font-display: swap;
}

@font-face {
  font-family: "Bricolage Grotesque";
  src: url("/assets/fonts/BricolageGrotesque[opsz,wght].woff2")
    format("woff2");
  font-weight: 200 800;
  font-display: swap;
}

@layer base {
  :root {
    --radius: 0.25rem;

    /* Dark military OS — navy/slate base, amber accent */
    --background: 0.118 0.022 255;
    --foreground: 0.92 0.01 240;
    --card: 0.148 0.028 255;
    --card-foreground: 0.92 0.01 240;
    --popover: 0.16 0.03 255;
    --popover-foreground: 0.92 0.01 240;

    /* Amber primary */
    --primary: 0.72 0.175 70;
    --primary-foreground: 0.10 0.02 255;

    --secondary: 0.18 0.03 255;
    --secondary-foreground: 0.85 0.01 240;

    --muted: 0.17 0.025 255;
    --muted-foreground: 0.55 0.015 240;

    --accent: 0.20 0.04 255;
    --accent-foreground: 0.92 0.01 240;

    --destructive: 0.60 0.22 25;
    --destructive-foreground: 0.98 0 0;

    --border: 0.25 0.04 255;
    --input: 0.22 0.04 255;
    --ring: 0.72 0.175 70;

    --chart-1: 0.72 0.175 70;
    --chart-2: 0.65 0.18 162;
    --chart-3: 0.55 0.14 200;
    --chart-4: 0.70 0.20 300;
    --chart-5: 0.65 0.22 25;

    --sidebar: 0.13 0.025 255;
    --sidebar-foreground: 0.90 0.01 240;
    --sidebar-primary: 0.72 0.175 70;
    --sidebar-primary-foreground: 0.10 0.02 255;
    --sidebar-accent: 0.18 0.03 255;
    --sidebar-accent-foreground: 0.85 0.01 240;
    --sidebar-border: 0.22 0.04 255;
    --sidebar-ring: 0.72 0.175 70;

    /* Custom OS tokens */
    --navy: 0.118 0.022 255;
    --slate: 0.148 0.028 255;
    --amber: 0.72 0.175 70;
    --amber-dim: 0.55 0.12 70;
    --grid-line: 0.22 0.04 255;
  }

  * {
    @apply border-border;
  }

  html {
    color-scheme: dark;
  }

  body {
    @apply bg-background text-foreground font-body;
    background-color: oklch(0.118 0.022 255);
  }
}

```

---

## FILE: src/App.tsx

```tsx
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "./Router";

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <Toaster position="top-right" duration={4000} />
    </ErrorBoundary>
  );
}

```

---

## FILE: src/Router.tsx

```tsx
import { SessionWarningDialog } from "@/components/auth/SessionWarningDialog";
import { CommanderValidationBanner } from "@/components/layout/CommanderValidationBanner";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { NetworkModeProvider } from "@/contexts/NetworkModeContext";
import {
  PermissionsProvider,
  usePermissions,
} from "@/contexts/PermissionsContext";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegistrationGatePage = lazy(() => import("@/pages/RegistrationGatePage"));
const ValidateCommanderPage = lazy(
  () => import("@/pages/ValidateCommanderPage"),
);
const HubPage = lazy(() => import("@/pages/HubPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const PersonnelPage = lazy(() => import("@/pages/PersonnelPage"));
const EmailDirectoryPage = lazy(() => import("@/pages/EmailDirectoryPage"));
const FileStoragePage = lazy(() => import("@/pages/FileStoragePage"));
const AccessMonitoringPage = lazy(() => import("@/pages/AccessMonitoringPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const AuditLogPage = lazy(() => import("@/pages/AuditLogPage"));
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const GovernancePage = lazy(() => import("@/pages/GovernancePage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const ProfilePreviewPage = lazy(() => import("@/pages/ProfilePreviewPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const PendingVerificationPage = lazy(
  () => import("@/pages/PendingVerificationPage"),
);
const NetworkModeSetupPage = lazy(() => import("@/pages/NetworkModeSetupPage"));
const TestLabPage = lazy(() => import("@/pages/TestLabPage"));
const MyProfilePage = lazy(() => import("@/pages/MyProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const WorkspaceSetupPage = lazy(() => import("@/pages/WorkspaceSetupPage"));
const ClaimCommanderPage = lazy(() => import("@/pages/ClaimCommanderPage"));

// --- Page loader ---
function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading...
      </p>
    </div>
  );
}

// --- Authenticated Layout ---
function AuthenticatedLayout() {
  const { identity, isInitializing, isLoginIdle, clear } =
    useInternetIdentity();
  const router = useRouter();

  // Idle warning state driven by useIdleTimer
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Hard-reload logout: call authClient.logout() then immediately navigate to
  // /login via window.location so the entire React tree (including the
  // AuthClient instance) is rebuilt from scratch. This prevents the race where
  // clear() sets authClient→undefined, the init useEffect re-runs, briefly
  // sets loginStatus to "initializing", and leaves the Sign In button disabled.
  const handleLogOut = () => {
    clear();
    window.location.href = "/login";
  };

  // Idle timer — only active while a real (non-anonymous) identity is present.
  // Warns at 20 min, expires at 22 min. Wires into the existing
  // SessionWarningDialog via showIdleWarning state.
  useIdleTimer({
    onWarn: () => {
      if (isAuthenticated) setShowIdleWarning(true);
    },
    onExpire: () => {
      if (isAuthenticated) {
        setShowIdleWarning(false);
        clear();
        window.location.href = "/login";
      }
    },
    warnAfterMs: 20 * 60 * 1000,
    expireAfterMs: 22 * 60 * 1000,
  });

  useEffect(() => {
    // Redirect to login if: not initializing AND no identity present
    // This covers both the normal logout case and the post-clear idle state
    if (
      !isInitializing &&
      (!identity || identity.getPrincipal().isAnonymous())
    ) {
      void router.navigate({ to: "/login" });
    }
  }, [identity, isInitializing, router]);

  // Show initializing only briefly — if idle with no identity, don't block
  if (isInitializing && !isLoginIdle) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Initializing...
        </p>
      </div>
    );
  }

  if (!identity) {
    return null;
  }

  return (
    <PermissionsProvider>
      <CommanderValidationBanner />
      <Outlet />
      <CommandPalette />
      {/* Idle warning from useIdleTimer (20-min inactivity) */}
      <SessionWarningDialog
        open={showIdleWarning}
        onStayLoggedIn={() => setShowIdleWarning(false)}
        onLogOut={handleLogOut}
      />
    </PermissionsProvider>
  );
}

// --- Monitoring guard (S2 only) ---
function MonitoringPage() {
  const { isS2Admin, isLoading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isS2Admin) {
      void router.navigate({ to: "/" });
    }
  }, [isS2Admin, isLoading, router]);

  if (isLoading || !isS2Admin) return <PageLoader />;
  return (
    <Suspense fallback={<PageLoader />}>
      <AccessMonitoringPage />
    </Suspense>
  );
}

// --- Profile Preview guard (S2 only) ---
function ProfilePreviewGuard() {
  const { isS2Admin, isLoading } = usePermissions();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isS2Admin) {
      void router.navigate({ to: "/personnel" });
    }
  }, [isS2Admin, isLoading, router]);
  if (isLoading || !isS2Admin) return <PageLoader />;
  return (
    <Suspense fallback={<PageLoader />}>
      <ProfilePreviewPage />
    </Suspense>
  );
}

// --- Admin guard (S2 only) ---
function AdminGuard() {
  const { isS2Admin, isLoading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isS2Admin) {
      void router.navigate({ to: "/" });
    }
  }, [isS2Admin, isLoading, router]);

  if (isLoading || !isS2Admin) return <PageLoader />;
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminPage />
    </Suspense>
  );
}

// --- Route definitions ---
const rootRoute = createRootRoute({
  component: () => (
    <NetworkModeProvider>
      <Outlet />
    </NetworkModeProvider>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LoginPage />
    </Suspense>
  ),
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthenticatedLayout,
});

const hubRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HubPage />
    </Suspense>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <RegistrationGatePage />
    </Suspense>
  ),
});

const validateCommanderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/validate-commander",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ValidateCommanderPage />
    </Suspense>
  ),
});

const documentsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/documents",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DocumentsPage />
    </Suspense>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/messages",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MessagesPage />
    </Suspense>
  ),
});

const personnelRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/personnel",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <PersonnelPage />
    </Suspense>
  ),
});

const emailDirectoryRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/email-directory",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <EmailDirectoryPage />
    </Suspense>
  ),
});

const fileStorageRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/file-storage",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <FileStoragePage />
    </Suspense>
  ),
});

const monitoringRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/monitoring",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MonitoringPage />
    </Suspense>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/notifications",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <NotificationsPage />
    </Suspense>
  ),
});

const auditLogRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/audit-log",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AuditLogPage />
    </Suspense>
  ),
});

const announcementsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/announcements",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AnnouncementsPage />
    </Suspense>
  ),
});

const calendarRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/calendar",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <CalendarPage />
    </Suspense>
  ),
});

const tasksRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/tasks",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TasksPage />
    </Suspense>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/settings",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SettingsPage />
    </Suspense>
  ),
});

const governanceRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/governance",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <GovernancePage />
    </Suspense>
  ),
});

const helpRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/help",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HelpPage />
    </Suspense>
  ),
});

const profilePreviewRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/profile-preview",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ProfilePreviewGuard />
    </Suspense>
  ),
});

const testLabRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/test-lab",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TestLabPage />
    </Suspense>
  ),
});

const myProfileRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/my-profile",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MyProfilePage />
    </Suspense>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/admin",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AdminGuard />
    </Suspense>
  ),
});

const workspaceSetupRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/workspace-setup",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <WorkspaceSetupPage />
    </Suspense>
  ),
});

const claimCommanderRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/claim-commander",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ClaimCommanderPage />
    </Suspense>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <OnboardingPage />
    </Suspense>
  ),
});

const pendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pending",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <PendingVerificationPage />
    </Suspense>
  ),
});

const networkModeSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/network-mode-setup",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <NetworkModeSetupPage />
    </Suspense>
  ),
});

// --- Route tree ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  onboardingRoute,
  pendingRoute,
  networkModeSetupRoute,
  registerRoute,
  validateCommanderRoute,
  authRoute.addChildren([
    hubRoute,
    documentsRoute,
    messagesRoute,
    personnelRoute,
    emailDirectoryRoute,
    fileStorageRoute,
    monitoringRoute,
    notificationsRoute,
    auditLogRoute,
    announcementsRoute,
    calendarRoute,
    tasksRoute,
    settingsRoute,
    governanceRoute,
    helpRoute,
    profilePreviewRoute,
    testLabRoute,
    myProfileRoute,
    adminRoute,
    workspaceSetupRoute,
    claimCommanderRoute,
  ]),
]);

// --- Create router ---
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}

```

---

## FILE: src/main.tsx

```tsx
import ReactDOM from "react-dom/client";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);

```

---

## FILE: src/backend.d.ts

```ts
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

```

---

## FILE: src/config.ts

```ts
import {
  createActor,
  type backendInterface,
  type CreateActorOptions,
  ExternalBlob,
} from "./backend";
import { StorageClient } from "./utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";

const DEFAULT_STORAGE_GATEWAY_URL = "https://blob.caffeine.ai";
const DEFAULT_BUCKET_NAME = "default-bucket";
const DEFAULT_PROJECT_ID = "0000000-0000-0000-0000-00000000000";

interface JsonConfig {
  backend_host: string;
  backend_canister_id: string;
  project_id: string;
  ii_derivation_origin: string;
}

interface Config {
  backend_host?: string;
  backend_canister_id: string;
  storage_gateway_url: string;
  bucket_name: string;
  project_id: string;
  ii_derivation_origin?: string;
}

let configCache: Config | null = null;

export async function loadConfig(): Promise<Config> {
  if (configCache) {
    return configCache;
  }
  const backendCanisterId = process.env.CANISTER_ID_BACKEND;
  const envBaseUrl = process.env.BASE_URL || "/";
  const baseUrl = envBaseUrl.endsWith("/") ? envBaseUrl : `${envBaseUrl}/`;
  try {
    const response = await fetch(`${baseUrl}env.json`);
    const config = (await response.json()) as JsonConfig;
    if (!backendCanisterId && config.backend_canister_id === "undefined") {
      console.error("CANISTER_ID_BACKEND is not set");
      throw new Error("CANISTER_ID_BACKEND is not set");
    }

    const fullConfig = {
      backend_host:
        config.backend_host === "undefined" ? undefined : config.backend_host,
      backend_canister_id: (config.backend_canister_id === "undefined"
        ? backendCanisterId
        : config.backend_canister_id) as string,
      storage_gateway_url: process.env.STORAGE_GATEWAY_URL ?? "nogateway",
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id:
        config.project_id !== "undefined"
          ? config.project_id
          : DEFAULT_PROJECT_ID,
      ii_derivation_origin:
        config.ii_derivation_origin === "undefined"
          ? undefined
          : config.ii_derivation_origin,
    };
    configCache = fullConfig;
    return fullConfig;
  } catch {
    if (!backendCanisterId) {
      console.error("CANISTER_ID_BACKEND is not set");
      throw new Error("CANISTER_ID_BACKEND is not set");
    }
    const fallbackConfig = {
      backend_host: undefined,
      backend_canister_id: backendCanisterId,
      storage_gateway_url: DEFAULT_STORAGE_GATEWAY_URL,
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id: DEFAULT_PROJECT_ID,
      ii_derivation_origin: undefined,
    };
    return fallbackConfig;
  }
}

function extractAgentErrorMessage(error: string): string {
  const errorString = String(error);
  const match = errorString.match(/with message:\s*'([^']+)'/s);
  return match ? match[1] : errorString;
}

function processError(e: unknown): never {
  if (e && typeof e === "object" && "message" in e) {
    throw new Error(extractAgentErrorMessage(`${e.message}`));
  }
  throw e;
}

async function maybeLoadMockBackend(): Promise<backendInterface | null> {
  if (import.meta.env.VITE_USE_MOCK !== "true") {
    return null;
  }

  try {
    // If VITE_USE_MOCK is enabled, try to load a mock backend module *if it exists*.
    // We use import.meta.glob so builds don't fail when the mock file is absent.
    const mockModules = import.meta.glob("./mocks/backend.{ts,tsx,js,jsx}");

    const path = Object.keys(mockModules)[0];
    if (!path) return null;

    const mod = (await mockModules[path]()) as {
      mockBackend?: backendInterface;
    };

    return mod.mockBackend ?? null;
  } catch {
    return null;
  }
}

export async function createActorWithConfig(
  options?: CreateActorOptions,
): Promise<backendInterface> {
  // Attempt to load mock backend if enabled
  const mock = await maybeLoadMockBackend();
  if (mock) {
    return mock;
  }

  const config = await loadConfig();
  const resolvedOptions = options ?? {};
  const agent = new HttpAgent({
    ...resolvedOptions.agentOptions,
    host: config.backend_host,
  });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running",
      );
      console.error(err);
    });
  }
  const actorOptions = {
    ...resolvedOptions,
    agent: agent,
    processError,
  };

  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );

  const MOTOKO_DEDUPLICATION_SENTINEL = "!caf!";

  const uploadFile = async (file: ExternalBlob): Promise<Uint8Array> => {
    const { hash } = await storageClient.putFile(
      await file.getBytes(),
      file.onProgress,
    );
    return new TextEncoder().encode(MOTOKO_DEDUPLICATION_SENTINEL + hash);
  };

  const downloadFile = async (bytes: Uint8Array): Promise<ExternalBlob> => {
    const hashWithPrefix = new TextDecoder().decode(new Uint8Array(bytes));
    const hash = hashWithPrefix.substring(MOTOKO_DEDUPLICATION_SENTINEL.length);
    const url = await storageClient.getDirectURL(hash);
    return ExternalBlob.fromURL(url);
  };

  return createActor(
    config.backend_canister_id,
    uploadFile,
    downloadFile,
    actorOptions,
  );
}

```

---

## FILE: src/lib/utils.ts

```ts
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

```

---

## FILE: src/lib/formatters.ts

```ts
/**
 * Shared formatting utilities for Omnis Sovereign OS.
 * Import from here instead of duplicating across pages.
 */

/**
 * Formats a bigint nanosecond timestamp as a human-readable relative time string.
 * e.g. "just now", "2m ago", "3h ago", "5d ago"
 */
export function formatRelativeTime(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  const now = Date.now();
  const diffMs = now - ms;

  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Formats a bigint nanosecond timestamp as a locale date string.
 */
export function formatDate(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a bigint nanosecond timestamp as a locale date+time string.
 */
export function formatDateTime(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Resolves a display name from an ExtendedProfile.
 * Returns "RANK NAME" if rank is present, otherwise just the name.
 * Falls back to the provided fallback string (default "Unknown").
 */
export function getProfileName(
  profile: { name?: string; rank?: string } | null | undefined,
  fallback = "Unknown",
): string {
  if (!profile) return fallback;
  const parts = [profile.rank, profile.name].filter(Boolean);
  return parts.join(" ").trim() || fallback;
}

/**
 * Returns uppercase initials from a name string (up to 2 words).
 * Returns "??" for empty/blank input.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return "??";
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

```

---

## FILE: src/lib/displayName.ts

```ts
/**
 * DoD-standard name formatting utilities.
 * Format: RANK LAST, First MI
 * Example: SGT SMITH, John A
 */

export function formatDisplayName(
  rank: string,
  lastName: string,
  firstName: string,
  mi: string,
): string {
  const last = lastName.trim().toUpperCase();
  const first = firstName.trim();
  const middle = mi.trim().toUpperCase();
  const r = rank.trim();

  if (!last && !first) return r;

  const namePart = last
    ? `${last}, ${first}${middle ? ` ${middle}` : ""}`
    : first;

  return r ? `${r} ${namePart}` : namePart;
}

export function parseDisplayName(displayName: string): {
  rank: string;
  lastName: string;
  firstName: string;
  mi: string;
} {
  // Expected format: "RANK LAST, First MI" or "RANK LAST, First" or "LAST, First MI"
  const name = displayName.trim();

  // Try to find comma separator (Last, First pattern)
  const commaIdx = name.indexOf(",");
  if (commaIdx === -1) {
    // No comma — treat whole thing as name with possible rank prefix
    return { rank: "", lastName: "", firstName: name, mi: "" };
  }

  const beforeComma = name.slice(0, commaIdx).trim(); // e.g. "SGT SMITH" or "SMITH"
  const afterComma = name.slice(commaIdx + 1).trim(); // e.g. "John A" or "John"

  // Parse first + MI from after comma
  const afterParts = afterComma.split(/\s+/).filter(Boolean);
  const firstName = afterParts[0] ?? "";
  const mi = afterParts[1]?.length === 1 ? afterParts[1] : "";

  // Parse rank + lastName from before comma
  // Common enlisted/officer ranks that might appear as prefix
  const beforeParts = beforeComma.split(/\s+/).filter(Boolean);
  if (beforeParts.length === 1) {
    return { rank: "", lastName: beforeParts[0] ?? "", firstName, mi };
  }

  // Heuristic: last token is lastName, everything before is rank
  const lastName = beforeParts[beforeParts.length - 1] ?? "";
  const rank = beforeParts.slice(0, -1).join(" ");

  return { rank, lastName, firstName, mi };
}

```

---

## FILE: src/config/constants.ts

```ts
// ─── Branch / Rank / Category Mappings ────────────────────────────────────────

export const BRANCH_RANK_CATEGORIES: Record<
  string,
  Record<string, string[]>
> = {
  Army: {
    Enlisted: [
      "Private (PVT)",
      "Private Second Class (PV2)",
      "Private First Class (PFC)",
      "Specialist (SPC)",
      "Corporal (CPL)",
      "Sergeant (SGT)",
      "Staff Sergeant (SSG)",
      "Sergeant First Class (SFC)",
      "Master Sergeant (MSG)",
      "First Sergeant (1SG)",
      "Sergeant Major (SGM)",
      "Command Sergeant Major (CSM)",
      "Sergeant Major of the Army (SMA)",
    ],
    "Warrant Officer": [
      "Warrant Officer 1 (WO1)",
      "Chief Warrant Officer 2 (CW2)",
      "Chief Warrant Officer 3 (CW3)",
      "Chief Warrant Officer 4 (CW4)",
      "Chief Warrant Officer 5 (CW5)",
    ],
    Officer: [
      "Second Lieutenant (2LT)",
      "First Lieutenant (1LT)",
      "Captain (CPT)",
      "Major (MAJ)",
      "Lieutenant Colonel (LTC)",
      "Colonel (COL)",
      "Brigadier General (BG)",
      "Major General (MG)",
      "Lieutenant General (LTG)",
      "General (GEN)",
    ],
  },
  Navy: {
    Enlisted: [
      "Seaman Recruit (SR)",
      "Seaman Apprentice (SA)",
      "Seaman (SN)",
      "Petty Officer 3rd Class (PO3)",
      "Petty Officer 2nd Class (PO2)",
      "Petty Officer 1st Class (PO1)",
      "Chief Petty Officer (CPO)",
      "Senior Chief Petty Officer (SCPO)",
      "Master Chief Petty Officer (MCPO)",
      "Fleet Master Chief (FLTCM)",
      "Master Chief Petty Officer of the Navy (MCPON)",
    ],
    "Warrant Officer": [
      "Chief Warrant Officer 2 (CWO2)",
      "Chief Warrant Officer 3 (CWO3)",
      "Chief Warrant Officer 4 (CWO4)",
      "Chief Warrant Officer 5 (CWO5)",
    ],
    Officer: [
      "Ensign (ENS)",
      "Lieutenant Junior Grade (LTJG)",
      "Lieutenant (LT)",
      "Lieutenant Commander (LCDR)",
      "Commander (CDR)",
      "Captain (CAPT)",
      "Rear Admiral Lower Half (RDML)",
      "Rear Admiral Upper Half (RADM)",
      "Vice Admiral (VADM)",
      "Admiral (ADM)",
      "Fleet Admiral (FADM)",
    ],
  },
  "Air Force": {
    Enlisted: [
      "Airman Basic (AB)",
      "Airman (Amn)",
      "Airman First Class (A1C)",
      "Senior Airman (SrA)",
      "Staff Sergeant (SSgt)",
      "Technical Sergeant (TSgt)",
      "Master Sergeant (MSgt)",
      "Senior Master Sergeant (SMSgt)",
      "Chief Master Sergeant (CMSgt)",
      "Command Chief Master Sergeant (CCM)",
      "Chief Master Sergeant of the Air Force (CMSAF)",
    ],
    Officer: [
      "Second Lieutenant (2d Lt)",
      "First Lieutenant (1st Lt)",
      "Captain (Capt)",
      "Major (Maj)",
      "Lieutenant Colonel (Lt Col)",
      "Colonel (Col)",
      "Brigadier General (Brig Gen)",
      "Major General (Maj Gen)",
      "Lieutenant General (Lt Gen)",
      "General (Gen)",
      "General of the Air Force (GAF)",
    ],
  },
  "Marine Corps": {
    Enlisted: [
      "Private (Pvt)",
      "Private First Class (PFC)",
      "Lance Corporal (LCpl)",
      "Corporal (Cpl)",
      "Sergeant (Sgt)",
      "Staff Sergeant (SSgt)",
      "Gunnery Sergeant (GySgt)",
      "Master Sergeant (MSgt)",
      "First Sergeant (1stSgt)",
      "Master Gunnery Sergeant (MGySgt)",
      "Sergeant Major (SgtMaj)",
      "Sergeant Major of the Marine Corps (SMMC)",
    ],
    "Warrant Officer": [
      "Warrant Officer 1 (WO1)",
      "Chief Warrant Officer 2 (CWO2)",
      "Chief Warrant Officer 3 (CWO3)",
      "Chief Warrant Officer 4 (CWO4)",
      "Chief Warrant Officer 5 (CWO5)",
    ],
    Officer: [
      "Second Lieutenant (2ndLt)",
      "First Lieutenant (1stLt)",
      "Captain (Capt)",
      "Major (Maj)",
      "Lieutenant Colonel (LtCol)",
      "Colonel (Col)",
      "Brigadier General (BGen)",
      "Major General (MajGen)",
      "Lieutenant General (LtGen)",
      "General (Gen)",
      "Assistant Commandant of the Marine Corps (ACMC)",
    ],
  },
  "Coast Guard": {
    Enlisted: [
      "Seaman Recruit (SR)",
      "Seaman Apprentice (SA)",
      "Seaman (SN)",
      "Petty Officer 3rd Class (PO3)",
      "Petty Officer 2nd Class (PO2)",
      "Petty Officer 1st Class (PO1)",
      "Chief Petty Officer (CPO)",
      "Senior Chief Petty Officer (SCPO)",
      "Master Chief Petty Officer (MCPO)",
      "Master Chief Petty Officer of the Coast Guard (MCPOCG)",
    ],
    Officer: [
      "Ensign (ENS)",
      "Lieutenant Junior Grade (LTJG)",
      "Lieutenant (LT)",
      "Lieutenant Commander (LCDR)",
      "Commander (CDR)",
      "Captain (CAPT)",
      "Rear Admiral Lower Half (RDML)",
      "Rear Admiral Upper Half (RADM)",
      "Vice Admiral (VADM)",
      "Admiral (ADM)",
    ],
  },
  "Space Force": {
    Enlisted: [
      "Specialist 1 (Spc1)",
      "Specialist 2 (Spc2)",
      "Specialist 3 (Spc3)",
      "Specialist 4 (Spc4)",
      "Sergeant (Sgt)",
      "Technical Sergeant (TSgt)",
      "Master Sergeant (MSgt)",
      "Senior Master Sergeant (SMSgt)",
      "Chief Master Sergeant (CMSgt)",
      "Command Chief Master Sergeant (CCM)",
      "Chief Master Sergeant of the Space Force (CMSSF)",
    ],
    Officer: [
      "Second Lieutenant (2d Lt)",
      "First Lieutenant (1st Lt)",
      "Captain (Capt)",
      "Major (Maj)",
      "Lieutenant Colonel (Lt Col)",
      "Colonel (Col)",
      "Brigadier General (Brig Gen)",
      "Major General (Maj Gen)",
      "Lieutenant General (Lt Gen)",
      "General (Gen)",
    ],
  },
  "GS / Civilian": {
    "GS Schedule": [
      "GS-1",
      "GS-2",
      "GS-3",
      "GS-4",
      "GS-5",
      "GS-6",
      "GS-7",
      "GS-8",
      "GS-9",
      "GS-10",
      "GS-11",
      "GS-12",
      "GS-13",
      "GS-14",
      "GS-15",
    ],
    "Senior Executive": [
      "SES (Senior Executive Service)",
      "ST (Senior Technical)",
      "SL (Senior Level)",
    ],
  },
  Corporate: {
    "Individual Contributor": [
      "Intern",
      "Associate",
      "Analyst",
      "Senior Analyst",
      "Specialist",
      "Senior Specialist",
      "Lead",
    ],
    Management: ["Manager", "Senior Manager", "Director", "Senior Director"],
    Executive: [
      "Vice President",
      "Senior Vice President",
      "Executive Vice President",
      "C-Suite / Officer",
    ],
  },
};

export const BRANCH_LIST = Object.keys(BRANCH_RANK_CATEGORIES);

export function getCategoriesForBranch(branch: string): string[] {
  return Object.keys(BRANCH_RANK_CATEGORIES[branch] ?? {});
}

export function getRanks(branch: string, category: string): string[] {
  return BRANCH_RANK_CATEGORIES[branch]?.[category] ?? [];
}

// ─── Clearance / Severity ─────────────────────────────────────────────────────

export const CLEARANCE_COLORS: Record<number, string> = {
  0: "gray",
  1: "green",
  2: "blue",
  3: "orange",
  4: "red",
};

export const CLEARANCE_LABELS: Record<number, string> = {
  0: "Unclassified",
  1: "CUI",
  2: "Secret",
  3: "Top Secret",
  4: "TS/SCI",
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export const THEME = {
  navy: "#0a0e1a",
  slate: "#1a2235",
  amber: "#f59e0b",
} as const;

// ─── Network Mode ─────────────────────────────────────────────────────────────

export type NetworkMode =
  | "military-nipr"
  | "military-sipr"
  | "corporate-standard"
  | "corporate-secure";

export interface NetworkModeConfig {
  mode: NetworkMode;
  shortCode: string;
  label: string;
  group: "military" | "corporate";
  description: string;
  classificationTerms: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
  };
  monitoringSensitivity: "standard" | "elevated" | "high" | "maximum";
}

export const NETWORK_MODE_CONFIGS: Record<NetworkMode, NetworkModeConfig> = {
  "military-nipr": {
    mode: "military-nipr",
    shortCode: "NIPR",
    label: "Military — NIPR",
    group: "military",
    description:
      "Non-classified Internet Protocol Router network. Handles UNCLASSIFIED and CUI/FOUO information.",
    classificationTerms: {
      level0: "Unclassified",
      level1: "CUI / FOUO",
      level2: "Secret",
      level3: "Top Secret",
      level4: "TS/SCI",
    },
    monitoringSensitivity: "elevated",
  },
  "military-sipr": {
    mode: "military-sipr",
    shortCode: "SIPR",
    label: "Military — SIPR",
    group: "military",
    description:
      "Secret Internet Protocol Router network. All data treated as at minimum Secret. Highest monitoring sensitivity.",
    classificationTerms: {
      level0: "Unclassified (local)",
      level1: "CUI",
      level2: "Secret",
      level3: "Top Secret",
      level4: "TS/SCI",
    },
    monitoringSensitivity: "maximum",
  },
  "corporate-standard": {
    mode: "corporate-standard",
    shortCode: "STANDARD",
    label: "Corporate — Standard",
    group: "corporate",
    description:
      "Standard corporate deployment. Uses business-appropriate data classification tiers.",
    classificationTerms: {
      level0: "Public",
      level1: "Internal",
      level2: "Confidential",
      level3: "Restricted",
      level4: "Eyes Only",
    },
    monitoringSensitivity: "standard",
  },
  "corporate-secure": {
    mode: "corporate-secure",
    shortCode: "SECURE",
    label: "Corporate — Secure",
    group: "corporate",
    description:
      "Secure corporate deployment for regulated industries. Elevated monitoring and stricter access controls.",
    classificationTerms: {
      level0: "Public",
      level1: "Internal",
      level2: "Confidential",
      level3: "Restricted",
      level4: "Eyes Only",
    },
    monitoringSensitivity: "elevated",
  },
};

```

---

## FILE: src/config/aiDemoData.ts

```ts
/**
 * AI Smart System — Demo / Preview Data
 *
 * This module provides realistic mock data for the S2 admin Access Monitoring
 * demo view. It simulates what the AI scanning system would surface in a live
 * deployment: classified information access patterns, a detected breach, and
 * various security-scan findings.
 *
 * All timestamps are relative to "now" so the demo always looks fresh.
 */

import type { AnomalyEvent } from "@/backend.d";

// ─── Time helpers ─────────────────────────────────────────────────────────────
// biome-ignore lint/correctness/noUnusedVariables: reserved for future use
const _now = () => BigInt(Date.now());
const minsAgo = (m: number) => BigInt(Date.now() - m * 60 * 1000);
const hoursAgo = (h: number) => BigInt(Date.now() - h * 60 * 60 * 1000);

// ─── Fake principals (display only — never sent to backend) ───────────────────
export const DEMO_PRINCIPALS = {
  cpt_harris: "xjrne-xibzv-bqe7v-demo1",
  sgt_reyes: "pqmwk-uvzab-lyt3c-demo2",
  civ_morton: "abcde-fghij-klmno-demo3",
  unknown: "zzzzz-aaaaa-bbbbb-demo9",
} as const;

export const DEMO_PROFILES = [
  {
    name: "Cpt. James Harris",
    rank: "CPT",
    orgRole: "S2 Intelligence Officer",
    clearanceLevel: 4,
    principalId: DEMO_PRINCIPALS.cpt_harris,
  },
  {
    name: "Sgt. Maria Reyes",
    rank: "SGT",
    orgRole: "Intelligence Analyst",
    clearanceLevel: 3,
    principalId: DEMO_PRINCIPALS.sgt_reyes,
  },
  {
    name: "David Morton",
    rank: "CIV",
    orgRole: "Contractor — IT Support",
    clearanceLevel: 1,
    principalId: DEMO_PRINCIPALS.civ_morton,
  },
];

export const DEMO_FOLDERS = [
  {
    id: "folder-tsci-001",
    name: "HUMINT Reports — TS/SCI",
    requiredClearanceLevel: BigInt(4),
  },
  {
    id: "folder-ts-002",
    name: "SIGINT Intercepts — TS",
    requiredClearanceLevel: BigInt(3),
  },
  {
    id: "folder-secret-003",
    name: "Operational Orders — SECRET",
    requiredClearanceLevel: BigInt(2),
  },
  {
    id: "folder-cui-004",
    name: "Personnel Records — CUI",
    requiredClearanceLevel: BigInt(1),
  },
];

// ─── Live scan feed messages (cycled by the AI ticker) ────────────────────────
export const AI_SCAN_MESSAGES = [
  "Scanning access logs across all classification tiers…",
  "Analyzing document retrieval patterns for SGT Reyes…",
  "Cross-referencing HUMINT folder access timestamps…",
  "Detecting anomalous off-hours login attempt — flagging…",
  "Running behavioral baseline comparison for CIV Morton…",
  "Monitoring TS/SCI folder for unauthorized access vectors…",
  "Evaluating need-to-know verification chain integrity…",
  "Checking for repeated classified document downloads…",
  "Scanning message traffic for sensitive data exfiltration markers…",
  "Analyzing 60-minute access frequency threshold — 5+ accesses detected…",
  "Verifying commander authorization chain for elevated permissions…",
  "Correlating anomaly events with user clearance levels…",
  "Checking session tokens for concurrent login violations…",
  "Flagging civilian contractor access to SECRET tier folder…",
  "Escalating high-severity event to S2 notification queue…",
  "Audit trail integrity check — no tampering detected…",
  "Monitoring exfiltration vectors: USB, email, print — all clear…",
  "Real-time threat score updated: ELEVATED for CIV Morton…",
];

// ─── Threat score per user (demo only) ───────────────────────────────────────
export interface ThreatScore {
  name: string;
  rank: string;
  score: number; // 0-100
  level: "low" | "medium" | "high" | "critical";
  reason: string;
}

export const DEMO_THREAT_SCORES: ThreatScore[] = [
  {
    name: "Cpt. James Harris",
    rank: "CPT",
    score: 12,
    level: "low",
    reason: "Normal access patterns within authorized scope",
  },
  {
    name: "Sgt. Maria Reyes",
    rank: "SGT",
    score: 67,
    level: "high",
    reason: "7 accesses to TS folder in 45 min — threshold exceeded",
  },
  {
    name: "David Morton",
    rank: "CIV",
    score: 91,
    level: "critical",
    reason: "Unauthorized attempt to access SECRET folder; clearance level 1",
  },
];

// ─── Demo anomaly events ──────────────────────────────────────────────────────
export const DEMO_ANOMALY_EVENTS: AnomalyEvent[] = [
  // ── BREACH ────────────────────────────────────────────────────────────────
  {
    id: "demo-breach-001",
    detectedAt: minsAgo(8),
    eventType: "unauthorized_access_attempt",
    affectedUserId: undefined,
    affectedFolderId: "folder-secret-003",
    severity: "critical",
    description:
      "CIV David Morton (clearance level 1) attempted to access Operational Orders — SECRET folder (requires level 2). Access was blocked by the system. 3 repeated attempts detected in 4-minute window.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── HIGH-FREQUENCY CLASSIFIED ACCESS ─────────────────────────────────────
  {
    id: "demo-freq-001",
    detectedAt: minsAgo(12),
    eventType: "classified_access_frequency_breach",
    affectedUserId: undefined,
    affectedFolderId: "folder-ts-002",
    severity: "high",
    description:
      "SGT Maria Reyes accessed SIGINT Intercepts — TS folder 7 times within 45 minutes. Automated threshold is 5 accesses per 60 minutes. Behavioral anomaly flagged for S2 review.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── DOCUMENT BULK DOWNLOAD ────────────────────────────────────────────────
  {
    id: "demo-download-001",
    detectedAt: minsAgo(31),
    eventType: "bulk_document_retrieval",
    affectedUserId: undefined,
    affectedFolderId: "folder-tsci-001",
    severity: "high",
    description:
      "12 documents retrieved from HUMINT Reports — TS/SCI folder within a single session by SGT Reyes. Retrieval volume exceeds normal operational patterns. Possible data staging detected.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── OFF-HOURS LOGIN ───────────────────────────────────────────────────────
  {
    id: "demo-offhours-001",
    detectedAt: hoursAgo(2),
    eventType: "off_hours_authentication",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "medium",
    description:
      "Authentication detected outside normal duty hours (02:14 local). User CIV Morton accessed the system. No classified folders were opened, but pattern deviates from 30-day baseline.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── CLEARANCE MISMATCH PROBE ──────────────────────────────────────────────
  {
    id: "demo-clearance-001",
    detectedAt: minsAgo(55),
    eventType: "clearance_mismatch_probe",
    affectedUserId: undefined,
    affectedFolderId: "folder-tsci-001",
    severity: "high",
    description:
      "Direct URL probe to TS/SCI folder endpoint detected from a session authenticated with clearance level 2. AI pattern recognition matched this to known enumeration behavior. Access blocked.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── PERMISSION ESCALATION ATTEMPT ────────────────────────────────────────
  {
    id: "demo-escalation-001",
    detectedAt: hoursAgo(4),
    eventType: "privilege_escalation",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "critical",
    description:
      "API call to setFolderPermission detected without valid S2 admin token. The call attempted to grant Owner-level access to TS/SCI folder for CIV Morton. Request rejected. Possible insider threat or compromised session.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── SESSION ANOMALY ───────────────────────────────────────────────────────
  {
    id: "demo-session-001",
    detectedAt: hoursAgo(1),
    eventType: "concurrent_session_violation",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "medium",
    description:
      "Two concurrent authenticated sessions detected for the same principal within a 3-minute window from different IP contexts. Second session was terminated automatically. Possible credential sharing.",
    resolved: true,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── MESSAGE EXFIL PROBE ───────────────────────────────────────────────────
  {
    id: "demo-message-001",
    detectedAt: hoursAgo(3),
    eventType: "sensitive_data_in_message",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "medium",
    description:
      "Outbound message from CIV Morton scanned by AI content filter. Message body contained patterns matching classified document identifiers. Message was flagged and held pending S2 review.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── LOW-LEVEL ROUTINE AUDIT ───────────────────────────────────────────────
  {
    id: "demo-audit-001",
    detectedAt: hoursAgo(6),
    eventType: "profile_update",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "low",
    description:
      "Profile update executed for SGT Reyes by S2 admin (CPT Harris). Fields changed: orgRole, clearanceLevel (2→3). Change was authorized and logged. Commander authorization reference: CMD-2024-1147.",
    resolved: true,
    isSystemGenerated: false,
    resolvedBy: undefined,
  },

  // ── PERMISSION CHANGE ─────────────────────────────────────────────────────
  {
    id: "demo-perm-001",
    detectedAt: hoursAgo(5),
    eventType: "permission_change",
    affectedUserId: undefined,
    affectedFolderId: "folder-secret-003",
    severity: "low",
    description:
      "Folder permission updated for SGT Reyes on Operational Orders — SECRET. Role changed from Viewer to Editor. needToKnow flag set to true. Action performed by CPT Harris (S2 admin).",
    resolved: true,
    isSystemGenerated: false,
    resolvedBy: undefined,
  },
];

```

---

## FILE: frontend/package.json

```json
{
  "name": "@caffeine/template-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build:skip-bindings": "vite build && pnpm copy:env",
    "build": "vite build && pnpm copy:env",
    "copy:env": "cp env.json dist/",
    "typecheck": "tsc --noEmit --incremental --tsBuildInfoFile node_modules/.cache/tsconfig.tsbuildinfo --pretty",
    "check": "biome check src",
    "fix": "biome check --write src"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@tailwindcss/container-queries": "^0.1.1",
    "@types/node": "^20.9.0",
    "@types/react": "~19.1.0",
    "@types/react-dom": "~19.1.0",
    "@types/three": "0.176.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "dotenv": "^16.5.0",
    "dotenv-cli": "^8.0.0",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.17",
    "@tailwindcss/typography": "0.5.10",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.8.3",
    "vite": "^5.4.1",
    "vite-plugin-environment": "^1.1.3"
  },
  "dependencies": {
    "@dfinity/agent": "~3.3.0",
    "@dfinity/identity": "~3.3.0",
    "@dfinity/auth-client": "~3.3.0",
    "@dfinity/candid": "~3.3.0",
    "@dfinity/principal": "~3.3.0",
    "@icp-sdk/core": "~4.1.0",
    "@react-three/cannon": "~6.6.0",
    "@react-three/drei": "~10.0.8",
    "@react-three/fiber": "~9.1.2",
    "@tanstack/react-query": "^5.24.0",
    "@tanstack/react-router": "~1.131.8",
    "lucide-react": "0.511.0",
    "react-icons": "^5.4.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.15",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "react-day-picker": "^9.5.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.2.1",
    "recharts": "^2.15.1",
    "cmdk": "^1.0.0",
    "vaul": "^1.1.2",
    "react-hook-form": "^7.53.0",
    "input-otp": "^1.4.1",
    "react-resizable-panels": "^2.1.7",
    "sonner": "^1.7.4",
    "next-themes": "~0.4.6",
    "react": "~19.1.0",
    "react-use": "~17.6.0",
    "react-dom": "~19.1.0",
    "react-quill-new": "3.4.6",
    "three": "^0.176.0",
    "zustand": "~5.0.5",
    "motion": "^12.34.3"
  }
}

```

---

## FILE: frontend/components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}

```

---

## FILE: frontend/tailwind.config.js

```js
import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        body: ["Sora", "sans-serif"],
        heading: ['"Bricolage Grotesque"', "sans-serif"],
      },
      colors: {
        navy: "oklch(var(--navy))",
        slate: "oklch(var(--slate))",
        amber: {
          DEFAULT: "oklch(var(--amber))",
          dim: "oklch(var(--amber-dim))",
        },
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};

```

---

## FILE: src/contexts/PermissionsContext.tsx

```tsx
import type { ExtendedProfile, Folder, FolderPermission } from "@/backend.d";
import { DocumentPermission } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface PermissionsContextValue {
  profile: ExtendedProfile | null;
  isS2Admin: boolean;
  isValidatedByCommander: boolean;
  clearanceLevel: number;
  canAccessFolder: (folder: Folder) => boolean;
  refreshProfile: () => Promise<void>;
  folderPermissions: FolderPermission[];
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined,
);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [folderPermissions, setFolderPermissions] = useState<
    FolderPermission[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Use a ref for isFetching so the fetchProfile callback doesn't need it as
  // a dependency — this avoids a re-creation loop where isFetching flickering
  // causes the callback to be recreated, which re-triggers the effect.
  const isFetchingRef = useRef(isFetching);
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const fetchProfile = useCallback(async () => {
    if (!actor || isFetchingRef.current) return;
    setIsLoading(true);
    try {
      const [profileResult, permsResult] = await Promise.all([
        actor.getMyProfile(),
        actor.getMyFolderPermission(),
      ]);
      setProfile(profileResult ?? null);
      setFolderPermissions(permsResult);
    } catch {
      setProfile(null);
      setFolderPermissions([]);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [actor]); // isFetching intentionally excluded — read via ref

  // Fetch once when actor becomes available and identity is set
  useEffect(() => {
    if (actor && !isFetching && identity && !hasFetched) {
      void fetchProfile();
    }
  }, [actor, isFetching, identity, hasFetched, fetchProfile]);

  // Reset when identity changes (logout/login)
  useEffect(() => {
    if (!identity) {
      setProfile(null);
      setFolderPermissions([]);
      setHasFetched(false);
    }
  }, [identity]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const canAccessFolder = useCallback(
    (folder: Folder): boolean => {
      // S2 admin bypasses all checks
      if (profile?.isS2Admin) return true;
      const level = profile ? Number(profile.clearanceLevel) : 0;
      // Gate 1: clearance level
      if (level < Number(folder.requiredClearanceLevel)) return false;
      // Gate 2: need-to-know (check folderPermissions loaded in context)
      const perm = folderPermissions.find((p) => p.folderId === folder.id);
      if (!perm) return false;
      if (!perm.needToKnow) return false;
      if (perm.role === DocumentPermission.NoAccess) return false;
      return true;
    },
    [profile, folderPermissions],
  );

  const value: PermissionsContextValue = {
    profile,
    isS2Admin: profile?.isS2Admin ?? false,
    isValidatedByCommander: profile?.isValidatedByCommander ?? false,
    clearanceLevel: profile ? Number(profile.clearanceLevel) : 0,
    canAccessFolder,
    refreshProfile,
    folderPermissions,
    isLoading,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}

```

---

## FILE: src/contexts/NetworkModeContext.tsx

```tsx
// MOTOKO BACKLOG: networkMode field on Organization entity — when multi-tenant
// org namespacing is implemented, the org's network mode will be stored in the
// backend and fetched on login, overriding localStorage. For now, localStorage only.

import { type ReactNode, createContext, useContext, useState } from "react";

export type NetworkMode =
  | "military-nipr"
  | "military-sipr"
  | "corporate-standard"
  | "corporate-secure"
  | null;

interface NetworkModeContextValue {
  mode: NetworkMode;
  setMode: (mode: NetworkMode) => void;
  isSet: boolean;
}

const NetworkModeContext = createContext<NetworkModeContextValue | null>(null);

const STORAGE_KEY = "omnis_network_mode";

export function NetworkModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<NetworkMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored === "military-nipr" ||
      stored === "military-sipr" ||
      stored === "corporate-standard" ||
      stored === "corporate-secure"
    ) {
      return stored;
    }
    return null;
  });

  function setMode(next: NetworkMode) {
    setModeState(next);
    if (next === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      console.warn(
        "[OMNIS] Network mode stored in localStorage — UI-only. Backend enforcement pending.",
      );
    }
  }

  return (
    <NetworkModeContext.Provider
      value={{ mode, setMode, isSet: mode !== null }}
    >
      {children}
    </NetworkModeContext.Provider>
  );
}

export function useNetworkMode(): NetworkModeContextValue {
  const ctx = useContext(NetworkModeContext);
  if (!ctx) {
    throw new Error("useNetworkMode must be used within a NetworkModeProvider");
  }
  return ctx;
}

```

---

## FILE: src/hooks/useActor.ts

```tsx
import { useInternetIdentity } from "./useInternetIdentity";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { type backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Infinity,
    // This will cause the actor to be recreated when the identity changes
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}

```

---

## FILE: src/hooks/useIdleTimer.ts

```tsx
import { useEffect, useRef } from "react";

interface UseIdleTimerOptions {
  onWarn: () => void;
  onExpire: () => void;
  /** Milliseconds of inactivity before the warning fires. Default: 20 minutes. */
  warnAfterMs?: number;
  /** Milliseconds of inactivity before the session is expired. Default: 22 minutes. */
  expireAfterMs?: number;
}

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "touchstart",
  "click",
] as const;

/**
 * Idle timer hook.
 *
 * Listens for user activity on `window`. After `warnAfterMs` of inactivity
 * calls `onWarn`. After `expireAfterMs` calls `onExpire`. Any activity resets
 * both timers.
 *
 * Does not self-activate — the caller decides when to mount it (e.g. only when
 * an authenticated identity is present).
 */
export function useIdleTimer({
  onWarn,
  onExpire,
  warnAfterMs = 20 * 60 * 1000,
  expireAfterMs = 22 * 60 * 1000,
}: UseIdleTimerOptions): void {
  // Keep callback refs stable so the effect deps array stays minimal
  const onWarnRef = useRef(onWarn);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onWarnRef.current = onWarn;
  }, [onWarn]);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (warnTimerRef.current !== null) {
        clearTimeout(warnTimerRef.current);
        warnTimerRef.current = null;
      }
      if (expireTimerRef.current !== null) {
        clearTimeout(expireTimerRef.current);
        expireTimerRef.current = null;
      }
    }

    function resetTimers() {
      clearTimers();
      warnTimerRef.current = setTimeout(() => {
        onWarnRef.current();
      }, warnAfterMs);
      expireTimerRef.current = setTimeout(() => {
        onExpireRef.current();
      }, expireAfterMs);
    }

    // Start timers immediately on mount
    resetTimers();

    // Reset on any user activity
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimers, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimers);
      }
    };
  }, [warnAfterMs, expireAfterMs]); // callbacks are read via refs — stable
}

```

---

## FILE: src/hooks/useInternetIdentity.ts

```tsx
import {
  type ReactNode,
  type PropsWithChildren,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthClient,
  type AuthClientCreateOptions,
  type AuthClientLoginOptions,
} from "@dfinity/auth-client";
import type { Identity } from "@icp-sdk/core/agent";
import { DelegationIdentity, isDelegationValid } from "@icp-sdk/core/identity";
import { loadConfig } from "../config";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  /** The identity is available after successfully loading the identity from local storage
   * or completing the login process. */
  identity?: Identity;

  /** Connect to Internet Identity to login the user. */
  login: () => void;

  /** Clears the identity from the state and local storage. Effectively "logs the user out". */
  clear: () => void;

  /** The loginStatus of the login process. Note: The login loginStatus is not affected when a stored
   * identity is loaded on mount. */
  loginStatus: Status;

  /** `loginStatus === "initializing"` */
  isInitializing: boolean;

  /** `loginStatus === "idle"` */
  isLoginIdle: boolean;

  /** `loginStatus === "logging-in"` */
  isLoggingIn: boolean;

  /** `loginStatus === "success"` */
  isLoginSuccess: boolean;

  /** `loginStatus === "loginError"` */
  isLoginError: boolean;

  loginError?: Error;
};

const ONE_HOUR_IN_NANOSECONDS = BigInt(3_600_000_000_000);
const DEFAULT_IDENTITY_PROVIDER = process.env.II_URL;

type ProviderValue = InternetIdentityContext;
const InternetIdentityReactContext = createContext<ProviderValue | undefined>(
  undefined,
);

/**
 * Create the auth client with default options or options provided by the user.
 */
async function createAuthClient(
  createOptions?: AuthClientCreateOptions,
): Promise<AuthClient> {
  const config = await loadConfig();
  const options: AuthClientCreateOptions = {
    idleOptions: {
      // Default behaviour of this hook is not to logout and reload window on identity expiration
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...createOptions?.idleOptions,
    },
    loginOptions: {
      derivationOrigin: config.ii_derivation_origin,
    },
    ...createOptions,
  };
  const authClient = await AuthClient.create(options);
  return authClient;
}

/**
 * Helper function to set loginError state.
 */
function assertProviderPresent(
  context: ProviderValue | undefined,
): asserts context is ProviderValue {
  if (!context) {
    throw new Error(
      "InternetIdentityProvider is not present. Wrap your component tree with it.",
    );
  }
}

/**
 * Hook to access the internet identity as well as loginStatus along with
 * login and clear functions.
 */
export const useInternetIdentity = (): InternetIdentityContext => {
  const context = useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
};

/**
 * The InternetIdentityProvider component makes the saved identity available
 * after page reloads. It also allows you to configure default options
 * for AuthClient and login.
 *
 *
 * @example
 * ```tsx
 * <InternetIdentityProvider>
 *   <App />
 * </InternetIdentityProvider>
 * ```
 */
export function InternetIdentityProvider({
  children,
  createOptions,
}: PropsWithChildren<{
  /** The child components that the InternetIdentityProvider will wrap. This allows any child
   * component to access the authentication context provided by the InternetIdentityProvider. */
  children: ReactNode;

  /** Options for creating the {@link AuthClient}. See AuthClient documentation for list of options
   *
   * defaults to disabling the AuthClient idle handling (clearing identities
   * from store and reloading the window on identity expiry). If that behaviour is preferred, set these settings:
   *
   * ```
   * const options = {
   *   idleOptions: {
   *     disableDefaultIdleCallback: false,
   *     disableIdle: false,
   *   },
   * }
   * ```
   */
  createOptions?: AuthClientCreateOptions;
}>) {
  const [authClient, setAuthClient] = useState<AuthClient | undefined>(
    undefined,
  );
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  const setErrorMessage = useCallback((message: string) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    const latestIdentity = authClient?.getIdentity();
    if (!latestIdentity) {
      setErrorMessage("Identity not found after successful login");
      return;
    }
    setIdentity(latestIdentity);
    setStatus("success");
  }, [authClient, setErrorMessage]);

  const handleLoginError = useCallback(
    (maybeError?: string) => {
      setErrorMessage(maybeError ?? "Login failed");
    },
    [setErrorMessage],
  );

  const login = useCallback(() => {
    if (!authClient) {
      setErrorMessage(
        "AuthClient is not initialized yet, make sure to call `login` on user interaction e.g. click.",
      );
      return;
    }

    const currentIdentity = authClient.getIdentity();
    if (
      !currentIdentity.getPrincipal().isAnonymous() &&
      currentIdentity instanceof DelegationIdentity &&
      isDelegationValid(currentIdentity.getDelegation())
    ) {
      setErrorMessage("User is already authenticated");
      return;
    }

    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: handleLoginSuccess,
      onError: handleLoginError,
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30), // 30 days
    };

    setStatus("logging-in");
    void authClient.login(options);
  }, [authClient, handleLoginError, handleLoginSuccess, setErrorMessage]);

  const clear = useCallback(() => {
    if (!authClient) {
      setErrorMessage("Auth client not initialized");
      return;
    }

    void authClient
      .logout()
      .then(() => {
        setIdentity(undefined);
        setAuthClient(undefined);
        setStatus("idle");
        setError(undefined);
      })
      .catch((unknownError: unknown) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [authClient, setErrorMessage]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setStatus("initializing");
        let existingClient = authClient;
        if (!existingClient) {
          existingClient = await createAuthClient(createOptions);
          if (cancelled) return;
          setAuthClient(existingClient);
        }
        const isAuthenticated = await existingClient.isAuthenticated();
        if (cancelled) return;
        if (isAuthenticated) {
          const loadedIdentity = existingClient.getIdentity();
          setIdentity(loadedIdentity);
        }
      } catch (unknownError) {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Initialization failed"),
        );
      } finally {
        if (!cancelled) setStatus("idle");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createOptions, authClient]);

  const value = useMemo<ProviderValue>(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
    }),
    [identity, login, clear, loginStatus, loginError],
  );

  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}

```

---

## FILE: src/hooks/useSessionGuard.ts

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

const WARN_TIMEOUT_MS = 4 * 60 * 1000; // 4 minutes
const EXPIRE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function useSessionGuard() {
  const { login } = useInternetIdentity();
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store the last route in memory only — never sessionStorage
  const lastRouteRef = useRef<string>(window.location.pathname);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (expireTimerRef.current) clearTimeout(expireTimerRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    warnTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, WARN_TIMEOUT_MS);
    expireTimerRef.current = setTimeout(() => {
      setShowWarning(false);
      setShowExpired(true);
    }, EXPIRE_TIMEOUT_MS);
  }, [clearTimers]);

  const resetActivity = useCallback(() => {
    lastRouteRef.current = window.location.pathname;
    startTimers();
  }, [startTimers]);

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    startTimers();
  }, [startTimers]);

  const handleExpiredSignIn = useCallback(() => {
    setShowExpired(false);
    login();
    // After re-auth, navigate to last known route (in-memory only)
    // The router will handle redirect after login status changes
  }, [login]);

  // Attach activity listeners
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"] as const;
    for (const evt of events) {
      window.addEventListener(evt, resetActivity, { passive: true });
    }
    startTimers();
    return () => {
      clearTimers();
      for (const evt of events) {
        window.removeEventListener(evt, resetActivity);
      }
    };
  }, [resetActivity, startTimers, clearTimers]);

  return {
    showWarning,
    showExpired,
    handleStayLoggedIn,
    handleExpiredSignIn,
    lastRoute: lastRouteRef.current,
  };
}

```

---

## FILE: src/hooks/useStorageClient.ts

```tsx
import { loadConfig } from "@/config";
import { StorageClient } from "@/utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import type { Identity } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";

interface StorageClientState {
  client: StorageClient | null;
  isReady: boolean;
}

export function useStorageClient(
  identity: Identity | null,
): StorageClientState {
  const [state, setState] = useState<StorageClientState>({
    client: null,
    isReady: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const config = await loadConfig();
        const agentOptions = identity ? { identity } : {};
        const agent = new HttpAgent({
          ...agentOptions,
          host: config.backend_host,
        });

        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {});
        }

        const client = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        if (!cancelled) {
          setState({ client, isReady: true });
        }
      } catch (err) {
        console.error("Failed to initialize storage client:", err);
        if (!cancelled) {
          setState({ client: null, isReady: true });
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [identity]);

  return state;
}

```

---

## FILE: src/hooks/use-mobile.tsx

```tsx
import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return isMobile;
}

```

---

## FILE: src/components/shared/ChainOfTrustPanel.tsx

```tsx
/**
 * ChainOfTrustPanel — Two-seat chain of trust status display.
 * Reads from localStorage (frontend-enforced only until Motoko backend session).
 *
 * MOTOKO BACKLOG (frontend-enforced only):
 * - Organization entity (orgId, name, UIC, type, mode, adminPrincipal, createdAt)
 * - Commander role constraint (only one per org, backend-enforced)
 * - Provisional S2 status with expiry (time-bound flag on ExtendedProfile)
 * - RoleApprovalRequest entity (commander handoff co-sign, S2 promotion approval)
 */

import { Check, Copy, ShieldCheck, ShieldOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface WorkspaceData {
  name: string;
  uic: string;
  type: string;
  mode: string;
  createdAt: string;
}

interface ChainOfTrustPanelProps {
  compact?: boolean;
}

export function ChainOfTrustPanel({ compact = false }: ChainOfTrustPanelProps) {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [hasFoundingS2, setHasFoundingS2] = useState(false);
  const [commanderClaimed, setCommanderClaimed] = useState(false);

  const loadState = useCallback(() => {
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw) as WorkspaceData);
      } catch {
        setWorkspace(null);
      }
    }
    setHasFoundingS2(localStorage.getItem("omnis_founding_s2") === "true");
    setCommanderClaimed(
      localStorage.getItem("omnis_commander_claimed") === "true",
    );
  }, []);

  useEffect(() => {
    loadState();
    // Poll for commander claim every 5s while panel is mounted
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, [loadState]);

  const bothSeated = hasFoundingS2 && commanderClaimed;

  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/claim-commander`
      : "/claim-commander";

  const handleCopyClaimLink = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      toast.success("Claim link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (!workspace && !hasFoundingS2) return null;

  // ── Compact view ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <SeatRow
          label="S2 Administrator"
          status={
            hasFoundingS2 ? (bothSeated ? "official" : "provisional") : "vacant"
          }
          compact
        />
        <SeatRow
          label="Commander"
          status={commanderClaimed ? "claimed" : "vacant-awaiting"}
          compact
        />
      </div>
    );
  }

  // ── Full view ─────────────────────────────────────────────────────────────
  return (
    <div
      data-ocid="admin.trust.panel"
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 border-b px-5 py-3.5"
        style={{ borderColor: "#1a2235" }}
      >
        <ShieldCheck className="h-4 w-4" style={{ color: "#f59e0b" }} />
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
          Chain of Trust
        </h3>
        {workspace && (
          <span className="ml-auto font-mono text-[10px] text-slate-500">
            {workspace.name} {workspace.uic ? `· UIC ${workspace.uic}` : ""}
          </span>
        )}
      </div>

      {/* Seat rows */}
      <div
        className="divide-y p-4 space-y-0"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="py-3">
          <SeatRow
            label="S2 Administrator"
            status={
              hasFoundingS2
                ? bothSeated
                  ? "official"
                  : "provisional"
                : "vacant"
            }
          />
        </div>
        <div className="py-3">
          <SeatRow
            label="Commander"
            status={commanderClaimed ? "claimed" : "vacant-awaiting"}
          />
        </div>
      </div>

      {/* Status banners */}
      {!compact && (
        <div className="px-4 pb-4">
          {bothSeated ? (
            <div
              className="flex items-center gap-2.5 rounded px-4 py-3"
              style={{
                backgroundColor: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Check
                className="h-4 w-4 shrink-0"
                style={{ color: "#22c55e" }}
              />
              <p className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                Chain of Trust Established — Both seats are filled
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col gap-3 rounded px-4 py-3"
              style={{
                backgroundColor: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <ShieldOff
                  className="h-4 w-4 shrink-0"
                  style={{ color: "#f59e0b" }}
                />
                <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                  Awaiting Commander — Share claim link to complete setup
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-3 py-1.5 font-mono text-[10px] text-slate-300"
                  style={{
                    backgroundColor: "#0a0e1a",
                    borderColor: "#2a3347",
                  }}
                >
                  {claimUrl}
                </code>
                <button
                  type="button"
                  data-ocid="admin.trust.copy_claim_link.button"
                  onClick={() => void handleCopyClaimLink()}
                  className="flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-amber-500/10"
                  style={{
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "#f59e0b",
                  }}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Seat row ──────────────────────────────────────────────────────────────────

type SeatStatus =
  | "provisional"
  | "official"
  | "claimed"
  | "vacant"
  | "vacant-awaiting";

function SeatRow({
  label,
  status,
  compact = false,
}: {
  label: string;
  status: SeatStatus;
  compact?: boolean;
}) {
  const badgeConfig: Record<
    SeatStatus,
    {
      label: string;
      color: string;
      bg: string;
      border: string;
      pulse?: boolean;
    }
  > = {
    provisional: {
      label: "Provisional",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
    },
    official: {
      label: "Official",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
    },
    claimed: {
      label: "Claimed",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
    },
    vacant: {
      label: "Vacant",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
    },
    "vacant-awaiting": {
      label: "Vacant — Awaiting",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
      pulse: true,
    },
  };

  const cfg = badgeConfig[status];

  return (
    <div
      className={`flex items-center justify-between gap-3 ${compact ? "" : "py-1"}`}
    >
      <span className="font-mono text-xs text-slate-400">{label}</span>
      <span
        className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider${cfg.pulse ? " animate-pulse" : ""}`}
        style={{
          color: cfg.color,
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

```

---

## FILE: src/components/shared/ClassificationBadge.tsx

```tsx
import { CLEARANCE_COLORS, CLEARANCE_LABELS } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ClassificationBadgeProps {
  level: number;
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  gray: "bg-zinc-800/80 text-zinc-400 border-zinc-600",
  green: "bg-green-950/80 text-green-400 border-green-800",
  blue: "bg-blue-950/80 text-blue-400 border-blue-800",
  orange: "bg-orange-950/80 text-orange-400 border-orange-800",
  red: "bg-red-950/80 text-red-400 border-red-800",
};

export function ClassificationBadge({
  level,
  className,
}: ClassificationBadgeProps) {
  const color = CLEARANCE_COLORS[level] ?? "gray";
  const label = CLEARANCE_LABELS[level] ?? "Unknown";
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;

  return (
    <span
      data-ocid="classification.badge"
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase",
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}

```

---

## FILE: src/components/shared/ClearanceBadge.tsx

```tsx
import { CLEARANCE_COLORS, CLEARANCE_LABELS } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ClearanceBadgeProps {
  level: number;
  className?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  gray: "bg-zinc-700/60 text-zinc-300 border-zinc-600",
  green: "bg-green-900/60 text-green-300 border-green-700",
  blue: "bg-blue-900/60 text-blue-300 border-blue-700",
  orange: "bg-orange-900/60 text-orange-300 border-orange-700",
  red: "bg-red-900/60 text-red-300 border-red-700",
};

export function ClearanceBadge({ level, className }: ClearanceBadgeProps) {
  const color = CLEARANCE_COLORS[level] ?? "gray";
  const label = CLEARANCE_LABELS[level] ?? "Unknown";
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;

  return (
    <span
      data-ocid="clearance.badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}

```

---

## FILE: src/components/shared/CommandPalette.tsx

```tsx
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
/**
 * CommandPalette — Global Ctrl+K / Cmd+K command palette.
 * Opens via keyboard shortcut or topnav button.
 * Lists all navigable routes, navigates on select.
 */
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Globe,
  HelpCircle,
  Layout,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  s2Only?: boolean;
}

const PRIMARY_ITEMS: NavItem[] = [
  {
    label: "Documents",
    to: "/documents",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Messaging",
    to: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    label: "File Storage",
    to: "/file-storage",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  {
    label: "Personnel Directory",
    to: "/personnel",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Email Directory",
    to: "/email-directory",
    icon: <Mail className="h-4 w-4" />,
  },
];

const TOOLS_ITEMS: NavItem[] = [
  {
    label: "Notifications",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: "Announcements",
    to: "/announcements",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    label: "Calendar",
    to: "/calendar",
    icon: <Calendar className="h-4 w-4" />,
  },
  { label: "Tasks", to: "/tasks", icon: <CheckSquare className="h-4 w-4" /> },
];

const ACCOUNT_ITEMS: NavItem[] = [
  {
    label: "My Profile",
    to: "/my-profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    label: "Governance",
    to: "/governance",
    icon: <Layout className="h-4 w-4" />,
  },
  { label: "Help", to: "/help", icon: <HelpCircle className="h-4 w-4" /> },
];

const S2_ITEMS: NavItem[] = [
  {
    label: "Access Monitoring",
    to: "/monitoring",
    icon: <Shield className="h-4 w-4" />,
    s2Only: true,
  },
  {
    label: "Audit Log",
    to: "/audit-log",
    icon: <BookOpen className="h-4 w-4" />,
    s2Only: true,
  },
  {
    label: "Admin Panel",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    s2Only: true,
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isS2Admin } = usePermissions();

  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K / Cmd+K toggles palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      // G → key sequence navigation (only when palette is closed and not in an input)
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "g" || e.key === "G") {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }
      if (gPressed) {
        gPressed = false;
        if (gTimer) clearTimeout(gTimer);
        const map: Record<string, string> = {
          h: "/",
          H: "/",
          d: "/documents",
          D: "/documents",
          m: "/messages",
          M: "/messages",
          n: "/notifications",
          N: "/notifications",
        };
        if (map[e.key]) {
          e.preventDefault();
          void navigate({
            to: map[e.key] as
              | "/"
              | "/documents"
              | "/messages"
              | "/notifications",
          });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);

  function handleSelect(to: string) {
    setOpen(false);
    void navigate({ to });
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search and navigate to any module"
      showCloseButton={false}
    >
      <div
        data-ocid="command_palette.dialog"
        style={{ backgroundColor: "#0f1626", color: "#e2e8f0" }}
        className="overflow-hidden rounded-lg border"
        // Style override — dialog already handles the container
      >
        <CommandInput
          data-ocid="command_palette.search_input"
          placeholder="Search modules..."
          className="border-b font-mono text-sm text-white placeholder:text-slate-600"
          style={{ borderColor: "#1a2235", backgroundColor: "#0f1626" }}
        />
        <CommandList style={{ backgroundColor: "#0f1626" }}>
          <CommandEmpty className="font-mono text-xs uppercase tracking-widest text-slate-600">
            No results found.
          </CommandEmpty>

          <CommandGroup
            heading="Modules"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-600"
          >
            {PRIMARY_ITEMS.map((item, i) => (
              <CommandItem
                key={item.to}
                data-ocid={`command_palette.item.${i + 1}`}
                value={item.label}
                onSelect={() => handleSelect(item.to)}
                className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <span className="text-amber-500/60">{item.icon}</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator style={{ backgroundColor: "#1a2235" }} />

          <CommandGroup
            heading="Tools"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-600"
          >
            {TOOLS_ITEMS.map((item, i) => (
              <CommandItem
                key={item.to}
                data-ocid={`command_palette.item.${PRIMARY_ITEMS.length + i + 1}`}
                value={item.label}
                onSelect={() => handleSelect(item.to)}
                className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <span className="text-amber-500/60">{item.icon}</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator style={{ backgroundColor: "#1a2235" }} />

          <CommandGroup
            heading="Account"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-600"
          >
            {ACCOUNT_ITEMS.map((item, i) => (
              <CommandItem
                key={item.to}
                data-ocid={`command_palette.item.${PRIMARY_ITEMS.length + TOOLS_ITEMS.length + i + 1}`}
                value={item.label}
                onSelect={() => handleSelect(item.to)}
                className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 data-[selected=true]:bg-white/5 data-[selected=true]:text-white"
              >
                <span className="text-amber-500/60">{item.icon}</span>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {isS2Admin && (
            <>
              <CommandSeparator style={{ backgroundColor: "#1a2235" }} />
              <CommandGroup
                heading="S2 Admin"
                className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-amber-600"
              >
                {S2_ITEMS.map((item, i) => (
                  <CommandItem
                    key={item.to}
                    data-ocid={`command_palette.item.${PRIMARY_ITEMS.length + TOOLS_ITEMS.length + ACCOUNT_ITEMS.length + i + 1}`}
                    value={item.label}
                    onSelect={() => handleSelect(item.to)}
                    className="cursor-pointer gap-2 font-mono text-xs uppercase tracking-wider text-amber-400/80 data-[selected=true]:bg-white/5 data-[selected=true]:text-amber-300"
                  >
                    <span className="text-amber-500/60">{item.icon}</span>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer shortcut hint */}
        <div
          className="flex items-center justify-end border-t px-3 py-2"
          style={{ borderColor: "#1a2235" }}
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
            ↵ Select · Esc Close
          </span>
        </div>
      </div>
    </CommandDialog>
  );
}

```

---

## FILE: src/components/shared/ConfirmDialog.tsx

```tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="confirm.dialog"
        className="border-border bg-card text-card-foreground sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            data-ocid="confirm.cancel_button"
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            data-ocid="confirm.confirm_button"
            variant="destructive"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

---

## FILE: src/components/shared/EmptyState.tsx

```tsx
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  className?: string;
  /** Override the data-ocid marker (defaults to "empty_state.panel") */
  ocid?: string;
  /** @deprecated use ocid instead */
  id?: string;
}

export function EmptyState({
  icon,
  message,
  className,
  ocid,
  id,
}: EmptyStateProps) {
  return (
    <div
      data-ocid={ocid ?? id ?? "empty_state.panel"}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center opacity-40">
        {icon}
      </div>
      <p className="text-sm font-medium tracking-wide uppercase opacity-60">
        {message}
      </p>
    </div>
  );
}

```

---

## FILE: src/components/shared/ErrorBoundary.tsx

```tsx
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error details for debugging
    console.error(
      "[Omnis] Unhandled error caught by ErrorBoundary:",
      error,
      info,
    );
  }

  handleReturn = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-ocid="error_boundary.panel"
          style={{
            minHeight: "100vh",
            backgroundColor: "#0a0e1a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            padding: "2rem",
          }}
        >
          {/* OMNIS Wordmark */}
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "#f59e0b",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              OMNIS
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                color: "#475569",
                textTransform: "uppercase",
                marginTop: "0.25rem",
              }}
            >
              Sovereign OS
            </div>
          </div>

          {/* Error icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="System error warning"
            >
              <title>System error warning</title>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Error message */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              maxWidth: "400px",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: "#cbd5e1",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              System Error
            </p>
            <p
              style={{
                fontSize: "0.65rem",
                color: "#64748b",
                letterSpacing: "0.05em",
                lineHeight: 1.6,
              }}
            >
              A system error occurred. Your session data is secure.
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "120px",
              height: "1px",
              backgroundColor: "#1a2235",
              marginBottom: "2rem",
            }}
          />

          {/* Return button */}
          <button
            type="button"
            data-ocid="error_boundary.return_button"
            onClick={this.handleReturn}
            style={{
              backgroundColor: "#f59e0b",
              color: "#0a0e1a",
              border: "none",
              borderRadius: "4px",
              padding: "0.625rem 1.5rem",
              fontFamily: "monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#d97706";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#f59e0b";
            }}
          >
            Return to Hub
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

```

---

## FILE: src/components/shared/FormError.tsx

```tsx
interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      data-ocid="form.error_state"
      className="mt-1 text-xs text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}

```

---

## FILE: src/components/shared/RankSelector.tsx

```tsx
/**
 * RankSelector — Three independent dropdowns: Branch, Category, Rank
 * All three visible simultaneously. Category filters by branch, rank filters by both.
 */
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANCH_LIST,
  getCategoriesForBranch,
  getRanks,
} from "@/config/constants";

interface RankSelectorProps {
  branch: string;
  category: string;
  rank: string;
  onBranchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onRankChange: (v: string) => void;
  disabled?: boolean;
  /** Style variant: 'registration' uses lighter bg, 'modal' uses darker bg */
  variant?: "registration" | "modal";
}

export function RankSelector({
  branch,
  category,
  rank,
  onBranchChange,
  onCategoryChange,
  onRankChange,
  disabled = false,
  variant = "registration",
}: RankSelectorProps) {
  const categories = branch ? getCategoriesForBranch(branch) : [];
  const ranks = branch && category ? getRanks(branch, category) : [];

  const inputStyle =
    variant === "registration"
      ? { backgroundColor: "#1a2235", borderColor: "#243048" }
      : { backgroundColor: "#1a2235", borderColor: "#2a3347" };

  const contentStyle = { backgroundColor: "#0f1626", borderColor: "#1a2235" };

  const labelClass =
    variant === "registration"
      ? "font-mono text-xs uppercase tracking-wider text-muted-foreground"
      : "font-mono text-[10px] uppercase tracking-widest text-slate-400";

  return (
    <div className="space-y-3">
      {/* Branch */}
      <div className="space-y-1.5">
        <Label className={labelClass}>Branch / Organization</Label>
        <Select
          value={branch}
          onValueChange={(v) => {
            onBranchChange(v);
            onCategoryChange("");
            onRankChange("");
          }}
          disabled={disabled}
        >
          <SelectTrigger
            data-ocid="rank_selector.branch.select"
            className="border font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
            style={inputStyle}
          >
            <SelectValue placeholder="Select branch or org type…" />
          </SelectTrigger>
          <SelectContent style={contentStyle}>
            {BRANCH_LIST.map((b) => (
              <SelectItem key={b} value={b} className="font-mono text-sm">
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className={labelClass}>Category</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            onCategoryChange(v);
            onRankChange("");
          }}
          disabled={disabled || !branch}
        >
          <SelectTrigger
            data-ocid="rank_selector.category.select"
            className="border font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
            style={inputStyle}
          >
            <SelectValue
              placeholder={branch ? "Select category…" : "Select branch first"}
            />
          </SelectTrigger>
          <SelectContent style={contentStyle}>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="font-mono text-sm">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rank */}
      <div className="space-y-1.5">
        <Label className={labelClass}>Rank / Title</Label>
        <Select
          value={rank}
          onValueChange={onRankChange}
          disabled={disabled || !category}
        >
          <SelectTrigger
            data-ocid="rank_selector.rank.select"
            className="border font-mono text-sm text-foreground focus:border-primary focus:ring-primary"
            style={inputStyle}
          >
            <SelectValue
              placeholder={
                category ? "Select rank or title…" : "Select category first"
              }
            />
          </SelectTrigger>
          <SelectContent style={contentStyle}>
            {ranks.map((r) => (
              <SelectItem key={r} value={r} className="font-mono text-sm">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

```

---

## FILE: src/components/shared/SkeletonCard.tsx

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonCard({ width, height, className }: SkeletonCardProps) {
  return (
    <Skeleton
      data-ocid="skeleton.loading_state"
      className={cn("rounded-md bg-muted", className)}
      style={{ width, height }}
    />
  );
}

```

---

## FILE: src/components/shared/VerifiedBadge.tsx

```tsx
import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  "data-ocid"?: string;
}

export function VerifiedBadge({ "data-ocid": dataOcid }: VerifiedBadgeProps) {
  return (
    <span
      data-ocid={dataOcid}
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
      style={{
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#f59e0b",
      }}
    >
      <ShieldCheck className="h-2.5 w-2.5" />
      Verified
    </span>
  );
}

```

---

## FILE: src/components/auth/SessionExpiredModal.tsx

```tsx
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

interface SessionExpiredModalProps {
  onSignIn: () => void;
}

export function SessionExpiredModal({ onSignIn }: SessionExpiredModalProps) {
  return (
    <div
      data-ocid="session.modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div className="flex max-w-sm flex-col items-center gap-6 rounded-lg border border-border bg-card px-8 py-10 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2
            id="session-expired-title"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Session Expired
          </h2>
          <p
            id="session-expired-desc"
            className="text-sm text-muted-foreground"
          >
            Your session has expired due to inactivity. Please sign in again to
            continue.
          </p>
        </div>
        <Button
          data-ocid="session.signin_button"
          className="w-full bg-primary font-mono text-sm font-medium uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          onClick={onSignIn}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}

```

---

## FILE: src/components/auth/SessionWarningDialog.tsx

```tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface SessionWarningDialogProps {
  open: boolean;
  onStayLoggedIn: () => void;
  onLogOut: () => void;
}

export function SessionWarningDialog({
  open,
  onStayLoggedIn,
  onLogOut,
}: SessionWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        data-ocid="session.dialog"
        className="border-border bg-card text-card-foreground sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-DEFAULT" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You&apos;ve been inactive for 20 minutes. Your session will expire
            in 2 minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            data-ocid="session.logout_button"
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
            onClick={onLogOut}
          >
            Log Out
          </Button>
          <Button
            data-ocid="session.stay_logged_in_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onStayLoggedIn}
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

---

## FILE: src/components/auth/StarfieldWarp.tsx

```tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface StarfieldProps {
  warpActive?: boolean;
}

function Stars({ warpActive }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const starCount = 2000;

  const [_positions, geometry] = useMemo(() => {
    const arr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;
    }
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(arr, 3);
    geo.setAttribute("position", attr);
    return [arr, geo] as const;
  }, []);

  const speedRef = useRef(0.05);

  useFrame(() => {
    if (!pointsRef.current) return;

    const target = warpActive ? 3.5 : 0.05;
    speedRef.current += (target - speedRef.current) * 0.06;

    const pos = pointsRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < starCount; i++) {
      arr[i * 3 + 2] += speedRef.current;
      if (arr[i * 3 + 2] > 50) {
        arr[i * 3 + 2] = -100;
        arr[i * 3] = (Math.random() - 0.5) * 200;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={warpActive ? 0.5 : 0.25}
        color="#f59e0b"
        sizeAttenuation
        transparent
        opacity={0.85}
      />
    </points>
  );
}

export function StarfieldWarp({ warpActive = false }: StarfieldProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75, near: 0.1, far: 1000 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ antialias: false }}
    >
      <Stars warpActive={warpActive} />
    </Canvas>
  );
}

```

---

## FILE: src/components/layout/CommanderValidationBanner.tsx

```tsx
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export function CommanderValidationBanner() {
  const { isS2Admin, isValidatedByCommander } = usePermissions();
  const navigate = useNavigate();

  if (!isS2Admin || isValidatedByCommander) return null;

  return (
    <button
      type="button"
      data-ocid="commander_validation.banner"
      onClick={() => void navigate({ to: "/validate-commander" })}
      className="flex w-full items-center justify-center gap-2 bg-amber px-4 py-2 text-center font-mono text-xs font-semibold uppercase tracking-widest text-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      style={{ backgroundColor: "#f59e0b" }}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      S2 Admin validation required. Click here to validate.
    </button>
  );
}

```

---

## FILE: src/components/layout/TopNav.tsx

```tsx
import type { Message, Notification } from "@/backend.d";
import { RankSelector } from "@/components/shared/RankSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { NETWORK_MODE_CONFIGS } from "@/config/constants";
import { BRANCH_RANK_CATEGORIES } from "@/config/constants";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useStorageClient } from "@/hooks/useStorageClient";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { formatRelativeTime } from "@/lib/formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ExternalLink,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  PenSquare,
  Settings,
  Shield,
  Unlock,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Infer branch and category from a rank string by scanning BRANCH_RANK_CATEGORIES */
function inferBranchCategory(rank: string): {
  branch: string;
  category: string;
} {
  if (!rank) return { branch: "", category: "" };
  for (const [branch, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [category, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) {
        return { branch, category };
      }
    }
  }
  return { branch: "", category: "" };
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "clearance_changed":
      return <Shield className="h-4 w-4 shrink-0 text-slate-400" />;
    case "access_granted":
      return <Unlock className="h-4 w-4 shrink-0 text-green-400" />;
    case "access_revoked":
      return <Lock className="h-4 w-4 shrink-0 text-red-400" />;
    case "anomaly_detected":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />;
    case "message_received":
      return <Mail className="h-4 w-4 shrink-0 text-blue-400" />;
    default:
      return <Bell className="h-4 w-4 shrink-0 text-slate-400" />;
  }
}

// ─── Profile Sheet ────────────────────────────────────────────────────────────

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { profile, refreshProfile } = usePermissions();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [rankVal, setRankVal] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [orgRole, setOrgRole] = useState(profile?.orgRole ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when profile changes or sheet opens
  useEffect(() => {
    if (open && profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rankStr = profile.rank ?? "";
      setRankVal(rankStr);
      // Infer branch and category from rank so the selector pre-populates correctly
      const inferred = inferBranchCategory(rankStr);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setEmail(profile.email);
      setOrgRole(profile.orgRole);
      setAvatarUrl(profile.avatarUrl ?? "");
    }
  }, [open, profile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storageClient || !storageReady) {
      toast.error("Storage not ready. Please try again.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      setAvatarUrl(url);
      toast.success("Avatar uploaded");
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!actor || !profile) return;
    setIsSaving(true);
    try {
      const effectiveRank = rankVal.trim() || profile.rank;
      const formattedName = formatDisplayName(
        effectiveRank,
        lastName,
        firstName,
        mi,
      );
      await actor.updateMyProfile({
        ...profile,
        name: formattedName,
        rank: effectiveRank,
        email: email.trim(),
        orgRole: orgRole.trim(),
        avatarUrl: avatarUrl || undefined,
      });
      await refreshProfile();
      toast.success("Profile updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = profile?.name ? getInitials(profile.name) : "??";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="topnav.profile.modal"
        className="flex w-[380px] flex-col border-l p-0 sm:max-w-[380px]"
        style={{ backgroundColor: "#0a0e1a", borderColor: "#1a2235" }}
      >
        <SheetHeader
          className="border-b px-6 py-4"
          style={{ borderColor: "#1a2235" }}
        >
          <SheetTitle className="font-mono text-sm uppercase tracking-[0.2em] text-white">
            Profile
          </SheetTitle>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Non-sensitive fields only
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-5 px-6 py-5">
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar
                className="h-16 w-16 border-2"
                style={{ borderColor: "rgba(245,158,11,0.3)" }}
              >
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={profile?.name ?? ""} />
                ) : null}
                <AvatarFallback
                  className="font-mono text-lg font-bold"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleAvatarUpload(e)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="topnav.profile.avatar.upload_button"
                className="h-7 gap-1.5 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || !storageReady}
              >
                <Upload className="h-3 w-3" />
                {isUploadingAvatar ? "Uploading…" : "Upload Photo"}
              </Button>
              <button
                type="button"
                data-ocid="topnav.profile.view_full.link"
                className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/my-profile" });
                }}
              >
                <ExternalLink className="h-3 w-3" />
                View Full Profile
              </button>
            </div>

            {/* Clearance level (read-only) */}
            <div
              className="rounded border px-3 py-2"
              style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                Clearance Level
              </p>
              <p className="mt-0.5 font-mono text-xs text-amber-500">
                {profile?.clearanceLevel !== undefined
                  ? `Level ${Number(profile.clearanceLevel)}`
                  : "—"}{" "}
                <span className="text-slate-600">(managed by S2 admin)</span>
              </p>
            </div>

            {/* Split name inputs */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Name
              </p>
              <div className="grid grid-cols-[1fr_1fr_52px] gap-2">
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Last Name
                  </Label>
                  <Input
                    data-ocid="topnav.profile.name.last.input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                    placeholder="SMITH"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    First Name
                  </Label>
                  <Input
                    data-ocid="topnav.profile.name.first.input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    MI
                  </Label>
                  <Input
                    data-ocid="topnav.profile.name.mi.input"
                    value={mi}
                    onChange={(e) => setMi(e.target.value.slice(0, 1))}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                    placeholder="A"
                    maxLength={1}
                  />
                </div>
              </div>
            </div>

            {/* Rank selector */}
            <RankSelector
              branch={branch}
              category={category}
              rank={rankVal}
              onBranchChange={setBranch}
              onCategoryChange={setCategory}
              onRankChange={setRankVal}
              variant="modal"
            />

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Email
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>

            {/* Org Role */}
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Organizational Role
              </Label>
              <Input
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter
          className="flex gap-2 border-t px-6 py-4"
          style={{ borderColor: "#1a2235" }}
        >
          <Button
            type="button"
            variant="outline"
            data-ocid="topnav.profile.cancel_button"
            className="flex-1 border font-mono text-xs uppercase tracking-wider text-slate-400"
            style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="topnav.profile.save_button"
            className="flex-1 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

export function TopNav() {
  const { profile, isS2Admin } = usePermissions();
  const { mode: networkMode } = useNetworkMode();
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const currentPath = router.state.location.pathname;

  // Returns true if the current path starts with or exactly matches the given route
  function isActivePath(to: string): boolean {
    if (to === "/") return currentPath === "/";
    return currentPath === to || currentPath.startsWith(`${to}/`);
  }

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  const handleSignOut = () => {
    // Clear all react-query cache so stale data doesn't bleed into next session
    queryClient.clear();
    // Call clear() to trigger authClient.logout() (clears IndexedDB delegation).
    // Immediately hard-navigate to /login — a full page reload re-creates all
    // React state and the AuthClient from scratch, avoiding the race condition
    // where clear() sets authClient→undefined, re-triggers the init useEffect,
    // briefly sets loginStatus back to "initializing", and leaves the Sign In
    // button disabled on the re-rendered login page.
    clear();
    window.location.href = "/login";
  };

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: [principalStr, "unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return 0;
      try {
        const count = await actor.getUnreadNotificationCount();
        return Number(count);
      } catch {
        return 0;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 30_000,
  });

  // Notifications for the dropdown — fetched on demand via refetch
  const {
    data: notifications = [],
    isFetching: notifsFetching,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: [principalStr, "topnav-notifications-preview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const items = await actor.getMyNotifications();
        return items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      } catch {
        return [];
      }
    },
    enabled: false, // only fetch on dropdown open
    staleTime: 0,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
      void refetchNotifications();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "topnav-notifications-preview"],
      });
      // Immediately refetch while dropdown is open (Step B fix)
      void refetchNotifications();
    },
  });

  // Inbox messages for the dropdown — fetched on demand via refetch
  const { data: recentInboxMessages = [], refetch: refetchInbox } = useQuery<
    Message[]
  >({
    queryKey: [principalStr, "topnav-inbox-preview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const msgs = await actor.getInboxMessages();
        return msgs
          .filter((m) => !m.deleted)
          .sort((a, b) => (a.sentAt > b.sentAt ? -1 : 1))
          .slice(0, 5);
      } catch {
        return [];
      }
    },
    enabled: false, // only fetch on dropdown open
    staleTime: 0,
  });

  // Count unread inbox messages
  const unreadMsgCount = recentInboxMessages.filter((m) => !m.read).length;

  const initials = profile?.name ? getInitials(profile.name) : "OP";
  // profile.name is already formatted as "RANK LAST, First MI" — use it directly
  const displayName = profile?.name?.trim() || "OPERATOR";

  const navLinks = [
    { label: "Documents", to: "/documents", ocid: "topnav.documents.link" },
    { label: "Messaging", to: "/messages", ocid: "topnav.messages.link" },
    {
      label: "File Storage",
      to: "/file-storage",
      ocid: "topnav.file_storage.link",
    },
    {
      label: "Personnel Directory",
      to: "/personnel",
      ocid: "topnav.personnel.link",
    },
    {
      label: "Email Directory",
      to: "/email-directory",
      ocid: "topnav.email_directory.link",
    },
    ...(isS2Admin
      ? [
          {
            label: "Access Monitoring",
            to: "/monitoring",
            ocid: "topnav.monitoring.link",
          },
        ]
      : []),
  ] as const;

  const secondaryNavLinks = [
    {
      label: "Notifications",
      to: "/notifications",
      ocid: "topnav.notifications.link",
    },
    { label: "Audit Log", to: "/audit-log", ocid: "topnav.audit_log.link" },
    {
      label: "Announcements",
      to: "/announcements",
      ocid: "topnav.announcements.link",
    },
    { label: "Calendar", to: "/calendar", ocid: "topnav.calendar.link" },
    { label: "Tasks", to: "/tasks", ocid: "topnav.tasks.link" },
    { label: "Settings", to: "/settings", ocid: "topnav.settings.link" },
    { label: "Governance", to: "/governance", ocid: "topnav.governance.link" },
    { label: "Help", to: "/help", ocid: "topnav.help.link" },
  ] as const;

  return (
    <>
      <ProfileSheet
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
      />

      <header
        className="sticky top-0 z-50 flex h-14 w-full items-center justify-between px-4"
        style={{
          backgroundColor: "#0a0e1a",
          borderBottom: "1px solid #1a2235",
        }}
      >
        {/* Left — OMNIS wordmark + Hub dropdown */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            data-ocid="topnav.link"
            className="flex flex-col shrink-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span
              className="font-mono text-lg font-bold uppercase tracking-[0.25em] leading-none"
              style={{ color: "#f59e0b" }}
            >
              OMNIS
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-widest text-slate-500 leading-none mt-0.5 sm:block">
              Sovereign OS
            </span>
          </Link>

          {/* Network mode badge — shown when mode is configured */}
          {networkMode && (
            <span
              className="rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest"
              style={{
                borderColor: networkMode.startsWith("military")
                  ? "rgba(59,130,246,0.4)"
                  : "rgba(139,92,246,0.4)",
                color: networkMode.startsWith("military")
                  ? "#60a5fa"
                  : "#a78bfa",
                backgroundColor: networkMode.startsWith("military")
                  ? "rgba(59,130,246,0.08)"
                  : "rgba(139,92,246,0.08)",
              }}
            >
              {NETWORK_MODE_CONFIGS[networkMode]?.shortCode ?? ""}
            </span>
          )}

          {/* Hub dropdown — immediately right of logo */}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-ocid="topnav.hub_dropdown.toggle"
              className="flex items-center gap-1 rounded px-3 py-1.5 font-mono text-sm font-semibold uppercase tracking-widest text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[200px] border font-mono"
              style={{
                backgroundColor: "#0f1626",
                borderColor: "#1a2235",
              }}
            >
              {navLinks.map((link) => {
                const active = isActivePath(link.to);
                return (
                  <DropdownMenuItem
                    key={link.to}
                    data-ocid={link.ocid}
                    className="cursor-pointer font-mono text-xs uppercase tracking-widest hover:text-white focus:text-white"
                    style={{ color: active ? "#f59e0b" : "#cbd5e1" }}
                    onClick={() => void navigate({ to: link.to })}
                  >
                    {active && (
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                  </DropdownMenuItem>
                );
              })}
              {isS2Admin && (
                <DropdownMenuItem
                  data-ocid="topnav.hub_dropdown.admin_panel.link"
                  className="cursor-pointer font-mono text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 focus:text-amber-300"
                  onClick={() => void navigate({ to: "/admin" })}
                >
                  <Settings className="mr-2 h-3 w-3" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator style={{ backgroundColor: "#1a2235" }} />
              {secondaryNavLinks.map((link) => {
                const active = isActivePath(link.to);
                return (
                  <DropdownMenuItem
                    key={link.to}
                    data-ocid={link.ocid}
                    className="cursor-pointer font-mono text-[10px] uppercase tracking-widest hover:text-slate-300 focus:text-slate-300"
                    style={{ color: active ? "#f59e0b" : "#64748b" }}
                    onClick={() => void navigate({ to: link.to })}
                  >
                    {active && (
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right — Actions + user */}
        <div className="flex items-center gap-1">
          {/* Ctrl+K command palette hint */}
          <button
            type="button"
            data-ocid="topnav.command_palette_open"
            aria-label="Open command palette (Ctrl+K)"
            className="hidden items-center gap-1 rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex"
            style={{ borderColor: "#1a2235", backgroundColor: "transparent" }}
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                  bubbles: true,
                }),
              );
            }}
          >
            <span>⌘K</span>
          </button>

          {/* Messages dropdown */}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) void refetchInbox();
            }}
          >
            <DropdownMenuTrigger
              data-ocid="topnav.messages_dropdown.toggle"
              className="relative flex h-9 w-9 items-center justify-center rounded text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Messages"
            >
              <MessageSquare className="h-[18px] w-[18px]" />
              {unreadMsgCount > 0 && (
                <Badge
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[9px] font-bold"
                  style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                >
                  {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
                </Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[320px] border p-0 font-mono"
              style={{
                backgroundColor: "#0f1626",
                borderColor: "#1a2235",
              }}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between border-b px-3 py-2"
                style={{ borderColor: "#1a2235" }}
              >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Messages
                </span>
                <button
                  type="button"
                  data-ocid="topnav.messages_dropdown.compose_button"
                  className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() =>
                    void navigate({
                      to: "/messages",
                      search: { compose: "true" },
                    })
                  }
                >
                  <PenSquare className="h-3 w-3" />
                  Compose
                </button>
              </div>

              {/* Message list */}
              {recentInboxMessages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <MessageSquare className="h-6 w-6 text-slate-700" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    No messages
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="py-1">
                    {recentInboxMessages.map((msg, idx) => {
                      const isUnread = !msg.read;
                      const truncatedSubject =
                        msg.subject.length > 40
                          ? `${msg.subject.slice(0, 40)}…`
                          : msg.subject;

                      return (
                        <DropdownMenuItem
                          key={msg.id}
                          data-ocid={`topnav.messages_dropdown.item.${idx + 1}`}
                          className="flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2.5 focus:bg-white/5"
                          style={{
                            backgroundColor: isUnread
                              ? "rgba(245,158,11,0.04)"
                              : undefined,
                          }}
                          onClick={() => void navigate({ to: "/messages" })}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              {isUnread && (
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: "#f59e0b" }}
                                />
                              )}
                              <span
                                className={
                                  isUnread
                                    ? "truncate font-mono text-[10px] font-bold uppercase tracking-wider text-white"
                                    : "truncate font-mono text-[10px] uppercase tracking-wider text-slate-400"
                                }
                              >
                                {truncatedSubject}
                              </span>
                            </div>
                            <span className="shrink-0 font-mono text-[9px] text-slate-600">
                              {formatRelativeTime(msg.sentAt)}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {/* Footer */}
              <div className="border-t" style={{ borderColor: "#1a2235" }}>
                <DropdownMenuItem
                  data-ocid="topnav.messages_dropdown.view_all.link"
                  className="cursor-pointer justify-center py-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 hover:text-amber-400 focus:text-amber-400"
                  onClick={() => void navigate({ to: "/messages" })}
                >
                  View all messages
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification bell dropdown */}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) void refetchNotifications();
            }}
          >
            <DropdownMenuTrigger
              data-ocid="notifications.bell_button"
              className="relative flex h-9 w-9 items-center justify-center rounded text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <Badge
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[9px] font-bold"
                  style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-ocid="notifications.dropdown_menu"
              align="end"
              className="w-[340px] border p-0 font-mono"
              style={{
                backgroundColor: "#0f1626",
                borderColor: "#1a2235",
              }}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between border-b px-3 py-2"
                style={{ borderColor: "#1a2235" }}
              >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Notifications
                </span>
                <button
                  type="button"
                  data-ocid="notifications.mark_all_button"
                  className="font-mono text-[10px] uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
                  onClick={() => void markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending || unreadCount === 0}
                >
                  Mark all as read
                </button>
              </div>

              {/* Notification list */}
              {notifsFetching ? (
                <div
                  data-ocid="notifications.loading_state"
                  className="space-y-px py-1"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                      <Skeleton
                        className="h-4 w-4 shrink-0 rounded"
                        style={{ backgroundColor: "#1a2235" }}
                      />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton
                          className="h-2.5 w-3/4 rounded"
                          style={{ backgroundColor: "#1a2235" }}
                        />
                        <Skeleton
                          className="h-2 w-full rounded"
                          style={{ backgroundColor: "#1a2235" }}
                        />
                      </div>
                      <Skeleton
                        className="h-2 w-10 shrink-0 rounded"
                        style={{ backgroundColor: "#1a2235" }}
                      />
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div
                  data-ocid="notifications.empty_state"
                  className="flex flex-col items-center gap-2 py-8 text-center"
                >
                  <Bell className="h-6 w-6 text-slate-700" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                    No notifications
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[360px]">
                  <div className="py-1">
                    {notifications.map((notif, idx) => {
                      const isUnread = !notif.read;
                      const isAnomaly =
                        notif.notificationType === "anomaly_detected";

                      return (
                        <DropdownMenuItem
                          key={notif.id}
                          data-ocid={`notifications.item.${idx + 1}`}
                          className="flex cursor-pointer items-start gap-3 px-3 py-2.5 focus:bg-white/5"
                          style={{
                            backgroundColor: isUnread
                              ? "rgba(245,158,11,0.05)"
                              : undefined,
                            borderLeft: isAnomaly
                              ? "2px solid #f59e0b"
                              : "2px solid transparent",
                            opacity: notif.read ? 0.6 : 1,
                            transition: "opacity 0.2s ease",
                          }}
                          onClick={() => {
                            if (isUnread) {
                              void markReadMutation.mutate(notif.id);
                            }
                          }}
                        >
                          {/* Type icon */}
                          <div className="mt-0.5 shrink-0">
                            {getNotificationIcon(notif.notificationType)}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate font-mono text-[10px] uppercase tracking-wider ${
                                isUnread
                                  ? "font-bold text-white"
                                  : "font-medium text-slate-400"
                              }`}
                            >
                              {notif.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-500">
                              {notif.body}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <span className="mt-0.5 shrink-0 font-mono text-[9px] text-slate-600">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User avatar + dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-ocid="topnav.user_dropdown.toggle"
              className="ml-1 flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Avatar
                className="h-7 w-7 border"
                style={{ borderColor: "#1a2235" }}
              >
                {profile?.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                ) : null}
                <AvatarFallback
                  className="font-mono text-[10px] font-bold"
                  style={{ backgroundColor: "#1a2235", color: "#f59e0b" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate font-mono text-[10px] uppercase tracking-wider text-slate-400 sm:block">
                {displayName}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[160px] border font-mono"
              style={{
                backgroundColor: "#0f1626",
                borderColor: "#1a2235",
              }}
            >
              <DropdownMenuItem
                data-ocid="topnav.profile.open_modal_button"
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white"
                onClick={() => setProfileSheetOpen(true)}
              >
                <User className="mr-2 h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="topnav.my_profile.link"
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-slate-300 hover:text-white focus:text-white"
                onClick={() => void navigate({ to: "/my-profile" })}
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                My Profile
              </DropdownMenuItem>
              {isS2Admin && (
                <DropdownMenuItem
                  data-ocid="topnav.admin_panel.link"
                  className="cursor-pointer font-mono text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 focus:text-amber-300"
                  onClick={() => void navigate({ to: "/admin" })}
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator style={{ backgroundColor: "#1a2235" }} />
              <DropdownMenuItem
                data-ocid="topnav.signout.button"
                className="cursor-pointer font-mono text-xs uppercase tracking-widest text-red-400 hover:text-red-300 focus:text-red-300"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}

```

---

## FILE: src/pages/AccessMonitoringPage.tsx

```tsx
import type { AnomalyEvent, ExtendedProfile, Folder } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_SCAN_MESSAGES,
  DEMO_ANOMALY_EVENTS,
  DEMO_FOLDERS,
  DEMO_PROFILES,
  DEMO_THREAT_SCORES,
  type ThreatScore,
} from "@/config/aiDemoData";
import { SEVERITY_COLORS } from "@/config/constants";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Layers,
  Loader2,
  MessageSquare,
  Radio,
  Shield,
  ShieldAlert,
  ShieldOff,
  SkipForward,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(ts: bigint): string {
  const diffMs = Date.now() - Number(ts);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  if (s.length <= 12) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string } | undefined,
  demoMode: boolean,
  demoName?: string,
): string {
  if (demoMode && demoName) return demoName;
  if (!principal) return "—";
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString(),
  );
  return match
    ? `${match.rank ? `${match.rank} ` : ""}${match.name}`.trim()
    : truncatePrincipal(principal);
}

function getFolderName(
  folders: Folder[],
  folderId: string | undefined,
  demoMode: boolean,
): string {
  if (!folderId) return "—";
  if (demoMode) {
    const demo = DEMO_FOLDERS.find((f) => f.id === folderId);
    if (demo) return demo.name;
  }
  return folders.find((f) => f.id === folderId)?.name ?? folderId;
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: "rgba(34,197,94,0.1)",
    text: "#22c55e",
    border: "rgba(34,197,94,0.3)",
  },
  medium: {
    bg: "rgba(234,179,8,0.1)",
    text: "#eab308",
    border: "rgba(234,179,8,0.3)",
  },
  high: {
    bg: "rgba(249,115,22,0.1)",
    text: "#f97316",
    border: "rgba(249,115,22,0.3)",
  },
  critical: {
    bg: "rgba(239,68,68,0.1)",
    text: "#ef4444",
    border: "rgba(239,68,68,0.3)",
  },
};

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const style = SEVERITY_STYLE[s] ?? SEVERITY_STYLE.low;
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {severity}
    </span>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge({ isSystemGenerated }: { isSystemGenerated: boolean }) {
  return isSystemGenerated ? (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: "rgba(245,158,11,0.1)",
        color: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.3)",
      }}
    >
      <Bot className="h-2.5 w-2.5" />
      AI System
    </span>
  ) : (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
      style={{
        backgroundColor: "rgba(100,116,139,0.1)",
        color: "#94a3b8",
        border: "1px solid rgba(100,116,139,0.3)",
      }}
    >
      Manual
    </span>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isLoading: boolean;
  highlight?: boolean;
}

function StatCard({ icon, value, label, isLoading, highlight }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded border p-4 transition-colors"
      style={{
        backgroundColor: highlight ? "rgba(239,68,68,0.08)" : "#1a2235",
        borderColor: highlight ? "rgba(239,68,68,0.4)" : "#243048",
      }}
    >
      <div className="flex items-center justify-between">
        <div className={highlight ? "text-red-400" : "text-amber-500"}>
          {icon}
        </div>
        {isLoading ? (
          <SkeletonCard height="32px" width="60px" className="rounded" />
        ) : (
          <span
            className={`font-mono text-2xl font-bold ${highlight ? "text-red-400" : "text-white"}`}
          >
            {value}
          </span>
        )}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => `sk-row-${i}`).map((rowKey) => (
        <TableRow
          key={rowKey}
          style={{ borderColor: "#1e2d45" }}
          className="hover:bg-transparent"
        >
          {[
            { key: "c0", w: "120px" },
            { key: "c1", w: "80px" },
            { key: "c2", w: "80px" },
            { key: "c3", w: "80px" },
            { key: "c4", w: "80px" },
            { key: "c5", w: "100px" },
            { key: "c6", w: "80px" },
            { key: "c7", w: "60px" },
          ].map(({ key: colKey, w }) => (
            <TableCell key={colKey} className="py-3">
              <SkeletonCard height="14px" className="rounded" width={w} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── AI Live Scan Panel ───────────────────────────────────────────────────────

function AIScanPanel() {
  const [currentMsgIdx, setCurrentMsgIdx] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setCurrentMsgIdx((prev) => {
        const next = (prev + 1) % AI_SCAN_MESSAGES.length;
        const msg = AI_SCAN_MESSAGES[next];
        setScanLog((log) => {
          const ts = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });
          const newLog = [...log, `[${ts}] ${msg}`];
          // Keep last 40 lines
          return newLog.slice(-40);
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Auto-scroll to bottom — scanLog dep is intentional to trigger on each new line
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scanLog]);

  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#070d1a", borderColor: "#1e2d45" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "#1e2d45" }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-4 w-4 text-amber-400" />
            {isScanning && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-bold">
            AI Smart System
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest rounded px-1.5 py-0.5"
            style={{
              color: isScanning ? "#22c55e" : "#94a3b8",
              backgroundColor: isScanning
                ? "rgba(34,197,94,0.1)"
                : "rgba(100,116,139,0.1)",
              border: `1px solid ${isScanning ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.3)"}`,
            }}
          >
            {isScanning ? "● ACTIVE SCAN" : "○ PAUSED"}
          </span>
        </div>
        <button
          type="button"
          data-ocid="monitoring.ai_scan.toggle_button"
          onClick={() => setIsScanning((v) => !v)}
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          style={{ border: "1px solid #2a3347" }}
        >
          {isScanning ? (
            <>
              <SkipForward className="h-3 w-3" />
              Pause
            </>
          ) : (
            <>
              <Radio className="h-3 w-3" />
              Resume
            </>
          )}
        </button>
      </div>

      {/* Current scan status */}
      <div
        className="border-b px-4 py-2"
        style={{ borderColor: "#1e2d45", backgroundColor: "#0a111f" }}
      >
        <div className="flex items-center gap-2">
          {isScanning ? (
            <Loader2 className="h-3 w-3 animate-spin text-amber-400 shrink-0" />
          ) : (
            <Activity className="h-3 w-3 text-slate-500 shrink-0" />
          )}
          <p className="font-mono text-[11px] text-amber-300/80 truncate">
            {AI_SCAN_MESSAGES[currentMsgIdx]}
          </p>
        </div>
      </div>

      {/* Scroll log */}
      <div className="h-40 overflow-y-auto px-4 py-3 space-y-0.5 font-mono text-[10px]">
        {scanLog.length === 0 ? (
          <p className="text-slate-600 italic">Awaiting scan output…</p>
        ) : (
          scanLog.map((line, i) => {
            const isThreat =
              line.toLowerCase().includes("flagging") ||
              line.toLowerCase().includes("threat") ||
              line.toLowerCase().includes("escalating") ||
              line.toLowerCase().includes("detected") ||
              line.toLowerCase().includes("anomalous");
            return (
              <p
                key={`log-${i}-${line.slice(0, 10)}`}
                className={isThreat ? "text-amber-400/90" : "text-slate-500"}
              >
                {line}
              </p>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

// ─── Threat Intelligence Cards ────────────────────────────────────────────────

function ThreatLevelBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "#ef4444"
      : score >= 60
        ? "#f97316"
        : score >= 40
          ? "#eab308"
          : "#22c55e";
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ThreatIntelPanel({ scores }: { scores: ThreatScore[] }) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0d1525", borderColor: "#1e2d45" }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: "#1e2d45" }}
      >
        <Zap className="h-4 w-4 text-amber-400" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-amber-400 font-bold">
          Threat Intelligence
        </span>
        <span className="font-mono text-[10px] text-slate-500 ml-1">
          — Per-user risk scores
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: "#1e2d45" }}>
        {scores.map((s) => (
          <div key={s.name} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-white">
                  {s.name}
                </span>
                <span className="ml-2 font-mono text-[10px] text-slate-500 uppercase">
                  {s.rank}
                </span>
              </div>
              <SeverityBadge severity={s.level} />
            </div>
            <ThreatLevelBar score={s.score} />
            <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
              {s.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Demo Mode Banner ─────────────────────────────────────────────────────────

interface DemoBannerProps {
  onExit: () => void;
}

function DemoBanner({ onExit }: DemoBannerProps) {
  return (
    <div
      data-ocid="monitoring.demo_banner"
      className="flex items-center justify-between gap-3 rounded border px-4 py-3"
      style={{
        backgroundColor: "rgba(139,92,246,0.08)",
        borderColor: "rgba(139,92,246,0.4)",
      }}
    >
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-violet-400 shrink-0" />
        <p className="font-mono text-[11px] uppercase tracking-wider text-violet-300">
          <span className="font-bold text-violet-200">DEMO MODE — </span>
          Showing simulated AI threat data. This is a preview of what the AI
          Smart System surfaces to the S2 admin.
        </p>
      </div>
      <button
        type="button"
        data-ocid="monitoring.demo.exit_button"
        onClick={onExit}
        className="shrink-0 rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-violet-300 hover:text-white transition-colors"
        style={{ border: "1px solid rgba(139,92,246,0.4)" }}
      >
        Exit Demo
      </button>
    </div>
  );
}

// ─── Anomaly Table ────────────────────────────────────────────────────────────

const AUDIT_EVENT_TYPES = [
  "profile_update",
  "permission_change",
  "clearance_change",
  "privilege_escalation",
];

interface AnomalyTableProps {
  events: AnomalyEvent[];
  profiles: ExtendedProfile[];
  folders: Folder[];
  isLoading: boolean;
  onResolve: (event: AnomalyEvent) => void;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  emptyOcid: string;
  rowOcidPrefix: string;
  resolveOcidPrefix: string;
  demoMode?: boolean;
}

function AnomalyTable({
  events,
  profiles,
  folders,
  isLoading,
  onResolve,
  emptyIcon,
  emptyMessage,
  emptyOcid,
  rowOcidPrefix,
  resolveOcidPrefix,
  demoMode = false,
}: AnomalyTableProps) {
  return (
    <div
      className="overflow-x-auto rounded border"
      style={{ borderColor: "#1e2d45" }}
    >
      <Table>
        <TableHeader>
          <TableRow
            style={{ borderColor: "#1e2d45", backgroundColor: "#0d1525" }}
          >
            {[
              "Event Type",
              "Severity",
              "Source",
              "Affected User",
              "Affected Folder",
              "Timestamp",
              "Status",
              "Action",
            ].map((h) => (
              <TableHead
                key={h}
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows count={6} />
          ) : events.length === 0 ? (
            <TableRow style={{ borderColor: "#1e2d45" }}>
              <TableCell colSpan={8}>
                <div data-ocid={emptyOcid}>
                  <EmptyState
                    icon={emptyIcon}
                    message={emptyMessage}
                    className="py-12"
                  />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            events.map((event, idx) => {
              const isCritical = event.severity.toLowerCase() === "critical";
              const isHighlighted =
                (event.severity.toLowerCase() === "high" ||
                  event.severity.toLowerCase() === "critical") &&
                event.isSystemGenerated;

              // Demo-mode names
              const demoProfileName =
                demoMode && event.id === "demo-breach-001"
                  ? "David Morton (CIV)"
                  : (demoMode && event.id.startsWith("demo-freq")) ||
                      event.id.startsWith("demo-download") ||
                      event.id.startsWith("demo-message")
                    ? "SGT Maria Reyes"
                    : demoMode &&
                        (event.id.startsWith("demo-audit") ||
                          event.id.startsWith("demo-perm"))
                      ? "CPT James Harris"
                      : undefined;

              return (
                <TableRow
                  key={event.id}
                  data-ocid={`${rowOcidPrefix}.${idx + 1}`}
                  style={{
                    borderColor: "#1e2d45",
                    borderLeftWidth: isHighlighted ? "4px" : undefined,
                    borderLeftColor: isCritical
                      ? "#ef4444"
                      : isHighlighted
                        ? "#f59e0b"
                        : undefined,
                    borderLeftStyle: isHighlighted ? "solid" : undefined,
                    backgroundColor: isCritical
                      ? "rgba(239,68,68,0.04)"
                      : undefined,
                  }}
                  className="transition-colors hover:bg-[#131c2e]"
                >
                  <TableCell className="font-mono text-xs text-slate-300 whitespace-nowrap max-w-[180px] truncate">
                    {event.eventType}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={event.severity} />
                  </TableCell>
                  <TableCell>
                    <SourceBadge isSystemGenerated={event.isSystemGenerated} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                    {getProfileName(
                      profiles,
                      event.affectedUserId,
                      demoMode,
                      demoProfileName,
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap max-w-[160px] truncate">
                    {getFolderName(folders, event.affectedFolderId, demoMode)}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {timeAgo(event.detectedAt)}
                  </TableCell>
                  <TableCell>
                    {event.resolved ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                        <XCircle className="h-3 w-3" />
                        Open
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!event.resolved && (
                      <button
                        type="button"
                        data-ocid={`${resolveOcidPrefix}.${idx + 1}`}
                        onClick={() => onResolve(event)}
                        className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 border border-amber-500/30"
                      >
                        Resolve
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Log Anomaly Modal ────────────────────────────────────────────────────────

interface LogAnomalyModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profiles: ExtendedProfile[];
  folders: Folder[];
  onCreated: (event: AnomalyEvent) => void;
}

function LogAnomalyModal({
  open,
  onOpenChange,
  profiles,
  folders,
  onCreated,
}: LogAnomalyModalProps) {
  const { actor } = useActor();

  const [eventType, setEventType] = useState("");
  const [affectedUserId, setAffectedUserId] = useState("none");
  const [affectedFolderId, setAffectedFolderId] = useState("none");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);

  const [eventTypeError, setEventTypeError] = useState("");
  const [severityError, setSeverityError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  function resetForm() {
    setEventType("");
    setAffectedUserId("none");
    setAffectedFolderId("none");
    setSeverity("");
    setDescription("");
    setEventTypeError("");
    setSeverityError("");
    setDescriptionError("");
  }

  function validate(): boolean {
    let valid = true;
    if (!eventType.trim()) {
      setEventTypeError("Event type is required.");
      valid = false;
    } else {
      setEventTypeError("");
    }
    if (!severity) {
      setSeverityError("Severity is required.");
      valid = false;
    } else {
      setSeverityError("");
    }
    if (!description.trim() || description.trim().length < 10) {
      setDescriptionError("Description must be at least 10 characters.");
      valid = false;
    } else {
      setDescriptionError("");
    }
    return valid;
  }

  async function handleSubmit() {
    if (!actor || !validate()) return;
    setIsPending(true);
    try {
      const userPrincipal =
        affectedUserId !== "none"
          ? profiles.find((p) => p.principalId.toString() === affectedUserId)
              ?.principalId
          : undefined;

      const newEvent: AnomalyEvent = {
        id: crypto.randomUUID(),
        detectedAt: BigInt(Date.now()),
        eventType: eventType.trim(),
        affectedUserId: userPrincipal,
        affectedFolderId:
          affectedFolderId !== "none" ? affectedFolderId : undefined,
        severity,
        description: description.trim(),
        resolved: false,
        isSystemGenerated: false,
        resolvedBy: undefined,
      };

      await actor.createAnomalyEvent(newEvent);
      toast.success("Anomaly event logged");
      onCreated(newEvent);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Failed to log anomaly event");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent
        data-ocid="monitoring.log_anomaly.modal"
        className="border sm:max-w-lg"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Log Anomaly Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Event Type */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Event Type <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="monitoring.log_anomaly.event_type.input"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                if (e.target.value.trim()) setEventTypeError("");
              }}
              placeholder="e.g. unauthorized_access, data_exfil"
              className="border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
            <FormError message={eventTypeError} />
          </div>

          {/* Affected User */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Affected User
            </Label>
            <Select value={affectedUserId} onValueChange={setAffectedUserId}>
              <SelectTrigger
                data-ocid="monitoring.log_anomaly.affected_user.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <SelectItem
                  value="none"
                  className="font-mono text-xs text-slate-300 focus:text-white"
                >
                  None
                </SelectItem>
                {profiles.map((p) => (
                  <SelectItem
                    key={p.principalId.toString()}
                    value={p.principalId.toString()}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {p.rank ? `${p.rank} ` : ""}
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Affected Folder */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Affected Folder
            </Label>
            <Select
              value={affectedFolderId}
              onValueChange={setAffectedFolderId}
            >
              <SelectTrigger
                data-ocid="monitoring.log_anomaly.affected_folder.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <SelectItem
                  value="none"
                  className="font-mono text-xs text-slate-300 focus:text-white"
                >
                  None
                </SelectItem>
                {folders.map((f) => (
                  <SelectItem
                    key={f.id}
                    value={f.id}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Severity <span className="text-red-400">*</span>
            </Label>
            <Select
              value={severity}
              onValueChange={(v) => {
                setSeverity(v);
                if (v) setSeverityError("");
              }}
            >
              <SelectTrigger
                data-ocid="monitoring.log_anomaly.severity.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {Object.keys(SEVERITY_COLORS).map((sev) => (
                  <SelectItem
                    key={sev}
                    value={sev}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={severityError} />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              data-ocid="monitoring.log_anomaly.description.textarea"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim().length >= 10) setDescriptionError("");
              }}
              placeholder="Describe the anomaly event (min 10 characters)..."
              className="border font-mono text-xs text-white placeholder:text-slate-600 resize-none"
              rows={3}
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
            <FormError message={descriptionError} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="monitoring.log_anomaly.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-300"
            style={{ borderColor: "#2a3347" }}
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="monitoring.log_anomaly.submit_button"
            className="gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Logging…
              </>
            ) : (
              "Log Anomaly"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────

interface EventDetailModalProps {
  event: AnomalyEvent | null;
  onClose: () => void;
  demoMode: boolean;
  profiles: ExtendedProfile[];
  folders: Folder[];
}

function EventDetailModal({
  event,
  onClose,
  demoMode,
  profiles,
  folders,
}: EventDetailModalProps) {
  if (!event) return null;
  return (
    <Dialog
      open={!!event}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="monitoring.event_detail.modal"
        className="border sm:max-w-xl"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Event Detail
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={event.severity} />
            <SourceBadge isSystemGenerated={event.isSystemGenerated} />
            {event.resolved ? (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-green-500">
                <CheckCircle2 className="h-3 w-3" /> Resolved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                <XCircle className="h-3 w-3" /> Open
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Event Type
              </p>
              <p className="text-white">{event.eventType}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Detected
              </p>
              <p className="text-white">{timeAgo(event.detectedAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Affected User
              </p>
              <p className="text-white">
                {getProfileName(profiles, event.affectedUserId, demoMode)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider mb-0.5">
                Affected Folder
              </p>
              <p className="text-white truncate">
                {getFolderName(folders, event.affectedFolderId, demoMode)}
              </p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
              AI Analysis
            </p>
            <div
              className="rounded p-3"
              style={{
                backgroundColor: "#0a111f",
                border: "1px solid #1e2d45",
              }}
            >
              <p className="font-mono text-xs text-slate-300 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="monitoring.event_detail.close_button"
            className="font-mono text-xs uppercase tracking-wider text-slate-300 border"
            style={{ borderColor: "#2a3347" }}
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccessMonitoringPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  // ── Demo mode ─────────────────────────────────────────────────────────────
  const [demoMode, setDemoMode] = useState(false);

  // ── Principal for query key scoping ───────────────────────────────────────
  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: [principalStr, "platform-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<
    ExtendedProfile[]
  >({
    queryKey: [principalStr, "monitoring-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: [principalStr, "monitoring-folders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFolders();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: rawEvents = [], isLoading: eventsLoading } = useQuery<
    AnomalyEvent[]
  >({
    queryKey: [principalStr, "anomaly-events"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnomalyEvents();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Local state ───────────────────────────────────────────────────────────
  const [events, setEvents] = useState<AnomalyEvent[]>([]);
  const [hasInitializedEvents, setHasInitializedEvents] = useState(false);

  // Sync fetched events into local state once
  useEffect(() => {
    if (!hasInitializedEvents && !eventsLoading) {
      setHasInitializedEvents(true);
      setEvents(rawEvents);
    }
  }, [hasInitializedEvents, eventsLoading, rawEvents]);

  const [activeMonitoringTab, setActiveMonitoringTab] =
    useState("anomaly-events");
  const [userFilter, setUserFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  // Reset filters when tab changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeMonitoringTab is the only relevant trigger; setters are stable
  useEffect(() => {
    setUserFilter("all");
    setFolderFilter("all");
  }, [activeMonitoringTab]);

  const [resolveTarget, setResolveTarget] = useState<AnomalyEvent | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState<AnomalyEvent | null>(null);

  // ── Displayed events (demo vs. live) ─────────────────────────────────────
  const displayedEvents = useMemo(
    () => (demoMode ? DEMO_ANOMALY_EVENTS : events),
    [demoMode, events],
  );

  // ── Filtered events ───────────────────────────────────────────────────────
  const filteredAnomalyEvents = useMemo(() => {
    if (userFilter === "all") return displayedEvents;
    return displayedEvents.filter(
      (e) => e.affectedUserId?.toString() === userFilter,
    );
  }, [displayedEvents, userFilter]);

  const auditEvents = useMemo(() => {
    return displayedEvents.filter((e) =>
      AUDIT_EVENT_TYPES.some((t) => e.eventType.toLowerCase().includes(t)),
    );
  }, [displayedEvents]);

  const folderActivityEvents = useMemo(() => {
    if (folderFilter === "all")
      return displayedEvents.filter((e) => e.affectedFolderId);
    return displayedEvents.filter((e) => e.affectedFolderId === folderFilter);
  }, [displayedEvents, folderFilter]);

  // ── Summary count ─────────────────────────────────────────────────────────
  const selectedUserName = useMemo(() => {
    if (userFilter === "all") return null;
    const p = profiles.find((p) => p.principalId.toString() === userFilter);
    return p ? `${p.rank ? `${p.rank} ` : ""}${p.name}`.trim() : userFilter;
  }, [userFilter, profiles]);

  const userEventCount = useMemo(() => {
    if (userFilter === "all") return 0;
    return displayedEvents.filter(
      (e) => e.affectedUserId?.toString() === userFilter,
    ).length;
  }, [displayedEvents, userFilter]);

  // ── Demo stats override ───────────────────────────────────────────────────
  const demoStats = {
    totalUsers: BigInt(3),
    totalSections: BigInt(2),
    totalFolders: BigInt(4),
    totalDocuments: BigInt(27),
    unresolvedAnomalies: BigInt(
      DEMO_ANOMALY_EVENTS.filter((e) => !e.resolved).length,
    ),
    totalMessages: BigInt(14),
  };

  const activeStats = demoMode ? demoStats : statsData;

  // ── Resolve handler ───────────────────────────────────────────────────────
  async function handleConfirmResolve() {
    if (demoMode) {
      toast.success("Demo: anomaly marked resolved (no backend call)");
      setResolveOpen(false);
      setResolveTarget(null);
      return;
    }
    if (!actor || !resolveTarget) return;
    setIsResolving(true);
    try {
      const caller = identity?.getPrincipal();
      if (!caller) throw new Error("No identity");
      await actor.resolveAnomalyEvent(resolveTarget.id, caller);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === resolveTarget.id
            ? { ...e, resolved: true, resolvedBy: caller }
            : e,
        ),
      );
      toast.success("Anomaly marked as resolved");
    } catch {
      toast.error("Failed to resolve anomaly");
    } finally {
      setIsResolving(false);
      setResolveOpen(false);
      setResolveTarget(null);
    }
  }

  function handleResolve(event: AnomalyEvent) {
    setResolveTarget(event);
    setResolveOpen(true);
  }

  function handleEventCreated(event: AnomalyEvent) {
    setEvents((prev) => [event, ...prev]);
  }

  // ── Stat values ───────────────────────────────────────────────────────────
  const unresolvedCount = activeStats
    ? Number(activeStats.unresolvedAnomalies)
    : 0;

  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Total Users",
      value: activeStats ? String(activeStats.totalUsers) : "—",
      highlight: false,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Total Sections",
      value: activeStats ? String(activeStats.totalSections) : "—",
      highlight: false,
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: "Total Folders",
      value: activeStats ? String(activeStats.totalFolders) : "—",
      highlight: false,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Total Documents",
      value: activeStats ? String(activeStats.totalDocuments) : "—",
      highlight: false,
    },
    {
      icon: <ShieldAlert className="h-5 w-5" />,
      label: "Unresolved Anomalies",
      value: activeStats ? String(activeStats.unresolvedAnomalies) : "—",
      highlight: unresolvedCount > 3,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Total Messages",
      value: activeStats ? String(activeStats.totalMessages) : "—",
      highlight: false,
    },
  ];

  const isDataLoading =
    !demoMode && (profilesLoading || foldersLoading || eventsLoading);

  // ── Folder options for filter ─────────────────────────────────────────────
  const folderOptions = demoMode ? DEMO_FOLDERS : folders;
  const profileOptions = demoMode
    ? DEMO_PROFILES.map((p) => ({
        principalId: { toString: () => p.principalId } as any,
        name: p.name,
        rank: p.rank,
        orgRole: p.orgRole,
        clearanceLevel: BigInt(p.clearanceLevel),
        isS2Admin: false,
        isValidatedByCommander: true,
        email: "",
        registered: true,
      }))
    : profiles;

  return (
    <div
      data-ocid="monitoring.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Access Monitoring
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-start justify-between gap-4 border-b pb-4"
            style={{ borderColor: "#1a2235" }}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-amber-500" />
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Access Monitoring
                </h1>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  S2 Intelligence — Restricted Access
                </p>
              </div>
            </div>

            {/* Demo toggle */}
            <button
              type="button"
              data-ocid="monitoring.demo.toggle_button"
              onClick={() => setDemoMode((v) => !v)}
              className="flex items-center gap-2 rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: demoMode
                  ? "rgba(139,92,246,0.12)"
                  : "rgba(245,158,11,0.08)",
                border: `1px solid ${demoMode ? "rgba(139,92,246,0.4)" : "rgba(245,158,11,0.3)"}`,
                color: demoMode ? "#a78bfa" : "#f59e0b",
              }}
            >
              <Bot className="h-3.5 w-3.5" />
              {demoMode ? "Demo Mode — ON" : "Preview AI Demo"}
            </button>
          </div>

          {/* ── Demo Banner ──────────────────────────────────────────────── */}
          {demoMode && <DemoBanner onExit={() => setDemoMode(false)} />}

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <section
            data-ocid="monitoring.stat_cards.section"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {stats.map((s) => (
              <StatCard
                key={s.label}
                icon={s.icon}
                value={s.value}
                label={s.label}
                isLoading={!demoMode && statsLoading}
                highlight={s.highlight}
              />
            ))}
          </section>

          {/* ── AI + Threat Intel Row ────────────────────────────────────── */}
          {demoMode && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AIScanPanel />
              <ThreatIntelPanel scores={DEMO_THREAT_SCORES} />
            </div>
          )}

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <Tabs
            value={activeMonitoringTab}
            onValueChange={setActiveMonitoringTab}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList
                className="border"
                style={{ backgroundColor: "#0d1525", borderColor: "#1e2d45" }}
              >
                <TabsTrigger
                  value="anomaly-events"
                  data-ocid="monitoring.anomaly_events.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                >
                  Anomaly Events
                  {demoMode && (
                    <span className="ml-1.5 rounded-full bg-red-500/20 px-1.5 py-0.5 font-mono text-[9px] text-red-400">
                      {DEMO_ANOMALY_EVENTS.filter((e) => !e.resolved).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="audit-trail"
                  data-ocid="monitoring.audit_trail.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                >
                  Audit Trail
                </TabsTrigger>
                <TabsTrigger
                  value="folder-activity"
                  data-ocid="monitoring.folder_activity.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                >
                  Folder Activity
                </TabsTrigger>
              </TabsList>

              <Button
                type="button"
                data-ocid="monitoring.log_anomaly.open_modal_button"
                onClick={() => setLogModalOpen(true)}
                className="gap-2 font-mono text-xs uppercase tracking-wider"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Log Anomaly
              </Button>
            </div>

            {/* ── Anomaly Events Tab ───────────────────────────────────── */}
            <TabsContent value="anomaly-events" className="space-y-4 mt-0">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger
                    data-ocid="monitoring.user_filter.select"
                    className="w-56 border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                  >
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "#0f1626",
                      borderColor: "#1a2235",
                    }}
                  >
                    <SelectItem
                      value="all"
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      All Users
                    </SelectItem>
                    {profileOptions.map((p) => (
                      <SelectItem
                        key={p.principalId.toString()}
                        value={p.principalId.toString()}
                        className="font-mono text-xs text-slate-300 focus:text-white"
                      >
                        {p.rank ? `${p.rank} ` : ""}
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUserName && (
                  <p className="font-mono text-[11px] text-slate-400">
                    <span className="text-amber-400">{selectedUserName}</span>
                    {" has "}
                    <span className="text-white font-bold">
                      {userEventCount}
                    </span>
                    {" anomal"}
                    {userEventCount !== 1 ? "ies" : "y"}
                    {" logged"}
                  </p>
                )}
              </div>

              {isDataLoading ? (
                <div data-ocid="monitoring.anomaly.loading_state">
                  <div
                    className="overflow-x-auto rounded border"
                    style={{ borderColor: "#1e2d45" }}
                  >
                    <Table>
                      <TableBody>
                        <SkeletonRows count={6} />
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <AnomalyTable
                  events={filteredAnomalyEvents}
                  profiles={profiles}
                  folders={folders}
                  isLoading={false}
                  onResolve={handleResolve}
                  emptyIcon={<Shield />}
                  emptyMessage="No anomalies detected"
                  emptyOcid="monitoring.anomaly.empty_state"
                  rowOcidPrefix="monitoring.anomaly.row"
                  resolveOcidPrefix="monitoring.anomaly.resolve_button"
                  demoMode={demoMode}
                />
              )}

              {/* Detail view note */}
              {filteredAnomalyEvents.length > 0 && (
                <p className="font-mono text-[10px] text-slate-600 text-center">
                  Click any row to view full AI analysis
                </p>
              )}
            </TabsContent>

            {/* ── Audit Trail Tab ──────────────────────────────────────── */}
            <TabsContent value="audit-trail" className="space-y-4 mt-0">
              <div
                className="flex items-start gap-2 rounded border px-4 py-3"
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.3)",
                }}
              >
                <Shield className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                  Access to this audit trail is restricted to verified S2
                  administrators. Delegation requires commander authorization.
                </p>
              </div>

              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Audit Trail — Privilege &amp; Permission Changes
              </p>

              <AnomalyTable
                events={auditEvents}
                profiles={profiles}
                folders={folders}
                isLoading={isDataLoading}
                onResolve={handleResolve}
                emptyIcon={<ClipboardList />}
                emptyMessage="No audit events recorded"
                emptyOcid="monitoring.audit.empty_state"
                rowOcidPrefix="monitoring.audit.row"
                resolveOcidPrefix="monitoring.audit.resolve_button"
                demoMode={demoMode}
              />
            </TabsContent>

            {/* ── Folder Activity Tab ──────────────────────────────────── */}
            <TabsContent value="folder-activity" className="space-y-4 mt-0">
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger
                  data-ocid="monitoring.folder_filter.select"
                  className="w-64 border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  <SelectItem
                    value="all"
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    All Folders
                  </SelectItem>
                  {folderOptions.map((f) => (
                    <SelectItem
                      key={f.id}
                      value={f.id}
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AnomalyTable
                events={folderActivityEvents}
                profiles={profiles}
                folders={folders}
                isLoading={isDataLoading}
                onResolve={handleResolve}
                emptyIcon={<FolderOpen />}
                emptyMessage="No folder activity recorded"
                emptyOcid="monitoring.folder_activity.empty_state"
                rowOcidPrefix="monitoring.folder.row"
                resolveOcidPrefix="monitoring.folder.resolve_button"
                demoMode={demoMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ── Resolve ConfirmDialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={resolveOpen}
        onOpenChange={setResolveOpen}
        title="Mark Anomaly Resolved"
        description="This anomaly will be marked as resolved. This action cannot be undone."
        confirmLabel={isResolving ? "Resolving…" : "Resolve"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmResolve}
        onCancel={() => {
          setResolveOpen(false);
          setResolveTarget(null);
        }}
      />

      {/* ── Log Anomaly Modal ────────────────────────────────────────────── */}
      <LogAnomalyModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        profiles={profiles}
        folders={folders}
        onCreated={handleEventCreated}
      />

      {/* ── Event Detail Modal ───────────────────────────────────────────── */}
      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        demoMode={demoMode}
        profiles={profiles}
        folders={folders}
      />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/AdminPage.tsx

```tsx
/**
 * AdminPage — S2-only admin panel.
 * Four tabs: Pending Queue | User Management | Role Assignments | Chain of Trust
 */
import type { ExtendedProfile } from "@/backend.d";
import { UserRole } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ChainOfTrustPanel } from "@/components/shared/ChainOfTrustPanel";
import { RankSelector } from "@/components/shared/RankSelector";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BRANCH_RANK_CATEGORIES, CLEARANCE_LABELS } from "@/config/constants";

/** Infer branch and category from a rank string by scanning BRANCH_RANK_CATEGORIES */
function inferBranchCategory(rank: string): {
  branch: string;
  category: string;
} {
  if (!rank) return { branch: "", category: "" };
  for (const [b, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [cat, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) return { branch: b, category: cat };
    }
  }
  return { branch: "", category: "" };
}
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Approve/Deny dialog ──────────────────────────────────────────────────────

interface DenyDialogProps {
  open: boolean;
  profile: ExtendedProfile | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

function DenyDialog({
  open,
  profile,
  onConfirm,
  onCancel,
  isPending,
}: DenyDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent
        data-ocid="admin.deny.dialog"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        className="border font-mono"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Deny Access Request
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="font-mono text-xs text-slate-400">
            Denying access for:{" "}
            <span className="text-white">{profile?.name || "Unknown"}</span>
          </p>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Reason (required)
            </Label>
            <Textarea
              data-ocid="admin.deny.reason.textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for denial..."
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.deny.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-400"
            style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="admin.deny.confirm_button"
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#ef4444", color: "#fff" }}
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? "Denying…" : "Confirm Deny"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit profile dialog ──────────────────────────────────────────────────────

interface EditProfileDialogProps {
  open: boolean;
  profile: ExtendedProfile | null;
  onSave: (updates: Partial<ExtendedProfile>) => void;
  onCancel: () => void;
  isPending: boolean;
}

function EditProfileDialog({
  open,
  profile,
  onSave,
  onCancel,
  isPending,
}: EditProfileDialogProps) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [rankVal, setRankVal] = useState("");
  const [orgRole, setOrgRole] = useState("");
  const [clearanceLevel, setClearanceLevel] = useState("0");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (open && profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rank = profile.rank ?? "";
      setRankVal(rank);
      const inferred = inferBranchCategory(rank);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setOrgRole(profile.orgRole ?? "");
      setClearanceLevel(String(Number(profile.clearanceLevel ?? 0)));
      setIsVerified(profile.isValidatedByCommander ?? false);
    }
  }, [open, profile]);

  function handleSave() {
    const effectiveRank = rankVal.trim() || (profile?.rank ?? "");
    const name = formatDisplayName(effectiveRank, lastName, firstName, mi);
    onSave({
      name,
      rank: effectiveRank,
      orgRole: orgRole.trim(),
      clearanceLevel: BigInt(Number(clearanceLevel)),
      isValidatedByCommander: isVerified,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent
        data-ocid="admin.edit_profile.dialog"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        className="max-h-[90vh] overflow-y-auto border font-mono"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Last
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                First
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                MI
              </Label>
              <Input
                value={mi}
                onChange={(e) => setMi(e.target.value.slice(0, 1))}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                maxLength={1}
              />
            </div>
          </div>

          <RankSelector
            branch={branch}
            category={category}
            rank={rankVal}
            onBranchChange={setBranch}
            onCategoryChange={setCategory}
            onRankChange={setRankVal}
            variant="modal"
          />

          {/* Org Role */}
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Organizational Role
            </Label>
            <Input
              value={orgRole}
              onChange={(e) => setOrgRole(e.target.value)}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
          </div>

          {/* Clearance Level */}
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Clearance Level
            </Label>
            <Select value={clearanceLevel} onValueChange={setClearanceLevel}>
              <SelectTrigger
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => (
                  <SelectItem
                    key={lvl}
                    value={lvl}
                    className="font-mono text-xs"
                  >
                    Level {lvl} — {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Verified toggle */}
          <div className="flex items-center gap-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              S2 Verified
            </Label>
            <button
              type="button"
              data-ocid="admin.edit_profile.verified.toggle"
              onClick={() => setIsVerified((v) => !v)}
              className="flex h-5 w-9 items-center rounded-full transition-colors"
              style={{
                backgroundColor: isVerified ? "#f59e0b" : "#1a2235",
                border: "1px solid #2a3347",
              }}
            >
              <span
                className="h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{
                  transform: isVerified
                    ? "translateX(18px)"
                    : "translateX(2px)",
                }}
              />
            </button>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.edit_profile.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-400"
            style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="admin.edit_profile.save_button"
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isS2Admin, isLoading: permLoading } = usePermissions();
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // S2 guard
  useEffect(() => {
    if (!permLoading && !isS2Admin) {
      void navigate({ to: "/" });
    }
  }, [isS2Admin, permLoading, navigate]);

  const [searchRaw, setSearchRaw] = useState("");
  const searchQuery = useDeferredValue(searchRaw);
  const [denyTarget, setDenyTarget] = useState<ExtendedProfile | null>(null);
  const [editTarget, setEditTarget] = useState<ExtendedProfile | null>(null);

  // Chain of Trust — role transition state
  const [promoteTarget, setPromoteTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [handoffTarget, setHandoffTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [showHandoffStubDialog, setShowHandoffStubDialog] = useState(false);

  // ── All profiles ──
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useQuery<ExtendedProfile[]>({
    queryKey: [principalStr, "admin-all-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllProfiles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isS2Admin,
    staleTime: 0,
  });

  const pendingProfiles = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin,
  );
  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.orgRole.toLowerCase().includes(q)
    );
  });

  // ── Mutations ──
  const approveMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor) return;
      await actor.validateS2Admin(profile.principalId);
    },
    onSuccess: () => {
      toast.success("User approved");
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to approve user"),
  });

  const denyMutation = useMutation({
    mutationFn: async ({
      profile,
      reason,
    }: { profile: ExtendedProfile; reason: string }) => {
      if (!actor) return;
      // Backend doesn't yet have denyUser; log anomaly event as audit trail
      await actor.createAnomalyEvent({
        id: crypto.randomUUID(),
        resolved: false,
        detectedAt: BigInt(Date.now()),
        description: `Access denied for ${profile.name}: ${reason}`,
        isSystemGenerated: false,
        severity: "low",
        eventType: "access_denied",
        affectedUserId: profile.principalId,
        affectedFolderId: undefined,
        resolvedBy: undefined,
      });
    },
    onSuccess: () => {
      toast.success("Access denied and logged");
      setDenyTarget(null);
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to deny access"),
  });

  const editMutation = useMutation({
    mutationFn: async ({
      profile,
      updates,
    }: { profile: ExtendedProfile; updates: Partial<ExtendedProfile> }) => {
      if (!actor) return;
      await actor.updateUserProfile({ ...profile, ...updates });
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditTarget(null);
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const roleMutation = useMutation({
    mutationFn: async ({
      profile,
      role,
    }: { profile: ExtendedProfile; role: UserRole }) => {
      if (!actor) return;
      await actor.assignCallerUserRole(profile.principalId, role);
    },
    onSuccess: () => {
      toast.success("Role updated");
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to update role"),
  });

  const promoteMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor) return;
      await actor.assignCallerUserRole(profile.principalId, UserRole.admin);
      await actor.updateUserProfile({
        ...profile,
        isS2Admin: true,
        clearanceLevel: 4n,
      });
    },
    onSuccess: () => {
      toast.success("S2 Admin role granted");
      setShowPromoteDialog(false);
      setPromoteTarget(null);
      void refetchProfiles();
    },
    onError: () => toast.error("Failed to grant S2 Admin role"),
  });

  const handoffMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor || !identity) return;
      // Log the handoff request as an anomaly event for audit trail
      await actor.createAnomalyEvent({
        id: crypto.randomUUID(),
        resolved: false,
        detectedAt: BigInt(Date.now()),
        description: `Commander handoff initiated to ${profile.name}. Requires co-sign from current S2. (Frontend-initiated — full enforcement pending backend update.)`,
        isSystemGenerated: false,
        severity: "medium",
        eventType: "role_transition",
        affectedUserId: profile.principalId,
        affectedFolderId: undefined,
        resolvedBy: undefined,
      });
    },
    onSuccess: () => {
      toast.success("Commander handoff logged", {
        description: "Requires S2 co-sign. Full enforcement in future update.",
      });
      setShowHandoffStubDialog(false);
      setHandoffTarget(null);
    },
    onError: () => toast.error("Failed to log handoff request"),
  });

  if (permLoading) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isS2Admin) return null;

  return (
    <div
      data-ocid="admin.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Admin Panel
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Admin Panel
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                S2 Security Administration — Restricted Access
              </p>
            </div>
          </div>

          <Tabs defaultValue="pending">
            <TabsList
              className="mb-6 border"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <TabsTrigger
                data-ocid="admin.pending.tab"
                value="pending"
                className="relative font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Pending Queue
                {pendingProfiles.length > 0 && (
                  <span
                    className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  >
                    {pendingProfiles.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.users.tab"
                value="users"
                className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                User Management
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.roles.tab"
                value="roles"
                className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Role Assignments
              </TabsTrigger>
              <TabsTrigger
                data-ocid="admin.trust.tab"
                value="trust"
                className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:text-amber-400"
              >
                Chain of Trust
              </TabsTrigger>
            </TabsList>

            {/* ── Pending Queue ────────────────────────────────────────── */}
            <TabsContent value="pending">
              {profilesLoading ? (
                <div
                  data-ocid="admin.pending.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  ))}
                </div>
              ) : pendingProfiles.length === 0 ? (
                <div
                  data-ocid="admin.pending.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <UserCheck className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No pending users
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded border"
                  style={{ borderColor: "#1a2235" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525",
                        }}
                      >
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Name
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Rank
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Email
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProfiles.map((p, idx) => (
                        <TableRow
                          key={p.principalId.toString()}
                          data-ocid={`admin.pending.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {p.name || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.rank || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.email || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                data-ocid={`admin.approve_button.${idx + 1}`}
                                className="h-7 gap-1 font-mono text-[10px] uppercase tracking-wider"
                                style={{
                                  backgroundColor: "#16a34a",
                                  color: "#fff",
                                }}
                                onClick={() => void approveMutation.mutate(p)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                data-ocid={`admin.deny_button.${idx + 1}`}
                                className="h-7 gap-1 border font-mono text-[10px] uppercase tracking-wider text-red-400"
                                style={{
                                  backgroundColor: "transparent",
                                  borderColor: "rgba(239,68,68,0.3)",
                                }}
                                onClick={() => setDenyTarget(p)}
                                disabled={denyMutation.isPending}
                              >
                                <XCircle className="h-3 w-3" />
                                Deny
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── User Management ──────────────────────────────────────── */}
            <TabsContent value="users">
              <div
                className="mb-4 flex items-center gap-2 rounded border px-3 py-2"
                style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
              >
                <Search className="h-4 w-4 shrink-0 text-slate-600" />
                <Input
                  data-ocid="admin.search.input"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  placeholder="Search by name, rank, email..."
                  className="border-0 bg-transparent font-mono text-xs text-white placeholder:text-slate-600 focus-visible:ring-0"
                />
              </div>

              {profilesLoading ? (
                <div
                  data-ocid="admin.users.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  ))}
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div
                  data-ocid="admin.users.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <Users className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No users found
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded border"
                  style={{ borderColor: "#1a2235" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525",
                        }}
                      >
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Name
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Rank
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Clearance
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((p, idx) => (
                        <TableRow
                          key={p.principalId.toString()}
                          data-ocid={`admin.users.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {p.name || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.rank || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-amber-500">
                            L{Number(p.clearanceLevel)}{" "}
                            {CLEARANCE_LABELS[Number(p.clearanceLevel)]
                              ? `— ${CLEARANCE_LABELS[Number(p.clearanceLevel)]}`
                              : ""}
                          </TableCell>
                          <TableCell>
                            {p.isValidatedByCommander ? (
                              <span className="font-mono text-[10px] text-green-400">
                                Verified
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-slate-600">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`admin.users.edit_button.${idx + 1}`}
                              className="h-7 border font-mono text-[10px] uppercase tracking-wider text-slate-400"
                              style={{
                                backgroundColor: "transparent",
                                borderColor: "#2a3347",
                              }}
                              onClick={() => setEditTarget(p)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── Chain of Trust ───────────────────────────────────────── */}
            <TabsContent value="trust">
              <div className="space-y-6">
                {/* Status panel */}
                <ChainOfTrustPanel />

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: "#1a2235" }}
                />

                {/* Role Transition section */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck
                      className="h-4 w-4"
                      style={{ color: "#f59e0b" }}
                    />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                      Role Transitions
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Promote to S2 Admin */}
                    <div
                      className="rounded border p-4 space-y-3"
                      style={{
                        backgroundColor: "#0d1525",
                        borderColor: "#1a2235",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <UserPlus
                          className="h-4 w-4"
                          style={{ color: "#f59e0b" }}
                        />
                        <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
                          Promote to S2 Admin
                        </h4>
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                        Grant S2 Admin rights to a verified user. Requires
                        commander approval (frontend-enforced).
                      </p>

                      <Select
                        value={promoteTarget?.principalId?.toString() ?? ""}
                        onValueChange={(val) => {
                          const p = profiles.find(
                            (x) => x.principalId.toString() === val,
                          );
                          setPromoteTarget(p ?? null);
                        }}
                      >
                        <SelectTrigger
                          data-ocid="admin.trust.promote.select"
                          className="border font-mono text-xs text-white"
                          style={{
                            backgroundColor: "#1a2235",
                            borderColor: "#2a3347",
                          }}
                        >
                          <SelectValue placeholder="Select user…" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: "#0f1626",
                            borderColor: "#1a2235",
                          }}
                        >
                          {profiles
                            .filter(
                              (p) => p.isValidatedByCommander && !p.isS2Admin,
                            )
                            .map((p) => (
                              <SelectItem
                                key={p.principalId.toString()}
                                value={p.principalId.toString()}
                                className="font-mono text-xs"
                              >
                                {p.name || p.rank || "Unknown"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        size="sm"
                        data-ocid="admin.trust.promote.primary_button"
                        disabled={!promoteTarget || promoteMutation.isPending}
                        onClick={() => setShowPromoteDialog(true)}
                        className="w-full font-mono text-[10px] uppercase tracking-wider"
                        style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                      >
                        Promote to S2 Admin
                      </Button>
                    </div>

                    {/* Commander Handoff */}
                    <div
                      className="rounded border p-4 space-y-3"
                      style={{
                        backgroundColor: "#0d1525",
                        borderColor: "#1a2235",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Shield
                          className="h-4 w-4"
                          style={{ color: "#60a5fa" }}
                        />
                        <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-400">
                          Commander Handoff
                        </h4>
                      </div>
                      <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                        Initiate transfer of the Commander role to a designated
                        successor. Requires S2 co-sign.
                      </p>

                      <Select
                        value={handoffTarget?.principalId?.toString() ?? ""}
                        onValueChange={(val) => {
                          const p = profiles.find(
                            (x) => x.principalId.toString() === val,
                          );
                          setHandoffTarget(p ?? null);
                        }}
                      >
                        <SelectTrigger
                          data-ocid="admin.trust.handoff.select"
                          className="border font-mono text-xs text-white"
                          style={{
                            backgroundColor: "#1a2235",
                            borderColor: "#2a3347",
                          }}
                        >
                          <SelectValue placeholder="Select successor…" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: "#0f1626",
                            borderColor: "#1a2235",
                          }}
                        >
                          {profiles
                            .filter((p) => p.isValidatedByCommander)
                            .map((p) => (
                              <SelectItem
                                key={p.principalId.toString()}
                                value={p.principalId.toString()}
                                className="font-mono text-xs"
                              >
                                {p.name || p.rank || "Unknown"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        size="sm"
                        data-ocid="admin.trust.handoff.secondary_button"
                        disabled={!handoffTarget}
                        onClick={() => setShowHandoffDialog(true)}
                        className="w-full border font-mono text-[10px] uppercase tracking-wider text-blue-400"
                        style={{
                          backgroundColor: "transparent",
                          borderColor: "rgba(96,165,250,0.3)",
                        }}
                      >
                        Initiate Handoff
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Role Assignments ─────────────────────────────────────── */}
            <TabsContent value="roles">
              {profilesLoading ? (
                <div
                  data-ocid="admin.roles.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-14 w-full rounded"
                      style={{ backgroundColor: "#1a2235" }}
                    />
                  ))}
                </div>
              ) : profiles.length === 0 ? (
                <div
                  data-ocid="admin.roles.empty_state"
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <AlertTriangle className="h-8 w-8 text-slate-700" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    No profiles found
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded border"
                  style={{ borderColor: "#1a2235" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          borderColor: "#1a2235",
                          backgroundColor: "#0d1525",
                        }}
                      >
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Name
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Rank
                        </TableHead>
                        <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Role
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((p, idx) => (
                        <TableRow
                          key={p.principalId.toString()}
                          data-ocid={`admin.roles.item.${idx + 1}`}
                          style={{ borderColor: "#1a2235" }}
                        >
                          <TableCell className="font-mono text-xs text-white">
                            {p.name || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {p.rank || "—"}
                          </TableCell>
                          <TableCell>
                            <Select
                              defaultValue={
                                p.isS2Admin ? UserRole.admin : UserRole.user
                              }
                              onValueChange={(val) =>
                                void roleMutation.mutate({
                                  profile: p,
                                  role: val as UserRole,
                                })
                              }
                            >
                              <SelectTrigger
                                data-ocid={`admin.roles.item.${idx + 1}.select`}
                                className="h-7 w-32 border font-mono text-[10px] uppercase tracking-wider text-white"
                                style={{
                                  backgroundColor: "#1a2235",
                                  borderColor: "#2a3347",
                                }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                style={{
                                  backgroundColor: "#0f1626",
                                  borderColor: "#1a2235",
                                }}
                              >
                                {Object.values(UserRole).map((role) => (
                                  <SelectItem
                                    key={role}
                                    value={role}
                                    className="font-mono text-xs uppercase"
                                  >
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Deny dialog */}
      <DenyDialog
        open={!!denyTarget}
        profile={denyTarget}
        onConfirm={(reason) => {
          if (denyTarget)
            void denyMutation.mutate({ profile: denyTarget, reason });
        }}
        onCancel={() => setDenyTarget(null)}
        isPending={denyMutation.isPending}
      />

      {/* Promote to S2 Admin confirmation dialog */}
      <Dialog
        open={showPromoteDialog}
        onOpenChange={(v) => {
          if (!v) setShowPromoteDialog(false);
        }}
      >
        <DialogContent
          data-ocid="admin.trust.promote.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Grant S2 Admin Rights
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs leading-relaxed text-slate-400">
            Are you sure you want to grant S2 Admin rights to{" "}
            <span className="font-semibold text-white">
              {promoteTarget?.name ?? "this user"}
            </span>
            ? This requires commander approval. All actions will be logged.
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.trust.promote.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowPromoteDialog(false)}
              disabled={promoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.trust.promote.confirm_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => {
                if (promoteTarget) void promoteMutation.mutate(promoteTarget);
              }}
              disabled={promoteMutation.isPending || !promoteTarget}
            >
              {promoteMutation.isPending ? "Granting…" : "Confirm Grant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commander Handoff — initial dialog */}
      <Dialog
        open={showHandoffDialog}
        onOpenChange={(v) => {
          if (!v) setShowHandoffDialog(false);
        }}
      >
        <DialogContent
          data-ocid="admin.trust.handoff.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Initiate Commander Handoff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div
              className="rounded border px-3 py-2"
              style={{
                backgroundColor: "rgba(96,165,250,0.06)",
                borderColor: "rgba(96,165,250,0.2)",
              }}
            >
              <p className="font-mono text-[10px] leading-relaxed text-blue-300/80">
                Commander handoff requires co-sign from the current S2. This
                feature will be fully enforced in a future backend update. The
                handoff request will be logged as an audit event.
              </p>
            </div>
            <p className="font-mono text-xs text-slate-400">
              Initiating handoff to:{" "}
              <span className="font-semibold text-white">
                {handoffTarget?.name ?? "selected user"}
              </span>
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.trust.handoff.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowHandoffDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.trust.handoff.confirm_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(96,165,250,0.15)",
                color: "#93c5fd",
                border: "1px solid rgba(96,165,250,0.3)",
              }}
              onClick={() => {
                setShowHandoffDialog(false);
                setShowHandoffStubDialog(true);
              }}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commander Handoff — stub confirmation */}
      <Dialog
        open={showHandoffStubDialog}
        onOpenChange={(v) => {
          if (!v) setShowHandoffStubDialog(false);
        }}
      >
        <DialogContent
          data-ocid="admin.trust.handoff_stub.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Confirm Handoff Request
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs leading-relaxed text-slate-400">
            This will log a Commander Handoff Request to the audit trail for{" "}
            <span className="font-semibold text-white">
              {handoffTarget?.name ?? "this user"}
            </span>
            . Full transfer requires backend enforcement (future update).
          </p>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.trust.handoff_stub.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => setShowHandoffStubDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.trust.handoff_stub.confirm_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => {
                if (handoffTarget) void handoffMutation.mutate(handoffTarget);
              }}
              disabled={handoffMutation.isPending}
            >
              {handoffMutation.isPending ? "Logging…" : "Log Handoff Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit profile dialog */}
      <EditProfileDialog
        open={!!editTarget}
        profile={editTarget}
        onSave={(updates) => {
          if (editTarget)
            void editMutation.mutate({ profile: editTarget, updates });
        }}
        onCancel={() => setEditTarget(null)}
        isPending={editMutation.isPending}
      />

      {/* Footer */}
      <footer
        className="border-t px-6 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-500"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/AnnouncementsPage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div
      data-ocid="announcements.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Announcements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <Megaphone className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Announcements
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Org-wide broadcast communications
              </p>
            </div>
          </div>

          {/* Coming soon card */}
          <div
            className="rounded border px-6 py-8"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <Megaphone className="h-10 w-10 text-slate-700" />
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Organization Announcements
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-500">
                  Org-wide broadcast announcements. Backend integration coming
                  in a future session.
                </p>
              </div>
              <div
                className="rounded border px-4 py-2"
                style={{
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.05)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                  Backend integration pending
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/AuditLogPage.tsx

```tsx
import type { AnomalyEvent, ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SEVERITY_COLORS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatRelativeTime } from "@/lib/formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, ShieldOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncatePrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}…${p.slice(-4)}`;
}

function resolveName(
  profiles: ExtendedProfile[],
  principalStr: string,
): string {
  const match = profiles.find((p) => p.principalId.toString() === principalStr);
  if (match)
    return (
      `${match.rank} ${match.name}`.trim() || truncatePrincipal(principalStr)
    );
  return truncatePrincipal(principalStr);
}

function getSeverityStyles(severity: string): {
  borderColor: string;
  color: string;
  backgroundColor: string;
} {
  const color = SEVERITY_COLORS[severity.toLowerCase()] ?? "gray";
  const map: Record<
    string,
    { borderColor: string; color: string; backgroundColor: string }
  > = {
    red: {
      borderColor: "rgba(248,113,113,0.4)",
      color: "#f87171",
      backgroundColor: "rgba(248,113,113,0.1)",
    },
    orange: {
      borderColor: "rgba(251,146,60,0.4)",
      color: "#fb923c",
      backgroundColor: "rgba(251,146,60,0.1)",
    },
    yellow: {
      borderColor: "rgba(250,204,21,0.4)",
      color: "#facc15",
      backgroundColor: "rgba(250,204,21,0.1)",
    },
    green: {
      borderColor: "rgba(74,222,128,0.4)",
      color: "#4ade80",
      backgroundColor: "rgba(74,222,128,0.1)",
    },
    gray: {
      borderColor: "rgba(148,163,184,0.2)",
      color: "#94a3b8",
      backgroundColor: "rgba(148,163,184,0.05)",
    },
  };
  return map[color] ?? map.gray;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AuditSkeleton() {
  return (
    <div
      data-ocid="audit.loading_state"
      className="divide-y"
      style={{ borderColor: "#1a2235" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <SkeletonCard height="18px" width="60px" />
          <SkeletonCard height="18px" width="80px" />
          <SkeletonCard className="flex-1 h-[18px]" />
          <SkeletonCard height="18px" width="80px" />
          <SkeletonCard height="18px" width="60px" />
          <SkeletonCard height="18px" width="70px" />
        </div>
      ))}
    </div>
  );
}

// ─── AuditLogPage ─────────────────────────────────────────────────────────────

type StatusFilter = "all" | "unresolved" | "resolved";

export default function AuditLogPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { isS2Admin, isLoading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [resolveTarget, setResolveTarget] = useState<AnomalyEvent | null>(null);

  // ── Fetch anomaly events ──────────────────────────────────────────────────
  const { data: events = [], isLoading: eventsLoading } = useQuery<
    AnomalyEvent[]
  >({
    queryKey: ["anomalyEvents", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getAnomalyEvents();
      return items.sort((a, b) => (a.detectedAt > b.detectedAt ? -1 : 1));
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });

  // ── Fetch all profiles for name resolution ────────────────────────────────
  const { data: profiles = [] } = useQuery<ExtendedProfile[]>({
    queryKey: ["allProfiles", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Resolve mutation ──────────────────────────────────────────────────────
  const resolveMutation = useMutation({
    mutationFn: async (event: AnomalyEvent) => {
      if (!actor || !identity) throw new Error("Not authenticated");
      await actor.resolveAnomalyEvent(event.id, identity.getPrincipal());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["anomalyEvents", principalStr],
      });
      setResolveTarget(null);
      toast.success("Anomaly event resolved");
    },
    onError: () => {
      toast.error("Failed to resolve event");
      setResolveTarget(null);
    },
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredEvents = events.filter((e) => {
    const severityMatch =
      severityFilter === "all" ||
      e.severity.toLowerCase() === severityFilter.toLowerCase();
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "resolved" ? e.resolved : !e.resolved);
    return severityMatch && statusMatch;
  });

  const isLoading = eventsLoading || permissionsLoading;

  return (
    <div
      data-ocid="audit.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Resolve confirm dialog */}
      <ConfirmDialog
        isOpen={!!resolveTarget}
        onOpenChange={(v) => {
          if (!v) setResolveTarget(null);
        }}
        title="Resolve Anomaly Event?"
        description="Mark this event as resolved. This action is logged and cannot be undone."
        confirmLabel={resolveMutation.isPending ? "Resolving…" : "Resolve"}
        cancelLabel="Cancel"
        onConfirm={() => {
          if (resolveTarget) void resolveMutation.mutate(resolveTarget);
        }}
        onCancel={() => setResolveTarget(null)}
      />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void navigate({ to: "/" })}
              className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
            </button>
            <ChevronRight className="h-3 w-3 text-slate-700" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              Audit Log
            </span>
          </div>

          {/* Page header */}
          <div className="mb-6 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <ClipboardList className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Audit Log
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Anomaly events and oversight trail
              </p>
            </div>
          </div>

          {/* Access restricted */}
          {!isLoading && !isS2Admin ? (
            <div data-ocid="audit.empty_state">
              <EmptyState
                icon={<ShieldOff />}
                message="Access restricted to S2 administrators"
                className="py-24"
              />
            </div>
          ) : (
            <>
              {/* Filter bar */}
              <div
                className="mb-4 flex flex-wrap items-center gap-3 rounded border px-4 py-3"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {/* Severity dropdown */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                    Severity
                  </span>
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}
                  >
                    <SelectTrigger
                      data-ocid="audit.severity.select"
                      className="h-7 w-32 border font-mono text-[10px] uppercase tracking-wider text-slate-300"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: "#0f1626",
                        borderColor: "#1a2235",
                      }}
                    >
                      {["all", "critical", "high", "medium", "low"].map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="font-mono text-[10px] uppercase tracking-wider text-slate-300"
                        >
                          {s === "all"
                            ? "All"
                            : s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status buttons */}
                <div className="flex items-center gap-1">
                  {(["all", "unresolved", "resolved"] as StatusFilter[]).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        data-ocid="audit.status.tab"
                        onClick={() => setStatusFilter(s)}
                        className="rounded px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={
                          statusFilter === s
                            ? {
                                backgroundColor: "rgba(245,158,11,0.15)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.3)",
                              }
                            : {
                                color: "#64748b",
                                border: "1px solid transparent",
                              }
                        }
                      >
                        {s === "all"
                          ? "All"
                          : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ),
                  )}
                </div>

                <div className="ml-auto font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {isLoading ? "Loading…" : `${filteredEvents.length} events`}
                </div>
              </div>

              {/* Table */}
              <div
                className="overflow-hidden rounded border"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {isLoading ? (
                  <AuditSkeleton />
                ) : filteredEvents.length === 0 ? (
                  <div data-ocid="audit.empty_state">
                    <EmptyState
                      icon={<ClipboardList />}
                      message="No events match the selected filters"
                      className="py-16"
                    />
                  </div>
                ) : (
                  <ScrollArea>
                    <Table data-ocid="audit.table">
                      <TableHeader>
                        <TableRow
                          className="border-b hover:bg-transparent"
                          style={{ borderColor: "#1a2235" }}
                        >
                          {[
                            "Severity",
                            "Type",
                            "Description",
                            "Affected User",
                            "Detected",
                            "Status",
                            "Action",
                          ].map((h) => (
                            <TableHead
                              key={h}
                              className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600"
                              style={{ backgroundColor: "#0d1525" }}
                            >
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event, idx) => {
                          const svStyles = getSeverityStyles(event.severity);
                          const affectedName = event.affectedUserId
                            ? resolveName(
                                profiles,
                                event.affectedUserId.toString(),
                              )
                            : "—";

                          return (
                            <TableRow
                              key={event.id}
                              data-ocid={`audit.row.${idx + 1}`}
                              className="border-b hover:bg-white/[0.02]"
                              style={{ borderColor: "#1a2235" }}
                            >
                              {/* Severity */}
                              <TableCell className="py-3">
                                <span
                                  className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                                  style={svStyles}
                                >
                                  {event.severity}
                                </span>
                              </TableCell>

                              {/* Type */}
                              <TableCell className="py-3">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                  {event.eventType}
                                </span>
                              </TableCell>

                              {/* Description */}
                              <TableCell className="max-w-[240px] py-3">
                                <span
                                  className="block truncate font-mono text-[10px] text-slate-300"
                                  title={event.description}
                                >
                                  {event.description}
                                </span>
                              </TableCell>

                              {/* Affected User */}
                              <TableCell className="py-3">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {affectedName}
                                </span>
                              </TableCell>

                              {/* Detected */}
                              <TableCell className="py-3">
                                <span className="font-mono text-[10px] text-slate-500">
                                  {formatRelativeTime(event.detectedAt)}
                                </span>
                              </TableCell>

                              {/* Status */}
                              <TableCell className="py-3">
                                {event.resolved ? (
                                  <Badge
                                    className="border font-mono text-[9px] uppercase tracking-wider"
                                    style={{
                                      backgroundColor: "rgba(74,222,128,0.1)",
                                      borderColor: "rgba(74,222,128,0.3)",
                                      color: "#4ade80",
                                    }}
                                  >
                                    Resolved
                                  </Badge>
                                ) : (
                                  <Badge
                                    className="border font-mono text-[9px] uppercase tracking-wider"
                                    style={{
                                      backgroundColor: "rgba(248,113,113,0.1)",
                                      borderColor: "rgba(248,113,113,0.3)",
                                      color: "#f87171",
                                    }}
                                  >
                                    Unresolved
                                  </Badge>
                                )}
                              </TableCell>

                              {/* Action */}
                              <TableCell className="py-3">
                                {isS2Admin && !event.resolved ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    data-ocid={`audit.resolve.button.${idx + 1}`}
                                    className="h-7 border px-2 font-mono text-[9px] uppercase tracking-wider text-amber-400 hover:text-amber-300"
                                    style={{
                                      borderColor: "rgba(245,158,11,0.3)",
                                      backgroundColor: "rgba(245,158,11,0.05)",
                                    }}
                                    onClick={() => setResolveTarget(event)}
                                  >
                                    Resolve
                                  </Button>
                                ) : (
                                  <span className="font-mono text-[9px] text-slate-700">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/CalendarPage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Users } from "lucide-react";

export default function CalendarPage() {
  return (
    <div
      data-ocid="calendar.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Calendar</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <Calendar className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Calendar
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Shared &amp; personal organization calendar
              </p>
            </div>
          </div>

          {/* Feature preview card */}
          <div
            className="mb-6 rounded border px-6 py-8"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <Calendar className="h-10 w-10 text-slate-700" />
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Shared &amp; Personal Calendar
                </p>
                <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-slate-400">
                  Outlook-style shared and personal calendars for your
                  organization — scheduling, events, and coordination. Backend
                  wiring is planned for a future session.
                </p>
              </div>
              <div
                className="rounded border px-4 py-2"
                style={{
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.05)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                  Backend integration planned
                </p>
              </div>
            </div>
          </div>

          {/* Planned features grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className="rounded border px-4 py-4"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Personal Calendar
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Private scheduling, reminders, and personal time management.
              </p>
            </div>
            <div
              className="rounded border px-4 py-4"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Shared Calendars
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Org-wide and section-level shared calendars for coordination.
              </p>
            </div>
            <div
              className="rounded border px-4 py-4"
              style={{ backgroundColor: "#0d1525", borderColor: "#1a2235" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Scheduling
                </span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Meeting scheduling, availability lookup, and event invitations.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/ClaimCommanderPage.tsx

```tsx
/**
 * ClaimCommanderPage — One-time Commander role claim.
 * Accessible to any authenticated user; guards against duplicate claims.
 *
 * MOTOKO BACKLOG (frontend-enforced only):
 * - Organization entity (orgId, name, UIC, type, mode, adminPrincipal, createdAt)
 * - Org uniqueness enforcement (one workspace per UIC)
 * - orgId scoping on ALL entities (Profile, Folder, Document, Message, Notification, etc.)
 * - Commander role constraint (only one per org, backend-enforced)
 * - Provisional S2 status with expiry (time-bound flag on ExtendedProfile)
 * - RoleApprovalRequest entity (commander handoff co-sign, S2 promotion approval)
 * - OrgAccessRequest entity (3-way confirm: user requests → approver accepts → user confirms)
 * - UIC squatting prevention (first-come ownership, challenge mechanism optional)
 */

import type { ExtendedProfile } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface WorkspaceData {
  name: string;
  uic: string;
  type: string;
  mode: string;
  createdAt: string;
}

export default function ClaimCommanderPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Check if commander seat is already occupied
    const occupied = localStorage.getItem("omnis_commander_claimed") === "true";
    setAlreadyClaimed(occupied);

    // Load workspace info
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw) as WorkspaceData);
      } catch {
        setWorkspace(null);
      }
    }
  }, []);

  const handleConfirmClaim = async () => {
    setIsClaiming(true);
    try {
      // Store claim in localStorage
      localStorage.setItem("omnis_commander_claimed", "true");

      // Send system notification to S2 admins
      if (actor && identity) {
        try {
          const allProfiles: ExtendedProfile[] = await actor.getAllProfiles();
          const s2Admins = allProfiles.filter((p) => p.isS2Admin);
          const unitName = workspace?.name ?? "this workspace";

          await Promise.all(
            s2Admins.map((admin) =>
              actor.createSystemNotification({
                id: crypto.randomUUID(),
                title: "Commander Role Claimed",
                body: `Commander role has been claimed for ${unitName}. Chain of Trust is now established.`,
                userId: admin.principalId,
                notificationType: "system",
                createdAt: BigInt(Date.now()),
                read: false,
                metadata: undefined,
              }),
            ),
          );
        } catch {
          // Non-blocking
        }
      }

      setClaimed(true);
      setShowConfirmDialog(false);

      // Auto-navigate after 2 seconds
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 2000);
    } catch {
      // Even if actor call fails, localStorage is set — claim succeeds
      setClaimed(true);
      setShowConfirmDialog(false);
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 2000);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back link */}
        <button
          type="button"
          data-ocid="claim_commander.back.button"
          onClick={() => void navigate({ to: "/" })}
          className="mb-6 flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-400"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Return to Hub
        </button>

        {/* Already claimed state */}
        {alreadyClaimed && (
          <div
            className="rounded-lg border p-8 text-center shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                borderColor: "rgba(245,158,11,0.4)",
              }}
            >
              <ShieldCheck className="h-7 w-7" style={{ color: "#f59e0b" }} />
            </div>
            <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
              Commander Seat Occupied
            </h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
              The Commander role for this workspace has already been claimed.
            </p>
            <button
              type="button"
              data-ocid="claim_commander.return.button"
              onClick={() => void navigate({ to: "/" })}
              className="mt-5 h-10 w-full rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
              style={{ borderColor: "#2a3347" }}
            >
              Return to Hub
            </button>
          </div>
        )}

        {/* Success state */}
        {!alreadyClaimed && claimed && (
          <div
            className="rounded-lg border p-8 text-center shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                backgroundColor: "rgba(34,197,94,0.1)",
                borderColor: "rgba(34,197,94,0.4)",
              }}
            >
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
              Commander Role Claimed
            </h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
              The Chain of Trust is now established. Redirecting to the hub…
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                Redirecting…
              </span>
            </div>
          </div>
        )}

        {/* Main claim UI */}
        {!alreadyClaimed && !claimed && (
          <div
            className="rounded-lg border p-6 shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {/* Header */}
            <div className="mb-5 flex flex-col items-center gap-3 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.4)",
                }}
              >
                <ShieldCheck className="h-7 w-7" style={{ color: "#f59e0b" }} />
              </div>
              <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                Claim Commander Role
              </h1>
            </div>

            {/* Warning box */}
            <div
              className="mb-4 rounded border px-4 py-3"
              style={{
                backgroundColor: "rgba(245,158,11,0.06)",
                borderColor: "rgba(245,158,11,0.25)",
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "#f59e0b" }}
                />
                <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                  This role can only be claimed once. Ensure you are the
                  designated commander or authorized officer before proceeding.
                </p>
              </div>
            </div>

            {/* Workspace display */}
            {workspace && (
              <div
                className="mb-4 rounded border px-4 py-3"
                style={{ backgroundColor: "#0a0e1a", borderColor: "#1e2d40" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Workspace
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold uppercase tracking-wider text-white">
                  {workspace.name}
                </p>
                {workspace.uic && (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                    UIC: {workspace.uic} · {workspace.type}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              data-ocid="claim_commander.claim.primary_button"
              onClick={() => setShowConfirmDialog(true)}
              className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              Claim Commander Role
            </button>
          </div>
        )}
      </div>

      {/* Confirmation AlertDialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            data-ocid="claim_commander.confirm.dialog"
            className="mx-4 w-full max-w-sm rounded-lg border p-6 shadow-2xl"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: "#f59e0b" }}
              />
              <div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
                  Confirm Commander Claim
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
                  Are you sure? This action cannot be undone. You are claiming
                  the Commander role for{" "}
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>
                    {workspace?.name ?? "this workspace"}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="claim_commander.confirm.cancel_button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isClaiming}
                className="h-9 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300 disabled:opacity-40"
                style={{ borderColor: "#2a3347" }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="claim_commander.confirm.confirm_button"
                onClick={() => void handleConfirmClaim()}
                disabled={isClaiming}
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-40"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Claiming…
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}

```

---

## FILE: src/pages/DocumentsPage.tsx

```tsx
import type {
  Document,
  ExtendedProfile,
  Folder,
  FolderPermission,
} from "@/backend.d";
import { DocumentPermission } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ClassificationBadge } from "@/components/shared/ClassificationBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CLEARANCE_LABELS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts);
  // ts can be in nanoseconds (ICP) or milliseconds — detect
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string },
): string {
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString(),
  );
  return match
    ? `${match.rank} ${match.name}`.trim()
    : truncatePrincipal(principal);
}

// ─── Sidebar skeleton ────────────────────────────────────────────────────────

function SidebarSkeleton() {
  return (
    <div data-ocid="documents.sidebar.loading_state" className="space-y-3 p-4">
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} height="h-8" className="w-full" />
      ))}
    </div>
  );
}

// ─── Document row skeleton ───────────────────────────────────────────────────

function DocumentListSkeleton() {
  return (
    <div data-ocid="documents.list.loading_state" className="space-y-2 p-4">
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} height="h-12" className="w-full" />
      ))}
    </div>
  );
}

// ─── Permissions skeleton ────────────────────────────────────────────────────

function PermissionsSkeleton() {
  return (
    <div
      data-ocid="documents.permissions.loading_state"
      className="space-y-2 p-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} height="h-12" className="w-full" />
      ))}
    </div>
  );
}

// ─── Upload Modal ────────────────────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folder: Folder;
  callerPrincipal: { toString(): string };
  onUploaded: () => void;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
}

function UploadModal({
  open,
  onOpenChange,
  folder,
  callerPrincipal,
  onUploaded,
  actor,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [description, setDescription] = useState("");
  const [classLevel, setClassLevel] = useState<string>(
    String(Number(folder.requiredClearanceLevel)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open or when folder changes while modal is open
  // biome-ignore lint/correctness/useExhaustiveDependencies: folder.id triggers a reset when the folder changes while modal is open; folder.requiredClearanceLevel initializes classLevel
  useEffect(() => {
    if (open) {
      setFile(null);
      setDocName("");
      setDescription("");
      setClassLevel(String(Number(folder.requiredClearanceLevel)));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, folder.requiredClearanceLevel, folder.id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !docName) setDocName(f.name);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!file) errs.file = "Please select a file.";
    if (!docName.trim()) errs.docName = "Document name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const doc: Document = {
        id: "",
        folderId: folder.id,
        name: docName.trim(),
        description: description.trim(),
        uploadedBy: callerPrincipal as unknown as Document["uploadedBy"],
        uploadedAt: BigInt(Date.now()),
        fileSize: BigInt(file!.size),
        mimeType: file!.type || "application/octet-stream",
        blobStorageKey: undefined,
        classificationLevel: BigInt(Number.parseInt(classLevel, 10)),
        version: 1n,
      };
      await actor.createDocument(doc);
      toast.success("Document uploaded successfully");
      onOpenChange(false);
      onUploaded();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="documents.upload.modal"
        className="border-border sm:max-w-lg"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File picker */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              File <span className="text-red-400">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              data-ocid="documents.upload.upload_button"
              className="w-full justify-start gap-2 border-border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ backgroundColor: "#1a2235" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {file ? file.name : "Choose file…"}
            </Button>
            <FormError message={errors.file} />
          </div>

          {/* Document name */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              Document Name <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="documents.upload.input"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="border-border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235" }}
              placeholder="Enter document name"
            />
            <FormError message={errors.docName} />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              Description
            </Label>
            <Textarea
              data-ocid="documents.upload.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235" }}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Classification level */}
          <div>
            <Label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-slate-400">
              Classification Level
            </Label>
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger
                data-ocid="documents.upload.select"
                className="border-border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {Object.entries(CLEARANCE_LABELS).map(([lvl, lbl]) => (
                  <SelectItem
                    key={lvl}
                    value={lvl}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {lbl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="documents.upload.cancel_button"
            className="border-border font-mono text-xs uppercase tracking-wider text-slate-300"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="documents.upload.submit_button"
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Permissions Tab ─────────────────────────────────────────────────────────

interface PermissionsTabProps {
  folder: Folder;
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  callerPrincipal: { toString(): string };
}

interface PermRow {
  profile: ExtendedProfile;
  permission: FolderPermission | null;
}

function PermissionsTab({
  folder,
  actor,
  callerPrincipal,
}: PermissionsTabProps) {
  const [rows, setRows] = useState<PermRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [savingFor, setSavingFor] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profiles, perms] = await Promise.all([
        actor.getAllProfiles(),
        actor.getFolderPermissions(folder.id),
      ]);
      const built: PermRow[] = profiles.map((p) => ({
        profile: p,
        permission:
          perms.find(
            (pm) => pm.userId.toString() === p.principalId.toString(),
          ) ?? null,
      }));
      setRows(built);
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, [actor, folder.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleRoleChange(row: PermRow, newRole: string) {
    const key = row.profile.principalId.toString();
    setSavingFor(key);
    try {
      const perm: FolderPermission = {
        folderId: folder.id,
        userId: row.profile.principalId,
        role: newRole as DocumentPermission,
        needToKnow: row.permission?.needToKnow ?? false,
        grantedBy: callerPrincipal as unknown as FolderPermission["grantedBy"],
        grantedAt: BigInt(Date.now()),
      };
      await actor.setFolderPermission(perm);
      setRows((prev) =>
        prev.map((r) =>
          r.profile.principalId.toString() === key
            ? { ...r, permission: perm }
            : r,
        ),
      );
      toast.success("Permission updated");
    } catch {
      toast.error("Failed to update permission");
    } finally {
      setSavingFor(null);
    }
  }

  async function handleNeedToKnowToggle(row: PermRow, value: boolean) {
    const key = row.profile.principalId.toString();
    setSavingFor(key);
    try {
      const perm: FolderPermission = {
        folderId: folder.id,
        userId: row.profile.principalId,
        role: row.permission?.role ?? DocumentPermission.Viewer,
        needToKnow: value,
        grantedBy: callerPrincipal as unknown as FolderPermission["grantedBy"],
        grantedAt: BigInt(Date.now()),
      };
      await actor.setFolderPermission(perm);
      setRows((prev) =>
        prev.map((r) =>
          r.profile.principalId.toString() === key
            ? { ...r, permission: perm }
            : r,
        ),
      );
      toast.success("Need-to-know updated");
    } catch {
      toast.error("Failed to update need-to-know");
    } finally {
      setSavingFor(null);
    }
  }

  async function handleRevoke(profile: ExtendedProfile) {
    try {
      await actor.revokeFolderPermission(folder.id, profile.principalId);
      setRows((prev) =>
        prev.map((r) =>
          r.profile.principalId.toString() === profile.principalId.toString()
            ? { ...r, permission: null }
            : r,
        ),
      );
      toast.success("Permission revoked");
    } catch {
      toast.error("Failed to revoke permission");
    } finally {
      setRevokeTarget(null);
    }
  }

  if (isLoading) return <PermissionsSkeleton />;

  return (
    <div data-ocid="documents.permissions.panel">
      {/* Revoke confirm */}
      <ConfirmDialog
        isOpen={!!revokeTarget}
        onOpenChange={(v) => {
          if (!v) setRevokeTarget(null);
        }}
        title="Revoke Permission"
        description={`Remove all folder access for ${revokeTarget?.name ?? "this user"}?`}
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (revokeTarget) void handleRevoke(revokeTarget);
        }}
        onCancel={() => setRevokeTarget(null)}
      />

      <div className="divide-y" style={{ borderColor: "#1a2235" }}>
        {rows.map((row, idx) => {
          const key = row.profile.principalId.toString();
          const isSaving = savingFor === key;
          const currentRole =
            row.permission?.role ?? DocumentPermission.NoAccess;
          const hasAccess = currentRole !== DocumentPermission.NoAccess;
          const isCallerSelf = key === callerPrincipal.toString();

          return (
            <div
              key={key}
              data-ocid={`documents.permissions.row.${idx + 1}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Name + rank */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  {row.profile.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {row.profile.rank}
                </p>
              </div>

              {/* Role dropdown */}
              <Select
                value={currentRole}
                onValueChange={(v) => void handleRoleChange(row, v)}
                disabled={isSaving || isCallerSelf}
              >
                <SelectTrigger
                  data-ocid={`documents.permissions.role.select.${idx + 1}`}
                  className="h-7 w-28 border-border font-mono text-[10px] uppercase tracking-wider text-slate-300"
                  style={{ backgroundColor: "#0a0e1a" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  {Object.values(DocumentPermission).map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="font-mono text-[10px] uppercase tracking-wider text-slate-300 focus:text-white"
                    >
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Need-to-know toggle */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  NtK
                </span>
                <Switch
                  data-ocid={`documents.permissions.needtoknow.switch.${idx + 1}`}
                  checked={row.permission?.needToKnow ?? false}
                  onCheckedChange={(v) => void handleNeedToKnowToggle(row, v)}
                  disabled={isSaving || isCallerSelf}
                />
              </div>

              {/* Revoke */}
              {hasAccess && !isCallerSelf && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`documents.permissions.revoke.button.${idx + 1}`}
                  className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  onClick={() => setRevokeTarget(row.profile)}
                  disabled={isSaving}
                >
                  Revoke
                </Button>
              )}

              {isSaving && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main DocumentsPage ───────────────────────────────────────────────────────

interface TierState {
  level: number;
  folders: Folder[];
  expanded: boolean;
}

export default function DocumentsPage() {
  const { actor, isFetching } = useActor();
  const { isS2Admin, clearanceLevel } = usePermissions();
  const { identity } = useInternetIdentity();

  const callerPrincipal = identity?.getPrincipal();

  // Sidebar data
  const [tiers, setTiers] = useState<TierState[]>([]);
  const [_myPermissions, setMyPermissions] = useState<FolderPermission[]>([]);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  // Selected folder
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);

  // Active panel tab
  const [activeTab, setActiveTab] = useState<"documents" | "permissions">(
    "documents",
  );

  // ── Load sidebar data ──────────────────────────────────────────────────────
  const loadSidebar = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsSidebarLoading(true);
    try {
      const [allFolders, myPerms] = await Promise.all([
        actor.getAllFolders(),
        actor.getMyFolderPermission(),
      ]);

      setMyPermissions(myPerms);

      // Group by clearance level
      const grouped: Record<number, Folder[]> = {};
      for (const f of allFolders) {
        const lvl = Number(f.requiredClearanceLevel);
        if (!grouped[lvl]) grouped[lvl] = [];
        grouped[lvl].push(f);
      }

      const tierList: TierState[] = [];
      for (let lvl = 0; lvl <= 4; lvl++) {
        const foldersAtLevel = grouped[lvl] ?? [];
        if (foldersAtLevel.length === 0) continue;

        // Filter folders this user can see
        let visibleFolders: Folder[];
        if (isS2Admin) {
          visibleFolders = foldersAtLevel;
        } else {
          visibleFolders = foldersAtLevel.filter((f) => {
            if (clearanceLevel < lvl) return false;
            const perm = myPerms.find((p) => p.folderId === f.id);
            return (
              perm !== undefined &&
              perm.needToKnow === true &&
              perm.role !== DocumentPermission.NoAccess
            );
          });
        }

        if (visibleFolders.length === 0) continue;

        tierList.push({
          level: lvl,
          folders: visibleFolders,
          expanded: lvl === 0,
        });
      }

      setTiers(tierList);
    } catch {
      toast.error("Failed to load folders");
    } finally {
      setIsSidebarLoading(false);
    }
  }, [actor, isFetching, isS2Admin, clearanceLevel]);

  useEffect(() => {
    void loadSidebar();
  }, [loadSidebar]);

  // ── Load documents + profiles when folder selected ─────────────────────────
  const loadDocuments = useCallback(
    async (folderId: string) => {
      if (!actor) return;
      setIsDocsLoading(true);
      try {
        const [docs, allProfiles] = await Promise.all([
          actor.getDocumentsByFolder(folderId),
          actor.getAllProfiles(),
        ]);
        setDocuments(docs);
        setProfiles(allProfiles);
      } catch {
        toast.error("Failed to load documents");
      } finally {
        setIsDocsLoading(false);
      }
    },
    [actor],
  );

  useEffect(() => {
    if (selectedFolder) {
      setActiveTab("documents");
      void loadDocuments(selectedFolder.id);
    }
  }, [selectedFolder, loadDocuments]);

  // ── Tier expand toggle ─────────────────────────────────────────────────────
  function toggleTier(level: number) {
    setTiers((prev) =>
      prev.map((t) =>
        t.level === level ? { ...t, expanded: !t.expanded } : t,
      ),
    );
  }

  // ── Delete document ────────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    if (!deleteTarget || !actor) return;
    setIsDeleting(true);
    try {
      await actor.deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ── Breadcrumb tier label ─────────────────────────────────────────────────
  const activeTierLabel = selectedFolder
    ? (CLEARANCE_LABELS[Number(selectedFolder.requiredClearanceLevel)] ??
      "UNCLASSIFIED")
    : null;

  const showTabs = isS2Admin && selectedFolder !== null;

  return (
    <div
      data-ocid="documents.page"
      className="flex h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="Delete Document"
        description="This document will be permanently deleted. This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Upload modal */}
      {selectedFolder && actor && callerPrincipal && (
        <UploadModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          folder={selectedFolder}
          callerPrincipal={callerPrincipal}
          onUploaded={() => void loadDocuments(selectedFolder.id)}
          actor={actor}
        />
      )}

      {/* Page header strip */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: "#1a2235" }}
      >
        <Shield className="h-4 w-4 text-amber-500" />
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white leading-none">
            Documents
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Classified document management
          </p>
        </div>
      </div>

      {/* Body — sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
        <aside
          data-ocid="documents.sidebar.panel"
          className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r"
          style={{
            backgroundColor: "#0a0e1a",
            borderColor: "#1a2235",
          }}
        >
          {/* Sidebar header */}
          <div
            className="flex items-center px-4 py-3 border-b"
            style={{ borderColor: "#1a2235" }}
          >
            <Shield className="mr-2 h-3.5 w-3.5 text-amber-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500">
              Classified Folders
            </span>
          </div>

          {/* Tier list */}
          <ScrollArea className="flex-1">
            {isSidebarLoading ? (
              <SidebarSkeleton />
            ) : tiers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  No accessible folders
                </p>
              </div>
            ) : (
              <div className="py-2">
                {tiers.map((tier, tierIdx) => (
                  <div key={tier.level}>
                    {/* Tier header — toggle */}
                    <button
                      type="button"
                      data-ocid={`documents.folder.tier.${tierIdx + 1}`}
                      onClick={() => toggleTier(tier.level)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none"
                    >
                      {tier.expanded ? (
                        <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                      )}
                      <span className="flex-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        {CLEARANCE_LABELS[tier.level]}
                      </span>
                      <span className="font-mono text-[9px] text-slate-600">
                        {tier.folders.length}
                      </span>
                    </button>

                    {/* Folder items */}
                    {tier.expanded && (
                      <div className="pb-1">
                        {tier.folders.map((folder, folderIdx) => {
                          const isActive = selectedFolder?.id === folder.id;
                          return (
                            <button
                              key={folder.id}
                              type="button"
                              data-ocid={`documents.folder.item.${folderIdx + 1}`}
                              onClick={() => setSelectedFolder(folder)}
                              className={cn(
                                "flex w-full items-center gap-2 py-2 pl-8 pr-4 text-left transition-colors hover:bg-white/5 focus-visible:outline-none",
                                isActive &&
                                  "border-l-2 border-amber-500 bg-amber-500/5",
                              )}
                            >
                              <FileText
                                className={cn(
                                  "h-3 w-3 shrink-0",
                                  isActive
                                    ? "text-amber-500"
                                    : "text-slate-600",
                                )}
                              />
                              <span
                                className={cn(
                                  "flex-1 truncate font-mono text-[10px] uppercase tracking-wider",
                                  isActive
                                    ? "text-amber-400"
                                    : "text-slate-400",
                                )}
                              >
                                {folder.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Breadcrumb + action bar */}
          <div
            className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3"
            style={{ borderColor: "#1a2235" }}
          >
            {/* Breadcrumb */}
            <nav
              data-ocid="documents.breadcrumb.panel"
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider"
            >
              <Link
                to="/"
                data-ocid="documents.breadcrumb.hub.link"
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                Hub
              </Link>
              {activeTierLabel && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className="text-slate-400">{activeTierLabel}</span>
                </>
              )}
              {selectedFolder && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className="text-white">{selectedFolder.name}</span>
                </>
              )}
            </nav>

            {/* Upload button */}
            {selectedFolder && (
              <Button
                type="button"
                size="sm"
                data-ocid="documents.upload.open_modal_button"
                className="h-7 gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-3 w-3" />
                Upload Document
              </Button>
            )}
          </div>

          {/* Tabs (S2 admin + folder selected) */}
          {showTabs ? (
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "documents" | "permissions")
              }
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div
                className="shrink-0 border-b px-5"
                style={{ borderColor: "#1a2235" }}
              >
                <TabsList className="h-9 bg-transparent p-0">
                  <TabsTrigger
                    value="documents"
                    data-ocid="documents.documents.tab"
                    className="h-9 rounded-none border-b-2 border-transparent px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none"
                  >
                    Documents
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    data-ocid="documents.permissions.tab"
                    className="h-9 rounded-none border-b-2 border-transparent px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none"
                  >
                    Permissions
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="documents"
                className="mt-0 flex-1 overflow-hidden"
              >
                <DocumentListContent
                  isLoading={isDocsLoading}
                  documents={documents}
                  profiles={profiles}
                  callerPrincipal={callerPrincipal}
                  isS2Admin={isS2Admin}
                  onDelete={setDeleteTarget}
                />
              </TabsContent>

              <TabsContent
                value="permissions"
                className="mt-0 flex-1 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  {actor && callerPrincipal && (
                    <PermissionsTab
                      folder={selectedFolder}
                      actor={actor}
                      callerPrincipal={callerPrincipal}
                    />
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            <DocumentListContent
              isLoading={isDocsLoading}
              documents={documents}
              profiles={profiles}
              callerPrincipal={callerPrincipal}
              isS2Admin={isS2Admin}
              onDelete={setDeleteTarget}
              noFolderSelected={selectedFolder === null}
            />
          )}
        </main>
      </div>
      {/* Footer */}
      <footer
        className="shrink-0 border-t px-4 py-3 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ─── Document List Content ────────────────────────────────────────────────────

interface DocumentListContentProps {
  isLoading: boolean;
  documents: Document[];
  profiles: ExtendedProfile[];
  callerPrincipal: { toString(): string } | undefined;
  isS2Admin: boolean;
  onDelete: (doc: Document) => void;
  noFolderSelected?: boolean;
}

function DocumentListContent({
  isLoading,
  documents,
  profiles,
  callerPrincipal,
  isS2Admin,
  onDelete,
  noFolderSelected = false,
}: DocumentListContentProps) {
  if (noFolderSelected) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
          Select a folder to view documents
        </p>
      </div>
    );
  }

  if (isLoading) return <DocumentListSkeleton />;

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        message="No documents in this folder yet"
        className="h-full"
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div
        data-ocid="documents.list.table"
        className="divide-y"
        style={{ borderColor: "#1a2235" }}
      >
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-3 px-5 py-2">
          {["Name", "Class.", "Ver.", "Uploaded By", "Date", "Size", ""].map(
            (h) => (
              <span
                key={h}
                className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-600"
              >
                {h}
              </span>
            ),
          )}
        </div>

        {documents.map((doc, idx) => {
          const isOwner =
            callerPrincipal &&
            doc.uploadedBy.toString() === callerPrincipal.toString();
          const canDelete = isOwner || isS2Admin;
          const uploaderName = getProfileName(profiles, doc.uploadedBy);

          return (
            <div
              key={doc.id}
              data-ocid={`documents.list.row.${idx + 1}`}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
            >
              {/* Name */}
              <span className="min-w-0 truncate font-mono text-xs text-white">
                {doc.name}
              </span>

              {/* Classification badge */}
              <ClassificationBadge level={Number(doc.classificationLevel)} />

              {/* Version */}
              <span className="font-mono text-[10px] text-slate-500">
                v{Number(doc.version)}
              </span>

              {/* Uploader */}
              <span className="max-w-[120px] truncate font-mono text-[10px] text-slate-400">
                {uploaderName}
              </span>

              {/* Date */}
              <span className="font-mono text-[10px] text-slate-500">
                {formatDate(doc.uploadedAt)}
              </span>

              {/* Size */}
              <span className="font-mono text-[10px] text-slate-500">
                {formatFileSize(doc.fileSize)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`documents.download.button.${idx + 1}`}
                  className="h-7 w-7 p-0 text-slate-500 hover:text-amber-400"
                  disabled={!doc.blobStorageKey}
                  title={doc.blobStorageKey ? "Download" : "No file attached"}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`documents.delete.open_modal_button.${idx + 1}`}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                    onClick={() => onDelete(doc)}
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

```

---

## FILE: src/pages/EmailDirectoryPage.tsx

```tsx
import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useMemo, useRef, useState } from "react";

// ─── Skeleton Rows ────────────────────────────────────────────────────────────

const TABLE_SKELETON_IDS = ["a", "b", "c", "d", "e"];

function TableSkeleton() {
  return (
    <tbody data-ocid="email_directory.loading_state">
      {TABLE_SKELETON_IDS.map((id) => (
        <tr key={id} className="border-b" style={{ borderColor: "#1a2235" }}>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="160px" />
          </td>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="80px" />
          </td>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="200px" />
          </td>
          <td className="px-4 py-3">
            <SkeletonCard height="12px" width="120px" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Main EmailDirectoryPage ──────────────────────────────────────────────────

export default function EmailDirectoryPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  // Displayed value updates immediately; filter state is debounced
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(val: string) {
    setInputValue(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 200);
  }

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: profiles = [], isLoading } = useQuery<ExtendedProfile[]>({
    queryKey: [principalStr, "email-directory-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.orgRole.toLowerCase().includes(q),
    );
  }, [profiles, searchQuery]);

  return (
    <div
      data-ocid="email_directory.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Email Directory
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Mail className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Email Directory
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                {isLoading
                  ? "Loading..."
                  : `${filteredProfiles.length} of ${profiles.length} contacts`}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-5">
            <Input
              data-ocid="email_directory.search_input"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or role..."
              className="max-w-sm border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
          </div>

          {/* Table */}
          <div
            className="overflow-hidden rounded border"
            style={{ borderColor: "#1a2235" }}
          >
            <table className="w-full table-auto">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: "#0f1626",
                    borderColor: "#1a2235",
                  }}
                >
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Rank
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Role
                  </th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton />
              ) : filteredProfiles.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={4}>
                      <div data-ocid="email_directory.empty_state">
                        <EmptyState
                          icon={<Mail />}
                          message="No contacts found"
                          className="py-16"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {filteredProfiles.map((profile, idx) => (
                    <tr
                      key={profile.principalId.toString()}
                      data-ocid={`email_directory.row.${idx + 1}`}
                      className="border-b transition-colors last:border-b-0 hover:bg-white/[0.025]"
                      style={{ borderColor: "#1a2235" }}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-white">
                          {profile.name || "—"}
                        </span>
                      </td>

                      {/* Rank */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400">
                          {profile.rank || "—"}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        {profile.email ? (
                          <a
                            href={`mailto:${profile.email}`}
                            className="font-mono text-xs text-amber-400 underline-offset-2 hover:text-amber-300 hover:underline"
                          >
                            {profile.email}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-slate-600">
                            —
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500">
                          {profile.orgRole || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/FileStoragePage.tsx

```tsx
import type { Document, ExtendedProfile, Folder, Section } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useStorageClient } from "@/hooks/useStorageClient";
import { cn } from "@/lib/utils";

import {
  Download,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  FolderOpen,
  HardDrive,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const VAULT_SECTION_NAME = "__file_vault_section__";
const VAULT_FOLDER_NAME = "__file_vault__";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedBy: string; // principal string
  uploaderName: string;
  uploadedAt: number; // ms timestamp
  blobUrl: string; // direct URL for download
  blobHash: string; // storage hash key
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <FileImage className="h-4 w-4 text-blue-400" />;
  if (mimeType.startsWith("video/"))
    return <FileVideo className="h-4 w-4 text-purple-400" />;
  if (mimeType.startsWith("audio/"))
    return <FileAudio className="h-4 w-4 text-green-400" />;
  if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("text/") ||
    mimeType.includes("document") ||
    mimeType.includes("word")
  )
    return <FileText className="h-4 w-4 text-amber-400" />;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("compress")
  )
    return <File className="h-4 w-4 text-orange-400" />;
  return <File className="h-4 w-4 text-slate-400" />;
}

/** Normalize ICP timestamps — could be nanoseconds or milliseconds */
function normalizeTimestamp(ts: bigint): number {
  const n = Number(ts);
  return n > 1e15 ? Math.floor(n / 1_000_000) : n;
}

function resolveUploaderName(
  profiles: ExtendedProfile[],
  principalStr: string,
): string {
  const match = profiles.find((p) => p.principalId.toString() === principalStr);
  if (match) return `${match.rank} ${match.name}`.trim();
  return `${principalStr.slice(0, 6)}…${principalStr.slice(-4)}`;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function FileListSkeleton() {
  return (
    <div
      data-ocid="file_storage.loading_state"
      className="divide-y"
      style={{ borderColor: "#1a2235" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <SkeletonCard width="w-4" height="h-4" />
          <SkeletonCard className="h-4 flex-1" />
          <SkeletonCard className="h-4 w-20" />
          <SkeletonCard className="h-4 w-24" />
          <SkeletonCard className="h-4 w-28" />
          <SkeletonCard className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  uploadProgress: number | null;
  isUploading: boolean;
  onUpload: () => void;
  storageReady: boolean;
  vaultReady: boolean;
}

function DropZone({
  onFileSelected,
  selectedFile,
  onClear,
  uploadProgress,
  isUploading,
  onUpload,
  storageReady,
  vaultReady,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        onFileSelected(files[0]);
      }
    },
    [onFileSelected],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelected(file);
        // Reset input so re-selecting same file still fires
        e.target.value = "";
      }
    },
    [onFileSelected],
  );

  const handleZoneClick = useCallback(() => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  }, [selectedFile]);

  const handleZoneKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [selectedFile],
  );

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        data-ocid="file_storage.dropzone"
        aria-label="Drop zone: drag and drop files here or click to browse"
        className={cn(
          "relative flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-8 py-10 transition-all",
          isDragging
            ? "border-amber-500 bg-amber-500/5"
            : "border-[#1a2235] hover:border-amber-500/50 hover:bg-white/[0.02]",
          selectedFile ? "cursor-default" : "cursor-pointer",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        onKeyDown={handleZoneKeyDown}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleInputChange}
          tabIndex={-1}
        />

        {/* Upload progress overlay */}
        {isUploading && uploadProgress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-sm bg-[#0a0e1a]/90">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-amber-500" />
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-amber-500">
              Uploading…
            </p>
            <div className="w-48">
              <Progress value={uploadProgress} className="h-1.5 bg-[#1a2235]" />
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-slate-500">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col items-center gap-3 transition-opacity",
            isUploading && "opacity-0",
          )}
        >
          <div
            className={cn(
              "rounded-sm border p-3 transition-colors",
              isDragging
                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                : "border-[#1a2235] bg-[#0f1626] text-slate-500",
            )}
          >
            <HardDrive className="h-6 w-6" />
          </div>

          {selectedFile ? (
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="font-mono text-sm font-semibold text-white">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove selected file"
                className="ml-2 rounded-sm p-1 text-slate-500 hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-slate-300">
                  Drag & drop files here
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload button */}
      {selectedFile && !isUploading && (
        <div className="flex justify-end">
          <Button
            type="button"
            data-ocid="file_storage.upload_button"
            disabled={
              !selectedFile || !storageReady || !vaultReady || isUploading
            }
            onClick={onUpload}
            className="gap-2 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
          >
            <Upload className="h-3.5 w-3.5" />
            Confirm Upload
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── File Table ───────────────────────────────────────────────────────────────

interface FileTableProps {
  files: FileRecord[];
  currentPrincipal: string;
  isS2Admin: boolean;
  onDelete: (file: FileRecord) => void;
}

function FileTable({
  files,
  currentPrincipal,
  isS2Admin,
  onDelete,
}: FileTableProps) {
  if (files.length === 0) {
    return (
      <div data-ocid="file_storage.empty_state">
        <EmptyState
          icon={<FolderOpen />}
          message="No files uploaded yet"
          className="py-20"
        />
      </div>
    );
  }

  return (
    <div data-ocid="file_storage.file_list.table">
      {/* Table header */}
      <div
        className="grid items-center gap-4 border-b px-6 py-2.5"
        style={{
          borderColor: "#1a2235",
          gridTemplateColumns: "2rem 1fr 6rem 7rem 9rem 7rem 7rem",
        }}
      >
        {["", "Name", "Size", "Date", "Uploaded By", "", ""].map((h, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static header row
            key={i}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Table rows */}
      <div className="divide-y" style={{ borderColor: "#1a2235" }}>
        {files.map((file, idx) => {
          const isOwner = file.uploadedBy === currentPrincipal;
          const canDelete = isOwner || isS2Admin;

          return (
            <div
              key={file.id}
              data-ocid={`file_storage.file.item.${idx + 1}`}
              className="grid items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
              style={{
                gridTemplateColumns: "2rem 1fr 6rem 7rem 9rem 7rem 7rem",
              }}
            >
              {/* Icon */}
              <div className="flex justify-center">
                {getMimeIcon(file.mimeType)}
              </div>

              {/* Name */}
              <span className="min-w-0 truncate font-mono text-xs text-white">
                {file.name}
              </span>

              {/* Size */}
              <span className="font-mono text-[10px] text-slate-400">
                {formatFileSize(file.size)}
              </span>

              {/* Date */}
              <span className="font-mono text-[10px] text-slate-400">
                {formatDate(file.uploadedAt)}
              </span>

              {/* Uploader */}
              <span className="truncate font-mono text-[10px] text-slate-400">
                {file.uploaderName}
              </span>

              {/* Download */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`file_storage.file.download_button.${idx + 1}`}
                  className="h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-amber-400"
                  onClick={() => {
                    window.open(file.blobUrl, "_blank", "noopener,noreferrer");
                  }}
                  title="Download file"
                  disabled={!file.blobUrl}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Get</span>
                </Button>
              </div>

              {/* Delete */}
              <div>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`file_storage.file.delete_button.${idx + 1}`}
                    className="h-7 gap-1.5 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-red-400"
                    onClick={() => onDelete(file)}
                    title="Delete file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                ) : (
                  <div className="h-7" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FileStoragePage ──────────────────────────────────────────────────────────

export default function FileStoragePage() {
  const { actor, isFetching } = useActor();
  const { profile, isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null,
  );

  // File list state
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [vaultFolderId, setVaultFolderId] = useState<string | null>(null);
  const [vaultReady, setVaultReady] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guard to prevent duplicate vault initialization calls
  const initializingRef = useRef(false);
  // Extra guard to prevent vault creation firing more than once (Strict Mode double-invoke)
  const isCreatingVaultRef = useRef(false);

  const currentPrincipal = identity?.getPrincipal().toString() ?? "";
  const uploaderName = profile
    ? `${profile.rank} ${profile.name}`.trim()
    : "Unknown";

  // ── Vault initialization & file loading ────────────────────────────────────
  const initializeVaultAndLoadFiles = useCallback(async () => {
    if (!actor || isFetching || initializingRef.current) return;

    initializingRef.current = true;
    setIsLoadingInitial(true);

    try {
      // Step 1: Find or create the vault folder
      const allFolders = await actor.getAllFolders();
      let vaultFolder = allFolders.find(
        (f: Folder) => f.name === VAULT_FOLDER_NAME,
      );

      if (!vaultFolder) {
        // Guard against concurrent vault creation (e.g., React Strict Mode double-invoke)
        if (isCreatingVaultRef.current) return;
        isCreatingVaultRef.current = true;

        try {
          // Find or create the vault section
          const allSections = await actor.getSections();
          let vaultSection = allSections.find(
            (s: Section) => s.name === VAULT_SECTION_NAME,
          );

          if (!vaultSection) {
            const callerPrincipal = identity?.getPrincipal();
            if (!callerPrincipal) throw new Error("No identity available");

            const newSectionId = await actor.createSection({
              id: "",
              name: VAULT_SECTION_NAME,
              description: "Internal file vault section",
              createdBy: callerPrincipal,
              createdAt: BigInt(Date.now()),
              iconName: "HardDrive",
              parentSectionId: undefined,
            });

            // Fetch again to get the real section
            const sections = await actor.getSections();
            vaultSection = sections.find(
              (s: Section) =>
                s.id === newSectionId || s.name === VAULT_SECTION_NAME,
            );
            if (!vaultSection)
              throw new Error("Failed to create vault section");
          }

          const callerPrincipal = identity?.getPrincipal();
          if (!callerPrincipal) throw new Error("No identity available");

          const newFolderId = await actor.createFolder({
            id: "",
            sectionId: vaultSection.id,
            name: VAULT_FOLDER_NAME,
            description: "Secure file vault",
            isPersonal: false,
            assignedUserId: undefined,
            requiredClearanceLevel: 0n,
            createdBy: callerPrincipal,
            createdAt: BigInt(Date.now()),
          });

          // Fetch folders again to get the real folder
          const refreshedFolders = await actor.getAllFolders();
          vaultFolder = refreshedFolders.find(
            (f: Folder) => f.id === newFolderId || f.name === VAULT_FOLDER_NAME,
          );
          if (!vaultFolder) throw new Error("Failed to create vault folder");
        } catch (creationErr) {
          isCreatingVaultRef.current = false;
          throw creationErr;
        }

        isCreatingVaultRef.current = false;
      }

      const folderId = vaultFolder.id;
      setVaultFolderId(folderId);

      // Step 2: Load documents + profiles in parallel
      const [docs, profiles] = await Promise.all([
        actor.getDocumentsByFolder(folderId),
        actor.getAllProfiles(),
      ]);

      // Step 3: Build FileRecord array from Document objects
      const records: FileRecord[] = await Promise.all(
        docs.map(async (doc: Document) => {
          const principalStr = doc.uploadedBy.toString();
          const uploaderDisplayName = resolveUploaderName(
            profiles,
            principalStr,
          );
          const uploadedAtMs = normalizeTimestamp(doc.uploadedAt);

          let blobUrl = "";
          if (doc.blobStorageKey && storageClient) {
            try {
              blobUrl = await storageClient.getDirectURL(doc.blobStorageKey);
            } catch {
              // Non-fatal — blob URL may not be resolvable without live client
            }
          }

          return {
            id: doc.id,
            name: doc.name,
            size: Number(doc.fileSize),
            mimeType: doc.mimeType,
            uploadedBy: principalStr,
            uploaderName: uploaderDisplayName,
            uploadedAt: uploadedAtMs,
            blobUrl,
            blobHash: doc.blobStorageKey ?? "",
          };
        }),
      );

      // Newest first
      records.sort((a, b) => b.uploadedAt - a.uploadedAt);
      setFiles(records);
      setVaultReady(true);
    } catch (err) {
      console.error("Vault initialization failed:", err);
      toast.error(
        "Failed to initialize file vault. Some features may be unavailable.",
      );
      // Graceful degradation — vault not ready but page doesn't crash
      setVaultReady(false);
    } finally {
      setIsLoadingInitial(false);
      initializingRef.current = false;
    }
  }, [actor, isFetching, identity, storageClient]);

  useEffect(() => {
    if (actor && !isFetching) {
      void initializeVaultAndLoadFiles();
    }
  }, [actor, isFetching, initializeVaultAndLoadFiles]);

  // Re-run vault init when storage client becomes ready and vault hasn't loaded yet
  useEffect(() => {
    if (
      storageClient &&
      storageReady &&
      actor &&
      !isFetching &&
      !vaultReady &&
      !isLoadingInitial
    ) {
      void initializeVaultAndLoadFiles();
    }
  }, [
    storageClient,
    storageReady,
    actor,
    isFetching,
    vaultReady,
    isLoadingInitial,
    initializeVaultAndLoadFiles,
  ]);

  // ── Handle upload ───────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !storageClient) {
      toast.error("Storage not ready. Please try again.");
      return;
    }
    if (!actor || !vaultFolderId) {
      toast.error("File vault not ready. Please try again.");
      return;
    }

    const callerPrincipal = identity?.getPrincipal();
    if (!callerPrincipal) {
      toast.error("Not authenticated.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload to blob storage
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) => {
        setUploadProgress(pct);
      });

      // Step 2: Persist document metadata to backend
      const docPayload: Document = {
        id: "",
        folderId: vaultFolderId,
        name: selectedFile.name,
        description: "",
        uploadedBy: callerPrincipal as unknown as Document["uploadedBy"],
        uploadedAt: BigInt(Date.now()),
        fileSize: BigInt(selectedFile.size),
        mimeType: selectedFile.type || "application/octet-stream",
        blobStorageKey: hash,
        classificationLevel: 0n,
        version: 1n,
      };
      const docId = await actor.createDocument(docPayload);

      // Step 3: Resolve blob URL for immediate download availability
      let blobUrl = "";
      try {
        blobUrl = await storageClient.getDirectURL(hash);
      } catch {
        // Non-fatal
      }

      const newRecord: FileRecord = {
        id: docId || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type || "application/octet-stream",
        uploadedBy: currentPrincipal,
        uploaderName,
        uploadedAt: Date.now(),
        blobUrl,
        blobHash: hash,
      };

      setFiles((prev) => [newRecord, ...prev]);
      setSelectedFile(null);
      setUploadProgress(null);
      toast.success(`"${selectedFile.name}" uploaded successfully`);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [
    selectedFile,
    storageClient,
    actor,
    vaultFolderId,
    identity,
    currentPrincipal,
    uploaderName,
  ]);

  // ── Handle delete ───────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !actor) return;
    setIsDeleting(true);
    try {
      // Delete backend document record first
      await actor.deleteDocument(deleteTarget.id);
      // Remove from local state only after successful backend call
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success("File deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete file. Please try again.");
      // Keep item in list — don't remove on failure
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, actor]);

  return (
    <div
      data-ocid="file_storage.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                File Storage
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="Delete this file?"
        description="This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "#1a2235" }}
        >
          {/* Title area */}
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                File Storage
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                Secure file vault
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  storageReady ? "bg-green-500" : "bg-slate-600",
                )}
              />
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                {storageReady ? "Storage Ready" : "Initializing…"}
              </span>
            </div>
            {!isLoadingInitial && (
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    vaultReady ? "bg-green-500" : "bg-red-500/50",
                  )}
                />
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {vaultReady ? "Vault Synced" : "Vault Error"}
                </span>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-5xl space-y-6 p-6">
            {/* Section label */}
            <div className="flex items-center gap-3">
              <HardDrive className="h-4 w-4 text-amber-500" />
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500">
                Secure File Vault
              </h2>
              <div
                className="flex-1 border-t"
                style={{ borderColor: "#1a2235" }}
              />
              {!isLoadingInitial && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
              )}
            </div>

            {/* Upload zone */}
            <div
              className="rounded-sm border p-5"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Upload File
              </p>
              <DropZone
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
                onClear={() => setSelectedFile(null)}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onUpload={() => void handleUpload()}
                storageReady={storageReady}
                vaultReady={vaultReady}
              />
            </div>

            {/* File list */}
            <div
              className="rounded-sm border overflow-hidden"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <div
                className="flex items-center gap-3 border-b px-6 py-3"
                style={{ borderColor: "#1a2235" }}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                  Uploaded Files
                </span>
              </div>

              {isLoadingInitial ? (
                <FileListSkeleton />
              ) : (
                <FileTable
                  files={files}
                  currentPrincipal={currentPrincipal}
                  isS2Admin={isS2Admin}
                  onDelete={setDeleteTarget}
                />
              )}
            </div>
          </div>
        </ScrollArea>
      </main>

      {/* Footer */}
      <footer
        className="shrink-0 border-t px-6 py-4"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="text-center font-mono text-[9px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 transition-colors hover:text-slate-500"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/GovernancePage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export default function GovernancePage() {
  return (
    <div
      data-ocid="governance.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Governance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <ShieldCheck className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Governance
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                System governance and trust verification
              </p>
            </div>
          </div>

          {/* Coming soon card */}
          <div
            className="rounded border px-6 py-8"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <ShieldCheck className="h-10 w-10 text-slate-700" />
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
                  System Governance
                </p>
                <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-slate-500">
                  System governance status, Wasm hash publication, upgrade audit
                  trail, and multi-sig controller management. Coming in a future
                  session.
                </p>
              </div>
              <div
                className="rounded border px-4 py-2"
                style={{
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.05)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                  Multi-sig controller pending
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/HelpPage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  FolderOpen,
  HardDrive,
  HelpCircle,
  Key,
  Mail,
  MessageSquare,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
    >
      <div
        className="flex items-center gap-3 border-b px-5 py-3.5"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="text-amber-500">{icon}</div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white">
          {title}
        </span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded border px-4 py-3"
      style={{ backgroundColor: "#0a111f", borderColor: "#1e2d45" }}
    >
      <div className="mt-0.5 text-amber-500 shrink-0">{icon}</div>
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
          {name}
        </p>
        <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Shortcut row ──────────────────────────────────────────────────────────────

function ShortcutRow({
  keys,
  action,
}: {
  keys: string[];
  action: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-2.5 border-b last:border-b-0"
      style={{ borderColor: "#1a2235" }}
    >
      <span className="font-mono text-[10px] text-slate-400">{action}</span>
      <div className="flex items-center gap-1 shrink-0">
        {keys.map((k, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static shortcut key list, order never changes
          <span key={i}>
            {i > 0 && (
              <span className="mx-1 font-mono text-[9px] text-slate-600">
                then
              </span>
            )}
            <kbd
              className="rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
              style={{
                backgroundColor: "#1a2235",
                border: "1px solid #2a3347",
              }}
            >
              {k}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── HelpPage ─────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div
      data-ocid="help.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" data-ocid="help.hub.link">
                    Hub
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Help</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page header */}
          <div className="flex items-start gap-4 pb-2">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <HelpCircle className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Help &amp; Reference
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                In-app documentation and guidance
              </p>
            </div>
          </div>

          {/* ── Platform Overview ─────────────────────────────────────── */}
          <Section
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Platform Overview"
          >
            <p className="font-mono text-xs leading-relaxed text-slate-400">
              <span className="font-bold text-white">Omnis Sovereign OS</span>{" "}
              is an enterprise sovereign cloud platform for military and
              corporate organizations — a replacement for Microsoft 365 tools
              running on the{" "}
              <span className="text-amber-400">Internet Computer (ICP)</span>.
            </p>
            <p className="mt-3 font-mono text-xs leading-relaxed text-slate-400">
              Each deployment is{" "}
              <span className="text-white font-semibold">fully sovereign</span>{" "}
              — tamperproof, unstoppable, and under the control of the deploying
              unit. No third-party cloud provider can access, modify, or take
              down your data. The canister runs on-chain and is owned by your
              organization.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Tamperproof", desc: "On-chain Motoko backend" },
                { label: "Unstoppable", desc: "No central point of failure" },
                { label: "Sovereign", desc: "Your keys, your data" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded border px-3 py-2 text-center"
                  style={{ backgroundColor: "#0a111f", borderColor: "#1e2d45" }}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Module Guide ──────────────────────────────────────────── */}
          <Section
            icon={<FolderOpen className="h-4 w-4" />}
            title="Module Guide"
          >
            <div className="space-y-2">
              <ModuleCard
                icon={<FileText className="h-3.5 w-3.5" />}
                name="Documents"
                description="Classified document management with two-gate access control: clearance level + need-to-know. S2 admins manage folder permissions."
              />
              <ModuleCard
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                name="Messaging"
                description="Secure internal direct messaging. Inbox and sent views, threaded replies, and read receipts. All messages stay on-chain."
              />
              <ModuleCard
                icon={<HardDrive className="h-3.5 w-3.5" />}
                name="File Storage"
                description="Drag-and-drop secure file vault. Files are stored in blob storage and linked to your profile. Persistent across sessions."
              />
              <ModuleCard
                icon={<Users className="h-3.5 w-3.5" />}
                name="Personnel Directory"
                description="Browse all registered personnel with rank, clearance level, and org role. S2 admins can edit sensitive profile fields."
              />
              <ModuleCard
                icon={<Mail className="h-3.5 w-3.5" />}
                name="Email Directory"
                description="Searchable contact directory for all personnel with email addresses and organizational roles."
              />
              <ModuleCard
                icon={<Shield className="h-3.5 w-3.5" />}
                name="Access Monitoring"
                description="S2-only. Real-time anomaly event feed, audit trail, folder activity log, and AI Smart System threat intelligence demo."
              />
            </div>
          </Section>

          {/* ── Keyboard Shortcuts ────────────────────────────────────── */}
          <Section
            icon={<Key className="h-4 w-4" />}
            title="Keyboard Shortcuts"
          >
            <div>
              <ShortcutRow keys={["G", "H"]} action="Go to Hub" />
              <ShortcutRow keys={["G", "D"]} action="Go to Documents" />
              <ShortcutRow keys={["G", "M"]} action="Go to Messaging" />
              <ShortcutRow keys={["G", "N"]} action="Go to Notifications" />
              <ShortcutRow keys={["Ctrl+K"]} action="Open command palette" />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(100,116,139,0.06)",
                borderColor: "#1a2235",
              }}
            >
              <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                Additional shortcuts and a full command palette are planned for
                a future session.
              </p>
            </div>
          </Section>

          {/* ── Security Model ────────────────────────────────────────── */}
          <Section icon={<Shield className="h-4 w-4" />} title="Security Model">
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  Two-Gate Access Control
                </p>
                <p className="font-mono text-[10px] leading-relaxed text-slate-400">
                  Document access requires passing two independent checks:
                </p>
                <ol className="mt-2 space-y-1 pl-4">
                  <li className="font-mono text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">
                      Gate 1 — Clearance Level:
                    </span>{" "}
                    Your clearance must meet or exceed the folder's required
                    level.
                  </li>
                  <li className="font-mono text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">
                      Gate 2 — Need-to-Know:
                    </span>{" "}
                    You must be explicitly granted access to the folder by an S2
                    admin.
                  </li>
                </ol>
              </div>

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  S2 Admin Role
                </p>
                <p className="font-mono text-[10px] leading-relaxed text-slate-400">
                  S2 administrators have full system access. They manage
                  clearance levels, folder permissions, need-to-know grants, and
                  anomaly event oversight. S2 admin role requires explicit
                  commander validation.
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  Commander Validation
                </p>
                <p className="font-mono text-[10px] leading-relaxed text-slate-400">
                  Critical roles (S2 admin, commander-level access) require a
                  validation code issued by the commander. This two-person
                  integrity model prevents unilateral privilege escalation.
                </p>
              </div>
            </div>
          </Section>

          {/* ── Deployment & Sovereignty ──────────────────────────────── */}
          <Section
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Deployment & Sovereignty"
          >
            <p className="font-mono text-[10px] leading-relaxed text-slate-400">
              Omnis runs on the{" "}
              <span className="text-amber-400">
                Internet Computer Protocol (ICP)
              </span>
              , a decentralized blockchain network operated by the DFINITY
              Foundation. Your data lives in a canister smart contract — a
              self-contained execution environment that cannot be modified or
              taken offline by any single entity.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div
                className="rounded border px-3 py-2.5"
                style={{ backgroundColor: "#0a111f", borderColor: "#1e2d45" }}
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white mb-1">
                  Current: Single-Tenant
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  One deployment per unit/organization. Full data isolation by
                  default. Recommended for initial deployments.
                </p>
              </div>
              <div
                className="rounded border px-3 py-2.5"
                style={{
                  backgroundColor: "rgba(139,92,246,0.06)",
                  borderColor: "rgba(139,92,246,0.25)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-violet-300">
                    Roadmap: Multi-Tenant
                  </p>
                </div>
                <p className="font-mono text-[10px] text-slate-500">
                  One deployment hosting multiple org spaces. Brigade-level
                  management with battalion sub-orgs. Requires future backend
                  update.
                </p>
              </div>
            </div>
          </Section>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/HubPage.tsx

```tsx
import { UserRole } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ChainOfTrustPanel } from "@/components/shared/ChainOfTrustPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  FolderOpen,
  HardDrive,
  HelpCircle,
  Key,
  Loader2,
  Mail,
  Megaphone,
  MessageSquare,
  Network,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TileDefinition {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  s2Only?: boolean;
  ocid: string;
}

const TILES: TileDefinition[] = [
  {
    icon: FolderOpen,
    title: "Documents",
    description: "Manage classified documents and folders",
    to: "/documents",
    ocid: "hub.tile.1",
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description: "Secure internal communications",
    to: "/messages",
    ocid: "hub.tile.2",
  },
  {
    icon: HardDrive,
    title: "File Storage",
    description: "Blob storage and file management",
    to: "/file-storage",
    ocid: "hub.tile.3",
  },
  {
    icon: Users,
    title: "Personnel Directory",
    description: "View and manage personnel",
    to: "/personnel",
    ocid: "hub.tile.4",
  },
  {
    icon: Mail,
    title: "Email Directory",
    description: "Organization contact directory",
    to: "/email-directory",
    ocid: "hub.tile.5",
  },
  {
    icon: Shield,
    title: "Access Monitoring",
    description: "Monitor anomalies and access events",
    to: "/monitoring",
    s2Only: true,
    ocid: "hub.tile.6",
  },
];

interface SecondaryTileDefinition {
  icon: LucideIcon;
  title: string;
  to: string;
  ocid: string;
  s2Only?: boolean;
}

const SECONDARY_TILES: SecondaryTileDefinition[] = [
  {
    icon: Bell,
    title: "Notifications",
    to: "/notifications",
    ocid: "hub.secondary.1",
  },
  {
    icon: ClipboardList,
    title: "Audit Log",
    to: "/audit-log",
    ocid: "hub.secondary.2",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    to: "/announcements",
    ocid: "hub.secondary.3",
  },
  {
    icon: CalendarDays,
    title: "Calendar",
    to: "/calendar",
    ocid: "hub.secondary.4",
  },
  { icon: CheckSquare, title: "Tasks", to: "/tasks", ocid: "hub.secondary.5" },
  {
    icon: Settings,
    title: "Settings",
    to: "/settings",
    ocid: "hub.secondary.6",
  },
  {
    icon: ShieldCheck,
    title: "Governance",
    to: "/governance",
    ocid: "hub.secondary.7",
  },
  { icon: HelpCircle, title: "Help", to: "/help", ocid: "hub.secondary.8" },
  {
    icon: FlaskConical,
    title: "Test Lab",
    to: "/test-lab",
    ocid: "hub.secondary.9",
  },
  {
    icon: ShieldCheck,
    title: "Admin Panel",
    to: "/admin",
    s2Only: true,
    ocid: "hub.secondary.10",
  },
];

interface ChecklistStep {
  num: number;
  label: string;
  to: string;
  ocid: string;
}

const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    num: 1,
    label: "Validate Commander Code",
    to: "/validate-commander",
    ocid: "hub.s2_checklist.validate.link",
  },
  {
    num: 2,
    label: "Create Sections & Folders",
    to: "/documents",
    ocid: "hub.s2_checklist.folders.link",
  },
  {
    num: 3,
    label: "Assign Clearance Levels",
    to: "/personnel",
    ocid: "hub.s2_checklist.clearances.link",
  },
];

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function HubPage() {
  const { clearanceLevel, isS2Admin, profile, refreshProfile } =
    usePermissions();
  const { isSet: networkModeIsSet } = useNetworkMode();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(
    () => localStorage.getItem("omnis_s2_checklist_dismissed") === "true",
  );
  const [isCallerAdminFlag, setIsCallerAdminFlag] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  // Bootstrap code claim
  const [showClaimPanel, setShowClaimPanel] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [networkModeDismissed, setNetworkModeDismissed] = useState(false);
  // Chain of trust state
  const [commanderClaimed, setCommanderClaimed] = useState(
    () => localStorage.getItem("omnis_commander_claimed") === "true",
  );
  const [hasFoundingS2] = useState(
    () => localStorage.getItem("omnis_founding_s2") === "true",
  );
  const chainOfTrustComplete = hasFoundingS2 && commanderClaimed;

  // Check if the caller has the admin role but hasn't been flagged as S2 admin yet
  useEffect(() => {
    if (!actor || !profile || isS2Admin) return;
    actor
      .isCallerAdmin()
      .then((result) => setIsCallerAdminFlag(result))
      .catch(() => setIsCallerAdminFlag(false));
  }, [actor, profile, isS2Admin]);

  // Poll for commander claim every 5s while S2 admin is on hub and chain not yet complete
  useEffect(() => {
    if (!isS2Admin || chainOfTrustComplete) return;
    const interval = setInterval(() => {
      const claimed =
        localStorage.getItem("omnis_commander_claimed") === "true";
      setCommanderClaimed(claimed);
    }, 5000);
    return () => clearInterval(interval);
  }, [isS2Admin, chainOfTrustComplete]);

  const handleActivateS2Admin = async () => {
    if (!actor || !identity) return;
    setIsActivating(true);
    try {
      const principal = identity.getPrincipal();
      await actor.assignCallerUserRole(principal, UserRole.admin);
      await actor.updateUserProfile({
        principalId: principal,
        name: profile?.name ?? "",
        rank: profile?.rank ?? "",
        email: profile?.email ?? "",
        orgRole: profile?.orgRole ?? "",
        clearanceLevel: profile?.clearanceLevel ?? 4n,
        isS2Admin: true,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: profile?.avatarUrl,
      });
      await actor.validateS2Admin(principal);
      await refreshProfile();
      toast.success("S2 admin activated", {
        description: "You now have full S2 admin access.",
      });
    } catch {
      toast.error("Activation failed", {
        description: "Could not activate S2 admin role. Try again.",
      });
    } finally {
      setIsActivating(false);
    }
  };

  // Post-registration S2 admin claim using bootstrap code
  const handleClaimS2Admin = async () => {
    if (!actor || !identity || !claimCode.trim()) return;
    setIsClaiming(true);
    try {
      const principal = identity.getPrincipal();
      // The bootstrap code is passed as the caffeineAdminToken.
      // We re-initialize the actor with the provided code as the admin token
      // by calling _initializeAccessControlWithSecret directly.
      await (
        actor as unknown as {
          _initializeAccessControlWithSecret: (token: string) => Promise<void>;
        }
      )._initializeAccessControlWithSecret(claimCode.trim());
      await actor.assignCallerUserRole(principal, UserRole.admin);
      await actor.updateUserProfile({
        principalId: principal,
        name: profile?.name ?? "",
        rank: profile?.rank ?? "",
        email: profile?.email ?? "",
        orgRole: profile?.orgRole ?? "",
        clearanceLevel: 4n,
        isS2Admin: true,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: profile?.avatarUrl,
      });
      await actor.validateS2Admin(principal);
      await refreshProfile();
      setShowClaimPanel(false);
      setClaimCode("");
      toast.success("S2 Admin access granted", {
        description: "You now have full S2 admin access.",
      });
    } catch {
      toast.error("Invalid authorization code", {
        description: "The code was not accepted. Check and try again.",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const showWelcomeBanner =
    clearanceLevel === 0 &&
    !welcomeDismissed &&
    !isCallerAdminFlag &&
    !isS2Admin;
  const showS2Checklist =
    isS2Admin && !profile?.isValidatedByCommander && !checklistDismissed;

  function handleDismissChecklist() {
    localStorage.setItem("omnis_s2_checklist_dismissed", "true");
    setChecklistDismissed(true);
  }
  const showRecoveryPanel = isCallerAdminFlag && !isS2Admin;

  const visibleTiles = TILES.filter((t) => !t.s2Only || isS2Admin);

  return (
    <div
      data-ocid="hub.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* S2 Admin Recovery Panel */}
          <AnimatePresence>
            {showRecoveryPanel && (
              <motion.div
                data-ocid="hub.s2_recovery.panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex flex-col gap-3 rounded border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.06)",
                  borderColor: "#f59e0b",
                }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "#f59e0b" }}
                  />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
                      S2 Admin Role Available
                    </p>
                    <p className="mt-0.5 font-mono text-xs leading-relaxed text-slate-400">
                      Your account has system admin authorization but S2 admin
                      is not yet activated.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="hub.s2_activate.button"
                  onClick={() => void handleActivateS2Admin()}
                  disabled={isActivating}
                  className="flex shrink-0 items-center gap-2 rounded border border-amber-500 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Activating…
                    </>
                  ) : (
                    <>
                      Activate S2 Admin
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* S2 Admin Authorization Code Claim Panel — for users who skipped the code at registration */}
          <AnimatePresence>
            {showClaimPanel && !isS2Admin && (
              <motion.div
                data-ocid="hub.s2_claim.panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 rounded border px-5 py-4"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.06)",
                  borderColor: "#f59e0b",
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
                    Claim S2 Admin Access
                  </p>
                  <button
                    type="button"
                    data-ocid="hub.s2_claim.close_button"
                    onClick={() => {
                      setShowClaimPanel(false);
                      setClaimCode("");
                    }}
                    className="text-slate-500 transition-colors hover:text-slate-300"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mb-3 font-mono text-xs leading-relaxed text-slate-400">
                  Enter the Commander Authorization Code to claim S2 admin
                  privileges for this account.
                </p>
                <div className="flex gap-2">
                  <Input
                    data-ocid="hub.s2_claim.input"
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    placeholder="Commander Authorization Code"
                    className="flex-1 border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#0a0e1a",
                      borderColor: "#2a3347",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleClaimS2Admin();
                    }}
                    disabled={isClaiming}
                  />
                  <Button
                    type="button"
                    data-ocid="hub.s2_claim.submit_button"
                    onClick={() => void handleClaimS2Admin()}
                    disabled={isClaiming || !claimCode.trim()}
                    className="shrink-0 font-mono text-xs uppercase tracking-wider"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  >
                    {isClaiming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Claim"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome banner for clearance level 0 */}
          <AnimatePresence>
            {showWelcomeBanner && (
              <motion.div
                data-ocid="hub.welcome_banner"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex items-center justify-between gap-3 rounded border px-4 py-3"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  borderColor: "#f59e0b",
                }}
              >
                <p className="font-mono text-xs uppercase tracking-wider text-amber-400">
                  Your account is pending clearance assignment. Contact your S2
                  administrator.
                </p>
                <button
                  type="button"
                  data-ocid="hub.welcome_banner.close_button"
                  onClick={() => setWelcomeDismissed(true)}
                  className="shrink-0 text-amber-400 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Network Mode banner — shown to S2 admins when mode not configured */}
          <AnimatePresence>
            {isS2Admin && !networkModeIsSet && !networkModeDismissed && (
              <motion.div
                data-ocid="hub.network_mode_banner"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex flex-col gap-3 rounded border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  backgroundColor: "rgba(59,130,246,0.06)",
                  borderColor: "rgba(59,130,246,0.35)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Network
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "#60a5fa" }}
                  />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                      Network mode not configured
                    </p>
                    <p className="mt-0.5 font-mono text-xs leading-relaxed text-slate-400">
                      Configure the deployment network type (NIPR, SIPR, or
                      Corporate) to enable classification labels and monitoring
                      sensitivity settings.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-ocid="hub.network_mode_banner.configure_button"
                    onClick={() => void navigate({ to: "/network-mode-setup" })}
                    className="rounded border border-blue-500/40 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-blue-400 transition-colors hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    Configure Now
                  </button>
                  <button
                    type="button"
                    data-ocid="hub.network_mode_banner.close_button"
                    onClick={() => setNetworkModeDismissed(true)}
                    className="text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* S2 setup checklist */}
          {showS2Checklist && (
            <motion.div
              data-ocid="hub.s2_checklist.panel"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="mb-6 rounded border px-5 py-4"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.06)",
                borderColor: "#f59e0b",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  S2 Setup Required
                </h2>
                <button
                  type="button"
                  data-ocid="hub.s2_checklist.close_button"
                  onClick={handleDismissChecklist}
                  className="text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label="Dismiss checklist"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {CHECKLIST_STEPS.map((step) => (
                  <button
                    key={step.num}
                    type="button"
                    data-ocid={step.ocid}
                    onClick={() => void navigate({ to: step.to })}
                    className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold"
                      style={{
                        borderColor: "#f59e0b",
                        color: "#f59e0b",
                      }}
                    >
                      {step.num}
                    </span>
                    <span className="flex-1 font-mono text-xs uppercase tracking-wider text-slate-300">
                      {step.label}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-amber-500/60" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chain of Trust Panel — S2 admins only, auto-hides when complete */}
          {isS2Admin && hasFoundingS2 && !chainOfTrustComplete && (
            <AnimatePresence>
              <motion.div
                data-ocid="hub.chain_of_trust.panel"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mb-5"
              >
                <ChainOfTrustPanel />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Section heading */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Operations Center
              </h1>
              <p className="mt-1 font-mono text-xs text-slate-500 uppercase tracking-widest">
                Select a module to begin
              </p>
            </div>
            {/* S2 Admin claim trigger — only shown to non-S2 users who haven't opened the panel */}
            {!isS2Admin && !showClaimPanel && (
              <button
                type="button"
                data-ocid="hub.s2_claim.open_modal_button"
                onClick={() => setShowClaimPanel(true)}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                title="Claim S2 admin access with Commander Authorization Code"
              >
                <Key className="h-3 w-3" />
                Admin Access
              </button>
            )}
          </div>

          {/* Tiles grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <motion.button
                  key={tile.to}
                  type="button"
                  data-ocid={tile.ocid}
                  custom={index}
                  variants={tileVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => void navigate({ to: tile.to })}
                  className="group relative flex flex-col items-start gap-3 rounded border p-5 text-left outline-none transition-all duration-200 hover:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30"
                  style={{
                    backgroundColor: "#1a2235",
                    borderColor: "#253045",
                  }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded"
                    style={{
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <Icon
                      className="h-5 w-5 transition-colors group-hover:text-amber-400"
                      style={{ color: "#f59e0b" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white transition-colors group-hover:text-amber-400">
                      {tile.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-slate-500">
                      {tile.description}
                    </p>
                  </div>
                  <ChevronRight className="absolute bottom-4 right-4 h-3.5 w-3.5 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500" />
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "#253045" }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Quick Access
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "#253045" }}
            />
          </div>

          {/* Secondary compact tiles */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {SECONDARY_TILES.filter((t) => !t.s2Only || isS2Admin).map(
              (tile, index) => {
                const Icon = tile.icon;
                return (
                  <motion.button
                    key={tile.to}
                    type="button"
                    data-ocid={tile.ocid}
                    custom={index + TILES.length}
                    variants={tileVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => void navigate({ to: tile.to })}
                    className="group flex flex-col items-center gap-2 rounded border px-3 py-3.5 text-center outline-none transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/[0.03] focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30"
                    style={{
                      backgroundColor: "#0f1626",
                      borderColor: "#1e2d40",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-amber-400" />
                    <span className="font-mono text-[10px] uppercase leading-tight tracking-wider text-slate-400 transition-colors group-hover:text-slate-200">
                      {tile.title}
                    </span>
                  </motion.button>
                );
              },
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/LoginPage.tsx

```tsx
import { StarfieldWarp } from "@/components/auth/StarfieldWarp";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const [warpActive, setWarpActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const hasNavigated = useRef(false);
  const timeoutStarted = useRef(false);

  // Reset on mount (covers logout → login cycles)
  useEffect(() => {
    hasNavigated.current = false;
    timeoutStarted.current = false;
    setWarpActive(false);
    setIsChecking(false);
    setSessionTimedOut(false);
  }, []);

  const triggerNavigate = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setWarpActive(true);
    setIsChecking(true);
    setTimeout(() => {
      void navigate({ to: "/register" });
    }, 1800);
  }, [navigate]);

  // When identity becomes real, navigate immediately — no actor needed.
  // RegistrationGatePage handles profile-based routing.
  useEffect(() => {
    if (!identity) return;
    if (identity.getPrincipal().isAnonymous()) return;
    triggerNavigate();
  }, [identity, triggerNavigate]);

  // Safety-net timeout: if identity never becomes real within 20s, show error.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount only
  useEffect(() => {
    if (timeoutStarted.current) return;
    timeoutStarted.current = true;
    const timer = setTimeout(() => {
      if (!hasNavigated.current) {
        setSessionTimedOut(true);
      }
    }, 20_000);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = isLoggingIn || isChecking || warpActive;

  const handleSignIn = () => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      // Already authenticated — trigger navigation directly
      triggerNavigate();
      return;
    }
    login();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Starfield background */}
      <StarfieldWarp warpActive={warpActive} />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_40px_oklch(0.72_0.175_70_/_0.3)]">
            <ShieldCheck className="h-10 w-10 text-amber" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-mono text-4xl font-bold uppercase tracking-[0.3em] text-foreground">
              OMNIS
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Sovereign OS
            </p>
            <p
              className="font-mono text-xs tracking-[0.2em]"
              style={{ color: "#f59e0b" }}
            >
              Unstoppable. Tamperproof. Sovereign.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-64 items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground">
            AUTHENTICATE
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Session timeout error */}
        {sessionTimedOut ? (
          <div className="flex w-72 flex-col items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border"
              style={{ borderColor: "#ef4444", backgroundColor: "#1a0a0a" }}
            >
              <ShieldAlert className="h-6 w-6" style={{ color: "#ef4444" }} />
            </div>
            <p
              className="text-center font-mono text-xs leading-relaxed"
              style={{ color: "#fca5a5" }}
            >
              Session initialization timed out.
              <br />
              This may be a network issue.
            </p>
            <Button
              data-ocid="login.retry_button"
              className="h-10 w-full font-mono text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "#ef4444",
                color: "#fff",
              }}
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Login button */}
            <Button
              data-ocid="login.primary_button"
              className="h-12 w-64 bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-primary/90 disabled:cursor-not-allowed"
              style={{
                boxShadow: "0 0 20px oklch(0.72 0.175 70 / 0.4)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 32px oklch(0.72 0.175 70 / 0.65)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 20px oklch(0.72 0.175 70 / 0.4)";
              }}
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {warpActive || isChecking
                    ? "Accessing System..."
                    : "Authenticating..."}
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="max-w-xs font-mono text-xs leading-relaxed text-muted-foreground/60">
              Access restricted to authorized personnel only. All sessions are
              monitored and logged.
            </p>
          </>
        )}
      </div>

      {/* Bottom scan line effect */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
      <div className="absolute bottom-6 font-mono text-xs text-muted-foreground/40">
        OMNIS-OS · CLEARANCE VERIFICATION REQUIRED
      </div>
    </div>
  );
}

```

---

## FILE: src/pages/MessagesPage.tsx

```tsx
import type { ExtendedProfile, Message } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import {
  Inbox,
  Loader2,
  MessageSquare,
  PenSquare,
  Reply,
  Send,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFullDate(ts: bigint): string {
  const ms = Number(ts);
  const date = ms > 1e15 ? new Date(ms / 1_000_000) : new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProfileName(
  profiles: ExtendedProfile[],
  principal: { toString(): string },
): string {
  const match = profiles.find(
    (p) => p.principalId.toString() === principal.toString(),
  );
  return match ? `${match.rank} ${match.name}`.trim() : "Unknown";
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function MessageListSkeleton() {
  return (
    <div data-ocid="messages.inbox.loading_state" className="space-y-1 p-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} height="56px" className="w-full" />
      ))}
    </div>
  );
}

// ─── Compose Modal ────────────────────────────────────────────────────────────

interface ComposeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profiles: ExtendedProfile[];
  callerPrincipal: { toString(): string };
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onSent: () => void;
  onSwitchToSent: () => void;
}

function ComposeModal({
  open,
  onOpenChange,
  profiles,
  callerPrincipal,
  actor,
  onSent,
  onSwitchToSent,
}: ComposeModalProps) {
  const [toUserId, setToUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setToUserId("");
      setSubject("");
      setBody("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!toUserId) errs.to = "Recipient is required.";
    if (!subject.trim()) errs.subject = "Subject is required.";
    if (!body.trim()) errs.body = "Message body is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const recipientProfile = profiles.find(
        (p) => p.principalId.toString() === toUserId,
      );
      if (!recipientProfile) throw new Error("Recipient not found");

      const message: Message = {
        id: generateId(),
        deleted: false,
        read: false,
        parentMessageId: undefined,
        toUserId: recipientProfile.principalId,
        fromUserId: callerPrincipal as unknown as Message["fromUserId"],
        subject: subject.trim(),
        body: body.trim(),
        sentAt: BigInt(Date.now()),
      };

      await actor.sendMessage(message);
      toast.success("Message sent");
      onOpenChange(false);
      onSent();
      onSwitchToSent();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter out self and unregistered users from recipient list
  const recipientOptions = profiles.filter(
    (p) =>
      p.principalId.toString() !== callerPrincipal.toString() &&
      p.registered === true,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="messages.compose.modal"
        className="border sm:max-w-lg"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Compose Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              To <span className="text-red-400">*</span>
            </Label>
            <Select value={toUserId} onValueChange={setToUserId}>
              <SelectTrigger
                data-ocid="messages.compose.to.select"
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              >
                <SelectValue placeholder="Select recipient…" />
              </SelectTrigger>
              <SelectContent
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                {recipientOptions.map((p) => (
                  <SelectItem
                    key={p.principalId.toString()}
                    value={p.principalId.toString()}
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    {p.rank} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={errors.to} />
          </div>

          {/* Subject */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Subject <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="messages.compose.subject.input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Enter subject…"
            />
            <FormError message={errors.subject} />
          </div>

          {/* Body */}
          <div>
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              data-ocid="messages.compose.body.textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Type your message…"
              rows={5}
            />
            <FormError message={errors.body} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="messages.compose.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-300"
            style={{ borderColor: "#2a3347" }}
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="messages.compose.submit_button"
            className="gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Message Row ──────────────────────────────────────────────────────────────

interface MessageRowProps {
  message: Message;
  profiles: ExtendedProfile[];
  isSelected: boolean;
  isSent: boolean;
  index: number;
  onClick: () => void;
}

function MessageRow({
  message,
  profiles,
  isSelected,
  isSent,
  index,
  onClick,
}: MessageRowProps) {
  const isUnread = !message.read && !isSent;
  const otherParty = isSent
    ? getProfileName(profiles, message.toUserId)
    : getProfileName(profiles, message.fromUserId);

  // Don't show deleted messages
  if (message.deleted) return null;

  return (
    <button
      type="button"
      data-ocid={
        isSent ? `messages.sent.row.${index}` : `messages.inbox.row.${index}`
      }
      onClick={onClick}
      className={cn(
        "relative w-full rounded-sm px-3 py-3 text-left transition-colors",
        isSelected
          ? "bg-amber-500/10 border-l-2 border-amber-500"
          : "border-l-2 border-transparent hover:bg-white/[0.03]",
        isUnread && "bg-white/[0.02]",
      )}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <span
          className="absolute left-[-1px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "#f59e0b" }}
          aria-label="Unread"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "truncate font-mono text-[11px] uppercase tracking-wider",
            isUnread ? "font-bold text-white" : "text-slate-300",
          )}
        >
          {otherParty}
        </span>
        <span className="shrink-0 font-mono text-[9px] text-slate-600">
          {formatRelativeTime(message.sentAt)}
        </span>
      </div>
      <p
        className={cn(
          "mt-0.5 truncate font-mono text-[10px]",
          isUnread ? "font-semibold text-slate-200" : "text-slate-500",
        )}
      >
        {message.subject}
      </p>
    </button>
  );
}

// ─── Thread View ──────────────────────────────────────────────────────────────

interface ThreadViewProps {
  message: Message;
  allMessages: Message[];
  profiles: ExtendedProfile[];
  callerPrincipal: { toString(): string };
  actor: NonNullable<ReturnType<typeof useActor>["actor"]>;
  onDeleted: (id: string) => void;
  onReplySent: () => void;
}

function ThreadView({
  message,
  allMessages,
  profiles,
  callerPrincipal,
  actor,
  onDeleted,
  onReplySent,
}: ThreadViewProps) {
  const [replyBody, setReplyBody] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find thread root id
  const threadRootId = message.parentMessageId ?? message.id;

  // Build thread: original message + all replies sharing same thread root
  const threadMessages = allMessages
    .filter(
      (m) =>
        !m.deleted &&
        (m.id === threadRootId ||
          m.parentMessageId === threadRootId ||
          m.id === message.id ||
          m.parentMessageId === message.id),
    )
    .sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));

  // Deduplicate by id
  const seen = new Set<string>();
  const uniqueThread = threadMessages.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // Scroll to bottom of thread on open
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is a stable ref, intentionally run only on message.id change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [message.id]);

  async function handleSendReply() {
    if (!replyBody.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }
    setReplyError("");
    setIsSendingReply(true);
    try {
      const reply: Message = {
        id: generateId(),
        deleted: false,
        read: false,
        parentMessageId: threadRootId,
        toUserId:
          message.fromUserId.toString() === callerPrincipal.toString()
            ? message.toUserId
            : message.fromUserId,
        fromUserId: callerPrincipal as unknown as Message["fromUserId"],
        subject: message.subject.startsWith("Re: ")
          ? message.subject
          : `Re: ${message.subject}`,
        body: replyBody.trim(),
        sentAt: BigInt(Date.now()),
      };
      await actor.replyToMessage(reply);
      setReplyBody("");
      toast.success("Reply sent");
      onReplySent();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await actor.deleteMessage(message.id);
      toast.success("Message deleted");
      onDeleted(message.id);
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  const senderName = getProfileName(profiles, message.fromUserId);
  const recipientName = getProfileName(profiles, message.toUserId);

  return (
    <div
      data-ocid="messages.thread.panel"
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Thread header */}
      <div
        className="shrink-0 border-b px-5 py-4"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
              {message.subject}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                From: <span className="text-slate-300">{senderName}</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                To: <span className="text-slate-300">{recipientName}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-600">
                {formatFullDate(message.sentAt)}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="messages.thread.delete.open_modal_button"
            className="h-7 w-7 shrink-0 p-0 text-slate-500 hover:text-red-400"
            onClick={() => setDeleteOpen(true)}
            title="Delete message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Message"
        description="This message will be permanently deleted. This cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Thread messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-0 divide-y" style={{ borderColor: "#1a2235" }}>
          {uniqueThread.map((msg, idx) => {
            const isFromCaller =
              msg.fromUserId.toString() === callerPrincipal.toString();
            const msgSenderName = getProfileName(profiles, msg.fromUserId);
            const isFirst = idx === 0;

            return (
              <div
                key={msg.id}
                data-ocid={`messages.thread.item.${idx + 1}`}
                className={cn(
                  "px-5 py-4",
                  isFromCaller ? "bg-white/[0.015]" : "",
                  isFirst ? "" : "",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Avatar initials */}
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-bold uppercase"
                      style={{
                        backgroundColor: isFromCaller ? "#f59e0b22" : "#1a2235",
                        color: isFromCaller ? "#f59e0b" : "#94a3b8",
                        border: `1px solid ${isFromCaller ? "#f59e0b44" : "#2a3347"}`,
                      }}
                    >
                      {msgSenderName.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold uppercase tracking-wider",
                        isFromCaller ? "text-amber-400" : "text-slate-300",
                      )}
                    >
                      {msgSenderName}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-600">
                    {formatRelativeTime(msg.sentAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">
                  {msg.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply box */}
      <div
        className="shrink-0 border-t p-4"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Textarea
              data-ocid="messages.thread.reply.textarea"
              value={replyBody}
              onChange={(e) => {
                setReplyBody(e.target.value);
                setReplyError("");
              }}
              onFocus={() => setReplyError("")}
              className="min-h-[72px] border font-mono text-xs text-white"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              placeholder="Type a reply…"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  void handleSendReply();
                }
              }}
            />
            {replyError && <FormError message={replyError} />}
          </div>
          <Button
            type="button"
            data-ocid="messages.thread.reply.submit_button"
            className="mt-0 gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            onClick={() => void handleSendReply()}
            disabled={isSendingReply}
            title="Send reply (Ctrl+Enter)"
          >
            {isSendingReply ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Reply className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSendingReply ? "Sending…" : "Reply"}
            </span>
          </Button>
        </div>
        <p className="mt-1.5 font-mono text-[9px] text-slate-700">
          Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}

// ─── Main MessagesPage ────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal();

  // Check for ?compose=true query param
  const search = useSearch({ strict: false }) as Record<string, string>;
  const openComposeFromQuery = search.compose === "true";

  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  // Open compose modal if query param is set
  useEffect(() => {
    if (openComposeFromQuery) {
      setComposeOpen(true);
    }
  }, [openComposeFromQuery]);

  // ── Load messages + profiles ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    try {
      const [inbox, sent, allProfiles] = await Promise.all([
        actor.getInboxMessages(),
        actor.getSentMessages(),
        actor.getAllProfiles(),
      ]);
      setInboxMessages(inbox.filter((m) => !m.deleted));
      setSentMessages(sent.filter((m) => !m.deleted));
      setProfiles(allProfiles);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Select message + mark as read ─────────────────────────────────────────
  async function handleSelectMessage(msg: Message) {
    setSelectedMessage(msg);
    // Only mark as read for inbox messages
    if (activeTab === "inbox" && !msg.read && actor) {
      try {
        await actor.markMessageRead(msg.id);
        setInboxMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
        );
      } catch {
        // Non-critical, don't toast
      }
    }
  }

  // ── Delete message ─────────────────────────────────────────────────────────
  function handleMessageDeleted(id: string) {
    setInboxMessages((prev) => prev.filter((m) => m.id !== id));
    setSentMessages((prev) => prev.filter((m) => m.id !== id));
    setSelectedMessage((prev) => (prev?.id === id ? null : prev));
  }

  // ── Reply sent — reload to get new reply ───────────────────────────────────
  function handleReplySent() {
    void loadData();
  }

  // ── Compose sent ───────────────────────────────────────────────────────────
  function handleComposeSent() {
    void loadData();
  }

  // ── All messages combined for thread reconstruction ────────────────────────
  const allMessages = [...inboxMessages, ...sentMessages];

  // Deduplicate by id
  const seenIds = new Set<string>();
  const uniqueAllMessages = allMessages.filter((m) => {
    if (seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });

  const unreadCount = inboxMessages.filter((m) => !m.read).length;

  return (
    <div
      data-ocid="messages.page"
      className="flex h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Messaging
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Compose modal */}
      {actor && callerPrincipal && (
        <ComposeModal
          open={composeOpen}
          onOpenChange={setComposeOpen}
          profiles={profiles}
          callerPrincipal={callerPrincipal}
          actor={actor}
          onSent={handleComposeSent}
          onSwitchToSent={() => setActiveTab("sent")}
        />
      )}

      {/* Page header strip */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: "#1a2235" }}
      >
        <MessageSquare className="h-4 w-4 text-amber-500" />
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white leading-none">
            Messaging
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Secure internal communications
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ──────────────────────────────────────────────────── */}
        <aside
          className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r"
          style={{ backgroundColor: "#0a0e1a", borderColor: "#1a2235" }}
        >
          {/* Compose button */}
          <div
            className="shrink-0 border-b p-3"
            style={{ borderColor: "#1a2235" }}
          >
            <Button
              type="button"
              data-ocid="messages.compose.open_modal_button"
              className="w-full gap-2 font-mono text-xs uppercase tracking-widest"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => setComposeOpen(true)}
            >
              <PenSquare className="h-3.5 w-3.5" />
              Compose
            </Button>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "inbox" | "sent");
              setSelectedMessage(null);
            }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList
              className="shrink-0 rounded-none border-b bg-transparent p-0 h-9"
              style={{ borderColor: "#1a2235" }}
            >
              <TabsTrigger
                value="inbox"
                data-ocid="messages.inbox.tab"
                className="h-9 flex-1 rounded-none border-b-2 border-transparent font-mono text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Inbox
                {unreadCount > 0 && (
                  <span
                    className="ml-1.5 rounded-full px-1 py-px font-mono text-[9px] font-bold"
                    style={{ backgroundColor: "#f59e0b22", color: "#f59e0b" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                data-ocid="messages.sent.tab"
                className="h-9 flex-1 rounded-none border-b-2 border-transparent font-mono text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Sent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <MessageListSkeleton />
                ) : inboxMessages.length === 0 ? (
                  <EmptyState
                    icon={<Inbox />}
                    message="No messages in inbox"
                    className="h-64"
                  />
                ) : (
                  <div className="space-y-0.5 p-2">
                    {inboxMessages.map((msg, idx) => (
                      <MessageRow
                        key={msg.id}
                        message={msg}
                        profiles={profiles}
                        isSelected={selectedMessage?.id === msg.id}
                        isSent={false}
                        index={idx + 1}
                        onClick={() => void handleSelectMessage(msg)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sent" className="mt-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <MessageListSkeleton />
                ) : sentMessages.length === 0 ? (
                  <EmptyState
                    icon={<Send />}
                    message="No sent messages"
                    className="h-64"
                  />
                ) : (
                  <div className="space-y-0.5 p-2">
                    {sentMessages.map((msg, idx) => (
                      <MessageRow
                        key={msg.id}
                        message={msg}
                        profiles={profiles}
                        isSelected={selectedMessage?.id === msg.id}
                        isSent={true}
                        index={idx + 1}
                        onClick={() => void handleSelectMessage(msg)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <main
          className="flex flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: "#080c18" }}
        >
          {selectedMessage && actor && callerPrincipal ? (
            <ThreadView
              message={selectedMessage}
              allMessages={uniqueAllMessages}
              profiles={profiles}
              callerPrincipal={callerPrincipal}
              actor={actor}
              onDeleted={handleMessageDeleted}
              onReplySent={handleReplySent}
            />
          ) : (
            <div
              data-ocid="messages.empty_state"
              className="flex h-full flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#1a2235" }}
                >
                  <MessageSquare className="h-7 w-7 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                    Select a message to read
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-slate-700">
                    or compose a new message
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-2 border font-mono text-[10px] uppercase tracking-widest text-slate-400"
                  style={{ borderColor: "#2a3347" }}
                  onClick={() => setComposeOpen(true)}
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  New Message
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="shrink-0 border-t px-4 py-3 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-500"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/MyProfilePage.tsx

```tsx
/**
 * MyProfilePage — Full profile view for the logged-in user.
 * Sensitive fields (rank, clearance, org role) are read-only for non-S2 users.
 * S2 admins retain full edit rights.
 */
import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { RankSelector } from "@/components/shared/RankSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BRANCH_RANK_CATEGORIES, CLEARANCE_LABELS } from "@/config/constants";

/** Infer branch and category from a rank string by scanning BRANCH_RANK_CATEGORIES */
function inferBranchCategory(rank: string): {
  branch: string;
  category: string;
} {
  if (!rank) return { branch: "", category: "" };
  for (const [b, categories] of Object.entries(BRANCH_RANK_CATEGORIES)) {
    for (const [cat, ranks] of Object.entries(categories)) {
      if (ranks.includes(rank)) return { branch: b, category: cat };
    }
  }
  return { branch: "", category: "" };
}
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useStorageClient } from "@/hooks/useStorageClient";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { getInitials } from "@/lib/formatters";
import { CheckCircle2, Lock, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function MyProfilePage() {
  const {
    profile,
    isS2Admin,
    isValidatedByCommander,
    refreshProfile,
    isLoading,
  } = usePermissions();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { client: storageClient, isReady: storageReady } = useStorageClient(
    identity ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [rankVal, setRankVal] = useState("");
  const [email, setEmail] = useState("");
  const [orgRole, setOrgRole] = useState("");
  const [clearanceLevel, setClearanceLevel] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      const parsed = parseDisplayName(profile.name ?? "");
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setMi(parsed.mi);
      const rank = profile.rank ?? "";
      setRankVal(rank);
      const inferred = inferBranchCategory(rank);
      setBranch(inferred.branch);
      setCategory(inferred.category);
      setEmail(profile.email ?? "");
      setOrgRole(profile.orgRole ?? "");
      setClearanceLevel(Number(profile.clearanceLevel ?? 0));
      setAvatarUrl(profile.avatarUrl ?? "");
    }
  }, [profile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storageClient || !storageReady) {
      toast.error("Storage not ready. Please try again.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      setAvatarUrl(url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!actor || !profile) return;
    setIsSaving(true);
    try {
      const effectiveRank = rankVal.trim() || profile.rank;
      const formattedName = formatDisplayName(
        effectiveRank,
        lastName,
        firstName,
        mi,
      );

      const updates: ExtendedProfile = {
        ...profile,
        name: formattedName,
        rank: effectiveRank,
        email: email.trim(),
        orgRole: isS2Admin ? orgRole.trim() : profile.orgRole,
        clearanceLevel: isS2Admin
          ? BigInt(clearanceLevel)
          : profile.clearanceLevel,
        avatarUrl: avatarUrl || undefined,
      };
      await actor.updateMyProfile(updates);
      await refreshProfile();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = profile?.name ? getInitials(profile.name) : "OP";
  const formattedName = profile?.name?.trim() || "OPERATOR";

  const clearanceLabelMap: Record<number, string> = CLEARANCE_LABELS ?? {};

  if (isLoading) {
    return (
      <div
        data-ocid="my_profile.loading_state"
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        data-ocid="my_profile.error_state"
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-red-400">
            Profile not found. Please complete registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="my_profile.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      {/* Breadcrumb */}
      <nav
        className="border-b px-6 py-2.5"
        style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-700" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                My Profile
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <ScrollArea className="flex-1">
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {/* Profile header */}
          <div
            className="mb-8 flex flex-col items-center gap-4 rounded border p-8 sm:flex-row sm:items-start sm:gap-6"
            style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
          >
            <div className="relative shrink-0">
              <Avatar
                className="h-24 w-24 border-2"
                style={{ borderColor: "rgba(245,158,11,0.3)" }}
              >
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={formattedName} />
                ) : null}
                <AvatarFallback
                  className="font-mono text-2xl font-bold"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleAvatarUpload(e)}
              />
              <button
                type="button"
                data-ocid="my_profile.avatar.upload_button"
                className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2"
                style={{
                  backgroundColor: "#1a2235",
                  borderColor: "#2a3347",
                  color: "#f59e0b",
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || !storageReady}
                title={isUploadingAvatar ? "Uploading..." : "Upload photo"}
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.15em] text-white">
                {formattedName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {profile.rank && (
                  <Badge
                    className="rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      borderColor: "rgba(245,158,11,0.3)",
                      color: "#f59e0b",
                    }}
                  >
                    {profile.rank}
                  </Badge>
                )}
                {isValidatedByCommander && (
                  <Badge
                    className="flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.08)",
                      borderColor: "rgba(34,197,94,0.25)",
                      color: "#4ade80",
                    }}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    S2 Verified
                  </Badge>
                )}
                {isS2Admin && (
                  <Badge
                    className="rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      borderColor: "rgba(245,158,11,0.3)",
                      color: "#f59e0b",
                    }}
                  >
                    S2 Admin
                  </Badge>
                )}
              </div>
              {profile.orgRole && (
                <p className="font-mono text-xs text-slate-500">
                  {profile.orgRole}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Sensitive Fields ───────────────────────────────────────── */}
            <section
              className="rounded border p-5"
              style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-slate-600" />
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Sensitive Fields
                </h2>
                {!isS2Admin && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
                    — managed by S2
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Clearance Level */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Clearance Level
                    </Label>
                    {!isS2Admin && (
                      <Lock className="h-2.5 w-2.5 text-slate-700" />
                    )}
                  </div>
                  <div
                    className="rounded border px-3 py-2"
                    style={{
                      borderColor: "#1a2235",
                      backgroundColor: "#0a0e1a",
                    }}
                  >
                    <p className="font-mono text-xs text-amber-500">
                      Level {Number(profile.clearanceLevel)}{" "}
                      <span className="text-slate-600">
                        —{" "}
                        {clearanceLabelMap[Number(profile.clearanceLevel)] ??
                          "Unknown"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Org Role */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Organizational Role
                    </Label>
                    {!isS2Admin && (
                      <Lock className="h-2.5 w-2.5 text-slate-700" />
                    )}
                  </div>
                  {isS2Admin ? (
                    <Input
                      value={orgRole}
                      onChange={(e) => setOrgRole(e.target.value)}
                      className="border font-mono text-xs text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded border px-3 py-2"
                      style={{
                        borderColor: "#1a2235",
                        backgroundColor: "#0a0e1a",
                      }}
                    >
                      <p className="font-mono text-xs text-slate-400">
                        {profile.orgRole || "—"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Verification status */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Verification Status
                  </Label>
                  <div
                    className="flex items-center gap-2 rounded border px-3 py-2"
                    style={{
                      borderColor: "#1a2235",
                      backgroundColor: "#0a0e1a",
                    }}
                  >
                    {isValidatedByCommander ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                        <p className="font-mono text-xs text-green-400">
                          Verified by S2
                        </p>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 text-slate-600" />
                        <p className="font-mono text-xs text-slate-600">
                          Pending S2 verification
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!isS2Admin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid="my_profile.request_correction.button"
                  className="mt-4 w-full border font-mono text-[10px] uppercase tracking-wider text-slate-500"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "#1a2235",
                  }}
                  onClick={() => setCorrectionDialogOpen(true)}
                >
                  Request Correction
                </Button>
              )}
            </section>

            {/* ── My Information ────────────────────────────────────────── */}
            <section
              className="rounded border p-5"
              style={{ borderColor: "#1a2235", backgroundColor: "#0d1525" }}
            >
              <div className="mb-4">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  My Information
                </h2>
              </div>

              <div className="space-y-4">
                {/* Name fields */}
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Name
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                        Last
                      </Label>
                      <Input
                        data-ocid="my_profile.name.last.input"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="border font-mono text-xs text-white"
                        style={{
                          backgroundColor: "#1a2235",
                          borderColor: "#2a3347",
                        }}
                        placeholder="SMITH"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                        First
                      </Label>
                      <Input
                        data-ocid="my_profile.name.first.input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border font-mono text-xs text-white"
                        style={{
                          backgroundColor: "#1a2235",
                          borderColor: "#2a3347",
                        }}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                        MI
                      </Label>
                      <Input
                        data-ocid="my_profile.name.mi.input"
                        value={mi}
                        onChange={(e) => setMi(e.target.value.slice(0, 1))}
                        className="border font-mono text-xs text-white"
                        style={{
                          backgroundColor: "#1a2235",
                          borderColor: "#2a3347",
                        }}
                        placeholder="A"
                        maxLength={1}
                      />
                    </div>
                  </div>
                </div>

                {/* Rank selector */}
                <RankSelector
                  branch={branch}
                  category={category}
                  rank={rankVal}
                  onBranchChange={setBranch}
                  onCategoryChange={setCategory}
                  onRankChange={setRankVal}
                  variant="modal"
                />

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border font-mono text-xs text-white"
                    style={{
                      backgroundColor: "#1a2235",
                      borderColor: "#2a3347",
                    }}
                  />
                </div>

                {/* Preview */}
                {(lastName || firstName) && (
                  <div
                    className="rounded border px-3 py-2"
                    style={{
                      borderColor: "#1a2235",
                      backgroundColor: "#0a0e1a",
                    }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                      Preview
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-amber-400">
                      {formatDisplayName(
                        rankVal || profile.rank,
                        lastName,
                        firstName,
                        mi,
                      )}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Save / Cancel actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              data-ocid="my_profile.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-400"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              onClick={() => {
                // Re-populate from profile
                if (profile) {
                  const parsed = parseDisplayName(profile.name ?? "");
                  setLastName(parsed.lastName);
                  setFirstName(parsed.firstName);
                  setMi(parsed.mi);
                  const rank = profile.rank ?? "";
                  setRankVal(rank);
                  const inferred = inferBranchCategory(rank);
                  setBranch(inferred.branch);
                  setCategory(inferred.category);
                  setEmail(profile.email ?? "");
                  setOrgRole(profile.orgRole ?? "");
                  setAvatarUrl(profile.avatarUrl ?? "");
                }
              }}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              type="button"
              data-ocid="my_profile.save_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </main>
      </ScrollArea>

      {/* Request Correction dialog */}
      <Dialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
      >
        <DialogContent
          data-ocid="my_profile.correction.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          className="border font-mono"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Request Correction
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-slate-500">
              Sensitive fields are managed by your S2 administrator.
            </DialogDescription>
          </DialogHeader>
          <div
            className="rounded border px-4 py-3"
            style={{ borderColor: "#1a2235", backgroundColor: "#0a0e1a" }}
          >
            <p className="font-mono text-xs leading-relaxed text-slate-400">
              To correct your rank, name, clearance level, or organizational
              role, contact your S2 administrator directly. They can update and
              re-verify your profile through the Admin Panel.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              data-ocid="my_profile.correction.close_button"
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => setCorrectionDialogOpen(false)}
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer
        className="border-t px-6 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-500"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/NetworkModeSetupPage.tsx

```tsx
import { NETWORK_MODE_CONFIGS, type NetworkMode } from "@/config/constants";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const SENSITIVITY_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "#64748b" },
  elevated: { label: "Elevated", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  maximum: { label: "Maximum", color: "#ef4444" },
};

const MILITARY_MODES: NetworkMode[] = ["military-nipr", "military-sipr"];
const CORPORATE_MODES: NetworkMode[] = [
  "corporate-standard",
  "corporate-secure",
];

function ModeCard({
  mode,
  selected,
  onSelect,
}: {
  mode: NetworkMode;
  selected: boolean;
  onSelect: () => void;
}) {
  const config = NETWORK_MODE_CONFIGS[mode];
  const isMilitary = config.group === "military";
  const accentColor = isMilitary ? "#60a5fa" : "#a78bfa";
  const accentBg = isMilitary
    ? "rgba(59,130,246,0.08)"
    : "rgba(139,92,246,0.08)";
  const accentBorder = isMilitary
    ? "rgba(59,130,246,0.3)"
    : "rgba(139,92,246,0.3)";

  const sensitivity = SENSITIVITY_LABELS[config.monitoringSensitivity];

  const ocidMap: Record<NetworkMode, string> = {
    "military-nipr": "network_mode_setup.military_nipr.card",
    "military-sipr": "network_mode_setup.military_sipr.card",
    "corporate-standard": "network_mode_setup.corporate_standard.card",
    "corporate-secure": "network_mode_setup.corporate_secure.card",
  };

  return (
    <motion.button
      type="button"
      data-ocid={ocidMap[mode]}
      onClick={onSelect}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="relative w-full rounded border p-4 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-amber-500/40"
      style={{
        backgroundColor: selected ? "rgba(245,158,11,0.07)" : "#0f1626",
        borderColor: selected ? "#f59e0b" : accentBorder,
        boxShadow: selected
          ? "0 0 0 1px rgba(245,158,11,0.15), 0 0 16px rgba(245,158,11,0.06)"
          : "none",
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <CheckCircle2
          className="absolute right-3 top-3 h-4 w-4"
          style={{ color: "#f59e0b" }}
        />
      )}

      {/* Short code badge */}
      <span
        className="mb-3 inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{
          backgroundColor: accentBg,
          color: accentColor,
          border: `1px solid ${accentBorder}`,
        }}
      >
        {config.shortCode}
      </span>

      {/* Label */}
      <p className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-white">
        {config.label}
      </p>

      {/* Description */}
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400">
        {config.description}
      </p>

      {/* Monitoring sensitivity */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          Monitoring:
        </span>
        <span
          className="font-mono text-[9px] uppercase tracking-widest font-semibold"
          style={{ color: sensitivity.color }}
        >
          {sensitivity.label}
        </span>
      </div>
    </motion.button>
  );
}

export default function NetworkModeSetupPage() {
  const { setMode } = useNetworkMode();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NetworkMode | null>(null);

  function handleConfirm() {
    if (!selected) return;
    setMode(selected);
    void navigate({ to: "/settings" });
  }

  return (
    <div
      data-ocid="network_mode_setup.page"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
          >
            <ShieldCheck className="h-7 w-7" style={{ color: "#f59e0b" }} />
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.25em] text-white">
            Network Mode Setup
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-500">
            Select your deployment network type
          </p>
        </motion.div>

        {/* Group: Military */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(59,130,246,0.2)" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/70">
              Military
            </span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(59,130,246,0.2)" }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {MILITARY_MODES.map((m) => (
              <ModeCard
                key={m}
                mode={m}
                selected={selected === m}
                onSelect={() => setSelected(m)}
              />
            ))}
          </div>
        </motion.div>

        {/* Group: Corporate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.14,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(139,92,246,0.2)" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
              Corporate
            </span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(139,92,246,0.2)" }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CORPORATE_MODES.map((m) => (
              <ModeCard
                key={m}
                mode={m}
                selected={selected === m}
                onSelect={() => setSelected(m)}
              />
            ))}
          </div>
        </motion.div>

        {/* Confirm button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          <button
            type="button"
            data-ocid="network_mode_setup.confirm_button"
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full rounded border px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            style={{
              backgroundColor: selected ? "#f59e0b" : "#1a2235",
              color: selected ? "#0a0e1a" : "#64748b",
              borderColor: selected ? "#f59e0b" : "#1a2235",
            }}
          >
            {selected
              ? `Confirm — ${NETWORK_MODE_CONFIGS[selected].shortCode}`
              : "Select a Mode to Continue"}
          </button>

          {/* Info note */}
          <div
            className="flex items-start gap-2.5 rounded border px-4 py-3"
            style={{
              backgroundColor: "rgba(100,116,139,0.05)",
              borderColor: "#1a2235",
            }}
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
            <p className="font-mono text-[10px] leading-relaxed text-slate-600">
              This can be changed later in Settings (S2 admin only). This
              setting is currently stored locally until a future backend update.
            </p>
          </div>

          {/* Warning for SIPR */}
          {selected === "military-sipr" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2.5 rounded border px-4 py-3"
              style={{
                backgroundColor: "rgba(239,68,68,0.05)",
                borderColor: "rgba(239,68,68,0.25)",
              }}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="font-mono text-[10px] leading-relaxed text-red-400/80">
                SIPR mode enables maximum monitoring sensitivity. All document
                access, messaging, and user activity will be subject to
                heightened anomaly detection.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

```

---

## FILE: src/pages/NotificationsPage.tsx

```tsx
import type { Notification } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatRelativeTime } from "@/lib/formatters";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell, FolderOpen, MessageSquare, Shield } from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNotificationIcon(type: string) {
  switch (type) {
    case "security":
      return (
        <Shield className="h-4 w-4 shrink-0" style={{ color: "#f87171" }} />
      );
    case "access":
      return (
        <FolderOpen className="h-4 w-4 shrink-0" style={{ color: "#60a5fa" }} />
      );
    case "message":
      return (
        <MessageSquare
          className="h-4 w-4 shrink-0"
          style={{ color: "#4ade80" }}
        />
      );
    default:
      // "system" and everything else
      return <Bell className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />;
  }
}

function getIconBg(type: string): string {
  switch (type) {
    case "security":
      return "rgba(248,113,113,0.1)";
    case "access":
      return "rgba(96,165,250,0.1)";
    case "message":
      return "rgba(74,222,128,0.1)";
    default:
      return "rgba(245,158,11,0.1)";
  }
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function NotificationsSkeleton() {
  return (
    <div
      data-ocid="notifications.loading_state"
      className="divide-y"
      style={{ borderColor: "#1a2235" }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4">
          <SkeletonCard
            width="32px"
            height="32px"
            className="shrink-0 rounded"
          />
          <div className="flex-1 space-y-2">
            <SkeletonCard height="10px" width="40%" />
            <SkeletonCard height="10px" width="75%" />
          </div>
          <SkeletonCard height="10px" width="50px" className="shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── NotificationsPage ────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications", principalStr],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getMyNotifications();
      return items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mark single read ──────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return;
      await actor.markNotificationRead(id);
    },
    onSuccess: () => {
      // Invalidate both the full notifications list and the bell badge count
      void queryClient.invalidateQueries({
        queryKey: ["notifications", principalStr],
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  // ── Mark all read ─────────────────────────────────────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      // Invalidate both the full notifications list and the bell badge count
      void queryClient.invalidateQueries({
        queryKey: ["notifications", principalStr],
      });
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "unreadNotificationCount"],
      });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  return (
    <div
      data-ocid="notifications.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
              >
                <Bell className="h-6 w-6" style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <Badge
                      className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
                      style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                  {isLoading
                    ? "Loading…"
                    : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {/* Mark all read */}
            <Button
              type="button"
              data-ocid="notifications.mark_all.button"
              variant="outline"
              size="sm"
              disabled={
                markAllReadMutation.isPending ||
                unreadCount === 0 ||
                notifications.length === 0
              }
              onClick={() => void markAllReadMutation.mutate()}
              className="border font-mono text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300 disabled:opacity-40"
              style={{
                borderColor: "rgba(245,158,11,0.3)",
                backgroundColor: "transparent",
              }}
            >
              {markAllReadMutation.isPending ? "Marking…" : "Mark All Read"}
            </Button>
          </div>

          {/* Content card */}
          <div
            className="overflow-hidden rounded border"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {isLoading ? (
              <NotificationsSkeleton />
            ) : notifications.length === 0 ? (
              <div data-ocid="notifications.empty_state">
                <EmptyState
                  icon={<Bell />}
                  message="No notifications"
                  className="py-20"
                />
              </div>
            ) : (
              <ScrollArea>
                <div
                  data-ocid="notifications.list.table"
                  className="divide-y"
                  style={{ borderColor: "#1a2235" }}
                >
                  {notifications.map((notif, idx) => {
                    const isUnread = !notif.read;
                    return (
                      <button
                        type="button"
                        key={notif.id}
                        data-ocid={`notifications.item.${idx + 1}`}
                        onClick={() => {
                          if (isUnread && !markReadMutation.isPending) {
                            void markReadMutation.mutate(notif.id);
                          }
                        }}
                        className="relative flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                        style={{
                          backgroundColor: isUnread
                            ? "rgba(245,158,11,0.04)"
                            : undefined,
                          borderLeft: isUnread
                            ? "2px solid #f59e0b"
                            : "2px solid transparent",
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                          style={{
                            backgroundColor: getIconBg(notif.notificationType),
                          }}
                        >
                          {getNotificationIcon(notif.notificationType)}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-mono text-[11px] uppercase tracking-wider ${
                              isUnread
                                ? "font-bold text-white"
                                : "font-medium text-slate-400"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-slate-500">
                            {notif.body}
                          </p>
                        </div>

                        {/* Right side: timestamp + mark read */}
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="font-mono text-[9px] text-slate-600">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                          {isUnread && (
                            <span
                              className="font-mono text-[9px] uppercase tracking-wider text-amber-500 hover:text-amber-400"
                              aria-label="Click to mark as read"
                            >
                              Mark read
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/OnboardingPage.tsx

```tsx
/**
 * OnboardingPage — Three-step first-login onboarding wizard.
 *
 * MOTOKO BACKLOG (DO NOT BUILD — future session):
 * - OrgAccessRequest entity (requestId, principalId, orgId, status: pending/approved/denied/confirmed)
 * - Organization entity (orgId, name, UIC, type, adminPrincipal)
 * - org-scoped invite links
 * - Backend enforcement of org placement (orgId scoping on all queries)
 * - registrationStatus on ExtendedProfile
 */

import type { ExtendedProfile } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Static workspace list ─────────────────────────────────────────────────

interface Workspace {
  id: string;
  name: string;
  uic: string;
  type: string;
  category: string;
}

const UNIT_TYPES = [
  "Battalion",
  "Brigade",
  "Company/Platoon",
  "Division HQ",
  "Corporate",
  "Other",
] as const;

const MODES = ["Military", "Corporate"] as const;

const WORKSPACES: Workspace[] = [
  {
    id: "w1",
    name: "1-501st PIR",
    uic: "WA1AA0",
    type: "Army Infantry BN",
    category: "Military",
  },
  {
    id: "w2",
    name: "2-504th PIR",
    uic: "WA2BB0",
    type: "Army Infantry BN",
    category: "Military",
  },
  {
    id: "w3",
    name: "HHC 82nd ABN DIV",
    uic: "WA3CC0",
    type: "Army Division HQ",
    category: "Military",
  },
  {
    id: "w4",
    name: "1st BDE, 82nd ABN DIV",
    uic: "WA4DD0",
    type: "Army Brigade",
    category: "Military",
  },
  {
    id: "w5",
    name: "Corporate Workspace · Standard",
    uic: "",
    type: "Business",
    category: "Corporate",
  },
  {
    id: "w6",
    name: "Corporate Workspace · Secure",
    uic: "",
    type: "Enterprise",
    category: "Corporate",
  },
];

// ─── Step indicator ─────────────────────────────────────────────────────────

const STEP_LABELS = ["Identity Verified", "Request Access", "Submitted"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? "rgba(34,197,94,0.15)"
                    : isActive
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(255,255,255,0.04)",
                  borderColor: isDone
                    ? "rgba(34,197,94,0.5)"
                    : isActive
                      ? "rgba(245,158,11,0.6)"
                      : "#2a3347",
                  color: isDone ? "#22c55e" : isActive ? "#f59e0b" : "#4b5563",
                }}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className="font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: isActive ? "#f59e0b" : isDone ? "#22c55e" : "#4b5563",
                }}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className="mx-3 mb-5 h-px w-10 transition-all duration-300"
                style={{
                  backgroundColor:
                    stepNum < currentStep ? "rgba(34,197,94,0.4)" : "#2a3347",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Workspace card ─────────────────────────────────────────────────────────

function WorkspaceCard({
  workspace,
  index,
  selected,
  onSelect,
}: {
  workspace: Workspace;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={`onboarding.workspace.item.${index}`}
      onClick={onSelect}
      className="w-full rounded border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: selected ? "rgba(245,158,11,0.06)" : "#0f1626",
        borderColor: selected ? "rgba(245,158,11,0.5)" : "#1a2235",
        boxShadow: selected ? "0 0 0 1px rgba(245,158,11,0.25)" : "none",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate font-mono text-xs font-semibold uppercase tracking-wider"
            style={{ color: selected ? "#f59e0b" : "#e2e8f0" }}
          >
            {workspace.name}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-500">
            {workspace.uic ? `UIC: ${workspace.uic} · ` : ""}
            {workspace.type}
          </p>
        </div>
        <span
          className="shrink-0 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
          style={{
            backgroundColor:
              workspace.category === "Military"
                ? "rgba(59,130,246,0.08)"
                : "rgba(139,92,246,0.08)",
            borderColor:
              workspace.category === "Military"
                ? "rgba(59,130,246,0.3)"
                : "rgba(139,92,246,0.3)",
            color: workspace.category === "Military" ? "#60a5fa" : "#a78bfa",
          }}
        >
          {workspace.category}
        </span>
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3" style={{ color: "#f59e0b" }} />
          <span
            className="font-mono text-[9px] uppercase tracking-wider"
            style={{ color: "#f59e0b" }}
          >
            Selected
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type SubStep = "select" | "confirm";

export default function OnboardingPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  // Redirect already-registered users away from onboarding
  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getMyProfile()
      .then((profile) => {
        if (!profile || !profile.registered) return;
        if (profile.isValidatedByCommander || profile.isS2Admin) {
          void navigate({ to: "/" });
        } else {
          void navigate({ to: "/pending" });
        }
      })
      .catch(() => {
        /* ignore — not registered yet */
      });
  }, [actor, isFetching, navigate]);

  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<SubStep>("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submittedWorkspace, setSubmittedWorkspace] =
    useState<Workspace | null>(null);
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customUnitName, setCustomUnitName] = useState("");
  const autoAdvanced = useRef(false);

  // Create workspace form state
  const [createName, setCreateName] = useState("");
  const [createUic, setCreateUic] = useState("");
  const [createType, setCreateType] = useState("");
  const [createMode, setCreateMode] = useState("");

  // Step 1: auto-advance after 1.5s
  useEffect(() => {
    if (step === 1 && !autoAdvanced.current) {
      autoAdvanced.current = true;
      const t = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const filteredWorkspaces = WORKSPACES.filter(
    (w) =>
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.uic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Show "Create New Workspace" when there's a search term and no matches
  const showCreateWorkspace =
    searchQuery.trim().length > 0 && filteredWorkspaces.length === 0;

  const canCreateWorkspace =
    createName.trim() && createUic.trim() && createType && createMode;

  const handleEstablishWorkspace = () => {
    if (!canCreateWorkspace) return;
    const ws = {
      name: createName.trim(),
      uic: createUic.trim().toUpperCase(),
      type: createType,
      mode: createMode,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("omnis_workspace", JSON.stringify(ws));
    localStorage.setItem("omnis_founding_s2", "true");
    void navigate({ to: "/validate-commander" });
  };

  const handleContinue = () => {
    if (selectedWorkspace || (showCustomUnit && customUnitName.trim()))
      setSubStep("confirm");
  };

  const effectiveWorkspace: Workspace | null =
    showCustomUnit && customUnitName.trim()
      ? {
          id: "custom",
          name: customUnitName.trim(),
          uic: "",
          type: "Custom",
          category: "Other",
        }
      : selectedWorkspace;

  const handleSubmitRequest = async () => {
    if (!effectiveWorkspace || !identity) return;
    setSubmitting(true);

    const principalId = identity.getPrincipal();
    const principalStr = principalId.toString();

    // Store request in localStorage (frontend-only; backend enforcement is a Motoko backlog item)
    localStorage.setItem(
      `omnis_org_request_${principalStr}`,
      JSON.stringify({
        workspace: effectiveWorkspace.name,
        requestedAt: new Date().toISOString(),
      }),
    );

    // Notify all S2 admins
    if (actor) {
      try {
        const allProfiles: ExtendedProfile[] = await actor.getAllProfiles();
        const s2Admins = allProfiles.filter((p) => p.isS2Admin);
        const currentProfile = allProfiles.find(
          (p) => p.principalId.toString() === principalStr,
        );
        const userName =
          currentProfile?.name || `User (${principalStr.slice(0, 8)}...)`;

        await Promise.all(
          s2Admins.map((admin) =>
            actor.createSystemNotification({
              id: crypto.randomUUID(),
              title: "New Access Request",
              body: `${userName} has requested access to ${effectiveWorkspace.name}`,
              userId: admin.principalId,
              notificationType: "access_request",
              createdAt: BigInt(Date.now()),
              read: false,
              metadata: undefined,
            }),
          ),
        );
      } catch {
        // Non-blocking: if notification fails, the request is still stored
      }
    }

    setSubmittedWorkspace(effectiveWorkspace);
    setStep(3);
    setSubmitting(false);
  };

  const displayName =
    submittedWorkspace?.name ?? effectiveWorkspace?.name ?? "your organization";

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-8">
        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <div
          className="rounded-lg border p-6 shadow-2xl"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          {/* ── Step 1: Identity Verified ── */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(34,197,94,0.1)",
                  borderColor: "rgba(34,197,94,0.4)",
                }}
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Identity Verified
                </h2>
                <p className="mt-2 font-mono text-xs text-slate-500">
                  Your Internet Identity has been authenticated.
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Continuing…
                </span>
              </div>
            </div>
          )}

          {/* ── Step 2: Select workspace ── */}
          {step === 2 && subStep === "select" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                  Select Your Organization
                </h2>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  Find and request access to your unit or organization
                  workspace.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  data-ocid="onboarding.search.input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, UIC, or type..."
                  className="w-full rounded border py-2 pl-8 pr-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: "#1a2235",
                    borderColor: "#2a3347",
                  }}
                />
              </div>

              {/* Workspace list */}
              <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                {filteredWorkspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    index={WORKSPACES.indexOf(ws) + 1}
                    selected={selectedWorkspace?.id === ws.id}
                    onSelect={() => {
                      setSelectedWorkspace(ws);
                      setShowCustomUnit(false);
                      setCustomUnitName("");
                    }}
                  />
                ))}

                {/* Create New Workspace — appears when search has no matches */}
                {showCreateWorkspace && (
                  <div
                    className="rounded border p-4 space-y-4"
                    style={{
                      borderColor: "rgba(245,158,11,0.4)",
                      borderStyle: "dashed",
                      backgroundColor: "rgba(245,158,11,0.03)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Plus
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: "#f59e0b" }}
                      />
                      <div>
                        <p
                          className="font-mono text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: "#f59e0b" }}
                        >
                          Establish New Workspace
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] leading-relaxed text-slate-500">
                          No workspace found for &ldquo;{searchQuery}&rdquo;.
                          You can establish a new isolated workspace below.
                        </p>
                      </div>
                    </div>

                    {/* Warning */}
                    <div
                      className="flex items-start gap-2 rounded border px-3 py-2"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.05)",
                        borderColor: "rgba(245,158,11,0.15)",
                      }}
                    >
                      <AlertTriangle
                        className="mt-0.5 h-3 w-3 shrink-0"
                        style={{ color: "#f59e0b" }}
                      />
                      <p className="font-mono text-[9px] leading-relaxed text-amber-400/70">
                        This will create a new isolated workspace. You will be
                        assigned as Provisional S2 Administrator.
                      </p>
                    </div>

                    {/* Create form */}
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label
                          htmlFor="create-unit-name"
                          className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                        >
                          Unit Name
                        </label>
                        <input
                          id="create-unit-name"
                          data-ocid="onboarding.create.name.input"
                          type="text"
                          value={createName}
                          onChange={(e) => setCreateName(e.target.value)}
                          placeholder="1-501st PIR"
                          className="w-full rounded border px-3 py-1.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#0a0e1a",
                            borderColor: "#2a3347",
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="create-unit-uic"
                          className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                        >
                          Unit Identification Code (UIC)
                        </label>
                        <input
                          id="create-unit-uic"
                          data-ocid="onboarding.create.uic.input"
                          type="text"
                          value={createUic}
                          onChange={(e) =>
                            setCreateUic(e.target.value.toUpperCase())
                          }
                          placeholder="WH9RT0"
                          maxLength={8}
                          className="w-full rounded border px-3 py-1.5 font-mono text-xs uppercase text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#0a0e1a",
                            borderColor: "#2a3347",
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label
                            htmlFor="create-unit-type"
                            className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                          >
                            Unit Type
                          </label>
                          <select
                            id="create-unit-type"
                            data-ocid="onboarding.create.type.select"
                            value={createType}
                            onChange={(e) => setCreateType(e.target.value)}
                            className="w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#0a0e1a",
                              borderColor: "#2a3347",
                            }}
                          >
                            <option value="">Select type…</option>
                            {UNIT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="create-unit-mode"
                            className="font-mono text-[9px] uppercase tracking-wider text-slate-500"
                          >
                            Mode
                          </label>
                          <select
                            id="create-unit-mode"
                            data-ocid="onboarding.create.mode.select"
                            value={createMode}
                            onChange={(e) => setCreateMode(e.target.value)}
                            className="w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#0a0e1a",
                              borderColor: "#2a3347",
                            }}
                          >
                            <option value="">Select mode…</option>
                            {MODES.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        data-ocid="onboarding.create.establish.primary_button"
                        disabled={!canCreateWorkspace}
                        onClick={handleEstablishWorkspace}
                        className="h-9 w-full rounded font-mono text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          backgroundColor: canCreateWorkspace
                            ? "#f59e0b"
                            : "#1a2235",
                          color: canCreateWorkspace ? "#0a0e1a" : "#4b5563",
                        }}
                      >
                        Establish Workspace
                      </button>
                    </div>
                  </div>
                )}

                {/* No results and no search — empty list state */}
                {!showCreateWorkspace && filteredWorkspaces.length === 0 && (
                  <p className="py-4 text-center font-mono text-[10px] text-slate-600">
                    No workspaces found. Type a UIC or unit name to search.
                  </p>
                )}

                {/* "Request Custom Access" option (was "My unit isn't listed") */}
                <button
                  type="button"
                  data-ocid="onboarding.custom_unit.toggle"
                  onClick={() => {
                    setShowCustomUnit((v) => !v);
                    setSelectedWorkspace(null);
                  }}
                  className="flex w-full items-center gap-2 rounded border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    backgroundColor: showCustomUnit
                      ? "rgba(245,158,11,0.06)"
                      : "transparent",
                    borderColor: showCustomUnit
                      ? "rgba(245,158,11,0.4)"
                      : "#2a3347",
                    borderStyle: "dashed",
                  }}
                >
                  <ChevronDown
                    className="h-3 w-3 transition-transform shrink-0"
                    style={{
                      color: "#64748b",
                      transform: showCustomUnit
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Request Custom Access
                  </span>
                </button>

                {showCustomUnit && (
                  <div
                    className="space-y-2 rounded border px-4 py-3"
                    style={{
                      backgroundColor: "#0a111f",
                      borderColor: "#1e2d45",
                    }}
                  >
                    <input
                      data-ocid="onboarding.custom_unit.input"
                      type="text"
                      value={customUnitName}
                      onChange={(e) => setCustomUnitName(e.target.value)}
                      placeholder="Enter your unit or organization name..."
                      className="w-full rounded border bg-transparent py-2 px-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1"
                      style={{ borderColor: "#2a3347" }}
                    />
                    <p className="font-mono text-[9px] leading-relaxed text-slate-600">
                      Submit a custom access request. Your S2 admin will review
                      your request.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                data-ocid="onboarding.continue_button"
                disabled={
                  !selectedWorkspace &&
                  !(showCustomUnit && customUnitName.trim())
                }
                onClick={handleContinue}
                className="mt-2 h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  backgroundColor:
                    selectedWorkspace ||
                    (showCustomUnit && customUnitName.trim())
                      ? "#f59e0b"
                      : "#1a2235",
                  color:
                    selectedWorkspace ||
                    (showCustomUnit && customUnitName.trim())
                      ? "#0a0e1a"
                      : "#4b5563",
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ── Step 2 sub-step: Confirm ── */}
          {step === 2 && subStep === "confirm" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                  Confirm Organization
                </h2>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  Please verify this is correct before submitting your request.
                </p>
              </div>

              {/* Confirmation box */}
              <div
                className="rounded border px-4 py-4"
                style={{
                  backgroundColor: "rgba(245,158,11,0.04)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Requesting access to
                </p>
                <p
                  className="mt-1 font-mono text-sm font-bold uppercase tracking-wider"
                  style={{ color: "#f59e0b" }}
                >
                  {effectiveWorkspace?.name}
                </p>
                {effectiveWorkspace?.uic && (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                    UIC: {effectiveWorkspace.uic} · {effectiveWorkspace.type}
                  </p>
                )}
                {showCustomUnit && (
                  <p className="mt-1 font-mono text-[9px] text-slate-600">
                    Custom workspace — will be created when your S2 admin
                    activates the system.
                  </p>
                )}
              </div>

              <p className="font-mono text-xs text-slate-500">
                Is this correct?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="onboarding.cancel_button"
                  onClick={() => setSubStep("select")}
                  disabled={submitting}
                  className="h-10 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300 disabled:opacity-40"
                  style={{ borderColor: "#2a3347" }}
                >
                  Go Back
                </button>
                <button
                  type="button"
                  data-ocid="onboarding.confirm_button"
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="h-10 flex-1 rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-40"
                  style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Submitted ── */}
          {step === 3 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.08)",
                  borderColor: "rgba(245,158,11,0.35)",
                }}
              >
                <CheckCircle2
                  className="h-8 w-8"
                  style={{ color: "#f59e0b" }}
                />
              </div>

              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Request Submitted
                </h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-500">
                  Your request to join{" "}
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>
                    {displayName}
                  </span>{" "}
                  is pending approval by your S2 or security officer.
                </p>
                <p className="mt-2 font-mono text-xs text-slate-600">
                  You will be notified once your access is confirmed.
                </p>
              </div>

              <button
                type="button"
                data-ocid="onboarding.finish_button"
                onClick={() => void navigate({ to: "/pending" })}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Continue to Omnis
              </button>
            </div>
          )}
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-[10px] text-slate-700">
          Access is strictly monitored. Unauthorized requests are logged.
        </p>
      </div>

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}

```

---

## FILE: src/pages/PendingVerificationPage.tsx

```tsx
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ShieldAlert, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DenialRecord {
  reason: string;
  deniedAt: string;
}

export default function PendingVerificationPage() {
  const { clear, identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  const [denialRecord, setDenialRecord] = useState<DenialRecord | null>(null);

  useEffect(() => {
    if (!principalStr) return;
    const raw = localStorage.getItem(`omnis_denial_${principalStr}`);
    if (raw) {
      try {
        setDenialRecord(JSON.parse(raw) as DenialRecord);
      } catch {
        /* ignore */
      }
    }
  }, [principalStr]);

  const handleSignOut = () => {
    clear();
    window.location.href = "/login";
  };

  const handleRequestReview = () => {
    // Do not remove denial record — contact S2 directly
    // The denial record is cleared only when S2 approves the user
    toast.info("Contact your S2 or security officer to appeal this decision.");
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex max-w-md flex-col items-center gap-8">
        {denialRecord ? (
          /* ── Denied state ─────────────────────────────────────── */
          <>
            {/* Icon */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_0_40px_rgba(239,68,68,0.2)]"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderColor: "rgba(239, 68, 68, 0.35)",
              }}
            >
              <ShieldX className="h-10 w-10 text-red-400" />
            </div>

            {/* Heading */}
            <div className="flex flex-col items-center gap-3">
              <h1 className="font-mono text-2xl font-bold uppercase tracking-widest text-red-400">
                ACCESS DENIED
              </h1>
              <p className="font-mono text-sm text-slate-400">
                Your access request was denied.
              </p>
            </div>

            {/* Divider */}
            <div className="flex w-64 items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "#1a2235" }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                DENIED
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "#1a2235" }}
              />
            </div>

            {/* Reason panel */}
            <div
              className="w-full rounded border px-4 py-4 text-left"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                borderColor: "rgba(239, 68, 68, 0.3)",
              }}
            >
              <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-red-400/70">
                Reason
              </p>
              <p className="font-mono text-xs leading-relaxed text-slate-300">
                {denialRecord.reason}
              </p>
            </div>

            {/* Instruction */}
            <p className="max-w-sm font-mono text-xs leading-relaxed text-slate-500">
              Contact your S2 or security officer to appeal this decision.
            </p>

            {/* Request Review button */}
            <button
              type="button"
              data-ocid="pending.request_review_button"
              onClick={handleRequestReview}
              className="rounded border px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all hover:bg-amber-500/10"
              style={{
                borderColor: "rgba(245,158,11,0.4)",
                color: "#f59e0b",
              }}
            >
              Request Review
            </button>

            {/* Sign out */}
            <button
              type="button"
              data-ocid="pending.sign_out_button"
              onClick={handleSignOut}
              className="font-mono text-xs uppercase tracking-widest text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline"
            >
              Sign Out
            </button>
          </>
        ) : (
          /* ── Pending state ────────────────────────────────────── */
          <>
            {/* Icon */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_0_40px_oklch(0.72_0.175_70_/_0.25)]"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                borderColor: "rgba(245, 158, 11, 0.35)",
              }}
            >
              <ShieldAlert className="h-10 w-10" style={{ color: "#f59e0b" }} />
            </div>

            {/* Heading */}
            <div className="flex flex-col items-center gap-3">
              <h1
                className="font-mono text-2xl font-bold uppercase tracking-widest"
                style={{ color: "#f0f4ff" }}
              >
                PENDING VERIFICATION
              </h1>
              <p className="font-mono text-sm text-slate-400">
                Your access is pending S2 verification.
              </p>
            </div>

            {/* Divider */}
            <div className="flex w-64 items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "#1a2235" }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                HOLD
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "#1a2235" }}
              />
            </div>

            {/* Body */}
            <p className="max-w-sm font-mono text-xs leading-relaxed text-slate-500">
              You will be notified when your account is activated. If you
              believe this is an error, contact your S2 or security officer.
            </p>

            {/* Status indicator */}
            <div
              className="flex w-full items-center gap-3 rounded border px-4 py-3"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Awaiting S2 approval
              </span>
            </div>

            {/* Sign out */}
            <button
              type="button"
              data-ocid="pending.sign_out_button"
              onClick={handleSignOut}
              className="font-mono text-xs uppercase tracking-widest text-slate-600 underline-offset-4 transition-colors hover:text-slate-400 hover:underline"
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <div className="absolute bottom-6 font-mono text-xs text-slate-700">
        OMNIS-OS · ACCESS RESTRICTED
      </div>
    </div>
  );
}

```

---

## FILE: src/pages/PersonnelPage.tsx

```tsx
/**
 * PersonnelPage — Directory + S2 Onboarding Queue + profile field locking
 *
 * MOTOKO BACKLOG (future session):
 * - verified, verifiedBy, verifiedAt fields on ExtendedProfile for true backend enforcement
 * - lockProfileFields / unlockProfileFields S2-only backend functions
 * - registrationStatus (pending/verified/active/suspended) on ExtendedProfile
 * - Backend-enforced rejection of field updates on verified profiles
 */

import type { ExtendedProfile } from "@/backend.d";
import { TopNav } from "@/components/layout/TopNav";
import { ClearanceBadge } from "@/components/shared/ClearanceBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormError } from "@/components/shared/FormError";
import { RankSelector } from "@/components/shared/RankSelector";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CLEARANCE_LABELS } from "@/config/constants";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName, parseDisplayName } from "@/lib/displayName";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  Pencil,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarCircle({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    return (
      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-[#2a3347]">
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tracking-wider"
      style={{
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        color: "#f59e0b",
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Personnel Card ───────────────────────────────────────────────────────────

interface PersonnelCardProps {
  profile: ExtendedProfile;
  index: number;
  isS2Admin: boolean;
  onEdit: (profile: ExtendedProfile) => void;
}

function PersonnelCard({
  profile,
  index,
  isS2Admin,
  onEdit,
}: PersonnelCardProps) {
  return (
    <div
      data-ocid={`personnel.card.${index}`}
      className="group relative flex flex-col items-center gap-4 rounded border p-5 transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/[0.02]"
      style={{
        backgroundColor: "#1a2235",
        borderColor: "#243048",
      }}
    >
      {/* S2 Edit Button */}
      {isS2Admin && (
        <button
          type="button"
          data-ocid={`personnel.edit_button.${index}`}
          onClick={() => onEdit(profile)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-amber-500/10"
          title="Edit profile"
          aria-label="Edit personnel profile"
        >
          <Pencil className="h-3.5 w-3.5 text-amber-500" />
        </button>
      )}

      {/* Avatar */}
      <AvatarCircle name={profile.name} avatarUrl={profile.avatarUrl} />

      {/* Info */}
      <div className="w-full text-center">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
            {profile.name}
          </p>
          {profile.isValidatedByCommander && <VerifiedBadge />}
        </div>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {profile.rank || "—"}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
          {profile.orgRole || "—"}
        </p>
      </div>

      {/* Verification status row */}
      <div className="w-full">
        {profile.isValidatedByCommander ? (
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500/80">
              S2 Verified
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="h-3 w-3 text-slate-600" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
              Pending Verification
            </span>
          </div>
        )}
      </div>

      {/* Clearance Badge */}
      <div className="mt-auto">
        <ClearanceBadge level={Number(profile.clearanceLevel)} />
      </div>
    </div>
  );
}

// ─── Skeleton Grid ────────────────────────────────────────────────────────────

const SKELETON_IDS = ["a", "b", "c", "d", "e", "f", "g", "h"];

function PersonnelSkeleton() {
  return (
    <div
      data-ocid="personnel.loading_state"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {SKELETON_IDS.map((id) => (
        <div
          key={id}
          className="flex flex-col items-center gap-4 rounded border p-5"
          style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
        >
          <SkeletonCard width="64px" height="64px" className="rounded-full" />
          <div className="w-full space-y-2">
            <SkeletonCard height="14px" className="mx-auto w-3/4" />
            <SkeletonCard height="10px" className="mx-auto w-1/2" />
            <SkeletonCard height="10px" className="mx-auto w-2/3" />
          </div>
          <SkeletonCard height="22px" width="80px" className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Locked field display ─────────────────────────────────────────────────────

function LockedField({
  label,
  value,
  dataOcid,
}: {
  label: string;
  value: string;
  dataOcid?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              data-ocid={dataOcid ?? "personnel.field_locked.tooltip"}
              className="flex items-center gap-2 rounded border px-3 py-2"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            >
              <Lock className="h-3 w-3 shrink-0 text-slate-600" />
              <span className="font-mono text-xs text-slate-300">
                {value || "—"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-xs font-mono text-[10px]"
            style={{ backgroundColor: "#0f1626", borderColor: "#2a3347" }}
          >
            Field locked after S2 verification. Submit a correction request to
            your S2.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  profile: ExtendedProfile | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  viewerIsS2Admin: boolean;
  viewerPrincipal: string;
}

function EditModal({
  profile,
  open,
  onOpenChange,
  onSuccess,
  viewerIsS2Admin,
  viewerPrincipal,
}: EditModalProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  // Split name state
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [rank, setRank] = useState(profile?.rank ?? "");
  const [editBranch, setEditBranch] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [orgRole, setOrgRole] = useState(profile?.orgRole ?? "");
  const [clearanceLevel, setClearanceLevel] = useState(
    String(profile ? Number(profile.clearanceLevel) : 0),
  );
  const [makeS2Admin, setMakeS2Admin] = useState(profile?.isS2Admin ?? false);
  const [nameError, setNameError] = useState("");
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);

  // Sync state when profile prop changes
  const prevProfileId = profile?.principalId.toString();
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(
    prevProfileId,
  );

  if (prevProfileId !== lastSyncedId && profile) {
    setLastSyncedId(prevProfileId);
    const parsed = parseDisplayName(profile.name);
    setLastName(parsed.lastName);
    setFirstName(parsed.firstName);
    setMi(parsed.mi);
    setRank(profile.rank);
    setEditBranch("");
    setEditCategory("");
    setEmail(profile.email);
    setOrgRole(profile.orgRole);
    setClearanceLevel(String(Number(profile.clearanceLevel)));
    setMakeS2Admin(profile.isS2Admin);
    setNameError("");
  }

  // Field locking: locked if profile is verified AND the viewer is NOT S2 AND viewing their own profile
  const isViewingOwnProfile =
    profile?.principalId.toString() === viewerPrincipal;
  const nameRankLocked =
    profile?.isValidatedByCommander === true &&
    !viewerIsS2Admin &&
    isViewingOwnProfile;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor || !profile) throw new Error("Not ready");

      const formattedName = formatDisplayName(rank, lastName, firstName, mi);
      const trimmedName = formattedName.trim();
      if (!trimmedName || !lastName.trim() || !firstName.trim()) {
        setNameError("Last name and first name are required.");
        throw new Error("Validation failed");
      }
      setNameError("");

      const updatedProfile: ExtendedProfile = {
        ...profile,
        name: trimmedName,
        rank: rank.trim(),
        email: email.trim(),
        orgRole: orgRole.trim(),
        clearanceLevel: BigInt(clearanceLevel),
        isS2Admin: makeS2Admin,
      };
      await actor.updateUserProfile(updatedProfile);
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({
        queryKey: [viewerPrincipal, "personnel-profiles"],
      });
      onOpenChange(false);
      onSuccess();
    },
    onError: (err: Error) => {
      if (err.message !== "Validation failed") {
        toast.error("Failed to update profile");
      }
    },
  });

  const lockedDisplayName = profile
    ? formatDisplayName(rank, lastName, firstName, mi) || profile.name
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          data-ocid="personnel.edit_modal.modal"
          className="border sm:max-w-lg"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Edit Personnel Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name — locked if verified and non-S2 viewing own profile */}
            {nameRankLocked ? (
              <LockedField label="Name *" value={lockedDisplayName} />
            ) : (
              <div className="space-y-2">
                <Label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Name <span className="text-red-400">*</span>
                </Label>
                <div className="grid grid-cols-[1fr_1fr_56px] gap-2">
                  <div>
                    <Label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      Last
                    </Label>
                    <Input
                      data-ocid="personnel.edit_modal.last_name.input"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (e.target.value.trim()) setNameError("");
                      }}
                      className="border font-mono text-xs uppercase text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                      placeholder="SMITH"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      First
                    </Label>
                    <Input
                      data-ocid="personnel.edit_modal.first_name.input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border font-mono text-xs text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      MI
                    </Label>
                    <Input
                      data-ocid="personnel.edit_modal.mi.input"
                      value={mi}
                      onChange={(e) => setMi(e.target.value.slice(0, 1))}
                      maxLength={1}
                      className="border font-mono text-xs text-center uppercase text-white"
                      style={{
                        backgroundColor: "#1a2235",
                        borderColor: "#2a3347",
                      }}
                      placeholder="A"
                    />
                  </div>
                </div>
                <FormError message={nameError} />
              </div>
            )}

            {/* Rank — locked if verified and non-S2 viewing own profile */}
            {nameRankLocked ? (
              <LockedField label="Rank" value={rank} />
            ) : (
              <RankSelector
                branch={editBranch}
                category={editCategory}
                rank={rank}
                onBranchChange={(v) => {
                  setEditBranch(v);
                  setEditCategory("");
                  setRank("");
                }}
                onCategoryChange={(v) => {
                  setEditCategory(v);
                  setRank("");
                }}
                onRankChange={setRank}
                variant="modal"
              />
            )}

            {/* Request correction link — visible only to non-S2 viewing their own verified profile */}
            {nameRankLocked && (
              <button
                type="button"
                data-ocid="personnel.request_correction.button"
                onClick={() => setShowCorrectionDialog(true)}
                className="font-mono text-[10px] uppercase tracking-wider text-amber-500/70 underline-offset-4 hover:text-amber-500 hover:underline"
              >
                Request Correction for Locked Fields
              </button>
            )}

            {/* Email */}
            <div>
              <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Email
              </Label>
              <Input
                data-ocid="personnel.edit_modal.email.input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                placeholder="email@unit.mil"
                type="email"
              />
            </div>

            {/* OrgRole */}
            <div>
              <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Org Role
              </Label>
              <Input
                data-ocid="personnel.edit_modal.org_role.input"
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                className="border font-mono text-xs text-white"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                placeholder="e.g. S2, S6, Commander"
              />
            </div>

            {/* Clearance Level */}
            <div>
              <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Clearance Level
              </Label>
              <Select value={clearanceLevel} onValueChange={setClearanceLevel}>
                <SelectTrigger
                  data-ocid="personnel.edit_modal.clearance.select"
                  className="border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  {Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => (
                    <SelectItem
                      key={lvl}
                      value={lvl}
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      {lvl} — {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Make S2 Admin */}
            <div
              className="flex items-center justify-between rounded border px-3 py-2.5"
              style={{ borderColor: "#2a3347" }}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                  S2 Admin
                </p>
                <p className="font-mono text-[9px] text-slate-600">
                  Grants full system access
                </p>
              </div>
              <Switch
                data-ocid="personnel.edit_modal.s2_admin.switch"
                checked={makeS2Admin}
                onCheckedChange={setMakeS2Admin}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="personnel.edit_modal.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ borderColor: "#2a3347" }}
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="personnel.edit_modal.save_button"
              className="gap-1.5 font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correction request info dialog */}
      <AlertDialog
        open={showCorrectionDialog}
        onOpenChange={setShowCorrectionDialog}
      >
        <AlertDialogContent
          data-ocid="personnel.correction_info.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Locked Field Correction
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
              To correct a locked field, contact your S2 or security officer
              directly. They will unlock and re-verify your profile. Name and
              rank fields are locked after S2 verification to prevent
              misrepresentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowCorrectionDialog(false)}
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Re-auth confirm dialog (S2 editing verified profile) ─────────────────────

interface ReAuthConfirmProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  profileName: string;
}

function ReAuthConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  profileName,
}: ReAuthConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-ocid="personnel.edit_verified.dialog"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
            Edit Verified Profile
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
            You are about to edit the verified profile of{" "}
            <span className="font-semibold text-amber-500">{profileName}</span>.
            This action is logged and requires S2 authority. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            data-ocid="personnel.edit_verified.cancel_button"
            className="border font-mono text-xs uppercase tracking-wider text-slate-300"
            style={{ borderColor: "#2a3347", backgroundColor: "transparent" }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="personnel.edit_verified.confirm_button"
            onClick={onConfirm}
            className="font-mono text-xs uppercase tracking-wider"
            style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Onboarding Queue (S2 only) ───────────────────────────────────────────────

interface OnboardingQueueProps {
  profiles: ExtendedProfile[];
  isLoading: boolean;
  principalStr: string;
  onVerified: () => void;
}

function OnboardingQueue({
  profiles,
  isLoading,
  principalStr,
  onVerified,
}: OnboardingQueueProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [confirmTarget, setConfirmTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Deny state
  const [denyTarget, setDenyTarget] = useState<ExtendedProfile | null>(null);
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");

  const pendingProfiles = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin,
  );

  const verifyMutation = useMutation({
    mutationFn: async (profile: ExtendedProfile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.validateS2Admin(profile.principalId);
      // Send approval notification (non-blocking)
      try {
        await actor.createSystemNotification({
          id: crypto.randomUUID(),
          title: "Access Approved",
          body: "Your access request has been approved. You may now log in to Omnis.",
          userId: profile.principalId,
          notificationType: "access_request",
          createdAt: BigInt(Date.now()),
          read: false,
          metadata: undefined,
        });
      } catch {
        /* non-blocking */
      }
    },
    onSuccess: () => {
      toast.success("User verified and activated");
      void queryClient.invalidateQueries({
        queryKey: [principalStr, "personnel-profiles"],
      });
      setConfirmOpen(false);
      setConfirmTarget(null);
      onVerified();
    },
    onError: () => {
      toast.error("Failed to verify user");
    },
  });

  const handleVerifyClick = (profile: ExtendedProfile) => {
    setConfirmTarget(profile);
    setConfirmOpen(true);
  };

  const handleDenyClick = (profile: ExtendedProfile) => {
    setDenyTarget(profile);
    setDenyReason("");
    setDenyOpen(true);
  };

  const handleDenyConfirm = async () => {
    if (!denyTarget || !denyReason.trim()) return;
    // Write denial record to localStorage
    localStorage.setItem(
      `omnis_denial_${denyTarget.principalId.toString()}`,
      JSON.stringify({
        reason: denyReason.trim(),
        deniedAt: new Date().toISOString(),
      }),
    );
    // Send denial notification (non-blocking)
    if (actor) {
      try {
        await actor.createSystemNotification({
          id: crypto.randomUUID(),
          title: "Access Denied",
          body: `Your access request was denied. Reason: ${denyReason.trim()}. Contact your S2 or security officer.`,
          userId: denyTarget.principalId,
          notificationType: "access_request",
          createdAt: BigInt(Date.now()),
          read: false,
          metadata: undefined,
        });
      } catch {
        /* non-blocking */
      }
    }
    void queryClient.invalidateQueries({
      queryKey: [principalStr, "personnel-profiles"],
    });
    toast.success("User denied");
    setDenyOpen(false);
    setDenyTarget(null);
    setDenyReason("");
  };

  if (isLoading) {
    return (
      <div data-ocid="personnel.queue.loading_state" className="py-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
          <span className="font-mono text-xs text-slate-600">
            Loading queue…
          </span>
        </div>
      </div>
    );
  }

  if (pendingProfiles.length === 0) {
    return (
      <div
        data-ocid="personnel.queue.empty_state"
        className="py-12 text-center"
      >
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-slate-700" />
        <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
          No users pending verification.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        data-ocid="personnel.queue.table"
        className="overflow-hidden rounded border"
        style={{ borderColor: "#1a2235" }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_auto_1fr_1fr_1fr_auto] gap-4 border-b px-4 py-2.5"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          {["Name", "Rank", "Email", "Org Role", "Org", "Action"].map((col) => (
            <span
              key={col}
              className="font-mono text-[9px] uppercase tracking-widest text-slate-600"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {pendingProfiles.map((profile, idx) => {
          // Read org request from localStorage
          let orgName = "—";
          try {
            const raw = localStorage.getItem(
              `omnis_org_request_${profile.principalId.toString()}`,
            );
            if (raw) {
              const parsed = JSON.parse(raw) as { workspace?: string };
              if (parsed.workspace) orgName = parsed.workspace;
            }
          } catch {
            /* ignore */
          }

          return (
            <div
              key={profile.principalId.toString()}
              data-ocid={`personnel.queue.item.${idx + 1}`}
              className="grid grid-cols-[1fr_auto_1fr_1fr_1fr_auto] items-center gap-4 border-b px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.02]"
              style={{ borderColor: "#1a2235" }}
            >
              <span className="truncate font-mono text-xs text-white">
                {profile.name || "—"}
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] text-slate-400">
                {profile.rank || "—"}
              </span>
              <span className="truncate font-mono text-[11px] text-slate-500">
                {profile.email || "—"}
              </span>
              <span className="truncate font-mono text-[11px] text-slate-500">
                {profile.orgRole || "—"}
              </span>
              <span className="truncate font-mono text-[11px] text-slate-500">
                {orgName}
              </span>
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid={`personnel.queue.verify_button.${idx + 1}`}
                  onClick={() => handleVerifyClick(profile)}
                  disabled={verifyMutation.isPending}
                  className="shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all hover:bg-amber-500/10 disabled:opacity-40"
                  style={{
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "#f59e0b",
                  }}
                >
                  Verify & Activate
                </button>
                <button
                  type="button"
                  data-ocid={`personnel.queue.deny_button.${idx + 1}`}
                  onClick={() => handleDenyClick(profile)}
                  disabled={verifyMutation.isPending}
                  className="shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all hover:bg-red-500/10 disabled:opacity-40"
                  style={{
                    borderColor: "rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  Deny
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approve confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Verify Personnel
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
              Verify{" "}
              <span className="font-semibold text-amber-500">
                {confirmTarget?.name}
              </span>{" "}
              and grant system access? This action is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ borderColor: "#2a3347", backgroundColor: "transparent" }}
              onClick={() => {
                setConfirmOpen(false);
                setConfirmTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmTarget && verifyMutation.mutate(confirmTarget)
              }
              disabled={verifyMutation.isPending}
              className="font-mono text-xs uppercase tracking-wider"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              {verifyMutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deny confirm dialog */}
      <AlertDialog open={denyOpen} onOpenChange={setDenyOpen}>
        <AlertDialogContent
          data-ocid="personnel.deny_dialog.dialog"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest text-white">
              Deny Access
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs leading-relaxed text-slate-400">
              Deny access for{" "}
              <span className="font-semibold text-red-400">
                {denyTarget?.name}
              </span>
              ? This will notify the user and record the reason.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="px-1 py-2">
            <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Reason for Denial <span className="text-red-400">*</span>
            </Label>
            <Input
              data-ocid="personnel.deny_dialog.reason.input"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Enter reason..."
              className="border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
            />
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-ocid="personnel.deny_dialog.cancel_button"
              className="border font-mono text-xs uppercase tracking-wider text-slate-300"
              style={{ borderColor: "#2a3347", backgroundColor: "transparent" }}
              onClick={() => {
                setDenyOpen(false);
                setDenyTarget(null);
                setDenyReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="personnel.deny_dialog.confirm_button"
              onClick={() => void handleDenyConfirm()}
              disabled={!denyReason.trim()}
              className="font-mono text-xs uppercase tracking-wider disabled:opacity-40"
              style={{ backgroundColor: "rgba(239,68,68,0.85)", color: "#fff" }}
            >
              Confirm Deny
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Demo Profile (preview only — not stored in backend) ─────────────────────

const DEMO_PROFILE: ExtendedProfile = {
  principalId: {
    toString: () => "demo-gracie-preview",
    compareTo: () => 0 as 0 | 1 | -1,
    isAnonymous: () => false,
    toUint8Array: () => new Uint8Array(),
    toHex: () => "",
    toText: () => "demo-gracie-preview",
  } as unknown as ExtendedProfile["principalId"],
  name: "1SG GRACIE, Nicholas J",
  rank: "First Sergeant (1SG)",
  email: "nicholas.j.gracie.mil@army.mil",
  orgRole: "First Sergeant, HHC 1-501ST PIR",
  clearanceLevel: 4n,
  isS2Admin: false,
  isValidatedByCommander: true,
  registered: true,
  avatarUrl: undefined,
};

// ─── Demo Card wrapper (amber outline to distinguish from live data) ──────────

function DemoPersonnelCard({
  isS2Admin,
  onViewProfile,
}: {
  isS2Admin: boolean;
  onViewProfile: () => void;
}) {
  return (
    <div className="relative">
      {/* Demo label */}
      <div className="absolute -top-2.5 left-3 z-10">
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
          style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
        >
          Preview
        </span>
      </div>

      <div
        data-ocid="personnel.demo_card"
        className="group relative flex flex-col items-center gap-4 rounded border-2 p-5 transition-all duration-200"
        style={{
          backgroundColor: "#1a2235",
          borderColor: "#f59e0b",
        }}
      >
        {/* S2 Edit hint */}
        {isS2Admin && (
          <button
            type="button"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded opacity-60 hover:bg-amber-500/10 hover:opacity-100"
            title="Demo only — edit not connected to backend"
            aria-label="Demo edit"
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500/60" />
          </button>
        )}

        {/* Avatar */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tracking-wider"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 0.3)",
            color: "#f59e0b",
          }}
        >
          NJG
        </div>

        {/* Info */}
        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <p className="truncate font-mono text-sm font-bold uppercase tracking-wider text-white">
              {DEMO_PROFILE.name}
            </p>
            <VerifiedBadge />
          </div>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            {DEMO_PROFILE.rank}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
            {DEMO_PROFILE.orgRole}
          </p>
        </div>

        {/* Verification status */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500/80">
              S2 Verified
            </span>
          </div>
        </div>

        {/* Clearance Badge */}
        <div className="mt-auto">
          <ClearanceBadge level={Number(DEMO_PROFILE.clearanceLevel)} />
        </div>

        {/* View full profile link */}
        <button
          type="button"
          data-ocid="personnel.demo_view_profile.button"
          onClick={onViewProfile}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber-500/70 transition-colors hover:text-amber-500"
        >
          <ExternalLink className="h-3 w-3" />
          View Full Profile
        </button>
      </div>
    </div>
  );
}

// ─── Main PersonnelPage ───────────────────────────────────────────────────────

export default function PersonnelPage() {
  const { actor, isFetching } = useActor();
  const { isS2Admin } = usePermissions();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [clearanceFilter, setClearanceFilter] = useState("all");

  // Edit state
  const [editTarget, setEditTarget] = useState<ExtendedProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Re-auth confirm before editing verified profile (S2 only)
  const [reAuthTarget, setReAuthTarget] = useState<ExtendedProfile | null>(
    null,
  );
  const [reAuthOpen, setReAuthOpen] = useState(false);

  const principalStr = identity?.getPrincipal().toString() ?? "anon";

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: profiles = [], isLoading } = useQuery<ExtendedProfile[]>({
    queryKey: [principalStr, "personnel-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Filtering ─────────────────────────────────────────────────────────────
  // Use deferred search value so the filter only applies after React yields,
  // keeping the input responsive even on large lists (no per-keystroke filter).
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        !deferredSearchQuery ||
        p.name.toLowerCase().includes(deferredSearchQuery.toLowerCase());

      const matchesClearance =
        clearanceFilter === "all" ||
        Number(p.clearanceLevel) === Number(clearanceFilter);

      return matchesSearch && matchesClearance;
    });
  }, [profiles, deferredSearchQuery, clearanceFilter]);

  // ── Edit handlers ─────────────────────────────────────────────────────────
  function handleEdit(profile: ExtendedProfile) {
    // S2 editing a verified profile: show re-auth confirmation first
    if (isS2Admin && profile.isValidatedByCommander) {
      setReAuthTarget(profile);
      setReAuthOpen(true);
    } else {
      setEditTarget(profile);
      setEditOpen(true);
    }
  }

  function handleReAuthConfirm() {
    setReAuthOpen(false);
    if (reAuthTarget) {
      setEditTarget(reAuthTarget);
      setEditOpen(true);
    }
    setReAuthTarget(null);
  }

  const pendingCount = profiles.filter(
    (p) => !p.isValidatedByCommander && !p.isS2Admin,
  ).length;

  return (
    <div
      data-ocid="personnel.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Personnel Directory</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-500" />
              <div>
                <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                  Personnel Directory
                </h1>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  {isLoading
                    ? "Loading..."
                    : `${filteredProfiles.length} of ${profiles.length} personnel`}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Input
                data-ocid="personnel.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-52 border font-mono text-xs text-white placeholder:text-slate-600"
                style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              />
              <Select
                value={clearanceFilter}
                onValueChange={setClearanceFilter}
              >
                <SelectTrigger
                  data-ocid="personnel.clearance_filter.select"
                  className="w-44 border font-mono text-xs text-white"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  <SelectValue placeholder="All Clearances" />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
                >
                  <SelectItem
                    value="all"
                    className="font-mono text-xs text-slate-300 focus:text-white"
                  >
                    All Clearances
                  </SelectItem>
                  {Object.entries(CLEARANCE_LABELS).map(([lvl, label]) => (
                    <SelectItem
                      key={lvl}
                      value={lvl}
                      className="font-mono text-xs text-slate-300 focus:text-white"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs — S2 sees both; others see only the directory */}
          {isS2Admin ? (
            <Tabs defaultValue="directory">
              <TabsList
                className="mb-6 border"
                style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
              >
                <TabsTrigger
                  value="directory"
                  data-ocid="personnel.directory.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
                >
                  All Personnel
                </TabsTrigger>
                <TabsTrigger
                  value="queue"
                  data-ocid="personnel.queue.tab"
                  className="font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
                >
                  Onboarding Queue
                  {pendingCount > 0 && (
                    <span
                      className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.2)",
                        color: "#f59e0b",
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="directory">
                {isLoading ? (
                  <PersonnelSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Demo preview card — always shown at top */}
                    <DemoPersonnelCard
                      isS2Admin={isS2Admin}
                      onViewProfile={() =>
                        void navigate({ to: "/profile-preview" })
                      }
                    />
                    {filteredProfiles.length === 0 ? (
                      <div
                        data-ocid="personnel.empty_state"
                        className="col-span-full flex flex-col items-center py-12"
                      >
                        <Users className="mb-3 h-8 w-8 text-slate-700" />
                        <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
                          {searchQuery || clearanceFilter !== "all"
                            ? "No personnel match your filters"
                            : "No personnel registered"}
                        </p>
                      </div>
                    ) : (
                      filteredProfiles.map((profile, idx) => (
                        <PersonnelCard
                          key={profile.principalId.toString()}
                          profile={profile}
                          index={idx + 1}
                          isS2Admin={isS2Admin}
                          onEdit={handleEdit}
                        />
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="queue">
                <OnboardingQueue
                  profiles={profiles}
                  isLoading={isLoading}
                  principalStr={principalStr}
                  onVerified={() => {}}
                />
              </TabsContent>
            </Tabs>
          ) : (
            // Non-S2: just show the directory, no tabs
            <>
              {isLoading ? (
                <PersonnelSkeleton />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {/* Demo preview card — always shown at top */}
                  <DemoPersonnelCard
                    isS2Admin={isS2Admin}
                    onViewProfile={() =>
                      void navigate({ to: "/profile-preview" })
                    }
                  />
                  {filteredProfiles.length === 0 ? (
                    <div
                      data-ocid="personnel.empty_state"
                      className="col-span-full flex flex-col items-center py-12"
                    >
                      <Users className="mb-3 h-8 w-8 text-slate-700" />
                      <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
                        {searchQuery || clearanceFilter !== "all"
                          ? "No personnel match your filters"
                          : "No personnel registered"}
                      </p>
                    </div>
                  ) : (
                    filteredProfiles.map((profile, idx) => (
                      <PersonnelCard
                        key={profile.principalId.toString()}
                        profile={profile}
                        index={idx + 1}
                        isS2Admin={isS2Admin}
                        onEdit={handleEdit}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <EditModal
        profile={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => setEditTarget(null)}
        viewerIsS2Admin={isS2Admin}
        viewerPrincipal={principalStr}
      />

      {/* Re-auth confirm dialog for S2 editing a verified profile */}
      <ReAuthConfirmDialog
        open={reAuthOpen}
        onOpenChange={setReAuthOpen}
        onConfirm={handleReAuthConfirm}
        profileName={reAuthTarget?.name ?? ""}
      />

      {/* Footer */}
      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/ProfilePreviewPage.tsx

```tsx
/**
 * ProfilePreviewPage — Demo preview of 1SG Nicholas J. Gracie's profile.
 * This is a static visual preview only. No backend reads or writes.
 */

import { TopNav } from "@/components/layout/TopNav";
import { ClearanceBadge } from "@/components/shared/ClearanceBadge";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import type { LucideProps } from "lucide-react";
import {
  ArrowLeft,
  AtSign,
  Building2,
  Calendar,
  Lock,
  Mail,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

const DEMO = {
  name: "1SG GRACIE, Nicholas J",
  firstName: "Nicholas",
  lastName: "GRACIE",
  mi: "J",
  rank: "First Sergeant (1SG)",
  branch: "Army",
  category: "Enlisted",
  payGrade: "E-8",
  email: "nicholas.j.gracie.mil@army.mil",
  unit: "HHC, 1-501ST PIR",
  orgRole: "First Sergeant",
  clearanceLevel: 4,
  clearanceLabel: "TS/SCI",
  isS2Verified: true,
  isS2Admin: false,
  verifiedNote: "Verified by S2 — fields locked",
  joined: "Omnis Sovereign OS",
};

function FieldRow({
  icon: Icon,
  label,
  value,
  locked,
}: {
  icon: React.ComponentType<LucideProps>;
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded border px-4 py-3"
      style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          {label}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-white">{value}</p>
      </div>
      {locked && <Lock className="mt-0.5 h-3 w-3 shrink-0 text-slate-600" />}
    </div>
  );
}

export default function ProfilePreviewPage() {
  const navigate = useNavigate();

  return (
    <div
      data-ocid="profile_preview.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Back nav */}
          <button
            type="button"
            data-ocid="profile_preview.back_button"
            onClick={() => void navigate({ to: "/personnel" })}
            className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 transition-colors hover:text-amber-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Personnel
          </button>

          {/* Preview banner */}
          <div
            className="mb-6 flex items-center gap-3 rounded border px-4 py-2.5"
            style={{
              backgroundColor: "rgba(245,158,11,0.06)",
              borderColor: "#f59e0b",
            }}
          >
            <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
              Profile Preview — Demo data only. This profile is not stored in
              the backend.
            </p>
          </div>

          {/* Profile card */}
          <div
            className="rounded-lg border"
            style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
          >
            {/* Header band */}
            <div
              className="flex flex-col items-center gap-4 border-b px-6 py-8 sm:flex-row sm:items-start"
              style={{ borderColor: "#1a2235" }}
            >
              {/* Avatar */}
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 font-mono text-2xl font-bold tracking-wider"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.4)",
                  color: "#f59e0b",
                }}
              >
                NJG
              </div>

              {/* Name + badges */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="font-mono text-xl font-bold uppercase tracking-[0.15em] text-white">
                    {DEMO.name}
                  </h1>
                  <VerifiedBadge />
                </div>
                <p className="mt-1 font-mono text-sm uppercase tracking-wider text-slate-400">
                  {DEMO.rank}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {DEMO.branch} · {DEMO.category} · Pay Grade {DEMO.payGrade}
                </p>

                {/* Clearance + verification row */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <ClearanceBadge level={DEMO.clearanceLevel} />
                  {DEMO.isS2Verified && (
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-amber-500/80">
                        S2 Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Field grid */}
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              <FieldRow
                icon={User}
                label="Full Name (DoD Standard)"
                value={`${DEMO.lastName}, ${DEMO.firstName} ${DEMO.mi}`}
                locked
              />
              <FieldRow
                icon={Star}
                label="Rank / Pay Grade"
                value={`${DEMO.rank} · ${DEMO.payGrade}`}
                locked
              />
              <FieldRow icon={Building2} label="Unit" value={DEMO.unit} />
              <FieldRow
                icon={User}
                label="Organizational Role"
                value={DEMO.orgRole}
              />
              <FieldRow icon={Mail} label="Email" value={DEMO.email} />
              <FieldRow
                icon={AtSign}
                label="Branch"
                value={`${DEMO.branch} — ${DEMO.category}`}
              />
              <div
                className="flex items-start gap-3 rounded border px-4 py-3 sm:col-span-2"
                style={{ backgroundColor: "#1a2235", borderColor: "#243048" }}
              >
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/60" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                    Clearance Level
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-amber-500">
                    {DEMO.clearanceLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Locked fields notice */}
            <div
              className="mx-6 mb-6 flex items-center gap-2 rounded border px-4 py-2.5"
              style={{
                backgroundColor: "rgba(245,158,11,0.04)",
                borderColor: "#2a3347",
              }}
            >
              <Lock className="h-3 w-3 shrink-0 text-slate-600" />
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                {DEMO.verifiedNote}. Name and rank are read-only for this user.
                S2 admin can edit.
              </p>
            </div>

            {/* Footer actions */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4"
              style={{ borderColor: "#1a2235" }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-600" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  Account registered in {DEMO.joined}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="profile_preview.back_button_footer"
                  className="border font-mono text-xs uppercase tracking-wider text-slate-400"
                  style={{ borderColor: "#2a3347" }}
                  onClick={() => void navigate({ to: "/personnel" })}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  data-ocid="profile_preview.send_message.button"
                  className="font-mono text-xs uppercase tracking-wider"
                  style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  onClick={() => void navigate({ to: "/messages" })}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/RegistrationGatePage.tsx

```tsx
import { UserRole } from "@/backend.d";
import { FormError } from "@/components/shared/FormError";
import { RankSelector } from "@/components/shared/RankSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { formatDisplayName } from "@/lib/displayName";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function RegistrationGatePage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [branch, setBranch] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    mi: "",
    rank: "",
    email: "",
    orgRole: "",
    bootstrapCode: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBootstrapCode, setShowBootstrapCode] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const timeoutStarted = useRef(false);
  // Prevent double-redirect for already-registered users
  const hasRedirected = useRef(false);

  // If the actor never becomes available within 25s after a real identity
  // is present, show a recoverable error instead of spinning forever.
  // biome-ignore lint/correctness/useExhaustiveDependencies: actor/isFetching intentionally excluded to prevent timer restart on refetch
  useEffect(() => {
    const hasRealIdentity =
      !!identity && !identity.getPrincipal().isAnonymous();
    if (!hasRealIdentity) return;
    if (actor && !isFetching) return;
    if (timeoutStarted.current) return;

    timeoutStarted.current = true;
    const timer = setTimeout(() => {
      setSessionTimedOut(true);
    }, 25_000);

    return () => clearTimeout(timer);
  }, [identity]);

  // Redirect already-registered users away from the registration form.
  useEffect(() => {
    if (!actor || isFetching) return;
    if (hasRedirected.current) return;

    actor
      .getMyProfile()
      .then((profile) => {
        if (!profile || !profile.registered) return;
        if (hasRedirected.current) return;
        hasRedirected.current = true;
        if (!profile.isValidatedByCommander && !profile.isS2Admin) {
          void navigate({ to: "/pending" });
        } else {
          void navigate({ to: "/" });
        }
      })
      .catch(() => {
        // getMyProfile threw — user is not registered, show the form
      });
  }, [actor, isFetching, navigate]);

  // Detect if this is the first user (no S2 admins exist yet)
  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getAllProfiles()
      .then((profiles) => {
        const hasS2 = profiles.some((p) => p.isS2Admin);
        setIsFirstUser(!hasS2);
      })
      .catch(() => setIsFirstUser(false));
  }, [actor, isFetching]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // Live preview of formatted name
  const namePreview = formatDisplayName(
    form.rank,
    form.lastName,
    form.firstName,
    form.mi,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFetching) {
      setError(
        "System is still initializing. Please wait a moment and try again.",
      );
      return;
    }

    if (!actor || !identity) {
      setError("Session not ready. Please sign out and sign in again.");
      return;
    }

    if (
      !form.lastName.trim() ||
      !form.firstName.trim() ||
      !form.rank.trim() ||
      !form.email.trim() ||
      !form.orgRole.trim()
    ) {
      setError(
        "Last name, first name, rank, email, and organizational role are required.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const principal = identity.getPrincipal();
      const formattedName = formatDisplayName(
        form.rank,
        form.lastName,
        form.firstName,
        form.mi,
      );

      await actor.registerProfile({
        principalId: principal,
        name: formattedName,
        rank: form.rank.trim(),
        email: form.email.trim(),
        orgRole: form.orgRole.trim(),
        clearanceLevel: 0n,
        isS2Admin: false,
        isValidatedByCommander: false,
        registered: true,
        avatarUrl: undefined,
      });

      if (form.bootstrapCode.trim()) {
        try {
          await actor.assignCallerUserRole(principal, UserRole.admin);
          await actor.updateUserProfile({
            principalId: principal,
            name: formattedName,
            rank: form.rank.trim(),
            email: form.email.trim(),
            orgRole: form.orgRole.trim(),
            clearanceLevel: 4n,
            isS2Admin: true,
            isValidatedByCommander: false,
            registered: true,
            avatarUrl: undefined,
          });
          await actor.validateS2Admin(principal);
        } catch {
          // Authorization code path failed — continue as regular user
        }
      }

      void navigate({ to: "/onboarding" });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRealIdentity = !!identity && !identity.getPrincipal().isAnonymous();
  const isActorLoading = hasRealIdentity && isFetching;

  if (isActorLoading) {
    if (sessionTimedOut) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-5"
          style={{ backgroundColor: "#0a0e1a" }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border"
            style={{ borderColor: "#ef4444", backgroundColor: "#1a0a0a" }}
          >
            <ShieldAlert className="h-7 w-7" style={{ color: "#ef4444" }} />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p
              className="font-mono text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#fca5a5" }}
            >
              Session timed out
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Session initialization timed out. This may be a network issue.
            </p>
          </div>
          <button
            type="button"
            data-ocid="registration.retry_button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-red-900/30"
            style={{ borderColor: "#ef4444", color: "#fca5a5" }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      );
    }

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#0a0e1a" }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.2)]">
          <ShieldCheck className="h-7 w-7 text-amber" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-amber" />
          Establishing secure session...
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Step indicator */}
        <div className="mb-5 flex justify-center">
          <span
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: "#f59e0b" }}
          >
            Step 1 of 3: Complete Profile
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.2)]">
            <ShieldCheck className="h-7 w-7 text-amber" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground">
            Personnel Registration
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Complete your profile to access the system
          </p>
        </div>

        {/* First-user banner */}
        {isFirstUser && (
          <div
            className="mb-5 flex items-start gap-3 rounded border px-4 py-3"
            style={{
              backgroundColor: "rgba(245,158,11,0.06)",
              borderColor: "rgba(245,158,11,0.3)",
            }}
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "#f59e0b" }}
            />
            <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
              You appear to be the first person to register on this workspace.
              If you are the designated system administrator, complete
              registration then click{" "}
              <span className="font-semibold text-amber-400">
                &lsquo;Establish Your Workspace&rsquo;
              </span>{" "}
              to set up the S2 role and unit.
            </p>
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-lg border border-border bg-card p-6 shadow-2xl"
        >
          <div className="space-y-4">
            {/* Name fields */}
            <div className="space-y-3">
              <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Name
              </Label>
              <div className="grid grid-cols-[1fr_1fr_64px] gap-2">
                <div className="space-y-1">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    Last
                  </Label>
                  <Input
                    data-ocid="registration.last_name.input"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="SMITH"
                    className="border-input bg-secondary font-mono text-sm uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    autoComplete="family-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    First
                  </Label>
                  <Input
                    data-ocid="registration.first_name.input"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="John"
                    className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    MI
                  </Label>
                  <Input
                    data-ocid="registration.mi.input"
                    value={form.mi}
                    onChange={(e) =>
                      handleChange("mi", e.target.value.slice(0, 1))
                    }
                    placeholder="A"
                    maxLength={1}
                    className="border-input bg-secondary font-mono text-sm text-center uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    autoComplete="additional-name"
                  />
                </div>
              </div>
              {/* Live name preview */}
              <p className="font-mono text-[10px] text-slate-500">
                Will display as:{" "}
                <span className="font-semibold text-slate-300">
                  {namePreview ||
                    `${form.rank || "RANK"} ${form.lastName.toUpperCase() || "LAST"}, ${form.firstName || "First"}${form.mi ? ` ${form.mi.toUpperCase()}` : ""}`}
                </span>
              </p>
            </div>

            {/* Branch / Category / Rank selector */}
            <RankSelector
              branch={branch}
              category={category}
              rank={form.rank}
              onBranchChange={(v) => {
                setBranch(v);
                setCategory("");
                handleChange("rank", "");
              }}
              onCategoryChange={(v) => {
                setCategory(v);
                handleChange("rank", "");
              }}
              onRankChange={(v) => handleChange("rank", v)}
              variant="registration"
            />

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <Input
                id="reg-email"
                data-ocid="registration.email.input"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="j.smith@secure.mil"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-orgRole"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Organizational Role
              </Label>
              <Input
                id="reg-orgRole"
                data-ocid="registration.org_role.input"
                type="text"
                value={form.orgRole}
                onChange={(e) => handleChange("orgRole", e.target.value)}
                placeholder="Intelligence Analyst"
                className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Commander Authorization Code — collapsible, S2 admin only */}
            <div className="border-t border-border pt-4">
              <button
                type="button"
                data-ocid="registration.bootstrap_code.toggle"
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
                onClick={() => setShowBootstrapCode((v) => !v)}
              >
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showBootstrapCode && "rotate-180",
                  )}
                />
                I am the designated S2 administrator
              </button>
              {showBootstrapCode && (
                <div className="mt-3 space-y-1.5">
                  <Label
                    htmlFor="reg-bootstrap"
                    className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Commander Authorization Code{" "}
                    <span className="text-muted-foreground/50">(optional)</span>
                  </Label>
                  <Input
                    id="reg-bootstrap"
                    data-ocid="registration.bootstrap_code.input"
                    type="text"
                    value={form.bootstrapCode}
                    onChange={(e) =>
                      handleChange("bootstrapCode", e.target.value)
                    }
                    placeholder="Provided by your commander or S2"
                    className="border-input bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                  />
                  <p className="font-mono text-xs text-muted-foreground/50">
                    Only required for initial system activation
                  </p>
                </div>
              )}
            </div>

            {error && <FormError message={error} />}

            <Button
              data-ocid="registration.submit_button"
              type="submit"
              className="mt-2 h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </span>
              ) : (
                "Register Personnel"
              )}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center font-mono text-xs text-muted-foreground/40">
          Registration is monitored. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

```

---

## FILE: src/pages/SettingsPage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CLEARANCE_LABELS, NETWORK_MODE_CONFIGS } from "@/config/constants";
import { useNetworkMode } from "@/contexts/NetworkModeContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  Clock,
  Globe,
  Lock,
  Settings,
  Shield,
  User,
} from "lucide-react";

function SectionCard({
  icon,
  title,
  children,
  badge,
  "data-ocid": dataOcid,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  badge?: string;
  "data-ocid"?: string;
}) {
  return (
    <div
      className="rounded border"
      style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      data-ocid={dataOcid}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 border-b px-5 py-3.5"
        style={{ borderColor: "#1a2235" }}
      >
        <div className="text-amber-500">{icon}</div>
        <span className="flex-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
          {title}
        </span>
        {badge && (
          <span
            className="rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  locked,
}: {
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b last:border-b-0"
      style={{ borderColor: "#1a2235" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-slate-300">{value}</span>
        {locked && (
          <div className="flex items-center gap-1">
            <Lock className="h-2.5 w-2.5 text-slate-600" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
              S2 Managed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const SENSITIVITY_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "#64748b" },
  elevated: { label: "Elevated", color: "#f59e0b" },
  high: { label: "High", color: "#f97316" },
  maximum: { label: "Maximum", color: "#ef4444" },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, clearanceLevel, isS2Admin } = usePermissions();
  const { mode: networkMode, isSet: networkModeIsSet } = useNetworkMode();

  const clearanceLabel =
    CLEARANCE_LABELS[clearanceLevel] ?? `Level ${clearanceLevel}`;
  const displayName = profile?.name?.trim() || "—";

  return (
    <div
      data-ocid="settings.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" data-ocid="settings.hub.link">
                    Hub
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page header */}
          <div className="flex items-start gap-4 pb-2">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <Settings className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Settings
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Platform configuration
              </p>
            </div>
          </div>

          {/* ── Account ───────────────────────────────────────────────── */}
          <SectionCard icon={<User className="h-4 w-4" />} title="Account">
            <div>
              <FieldRow label="Display Name" value={displayName} />
              <FieldRow
                label="Clearance Level"
                value={`${clearanceLevel} — ${clearanceLabel}`}
                locked
              />
              <FieldRow
                label="Role"
                value={isS2Admin ? "S2 Administrator" : profile?.orgRole || "—"}
                locked
              />
              <FieldRow label="Email" value={profile?.email || "—"} />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(245,158,11,0.05)",
                borderColor: "rgba(245,158,11,0.25)",
              }}
            >
              <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500/70 mt-0.5" />
              <p className="font-mono text-[10px] leading-relaxed text-amber-400/70">
                Sensitive fields (clearance level, rank, S2 admin role) are
                managed by your S2 administrator. Contact your S2 to update
                these values.
              </p>
            </div>
          </SectionCard>

          {/* ── Security ──────────────────────────────────────────────── */}
          <SectionCard icon={<Shield className="h-4 w-4" />} title="Security">
            <div>
              <FieldRow
                label="Identity Provider"
                value="Internet Identity (ICP)"
              />
              <FieldRow
                label="Session"
                value="Delegated identity — auto-expires"
              />
              <FieldRow
                label="Authentication"
                value="Hardware key / biometric"
              />
            </div>
            <div
              className="mt-4 flex items-start gap-2 rounded border px-3 py-2.5"
              style={{
                backgroundColor: "rgba(100,116,139,0.06)",
                borderColor: "#1a2235",
              }}
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" />
              <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                Advanced security settings (session timeout configuration, MFA
                policy, CAC integration) require a future backend update.
              </p>
            </div>
          </SectionCard>

          {/* ── Network Mode ──────────────────────────────────────────── */}
          <SectionCard
            icon={<Globe className="h-4 w-4" />}
            title="Network Mode"
            data-ocid="settings.network_mode.card"
          >
            {networkModeIsSet && networkMode ? (
              <>
                {(() => {
                  const config = NETWORK_MODE_CONFIGS[networkMode];
                  const isMilitary = config.group === "military";
                  const accentColor = isMilitary ? "#60a5fa" : "#a78bfa";
                  const accentBg = isMilitary
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(139,92,246,0.08)";
                  const accentBorder = isMilitary
                    ? "rgba(59,130,246,0.3)"
                    : "rgba(139,92,246,0.3)";
                  const sensitivity =
                    SENSITIVITY_LABELS[config.monitoringSensitivity];
                  return (
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className="rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
                          style={{
                            backgroundColor: accentBg,
                            color: accentColor,
                            border: `1px solid ${accentBorder}`,
                          }}
                        >
                          {config.shortCode}
                        </span>
                        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-white">
                          {config.label}
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] leading-relaxed text-slate-400">
                        {config.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                          Monitoring Sensitivity:
                        </span>
                        <span
                          className="font-mono text-[9px] uppercase tracking-widest font-semibold"
                          style={{ color: sensitivity.color }}
                        >
                          {sensitivity.label}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                {isS2Admin && (
                  <button
                    type="button"
                    data-ocid="settings.network_mode.change_button"
                    onClick={() => void navigate({ to: "/network-mode-setup" })}
                    className="mt-4 flex items-center gap-2 rounded border px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                    style={{ borderColor: "rgba(245,158,11,0.3)" }}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Change Mode
                  </button>
                )}
              </>
            ) : (
              <div
                className="flex items-start gap-2.5 rounded border px-3 py-2.5"
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.25)",
                }}
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                    Network mode not configured. Contact your S2 admin.
                  </p>
                  {isS2Admin && (
                    <button
                      type="button"
                      data-ocid="settings.network_mode.change_button"
                      onClick={() =>
                        void navigate({ to: "/network-mode-setup" })
                      }
                      className="mt-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 underline underline-offset-2 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2"
                    >
                      Configure Now →
                    </button>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Organization ──────────────────────────────────────────── */}
          <SectionCard
            icon={<Building2 className="h-4 w-4" />}
            title="Organization"
          >
            <div>
              <FieldRow label="Deployment Model" value="Single-Tenant" />
              <FieldRow label="Data Isolation" value="Per-deployment (full)" />
              <FieldRow
                label="Multi-Unit Support"
                value="One deployment per unit"
              />
            </div>

            <div
              className="mt-4 rounded border px-4 py-3 space-y-2"
              style={{
                backgroundColor: "#0a111f",
                borderColor: "#1e2d45",
              }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Multi-Tenant Org Namespacing
                </span>
                <Badge
                  className="ml-auto font-mono text-[9px] uppercase tracking-widest"
                  style={{
                    backgroundColor: "rgba(139,92,246,0.12)",
                    color: "#a78bfa",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  Roadmap
                </Badge>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-slate-500">
                Option B: one deployment serving multiple units/organizations
                with hard data isolation. Each unit would have its own org
                namespace, scoped users, and S2 admin. Cross-org access requires
                explicit multi-org grant.
              </p>
              <p className="font-mono text-[10px] text-slate-600">
                Requires a future Motoko backend update (Organization entity,
                orgId scoping on all queries).
              </p>
            </div>
          </SectionCard>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/StubPage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";

interface StubPageProps {
  title: string;
}

export default function StubPage({ title }: StubPageProps) {
  return (
    <div
      data-ocid="stub.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-[0.2em] text-white">
            {title}
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-widest text-slate-500">
            Coming soon
          </p>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/TasksPage.tsx

```tsx
import { TopNav } from "@/components/layout/TopNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <div
      data-ocid="tasks.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Hub</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <CheckSquare className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Tasks
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Action item tracking and assignments
              </p>
            </div>
          </div>

          {/* Coming soon card */}
          <div
            className="rounded border px-6 py-8"
            style={{
              backgroundColor: "#0f1626",
              borderColor: "#1a2235",
            }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckSquare className="h-10 w-10 text-slate-700" />
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Task Management
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-500">
                  Action item tracking tied to personnel and documents. Backend
                  integration planned for a future session.
                </p>
              </div>
              <div
                className="rounded border px-4 py-2"
                style={{
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.05)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-500">
                  Backend integration pending
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/TestLabPage.tsx

```tsx
/**
 * TestLabPage — Bot testing environment for messaging, email, and document access.
 * Provides realistic pre-populated data to validate module UX without backend interaction.
 */

import { TopNav } from "@/components/layout/TopNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  FileText,
  FlaskConical,
  Lock,
  Mail,
  MessageSquare,
  Send,
  Shield,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";

// ─── Bot Profiles ─────────────────────────────────────────────────────────────

interface BotProfile {
  id: string;
  name: string;
  rank: string;
  role: string;
  clearance: string;
  clearanceLevel: number;
  initials: string;
  accentColor: string;
  autoReply: string;
  emailReply: string;
}

const BOTS: BotProfile[] = [
  {
    id: "bot-hayes",
    name: "HAYES, Jordan M",
    rank: "PFC",
    role: "Motor Pool Operator",
    clearance: "UNCLASSIFIED",
    clearanceLevel: 0,
    initials: "JH",
    accentColor: "#64748b",
    autoReply:
      "Wilco. Message received. I'll get back to you at the next available opportunity. PFC Hayes, out.",
    emailReply:
      "PFC Hayes here. Got your message. Will follow up through proper channels. Hooah.",
  },
  {
    id: "bot-rivera",
    name: "RIVERA, Carlos A",
    rank: "SPC",
    role: "Intelligence Analyst",
    clearance: "CUI",
    clearanceLevel: 1,
    initials: "CR",
    accentColor: "#60a5fa",
    autoReply:
      "Copy that. Intelligence section acknowledges. Standing by for further guidance. SPC Rivera.",
    emailReply:
      "SPC Rivera, Intel Section. Your message has been received and logged. Awaiting action items.",
  },
  {
    id: "bot-thompson",
    name: "THOMPSON, Marcus D",
    rank: "SGT",
    role: "Team Leader, 1st PLT",
    clearance: "SECRET",
    clearanceLevel: 2,
    initials: "MT",
    accentColor: "#f59e0b",
    autoReply:
      "Sergeant Thompson here. Roger on your last. I'll coordinate with the team and report back. Watch your six.",
    emailReply:
      "SGT Thompson, 1st PLT. Message received and understood. Will brief the team and respond via secure channel.",
  },
  {
    id: "bot-wallace",
    name: "WALLACE, Sarah K",
    rank: "CPT",
    role: "S3 Operations Officer",
    clearance: "TOP SECRET",
    clearanceLevel: 3,
    initials: "SW",
    accentColor: "#a78bfa",
    autoReply:
      "Captain Wallace, S3. Acknowledged. Reviewed your message against current OPORD. Will integrate into the ops cycle. Stand by.",
    emailReply:
      "CPT Wallace, S3 Operations. Your communication has been received. I'll coordinate with staff and respond with guidance within the hour.",
  },
  {
    id: "bot-nguyen",
    name: "NGUYEN, James T",
    rank: "CW2",
    role: "Aviation Warrant / Intelligence",
    clearance: "TS/SCI",
    clearanceLevel: 4,
    initials: "JN",
    accentColor: "#f87171",
    autoReply:
      "CW2 Nguyen here. Your message has been received at the appropriate classification level. Response will follow through secure means only.",
    emailReply:
      "CW2 Nguyen, Special Programs. Acknowledged. This channel is monitored. Your inquiry will be addressed through proper SCI protocols.",
  },
];

// ─── Test Documents ───────────────────────────────────────────────────────────

interface TestDoc {
  id: string;
  title: string;
  classification: string;
  classLevel: number;
  description: string;
  folder: string;
  accessList: { name: string; rank: string; role: string }[];
  color: string;
}

const TEST_DOCS: TestDoc[] = [
  {
    id: "doc-unclass",
    title: "Unit Training Schedule — Q2",
    classification: "UNCLASSIFIED",
    classLevel: 0,
    description:
      "Quarterly training plan for all personnel. Physical fitness schedule, weapons qualification dates, and mandatory training events.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "All Personnel", rank: "ALL", role: "Unit-wide distribution" },
    ],
    color: "#4ade80",
  },
  {
    id: "doc-cui",
    title: "Personnel Roster — FOUO",
    classification: "CUI // FOUO",
    classLevel: 1,
    description:
      "For Official Use Only. Complete unit personnel roster with contact information, duty assignments, and emergency contacts.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "THOMPSON, Marcus D", rank: "SGT", role: "Team Leader" },
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" },
    ],
    color: "#60a5fa",
  },
  {
    id: "doc-conf",
    title: "Logistics Movement Plan",
    classification: "CONFIDENTIAL",
    classLevel: 2,
    description:
      "Movement timeline, vehicle manifest, and supply routes for upcoming field exercise. Contains grid coordinates and rally points.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "RIVERA, Carlos A", rank: "SPC", role: "Intel Analyst" },
      { name: "THOMPSON, Marcus D", rank: "SGT", role: "Team Leader" },
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" },
    ],
    color: "#f59e0b",
  },
  {
    id: "doc-secret",
    title: "Intelligence Summary — INTREP 07",
    classification: "SECRET",
    classLevel: 3,
    description:
      "Intelligence report summarizing adversary activity, pattern of life analysis, and threat assessment for the operational area.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "THOMPSON, Marcus D", rank: "SGT", role: "Team Leader" },
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" },
    ],
    color: "#fb923c",
  },
  {
    id: "doc-ts",
    title: "Operational Order (OPORD) — Op Ironclad",
    classification: "TOP SECRET",
    classLevel: 4,
    description:
      "Complete OPORD for Operation Ironclad. Situation, mission, execution, sustainment, and command/signal. See annex for task organization.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "WALLACE, Sarah K", rank: "CPT", role: "S3 Ops Officer" },
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" },
    ],
    color: "#f87171",
  },
  {
    id: "doc-tssci",
    title: "Special Access Program Brief",
    classification: "TS/SCI",
    classLevel: 5,
    description:
      "SAP briefing summary. Compartmented information. Access strictly limited to read-on personnel. SCI facility required.",
    folder: "Classification Test Vault",
    accessList: [
      { name: "NGUYEN, James T", rank: "CW2", role: "Intel Officer" },
    ],
    color: "#c084fc",
  },
];

// ─── Thread Message Types ─────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  accentColor: string;
  body: string;
  time: string;
  isMe: boolean;
}

// ─── Messaging Tab ────────────────────────────────────────────────────────────

function MessagingTab() {
  const [selectedBot, setSelectedBot] = useState<BotProfile>(BOTS[0]);
  const [input, setInput] = useState("");
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentThread = threads[selectedBot.id] ?? [];

  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "YOU",
      initials: "ME",
      accentColor: "#f59e0b",
      body: text,
      time: now,
      isMe: true,
    };

    const botReplyDelay = 1200 + Math.random() * 800;
    setThreads((prev) => ({
      ...prev,
      [selectedBot.id]: [...(prev[selectedBot.id] ?? []), userMsg],
    }));
    setInput("");

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: selectedBot.rank,
        initials: selectedBot.initials,
        accentColor: selectedBot.accentColor,
        body: selectedBot.autoReply,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
      };
      setThreads((prev) => ({
        ...prev,
        [selectedBot.id]: [...(prev[selectedBot.id] ?? []), botMsg],
      }));
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }, botReplyDelay);
  }

  function sendBroadcast() {
    const text =
      "ATTENTION ALL: This is a multi-recipient broadcast test message. Please acknowledge receipt.";
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updates: Record<string, ChatMessage[]> = { ...threads };
    for (const bot of BOTS) {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "YOU",
        initials: "ME",
        accentColor: "#f59e0b",
        body: text,
        time: now,
        isMe: true,
      };
      updates[bot.id] = [...(updates[bot.id] ?? []), userMsg];

      const delay = 800 + Math.random() * 1500;
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: bot.rank,
          initials: bot.initials,
          accentColor: bot.accentColor,
          body: bot.autoReply,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: false,
        };
        setThreads((prev) => ({
          ...prev,
          [bot.id]: [...(prev[bot.id] ?? []), botMsg],
        }));
      }, delay);
    }
    setThreads(updates);
  }

  return (
    <div
      data-ocid="testlab.messaging.panel"
      className="flex h-[600px] overflow-hidden rounded border"
      style={{ borderColor: "#1a2235" }}
    >
      {/* Sidebar */}
      <div
        className="w-52 shrink-0 border-r"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <div className="border-b px-3 py-3" style={{ borderColor: "#1a2235" }}>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
            Test Contacts
          </p>
        </div>
        <div className="py-1">
          {BOTS.map((bot) => {
            const unread = (threads[bot.id] ?? []).filter(
              (m) => !m.isMe,
            ).length;
            return (
              <button
                key={bot.id}
                type="button"
                data-ocid="testlab.messaging.contact.button"
                onClick={() => setSelectedBot(bot)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2"
                style={{
                  backgroundColor:
                    selectedBot.id === bot.id
                      ? "rgba(245,158,11,0.06)"
                      : undefined,
                  borderLeft:
                    selectedBot.id === bot.id
                      ? "2px solid #f59e0b"
                      : "2px solid transparent",
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold"
                  style={{
                    backgroundColor: `${bot.accentColor}20`,
                    color: bot.accentColor,
                  }}
                >
                  {bot.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[10px] font-semibold uppercase text-white">
                    {bot.rank}
                  </p>
                  <p className="truncate font-mono text-[9px] text-slate-500">
                    {bot.name.split(",")[0]}
                  </p>
                </div>
                {unread > 0 && (
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold"
                    style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
                  >
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="border-t px-3 py-2" style={{ borderColor: "#1a2235" }}>
          <button
            type="button"
            data-ocid="testlab.messaging.broadcast.button"
            onClick={sendBroadcast}
            className="w-full rounded border px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-colors hover:bg-amber-500/10"
            style={{
              borderColor: "rgba(245,158,11,0.3)",
              color: "#f59e0b",
            }}
          >
            <Users className="mb-0.5 inline h-3 w-3" /> Broadcast All
          </button>
        </div>
      </div>

      {/* Thread */}
      <div
        className="flex flex-1 flex-col"
        style={{ backgroundColor: "#090d1a" }}
      >
        {/* Thread header */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-bold"
            style={{
              backgroundColor: `${selectedBot.accentColor}20`,
              color: selectedBot.accentColor,
            }}
          >
            {selectedBot.initials}
          </div>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              {selectedBot.name}
            </p>
            <p className="font-mono text-[9px] text-slate-500">
              {selectedBot.rank} · {selectedBot.role}
            </p>
          </div>
          <Badge
            className="ml-auto border font-mono text-[8px] uppercase tracking-wider"
            style={{
              borderColor: `${selectedBot.accentColor}40`,
              color: selectedBot.accentColor,
              backgroundColor: `${selectedBot.accentColor}10`,
            }}
          >
            {selectedBot.clearance}
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          {currentThread.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-3 h-8 w-8 text-slate-700" />
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentThread.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.isMe ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold"
                    style={{
                      backgroundColor: `${msg.accentColor}20`,
                      color: msg.accentColor,
                    }}
                  >
                    {msg.initials}
                  </div>
                  <div
                    className={`max-w-[70%] rounded px-3 py-2 ${msg.isMe ? "rounded-tr-none" : "rounded-tl-none"}`}
                    style={{
                      backgroundColor: msg.isMe
                        ? "rgba(245,158,11,0.12)"
                        : "#1a2235",
                      border: `1px solid ${msg.isMe ? "rgba(245,158,11,0.2)" : "#2a3347"}`,
                    }}
                  >
                    <p className="font-mono text-[10px] leading-relaxed text-slate-200">
                      {msg.body}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-slate-600">
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-3" style={{ borderColor: "#1a2235" }}>
          <div className="flex gap-2">
            <Textarea
              data-ocid="testlab.messaging.input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message... (Enter to send)"
              className="min-h-0 resize-none border font-mono text-xs text-white placeholder:text-slate-600"
              style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
              rows={2}
            />
            <Button
              type="button"
              data-ocid="testlab.messaging.send_button"
              onClick={sendMessage}
              disabled={!input.trim()}
              className="shrink-0 self-end font-mono text-xs uppercase tracking-wider disabled:opacity-40"
              style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Email Tab ────────────────────────────────────────────────────────────────

interface EmailMessage {
  id: string;
  from: string;
  fromInitials: string;
  fromColor: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  isReply: boolean;
}

function EmailTab() {
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState(BOTS[0].id);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [inbox, setInbox] = useState<EmailMessage[]>([
    {
      id: "email-welcome",
      from: "SYSTEM",
      fromInitials: "SY",
      fromColor: "#f59e0b",
      subject: "Welcome to Omnis Secure Mail",
      body: "This is a simulated email environment for testing purposes. Your messages are not transmitted externally. Use this module to validate the email UX before backend integration.",
      time: "09:00",
      read: false,
      isReply: false,
    },
  ]);

  function sendEmail() {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    const bot = BOTS.find((b) => b.id === composeTo) ?? BOTS[0];
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const sent: EmailMessage = {
      id: crypto.randomUUID(),
      from: `To: ${bot.rank} ${bot.name}`,
      fromInitials: "ME",
      fromColor: "#f59e0b",
      subject: `Sent: ${composeSubject}`,
      body: composeBody,
      time: now,
      read: true,
      isReply: false,
    };

    setInbox((prev) => [sent, ...prev]);
    setComposeOpen(false);
    setComposeSubject("");
    setComposeBody("");

    setTimeout(
      () => {
        const reply: EmailMessage = {
          id: crypto.randomUUID(),
          from: `${bot.rank} ${bot.name}`,
          fromInitials: bot.initials,
          fromColor: bot.accentColor,
          subject: `RE: ${composeSubject}`,
          body: bot.emailReply,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
          isReply: true,
        };
        setInbox((prev) => [reply, ...prev]);
      },
      2000 + Math.random() * 1500,
    );
  }

  return (
    <div
      data-ocid="testlab.email.panel"
      className="flex h-[600px] overflow-hidden rounded border"
      style={{ borderColor: "#1a2235" }}
    >
      {/* Inbox list */}
      <div
        className="w-72 shrink-0 border-r"
        style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
      >
        <div
          className="flex items-center justify-between border-b px-3 py-3"
          style={{ borderColor: "#1a2235" }}
        >
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
            Inbox ({inbox.filter((m) => !m.read).length} unread)
          </p>
          <button
            type="button"
            data-ocid="testlab.email.compose_button"
            onClick={() => setComposeOpen(true)}
            className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors hover:bg-amber-500/10"
            style={{ borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b" }}
          >
            Compose
          </button>
        </div>
        <ScrollArea className="h-full">
          {inbox.map((msg) => (
            <button
              key={msg.id}
              type="button"
              data-ocid="testlab.email.item.button"
              onClick={() => {
                setSelectedEmail(msg);
                setInbox((prev) =>
                  prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
                );
              }}
              className="flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-white/[0.03]"
              style={{
                backgroundColor:
                  selectedEmail?.id === msg.id
                    ? "rgba(245,158,11,0.04)"
                    : undefined,
                borderLeft: !msg.read
                  ? "2px solid #f59e0b"
                  : "2px solid transparent",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[8px] font-bold"
                  style={{
                    backgroundColor: `${msg.fromColor}20`,
                    color: msg.fromColor,
                  }}
                >
                  {msg.fromInitials}
                </div>
                <span
                  className={`truncate font-mono text-[10px] ${!msg.read ? "font-bold text-white" : "text-slate-400"}`}
                >
                  {msg.from}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[9px] text-slate-600">
                  {msg.time}
                </span>
              </div>
              <p
                className={`truncate font-mono text-[9px] ${!msg.read ? "text-slate-300" : "text-slate-600"}`}
              >
                {msg.subject}
              </p>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Email detail / compose */}
      <div
        className="flex flex-1 flex-col"
        style={{ backgroundColor: "#090d1a" }}
      >
        {composeOpen ? (
          <div className="flex flex-1 flex-col p-5 gap-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-300">
                New Message
              </p>
              <button
                type="button"
                data-ocid="testlab.email.close_button"
                onClick={() => setComposeOpen(false)}
                className="font-mono text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-400"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: native select without Label wrapper */}
                <label
                  htmlFor="compose-to"
                  className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500"
                >
                  To
                </label>
                <select
                  id="compose-to"
                  data-ocid="testlab.email.to.select"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full rounded border bg-transparent px-3 py-2 font-mono text-xs text-white focus:outline-none"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                >
                  {BOTS.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                      {bot.rank} {bot.name} — {bot.clearance}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="compose-subject"
                  className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500"
                >
                  Subject
                </label>
                <input
                  id="compose-subject"
                  data-ocid="testlab.email.subject.input"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="w-full rounded border bg-transparent px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                />
              </div>
              <div>
                <label
                  htmlFor="compose-body"
                  className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-slate-500"
                >
                  Message
                </label>
                <Textarea
                  id="compose-body"
                  data-ocid="testlab.email.body.textarea"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[160px] resize-none border font-mono text-xs text-white placeholder:text-slate-600"
                  style={{ backgroundColor: "#1a2235", borderColor: "#2a3347" }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                data-ocid="testlab.email.send_button"
                onClick={sendEmail}
                disabled={!composeSubject.trim() || !composeBody.trim()}
                className="gap-2 font-mono text-xs uppercase tracking-wider disabled:opacity-40"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          </div>
        ) : selectedEmail ? (
          <div className="flex flex-1 flex-col p-5">
            <div
              className="mb-4 border-b pb-4"
              style={{ borderColor: "#1a2235" }}
            >
              <p className="font-mono text-base font-bold text-white">
                {selectedEmail.subject}
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-500">
                From: {selectedEmail.from} · {selectedEmail.time}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <p className="font-mono text-xs leading-relaxed text-slate-300">
                {selectedEmail.body}
              </p>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Mail className="mb-3 h-8 w-8 text-slate-700" />
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
              Select a message or compose a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  const [selectedDoc, setSelectedDoc] = useState<TestDoc | null>(null);
  const [showRoster, setShowRoster] = useState(false);

  const classColors: Record<
    number,
    { border: string; text: string; bg: string }
  > = {
    0: {
      border: "rgba(74,222,128,0.4)",
      text: "#4ade80",
      bg: "rgba(74,222,128,0.08)",
    },
    1: {
      border: "rgba(96,165,250,0.4)",
      text: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
    },
    2: {
      border: "rgba(245,158,11,0.4)",
      text: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    3: {
      border: "rgba(251,146,60,0.4)",
      text: "#fb923c",
      bg: "rgba(251,146,60,0.08)",
    },
    4: {
      border: "rgba(248,113,113,0.4)",
      text: "#f87171",
      bg: "rgba(248,113,113,0.08)",
    },
    5: {
      border: "rgba(192,132,252,0.4)",
      text: "#c084fc",
      bg: "rgba(192,132,252,0.08)",
    },
  };

  return (
    <div data-ocid="testlab.documents.panel" className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-500" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
          Classification Test Vault — Click any document to view the S2 access
          roster
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEST_DOCS.map((doc, idx) => {
          const cls = classColors[doc.classLevel] ?? classColors[0];
          const isSelected = selectedDoc?.id === doc.id;
          return (
            <button
              key={doc.id}
              type="button"
              data-ocid={`testlab.documents.item.${idx + 1}`}
              onClick={() => {
                setSelectedDoc(isSelected ? null : doc);
                setShowRoster(false);
              }}
              className="flex flex-col gap-3 rounded border p-4 text-left transition-all duration-200 hover:border-amber-500/40"
              style={{
                backgroundColor: isSelected ? "#1a2235" : "#0f1626",
                borderColor: isSelected ? "#f59e0b" : "#1a2235",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span
                  className="rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest"
                  style={{
                    borderColor: cls.border,
                    color: cls.text,
                    backgroundColor: cls.bg,
                  }}
                >
                  {doc.classification}
                </span>
              </div>
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-white">
                  {doc.title}
                </p>
                <p className="mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-500">
                  {doc.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-2.5 w-2.5 text-slate-600" />
                <span className="font-mono text-[9px] text-slate-600">
                  {doc.accessList.length} authorized{" "}
                  {doc.accessList.length === 1 ? "user" : "users"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* S2 Access Roster */}
      {selectedDoc && (
        <div
          data-ocid="testlab.documents.access_roster.panel"
          className="overflow-hidden rounded border"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "#1a2235" }}
          >
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                S2 Access Roster
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-slate-500">
                {selectedDoc.title} · {selectedDoc.classification}
              </p>
            </div>
            <Button
              type="button"
              data-ocid="testlab.documents.roster_toggle.button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRoster((v) => !v)}
              className="h-7 border px-2.5 font-mono text-[9px] uppercase tracking-wider text-amber-400 hover:text-amber-300"
              style={{
                borderColor: "rgba(245,158,11,0.3)",
                backgroundColor: "rgba(245,158,11,0.05)",
              }}
            >
              {showRoster ? "Hide Roster" : "View Roster"}
            </Button>
          </div>

          {showRoster && (
            <div>
              {/* Table header */}
              <div
                className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 border-b px-4 py-2"
                style={{
                  backgroundColor: "#0d1525",
                  borderColor: "#1a2235",
                }}
              >
                {["Name", "Rank", "Role", "Access Level"].map((col) => (
                  <span
                    key={col}
                    className="font-mono text-[9px] uppercase tracking-widest text-slate-600"
                  >
                    {col}
                  </span>
                ))}
              </div>
              {selectedDoc.accessList.map((user, idx) => {
                const cls =
                  classColors[selectedDoc.classLevel] ?? classColors[0];
                return (
                  <div
                    key={`${user.name}-${user.rank}`}
                    data-ocid={`testlab.documents.roster.row.${idx + 1}`}
                    className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 border-b px-4 py-3 last:border-0"
                    style={{ borderColor: "#1a2235" }}
                  >
                    <span className="font-mono text-[11px] font-semibold text-white">
                      {user.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {user.rank}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {user.role}
                    </span>
                    <span
                      className="rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest"
                      style={{
                        borderColor: cls.border,
                        color: cls.text,
                        backgroundColor: cls.bg,
                      }}
                    >
                      {selectedDoc.classification}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TestLabPage ──────────────────────────────────────────────────────────────

export default function TestLabPage() {
  const navigate = useNavigate();

  return (
    <div
      data-ocid="testlab.page"
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      <TopNav />

      <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void navigate({ to: "/" })}
              className="font-mono text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Hub
            </button>
            <ChevronRight className="h-3 w-3 text-slate-700" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
              Test Lab
            </span>
          </div>

          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <FlaskConical className="h-6 w-6" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-white">
                Test Lab
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-500">
                Simulated environment · 5 bot contacts · classification vault ·
                S2 access rosters
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="messaging">
            <TabsList
              className="mb-6 border"
              style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
            >
              <TabsTrigger
                value="messaging"
                data-ocid="testlab.messaging.tab"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Messaging
              </TabsTrigger>
              <TabsTrigger
                value="email"
                data-ocid="testlab.email.tab"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                data-ocid="testlab.documents.tab"
                className="gap-1.5 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
              >
                <FileText className="h-3.5 w-3.5" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messaging">
              <MessagingTab />
            </TabsContent>

            <TabsContent value="email">
              <EmailTab />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: "#1a2235" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-400"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

```

---

## FILE: src/pages/ValidateCommanderPage.tsx

```tsx
import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function ValidateCommanderPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!actor || !identity) {
      setError("Session not ready. Please sign out and sign in again.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await actor.validateS2Admin(identity.getPrincipal());
      setSuccess(true);

      // If this is the founding S2 (came from workspace creation), route to wizard
      const isFoundingS2 = localStorage.getItem("omnis_founding_s2") === "true";
      setTimeout(() => {
        if (isFoundingS2) {
          void navigate({ to: "/workspace-setup" });
        } else {
          void navigate({ to: "/" });
        }
      }, 1000);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Activation failed. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back button */}
        <button
          type="button"
          onClick={() => void navigate({ to: "/" })}
          className="mb-6 flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Return to Hub
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber bg-navy shadow-[0_0_30px_oklch(0.72_0.175_70_/_0.25)]">
            <ShieldCheck className="h-7 w-7 text-amber" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-[0.2em] text-foreground">
            S2 Admin Activation
          </h1>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Activate your S2 administrator role to gain full system access and
            provisioning rights.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-2xl space-y-4">
          <div className="rounded border border-amber/20 bg-amber/5 p-3">
            <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
              Commander authorization code enforcement will be enabled in a
              future backend update. Until then, activation is one click.
            </p>
          </div>

          {success && (
            <output
              data-ocid="validate.success_state"
              className="block font-mono text-xs text-green-400"
            >
              ✓ S2 Admin activated. Redirecting...
            </output>
          )}
          {error && <FormError message={error} />}

          <Button
            data-ocid="validate.submit_button"
            type="button"
            onClick={() => void handleActivate()}
            className="h-11 w-full bg-primary font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating...
              </span>
            ) : (
              "Activate S2 Admin"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

```

---

## FILE: src/pages/WorkspaceSetupPage.tsx

```tsx
/**
 * WorkspaceSetupPage — 4-step wizard after founding S2 activation.
 *
 * MOTOKO BACKLOG (frontend-enforced only):
 * - Organization entity (orgId, name, UIC, type, mode, adminPrincipal, createdAt)
 * - Org uniqueness enforcement (one workspace per UIC)
 * - orgId scoping on ALL entities (Profile, Folder, Document, Message, Notification, etc.)
 * - Commander role constraint (only one per org, backend-enforced)
 * - Provisional S2 status with expiry (time-bound flag on ExtendedProfile)
 * - RoleApprovalRequest entity (commander handoff co-sign, S2 promotion approval)
 * - OrgAccessRequest entity (3-way confirm: user requests → approver accepts → user confirms)
 * - UIC squatting prevention (first-come ownership, challenge mechanism optional)
 */

import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface WorkspaceData {
  name: string;
  uic: string;
  type: string;
  mode: string;
  createdAt: string;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Unit Details",
  "S2 Confirmed",
  "Await Commander",
  "Trust Established",
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? "rgba(34,197,94,0.15)"
                    : isActive
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(255,255,255,0.04)",
                  borderColor: isDone
                    ? "rgba(34,197,94,0.5)"
                    : isActive
                      ? "rgba(245,158,11,0.6)"
                      : "#2a3347",
                  color: isDone ? "#22c55e" : isActive ? "#f59e0b" : "#4b5563",
                }}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className="hidden font-mono text-[9px] uppercase tracking-wider sm:block"
                style={{
                  color: isActive ? "#f59e0b" : isDone ? "#22c55e" : "#4b5563",
                }}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className="mx-2 mb-5 h-px w-8 transition-all duration-300 sm:mx-3 sm:w-10"
                style={{
                  backgroundColor:
                    stepNum < currentStep ? "rgba(34,197,94,0.4)" : "#2a3347",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className="font-mono text-xs font-semibold text-white"
        style={{ letterSpacing: "0.05em" }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WorkspaceSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [_commanderClaimed, setCommanderClaimed] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load workspace from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("omnis_workspace");
    if (raw) {
      try {
        setWorkspace(JSON.parse(raw) as WorkspaceData);
      } catch {
        setWorkspace(null);
      }
    }
  }, []);

  // Poll for commander claim when on step 3
  const checkCommanderClaim = useCallback(() => {
    const claimed = localStorage.getItem("omnis_commander_claimed") === "true";
    setCommanderClaimed(claimed);
    if (claimed) {
      setStep(4);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      checkCommanderClaim(); // immediate check
      pollingRef.current = setInterval(checkCommanderClaim, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, checkCommanderClaim]);

  const claimUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/claim-commander`
      : "/claim-commander";

  const handleCopyClaimUrl = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      toast.success("Claim link copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: "#0a0e1a" }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.01 240 / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-8">
        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <div
          className="rounded-lg border p-6 shadow-2xl"
          style={{ backgroundColor: "#0f1626", borderColor: "#1a2235" }}
        >
          {/* ── Step 1: Confirm Unit Details ── */}
          {step === 1 && workspace && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                  Confirm Unit Details
                </h2>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  Review the workspace configuration before proceeding.
                </p>
              </div>

              {/* Read-only details card */}
              <div
                className="grid grid-cols-2 gap-4 rounded border p-4"
                style={{
                  backgroundColor: "rgba(245,158,11,0.03)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <ReadOnlyField label="Unit Name" value={workspace.name} />
                <ReadOnlyField
                  label="Unit Identification Code (UIC)"
                  value={workspace.uic || "N/A"}
                />
                <ReadOnlyField label="Unit Type" value={workspace.type} />
                <ReadOnlyField label="Mode" value={workspace.mode} />
              </div>

              <button
                type="button"
                data-ocid="workspace_setup.confirm.primary_button"
                onClick={() => setStep(2)}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Confirm &amp; Continue
              </button>
            </div>
          )}

          {/* ── Step 2: Provisional S2 Confirmed ── */}
          {step === 2 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(34,197,94,0.1)",
                  borderColor: "rgba(34,197,94,0.4)",
                }}
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>

              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Provisional S2 Established
                </h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
                  You have been assigned as Provisional S2 Administrator for{" "}
                  <span className="font-semibold" style={{ color: "#f59e0b" }}>
                    {workspace?.name ?? "your workspace"}
                  </span>
                  . You can now approve incoming personnel. Your status will be
                  upgraded to Official S2 once the Commander establishes their
                  role.
                </p>
              </div>

              {/* Info box */}
              <div
                className="w-full rounded border px-4 py-3 text-left"
                style={{
                  backgroundColor: "rgba(245,158,11,0.05)",
                  borderColor: "rgba(245,158,11,0.2)",
                }}
              >
                <p className="font-mono text-[10px] leading-relaxed text-amber-400/80">
                  Your workspace is secured by frontend enforcement. Full
                  cryptographic isolation will be enforced in a future backend
                  update.
                </p>
              </div>

              <button
                type="button"
                data-ocid="workspace_setup.s2_confirmed.primary_button"
                onClick={() => setStep(3)}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Continue to Commander Setup
              </button>
            </div>
          )}

          {/* ── Step 3: Await Commander ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.08)",
                    borderColor: "rgba(245,158,11,0.35)",
                  }}
                >
                  <ShieldCheck
                    className="h-7 w-7"
                    style={{ color: "#f59e0b" }}
                  />
                </div>
                <div>
                  <h2 className="font-mono text-base font-bold uppercase tracking-widest text-white">
                    Establish Chain of Trust
                  </h2>
                  <p className="mt-1.5 font-mono text-xs leading-relaxed text-slate-400">
                    A second authorized person must claim the Commander role to
                    complete the two-person chain of trust. Until then, your S2
                    role is provisional.
                  </p>
                </div>
              </div>

              {/* Share section */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Commander Claim Link
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border px-3 py-2 font-mono text-[10px] text-slate-300"
                    style={{
                      backgroundColor: "#0a0e1a",
                      borderColor: "#2a3347",
                    }}
                  >
                    {claimUrl}
                  </code>
                  <button
                    type="button"
                    data-ocid="workspace_setup.copy_claim_link.button"
                    onClick={() => void handleCopyClaimUrl()}
                    className="flex items-center gap-1.5 rounded border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-amber-500/10"
                    style={{
                      borderColor: "rgba(245,158,11,0.4)",
                      color: "#f59e0b",
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <p className="font-mono text-[10px] leading-relaxed text-slate-600">
                  Share this link with your Commander or designated officer.
                  They must log in with their Internet Identity and claim the
                  Commander role.
                </p>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Waiting for Commander to claim role...
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="workspace_setup.skip.secondary_button"
                  onClick={() => void navigate({ to: "/" })}
                  className="h-10 flex-1 rounded border font-mono text-xs uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
                  style={{ borderColor: "#2a3347" }}
                >
                  Skip for Now — Go to Hub
                </button>
                <button
                  type="button"
                  data-ocid="workspace_setup.poll.primary_button"
                  onClick={checkCommanderClaim}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded border font-mono text-xs uppercase tracking-wider transition-colors hover:bg-amber-500/5"
                  style={{
                    borderColor: "rgba(245,158,11,0.4)",
                    color: "#f59e0b",
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Check Now
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Chain of Trust Established ── */}
          {step === 4 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderColor: "rgba(245,158,11,0.4)",
                }}
              >
                <ShieldCheck className="h-8 w-8" style={{ color: "#f59e0b" }} />
              </div>

              <div>
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">
                  Chain of Trust Established
                </h2>
                <p className="mt-2 font-mono text-xs leading-relaxed text-slate-400">
                  The Commander role has been claimed. Both seats are now
                  filled. Omnis is ready for full operation.
                </p>
              </div>

              {/* Confirmation cards */}
              <div className="flex w-full gap-3">
                <div
                  className="flex flex-1 items-center gap-2 rounded border px-3 py-2"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.06)",
                    borderColor: "rgba(34,197,94,0.2)",
                  }}
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                    S2 Official
                  </span>
                </div>
                <div
                  className="flex flex-1 items-center gap-2 rounded border px-3 py-2"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.06)",
                    borderColor: "rgba(34,197,94,0.2)",
                  }}
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-green-400">
                    Commander
                  </span>
                </div>
              </div>

              <button
                type="button"
                data-ocid="workspace_setup.enter.primary_button"
                onClick={() => void navigate({ to: "/" })}
                className="h-10 w-full rounded font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200"
                style={{ backgroundColor: "#f59e0b", color: "#0a0e1a" }}
              >
                Enter Omnis
              </button>
            </div>
          )}
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-[10px] text-slate-700">
          {step < 4
            ? "Both seats must be filled before the chain of trust is complete."
            : "Workspace is operational. All access is monitored."}
        </p>
      </div>

      {/* Bottom line */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}

```
