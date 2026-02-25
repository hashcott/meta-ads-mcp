export interface GraphApiResponse<T = unknown> {
  data?: T[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

export interface AdAccount {
  id: string;
  name?: string;
  business_name?: string;
  age?: number;
  account_status?: number;
  balance?: string;
  amount_spent?: string;
  attribution_spec?: unknown[];
  account_id?: string;
  business?: { id: string; name: string };
  business_city?: string;
  brand_safety_content_filter_levels?: string[];
  currency?: string;
  created_time?: string;
}

export interface Campaign {
  id: string;
  name?: string;
  account_id?: string;
  objective?: string;
  status?: string;
  effective_status?: string;
  configured_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  spend_cap?: string;
  created_time?: string;
  updated_time?: string;
  start_time?: string;
  stop_time?: string;
}

export interface AdSet {
  id: string;
  name?: string;
  account_id?: string;
  campaign_id?: string;
  status?: string;
  effective_status?: string;
  configured_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  bid_amount?: number;
  bid_strategy?: string;
  billing_event?: string;
  optimization_goal?: string;
  targeting?: unknown;
  start_time?: string;
  end_time?: string;
  created_time?: string;
  updated_time?: string;
}

export interface Ad {
  id: string;
  name?: string;
  account_id?: string;
  adset_id?: string;
  campaign_id?: string;
  status?: string;
  effective_status?: string;
  configured_status?: string;
  creative?: { id: string };
  bid_amount?: number;
  created_time?: string;
  updated_time?: string;
}

export interface AdCreative {
  id: string;
  name?: string;
  account_id?: string;
  status?: string;
  body?: string;
  title?: string;
  image_url?: string;
  image_hash?: string;
  video_id?: string;
  link_url?: string;
  object_story_id?: string;
  object_story_spec?: unknown;
  call_to_action_type?: string;
  thumbnail_url?: string;
}

export interface InsightsRecord {
  account_id?: string;
  account_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  cpp?: string;
  frequency?: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start?: string;
  date_stop?: string;
}

export interface ActivityRecord {
  actor_id?: string;
  actor_name?: string;
  application_id?: string;
  application_name?: string;
  changed_data?: string;
  date_time_in_timezone?: string;
  event_time?: string;
  event_type?: string;
  extra_data?: string;
  object_id?: string;
  object_name?: string;
  object_type?: string;
  translated_event_type?: string;
}

export interface PrepareParamsOptions {
  fields?: string[];
  filtering?: unknown[];
  time_range?: Record<string, string>;
  time_ranges?: Array<Record<string, string>>;
  effective_status?: string[];
  special_ad_categories?: string[];
  objective?: string[];
  buyer_guarantee_agreement_status?: string[];
  action_attribution_windows?: string[];
  action_breakdowns?: string[];
  breakdowns?: string[];
  [key: string]: unknown;
}

export interface InsightsParams {
  fields?: string[];
  date_preset?: string;
  time_range?: Record<string, string>;
  time_ranges?: Array<Record<string, string>>;
  time_increment?: string;
  level?: string;
  action_attribution_windows?: string[];
  action_breakdowns?: string[];
  action_report_time?: string;
  breakdowns?: string[];
  default_summary?: boolean;
  use_account_attribution_setting?: boolean;
  use_unified_attribution_setting?: boolean;
  filtering?: unknown[];
  sort?: string;
  limit?: number;
  after?: string;
  before?: string;
  offset?: number;
  since?: string;
  until?: string;
  locale?: string;
}
