#!/usr/bin/env bash
# deploy.sh — Build and publish meta-ads-mcp-server to npm
# Usage:
#   ./scripts/deploy.sh              # patch bump (1.0.0 → 1.0.1)
#   ./scripts/deploy.sh minor        # minor bump (1.0.0 → 1.1.0)
#   ./scripts/deploy.sh major        # major bump (1.0.0 → 2.0.0)
#   ./scripts/deploy.sh --dry-run    # simulate publish without uploading

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUMP="${1:-patch}"
DRY_RUN=false

if [ "$1" = "--dry-run" ]; then
  DRY_RUN=true
  BUMP="patch"
fi

echo "==> Checking npm login..."
if ! npm whoami &>/dev/null; then
  echo "Not logged in to npm. Run: npm login"
  exit 1
fi

echo "==> Cleaning previous build..."
npm run clean

echo "==> Building TypeScript..."
npm run build

echo "==> Running sanity check..."
node dist/index.js --help 2>&1 | grep -q "access-token" || {
  echo "Binary sanity check failed."
  exit 1
}

if [ "$DRY_RUN" = true ]; then
  echo "==> [DRY RUN] Files that would be published:"
  npm pack --dry-run
  echo ""
  echo "==> [DRY RUN] Skipping version bump and publish."
  exit 0
fi

echo "==> Bumping version ($BUMP)..."
npm version "$BUMP" --no-git-tag-version

VERSION=$(node -p "require('./package.json').version")
echo "==> Publishing version $VERSION to npm..."
npm publish --access public

echo "==> Tagging git commit v$VERSION..."
git add package.json package-lock.json
git commit -m "chore: release v$VERSION"
git tag "v$VERSION"

echo ""
echo "Done! Published meta-ads-mcp-server@$VERSION"
echo ""
echo "Users can now run:"
echo "  npx meta-ads-mcp-server --access-token <TOKEN>"
