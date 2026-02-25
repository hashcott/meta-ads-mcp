import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FB_GRAPH_URL } from "../constants.js";
import {
  getAccessToken,
  makeGraphApiCall,
  buildInsightsParams,
  handleApiError,
} from "../services/graph-api.js";
import { InsightsInputSchema } from "../schemas/insights.js";

const INSIGHTS_DESCRIPTION_SUFFIX = `

Returns:
  Object with:
  - data (array): List of insight records with requested metrics
  - paging (object): Pagination cursors. Use meta_ads_fetch_pagination_url with paging.next to get more results

Pagination note: When response contains paging.next, use meta_ads_fetch_pagination_url to retrieve additional pages automatically.`;

function buildInsightsResult(data: unknown): {
  content: [{ type: "text"; text: string }];
  structuredContent: Record<string, unknown>;
} {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  };
}

export function registerInsightsTools(server: McpServer): void {
  server.registerTool(
    "meta_ads_get_adaccount_insights",
    {
      title: "Get Meta Ad Account Insights",
      description: `Retrieve performance insights for a Meta ad account.

Fetches metrics like impressions, reach, clicks, spend, conversions, and more for an entire ad account. Supports time range definitions, demographic breakdowns, and attribution settings.

Args:
  - act_id (string): Ad account ID prefixed with 'act_', e.g., 'act_1234567890'
  - fields (string[]): Metrics to retrieve. Common: impressions, reach, clicks, spend, ctr, cpc, cpm, cpp, frequency, actions, conversions, cost_per_action_type
  - date_preset (string): Relative time range preset (default: last_30d)
  - time_range (object): Custom range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}
  - level (string): Aggregation level: account, campaign, adset, ad (default: account)
  - breakdowns (string[]): Segment by: age, gender, country, impression_device, publisher_platform, etc.
  - See full parameter list in inputSchema${INSIGHTS_DESCRIPTION_SUFFIX}`,
      inputSchema: InsightsInputSchema.extend({
        act_id: z
          .string()
          .describe("Ad account ID prefixed with 'act_', e.g., 'act_1234567890'"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ act_id, ...insightParams }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${act_id}/insights`;
        const params = buildInsightsParams({ access_token: token }, {
          ...insightParams,
          level: insightParams.level ?? "account",
        });
        const data = await makeGraphApiCall(url, params);
        return buildInsightsResult(data);
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "meta_ads_get_campaign_insights",
    {
      title: "Get Meta Campaign Insights",
      description: `Retrieve performance insights for a specific Meta ad campaign.

Fetches advertising statistics for a campaign, allowing analysis of metrics like impressions, clicks, conversions, spend, etc.

Args:
  - campaign_id (string): Campaign ID, e.g., '23843xxxxx'
  - fields (string[]): Metrics to retrieve. Common: campaign_name, impressions, clicks, spend, ctr, reach, actions, objective, cpc, cpm, date_start, date_stop
  - date_preset (string): Relative time range preset (default: last_30d)
  - time_range (object): Custom range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}
  - level (string): Aggregation level: campaign, adset, ad (default: campaign)
  - breakdowns (string[]): Segment by: age, gender, country, publisher_platform, impression_device, etc.
  - See full parameter list in inputSchema${INSIGHTS_DESCRIPTION_SUFFIX}`,
      inputSchema: InsightsInputSchema.extend({
        campaign_id: z.string().describe("Campaign ID, e.g., '23843xxxxx'"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ campaign_id, ...insightParams }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${campaign_id}/insights`;
        const params = buildInsightsParams({ access_token: token }, {
          ...insightParams,
          level: insightParams.level ?? "campaign",
        });
        const data = await makeGraphApiCall(url, params);
        return buildInsightsResult(data);
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "meta_ads_get_adset_insights",
    {
      title: "Get Meta Ad Set Insights",
      description: `Retrieve performance insights for a specific Meta ad set.

Provides advertising statistics for an ad set, useful for analyzing performance across its child ads.

Args:
  - adset_id (string): Ad set ID, e.g., '6123456789012'
  - fields (string[]): Metrics to retrieve. Common: adset_name, campaign_name, impressions, clicks, spend, ctr, reach, actions, cpc, cpm, cpp, cost_per_action_type
  - date_preset (string): Relative time range preset (default: last_30d)
  - time_range (object): Custom range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}
  - level (string): Aggregation level: adset, ad (default: adset)
  - breakdowns (string[]): Segment by: age, gender, country, publisher_platform, impression_device, platform_position, etc.
  - See full parameter list in inputSchema${INSIGHTS_DESCRIPTION_SUFFIX}`,
      inputSchema: InsightsInputSchema.extend({
        adset_id: z.string().describe("Ad set ID, e.g., '6123456789012'"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ adset_id, ...insightParams }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${adset_id}/insights`;
        const params = buildInsightsParams({ access_token: token }, {
          ...insightParams,
          level: insightParams.level ?? "adset",
        });
        const data = await makeGraphApiCall(url, params);
        return buildInsightsResult(data);
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "meta_ads_get_ad_insights",
    {
      title: "Get Meta Ad Insights",
      description: `Retrieve detailed performance insights for a specific Meta ad.

Fetches performance metrics for an individual ad, such as impressions, clicks, conversions, video views, etc.

Args:
  - ad_id (string): Ad ID, e.g., '6123456789012'
  - fields (string[]): Metrics to retrieve. Common: ad_name, adset_name, campaign_name, impressions, clicks, spend, ctr, cpc, cpm, reach, frequency, actions, conversions, cost_per_action_type, inline_link_clicks, video_p25_watched_actions
  - date_preset (string): Relative time range preset (default: last_30d)
  - time_range (object): Custom range {'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}
  - level (string): Aggregation level, should be 'ad' (default: ad)
  - breakdowns (string[]): Segment by: age, gender, country, publisher_platform, impression_device, platform_position, device_platform, etc.
  - See full parameter list in inputSchema${INSIGHTS_DESCRIPTION_SUFFIX}`,
      inputSchema: InsightsInputSchema.extend({
        ad_id: z.string().describe("Ad ID, e.g., '6123456789012'"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ ad_id, ...insightParams }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${ad_id}/insights`;
        const params = buildInsightsParams({ access_token: token }, {
          ...insightParams,
          level: insightParams.level ?? "ad",
        });
        const data = await makeGraphApiCall(url, params);
        return buildInsightsResult(data);
      } catch (error) {
        return { content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}
