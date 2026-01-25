export declare class AvailableSlotsQueryDto {
    startDate: string;
    numberOfDays: number;
    staffId?: string;
}
export declare class TimeSlotDto {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    staff: {
        id: string;
        firstName: string;
        lastName: string;
        specializations: string[];
    };
}
export declare class DayAvailabilityDto {
    date: string;
    dayOfWeek: string;
    isBusinessOpen: boolean;
    businessHours: {
        openTime: string;
        closeTime: string;
    } | null;
    timeSlots: TimeSlotDto[];
}
export declare class AvailableSlotsResponseDto {
    business: {
        id: string;
        name: string;
        address: string;
    };
    dateRange: {
        startDate: string;
        endDate: string;
        numberOfDays: number;
    };
    days: DayAvailabilityDto[];
    totalAvailableSlots: number;
}
