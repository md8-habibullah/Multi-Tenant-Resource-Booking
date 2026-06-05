#!/bin/bash
set -e

echo "Starting RBAC Tests..."

# Random emails
ADMIN_EMAIL="admin_$RANDOM@test.com"
EMP_EMAIL="emp_$RANDOM@test.com"
ADMIN_COOKIE="admin_cookies.txt"
EMP_COOKIE="emp_cookies.txt"
rm -f $ADMIN_COOKIE $EMP_COOKIE

# Start Server
echo "Booting server in background..."
npm run dev > server.log 2>&1 &
PID=$!
echo $PID > server.pid
sleep 5

echo "1. Registering ORG_ADMIN..."
ADMIN_RES=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c "$ADMIN_COOKIE" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"password123\", \"organizationName\": \"RBAC Org\"}")

ORG_ID=$(echo $ADMIN_RES | grep -o '"organizationId":"[^"]*' | head -n 1 | cut -d'"' -f4)

echo "ORG_ID: $ORG_ID"

echo "2. Registering EMPLOYEE..."
EMP_RES=$(curl -s -X POST http://localhost:5000/api/auth/employee \
  -H "Content-Type: application/json" \
  -c "$EMP_COOKIE" \
  -d "{\"email\": \"$EMP_EMAIL\", \"password\": \"password123\", \"organizationId\": \"$ORG_ID\"}")

echo "3. Admin Test: Creating Resource..."
RES_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/resources \
  -b "$ADMIN_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin Room", "bufferTimeBefore": 15, "bufferTimeAfter": 15}')

if [ "$RES_RES" == "200" ] || [ "$RES_RES" == "201" ]; then
  echo "SUCCESS: Admin created resource (HTTP $RES_RES)"
else
  echo "FAIL: Admin could not create resource (HTTP $RES_RES)"
  kill $PID
  exit 1
fi

echo "4. Security Breach Test: Employee creating Resource..."
SEC_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/resources \
  -b "$EMP_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked Room", "bufferTimeBefore": 0, "bufferTimeAfter": 0}')

if [ "$SEC_RES" == "403" ]; then
  echo "SUCCESS: Employee blocked from creating resource (HTTP 403)"
else
  echo "FAIL: Employee breached security! (HTTP $SEC_RES)"
  kill $PID
  exit 1
fi

echo "5. Employee Test: Creating Booking..."
ADMIN_RESOURCE_RES=$(curl -s -X POST http://localhost:5000/api/resources \
  -b "$ADMIN_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"name": "Employee Room", "bufferTimeBefore": 15, "bufferTimeAfter": 15}')
RESOURCE_ID=$(echo $ADMIN_RESOURCE_RES | grep -o '"_id":"[^"]*' | head -n 1 | cut -d'"' -f4)

curl -s -X PUT http://localhost:5000/api/organizations \
  -b "$ADMIN_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"timezone": "UTC", "workingHours": {"start": "09:00", "end": "17:00", "daysOfWeek": [1,2,3,4,5,6,7]}}' > /dev/null

FIXED_DATE="2026-06-05"

BOOK_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/bookings \
  -b "$EMP_COOKIE" \
  -H "Content-Type: application/json" \
  -d "{\"resourceId\": \"$RESOURCE_ID\", \"startTime\": \"${FIXED_DATE}T12:00:00Z\", \"endTime\": \"${FIXED_DATE}T13:00:00Z\"}")

if [ "$BOOK_RES" == "200" ] || [ "$BOOK_RES" == "201" ]; then
  echo "SUCCESS: Employee created booking (HTTP $BOOK_RES)"
else
  echo "FAIL: Employee could not create booking (HTTP $BOOK_RES)"
  curl -s -X POST http://localhost:5000/api/bookings \
    -b "$EMP_COOKIE" \
    -H "Content-Type: application/json" \
    -d "{\"resourceId\": \"$RESOURCE_ID\", \"startTime\": \"${FIXED_DATE}T12:00:00Z\", \"endTime\": \"${FIXED_DATE}T13:00:00Z\"}"
  kill $PID
  exit 1
fi

echo "RBAC TESTS PASSED 100%!"
kill $PID
rm -f $ADMIN_COOKIE $EMP_COOKIE
