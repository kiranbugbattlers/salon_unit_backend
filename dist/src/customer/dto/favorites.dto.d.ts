import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { BusinessAddressDto, BusinessMediaDto } from '../../business/dto';
export declare class FavoriteBusinessItemDto {
    id: string;
    shopId: string;
    businessName: string;
    businessDescription?: string;
    operatingYears?: number;
    businessAddress?: BusinessAddressDto;
    businessMedia?: BusinessMediaDto[];
    averageRating?: number;
    reviewCount?: number;
    favoritedAt: Date;
}
export declare class FavoritesPaginationDto {
    page?: number;
    limit?: number;
}
export declare class FavoritesMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class FavoritesDataDto {
    favorites: FavoriteBusinessItemDto[];
    meta: FavoritesMetaDto;
}
export declare class FavoritesResponseDto extends ApiResponseDto<FavoritesDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: FavoritesDataDto;
    constructor(code: number, success: boolean, message: string, data: FavoritesDataDto);
}
export declare class FavoriteActionResponseDto extends ApiResponseDto<{
    isFavorite: boolean;
}> {
    code: number;
    success: boolean;
    message: string;
    data: {
        isFavorite: boolean;
    };
    constructor(code: number, success: boolean, message: string, isFavorite: boolean);
}
