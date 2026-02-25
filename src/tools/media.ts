import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FB_GRAPH_URL } from "../constants.js";
import {
  getAccessToken,
  makeGraphApiCall,
  prepareParams,
  handleApiError,
} from "../services/graph-api.js";
import { PaginationSchema } from "../schemas/common.js";

export function registerMediaTools(server: McpServer): void {
  server.registerTool(
    "meta_ads_get_ad_images",
    {
      title: "Get Meta Ad Images",
      description: `Retrieve ad images belonging to a Meta ad account.

Useful for auditing image assets, finding images by hash or name, and checking image dimensions and status.

Args:
  - act_id (string): Ad account ID prefixed with 'act_', e.g., 'act_1234567890'
  - fields (string[]): Fields to retrieve. Available: id, account_id, created_time, creatives, hash, height, is_associated_creatives_in_adgroups, name, original_height, original_width, permalink_url, status, updated_time, url, url_128, width
  - hashes (string[]): Filter by specific image hashes
  - name (string): Filter images by name (partial match)
  - minwidth (number): Minimum image width in pixels
  - minheight (number): Minimum image height in pixels
  - limit (number): Results per page (1-100, default: 25)
  - after / before (string): Pagination cursors

Returns:
  Object with data (image array) and paging. Each image contains URL, dimensions, hash, and status.
  Use meta_ads_fetch_pagination_url with paging.next for more results.

Examples:
  - Use when: "List all images in my ad account"
  - Use when: "Find images with hashes abc123 and def456"
  - Use when: "Show images wider than 1000px"`,
      inputSchema: z
        .object({
          act_id: z
            .string()
            .describe("Ad account ID prefixed with 'act_', e.g., 'act_1234567890'"),
          fields: z
            .array(z.string())
            .optional()
            .describe(
              "Fields to retrieve. Available: id, account_id, created_time, creatives, hash, height, is_associated_creatives_in_adgroups, name, original_height, original_width, permalink_url, status, updated_time, url, url_128, width"
            ),
          hashes: z
            .array(z.string())
            .optional()
            .describe("Filter by specific image hashes, e.g., ['abc123', 'def456']"),
          name: z
            .string()
            .optional()
            .describe("Filter images by name (partial match)"),
          minwidth: z
            .number()
            .int()
            .positive()
            .optional()
            .describe("Minimum image width in pixels"),
          minheight: z
            .number()
            .int()
            .positive()
            .optional()
            .describe("Minimum image height in pixels"),
        })
        .merge(PaginationSchema),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ act_id, fields, hashes, name, minwidth, minheight, limit, after, before }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${act_id}/adimages`;

        const opts: Record<string, unknown> = { limit, after, before };
        if (fields && fields.length > 0) opts.fields = fields.join(",");
        if (hashes && hashes.length > 0) opts.hashes = JSON.stringify(hashes);
        if (name) opts.name = name;
        if (minwidth !== undefined) opts.minwidth = minwidth;
        if (minheight !== undefined) opts.minheight = minheight;

        const params = prepareParams({ access_token: token }, opts);
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
    "meta_ads_get_ad_previews",
    {
      title: "Get Meta Ad Previews",
      description: `Generate preview links or embed HTML for a Meta ad in various ad formats and placements.

Allows you to see how an ad looks across different placements (Facebook feed, Instagram, Stories, etc.) before or after publishing.

Args:
  - ad_id (string): Ad ID to preview, e.g., '23843211234567'
  - ad_format (string): Preview format. Options: DESKTOP_FEED_STANDARD, MOBILE_FEED_STANDARD, MOBILE_FEED_BASIC, MOBILE_INTERSTITIAL, MOBILE_BANNER, MOBILE_MEDIUM_RECTANGLE, MOBILE_FULLWIDTH, RIGHT_COLUMN_STANDARD, INSTAGRAM_STANDARD, INSTAGRAM_STORY, AUDIENCE_NETWORK_OUTSTREAM_VIDEO, AUDIENCE_NETWORK_INSTREAM_VIDEO, FACEBOOK_STORY_MOBILE, MESSENGER_MOBILE_INBOX_MEDIA, SUGGESTED_VIDEO_MOBILE, WATCH_FEED_MOBILE, FACEBOOK_REELS_MOBILE, INSTAGRAM_REELS
  - locale (string): Locale for the preview, e.g., 'en_US'
  - start_date (string): Preview start date for scheduled ads (UNIX timestamp)
  - end_date (string): Preview end date for scheduled ads (UNIX timestamp)

Returns:
  Object with data array. Each item contains:
  - body (string): HTML iframe embed code for the preview
  - encoded_creative_id (string): Encoded creative ID

Examples:
  - Use when: "Show me how ad 23843211234567 looks on Instagram"
  - Use when: "Preview this ad in desktop feed format"
  - Use when: "Generate previews for all placements of this ad"`,
      inputSchema: z.object({
        ad_id: z.string().describe("Ad ID to preview, e.g., '23843211234567'"),
        ad_format: z
          .enum([
            "DESKTOP_FEED_STANDARD",
            "MOBILE_FEED_STANDARD",
            "MOBILE_FEED_BASIC",
            "MOBILE_INTERSTITIAL",
            "MOBILE_BANNER",
            "MOBILE_MEDIUM_RECTANGLE",
            "MOBILE_FULLWIDTH",
            "RIGHT_COLUMN_STANDARD",
            "INSTAGRAM_STANDARD",
            "INSTAGRAM_STORY",
            "AUDIENCE_NETWORK_OUTSTREAM_VIDEO",
            "AUDIENCE_NETWORK_INSTREAM_VIDEO",
            "FACEBOOK_STORY_MOBILE",
            "MESSENGER_MOBILE_INBOX_MEDIA",
            "SUGGESTED_VIDEO_MOBILE",
            "WATCH_FEED_MOBILE",
            "FACEBOOK_REELS_MOBILE",
            "INSTAGRAM_REELS",
          ])
          .optional()
          .describe(
            "Preview format/placement. Options: DESKTOP_FEED_STANDARD, MOBILE_FEED_STANDARD, INSTAGRAM_STANDARD, INSTAGRAM_STORY, FACEBOOK_STORY_MOBILE, FACEBOOK_REELS_MOBILE, INSTAGRAM_REELS, RIGHT_COLUMN_STANDARD, MESSENGER_MOBILE_INBOX_MEDIA, etc."
          ),
        locale: z
          .string()
          .optional()
          .describe("Locale for the preview, e.g., 'en_US', 'vi_VN'"),
        start_date: z
          .string()
          .optional()
          .describe("Preview start date as UNIX timestamp (for scheduled ads)"),
        end_date: z
          .string()
          .optional()
          .describe("Preview end date as UNIX timestamp (for scheduled ads)"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ ad_id, ad_format, locale, start_date, end_date }) => {
      try {
        const token = getAccessToken();
        const url = `${FB_GRAPH_URL}/${ad_id}/previews`;
        const opts: Record<string, unknown> = {};
        if (ad_format) opts.ad_format = ad_format;
        if (locale) opts.locale = locale;
        if (start_date) opts.start_date = start_date;
        if (end_date) opts.end_date = end_date;

        const params = prepareParams({ access_token: token }, opts);
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
