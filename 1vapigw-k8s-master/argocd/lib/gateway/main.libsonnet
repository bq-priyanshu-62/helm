local argocd = import '../argocd.libsonnet';
local resources = [
  import 'app-root.libsonnet',
  import 'aws-system.libsonnet',
  import 'gateway-common.libsonnet',
  import 'gateway-lob-delegates.libsonnet',
  import 'gateway-services.libsonnet',
  import 'kube-system.libsonnet',
  import 'monitoring.libsonnet',
  import 'nexmo-routes.libsonnet',
  import 'vbc-routes.libsonnet',
  import 'vcc-routes.libsonnet',
  import 'vcp-routes.libsonnet',
  import 'viam.libsonnet',
];

function(config, appsGroup) {
  /**
   * Aggregate the application metadata from all apps defenitions
   */
  aggregateAppsMetadata(config, resources):: {
    local appsMetadata = std.map(function(x) x(config).appsMetadata, resources),
    local globalAppsMetadata = std.foldl(function(x, y) std.mergePatch(x, y), appsMetadata, {}),

    out: globalAppsMetadata,
  },

  /**
   * For each appsGroup attributes (app), execute the factory func that will create the appropriate argocd resources
   */
  generateArgocdApplicationsByAppsGroup(config, appsMetadata, appsGroup):: {
    local apps =
      std.mapWithKey(
        function(appName, appTag)
          appsMetadata[appName].factoryMethod(appName, appTag),
        config.gitTags[appsGroup]
      ),
    out:: [apps[x] for x in std.objectFields(apps)],
  },

  globalAppsMetadata:: $.aggregateAppsMetadata(config, resources).out,
  argocdApps:: $.generateArgocdApplicationsByAppsGroup(config, $.globalAppsMetadata, appsGroup).out,
  out:: argocd.deploy($.argocdApps).out,
}
