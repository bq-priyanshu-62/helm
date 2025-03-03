local routes = import '../../../../routes/prod/ap-southeast-1.jsonnet';
local region = import '../region.jsonnet';
local utils = import 'lib/utils.libsonnet';

local cluster = routes + region {
  vg_cluster: 'c1',
  cluster_id: '1vapi-1',
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
    'gloo-nexmo'+: {
      // nexmo
      identity: 'argocd-env-v2025.02.14.1336',
      'identity-monitor': 'argocd-env-v2025.01.30.0936',
      'nexmo-cert-manager-certificates': 'cert-manager-v1.0.1',
      'nexmo-services-ingress': 'argocd-env-v2024.12.11.1109',
      'nexmo-gloo-edge': 'argocd-env-v2025.01.31.0741',
      'nexmo-glooctl-check': 'argocd-env-v2025.01.15.0723',
      'nexmo-sanity-service': 'argocd-env-v2025.01.31.1217',
      'nexmo-lob-delegates-public': 'argocd-env-v2025.02.24.0907',
      // vcc
      'vcc-lob-delegates-public': self['nexmo-lob-delegates-public'],
      'vcc-sanity-service': self['nexmo-sanity-service'],
    },
    'monitoring-apps'+: {
      'vmagent-pet': 'argocd-env-v2025.20.02.0541',
    },
  },
};

utils._NormaliseActivePassiveRoute(cluster)
