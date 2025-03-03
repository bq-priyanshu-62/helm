FROM ubuntu:23.04
USER root

RUN mkdir /app
WORKDIR /app

RUN apt-get update && apt-get install -y curl tcpdump
COPY ./pcap.sh .
RUN chmod +x /app/pcap.sh

ENTRYPOINT [ "/app/pcap.sh" ]
