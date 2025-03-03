local routes = import '../../../../routes/qa/eu-central-1.jsonnet';
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
    'monitoring-apps'+: {
      yace: 'master',
      prisma: 'master',
      'kube-state-metrics': 'master',
      'fluentd-sre': 'master',
    },
    'gloo-nexmo'+: {
      identity: 'master',
      'identity-monitor': 'master',
      'nexmo-cert-manager': 'master',
      'nexmo-cert-manager-certificates': 'master',
      'nexmo-gloo-edge': 'master',
      'nexmo-glooctl-check': 'master',
      'nexmo-lob-delegates-public': 'master',
      'nexmo-sanity-service': 'master',
      'nexmo-services-ingress': 'master',
      'vcc-lob-delegates-public': 'master',
      'vcc-sanity-service': 'master',
      'nexmo-ga-performance-test': 'master',
    },
    'aws-apps'+: {
      'external-dns': 'master',
      'aws-load-balancer-controller': 'master',
    },
    'kube-system'+: {
      'aws-ebs-csi-driver': 'master',
    },
    viam: {
      anubis: 'master',
      'viam-auth': 'master',
      'ory-kratos': 'master',
      'ory-hydra': 'master',
      'kratos-ui': 'master',
      osiris: 'master',
    },
  },
};

utils._NormaliseActivePassiveRoute(cluster)
