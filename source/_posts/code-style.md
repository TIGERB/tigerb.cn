---
title: 这两年多我写PHP业务代码的方式是如何进化的
date: 2017-10-30 22:14:28
tags: php
---

# 曾今

谁都有过迷茫期，下面是我开始PHP开发中，不断改变的代码组织方式。

- 初期：所有代码一股脑控制器controller
  + 曾今只是简单的理解MVC
- 中期：业务代码抽象一部分到模型层model
  + 开始觉得model层是否该做点什么了
- 后期：业务代码控制器，模型层只写db的curd方法
  + 复杂的业务代码使controller过于的庞大和难以维护

# 当下

汲取以前的码码体验，我目前的码码方式做了如下改变：

#### 更合理的分层

- 控制器暴露资源 
- 业务代码到逻辑层
- 模型层只写db的curd方法

度的把握，凡事都是灵活的，也不都是这样，认为足够简单的逻辑还是“业务代码控制器，模型层只写db的curd方法”。

#### 依赖注入，懒加载，前置中间件

- 依赖注入容器很重要，配上懒加载，减少代码，解耦依赖，提升性能
  + 关于容器可以参考我之前简单的实现<http://easy-php.tigerb.cn/#/?id=service-container>
- 前置中间件注入我们依赖的类
  + 我实现的简单的前置中间件,示例挂载了一个gateway到控制器之前<http://easy-php.tigerb.cn/#/?id=mvc-to-mcl>

#### 组件化代码

首先我们需要利用composer来拆分和组件化我们的代码，业务中简单的**composer require**即可复用我们的业务代码。但是有一个问题如果使用 [https://packagist.org](https://packagist.org) 需要把代码开源出去，和业务无关的工具类还好说，而且开源还是个好事情，但是和业务相关比较敏感的组件就有问题了，所以我们需要搭建一个私有的**packagist**， 私有packagist示例：<http://packagist.tigerb.cn/>，具体搭建步骤见文末。

# 总结

目前让我接手一个项目我会从如下几个方面去组织我的php代码：

- composer组件化代码，依赖开源或私有packagist
- 前置中间件懒加载的方式依赖注入composer require的组件
- 控制器暴露资源
    + 优雅的参数校验工具类
    + 使用try...catch...finally...
    + 响应尽可能的符合restful思想，比如error code:400,404,500...
- 业务代码到逻辑层(也不一定)
    + 复杂的业务代码先建模再写，建模可以组织好我们的代码并且可以运用一些设计模式，关于建模可以参考的我的文章[PHPer月工作总结之观察者＆装饰器模式](http://tigerb.cn/2017/08/21/summary-august/)
- 模型层只写db的curd方法
    + 不可撼动的原则

# 结语

不足还有很多，在这里只是把自己的想法分享出来，好的大家可以借鉴，不好的希望大家多多指正。

THX~

# 附录

[Satis](https://github.com/composer/satis)搭建私有的packagist过程，安装步骤如下:

step 1:

> composer create-project composer/satis:dev-master --keep-vcs && cd satis


step 2:

> touch satis.json

satis.json文件的内容如下
```
{
  "name": "packaglist-tigerb",
  "homepage": "http://packaglist.tigerb.cn",
  "repositories": [
    { "type": "vcs", "url": "http://github.com/tigerb/easy-mipush" },
    { "type": "vcs", "url": "http://github.com/easy-framework/easy-router"}
  ],
  "require-all": true
}
```

step 3:

> php bin/satis build ./satis.json <你的web servser项目目录，比如我的路径/mnt/www>

step 4:

> 配置nginx server 配置，重启nginx即可

##### 如何使用？

简单的配置composer.json即可，增加新的repositories地址，具体示例配置如下：
```
{
    "name": "tigerb/test",
    "authors": [
        {
            "name": "TIGERB",
            "email": "tigerbcode@gmail.com"
        }
    ],
    "repositories":[
        {"type":"composer", "url": "http://packagist.tigerb.cn"}
    ],
    "config": {
        "secure-http": false
    },
    "require": {
        "tigerb/easy-mipush": "^0.1.0"
    }
}
```

