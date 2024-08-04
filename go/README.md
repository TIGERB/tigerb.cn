# 《Go语言轻松进阶：从入门、实战到内核揭秘》简介

---

> 全面解析Go语言，从新手入门到实战应用，再到内核机制，一应俱全。

<p>
    <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20210109200839.png" width="30%" style="box-shadow: 3px 3px 3px 3px #ddd;">
</p>

## 目标

- 把理解后的知识，使用更通俗易懂的方式表述出来，方面大家更容易的学习，简化学习成本

## 版权申明

- 未经版权所有者明确授权，禁止发行本手册及其被实质上修改的版本（形式包含文章、视频、播客等任意媒体等）。
- 未经版权所有者事先授权，禁止将此作品及其衍生作品以标准（纸质）书籍形式发行。
- 未与任何第三方以任何形式合作。

<p>
    <img style="vertical-align:middle" width="20%" src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>

--- 

## 目录

* 《Go语言轻松进阶：从入门、实战到内核揭秘》
* [首页](/)
* 第一章：入门
  * [1.0 Go语言介绍](base/start?id=Go语言介绍)
  * [2.0 Go基础语法](base/start?id=Go基础语法)
    * [2.1 Go常用基本类型](base/start?id=Go常用基本类型)
    * [2.2 Go常用基本类型初始化方式](base/start?id=Go常用基本类型初始化方式)
    * [2.3 Go结构体的初始化](base/start?id=Go结构体的初始化)
    * [2.4 Go常用函数](base/start?id=Go常用函数)
  * [3.0 Go避坑指南](base/start?id=Go避坑指南)
* 第二章：实战
  * [1.0 常用包使用介绍](base/experience?id=常用包使用介绍)
    * [1.1 热加载工具bee](base/experience?id=热加载工具bee)
    * [1.2 sync.WaitGroup包使用](base/experience?id=Goroutine并发控制之syncWaitGroup包的使用)
    * [1.3 context.Context包使用](base/experience?id=子Goroutine超时控制之contextContext包的使用)
    * [1.4 sync.Map包使用](base/experience?id=并发安全的map之syncMap包的使用)
    * [1.5 sync.Pool包使用](base/experience?id=减少GC压力之syncPool包的使用)
    * [1.6 singleflight包使用](base/experience?id=减少缓存穿透利器之singleflight包的使用)
    * [1.7 channel的使用](base/experience?id=channel的使用)
  * [2.0 设计模式实战](patterns/)
    * [2.1 模板模式](patterns/template)
    * [2.2 责任链模式](patterns/responsiblity)
    * [2.3 组合模式](patterns/component)
    * [2.4 观察者模式](patterns/observor)
    * [2.5 策略模式](patterns/strategy)
    * [2.6 状态模式](patterns/state)
    * [2.7 并发组合模式](patterns/concurrency-component)
  * [3.0 单元测试&基准测试](base/experience?id=单元测试&基准测试)
    * [3.1 单元测试](base/experience?id=单元测试)
    * [3.2 基准测试](base/experience?id=基准测试)
  * [4.0 性能分析](base/experience?id=性能分析)
    * [4.1 pprof使用](base/experience?id=pprof的使用)
    * [4.0 trace工具使用](base/experience?id=trace工具的使用)
    * [4.0 dlv工具使用](base/experience?id=dlv工具的使用)
  * [5.0 逃逸分析](base/experience?id=逃逸分析)
  * [6.0 汇编代码生成](base/experience?id=汇编代码生成)
* 第三章：内核
  * [**1.0 Map的设计与实现**](kernal/map)
    * [1.1 本章导读](kernal/map?id=导读)
    * [1.2 一般map的实现思路](/kernal/map?id=一般map的实现思路)
    * [1.3 入门Go语言里map的实现](/kernal/map?id=go语言里map的实现思路入门程度)
    * [1.4 熟悉Go语言里map的实现](/kernal/map?id=go语言里map的实现思路熟悉程度)
    * [1.5 解疑答惑](/kernal/map-range)
      * [1.5.1 为什么说Go的Map是无序的?](/kernal/map-range)
      <!-- * [1.5.2 为什么读不到key时没有Panic?]() -->
      <!-- * [1.5.3 为什么并发写操作会Panic?]() -->

  * [**2.0 内存与垃圾回收**](kernal/memory)
    * [2.1 本章导读](kernal/memory?id=导读)
    * [2.2 指针的大小](kernal/memory-pointer)
    * [2.3 内存的线性分配](kernal/tcmalloc?id=内存的线性分配)
    * [2.4 什么是FreeList？](kernal/tcmalloc?id=什么是freelist？)
    * [2.5 虚拟内存](kernal/tcmalloc?id=虚拟内存)
    * [2.6 什么是TCMalloc？](kernal/tcmalloc?id=什么是tcmalloc？)
      * [2.6.1 基本概念](kernal/tcmalloc?id=TCMalloc中的五个基本概念)
      * [2.6.2 基本结构](kernal/tcmalloc?id=解密Tcmalloc的基本结构)
      * [2.6.3 内存分配过程](kernal/tcmalloc?id=解密Tcmalloc的内存分配过程)
    * [2.7 Go内存管理](kernal/memory-arch)
      * [2.7.1 本节导读](kernal/memory-arch?id=导读)
      * [2.7.2 内存管理架构](kernal/memory-arch?id=go内存管理架构)
      * [2.7.3 有趣的问题](kernal/memory-mcache)
      * [2.7.4 内存管理单元`mspan`](kernal/memory-mspan)
      * [2.7.5 计算机为什么需要内存？](kernal/memory-alloc?id=计算机为什么需要内存？)
      * [2.7.6 为什么需要栈内存？](kernal/memory-alloc?id=为什么需要栈内存？)
      * [2.7.7 为什么需要堆内存？](kernal/memory-alloc?id=为什么需要堆内存？)
      * [2.7.8 分配的是虚拟内存](kernal/memory-alloc?id=分配的是虚拟内存)
      * [2.7.9 什么是进程栈？](kernal/gc-what-stack?id=进程栈)
      * [2.7.10 什么是线程栈？](kernal/gc-what-stack?id=线程栈)
      * [2.7.11 什么是协程栈？](kernal/gc-what-stack?id=协程栈)
      * [2.7.12 栈内存(协程栈)的分配](kernal/memory-alloc?id=栈内存的分配)
      * [2.7.13 堆内存的分配](kernal/memory-alloc?id=堆内存的分配)
    * [2.8 垃圾回收](kernal/memory-gc)
      * TODO
  * 3.0 channel的设计与实现
    * TODO
  * [**5.0 Goroutine的调度**](kernal/GMP)
    * [5.1 GMP到底是什么？](kernal/GMP?id=gmp只是结构体)
      * [5.1.1 GMP只是结构体](kernal/GMP?id=gmp只是结构体)
      * [5.1.2 GMP是系统线程运行的代码片段](kernal/GMP?id=gmp是系统线程运行的代码片段)
      * [5.1.3 GMP是类似面相对象思想的封装](kernal/GMP?id=gmp是类似面相对象思想的封装)
      * [5.1.4 G职责解析](kernal/GMP?id=g职责解析)
      * [5.1.5 M职责解析](kernal/GMP?id=m职责解析)
      * [5.1.6 P职责解析](kernal/GMP?id=p职责解析)
    * [5.2 Goroutine调度过程](kernal/GMP?id=g职责解析) 
      * [5.2.1 g和函数绑定过程](kernal/GMP?id=g和函数绑定过程)
      * [5.2.2 g恢复上下文过程](kernal/GMP?id=g恢复上下文过程)
      * [5.2.3 g保存上下文过程](kernal/GMP?id=g保存上下文过程)
    * [5.3 Goroutine的调度总结](kernal/GMP?id=总结) 
  * ...



```
参考：
1.《Go语言设计与实现》https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-hashmap/
2.《Go语言高级编程》https://chai2010.cn/advanced-go-programming-book/
3. Go源码版本1.13.8 https://github.com/golang/go/tree/go1.13.8/src
4. Go源码版本1.16
5. Go源码版本1.19
```