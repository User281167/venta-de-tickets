import { CheckoutPageClient } from "@/features/ticket-purchase/components/CheckoutPageClient";
import { CartProvider } from "@/providers/CartProvider";

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutPageClient />
    </CartProvider>
  );
}
