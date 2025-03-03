// based on https://github.com/bitnami-labs/kube-libsonnet/blob/master/kube.libsonnet
local utils = import 'utils.libsonnet';

{
  _Base(kind, name):: {
    apiVersion: 'v1',
    kind: kind,
    metadata: {
      name: name,
    },
  },

  Namespace(name):
    $._Base('Namespace', name) + utils._SyncWave('-3'),

  Job(name, namespace):
    $._Base('Job', name) + {
      apiVersion: 'batch/v1',
      metadata+: {
        namespace: namespace,
      },
    },

  IAMServiceAccount(name, namespace, syncWaveOrder, annotationList):
    $._Base('ServiceAccount', name) + utils._SyncWave(syncWaveOrder) + utils._AppendAnnotations(annotationList).out + {
      metadata+: {
        namespace: namespace,
      },
    },
}
