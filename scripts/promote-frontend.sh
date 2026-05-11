#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"

if [ "$TARGET" != "blue" ] && [ "$TARGET" != "green" ]; then
  echo "Usage: ./scripts/promote-frontend.sh blue|green"
  exit 1
fi

echo "Promoting frontend traffic to $TARGET..."

kubectl patch service frontend \
  -p "{\"spec\":{\"selector\":{\"app\":\"frontend\",\"version\":\"$TARGET\"}}}"

kubectl get svc frontend
kubectl get endpoints frontend

echo "Frontend now points to $TARGET."