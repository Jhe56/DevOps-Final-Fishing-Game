#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="monitoring"
RELEASE="monitoring"

echo "Adding/updating Prometheus Helm repo..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo update

echo "Creating monitoring namespace..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "Installing/upgrading kube-prometheus-stack..."
helm upgrade --install "$RELEASE" prometheus-community/kube-prometheus-stack \
  --namespace "$NAMESPACE" \
  --timeout 10m \
  --wait

echo "Monitoring pods:"
kubectl get pods -n "$NAMESPACE"

echo "Monitoring services:"
kubectl get svc -n "$NAMESPACE"

echo "To access Grafana:"
echo "kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80"
echo "Then open: http://localhost:3000"
echo "Default login is usually: admin / prom-operator"