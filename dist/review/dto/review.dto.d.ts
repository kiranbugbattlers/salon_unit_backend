export declare class CreateReviewDto {
    bookingId: string;
    rating: number;
    comment?: string;
}
export declare class UpdateReviewDto {
    rating?: number;
    comment?: string;
    isApproved?: boolean;
}
export declare class ReviewResponseDto {
    id: string;
    bookingId: string;
    customerId: string;
    businessOwnerId: string;
    rating: number;
    comment?: string;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    customer?: {
        id: string;
        firstName?: string;
        lastName?: string;
        profilePic?: string;
        profilePicCdnUrl?: string;
    };
    businessOwner?: {
        id: string;
        businessName?: string;
        shopId: string;
    };
}
export declare class ReviewListResponseDto {
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ReviewQueryDto {
    businessOwnerId?: string;
    customerId?: string;
    rating?: number;
    isApproved?: boolean;
    page?: number;
    limit?: number;
}
