---
title: 什么，秒杀系统也有这么多种！
tags:
  - shop
  - 秒杀系统
cover_index: >-
  http://ro98r0r1a.hb-bkt.clouddn.com/20200505124913.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
cover_detail: >-
  http://ro98r0r1a.hb-bkt.clouddn.com/20200505124913.jpg?imageMogr2/thumbnail/1500x1000!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - skrshop
date: 2020-05-05 12:22:11
---

---

# 前言

本文结构很简单：

> 5张图送你5种秒杀系统，再加点骚操作，再顺带些点心里话🤷‍♀️。


# 一个简单的秒杀系统

**实现原理：** 通过redis原子操作减库存

**图一**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200501175532.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200501175532.png" width="90%">
    </a>
</p>

优点|缺点
------------|------------
简单好用|考验redis服务能力

|是否公平|
|-------|
|公平|
|先到先得|

我们称这类秒杀系统为：

> 简单秒杀系统

如果刚开始QPS并不高，redis完全抗的下来的情况，完全可以依赖这个「简单秒杀系统」。

# 一个够用的秒杀系统

**实现原理：** 服务内存限流算法 + redis原子操作减库存

**图二**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200501183037.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200501183037.png" width="90%">
    </a>
</p>

优点|缺点
------------|------------
简单好用|-

|是否公平|
|-------|
|不是很公平|
|相对的先到先得|

我们称这类秒杀系统为：

> 够用秒杀系统

# 性能再好点的秒杀系统 

**实现原理：** 服务本地内存原子操作减库存

> 服务本地内存的库存怎么来的？

活动开始前分配好每台机器的库存，推送到机器上。

**图三**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200501200309.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200501200309.png" width="90%">
    </a>
</p>

优点|缺点
------------|------------
高性能|不支持动态伸缩容(活动进行期间)，因为库存是活动开始前分配好的
释放redis压力|-

|是否公平|
|-------|
|不是很公平|
|不是绝对的先到先得|


我们称这类秒杀系统为：

> 预备库存秒杀系统

# 支持动态伸缩容的秒杀系统

**实现原理：** 服务本地协程Coroutine**定时redis原子操作减部分库存**到本地内存 + 服务本地内存原子操作减库存

**图四**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200501200846.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200501200846.png" width="90%">
    </a>
</p>

优点|缺点
------------|------------
高性能|-
支持动态伸缩容(活动进行期间)|-
释放redis压力|-
**具备通用性**|-

|是否公平|
|-------|
|不是很公平，但是好了点|
|几乎先到先得|

我们称这类秒杀系统为：

> 实时预备库存秒杀系统

# 公平的秒杀系统

**实现原理：** 服务本地Goroutine**定时同步是否售罄**到本地内存 + 队列 + 排队成功轮训(或主动Push)结果

**图五**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200502195413.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200502195413.png" width="90%">
    </a>
</p>

优点|缺点
------------|------------
高性能|开发成本高(需主动通知或轮训排队结果)
真公平|-
**具备通用性**|-

|是否公平|
|-------|
|很公平|
|绝对的先到先得|

我们称这类秒杀系统为：

> 公平排队秒杀系统

# 骚操作

> 上面的秒杀系统还不够完美吗？

答案：是的。

> 还有什么优化的空间？

答案：静态化获取秒杀活动信息的接口。

> 静态化是什么意思?

答案：比如获取秒杀活动信息是通过接口 `https://seckill.skrshop.tech/v1/acticity/get` 获取的。现在呢，我们需要通过`https://static-api.skrshop.tech/seckill/v1/acticity/get` 这个接口获取。有什么区别呢？看下面：

服务名|接口|数据存储位置
------|------|------
秒杀服务|https://seckill.skrshop.tech/v1/acticity/get|秒杀服务内存或redis等
接口静态化服务|https://static-api.skrshop.tech/seckill/v1/acticity/get|CDN、本地文件

**以前是这样**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200502195950.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200502195950.png" width="66%">
    </a>
</p>

**变成了这样**
<p align="center">
    <a href="http://ro98r0r1a.hb-bkt.clouddn.com/20200502200723.png">
        <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20200502200723.png" width="90%">
    </a>
</p>

结果：可以通过接口`https://static-api.skrshop.tech/seckill/v1/acticity/get`就获取到了秒杀活动信息，流量都分摊到了cdn，秒杀服务自身没了这部分的负载。

> 小声点说：“秒杀结果我也敢推CDN😏😏😏。”

```
备注：
之后我们会分享`如何用Golang设计一个好用的「接口静态化服务」`。
```

# 总结

上面我们得到了如下几类`秒杀系统`

|秒杀系统|
------------|
|简单秒杀系统|
|够用秒杀系统|
|预备库存秒杀系统|
|实时预备库存秒杀系统|
|公平排队秒杀系统|

我想说的是里面没有最好的方案，也没有最坏的方案，只有**适合你**的。

拿`先到先得`来说，一定要看你们的产品对外宣传，切勿上来就追逐绝对的先到先得。其实你看所有的方案，相对而言都是“先到先得”，比如，活动开始一个小时了你再来抢，那相对于准时的用户自然抢不过，对吧。

又如`预备库存秒杀系统`，虽然不支持动态伸缩容。但是如果你的环境满足如下任意条件，就完全够用了。

- 秒杀场景结束时间之快，通常几秒就结束了，真实活动可能会发生如下情况：
    + 服务压力大还没挂：根本就来不及动态伸缩容
    + 服务压力大已经挂了：可以先暂停活动，服务起来&扩容结束，用剩余库存重新推送
- 运维自身不具备动态伸缩容的能力

所以:

> 合适好用就行，切勿过度设计。

# 最后

这次算是把老本都吐露出来了，真是慌得一匹。