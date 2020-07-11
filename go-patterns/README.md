<h1 align="center">Go设计模式实战 | 我的代码没有else系列</h1>

<p align="center">
    <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-Hans">
        <img src="https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-red" alt="Lisense">
    </a>
</p>

> 嗯，我的代码没有`else`系列，一个设计模式业务真实使用的golang系列。

<p>
    <img src="http://cdn.tigerb.cn/20200425144718.jpg" width="36%">
</p>

# 版权申明
- 未经版权所有者明确授权，禁止发行本手册及其被实质上修改的版本。 
- 未经版权所有者事先授权，禁止将此作品及其衍生作品以标准（纸质）书籍形式发行。

<p>
    <img style="vertical-align:middle" width="20%" src="http://cdn.tigerb.cn/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>

# 目标

- 重读设计模式，温故知新
- Golang设计模式实战，完全结合真实的业务场景去运用设计模式
- 简化大家对设计模式的理解

```
特别说明：
1. 我的代码没有`else`，只是一个在代码合理设计的情况下自然而然无限接近或者达到的结果，并不是一个硬性的目标，务必较真。
2. 本系列的一些设计模式的概念可能和原概念存在差异，因为会结合实际使用，取其精华，适当改变，灵活使用。
```

# 目录

- [前言](#前言)
- [模板模式](#模板模式)
- [责任链模式](#责任链模式)
- [组合模式](#组合模式)
- [观察者模式](#观察者模式)
- [策略模式](#策略模式)
- [状态模式](#状态模式)
- TODO

# 前言

本系列主要分享，如何在我们的真实业务场景中使用设计模式。

本系列文章主要采用如下结构：

- 什么是「XX设计模式」？
- 什么真实业务场景可以使用「XX设计模式」？
- 怎么用「XX设计模式」？

本文主要介绍「模板模式」如何在真实业务场景中使用。

# 模板模式

## 什么是「模板模式」？

抽象类里定义好**算法的执行步骤**和**具体算法**，以及可能发生变化的算法定义为**抽象方法**。不同的子类继承该抽象类，并实现父类的抽象方法。

模板模式的优势：

- 不变的算法被继承复用：不变的部分高度封装、复用。
- 变化的算法子类继承并具体实现：变化的部分子类只需要具体实现抽象的部分即可，方便扩展，且可无限扩展。

## 什么真实业务场景可以用「模板模式」？

满足如下要求的所有场景:

> 算法执行的步骤是稳定**不变的**，但是具体的某些算法可能存在**变**化的场景。

怎么理解，举个例子：`比如说你煮个面，必然需要先烧水，水烧开之后再放面进去`，以上的流程我们称之为`煮面过程`。可知：这个`煮面过程`的步骤是稳定不变的，但是在不同的环境烧水的方式可能不尽相同，也许有的人用天然气烧水、有的人用电磁炉烧水、有的人用柴火烧水，等等。我们可以得到以下结论：

- `煮面过程`的步骤是稳定不变的
- `煮面过程`的烧水方式是可变的

> 我们有哪些真实业务场景可以用「模板模式」呢？

比如抽奖系统的抽奖接口，为什么：

- 抽奖的步骤是稳定不变的 -> **不变的**算法执行步骤
- 不同抽奖类型活动在某些逻辑处理方式可能不同 -> **变的**某些算法

## 怎么用「模板模式」？

关于怎么用，完全可以生搬硬套我总结的使用设计模式的四个步骤：

- 业务梳理
- 业务流程图
- 代码建模
- 代码demo

#### 业务梳理

我通过历史上接触过的各种抽奖场景（红包雨、糖果雨、打地鼠、大转盘(九宫格)、考眼力、答题闯关、游戏闯关、支付刮刮乐、积分刮刮乐等等），按照真实业务需求梳理了以下抽奖业务抽奖接口的大致文本流程。

了解具体业务请点击[《通用抽奖工具之需求分析 | SkrShop》](http://tigerb.cn/2019/12/23/skr-lottery/)

主步骤|主逻辑|抽奖类型|子步骤|子逻辑
---|-------|---|-------|-------
1|校验活动编号(serial_no)是否存在、并获取活动信息|-|-|-
2|校验活动、场次是否正在进行|-|-|-
3|其他参数校验(**不同活动类型实现不同**)|-|-|-
4|活动抽奖次数校验(同时扣减)|-|-|-
5|活动是否需要消费积分|-|-|-
6|场次抽奖次数校验(同时扣减)|-|-|-
7|获取场次奖品信息|-|-|-
8|获取node奖品信息(**不同活动类型实现不同**)|**按时间抽奖类型**|1|do nothing(抽取该场次的奖品即可，无需其他逻辑)
8||**按抽奖次数抽奖类型**|1|判断是该用户第几次抽奖
8|||2|获取对应node的奖品信息
8|||3|复写原所有奖品信息(抽取该node节点的奖品)
8||**按数额范围区间抽奖**|1|判断属于哪个数额区间
8|||2|获取对应node的奖品信息
8|||3|复写原所有奖品信息(抽取该node节点的奖品)
9|抽奖|-|-|-
10|奖品数量判断|-|-|-
11|组装奖品信息|-|-|-

> 注：流程不一定完全准确

结论：

- `主逻辑`是稳定不变的
- `其他参数校验`和`获取node奖品信息`的算法是可变的

#### 业务流程图

我们通过梳理的文本业务流程得到了如下的业务流程图：

![](http://cdn.tigerb.cn/20200325205347.png)

#### 代码建模

通过上面的分析我们可以得到：

```
一个抽象类
- 具体共有方法`Run`，里面定义了算法的执行步骤
- 具体私有方法，不会发生变化的具体方法
- 抽象方法，会发生变化的方法

子类一(按时间抽奖类型)
- 继承抽象类父类
- 实现抽象方法

子类二(按抽奖次数抽奖类型)
- 继承抽象类父类
- 实现抽象方法

子类三(按数额范围区间抽奖)
- 继承抽象类父类
- 实现抽象方法
```

但是golang里面没有继承的概念，我们就把对抽象类里抽象方法的依赖转化成对接口`interface`里抽象方法的依赖，同时也可以利用`合成复用`的方式“继承”模板:

```
抽象行为的接口`BehaviorInterface`(包含如下需要实现的方法)
- 其他参数校验的方法`checkParams`
- 获取node奖品信息的方法`getPrizesByNode`

抽奖结构体类
- 具体共有方法`Run`，里面定义了算法的执行步骤
- 具体私有方法`checkParams` 里面的逻辑实际依赖的接口BehaviorInterface.checkParams(ctx)的抽象方法
- 具体私有方法`getPrizesByNode` 里面的逻辑实际依赖的接口BehaviorInterface.getPrizesByNode(ctx)的抽象方法
- 其他具体私有方法，不会发生变化的具体方法

实现`BehaviorInterface`的结构体一(按时间抽奖类型)
- 实现接口方法

实现`BehaviorInterface`的结构体二(按抽奖次数抽奖类型)
- 实现接口方法

实现`BehaviorInterface`的结构体三(按数额范围区间抽奖)
- 实现接口方法
```

同时得到了我们的UML图：

![](http://cdn.tigerb.cn/20200326201327.jpg)

#### 代码demo

```go
package main

import (
	"fmt"
	"runtime"
)

//------------------------------------------------------------
//我的代码没有`else`系列
//模板模式
//@auhtor TIGERB<https://github.com/TIGERB>
//------------------------------------------------------------

const (
	// ConstActTypeTime 按时间抽奖类型
	ConstActTypeTime int32 = 1
	// ConstActTypeTimes 按抽奖次数抽奖
	ConstActTypeTimes int32 = 2
	// ConstActTypeAmount 按数额范围区间抽奖
	ConstActTypeAmount int32 = 3
)

// Context 上下文
type Context struct {
	ActInfo *ActInfo
}

// ActInfo 上下文
type ActInfo struct {
	// 活动抽奖类型1: 按时间抽奖 2: 按抽奖次数抽奖 3:按数额范围区间抽奖
	ActivityType int32
	// 其他字段略
}

// BehaviorInterface 不同抽奖类型的行为差异的抽象接口
type BehaviorInterface interface {
	// 其他参数校验(不同活动类型实现不同)
	checkParams(ctx *Context) error
	// 获取node奖品信息(不同活动类型实现不同)
	getPrizesByNode(ctx *Context) error
}

// TimeDraw 具体抽奖行为
// 按时间抽奖类型 比如红包雨
type TimeDraw struct{}

// checkParams 其他参数校验(不同活动类型实现不同)
func (draw TimeDraw) checkParams(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "按时间抽奖类型:特殊参数校验...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
func (draw TimeDraw) getPrizesByNode(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "do nothing(抽取该场次的奖品即可，无需其他逻辑)...")
	return
}

// TimesDraw 具体抽奖行为
// 按抽奖次数抽奖类型 比如答题闯关
type TimesDraw struct{}

// checkParams 其他参数校验(不同活动类型实现不同)
func (draw TimesDraw) checkParams(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "按抽奖次数抽奖类型:特殊参数校验...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
func (draw TimesDraw) getPrizesByNode(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "1. 判断是该用户第几次抽奖...")
	fmt.Println(runFuncName(), "2. 获取对应node的奖品信息...")
	fmt.Println(runFuncName(), "3. 复写原所有奖品信息(抽取该node节点的奖品)...")
	return
}

// AmountDraw 具体抽奖行为
// 按数额范围区间抽奖 比如订单金额刮奖
type AmountDraw struct{}

// checkParams 其他参数校验(不同活动类型实现不同)
func (draw *AmountDraw) checkParams(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "按数额范围区间抽奖:特殊参数校验...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
func (draw *AmountDraw) getPrizesByNode(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "1. 判断属于哪个数额区间...")
	fmt.Println(runFuncName(), "2. 获取对应node的奖品信息...")
	fmt.Println(runFuncName(), "3. 复写原所有奖品信息(抽取该node节点的奖品)...")
	return
}

// Lottery 抽奖模板
type Lottery struct {
	// 不同抽奖类型的抽象行为
	concreteBehavior BehaviorInterface
}

// Run 抽奖算法
// 稳定不变的算法步骤
func (lottery *Lottery) Run(ctx *Context) (err error) {
	// 具体方法：校验活动编号(serial_no)是否存在、并获取活动信息
	if err = lottery.checkSerialNo(ctx); err != nil {
	return err
	}

	// 具体方法：校验活动、场次是否正在进行
	if err = lottery.checkStatus(ctx); err != nil {
	return err
	}

	// ”抽象方法“：其他参数校验
	if err = lottery.checkParams(ctx); err != nil {
	return err
	}

	// 具体方法：活动抽奖次数校验(同时扣减)
	if err = lottery.checkTimesByAct(ctx); err != nil {
	return err
	}

	// 具体方法：活动是否需要消费积分
	if err = lottery.consumePointsByAct(ctx); err != nil {
	return err
	}

	// 具体方法：场次抽奖次数校验(同时扣减)
	if err = lottery.checkTimesBySession(ctx); err != nil {
	return err
	}

	// 具体方法：获取场次奖品信息
	if err = lottery.getPrizesBySession(ctx); err != nil {
	return err
	}

	// ”抽象方法“：获取node奖品信息
	if err = lottery.getPrizesByNode(ctx); err != nil {
	return err
	}

	// 具体方法：抽奖
	if err = lottery.drawPrizes(ctx); err != nil {
	return err
	}

	// 具体方法：奖品数量判断
	if err = lottery.checkPrizesStock(ctx); err != nil {
	return err
	}

	// 具体方法：组装奖品信息
	if err = lottery.packagePrizeInfo(ctx); err != nil {
	return err
	}
	return
}

// checkSerialNo 校验活动编号(serial_no)是否存在
func (lottery *Lottery) checkSerialNo(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "校验活动编号(serial_no)是否存在、并获取活动信息...")
	// 获取活动信息伪代码
	ctx.ActInfo = &ActInfo{
	// 假设当前的活动类型为按抽奖次数抽奖
	ActivityType: ConstActTypeTimes,
	}

	// 获取当前抽奖类型的具体行为
	switch ctx.ActInfo.ActivityType {
	case 1:
	// 按时间抽奖
	lottery.concreteBehavior = &TimeDraw{}
	case 2:
	// 按抽奖次数抽奖
	lottery.concreteBehavior = &TimesDraw{}
	case 3:
	// 按数额范围区间抽奖
	lottery.concreteBehavior = &AmountDraw{}
	default:
	return fmt.Errorf("不存在的活动类型")
	}
	return
}

// checkStatus 校验活动、场次是否正在进行
func (lottery *Lottery) checkStatus(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "校验活动、场次是否正在进行...")
	return
}

// checkParams 其他参数校验(不同活动类型实现不同)
// 不同场景变化的算法 转化为依赖抽象
func (lottery *Lottery) checkParams(ctx *Context) (err error) {
	// 实际依赖的接口的抽象方法
	return lottery.concreteBehavior.checkParams(ctx)
}

// checkTimesByAct 活动抽奖次数校验
func (lottery *Lottery) checkTimesByAct(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "活动抽奖次数校验...")
	return
}

// consumePointsByAct 活动是否需要消费积分
func (lottery *Lottery) consumePointsByAct(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "活动是否需要消费积分...")
	return
}

// checkTimesBySession 活动抽奖次数校验
func (lottery *Lottery) checkTimesBySession(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "活动抽奖次数校验...")
	return
}

// getPrizesBySession 获取场次奖品信息
func (lottery *Lottery) getPrizesBySession(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "获取场次奖品信息...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
// 不同场景变化的算法 转化为依赖抽象
func (lottery *Lottery) getPrizesByNode(ctx *Context) (err error) {
	// 实际依赖的接口的抽象方法
	return lottery.concreteBehavior.getPrizesByNode(ctx)
}

// drawPrizes 抽奖
func (lottery *Lottery) drawPrizes(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "抽奖...")
	return
}

// checkPrizesStock 奖品数量判断
func (lottery *Lottery) checkPrizesStock(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "奖品数量判断...")
	return
}

// packagePrizeInfo 组装奖品信息
func (lottery *Lottery) packagePrizeInfo(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "组装奖品信息...")
	return
}

func main() {
	(&Lottery{}).Run(&Context{})
}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}


```

以下是代码执行结果:
```
[Running] go run ".../easy-tips/go/src/patterns/template/template.go"
main.(*Lottery).checkSerialNo 校验活动编号(serial_no)是否存在、并获取活动信息...
main.(*Lottery).checkStatus 校验活动、场次是否正在进行...
main.TimesDraw.checkParams 按抽奖次数抽奖类型:特殊参数校验...
main.(*Lottery).checkTimesByAct 活动抽奖次数校验...
main.(*Lottery).consumePointsByAct 活动是否需要消费积分...
main.(*Lottery).checkTimesBySession 活动抽奖次数校验...
main.(*Lottery).getPrizesBySession 获取场次奖品信息...
main.TimesDraw.getPrizesByNode 1. 判断是该用户第几次抽奖...
main.TimesDraw.getPrizesByNode 2. 获取对应node的奖品信息...
main.TimesDraw.getPrizesByNode 3. 复写原所有奖品信息(抽取该node节点的奖品)...
main.(*Lottery).drawPrizes 抽奖...
main.(*Lottery).checkPrizesStock 奖品数量判断...
main.(*Lottery).packagePrizeInfo 组装奖品信息...
```

demo代码地址：<https://github.com/TIGERB/easy-tips/blob/master/go/src/patterns/template/template.go>

#### 代码demo2(利用golang的`合成复用`特性实现)

```go
package main

import (
	"fmt"
	"runtime"
)

//------------------------------------------------------------
//我的代码没有`else`系列
//模板模式
//@auhtor TIGERB<https://github.com/TIGERB>
//------------------------------------------------------------

const (
	// ConstActTypeTime 按时间抽奖类型
	ConstActTypeTime int32 = 1
	// ConstActTypeTimes 按抽奖次数抽奖
	ConstActTypeTimes int32 = 2
	// ConstActTypeAmount 按数额范围区间抽奖
	ConstActTypeAmount int32 = 3
)

// Context 上下文
type Context struct {
	ActInfo *ActInfo
}

// ActInfo 上下文
type ActInfo struct {
	// 活动抽奖类型1: 按时间抽奖 2: 按抽奖次数抽奖 3:按数额范围区间抽奖
	ActivityType int32
	// 其他字段略
}

// BehaviorInterface 不同抽奖类型的行为差异的抽象接口
type BehaviorInterface interface {
	// 其他参数校验(不同活动类型实现不同)
	checkParams(ctx *Context) error
	// 获取node奖品信息(不同活动类型实现不同)
	getPrizesByNode(ctx *Context) error
}

// TimeDraw 具体抽奖行为
// 按时间抽奖类型 比如红包雨
type TimeDraw struct {
	// 合成复用模板
	Lottery
}

// checkParams 其他参数校验(不同活动类型实现不同)
func (draw TimeDraw) checkParams(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "按时间抽奖类型:特殊参数校验...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
func (draw TimeDraw) getPrizesByNode(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "do nothing(抽取该场次的奖品即可，无需其他逻辑)...")
	return
}

// TimesDraw 具体抽奖行为
// 按抽奖次数抽奖类型 比如答题闯关
type TimesDraw struct {
	// 合成复用模板
	Lottery
}

// checkParams 其他参数校验(不同活动类型实现不同)
func (draw TimesDraw) checkParams(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "按抽奖次数抽奖类型:特殊参数校验...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
func (draw TimesDraw) getPrizesByNode(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "1. 判断是该用户第几次抽奖...")
	fmt.Println(runFuncName(), "2. 获取对应node的奖品信息...")
	fmt.Println(runFuncName(), "3. 复写原所有奖品信息(抽取该node节点的奖品)...")
	return
}

// AmountDraw 具体抽奖行为
// 按数额范围区间抽奖 比如订单金额刮奖
type AmountDraw struct {
	// 合成复用模板
	Lottery
}

// checkParams 其他参数校验(不同活动类型实现不同)
func (draw *AmountDraw) checkParams(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "按数额范围区间抽奖:特殊参数校验...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
func (draw *AmountDraw) getPrizesByNode(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "1. 判断属于哪个数额区间...")
	fmt.Println(runFuncName(), "2. 获取对应node的奖品信息...")
	fmt.Println(runFuncName(), "3. 复写原所有奖品信息(抽取该node节点的奖品)...")
	return
}

// Lottery 抽奖模板
type Lottery struct {
	// 不同抽奖类型的抽象行为
	ConcreteBehavior BehaviorInterface
}

// Run 抽奖算法
// 稳定不变的算法步骤
func (lottery *Lottery) Run(ctx *Context) (err error) {
	// 具体方法：校验活动编号(serial_no)是否存在、并获取活动信息
	if err = lottery.checkSerialNo(ctx); err != nil {
	return err
	}

	// 具体方法：校验活动、场次是否正在进行
	if err = lottery.checkStatus(ctx); err != nil {
	return err
	}

	// ”抽象方法“：其他参数校验
	if err = lottery.checkParams(ctx); err != nil {
	return err
	}

	// 具体方法：活动抽奖次数校验(同时扣减)
	if err = lottery.checkTimesByAct(ctx); err != nil {
	return err
	}

	// 具体方法：活动是否需要消费积分
	if err = lottery.consumePointsByAct(ctx); err != nil {
	return err
	}

	// 具体方法：场次抽奖次数校验(同时扣减)
	if err = lottery.checkTimesBySession(ctx); err != nil {
	return err
	}

	// 具体方法：获取场次奖品信息
	if err = lottery.getPrizesBySession(ctx); err != nil {
	return err
	}

	// ”抽象方法“：获取node奖品信息
	if err = lottery.getPrizesByNode(ctx); err != nil {
	return err
	}

	// 具体方法：抽奖
	if err = lottery.drawPrizes(ctx); err != nil {
	return err
	}

	// 具体方法：奖品数量判断
	if err = lottery.checkPrizesStock(ctx); err != nil {
	return err
	}

	// 具体方法：组装奖品信息
	if err = lottery.packagePrizeInfo(ctx); err != nil {
	return err
	}
	return
}

// checkSerialNo 校验活动编号(serial_no)是否存在
func (lottery *Lottery) checkSerialNo(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "校验活动编号(serial_no)是否存在、并获取活动信息...")
	return
}

// checkStatus 校验活动、场次是否正在进行
func (lottery *Lottery) checkStatus(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "校验活动、场次是否正在进行...")
	return
}

// checkParams 其他参数校验(不同活动类型实现不同)
// 不同场景变化的算法 转化为依赖抽象
func (lottery *Lottery) checkParams(ctx *Context) (err error) {
	// 实际依赖的接口的抽象方法
	return lottery.ConcreteBehavior.checkParams(ctx)
}

// checkTimesByAct 活动抽奖次数校验
func (lottery *Lottery) checkTimesByAct(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "活动抽奖次数校验...")
	return
}

// consumePointsByAct 活动是否需要消费积分
func (lottery *Lottery) consumePointsByAct(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "活动是否需要消费积分...")
	return
}

// checkTimesBySession 活动抽奖次数校验
func (lottery *Lottery) checkTimesBySession(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "活动抽奖次数校验...")
	return
}

// getPrizesBySession 获取场次奖品信息
func (lottery *Lottery) getPrizesBySession(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "获取场次奖品信息...")
	return
}

// getPrizesByNode 获取node奖品信息(不同活动类型实现不同)
// 不同场景变化的算法 转化为依赖抽象
func (lottery *Lottery) getPrizesByNode(ctx *Context) (err error) {
	// 实际依赖的接口的抽象方法
	return lottery.ConcreteBehavior.getPrizesByNode(ctx)
}

// drawPrizes 抽奖
func (lottery *Lottery) drawPrizes(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "抽奖...")
	return
}

// checkPrizesStock 奖品数量判断
func (lottery *Lottery) checkPrizesStock(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "奖品数量判断...")
	return
}

// packagePrizeInfo 组装奖品信息
func (lottery *Lottery) packagePrizeInfo(ctx *Context) (err error) {
	fmt.Println(runFuncName(), "组装奖品信息...")
	return
}

func main() {
	ctx := &Context{
	ActInfo: &ActInfo{
	ActivityType: ConstActTypeAmount,
	},
	}

	switch ctx.ActInfo.ActivityType {
	case ConstActTypeTime: // 按时间抽奖类型
	instance := &TimeDraw{}
	instance.ConcreteBehavior = instance
	instance.Run(ctx)
	case ConstActTypeTimes: // 按抽奖次数抽奖
	instance := &TimesDraw{}
	instance.ConcreteBehavior = instance
	instance.Run(ctx)
	case ConstActTypeAmount: // 按数额范围区间抽奖
	instance := &AmountDraw{}
	instance.ConcreteBehavior = instance
	instance.Run(ctx)
	default:
	// 报错
	return
	}
}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}

```

以下是代码执行结果:

```
[Running] go run ".../easy-tips/go/src/patterns/template/templateOther.go"
main.(*Lottery).checkSerialNo 校验活动编号(serial_no)是否存在、并获取活动信息...
main.(*Lottery).checkStatus 校验活动、场次是否正在进行...
main.(*AmountDraw).checkParams 按数额范围区间抽奖:特殊参数校验...
main.(*Lottery).checkTimesByAct 活动抽奖次数校验...
main.(*Lottery).consumePointsByAct 活动是否需要消费积分...
main.(*Lottery).checkTimesBySession 活动抽奖次数校验...
main.(*Lottery).getPrizesBySession 获取场次奖品信息...
main.(*AmountDraw).getPrizesByNode 1. 判断属于哪个数额区间...
main.(*AmountDraw).getPrizesByNode 2. 获取对应node的奖品信息...
main.(*AmountDraw).getPrizesByNode 3. 复写原所有奖品信息(抽取该node节点的奖品)...
main.(*Lottery).drawPrizes 抽奖...
main.(*Lottery).checkPrizesStock 奖品数量判断...
main.(*Lottery).packagePrizeInfo 组装奖品信息...
```

demo2代码地址：<https://github.com/TIGERB/easy-tips/blob/master/go/src/patterns/template/templateOther.go>

## 结语

最后总结下，「模板模式」抽象过程的核心是把握**不变**与**变**：

- 不变：`Run`方法里的抽奖步骤 -> `被继承复用`
- 变：不同场景下 -> `被具体实现`
	+ `checkParams`参数校验逻辑
	+ `getPrizesByNode`获取该节点奖品的逻辑


# 责任链模式

## 什么是「责任链模式」？

> 首先把一系列业务按职责划分成不同的对象，接着把这一系列对象构成一个链，然后在这一系列对象中传递请求对象，直到被处理为止。

我们从概念中可以看出责任链模式有如下明显的优势：

- 按职责划分：解耦
- 对象链：逻辑清晰

但是有一点`直到被处理为止`，代表最终只会被一个实际的业务对象执行了实际的业务逻辑，明显适用的场景并不多。但是除此之外，上面的那两点优势还是让人很心动，所以，为了适用于目前所接触的绝大多数业务场景，把概念进行了简单的调整，如下：

> 首先把一系列业务按职责划分成不同的对象，接着把这一系列对象构成一个链，直到“链路结束”为止。(结束：异常结束，或链路执行完毕结束)

简单的`直到“链路结束”为止`转换可以让我们把责任链模式适用于任何复杂的业务场景。

以下是责任链模式的具体优势：

- 直观：一眼可观的业务调用过程
- 无限扩展：可无限扩展的业务逻辑
- 高度封装：复杂业务代码依然高度封装
- 极易被修改：复杂业务代码下修改代码只需要专注对应的业务类(结构体)文件即可，以及极易被调整的业务执行顺序

## 什么真实业务场景可以用「责任链模式(改)」？

满足如下要求的场景:

> 业务极度复杂的所有场景

任何杂乱无章的业务代码，都可以使用责任链模式(改)去重构、设计。

> 我们有哪些真实业务场景可以用「责任链模式(改)」呢？

比如电商系统的下单接口，随着业务发展不断的发展，该接口会充斥着各种各样的业务逻辑。

## 怎么用「责任链模式(改)」？

关于怎么用，完全可以生搬硬套我总结的使用设计模式的四个步骤：

- 业务梳理
- 业务流程图
- 代码建模
- 代码demo

#### 业务梳理

步骤|逻辑
-------|-------
1|参数校验
2|获取地址信息
3|地址信息校验
4|获取购物车数据
5|获取商品库存信息
6|商品库存校验
7|获取优惠信息
8|获取运费信息
9|使用优惠信息
10|扣库存
11|清理购物车
12|写订单表
13|写订单商品表
14|写订单优惠信息表
XX|以及未来会增加的逻辑...

业务的不断发展变化的：

- 新的业务被增加
- 旧的业务被修改

比如增加的新的业务，订金预售：

- 在`4|获取购物车数据`后，需要校验商品参见订金预售活动的有效性等逻辑。
- 等等逻辑

> 注：流程不一定完全准确

#### 业务流程图

我们通过梳理的文本业务流程得到了如下的业务流程图：

![](http://cdn.tigerb.cn/20200327205310.png)

#### 代码建模

责任链模式主要类主要包含如下特性：

- 成员属性
	+ `nextHandler`: 下一个等待被调用的对象实例 -> 稳定不变的
- 成员方法
	+ `SetNext`: 把下一个对象的实例绑定到当前对象的`nextHandler`属性上 -> 稳定不变的
	+ `Do`: 当前对象业务逻辑入口 -> 变化的
	+ `Run`: 调用当前对象的`Do`，`nextHandler`不为空则调用`nextHandler.Do` -> 稳定不变的

套用到下单接口伪代码实现如下：
```
一个父类(抽象类)：

- 成员属性
	+ `nextHandler`: 下一个等待被调用的对象实例
- 成员方法
	+ 实体方法`SetNext`: 实现把下一个对象的实例绑定到当前对象的`nextHandler`属性上
	+ 抽象方法`Do`: 当前对象业务逻辑入口
	+ 实体方法`Run`: 实现调用当前对象的`Do`，`nextHandler`不为空则调用`nextHandler.Do`

子类一(参数校验)
- 继承抽象类父类
- 实现抽象方法`Do`：具体的参数校验逻辑

子类二(获取地址信息)
- 继承抽象类父类
- 实现抽象方法`Do`：具体获取地址信息的逻辑

子类三(获取购物车数据)
- 继承抽象类父类
- 实现抽象方法`Do`：具体获取购物车数据的逻辑

......略

子类X(以及未来会增加的逻辑)
- 继承抽象类父类
- 实现抽象方法`Do`：以及未来会增加的逻辑
```

但是，golang里没有的继承的概念，要复用成员属性`nextHandler`、成员方法`SetNext`、成员方法`Run`怎么办呢？我们使用`合成复用`的特性变相达到“继承复用”的目的，如下：

```
一个接口(interface)：

- 抽象方法`SetNext`: 待实现把下一个对象的实例绑定到当前对象的`nextHandler`属性上
- 抽象方法`Do`: 待实现当前对象业务逻辑入口
- 抽象方法`Run`: 待实现调用当前对象的`Do`，`nextHandler`不为空则调用`nextHandler.Do`

一个基础结构体：

- 成员属性
	+ `nextHandler`: 下一个等待被调用的对象实例
- 成员方法
	+ 实体方法`SetNext`: 实现把下一个对象的实例绑定到当前对象的`nextHandler`属性上
	+ 实体方法`Run`: 实现调用当前对象的`Do`，`nextHandler`不为空则调用`nextHandler.Do`

子类一(参数校验)
- 合成复用基础结构体
- 实现抽象方法`Do`：具体的参数校验逻辑

子类二(获取地址信息)
- 合成复用基础结构体
- 实现抽象方法`Do`：具体获取地址信息的逻辑

子类三(获取购物车数据)
- 合成复用基础结构体
- 实现抽象方法`Do`：具体获取购物车数据的逻辑

......略

子类X(以及未来会增加的逻辑)
- 合成复用基础结构体
- 实现抽象方法`Do`：以及未来会增加的逻辑
```

同时得到了我们的UML图：

![](http://cdn.tigerb.cn/20200328220913.jpg)

#### 代码demo

```go
package main

//---------------
//我的代码没有`else`系列
//责任链模式
//@auhtor TIGERB<https://github.com/TIGERB>
//---------------

import (
	"fmt"
	"runtime"
)

// Context Context
type Context struct {
}

// Handler 处理
type Handler interface {
	// 自身的业务
	Do(c *Context) error
	// 设置下一个对象
	SetNext(h Handler) Handler
	// 执行
	Run(c *Context) error
}

// Next 抽象出来的 可被合成复用的结构体
type Next struct {
	// 下一个对象
	nextHandler Handler
}

// SetNext 实现好的 可被复用的SetNext方法
// 返回值是下一个对象 方便写成链式代码优雅
// 例如 nullHandler.SetNext(argumentsHandler).SetNext(signHandler).SetNext(frequentHandler)
func (n *Next) SetNext(h Handler) Handler {
	n.nextHandler = h
	return h
}

// Run 执行
func (n *Next) Run(c *Context) (err error) {
	// 由于go无继承的概念 这里无法执行当前handler的Do
	// n.Do(c)
	if n.nextHandler != nil {
		// 合成复用下的变种
		// 执行下一个handler的Do
		if err = (n.nextHandler).Do(c); err != nil {
			return
		}
		// 执行下一个handler的Run
		return (n.nextHandler).Run(c)
	}
	return
}

// NullHandler 空Handler
// 由于go无继承的概念 作为链式调用的第一个载体 设置实际的下一个对象
type NullHandler struct {
	// 合成复用Next的`nextHandler`成员属性、`SetNext`成员方法、`Run`成员方法
	Next
}

// Do 空Handler的Do
func (h *NullHandler) Do(c *Context) (err error) {
	// 空Handler 这里什么也不做 只是载体 do nothing...
	return
}

// ArgumentsHandler 校验参数的handler
type ArgumentsHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *ArgumentsHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "校验参数成功...")
	return
}

// AddressInfoHandler 地址信息handler
type AddressInfoHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *AddressInfoHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "获取地址信息...")
	fmt.Println(runFuncName(), "地址信息校验...")
	return
}

// CartInfoHandler 获取购物车数据handler
type CartInfoHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *CartInfoHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "获取购物车数据...")
	return
}

// StockInfoHandler 商品库存handler
type StockInfoHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *StockInfoHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "获取商品库存信息...")
	fmt.Println(runFuncName(), "商品库存校验...")
	return
}

// PromotionInfoHandler 获取优惠信息handler
type PromotionInfoHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *PromotionInfoHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "获取优惠信息...")
	return
}

// ShipmentInfoHandler 获取运费信息handler
type ShipmentInfoHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *ShipmentInfoHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "获取运费信息...")
	return
}

// PromotionUseHandler 使用优惠信息handler
type PromotionUseHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *PromotionUseHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "使用优惠信息...")
	return
}

// StockSubtractHandler 库存操作handler
type StockSubtractHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *StockSubtractHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "扣库存...")
	return
}

// CartDelHandler 清理购物车handler
type CartDelHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *CartDelHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "清理购物车...")
	// err = fmt.Errorf("CartDelHandler.Do fail")
	return
}

// DBTableOrderHandler 写订单表handler
type DBTableOrderHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *DBTableOrderHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "写订单表...")
	return
}

// DBTableOrderSkusHandler 写订单商品表handler
type DBTableOrderSkusHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *DBTableOrderSkusHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "写订单商品表...")
	return
}

// DBTableOrderPromotionsHandler 写订单优惠信息表handler
type DBTableOrderPromotionsHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *DBTableOrderPromotionsHandler) Do(c *Context) (err error) {
	fmt.Println(runFuncName(), "写订单优惠信息表...")
	return
}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}

func main() {
	// 初始化空handler
	nullHandler := &NullHandler{}

	// 链式调用 代码是不是很优雅
	// 很明显的链 逻辑关系一览无余
	nullHandler.SetNext(&ArgumentsHandler{}).
		SetNext(&AddressInfoHandler{}).
		SetNext(&CartInfoHandler{}).
		SetNext(&StockInfoHandler{}).
		SetNext(&PromotionInfoHandler{}).
		SetNext(&ShipmentInfoHandler{}).
		SetNext(&PromotionUseHandler{}).
		SetNext(&StockSubtractHandler{}).
		SetNext(&CartDelHandler{}).
		SetNext(&DBTableOrderHandler{}).
		SetNext(&DBTableOrderSkusHandler{}).
		SetNext(&DBTableOrderPromotionsHandler{})
		//无限扩展代码...

	// 开始执行业务
	if err := nullHandler.Run(&Context{}); err != nil {
		// 异常
		fmt.Println("Fail | Error:" + err.Error())
		return
	}
	// 成功
	fmt.Println("Success")
	return
}
```

代码运行结果：

```
[Running] go run "../easy-tips/go/src/patterns/responsibility/responsibility-order-submit.go"
main.(*ArgumentsHandler).Do 校验参数成功...
main.(*AddressInfoHandler).Do 获取地址信息...
main.(*AddressInfoHandler).Do 地址信息校验...
main.(*CartInfoHandler).Do 获取购物车数据...
main.(*StockInfoHandler).Do 获取商品库存信息...
main.(*StockInfoHandler).Do 商品库存校验...
main.(*PromotionInfoHandler).Do 获取优惠信息...
main.(*ShipmentInfoHandler).Do 获取运费信息...
main.(*PromotionUseHandler).Do 使用优惠信息...
main.(*StockSubtractHandler).Do 扣库存...
main.(*CartDelHandler).Do 清理购物车...
main.(*DBTableOrderHandler).Do 写订单表...
main.(*DBTableOrderSkusHandler).Do 写订单商品表...
main.(*DBTableOrderPromotionsHandler).Do 写订单优惠信息表...
Success
```

## 结语

最后总结下，「责任链模式(改)」抽象过程的核心是：

- 按职责划分：业务逻辑归类，收敛的过程。
- 对象链：把收敛之后的业务对象构成对象链，依次被执行。

# 组合模式

## 什么是「组合模式」？

> 一个具有层级关系的对象由一系列拥有父子关系的对象通过树形结构组成。

组合模式的优势：

- 所见即所码：你所看见的代码结构就是业务真实的层级关系，比如Ui界面你真实看到的那样。
- 高度封装：单一职责。
- 可复用：不同业务场景，相同的组件可被重复使用。

## 什么真实业务场景可以用「组合模式」？

满足如下要求的所有场景:

> Get请求获取页面数据的所有接口

前端大行组件化的当今，我们在写后端接口代码的时候还是按照业务思路一头写到尾吗？我们是否可以思索，「后端接口业务代码如何可以简单快速组件化？」，答案是肯定的，这就是「组合模式」的作用。

我们利用「组合模式」的定义和前端模块的划分去构建后端业务代码结构：

- 前端单个模块 -> 对应后端：具体单个类 -> 封装的过程
- 前端模块父子组件 ->  对应后端：父类内部持有多个子类(非继承关系，合成复用关系) -> 父子关系的树形结构

> 我们有哪些真实业务场景可以用「组合模式」呢？

比如我们以“复杂的订单结算页面”为例，下面是某东的订单结算页面：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200331124724.jpeg" style="width:38%">
</p>

从页面的展示形式上，可以看出：

- 页面由多个模块构成，比如：
	+ 地址模块
	+ 支付方式模块
	+ 店铺模块
	+ 发票模块
	+ 优惠券模块
	+ 某豆模块
	+ 礼品卡模块
	+ 订单详细金额模块
- 单个模块可以由多个子模块构成
	+ 店铺模块，又由如下模块构成：
		* 商品模块
		* 售后模块
		* 优惠模块
		* 物流模块

## 怎么用「组合模式」？

关于怎么用，完全可以生搬硬套我总结的使用设计模式的四个步骤：

- 业务梳理
- 业务流程图
- 代码建模
- 代码demo

#### 业务梳理

按照如上某东的订单结算页面的示例，我们得到了如下的订单结算页面模块组成图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200329222214.png" style="width:46%">
</p>

> 注：模块不一定完全准确

#### 代码建模

责任链模式主要类主要包含如下特性：

- 成员属性
	+ `ChildComponents`: 子组件列表 -> 稳定不变的
- 成员方法
	+ `Mount`: 添加一个子组件 -> 稳定不变的
	+ `Remove`: 移除一个子组件 -> 稳定不变的
	+ `Do`: 执行组件&子组件 -> 变化的

套用到订单结算页面信息接口伪代码实现如下：
```
一个父类(抽象类)：
- 成员属性
	+ `ChildComponents`: 子组件列表
- 成员方法
	+ `Mount`: 实现添加一个子组件
	+ `Remove`: 实现移除一个子组件
	+ `Do`: 抽象方法

组件一，订单结算页面组件类(继承父类、看成一个大的组件)： 
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件二，地址组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件三，支付方式组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件四，店铺组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件五，商品组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件六，优惠信息组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件七，物流组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件八，发票组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件九，优惠券组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件十，礼品卡组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件十一，订单金额详细信息组件(继承父类)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑
组件十二，售后组件(继承父类，未来扩展的组件)：
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑
```

但是，golang里没有的继承的概念，要复用成员属性`ChildComponents`、成员方法`Mount`、成员方法`Remove`怎么办呢？我们使用`合成复用`的特性变相达到“继承复用”的目的，如下：

```
一个接口(interface)：
+ 抽象方法`Mount`: 添加一个子组件
+ 抽象方法`Remove`: 移除一个子组件
+ 抽象方法`Do`: 执行组件&子组件

一个基础结构体`BaseComponent`：
- 成员属性
	+ `ChildComponents`: 子组件列表
- 成员方法
	+ 实体方法`Mount`: 添加一个子组件
	+ 实体方法`Remove`: 移除一个子组件
	+ 实体方法`ChildsDo`: 执行子组件

组件一，订单结算页面组件类： 
- 合成复用基础结构体`BaseComponent` 
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件二，地址组件：
- 合成复用基础结构体`BaseComponent` 
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

组件三，支付方式组件：
- 合成复用基础结构体`BaseComponent` 
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

...略

组件十一，订单金额详细信息组件：
- 合成复用基础结构体`BaseComponent` 
- 成员方法
	+ `Do`: 执行当前组件的逻辑，执行子组件的逻辑

```

同时得到了我们的UML图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200403125814.jpg" style="width:100%">
</p>

#### 代码demo

```go
package main

import (
	"fmt"
	"reflect"
	"runtime"
)

//------------------------------------------------------------
//我的代码没有`else`系列
//组合模式
//@auhtor TIGERB<https://github.com/TIGERB>
//------------------------------------------------------------

// Context 上下文
type Context struct{}

// Component 组件接口
type Component interface {
	// 添加一个子组件
	Mount(c Component, components ...Component) error
	// 移除一个子组件
	Remove(c Component) error
	// 执行组件&子组件
	Do(ctx *Context) error
}

// BaseComponent 基础组件
// 实现Add:添加一个子组件
// 实现Remove:移除一个子组件
type BaseComponent struct {
	// 子组件列表
	ChildComponents []Component
}

// Mount 挂载一个子组件
func (bc *BaseComponent) Mount(c Component, components ...Component) (err error) {
	bc.ChildComponents = append(bc.ChildComponents, c)
	if len(components) == 0 {
		return
	}
	bc.ChildComponents = append(bc.ChildComponents, components...)
	return
}

// Remove 移除一个子组件
func (bc *BaseComponent) Remove(c Component) (err error) {
	if len(bc.ChildComponents) == 0 {
		return
	}
	for k, childComponent := range bc.ChildComponents {
		if c == childComponent {
			fmt.Println(runFuncName(), "移除:", reflect.TypeOf(childComponent))
			bc.ChildComponents = append(bc.ChildComponents[:k], bc.ChildComponents[k+1:]...)
		}
	}
	return
}

// Do 执行组件&子组件
func (bc *BaseComponent) Do(ctx *Context) (err error) {
	// do nothing
	return
}

// ChildsDo 执行子组件
func (bc *BaseComponent) ChildsDo(ctx *Context) (err error) {
	// 执行子组件
	for _, childComponent := range bc.ChildComponents {
		if err = childComponent.Do(ctx); err != nil {
			return err
		}
	}
	return
}

// CheckoutPageComponent 订单结算页面组件
type CheckoutPageComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *CheckoutPageComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "订单结算页面组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// AddressComponent 地址组件
type AddressComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *AddressComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "地址组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// PayMethodComponent 支付方式组件
type PayMethodComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *PayMethodComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "支付方式组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// StoreComponent 店铺组件
type StoreComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *StoreComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "店铺组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// SkuComponent 商品组件
type SkuComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *SkuComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "商品组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// PromotionComponent 优惠信息组件
type PromotionComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *PromotionComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "优惠信息组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// ExpressComponent 物流组件
type ExpressComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *ExpressComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "物流组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// AftersaleComponent 售后组件
type AftersaleComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *AftersaleComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "售后组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// InvoiceComponent 发票组件
type InvoiceComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *InvoiceComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "发票组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// CouponComponent 优惠券组件
type CouponComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *CouponComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "优惠券组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// GiftCardComponent 礼品卡组件
type GiftCardComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *GiftCardComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "礼品卡组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

// OrderComponent 订单金额详细信息组件
type OrderComponent struct {
	// 合成复用基础组件
	BaseComponent
}

// Do 执行组件&子组件
func (bc *OrderComponent) Do(ctx *Context) (err error) {
	// 当前组件的业务逻辑写这
	fmt.Println(runFuncName(), "订单金额详细信息组件...")

	// 执行子组件
	bc.ChildsDo(ctx)

	// 当前组件的业务逻辑写这

	return
}

func main() {
	// 初始化订单结算页面 这个大组件
	checkoutPage := &CheckoutPageComponent{}

	// 挂载子组件
	storeComponent := &StoreComponent{}
	skuComponent := &SkuComponent{}
	skuComponent.Mount(
		&PromotionComponent{},
		&AftersaleComponent{},
	)
	storeComponent.Mount(
		skuComponent,
		&ExpressComponent{},
	)

	// 挂载组件
	checkoutPage.Mount(
		&AddressComponent{},
		&PayMethodComponent{},
		storeComponent,
		&InvoiceComponent{},
		&CouponComponent{},
		&GiftCardComponent{},
		&OrderComponent{},
	)

	// 移除组件测试
	// checkoutPage.Remove(storeComponent)

	// 开始构建页面组件数据
	checkoutPage.Do(&Context{})
}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}


```

代码运行结果：

```
[Running] go run "../easy-tips/go/src/patterns/composite/composite.go"
main.(*CheckoutPageComponent).Do 订单结算页面组件...
main.(*AddressComponent).Do 地址组件...
main.(*PayMethodComponent).Do 支付方式组件...
main.(*StoreComponent).Do 店铺组件...
main.(*SkuComponent).Do 商品组件...
main.(*PromotionComponent).Do 优惠信息组件...
main.(*AftersaleComponent).Do 售后组件...
main.(*ExpressComponent).Do 物流组件...
main.(*InvoiceComponent).Do 发票组件...
main.(*CouponComponent).Do 优惠券组件...
main.(*GiftCardComponent).Do 礼品卡组件...
main.(*OrderComponent).Do 订单金额详细信息组件...
```

## 结语

最后总结下，「组合模式」抽象过程的核心是：

- 按模块划分：业务逻辑归类，收敛的过程。
- 父子关系(树)：把收敛之后的业务对象按父子关系绑定，依次被执行。

与「责任链模式」的区别：

- 责任链模式: 链表
- 组合模式：树

# 观察者模式

## 什么是「观察者模式」？

> 观察者观察被观察者，被观察者通知观察者

我们用“订阅通知”翻译下「观察者模式」的概念，结果：

> “订阅者订阅主题，主题通知订阅者”

是不是容易理解多了，我们再来拆解下这句话，得到：

- 两个对象
    + 被观察者 -> 主题
    + 观察者 -> 订阅者
- 两个动作
    + 订阅 -> 订阅者**订阅**主题
    + 通知 -> 主题发生变动**通知**订阅者

观察者模式的优势：

- 高内聚 -> 不同业务代码变动互不影响
- 可复用 -> 新的业务(就是新的订阅者)订阅不同接口(主题，就是这里的接口)
- 极易扩展 -> 新增接口(就是新增主题)；新增业务(就是新增订阅者)；

其实说白了，就是分布式架构中使用消息机制MQ解耦业务的优势，是不是这么一想很容易理解了。

## 什么真实业务场景可以用「观察者模式」？

> 所有发生变更，需要通知的业务场景

详细说：只要发生了某些变化，需要通知依赖了这些变化的具体事物的业务场景。

> 我们有哪些真实业务场景可以用「观察者模式」呢？

比如，订单逆向流，也就是订单成立之后的各种取消操作(本文不讨论售后)，主要有如下取消类型：

|订单取消类型|
|-------|
|未支付取消订单|
|超时关单|
|已支付取消订单|
|取消发货单|
|拒收|

在触发这些**取消操作**都要进行各种各样的子操作，显而易见不同的**取消操作**所涉及的子操作是存在交集的。其次，已支付取消订单的子操作应该是所有订单取消类型最全的，其他类型的复用代码即可，除了分装成函数片段，还有什么更好的封装方式吗？答案：「观察者模式」。

接着我们来分析下订单逆向流业务中的**变**与**不变**：

- 变
    + 新增取消类型
    + 新增子操作
    + 修改某个子操作的逻辑
    + 取消类型和子操作的对应关系
- 不变
    + 已存在的取消类型
    + 已存在的子操作(在外界看来)



## 怎么用「观察者模式」？

关于怎么用，完全可以生搬硬套我总结的使用设计模式的四个步骤：

- 业务梳理
- 业务流程图
- 代码建模
- 代码demo

#### 业务梳理

```
注：本文于单体架构背景探讨业务的实现过程，简单容易理解。
```

第一步，梳理出所有存在的的逆向业务的子操作，如下：

|所有子操作|
|-------|
|修改订单状态|
|记录订单状态变更日志|
|退优惠券|
|还优惠活动资格|
|还库存|
|还礼品卡|
|退钱包余额|
|修改发货单状态|
|记录发货单状态变更日志|
|生成退款单|
|生成发票-红票|
|发邮件|
|发短信|
|发微信消息|

第二步，找到不同订单取消类型和这些子操作的关系，如下：

订单取消类型(“主题”)(被观察者)|子操作(“订阅者”)(观察者)
-------|-------
取消未支付订单|-
-|修改订单状态
-|记录订单状态变更日志
-|退优惠券
-|还优惠活动资格
-|还库存
超时关单|-
-|修改订单状态
-|记录订单状态变更日志
-|退优惠券
-|还优惠活动资格
-|还库存
-|发邮件
-|发短信
-|发微信消息
已支付取消订单(未生成发货单)|-
-|修改订单状态
-|记录订单状态变更日志
-|还优惠活动资格(看情况)
-|还库存
-|还礼品卡
-|退钱包余额
-|生成退款单
-|生成发票-红票
-|发邮件
-|发短信
-|发微信消息
取消发货单(未发货)|-
-|修改订单状态
-|记录订单状态变更日志
-|修改发货单状态
-|记录发货单状态变更日志
-|还库存
-|还礼品卡
-|退钱包余额
-|生成退款单
-|生成发票-红票
-|发邮件
-|发短信
-|发微信消息
拒收|-
-|修改订单状态
-|记录订单状态变更日志
-|修改发货单状态
-|记录发货单状态变更日志
-|还库存
-|还礼品卡
-|退钱包余额
-|生成退款单
-|生成发票-红票
-|发邮件
-|发短信
-|发微信消息


> 注：流程不一定完全准确、全面。

结论：

- 不同的订单取消类型的子操作存在交集，子操作可被复用。
- 子操作可被看作“订阅者”(也就是观察者)
- 订单取消类型可被看作是“主题”(也就是被观察者)
- 不同子操作(“订阅者”)(观察者)**订阅**订单取消类型(“主题”)(被观察者)
- 订单取消类型(“主题”)(被观察者)**通知**子操作(“订阅者”)(观察者)

#### 业务流程图

我们通过梳理的文本业务流程得到了如下的业务流程图：

```
注：本文于单体架构背景探讨业务的实现过程，简单容易理解。
```

![](http://cdn.tigerb.cn/20200410131427.png)

#### 代码建模

「观察者模式」的核心是两个接口：

- “主题”(被观察者)接口`Observable`
    +  抽象方法`Attach`: 增加“订阅者”
    +  抽象方法`Detach`: 删除“订阅者”
    +  抽象方法`Notify`: 通知“订阅者”
- “订阅者”(观察者)接口`ObserverInterface`
    +  抽象方法`Do`: 自身的业务

订单逆向流的业务下，我们需要实现这两个接口:

- 具体订单取消的动作实现“主题”接口`Observable`
- 子逻辑实现“订阅者”接口`ObserverInterface`

伪代码如下：

```
// ------------这里实现一个具体的“主题”------------

具体订单取消的动作实现“主题”(被观察者)接口`Observable`。得到一个具体的“主题”:

- 订单取消的动作的“主题”结构体`ObservableConcrete`
    +  成员属性`observerList []ObserverInterface`:订阅者列表
    +  具体方法`Attach`: 增加子逻辑
    +  具体方法`Detach`: 删除子逻辑
    +  具体方法`Notify`: 通知子逻辑

// ------------这里实现所有具体的“订阅者”------------

子逻辑实现“订阅者”接口`ObserverInterface`:

- 具体“订阅者”也就是子逻辑`OrderStatus`
    +  实现方法`Do`: 修改订单状态
- 具体“订阅者”也就是子逻辑`OrderStatusLog`
    +  实现方法`Do`: 记录订单状态变更日志
- 具体“订阅者”也就是子逻辑`CouponRefund`
    +  实现方法`Do`: 退优惠券
- 具体“订阅者”也就是子逻辑`PromotionRefund`
    +  实现方法`Do`: 还优惠活动资格
- 具体“订阅者”也就是子逻辑`StockRefund`
    +  实现方法`Do`: 还库存
- 具体“订阅者”也就是子逻辑`GiftCardRefund`
    +  实现方法`Do`: 还礼品卡
- 具体“订阅者”也就是子逻辑`WalletRefund`
    +  实现方法`Do`: 退钱包余额
- 具体“订阅者”也就是子逻辑`DeliverBillStatus`
    +  实现方法`Do`: 修改发货单状态
- 具体“订阅者”也就是子逻辑`DeliverBillStatusLog`
    +  实现方法`Do`: 记录发货单状态变更日志
- 具体“订阅者”也就是子逻辑`Refund`
    +  实现方法`Do`: 生成退款单
- 具体“订阅者”也就是子逻辑`Invoice`
    +  实现方法`Do`: 生成发票-红票
- 具体“订阅者”也就是子逻辑`Email`
    +  实现方法`Do`: 发邮件
- 具体“订阅者”也就是子逻辑`Sms`
    +  实现方法`Do`: 发短信
- 具体“订阅者”也就是子逻辑`WechatNotify`
    +  实现方法`Do`: 发微信消息
```

同时得到了我们的UML图：

![](http://cdn.tigerb.cn/20200411181215.jpg)

#### 代码demo

```go
package main

//------------------------------------------------------------
//我的代码没有`else`系列
//观察者模式
//@auhtor TIGERB<https://github.com/TIGERB>
//------------------------------------------------------------

import (
	"fmt"
	"reflect"
	"runtime"
)

// Observable 被观察者
type Observable interface {
	Attach(observer ...ObserverInterface) Observable
	Detach(observer ObserverInterface) Observable
	Notify() error
}

// ObservableConcrete 一个具体的 订单状态变化的被观察者
type ObservableConcrete struct {
	observerList []ObserverInterface
}

// Attach 注册观察者
// @param $observer ObserverInterface 观察者列表
func (o *ObservableConcrete) Attach(observer ...ObserverInterface) Observable {
	o.observerList = append(o.observerList, observer...)
	return o
}

// Detach 注销观察者
// @param $observer ObserverInterface 待注销的观察者
func (o *ObservableConcrete) Detach(observer ObserverInterface) Observable {
	if len(o.observerList) == 0 {
		return o
	}
	for k, observerItem := range o.observerList {
		if observer == observerItem {
			fmt.Println(runFuncName(), "注销:", reflect.TypeOf(observer))
			o.observerList = append(o.observerList[:k], o.observerList[k+1:]...)
		}
	}
	return o
}

// Notify 通知观察者
func (o *ObservableConcrete) Notify() (err error) {
	// code ...
	for _, observer := range o.observerList {
		if err = observer.Do(o); err != nil {
			return err
		}
	}
	return nil
}

// ObserverInterface 定义一个观察者的接口
type ObserverInterface interface {
	// 自身的业务
	Do(o Observable) error
}

// OrderStatus 修改订单状态
type OrderStatus struct {
}

// Do 具体业务
func (observer *OrderStatus) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "修改订单状态...")
	return
}

// OrderStatusLog 记录订单状态变更日志
type OrderStatusLog struct {
}

// Do 具体业务
func (observer *OrderStatusLog) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "记录订单状态变更日志...")
	return
}

// CouponRefund 退优惠券
type CouponRefund struct {
}

// Do 具体业务
func (observer *CouponRefund) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "退优惠券...")
	return
}

// PromotionRefund 还优惠活动资格
type PromotionRefund struct {
}

// Do 具体业务
func (observer *PromotionRefund) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "还优惠活动资格...")
	return
}

// StockRefund 还库存
type StockRefund struct {
}

// Do 具体业务
func (observer *StockRefund) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "还库存...")
	return
}

// GiftCardRefund 还礼品卡
type GiftCardRefund struct {
}

// Do 具体业务
func (observer *GiftCardRefund) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "还礼品卡...")
	return
}

// WalletRefund 退钱包余额
type WalletRefund struct {
}

// Do 具体业务
func (observer *WalletRefund) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "退钱包余额...")
	return
}

// DeliverBillStatus 修改发货单状态
type DeliverBillStatus struct {
}

// Do 具体业务
func (observer *DeliverBillStatus) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "修改发货单状态...")
	return
}

// DeliverBillStatusLog 记录发货单状态变更日志
type DeliverBillStatusLog struct {
}

// Do 具体业务
func (observer *DeliverBillStatusLog) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "记录发货单状态变更日志...")
	return
}

// Refund 生成退款单
type Refund struct {
}

// Do 具体业务
func (observer *Refund) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "生成退款单...")
	return
}

// Invoice 生成发票-红票
type Invoice struct {
}

// Do 具体业务
func (observer *Invoice) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "生成发票-红票...")
	return
}

// Email 发邮件
type Email struct {
}

// Do 具体业务
func (observer *Email) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "发邮件...")
	return
}

// Sms 发短信
type Sms struct {
}

// Do 具体业务
func (observer *Sms) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "发短信...")
	return
}

// WechatNotify 发微信消息
type WechatNotify struct {
}

// Do 具体业务
func (observer *WechatNotify) Do(o Observable) (err error) {
	// code...
	fmt.Println(runFuncName(), "发微信消息...")
	return
}

// 客户端调用
func main() {

	// 创建 未支付取消订单 “主题”
	fmt.Println("----------------------- 未支付取消订单 “主题”")
	orderUnPaidCancelSubject := &ObservableConcrete{}
	orderUnPaidCancelSubject.Attach(
		&OrderStatus{},
		&OrderStatusLog{},
		&CouponRefund{},
		&PromotionRefund{},
		&StockRefund{},
	)
	orderUnPaidCancelSubject.Notify()

	// 创建 超时关单 “主题”
	fmt.Println("----------------------- 超时关单 “主题”")
	orderOverTimeSubject := &ObservableConcrete{}
	orderOverTimeSubject.Attach(
		&OrderStatus{},
		&OrderStatusLog{},
		&CouponRefund{},
		&PromotionRefund{},
		&StockRefund{},
		&Email{},
		&Sms{},
		&WechatNotify{},
	)
	orderOverTimeSubject.Notify()

	// 创建 已支付取消订单 “主题”
	fmt.Println("----------------------- 已支付取消订单 “主题”")
	orderPaidCancelSubject := &ObservableConcrete{}
	orderPaidCancelSubject.Attach(
		&OrderStatus{},
		&OrderStatusLog{},
		&CouponRefund{},
		&PromotionRefund{},
		&StockRefund{},
		&GiftCardRefund{},
		&WalletRefund{},
		&Refund{},
		&Invoice{},
		&Email{},
		&Sms{},
		&WechatNotify{},
	)
	orderPaidCancelSubject.Notify()

	// 创建 取消发货单 “主题”
	fmt.Println("----------------------- 取消发货单 “主题”")
	deliverBillCancelSubject := &ObservableConcrete{}
	deliverBillCancelSubject.Attach(
		&OrderStatus{},
		&OrderStatusLog{},
		&DeliverBillStatus{},
		&DeliverBillStatusLog{},
		&StockRefund{},
		&GiftCardRefund{},
		&WalletRefund{},
		&Refund{},
		&Invoice{},
		&Email{},
		&Sms{},
		&WechatNotify{},
	)
	deliverBillCancelSubject.Notify()

	// 创建 拒收 “主题”
	fmt.Println("----------------------- 拒收 “主题”")
	deliverBillRejectSubject := &ObservableConcrete{}
	deliverBillRejectSubject.Attach(
		&OrderStatus{},
		&OrderStatusLog{},
		&DeliverBillStatus{},
		&DeliverBillStatusLog{},
		&StockRefund{},
		&GiftCardRefund{},
		&WalletRefund{},
		&Refund{},
		&Invoice{},
		&Email{},
		&Sms{},
		&WechatNotify{},
	)
	deliverBillRejectSubject.Notify()

	// 未来可以快速的根据业务的变化 创建新的主题 从而快速构建新的业务接口
	fmt.Println("----------------------- 未来的扩展...")

}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}
```

代码运行结果：

```
[Running] go run "../easy-tips/go/src/patterns/observer/observer.go"
----------------------- 未支付取消订单 “主题”
main.(*OrderStatus).Do 修改订单状态...
main.(*OrderStatusLog).Do 记录订单状态变更日志...
main.(*CouponRefund).Do 退优惠券...
main.(*PromotionRefund).Do 还优惠活动资格...
main.(*StockRefund).Do 还库存...
----------------------- 超时关单 “主题”
main.(*OrderStatus).Do 修改订单状态...
main.(*OrderStatusLog).Do 记录订单状态变更日志...
main.(*CouponRefund).Do 退优惠券...
main.(*PromotionRefund).Do 还优惠活动资格...
main.(*StockRefund).Do 还库存...
main.(*Email).Do 发邮件...
main.(*Sms).Do 发短信...
main.(*WechatNotify).Do 发微信消息...
----------------------- 已支付取消订单 “主题”
main.(*OrderStatus).Do 修改订单状态...
main.(*OrderStatusLog).Do 记录订单状态变更日志...
main.(*CouponRefund).Do 退优惠券...
main.(*PromotionRefund).Do 还优惠活动资格...
main.(*StockRefund).Do 还库存...
main.(*GiftCardRefund).Do 还礼品卡...
main.(*WalletRefund).Do 退钱包余额...
main.(*Refund).Do 生成退款单...
main.(*Invoice).Do 生成发票-红票...
main.(*Email).Do 发邮件...
main.(*Sms).Do 发短信...
main.(*WechatNotify).Do 发微信消息...
----------------------- 取消发货单 “主题”
main.(*OrderStatus).Do 修改订单状态...
main.(*OrderStatusLog).Do 记录订单状态变更日志...
main.(*DeliverBillStatus).Do 修改发货单状态...
main.(*DeliverBillStatusLog).Do 记录发货单状态变更日志...
main.(*StockRefund).Do 还库存...
main.(*GiftCardRefund).Do 还礼品卡...
main.(*WalletRefund).Do 退钱包余额...
main.(*Refund).Do 生成退款单...
main.(*Invoice).Do 生成发票-红票...
main.(*Email).Do 发邮件...
main.(*Sms).Do 发短信...
main.(*WechatNotify).Do 发微信消息...
----------------------- 拒收 “主题”
main.(*OrderStatus).Do 修改订单状态...
main.(*OrderStatusLog).Do 记录订单状态变更日志...
main.(*DeliverBillStatus).Do 修改发货单状态...
main.(*DeliverBillStatusLog).Do 记录发货单状态变更日志...
main.(*StockRefund).Do 还库存...
main.(*GiftCardRefund).Do 还礼品卡...
main.(*WalletRefund).Do 退钱包余额...
main.(*Refund).Do 生成退款单...
main.(*Invoice).Do 生成发票-红票...
main.(*Email).Do 发邮件...
main.(*Sms).Do 发短信...
main.(*WechatNotify).Do 发微信消息...

```

## 结语

最后总结下，「观察者模式」抽象过程的核心是：

- 被依赖的“主题”
- 被通知的“订阅者”
- “订阅者”按需**订阅**“主题”
- “主题”变化**通知**“订阅者”

# 策略模式

## 什么是「策略模式」？

「策略模式」比较简单，大家平常工作中应该经常使用到，所以本文作为复习，帮助大家温故知新。我们先来看下定义：

> 不同的算法按照统一的标准封装，客户端根据不同的场景，决策使用何种算法。

上面的概念的关键词：

- 算法：就是行为
- 标准：就是interface
- 客户端：客户端是相对的，谁调用谁就是客户端
- 场景：判断条件
- 决策：判断的过程

概念很容易理解，不多说。

「策略模式」的优势：

- 典型的高内聚：算法和算法之间完全独立、互不干扰
- 典型的松耦合：客户端依赖的是接口的抽象方法
- 沉淀：每一个封装好的算法都是这个技术团队的财富，且未来可以被轻易的修改、复用

## 什么真实业务场景可以用「策略模式」？

> 每一行代码下面的十字路口

当代码的下一步面临选择的时候都可以使用「策略模式」，我们把不同选择的算法按照统一的标准封装，得到一类算法集的过程，就是实现「策略模式」的过程。

> 我们有哪些真实业务场景可以用「策略模式」呢？

比如：

- 缓存: 使用什么样的nosql
- 存储: 使用什么样的DB
- 支付: 使用什么样的支付方式
- 等等... 

本文以**支付接口**举例，说明「策略模式」的具体使用。

## 怎么用「策略模式」？

关于怎么用，完全可以生搬硬套我总结的使用设计模式的四个步骤：

- 业务梳理
- 业务流程图
- 代码建模
- 代码demo

#### 业务梳理

我们以某团的订单支付页面为例，页面上的每一个支付选项都是一个支付策略。如下：

用户可以使用：

- 美团支付(策略)
- 微信支付(策略)
- 支付宝支付(策略)

<p align="center">
  <img src="http://cdn.tigerb.cn/20200424131625.png" style="width:50%">
</p>

用户决定使用美团支付下的银行卡支付方式的参数
<p align="center">
  <img src="http://cdn.tigerb.cn/20200424132214.png" style="width:50%">
</p>

用户决定使用支付宝网页版支付方式的参数

<p align="center">
  <img src="http://cdn.tigerb.cn/20200424132232.png" style="width:50%">
</p>

> 注：不一定完全准确。

#### 业务流程图

我们通过梳理的文本业务流程得到了如下的业务流程图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200425192752.png" style="width:100%">
</p>

> 注：流程不一定完全准确。

#### 代码建模

「策略模式」的核心是接口：

- `PaymentInterface`
    + `Pay(ctx *Context) error` 当前支付方式的支付逻辑
	+ `Refund(ctx *Context) error` 当前支付方式的退款逻辑


伪代码如下：

```
// 定义一个支付接口
- `PaymentInterface`
    + 抽象方法`Pay(ctx *Context) error`: 当前支付方式的支付逻辑
	+ 抽象方法`Refund(ctx *Context) error`: 当前支付方式的退款逻辑

// 定义具体的支付方式 实现接口`PaymentInterface`

- 具体的微信支付方式`WechatPay`
    +  实现方法`Pay`: 支付逻辑
	+  实现方法`Refund`: 支付逻辑
- 具体的支付宝支付网页版方式`AliPayWap`
    +  实现方法`Pay`: 支付逻辑
	+  实现方法`Refund`: 支付逻辑
- 具体的支付宝支付网页版方式`BankPay`
    +  实现方法`Pay`: 支付逻辑
	+  实现方法`Refund`: 支付逻辑

// 客户端代码
通过接口参数pay_type的值判断是哪种支付方式策略
```

同时得到了我们的UML图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200425151733.jpg" style="width:100%">
</p>

#### 代码demo

```go
package main

import (
	"fmt"
	"runtime"
)

//------------------------------------------------------------
//我的代码没有`else`系列
//策略模式
//@auhtor TIGERB<https://github.com/TIGERB>
//------------------------------------------------------------

const (
	// ConstWechatPay 微信支付
	ConstWechatPay = "wechat_pay"
	// ConstAliPayWap 支付宝支付 网页版
	ConstAliPayWap = "AliPayWapwap"
	// ConstBankPay 银行卡支付
	ConstBankPay = "quickbank"
)

// Context 上下文
type Context struct {
	// 用户选择的支付方式
	PayType string `json:"pay_type"`
}

// PaymentInterface 支付方式接口
type PaymentInterface interface {
	Pay(ctx *Context) error    // 支付
	Refund(ctx *Context) error // 退款
}

// WechatPay 微信支付
type WechatPay struct {
}

// Pay 当前支付方式的支付逻辑
func (p *WechatPay) Pay(ctx *Context) (err error) {
	// 当前策略的业务逻辑写这
	fmt.Println(runFuncName(), "使用微信支付...")
	return
}

// Refund 当前支付方式的支付逻辑
func (p *WechatPay) Refund(ctx *Context) (err error) {
	// 当前策略的业务逻辑写这
	fmt.Println(runFuncName(), "使用微信退款...")
	return
}

// AliPayWap 支付宝网页版
type AliPayWap struct {
}

// Pay 当前支付方式的支付逻辑
func (p *AliPayWap) Pay(ctx *Context) (err error) {
	// 当前策略的业务逻辑写这
	fmt.Println(runFuncName(), "使用支付宝网页版支付...")
	return
}

// Refund 当前支付方式的支付逻辑
func (p *AliPayWap) Refund(ctx *Context) (err error) {
	// 当前策略的业务逻辑写这
	fmt.Println(runFuncName(), "使用支付宝网页版退款...")
	return
}

// BankPay 银行卡支付
type BankPay struct {
}

// Pay 当前支付方式的支付逻辑
func (p *BankPay) Pay(ctx *Context) (err error) {
	// 当前策略的业务逻辑写这
	fmt.Println(runFuncName(), "使用银行卡支付...")
	return
}

// Refund 当前支付方式的支付逻辑
func (p *BankPay) Refund(ctx *Context) (err error) {
	// 当前策略的业务逻辑写这
	fmt.Println(runFuncName(), "使用银行卡退款...")
	return
}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}

func main() {
	// 相对于被调用的支付策略 这里就是支付策略的客户端

	// 业务上下文
	ctx := &Context{
		PayType: "wechat_pay",
	}

	// 获取支付方式
	var instance PaymentInterface
	switch ctx.PayType {
	case ConstWechatPay:
		instance = &WechatPay{}
	case ConstAliPayWap:
		instance = &AliPayWap{}
	case ConstBankPay:
		instance = &BankPay{}
	default:
		panic("无效的支付方式")
	}

	// 支付
	instance.Pay(ctx)
}
```

代码运行结果：

```
[Running] go run "../easy-tips/go/src/patterns/strategy/strategy.go"
main.(*WechatPay).Pay 使用微信支付...
```

## 结语

最后总结下，「策略模式」抽象过程的核心是：

在`每一行代码下面的十字路口`

- 声明标准：定义`interface`
- 封装算法：按照标准`interface`封装分支代码，得到每一个具体策略
- 构建算法集：每一个具体策略构成策略池子 -> 这就是沉淀的过程

# 状态模式

## 什么是「状态模式」？

> 不同的算法按照统一的标准封装，根据不同的**内部状态**，决策使用何种算法

### 「状态模式」和「策略模式」的区别

- 策略模式：依靠客户决策
- 状态模式：依靠内部状态决策

## 什么真实业务场景可以用「状态模式」？

> 具体算法的选取是由内部状态决定的

- 首先，内部存在多种状态
- 其次，不同的状态的业务逻辑各不相同

> 我们有哪些真实业务场景可以用「状态模式」呢？

比如，发送短信接口、限流等等。

- 短信接口
	+ 服务内部根据最优算法，实时推举出最优的短信服务商，并修改**使用何种短信服务商的状态**
- 限流
	+ 服务内部根据当前的实时流量，选择不同的限流算法，并修改**使用何种限流算法的状态**

## 怎么用「状态模式」？

关于怎么用，完全可以生搬硬套我总结的使用设计模式的四个步骤：

- 业务梳理
- 业务流程图
- 代码建模
- 代码demo

#### 业务梳理

先来看看一个短信验证码登录的界面。

<p align="center">
  <img src="http://cdn.tigerb.cn/20200522131127.png" style="width:100%">
</p>

可以得到：

- 发送短信，用户只需要输入手机号即可
- 至于短信服务使用何种短信服务商，是由短信服务自身的**当前短信服务商实例的状态**决定
- **当前短信服务商实例的状态**又是由服务自身的算法修改

#### 业务流程图

我们通过梳理的文本业务流程得到了如下的业务流程图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200522130715.png" style="width:100%">
</p>

#### 代码建模

「状态模式」的核心是：

- 一个接口:
	+ 短信服务接口`SmsServiceInterface`
- 一个实体类:
	+ 状态管理实体类`StateManager`

伪代码如下：

```
// 定义一个短信服务接口
- 接口`SmsServiceInterface`
	+ 抽象方法`Send(ctx *Context) error`发送短信的抽象方法

// 定义具体的短信服务实体类 实现接口`SmsServiceInterface`

- 实体类`ServiceProviderAliyun`
	+ 成员方法`Send(ctx *Context) error`具体的发送短信逻辑
- 实体类`ServiceProviderTencent`
	+ 成员方法`Send(ctx *Context) error`具体的发送短信逻辑
- 实体类`ServiceProviderYunpian`
	+ 成员方法`Send(ctx *Context) error`具体的发送短信逻辑

// 定义状态管理实体类`StateManager`
- 成员属性
	+ `currentProviderType ProviderType`当前使用的服务提供商类型
	+ `currentProvider SmsServiceInterface`当前使用的服务提供商实例
	+ `setStateDuration time.Duration`更新状态时间间隔
- 成员方法
	+ `initState(duration time.Duration)`初始化状态
	+ `setState(t time.Time)`设置状态
```

同时得到了我们的UML图：

<p align="center">
  <img src="http://cdn.tigerb.cn/20200527141350.jpg" style="width:100%">
</p>

#### 代码demo

```go
package main

//------------------------------------------------------------
//我的代码没有`else`系列
//状态模式
//@auhtor TIGERB<https://github.com/TIGERB>
//------------------------------------------------------------

import (
	"fmt"
	"math/rand"
	"runtime"
	"time"
)

// Context 上下文
type Context struct {
	Tel        string // 手机号
	Text       string // 短信内容
	TemplateID string // 短信模板ID
}

// SmsServiceInterface 短信服务接口
type SmsServiceInterface interface {
	Send(ctx *Context) error
}

// ServiceProviderAliyun 阿里云
type ServiceProviderAliyun struct {
}

// Send Send
func (s *ServiceProviderAliyun) Send(ctx *Context) error {
	fmt.Println(runFuncName(), "【阿里云】短信发送成功，手机号:"+ctx.Tel)
	return nil
}

// ServiceProviderTencent 腾讯云
type ServiceProviderTencent struct {
}

// Send Send
func (s *ServiceProviderTencent) Send(ctx *Context) error {
	fmt.Println(runFuncName(), "【腾讯云】短信发送成功，手机号:"+ctx.Tel)
	return nil
}

// ServiceProviderYunpian 云片
type ServiceProviderYunpian struct {
}

// Send Send
func (s *ServiceProviderYunpian) Send(ctx *Context) error {
	fmt.Println(runFuncName(), "【云片】短信发送成功，手机号:"+ctx.Tel)
	return nil
}

// 获取正在运行的函数名
func runFuncName() string {
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	f := runtime.FuncForPC(pc[0])
	return f.Name()
}

// ProviderType 短信服务提供商类型
type ProviderType string

const (
	// ProviderTypeAliyun 阿里云
	ProviderTypeAliyun ProviderType = "aliyun"
	// ProviderTypeTencent 腾讯云
	ProviderTypeTencent ProviderType = "tencent"
	// ProviderTypeYunpian 云片
	ProviderTypeYunpian ProviderType = "yunpian"
)

var (
	// stateManagerInstance 当前使用的服务提供商实例
	// 默认aliyun
	stateManagerInstance *StateManager
)

// StateManager 状态管理
type StateManager struct {
	// CurrentProviderType 当前使用的服务提供商类型
	// 默认aliyun
	currentProviderType ProviderType

	// CurrentProvider 当前使用的服务提供商实例
	// 默认aliyun
	currentProvider SmsServiceInterface

	// 更新状态时间间隔
	setStateDuration time.Duration
}

// initState 初始化状态
func (m *StateManager) initState(duration time.Duration) {
	// 初始化
	m.setStateDuration = duration
	m.setState(time.Now())

	// 定时器更新状态
	go func() {
		for {
			// 每一段时间后根据回调的发送成功率 计算得到当前应该使用的 厂商
			select {
			case t := <-time.NewTicker(m.setStateDuration).C:
				m.setState(t)
			}
		}
	}()
}

// setState 设置状态
// 根据短信云商回调的短信发送成功率 得到下阶段发送短信使用哪个厂商的服务
func (m *StateManager) setState(t time.Time) {
	// 这里用随机模拟
	ProviderTypeArray := [3]ProviderType{
		ProviderTypeAliyun,
		ProviderTypeTencent,
		ProviderTypeYunpian,
	}
	m.currentProviderType = ProviderTypeArray[rand.Intn(len(ProviderTypeArray))]

	switch m.currentProviderType {
	case ProviderTypeAliyun:
		m.currentProvider = &ServiceProviderAliyun{}
	case ProviderTypeTencent:
		m.currentProvider = &ServiceProviderTencent{}
	case ProviderTypeYunpian:
		m.currentProvider = &ServiceProviderYunpian{}
	default:
		panic("无效的短信服务商")
	}
	fmt.Printf("时间：%s| 变更短信发送厂商为: %s \n", t.Format("2006-01-02 15:04:05"), m.currentProviderType)
}

// getState 获取当前状态
func (m *StateManager) getState() SmsServiceInterface {
	return m.currentProvider
}

// GetState 获取当前状态
func GetState() SmsServiceInterface {
	return stateManagerInstance.getState()
}

func main() {

	// 初始化状态管理
	stateManagerInstance = &StateManager{}
	stateManagerInstance.initState(300 * time.Millisecond)

	// 模拟发送短信的接口
	sendSms := func() {
		// 发送短信
		GetState().Send(&Context{
			Tel:        "+8613666666666",
			Text:       "3232",
			TemplateID: "TYSHK_01",
		})
	}

	// 模拟用户调用发送短信的接口
	sendSms()
	time.Sleep(1 * time.Second)
	sendSms()
	time.Sleep(1 * time.Second)
	sendSms()
	time.Sleep(1 * time.Second)
	sendSms()
	time.Sleep(1 * time.Second)
	sendSms()
}
```

代码运行结果：

```
[Running] go run "./easy-tips/go/src/patterns/state/state.go"
时间：2020-05-30 18:02:37| 变更短信发送厂商为: yunpian 
main.(*ServiceProviderYunpian).Send 【云片】短信发送成功，手机号:+8613666666666
时间：2020-05-30 18:02:37| 变更短信发送厂商为: aliyun 
时间：2020-05-30 18:02:38| 变更短信发送厂商为: yunpian 
时间：2020-05-30 18:02:38| 变更短信发送厂商为: yunpian 
main.(*ServiceProviderYunpian).Send 【云片】短信发送成功，手机号:+8613666666666
时间：2020-05-30 18:02:38| 变更短信发送厂商为: tencent 
时间：2020-05-30 18:02:39| 变更短信发送厂商为: aliyun 
时间：2020-05-30 18:02:39| 变更短信发送厂商为: tencent 
main.(*ServiceProviderTencent).Send 【腾讯云】短信发送成功，手机号:+8613666666666
时间：2020-05-30 18:02:39| 变更短信发送厂商为: yunpian 
时间：2020-05-30 18:02:40| 变更短信发送厂商为: tencent 
时间：2020-05-30 18:02:40| 变更短信发送厂商为: aliyun 
main.(*ServiceProviderAliyun).Send 【阿里云】短信发送成功，手机号:+8613666666666
时间：2020-05-30 18:02:40| 变更短信发送厂商为: yunpian 
时间：2020-05-30 18:02:40| 变更短信发送厂商为: tencent 
时间：2020-05-30 18:02:41| 变更短信发送厂商为: aliyun 
时间：2020-05-30 18:02:41| 变更短信发送厂商为: yunpian 
main.(*ServiceProviderYunpian).Send 【云片】短信发送成功，手机号:+8613666666666
```

## 结语

最后总结下，「状态模式」抽象过程的核心是：

- 每一个状态映射对应行为
- 行为实现同一个接口`interface`
- 行为是内部的一个状态
- 状态是不断变化的

# TODO