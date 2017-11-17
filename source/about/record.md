# 面试记录

### 2017-01

- 小米
    + 一面
        * js闭包
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

less demo.log | awk '{print &3}' | sort -nr | head -n 10

```

- 360
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

client -fin-> server
client <-ack- server
client <-fin- server
client -ack-> server

```

### 2017-03

- 链家
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
empty -> 0 '0'坑

进程　计算机资源分配的基本单位
线程　资源调度

200 ok

301 永久重定向
302 临时
304 not modify

400 bad request
401 
403 forbidden
404 not found

500 internet server error
501 not support method
502 bad gateway
503 service unavaliable
504 gateway timeout

```

### 2017-07

- 滴滴(平台技术)
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
4种标量类型：int、string、fload、bool
2种复合类型：array、object
2种特殊类型: resource、null

struct z_val{
    type
    value
    is_ref
    refcount
} _zval_struct;
```

### 2017-12

- 滴滴+顺风车)
    + 一面
        * redis是单进程/单线程还是多
        * nginx是单进程/单线程还是多
        * nginx和php交互
        * 怎么实现fastcgi
        * mysql的ACDI
        * mysql的最左匹配原则
        * 算法：实现斐波拉野数列
        * 你平常使用那些psr
        * 平常怎么获取知识+       
        * git怎么避免冲突
        * 进程间通信方式
        * epoll/pool/select差异
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
    
