---
title: Go框架解析:iris
date: 2019-06-29 19:46:53
tags: golang
cover_index: "http://cdn.tigerb.cn/20190627125846.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
---

## 前言

报了个驾校，时隔两个多月没发文章了，驾考上周终于都结束了，这之后得补补前两月的文章了。之前定了个目标，读完beego、iris、gin等go框架的源码，之前已经发过一篇过于beego的文章[Go框架解析:beego](http://tigerb.cn/2018/12/06/go-beego/)，今天带来的是go框架iris的解析，主要讲解iris框架的一个生命周期过程。

在读这篇文章之前，如果没看过[Go框架解析:beego](http://tigerb.cn/2018/12/06/go-beego/)的可以先去看看，因为[Go框架解析:beego](http://tigerb.cn/2018/12/06/go-beego/)有讲关于**go如何启动一个http server**,这个知识点对理解本篇文章有很大的帮助。

## 安装

使用glide安装：
```
glide get github.com/kataras/iris
glide get github.com/kataras/golog
```

启动一个简单的iris http服务：
```
//main.go
package main

import "github.com/kataras/iris"

func main() {
	app := iris.Default()
	app.Get("/ping", func(ctx iris.Context) {
		ctx.JSON(iris.Map{
			"message": "pong",
		})
	})
	app.Run(iris.Addr(":8888"))
}

```

## iris的生命周期

<img src="http://cdn.tigerb.cn/20190704211456.png" style="width:100%">

> 访问图片源地址查看大图 http://cdn.tigerb.cn/20190628234814.png

上图是我在读iris代码时，整理的iris框架的一个生命周期流程图，内容比较多。总的来说划分为四个大的部分：

#### 橙色部分
初始化iris.Application:
- 创建iris.Application 
- 创建APIBuilder(app.Get()等方法的路由都是注册到这里) 
- 创建Router(每个http请求都是通过router处理的)

#### 蓝色部分
注册路由到app.APIBuilder

#### 紫色部分
初始化一个http.Server

#### 绿色部分

构建路由handler&启动http server:

- 注册`app.APIBuilder`到`app.Router.routesProvider`
- 注册`app.APIBuilder.routes`的路由到`app.Router.requestHandler`
- 启动http server

## 关键代码解析

1. 创建一个iris Application

```go
// Application 首先看看我们的iris Application结构体组成
type Application struct {
    // 我们的路由都注册到了 APIBuilder
    *router.APIBuilder
    // *router.Router 实现了ServeHTTP方法 并且最终赋值给了&http.server{}.Handler
    *router.Router
    // 请求上下文池子
    ContextPool    *context.Pool
    // 配置项
    config    *Configuration
    // 日志
    logger    *golog.Logger
    // 视图
    view    view.View
    // 执行一次的once
    once    sync.Once
    // 互斥锁
    mu    sync.Mutex
    Hosts            []*host.Supervisor
    hostConfigurators    []host.Configurator
}

// 创建了一个iris应用实例 
// 为什么不直接New呢？
// 因为Default里面注册了两个handle 
// 1. recover panic的方法，
// 2. 请求日志
app := iris.Default()

func Default() *Application {
	app := New()
    // 合成复用*APIBuilder的Use
	app.Use(recover.New())
    // 合成复用*APIBuilder的Use
    app.Use(requestLogger.New())
    
	return app
}

// app := New() 得到的结构体
app := &Application{
    config:     &config,
    logger:     golog.Default,
    // 很关键：我们的路由都注册到了 APIBuilder
    APIBuilder: router.NewAPIBuilder(),
    // 很关键：*router.Router 实现了ServeHTTP方法 并且最终赋值给了&http.server{}.Handler
    Router:     router.NewRouter(),
}

// 注册api请求的中间件
func (api *APIBuilder) Use(handlers ...context.Handler) {
	api.middleware = append(api.middleware, handlers...)
}
```

2. 关于`router.NewAPIBuilder()`

APIBuilder的routes属性很关键，最终的我们定义的路由都是注册到了这里。

```go
// APIBuilder
api := &APIBuilder{
    macros:            macro.Defaults,
    errorCodeHandlers: defaultErrorCodeHandlers(),
    reporter:          errors.NewReporter(),
    relativePath:      "/",
    // 最终的我们定义的路由都是注册到了这里
    routes:            new(repository),
}

// repository的结构
type repository struct {
	routes []*Route
}
```

结论：用户路由注册到了`app.APIBuilder.routes`

3. 关于`router.NewRouter()`

`router.NewRouter()`返回的是一个`&Router{}`指针，`&Router{}`有三个很关键的属性和一个`ServeHTTP`成员方法。

三个关键的属性：
- `mainHandler    http.HandlerFunc`
- `requestHandler RequestHandler` 
- `routesProvider RoutesProvider`

我们再看成员方法`ServeHTTP`实现了`ServeHTTP(w http.ResponseWriter, r *http.Request)`方法，就是accept请求之后就会执行这个方法，我们看看具体方法内容。

```
// implement ServeHTTP
func (router *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // 所以这里可以看出accept请求之后会执行mainHandler
	router.mainHandler(w, r)
}
```

```go
func NewRouter() *Router { return &Router{} }

type Router struct {
	mu sync.Mutex 
    requestHandler RequestHandler   
    // 每次http请求都会执行mainHandler
	mainHandler    http.HandlerFunc 
	wrapperFunc    func(http.ResponseWriter, *http.Request, http.HandlerFunc)

	cPool          *context.Pool r
	routesProvider RoutesProvider
}

// implement ServeHTTP
func (router *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // 每次http请求都会执行mainHandler
	router.mainHandler(w, r)
}
```

结论：每次http请求都会执行`mainHandler`

4. 注册路由

这里很简单了就是注册用户路由到`app.APIBuilder.routes`

```go
//router
func (api *APIBuilder) Get(relativePath string, handlers ...context.Handler) *Route {
	return api.Handle(http.MethodGet, relativePath, handlers...)
}

route := &Route{
    Name:            defaultName,
    Method:          method,
    methodBckp:      method,
    Subdomain:       subdomain,
    tmpl:            tmpl,
    Path:            path,
    Handlers:        handlers,
    MainHandlerName: mainHandlerName,
    FormattedPath:   formattedPath,
}
```

5. 构建请求handler

```go
//启动路由
app.Run()
⬇️
// 构建
app.Build()
⬇️
// 构建路由
app.Router.BuildRouter(app.ContextPool, routerHandler, app.APIBuilder, false)
⬇️
// 构建请求Handler 
// 把app.APIBuilder注册的api注册到了requestHandler里
// 因为我们在下面发现请求都是从router.requestHandler去处理的
requestHandler.Build(routesProvider)
⬇️
// 赋值
router.requestHandler = requestHandler
router.routesProvider = routesProvider
⬇️
// the important 没错很重要的地方mainHandler被赋值的地方
// 也就是accpet请求实际执行的代码
// 真相就在这
// the important
router.mainHandler = func(w http.ResponseWriter, r *http.Request) {
    // 构建请求上下文
    ctx := cPool.Acquire(w, r)
    // 处理请求
    router.requestHandler.HandleRequest(ctx)
    // 释放请求上下文
    cPool.Release(ctx)
}
⬇️
// 实际处理请求饿地方
// 路由的匹配就是这里了
func (h *routerHandler) HandleRequest(ctx context.Context)
```

6. 启动HTTP Server

最后我们就是启动这个http server了，这里和绝大多数golang的http服务启动基本一致。

```go
// 赋值http服务的ip+port
iris.Addr(":8888")
⬇️
//创建http.Server并启动服务的匿名方法
func Addr(addr string, hostConfigs ...host.Configurator) Runner {
	return func(app *Application) error {
		return app.NewHost(&http.Server{Addr: addr}).
			Configure(hostConfigs...).
			ListenAndServe()
	}
}
⬇️
// app.NewHost(&http.Server{Addr: addr})
// 就是这里赋值app.Router给http.Server的Handler的
if srv.Handler == nil {
    srv.Handler = app.Router
}
⬇️
// 启动服务
su.Server.Serve(l)
⬇️
// accept请求
l.Accept()
⬇️
// 启动一个goroutine处理请求
go c.serve(ctx)
⬇️
// 最终至此真相都大白了
serverHandler{c.server}.ServeHTTP(w, w.req)
```

## 结语

最后我们再简单的回顾下上面的流程：

<p align="center">
    <img src="http://cdn.tigerb.cn/20190629151818.png" style="width:30%">
</p>

---

《Go框架解析:系列文章链接如下：

- [Go框架解析:gin](http://tigerb.cn/2019/07/06/go-gin/)
- [Go框架解析:iris](http://tigerb.cn/2019/06/29/go-iris/)
- [Go框架解析:beego](http://tigerb.cn/2018/12/06/go-beego/)