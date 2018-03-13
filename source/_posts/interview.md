---
title: 一些记录分享
date: 2018-05-22 08:31:00
tags: php
---

# 前言

其实两个月前都应该发这片文章了，那段时间面了几家我有兴趣的公司，大家一直想让我做个分享，但是总是事与愿违，去了新公司工作的流程和强度和以往的公司产生了很大的差别。今天先把之前整理的内容先发出来供大家参考，后期我再做一个相关内容的剖析。

# 一些面试过程问题分享

- 某粮食
    + 一面
        * js闭包
        * http status
        * 手写实现php框架路由
        * http协议cookie属性
        * https协议
        * shell多列数据找到某列最大值

```
function closure()
{

    var i = 0;
    function incre()
    {
        i++;
        alert(i);
    }
    return incre;
}

var res = closure();
res();
res();

if (strpos($_SERVER['REQUEST_URI'], '?')) {
    preg_match_all('/^\/(.*)\?/', $_SERVER['REQUEST_URI'], $uri);
} else {
    preg_match_all('/^\/(.*)/', $_SERVER['REQUEST_URI'], $uri);
}
if (isset($uri[1][0]) && (! empty($uri[1][0]))) {
    $uri = $uri[1][0];
}

键值对
host-only: js脚本无法读取cookie
expires: cookie过去时间
secure:　仅在https下才传输cookie 
domain: 只允许该域名读取cookie
path: 指定cookie发送的目录范围

awk '{print $3}' demo.log | sort -nr | head -n 10

```

- 某安全
    + 笔试
        * 常用array函数写5个并说明用处
        * keep-alive作用
        * 上亿数据找出某些符合规则的数据
        * 写个10进制转16进制
        * shell多列排序找值（awk/seed/sort/wc/uniq/head）
        * 画一个搜索架构
    + 一面
        * 怎么web server现在建立了多少连接
    + 二面
        * 有用过swoole吗
        * 双向列表知道吗

```
array_push
array_multisort
array_unshift
array_column
array_merge -> 数字键名不会覆盖，字符串键名后覆盖前；＋保留前
array_combine
in_array

tcp长连接,无一方主动断开链接则保持链接


client -syn-> server
client <-ack/syn- server
client -ack-> server

client -fin/ack-> server
client <-ack- server
client <-fin/ack- server
client -ack-> server

```

- 某家
    + 一面
        * php生命周期
        * php垃圾回收机制
        * isset/empty
        * 进程、线程的理解
        * http status

```
mint->rint->(语法分析、词法分析、抽象语法树ast)->rshutdown->mshutdown

同步周期回收:
数据、对象类的复合类型

isset -> null坑
empty -> 0 '0' 0.0 null [] $variable '' false坑

进程　计算机资源分配的基本单位
线程　资源调度

200 ok

301 永久重定向
302 临时
304 not modify

400 bad request
401 http auth
403 forbidden
404 not found

500 internet server error
501 not support method
502 bad gateway
503 service unavaliable
504 gateway timeout

```

- 某打车(平台技术)
    + 一面 
        * elk/怎么写日志
        * pcntl_fork多进程实现
        * 写一个zval结构
        * 画一个b+树
        * myisam/innodb区别
        * mysql最左匹配原则
        * explain各个列的含义
    + 二面
        * mysql最左匹配原则
        * 写了个sql　group by/having/unix_timestamp/from\_unixtime
        * 算法：写了个数的递归
    + 三面
        * 画了之前的项目架构
        * 问了qps
        * 你对于我们公司有什么优势
        * 算法：两个上亿长度的无序数组合并成一个有序数+ 

```
error_log => 串行

pcntl_fork => 大于0处于父进程上下文/0处于子进程上下文/小于0 fork失败 


4种标量类型：int、string、float、bool
2种复合类型：array、object
2种特殊类型: resource、null

struct z_val{
    type
    value
    is_ref_gc
    refcount_gc
} _zval_struct;

myISAM => 表锁、非聚簇索引、不支持事务、不支持安全恢复
InnoDB => 行锁、聚簇索引、事务

从左往右匹配不到索引或者范围查询(between/</>/like)为止
```

- 某打车(顺风车)
    + 一面
        * redis是单进程/单线程还是多
        * nginx是单进程/单线程还是多
        * http结构
        * http常见头字段
        * nginx和php交互
        * 怎么实现fastcgi
        * mysql的ACDI
        * mysql的最左匹配原则
        * 算法：实现斐波拉野数列
        * 你平常使用那些psr
        * 平常怎么获取知识+       
        * git怎么避免冲突
        * 进程间通信方式
        * epoll/poll/select差异
    + 二面
        * 你最得意的项目，怎么构建和实现的
        * 你平常使用那些psr
        * nginx多进程模型
        * 算法：1到n个数，去掉两个，求去掉的那两个（不排序、尽可能不使用额外的变量）
    + 三面
        * 算法：大数求和
        * hashtable
        * 同事对你的评价       
        * 直属leader对你的评价

- 某度外卖(门店研发组)
    + 一面
        * 画出之前系统的架构图 
            - 描述架构
            - 负责的部分
            - 挑一处详细说说
            - qps
            - 熔断、降级
        * redis，memcache区别，redis奔溃恢复实现原理
        * 写个单例模式
        * 常用linux命令
        * 写5个常用的array，string函数
        * mysql
            - acdi
            - 隔离级别
            - 幻读
                + mvcc
            - 死锁
                + 写个简单例子
                + 标出上面sql的执行顺序
            - redis常用的缓存场景
        * 算法
            - n个数唯一有两个数相加等于50，写个算法求出这两个数
    + 二面
        - 挑一个项目说一说
        - mysql
            + 日百万级订单表，查询用户订单和店铺订单，设计表结构　-> 分表
        - 写个命令，输出nginx 响应时间最长的前10个请求
        - 算法
            + 深度优先遍历
    + 三面
        - 挑一个项目说一说
        - 如何学习
        - 换工作原因
        - 记不清了...


- 某打车(ai lab)
    + 一面 php面
        * 说一个值得说的项目
        * mysql的ACDI
        * mysql默认事务隔离级别
        * 不可重复读和可重复读级别区别
        * 实现一个hashtable
        * 写一个快速排序
    + 二面　前端面
        * 盒模型
        * css垂直居中
        * css position
        * juery相关api
        * 数组去重
    + 三面　负责人面
        * http2的好处
        * 对rpc的理解
        * 算法　->　不同音轨匹配组合　->　图的遍历       
    + 四面　总监面
        * 一个影响深刻的项目 -> 你带来的价值
        * 说一个遇到的困难，然后怎么解决的
        * 为什么离职

- 某打车(平台技术－核心出行)
    + 一面
        * 自我介绍
        * 介绍一个项目
        * mvc的理解
        * 你所理解的client发起一个请求的过程
        * sql优化你怎么做
        * 算法->　abcd|efg 变成　efg|abcd
        * array_merge&数组相加区别
        * 系统中的502请求原因
    + 二面
        * 自我介绍
        * 介绍一个项目
        * 并行下的数据一直问题
        * 说说get/post的区别
        * 算法
            - 一个有序数里插入一个数
            - 1～９组成所有不重复的三位数
    + 三面
        * 一步一步聊了之前一个项目的架构
            - 怎么防止的重放攻击
            - 当时的网关qps
            - 说说微信或者支付宝支付方式大致的流程
        * 说说你对php的理解
        * 对fastcgi的理解
        * 一个系统上线后，你从那几个方面评估系统的好坏
        * 不同域名下，怎么能安全的共享cookie信息
        * 说说外观模式，与中介者模式＆适配器模式的区别
        * m个大数　求top n    

- 某自由行
    + 一面
        - 讲项目
    + 二面
        - 讲项目
        - 我自己框架路由的实现
        - mysql的基本优化
        - redis在项目中的使用
    + 三面(HR面)
        - 聊了聊每段公司的经历和换公司原因
- 某视频社交(api)
    + 笔试
        - 2018-03-01到2018-03-09有个活动抽奖，10％中奖概率
            * 判断在这个时间段内
            * 判断是android用户
            * 抽奖算法
        - nginx日志的各种过滤查找
            * top 10 ip请求
            * 查找当前日志文件的绝对路径
            * 查找进程id
            * 系统内存快速增长，快速定位问题
        - 一千万用户，10M内存，设计签到
        - 设计限流
    + 一面
        - 讲项目
        - 网络编程　-> select/epoll区别
        - 说说异步非阻塞
        - 讲下https
    + 二面
        - 讲项目
        - 问了高并发场景的qps和大致机器数量　分析每台机器的性能
        - 设计个限流
        - 换工作的原因(被带进了沟里面　尴尬)
    + 三面(HR面)  
        - 聊了聊每段公司的经历和换公司原因   
- 某安全(erp)
    + 一面
        - 项目经历
    + 二面
        - 项目经历
        - 对erp的了解
        - 安全相关
    + 三面
        - 项目经历
        - mysql事务
        - redis使用
        - 设计模式　什么时候使用适配器 
    + 四面(HR面)
        - 技术角度介绍一个项目
        - 说说php和go的区别
        - 公司技术团队构成
        - 换工作原因
- 某家(二手房交易组)
    + 一面
        - 实现日志输出
        - 算法
            * 翻转一个字符串
            * 输出一个深度最小的二叉树
        - nginx的用处
        - 
    + 二面
        - nginx的用处
        - mysql事务
    + 三面
        - 项目
        - 职业规划
        - 你在一个项目的三个好的，三个不足
    + 四面(HR面)  
        - 聊了聊换公司原因
- 某粮食(海外商城)
    + 一面
        - 项目
        - php的内存管理　栈内存　堆内存
        - 算法　字符按字典序插入
    + 二面
        - 我的框架设计
        - http cookie
        - mysql事务
    + 三面
        - 抽奖算法 某个时间段必须抽出奖品的实现
        - 聊我的php多进程的实现
        - 职业规划
    + 四面
        - 公司经历
        - mysql主从实现
    + 五面(HR面)  
        - 聊了聊换公司原因  


