import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { generateShopId } from '../../common/utils/shop-id.util';
import { Gender } from '../../common/enums';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
import { BusinessOwnerOnboarding } from './business-owner-onboarding.entity';
import { BusinessAddress } from './business-address.entity';
import { BusinessApproval } from './business-approval.entity';
import { BusinessService } from './business-service.entity';
import { ServicePackage } from './service-package.entity';
import { Staff } from './staff.entity';
import { BankingInfo } from './banking-info.entity';
import { Review } from './review.entity';
import { BusinessDocument } from './business-document.entity';
import { BusinessMedia } from './business-media.entity';
import { VendorDuePayment } from './vendor-due-payment.entity';
import { BusinessSubscription } from './business-subscription.entity';

@Entity('business_owner')
export class BusinessOwner {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Unique shop identifier with format SH-XXXXXX' })
  @Column({ name: 'shop_id', length: 9, unique: true, nullable: true })
  shopId: string;

  @ApiProperty({ required: false })
  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @ApiProperty({ enum: Gender, required: false })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @ApiProperty({ required: false })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'business_name', length: 200, nullable: true })
  businessName?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'business_description', type: 'text', nullable: true })
  businessDescription?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'operating_years', type: 'int', nullable: true })
  operatingYears?: number;

  @ApiProperty()
  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'When the business was marked as defaulter', required: false })
  @Column({ name: 'is_defaulter', default: false })
  isDefaulter: boolean;

  @ApiProperty({ description: 'When the business was marked as defaulter', required: false })
  @Column({ name: 'defaulter_since', type: 'timestamp', nullable: true })
  defaulterSince?: Date;

  @ApiProperty({ description: 'Whether the business is active' })
  @Column({ name: 'is_active', default: true, select: false })
  isActive: boolean;

  @ApiProperty({ description: 'UPI ID for payments', required: false })
  @Column({ name: 'upi_id', length: 50, nullable: true })
  upiId?: string;

  @ApiProperty({ description: 'Credit limit assigned by admin', required: false })
  @Column({ name: 'credit_limit', type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  creditLimit?: number;

  @ApiProperty({ description: 'Additional remarks or notes about the business owner', required: false })
  @Column({ name: 'remark', type: 'text', nullable: true })
  remark?: string;

  @ApiProperty({ description: 'Alternate contact number for the business owner', required: false })
  @Column({ name: 'alternate_number', length: 20, nullable: true })
  alternateNumber?: string;

  @ApiProperty({ enum: VendorStatus, description: 'Vendor status for service visibility' })
  @Column({
    name: 'vendor_status',
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.ACTIVE,
  })
  vendorStatus: VendorStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.businessOwner)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => BusinessAddress, (address) => address.businessOwner)
  addresses: BusinessAddress[];

  @OneToOne(() => BusinessOwnerOnboarding, (onboarding) => onboarding.businessOwner)
  onboarding: BusinessOwnerOnboarding;

  @OneToMany(() => BusinessApproval, (approval) => approval.businessOwner)
  approvals: BusinessApproval[];

  @OneToMany(() => BusinessService, (businessService) => businessService.businessOwner)
  businessServices: BusinessService[];

  @OneToMany(() => ServicePackage, (servicePackage) => servicePackage.businessOwner)
  servicePackages: ServicePackage[];

  @OneToMany(() => Staff, (staff) => staff.businessOwner)
  staff: Staff[];

  @OneToMany(() => Review, (review) => review.businessOwner)
  reviews: Review[];

  @OneToMany(() => BusinessMedia, (media) => media.businessOwner)
  media: BusinessMedia[];

  @OneToOne(() => BankingInfo, (bankingInfo) => bankingInfo.businessOwner)
  bankingInfo: BankingInfo;

  @OneToMany(() => BusinessDocument, (document) => document.businessOwner)
  documents: BusinessDocument[];

  @OneToMany(() => VendorDuePayment, (duePayment) => duePayment.businessOwner)
  duePayments: VendorDuePayment[];

  @OneToMany(() => BusinessSubscription, (subscription) => subscription.businessOwner)
  businessSubscriptions: BusinessSubscription[];

  @BeforeInsert()
  generateShopId() {
    if (!this.shopId) {
      this.shopId = generateShopId();
    }
  }

  @BeforeUpdate()
  preserveVendorStatus() {
    // Vendor status should NOT change automatically based on approval status
    // Only admin can manually change vendor status
    // This ensures vendors remain active regardless of payment status
  }
}
