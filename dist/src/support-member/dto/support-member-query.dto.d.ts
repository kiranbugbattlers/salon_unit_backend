export declare enum SupportMemberSortBy {
    CUSTOMER_COUNT = "customerCount",
    NAME = "firstName",
    JOINING_DATE = "joiningDate"
}
export declare class SupportMemberQueryDto {
    page?: number;
    limit?: number;
    isActive?: boolean;
    sortBy?: SupportMemberSortBy;
}
