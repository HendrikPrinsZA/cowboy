FROM kalilinux/kali-rolling:latest AS base
LABEL maintainer="Hendrik Prinsloo"

# Environmental variables (required)
ENV APP_NAME $APP_NAME
ENV NGINX_HTTP_PORT $NGINX_HTTP_PORT
ENV NGINX_HTTPS_PORT $NGINX_HTTPS_PORT
ENV PYTHON_HTTP_PORT $PYTHON_HTTP_PORT
ENV PYTHON_DB_USER $PYTHON_DB_USER
ENV PYTHON_DB_PASS $PYTHON_DB_PASS
ENV PYTHON_DB_PORT $PYTHON_DB_PORT

# Environmental variables (optional)
ENV NODE_VERSION 18

# Environmental variables (Dockerfile)
ENV DEBIAN_FRONTEND noninteractive
ENV TZ UTC

# Set timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Apt
RUN apt update && apt -y upgrade && apt -y autoremove && apt clean 

# Base
RUN apt install -y --no-install-recommends git gosu supervisor ca-certificates gcc libc6-dev wget

# Support / GoLang
RUN apt update && apt-get install -y golang-go

# Support / JavaScript (NodeJS / NPM)
RUN apt update && apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g npm \
  && apt-get -y autoremove \
  && apt-get clean

# Support / PHP
RUN apt update && apt-get install -y php-cli php-fpm php-dev \
    php-pgsql php-sqlite3 php-gd \
    php-curl php-memcached \
    php-imap php-mysql php-mbstring \
    php-xml php-zip php-bcmath php-soap \
    php-intl php-readline php-pcov \
    php-msgpack php-igbinary

# Support / Python
RUN apt update && apt-get install -y python3-setuptools \ 
  python3-pip \
  python3

# Support / Ruby
RUN apt update && apt-get install -y ruby-full

# Support / Nginx
RUN apt update && apt-get install -y nginx openssl

# Support / Rust
RUN mkdir -m777 /opt/rust /opt/cargo
ENV RUSTUP_HOME=/opt/rust CARGO_HOME=/opt/cargo PATH=/opt/cargo/bin:$PATH
RUN wget --https-only --secure-protocol=TLSv1_2 -O- https://sh.rustup.rs | sh /dev/stdin -y
RUN rustup target add x86_64-unknown-freebsd
RUN printf '#!/bin/sh\nexport CARGO_HOME=/opt/cargo\nexec /bin/sh "$@"\n' >/usr/local/bin/sh
RUN chmod +x /usr/local/bin/sh
RUN cargo install cargo-script

RUN mkdir -p /etc/ssl/certs
RUN chmod 755 /etc/ssl/certs
RUN mkdir -p /etc/ssl/private
RUN chmod 700 /etc/ssl/private

RUN openssl req -x509 -nodes -days 365 \ 
  -subj "/C=NL/ST=AMS/O=Cowboy, Inc./CN=cowboy.local" \
  -addext "subjectAltName=DNS:cowboy.local" \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

RUN openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Tools / Networking and debugging
RUN apt update && apt-get install -y apt-utils amass awscli \
  dotdotpwn file finger ffuf gobuster hydra impacket-scripts john less locate \
  lsof man-db netcat-traditional nikto nmap proxychains4 \
  python3-wheel smbclient smbmap socat ssh-client sslscan sqlmap tmux unzip whatweb vim zip \
  && apt-get autoremove -y && apt-get autoclean -y && rm -rf /var/lib/apt/lists/*

# Tools / Other
RUN apt update && apt-get install -y aircrack-ng \
  crackmapexec \
  crunch \
  dirb \
  dirbuster \
  dnsenum \
  dnsrecon \
  dnsutils \
  dos2unix \
  enum4linux \
  exploitdb \
  ftp \
  wordlists \ 
  wpscan \
  whois \
  vim

RUN apt-get autoremove -y && apt-get autoclean -y && rm -rf /var/lib/apt/lists/*

# Alias ENV
RUN echo "alias APP_NAME='$APP_NAME'" >> /root/.bash_aliases

# Alias (HACKS)
RUN echo '#!/bin/bash\npython3 "$@"' > /usr/bin/python && \
  chmod +x /usr/bin/python

# Aliases (not sure about these...)
RUN echo 'alias HOSTNAME="$HOSTNAME"' >> /root/.bash_aliases
RUN echo "alias PYTHON_HTTP='python3 -m http.server $PYTHON_HTTP_PORT'" >> /root/.bash_aliases
RUN echo "alias HTTP_PHP_HTTP='php -S 127.0.0.1:$PYTHON_HTTP_PORT -t .'" >> /root/.bash_aliases
RUN echo "alias PYTHON_DB='python3 -m pyftpdlib -u \"$PYTHON_DB_USER\" -P \"$PYTHON_DB_PASS\" -p $PYTHON_DB_PORT'" >> /root/.bash_aliases
RUN echo 'alias PYTHON_HTTP_PORT="$PYTHON_HTTP_PORT"' >> /root/.bash_aliases
RUN echo 'alias NGINX_HTTP_PORT="$NGINX_HTTP_PORT"' >> /root/.bash_aliases
RUN echo 'alias NGINX_HTTPS_PORT="$PYTHON_HTTP_PORT"' >> /root/.bash_aliases

# Set working directory to /root
RUN mkdir -p /root/cowboy
WORKDIR /root/cowboy

EXPOSE $NGINX_HTTP_PORT

# Configs
COPY nginx/cowboy.conf /etc/nginx/conf.d/cowboy.conf
COPY nginx/mime.types /etc/nginx/mime.types
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Tests
RUN nginx -t

# Init
COPY docker-init /usr/local/bin/docker-init
RUN chmod +x /usr/local/bin/docker-init
RUN /bin/bash /usr/local/bin/docker-init

# Entry
COPY start-container /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container

# Set permissions
RUN gpasswd -a www-data root
RUN chmod g+x /root && chmod g+x /root/cowboy

ENTRYPOINT ["/usr/local/bin/start-container"]
