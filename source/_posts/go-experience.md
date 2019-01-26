---
title: go新手容易犯的三个致命错误
date: 2019-01-19 20:19:02
tags: go
---

# 前言

最近因为以前一些重要且古老的go项目基本没有人专职维护了，所以被安排去熟悉这些项目的代码，所以看了大量go的代码。历史原因，这些代码中或多或少有一些刚刚从PHPer转过来的Gopher去设计和开发的，自然有不少是在php(fpm模式下)码代码思路下埋藏的一些坑。今天我就来和大家一起分享一下最近发现的比较不容易发现和出现比率比较高的**三个致命错误**。

# 三个致命错误

### 致命错误一: defer的错误使用

- 现象：死循环代码块中直接使用defer(非函数内部的defer)
- 问题：defer代码一直不会执行
- 例如：下面的示例，正常情况下`defer redisConn.Close()`一直不会执行，所以redis的连接数会持续增长得不到释放，搞不好redis直接被打挂。
- 经验：监测服务资源发现socket(redis/mysql等)连接持续增长，就需要我们去找代码里出现的类似的代码了

> 监测redis连接数会持续增长命令： `watch -n 2 "redis-cli -h 127.0.0.1 -p 6379 info | grep 'connected_clients'" 下面的代码会导致connected_clients持续增长
`

```go
package main

import (
	"fmt"
	"time"

	"github.com/gomodule/redigo/redis"
)

var RedisPool *redis.Pool

func init() {
	RedisPool = NewRedisPool()
	fmt.Println("RedisPool.Stats: ", RedisPool.Stats())
}

func main() {
	for {
        redisConn := RedisPool.Get()
        // 下意识的defer 但是忘了是在for循环了 除了进程挂了基本是不会执行这个defer了 资源得不到释放
		defer redisConn.Close()

		// 一堆业务逻辑
		_, err := redisConn.Do("set", "demo_key", "666")
		if err != nil {
			fmt.Println("redis set err: ", err.Error())
			continue
		}
		res, _ := redis.String(redisConn.Do("get", "demo_key"))
		fmt.Println("get demo_key: ", res)
		time.Sleep(1 * time.Second)
	}
}

func NewRedisPool() *redis.Pool {
	return &redis.Pool{
		MaxIdle:     6,
		IdleTimeout: 240 * time.Second,
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", "127.0.0.1:6379")
			if err != nil {
				return nil, err
			}
			return c, nil
		},
		TestOnBorrow: func(c redis.Conn, t time.Time) error {
			if time.Since(t) < time.Minute {
				return nil
			}
			_, err := c.Do("PING")
			return err
		},
	}
}
```

### 致命错误二: 死循环中一直持有一个连接

- 现象：死循环外面获取的连接，在死循环中使用，所以直到进程挂掉为止，这个goroutine一直持有该连接
- 问题：如果资源服务端因为种种原因主动挂掉了这个连接(比如服务端超时)，这个循环的代码之后就永远连接服务，代码逻辑就不用说了基本无法正常执行
- 例如：下面的示例，redis因为redis proxy超时主动关闭了连接，就会报*EOF*
- 经验：如果服务大范围报EOF错误，就需要我们去排查类似的代码了

```go
package main

import (
	"fmt"
	"time"

	"github.com/gomodule/redigo/redis"
)

var RedisPool *redis.Pool

func init() {
	RedisPool = NewRedisPool()
	fmt.Println("RedisPool.Stats: ", RedisPool.Stats())
}

func main() {
    // 死循环外面获取的连接 所以直到进程挂掉这个goroutine一直持有是这个连接
    redisConn := RedisPool.Get()
    defer redisConn.Close()
    
    for {
		// 一堆业务逻辑
		_, err := redisConn.Do("set", "demo_key", "666")
		if err != nil {
			fmt.Println("redis set err: ", err.Error())
			continue
		}
		res, _ := redis.String(redisConn.Do("get", "demo_key"))
		fmt.Println("get demo_key: ", res)
		time.Sleep(1 * time.Second)
	}
}

func NewRedisPool() *redis.Pool {
	return &redis.Pool{
		MaxIdle:     6,
		IdleTimeout: 240 * time.Second,
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", "127.0.0.1:6379")
			if err != nil {
				return nil, err
			}
			return c, nil
		},
		TestOnBorrow: func(c redis.Conn, t time.Time) error {
			if time.Since(t) < time.Minute {
				return nil
			}
			_, err := c.Do("PING")
			return err
		},
	}
}
```

### 致命错误三：err.Error()使用位置不对

- 现象：有时候打业务log的时候，获取错误信息`err.Error()`的代码忘了写在`err !=nil`里
- 问题：代码可以编译通过，但是运行到该处代码块时**空指针**panic
- 问题：例下面的示例，模拟业务中某些情况才会执行下面的代码块
- 经验：养成强类型语言下严谨的逻辑习惯

```go
package main

import (
	"fmt"
	"log"
	"time"
)

func main() {
	var i int
	ticker := time.NewTicker(1 * time.Second)
	for v := range ticker.C {
		fmt.Println(v, i)
		i = i + 1
		// 模拟业务中某些情况才会执行下面的代码块
		if i == 6 {
			res, err := Simulate(i)
			// 有时候打业务log的时候 获取错误信息 err.Error() 的代码忘了写在err != nil里 导致空指针
			log.Println(fmt.Sprintf("res:%t i:%d err:%s", res, i, err.Error()))
			if err != nil {
				return
			}
		}
	}
}

func Simulate(i int) (b bool, err error) {
	return true, nil
}

```

代码可以编译通过，但是运行到该处代码块时**空指针**panic，如下模拟：

```
2019-01-19 23:56:48.044504 +0800 CST m=+1.005583125 0
2019-01-19 23:56:49.039491 +0800 CST m=+2.000557249 1
2019-01-19 23:56:50.03956 +0800 CST m=+3.000614086 2
2019-01-19 23:56:51.043367 +0800 CST m=+4.004408337 3
2019-01-19 23:56:52.040469 +0800 CST m=+5.001497207 4
2019-01-19 23:56:53.039643 +0800 CST m=+6.000658300 5
panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x20 pc=0x1097a7f]

goroutine 1 [running]:
main.main()
        /Users/tigerb/github/easy-tips/go/src/go-learn/main.go:19 +0x1df

```

# 结语

最后说一句，像我们这样从PHPer(fmp)转过来的Gopher，码代码的时候一定要考虑到我们是在常驻内存的场景下编程，例如并不限于下面三点：

- 全局变量
- 线程安全
- 资源回收