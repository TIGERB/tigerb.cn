---
title: 回到本真，代码是如何运行的？
tags:
  - Go
  - 计算机原理
cover_index: >-
  https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807232114.png?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2022-07-10 15:20:11
---

> 本文特指Linux操作系统下和静态编译性语言，以及同步处理器

今天继续计算机基础系列第三篇文章。第一篇我们从图灵机开始初步了解了计算机的发展史，第二篇刨根问底我们写的代码到底是什么。今天我们就来看看二进制代码文件被执行之后是如何运行的？

历史文章回顾：

- [回到本真，梦回计算机发展史](https://mp.weixin.qq.com/s/hmy_ktuSBZvUqJtO5f_zZg)
- [回到本真，代码到底是什么？](https://mp.weixin.qq.com/s/rUwXUammEJ2vkmN7CFxW9w)
- 回到本真，代码是如何运行的？

## 温故知新

为了更好理解程序的运行原理，我们先来简单复习下之前的内容，详细内容可以点击上方文章链接查看。

### 如何实现自动计算？

1. 数学启蒙：伟大数学家们发起一个挑战：“制造一台机器可以自动计算数学问题？”
2. 理论计算机诞生：图灵机
3. 电子学发展：诞生晶体三极管，有两个状态导通(二进制1)和截止(二进制0)
4. 门电路诞生：逻辑问题可自动判定，多个晶体管组成了与门/或门/非门/异或门
5. 算术运算集成电路诞生：算术问题可以通过逻辑运算解决，多个门电路构成半加器/全加器/乘法器等
6. 现代计算机诞生：完全实现自动运算

图示如下，详细请移步历史文章[「回到本真，梦回计算机发展史」](https://mp.weixin.qq.com/s/hmy_ktuSBZvUqJtO5f_zZg)

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807222555.png" style="width:50%">
</p>

到此为止，我们了解了计算机自动运算的简易实现逻辑，接着问题来了：

> 如何告知计算机自动运算的内容？

```
答：这个就是程序员通过编写代码告知计算机的。
```

### 代码是什么？

简单来看代码主要包含两部分：

- 指令部分：中央处理器CPU可执行的指令
- 数据部分：常量等

代码包含了指令，代码被转化为可执行二进制文件，被执行后加载到内存中，中央处理器CPU通过内存获取指令，图示如下。详细请移步历史文章[「回到本真，代码到底是什么？」](https://mp.weixin.qq.com/s/rUwXUammEJ2vkmN7CFxW9w)

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220731175631.png" style="width:80%">
</p>

到此为止，程序员把中央处理器CPU需要执行的指令，通过执行二进制代码文件加载到了内存中，接着问题来了：

> CPU如何获取下一个待执行的指令？

```
答：CPU中的控制单元负责获取、解析指令。
```

## 代码是如何运行的？

进入今日正文「代码是如何运行的？」。

### CPU控制单元

CPU的控制单元负责从内存中获取指令，控制单元主要由三部分组成：

- 程序计数器PC
- 指令译码器
- 指令寄存器

|组成部分|作用|
|------|------|
|程序计数器PC|负责标记下一个待执行指令的在内存中的地址|
|指令译码器|解析指令，通过解析指令的操作码判断当前指令的具体操作，比如是加法还是减法运算等等|
|指令寄存器|负责暂存当前正在执行的指令|

CPU通过控制单元实现了从内存中获取指令、以及解析、暂存指令的功能。

### CPU执行指令过程

CPU执行指令简易过程分为三步：

- 取指：**CPU控制单元**从内存中获取指令
- 译指：**CPU控制单元**解析从内存中获取指令
- 执行指令：**CPU运算单元**负责执行具体的指令操作

我们通过一个简易的时序图来看看CPU获取并执行指令的过程：

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807232114.png" style="width:100%">
</p>

通过上图其实我们可能会有一个问题：

> 代码执行过程中的临时数据如何存储呢？

CPU除了控制单元、运算单元之外，还包含寄存器部分。寄存器包含：

- 数据寄存器：存数据本身
- 地址寄存器：存内存的地址

寄存器可以存储指令执行过程中的临时数据存储。但是呢，寄存器存储空间有限等原因(典型的取舍问题)通常使用内存存储中间数据。

使用内存存储中间数据又面临新的问题：

> 指令执行完成之后内存如何回收？

这里就诞生了我们熟悉的「栈内存」，通常使用栈内存来存储指令执行过程中的临时数据。

### 栈内存

> 为什么称之为栈内存?

为了简单理解这个问题，其实又回到了之前的文章[「18张图解密新时代内存分配器TCMalloc」](https://mp.weixin.qq.com/s/8sWt9bML8KkmF_6FD0J5FQ)的“内存的线性分配”章节，简单回顾下。

内存管理的最大两个问题：

- 内存的分配
- 内存的回收

内存最简单、高效的分配回收方式就是对一段**连续内存**的「**线性分配**」，栈内存的分配就采用了这种方式。栈内存的管理过程：

#### 栈内存的分配

栈内存分配逻辑：current - alloc

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807234036.png" style="width:100%">
</p>

#### 栈内存的释放

栈内存释放逻辑：current + alloc

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807234046.png" style="width:100%">
</p>

这样指令执行过程中的中间变量是不是就可以使用栈内存进行高效存储。其次通过如下图示可以看出：

- 栈内存的分配过程：看起来像不像数据结构「栈」的入栈过程。
- 栈内存的释放过程：看起来像不像数据结构「栈」的出栈过程。

所以同时你应该也理解了「为什么称之为栈内存？」。**栈内存是计算机对连续内存的采取的「线性分配」管理方式，便于高效存储指令运行过程中的临时变量。**

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220807235914.png" style="width:100%">
</p>

#### 函数作用域内指令数据依赖

但是这样还存在别的问题：

> 假如下一个指令对上一个指令存在数据依赖怎么办？

这里就要提到函数作用域和局部变量，假如如下一段简单的代码，函数`test`在执行完成`d := a + 1`这行代码对应指令之后，局部变量`a和d`不能被回收，怎么解决呢？

```go
package main

import "fmt"

func main() {
	a := 1
	b := 2
	c := test(a, b)
	fmt.Println(c)
}

func test(a, b int) (c int) {
	d := a + 1 // 执行完成之后，a和d的值临时存储在内存中，这时候不能被回收
	c = a + b + d
	return c
}
```

**答：在执行完成函数`test`之后再回收就可以了。**

#### 函数作用域外指令数据依赖

除此之外，假如函数`test`内变量是个指针且被函数外的代码依赖，如果对应变量内存被回收，这个指针就成了野指针不安全。怎么解决这个问题呢？

答：这就是「堆内存」的作用，比如Go语言在编译期会进行「逃逸分析」把分配在「栈」上的变量「分配到堆上去」。

### 堆内存

「堆内存」的问题函数执行完成之后不会被自动回收，所以通常通过「垃圾回收器」进行内存回收。关于「堆内存」这里就不多说了，后续继续开启关于Go语言「栈内存和堆内存的」详细篇章。

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20220808002156.png" style="width:100%">
</p>

下篇文章我们就回归主线，来彻底看看Go语言的「栈内存/堆内存」实现。