import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FB_GRAPH_URL } from "../constants.js";
import {
  getAccessToken,
  makeGraphApiCall,
  prepareParams,
  handleApiError,
} from "../services/graph-api.js";
import { FieldsSchema, PaginationSchema, TimeRangeSchema } from "../schemas/common.js";

const ACTIVITY_FIELDS_DESC =
  "Fields to retrieve. Available: actor_id, actor_name, application_id, application_name, changed_data, date_time_in_timezone, event_time, event_type, extra_data, object_id, object_name, object_type, translated_event_type";

const ACTIVITY_DESCRIPTION_SUFFIX = `

Returns:
  Object with data (activity array) and paging. Each activity record contains who made the change, what was changed, when, and the specific details.
  - actor_name (string): Name of the user who made the change
  - object_type (string): Type of object: AD, ADSET, CAMPAIGN, ACCOUNT, IMAGE, REPORT, etc.
  - translated_event_type (string): Human-readable description, e.g., 'ad created', 'campaign budget updated'
  - event_time (string): Timestamp of the event
  - changed_data (string): JSON detailing what changed

Use meta_ads_fetch_pagination_url with paging.next to retrieve additional pages.`;

export function registerActivityTools(server: McpServer): void {
  server.registerTool(
    "meta_ads_get_activities_by_adaccount",
    {
      title: "Get Meta Ad Account Activity Log",
      description: `Retrieve the change history (activity log) for a Meta ad account.

Returns key updates to the account and associated ad objects, including status changes, budget updates, targeting changes, and more. By default returns one week of data.

Args:
  - act_id (string): Ad account ID prefixed with 'act_', e.g., 'act_1234567890'
  - fields (string[]): ${ACTIVITY_FIELDS_DESC}
  - limit (number): Maximum activities per page
  - after / before (string): Pagination cursors
  - time_range (object): Custom range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}. Overrides since/until
  - since (string): Start date in YYYY-MM-DD format (ignored if time_range is set)
  - until (string): End date in YYYY-MM-DD format (ignored if time_range is set)
${ACTIVITY_DESCRIPTION_SUFFIX}

Examples:
  - Use when: "Show me all changes made to my ad account in the last week"
  - Use when: "Who changed the budget on this account in January 2024?"`,
      inputSchema: z
        .object({
          act_id: z
            .string()
            .describe("Ad account ID prefixed with 'act_', e.g., 'act_1234567890'"),
          fields: FieldsSchema.describe(ACTIVITY_FIELDS_DESC),
          time_range: TimeRangeSchema.optional().describe(
            "Custom time range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}. Overrides since/until"
          ),
          since: z
            .string()
            .optional()
            .describe("Start date in YYYY-MM-DD format. Ignored if time_range is set"),
          until: z
            .string()
            .optional()
            .describe("End date in YYYY-MM-DD format. Ignored if time_range is set"),
        })
        .merge(PaginationSchema),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ act_id, fields, time_range, since, until, limit, after, before }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${act_id}/activities`;

        const baseParams: Record<string, unknown> = { access_token: token };
        let params = prepareParams(baseParams, { fields, limit, after, before });

        if (time_range) {
          params.time_range = JSON.stringify(time_range);
        } else {
          if (since) params.since = since;
          if (until) params.until = until;
        }

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
    "meta_ads_get_activities_by_adset",
    {
      title: "Get Meta Ad Set Activity Log",
      description: `Retrieve the change history (activity log) for a specific Meta ad set.

Returns updates to the ad set including status changes, budget updates, targeting changes, and more. By default returns one week of data.

Args:
  - adset_id (string): Ad set ID, e.g., '23843211234567'
  - fields (string[]): ${ACTIVITY_FIELDS_DESC}
  - limit (number): Maximum activities per page
  - after / before (string): Pagination cursors
  - time_range (object): Custom range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}. Overrides since/until
  - since (string): Start date in YYYY-MM-DD format (ignored if time_range is set)
  - until (string): End date in YYYY-MM-DD format (ignored if time_range is set)
${ACTIVITY_DESCRIPTION_SUFFIX}

Examples:
  - Use when: "What changes were made to ad set 23843211234567 this month?"
  - Use when: "Show me the targeting change history for this ad set"`,
      inputSchema: z
        .object({
          adset_id: z.string().describe("Ad set ID, e.g., '23843211234567'"),
          fields: FieldsSchema.describe(ACTIVITY_FIELDS_DESC),
          time_range: TimeRangeSchema.optional().describe(
            "Custom time range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}. Overrides since/until"
          ),
          since: z
            .string()
            .optional()
            .describe("Start date in YYYY-MM-DD format. Ignored if time_range is set"),
          until: z
            .string()
            .optional()
            .describe("End date in YYYY-MM-DD format. Ignored if time_range is set"),
        })
        .merge(PaginationSchema),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ adset_id, fields, time_range, since, until, limit, after, before }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${adset_id}/activities`;

        const baseParams: Record<string, unknown> = { access_token: token };
        let params = prepareParams(baseParams, { fields, limit, after, before });

        if (time_range) {
          params.time_range = JSON.stringify(time_range);
        } else {
          if (since) params.since = since;
          if (until) params.until = until;
        }

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
