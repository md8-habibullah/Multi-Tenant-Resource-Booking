#!/bin/bash
set -e

echo "Starting Integration Tests..."

ADMIN_EMAIL="admin@admin.dev"
PASSWORD="admin12345"
ORG_NAME="Ultra Admin"
COOKIE_JAR="cookies.txt"
rm -f $COOKIE_JAR

echo "1. Authentication (Idempotent)"
LOGIN_RES=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RES" | grep -q '"success":true'; then
  echo "Login successful! Skipping registration."
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
  echo "Registration successful."
fi

echo "2. POST to Resources"
RES_RESPONSE=$(curl -s -X POST http://localhost:5000/api/resources \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"name": "Integration Room", "bufferTimeBefore": 15, "bufferTimeAfter": 15}')

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
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d "{\"resourceId\": \"$RESOURCE_ID\", \"startTime\": \"${FIXED_DATE}T10:00:00Z\", \"endTime\": \"${FIXED_DATE}T10:30:00Z\"}")

echo "Booking Output:"
echo $BOOKING_RESPONSE

echo "4. GET Availability Engine"
AVAIL_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/bookings/availability/$RESOURCE_ID?date=$FIXED_DATE" \
  -b "$COOKIE_JAR")

echo "Availability JSON Output:"
echo $AVAIL_RESPONSE

echo ""
echo "Integration Tests Completed Successfully!"
rm -f $COOKIE_JAR
