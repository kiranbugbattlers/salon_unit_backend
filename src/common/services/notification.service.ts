import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Send push notification to user via FCM
   * This is a placeholder - implement with actual FCM integration
   */
  async sendPushNotification(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'fcmToken', 'phone'],
      });

      if (!user?.fcmToken) {
        console.log(`No FCM token found for user ${userId}`);
        return;
      }

      // TODO: Implement actual FCM sending logic here
      // This is a placeholder for the actual FCM integration
      console.log(`[FCM] Sending notification to user ${userId}:`, {
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      });

      // In a real implementation, you would use Firebase Admin SDK:
      // const message = {
      //   token: user.fcmToken,
      //   notification: {
      //     title: payload.title,
      //     body: payload.body,
      //   },
      //   data: payload.data || {},
      // };
      // 
      // await admin.messaging().send(message);

    } catch (error) {
      console.error(`Failed to send push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send email notification
   * This is a placeholder - implement with actual email service
   */
  async sendEmailNotification(payload: EmailNotificationPayload): Promise<void> {
    try {
      // TODO: Implement actual email sending logic here
      // This could be done with services like SendGrid, AWS SES, etc.
      console.log(`[EMAIL] Sending email notification:`, {
        to: payload.to,
        subject: payload.subject,
        body: payload.isHtml ? '[HTML Content]' : payload.body,
      });

      // In a real implementation, you would use an email service:
      // await emailService.send({
      //   to: payload.to,
      //   subject: payload.subject,
      //   [payload.isHtml ? 'html' : 'text']: payload.body,
      // });

    } catch (error) {
      console.error(`Failed to send email to ${payload.to}:`, error);
    }
  }

  /**
   * Send SMS notification
   * This is a placeholder - implement with actual SMS service
   */
  async sendSmsNotification(phoneNumber: string, message: string): Promise<void> {
    try {
      // TODO: Implement actual SMS sending logic here
      // This could be done with Twilio, AWS SNS, etc.
      console.log(`[SMS] Sending SMS to ${phoneNumber}: ${message}`);

      // In a real implementation, you would use an SMS service:
      // await smsService.send({
      //   to: phoneNumber,
      //   body: message,
      // });

    } catch (error) {
      console.error(`Failed to send SMS to ${phoneNumber}:`, error);
    }
  }

  /**
   * Send business approval notification to agent
   */
  async notifyAgentOfNewApproval(
    agentUserId: string,
    businessName: string,
    approvalId: string
  ): Promise<void> {
    const pushPayload: NotificationPayload = {
      title: 'New Business Approval Request',
      body: `${businessName} has submitted a registration request for your review.`,
      data: {
        type: 'business_approval',
        approvalId,
        businessName,
      },
    };

    await this.sendPushNotification(agentUserId, pushPayload);

    // Also send email notification
    const agent = await this.userRepository.findOne({
      where: { id: agentUserId },
      select: ['email', 'phone'],
    });

    if (agent?.email) {
      const emailPayload: EmailNotificationPayload = {
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

  /**
   * Send business approval status notification to business owner
   */
  async notifyBusinessOfApprovalStatus(
    businessOwnerUserId: string,
    businessName: string,
    isApproved: boolean,
    notes?: string,
    rejectionReason?: string
  ): Promise<void> {
    const status = isApproved ? 'Approved' : 'Rejected';
    const pushPayload: NotificationPayload = {
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

    // Also send email notification
    const businessOwner = await this.userRepository.findOne({
      where: { id: businessOwnerUserId },
      select: ['email', 'phone'],
    });

    if (businessOwner?.email) {
      const emailSubject = `Business Registration ${status} - ${businessName}`;
      let emailBody: string;

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
      } else {
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

      const emailPayload: EmailNotificationPayload = {
        to: businessOwner.email,
        subject: emailSubject,
        body: emailBody,
      };

      await this.sendEmailNotification(emailPayload);
    }
  }

  /**
   * Send approval reassignment notification to agent
   */
  async notifyAgentOfApprovalReassignment(
    newAgentUserId: string,
    businessName: string,
    approvalId: string,
    reassignmentReason?: string
  ): Promise<void> {
    const pushPayload: NotificationPayload = {
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
      const emailPayload: EmailNotificationPayload = {
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
}