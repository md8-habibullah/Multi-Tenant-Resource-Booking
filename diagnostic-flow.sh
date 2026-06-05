#!/bin/bash
set -e

echo "=== Diagnostic Flow Script ==="

# Generate a unique email
RANDOM_ID=$RANDOM
EMAIL="diagnostic_${RANDOM_ID}@test.com"
PASSWORD="password123"
ORG_NAME="Diagnostic Org ${RANDOM_ID}"

COOKIE_FILE="cookies.txt"
rm -f "$COOKIE_FILE"

echo "Using Email: $EMAIL"
echo "Using Org: $ORG_NAME"

echo -e "\n1. Registering new User & Org..."
REG_STATUS=$(curl -s -o reg_response.json -w "%{http_code}" -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c "$COOKIE_FILE" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"organizationName\":\"$ORG_NAME\"}")

echo "HTTP Status Code: $REG_STATUS"
cat reg_response.json
echo ""

if [ "$REG_STATUS" -ne 201 ]; then
  echo "Error: Registration failed with status code $REG_STATUS"
  exit 1
fi

echo -e "\n2. Logging in with registered credentials..."
LOGIN_STATUS=$(curl -s -o login_response.json -w "%{http_code}" -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -c "$COOKIE_FILE" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "HTTP Status Code: $LOGIN_STATUS"
cat login_response.json
echo ""

if [ "$LOGIN_STATUS" -ne 200 ]; then
  echo "Error: Login failed with status code $LOGIN_STATUS"
  exit 1
fi

echo -e "\n3. Fetching Organization details (protected route using cookie)..."
ORG_STATUS=$(curl -s -o org_response.json -w "%{http_code}" -X GET http://localhost:5000/api/organizations \
  -b "$COOKIE_FILE")

echo "HTTP Status Code: $ORG_STATUS"
cat org_response.json
echo ""

if [ "$ORG_STATUS" -ne 200 ]; then
  echo "Error: Organization fetching failed with status code $ORG_STATUS"
  exit 1
fi

echo "=== Diagnostic Flow Passed Successfully! ==="
rm -f reg_response.json login_response.json org_response.json "$COOKIE_FILE"
exit 0
