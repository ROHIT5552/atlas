/**
 * ============================================================================
 * NEWRA ATLAS - CENTRAL POWER REGULATORY FORMATTING & UNITS ENGINE
 * Single Source of Truth (SSoT) for standardizing Indian Power Tariff Metrics
 * ============================================================================
 * 
 * Standard Regulatory Units (CERC, CEA & State ERCs - MERC, GERC, RERC, KERC, etc.):
 * - Energy Charge: ₹ / kVAh (HT two-part) or ₹ / kWh (LT)
 * - Demand Charge: ₹ / kVA/month (HT) or ₹ / kW/month (LT)
 * - Fuel & Power Purchase Adjustment (FAC/FPPAS): ₹ / kWh or ₹ / kVAh
 * - Cross Subsidy Surcharge (CSS) & Additional Surcharge (AS): ₹ / kWh
 * - Wheeling Charges: ₹ / kWh
 * - Transmission Charges: ₹ / MW/day (or ₹ / kW/month)
 * - Grid / Technical Losses: % (In-kind energy deduction)
 * - Electricity Duty / Green Energy Cess: % ad-valorem or ₹ / kWh
 * - RE Banking Charge: % of banked energy (in-kind) or ₹ / kWh cashout
 * - Contract Demand: kVA, kW, or MW
 * - Power Factor: Ratio up to 1.00 (Unity)
 */

/**
 * Normalizes raw database/API unit strings to eliminate duplicate currency
 * prefixes, unstandardized abbreviations, and messy formatting.
 * 
 * Examples:
 * - "Rs/kVAh" -> "kVAh"
 * - "Rs/kWh" -> "kWh"
 * - "Rs/kVA/month" -> "kVA/month"
 * - "Rs/kW/month" -> "kW/month"
 * - "Rs/month" -> "month"
 * - "Rs/MW/day (~0.42 Rs/kWh)" -> "MW/day"
 * - "/u" -> "kWh"
 * - "/mo" -> "month"
 */
export function cleanUnit(unit?: string | null, fallback = 'kWh'): string {
  if (!unit) return fallback;
  const cleaned = unit
    .replace(/^Rs\.?\s*\/?\s*/i, '')
    .replace(/^₹\s*\/?\s*/, '')
    .replace(/\s*\(~.*?\)/, '')
    .replace(/^\/?u$/i, 'kWh')
    .replace(/^\/?unit$/i, 'kWh')
    .replace(/^\/?mo$/i, 'month')
    .trim();
  return cleaned || fallback;
}

/**
 * Formats a monetary number with the official Indian Rupee symbol (₹).
 * Handles null, undefined, strings, and zero gracefully.
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
 * Examples:
 * - formatRate(7.54, 'Rs/kVAh') -> "₹ 7.54 / kVAh"
 * - formatRate(461, 'Rs/kVA/month') -> "₹ 461 / kVA/month"
 */
export function formatRate(
  value?: number | string | null,
  unit?: string | null,
  fallback = 'N/A'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const cur = formatCurrency(value, fallback);
  if (cur === fallback) return fallback;
  const u = cleanUnit(unit);
  return u ? `${cur} / ${u}` : cur;
}

/**
 * Formats Energy Charge per kVAh or kWh depending on tariff connection type.
 */
export function formatEnergyCharge(
  value?: number | string | null,
  unit?: string | null,
  fallback = '₹ 0.00 / kVAh'
): string {
  return formatRate(value, unit || 'kVAh', fallback);
}

/**
 * Formats Fixed / Demand Charge per kVA/month or kW/month.
 */
export function formatDemandCharge(
  value?: number | string | null,
  unit?: string | null,
  fallback = '₹ 0.00 / kVA/month'
): string {
  return formatRate(value, unit || 'kVA/month', fallback);
}

/**
 * Formats Open Access Surcharges (CSS, AS) in ₹ / kWh.
 */
export function formatSurcharge(
  value?: number | string | null,
  fallback = '₹ 0.00 / kWh'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return fallback;
  return `₹ ${num.toFixed(2)} / kWh`;
}

/**
 * Formats Wheeling Charge in ₹ / kWh.
 */
export function formatWheelingCharge(
  value?: number | string | null,
  fallback = '₹ 0.00 / kWh'
): string {
  return formatSurcharge(value, fallback);
}

/**
 * Formats Transmission Charge in ₹ / MW/day.
 */
export function formatTransmissionCharge(
  value?: number | string | null,
  fallback = '₹ 0.00 / MW/day'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return fallback;
  return `₹ ${num.toFixed(2)} / MW/day`;
}

/**
 * Formats statutory percentage metrics (Losses, Electricity Duty, Banking Charges).
 */
export function formatPercentage(
  value?: number | string | null,
  decimals = 2,
  fallback = '0.00%'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return fallback;
  return `${num.toFixed(decimals)}%`;
}

/**
 * Formats Technical Losses with standard percentage symbol.
 */
export function formatLoss(
  value?: number | string | null,
  fallback = '4.50%'
): string {
  return formatPercentage(value, 2, fallback);
}

/**
 * Formats ad-valorem Electricity Duty.
 */
export function formatDuty(
  value?: number | string | null,
  fallback = '9.30%'
): string {
  return formatPercentage(value, 2, fallback);
}

/**
 * Formats FPPAS / FAC (Fuel Adjustment Charge) in ₹ / kWh or ₹ / kVAh.
 */
export function formatFac(
  value?: number | string | null,
  unit?: string | null,
  fallback = '₹ 0.00 / kWh'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return fallback;
  const u = cleanUnit(unit, 'kWh');
  return `₹ ${num.toFixed(2)} / ${u}`;
}

/**
 * Formats power capacity/demand with appropriate unit (kW, kVA, MW).
 */
export function formatCapacity(
  value?: number | string | null,
  unit = 'MW',
  fallback = '0'
): string {
  if (value === undefined || value === null || value === '') return `${fallback} ${unit}`;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return `${value} ${unit}`;
  return `${num.toLocaleString('en-IN')} ${unit}`;
}

/**
 * Formats Power Factor (e.g. 0.95 PF or Unity).
 */
export function formatPowerFactor(
  value?: number | string | null,
  fallback = '1.00'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);
  return num >= 1.0 ? '1.00 (Unity)' : `${num.toFixed(2)} PF`;
}
