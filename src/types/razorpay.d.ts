declare module 'razorpay' {
  interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, any>;
  }

  interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, any>;
    created_at: number;
  }

  interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    captured: boolean;
    card?: {
      network: string;
      type: string;
    };
    bank?: string;
    wallet?: string;
    vpa?: string;
    email?: string;
    contact?: string;
    created_at: number;
  }

  interface RazorpayContactOptions {
    name: string;
    contact?: string;
    email?: string;
    type: string;
    reference_id?: string;
    notes?: Record<string, any>;
  }

  interface RazorpayContact {
    id: string;
    entity: string;
    name: string;
    contact: string;
    email: string;
    type: string;
    reference_id: string;
    notes: any;
    created_at: number;
  }

  interface RazorpayFundAccountOptions {
    contact_id: string;
    account_type: string;
    bank_account: {
      name: string;
      ifsc: string;
      account_number: string;
    };
  }

  interface RazorpayFundAccount {
    id: string;
    entity: string;
    contact_id: string;
    account_type: string;
    bank_account: {
      ifsc: string;
      bank_name: string;
      name: string;
      notes: any;
      account_number: string;
    };
    active: boolean;
    created_at: number;
  }

  interface RazorpayPayoutOptions {
    account_number: string;
    fund_account_id: string;
    amount: number;
    currency: string;
    mode: string;
    purpose: string;
    queue_if_low_balance?: boolean;
    reference_id?: string;
    narration?: string;
    notes?: Record<string, any>;
  }

  interface RazorpayPayout {
    id: string;
    entity: string;
    fund_account_id: string;
    amount: number;
    currency: string;
    notes: any;
    fees: number;
    tax: number;
    status: string;
    purpose: string;
    utr: string;
    mode: string;
    reference_id: string;
    narration: string;
    created_at: number;
    fee_type: string | null;
    failure_reason: string | null;
  }

  class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
    };
    payments: {
      fetch(paymentId: string): Promise<RazorpayPayment>;
    };
    contacts: {
      create(options: RazorpayContactOptions): Promise<RazorpayContact>;
      fetch(contactId: string): Promise<RazorpayContact>;
    };
    fundAccount: {
      create(options: RazorpayFundAccountOptions): Promise<RazorpayFundAccount>;
      fetch(fundAccountId: string): Promise<RazorpayFundAccount>;
    };
    payouts: {
      create(options: RazorpayPayoutOptions): Promise<RazorpayPayout>;
      fetch(payoutId: string): Promise<RazorpayPayout>;
    };
  }

  export = Razorpay;
}
