---
title: Go的GMP模型真的很"简单"
tags:
  - Go
cover_index: >-
  https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/GMP.png?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2024-08-03 14:55:11
---

> 本文基于go1.19

# 前言
---

关于GMP模型网上已经有很多文章，讲的内容大多都是如下图的逻辑，本系列我们就不再赘述。本系列我们换个视角，核心是搞清楚两个问题：

- GMP到底是什么？
- goroutine如何恢复和保存上下文的？

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/GMP.png" style="width:60%">
</p>

正文开始。

# `GMP`只是结构体
---

`GMP`并不是你想象的那么神奇的存在，其实就是普通的结构体，如同你写业务代码定义的结构体一样，如下：

```go
// Goroutine
// 代码位置：go1.19/src/runtime/proc.go
type g struct {
	stack     stack
	//...略...
	gopc      uintptr 
	startpc   uintptr
	sched     struct {
		sp   uintptr
		pc   uintptr
		//...略...
		bp   uintptr
	}
	//...略...
}

```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-struct.png" style="width:30%">
</p>

```go
// Machine
// 代码位置：go1.19/src/runtime/proc.go
type m struct {
    g0            *g     
	//...略...
	curg          *g
	p             puintptr
	nextp         puintptr
	//...略...

	mOS 
}
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/m-struct.png" style="width:30%">
</p>

```go
// Processor
// 代码位置：go1.19/src/runtime/proc.go
type p struct {
	id          int32
	//...略...
	m           muintptr 
	mcache      *mcache
	//...略...
	runqhead uint32
	runqtail uint32
	runq     [256]guintptr
	runnext guintptr
    //...略... 
	gFree struct {
		gList
		n int32
	}
    //...略...
	mspancache struct {
		len int
		buf [128]*mspan
	}
    //...略...
	gcw gcWork
}
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/p-struct.png" style="width:30%">
</p>

## `GMP`是系统线程运行的代码片段

`GMP`和你写的业务代码一样，都是由系统线程运行。

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/GMP-With-OSThread.png" style="width:60%">
</p>

## `GMP`是类似面相对象思想的封装

类型|结构体含义|结构体职责
------|------|------
`G`|Goroutine，代表协程|1. 封装可被并发执行的函数片段，比如 `go func() {// 函数A}()`
`G`|-|2. 暂存函数片段(协程)切换时的上下文信息
`G`|-|3. 封装g的栈内存空间，暂存函数片段(协程)执行时的临时变量的
`M`|Machine，和系统线程建立映射，结构体绑定一个系统线程|1. 绑定真正执行代码的系统线程，系统线程执行`G`的调度，和被调度的`G`绑定的函数
`M`|-|2. 维护`P`链表（可以从下一个`P`的队列找`G`）
`P`|Processor，和逻辑处理器建立映射|1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；
`P`|-| 2. 堆内存缓存层（`mcache`）
`P`|-| 3. 维护g的闲置队列

### `G`职责解析

接下来，展开关于`G`展开两个关键问题：

- `G`和函数绑定过程
- `G`切换上下文过程

**`G`和函数绑定过程**

当你使用`go`关键字执行一个函数时`go func(){}()`：

1. `G`和`func`具体绑定在哪？
2. `G`和`func`何时绑定？

```go
// `go`关键字示例
func main() {
	// 使用go 关键并发执行一个函数
	go func() {
		fmt.Println("demo")
	}()
}
```

> `G`和`func`具体绑定在哪？

位于g的结构体 `g.startpc`属性，详细如下：

```go
// Goroutine
// 代码位置：go1.19/src/runtime/proc.go
type g struct {
	//...略...
	gopc      uintptr  // go关键字创建Goroutine的代码位置
    //...略...
	startpc   uintptr // Goroutine绑定的函数代码地址
    //...略...
}
```

> `G`和`func`何时绑定？

1. 当通过go关键字运行一个函数时
2. 从g的闲置队列获取一个g，并通过`g.startpc`属性绑定上待执行的函数fn

```go
// 当你用go关键字执行一个函数
// 通过这个函数 绑定 g 和 待被执行的函数fn
func newproc(fn *funcval) {
	gp := getg()
	// 获取使用go关键字调用fn的代码位置
	// 方便fn执行完成之后跳回原代码位置
	pc := getcallerpc()
	systemstack(func() {
		// 绑定过程在这个函数中
		// 下面进一步分析newproc1
		newg := newproc1(fn, gp, pc)

		_p_ := getg().m.p.ptr()
		// 放入本地队列
		// 等待调度
		runqput(_p_, newg, true)

		if mainStarted {
			wakep()
		}
	})
}

// 绑定过程在这个函数中 分析newproc1
func newproc1(fn *funcval, callergp *g, callerpc uintptr) *g {
	//...略...
	newg := gfget(_p_) // 从g的闲置队列获取一个g
	//...略...
	newg.gopc = callerpc // 重点：设置go关键字的位置，便于fn执行完毕跳回原代码位置
	newg.startpc = fn.fn // 重点：这里绑定待被执行的函数fn
	//...略...

	return newg
}

```

函数绑定过程如下：

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-bind-func.png" style="width:60%">
</p>

**`G`切换上下文过程**

1. `goroutine`的上下文信息具体保存在哪？
2. `goroutine`的上下文如何切换？

> `goroutine`的上下文信息具体保存在哪？

位于g的结构体 `g.sched`属性，详细如下：

```go
// Goroutine
// 代码位置：go1.19/src/runtime/proc.go
type g struct {
	stack     stack // 协程栈 执行过程临时变量存放的地方
	sched     gobuf // Goroutine上下文信息 保存在这个结构
    //...略...
}

// Goroutine上下文信息
type gobuf struct {
	sp   uintptr // 栈指针：指向栈顶
	pc   uintptr // 代码(指令)执行位置的地址
	//...略...
	bp   uintptr // 基指针：指向栈基
}
```

> `goroutine`的上下文如何切换？

- g恢复上下文过程
- g保存上下文过程

**g恢复上下文过程：**

触发调度时：
1. 找到可执行的g（来源本地队列、全局队列、netpoll list 读或写就绪的g列表）
2. 把g的上下文`g.sched`通过汇编代码中的函数`gogo`恢复到对应的寄存器中

```go
// g的调度方法
func schedule() {
	
	//...略...

	// 找可执行的g (本地队列、全局队列、netpoll list 读或写就绪的g列表 等)
	gp, inheritTime, tryWakeP := findRunnable() 
	
	//...略...
	
	//在这里 继续往下看
	execute(gp, inheritTime)
}

func execute(gp *g, inheritTime bool) {
	//...略...
	// 关键就是通过gogo这个函数 恢复
	gogo(&gp.sched)
}
```

gogo函数汇编代码，arm64架构示例汇编代码如下：

```go
// void gogo(Gobuf*)
// restore state from Gobuf; longjmp
TEXT runtime·gogo(SB), NOSPLIT|NOFRAME, $0-8
	MOVD	buf+0(FP), R5
	MOVD	gobuf_g(R5), R6
	MOVD	0(R6), R4
	B	gogo<>(SB)

TEXT gogo<>(SB), NOSPLIT|NOFRAME, $0
	MOVD	R6, g
	BL	runtime·save_g(SB)

	MOVD	gobuf_sp(R5), R0 // 恢复栈指针
	MOVD	R0, RSP
	MOVD	gobuf_bp(R5), R29 // 恢复基指针
	MOVD	gobuf_lr(R5), LR 
	MOVD	gobuf_ret(R5), R0
	MOVD	gobuf_ctxt(R5), R26
	MOVD	$0, gobuf_sp(R5)
	MOVD	$0, gobuf_bp(R5)
	MOVD	$0, gobuf_ret(R5)
	MOVD	$0, gobuf_lr(R5)
	MOVD	$0, gobuf_ctxt(R5)
	CMP	ZR, ZR 
	MOVD	gobuf_pc(R5), R6 // 恢复PC计数器 指向下一个待执行的指令
	B	(R6)
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-shedule-gogo.png" style="width:60%">
</p>

**g保存上下文过程：**

其中两个关键函数如下

1. `func save(pc, sp uintptr)`触发保存上下文
2. `func mcall(fn func(*g))`触发保存上下文

**save函数**

```go
func save(pc, sp uintptr) {
	_g_ := getg()

	//...略...

	_g_.sched.pc = pc // 保存代码执行位置
	_g_.sched.sp = sp // 保存栈指针
	
	//...略...
}
```

调用`func save(pc, sp uintptr)`的场景如下：

- 进入系统调用时

```go
// 进入系统调用
func entersyscall() {
	reentersyscall(getcallerpc(), getcallersp())
}

func reentersyscall(pc, sp uintptr) {
	_g_ := getg()

	//...略...
	// 保存上下文
	save(pc, sp)
	_g_.syscallsp = sp
	_g_.syscallpc = pc
	casgstatus(_g_, _Grunning, _Gsyscall)
	//...略...
}

```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-shedule-save.png" style="width:60%">
</p>

**mcall函数**

`func mcall(fn func(*g))`执行过程中，从g切换到g0，并执行fn。fn内部会执行调度函数shedule()，触发新的调度，下面会举一个例子。

```go
TEXT runtime·mcall<ABIInternal>(SB), NOSPLIT|NOFRAME, $0-8
	MOVD	R0, R26	

	MOVD	RSP, R0
	MOVD	R0, (g_sched+gobuf_sp)(g) // 保存当前g的栈指针
	MOVD	R29, (g_sched+gobuf_bp)(g) // 保存当前g的基指针
	MOVD	LR, (g_sched+gobuf_pc)(g)// 保存当前g的下一个待执行指令的位置 PC计数器
	MOVD	$0, (g_sched+gobuf_lr)(g)

	// 切换到g0，并执行函数fn
	MOVD	g, R3
	MOVD	g_m(g), R8
	MOVD	m_g0(R8), g
	BL	runtime·save_g(SB)
	CMP	g, R3
	BNE	2(PC)
	B	runtime·badmcall(SB)

	MOVD	(g_sched+gobuf_sp)(g), R0
	MOVD	R0, RSP	
	MOVD	(g_sched+gobuf_bp)(g), R29
	MOVD	R3, R0	
	MOVD	$0, -16(RSP)
	SUB	$16, RSP
	MOVD	0(R26), R4
	BL	(R4)
	B	runtime·badmcall2(SB)
```

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-shedule-mcall.png" style="width:60%">
</p>

调用`func mcall(fn func(*g))`的场景如下：

1. `Gosched()`：触发协作&抢占式式调度时
2. `gopark`：g从运行状态转换为等待状态时
3. `goexit1()`goroutine执行完成时
4. `exitsyscall() `退出系统调用时
5. 等

详细展开，`Gosched()`：触发协作&抢占式式调度时看看，如下

```go
// 触发调度
func Gosched() {
	checkTimeouts()
	mcall(gosched_m)
}

func gosched_m(gp *g) {
	//...略...
	goschedImpl(gp)
}

func goschedImpl(gp *g) {
	//...略...
	// 正在运行状态转变为 可运行状态
	casgstatus(gp, _Grunning, _Grunnable)
	dropg()
	lock(&sched.lock)
	globrunqput(gp) // 放入全局队列
	unlock(&sched.lock)
	// 触发调度
	schedule()
}

func schedule() {
	//...略...

	// 找到下一个可执行的g
	gp, inheritTime, tryWakeP := findRunnable() 

	//...略...

	// 执行下一个g
	execute(gp, inheritTime)
}

func execute(gp *g, inheritTime bool) {
	//...略...

	// 恢复上下文
	gogo(&gp.sched)
}

// gogo汇编代码(arm64架构)
TEXT gogo<>(SB), NOSPLIT|NOFRAME, $0
	//...略...
	MOVD	gobuf_sp(R5), R0 // 恢复栈指针
	MOVD	gobuf_bp(R5), R29 // 恢复基指针
	//...略...
```

- park_m 把g从运行状态转换为等待状态时

```go
func gopark(unlockf func(*g, unsafe.Pointer) bool, lock unsafe.Pointer, reason waitReason, traceEv byte, traceskip int) {
	//...略...
	mcall(park_m)
}

func park_m(gp *g) {
	//...略...
	casgstatus(gp, _Grunning, _Gwaiting)
	dropg()

	//...略...

	// 触发调度
	schedule()
}

//...略...
// 同上`Gosched()`
```

- `goexit1()`goroutine执行完成时

```go
func goexit1() {
	//...略...
	mcall(goexit0)
}

// goexit continuation on g0.
func goexit0(gp *g) {
	//...略...
	// 触发调度
	schedule()
}

//...略...
// 同上`Gosched()`
```

-  `exitsyscall() `退出系统调用时

```go
func exitsyscall() {
	//...略...

	mcall(exitsyscall0)

	//...略...
}

func exitsyscall0(gp *g) {
	casgstatus(gp, _Gsyscall, _Grunnable)
	dropg()
	//...略...
	stopm()
	// 触发调度
	schedule()
}

/...略...
// 同上`Gosched()`
```

具体如下图：

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-shedule-mcall-scene.png" style="width:60%">
</p>

总结下g的完整切换过程：

- 当前g保存上下文（save/mcall）
- 当前g切换到g0，g0执行`schedule`调度，找到新的可执行的g
- 新的g恢复上下文（gogo）
- 最后，**实际以上操作都是有系统线程运行的**


### `M`职责解析

1. 绑定真正执行代码的系统线程 
2. 系统线程执行`G`的调度
3. 系统线程执行被调度的`G`绑定的函数
4. 维护`P`链表（可以从下一个`P`的队列找`G`）

```go
// Machine
// 代码位置：go1.19/src/runtime/proc.go
type m struct {
	g0            *g     
	//...略...
	curg          *g  // 当前执行的g
	p             puintptr // m绑定的p
	nextp         puintptr // 4. 维护`P`链表（可以从下一个`P`的队列找`G`）
	//...略...

	// 1. 绑定真正执行代码的系统线程
	// 2. 执行`G`的调度
	// 3. 执行被调度的`G`绑定的函数
	mOS 

    //...略...
}
```

### `P`职责解析

1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；
2. 堆内存缓存层（`mcache`）
3. 维护g的闲置队列

```go
// Processor
// 代码位置：go1.19/src/runtime/proc.go
type p struct {
	id          int32
	//...略...
	m           muintptr 
	mcache      *mcache // 堆内存缓存层（`mcache`)

	//...略...

	runqhead uint32 // 1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；
	runqtail uint32 // 1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；
	runq     [256]guintptr // 1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；
	runnext guintptr // 1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；

    //...略... 

	// 3. 维护g的闲置队列
	gFree struct {
		gList
		n int32
	}

    //...略...
	mspancache struct {
		len int
		buf [128]*mspan
	}

    //...略...
	gcw gcWork
}
```

# 总结
---

再来回头看开篇的两个问题？

- GMP到底是什么？
- goroutine如何恢复和保存上下文的？

是不是已经很清晰。

- 关于问题一，GMP是三个各司其职的结构体，被系统线程运行。

类型|结构体含义|结构体职责
------|------|------
`G`|Goroutine，代表协程|1. 封装可被并发执行的函数片段，比如 `go func() {// 函数A}()`
`G`|-|2. 暂存函数片段(协程)切换时的上下文信息
`G`|-|3. 封装g的栈内存空间，暂存函数片段(协程)执行时的临时变量的
`M`|Machine，和系统线程建立映射，结构体绑定一个系统线程|1. 绑定真正执行代码的系统线程，系统线程执行`G`的调度，和被调度的`G`绑定的函数
`M`|-|2. 维护`P`链表（可以从下一个`P`的队列找`G`）
`P`|Processor，和逻辑处理器建立映射|1. 维护可执行`G`的队列(`M`从该队列找可执行的`G`)；
`P`|-| 2. 堆内存缓存层（`mcache`）
`P`|-| 3. 维护g的闲置队列

- 关于问题二，goroutine恢复和保存上下文过程：
	1. 当前g保存上下文（save/mcall）
	2. 当前g切换到g0，g0执行`schedule`调度，找到新的可执行的g
	3. 新的g恢复上下文（gogo）

	具体如下图所示：

	<p align="center">
		<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/go-kernal/gmp/g-shedule-mcall-all.png" style="width:60%">
	</p>
