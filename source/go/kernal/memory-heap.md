# 堆内存的分配


## 导读

前几篇文章讲解了

- Go内存管理架构
- Go内存管理单元`mspan`

> 如何具体分配内存的呢？

接下来就来解开这层面纱。

同样Go语言把虚拟内存从逻辑上分成了：

- 栈内存
- 堆内存

## 什么是栈内存？

正常情况下，我们的程序在执行过程中

管理便捷 内存分配释放简单

## 为什么需要堆内存？

`函数A` --调用--> `函数B`

如果`函数B`局部变量`b`是个指针，并被外部`函数A`的局部变量`a`持有，`函数B`执行完毕，`函数B`局部变量`b`指向地址的内存会被释放，则`函数A`的局部变量`a`指向的地址无效  不安全

`函数B`局部变量`b` 需要被分配到 堆内存上 由垃圾回收机制 回收 安全

这个过程就是**内存逃逸**

**分别从内存分配时机、以及分配过程来讲解**。

## 堆内存分配时机

**内存逃逸**。

编译阶段 编译器会判断变量是否发生了**内存逃逸**，如果发生了**内存逃逸**则编译器会调用指定的函数从堆上分配内存

函数如下，整理了一些眼熟的函数 关于 切片、字符串、Channel、Map

类型|名称|描述|代码位置
---|---|---|---
切片|`makeslice(et *_type, len, cap int) unsafe.Pointer`|创建切片|src/runtime/slice.go::83
切片|`growslice(et *_type, old slice, cap int) slice`|切片扩容|src/runtime/slice.go::125
切片|`makeslicecopy(et *_type, tolen int, fromlen int, from unsafe.Pointer) unsafe.Pointer`|copy切片|src/runtime/slice.go::36
字节字符串|`gobytes(p *byte, n int) (b []byte)`|转换字符串`string`为`[]byte`类型|src/runtime/string.go::301
字节字符串|`slicebytetostring(buf *tmpBuf, ptr *byte, n int) (str string)`|转换字节字符串`[]byte`为类型`string`|src/runtime/string.go::80
字节字符串|`rawstring(size int) (s string, b []byte)`|按大小初始化一个新的`string`类型|src/runtime/string.go::83
字节字符串|`rawbyteslice(size int) (b []byte)`|按大小初始化一个新的`[]byte`类型|src/runtime/string.go::83
字节字符串|`rawruneslice(size int) (b []rune)`|按大小初始化一个新的`[]rune`类型|src/runtime/string.go::83
Channel|`makechan(t *chantype, size int) *hchan`|创建一个`chan`|src/runtime/chan.go::71
数组|`func newarray(typ *_type, n int) unsafe.Pointer`|初始化一个数组|src/runtime/malloc.go::1191
Map|`mapassign(t *maptype, h *hmap, key unsafe.Pointer) unsafe.Pointer`|map申请内存|src/runtime/map.go::571
Map|`func (h *hmap) newoverflow(t *maptype, b *bmap) *bmap`|map申请溢出桶|src/runtime/map.go::245
等等|...|...

我们以初始化一个切片为例来看下这个过程

初始化一个切片

- 理论上直接分配到栈内存上
- 编译器分析该变量是否需要`内存逃逸`
    + 否：直接分配在栈上
    + 是：调用`src/runtime/slice.go::makeslice()`分配到堆上


```go
// 代码位置：src/cmd/compile/internal/gc/walk.go::1316
// 初始化切片
case OMAKESLICE:
    // ...略...
    // 不需要内存逃逸
    if n.Esc == EscNone {
        // ...略...

        // 不需要逃逸
        // 直接栈上分配内存
        t = types.NewArray(t.Elem(), i) // [r]T
        
        // ...略...
    } else {
        // 需要内存逃逸
        
        // ...略...

        // 默认使用makeslice64函数从堆上分配内存
        fnname := "makeslice64"
        argtype := types.Types[TINT64]

        // ...略...

        if (len.Type.IsKind(TIDEAL) || maxintval[len.Type.Etype].Cmp(maxintval[TUINT]) <= 0) &&
            (cap.Type.IsKind(TIDEAL) || maxintval[cap.Type.Etype].Cmp(maxintval[TUINT]) <= 0) {
            // 校验通过，则
            // 使用makeslice函数从堆上分配内存
            fnname = "makeslice"
            argtype = types.Types[TINT]
        }

        // ...略...

        // 调用上面指定的runtime函数
        m.Left = mkcall1(fn, types.Types[TUNSAFEPTR], init, typename(t.Elem()), conv(len, argtype), conv(cap, argtype))

        // ...略...
    }

```

分配堆内存的函数：

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235337.png" style="width:30%">
</p>

## 堆内存分配过程

- 微对象 0 < Micro Object < 16B
- 小对象 16B =< Small Object <= 32KB
- 大对象 32KB < Large Object

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235126.png" style="width:80%">
</p>

mcache:

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235250.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405235037.png" style="width:80%">
</p>

central:

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234451.png" style="width:80%">
</p>

## 微对象的分配

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234253.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234330.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234341.png" style="width:80%">
</p>


## 小对象的分配

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234409.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234425.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234513.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234521.png" style="width:80%">
</p>

## 大对象的分配

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234609.png" style="width:80%">
</p>

<p align="center">
  <img src="http://cdn.tigerb.cn/20220405234616.png" style="width:80%">
</p>