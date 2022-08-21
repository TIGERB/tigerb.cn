* [首页](/)
* Go设计模式实战

  * [前言](patterns/)
  * [1.0 模板模式](patterns/template)
  * [2.0 责任链模式](patterns/responsiblity)
  * [3.0 组合模式](patterns/component)
  * [4.0 观察者模式](patterns/observor)
  * [5.0 策略模式](patterns/strategy)
  * [6.0 状态模式](patterns/state)
  * [7.0 并发组合模式](patterns/concurrency-component)
  * ...

* Go语言轻松进阶
  * [前言](kernal/)
  * [1.0 Map的设计与实现](kernal/map)
    * [1.1 本章导读](kernal/map?id=导读)
    * [1.2 一般map的实现思路](/kernal/map?id=一般map的实现思路)
    * [1.3 入门Go语言里map的实现](/kernal/map?id=go语言里map的实现思路入门程度)
    * [1.4 熟悉Go语言里map的实现](/kernal/map?id=go语言里map的实现思路熟悉程度)
    * [1.5 解疑答惑]()
      * [1.5.1 为什么说Go的Map是无序的?](/kernal/map-range)
      <!-- * [1.5.2 为什么读不到key时没有Panic?]() -->
      <!-- * [1.5.3 为什么并发写操作会Panic?]() -->

  * [2.0 内存与垃圾回收](kernal/memory)
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
      * [2.7.9 栈内存的分配](kernal/memory-alloc?id=栈内存的分配)
      * [2.7.10 堆内存的分配](kernal/memory-alloc?id=堆内存的分配)
    * [2.8 垃圾回收](kernal/memory-gc)
      
  * ...