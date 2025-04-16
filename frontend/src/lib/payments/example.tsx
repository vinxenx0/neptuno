// frontend/src/lib/payments/example.tsx
// Ejemplo de integración de pagos con PaymentManager y Stripe
import { PaymentManager } from "@/lib/payments/manager";
import { StripeProvider } from "@/lib/payments/stripe";

const paymentManager = new PaymentManager();
paymentManager.registerProvider(new StripeProvider());

const handlePayment = async () => {
  const result = await paymentManager.processPayment("Stripe", 1000, "USD", "Compra de créditos");
  if (result.success) {
    console.log("Pago exitoso:", result.transactionId);
  } else {
    console.error("Error en el pago:", result.error);
  }
};