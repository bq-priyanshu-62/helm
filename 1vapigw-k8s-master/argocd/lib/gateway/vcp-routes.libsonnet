local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';

function(config) {
  local lob = 'vcp',
  local project = '%s-routes-prj' % lob,
  local routeRepoUrl = 'https://github.com/Vonage/1vapigw-routes.git',

  routeApp:: function(name, tag) argocd.Application.new(
    '%s-rt' % name,
    project,
    argocd.Application.jbRouteSource(
      routeRepoUrl,
      if std.type(tag) == 'object' then tag.revision else tag,
      'routes/%s' % name,
      'manifest.jsonnet',
      appsGroup=name,
      env=config.environment,
      awsRegion=config.region,
      jsonnetfile=if std.type(tag) == 'object' then utils._Jsonnetfile([
        { repoUrl: routeRepoUrl, subdir: 'lib', version: tag.routeLibVersion },
        { repoUrl: routeRepoUrl, subdir: 'routes', version: tag.revision },
      ]) else ''
    ),
    argocd.Application.destination(name),
    config.environment,
    syncOptions=if std.objectHas(appsMetadata[name], 'syncOptions') then appsMetadata[name].syncOptions else null,
  ) + utils._SyncWave('10'),

  local appsMetadata = {
    'vcp-bus-station': {
      factoryMethod: $.routeApp,
    },
    'vcp-chat-api': {
      factoryMethod: $.routeApp,
    },
    'vcp-chat-api-test': {
      factoryMethod: $.routeApp,
    },
    'vcp-chat-media': {
      factoryMethod: $.routeApp,
    },
    'vcp-chat-guest-api': {
      factoryMethod: $.routeApp,
    },
    'vcp-chat-widget-api': {
      factoryMethod: $.routeApp,
    },
    'vcp-jobs': {
      factoryMethod: $.routeApp,
    },
    'vcp-lists': {
      factoryMethod: $.routeApp,
    },
    'vcp-meetings-api': {
      factoryMethod: $.routeApp,
    },
    'vcp-meetings-api-external': {
      factoryMethod: $.routeApp,
    },
    'vcp-whiteboard-api': {
      factoryMethod: $.routeApp,
    },
    'vcp-boost': {
      factoryMethod: $.routeApp,
    },
    'vcp-camara-oauth': {
      factoryMethod: $.routeApp,
    },
    'vcp-camara-api': {
      factoryMethod: $.routeApp,
    },
    'vcp-dt-5g-slice': {
      factoryMethod: $.routeApp,
    },
    'vcp-silent-auth': {
      factoryMethod: $.routeApp,
    },
    'vcp-network-api-reg': {
      factoryMethod: $.routeApp,
    },
    'vcp-shared-emails': {
      factoryMethod: $.routeApp,
    },
    'vcp-number-insight': {
      factoryMethod: $.routeApp,
    },
  },

  appsMetadata:: appsMetadata,
}
