# Ensure the server is running (grunt dev)
# Get a token
echo "Getting a token"
ORANGE_TOKEN=$(curl -H "Content-Type: application/json" -H "X-Client-Secret: testsecret" -X POST -d '{"email":"foo1@bar.com","password":"password"}' http://localhost:3000/v1/auth/token | jq ".access_token")
ORANGE_TOKEN="${ORANGE_TOKEN%\"}"
ORANGE_TOKEN="${ORANGE_TOKEN#\"}"

echo "Load testing: 20,000 requests"
# Submit requests for medications
loadtest -n 20000 -c 5 -H X-Client-Secret:testsecret -H Authorization:"Bearer $ORANGE_TOKEN" http://localhost:3000/v1/patients/1/medications

# Submit requests for doses
loadtest -n 20000 -c 5 -H X-Client-Secret:testsecret -H Authorization:"Bearer $ORANGE_TOKEN" http://localhost:3000/v1/patients/1/doses

echo "Concurrency testing"
# Stats on concurrent connections v. API response time
CON_LEVEL=1

while [ $CON_LEVEL -le 51 ]
do
    MODE=$(loadtest -n 2000 -c $CON_LEVEL -H X-Client-Secret:testsecret -H Authorization:"Bearer $ORANGE_TOKEN" http://localhost:3000/v1/patients/1/medications | grep "50%" | awk '{print $(NF-1)}')
    echo "Mode response time for concurrency $CON_LEVEL: $MODE ms"
    CON_LEVEL=`expr $CON_LEVEL + 5`
done


