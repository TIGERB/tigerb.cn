# 导读
---

```
本系列基于64位平台、1Page=8KB
```

今天我们开始拉开《Go语言轻松系列》第二章「内存与垃圾回收」的序幕。

<p align="center">
  <img src="http://cdn.tigerb.cn/20210109200839.png" style="width:36%;box-shadow: 3px 3px 3px 3px #ddd;">
</p>

关于「内存与垃圾回收」章节，大体从如下三大部分展开：

- 知识预备(为后续的内容做一些知识储备)，知识预备包括
  + 指针的大小
  + Tcmalloc内存分配原理
- Go内存设计与实现
- Go的垃圾回收原理