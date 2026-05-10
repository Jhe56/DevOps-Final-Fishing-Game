#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="us-east-1"
CLUSTER_NAME="fishing-game-eks"
K8S_DIR="../k8s"

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "ERROR: DB_PASSWORD is not set."
  echo "Run: export DB_PASSWORD='your-rds-password'"
  exit 1
fi

echo "Applying Terraform..."
cd terraform
terraform init
terraform apply -var="db_password=${DB_PASSWORD}" --auto-approve

echo "Updating kubeconfig..."
aws eks update-kubeconfig \
  --region "$AWS_REGION" \
  --name "$CLUSTER_NAME"

echo "Getting RDS endpoint..."
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

echo "Creating/updating db-secret..."
kubectl create secret generic db-secret \
  --from-literal=password="${DB_PASSWORD}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Creating/updating db-config..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
data:
  DB_HOST: "${RDS_ENDPOINT}"
  DB_PORT: "3306"
  DB_USER: "fishadmin"
  DB_NAME: "fishing_game"
EOF

echo "Running schema job..."
kubectl delete job db-schema-job --ignore-not-found
kubectl delete configmap db-schema --ignore-not-found
kubectl apply -f "$K8S_DIR/db-schema-job.yaml"

echo "Waiting for schema job..."
kubectl wait --for=condition=complete job/db-schema-job --timeout=120s

echo "Deploying app manifests..."
kubectl apply -f "$K8S_DIR/"

echo "Current pods:"
kubectl get pods

echo "Current services:"
kubectl get svc

echo "Deploy complete."