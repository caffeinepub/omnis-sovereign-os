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
