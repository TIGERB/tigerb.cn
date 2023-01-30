---
title: 图解设计模式
date: 2021-03-07 13:20:30
tags: 
	- 设计模式
cover_index: "http://ro98r0r1a.hb-bkt.clouddn.com/20210307223724.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
---


```
本文不限于任何面向对象的编程语言
```

# 前言
---

常常听别人说设计模式不太容易理解，以及学习设计模式到底能帮我们解决什么问题，今天我们就用几张图来看看：

- 设计模式到底是什么？
- 为什么我们需要学习设计模式？

# 我也写过烂代码
---

是的，没什么，我也写过烂代码，刚毕业时业务逻辑也会一个函数干到底，只知道能实现功能就可以了。

```go
package demo
 
func YourFunc() {
	// 所有的逻辑代码一股脑写完......
}
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307142850.png" style="width:30%">
</p>

# 知道了拆分函数
---

自然而然知道了需要合理拆分函数。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307144448.png" style="width:30%">
</p>

然后把各个函数组织起来。

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307144536.png" style="width:30%">
</p>

# 面临新的困境
---

某一天产品的需求需要支持新的场景，发现某一处的代码逻辑有变动需要支持新的场景，怎么办？

1. 整个代码拷贝一份？不会有人这么干吧？(其实我还真见过，你们呢😏)
2. 把绿色变动的代码块，复制成一个新的函数，修改为新场景使用的函数？
3. 把变动的代码再提为两个新函数，一个绿色为老代码，一个蓝色为新场景代码？

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307144547.png" style="width:36%">
</p>

上面这种解决问题的方式就是**面向过程**的编程思想。

# 我们都在变优秀
---

随着我们不断的学习，学会使用了面向对象的特性。

以往函数式编程：
```go
package demo
 
// 函数式编程
// 把一个个你以为可以独立的逻辑封住到一个函数里
func YourFunc() {
	// ......
}
```

面向对象编程：
```go
package demo
 
// 面向对象编程
// 把不同的逻辑独立成一个对象
type DemoStruct struct{}
 
func (d *DemoStruct) YourFunc() {
	// ......
}
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307144804.png" style="width:50%">
</p>

所以，我们如何用面向对象的思想组织上面的代码呢？

答案：继承。

# 学会了使用继承
---

```
特别备注：Go里面用合成复用
```

定义一个父类，并把差异业务代码抽象为一个抽象函数，其他代码逻辑都实现在父类。


<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145232.png" style="width:50%">
</p>

不同的场景定义为不同的子类，子类继承父类，并实现抽象方法(也就是写差异代码)。

```
灰色：父类
绿色：场景一子类
蓝色：场景二子类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145349.png" style="width:50%">
</p>

是不是很优雅的解决上面的场景的问题。

# 什么是设计模式？
---

就是优雅解决上面场景问题时，利用面向对象特性的经验总结，就是设计模式。然而在历史的长河中，已经为我们总结了20+的常用设计模式，我们只需要学习和加以灵活运用即可。比如：

## **这！就是模板模式**

还记得上面使用继承的过程吗？其实我们只需要做一件事情，就是经典的模板模式了，是什么？

答案：保证该场景下父类中封装的方法调用过程是稳定不变的，只是其中的方法可能变化。

```
灰色：父类
绿色：场景一子类
蓝色：场景二子类
黄色：场景三子类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145529.png" style="width:50%">
</p>

## **这！就是策略模式**

我们把上面代码做些改动：

1. 不使用继承。
2. 定义一个接口interface类型。
3. 变更原抽象方法为调用一个接口interface类型的函数。

```go
package demo
 
// DemoInterface 接口
type DemoInterface interface {
    DoSomething(ctx *Context) error 
}
 
var CurrentStrategyInstance DemoInterface
 
func Demo() {
	//.....逻辑略......
	CurrentStrategyInstance.DoSomething(c)
	//.....逻辑略......
}
```

```
灰色：主业务类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145602.png" style="width:60%">
</p>

4. 不同的场景定义为一个具体的类，且实现上面的interface。

```
灰色：主业务类
绿色：场景一DemoInterface的具体实现类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145616.png" style="width:60%">
</p>

```
灰色：主业务类
绿色：场景一DemoInterface的具体实现类
蓝色：场景二DemoInterface的具体实现类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145642.png" style="width:60%">
</p>

```
灰色：主业务类
绿色：场景一DemoInterface的具体实现类
蓝色：场景二DemoInterface的具体实现类
黄色：场景三DemoInterface的具体实现类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307145705.png" style="width:60%">
</p>

5. 最后我们判断不同的场景初始化不同的具体类，再调用即可。

## **这！就是简单工厂模式 + 策略模式**

接着我们把**判断不同的场景初始化不同的具体类**单独封装起来，这就是简单工厂模式 + 策略模式。

```go
package demo
 
type DemoFactory struct {
}
 
// Get 获取实例
func (f *DemoFactory) Get(instanceType string) DemoInterface {
	switch instanceType {
	case "DemoA":
		return &DemoA{}
	case "DemoB":
		return &DemoB{}
	case "DemoC":
		return &DemoC{}
 
	default:
		panic("不支持的类型")
	}
}
 
// DemoInterface 接口
type DemoInterface interface {
    DoSomething(ctx *Context) error 
}
 
var CurrentStrategyInstance DemoInterface
 
func Demo() {
	//.....逻辑略......
  CurrentStrategyInstance = (DemoFactory{}).Get("DemoA")
	CurrentStrategyInstance.DoSomething(c)
	//.....逻辑略......
}
```

```
灰色(大)：主业务类
灰色(小)：简单工厂类
绿色：场景一DemoInterface的具体实现类
蓝色：场景二DemoInterface的具体实现类
黄色：场景三DemoInterface的具体实现类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307154154.png" style="width:60%">
</p>

## **这！就是状态模式**

假设判断上面使用何种策略不是依赖外部，而是依赖内部状态，则我们调整下代码，则就变成了状态模式。

```go
package demo

var currentStateInstance DemoInterface

func init() {
    // 定时器更新状态
    go func() {
        for {
            select {
            case t := <-time.NewTicker(1 * time.Second).C:
                // 模拟变成状态 StateA
                currentStateInstance = setState("StateA")
            }
        }
    }()
}
 
// Get 获取实例
func setState(State string) DemoInterface {
  // 变更状态
	switch State {
	case "StateA":
		return &StateA{}
	case "StateB":
		return &StateB{}
	case "StateC":
		return &StateC{}
 
	default:
		panic("不支持的状态")
	}
}
 
// DemoInterface 接口
type DemoInterface interface {
    DoSomething(ctx *Context) error 
}

// type StateA StateB StateC 略
 
// 模拟
func Demo() {
	//.....逻辑略......
	CurrentStateInstance.DoSomething(c)
	//.....逻辑略......
}
```

```
灰色(大)：主业务类
灰色(小)：修改内部状态的函数
绿色：场景一DemoInterface的具体实现类
蓝色：场景二DemoInterface的具体实现类
黄色：场景三DemoInterface的具体实现类
```

<p align="center">
  <img src="http://ro98r0r1a.hb-bkt.clouddn.com/20210307160512.png" style="width:60%">
</p>

# 结语
---

举了这么多🌰，所以关于：

- 设计模式到底是什么？
- 为什么我们需要学习设计模式？

你有答案了吗？