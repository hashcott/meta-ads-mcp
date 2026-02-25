# Meta Ads MCP Server

MCP (Model Context Protocol) server for the Meta (Facebook) Ads API, written in TypeScript. Provides 21 tools to manage and analyze ad accounts, campaigns, ad sets, ads, creatives, insights, and activity logs via the Meta Graph API v22.0.

## Features

- **24 Tools** covering the full Meta Ads management hierarchy
- **Accounts**: List ad accounts, get account details
- **Insights**: Performance analytics at account, campaign, ad set, and ad level
- **Campaigns**: Get by ID, list by ad account (with filtering/pagination)
- **Ad Sets**: Get by ID, batch lookup, list by ad account/campaign
- **Ads**: Get by ID, list by ad account/campaign/ad set
- **Creatives**: Get creative details, list creatives by ad or by ad account
- **Media**: List ad images, generate ad previews across placements
- **Activities**: Change history for ad accounts and ad sets
- **Pagination**: Utility to fetch paginated result pages

## Requirements

- Node.js >= 18
- A Meta (Facebook) Access Token with `ads_read` permission

## Installation

```bash
# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

## Authentication

You need a Meta User Access Token with at minimum the `ads_read` permission. You can generate one from the [Meta for Developers](https://developers.facebook.com/tools/explorer/) Graph API Explorer.

Pass the token using either method:

**CLI argument (recommended for Cursor/Claude Desktop):**
```bash
node dist/index.js --access-token YOUR_META_ACCESS_TOKEN
```

**Environment variable:**
```bash
export META_ADS_ACCESS_TOKEN=YOUR_META_ACCESS_TOKEN
node dist/index.js
```

## Using with npx (no install required)

Once published to npm, run directly with:

```bash
npx meta-ads-mcp-server --access-token YOUR_META_ACCESS_TOKEN
```

## Cursor / Claude Desktop Configuration

Add to your MCP client configuration:

**Via npx (recommended — no local install needed):**
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": [
        "-y",
        "meta-ads-mcp-server",
        "--access-token",
        "YOUR_META_ACCESS_TOKEN"
      ]
    }
  }
}
```

**Via local build:**
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "node",
      "args": [
        "/path/to/meta-ads-mcp/dist/index.js",
        "--access-token",
        "YOUR_META_ACCESS_TOKEN"
      ]
    }
  }
}
```

**Via environment variable:**
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "meta-ads-mcp-server"],
      "env": {
        "META_ADS_ACCESS_TOKEN": "YOUR_META_ACCESS_TOKEN"
      }
    }
  }
}
```

## Development

```bash
# Watch mode (auto-recompile on change)
npm run dev

# Clean build artifacts
npm run clean

# Rebuild from scratch
npm run clean && npm run build
```

## Available Tools

| Tool | Description |
|------|-------------|
| `meta_ads_list_ad_accounts` | List all ad accounts linked to your token |
| `meta_ads_get_ad_account_details` | Get details for a specific ad account |
| `meta_ads_get_adaccount_insights` | Performance insights for an ad account |
| `meta_ads_get_campaign_insights` | Performance insights for a campaign |
| `meta_ads_get_adset_insights` | Performance insights for an ad set |
| `meta_ads_get_ad_insights` | Performance insights for an individual ad |
| `meta_ads_get_campaign_by_id` | Get a specific campaign by ID |
| `meta_ads_get_campaigns_by_adaccount` | List campaigns in an ad account |
| `meta_ads_get_adset_by_id` | Get a specific ad set by ID |
| `meta_ads_get_adsets_by_ids` | Batch lookup multiple ad sets |
| `meta_ads_get_adsets_by_adaccount` | List ad sets in an ad account |
| `meta_ads_get_adsets_by_campaign` | List ad sets in a campaign |
| `meta_ads_get_ad_by_id` | Get a specific ad by ID |
| `meta_ads_get_ads_by_adaccount` | List ads in an ad account |
| `meta_ads_get_ads_by_campaign` | List ads in a campaign |
| `meta_ads_get_ads_by_adset` | List ads in an ad set |
| `meta_ads_get_ad_creative_by_id` | Get a specific ad creative by ID |
| `meta_ads_get_ad_creatives_by_ad_id` | List creatives for an ad |
| `meta_ads_get_adcreatives_by_adaccount` | List all creatives in an ad account |
| `meta_ads_get_ad_images` | List image assets in an ad account |
| `meta_ads_get_ad_previews` | Generate ad previews across placements |
| `meta_ads_get_activities_by_adaccount` | Change log for an ad account |
| `meta_ads_get_activities_by_adset` | Change log for an ad set |
| `meta_ads_fetch_pagination_url` | Fetch next/previous page of results |

## Project Structure

```
meta-ads-mcp/
  src/
    index.ts              # Entry point
    constants.ts          # API version, URLs, defaults
    types.ts              # TypeScript interfaces
    services/
      graph-api.ts        # API client, error handling, param builders
    schemas/
      common.ts           # Shared Zod schemas (pagination, filtering, etc.)
      insights.ts         # Insights-specific Zod schemas
    tools/
      accounts.ts         # Account tools
      insights.ts         # Insights tools
      campaigns.ts        # Campaign tools
      adsets.ts           # Ad set tools
      ads.ts              # Ad tools
      creatives.ts        # Creative tools
      media.ts            # Ad images and ad previews tools
      activities.ts       # Activity log tools
      pagination.ts       # Pagination utility tool
  dist/                   # Compiled JavaScript (after npm run build)
  package.json
  tsconfig.json
```

## Pagination

Many list tools return paginated results. When a response contains a `paging.next` URL, use `meta_ads_fetch_pagination_url` to retrieve the next page:

```
1. Call meta_ads_get_campaigns_by_adaccount → get first page
2. If response.paging.next exists → call meta_ads_fetch_pagination_url(url=response.paging.next)
3. Repeat until no paging.next
```

## License

MIT
