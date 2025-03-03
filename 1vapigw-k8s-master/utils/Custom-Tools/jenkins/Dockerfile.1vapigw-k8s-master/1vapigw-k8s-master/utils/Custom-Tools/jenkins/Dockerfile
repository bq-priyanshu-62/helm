ARG JENKINS_VERSION="2.462.3-lts"
FROM jenkins/jenkins:${JENKINS_VERSION}

ARG KUBERNETES_VERSION="1.31.1"
ARG HELM_VERSION="v3.16.2"
ENV NVM_VERSION v0.40.1
ENV NODE_VERSION 22.10.0
ENV SONAR_SCANNER_VERSION=6.2.1.4610

# install tools
USER root

# Install base dependencies
RUN apt update \
&& apt install -y \
alien \
build-essential \
bzip2 \
ca-certificates \
curl \
debhelper \
devscripts \
dpkg \
fakeroot \
gawk \
gettext-base \
gh \
git \
groff \
gnupg2 \
jq \
less \
libffi-dev \
libltdl7 \
libssl-dev \
libxml2-utils \
lsb-release \
make \
openssl \
parallel \
perl \
pkg-config \
python3 \
python3-all-dev \
python3-boto3 \
python3-kubernetes \
python3-pip \
python3-venv \
rsync \
rubygems \
sendemail \
software-properties-common \
ssh \
ssl-cert \
sudo \
time \
tree \
unzip \
vim \
wget \
xmldiff \
xmlindent \
zip \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/tools

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install

# Install extra dependencies
RUN gem install hiera-eyaml \
&& pip3 install --ignore-installed --break-system-packages --upgrade pip \
&& pip install --upgrade --break-system-packages \
pipenv \
jsonschema \
schemathesis

# Additional repos
RUN lsb_release -a \
&& curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - \
&& add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"

# Docker and friends
RUN apt update \
&& apt install -y \
docker-ce \
docker-ce-cli \
docker-ce-rootless-extras \
docker-compose \
docker-scan-plugin \
python3-docker \
python3-dockerpty \
&& rm -rf /var/lib/apt/lists/* \
&& usermod -a -G docker jenkins

# Nexmo LDAP
COPY foreman.crt /etc/ssl/certs/java/
RUN ls $JAVA_HOME/lib && update-ca-certificates -f \
&& keytool -import -alias nexmo_ldap -file /etc/ssl/certs/java/foreman.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -noprompt

# Install kubectl with the specified version
#URL for kuberctl latest version: https://kubernetes.io/releases/

RUN curl -LO "https://dl.k8s.io/release/v${KUBERNETES_VERSION}/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    kubectl version --client

# Install Helm with the specified version
#URL for Helm latest version: https://github.com/helm/helm/releases
ENV FILENAME helm-${HELM_VERSION}-linux-amd64.tar.gz
ENV HELM_URL https://get.helm.sh/${FILENAME}
RUN echo $HELM_URL
RUN curl -o /tmp/$FILENAME ${HELM_URL} \
  && tar -zxvf /tmp/${FILENAME} -C /tmp \
  && mv /tmp/linux-amd64/helm /bin/helm \
 # && rm -rf /tmp \
  && helm version --short

# Install Node.js with the specified version
# URL for Latest Version: https://github.com/nvm-sh/nvm
# URL for Latest Nodejs Version: https://nodejs.org/en
# nvm environment variables
ENV NVM_DIR /usr/local/nvm
RUN mkdir $NVM_DIR && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    nvm alias default $NODE_VERSION


# Install SonarQube Scanner
#URL for Latest Version: https://docs.sonarsource.com/sonarqube/9.9/analyzing-source-code/scanners/sonarscanner/
ENV SONAR_SCANNER_HOME=/opt/sonar-scanner

RUN curl -o /tmp/sonar-scanner.zip -fSL "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}.zip" && \
    unzip /tmp/sonar-scanner.zip -d /opt && \
    rm /tmp/sonar-scanner.zip && \
    mv /opt/sonar-scanner-* $SONAR_SCANNER_HOME && \
    ln -s $SONAR_SCANNER_HOME/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    sonar-scanner -v


# Add NVM environment variables to the system
ENV PATH "$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"
ENV NVM_NODEJS_ORG_MIRROR https://nodejs.org/dist
RUN node -v 

WORKDIR /
# Cleanup temporary data and cache
RUN apt clean \
&& apt autoclean \
&& apt -y autoremove \
&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
&& rm -rf /tmp/tools

# Drop configuration file as aws configure will not work from Docker build
RUN mkdir -p /.aws \
&& chown jenkins /.aws

COPY aws.config /.aws/config

USER jenkins

ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false
ENV AWS_CONFIG_FILE /.aws/config

# install jenkins plugins
#COPY jenkins-plugins.txt /usr/share/jenkins/ref/plugins.txt
COPY jcasc.yaml /usr/share/jenkins/ref/jenkins.yaml
#RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt --plugin-download-directory /usr/share/jenkins/ref/plugins
