{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "vmagent.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "vmagent.dns_zone" -}}
{{- default ".nexmo.vip" .Values.dns_zone  }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "vmagent.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/* define a dynamic ingress hostname */}}
{{- define "vmagent.ingressHost" -}}
{{- if .Values.ingress.enabled -}}
{{- required "Values.clusterName: A valid EKS cluster name is required!" .Values.clusterName }}
{{- required "Values.region A valid AWS region is required!" .Values.region }}

{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "vmagent.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "vmagent.labels" -}}
helm.sh/chart: {{ include "vmagent.chart" . }}
{{ include "vmagent.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "vmagent.selectorLabels" -}}
app.kubernetes.io/name: {{ include "vmagent.name" . }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "vmagent.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "vmagent.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
