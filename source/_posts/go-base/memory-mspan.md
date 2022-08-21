---
title: 9张图轻松吃透Go内存管理单元
tags:
  - Go
cover_index: >-
  http://cdn.tigerb.cn/20220405235059.png?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2022-04-23 23:32:10
---

---

# 导读
---

想深入了解Go语言的内存管理实现，必然绕不开「Go内存管理单元`mspan`」，今天我们就通过几张图，层层深入并解开「Go内存管理单元`mspan`」的神秘面纱。

本文也包含的具体概念如下：

- `page`的概念
- `mspan`的概念
- `object`的概念
- `FreeList`的概念
- `sizeclass`的概念
- `spanclass`的概念

# 正文
---

介绍Go内存管理单元`mspan`前，需要先看下`page`的概念，因为`mspan`是由**N个**且**连续**的`page`组成。

##  **`page`的概念**
---

操作系统是按`page`管理内存的，同样Go语言也是也是按`page`管理内存的，1page为8KB，保证了和操作系统一致，如下图所示：

<p align="center">
  <img src="http://cdn.tigerb.cn/20210120131944.png" style="width:100%">
</p>

Go内存管理单元`mspan`通常由**N个**且**连续**的`page`组成，如下图所示：

##  **`mspan`由`page`组成**
---

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235014.png" style="width:100%">
</p>

- `mspan`可以由1个`page`组成
- `mspan`也可以由2个连续的`page`组成
- `mspan`也可以由3个连续的`page`组成
- `mspan`更可以由N个连续的`page`组成

上图左半部分是`mspan`的结构体的关键字段，其中`npages`就代表了这个`mspan`是由几个连续的`page`组成。

除此之外，`mspan`和`mspan`之间还可以构成链表，如下图所示

##  **`mspan`可构成链表**
---

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235024.png" style="width:100%">
</p>

这里需要注意的是：**只有`npages`的值相同的`mspan`互相才可以组成一个链表**。如上图所示，具体原因下文会讲。

> 看到这里，你会以为Go是按页`page`8KB为最小单位分配内存的吗？

答案：当然不是，如果这样的话会导致内存使用率不高。Go语言内存管理器会把`mspan`再拆解为更小粒度的单位`object`。如下图所示：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220423214224.png" style="width:100%">
</p>

`object`和`object`之间构成一个链表，大家这里肯定会想到是`LinkedList`，实际上并不是，因为`LinkedList`节点自身的指针也会占用8B内存，作为内存管理器，这部分内存会被白白浪费掉，所以这里通常使用的数据结构是`FreeList`。

## **什么是FreeList？**
---

`FreeList`本质上还是个`LinkedList`，和`LinkedList`的区别：

- `FreeList`没有`Next`属性，所以不是用`Next`属性存放下一个节点的指针的值。
- `FreeList`“相当于使用了`Value`的前8字节”(其实就是整块内存的前8字节)存放下一个节点的指针。
- 分配出去的节点，节点整块内存空间可以被复写(指针的值可以被覆盖掉)

如下图所示：

<p align="center">
  <img src="http://cdn.tigerb.cn/20210124224723.png" style="width:100%">
</p>

> 所以：`FreeList`一个节点最小为8字节Byte

```
备注：因为要存指针，指针的大小为8字节，为什么？可以参考之前文章《64位平台下，指针自身的大小为什么是8字节？》
```

得到Go内存管理单元`mspan`被拆解为`object`图示如下：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220423215017.png" style="width:100%">
</p>

> 到这里问题又来了，`object`的具体大小是多大呢，是怎么决定的？

答案：是由`sizeclass`决定的。

## **什么是`sizeclass`？**
---

`sizeclass`是一个映射列表，实际是一个数组类型`[68]uint16`，它的值决定了`object`的大小，除此之外，`mspan`由几pages构成也是`sizeclass`值决定的。`sizeclass`映射列表的具体规则如下：

```
// 文件位置：`src/runtime/sizeclasses.g`
// 索引0位置被保留使用，具体使用位置后续会讲。

如上文所述，`object`之间采用freelist数据结构构成链表，指针为8Byte所以最小的object大小为8Byte

字段解释：
class: sizeclass值 
bytes/obj: 该`mspan`拆分object大小
bytes/span: 该`mspan`是由几pages组成
objects: 该`mspan`共计包含的object数量
tail waste: 该`mspan`拆分为object之后，mspan剩余末尾浪费的内存

// class  bytes/obj  bytes/span  objects     tail waste  max waste
//
//     1          8        8192     1024           0     87.50%
//     2         16        8192      512           0     43.75%
//     3         24        8192      341           8     29.24%
//     4         32        8192      256           0     21.88%
//     5         48        8192      170          32     31.52%
//     6         64        8192      128           0     23.44%
// 略...
//    62      20480       40960        2           0      6.87%
//    63      21760       65536        3         256      6.25%
//    64      24576       24576        1           0     11.45%
//    65      27264       81920        3         128     10.00%
//    66      28672       57344        2           0      4.91%
//    67      32768       32768        1           0     12.50%
```

`sizeclass`值|`object`大小|由几`pages`组成
---|---|---
0|保留|1page
1|8Byte|1pages
2|16Byte|1page
3|24Byte|1page
...|...|...
67|32KB|4pages

所以`mspan`结构体上只要维护一个`sizeclass`的字段，就可以知道该`mspan`中`object`的大小、数量。但是呢，实际上这个字段并不是`sizeclass`，而是`spanclass`，如下图所示：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220423211420.png" style="width:30%">
</p>

那么，问题又来了😂。

## **什么是`spanclass`？**
---

实际上Go内存管理单元`mspan`被分为了两类：

- 第一类：需要垃圾回收扫描的`mspan`，简称`scan`
- 第二类：不需要垃圾回收扫描的`mspan`，简称`noscan`

所以说**并不是所有的Go内存管理单元`mspan`会被垃圾回收扫描**。为了区别这两类`mspan`，Go语言把类型标识和上面`sizeclass`的值一起放在了同一个字段里，具体如下：

- `sizeclass`值左移一位：`sizeclass << 1`
- `sizeclass`值最后一位存类型
  + 最后一位为1：则是不需要垃圾回收扫描的`mspan`
  + 最后一位为0：则是需要垃圾回收扫描的`mspan`

图示如下：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220423213157.png" style="width:80%">
</p>

#  总结
---

##  **`mspan`拆分`object`总结**
---

这里我们以`spanclass`的10进制值为7的`mspan`为例：

|`spanclass`10进制值为7|
|------|
|可得，`spanclass`2进制为`0000 0111`|
|可得，`sizeclass`为`7>>1`：2进制`0000 0011`，10进制3|
|可得，`mspan`由1`page`组成，共计8KB(8192Byte)|
|可得，`object`大小为24Byte|
|可得，`mspan`共计包含341个`object`|
|可得，`mspan`尾部浪费8Byte|

具体图示如下：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235059.png" style="width:100%">
</p>

##  **`mspan`关键字段总结**
---

挑选`mspan`的几个重要字段，如下图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234945.png" style="width:30%">
</p>

字段名|解释
---|---
next、prev、list|`mspan`之间可以构成链表
startAddr|`mspan`内存的开始位置，N个连续`page`内存的开始位置
npages|`mspan`由几`page`组成
freeindex|空闲`object`链表的开始位置
nelems|一共有多少个`object`
spanclass|决定`object`的大小、以及当前`mspan`是否需要垃圾回收扫描
...|...



