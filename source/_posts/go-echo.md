---
title: Go框架解析:echo
date: 2019-07-13 12:30:10
tags: golang
cover_index: "http://cdn.tigerb.cn/20190714103845.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
---

<img src="http://cdn.tigerb.cn/20190714103637.jpg?format/webp/blur/1x0/quality/75|imageslim" style="width:100%">

## 前言

今天是我golang框架阅读系列第四篇文章，今天我们主要看看**echo**的框架执行流程。关于**golang框架生命周期**源码阅读下面是我的计划：

计划|状态
---|---
[Go框架解析:beego](http://tigerb.cn/2018/12/06/go-beego/)|✅done
[Go框架解析:iris](http://tigerb.cn/2019/06/29/go-iris/)|✅done
[Go框架解析:gin](http://tigerb.cn/2019/07/06/go-gin/) |✅done
[Go框架解析:echo](http://tigerb.cn/2019/07/13/go-echo/)|✅done
Go框架解析:revel|✈️doing
Go框架解析:Martini|️️✈️doing

再完成各个golang框架生命周期的解析之后，我会计划对这几个框架的优略进行一个系列分析，由于业内大多都是性能分析的比较多，我可能会更侧重于以下维度：

- 框架设计
- 路由算法

第一波我们主要把重点放在**框架设计**上面。

---

## 安装

使用go mod安装：
```
// 初始化go.mod文件
go mod init echo-code-read
// 安装echo
go get github.com/labstack/echo/
// touch main.go 创建main.go文件贴如下面的示例
// 复制依赖到vendor目录
go mod vendor
```

启动一个简单的echo http服务：
```go
package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// 创建一个echo实例
	// 不同于iris、gin 是直接使用New
	e := echo.New()

	// 注册中间件
	// 需要我们在入口文件手动注入基础中间件
	// iris、gin是又封装了一次 其实对我们来讲挺好的
	// 只是iris、gin命名封装的方法Default 实在没有语意
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 注册路由
	// 这里这几个框架的写法没啥区别
	e.GET("/", hello)

	// 启动服务
	// 基本同gin
	// 只是加了个返回值的日志
	e.Logger.Fatal(e.Start(":1323"))
}

// 路由handle提出来了而已
// 匿名函数方式 不重要
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
```

---

## echo的生命周期

看完echo的框架流程，再对别iris、gin。总体的感受就是**套路一致**，也是一个**简洁的Go框架**，对于使用者来说，在入口文件需要手动的注册Logger、Recover公共中间件，而不像iris、gin一样封装一个Default方法，其次在构成中间件链的实现方式上有些小的区别(之后文章统一分析)，其他的框架设计思路基本和gin一样。

下图就是我对整个Echo框架生命周期的输出，由于图片过大存在平台压缩的可能，建议大家直接查看原图链接。

<p>
	<img src="http://cdn.tigerb.cn/20190711122919.png" style="width:100%">
</p>

> 访问图片源地址查看大图 http://cdn.tigerb.cn/20190711122919.png

原图查看链接: <http://cdn.tigerb.cn/20190711122919.png>

---

## 关键代码解析

```go
// 初始化一个echo框架实例
// 不同于iris和gin 
// iris和gin在这之上又封装了一层 包含必须的中间件注册
e := echo.New()
⬇️
// 具体的获取实例方法
func New() (e *Echo) {
	e = &Echo{
		// 创建一个http Server指针
		Server:    new(http.Server),
		// 创建一个https的 Server指针
		TLSServer: new(http.Server),
		AutoTLSManager: autocert.Manager{
			Prompt: autocert.AcceptTOS,
		},
		// 日志实例
		Logger:   log.New("echo"),
		// 控制台、日志可以彩色输出的实例
		colorer:  color.New(),
		maxParam: new(int),
	}
	// http server绑定实现了server.Handler的实例
	// 也就是说Echo框架自身实现了http.Handler接口
	e.Server.Handler = e
	// https server绑定实现了server.Handler的实例
	e.TLSServer.Handler = e
	// 绑定http服务异常处理的handler
	e.HTTPErrorHandler = e.DefaultHTTPErrorHandler
	// 
	e.Binder = &DefaultBinder{}
	// 设置日志输出级别
	e.Logger.SetLevel(log.ERROR)
	// 绑定标准日志输出实例
	e.StdLogger = stdLog.New(e.Logger.Output(), e.Logger.Prefix()+": ", 0)
	// 和iris、gin都一样
	// 绑定获取请求上下文实例的闭包
	e.pool.New = func() interface{} {
		return e.NewContext(nil, nil)
	}
	// 绑定路由实例
	e.router = NewRouter(e)
	// 绑定路由map
	// 注意这个属性的含义：路由分组用的，key为host,则按host分组
	// 记住与Router.routes区别
	// Router.routes存的路由的信息(不包含路由的handler)
	e.routers = map[string]*Router{}
	return
}
⬇️
func NewRouter(e *Echo) *Router {
	// 初始化Router
	return &Router{
		// 路由树
		// 路由的信息(包含路由的handler)
		// 查找路由用的LCP (最长公共前缀)算法
		tree: &node{
			// 节点对应的不同http method的handler
			methodHandler: new(methodHandler),
		},
		// Router.routes存的路由的信息(不包含路由的handler)
		routes: map[string]*Route{},
		// 框架实例自身
		echo:   e,
	}
}

// ---------router---------
// 接下来我们看看路由相关的流程
// 之前我们先看看相关一些重要的结构体
Router struct {
	// 路由树
	tree   *node
	// 路由信息mao
	routes map[string]*Route
	// 框架实例
    echo   *Echo
}

// LCP (最长公共前缀) 算法 通过path查找路由
// 之后路由算法专题细聊
node struct {
    kind          kind
    label         byte
    prefix        string
    parent        *node
    children      children
    ppath         string
    pnames        []string
    methodHandler *methodHandler
}
kind          uint8
// 子节点
children      []*node
// 不同http method的handler
methodHandler struct {
    connect  HandlerFunc
    delete   HandlerFunc
    get      HandlerFunc
    head     HandlerFunc
    options  HandlerFunc
    patch    HandlerFunc
    post     HandlerFunc
    propfind HandlerFunc
    put      HandlerFunc
    trace    HandlerFunc
    report   HandlerFunc
}
HandlerFunc func(Context) error

Route struct {
	// http method
	Method string `json:"method"`
	// 路由path
	Path   string `json:"path"`
	// 路由handler名称
    Name   string `json:"name"`
}

// 注册路由
e.GET("/", hello)
⬇️
// 注册路由
func (e *Echo) GET(path string, h HandlerFunc, m ...MiddlewareFunc) *Route {
	// 注册路由
	return e.Add(http.MethodGet, path, h, m...)
}
️️⬇️
func (e *Echo) Add(method, path string, handler HandlerFunc, middleware ...MiddlewareFunc) *Route {
	// 注册路由 add方法相对于Add多了host参数
	return e.add("", method, path, handler, middleware...)
}
⬇️
func (e *Echo) add(host, method, path string, handler HandlerFunc, middleware ...MiddlewareFunc) *Route {
	// 获取handler的名称
	// 😨这个方法里面尽然用了反射获取name 只是个name有必要么 没别的办法了吗？
	name := handlerName(handler)
	// 寻找当前host的路由实例
	router := e.findRouter(host)
	// 注册路由
	// 注意第三个参数是个闭包 匹配到路由就会执行这个闭包
	router.Add(method, path, func(c Context) error {
		// 初始化一个handler类型的实例
		h := handler
		for i := len(middleware) - 1; i >= 0; i-- {
			// 注意这里的中间件是这个路由专属的
			// 而Use、Pre注册的中间件是全局公共的
			// 遍历中间件
			// 注意返回值类型是HandlerFunc
			// 感觉他们这里设计的复杂了
			// 后期我看看可不可以把责任链模式引入进来 一下就清晰了
			h = middleware[i](h)
		}
		// 执行最后一个中间件
		return h(c)
	})
	// 本次注册进来的路由的信息
	// 感觉设计的很怪 上面注册一次路由且包含路由的handler
	// 这里又单独存一个不包含路由handler的路由信息
	// 为啥不都放一起呢？哎
	r := &Route{
		Method: method,
		Path:   path,
		Name:   name,
	}
	// map存路由信息
	e.router.routes[method+path] = r
	return r
}

// ---------start---------
// 启动http server
e.Start(":1323")

func (e *Echo) Start(address string) error {
	// 设置server地址
	e.Server.Addr = address
	// 启动server
	return e.StartServer(e.Server)
}
⬇️
func (e *Echo) StartServer(s *http.Server) (err error) {
	e.colorer.SetOutput(e.Logger.Output())
	s.ErrorLog = e.StdLogger
	// 设置框架实例到http server的Handler
	// Echo框架结构体实现了http.Handler接口
	s.Handler = e
	if e.Debug {
		// 如果开启了debug则设置日志级别为 debug
		e.Logger.SetLevel(log.DEBUG)
	}

	// 是否隐藏框架启动输出的标志
	if !e.HideBanner {
		e.colorer.Printf(banner, e.colorer.Red("v"+Version), e.colorer.Blue(website))
	}

	// 启动http server
	if s.TLSConfig == nil {
		if e.Listener == nil {
			// 监听ip+port
			e.Listener, err = newListener(s.Addr)
			if err != nil {
				return err
			}
		}
		// 打印服务地址
		if !e.HidePort {
			e.colorer.Printf("⇨ http server started on %s\n", e.colorer.Green(e.Listener.Addr()))
		}
		return s.Serve(e.Listener)
	}
	// 启动https server
	if e.TLSListener == nil {
		l, err := newListener(s.Addr)
		if err != nil {
			return err
		}
		// 监听ip+port
		// 设置https配置
		e.TLSListener = tls.NewListener(l, s.TLSConfig)
	}
	if !e.HidePort {
		// 打印服务地址
		e.colorer.Printf("⇨ https server started on %s\n", e.colorer.Green(e.TLSListener.Addr()))
	}
	return s.Serve(e.TLSListener)
}
⬇️
s.Serve()
⬇️
// accept网络请求
rw, e := l.Accept()
⬇️
// goroutine处理请求
go c.serve(ctx)
⬇️
// 执行serverHandler的ServeHTTP
serverHandler{c.server}.ServeHTTP(w, w.req)
⬇️
// 执行当前框架实例的ServeHTTP方法
handler.ServeHTTP(rw, req)
⬇️
func (e *Echo) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// 获取上下文实例
	c := e.pool.Get().(*context)
	// 重置上下文
	c.Reset(r, w)

	// 默认handler
	h := NotFoundHandler

	// 不存在预执行中间件时
	// 说说这个预执行中间件的含义：
	// 看源码注释的含义是在寻找到路由之前执行的中间件
	// 简单来说和普通中间件的的区别就是，还没走到匹配路由的逻辑就会执行的中间件，从下面来看只是代码逻辑的区别，实际的中间件执行顺序还是谁先注册谁先执行。所以无论是存在普通中间件还是预执行中间件，路由的handle总是最后执行。
	// 个人感觉预执行中间件的意义不大
	if e.premiddleware == nil {
		// 先找当前host组的router
		// LCP算法寻找当前path的handler
		e.findRouter(r.Host).Find(r.Method, getPath(r), c)
		// 找到当前路由的handler
		h = c.Handler()
		// 构成中间件链
		h = applyMiddleware(h, e.middleware...)
	} else {
		// 看见这个预执行中间件的区别了吧
		// 把注册普通中间件的逻辑又包装成了一个HandlerFunc注册到中间件链中
		h = func(c Context) error {
			// 先找当前host组的router
			// LCP算法寻找当前path的handler
			e.findRouter(r.Host).Find(r.Method, getPath(r), c)
			h := c.Handler()
			h = applyMiddleware(h, e.middleware...)
			return h(c)
		}
		// 构成中间件链
		h = applyMiddleware(h, e.premiddleware...)
	}

	// 执行中间件链
	// 在applyMiddleware中所有中间件构成了一个链
	if err := h(c); err != nil {
		e.HTTPErrorHandler(err, c)
	}

	// 释放上下文
	e.pool.Put(c)
}

// 构成中间件链
// 在构建这个中间件链的细节方式上 和iris,gin还是不一样 
// 后续专写一篇文章详细对比各框架中间件的实现
func applyMiddleware(h HandlerFunc, middleware ...MiddlewareFunc) HandlerFunc {
	for i := len(middleware) - 1; i >= 0; i-- {
		// 注意这里返回的还是一个闭包
		// 所以说还没真正执行
		h = middleware[i](h)
	}
	return h
}

// ---------log---------
// 记录启动错误日志
e.Logger.Fatal()
```

## 结语

最后我们再简单的回顾下上面的流程。

<p align="center">
    <img src="http://cdn.tigerb.cn/20190711125947.png" style="width:50%">
</p>

---

《Go框架解析》系列文章链接如下：

- [Go框架解析:echo](http://tigerb.cn/2019/07/13/go-echo/)
- [Go框架解析:gin](http://tigerb.cn/2019/07/06/go-gin/)
- [Go框架解析:iris](http://tigerb.cn/2019/06/29/go-iris/)
- [Go框架解析:beego](http://tigerb.cn/2018/12/06/go-beego/)

