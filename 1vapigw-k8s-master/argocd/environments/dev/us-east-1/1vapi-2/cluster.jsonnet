local routes = import '../../../../routes/dev/us-east-1.jsonnet';
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
      'gloo-vcp-routes': 'master',
      'kube-system': 'master',
      'monitoring-apps': 'master',
      viam: 'master',
    },
    'aws-apps'+: {
      'external-dns': 'master',
      'aws-load-balancer-controller': 'master',
    },
    'monitoring-apps'+: {
      yace: 'master',
      'kube-state-metrics': 'master',
      prisma: 'master',
      fluentbit: 'APIGW-2116-update-fluentbit',
      'victoria-metrics-single-server': 'master',
      'custom-metrics-server': 'master',
      'fluentd-sre': 'master',
    },
    'kube-system'+: {
      'metrics-server': 'master',
      'cluster-autoscaler': 'master',
      'aws-ebs-csi-driver': 'master',
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
      'nexmo-ga-performance-test': 'master',
    },
    viam: {
      anubis: 'master',
      'viam-auth': 'master',
    },
  },
};

utils._NormaliseActivePassiveRoute(cluster)
