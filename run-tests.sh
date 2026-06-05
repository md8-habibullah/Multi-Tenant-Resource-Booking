#!/bin/bash
set -e

echo "Starting Integration Tests..."

# Random email for new user
RANDOM_EMAIL="admin_$RANDOM@test.com"

echo "1. POST to Auth/Register"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$RANDOM_EMAIL\", \"password\": \"password123\", \"organizationName\": \"Integration Org\"}")

JWT=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ "$JWT" == "null" ] || [ -z "$JWT" ]; then
  echo "Failed to extract JWT from Register: $AUTH_RESPONSE"
  exit 1
fi
echo "Extracted JWT."

echo "2. POST to Resources"
RES_RESPONSE=$(curl -s -X POST http://localhost:5000/api/resources \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Conference Room A", "bufferTimeBefore": 15, "bufferTimeAfter": 15}')

RESOURCE_ID=$(echo $RES_RESPONSE | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)

if [ "$RESOURCE_ID" == "null" ] || [ -z "$RESOURCE_ID" ]; then
  echo "Failed to create resource: $RES_RESPONSE"
  exit 1
fi
echo "Created Resource: $RESOURCE_ID"

echo "3. POST to Bookings"
# Use a fixed weekday to guarantee working hours (2026-06-05 is Friday)
FIXED_DATE="2026-06-05"
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d "{\"resourceId\": \"$RESOURCE_ID\", \"startTime\": \"${FIXED_DATE}T10:00:00Z\", \"endTime\": \"${FIXED_DATE}T10:30:00Z\"}")

echo "Booking Output:"
echo $BOOKING_RESPONSE

echo "4. GET Availability Engine"
AVAIL_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/bookings/availability/$RESOURCE_ID?date=$FIXED_DATE" \
  -H "Authorization: Bearer $JWT")

echo "Availability JSON Output:"
echo $AVAIL_RESPONSE

echo ""
echo "Integration Tests Completed Successfully!"
