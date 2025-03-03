local argocd = import '../argocd.libsonnet';
local utils = import '../utils.libsonnet';

function(config) {
  local lob = 'vcc',
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
    'vcc-ms-teams-adapter': {
      factoryMethod: $.routeApp,
    },
  },

  appsMetadata:: appsMetadata,
}
