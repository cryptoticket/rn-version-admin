FROM ubuntu:16.04

WORKDIR /app

RUN apt update
RUN apt install -y build-essential libssl-dev openjdk-8-jre openjdk-8-jdk curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

COPY package.json /app
RUN npm install
COPY . /app

# Default command
ENTRYPOINT ["/app/devops/entrypoint.sh"]
