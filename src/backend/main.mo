import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ReviewId = Nat;
  type Rating = Nat;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    avatar : ?Storage.ExternalBlob; // Optional user avatar
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  public type Review = {
    id : ReviewId;
    title : Text;
    author : Text;
    isbn : ?Text;
    rating : Rating;
    reviewText : Text;
    cover : ?Storage.ExternalBlob; // Optional book cover
    createdAt : Time.Time;
    likes : Nat;
    likedBy : [Principal];
  };

  public type Comment = {
    id : Nat;
    reviewId : ReviewId;
    user : Text;
    commentText : Text;
    createdAt : Time.Time;
  };

  module Review {
    public func compareByCreatedAt(review1 : Review, review2 : Review) : Order.Order {
      Int.compare(review2.createdAt, review1.createdAt);
    };
  };

  // Reviews
  var nextReviewId = 0;
  let reviews = Map.empty<ReviewId, Review>();

  // Comments
  var nextCommentId = 0;
  let comments = Map.empty<Nat, Comment>();

  // Reading Tracker
  type Progress = {
    status : Text;
    percentage : Nat;
  };

  public type TrackedBook = {
    id : Nat;
    title : Text;
    author : Text;
    isbn : ?Text;
    progress : Progress;
  };

  var nextTrackedBookId = 0;
  let trackedBooks = Map.empty<Principal, Map.Map<Nat, TrackedBook>>();

  public type ReadingSession = {
    bookId : Nat;
    startTime : Time.Time;
    endTime : ?Time.Time;
    pagesRead : Nat;
  };

  type ReadingMetrics = {
    totalPages : Nat;
    totalBooks : Nat;
    totalHours : Nat; // Hours stored as Nat
    sessions : [ReadingSession];
  };

  let readingMetrics = Map.empty<Principal, ReadingMetrics>();

  public type AddReviewInput = {
    title : Text;
    author : Text;
    isbn : ?Text;
    rating : Nat;
    reviewText : Text;
    cover : ?Storage.ExternalBlob;
  };

  public shared ({ caller }) func addReviewWithCover(input : AddReviewInput) : async ReviewId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create reviews");
    };

    if (input.rating < 1 or input.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let review : Review = {
      id = nextReviewId;
      title = input.title;
      author = input.author;
      isbn = input.isbn;
      rating = input.rating;
      reviewText = input.reviewText;
      cover = input.cover;
      createdAt = Time.now();
      likes = 0;
      likedBy = [];
    };

    reviews.add(nextReviewId, review);
    let id = nextReviewId;
    nextReviewId += 1;
    id;
  };

  public shared ({ caller }) func addReview(title : Text, author : Text, isbn : ?Text, rating : Rating, reviewText : Text) : async ReviewId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let review : Review = {
      id = nextReviewId;
      title;
      author;
      isbn;
      rating;
      reviewText;
      cover = null;
      createdAt = Time.now();
      likes = 0;
      likedBy = [];
    };

    reviews.add(nextReviewId, review);
    let id = nextReviewId;
    nextReviewId += 1;
    id;
  };

  public query ({ caller }) func getLatestReviews(limit : Nat) : async [Review] {
    let sortedReviews = reviews.values().toArray().sort(Review.compareByCreatedAt);
    sortedReviews.sliceToArray(0, Nat.min(limit, sortedReviews.size()));
  };

  public query ({ caller }) func getReview(id : ReviewId) : async ?Review {
    reviews.get(id);
  };

  func contains(caller : Principal, array : [Principal]) : Bool {
    for (val in array.values()) {
      if (val == caller) {
        return true;
      };
    };
    false;
  };

  public shared ({ caller }) func likeReview(reviewId : ReviewId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like reviews");
    };

    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review not found") };
      case (?review) {
        if (contains(caller, review.likedBy)) {
          Runtime.trap("Review already liked");
        };

        let updatedReview : Review = {
          review with
          likes = review.likes + 1;
          likedBy = review.likedBy.concat([caller]);
        };

        reviews.add(reviewId, updatedReview);
      };
    };
  };

  public shared ({ caller }) func unlikeReview(reviewId : ReviewId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike reviews");
    };

    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review not found") };
      case (?review) {
        if (not contains(caller, review.likedBy)) {
          Runtime.trap("Review not liked previously");
        };

        let filteredLikedBy = review.likedBy.filter(func(liked) { liked != caller });
        let updatedReview : Review = {
          review with
          likes = if (review.likes == 0) { 0 } else { review.likes - 1 };
          likedBy = filteredLikedBy;
        };

        reviews.add(reviewId, updatedReview);
      };
    };
  };

  // Comments
  public shared ({ caller }) func addComment(reviewId : ReviewId, user : Text, commentText : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (commentText.size() == 0) {
      Runtime.trap("Comment cannot be empty");
    };

    if (not reviews.containsKey(reviewId)) {
      Runtime.trap("Review not found");
    };

    let comment : Comment = {
      id = nextCommentId;
      reviewId;
      user;
      commentText;
      createdAt = Time.now();
    };

    comments.add(nextCommentId, comment);
    let id = nextCommentId;
    nextCommentId += 1;
    id;
  };

  public query ({ caller }) func getComments(reviewId : ReviewId) : async [Comment] {
    comments.values().toArray().filter(func(comment) { comment.reviewId == reviewId });
  };

  // Reading Tracker
  public shared ({ caller }) func addTrackedBook(title : Text, author : Text, isbn : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track books");
    };

    let book : TrackedBook = {
      id = nextTrackedBookId;
      title;
      author;
      isbn;
      progress = {
        status = "Not started";
        percentage = 0;
      };
    };

    switch (trackedBooks.get(caller)) {
      case (null) {
        let newTracker = Map.singleton<Nat, TrackedBook>(nextTrackedBookId, book);
        trackedBooks.add(caller, newTracker);
      };
      case (?userBooks) {
        userBooks.add(nextTrackedBookId, book);
      };
    };

    let id = nextTrackedBookId;
    nextTrackedBookId += 1;
    id;
  };

  public shared ({ caller }) func updateBookProgress(bookId : Nat, status : Text, percentage : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update book progress");
    };

    if (percentage > 100) {
      Runtime.trap("Percentage cannot be greater than 100");
    };

    switch (trackedBooks.get(caller)) {
      case (null) { Runtime.trap("No books found for this user") };
      case (?userBooks) {
        switch (userBooks.get(bookId)) {
          case (null) { Runtime.trap("Book not found") };
          case (?book) {
            let updatedBook : TrackedBook = {
              book with
              progress = {
                status;
                percentage;
              };
            };
            userBooks.add(bookId, updatedBook);
          };
        };
      };
    };
  };

  public query ({ caller }) func getTrackedBooks() : async [TrackedBook] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tracked books");
    };

    switch (trackedBooks.get(caller)) {
      case (null) { [] };
      case (?userBooks) { userBooks.values().toArray() };
    };
  };

  public shared ({ caller }) func removeTrackedBook(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove tracked books");
    };

    switch (trackedBooks.get(caller)) {
      case (null) { Runtime.trap("No books found for this user") };
      case (?userBooks) {
        userBooks.remove(bookId);
      };
    };
  };

  // Reading Metrics Functions
  public shared ({ caller }) func startReadingSession(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start a reading session");
    };

    let session : ReadingSession = {
      bookId;
      startTime = Time.now();
      endTime = null;
      pagesRead = 0;
    };

    switch (readingMetrics.get(caller)) {
      case (null) {
        let newMetrics : ReadingMetrics = {
          totalPages = 0;
          totalBooks = 0;
          totalHours = 0;
          sessions = [session];
        };
        readingMetrics.add(caller, newMetrics);
      };
      case (?metrics) {
        let updatedSessions = metrics.sessions.concat([session]);
        let updatedMetrics = {
          metrics with
          sessions = updatedSessions;
        };
        readingMetrics.add(caller, updatedMetrics);
      };
    };
  };

  public shared ({ caller }) func finishReadingSession(bookId : Nat, pagesRead : Nat, hoursSpent : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finish a reading session");
    };

    switch (readingMetrics.get(caller)) {
      case (null) { Runtime.trap("No sessions found for user") };
      case (?metrics) {
        let sessions = metrics.sessions;
        if (sessions.size() == 0) {
          Runtime.trap("No sessions found for user");
        };

        let currentSession = sessions[sessions.size() - 1];
        if (currentSession.bookId != bookId) {
          Runtime.trap("Current session does not match the given bookId");
        };

        let updatedSession : ReadingSession = {
          bookId;
          startTime = currentSession.startTime;
          endTime = ?Time.now();
          pagesRead;
        };

        let filteredSessions = sessions.sliceToArray(0, sessions.size() - 1);
        let updatedSessions = filteredSessions.concat([updatedSession]);

        let updatedMetrics : ReadingMetrics = {
          metrics with
          totalPages = metrics.totalPages + pagesRead;
          totalHours = metrics.totalHours + hoursSpent;
          sessions = updatedSessions;
        };
        readingMetrics.add(caller, updatedMetrics);
      };
    };
  };

  public shared ({ caller }) func finishBook() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can finish books");
    };

    switch (readingMetrics.get(caller)) {
      case (null) { Runtime.trap("No metrics found for user") };
      case (?metrics) {
        let updatedMetrics : ReadingMetrics = {
          metrics with
          totalBooks = metrics.totalBooks + 1;
        };
        readingMetrics.add(caller, updatedMetrics);
      };
    };
  };

  public query ({ caller }) func getReadingMetrics() : async ?ReadingMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reading metrics");
    };
    readingMetrics.get(caller);
  };

  public query ({ caller }) func getGlobalReadingMetrics() : async {
    totalPages : Nat;
    totalBooks : Nat;
    totalHours : Nat;
  } {
    var totalPages = 0;
    var totalBooks = 0;
    var totalHours = 0;

    for ((_, metrics) in readingMetrics.entries()) {
      totalPages += metrics.totalPages;
      totalBooks += metrics.totalBooks;
      totalHours += metrics.totalHours;
    };

    {
      totalPages;
      totalBooks;
      totalHours;
    };
  };
};
