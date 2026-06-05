#!/bin/bash
set -e

echo "Starting QA Test..."

# Wait for server to start if run in background
sleep 3

ADMIN_EMAIL="admin@admin.dev"
PASSWORD="admin12345"
ORG_NAME="Ultra Admin"
COOKIE_JAR="cookies.txt"
rm -f $COOKIE_JAR

echo "1 & 2. Auth: Login or Register (Idempotent)"
LOGIN_RES=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RES" | grep -q '"success":true'; then
  echo "Login successful. Skipping registration."
else
  echo "Login failed. Registering new Admin..."
  REG_RES=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -c "$COOKIE_JAR" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASSWORD\", \"organizationName\": \"$ORG_NAME\"}")
  
  if ! echo "$REG_RES" | grep -q '"success":true'; then
    echo "Registration failed: $REG_RES"
    exit 1
  fi
fi

# 3. Update Organization
echo "Testing PUT /api/organizations"
curl -s -X PUT http://localhost:5000/api/organizations \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"timezone": "UTC", "workingHours": {"start": "09:00", "end": "17:00", "daysOfWeek": [1,2,3,4,5]}}'
echo ""

# 4. Create Resource
echo "Testing POST /api/resources"
RES_RESPONSE=$(curl -s -X POST http://localhost:5000/api/resources \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"name": "QA Conference Room", "bufferTimeBefore": 15, "bufferTimeAfter": 15}')

echo $RES_RESPONSE
RESOURCE_ID=$(echo $RES_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)

if [ "$RESOURCE_ID" == "null" ] || [ -z "$RESOURCE_ID" ]; then
  echo "Failed to create resource"
  exit 1
fi

# 5. Create Booking
echo "Testing POST /api/bookings"
# Use a fixed date that we know is a weekday. 2026-06-05 is Friday.
FIXED_DATE="2026-06-05"

BOOKING_RESPONSE=$(curl -s -X POST http://localhost:5000/api/bookings \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d "{\"resourceId\": \"$RESOURCE_ID\", \"startTime\": \"${FIXED_DATE}T10:00:00Z\", \"endTime\": \"${FIXED_DATE}T11:00:00Z\"}")

echo $BOOKING_RESPONSE

# 6. Check Availability
echo "Testing GET /api/bookings/availability/$RESOURCE_ID?date=$FIXED_DATE"
curl -s -X GET "http://localhost:5000/api/bookings/availability/$RESOURCE_ID?date=$FIXED_DATE" \
  -b "$COOKIE_JAR"

echo ""
echo "QA Test Completed Successfully!"
rm -f $COOKIE_JAR
