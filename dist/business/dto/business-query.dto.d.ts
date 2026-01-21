import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
export declare enum BusinessSortField {
    RATING = "rating",
    NAME = "name",
    CREATED_AT = "createdAt",
    DISTANCE = "distance",
    OPERATING_YEARS = "operatingYears"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class BusinessQueryDto {
    lat?: number;
    lng?: number;
    radius?: number;
    sort?: string;
    userspecific?: boolean;
    page?: number;
    limit?: number;
    category?: string;
    availableAtHome?: boolean;
    minPrice?: number;
    maxPrice?: number;
    gender?: ServiceGenderEnum;
    minOperatingYears?: number;
    search?: string;
}
