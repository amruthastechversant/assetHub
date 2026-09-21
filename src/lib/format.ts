export function formatDate(iso?: string) {
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  } catch (e) {
    return iso;
  }
}

export function formatCurrency(amount?: number) {
  if (typeof amount !== "number") return undefined;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  } catch (e) {
    return String(amount);
  }
}
