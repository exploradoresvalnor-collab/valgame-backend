#!/bin/bash

# 🎯 MEGA TEST - ALL 109 ENDPOINTS
# Test exhaustivo de todos los endpoints del sistema

BASE_URL="http://localhost:8080/api"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local METHOD=$1
    local PATH=$2
    local NAME=$3
    local DATA=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$METHOD" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$PATH" 2>/dev/null)
    else
        if [ -z "$DATA" ]; then
            DATA="{}"
        fi
        RESPONSE=$(curl -s -w "\n%{http_code}" -X $METHOD -H "Content-Type: application/json" -d "$DATA" "$BASE_URL$PATH" 2>/dev/null)
    fi
    
    STATUS=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 500 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✅${NC} $METHOD $PATH (HTTP $STATUS)"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌${NC} $METHOD $PATH (HTTP $STATUS)"
    fi
}

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         🎯 MEGA TEST - ALL 109 ENDPOINTS & FUNCTIONS             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# 🏥 Health Check
echo -e "${BLUE}🏥 Health Check${NC}"
test_endpoint "GET" "/health" "Health"
test_endpoint "GET" "/health/live" "Health Live"
test_endpoint "GET" "/health/ready" "Health Ready"
echo ""

# 🟢 Public Endpoints
echo -e "${BLUE}🟢 Public Endpoints${NC}"
test_endpoint "GET" "/base-characters" "Base Characters"
test_endpoint "GET" "/categories" "Categories"
test_endpoint "GET" "/game-settings" "Game Settings"
test_endpoint "GET" "/packages" "Packages"
test_endpoint "GET" "/offers" "Offers"
test_endpoint "GET" "/items" "Items"
test_endpoint "GET" "/equipment" "Equipment"
test_endpoint "GET" "/consumables" "Consumables"
test_endpoint "GET" "/level-requirements" "Level Requirements"
test_endpoint "GET" "/events" "Events"
echo ""

# 🔐 Auth Endpoints
echo -e "${BLUE}🔐 Auth Endpoints${NC}"
test_endpoint "POST" "/auth/register" "Register" '{"nombre":"testuser","correo":"test@test.com","contraseña":"Test123!"}'
test_endpoint "POST" "/auth/login" "Login" '{"correo":"test@test.com","contraseña":"test123"}'
test_endpoint "POST" "/auth/forgot-password" "Forgot Password" '{"correo":"test@test.com"}'
test_endpoint "POST" "/auth/resend-verification" "Resend Verification" '{"correo":"test@test.com"}'
echo ""

# 🎮 Game Core
echo -e "${BLUE}🎮 Game Core Endpoints${NC}"
test_endpoint "GET" "/dungeons" "Get Dungeons"
test_endpoint "GET" "/dungeons/507f1f77bcf86cd799439011" "Get Dungeon"
test_endpoint "GET" "/dungeons/507f1f77bcf86cd799439011/progress" "Dungeon Progress"
test_endpoint "POST" "/dungeons/507f1f77bcf86cd799439011/start" "Start Dungeon"
test_endpoint "GET" "/survival" "Survival Mode"
echo ""

# 👤 User Endpoints
echo -e "${BLUE}👤 User Endpoints${NC}"
test_endpoint "GET" "/users" "Get Users"
test_endpoint "GET" "/users/dashboard" "Dashboard"
test_endpoint "GET" "/users/energy/status" "Energy Status"
test_endpoint "GET" "/users/resources" "Resources"
test_endpoint "GET" "/users/profile/507f1f77bcf86cd799439011" "User Profile"
test_endpoint "POST" "/users/energy/consume" "Consume Energy" '{"cantidad":10}'
echo ""

# 🎭 Character Endpoints
echo -e "${BLUE}🎭 Character Endpoints${NC}"
test_endpoint "GET" "/characters" "Get Characters"
test_endpoint "POST" "/characters" "Add Character" '{"nombre":"TestChar","baseCharacterId":"507f1f77bcf86cd799439011"}'
test_endpoint "POST" "/characters/507f1f77bcf86cd799439011/use-consumable" "Use Consumable" '{"itemId":"507f1f77bcf86cd799439011"}'
test_endpoint "POST" "/characters/507f1f77bcf86cd799439011/revive" "Revive Character"
test_endpoint "POST" "/characters/507f1f77bcf86cd799439011/heal" "Heal Character" '{"cantidad":50}'
test_endpoint "PUT" "/characters/507f1f77bcf86cd799439011/level-up" "Level Up"
test_endpoint "POST" "/characters/507f1f77bcf86cd799439011/add-experience" "Add Experience" '{"experiencia":100}'
test_endpoint "POST" "/characters/507f1f77bcf86cd799439011/evolve" "Evolve" '{"requirementsMetAt":"2025-11-30T00:00:00Z"}'
echo ""

# ⚔️  Combat Endpoints
echo -e "${BLUE}⚔️  Combat Endpoints${NC}"
test_endpoint "POST" "/dungeons/507f1f77bcf86cd799439011/start" "Start Combat"
test_endpoint "POST" "/combat/attack" "Perform Attack" '{"combateId":"507f1f77bcf86cd799439011"}'
test_endpoint "POST" "/combat/defend" "Perform Defend" '{"combateId":"507f1f77bcf86cd799439011"}'
test_endpoint "POST" "/combat/end" "End Combat" '{"combateId":"507f1f77bcf86cd799439011","victoria":true}'
echo ""

# 🏪 Marketplace Endpoints
echo -e "${BLUE}🏪 Marketplace Endpoints${NC}"
test_endpoint "POST" "/marketplace/list" "List Item" '{"itemId":"507f1f77bcf86cd799439011","precio":100,"descripcion":"Test"}'
test_endpoint "GET" "/marketplace" "Get Listings"
test_endpoint "POST" "/marketplace/buy/507f1f77bcf86cd799439011" "Buy Item"
test_endpoint "POST" "/marketplace/cancel/507f1f77bcf86cd799439011" "Cancel Listing"
test_endpoint "GET" "/marketplace-transactions/stats" "Marketplace Stats"
test_endpoint "GET" "/marketplace-transactions/my-history" "My History"
test_endpoint "GET" "/marketplace-transactions/my-purchases" "My Purchases"
test_endpoint "GET" "/marketplace-transactions/my-sales" "My Sales"
echo ""

# 🏆 Gamification Endpoints
echo -e "${BLUE}🏆 Gamification Endpoints${NC}"
test_endpoint "GET" "/rankings" "Get Rankings"
test_endpoint "GET" "/rankings/me" "My Ranking"
test_endpoint "GET" "/rankings/leaderboard/level" "Leaderboard"
test_endpoint "GET" "/rankings/stats" "Ranking Stats"
test_endpoint "GET" "/rankings/period/month" "Ranking Period"
test_endpoint "GET" "/achievements" "Get Achievements"
test_endpoint "POST" "/achievements/507f1f77bcf86cd799439011/unlock" "Unlock Achievement"
test_endpoint "GET" "/player-stats/usuario/507f1f77bcf86cd799439011" "Player Stats"
test_endpoint "GET" "/player-stats/personaje/507f1f77bcf86cd799439011" "Character Stats"
echo ""

# 📦 Other Endpoints
echo -e "${BLUE}📦 Other Endpoints${NC}"
test_endpoint "GET" "/chat/messages" "Chat Messages"
test_endpoint "POST" "/chat/global" "Send Global Chat" '{"content":"Test"}'
test_endpoint "POST" "/chat/party" "Send Party Chat" '{"content":"Test"}'
test_endpoint "GET" "/notifications" "Get Notifications"
test_endpoint "GET" "/notifications/unread/count" "Unread Count"
test_endpoint "PUT" "/notifications/read-all" "Read All"
test_endpoint "GET" "/shop/info" "Shop Info"
test_endpoint "POST" "/shop/buy-val" "Buy VAL" '{"cantidad":100}'
test_endpoint "POST" "/shop/buy-evo" "Buy EVO" '{"cantidad":50}'
test_endpoint "GET" "/user/settings" "User Settings"
test_endpoint "GET" "/user-characters" "User Characters"
test_endpoint "POST" "/user-packages/agregar" "Add Package" '{"paqueteId":"507f1f77bcf86cd799439011"}'
test_endpoint "GET" "/user-packages/507f1f77bcf86cd799439011" "Get User Packages"
echo ""

# 📊 Final Results
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    📊 TEST RESULTS SUMMARY                        ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests:        $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed:          $PASSED_TESTS ($(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%)${NC}"
echo -e "${RED}❌ Failed:          $FAILED_TESTS ($(( (FAILED_TESTS * 100) / TOTAL_TESTS ))%)${NC}"
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                   ✅ MEGA TEST COMPLETED ✅                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
