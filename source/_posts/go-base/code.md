---
title: 回到本真，代码到底是什么？
tags:
  - Go
  - 计算机原理
cover_index: >-
  http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220731175631.png?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2022-07-10 15:20:11
---

> 本文特指Linux操作系统下和静态编译性语言

## 代码即文本

**我们写的「代码」只是个普通的文本文件**，因为编译器等方式得以转化为二进制代码。代码文本从最早期的「二进制代码」演化到现在百花齐放的「编程语言代码」，粗略演化路线：

- 二进制代码：初期二进制代码文本并不具备可读性，假如让你直接编写二进制代码，“也许你一辈子都在调试代码错误？😏”
- 汇编代码：为了让代码更易于人们编写和阅读，产生了「汇编代码」
- 编程语言代码：然而编写汇编代码也不是一件简单的事情，随着编程技术的发展，诞生了众多编程语言，比如C、C++、Go等等，进一步提升了代码的：
  + 可读性(语法、面向对象等等)
  + 可复用(库、面向对象等等)
  + 性能和效率等(内存分配器、垃圾回收器、协程调度器等等)
  + 等等

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220717220428.png" style="width:90%">
</p>

> 现代编程语言语言，可以让我们更加高效编写程序。

以Go语言为例，最终Go代码汇编「编译器」转化为「汇编代码」，再到「二进制代码」文件。

我们的代码文本都包含了什么？

## 代码包含CPU指令和预置数据

为了简化理解，粗略来看代码主要分为两部分：

- 指令部分：CPU可执行的指令
- 数据部分：指令执行过程中依赖的数据，常量或者输入设备的数据

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220725132320.png" style="width:90%">
</p>


|代码逻辑类型|对应CPU指令类型|
|----------|----------|
传输数据逻辑：比如你平常写的代码一个变量的数据或者常量赋值到另个变量 | 数据传输指令MOV
算术运算逻辑：代码文本里描述的四则运算等等 | 运算指令
条件分支逻辑：代码文本里各种`if`的判断等等 | JMP跳转指令
函数调用逻辑：代码文本里各种的调用函数 | CALL/RETURN指令
等等 | ...

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220728133011.png" style="width:90%">
</p>

当二进制代码文件被执行时：

- 指令被加载进内存
- 预置数据被加载进内存

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220725131631.png" style="width:90%">
</p>

同样被加载到内存中的「代码」也主要分为两部分：

- 指令部分：传输、算术、跳转jmp、函数调用CALL/退出RETURN等指令
- 数据部分：文本代码中预置的数据，比如常量等

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220725132155.png" style="width:90%">
</p>

## CPU读取指令

二进制代码被加载到内存之后，中央处理器CPU就可以从内存中读取指令、解析并执行指令，同时执行指令过程中有需要的话「中央处理器CPU」从内存中读取代码中预置数据(常量等)。这里代码运行过程就是我们通常说到的「运行时 runtime」。

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220731163738.png" style="width:90%">
</p>

## 总结

1. 计算机自动运行核心：CPU执行指令
2. CPU从内存读取指令
3. 内存中的指令来源于被执行的二进制文件
4. 二进制文件由源代码文本经过编译等方式转化而来
5. 程序员根据需求编写源代码文本

<p align="center">
  <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220731175631.png" style="width:100%">
</p>


> 所以综上所述，我们写的代码到底是什么？

```
答：包含CPU指令和预置数据的文本文件。
```

## 预告

下篇文章我们就来看看：

> 程序是如何运行的？