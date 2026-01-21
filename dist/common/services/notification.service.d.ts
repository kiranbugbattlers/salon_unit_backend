import { Repository } from 'typeorm';
import { User } from '../../database/entities';
export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
}
export interface EmailNotificationPayload {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
}
export declare class NotificationService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    sendPushNotification(userId: string, payload: NotificationPayload): Promise<void>;
    sendEmailNotification(payload: EmailNotificationPayload): Promise<void>;
    sendSmsNotification(phoneNumber: string, message: string): Promise<void>;
    notifyAgentOfNewApproval(agentUserId: string, businessName: string, approvalId: string): Promise<void>;
    notifyBusinessOfApprovalStatus(businessOwnerUserId: string, businessName: string, isApproved: boolean, notes?: string, rejectionReason?: string): Promise<void>;
    notifyAgentOfApprovalReassignment(newAgentUserId: string, businessName: string, approvalId: string, reassignmentReason?: string): Promise<void>;
}
