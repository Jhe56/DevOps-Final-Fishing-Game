#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "ERROR: DB_PASSWORD is not set."
  echo "Run: export DB_PASSWORD='your-rds-password'"
  exit 1
fi

echo "Deleting Kubernetes resources first..."
kubectl delete -f k8s/blue-green/ --ignore-not-found=true || true
kubectl delete -f k8s/ --ignore-not-found=true || true
kubectl delete configmap db-config --ignore-not-found=true || true
kubectl delete secret db-secret --ignore-not-found=true || true

echo "Waiting for AWS LoadBalancer cleanup..."
sleep 90

echo "Checking remaining services..."
kubectl get svc || true

echo "Destroying Terraform infrastructure..."
cd terraform

terraform destroy \
  -var="db_password=${DB_PASSWORD}" \
  --auto-approve

echo "Destroy complete."