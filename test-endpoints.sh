#!/bin/bash

# IDs válidos para testing
USER_ID="692856c50e244ea1110f47f"
DUNGEON_ID="68f92f58143010ee382e12c4"
API_URL="http://localhost:8080"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjhkNTZjNTBlMjQ0ZWExMTEwZjQ3ZiIsImlhdCI6MTc2NDUyMTg4MiwiZXhwIjoxNzY1MTI2NjgyfQ.RJx55g_9ropRY9j6TcPiX2CYWEdFIJ4B-0jFLW0q4J4"

echo "=========================================="
echo "TESTING 5 ENDPOINTS NUEVOS"
echo "=========================================="
echo "TOKEN: $TOKEN"
echo ""

# Test 1: GET /api/dungeons/:id
echo -e "\n[TEST 1] GET /api/dungeons/:id (DEBE 200 OK)"
echo "URL: $API_URL/api/dungeons/$DUNGEON_ID"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/dungeons/$DUNGEON_ID" | head -60

# Test 2: GET /api/dungeons/:id (invalid ID) - Debe retornar 400 o 404
echo -e "\n\n[TEST 2] GET /api/dungeons/invalid-id (DEBE 400 BAD REQUEST)"
echo "URL: $API_URL/api/dungeons/invalid-id"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/dungeons/invalid-id"

# Test 3: GET /api/users/profile/:userId
echo -e "\n\n[TEST 3] GET /api/users/profile/:userId (DEBE 200 OK)"
echo "URL: $API_URL/api/users/profile/$USER_ID"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/users/profile/$USER_ID" | head -80

# Test 4: GET /api/users/profile/:userId (ID inválido)
echo -e "\n\n[TEST 4] GET /api/users/profile/invalid-id (DEBE 400 BAD REQUEST)"
echo "URL: $API_URL/api/users/profile/invalid-id"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/users/profile/invalid-id"

# Test 5: GET /api/rankings/leaderboard/:category
echo -e "\n\n[TEST 5] GET /api/rankings/leaderboard/level (DEBE 200 OK)"
echo "URL: $API_URL/api/rankings/leaderboard/level?page=0&limit=5"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/rankings/leaderboard/level?page=0&limit=5" | head -60

# Test 6: GET /api/rankings/leaderboard/:category (categoría inválida)
echo -e "\n\n[TEST 6] GET /api/rankings/leaderboard/invalid (DEBE 400 BAD REQUEST)"
echo "URL: $API_URL/api/rankings/leaderboard/invalid"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/rankings/leaderboard/invalid"

# Test 7: GET /api/achievements
echo -e "\n\n[TEST 7] GET /api/achievements (DEBE 200 OK)"
echo "URL: $API_URL/api/achievements?limit=5&page=0"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/achievements?limit=5&page=0" | head -60

# Test 8: GET /api/achievements/:userId
echo -e "\n\n[TEST 8] GET /api/achievements/:userId (DEBE 200 OK)"
echo "URL: $API_URL/api/achievements/$USER_ID"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/achievements/$USER_ID" | head -60

# Test 9: GET /api/achievements/:userId (ID inválido)
echo -e "\n\n[TEST 9] GET /api/achievements/invalid-id (DEBE 400 BAD REQUEST)"
echo "URL: $API_URL/api/achievements/invalid-id"
curl -s -H "Authorization: Bearer $TOKEN" -w "\nHTTP Status: %{http_code}\n" "$API_URL/api/achievements/invalid-id"

echo -e "\n\n=========================================="
echo "TESTING COMPLETADO"
echo "=========================================="
