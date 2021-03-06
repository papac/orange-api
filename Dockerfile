FROM        centos:centos7
MAINTAINER  Harry Rickards <rickards@mit.edu>

# Enable EPEL, git, Node.js/npm and zeromq
RUN yum -y update; yum clean all
RUN yum -y install epel-release; yum clean all
RUN yum -y install nodejs npm; yum clean all
RUN yum -y install zeromq zeromq-devel; yum clean all
RUN yum -y install gcc-c++ openssl-devel make; yum clean all
RUN npm install -g node-gyp

# Copy package.json and install app dependencies
# (do this before we copy over the rest of the source for caching reasons)
COPY    package.json /tmp/package.json
RUN     cd /tmp && npm install --production
RUN     mkdir -p /src && cp -a /tmp/node_modules /src/
WORKDIR /src

# Copy app source
# .dockerignore crucially means we don't copy node_modules
COPY . /src
COPY ./config.js.docker /src/config.js

EXPOSE 5000
ENV NODE_ENV production
CMD ["node", "run.js"]
