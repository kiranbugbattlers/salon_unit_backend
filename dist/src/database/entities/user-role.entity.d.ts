import { UserRole as UserRoleEnum } from '../../common/enums';
import { User } from './user.entity';
export declare class UserRole {
    id: string;
    userId: string;
    role: UserRoleEnum;
    isActive: boolean;
    createdAt: Date;
    user: User;
}
