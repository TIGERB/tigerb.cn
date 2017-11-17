---
title: 从0开始构建一个属于你自己的PHP框架(下)
date: 2017-05-07 21:37:42
tags: php
---

##  传统的MVC模式提倡为MCL模式

传统的MVC模式包含model-view-controller层，绝大多时候我们会把业务逻辑写到controller层或model层，但是慢慢的我们会发现代码难以阅读、维护、扩展，所以我在这里强制增加了一个logics层。至于，逻辑层里怎么写代码怎么，完全由你自己定义，你可以在里面实现一个工具类，你也可以在里面再新建子文件夹并在里面构建你的业务逻辑代码，你甚至可以实现一个基于责任连模式的网关(我会提供具体的示例)。这样看来，我们的最终结构是这样的:

- M: models, 职责只涉及数据模型相关操作
- C: controllers, 职责对外暴露资源，前后端分离架构下controllers其实就相当于json格式的视图
- L: logics, 职责灵活实现所有业务逻辑的地方

**logics逻辑层**

逻辑层实现网关示例：

我们在logics层目录下增加了一个gateway目录，然后我们就可以灵活的在这个目录下编写逻辑了。gateway的结构如下：

```
gateway                     [Logics层目录下gateway逻辑目录]
  ├── Check.php             [接口]
  ├── CheckAppkey.php       [检验app key]
  ├── CheckArguments.php    [校验必传参数]
  ├── CheckAuthority.php    [校验访问权限]
  ├── CheckFrequent.php     [校验访问频率]
  ├── CheckRouter.php       [网关路由]
  ├── CheckSign.php         [校验签名]
  └── Entrance.php          [网关入口文件]
```

网关入口类主要负责网关的初始化，代码如下：

```
// 初始化一个：必传参数校验的check
$checkArguments   =  new CheckArguments();
// 初始化一个：app key check
$checkAppkey      =  new CheckAppkey();
// 初始化一个：访问频次校验的check
$checkFrequent    =  new CheckFrequent();
// 初始化一个：签名校验的check
$checkSign        =  new CheckSign();
// 初始化一个：访问权限校验的check
$checkAuthority   =  new CheckAuthority();
// 初始化一个：网关路由规则
$checkRouter      =  new CheckRouter();

// 构成对象链
$checkArguments->setNext($checkAppkey)
               ->setNext($checkFrequent)
               ->setNext($checkSign)
               ->setNext($checkAuthority)
               ->setNext($checkRouter);

// 启动网关
$checkArguments->start(
    APP::$container->getSingle('request')
);
```

实现完成这个gateway之后，我们如何在框架中去使用呢？在logic层目录中我提供了一个user-defined的实体类，我们把gateway的入口类注册到UserDefinedCase这个类中，示例如下：

```
/**
 * 注册用户自定义执行的类
 *
 * @var array
 */
private $map = [
    //　演示 加载自定义网关
    'App\Demo\Logics\Gateway\Entrance'
];
```
这样这个gateway就可以工作了。接着说说这个UserDefinedCase类，UserDefinedCase会在框架加载到路由机制之前被执行，这样我们就可以灵活的实现一些自定义的处理了。这个gateway只是个演示，你完全可以天马行空的组织你的逻辑～

视图View去哪了？由于选择了完全的前后端分离和SPA(单页应用), 所以传统的视图层也因此去掉了，详细的介绍看下面。

[[file: app/*](https://github.com/TIGERB/easy-php/tree/master/app/demo)]

##  使用Vue作为视图

**源码目录**

完全的前后端分离，数据双向绑定，模块化等等的大势所趋。这里我把我自己开源的vue前端项目结构[easy-vue](http://vue.tigerb.cn/)移植到了这个项目里，作为视图层。我们把前端的源码文件都放在frontend目录里，详细如下，你也可以自己定义：

```
frontend                        [前端源码和资源目录，这里存放我们整个前端的源码文件]
├── src                         [资源目录]
│    ├── components             [编写我们的前端组件]
│    ├── views                  [组装我们的视图]
│    ├── images                 [图片]
│    ├── ...
├── app.js                      [根js]
├── app.vue                     [根组件]
├── index.template.html         [前端入口文件模板]
└── store.js                    [状态管理，这里只是个演示，你可以很灵活的编写文件和目录]
```

**build步骤**

```
yarn install

DOMAIN=http://你的域名 npm run dev
```

**编译后**

build成功之后会生成dist目录和入口文件index.html在public目录中。非发布分支.gitignore文件会忽略这些文件，发布分支去除忽略即可。

```
public                          [公共资源目录，暴露到万维网]
├── dist                        [前端build之后的资源目录，build生成的目录，不是发布分支忽略该目录]
│    └── ...
├── index.html                  [前端入口文件,build生成的文件，不是发布分支忽略该文件]
```

[[file: frontend/*](https://github.com/TIGERB/easy-php/tree/master/frontend)]

##  数据库对象关系映射

数据库对象关系映射ORM(Object Relation Map)是什么？按照我目前的理解：顾名思义是建立对象和抽象事物的关联关系，在数据库建模中model实体类其实就是具体的表，对表的操作其实就是对model实例的操作。可能绝大多数的人都要问“为什么要这样做，直接sql语句操作不好吗？搞得这么麻烦！”，我的答案：直接sql语句当然可以，一切都是灵活的，但是从一个项目的**可复用，可维护, 可扩展**出发，采用ORM思想处理数据操作是理所当然的，想想如果若干一段时间你看见代码里大段的难以阅读且无从复用的sql语句，你是什么样的心情。

市面上对于ORM的具体实现有thinkphp系列框架的Active Record,yii系列框架的Active Record,laravel系列框架的Eloquent(据说是最优雅的)，那我们这里言简意赅就叫ORM了。接着为ORM建模，首先是ORM客户端实体DB：通过配置文件初始化不同的db策略，并封装了操作数据库的所有行为，最终我们通过DB实体就可以直接操作数据库了，这里的db策略目前我只实现了mysql(负责建立连接和db的底层操作)。接着我们把DB实体的sql解析功能独立成一个可复用的sql解析器的trait，具体作用：把对象的链式操作解析成具体的sql语句。最后，建立我们的模型基类model,model直接继承DB即可。最后的结构如下：

```
├── orm                         [对象关系模型]
│      ├── Interpreter.php      [sql解析器]
│      ├── DB.php               [数据库操作类]
│      ├── Model.php            [数据模型基类]
│      └── db                   [数据库类目录]
│          └── Mysql.php        [mysql实体类]
```

**DB类使用示例**

```
/**
 * DB操作示例
 *
 * findAll
 *
 * @return void
 */
public function dbFindAllDemo()
{
    $where = [
        'id'   => ['>=', 2],
    ];
    $instance = DB::table('user');
    $res      = $instance->where($where)
                         ->orderBy('id asc')
                         ->limit(5)
                         ->findAll(['id','create_at']);
    $sql      = $instance->sql;

    return $res;
}
```

**Model类使用示例**

```
// controller 代码
/**
 * model example
 *
 * @return mixed
 */
public function modelExample()
{
    try {

        DB::beginTransaction();
        $testTableModel = new TestTable();

        // find one data
        $testTableModel->modelFindOneDemo();
        // find all data
        $testTableModel->modelFindAllDemo();
        // save data
        $testTableModel->modelSaveDemo();
        // delete data
        $testTableModel->modelDeleteDemo();
        // update data
        $testTableModel->modelUpdateDemo([
               'nickname' => 'easy-php'
            ]);
        // count data
        $testTableModel->modelCountDemo();

        DB::commit();
        return 'success';

    } catch (Exception $e) {
        DB::rollBack();
        return 'fail';
    }
}

//TestTable model
/**
 * Model操作示例
 *
 * findAll
 *
 * @return void
 */
public function modelFindAllDemo()
{
    $where = [
        'id'   => ['>=', 2],
    ];
    $res = $this->where($where)
                ->orderBy('id asc')
                ->limit(5)
                ->findAll(['id','create_at']);
    $sql = $this->sql;

    return $res;
}
```

[[file: framework/orm/*](https://github.com/TIGERB/easy-php/tree/master/framework/orm)]

##  服务容器模块

什么是服务容器？

服务容器听起来很浮，按我的理解简单来说就是提供一个第三方的实体，我们把业务逻辑需要使用的类或实例注入到这个第三方实体类中，当需要获取类的实例时我们直接通过这个第三方实体类获取。

服务容器的意义？

用设计模式来讲：其实不管设计模式还是实际编程的经验中，我们都是强调“高内聚，松耦合”，我们做到高内聚的结果就是每个实体的作用都是极度专一，所以就产生了各个作用不同的实体类。在组织一个逻辑功能时，这些细化的实体之间就会不同程度的产生依赖关系，对于这些依赖我们通常的做法如下：

```
class Demo
{
    public function __construct()
    {
        // 类demo直接依赖RelyClassName
        $instance = new RelyClassName();
    }
}
```

这样的写法没有什么逻辑上的问题，但是不符合设计模式的“最少知道原则”，因为之间产生了直接依赖，整个代码结构不够灵活是紧耦合的。所以我们就提供了一个第三方的实体，把直接依赖转变为依赖于第三方，我们获取依赖的实例直接通过第三方去完成以达到松耦合的目的，这里这个第三方充当的角色就类似系统架构中的“中间件”，都是协调依赖关系和去耦合的角色。最后，这里的第三方就是所谓的服务容器。

在实现了一个服务容器之后，我把Request,Config等实例都以单例的方式注入到了服务容器中，当我们需要使用的时候从容器中获取即可，十分方便。使用如下：

```
// 注入单例
App::$container->setSingle('别名，方便获取', '对象/闭包/类名');

// 例，注入Request实例
App::$container->setSingle('request', function () {
    // 匿名函数懒加载
    return new Request();
});
// 获取Request对象
App::$container->getSingle('request');
```

[[file: framework/Container](https://github.com/TIGERB/easy-php/blob/master/framework/Container.php)]

##  Nosql模块

提供对nosql的支持，提供全局单例对象，借助我们的服务容器我们在框架启动的时候，通过配置文件的配置把需要的nosql实例注入到服务容器中。目前我们支持redis/memcahed/mongodb。

如何使用？如下，

```
// 获取redis对象
App::$container->getSingle('redis');
// 获取memcahed对象
App::$container->getSingle('memcahed');
// 获取mongodb对象
App::$container->getSingle('mongodb');
```

[[file: framework/nosql/*](https://github.com/TIGERB/easy-php/tree/master/framework/nosql)]

##  接口文档生成和接口模拟模块

通常我们写完一个接口后，接口文档是一个问题，我们这里使用Api Blueprint协议完成对接口文档的书写和mock(可用)，同时我们配合使用Swagger通过接口文档实现对接口的实时访问(目前未实现)。

Api Blueprint接口描述协议选取的工具是snowboard,具体使用说明如下：

**接口文档生成说明**

```
cd docs/apib

./snowboard html -i demo.apib -o demo.html -s

open the website, http://localhost:8088/
```

**接口mock使用说明**

```
cd docs/apib

./snowboard mock -i demo.apib

open the website, http://localhost:8087/demo/index/hello
```

[[file: docs/*](https://github.com/TIGERB/easy-php/tree/master/docs)]

##  单元测试模块

基于phpunit的单元测试，写单元测试是个好的习惯。

如何使用？

tests目录下编写测试文件，具体参考tests/demo目录下的DemoTest文件,然后运行：

```
 vendor/bin/phpunit
```

测试断言示例：

```
/**
 *　演示测试
 */
public function testDemo()
{
    $this->assertEquals(
        'Hello Easy PHP',
        // 执行demo模块index控制器hello操作，断言结果是不是等于'Hello Easy PHP'　
        App::$app->get('demo/index/hello')
    );
}
```

[phpunit断言文档语法参考](https://phpunit.de/manual/current/zh_cn/appendixes.assertions.html)

[[file: tests/*](https://github.com/TIGERB/easy-php/tree/master/tests)]

##  Git钩子配置

目的规范化我们的项目代码和commit记录。

- 代码规范：配合使用php_codesniffer，在代码提交前对代码的编码格式进行强制验证。
- commit-msg规范：采用ruanyifeng的commit msg规范，对commit msg进行格式验证，增强git log可读性和便于后期查错和统计log等, 这里使用了[Treri](https://github.com/Treri)的commit-msg脚本，Thx~。

[[file: ./git-hooks/*](https://github.com/TIGERB/easy-php/tree/master/.git-hooks)]

## 辅助脚本

**cli脚本**

以命令行的方式运行框架，具体见使用说明。

**build脚本**

打包PHP项目脚本，打包整个项目到runtime/build目录，例如：

```
runtime/build/App.20170505085503.phar

<?php
// 入口文件引入包文件即可
require('runtime/build/App.20170505085503.phar');
```

[[file: ./build](https://github.com/TIGERB/easy-php/tree/master/build)]

# 如何使用?

执行：

- composer install
- chmod -R 777 runtime

**网站服务模式:**

```
步骤 1: yarn install
步骤 2: DOMAIN=http://localhost:666 npm run demo
步骤 3: cd public
步骤 4: php -S localhost:666

访问网站：http://localhost:666/index.html
访问接口：http://localhost:666/Demo/Index/hello

```

**客户端脚本模式:**

```
php cli --method=<module.controller.action> --<arguments>=<value> ...

例如, php cli --method=demo.index.get --username=easy-php
```

获取帮助:

使用命令 php cli 或者 php cli --help
