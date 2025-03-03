local routes = import '../../../../routes/prod/ap-southeast-3.jsonnet';
local region = import '../region.jsonnet';
local utils = import 'lib/utils.libsonnet';

local cluster = routes + region {
  vg_cluster: 'c2',
  cluster_id: '1vapi-2',
  gitTags+: {
    'root-apps'+: {
      'aws-apps': 'master',
      'gloo-nexmo': 'master',
      'gloo-nexmo-routes': 'master',
      'gloo-vcc-routes': 'master',
      'gloo-vcp-routes': 'master',
      'kube-system': 'master',
      'monitoring-apps': 'master',
      viam: 'master',
    },
    'aws-apps'+: {
      'external-dns': 'argocd-env-v2025.01.20.0640',
      'aws-load-balancer-controller': 'argocd-env-v2025.01.09.0738',
    },
    'kube-system'+: {
      'metrics-server': 'argocd-env-v2024.10.24.1239',
      'cluster-autoscaler': 'argocd-env-v2025.01.10.0926',
      'aws-ebs-csi-driver': 'argocd-env-v2024.09.26.1331',
      'service-account': 'argocd-env-v2024.05.24.0656',
    },
    'gloo-nexmo'+: {
      // nexmo
      identity: 'argocd-env-v2025.02.14.1336',
      'identity-monitor': 'argocd-env-v2025.01.30.0936',
      'nexmo-cert-manager': 'argocd-env-v2025.01.10.0643',
      'nexmo-cert-manager-certificates': 'cert-manager-v1.0.1',
      'nexmo-services-ingress': 'argocd-env-v2023.09.14.1228',
      'nexmo-glooctl-check': 'argocd-env-v2025.01.15.0723',
      'nexmo-gloo-edge': 'argocd-env-v2025.01.31.0741',
      'nexmo-sanity-service': 'argocd-env-v2025.01.31.1217',
      'nexmo-lob-delegates-public': 'argocd-env-v2025.02.24.0907',
      'nexmo-ga-performance-test': 'argocd-env-v2025.01.15.1215',
    },
    'gloo-nexmo-routes'+: {
    },
    'monitoring-apps'+: {
      'kube-state-metrics': 'argocd-env-v2025.01.17.0619',
      'fluentd-sre': 'argocd-env-v2024.07.25.0625',
      fluentbit: 'argocd-env-v2024.09.04.0640',
      vmagent: 'argocd-env-v2025.01.16.0619',
      'vmagent-pet': 'argocd-env-v2025.20.02.0541',
      prisma: 'argocd-env-v2025.01.28.0600',
      yace: 'argocd-env-v2024.12.06.0615',
      'custom-metrics-server': 'argocd-env-v2024.10.29.0600',
      'victoria-metrics-single-server': 'argocd-env-v2025.01.20.0748',
      'falcon-sensor': 'argocd-env-v2024.09.12.0903',
    },
  },
};

utils._NormaliseActivePassiveRoute(cluster)
