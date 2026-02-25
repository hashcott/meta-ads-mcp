import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FB_GRAPH_URL } from "../constants.js";
import {
  getAccessToken,
  makeGraphApiCall,
  fetchNode,
  prepareParams,
  handleApiError,
} from "../services/graph-api.js";
import {
  FieldsSchema,
  FilteringSchema,
  PaginationSchema,
  TimeRangeSchema,
  DatePresetSchema,
  DateFormatSchema,
  EffectiveStatusSchema,
} from "../schemas/common.js";

const ADSET_FIELDS_DESC =
  "Fields per ad set. Common: id, name, account_id, campaign_id, status, effective_status, daily_budget, lifetime_budget, budget_remaining, bid_amount, bid_strategy, billing_event, optimization_goal, targeting, start_time, end_time, created_time, updated_time, pacing_type, destination_type";

export function registerAdSetTools(server: McpServer): void {
  server.registerTool(
    "meta_ads_get_adset_by_id",
    {
      title: "Get Meta Ad Set by ID",
      description: `Retrieve detailed information about a specific Meta ad set.

Args:
  - adset_id (string): Ad set ID, e.g., '23843211234567'
  - fields (string[]): ${ADSET_FIELDS_DESC}

Returns:
  Object with the requested ad set fields.

Examples:
  - Use when: "Get the targeting and budget for ad set 23843211234567"
  - Use when: "What is the optimization goal and status of this ad set?"`,
      inputSchema: z.object({
        adset_id: z.string().describe("Ad set ID, e.g., '23843211234567'"),
        fields: FieldsSchema,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ adset_id, fields }) => {
      try {
        const data = await fetchNode(adset_id, { fields });
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data as Record<string, unknown>,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "meta_ads_get_adsets_by_ids",
    {
      title: "Get Multiple Meta Ad Sets by IDs",
      description: `Retrieve information for multiple Meta ad sets in a single API call (batch lookup).

Efficient when you need data for several ad sets at once.

Args:
  - adset_ids (string[]): List of ad set IDs to retrieve, e.g., ['23843211234567', '23843211234568']
  - fields (string[]): ${ADSET_FIELDS_DESC}
  - date_format (string): Date format: 'U' for Unix timestamp, 'Y-m-d H:i:s' for MySQL datetime

Returns:
  Object where keys are ad set IDs and values are the corresponding ad set details.

Examples:
  - Use when: "Get details for ad sets 23843211234567, 23843211234568, and 23843211234569"`,
      inputSchema: z.object({
        adset_ids: z
          .array(z.string())
          .min(1)
          .describe("List of ad set IDs, e.g., ['23843211234567', '23843211234568']"),
        fields: FieldsSchema,
        date_format: DateFormatSchema,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ adset_ids, fields, date_format }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/`;
        const params = prepareParams(
          { access_token: token, ids: adset_ids.join(",") },
          { fields, ...(date_format ? { date_format } : {}) }
        );
        const data = await makeGraphApiCall(url, params);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data as Record<string, unknown>,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "meta_ads_get_adsets_by_adaccount",
    {
      title: "Get Meta Ad Sets by Ad Account",
      description: `Retrieve all ad sets from a specific Meta ad account with filtering and pagination.

Args:
  - act_id (string): Ad account ID prefixed with 'act_', e.g., 'act_1234567890'
  - fields (string[]): ${ADSET_FIELDS_DESC}
  - effective_status (string[]): Filter by status: ACTIVE, PAUSED, DELETED, PENDING_REVIEW, DISAPPROVED, PREAPPROVED, PENDING_BILLING_INFO, CAMPAIGN_PAUSED, ARCHIVED, WITH_ISSUES
  - filtering (object[]): Additional filter objects, e.g., [{field: 'daily_budget', operator: 'GREATER_THAN', value: 1000}]
  - limit (number): Results per page (1-100, default: 25)
  - after / before (string): Pagination cursors
  - date_preset / time_range: Date filter
  - updated_since (number): Unix timestamp — return ad sets updated since this time
  - date_format (string): Date format for response

Returns:
  Object with data (ad set array) and paging. Use meta_ads_fetch_pagination_url with paging.next for more results.`,
      inputSchema: z
        .object({
          act_id: z
            .string()
            .describe("Ad account ID prefixed with 'act_', e.g., 'act_1234567890'"),
          fields: FieldsSchema,
          filtering: FilteringSchema,
          date_preset: DatePresetSchema,
          time_range: TimeRangeSchema.optional(),
          updated_since: z
            .number()
            .int()
            .optional()
            .describe("Return ad sets updated since this Unix timestamp"),
          effective_status: EffectiveStatusSchema,
          date_format: DateFormatSchema,
        })
        .merge(PaginationSchema),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({
      act_id,
      fields,
      filtering,
      date_preset,
      time_range,
      updated_since,
      effective_status,
      date_format,
      limit,
      after,
      before,
    }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${act_id}/adsets`;
        const params = prepareParams(
          { access_token: token },
          {
            fields,
            filtering,
            date_preset,
            time_range,
            updated_since,
            effective_status,
            date_format,
            limit,
            after,
            before,
          }
        );
        const data = await makeGraphApiCall(url, params);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data as Record<string, unknown>,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "meta_ads_get_adsets_by_campaign",
    {
      title: "Get Meta Ad Sets by Campaign",
      description: `Retrieve all ad sets belonging to a specific Meta campaign with filtering and pagination.

Args:
  - campaign_id (string): Campaign ID, e.g., '23843xxxxx'
  - fields (string[]): ${ADSET_FIELDS_DESC}
  - effective_status (string[]): Filter by status: ACTIVE, PAUSED, DELETED, PENDING_REVIEW, DISAPPROVED, PREAPPROVED, PENDING_BILLING_INFO, ARCHIVED, WITH_ISSUES
  - filtering (object[]): Additional filter objects, e.g., [{field: 'optimization_goal', operator: 'IN', value: ['OFFSITE_CONVERSIONS', 'VALUE']}]
  - limit (number): Results per page (1-100, default: 25)
  - after / before (string): Pagination cursors
  - date_format (string): Date format for response

Returns:
  Object with data (ad set array) and paging. Use meta_ads_fetch_pagination_url with paging.next for more results.`,
      inputSchema: z
        .object({
          campaign_id: z.string().describe("Campaign ID, e.g., '23843xxxxx'"),
          fields: FieldsSchema,
          filtering: FilteringSchema,
          effective_status: EffectiveStatusSchema,
          date_format: DateFormatSchema,
        })
        .merge(PaginationSchema),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({
      campaign_id,
      fields,
      filtering,
      effective_status,
      date_format,
      limit,
      after,
      before,
    }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${campaign_id}/adsets`;
        const params = prepareParams(
          { access_token: token },
          { fields, filtering, effective_status, date_format, limit, after, before }
        );
        const data = await makeGraphApiCall(url, params);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data as Record<string, unknown>,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}
