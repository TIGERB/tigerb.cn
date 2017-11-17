---
title: 试探API Blueprint接口文档生成和接口模拟
date: 2017-03-07 23:16:13
tags: API
---

# 前言

今天发现了一个很niubility的东西__API Blueprint__,先给出官网<https://apiblueprint.org/>。下面是官网给出的介绍：

> API Blueprint. A powerful high-level API description language for web APIs.

这个可以干什么呢？按照API Blueprint的语法(类似markdown)，我们可以利用生态链工具：

1. 生成API接口文档
2. 模拟接口在你没写任何代码之前
3. 待研究...

对于__1__因为之前调研过Swagger等工具还是关注过一段时间写接口文档的事情，当时选取的方案就是Swagger,当时也觉的挺好用的，最后的接口文档也是可以真实返回数据的，但是问题呢就是写Swagger依赖的json文档是个问题，官方支持的语法是yaml(要是markdown多好啊)，直接手动维护所有接口的json文档很X疼的啊，最后发现一个sosoapi的东东可以生成Swagger依赖的json文档，但是没开源啊！！！所以使用要是选型API Blueprint语法作为接口文档书写标准，的确是个不错的选择。

> 贴一下Swagger的官网<http://swagger.io/>

其次，API Blueprint最让我觉得厉害的就是我曾经幻想的：先制定接口数据结构，然后通过这个数据结构先模拟接口响应，之后客户端的同学和后端的同学就可并行的开发，客户端的同学再也不用等到后端的同学开发完毕再对接接口了，后端同学开发完毕无缝切换到真实代码上即可。

# 试用

- 工具选用

看了生态链下眼花缭乱的工具，先选了个go开发的工具[snowboard](https://github.com/subosito/snowboard)

- 安装

```
// linux下安装，这里安装的是v0.5.0版
wget https://github.com/subosito/snowboard/releases/download/v0.5.0/snowboard-v0.5.0.linux-amd64.tar.gz
tar -zxvf snowboard-v0.5.0.linux-amd64.tar.gz
./snowboard -h

// mac下安装
$ brew tap subosito/packages
$ brew install snowboard
```

- 编写第一个接口文档

1. 新建一个.apib后缀的文件api.apib

> 推荐api-blueprint语法插件：language-api-blueprint [例如，Atom](https://github.com/danielgtaylor/atom-language-api-blueprint)

2. 编写接口文档

```
// 示例
# API
## GET /v1/message
+ Response 200 (application/json)
    {
        "status":"OK",
        "result":
        {
            "lists":[
                {"id":666},
                {"id":888}
                ],
            "count":10
        }
    }
```

3. 生成接口文档html页面

```
// 命令
./snowboard html -i api.apib -o api.html -s
```

访问 http://127.0.0.1:8088/
![http://odcgj0xrb.bkt.clouddn.com/api-html.png](http://odcgj0xrb.bkt.clouddn.com/api-html.png)

4. 启用接口模拟

```
// 命令
./snowboard mock -i api.apib

// 返回
Mock server is ready. Use 127.0.0.1:8087
Available Routes:
GET	200	/v1/message
```

访问 http://127.0.0.1:8087/v1/message
![http://odcgj0xrb.bkt.clouddn.com/api-json.png](http://odcgj0xrb.bkt.clouddn.com/api-json.png)

# 结语

是不是很不错的东西，提高生产效率的利器啊，哈哈～ 我今天才知道.......... 看它还有很多的工具，包含和Swagger结合使用的，后续慢慢研究，今天先过了个新鲜劲～

> [Easy PHP：一个极速轻量级的PHP全栈框架](http://easy-php.tigerb.cn)
