# 创建Ubuntu Desktop

```bash
docker run -d \
  --name ubuntu \
  --shm-size=512m \
  -p 6901:6901 \
  -e VNC_PW=123456 \
  -u root \
  -v /mnt/wsl/data/src:/data/src \
  --restart always \
  colinchang/ubuntu-desktop
```

Dockfile

```text
FROM golang:bullseye AS easy-novnc-build
WORKDIR /src
RUN go mod init build && \
    go get github.com/geek1011/easy-novnc@v1.1.0 && \
    go build -o /bin/easy-novnc github.com/geek1011/easy-novnc

FROM ubuntu:focal
ENV DEBIAN_FRONTEND=noninteractive 

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openbox tint2 xdg-utils lxterminal hsetroot tigervnc-standalone-server supervisor && \
    rm -rf /var/lib/apt/lists

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends vim openssh-client wget curl rsync ca-certificates apulse libpulse0 firefox htop tar xzip gzip bzip2 zip unzip && \
    rm -rf /var/lib/apt/lists

COPY --from=easy-novnc-build /bin/easy-novnc /usr/local/bin/
COPY supervisord.conf /etc/
COPY menu.xml /etc/xdg/openbox/
RUN echo 'hsetroot -solid "#123456" &' >> /etc/xdg/openbox/autostart

RUN mkdir -p /etc/firefox
RUN echo 'pref("browser.tabs.remote.autostart", false);' >> /etc/firefox/syspref.js

RUN mkdir -p /root/.config/tint2
COPY tint2rc /root/.config/tint2/

EXPOSE 8080
ENTRYPOINT ["/bin/bash", "-c", "/usr/bin/supervisord"]
```

run：

```text
docker run --name novnc-demo -d -p 28080:8080 -p 25900:5900 -e "TZ=America/Los_Angeles" prbinu/novnc-desktop
```

原始文档： https://github.com/prbinu/novnc-desktop/blob/main/README.md

编译：

`docker build --squash -t idefav/novnc-desktop --network host --build-arg HTTP_PROXY=http://127.0.0.1:1082 --build-arg HTTPS_PROXY=http://127.0.0.1:1082 -f Dockerfile .`


运行：

docker run --name novnc-demo -d -p 28080:8080 -p 25900:5900 -e "TZ=America/Los_Angeles" idefav/novnc-desktop


## 使用vncdotool 截屏

vncdo -s localhost::5900 capture screen.png

## 屏幕解析并点击

https://blog.stoeng.site/20241030.html