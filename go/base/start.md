# Go语言介绍

<p>
    <img style="vertical-align:middle" width="20%" src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>

Go语言介绍|描述
------|------
字符串表示|双引号
拼接字符串|+
语言版本兼容性|向下兼容
代码风格|自始至今官方统一标准，且提供工具
脚本语言|不是
强类型语言|是
是否支持垃圾回收|是
面向对象语言(OOP)|部分支持，核心是合成复用
是否支持继承|否(有合成复用)
是否支持interface|是
是否支持try...catch...|否
是否支持包管理|是
是否支持跨平台|是
环境搭建成本|低
执行方式|二进制
进程模型|单进程
原生是否支持创建TCP/UDP服务|是
原生是否支持创建HTTP服务|是
进程阻塞性|否
是否支持协程|是
并发能力(③)|极强
是否常驻内存运行|是
引入文件方式|`import`导入包
是否支持单元测试|是
是否支持基准测试(benchmark)|是
是否支持性能分析|支持(pprof/dlv)
性能分析工具使用成本|极低

使用Go语言需要关注的关键点：

1. 强类型
2. 常驻内存运行
3. 理解和使用指针
4. 并发安全
5. 资源及时释放或返还

# Go基础语法

<p>
    <img style="vertical-align:middle" width="20%" src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>

## Go常用基本类型

Go语言常用类型如下：

语言\类型|boolean|string|int|float|array|object
------|------|------|------|------|------|------
Go|bool|string|int、int8、int16、int32、int64、uint、uint8、uint16、uint32、uint64|float32、float64|[length]type|比较像struct

除此之外Go还支持更丰富的类型：

|类型|
|---|
|slice切片(数组)|
|map(hash字典)|
|channel(管道，通过通信共享，不要通过共享来通信)|
|指针(Go语言的值类型都有对应的指针类型)|
|byte(字节，对应uint8别名，可以表示Ascaii码)|
|rune(对应int32，可以表示unicode)|
|等等|
|自定义类型，例如`type userDefinedType int32`|

## Go常用基本类型初始化方式

类型|Go(定义变量带`var`关键字，或者不带直接使用语法糖`:=`)
---------|---------
boolean|`var varStr bool = true`<br>或者 `var varStr = true`<br>或者 `varStr := true`
string|`var varStr string = ""`<br>或者 `varStr := ""`(:=写法下面省略)
int32|`var varInt32 int32 = 0`
int64|`var varInt64 int64 = 0`
float32|`var varFloat32 float32 = 0`
float64|`var varFloat64 float64 = 0`
array|`var varArray [6]int32 = [6]int32{}`
slice(切片)`var varSlice []int32 = []int32{}`切片相对于数据会自动扩容
map|`var varMap map[string]int32 = map[string]int32{}`
closure(闭包)|`var varClosure func() = func() {}`
channel|`var varChannel chan string = make(chan string)` 无缓存channel；<br>`var varChannelBuffer chan string = make(chan string, 6)`有缓存channel

## Go结构体的初始化

Go结构体的初始化
```go
// 包初始化时执行
func init() {

}

type StructDemo struct{
    // 小写开头驼峰表示私有属性
    // 不可导出
    privateVar string
    // 大写开头驼峰表示公有属性
    // 可导出
    PublicVar string
}

// 小写开头驼峰表示私有方法
// 结构体StructDemo的私有方法
func (demo *StructDemo) privateFun() error {
    return nil
}

// 大写开头驼峰表示公有属性
// 结构体StructDemo的公有方法
func (demo *StructDemo) PublicFun() error {
    return nil
}

// 初始化结构体StructDemo
// structDemo := &StructDemo{}
```

## Go常用函数

常用函数描述 | Go
--------|--------
数组长度 | len()
分割字符串为数组 | strings.Split(s string, sep string) []string
转大写 | strings.ToUpper(s string) string
转小写 | strings.ToLower(s string) string
去除空格 | strings.Trim(s, cutset string) string
json序列化 | json.Marshal(v interface{}) ([]byte, error)
json反序列化 | json.Unmarshal(data []byte, v interface{}) error
序列化(不再建议使用) | 包https://github.com/wulijun/go-php-serialize
md5 | 包crypto/md5
终端输出 | fmt.Println(a ...interface{})
各种类型互转 | 包strconv

# Go避坑指南

1. 谨慎使用全局变量，全局变量不会在完成一次请求之后被销毁
2. 形参是`slice`、`map`类型的参数，注意值可被全局修改
3. 资源使用完毕，记得释放资源或回收资源
4. 不要依赖map遍历的顺序
5. 不要并发写map
6. 注意判断指针类型不为空`nil`，再操作
7. Go语言不支持继承，但是有合成复用

## 1.谨慎使用全局变量，全局变量在完成一次请求之后被销毁

```go
package main

import (
	"github.com/gin-gonic/gin"
)

// 全局变量不会像PHP一样，在完成一次请求之后被销毁
var GlobalVarDemo int32 = 0

// 模拟接口逻辑
func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		GlobalVarDemo++
		c.JSON(200, gin.H{
			"message": GlobalVarDemo,
		})
	})
	r.Run()
}

// 我们多次请求接口，可以很明显发现：全局变量不会在完成一次请求之后被销毁。
// 但是PHP不一样，全局变量在完成一次请求之后会被自动销毁。
// curl "127.0.0.1:8080/ping" 
// {"message":1}                                                                     
// curl "127.0.0.1:8080/ping"
// {"message":2} <------- 值在递增
// curl "127.0.0.1:8080/ping"
// {"message":3} <------- 值在递增
```

## 2.形参是`slice`、`map`类型的参数，注意值可被全局修改

> Go里面都是值传递，具体原因下面说。

```go
// 切片
package main

import "fmt"

func main() {
	paramDemo := []int32{1}
	fmt.Printf("main.paramDemo 1 %v, pointer: %p \n", paramDemo, &paramDemo)
	// 浅拷贝
	demo(paramDemo)
	fmt.Printf("main.paramDemo 2 %v, pointer: %p \n", paramDemo, &paramDemo)
}

func demo(paramDemo []int32) ([]int32, error) {
	fmt.Printf("main.demo.paramDemo pointer: %p \n", &paramDemo)
	paramDemo[0] = 2
	return paramDemo, nil
}

// main.paramDemo 1 [1], pointer: 0xc00000c048
// main.demo.paramDemo pointer: 0xc00000c078 <------- 内存地址不一样，发生了值拷贝
// main.paramDemo 2 [2] <------- 原值被修改

// main.paramDemo 1 [1], pointer: 0xc0000a6030
// main.demo.paramDemo pointer: 0xc0000a6060 <------- 内存地址不一样，发生了值拷贝
// main.paramDemo 2 [2], pointer: 0xc0000a6030 <------- 原值还是被修改了



//===========数组就没有这个问题===========
package main

import "fmt"

func main() {
	paramDemo := [1]int32{1}
	fmt.Println("main.paramDemo 1", paramDemo)
	demo(paramDemo)
	fmt.Println("main.paramDemo 2", paramDemo)
}

func demo(paramDemo [1]int32) ([1]int32, error) {
	paramDemo[0] = 2
	return paramDemo, nil
}

// [Running] go run ".../demo/main.go"
// main.paramDemo 1 [1]
// main.paramDemo 2 [1] <------- 值未被修改

//===========Map同样有这个问题===========

package main

import "fmt"

func main() {
	paramDemo := map[string]string{
		"a": "a",
	}
	fmt.Println("main.paramDemo 1", paramDemo)
	demo(paramDemo)
	fmt.Println("main.paramDemo 2", paramDemo)
}

func demo(paramDemo map[string]string) (map[string]string, error) {
	paramDemo["a"] = "b"
	return paramDemo, nil
}

// [Running] go run ".../demo/main.go"
// main.paramDemo 1 map[a:a]
// main.paramDemo 2 map[a:b] <------- 值被修改

```

> 为什么？

```
答：Go语言都是值传递，浅复制过程，slice和map底层的类型是个结构体，实际存储值的类型是个指针。
```

```go
// versions/1.13.8/src/runtime/slice.go
// slice源码结构体
type slice struct {
    array unsafe.Pointer // 实际存储值的类型是个指针
    len   int
    cap   int
}

// versions/1.13.8/src/runtime/map.go
// map源码结构体
type hmap struct {
    count     int
    flags     uint8
    B         uint8
    noverflow uint16
    hash0     uint32

    buckets    unsafe.Pointer // 实际存储值的类型是个指针
    oldbuckets unsafe.Pointer
    nevacuate  uintptr  

    extra *mapextra
}
```

> 怎么办？

```
答：深拷贝，开辟一块新内存，指针指向新内存地址，并把原有的值复制过去。如下：
```

```go
package main

import "fmt"

func main() {
	paramDemo := []int32{1}
	fmt.Println("main.paramDemo 1", paramDemo)
	// 初始化新空间
	paramDemoCopy := make([]int32, len(paramDemo))
	// 深拷贝
	copy(paramDemoCopy, paramDemo)
	demo(paramDemoCopy)
	fmt.Println("main.paramDemo 2", paramDemo)
}

func demo(paramDemo []int32) ([]int32, error) {
	paramDemo[0] = 2
	return paramDemo, nil
}

// [Running] go run ".../demo/main.go"
// main.paramDemo 1 [1]
// main.paramDemo 2 [1]

```

## 3.资源使用完毕，记得释放资源或回收资源

```go
package main

import (
	"github.com/gomodule/redigo/redis"
)

var RedisPool *redis.Pool

func init() {
	RedisPool = NewRedisPool()
}

func main() {
	redisConn := RedisPool.Get()
	// 记得defer释放资源
	defer redisConn.Close()
}

func NewRedisPool() *redis.Pool {
	// 略...
	return &redis.Pool{}
}

```

> 为什么？

```
答：避免资源被无效的持有，浪费资源和增加了资源的连接数。其次如果是归还连接池也减少新建资源的开销。
```

- 资源连接数线性增长
- 如果一直持有，资源服务端也有超时时间

## 4.不要依赖map遍历的顺序

以往PHP的”Map“(关联数组)不管遍历多少次，元素的顺序都是稳定不变的，如下：
```php
<?php

$demoMap = array(
    'a' => 'a',
	'b' => 'b',
    'c' => 'c',
    'd' => 'd',
    'e' => 'e',
);
foreach ($demoMap as $v) {
    var_dump("v {$v}");
}

// 第一次执行
[Running] php ".../php/demo.php"
string(3) "v a"
string(3) "v b"
string(3) "v c"
string(3) "v d"
string(3) "v e"

// 第N次执行
// 遍历结果的顺序都是稳定不变的
[Running] php ".../php/demo.php"
string(3) "v a"
string(3) "v b"
string(3) "v c"
string(3) "v d"
string(3) "v e"
```

但是Go语言里就不一样了，如下：
```go
package main

import "fmt"

func main() {
	var demoMap map[string]string = map[string]string{
		"a": "a",
		"b": "b",
		"c": "c",
		"d": "d",
		"e": "e",
	}
	for _, v := range demoMap {
		fmt.Println("v", v)
	}
}

// 第一次执行
// [Running] go run ".../demo/main.go"
// v a
// v b
// v c
// v d
// v e

// 第二次执行
// 遍历结果，元素顺序发生了改变
// [Running] go run ".../demo/main.go"
// v e
// v a
// v b
// v c
// v d
```

> 为什么？

```
答：底层实现都是数组+类似拉链法。
1. hash函数无序写入
2. 成倍扩容
3. 等量扩容
都决定了map本来就是无序的，所以Go语言为了避免开发者依赖元素顺序，每次遍历的时候都是随机了一个索引起始值。然后PHP通过额外的内存空间维护了map元素的顺序。
```

## 5.不要并发写map

```go
package main

import (
	"testing"
)

func BenchmarkDemo(b *testing.B) {
	var demoMap map[string]string = map[string]string{
		"a": "a",
		"b": "b",
	}
	// 模拟并发写map
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			demoMap["a"] = "aa"
		}
	})
}

// BenchmarkDemo
// fatal error: concurrent map writes
// fatal error: concurrent map writes
```

> 为什么？

```
答：并发不安全，触发panic：“fatal error: concurrent map writes”。
```

```go
// go version 1.13.8源码
// hashWriting 值为 4
if h.flags&hashWriting != 0 {
	throw("concurrent map read and map write")
}
```

## 6.注意判断指针类型不为空`nil`，再操作

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	resp, err := http.Get("https://www.example.com")
	if resp.StatusCode != http.StatusOK || err != nil {
		// 当 resp为nil时 会触发panic
		// 当 resp.StatusCode != http.StatusOK 时err可能为nil 触发panic
		log.Printf("err: %s", err.Error())
	}
}


// [Running] go run ".../demo/main.go"
// panic: runtime error: invalid memory address or nil pointer dereference

```

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// 模拟请求业务code
	resp, err := http.Get("https://www.example.com")
	fmt.Println(resp, err)
	if err != nil {
		// 报错并记录异常日志
		log.Printf("err: %s", err.Error())
		return
	}
	// 模拟业务code不为成功的code
	if resp != nil && resp.StatusCode != http.StatusOK {
		// 报错并记录异常日志
	}
}
```

## 7. Go语言不支持继承，但是有合成复用

```php
abstract class AbstractClassDemo {

    // 抽象方法
    abstract public function demoFun();
    
    // 公有方法
    public function publicFun()
    {
        $this->demoFun();
    }
}

class ClassDemo extends AbstractClassDemo {

    public function demoFun()
    {
        var_dump("Demo");
    }
}

(new ClassDemo())->demoFun();

// [Running] php ".../php/demo.php"
// string(4) "Demo"
```

```go
package main

import (
	"fmt"
)

//基础结构体
type Base struct {
}

// Base的DemoFun
func (b *Base) DemoFun() {
	fmt.Println("Base")
}

func (b *Base) PublicFun() {
	b.DemoFun()
}

type Demo struct {
	// 合成复用Base
	Base
}

// Demo的DemoFun
func (d *Demo) DemoFun() {
	fmt.Println("Demo")
}

func main() {
	// 执行
	(&Demo{}).PublicFun()
}

// [Running] go run ".../demo/main.go"
// Base <------ 注意此处执行的是被合成复用的结构体的方法
```

<p>
    <img style="vertical-align:middle" width="20%" src="http://blog-1251019962.cos.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim">
<p>