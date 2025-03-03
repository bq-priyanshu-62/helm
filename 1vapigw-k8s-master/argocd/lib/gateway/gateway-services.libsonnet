local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';
local gatewayCommon = import 'gateway-common.libsonnet';

function(config, lob='nexmo') {
  local namespace = '%s-gloo' % lob,
  local project = '%s-prj' % namespace,
  local servicesNamespace = 'nexmo-gateway-services',
  local env = config.environment,

  identity:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/Vonage/1vapigw-k8s.git',
      tag,
      'helm/identity',
      [
        'values/%s-%s.yaml' % [env, config.vg_region],
        'values/%s-%s-%s.yaml' % [env, config.vg_region, config.vg_cluster],
      ],
      {
        teamTag: config.team,
        accountName: config.account,
        accountId: config.aws_account_id,
        region: config.region,
        clusterName: config.cluster_id,
      },
    ),
    argocd.Application.destination(
      servicesNamespace
    ),
    config.environment,
  ) + utils._SyncWave('2'),
  identityMonitor:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/Vonage/1vapigw-k8s.git',
      tag,
      'helm/identity-config-monitor',
      [
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
      {
        teamTag: config.team,
        accountName: config.account,
        accountId: config.aws_account_id,
        region: config.region,
        clusterName: config.cluster_id,
      },
    ),
    argocd.Application.destination(
      servicesNamespace
    ),
    config.environment,
  ) + utils._SyncWave('2'),

  throttling:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/nexmoinc/k8s-scripts',
      tag,
      'helm/services/throttling',
      [
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
      ],
      {
        teamTag: config.team,
        accountName: config.account,
        accountId: config.aws_account_id,
        region: config.region,
        clusterName: config.cluster_id,

        throttling: {
          nexmoAuthHost: 'identity-%s-%s.%s' % [config.vg_region, config.vg_cluster, config.env_domain],
          serviceAccountAwsRoleArn: 'arn:aws:iam::%s:role/api/application-%s-%s-k8s-api-throttling' % [config.aws_account_id, config.region, config.cluster_id],
        },
      },
    ),
    argocd.Application.destination(
      servicesNamespace
    ),
    config.environment,
    argocd.Application.ignoreDifferences('', 'ServiceAccount', ['/imagePullSecrets', '/secrets']),
  ) + utils._SyncWave('2'),

  servicesIngress:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/alb-ingress',
      [
        'values/%s.yaml' % lob,
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, lob],
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
      {
        environment: config.environment,
        accountId: config.aws_account_id,
        region: config.region,
      },
    ),
    argocd.Application.destination(
      servicesNamespace
    ),
    config.environment,
  ) + utils._SyncWave('3'),

  appsMetadata:: {
    identity: {
      factoryMethod: $.identity,
    },
    throttling: {
      factoryMethod: $.throttling,
    },
    'nexmo-services-ingress': {
      factoryMethod: $.servicesIngress,
    },
    'identity-monitor': {
      factoryMethod: $.identityMonitor,
    },
  },
}
