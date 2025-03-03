local argocd = import '../argocd.libsonnet';

function(config) {
  local namespace = 'kube-system',
  local project = '%s-prj' % namespace,

  metricsServer:: function(name, tag) argocd.Application.new(
    'metrics-server',
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/metrics-server',
      [
        'values.yaml',
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

  awsebscsiDriver:: function(name, tag) argocd.Application.new(
    'aws-ebs-csi-driver',
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/aws-ebs-csi-driver',
      [
        'values.yaml',
        'values/%s.yaml' % [config.environment],
        'values/%s-%s.yaml' % [config.environment, config.geo],
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

  clusterAutoscaler:: function(name, tag) argocd.Application.new(
    'cluster-autoscaler',
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/cluster-autoscaler',
      [
        'values.yaml',
        'values/%s.yaml' % [config.environment],
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
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


  serviceAccount:: function(name, tag) argocd.Application.new(
    'service-account',
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/service-account',
      [
        'values.yaml',
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),


  appsMetadata:: {
    'metrics-server': {
      factoryMethod: $.metricsServer,
    },
    'service-account': {
      factoryMethod: $.serviceAccount,
    },
    'cluster-autoscaler': {
      factoryMethod: $.clusterAutoscaler,
    },

    'aws-ebs-csi-driver': {
      factoryMethod: $.awsebscsiDriver,
    },
  },
}
