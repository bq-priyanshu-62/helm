local _getClusterType(clusterJson) = if clusterJson.cluster_id == '1vapi-1' then 'active' else 'passive';
local _mapActiveOrPassive(clusterJson, routes) = std.mapWithKey(function(k, v) v[_getClusterType(clusterJson)], clusterJson.gitTags[routes]);

{
  _SyncWave(order):: {
    metadata+: {
      annotations+: {
        'argocd.argoproj.io/sync-wave': order,
      },
    },
  },
  _AppendAnnotation(annotation):: {
    metadata+: {
      annotations+: {
        [annotation.key]: annotation.value,
      },
    },
  },
  _AppendAnnotations(annotationList):: {
    local annotations = std.foldl(function(x, y) x + $._AppendAnnotation(y), annotationList, {}),
    out: annotations,
  },
  _Jsonnetfile(dependencieConfigs):: {
    version: 1,
    dependencies: [
      {
        source: {
          git: {
            remote: config.repoUrl,
            subdir: config.subdir,
          },
        },
        version: config.version,
      }
      for config in dependencieConfigs
    ],
    legacyImports: true,
  },
  _RouteConfig(revision='master',
               routeLibVersion='master',
               activeRevision=revision,
               activeRouteLibVersion=routeLibVersion,
               passiveRevision=revision,
               passiveRouteLibVersion=routeLibVersion,):: {
    active: {
      revision: activeRevision,
      routeLibVersion: activeRouteLibVersion,
    },
    passive: {
      revision: passiveRevision,
      routeLibVersion: passiveRouteLibVersion,
    },
  },
  _NormaliseActivePassiveRoute(clusterJson):: clusterJson {
    gitTags+: {
      [if 'gloo-nexmo-routes' in clusterJson.gitTags then 'gloo-nexmo-routes']: _mapActiveOrPassive(clusterJson, 'gloo-nexmo-routes'),
      [if 'gloo-vbc-routes' in clusterJson.gitTags then 'gloo-vbc-routes']: _mapActiveOrPassive(clusterJson, 'gloo-vbc-routes'),
      [if 'gloo-vcc-routes' in clusterJson.gitTags then 'gloo-vcc-routes']: _mapActiveOrPassive(clusterJson, 'gloo-vcc-routes'),
      [if 'gloo-vcp-routes' in clusterJson.gitTags then 'gloo-vcp-routes']: _mapActiveOrPassive(clusterJson, 'gloo-vcp-routes'),
    },
  },
}
