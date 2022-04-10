# 一文彻底搞懂栈内存和堆内存关系

## 前言

一旦聊到**栈内存、堆内存**的概念，大家肯定都会想到如下的知识点：

|栈内存|常见已知的知识点|
|---|---|
操作系统自动回收|是
分配方式|用户空间**由高地址向低地址**分配
内存来源|物理内存用户空间

|堆内存|常见已知的知识点|
|---|---|
操作系统自动回收|否
垃圾回收实现|编程语言(应用程序)
分配方式|用户空间**由低地址向高地址**分配
内存来源|物理内存用户空间

上述**常见已知的知识点**确实没什么问题，但是呢，描述还不够清晰和准确。

> 为什么？

重点来了，因为**栈内存、堆内存**的概念，其实需要基于两个不同维度去看：

- 维度1：物理内存维度
    + 栈内存
    + 堆内存
- 维度2：虚拟内存维度
    + 栈内存
    + 堆内存

这也是容易被大家忽略的点。其次如果每次深入学习或者给别人讲解**栈内存、堆内存**的时候，混淆了上述两个维度，会导致：

- 理解难度增大
- 描述过程混乱

## 什么是用户空间？

## 物理内存维度的「栈内存、堆内存」

回头看上面的**常见已知的知识点**其实都是基于「物理内存维度」的。

|栈内存|维度|常见已知的知识点|
|---|---|---|
操作系统自动回收|物理内存|是
分配方式|物理内存|用户空间**由高地址向低地址**分配
内存来源|物理内存|物理内存用户空间

|堆内存|维度|常见已知的知识点|
|---|---|---|
操作系统自动回收|物理内存|否
垃圾回收实现|物理内存|编程语言(应用程序)
分配方式|物理内存|用户空间**由低地址向高地址**分配
内存来源|物理内存|物理内存用户空间

但是呢，我们的应用程序实际是运行在「虚拟内存」上的。

## 什么是虚拟内存?

我们的进程(应用程序)是运行在虚拟内存上的，图示如下：

<p align="center">
  <img src="http://cdn.tigerb.cn/20210129194928.png" style="width:70%">
</p>

使用虚拟内存的原因如下：

- 对于我们的进程而言，可使用的内存是连续的
- 安全，防止了进程直接对物理内存的操作(如果进程可以直接操作物理内存，那么存在某个进程篡改其他进程数据的可能)
- 虚拟内存和物理内存是通过MMU(Memory Manage Unit)映射的
- 等等

## 虚拟内存维度的「栈内存、堆内存」


同样「虚拟内存」也被开辟了「栈内存、堆内存」不同的区域，方便应用程序映射到实际的物理内存上，但是和物理内存的管理方式还不太一样。这里我们以Go语言为例看看差异：

- Go的虚拟内存统一由「内存管理器Memory Allcoator」管理
- 虚拟内存维度的**栈内存**来自于由「内存管理器 Memory Allcoator」统一分配
- 虚拟内存维度的**堆内存**来自于由「内存管理器 Memory Allcoator」统一分配
- 虚拟内存维度的**栈内存**来源于虚拟内存维度的**堆内存**`mheap`

关系图示如下：

<p align="center">
<img src="http://cdn.tigerb.cn/20220503213918.png
" style="width:80%">
</p>

得到：

|栈内存|维度|常见已知的知识点|
|---|---|---|
操作系统自动回收|虚拟内存|?
分配方式|虚拟内存|由内存管理器统一分配
内存来源|虚拟内存|虚拟内存堆内存`mheap`

|堆内存|维度|常见已知的知识点|
|---|---|---|
操作系统自动回收|虚拟内存|否
垃圾回收实现|虚拟内存|编程语言(应用程序)
分配方式|虚拟内存|由内存管理器统一分配
内存来源|虚拟内存|虚拟内存堆内存`mheap`

## 总结

以**Go语言为例**基于不同维度总结下「栈内存、堆内存」的关键点、以及基于不同维度的差异。如下：

|栈内存|维度|常见已知的知识点|
|---|---|---|
操作系统自动回收|虚拟内存、物理内存|是
自动回收实现|物理内存|操作系统
分配方式|虚拟内存|由内存管理器统一分配
分配方式|物理内存|用户空间**由高地址向低地址**分配
内存来源|虚拟内存|虚拟内存堆内存`mheap`
内存来源|物理内存|物理内存用户空间


|堆内存|维度|常见已知的知识点|
|---|---|---|
操作系统自动回收|虚拟内存、物理内存|否
垃圾回收实现|虚拟内存、物理内存|编程语言(应用程序)
分配方式|虚拟内存|由内存管理器统一分配
分配方式|物理内存|用户空间**由低地址向高地址**分配
内存来源|虚拟内存|虚拟内存堆内存`mheap`
内存来源|物理内存|物理内存用户空间




# 栈内存的分配

## 栈内存分配函数

栈内存分配的时机

- 1.创建`Goroutinue`
    + 创建`g0`
    + 创建`g`

创建一个全新`g`函数

```go
// src/runtime/proc.go::3943
// 创建一个指定栈内存的g
func malg(stacksize int32) *g {
	newg := new(g)
	if stacksize >= 0 {
		// ...略
		systemstack(func() {
            // 分配栈内存
			newg.stack = stackalloc(uint32(stacksize))
		})
		// ...略
	}
	return newg
}
```

创建`g0`
```go
// src/runtime/proc.go::1720
// 创建 m
func allocm(_p_ *p, fn func(), id int64) *m {
    // ...略
    if iscgo || mStackIsSystemAllocated() {
		mp.g0 = malg(-1)
	} else {
        // 创建g0 并申请8KB栈内存
		mp.g0 = malg(8192 * sys.StackGuardMultiplier)
	}
    // ...略
}
```

创建`g`
```go
// src/runtime/proc.go::3999
// 创建一个带有任务fn的goroutine
func newproc1(fn *funcval, argp unsafe.Pointer, narg int32, callergp *g, callerpc uintptr) *g {
    // ...略
    newg := gfget(_p_)
	if newg == nil {
        // 全局队列、本地队列找不到g 则 创建一个全新的goroutine
        // _StackMin = 2048
        // 申请2KB栈内存
		newg = malg(_StackMin)
		casgstatus(newg, _Gidle, _Gdead)
		allgadd(newg)
	}
    // ...略
}
```

```
g0申请8KB栈内存
g申请2KB栈内存
不在本章节范围，后续Go的调度系列会介绍
```

- 2.栈扩容

```go
// src/runtime/stack.go::838
func copystack(gp *g, newsize uintptr) {
	// ...略

	// 分配新的栈空间
	new := stackalloc(uint32(newsize))

    // ...略
}
```


都指向了 函数 `stackalloc`

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405133309.png" style="width:50%">
</p>

分析 `stackalloc`

分析 `stackalloc`来源于

全局变量

- 1.`var stackpool`
- 2.`var stackLarge`

进一步分析全局变量 `var stackpool`和`var stackLarge`内存的来源

来自`mheap`

- 栈内存和堆内存都是统一由内存管理器管理`allco`
- 栈内存来自于`mheap`堆内存

<p align="center">
  <img src="http://cdn.tigerb.cn/20220503213918.png
" style="width:80%">
</p>

- 小于32KB的栈内存
- 大于32KB的栈内存

### 小于32KB栈分配过程

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234800.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234810.png" style="width:80%">
</p>


### 大于等于32KB栈分配过程

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234822.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234828.png" style="width:80%">
</p>