import { Gender } from '../../common/enums';
import { CustomerOnboarding } from './customer-onboarding.entity';
import { User } from './user.entity';
import { Review } from './review.entity';
export declare class Customer {
    id: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    onboarding?: CustomerOnboarding;
    reviews: Review[];
}
