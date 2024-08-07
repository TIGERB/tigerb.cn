# 关于Go内存架构，一个有趣的问题

<p>
    <img style="vertical-align:middle" width="20%" src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>

在学习Go语言内存管理部分过程中，发现了一个很有意思的问题，今天就借助这篇文章：

- 1.把这个问题也抛给大家，建议大家看见这个问题后，可以先自己思考一番🤔之后再读下文。
- 2.进一步强化大家对Go内存架构的理解

开始本篇文章之前，我们快速回顾下「Go内存架构」相关的核心知识点，**温故知新**。

## 快速回顾「TCMalloc内存管理架构」

先来简单回顾下「TCMalloc内存管理架构」。详细讲解可查看之前的文章[《18张图解密新时代内存分配器TCMalloc》](http://tigerb.cn/2021/01/31/go-base/tcmalloc/)

### 痛点

多线程时代 `--->` 线程共享内存 `--->` 线程申请内存会产生竞争 `--->` 竞争加锁 `--->` 加锁影响性能。

### 解法

每个线程上增加内存缓存。

简易架构图如下：

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20210120132244.png" style="width:66%">
</p>

## 快速回顾「Go内存管理架构」

接着简单回顾下「Go内存管理架构」。详细讲解可查看之前的文章[《浅析Go内存管理架构》](http://tigerb.cn/2022/04/10/go-base/memory-arch/)

### 痛点

同上。

### 解法

同上，基于「TCMalloc」实现。

简易架构图如下：

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220405224809.png" style="width:60%">
</p>

## 有趣的问题

关于这个有趣的问题，细心的朋友可能已经发现了，不卖关子了问题如下：

> 为什么Go的内存管理器的线程缓存是`mcache`被逻辑处理器`p`持有，而并不是被真正的系统线程`m`持有?

## 个人思考时间

是不是很有意思，关于这个问题。对面的你不妨先停下来思考几分钟：

> 为什么？

## 解密

按照原`TCMalloc`的设计思想，线程缓存`mcache`确实应该被绑定到系统线程`M`上。

那么我们就假设：**按照原`TCMalloc`的思想，把`mcache`绑定系统线程`M`上**。接着我们只需要看看这个**假设**有什么问题即可。

要论证这个假设需要先来简单看看「Go的调度模型`GMP`」。

### Go的调度模型`GMP`

直接上入门级「Go的调度模型`GMP`」架构图：

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220416214452.png" style="width:80%">
</p>

关于「Go的调度模型`GMP`」的原理，大家应该看了无数文章，我这里就不细说了，如果还有不熟悉可以自行搜索哈。

这里简单提下关于`GMP`的入门级知识哈，其实`GMP`对应的只是Go语言自身的逻辑结构而已，含义如下：

- `M`：代表结构体`m`，全称`Machine`，这个结构体的核心是会和真正的`系统线程thread`绑定。
- `G`：代表结构体`g`，全称`Goroutine`，这个结构体就是大家熟知的`协程`，简单理解其实就是这个结构体绑定了一个有着被并发执行需求的函数。
- `P`：代表结构体`p`，全称`Processor`，这个结构体表示`逻辑处理器`，通过这个结构体和计算机的逻辑处理器建立对应关系，`P`的数量通常和计算机的逻辑处理器数量一致通过`runtime.GOMAXPROCS(runtime.NumCPU())`设置。

三者的简单职责以及关系：

- `P`
	+ 和一个`M`互相绑定
	+ 维护了一个可执行`G`的队列
- `M`
	+ 和一个`P`互相绑定
	+ 负责执行`G`的调度，通过调度当前`M`绑定的`P`的`G`队列、以及全局`G`队列，达到`G`可被并发执行的目的。
	+ 负责执行`P`调度过来的当前`G`


**此阶段结论：**以上的调度过程`P`的数量和`M`的数量是一一对应的，所以把`mcache`绑定系统线程`M`上和`P`看起来都可以。所以我们上面的假设「**按照原`TCMalloc`的思想，把`mcache`绑定系统线程`M`上**」目前看起来确实也没啥问题。

我们继续往下看，一种特殊的场景`M`会和`P`解绑。

### I/O操作的系统调用

当`G`执行一个I/O操作的系统调用时，比如`read`、`write`，因为系统调用过程中的阻塞(原因：内核往用户态拷贝数据的过程产生的阻塞，不在本文范畴，后续文章详解)问题，会发生如下操作：

- 当前`G`(我们命名为`g1`)的`M`(我们命名为`m1`)和当前的`P`(我们命名为`p1`)解绑
- 上面的`p1`会绑定一个其他的`M`(`m2`)
- `m1`执行完成系统调用之后会被放到闲置`M`链表里

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220416223807.png" style="width:100%">
</p>

由于`m1`会被放进闲置链表，这是不是就意味着`m1`上的`mcache`当前就不能被复用，所以这样看起来是不是`mcache`绑定到`p1`上更合适。

**结论：** 由于`M`可能因为执行一个I/O操作的系统调用被阻塞(原因：内核往用户态拷贝数据的过程产生的阻塞），`M`会和当前`P`解绑，当前`P`绑定其他闲置或者新的`M`，之前的`M`结束系统调用会被放进闲置`M`链表。之前的`M`的`mcache`就不会得到有效的复用，反而`mcache`绑定到`P`上就不存在这个问题，所以`mcache`绑定到`P`上更合适。

### 源码论证

通过Go的源码进一步证明我们的结论。

- 代码位置：`src/runtime/proc.go::3813`
- 函数名称：`func exitsyscall0(gp *g)`

源码如下：

```go
// Go版本1.6
// 退出系统调用的代码逻辑
// 代码位置
// src/runtime/proc.go::3813
func exitsyscall0(gp *g) {
	_g_ := getg()

	casgstatus(gp, _Gsyscall, _Grunnable) // 把执行系统调用的g从系统调用状态改为可执行
	dropg()
	lock(&sched.lock) 
	var _p_ *p
	if schedEnabled(_g_) {
		_p_ = pidleget() // 找空闲的p 
	}
	if _p_ == nil {
		globrunqput(gp) // 找不到空闲的p 则放进全局队列
	} else if atomic.Load(&sched.sysmonwait) != 0 {
		atomic.Store(&sched.sysmonwait, 0)
		notewakeup(&sched.sysmonnote)
	}
	unlock(&sched.lock)
	if _p_ != nil {
		acquirep(_p_)
		execute(gp, false) // 执行当前因系统调用阻塞的g
	}
	if _g_.m.lockedg != 0 {
		stoplockedm()
		execute(gp, false) // 执行当前因系统调用阻塞的g
	}
	stopm() // 停止m，并放到调度器的m闲置链表
	schedule() // 触发调度
}
```

<p>
    <img style="vertical-align:middle" width="20%" src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>