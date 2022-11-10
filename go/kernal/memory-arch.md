# 导读
---

```
本文基于Go源码版本1.16、64位Linux平台、1Page=8KB、本文的内存特指虚拟内存
```

今天我们开始进入《Go语言轻松进阶》系列第二章「内存与垃圾回收」第二部分「Go语言内存管理」。

关于「内存与垃圾回收」章节，会从如下三大部分展开：

- 读前知识储备(已完结)
	+ [指针的大小](/kernal/memory-pointer)
    + [内存的线性分配](/kernal/tCMalloc?id=%e5%86%85%e5%ad%98%e7%9a%84%e7%ba%bf%e6%80%a7%e5%88%86%e9%85%8d)
    + [什么是FreeList？](/kernal/tCMalloc?id=%e4%bb%80%e4%b9%88%e6%98%affreelist%ef%bc%9f)
    + [虚拟内存](/kernal/tCMalloc?id=%e8%99%9a%e6%8b%9f%e5%86%85%e5%ad%98)
	+ [TCMalloc内存分配原理](/kernal/tCMalloc?id=%e4%bb%80%e4%b9%88%e6%98%aftCMalloc%ef%bc%9f)
- Go语言内存管理(当前部分)
- Go语言垃圾回收原理(未开始)

第一部分「读前知识储备」已经完结，为了更好理解本文大家可以点击历史链接进行查看或复习。

# 目录
---

关于讲解「Go语言内存管理」部分我的思路如下：

1. 介绍整体架构
2. 介绍架构设计中一个很有意思的地方
3. 通过介绍Go内存管理中的关键结构`mspan`，带出`page`、`mspan`、`object`、`sizeclass`、`spanclass`、`heaparena`、`chunk`的概念
4. 接着介绍堆内存、栈内存的分配
5. 回顾和总结

通过这个思路拆解的目录：

- [Go内存管理架构](kernal/memory-arch?id=go内存管理架构)
    + `mcache`
    + `mcentral`
    + `mheap`
- [为什么线程缓存`mcache`是被逻辑处理器`p`持有，而不是系统线程`m`?](kernal/memory-mcache)
- Go内存管理单元`mspan`
    + `page`的概念
    + `mspan`的概念
    + `object`的概念
    + `sizeclass`的概念
    + `spanclass`的概念
    + `heaparena`的概念
    + `chunk`的概念
- Go堆内存的分配
    + 微对象分配
    + 小对象分配
    + 大对象分配
- Go栈内存的分配
    + 栈内存分配时机
    + 小于32KB的栈分配
    + 大于等于32KB的栈分配

# Go内存管理架构
---

Go的内存统一由内存管理器管理的，Go的内存管理器是基于Google自身开源的`TCMalloc`内存分配器为理念设计和实现的，关于`TCMalloc`内存分配器的详细介绍可以查看之前的文章。

先来简单回顾下`TCMalloc`内存分配器的核心设计。

## **回顾`TCMalloc`内存分配器**

> `TCMalloc`诞生的背景？

在多核以及超线程时代的今天，多线程技术已经被广泛运用到了各个编程语言中。当使用多线程技术时，由于**多线程共享内存**，线程申在请内存(虚拟内存)时，由于并行问题会产生竞争不安全。

为了保证分配内存的过程足够安全，所以需要在内存分配的过程中加锁，加锁过程会带来阻塞影响性能。之后就诞生了`TCMalloc`内存分配器并被开源。

> `TCMalloc`如何解决这个问题?

`TCMalloc`全称`Thread Cache Memory alloc`线程缓存内存分配器。顾名思义就是给线程添加内存缓存，减少竞争从而提高性能，当线程内存不足时才会加锁去共享的内存中获取内存。

接着我们来看看`TCMalloc`的架构。

> `TCMalloc`的架构？

`TCMalloc`三层逻辑架构

- `ThreadCache`：线程缓存
- `CentralFreeList`(CentralCache)：中央缓存
- `PageHeap`：堆内存

> `TCMalloc`架构上不同的层是如何协作的？

`TCMalloc`把申请的内存对象按大小分为了两类：

- 小对象 <= 256 KB
- 大对象 > 256 KB

我们这里以分配小对象为例，当给小对象分配内存时：
- 先去线程缓存`ThreadCache`中分配
- 当线程缓存`ThreadCache`的内存不足时，从对应`SizeClass`的中央缓存`CentralFreeList`获取
- 最后，再从对应`SizeClass`的`PageHeap`中分配

<p align="center">
  <img src="http://rl24jdcif.bkt.clouddn.com/20210120132244.png" style="width:66%">
</p>

## **Go内存分配器的逻辑架构**

采用了和`TCMalloc`内存分配器一样的三层逻辑架构：

- `mcache`：线程缓存
- `mcentral`：中央缓存
- `mheap`：堆内存

<p align="center">
  <img src="http://rl24jdcif.bkt.clouddn.com/20220405133623.png" style="width:60%">
</p>

实际中央缓存`central`是一个由136个`mcentral`类型元素的数组构成。

除此之外需要特别注意的地方：`mcache`被逻辑处理器`p`持有，而并不是被真正的系统线程`m`持有。(这个设计很有意思，后续会有一篇文章来解释这个问题)

我们更新下架构图如下：

<p align="center">
  <img src="http://rl24jdcif.bkt.clouddn.com/20220405224809.png" style="width:60%">
</p>

「Go内存分配器」把申请的内存对象按大小分为了三类：

- 微对象 0 < Micro Object < 16B
- 小对象 16B =< Small Object <= 32KB
- 大对象 32KB < Large Object

为了清晰看出这三层的关系，这里以堆上分配小对象为例：

- 先去线程缓存`mcache`中分配内存
- 找不到时，再去中央缓存`central`中分配内存
- 最后直接去堆上`mheap`分配一块内存


<p align="center">
  <img src="http://rl24jdcif.bkt.clouddn.com/20220405224348.png" style="width:80%">
</p>

# 架构总结
---

通过以上的分析可以看出Go内存分配器的设计和开源`TCMalloc`内存分配器的理念、思路基本一致。对比图如下：

<p align="center">
  <img src="http://rl24jdcif.bkt.clouddn.com/20220405225026.png" style="width:100%">
</p>

最后我们总结下：

- Go内存分配器采用了和`TCMalloc`一样的三层架构。逻辑上为：
  + `mcache`：线程缓存
  + `mcentral`：中央缓存
  + `mheap`：堆内存
- 线程缓存`mcache`是被逻辑处理器`p`持有，而不是系统线程`m`