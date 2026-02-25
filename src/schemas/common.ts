import { z } from "zod";

export const PaginationSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Maximum number of results to return per page (1-100, default: 25)"),
  after: z
    .string()
    .optional()
    .describe("Cursor for the next page of results, from response.paging.cursors.after"),
  before: z
    .string()
    .optional()
    .describe("Cursor for the previous page of results, from response.paging.cursors.before"),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Alternative pagination: number of results to skip"),
});

export const TimeRangeSchema = z
  .object({
    since: z.string().describe("Start date in YYYY-MM-DD format"),
    until: z.string().describe("End date in YYYY-MM-DD format"),
  })
  .describe("Custom time range with since/until dates in YYYY-MM-DD format");

export const FilterObjectSchema = z
  .object({
    field: z.string().describe("Field to filter on"),
    operator: z
      .string()
      .describe(
        "Operator: EQUAL, NOT_EQUAL, GREATER_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN, LESS_THAN_OR_EQUAL, IN_RANGE, NOT_IN_RANGE, CONTAIN, NOT_CONTAIN, IN, NOT_IN, EMPTY, NOT_EMPTY"
      ),
    value: z.unknown().describe("Value to compare against"),
  })
  .describe("Filter object with field, operator, and value");

export const FilteringSchema = z
  .array(FilterObjectSchema)
  .optional()
  .describe(
    "List of filter objects. Each has 'field', 'operator', and 'value'. Example: [{field: 'spend', operator: 'GREATER_THAN', value: 50}]"
  );

export const EffectiveStatusSchema = z
  .array(
    z.enum([
      "ACTIVE",
      "PAUSED",
      "DELETED",
      "PENDING_REVIEW",
      "DISAPPROVED",
      "PREAPPROVED",
      "PENDING_BILLING_INFO",
      "CAMPAIGN_PAUSED",
      "ARCHIVED",
      "ADSET_PAUSED",
      "IN_PROCESS",
      "WITH_ISSUES",
    ])
  )
  .optional()
  .describe(
    "Filter by effective status. Options: ACTIVE, PAUSED, DELETED, PENDING_REVIEW, DISAPPROVED, PREAPPROVED, PENDING_BILLING_INFO, CAMPAIGN_PAUSED, ARCHIVED, ADSET_PAUSED, IN_PROCESS, WITH_ISSUES"
  );

export const FieldsSchema = z
  .array(z.string())
  .optional()
  .describe("List of specific fields to retrieve. If omitted, default fields are returned");

export const DatePresetSchema = z
  .enum([
    "today",
    "yesterday",
    "this_month",
    "last_month",
    "this_quarter",
    "maximum",
    "last_3d",
    "last_7d",
    "last_14d",
    "last_28d",
    "last_30d",
    "last_90d",
    "last_week_mon_sun",
    "last_week_sun_sat",
    "last_quarter",
    "last_year",
    "this_week_mon_today",
    "this_week_sun_today",
    "this_year",
  ])
  .optional()
  .describe(
    "Predefined relative time range. Options: today, yesterday, this_month, last_month, this_quarter, maximum, last_3d, last_7d, last_14d, last_28d, last_30d, last_90d, last_week_mon_sun, last_week_sun_sat, last_quarter, last_year, this_week_mon_today, this_week_sun_today, this_year. Default: last_30d. Ignored if time_range, time_ranges, since, or until is provided"
  );

export const DateFormatSchema = z
  .enum(["U", "Y-m-d H:i:s"])
  .optional()
  .describe(
    "Format for date fields in response. 'U' = Unix timestamp (seconds), 'Y-m-d H:i:s' = MySQL datetime. Default: ISO 8601"
  );
