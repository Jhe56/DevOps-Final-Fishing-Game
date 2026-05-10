#!/usr/bin/env bash
set -euo pipefail

URL=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$URL" ]; then
  echo "No LoadBalancer URL found"
  exit 1
fi

echo "Testing http://$URL"

curl -f "http://$URL" > /dev/null

if curl -f "http://$URL/api/auth/health" >> smoke.log 2>&1; then
  echo "Auth smoke test passed" >> smoke.log
else
  echo "Auth smoke test failed" >> smoke.log
  cat smoke.log
  exit 1
fi

if curl -f "http://$URL/api/gameplay/health" >> smoke.log 2>&1; then
  echo "Gameplay smoke test passed" >> smoke.log
else
  echo "Gameplay smoke test failed" >> smoke.log
  cat smoke.log
  exit 1
fi

if curl -f "http://$URL/api/profile/health" >> smoke.log 2>&1; then
  echo "Profile smoke test passed" >> smoke.log
else
  echo "Profile smoke test failed" >> smoke.log
  cat smoke.log
  exit 1
fi

echo "Smoke test passed"