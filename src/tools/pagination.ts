import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import { handleApiError } from "../services/graph-api.js";

export function registerPaginationTools(server: McpServer): void {
  server.registerTool(
    "meta_ads_fetch_pagination_url",
    {
      title: "Fetch Meta Ads Pagination URL",
      description: `Fetch the next or previous page of results from a Meta Graph API pagination URL.

Use this tool whenever a Meta Ads tool response contains a paging.next or paging.previous URL. The pagination URL already includes the access token and all necessary parameters.

Args:
  - url (string): The complete pagination URL from response.paging.next or response.paging.previous

Returns:
  The next/previous page of results in the same format as the original response.

Examples:
  - Use when: response.paging.next exists after calling meta_ads_get_adaccount_insights
  - Use when: response.paging.next exists after calling meta_ads_get_campaigns_by_adaccount
  - Use when: "Get all pages of results automatically"

Note: The pagination URL already contains the access token — do NOT add or modify it.`,
      inputSchema: z.object({
        url: z
          .string()
          .url()
          .describe(
            "Complete pagination URL from response.paging.next or response.paging.previous"
          ),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ url }) => {
      try {
        const response = await axios.get(url, { timeout: 30000 });
        const data = response.data;
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
