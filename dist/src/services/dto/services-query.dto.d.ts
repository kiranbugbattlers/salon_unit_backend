import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
export declare enum ServiceSortField {
    PRICE = "price",
    RATING = "rating",
    NAME = "name",
    CREATED_AT = "createdAt",
    DISTANCE = "distance"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class ServicesQueryDto {
    lat?: number;
    lng?: number;
    radius?: number;
    sort?: string;
    userspecific?: boolean;
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    availableAtHome?: boolean;
    minPrice?: number;
    maxPrice?: number;
    gender?: ServiceGenderEnum;
}
