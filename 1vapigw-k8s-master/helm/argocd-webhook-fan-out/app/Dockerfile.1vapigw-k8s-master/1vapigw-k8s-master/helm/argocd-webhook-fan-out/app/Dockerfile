FROM public.ecr.aws/docker/library/node:23.5.0-alpine AS build-env
RUN addgroup -S argocd && adduser -S -G argocd argocd
COPY . /app
WORKDIR /app

RUN npm ci --only=production

FROM debian:stable-slim AS intermediate
RUN addgroup --system argocd && adduser --system --ingroup argocd argocd
COPY --from=build-env /app /app
RUN chown -R argocd:argocd /app

FROM gcr.io/distroless/nodejs22-debian12
COPY --from=intermediate /etc/passwd /etc/passwd
COPY --from=intermediate /etc/group /etc/group
COPY --from=intermediate /app /app
WORKDIR /app
USER argocd
ENV DOCKER=true
EXPOSE 3000
CMD ["index.js"]
