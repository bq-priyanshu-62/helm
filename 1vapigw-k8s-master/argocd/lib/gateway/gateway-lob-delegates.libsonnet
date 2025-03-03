local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';
local gatewayCommon = import 'gateway-common.libsonnet';

function(config) {
  lobDelegatesAPIPublic:: function(name, tag) argocd.Application.new(
    name,
    'nexmo-gloo-prj',
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/lobs-delegate-vs/api/default-delegate-vs',
      [
        'values/nexmo.yaml',
        'values/%s.yaml' % config.environment,
        'values/%s-%s-%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
        'values/%s-%s-public.yaml' % [config.environment, config.vg_region],
      ],
    ),
    argocd.Application.destination(
      'nexmo-gloo'
    ),
    config.environment,
  ) + utils._SyncWave('6'),

  lobDelegatesUCPublic:: function(name, tag) argocd.Application.new(
    name,
    'vbc-gloo-prj',
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/lobs-delegate-vs/uc/default-delegate-vs',
      [
        'values/%s.yaml' % config.environment,
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
      ],
    ),
    argocd.Application.destination(
      'vbc-gloo'
    ),
    config.environment,
  ) + utils._SyncWave('6'),

  lobDelegatesCCPublic:: function(name, tag) argocd.Application.new(
    name,
    'vcc-gloo-prj',
    argocd.Application.helm(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      'helm/lobs-delegate-vs/cc/default-delegate-vs',
      [
        'values/%s.yaml' % config.environment,
        'values/%s-%s.yaml' % [config.environment, config.vg_region],
      ],
    ),
    argocd.Application.destination(
      'nexmo-gloo'
    ),
    config.environment,
  ) + utils._SyncWave('6'),

  appsMetadata:: {
    'nexmo-lob-delegates-public': {
      factoryMethod: $.lobDelegatesAPIPublic,
    },
    'vbc-lob-delegates-public': {
      factoryMethod: $.lobDelegatesUCPublic,
    },
    'vcc-lob-delegates-public': {
      factoryMethod: $.lobDelegatesCCPublic,
    },
  },
}
