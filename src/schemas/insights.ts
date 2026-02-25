import { z } from "zod";
import {
  PaginationSchema,
  TimeRangeSchema,
  FilteringSchema,
  FieldsSchema,
  DatePresetSchema,
} from "./common.js";

export const InsightsInputSchema = z
  .object({
    fields: FieldsSchema.describe(
      "Metrics and dimensions to retrieve. Common examples: impressions, reach, clicks, spend, ctr, cpc, cpm, cpp, frequency, actions, conversions, cost_per_action_type, date_start, date_stop"
    ),
    date_preset: DatePresetSchema.default("last_30d"),
    time_range: TimeRangeSchema.optional().describe(
      "Specific time range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}. Overrides date_preset"
    ),
    time_ranges: z
      .array(TimeRangeSchema)
      .optional()
      .describe(
        "Array of time range objects for period comparison. Overrides time_range and date_preset"
      ),
    time_increment: z
      .string()
      .optional()
      .default("all_days")
      .describe(
        "Time breakdown granularity: integer 1-90 (days per point), 'monthly', or 'all_days' (single summary). Default: all_days"
      ),
    level: z
      .enum(["account", "campaign", "adset", "ad"])
      .optional()
      .describe("Level of aggregation: account, campaign, adset, or ad"),
    action_attribution_windows: z
      .array(z.string())
      .optional()
      .describe(
        "Attribution windows for actions. Examples: 1d_view, 7d_view, 28d_view, 1d_click, 7d_click, 28d_click, dda, default"
      ),
    action_breakdowns: z
      .array(z.string())
      .optional()
      .describe(
        "Segments the actions results. Examples: action_device, action_type, conversion_destination, action_destination. Default: [action_type]"
      ),
    action_report_time: z
      .enum(["impression", "conversion", "mixed"])
      .optional()
      .describe(
        "When actions are counted: impression (time of ad impression), conversion (time of conversion), mixed. Default: mixed"
      ),
    breakdowns: z
      .array(z.string())
      .optional()
      .describe(
        "Segment results by dimensions. Examples: age, gender, country, region, dma, impression_device, publisher_platform, platform_position, device_platform"
      ),
    default_summary: z
      .boolean()
      .optional()
      .default(false)
      .describe("If true, include an additional summary row in the response. Default: false"),
    use_account_attribution_setting: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, use the attribution settings defined at the ad account level. Default: false"
      ),
    use_unified_attribution_setting: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        "If true, use unified attribution settings defined at the ad set level. Recommended for consistency with Ads Manager. Default: true"
      ),
    filtering: FilteringSchema,
    sort: z
      .string()
      .optional()
      .describe(
        "Sort field and direction. Format: {field}_ascending or {field}_descending. Example: impressions_descending"
      ),
    since: z
      .string()
      .optional()
      .describe(
        "Start timestamp for time-based pagination (Unix or strtotime). Only used when time_range and time_ranges are not set"
      ),
    until: z
      .string()
      .optional()
      .describe(
        "End timestamp for time-based pagination (Unix or strtotime). Only used when time_range and time_ranges are not set"
      ),
    locale: z
      .string()
      .optional()
      .describe("Locale for text responses (e.g., en_US). Controls language and formatting"),
  })
  .merge(PaginationSchema);

export type InsightsInput = z.infer<typeof InsightsInputSchema>;
