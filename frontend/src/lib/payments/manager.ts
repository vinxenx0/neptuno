import { PaymentProvider, PaymentResult } from "../payments";

export class PaymentManager {
  private providers: Record<string, PaymentProvider> = {};

  registerProvider(provider: PaymentProvider) {
    this.providers[provider.name] = provider;
  }

  async processPayment(providerName: string, amount: number, currency: string, description: string): Promise<PaymentResult> {
    const provider = this.providers[providerName];
    if (!provider) {
      return { success: false, error: `Proveedor ${providerName} no encontrado` };
    }
    return await provider.processPayment(amount, currency, description);
  }
}