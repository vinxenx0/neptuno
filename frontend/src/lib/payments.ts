// frontend/src/lib/payments.ts
export interface PaymentProvider {
    name: string;
    processPayment(amount: number, currency: string, description: string): Promise<PaymentResult>;
  }
  
  export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
  } 