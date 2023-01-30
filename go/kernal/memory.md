# 导读
---

```
本系列基于64位平台、1Page=8KB
```

今天我们开始拉开《Go语言轻松系列》第二章「内存与垃圾回收」的序幕。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210109200839.png" style="width:36%;box-shadow: 3px 3px 3px 3px #ddd;">
</p>

关于「内存与垃圾回收」章节，目录如下：

- 读前知识储备(已完结)
	+ [指针的大小](/kernal/memory-pointer)
    + [内存的线性分配](/kernal/tCMalloc?id=内存的线性分配)
    + [什么是FreeList？](/kernal/tCMalloc?id=什么是freelist？)
    + [虚拟内存](/kernal/tCMalloc?id=虚拟内存)
	+ [TCMalloc内存分配原理](/kernal/tCMalloc?id=什么是tcmalloc？)
		* [基本概念](/kernal/tCMalloc?id=tcmalloc中的五个基本概念)
			- [`Page`的概念](/kernal/tcmalloc?id=page的概念)
			- [`Span`的概念](/kernal/tcmalloc?id=span和spanlist的概念)
				+ [`SpanList`的概念](/kernal/tcmalloc?id=span和spanlist的概念)
			- [`Object`的概念](/kernal/tcmalloc?id=object和sizeclass的概念)
				+ [`SizeClass`的概念](/kernal/tcmalloc?id=object和sizeclass的概念)
		* [基本结构](/kernal/tcmalloc?id=解密tcmalloc的基本结构)
			- [解密`PageHeap`](/kernal/tcmalloc?id=解密pageheap)
			- [解密`CentralFreeList`和`TransferCacheManager`的构成](/kernal/tcmalloc?id=解密centralfreelist和transfercachemanager的构成)
				+ [解密`CentralFreeList`](/kernal/tcmalloc?id=解密centralfreelist)
				+ [解密`TransferCacheManager`](/kernal/tcmalloc?id=解密transfercachemanager)
			- [解密`ThreadCache`](/kernal/tcmalloc?id=解密threadcache的构成)
		* [内存分配过程](/kernal/tcmalloc?id=解密tcmalloc的内存分配过程)
			- [简易版](/kernal/tcmalloc?id=简易版)
			- [详细版](/kernal/tcmalloc?id=详细版)
- [Go语言内存管理(已完结)](kernal/memory-arch)
	+ [Go内存管理架构](kernal/memory-arch?id=go内存管理架构)
		* `mcache`
		* `mcentral`
		* `mheap`
	+ [为什么线程缓存`mcache`是被逻辑处理器`p`持有，而不是系统线程`m`?](kernal/memory-mcache)
	+ [Go内存管理单元`mspan`](kernal/memory-mspan)
		* `page`的概念
		* `mspan`的概念
		* `object`的概念
		* `sizeclass`的概念
		* `spanclass`的概念
		* `heaparena`的概念
		* `chunk`的概念
	* [计算机为什么需要内存？](kernal/memory-alloc?id=计算机为什么需要内存？)
    * [为什么需要栈内存？](kernal/memory-alloc?id=为什么需要栈内存？)
    * [为什么需要堆内存？](kernal/memory-alloc?id=为什么需要堆内存？)
	* [分配的是虚拟内存](kernal/memory-alloc?id=分配的是虚拟内存)
	+ [Go栈内存的分配](kernal/memory-alloc?id=栈内存的分配)
		* 分配时机
		* 分配过程
			- 小于32KB的栈分配
			- 大于等于32KB的栈分配
	+ [Go堆内存的分配](kernal/memory-alloc?id=栈内存的分配)
		* 分配时机
		* 分配过程
			- 微对象分配
			- 小对象分配
			- 大对象分配	
- Go语言垃圾回收原理(未开始)