local argocd = import '../argocd.libsonnet';

function(config) {
  local namespace = 'viam',
  local project = '%s-prj' % namespace,

  anubis:: function(name, tag) argocd.Application.new(
    'anubis',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/anubis-deploy',
      tag,
      'anubis',
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

  viamAuth:: function(name, tag) argocd.Application.new(
    'viam-auth',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/viam-auth',
      tag,
      'helm/viam-auth',
      [
        'values.yaml',
        'values/%s/env.yaml' % [config.environment],
        'values/%s/clients.yaml' % [config.environment],
        'values/%s/%s/region.yaml' % [config.environment, config.vg_region],
        'values/%s/%s/%s.yaml' % [config.environment, config.vg_region, config.vg_cluster],
      ],
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  kratos:: function(name, tag) argocd.Application.new(
    'ory-kratos',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/viam-ory-stack',
      tag,
      'helm/ory-kratos',
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

  kratosUI:: function(name, tag) argocd.Application.new(
    'kratos-ui',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/viam-ui-deploy',
      tag,
      'viamui',
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

  hydra:: function(name, tag) argocd.Application.new(
    'ory-hydra',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/viam-ory-stack',
      tag,
      'helm/ory-hydra',
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

  osiris:: function(name, tag) argocd.Application.new(
    'osiris',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/osiris-deploy',
      tag,
      'osiris',
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

  verifySilentAuth:: function(name, tag) argocd.Application.new(
    'verify-silent-auth',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/verify-silent-auth-deploy',
      tag,
      'verify-silent-auth',
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

  echo:: function(name, tag) argocd.Application.new(
    'echo',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/viam-ory-stack',
      tag,
      'helm/echo',
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

  hydraV2:: function(name, tag) argocd.Application.new(
    'ory-hydra-v2',
    project,
    argocd.Application.helm(
      'https://github.com/vonage-technology/viam-ory-stack',
      tag,
      'helm/ory-hydra-v2',
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

  appsMetadata:: {
    anubis: {
      factoryMethod: $.anubis,
    },
    'viam-auth': {
      factoryMethod: $.viamAuth,
    },
    'ory-kratos': {
      factoryMethod: $.kratos,
    },
    'kratos-ui': {
      factoryMethod: $.kratosUI,
    },
    'ory-hydra': {
      factoryMethod: $.hydra,
    },
    'ory-hydra-v2': {
      factoryMethod: $.hydraV2,
    },
    osiris: {
      factoryMethod: $.osiris,
    },
    'verify-silent-auth': {
      factoryMethod: $.verifySilentAuth,
    },
    echo: {
      factoryMethod: $.echo,
    },
  },
}
