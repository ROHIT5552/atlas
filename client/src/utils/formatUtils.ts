/**
 * Utility functions for Indian power regulatory unit and currency formatting.
 * Ensures clean, standardized units:
 * - Energy Rate: ₹ / kVAh or ₹ / kWh
 * - Demand Rate: ₹ / kVA/month or ₹ / kW/month
 * - Reactive Energy: ₹ / kVArh
 * - Transmission: ₹ / MW/day
 * - Ad-valorem Duty: %
 */

/**
 * Cleans duplicate currency prefixes and normalizes unit strings from DB or API.
 * e.g. "Rs/kVAh" -> "kVAh"
 * e.g. "Rs/kVA/month" -> "kVA/month"
 * e.g. "Rs/kWh" -> "kWh"
 * e.g. "Rs/MW/day (~0.42 Rs/kWh)" -> "MW/day"
 * e.g. "/u" -> "kWh"
 */
export function cleanUnit(unit?: string | null, fallback = 'kWh'): string {
  if (!unit) return fallback;
  const cleaned = unit
    .replace(/^Rs\s*\/?\s*/i, '')
    .replace(/^₹\s*\/?\s*/, '')
    .replace(/\s*\(~.*?\)/, '')
    .replace(/^\/?u$/i, 'kWh')
    .replace(/^\/mo$/i, 'month')
    .trim();
  return cleaned || fallback;
}

/**
 * Formats a monetary value with the Indian Rupee symbol (₹).
 */
export function formatCurrency(value?: number | string | null, fallback = 'N/A'): string {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  const formatted = num % 1 === 0 
    ? num.toString() 
    : num.toFixed(2);
  return `₹ ${formatted}`;
}

/**
 * Formats rate value with currency and appropriate physical denominator unit.
 * e.g. formatRate(7.54, 'Rs/kVAh') -> "₹ 7.54 / kVAh"
 * e.g. formatRate(461, 'Rs/kVA/month') -> "₹ 461 / kVA/month"
 */
export function formatRate(value?: number | string | null, unit?: string | null, fallback = 'N/A'): string {
  if (value === undefined || value === null || value === '') return fallback;
  const cur = formatCurrency(value, fallback);
  if (cur === fallback) return fallback;
  const u = cleanUnit(unit);
  return u ? `${cur} / ${u}` : cur;
}
