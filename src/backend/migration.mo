import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type ReviewId = Nat;
  type Rating = Nat;

  type OldReview = {
    id : ReviewId;
    title : Text;
    author : Text;
    isbn : ?Text;
    rating : Rating;
    reviewText : Text;
    createdAt : Int;
    likes : Nat;
    likedBy : [Principal];
  };

  type NewReview = {
    id : ReviewId;
    title : Text;
    author : Text;
    isbn : ?Text;
    rating : Rating;
    reviewText : Text;
    cover : ?Storage.ExternalBlob;
    createdAt : Int;
    likes : Nat;
    likedBy : [Principal];
  };

  public type OldUserProfile = {
    name : Text;
  };

  public type NewUserProfile = {
    name : Text;
    avatar : ?Storage.ExternalBlob;
  };

  type OldActor = {
    reviews : Map.Map<ReviewId, OldReview>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    reviews : Map.Map<ReviewId, NewReview>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldProfile) {
        { oldProfile with avatar = null };
      }
    );

    let newReviews = old.reviews.map<ReviewId, OldReview, NewReview>(
      func(_id, oldReview) {
        { oldReview with cover = null };
      }
    );

    {
      reviews = newReviews;
      userProfiles = newUserProfiles;
    };
  };
};
