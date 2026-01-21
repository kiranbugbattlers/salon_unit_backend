import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { WalletTransaction } from './wallet-transaction.entity';

export enum WalletUserType {
  CUSTOMER = 'customer',
  BUSINESS_OWNER = 'business_owner',
}

@Entity('wallets')
@Index(['userId', 'userType'], { unique: true })
@Index(['userType', 'isActive'])
export class Wallet {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID (references users table)' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ enum: WalletUserType, description: 'Type of user (customer or business_owner)' })
  @Column({
    name: 'user_type',
    type: 'enum',
    enum: WalletUserType,
  })
  @Index()
  userType: WalletUserType;

  @ApiProperty({ description: 'Current wallet balance in INR' })
  @Column({ name: 'balance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ description: 'Total amount earned (lifetime credits)' })
  @Column({ name: 'total_earned', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarned: number;

  @ApiProperty({ description: 'Total amount spent (lifetime debits)' })
  @Column({ name: 'total_spent', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number;

  @ApiProperty({ description: 'Total commission paid by business owner to company' })
  @Column({ name: 'total_commission_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCommissionPaid: number;

  @ApiProperty({ description: 'Total commission/rewards received by customer from company' })
  @Column({ name: 'total_commission_received', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCommissionReceived: number;

  @ApiProperty({ description: 'Whether wallet is active' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp of last transaction', required: false })
  @Column({ name: 'last_transaction_at', type: 'timestamp', nullable: true })
  lastTransactionAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];
}
