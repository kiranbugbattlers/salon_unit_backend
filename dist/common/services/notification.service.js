"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let NotificationService = class NotificationService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async sendPushNotification(userId, payload) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'fcmToken', 'phone'],
            });
            if (!user?.fcmToken) {
                console.log(`No FCM token found for user ${userId}`);
                return;
            }
            console.log(`[FCM] Sending notification to user ${userId}:`, {
                token: user.fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
            });
        }
        catch (error) {
            console.error(`Failed to send push notification to user ${userId}:`, error);
        }
    }
    async sendEmailNotification(payload) {
        try {
            console.log(`[EMAIL] Sending email notification:`, {
                to: payload.to,
                subject: payload.subject,
                body: payload.isHtml ? '[HTML Content]' : payload.body,
            });
        }
        catch (error) {
            console.error(`Failed to send email to ${payload.to}:`, error);
        }
    }
    async sendSmsNotification(phoneNumber, message) {
        try {
            console.log(`[SMS] Sending SMS to ${phoneNumber}: ${message}`);
        }
        catch (error) {
            console.error(`Failed to send SMS to ${phoneNumber}:`, error);
        }
    }
    async notifyAgentOfNewApproval(agentUserId, businessName, approvalId) {
        const pushPayload = {
            title: 'New Business Approval Request',
            body: `${businessName} has submitted a registration request for your review.`,
            data: {
                type: 'business_approval',
                approvalId,
                businessName,
            },
        };
        await this.sendPushNotification(agentUserId, pushPayload);
        const agent = await this.userRepository.findOne({
            where: { id: agentUserId },
            select: ['email', 'phone'],
        });
        if (agent?.email) {
            const emailPayload = {
                to: agent.email,
                subject: 'New Business Approval Request',
                body: `
          Hello,
          
          A new business "${businessName}" has submitted a registration request that has been assigned to you for review.
          
          Please log in to your agent dashboard to review the business details and make an approval decision.
          
          Approval ID: ${approvalId}
          Business Name: ${businessName}
          
          Thank you for your prompt attention to this matter.
          
          Best regards,
          The Platform Team
        `,
            };
            await this.sendEmailNotification(emailPayload);
        }
    }
    async notifyBusinessOfApprovalStatus(businessOwnerUserId, businessName, isApproved, notes, rejectionReason) {
        const status = isApproved ? 'Approved' : 'Rejected';
        const pushPayload = {
            title: `Business Registration ${status}`,
            body: isApproved
                ? `Congratulations! ${businessName} has been approved and is now live on our platform.`
                : `Unfortunately, ${businessName} registration was not approved. Please review the feedback and reapply.`,
            data: {
                type: 'business_approval_status',
                businessName,
                isApproved,
                notes,
                rejectionReason,
            },
        };
        await this.sendPushNotification(businessOwnerUserId, pushPayload);
        const businessOwner = await this.userRepository.findOne({
            where: { id: businessOwnerUserId },
            select: ['email', 'phone'],
        });
        if (businessOwner?.email) {
            const emailSubject = `Business Registration ${status} - ${businessName}`;
            let emailBody;
            if (isApproved) {
                emailBody = `
          Congratulations!
          
          Your business "${businessName}" has been successfully approved and is now live on our platform.
          
          You can now start accepting bookings and managing your business through the platform.
          
          ${notes ? `Review Notes: ${notes}` : ''}
          
          Welcome to our platform!
          
          Best regards,
          The Platform Team
        `;
            }
            else {
                emailBody = `
          Dear Business Owner,
          
          We regret to inform you that your business registration for "${businessName}" was not approved at this time.
          
          Reason: ${rejectionReason}
          
          ${notes ? `Additional Notes: ${notes}` : ''}
          
          Please review the feedback and feel free to address the issues and reapply.
          
          If you have any questions, please contact our support team.
          
          Best regards,
          The Platform Team
        `;
            }
            const emailPayload = {
                to: businessOwner.email,
                subject: emailSubject,
                body: emailBody,
            };
            await this.sendEmailNotification(emailPayload);
        }
    }
    async notifyAgentOfApprovalReassignment(newAgentUserId, businessName, approvalId, reassignmentReason) {
        const pushPayload = {
            title: 'Approval Request Reassigned',
            body: `Business "${businessName}" approval has been reassigned to you.`,
            data: {
                type: 'approval_reassignment',
                approvalId,
                businessName,
                reassignmentReason,
            },
        };
        await this.sendPushNotification(newAgentUserId, pushPayload);
        const agent = await this.userRepository.findOne({
            where: { id: newAgentUserId },
            select: ['email'],
        });
        if (agent?.email) {
            const emailPayload = {
                to: agent.email,
                subject: `Approval Request Reassigned - ${businessName}`,
                body: `
          Hello,
          
          A business approval request for "${businessName}" has been reassigned to you by an administrator.
          
          ${reassignmentReason ? `Reason: ${reassignmentReason}` : ''}
          
          Please log in to your agent dashboard to review the business details and make an approval decision.
          
          Approval ID: ${approvalId}
          Business Name: ${businessName}
          
          Thank you for your attention to this matter.
          
          Best regards,
          The Platform Team
        `,
            };
            await this.sendEmailNotification(emailPayload);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map