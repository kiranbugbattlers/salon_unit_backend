import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessOwner } from './business-owner.entity';

@Entity('banking_info')
export class BankingInfo {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id', unique: true })
  businessOwnerId: string;

  @ApiProperty({ description: 'Bank account number', required: false })
  @Column({ name: 'account_number', length: 50, nullable: true })
  accountNumber?: string;

  @ApiProperty({ description: 'Account holder name as per bank records', required: false })
  @Column({ name: 'account_holder_name', length: 200, nullable: true })
  accountHolderName?: string;

  @ApiProperty({ description: 'IFSC code of the bank branch', required: false })
  @Column({ name: 'ifsc_code', length: 11, nullable: true })
  ifscCode?: string;

  @ApiProperty({ description: 'Bank name', required: false })
  @Column({ name: 'bank_name', length: 200, nullable: true })
  bankName?: string;

  @ApiProperty({ description: 'Bank branch name', required: false })
  @Column({ name: 'branch', length: 200, nullable: true })
  branch?: string;

  @ApiProperty({ description: 'Whether this banking info is verified' })
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'When the banking info was verified', required: false })
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Razorpay contact ID', required: false })
  @Column({ name: 'razorpay_contact_id', nullable: true })
  razorpayContactId?: string;

  @ApiProperty({ description: 'Razorpay fund account ID', required: false })
  @Column({ name: 'razorpay_fund_account_id', nullable: true })
  razorpayFundAccountId?: string;

  @ApiProperty({ description: 'Fund account status', required: false })
  @Column({ name: 'fund_account_status', nullable: true })
  fundAccountStatus?: string;

  @ApiProperty({ description: 'When fund account was created', required: false })
  @Column({ name: 'fund_account_created_at', type: 'timestamp', nullable: true })
  fundAccountCreatedAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => BusinessOwner, (businessOwner) => businessOwner.bankingInfo)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}
