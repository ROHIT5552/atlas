/**
 * Core TypeScript definitions for NewRa Atlas Central Regulatory Library
 */

export type TabId =
  | 'dashboard'
  | 'explorer'
  | 'passport'
  | 'consumer-eligibility'
  | 'generator-eligibility'
  | 'captive-structuring'
  | 'connectivity'
  | 'tod'
  | 'settlement-waterfall'
  | 'bill-audit'
  | 'downstream-hub'
  | 'guard-rules'
  | 'change-propagator'
  | 'landed-cost'
  | 'tariffs'
  | 'open-access'
  | 'banking'
  | 'captive'
  | 'metering'
  | 'scheduling'
  | 'states'
  | 'state-detail'
  | 'discoms'
  | 'discom-detail'
  | 'regulations'
  | 'compare'
  | 'admin'
  | 'api-docs';

export interface MenuItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface StateSummary {
  id: string;
  name: string;
  code: string;
  regulator: string;
  discoms: number;
  last_updated?: string;
  status: string;
}

export interface DiscomSummary {
  id: string;
  name: string;
  short_name: string;
  state_id: string;
  consumer_count?: number;
  area?: string;
  status?: string;
}

export interface SearchResultItem {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  state_id?: string;
  discom_id?: string;
}

export interface TariffRecord {
  id: string;
  state_id: string;
  discom_id: string;
  category_name: string;
  voltage_level: string;
  fixed_charge: number;
  fixed_unit: string;
  energy_charge: number;
  energy_unit: string;
  effective_date?: string;
  order_ref?: string;
}

export interface TodProfile {
  id: string;
  state_id: string;
  discom_id: string;
  season?: string;
  peak_hours: string[];
  off_peak_hours: string[];
  normal_hours: string[];
  peak_surcharge_pct: number;
  off_peak_rebate_pct: number;
}

export interface OpenAccessRule {
  id: string;
  state_id: string;
  category: string;
  voltage_limit_kv: number;
  capacity_limit_mw: number;
  application_fee: number;
  validity_days: number;
}

export interface BankingRule {
  id: string;
  state_id: string;
  allowed_tech: string[];
  banking_cycle: string;
  charge_pct: number;
  peak_withdrawal_allowed: boolean;
  settlement_price_rule: string;
}

export interface CaptiveRule {
  id: string;
  state_id: string;
  equity_threshold_pct: number;
  consumption_threshold_pct: number;
  verification_authority: string;
  annual_audit_required: boolean;
}

export interface RegulatoryDocument {
  id: string;
  title: string;
  regulator: string;
  order_number: string;
  issue_date: string;
  category: string;
  file_url?: string;
  summary?: string;
}

export interface StatsData {
  states_covered: number;
  discoms_covered: number;
  tariff_schedules: number;
  active_regulations: number;
  verified_data_pct: number;
  pending_verification_count: number;
  recently_updated_states: StateSummary[];
  system_status: string;
}
