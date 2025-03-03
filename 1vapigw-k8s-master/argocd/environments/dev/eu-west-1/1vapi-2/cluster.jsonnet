local routes = import '../../../../routes/dev/eu-west-1.jsonnet';
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
    'monitoring-apps'+: {
      prisma: 'master',
      vmagent: 'master',
      'vmagent-pet': 'master',
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
      'vcc-lob-delegates-public': $.gitTags['gloo-nexmo']['nexmo-lob-delegates-public'],
      'vcc-sanity-service': $.gitTags['gloo-nexmo']['nexmo-sanity-service'],
      'nexmo-ga-performance-test': 'master',
    },
    'kube-system'+: {
      'aws-ebs-csi-driver': 'master',
      'service-account': 'master',
    },
    'aws-apps'+: {
      'external-dns': 'master',
    },
    viam: {
      anubis: 'master',
      'viam-auth': 'master',
      'ory-kratos': 'master',
      'ory-hydra': 'master',
      'kratos-ui': 'master',
      osiris: 'master',
      echo: 'master',
      'ory-hydra-v2': 'master',
    },
  },
};

utils._NormaliseActivePassiveRoute(cluster)
