local argocd = import '../argocd.libsonnet';

function(config) {
  local namespace = 'aws-system',
  local project = '%s-prj' % namespace,

  externalDns:: function(name, tag) argocd.Application.new(
    'external-dns',
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/external-dns',
      values={
        'external-dns': {
          podLabels: {
            account: config.account,
            aws_account_id: config.aws_account_id,
            cluster_id: config.cluster_id,
          },
          serviceAccount: {
            annotations: {
              'eks.amazonaws.com/role-arn': 'arn:aws:iam::%s:role/api/application-%s-%s-k8s-external-dns' % [config.aws_account_id, config.region, config.cluster_id],
            },
          },
          domainFilters: config.domain_filters,
          txtOwnerId: '%s-%s-%s' % [config.account, config.region, config.cluster_id],
          accountId: config.aws_account_id,
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

  albController:: function(name, tag) argocd.Application.new(
    'aws-load-balancer-controller',
    project,
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/aws-load-balancer-controller',
      values={
        'aws-load-balancer-controller': {
          podLabels: {
            account: config.account,
            aws_account_id: config.aws_account_id,
            cluster_id: config.cluster_id,
          },
          accountId: config.aws_account_id,
          clusterName: config.cluster_id,
          serviceAccount: {
            annotations: {
              'eks.amazonaws.com/role-arn': 'arn:aws:iam::%s:role/api/application-%s-%s-k8s-alb-ingress-controller' % [config.aws_account_id, config.region, config.cluster_id],
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

  appsMetadata:: {
    'external-dns': {
      factoryMethod: $.externalDns,
    },
    'aws-load-balancer-controller': {
      factoryMethod: $.albController,
    },
  },
}
