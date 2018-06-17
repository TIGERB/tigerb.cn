---
title: 酷!一键构建我自己的PHP框架的开发环境
date: 2018-07-08 23:27:26
tags: docker
---

# 前言

这几天用docker给我自己的PHP框架构建了一个自动化的开发环境。这是一件很爽的事情，我的目标就是仅仅只需执行一个init命令：

1. 项目自己就创建好了，并且初始化完毕
2. git初始化完毕，并自动第一次提交
3. docker构建一个轻量级的nginx/php/redis容器环境
4. 启动容器
5. 自动编译前端文件
6. 最后帮你打开项目网页

对，就是上面这么一件我认为很酷的事情。

我为什么要去做这件事情？因为我真的很享受那种一行命令，项目就在本地跑起来的感觉。想一想，万一别人来你们的团队或者接受你的项目，你就告诉他一行命令，一切就好了，所运行即所得。

```
docker image ls

REPOSITORY                               TAG                   IMAGE ID            CREATED             SIZE
php                                      7.2.7-fpm-alpine3.6   39b42adef50e        10 days ago         79.9MB
mysql                                    8.0.11                8d99edb9fd40        11 days ago         445MB
redis                                    4-alpine              caaeda72bf8f        3 weeks ago         27.8MB
nginx                                    1.15-alpine           bc7fdec94612        4 weeks ago         18MB

```


# 初始化流程

<p align="center"><img width="18%" src="http://cdn.tigerb.cn/easy-env.png"></p>

# 如何使用？

首先你需要安装docker/npm/yarn, 让后clone项目到本地，进入项目执行：

> export EASY_PATH=$(pwd) && export PATH="$PATH:$EASY_PATH/bin"

<p align="center"><img src="https://im5.ezgif.com/tmp/ezgif-5-9651e1e039.gif"></p>

# 命令列表

```
Usage:
    easy init/start/restart/stop/destroy

Example:
    easy init
    easy start
    easy restart
    easy stop
    easy destroy
```