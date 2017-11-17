---
title: PHP框架性能不权威对比
date: 2017-06-18 22:33:07
tags: easy-php
---

# 测试环境

```
OS        : Deepin 15.4 unstable
Kernel    : x86_64 Linux 4.9.0-deepin4-amd64
Uptime    : 3d 22h 42m
Packages  : 2050
Shell     : zsh 5.2
Resolution: 1920x1080
WM        : Mutter(DeepinGala)
WM Theme  : Adwaita
GTK Theme : deepin-dark [GTK2/3]
Icon Theme: flattr
CPU       : Intel Core i5-6200U CPU @ 2.8GHz
GPU       : Mesa DRI Intel(R) HD Graphics 520 (Skylake GT2)
RAM       : 2445MiB / 3854MiB
```

# 测试前预热

> ab -c 100 -n 100000 "http://easy-php.local/Demo/Index/hello"

# 测试

预热结束之后，各个框架分别输出"hello world".

本地ab压测：

> ab -c 100 -n 1000 domain

### Thinkphp 3.2

```
Benchmarking tp3.local (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        nginx/1.10.2
Server Hostname:        tp3.local
Server Port:            80

Document Path:          /
Document Length:        11 bytes

Concurrency Level:      100
Time taken for tests:   4.495 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      3430000 bytes
HTML transferred:       110000 bytes
Requests per second:    2224.73 [#/sec] (mean)
Time per request:       44.949 [ms] (mean)
Time per request:       0.449 [ms] (mean, across all concurrent requests)
Transfer rate:          745.20 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       3
Processing:     4   45  11.0     41      88
Waiting:        4   45  11.0     41      88
Total:          7   45  11.0     41      88

Percentage of the requests served within a certain time (ms)
  50%     41
  66%     42
  75%     44
  80%     45
  90%     68
  95%     73
  98%     77
  99%     79
 100%     88 (longest request)
```

### Thinkphp 5

```
Benchmarking tp5.local (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        nginx/1.10.2
Server Hostname:        tp5.local
Server Port:            80

Document Path:          /
Document Length:        13 bytes

Concurrency Level:      100
Time taken for tests:   5.570 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1570000 bytes
HTML transferred:       130000 bytes
Requests per second:    1795.28 [#/sec] (mean)
Time per request:       55.702 [ms] (mean)
Time per request:       0.557 [ms] (mean, across all concurrent requests)
Transfer rate:          275.25 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       6
Processing:    12   55   9.5     52      96
Waiting:       12   55   9.5     52      96
Total:         18   55   9.4     52      96

Percentage of the requests served within a certain time (ms)
  50%     52
  66%     54
  75%     56
  80%     57
  90%     71
  95%     80
  98%     84
  99%     87
 100%     96 (longest request)
```

### Yii2

```
Benchmarking yii2.local (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        nginx/1.10.2
Server Hostname:        yii2.local
Server Port:            80

Document Path:          /
Document Length:        11 bytes

Concurrency Level:      100
Time taken for tests:   15.307 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1480000 bytes
HTML transferred:       110000 bytes
Requests per second:    653.31 [#/sec] (mean)
Time per request:       153.067 [ms] (mean)
Time per request:       1.531 [ms] (mean, across all concurrent requests)
Transfer rate:          94.42 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       4
Processing:    22  152  12.0    151     228
Waiting:       22  152  12.0    151     228
Total:         26  152  11.8    151     228

Percentage of the requests served within a certain time (ms)
  50%    151
  66%    154
  75%    155
  80%    157
  90%    160
  95%    165
  98%    182
  99%    205
 100%    228 (longest request)
```

### Laravel 5.4

```
Benchmarking laravel.local (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        nginx/1.10.2
Server Hostname:        laravel.local
Server Port:            80

Document Path:          /api/test/
Document Length:        18 bytes

Concurrency Level:      100
Time taken for tests:   37.053 seconds
Complete requests:      10000
Failed requests:        0
Non-2xx responses:      10000
Total transferred:      3390000 bytes
HTML transferred:       180000 bytes
Requests per second:    269.88 [#/sec] (mean)
Time per request:       370.535 [ms] (mean)
Time per request:       3.705 [ms] (mean, across all concurrent requests)
Transfer rate:          89.35 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.6      0       7
Processing:    16  369  66.9    360     574
Waiting:       16  369  66.9    360     574
Total:         18  369  66.7    360     574

Percentage of the requests served within a certain time (ms)
  50%    360
  66%    407
  75%    426
  80%    437
  90%    462
  95%    477
  98%    494
  99%    505
 100%    574 (longest request)
```

### Lumen

```
Benchmarking lumen.local (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        nginx/1.10.2
Server Hostname:        lumen.local
Server Port:            80

Document Path:          /test
Document Length:        11 bytes

Concurrency Level:      100
Time taken for tests:   7.816 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1820000 bytes
HTML transferred:       110000 bytes
Requests per second:    1279.46 [#/sec] (mean)
Time per request:       78.158 [ms] (mean)
Time per request:       0.782 [ms] (mean, across all concurrent requests)
Transfer rate:          227.40 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0       5
Processing:    11   78   5.1     77      97
Waiting:       11   78   5.1     77      97
Total:         16   78   4.9     77      97

Percentage of the requests served within a certain time (ms)
  50%     77
  66%     79
  75%     80
  80%     81
  90%     83
  95%     85
  98%     87
  99%     88
 100%     97 (longest request)
```

### Easy PHP

```
Benchmarking easy-php.local (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        nginx/1.10.3
Server Hostname:        easy-php.local
Server Port:            80

Document Path:          /
Document Length:        53 bytes

Concurrency Level:      100
Time taken for tests:   3.259 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1970000 bytes
HTML transferred:       530000 bytes
Requests per second:    3068.87 [#/sec] (mean)
Time per request:       32.585 [ms] (mean)
Time per request:       0.326 [ms] (mean, across all concurrent requests)
Transfer rate:          590.40 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0       4
Processing:     6   32   4.0     31      68
Waiting:        6   32   4.0     31      68
Total:          8   32   4.0     31      68

Percentage of the requests served within a certain time (ms)
  50%     31
  66%     32
  75%     33
  80%     34
  90%     39
  95%     41
  98%     43
  99%     46
 100%     68 (longest request)
```

# 最后

从结果上来看EasyPHP表现不俗，后期会用wrk再测试一下。

以上仅供参考，希望后期不断优化让EasyPHP变得更快更好。

> [Easy PHP：一个极速轻量级的PHP全栈框架](http://easy-php.tigerb.cn)
