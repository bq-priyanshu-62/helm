local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';

function(config) {
  local namespace = 'monitoring',
  local project = '%s-prj' % namespace,

  fluentd_sre:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/fluentd',
      values={
        fluentd:
          {
            team: config.team,
            aws_account_id: config.aws_account_id,
            cluster_id: config.cluster_id,

            logging: {
              url: config.logging.url,
              awsRegion: config.region,
            },
          },
      },
      files=[
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  fluentbit:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/fluentbit',
      values={
        'fluentbit-cl-cm-chart':
          {
            team: config.team,
            aws_account_id: config.aws_account_id,
            aws_region: config.region,
            cluster_id: config.cluster_id,
            logging_region_viam: config.logging.logRegionViam,
            logging_region_1v: config.logging.logRegion1v,
          },
        'fluent-bit':
          {
            serviceAccount: {
              annotations: {
                'eks.amazonaws.com/role-arn': 'arn:aws:iam::%s:role/%s-fluentbit-api-role' % [config.aws_account_id, config.geo],
              },
            },
          },
      },
      files=[
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  yace:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/yace',
      [
        'values.yaml',
        'values/%s.yaml' % [config.environment],
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
      ],
      values={
        podLabels: {
          account: config.account,
          aws_account_id: config.aws_account_id,
          region: config.region,
          cluster_id: config.cluster_id,
        },
        region: config.region,
        eks_cluster_name: config.cluster_id,
        accountId: config.aws_account_id,
      },
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  prisma:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/twistlock-defender',
      [
        'values.yaml',
        'values/%s/%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  vmagent:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/vmagent',
      [
        'values.yaml',
        'values/%s/env.yaml' % [config.environment],
        'values/%s/%s/region.yaml' % [config.environment, config.vg_region],
        'values/%s/%s/%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  vmagent_pet:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/vmagent-pet',
      [
        'values.yaml',
        'values/%s/env.yaml' % [config.environment],
        'values/%s/%s/region.yaml' % [config.environment, config.vg_region],
        'values/%s/%s/%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  kube_state_metrics:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/kube-state-metrics',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
      {
        accountId: config.aws_account_id,
      },
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  victoria_metrics_single_server:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/victoria-metrics-single-server',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
      {
        accountId: config.aws_account_id,
      },
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  custom_metrics_server:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/custom-metrics-server',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
      {
        accountId: config.aws_account_id,
      },
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  testkube:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/testkube',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
      {
        accountId: config.aws_account_id,
      },
    ),
    argocd.Application.destination(
      'testkube'
    ),
    config.environment,
  ) + utils._SyncWave('5'),

  gwTests:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/gw-tests',
      [
        'values.yaml',
        'values/%s.yaml' % config.environment,
      ],
    ),
    argocd.Application.destination(
      'testkube'
    ),
    config.environment,
  ) + utils._SyncWave('7'),

  falcon_sensor:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/falcon-sensor',
      [
        'values.yaml',
        'values/%s.yaml' % [config.environment],
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  appsMetadata:: {
    'fluentd-sre': {
      factoryMethod: $.fluentd_sre,
    },
    fluentbit: {
      factoryMethod: $.fluentbit,
    },
    yace: {
      factoryMethod: $.yace,
    },
    'victoria-metrics-single-server': {
      factoryMethod: $.victoria_metrics_single_server,
    },
    prisma: {
      factoryMethod: $.prisma,
    },
    vmagent: {
      factoryMethod: $.vmagent,
    },
    'vmagent-pet': {
      factoryMethod: $.vmagent_pet,
    },
    'kube-state-metrics': {
      factoryMethod: $.kube_state_metrics,
    },
    'custom-metrics-server': {
      factoryMethod: $.custom_metrics_server,
    },
    testkube: {
      factoryMethod: $.testkube,
    },
    'falcon-sensor': {
      factoryMethod: $.falcon_sensor,
    },
    'gw-tests': {
      factoryMethod: $.gwTests,
    },
  },
}
