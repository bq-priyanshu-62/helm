local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';

function(config) {
  glooEdge:: function(name, tag) argocd.Application.new(
    name,
    '%s-gloo-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/gloo-edge',
      [
        'values/%s.yaml' % config.environment,
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
        'values/%s.yaml' % appsMetadata[name].lob,
        'values/%s-%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster, appsMetadata[name].lob],
      ],
    ),
    argocd.Application.destination(
      '%s-gloo' % appsMetadata[name].lob,
    ),
    config.environment,
    ignoreDifferences=[
      {
        group: 'gloo.solo.io',
        kind: 'Upstream',
        jsonPointers: ['/spec/healthChecks/0/interval'],
      },
      {
        group: 'apps',
        kind: 'Deployment',
        name: 'gateway-proxy',
        jsonPointers: ['/spec/replicas'],
      },
      {
        group: 'apps',
        kind: 'Deployment',
        name: 'rate-limit',
        jsonPointers: ['/spec/replicas'],
      },
    ],
    syncOptions=['SkipDryRunOnMissingResource=true', 'Validate=false'],  // `Validate=false`: temp hack, remove aftr all clusters are stable
  ) + utils._SyncWave('5'),

  glooctlCheck:: function(name, tag) argocd.Application.new(
    name,
    '%s-gloo-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/glooctl-check',
      [
        'values/%s.yaml' % [config.environment],
      ],
      {
        environment: config.environment,
        aws: {
          accountId: config.aws_account_id,
        },
        app: {
          clusterName: config.cluster_id,
          geo: config.geo,
        },
      },
    ),
    argocd.Application.destination(
      '%s-glooctl-check' % appsMetadata[name].lob,
    ),
    config.environment,
  ) + utils._SyncWave('7'),

  gaperformanceTest:: function(name, tag) argocd.Application.new(
    name,
    '%s-gloo-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/ga-performance-test',
      [
        'values/%s.yaml' % config.environment,
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
      {
        environment: config.environment,
        aws: {
          accountId: config.aws_account_id,
        },
        app: {
          clusterName: config.cluster_id,
          geo: config.geo,
        },
      },
    ),
    argocd.Application.destination(
      '%s-glooctl-check' % appsMetadata[name].lob,
    ),
    config.environment,
  ) + utils._SyncWave('7'),

  argocdWebhookFanOut:: function(name, tag) argocd.Application.new(
    name,
    '%s-gloo-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/argocd-webhook-fan-out',
      [
        'values/%s.yaml' % [config.environment],
      ],
      {
        aws: {
          accountId: config.aws_account_id,
        },
      },
    ),
    argocd.Application.destination(
      '%s-argocd-webhook-fan-out' % appsMetadata[name].lob,
    ),
    config.environment,
  ) + utils._SyncWave('7'),

  sanityService:: function(name, tag) argocd.Application.new(
    name,
    '%s-gloo-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/gw-sanity-service',
      [
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
      {
        gwSanityService: {
          clusterName: config.cluster_id,
        },
      },
    ),
    argocd.Application.destination(
      '%s-gloo' % appsMetadata[name].lob,
    ),
    config.environment,
  ) + utils._SyncWave('7'),

  certManager:: function(name, tag) argocd.Application.new(
    name,
    '%s-cert-manager-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/cert-manager',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
      {
        accountId: config.aws_account_id,
      },
    ),
    argocd.Application.destination(
      '%s-gloo' % appsMetadata[name].lob,
    ),
    config.environment,
  ) + utils._SyncWave('5'),

  certManagerCertificates:: function(name, tag) argocd.Application.new(
    name,
    '%s-cert-manager-certificates-prj' % appsMetadata[name].lob,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/cert-manager-self-signed',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
    ),
    argocd.Application.destination(
      '%s-gloo' % appsMetadata[name].lob,
    ),
    config.environment,
  ) + utils._SyncWave('7'),

  local appsMetadata = {
    'nexmo-gloo-edge': {
      factoryMethod: $.glooEdge,
      lob: 'nexmo',
    },
    'nexmo-glooctl-check': {
      factoryMethod: $.glooctlCheck,
      lob: 'nexmo',
    },
    'nexmo-ga-performance-test': {
      factoryMethod: $.gaperformanceTest,
      lob: 'nexmo',
    },
    'nexmo-argocd-webhook-fan-out': {
      factoryMethod: $.argocdWebhookFanOut,
      lob: 'nexmo',
    },
    'nexmo-sanity-service': {
      factoryMethod: $.sanityService,
      lob: 'nexmo',
    },
    'vbc-gloo-edge': {
      factoryMethod: $.glooEdge,
      lob: 'vbc',
    },
    'vbc-glooctl-check': {
      factoryMethod: $.glooctlCheck,
      lob: 'vbc',
    },
    'vbc-sanity-service': {
      factoryMethod: $.sanityService,
      lob: 'vbc',
    },
    'vcc-sanity-service': {
      factoryMethod: $.sanityService,
      lob: 'vcc',
    },
    'nexmo-cert-manager': {
      factoryMethod: $.certManager,
      lob: 'nexmo',
    },
    'nexmo-cert-manager-certificates': {
      factoryMethod: $.certManagerCertificates,
      lob: 'nexmo',
    },
  },

  appsMetadata:: appsMetadata,
}
