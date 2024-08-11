---
title: LNMP架构下的进程模型分析
date: 2018-10-13 08:18:23
tags: linux
cover_index: "https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20190330182129.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
---

# 前言

如果已经在LNMP架构下工作2-3年时间，这个阶段我们对自己常用的技术栈的工作原理一定需要有一个基本的认识。一方面，可以去学习这些优秀软件的设计思路，另一方面，可以为分析系统瓶颈和系统优化打好基础。今天我们就来看看php-fpm/nginx/redis/mysql的进程模型。

# php-fpm的进程模型

php-fpm采用了master-worker多进程的模型，其次与php-cgi相比提供了更好的进程管理方式。php-fpm的进程模型示例图如下：

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/process-fpm-n.png" width="50%">

master主进程的主要任务：
- 监听socket(TCP/IP或者Unix Domain Socket)
- 管理子进程

master通过如下的信号来对进程进行管理：

```
SIGINT/SIGTERM 退出信号

SIGQUIT 优雅退出信号

SIGUSR1 重新加载日志文件信号

SIGUSR2 平滑重启信号

SIGCHLD 回收子进程资源信号(wait/waitpid防止异常退出的子进程变成僵尸进程,僵尸进程会占用pid等内核资源)
```

worker工作进程的主要任务：
- accept请求
- 执行具体的php脚本

> 多进程(单线程)并发模型

# nginx的进程模型

同样，nginx也采用了master-worker多进程的模型，进程模型图如下所示：

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/process-nginx-n.png" width="50%">

但是与php-fpm主要的不同的是：
1. master进程不负责监听端口
2. worker进程自身监听端口(多个进程会产生惊群效应，nginx使用互斥锁使同一时刻只有一个进程去listen端口)

master通过如下的信号来对进程进行管理：

```
SIGINT/SIGTERM 退出信号

SIGQUIT 优雅退出信号

SIGHUP 平滑重启信号

SIGUSR1 重新加载日志文件信号

SIGUSR2 平滑升级信号

SIGWINCH 优雅退出某个worker进程信号

```

> 多进程(单线程)和多路I/O复用并发模型

# redis的进程模型

redis采用的是单进程的模型，如下图所示：

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/process-redis-1.jpg" width="50%">

但是，redis需要实现持久化，持久化的方式一般有两种RDB(写快照)/AOF(写命令)，持久化的过程redis会fork一个子进程来完成，目的不阻塞master工作进程。如下图所示：

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/process-redis-n-2.png" width="50%">

> 单进程(单线程)和多路I/O复用并发模型

# mysql的进程模型

mysql谈进程模型其实还是不合适，mysql主要采用的是多线程的架构。

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/process-mysql.jpg" width="50%">

> 多线程并发模型

# 总结

php-fpm多进程，符合php语言的设计思想「**简单**」。进程间资源隔离，简单且复杂性底，反之相对于而言高流量下性能会不是很好。

nginx多进程，worker去监听端口，一方面，使得master专注于进程管理；另一方面，提高服务的**健壮性**，如果有一个worker挂了别的worker还可以继续处理请求；其次，发挥计算机**多核**的优势。

redis单进程，采用I/O多路复用性能已经足够的好，redis基本都是内存操作，不使用多线程，避免了大量**竞争**，简化了系统的复杂度。其次，redis也没涉及复杂的计算场景，单核足够使用。

mysql多线程，按照我目前的理解，绝大多数常用的mysql引擎的性能瓶颈是在于**磁盘IO**，多线程技术已经足够满足并发需求。

# 思考

从上面看来，不同的系统设计，根据它的运用场景都采用了符合它们自身需求的设计。比如，php的简单；nginx的高可用高性能的web server；redis高性能的nosql；mysql大量的磁盘操作。

这些系统使用的多进程，多线程，协程，I/O多路复用(select/poll/epoll)等技术手段都是指引我们去优化我们系统的方向，这些优秀系统都为我们的设计思路提供了很好的案例，去提高并发能力，解决网路IO、磁盘IO问题。这些都是我们现在以及未来需要去理解和消化的东西。

最后，以上内容有理解不对的地方，欢迎大家及时指正，非常谢谢～

# 附录

常见linux信号和数字映射表：

信号|数字(LINUX)|含义
------|------|------
SIGKILL|9|force kill
SIGINT|2|interrupt
SIGQUIT|3|quit graceful
SIGTERM|15|terminate
SIGHUP|1|hang up
SIGUSR1|10|user defined
SIGUSR2|12|user defined
