import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FB_GRAPH_URL, DEFAULT_AD_ACCOUNT_FIELDS } from "../constants.js";
import { getAccessToken, makeGraphApiCall, fetchNode, handleApiError } from "../services/graph-api.js";
import { FieldsSchema } from "../schemas/common.js";

export function registerAccountTools(server: McpServer): void {
  server.registerTool(
    "meta_ads_list_ad_accounts",
    {
      title: "List Meta Ad Accounts",
      description: `List all ad accounts associated with the authenticated Facebook user.

Returns account names and IDs. When the response contains a paging.next URL, use meta_ads_fetch_pagination_url to retrieve additional pages.

Returns:
  Object with adaccounts.data array, each containing:
  - id (string): Ad account ID prefixed with 'act_' (e.g., 'act_1234567890')
  - name (string): Display name of the ad account

Examples:
  - Use when: "Show me all my ad accounts"
  - Use when: "What ad accounts do I have access to?"`,
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/me`;
        const data = await makeGraphApiCall(url, {
          access_token: token,
          fields: "adaccounts{name}",
        });
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
    "meta_ads_get_ad_account_details",
    {
      title: "Get Meta Ad Account Details",
      description: `Get detailed information about a specific Meta ad account.

Args:
  - act_id (string): The ad account ID prefixed with 'act_', e.g., 'act_1234567890'
  - fields (string[]): Optional. Fields to retrieve. If omitted, defaults to: name, business_name, age, account_status, balance, amount_spent, attribution_spec, account_id, business, business_city, brand_safety_content_filter_levels, currency, created_time, id.

Returns:
  Object with the requested ad account fields. Key fields:
  - id (string): Ad account ID
  - name (string): Account display name
  - account_status (number): Status code (1=ACTIVE, 2=DISABLED, 3=UNSETTLED, etc.)
  - currency (string): Account currency code (e.g., 'USD')
  - balance (string): Current account balance
  - amount_spent (string): Total lifetime spend

Examples:
  - Use when: "Get details for ad account act_123456"
  - Use when: "What is the currency and balance of my ad account?"`,
      inputSchema: z.object({
        act_id: z
          .string()
          .describe("Ad account ID prefixed with 'act_', e.g., 'act_1234567890'"),
        fields: FieldsSchema,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ act_id, fields }) => {
      try {
        const effectiveFields = fields && fields.length > 0 ? fields : DEFAULT_AD_ACCOUNT_FIELDS;
        const data = await fetchNode(act_id, { fields: effectiveFields });
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
