export declare class BookingHistoryDto {
    bookingId: string;
    customerName: string;
    bookingAmount: number;
    paymentMethod: string;
    bookingDateTime: Date;
    createdAt: Date;
}
export declare class BookingHistoryListDto {
    bookings: BookingHistoryDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
}
export declare class BookingHistoryQueryDto {
    customerId?: string;
    businessOwnerId?: string;
    status?: string;
    date?: string;
    appointmentDate?: string;
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
