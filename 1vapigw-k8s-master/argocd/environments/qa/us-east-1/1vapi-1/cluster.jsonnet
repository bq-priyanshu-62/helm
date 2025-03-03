local routes = import '../../../../routes/qa/us-east-1.jsonnet';
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
      'gloo-vbc': 'master',
      'gloo-vbc-routes': 'master',
      'gloo-vcc-routes': 'master',
      'gloo-vcp-routes': 'master',
      'kube-system': 'master',
      'monitoring-apps': 'master',
      viam: 'master',
    },
    'aws-apps'+: {
      'external-dns': 'master',
      'aws-load-balancer-controller': 'master',
    },
    'gloo-nexmo'+: {
      identity: 'master',
      'identity-monitor': 'master',
      'nexmo-cert-manager': 'master',
      'nexmo-cert-manager-certificates': 'master',
      'nexmo-gloo-edge': 'master',
      'nexmo-glooctl-check': 'master',
      'nexmo-lob-delegates-public': 'OM-9310-4',
      'nexmo-sanity-service': 'master',
      'nexmo-services-ingress': 'master',
      'nexmo-ga-performance-test': 'master',
    },
    'gloo-vbc'+: {
      'vbc-lob-delegates-public': $.gitTags['gloo-nexmo']['nexmo-lob-delegates-public'],
    },
    viam: {
      anubis: 'master',
      'viam-auth': 'master',
    },
    'kube-system'+: {
      'aws-ebs-csi-driver': 'master',
    },
  },
};

utils._NormaliseActivePassiveRoute(cluster)
