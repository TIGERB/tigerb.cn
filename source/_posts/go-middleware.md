---
title: 更优的框架中间件实现
date: 2019-07-20 12:54:04
tags: golang
cover_index: "http://ro98r0r1a.hb-bkt.clouddn.com/20190718194449.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
cover_detail: "http://ro98r0r1a.hb-bkt.clouddn.com/20190720222404.jpg?/format/webp/blur/1x0/quality/10%7Cimageslim"
---


<span></span>

## 前言

---

前几个周前前后后阅读了4个go框架(iris、gin、echo、beego)的生命周期，阅读过程中对它们在框架中间件的实现颇有印象，总觉着实现的都不是很完美。为什么呢？

- 使用起来有成本，当你实现一个新的中间件需要人为手动的在**业务代码**中添加一行`ctx.Next()`代码，目的去执行下一个中间件。
- 阅读代码起来存在障碍，使人不容易理解。感觉第一次想要去了解实现的人，基本会在这个代码实现上懵一会。
- 中间件都是匿名函数的类型，不够面向对象

为什么我会像上面这样说呢？因为，简单说来，这个框架中间件其实就是一个链式调用的过程。然而一想起链式调用的场景，往往我的脑海第一反应就是设计模式中的**责任链模式**。借助责任链模式的话，一来，我们实现一个新的中间件无需关心手动在业务代码里加上一个`Next()`手动调用下一个对象；二来，代码逻辑简单**清晰**。

首先我们来看看主流go框架中间件实现，再来对比我的框架中间件设计思路。

## 主流go框架中间件实现分析

---

### beego框架中间件的实现

首先我们来看看beego框架中间件的实现方式，beego对于框架中间件的实现最与众不同(天生的MVC框架)，所以我们先来看beego，大家都知道beego在controller接口里定义了一个`Prepare()`的发方法，beego提供了一个基础的controller结构，然后实际的业务controller会合成复用这个基础的controller,然后我们再去复写`Prepare()`就可以了，通过这个预执行方法可以达到中间件的目的。代码如下：

```go
// 控制器接口
type ControllerInterface interface {
	// 具体控制器需要实现的预执行方法
	Prepare()
}
```

但是除了上面之外大家常用的`Prepare()`，beego里其实还有一个`RunWithMiddleWares`的方法，我们可以当作注册启动前中间件的地方，代码如下：

```go
// 注册中间件
func RunWithMiddleWares(addr string, mws ...MiddleWare) {
	// ...
	BeeApp.Run(mws...)
}

// ...
app.Server.Handler = app.Handlers
for i := len(mws) - 1; i >= 0; i-- {
	if mws[i] == nil {
		continue
	}
	app.Server.Handler = mws[i](app.Server.Handler)
}
```

### iris框架中间件的实现

---

iris就是很标准的框架中间件，我们来总结下他的具体实现方式。

定义所有中间件的类型：

```go
// 定义了一个Handler类型 匿名函数类型
// 所有的中间件必须是Handler类型
// 所以在这些框架里中间件其实就是注册的闭包
type Handler func(Context)
```

匿名函数注册到类型为slice的中间件属性里：

```go
func (api *APIBuilder) Use(handlers ...context.Handler) {
	api.middleware = append(api.middleware, handlers...)
}
```

http.ServeHTTP执行索引是0的第一个中间件(context.Handler):

```go
// http.ServeHTTP 也就是每次请求都会调这个Do
func Do(ctx Context, handlers Handlers) {
	if len(handlers) > 0 {
		// 把当前的请求的中间件都挂载到上下文里
		ctx.SetHandlers(handlers)
		// 执行第一个注册的索引为0的中间件
		handlers[0](ctx)
	}
}
```

第一个匿名函数(中间件)会调用显示的执行`ctx.Next()`来下一个中间件，从而构成一个链式调用过程，我摘取了其中一个中间件的部分代码如下，我们可以看见匿名函数最后执行了`ctx.Next()`：

```go
return func(ctx context.Context) {
    // ...
    ctx.Next()
}
```

接着我们来看看`ctx.Next()`的具体实现：

```go
// 其实最终ctx.Next()执行的这里
func DefaultNext(ctx Context) {
	if ctx.IsStopped() {
		return
	}
	// 这里是获取当前要执行的中间件的索引
	// 我们先往下看ctx.HandlerIndex(-1)的逻辑 记住这里传的-1 其次currentHandlerIndex的默认值是0
	// 我们通过分析ctx.HandlerIndex(-1)的逻辑得到ctx.HandlerIndex(-1)返回的是0 而 n就是0+1=1了
	if n, handlers := ctx.HandlerIndex(-1)+1, ctx.Handlers(); n < len(handlers) {
		// 所以这里的n就是下一个中间件的索引1
		ctx.HandlerIndex(n)
		// 执行下一个索引1
		// 以此类推
		// 类似递归执行
		handlers[n](ctx)
	}
}

func (ctx *context) HandlerIndex(n int) (currentIndex int) {
	// 因为上面传的-1
	if n < 0 || n > len(ctx.handlers)-1 {
		// 所以代码走到这里
		// 假设这里是第一个中间件执行调用了这 所以currentHandlerIndex还是0
		// 所以返回0
		return ctx.currentHandlerIndex
	}
}
```

### gin框架中间件的实现

---

gin的中间件设计思路大体思路和iris一致，只是具体实现的细节上的和iris不一样，总的来说，一样的地方：

- 中间件实际的类型也是定义的匿名函数
- 中间件的载体也是切片

区别：使用的for循环来判断是否已经执行完所有中间件，而iris是通过if判断。

具体代码如下：

```go
// 同样的匿名函数 注册到类型为slice的中间件属性里
func (group *RouterGroup) Use(middleware ...HandlerFunc) IRoutes {
	group.Handlers = append(group.Handlers, middleware...)
	return group.returnObj()
}

func (c *Context) Next() {
	// c.index默认值是-1
	// 下面代码可以看出来
	// 所以第一次是-1+1=0 第一个中间件
	c.index++
	// 重点：注意这个for循环的c.index++
	// 如果c.handlers[c.index](c)执行中间件的方法又调用了Next
	// for循环的c.index++是不会执行的
	// 类似内部递归了
	for s := int8(len(c.handlers)); c.index < s; c.index++ {
		c.handlers[c.index](c)
	}
}

func (c *Context) reset() {
	// ...
	// c.index默认值是-1
	c.index = -1
	// ...
}

// 找了一个中间件的代码
func Recovery() HandlerFunc {
	return RecoveryWithWriter(DefaultErrorWriter)
}

func RecoveryWithWriter(out io.Writer) HandlerFunc {
	return func(c *Context) {
		defer func() {
		}()
		// 调用下一个中间件
		c.Next()
	}
}
```

### echo框架中间件的实现

---

echo的中间件实现大体思路虽然也是同iris、gin一致，但是呢，是这几个框架里唯一一个构成了所谓的调用链。怎么讲这个区别呢？我们先来回归下iris、gin的中间件：

> 执行了一个中间件后调用ctx.Next() 通过全局索引去找下一个待执行的中间件并执行

所以说呢，iris、gin的中间件并没有先构成链再执行。而echo的中间件实现做到了这个事情，其实也很简单，echo先通过for循环把下一个待执行匿名函数注入到了当前的匿名函数里，最后再依次执行。我们看下面的代码：

<!-- echo middleware -->
```go
// 第一次遍历返回的匿名函数类型
// 相对于iris、gin的中间件又封装了一层
// 1. 函数里面返回匿名函数
// 2. 匿名函数里面又返回匿名函数 
// 3. 匿名函数里又调用注入的匿名函数
// 看起来是不是很累
MiddlewareFunc func(HandlerFunc) HandlerFunc

// 实际中间件业务的 匿名函数类型
HandlerFunc func(Context) error

// 摘了一个中间件代码片段
func RecoverWithConfig(config RecoverConfig) echo.MiddlewareFunc {
	// 函数里面返回匿名函数
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		// 匿名函数里面又返回匿名函数
		return func(c echo.Context) error {
			}()
			// 匿名函数里又调用注入的匿名函数
			return next(c)
		}
	}
}

// 和iris、gin一样的中间件注册方式
// 只是在实际中间件匿名函数上又包装了一层匿名函数
// 方便循环层层注入中间件
func (e *Echo) Use(middleware ...MiddlewareFunc) {
	e.middleware = append(e.middleware, middleware...)
}

// 每次http请求都会执行这里
func (e *Echo) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// 找路由handler
	e.findRouter(r.Host).Find(r.Method, getPath(r), c)
	h = c.Handler()
	// 遍历中间件 通过匿名函数构成链式调用
	h = applyMiddleware(h, e.middleware...)
	// h(c) 执行构成的链
}

func applyMiddleware(h HandlerFunc, middleware ...MiddlewareFunc) HandlerFunc {
	// 通过匿名函数 循环层层注入中间件 构成链式调用
	for i := len(middleware) - 1; i >= 0; i-- {
		h = middleware[i](h)
	}
	return h
}
```

上面我们看完了iris、gin、echo、beego框架中间件的实现方式，最后才开始了本篇文章的正题：

## 责任链模式下框架中间件的实现

---

**责任链模式的部分概念**:把一系列**处理对象**构成一个链，传递**被处理对象**的设计。我们借鉴的就是这个设计。

责任链模式的实现很简单，一个对象(Handler)执行(Run())完成自身的业务(Do())之后，判断是否存在下一个对象(nextHandler)，如果存在则执行下一个对象(nextHandler.Do())。除此之外我们这个Handler还应该拥有一个设置下一个对象的成员方法。所以，我们这个Handler的uml结构如下：

<p align="center">
	<img src="http://ro98r0r1a.hb-bkt.clouddn.com/20190720191330.jpg?/format/webp/blur/1x0/quality/10%7Cimageslim" style="width:50%;">
</p>

建模成员|成员类型|含义|抽象程度|复用方式
------|------|------|------|------
nextHandler|成员属性|下一个对象|具体不变|统一定义复用，比如直接继承父类
Do|成员方法|自身的业务|不同对象不同实现|需要抽象(是个抽象方法)
SetNext|成员方法|设置下一个对象的方法|具体不变|统一定义复用，比如直接继承父类
Run|成员方法|执行当前&下一个对象|具体不变|统一定义复用，比如直接继承父类

理论上按照上面的建模过程，我们可以抽象出一个抽象类，具体的Handler继承这个抽象类，再实现具体的抽象方法`Do`即可，**无需在再在业务代码中手动调用下一个对象**(优雅、低接入成本)。但是由于go中没有继承的概念，又无法满足我们的需求，然而我们可以通过合成复用的方式来尽可能的实现(如果像看可以继承的实现的方式，可以看我的php代码实现<https://github.com/TIGERB/easy-tips/blob/master/patterns/chainOfResponsibility/test.php>)，最终Go合成复用版本的uml图如下：

<p align="center">
	<img src="http://ro98r0r1a.hb-bkt.clouddn.com/20190720182529.jpg?/format/webp/blur/1x0/quality/10%7Cimageslim" style="width:80%">
</p>

1. 所有业务Handler实现Handler接口
2. Next结构体实现了具体的`nextHandler`成员属性、`SetNext`成员方法、`Run`成员方法
3. 业务Handler实现具体的`Do`成员方法，业务Handler合成复用Next的`nextHandler`成员属性、`SetNext`成员方法、`Run`成员方法

所以最终我们要实现的一个新的业务Handler只需要1. 合成复用Next 2.实现具体的`Do`，是不是很简单和优雅。接着我们用实际的代码来证明这个的简单、清晰、优雅。

```go
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
	Run(c *Context)
}

// Next 抽象出来的 可被合成复用的结构体
type Next struct {
	// 下一个对象
	nextHandler Handler
}

// SetNext 实现好的 可被复用的SetNext反方
// 返回值是下一个对象 方便写成链式代码优雅
// 例如 nullHandler.SetNext(argumentsHandler).SetNext(signHandler).SetNext(frequentHandler)
func (n *Next) SetNext(h Handler) Handler {
	n.nextHandler = h
	return h
}

// Run 执行
func (n *Next) Run(c *Context) {
	// 由于go无继承的概念 这里无法执行当前handler的Do
	// n.Do(c)
	if n.nextHandler != nil {
		// 合成复用下的变种
		// 执行下一个handler的Do
		(n.nextHandler).Do(c)
		// 执行下一个handler的Run
		(n.nextHandler).Run(c)
	}
}

// NullHandler 空Handler
// 由于go无继承的概念 作为链式调用的第一个载体 设置实际的下一个对象
type NullHandler struct {
	// 合成复用Next的`nextHandler`成员属性、`SetNext`成员方法、`Run`成员方法
	Next
}

// Do 空Handler的Do
func (h *NullHandler) Do(c *Context) error {
	// 空Handler 这里什么也不做 只是载体 do nothing...
	return nil
}

// SignHandler 校验请求签名的handler
type SignHandler struct {
	// 合成复用Next
	Next
}

// Do 校验请求签名逻辑
func (h *SignHandler) Do(c *Context) error {
	fmt.Println("校验签名成功...")
	return nil
}

// ArgumentsHandler 校验参数的handler
type ArgumentsHandler struct {
	// 合成复用Next
	Next
}

// Do 校验参数的逻辑
func (h *ArgumentsHandler) Do(c *Context) error {
	fmt.Println("校验参数成功...")
	return nil
}

// FrequentHandler 校验请求频率的hanlder
type FrequentHandler struct {
	Next
}

// Do 校验请求频率逻辑
func (h *FrequentHandler) Do(c *Context) error {
	fmt.Println("校验请求频率成功...")
	return nil
}

func main() {
	// 初始化空handler
	nullHandler := &NullHandler{}
	// 初始化参数handler
	argumentsHandler := &ArgumentsHandler{}
	// 初始化签名handler
	signHandler := &SignHandler{}
	// 初始化频率handler
	frequentHandler := &FrequentHandler{}

	// 链式调用 代码是不是很优雅
	// 很明显的链 逻辑关系一览无余
	nullHandler.SetNext(argumentsHandler).SetNext(signHandler).SetNext(frequentHandler)
	nullHandler.Run(&Context{})
}

// 执行结果
// [Running] go run "/Users/tigerb/github/easy-tips/go/src/go-learn/main.go"
// 校验参数成功...
// 校验签名成功...
// 校验请求频率成功...
```

接着我们看看如何把责任链模式用做框架中间件的实现方式，我们还是用上面的代码实现好的结构体，具体代码如下：

```go
// 初始化一个框架中间件切片
middlewares := make([]Handler, 0)
// 创建一个空的handler作为下一个中间件的载体
middlewares = append(middlewares, nullHandler)
// 注册中间件
middlewares = append(middlewares, argumentsHandler)
// 注册中间件
middlewares = append(middlewares, signHandler)
// 注册中间件
middlewares = append(middlewares, frequentHandler)

// 遍历中间件切片
for k, handler := range middlewares {
	// 第一个中间件跳过
	if k == 0 {
		continue
	}
	// 上一个中间件 设置 下一个中间件对象
	middlewares[k-1].SetNext(handler)
}
// 开启链式调用过程
nullHandler.Run(&Context{})

// 执行结果
// [Running] go run "/Users/tigerb/github/easy-tips/go/src/go-learn/main.go"
// 校验参数成功...
// 校验签名成功...
// 校验请求频率成功...
```

## 总结
---

框架中间件|优点|不足
--------------|--------------|--------------
beego's middleware|符合php开发者使用框架的习惯|中间件概念不够突出，概念不够抽象、隔离
iris's middleware|执行过程中链式调用、去耦合、复用性高|手动Next()、实现不够优雅、执行前未先构成调用链
gin's middleware|同iris|同iris、此外用了for循环(for循环里递归代码阅读起来是个坑)
echo's middleware|同iris、先构成链再执行|同iris
我的middleware|面向对象、链式调用逻辑清晰简单、成本低无需业务代码中手动插入Next()、优雅|go中无继承概念需要单独实现一个什么也不做的空业务对象，作为链的开端和载体