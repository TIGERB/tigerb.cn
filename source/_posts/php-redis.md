---
title: redis五种常见使用场景下PHP实现
date: 2017-02-20 23:33:30
tags: redis
---

## 前言

redis等nosql简单高效的解决了高并发场景下的一系列问题，并很大程度的解放了持久化DB的业务压力。

## 实现

- [基于redis字符串string类型的简单缓存实现](https://github.com/TIGERB/easy-tips/blob/master/redis/cache.php)
- [基于redis列表list类型的简单队列实现](https://github.com/TIGERB/easy-tips/blob/master/redis/queue.php)
- [基于redis字符串setnx的悲观锁实现](https://github.com/TIGERB/easy-tips/blob/master/redis/pessmistic-lock.php)
- [基于redis事务的乐观锁实现](https://github.com/TIGERB/easy-tips/blob/master/redis/optimistic-lock.php)
- [基于redis的发布订阅实现](https://github.com/TIGERB/easy-tips/blob/master/redis/subscribe-publish)


## 测试用例
5种使用场景都提供测试用例，使用方法：

- 克隆项目： git clone git@github.com:TIGERB/easy-tips.git
- 运行脚本： php redis/test.php [实例名称]，
例如测试悲观锁： 运行 php redis/test.php p-lock
```
运行结果：

执行count加1操作～

count值为：1
```

```
运行 php redis/test.php 获取参数列表

参数列表：

参数有误，正确示例：php redis/test.php p-lock
======================================
参数列表：
Array
(
    [缓存] => cache
    [队列] => queue
    [悲观锁] => p-lock
    [乐观锁] => o-lock
    [消息订阅/推送] => Array
        (
            [订阅] => sub
            [推送] => pub
        )

)

```

## 源码

源码地址 <https://github.com/TIGERB/easy-tips>

这是我的一个关于《一个php技术栈后端猿的知识储备大纲》的知识总结，目前只完成了“设计模式”。

## 纠错

如果大家发现有什么不对的地方，可以发起一个[issue](https://github.com/TIGERB/easy-tips/issues)或者[pull request](https://github.com/TIGERB/easy-tips),我会及时纠正，THX～

补充:发起pull request的commit message请参考文章[Commit message编写指南](http://www.ruanyifeng.com/blog/2016/01/commit_message_change_log.html)

> [Easy PHP：一个极速轻量级的PHP全栈框架](http://easy-php.tigerb.cn)
