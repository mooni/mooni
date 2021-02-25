export interface Recipient {
  owner: {
    name: string;
    country?: string;
    address?: string;
    zip?: string;
    city?: string;
  }
  iban: string;
  bic_swift?: string;
  email?: string;
}

export type OrderErrors = any[];

export enum PaymentStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}
export enum PaymentStepId {
  ALLOWANCE = 'ALLOWANCE',
  TRADE = 'TRADE',
  PAYMENT = 'PAYMENT',
  BITY = 'BITY',
}
export enum PaymentStepStatus {
  QUEUED = 'QUEUED',
  APPROVAL = 'APPROVAL',
  MINING = 'MINING',
  WAITING = 'WAITING',
  RECEIVED = 'RECEIVED',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export interface PaymentStep {
  id: PaymentStepId;
  status: PaymentStepStatus;
  txHash?: string;
  bityOrderId?: string;
  error?: Error;
}

export interface Payment {
  status: PaymentStatus;
  steps: PaymentStep[];
}


