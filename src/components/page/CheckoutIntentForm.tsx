"use client";

import { PaymentCheckout } from "@/components/page/PaymentCheckout";

interface CheckoutIntentFormProps { bookSlug: string; bookTitle: string; price: number; currency: string; }

export function CheckoutIntentForm({ bookSlug, bookTitle, price, currency }: CheckoutIntentFormProps) {
  return <PaymentCheckout kind="book" slug={bookSlug} title={bookTitle} amount={price} currency={currency} />;
}
