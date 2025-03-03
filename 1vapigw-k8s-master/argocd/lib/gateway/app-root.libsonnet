local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';

function(config) {
  local namespace = 'argocd',
  local project = 'app-root-prj',
  local filePath = 'argocd/environments/%s/%s/%s' % [config.environment, config.region, config.cluster_id],

  appRoot:: function(name, tag) argocd.Application.new(
    name,
    project,
    argocd.Application.jbSource(
      'https://github.com/vonage/1vapigw-k8s',
      tag,
      path=filePath,
      filename=appsMetadata[name].file,
      appsGroup=name,
    ),
    argocd.Application.destination(
      namespace
    ),
    config.environment,
  ),

  local appsMetadata = {
    'aws-apps': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'monitoring-apps': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'gloo-nexmo': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'gloo-nexmo-routes': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'gloo-vbc': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'gloo-vbc-routes': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'gloo-vcc-routes': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'gloo-vcp-routes': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    'kube-system': {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
    viam: {
      factoryMethod: $.appRoot,
      file: 'main.jsonnet',
    },
  },

  appsMetadata:: appsMetadata,
}
