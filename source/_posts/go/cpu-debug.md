---
title: 线上服务负载异常排查
tags: linux
cover_index: >-
  http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220122224224.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
cover_detail: >-
  http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220122224224.jpg?imageMogr2/thumbnail/1500x1000!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go
date: 2022-01-22 10:20:05
---

# 前言

除了解决业务Bug之外，工作中通常我们还会面临两类问题：

- 线上服务负载异常，比如CPU负载异常飙高
- 线上服务内存持续增长，存在泄漏

一般我们会通过各种监控、报警系统，发现和定位问题，关于如何搭建服务监控可以参考之前的文章《Go服务监控搭建入门》。但是呢，一些特殊情况，比如创业初期或者拥有大量技术债的系统，监控可能不够完善。所以今天就来看看这种情况下，如何定位服务负载异常的原因。

首先关于「负载异常」的问题，大都肯定都知道使用`top`或者`htop`等命令定位到某个进程或线程，好，问题来了：

> 如何定位到是哪个具体的函数导致的服务负载异常呢？


# 介绍一个利器`perf`

本文使用docker来演示`perf`的用法，可以直接使用我编排好的docker compose工程(一个模拟http服务调用grpc服务的演示项目)<https://github.com/TIGERB/easy-tips/blob/master/docker/go/docker-compose.yaml>

启动服务

```
// -d daemon守护模式
docker-compose up -d
```

进入容器

```
docker exec -it http-demo sh
```

安装`perf`

```
// 因为我这里使用的alpine，所以用apk安装，centos安装方式 yum install perf
apk add --update perf
```

模拟请求

```
siege -c 3 -t 30S "http://localhost:6060/v1/demo"
```

采样进程(当前目录会生成一个perf.data文件)

```
perf record -F 99 -p 6 -g sleep 10
释义：
-F 频率 每秒采样多少次
-p 进程 进程id
-g 记录调用栈
sleep 采样多少秒
```

分析CPU采样结果

```
perf report -n --stdio
```

<p>
    <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220121152729.png" width="100%">
</p>

除此之外，查看实时top函数

```
perf top -p 6
```

<p>
    <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220121152934.png" width="100%">
</p>

## 生成火焰图

如果上述的堆栈信息等还满足不了你，我们还可以基于采样过程生成的`perf.data`文件生成**火焰图**:

1. 使用`perf script`命令转换上一步得到的`perf.data`文件，为下面使用火焰图工具生成火焰图做准备：

```
perf script -i yourpath/perf.data &> yourpath/perf.script
```

2. 获取火焰图工具：

```
git clone git@github.com:brendangregg/FlameGraph.git && cd ./FlameGraph
```

3. 使用火焰图工具FlameGraph下的工具`stackcollapse-perf.pl`进一步处理`perf.script`文件：

```
./stackcollapse-perf.pl yourpath/perf.script &> yourpath/perf.stackcollapse
```

4. 生成最终的火焰图：

```
./flamegraph.pl yourpath/perf.stackcollapse > yourpath/perf.svg
```

<p>
    <img src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/20220122220117.png" width="100%">
</p>
