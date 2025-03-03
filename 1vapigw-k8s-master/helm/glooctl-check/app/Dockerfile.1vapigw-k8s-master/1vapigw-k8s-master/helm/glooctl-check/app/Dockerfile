### glooctl-builder

FROM public.ecr.aws/bitnami/python:3.13-debian-12 AS glooctl-builder
RUN apt-get update -y
RUN curl -sL https://run.solo.io/gloo/install | sh

### glooctl check

FROM public.ecr.aws/docker/library/python:3.13.1-alpine
RUN apk --no-cache add curl jq bash
RUN pip install awscli
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/
COPY --from=glooctl-builder /root/.gloo/bin/glooctl /usr/local/bin/
RUN curl --version
RUN jq --version
RUN python --version
RUN aws --version
RUN glooctl version
RUN kubectl version --client=true

COPY . /app
WORKDIR /app

CMD ["bash", "check.sh"]
