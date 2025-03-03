local k8s = import 'k8s.libsonnet';
local utils = import 'utils.libsonnet';

local jbSourcePluginConfig = function(name, filename, appsGroup, env=null, awsRegion=null, jsonnetfile=null) {
  name: name,
  env:
    [
      { name: 'JSONNET_FILENAME', value: filename },
      { name: 'APPS_GROUP', value: appsGroup },
    ]
    + if env != null && awsRegion != null && jsonnetfile != null then [
      { name: 'ROUTE_ENV', value: env },
      { name: 'ROUTE_REGION', value: awsRegion },
      { name: 'ROUTE_JSONNETFILE', value: jsonnetfile },
    ] else [],
};

{
  _Base(kind, name, namespace):: {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: kind,
    metadata+: {
      name: name,
      namespace: namespace,
      finalizers+: [
        'resources-finalizer.argocd.argoproj.io',
      ],
    },
  },

  // todo: extend to limit resource access
  Project:: {
    new(name, namespace='argocd'):
      $._Base('AppProject', name, namespace) + utils._SyncWave('-5') {
        spec: {
          description: 'ArgoCD Project %s' % name,
          sourceRepos: [
            '*',
          ],
          clusterResourceWhitelist: [
            {
              group: '*',
              kind: '*',
            },
          ],
          destinations: [
            {
              namespace: '*',
              server: '*',
            },
          ],
        },
      },
  },

  Application:: {
    new(name, project, source, destination, environment, ignoreDifferences=null, namespace='argocd', syncOptions=null):
      $._Base('Application', name, namespace) + utils._SyncWave('-4') {
        spec: {
          project: project,
          source: source,
          destination: destination,
          syncPolicy: {
            automated: {
              prune: true,
              selfHeal: true,
            },
            [if syncOptions != null then 'syncOptions']: syncOptions,
          },
          [if ignoreDifferences != null then 'ignoreDifferences']: ignoreDifferences,
        },
      },

    source(repoURL, targetRevision, path):: {
      repoURL: repoURL,
      targetRevision: targetRevision,
      path: path,
    },

    helm(repoURL, targetRevision, path, files=[], values={}): self.source(repoURL, targetRevision, path) {
      helm: {
        [if std.length(files) > 0 then 'valueFiles']: files,
        [if std.length(values) > 0 then 'values']: std.toString(values),
      },
    },

    jbSource(repoURL, targetRevision, path, filename, appsGroup): self.source(repoURL, targetRevision, path) {
      plugin: jbSourcePluginConfig('jb', filename, appsGroup),
    },

    jbRouteSource(repoURL, targetRevision, path, filename, appsGroup, env, awsRegion, jsonnetfile): self.source(repoURL, targetRevision, path) {
      plugin: jbSourcePluginConfig(
        'jbRoute',
        filename,
        appsGroup,
        env,
        awsRegion,
        jsonnetfile=std.manifestJsonEx(jsonnetfile, '  ')
      ),
    },

    destination(namespace, server='https://kubernetes.default.svc'): {
      namespace: namespace,
      server: server,
    },

    ignoreDifferences(group, kind, jsonPointers): [{
      [if group != '' then 'group']: group,
      kind: kind,
      jsonPointers: jsonPointers,
    }],
  },

  Hook:: {
    // type of hook can be PreSync, Sync, Skip, PostSync, SyncFail
    // serviceAccount is of type k8s.IAMServiceAccount
    new(name, hookType, containers, restartPolicy, backoffLimit, hookSyncOrder, namespace='argocd', hookDeletionPolicy=null, serviceAccount=null):
      k8s.Job('hook-' + name, namespace) + utils._SyncWave(hookSyncOrder) {
        metadata+: {
          annotations+: {
            'argocd.argoproj.io/hook': hookType,
            [if hookDeletionPolicy != null then 'argocd.argoproj.io/hook-delete-policy']: hookDeletionPolicy,
          },
        },
        spec: {
          template: {
            spec: {
              containers: containers,
              restartPolicy: restartPolicy,
              [if serviceAccount != null then 'serviceAccountName' else null]: serviceAccount,
            },
          },
          backoffLimit: backoffLimit,
        },
      },

    container(name, image, commandList):
      {
        name: name,
        image: image,
        command: commandList,
      },
  },

  deploy(applications):: {
    local namespaceNames = std.set(
      std.map(function(x) x.spec.destination.namespace, applications)
    ),

    local namespaces = [
      k8s.Namespace(ns)
      for ns in namespaceNames
      if ns != 'argocd'
    ],

    local projectNames = std.set(
      std.map(function(x) x.spec.project, applications)
    ),

    local projects = [
      $.Project.new(prj)
      for prj in projectNames
      if prj != 'app-root-prj'
    ],

    // todo: can we output an array?
    out: namespaces + projects + applications,
  },
}
