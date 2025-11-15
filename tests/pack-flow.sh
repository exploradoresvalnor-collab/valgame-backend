#!/usr/bin/env bash
# Simple automated flow test (local). Edit variables below before running.

API_BASE=${API_BASE:-http://localhost:8080}
EMAIL=${EMAIL:-user@example.com}
PASSWORD=${PASSWORD:-secret123}
PRODUCT_ID=${PRODUCT_ID:-pkg_1001}

set -euo pipefail

# quick preflight
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: 'jq' is required for this script. Install it and re-run (apt: jq, brew: jq)." >&2
  exit 1
fi

echo "1) Login"
curl -s -c cookies.txt -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq .

echo "\n2) List packages for sale (first page)"
curl -s -b cookies.txt "$API_BASE/api/packages/for-sale?page=1&limit=10" | jq .

echo "\n3) Purchase product (wallet)"
curl -s -b cookies.txt -X POST "$API_BASE/api/purchase" -H 'Content-Type: application/json' -d "{\"productId\":\"$PRODUCT_ID\",\"currency\":\"VAL\",\"paymentMethod\":\"wallet\"}" | jq . > /tmp/purchase_result.json

USER_PACKAGE_ID=$(jq -r '.userPackageId // empty' /tmp/purchase_result.json || true)
ORDER_STATUS=$(jq -r '.status // empty' /tmp/purchase_result.json || true)

echo "Purchase status: $ORDER_STATUS, userPackageId: $USER_PACKAGE_ID"

if [ -z "$USER_PACKAGE_ID" ]; then
  if [ "$ORDER_STATUS" = "pending" ]; then
    echo "Purchase pending: polling for userPackage to appear (60s max)..."
    FOUND=""
    for i in {1..12}; do
      sleep 5
      echo "Polling attempt $i..."
      # try to find a recently created userPackage for the product
      UP=$(curl -s -b cookies.txt "$API_BASE/api/users/me/packages" | jq -c ".data[] | select(.packageId==\"$PRODUCT_ID\") | ._id" 2>/dev/null || true)
      if [ -n "$UP" ]; then
        USER_PACKAGE_ID=$(echo $UP | tr -d '"')
        FOUND=1
        break
      fi
    done
    if [ -z "$FOUND" ]; then
      echo "userPackage not found after polling. Dumping purchase_result:" && jq . /tmp/purchase_result.json && exit 1
    fi
  else
    echo "No userPackageId returned (purchase failed). Dumping purchase_result:" && jq . /tmp/purchase_result.json && exit 1
  fi
fi

echo "\n4) Open the package (userPackageId=$USER_PACKAGE_ID)"
curl -s -b cookies.txt -X POST "$API_BASE/api/user-packages/$USER_PACKAGE_ID/open" -H 'Content-Type: application/json' -d '{}' | jq . > /tmp/open_result.json || (echo "Open failed" && cat /tmp/open_result.json && exit 1)

echo "Open result:" && jq . /tmp/open_result.json

echo "\n5) Verify user packages and inventory"
curl -s -b cookies.txt "$API_BASE/api/users/me/packages" | jq .
curl -s -b cookies.txt "$API_BASE/api/users/me" | jq .

echo "\nPack-flow test completed. Remove cookies.txt if desired." 
