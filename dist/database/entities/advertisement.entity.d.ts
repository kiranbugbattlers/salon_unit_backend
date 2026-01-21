import { Admin } from './admin.entity';
import { AdMediaType } from '../../common/enums';
export declare class Advertisement {
    id: string;
    title: string;
    description?: string;
    mediaType: AdMediaType;
    mediaUrl: string;
    linkUrl?: string;
    targetUserTypes: string[];
    targetScreens: Record<string, string[]>;
    priority: number;
    isActive: boolean;
    impressionCount: number;
    clickCount: number;
    startDate?: Date;
    endDate?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    admin: Admin;
}
