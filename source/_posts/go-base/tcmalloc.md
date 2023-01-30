---
title: 18张图解密新时代内存分配器TCMalloc
tags:
  - Go
cover_index: >-
  http://ro98r0r1a.hb-bkt.clouddn.com/20210125201952.png?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2021-01-31 22:00:11
---

---

# 导读
---

```
本系列基于64位平台、1Page=8KB
```

今天我们开始拉开《Go语言轻松系列》第二章「内存与垃圾回收」的序幕。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210109200839.png" style="width:30%;box-shadow: 3px 3px 3px 3px #ddd;">
</p>

关于「内存与垃圾回收」章节，大体从如下三大部分展开：

- 知识预备：为后续的内容做一些知识储备，知识预备包括
  + 指针的大小 [点击此处查看本文](http://tigerb.cn/go/#/kernal/memory-pointer)
  + Tcmalloc内存分配原理(本篇内容)
- Go内存设计与实现
- Go的垃圾回收原理

# 本文导读
---

我们的主要目的是**掌握Go语言的内存分配原理**。但是呢，Go语言的内存分配主要是基于**Tcmalloc内存分配器**实现的。所以，我们想搞懂Go语言的内存分配原理前，必须先了解**Tcmalloc内存分配器**，以便于我们更好的理解**Go语言的内存分配原理**。

本文目录如下：

- 读前知识储备
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

# 读前知识储备
---

本小节的内容如下：

- 内存的线性分配
- 什么是`FreeList`？
- 虚拟内存
- 什么是`TCMalloc`?

> 目的：辅助我们更好的理解内存分配原理。

## 内存的线性分配
---

线性分配大致就是需要使用多少分配多少，“用到哪了标识到哪”，如下图所示：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210124225714.png" style="width:100%">
</p>

线性分配有个问题：“已经分配的内存被释放了，我们如何再次分配？”。大家会想到用链表`LinkedList`，是的没错，但是内存管理中一般使用的是`FreeList`。

## 什么是FreeList？
---

`FreeList`本质上还是个`LinkedList`，和`LinkedList`的区别：

- `FreeList`没有`Next`属性，所以不是用`Next`属性存放下一个节点的指针的值。
- `FreeList`“相当于使用了`Value`的前8字节”(其实就是整块内存的前8字节)存放下一个节点的指针。
- 分配出去的节点，节点整块内存空间可以被复写(指针的值可以被覆盖掉)

如下图所示：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210124224723.png" style="width:100%">
</p>

> 结论：`FreeList`里一个节点最小为8字节

```
备注：因为要存指针，指针的大小为8字节，为什么？可以参考上篇文章《64位平台下，指针自身的大小为什么是8字节？》(http://tigerb.cn/2021/01/23/go-base/memory-pointer/)
```

## 虚拟内存
---

这里直说结论哈，我们的进程是运行在虚拟内存上的，图示如下：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210129194928.png" style="width:90%">
</p>

- 对于我们的进程而言，可使用的内存是连续的
- 安全，防止了进程直接对物理内存的操作(如果进程可以直接操作物理内存，那么存在某个进程篡改其他进程数据的可能)
- 虚拟内存和物理内存是通过MMU(Memory Manage Unit)映射的(感兴趣的可以研究下)
- 等等(感兴趣的可以研究下)

所以，以下文章我们所说的内存都是指**虚拟内存**。

## 什么是TCMalloc？
---

`TCMalloc`全称`Thread Cache Alloc`，是Google开源的一个内存分配器，基于数据结构`FreeList`实现，并引入了线程级别的缓存，性能更加优异。

# TCMalloc中的五个基本概念
---

本小节的内容如下：

- `Page`的概念
- `Span`的概念
	+ `SpanList`的概念
- `Object`的概念
	+ `SizeClass`的概念

> 目的：`TCMalloc`各个主要部分是基于这些基本概念组成的.

## Page的概念
---

操作系统是按`Page`管理内存的，本文中1Page为8KB，如下图所示：

```
备注：操作系统为什么按`Page`管理内存？不在本文范围。
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120131944.png" style="width:100%">
</p>

## Span和SpanList的概念
---

一个`Span`是由N个`Page`构成的，且：

- N的范围为`1 ~ +∞`
- 构成这个`Span`的N个`Page`在内存空间上必须是连续的

如下图所示：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210124225012.png" style="width:100%">
</p>

从图中可以看出，有：

- 1个`Page`构成的8KB的`Span`
- 2个连续`Page`构成的16KB的`Span`
- 3个连续`Page`构成的24KB的`Span`

除此之外，`Span`和`Span`之间可以构成**双向链表**我们称之为`SpanList`，内存管理中通常将持有相同数量`Page`的`Span`构成一个双向链表，如下图所示(**N个持有1Page的`Span`构成的`SpanList`**)：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210128131031.png" style="width:100%">
</p>

我们再来看`Span`的下代码，如下：

```c++
class Span : public SpanList::Elem {
 public:

  // 略...

  // 把span拆解成object的方法
  // object的概念看下文
  void BuildFreelist(size_t size, size_t count);

  
  // 略...

  union {
    // object构成的freelist
    // object的概念看下文
    ObjIdx cache_[kCacheSize];
    
    // 略...
  };

  PageId first_page_;  // 当前span是从哪个page开始的
  Length num_pages_;   // 当前page持有的page数量

  // 略...
};

```

## Object和SizeClass的概念
---

一个`Span`会被按照某个大小拆分为N个`Objects`，同时这N个`Objects`构成一个`FreeList`(如果忘了FreeList的概念可以再返回上文重新看看)。

我们以持有`1Page`的`Span`为例，`Span`、`Page`、`Object`关系图示如下：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210125201952.png" style="width:100%">
</p>

看完上面的图示，问题来了：

> 上图怎么知道拆分`Span`为一个个24字节大小的`Object`，这个规则是怎么知道的呢？

```c++
答案：依赖代码维护的映射列表。

我们以Google开源的TCMalloc源码(commit:9d274df)为例来看一下这个映射列表 https://github.com/google/tcmalloc/tree/master/tcmalloc

代码位置：tcmalloc/tcmalloc/size_classes.cc
代码示例(摘取一部分)：

const SizeClassInfo SizeMap::kSizeClasses[SizeMap::kSizeClassesCount] = {
    // 这里的每一行 称之为SizeClass
    // <bytes>, <pages>, <batch size>    <fixed>
    // Object大小列，一次申请的page数，一次移动的objects数(内存申请或回收)
    {        0,       0,           0},  // +Inf%
    // 所以也知道为啥最小8字节了吧？
    // Object会构成FreeList
    // FreeList的节点要存指针
    // 指针为8字节
    {        8,       1,          32},  // 0.59%
    {       16,       1,          32},  // 0.59%
    {       24,       1,          32},  // 0.68%
    {       32,       1,          32},  // 0.59%
    {       40,       1,          32},  // 0.98%
    {       48,       1,          32},  // 0.98%
    // ...略...
    {    98304,      12,           2},  // 0.05%
    {   114688,      14,           2},  // 0.04%
    {   131072,      16,           2},  // 0.04%
    {   147456,      18,           2},  // 0.03%
    {   163840,      20,           2},  // 0.03%
    {   180224,      22,           2},  // 0.03%
    {   204800,      25,           2},  // 0.02%
    {   229376,      28,           2},  // 0.02%
    {   262144,      32,           2},  // 0.02%
};

获取拆分规则的过程(先找到行、再找到这行第一列的值)：
1. 先找到对应行(如何找到这个行？是不是有人有疑惑了，
想知道这个答案就需要了解`CentralFreeList`这个结构了，
下文我们会讲到。)
2. 找到第一列，这个数字就是object的大小
```

同时通过上面我们知道了：`SizeMap::kSizeClasses`的每一行元素我们称之为**SizeClass**(下文中我们直接就称之为`SizeClass`).

> 这个5个基本概念具体干什么用的呢？

```
答案：支撑了`Tcmalloc`的基本结构的实现。
```

# 解密Tcmalloc的基本结构
---

`Tcmalloc`主要由三部分构成：

- `PageHeap`
- `CentralFreeList`
- `ThreadCache`

图示如下：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120132020.png" style="width:60%">
</p>

但是呢，实际上`CentralFreeList`是被`TransferCacheManager`管理的，所以`Tcmalloc`的基本结构实际应该为下图所示：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120132031.png" style="width:80%">
</p>

> 接着，`ThreadCache`其实被线程持有，为什么呢？

```
答案：减少线程之间的竞争，分配内存时减少锁的过程。
这也是为什么叫`Thread Cache Alloc`的原因。
```

进一步得到简易的结构图：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120132037.png" style="width:80%">
</p>

# 解密PageHeap、CentralFreeList、ThreadCache的详细构成
---

本小节的内容如下：

+ 解密`PageHeap`
+ 解密`CentralFreeList`和`TransferCacheManager`的构成
	* 解密`CentralFreeList`
	* 解密`TransferCacheManager`
+ 解密`ThreadCache`

> 目的：详细了解`TCMalloc`各个组成部分的实现。

## 解密PageHeap
---

`PageHeap`主要负责管理不同规格的`Span`，相同规格的`Span`构成`SpanList`(可回顾上文`SpanList`的概念)。

> 什么是相同规格的`Span`？

```
答：持有相同`Page`数目的`Span`。
```

`PageHeap`对象里维护了一个属性`free_`类型是个数组，**粗略看**数组元素的类型是`SpanList`，同时`free_`这个数据的元素具有以下特性：

- 索引值为1对应的`SpanList`，该`SpanList`的`Span`都持有1Pages；
- 索引值为2对应的`SpanList`，该`SpanList`的`Span`都持有2Pages；
- 以此类推，`free_`索引值为MaxNumber对应的`SpanList`，该`SpanList`的`Span`都持有MaxNumber Pages；
- MaxNumber的值由`kMaxPages`决定


数组索引|SpanList里单个Span持有Page数
---|---
1|1Pages
2|2Pages
3|3Pages
4|4Pages
5|5Pages
...|...
kMaxPages|kMaxPages Pages

图示如下：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210129133136.png" style="width:100%">
</p>

但是呢，实际上从代码可知：数组元素的实际类型为`SpanListPair`，代码如下

```c++
class PageHeap final : public PageAllocatorInterface {
 public:

  // ...略

 private:
  // 持有两个Span构成的双向链表
  struct SpanListPair {
    // Span构成的双向链表 正常的
    SpanList normal; 
    // Span构成的双向链表 大概是 物理内存已经回收 但是虚拟内存还被持有(感兴趣可以研究)
    SpanList returned;
  };

  // ...略

  // kMaxPages.raw_num()这么多个，由上面SpanListPair类型构成的数组
  SpanListPair free_[kMaxPages.raw_num()] ABSL_GUARDED_BY(pageheap_lock);

  // ...略
};

```

结论：

- `free_`数组元素的类型是`SpanListPair`
- `SpanListPair`里维护了两个`SpanList`

根据这个结论我们修正下`PageHeap`结构图，如下：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210129132903.png" style="width:100%">
</p>

又因为大于kMaxPages个Pages(大对象)的内存分配是从`large_`中分配的，代码如下：

```c++
class PageHeap final : public PageAllocatorInterface {
 public:

  // ...略

  //  大对象的内存从这里分配(length >= kMaxPages)
  SpanListPair large_ ABSL_GUARDED_BY(pageheap_lock);

  // ...略
};

```

所以我们再加上大对象的分配时的`large_`属性，得到`PageHeap`的结构图如下：

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210129132923.png" style="width:100%">
</p>

同时`PageHeap`核心的代码片段如下：

```c++
class PageHeap final : public PageAllocatorInterface {
 public:

  // ...略

 private:
  // 持有两个Span构成的双向链表
  struct SpanListPair {
    // Span构成的双向链表
    SpanList normal; 
    // Span构成的双向链表
    SpanList returned;
  };

  //  大对象的内存从这里分配(length >= kMaxPages)
  SpanListPair large_ ABSL_GUARDED_BY(pageheap_lock);

  // kMaxPages.raw_num()这么多个，由上面SpanListPair类型构成的数组
  SpanListPair free_[kMaxPages.raw_num()] ABSL_GUARDED_BY(pageheap_lock);

  // ...略
};

```

## 解密CentralFreeList和TransferCacheManager的构成
---
### 解密CentralFreeList
---

我们可以称之为中央缓存，中央缓存被线程共享，从中央缓存`CentralFreeList`获取缓存需要加锁。

`CentralFreeList`里面有个属性`size_class_`，就是`SizeClass`的值，来自于映射表`SizeMap`这个数组的索引值。`CentralFreeList`里的`Span`会做一件事情，按照这个`size_class_`值对应的规则拆解`Span`为多个`Object`，同时这些`Object`构成`FreeList`。

同时，`SizeMap`里的每个`SizeClass`都会对应一个`CentralFreeList`，所以最多一共会有N个`CentralFreeList`，N的值为`kNumClasses`。关键代码如下：

```c++
class CentralFreeList {

  // ...略

 private:

  // 锁
  // 线程从此处获取内存 需要加锁 保证并发安全
  absl::base_internal::SpinLock lock_;

  // 对应上文提到的映射表SizeClassInfo中的某个索引值
  // 目的找到Span拆解为object时，object的大小等规则
  size_t size_class_;  
  // object的总数量
  size_t object_size_;
  // 一个Span持有的object的数量
  size_t objects_per_span_;
  // 一个Span持有的page的数量
  Length pages_per_span_;

  // ...略
```

如下图就展示了`kNumClasses`个`CentralFreeList`，其中我们以`size_class_`的值为`1`和`3`为例来展示下`CentralFreeList`的结构。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120132206.png" style="width:100%">
</p>

### 解密TransferCacheManager
---

因为有`kNumClasses`个`CentralFreeList`，这些`CentralFreeList`在哪维护的呢？

```
答案：就是`TransferCacheManager`这个结构里的`freelist_`属性。
```

代码如下：

```c++
class TransferCacheManager {
  
  // ...略

 private:
  // freelist_是个数组
  // 元素的类型是上面的CentralFreeList
  // 元素的数量与 映射表 SizeClassInfo对应
  CentralFreeList freelist_[kNumClasses];
} ABSL_CACHELINE_ALIGNED;
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120132218.png" style="width:100%">
</p>


## 解密ThreadCache的构成
---

我们可以称之为线程缓存，`TCMalloc`内存分配器的核心所在。`ThreadCache`被每个线程持有，分配内存时不用加锁，性能好。

`ThreadCache`对象里维护了一个属性`list_`类型是个数组，数组元素的类型是`FreeList`，代码如下：

```c++
class ThreadCache {
  // ...略

  // list_是个数组
  // 元素的类型是FreeList
  // 元素的数量与 映射表 SizeClassInfo对应
  FreeList list_[kNumClasses]; 

  // ...略
};
```

同时`FreeList`里的元素还具有以下特性：

- 索引值为1对应的`FreeList`，该`FreeList`的`Object`大小为8 Bytes；
- 索引值为2对应的`FreeList`，该`FreeList`的`Object`大小为16 Bytes；
- 以此类推，`free_`索引值为MaxNumber对应的`FreeList`，该`FreeList`的`Object`大小为MaxNumber Bytes；
- MaxNumber的值由`kNumClasses`决定

这个规则怎么来的？还是取决于映射列表，同样以Google开源的TCMalloc源码(commit:9d274df)为例，来看一下这个映射列表：

```c++
https://github.com/google/tcmalloc/tree/master/tcmalloc

代码位置：tcmalloc/tcmalloc/size_classes.cc
代码示例(摘取一部分)：

const SizeClassInfo SizeMap::kSizeClasses[SizeMap::kSizeClassesCount] = {
    // 这里的每一行 称之为SizeClass
    // <bytes>, <pages>, <batch size>    <fixed>
    // Object大小列，一次申请的page数，一次移动的objects数(内存申请或回收)
    {        0,       0,           0},  // +Inf%
    {        8,       1,          32},  // 0.59%
    {       16,       1,          32},  // 0.59%
    {       24,       1,          32},  // 0.68%
    {       32,       1,          32},  // 0.59%
    {       40,       1,          32},  // 0.98%
    {       48,       1,          32},  // 0.98%
    // ...略...
};
```
我们可以得到：

数组索引|FreeList里单个Object的大小
---|---
1|8 Bytes
2|16 Bytes
3|24 Bytes
4|32 Bytes
5|40 Bytes
...|...
kNumClasses|kNumClasses Bytes

得到`ThreadCache`结构图如下所示：

```
注意：图示中索引为3的FreeList的Span尾部会浪费掉8字节。
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210120132229.png" style="width:100%">
</p>

# 解密Tcmalloc基本结构的依赖关系
---

本小节的内容如下：

- 简易版
- 详细版

> 目的：了解`Tcmalloc`内存分配的大致过程。

## 简易版
---

我们把`Tcmalloc`中分配的对象分为两类：

- 小对象
- 非小对象

小对象的大小范围就来自于`SizeMap`维护的映射表，也就是单个`Object`的大小范围，我们还是以如下代码片段为例，可知单个`Object`大小范围为：

> 8 Byte ~ 262144 Byte == 8 Byte ~ 256 KB

```c++
const SizeClassInfo SizeMap::kSizeClasses[SizeMap::kSizeClassesCount] = {
    // 这里的每一行 称之为SizeClass
    // <bytes>, <pages>, <batch size>    <fixed>
    // Object大小列，一次申请的page数，一次移动的objects数(内存申请或回收)
    // ...略...
    {        8,       1,          32},  // 0.59%
    // ...略...
    {   262144,      32,           2},  // 0.02%
};
```

所以：

类型|大小|来源
---|---|---
小对象|<= 256 KB|`ThreadCache`、`CentralFreeList`
非小对象|> 256 KB|`PageHeap.free_`和`PageHeap.large_`

当给小对象分配内存时：`ThreadCache`的内存不足时，从对应`SizeClass`的`CentralFreeList`获取，如果获取不到，`CentralFreeList`再从`PageHeap`里获取内存。

当给非小对象分配内存时：`PageHeap.free_`和`PageHeap.large_`里获取。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210131211533.png" style="width:66%">
</p>

# 详细版
---

最后，我们以获取`6`字节的小对象为例(`SizeClass`的值为`1`)，看一下详细内存分配过程。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210131212110.png" style="width:100%">
</p>


# 结语
---

简单总结下，本篇文章我们可以获取到的知识点：

- 了解了`FreeList`
- 知道了`TCMalloc`主要由`ThreadCache`、`CentralFreeList`、`PageHeap`三部分组成
    + `Object`构成的`FreeList`，被`ThreadCache`维护
    + `Span`构成了`SpanList`，被`CentralFreeList`维护，同时`Span`会被拆解成`Object`
    + 当`ThreadCache`里的`Object`没有时，从对应`SizeClass`的`CentralFreeList`里获取
    + 小对象来自`ThreadCache`、`CentralFreeList`
    + 非小对象来自`PageHeap`
- 线程从`ThreadCache`获取内存不需要加锁

通过学习以上内容，再回过头学习Go语言的内存分配，应该会变得轻松明了，下次我们就来看看Go内存设计与实现。

```
参考：
1. tcmalloc源码(commit:9d274df) https://github.com/google/tcmalloc/tree/master/tcmalloc
2. 可利用空间表（Free List）https://songlee24.github.io/2015/04/08/free-list/
3. 图解 TCMalloc https://zhuanlan.zhihu.com/p/29216091
4. TCMalloc解密 https://wallenwang.com/2018/11/tcmalloc/
5. TCMalloc : Thread-Caching Malloc https://github.com/google/tcmalloc/blob/master/docs/design.md
6. TCMalloc : Thread-Caching Malloc https://gperftools.github.io/gperftools/tcmalloc.html
7. tcmalloc原理剖析(基于gperftools-2.1) http://gao-xiao-long.github.io/2017/11/25/tcmalloc/
```