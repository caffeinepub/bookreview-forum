import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type Rating = bigint;
export interface ReadingSession {
    startTime: Time;
    endTime?: Time;
    bookId: bigint;
    pagesRead: bigint;
}
export interface TrackedBook {
    id: bigint;
    title: string;
    isbn?: string;
    author: string;
    progress: Progress;
}
export interface ReadingMetrics {
    totalHours: bigint;
    sessions: Array<ReadingSession>;
    totalBooks: bigint;
    totalPages: bigint;
}
export interface Progress {
    status: string;
    percentage: bigint;
}
export type ReviewId = bigint;
export interface Comment {
    id: bigint;
    createdAt: Time;
    user: string;
    reviewId: ReviewId;
    commentText: string;
}
export interface UserProfile {
    name: string;
}
export interface Review {
    id: ReviewId;
    title: string;
    isbn?: string;
    createdAt: Time;
    reviewText: string;
    likedBy: Array<Principal>;
    author: string;
    likes: bigint;
    rating: Rating;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(reviewId: ReviewId, user: string, commentText: string): Promise<bigint>;
    addReview(title: string, author: string, isbn: string | null, rating: Rating, reviewText: string): Promise<ReviewId>;
    addTrackedBook(title: string, author: string, isbn: string | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    finishBook(): Promise<void>;
    finishReadingSession(bookId: bigint, pagesRead: bigint, hoursSpent: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(reviewId: ReviewId): Promise<Array<Comment>>;
    getGlobalReadingMetrics(): Promise<{
        totalHours: bigint;
        totalBooks: bigint;
        totalPages: bigint;
    }>;
    getLatestReviews(limit: bigint): Promise<Array<Review>>;
    getReadingMetrics(): Promise<ReadingMetrics | null>;
    getReview(id: ReviewId): Promise<Review | null>;
    getTrackedBooks(): Promise<Array<TrackedBook>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeReview(reviewId: ReviewId): Promise<void>;
    removeTrackedBook(bookId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startReadingSession(bookId: bigint): Promise<void>;
    unlikeReview(reviewId: ReviewId): Promise<void>;
    updateBookProgress(bookId: bigint, status: string, percentage: bigint): Promise<void>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
}
