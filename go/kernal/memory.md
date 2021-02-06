# 导读
---

```
本系列基于64位平台、1Page=8KB
```

今天我们开始拉开《Go语言轻松系列》第二章「内存与垃圾回收」的序幕。

<p align="center">
  <img src="http://cdn.tigerb.cn/20210109200839.png" style="width:36%;box-shadow: 3px 3px 3px 3px #ddd;">
</p>

关于「内存与垃圾回收」章节，目录如下：

- 读前知识储备
  	+ 指针的大小
	+ 内存的线性分配
	+ 什么是`FreeList`？
	+ 虚拟内存
	+ 什么是`TCMalloc`?
- `TCMalloc`中的五个基本概念
	+ `Page`的概念
	+ `Span`的概念
    	* `SpanList`的概念
	+ `Object`的概念
    	* `SizeClass`的概念
- 解密`Tcmalloc`的基本结构
- `PageHeap`、`CentralFreeList`、`ThreadCache`的详细构成
	+ 解密`PageHeap`
	+ 解密`CentralFreeList`和`TransferCacheManager`的构成
    	* 解密`CentralFreeList`
		* 解密`TransferCacheManager`
	+ 解密`ThreadCache`
- 解密`TCMalloc`基本结构的依赖关系
	+ 简易版
	+ 详细版
- Go内存设计与实现
- Go的垃圾回收原理