import type { RentType } from "@/types";

export function formatPrice(price: number, rentType?: RentType): string {
  const base = `₦${price.toLocaleString()}`;
  if (rentType === "yearly") return `${base}/yr`;
  if (rentType === "monthly") return `${base}/mo`;
  return base;
}
