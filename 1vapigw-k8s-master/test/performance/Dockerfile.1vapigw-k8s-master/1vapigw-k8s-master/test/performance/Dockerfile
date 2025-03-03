FROM justb4/jmeter
LABEL maintainer="Vonage"
ARG JMETER_VERSION="5.5"
RUN wget https://jmeter-plugins.org/get/ -O /opt/apache-jmeter-${JMETER_VERSION}/lib/ext/jmeter-plugins-manager.jar
RUN wget https://repo1.maven.org/maven2/kg/apc/cmdrunner/2.3/cmdrunner-2.3.jar -P /opt/apache-jmeter-${JMETER_VERSION}/lib/
RUN java -cp /opt/apache-jmeter-${JMETER_VERSION}/lib/ext/jmeter-plugins-manager.jar org.jmeterplugins.repository.PluginManagerCMDInstaller
RUN /opt/apache-jmeter-${JMETER_VERSION}/bin/./PluginsManagerCMD.sh install websocket-samplers,jpgc-casutg
