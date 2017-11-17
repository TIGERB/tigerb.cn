---
title: 从0开始构建一个属于你自己的PHP框架(上)
date: 2017-05-07 21:37:18
tags: php
---

# 如何构建一个自己的PHP框架

为什么我们要去构建一个自己的PHP框架？可能绝大多数的人都会说“市面上已经那么多的框架了，还造什么轮子？”。我的观点“造轮子不是目的，造轮子的过程中汲取到知识才是目的”。

那怎样才能构建一个自己的PHP框架呢？大致流程如下：

```
　　　　
入口文件　----> 注册自加载函数
        ----> 注册错误(和异常)处理函数
        ----> 加载配置文件
        ----> 请求
        ----> 路由　
        ---->（控制器 <----> 数据模型）
        ----> 响应
        ----> json
        ----> 视图渲染数据
```

除此之外我们还需要单元测试、nosql支持、接口文档支持、一些辅助脚本等。最终我的框架目录如下：

#  框架目录一览

```
app                             [PHP应用目录]
├── demo                        [模块目录]
│   ├── controllers             [控制器目录]
│   │      └── Index.php        [默认控制器文件，输出json数据]
│   ├── logics                  [逻辑层，主要写业务逻辑的地方]
│   │   ├── exceptions          [异常目录]
│   │   ├── gateway          　　[一个逻辑层实现的gateway演示]
│   │   ├── tools               [工具类目录]
│   │   └── UserDefinedCase.php [注册框架加载到路由前的处理用例]
│   └── models                  [数据模型目录]
│       └── TestTable.php       [演示模型文件，定义一一对应的数据模型]
├── config                      [配置目录]
│    ├── demo                   [模块配置目录]
│    │   ├── config.php         [模块自定义配置]
│    │   └── route.php          [模块自定义路由]
│    ├── common.php             [公共配置]
│    ├── database.php           [数据库配置]
│    └── nosql.php              [nosql配置]
docs                            [接口文档目录]
├── apib                        [Api Blueprint]
│    └── demo.apib              [接口文档示例文件]
├── swagger                     [swagger]
framework                       [Easy PHP核心框架目录]
├── exceptions                  [异常目录]
│      ├── CoreHttpException.php[核心http异常]
├── handles                     [框架运行时挂载处理机制类目录]
│      ├── Handle.php           [处理机制接口]
│      ├── ErrorHandle.php      [错误处理机制类]
│      ├── ExceptionHandle.php  [未捕获异常处理机制类]
│      ├── ConfigHandle.php     [配置文件处理机制类]
│      ├── NosqlHandle.php      [nosql处理机制类]
│      ├── LogHandle.php        [log机制类]
│      ├── UserDefinedHandle.php[用户自定义处理机制类]
│      └── RouterHandle.php     [路由处理机制类]
├── orm                         [对象关系模型]
│      ├── Interpreter.php      [sql解析器]
│      ├── DB.php               [数据库操作类]
│      ├── Model.php            [数据模型基类]
│      └── db                   [数据库类目录]
│          └── Mysql.php        [mysql实体类]
├── nosql                       [nosql类目录]
│    ├── Memcahed.php           [Memcahed类文件]
│    ├── MongoDB.php            [MongoDB类文件]
│    └── Redis.php              [Redis类文件]
├── App.php                     [框架类]
├── Container.php               [服务容器]
├── Helper.php                  [框架助手类]
├── Load.php                    [自加载类]
├── Request.php                 [请求类]
├── Response.php                [响应类]
├── run.php                     [框架应用启用脚本]
frontend                        [前端源码和资源目录]
├── src                         [资源目录]
│    ├── components             [vue组件目录]
│    ├── views                  [vue视图目录]
│    ├── images                 [图片]
│    ├── ...
├── app.js                      [根js]
├── app.vue                     [根组件]
├── index.template.html         [前端入口文件模板]
├── store.js                    [vuex store文件]
public                          [公共资源目录，暴露到万维网]
├── dist                        [前端build之后的资源目录，build生成的目录，不是发布分支忽略该目录]
│    └── ...
├── index.html                  [前端入口文件,build生成的文件，不是发布分支忽略该文件]
├── index.php                   [后端入口文件]
runtime                         [临时目录]
├── logs                        [日志目录]
├── build                       [php打包生成phar文件目录]
tests                           [单元测试目录]
├── demo                        [模块名称]
│      └── DemoTest.php         [测试演示]
├── TestCase.php                [测试用例]
vendor                          [composer目录]
.git-hooks                      [git钩子目录]
├── pre-commit                  [git pre-commit预commit钩子示例文件]
├── commit-msg                  [git commit-msg示例文件]
.babelrc                        [babel配置文件]
.env                            [环境变量文件]
.gitignore                      [git忽略文件配置]
build                           [php打包脚本]
cli                             [框架cli模式运行脚本]
LICENSE                         [lincese文件]
logo.png                        [框架logo图片]
composer.json                   [composer配置文件]
composer.lock                   [composer lock文件]
package.json                    [前端依赖配置文件]
phpunit.xml                     [phpunit配置文件]
README-CN.md                    [中文版readme文件]
README.md                       [readme文件]
webpack.config.js               [webpack配置文件]
yarn.lock                       [yarn　lock文件]

```

# 框架模块说明：

##  入口文件

定义一个统一的入口文件，对外提供统一的访问文件。对外隐藏了内部的复杂性，类似企业服务总线的思想。

```
// 载入框架运行文件
require('../framework/run.php');
```

[[file: public/index.php](https://github.com/TIGERB/easy-php/blob/master/public/index.php)]

##  自加载模块

使用spl_autoload_register函数注册自加载函数到__autoload队列中，配合使用命名空间，当使用一个类的时候可以自动载入(require)类文件。注册完成自加载逻辑后，我们就可以使用use和配合命名空间申明对某个类文件的依赖。

[[file: framework/Load.php](https://github.com/TIGERB/easy-php/blob/master/framework/Load.php)]

##  错误和异常模块

脚本运行期间：

- 错误:

通过函数set_error_handler注册用户自定义错误处理方法，但是set_error_handler不能处理以下级别错误，E_ERROR、 E_PARSE、 E_CORE_ERROR、 E_CORE_WARNING、 E_COMPILE_ERROR、 E_COMPILE_WARNING，和在 调用 set_error_handler() 函数所在文件中产生的大多数 E_STRICT。所以我们需要使用register_shutdown_function配合error_get_last获取脚本终止执行的最后错误，目的是对于不同错误级别和致命错误进行自定义处理，例如返回友好的提示的错误信息。

[[file: framework/hanles/ErrorHandle.php](https://github.com/TIGERB/easy-php/blob/master/framework/handles/ErrorHandle.php)]

- 异常:

通过函数set_exception_handler注册未捕获异常处理方法，目的捕获未捕获的异常，例如返回友好的提示和异常信息。

[[file: framework/hanles/ExceptionHandle.php](https://github.com/TIGERB/easy-php/blob/master/framework/handles/ExceptionHandle.php)]

##  配置文件模块

加载框架自定义和用户自定义的配置文件。

[[file: framework/hanles/ConfigHandle.php](https://github.com/TIGERB/easy-php/blob/master/framework/handles/ConfigHandle.php)]

##  输入和输出

- 定义请求对象：包含所有的请求信息
- 定义响应对象：申明响应相关信息

框架中所有的异常输出和控制器输出都是json格式，因为我认为在前后端完全分离的今天，这是很友善的，目前我们不需要再去考虑别的东西。

[[file: framework/Request.php](https://github.com/TIGERB/easy-php/blob/master/framework/Request.php)]

[[file: framework/Response.php](https://github.com/TIGERB/easy-php/blob/master/framework/Response.php)]

##  路由模块

通过用户访问的url信息，通过路由规则执行目标控制器类的的成员方法。我在这里把路由大致分成了四类：

**传统路由**

```
domain/index.php?module=Demo&contoller=Index&action=test&username=test
```

**pathinfo路由**

```
domain/demo/index/modelExample
```

**用户自定义路由**

```
// 定义在config/moduleName/route.php文件中，这个的this指向RouterHandle实例
$this->get('v1/user/info', function (Framework\App $app) {
    return 'Hello Get Router';
});
```

**微单体路由**

我在这里详细说下这里所谓的微单体路由，面向SOA和微服务架构大行其道的今天，有很多的团队都在向服务化迈进，但是服务化过程中很多问题的复杂度都是指数级的增长，例如分布式的事务，服务部署，跨服务问题追踪等等。这导致对于小的团队从单体架构走向服务架构难免困难重重，所以有人提出来了微单体架构，按照我的理解就是在一个单体架构的SOA过程，我们把微服务中的的各个服务还是以模块的方式放在同一个单体中，比如：

```
app
├── UserService     [用户服务模块]
├── ContentService  [内容服务模块]
├── OrderService    [订单服务模块]
├── CartService     [购物车服务模块]
├── PayService      [支付服务模块]
├── GoodsService    [商品服务模块]
└── CustomService   [客服服务模块]
```

如上，我们简单的在一个单体里构建了各个服务模块，但是这些模块怎么通信呢？如下：

```
App::$app->get('demo/index/hello', [
    'user' => 'TIGERB'
]);
```

通过上面的方式我们就可以松耦合的方式进行单体下各个模块的通信和依赖了。与此同时，业务的发展是难以预估的，未来当我们向SOA的架构迁移时，很简单，我们只需要把以往的模块独立成各个项目，然后把App实例get方法的实现转变为RPC或者REST的策略即可，我们可以通过配置文件去调整对应的策略或者把自己的，第三方的实现注册进去即可。

[[file: framework/hanles/RouterHandle.php](https://github.com/TIGERB/easy-php/blob/master/framework/handles/RouterHandle.php)]
