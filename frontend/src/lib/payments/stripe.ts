import { PaymentProvider, PaymentResult } from "../payments";

export class StripeProvider implements PaymentProvider {
  name = "Stripe";

  async processPayment(amount: number, currency: string, description: string): Promise<PaymentResult> {
    // Placeholder: Integrar Stripe SDK en el futuro
    try {
      // const paymentIntent = await stripe.paymentIntents.create({...});
      return { success: true, transactionId: "stripe_txn_123" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}