import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

import List "mo:core/List";


actor {
  stable let userProfiles = Map.empty<Principal, UserProfile>();
  stable let profiles = Map.empty<Principal, ExtendedProfile>();
  stable let sections = Map.empty<Text, Section>();
  stable let folders = Map.empty<Text, Folder>();
  stable let folderPermissions = Map.empty<Text, FolderPermission>();
  stable let documents = Map.empty<Text, Document>();
  stable let notifications = Map.empty<Text, Notification>();
  stable let messages = Map.empty<Text, Message>();
  stable let anomalyEvents = Map.empty<Text, AnomalyEvent>();

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
    documentStatus : Text;
    sha256Hash : Text;
    downloadCount : Nat;
    orgId : Text;
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
};
