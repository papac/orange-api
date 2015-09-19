# Ensure the server is running (grunt dev)
# Get a token
ORANGE_TOKEN=$(curl -H "Content-Type: application/json" -H "X-Client-Secret: testsecret" -X POST -d '{"email":"foo1@bar.com","password":"password"}' http://localhost:3000/v1/auth/token | jq ".access_token")
ORANGE_TOKEN="${ORANGE_TOKEN%\"}"
ORANGE_TOKEN="${ORANGE_TOKEN#\"}"

# Submit requests for medications
loadtest -n 20000 -c 5 -H X-Client-Secret:testsecret -H Authorization:"Bearer $ORANGE_TOKEN" http://localhost:3000/v1/patients/1/medications

# Submit requests for doses
loadtest -n 20000 -c 5 -H X-Client-Secret:testsecret -H Authorization:"Bearer $ORANGE_TOKEN" http://localhost:3000/v1/patients/1/doses