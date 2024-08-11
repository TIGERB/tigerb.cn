---
title: 初识协程栈
tags:
  - Go
cover_index: >-
  https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E8%BF%9B%E7%A8%8B%E6%A0%88-%E6%80%BB%E7%BB%93.png?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2023-8-27 19:27:11
---

# 前言
---

本文拉开垃圾回收部分序幕（预告：会切入一些关键点分析，杜绝千篇一律的内容）。由于Go协程的栈是Go运行时管理的，并分配于堆上，不由操作系统管理，所以我们先来看看协程栈的内存如何被Go运行管理和回收的。本篇文章先从初步认识协程栈开始。

为了对协程栈有个初步的认识，我们先来回顾数据结构中栈的概念，再来看看内存栈的概念作用，最后我们再来通过对比进程中的栈内存和线程中的栈内存来对协程中的栈内存有个初步的认知，全文大致结构如下：

1. 回顾数据结构中栈的概念
2. 内存管理中栈的概念
3. 理解进程栈和线程栈
4. 认识协程栈

# 数据结构中栈的概念
---

栈是一种先进后出(Frist In Last Out)的数据结构。第一个元素所在位置为栈底，最后一个元素所在位置为栈顶。栈顶添加一个元素的过程为压栈(入栈)，栈顶移出一个元素的过程为出栈(弹栈)。如下图所示：

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E6%A0%88(%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84).png" style="width:100%">
</p>

# 内存管理中栈的概念
---

## **栈内存**

## **什么是栈内存？**

栈内存是计算机对连续内存的采取的「线性分配」管理方式，便于高效存储指令运行过程中的临时变量等。

1. 栈内存分配逻辑：current - alloc

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807234036.png" style="width:80%">
</p>

2. 栈内存释放逻辑：current + alloc

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807234046.png" style="width:80%">
</p>

- 栈内存的分配过程：看起来像不像数据结构「栈」的压栈过程。
- 栈内存的释放过程：看起来像不像数据结构「栈」的出栈过程。

## **什么是栈空间？**

栈空间是一个固定值，决定了栈内存最大可分配的内存范围，也就是决定了栈顶的上限。

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E6%A0%88(%E5%86%85%E5%AD%98-%E6%A0%88%E7%A9%BA%E9%97%B4).png" style="width:100%">
</p>

## **栈内存的作用？**

总的来说就是存放程序运行过程中，指令传输的、生产的各种临时变量的值，和函数递归调用过程的上文信息，以及进程、线程、协程切换的上下文信息。

- 存放函数执行过程中的参数的值
- 存放函数执行过程中的局部变量的值
- 发生函数调用时，存放调用函数栈帧的栈基BP的值(下篇文章详细讲)
- 发生函数调用时，存放调用函数下一个待执行指令的地址(下篇文章详细讲)
- 等等

接着我有两个问题：

1. 谁决定了栈空间的大小范围？
2. 谁决定了代码在运行过程中，从栈空间分配或释放多少内存？

我们分别从「进程栈」和「线程栈」、「协程栈」视角看看以上两个问题。

## **进程栈**

> 什么是进程栈？

```
答：位于进程虚拟内存的用户空间，以用户空间的高地址开始位置作为栈底，向地址分配。如下图所示：
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E8%BF%9B%E7%A8%8B%E6%A0%88.png" style="width:100%">
</p>

> 谁决定了栈空间(进程栈)的大小范围？

```
答：操作系统的配置决定，可通过`ulimit -s`查看。示例如下：
```

啊

```
(TIGERB) 🤔 ➜  go1.16 git:((go1.16)) ✗ ulimit -s
8192  //注释：单位kb，8m
(TIGERB) 🤔 ➜  go1.16 git:((go1.16)) ✗ ulimit -a
-t: cpu time (seconds)              unlimited
-f: file size (blocks)              unlimited
-d: data seg size (kbytes)          unlimited
-s: stack size (kbytes)             8192      //注释：单位kb，8m
-c: core file size (blocks)         0
-v: address space (kbytes)          unlimited
-l: locked-in-memory size (kbytes)  unlimited
-u: processes                       1392
-n: file descriptors                256
```

> 谁决定了代码在运行过程中，从栈空间(进程栈)分配或释放多少内存？

```
答：编译器决定。详细解释如下：
```

代码编译时，编译器会插入分配和释放栈内存的指令，比如像下面这段简单的程序一样：

一段简单的加法示例代码：

```Go
// 源代码
package main

func main() {
	a := 1
	b := 2
	c := a + b
	// 略...
}
```

编译以上代码时，编译器会插入分配(SUB)和释放(ADD)栈内存的指令：

```
// 汇编伪代码
SUB 24, SP // 栈上分配24字节内存 3*8byte（分配栈内存指令）
略...
ADD 24, SP // 栈上释放24字节内存 3*8byte（释放栈内存指令）
略...
```

最后汇编代码转换为二进制代码：

```
// 二进制伪代码 随便乱写的
011100011000000101...
```

## **进程栈总结**

「进程栈」位于虚拟内存的用户空间，进程栈的栈底为用户空间部分高地址的开始位置。进程栈的栈空间大小为固定值，由操作系统的配置决定。进程运行过程中栈内存的分配和释放的时机和大小值由编译器决定。

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E8%BF%9B%E7%A8%8B%E6%A0%88-%E6%80%BB%E7%BB%93.png" style="width:100%">
</p>


## **线程栈**

> 什么是线程栈？

```
答：创建一个线程时，使用malloc从堆上分配一块连续内存作为线程的栈空间。
```

伪代码示例：
```C++
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define STACK_SIZE 1024 * 1024 // 栈空间大小

int main() {
    pthread_t thread;
    void* stack = malloc(STACK_SIZE); // 堆上申请一块内存

    // ...

    pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_attr_setstack(&attr, stack, STACK_SIZE); // 设置线程栈

    int ret = pthread_create(&thread, &attr, thread_func, NULL); // 创建线程

    // ...
}
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E7%BA%BF%E7%A8%8B%E6%A0%88.png" style="width:100%">
</p>

> 谁决定了栈空间(线程栈)的大小范围？

```
答：创建线程的运行时。
```

> 谁决定了代码在运行过程中，从栈空间(线程栈)分配或释放多少内存？

```
答：同进程，编译器决定。
```

## **协程栈**

> 什么是协程栈？

```
答：使用`go`关键字创建一个协程时，Go运行时从堆上分配一块连续内存作为协程的栈空间。
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal%2F%E5%8D%8F%E7%A8%8B%E6%A0%88.png" style="width:100%">
</p>

> 谁决定了协程栈的栈空间的大小范围？

```
答：Go运行时决定，g0为8KB，g为2KB
```

创建`g0`函数代码片段：

```go
// src/runtime/proc.go::1720
// 创建 m
func allocm(_p_ *p, fn func(), id int64) *m {
    // ...略
    if iscgo || mStackIsSystemAllocated() {
		mp.g0 = malg(-1)
	} else {
        // 创建g0 并申请8KB栈内存
        // 依赖的malg函数
		mp.g0 = malg(8192 * sys.StackGuardMultiplier)
	}
    // ...略
}
```

创建`g`函数代码片段：

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
      // 依赖的malg函数
      newg = malg(_StackMin)
      casgstatus(newg, _Gidle, _Gdead)
      allgadd(newg)
    }
    // ...略
}
```

以上都依赖`malg`函数代码片段，其作用是创建一个全新`g`：

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

> 谁决定了代码在运行过程中，从协程栈的栈空间分配或释放多少内存？

```
答：同进程、线程，都由编译器决定。
```

# 总结
---

类型|创建时机|谁决定栈空间大小|内存位置|谁来分配和释放栈内存
------|------|------|------|------
进程栈|进程启动时|操作系统配置，`ulimit -s`|虚拟内存的用户空间栈区|编译器，汇编`SUB`、`ADD`指令
线程栈|创建线程时|创建线程的运行时，`pthread_attr_setstack`|虚拟内存的用户空间进程堆区域|编译器，汇编`SUB`、`ADD`指令
协程栈|使用`go`关键字运行函数时|Go运行时，`malg(栈内存)`g0 8KB、g 2KB|虚拟内存的用户空间进程堆区域|编译器，汇编`SUB`、`ADD`指令