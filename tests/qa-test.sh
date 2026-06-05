#!/bin/bash
set -e

echo "Starting QA Test..."

# Wait for server to start if run in background
sleep 3

# Use random email to avoid collision
RANDOM_EMAIL="admin_$RANDOM@test.com"
COOKIE_JAR="cookies.txt"
rm -f $COOKIE_JAR

# 1. Register Auth
echo "Testing POST /api/auth/register"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d "{\"email\": \"$RANDOM_EMAIL\", \"password\": \"password123\", \"organizationName\": \"Test Org\"}")

echo $AUTH_RESPONSE
ORG_ID=$(echo $AUTH_RESPONSE | grep -o '"organizationId":"[^"]*' | head -n 1 | cut -d'"' -f4)

# 2. Login Auth
echo "Testing POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d "{\"email\": \"$RANDOM_EMAIL\", \"password\": \"password123\"}")

echo "Login HTTP Status: $LOGIN_RESPONSE"
if [ "$LOGIN_RESPONSE" != "200" ]; then
  echo "Failed to login"
  exit 1
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
  -d '{"name": "Conference Room", "bufferTimeBefore": 15, "bufferTimeAfter": 15}')

echo $RES_RESPONSE
RESOURCE_ID=$(echo $RES_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)

if [ "$RESOURCE_ID" == "null" ] || [ -z "$RESOURCE_ID" ]; then
  echo "Failed to create resource"
  exit 1
fi

# 5. Create Booking
echo "Testing POST /api/bookings"
TODAY=$(date -u +"%Y-%m-%d")
# If today is weekend, we might need a weekday for testing since org only allows 1,2,3,4,5. 
# Better just use a fixed date that we know is a weekday. 2026-06-05 is Friday.
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
