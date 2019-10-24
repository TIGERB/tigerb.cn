title: 面向对象的设计过程
speaker: 施展
url: http://tigerb.cn/

<slide class="bg-black-blue aligncenter" image="https://images.unsplash.com/photo-1505238680356-667803448bb6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80 .dark">

# 面向对象的设计过程 {.text-landing}

----

By 施展 {.text-subtitle.animated.fadeInDown.delay-800}


<slide class="aligncenter">

## 前言 {.gray2}
----
我一直认为分享的目的不是炫技。 {.text-intro}

:::column

###### 一是，
自我学习的总结。

----

###### 二是，
降低他人的学习成本。

---
###### 三是，
别人对自己学习结果的审核。

:::

<slide>

### 本次分享有下面四个要素 {.gray3}
----

:::column {.sms}

### 观点

本次分享的观点是一个软件工程中的思维方法，不限于编程语言。

----
### 探讨

我可能理解错的，或者大家没理解的，大家可以随时打断我，尽可能多互动，目的增加理解。

---

## 理解
真的希望大家能理解。

---

## 运用
最重要的，如果你觉着有帮助，一定要去在实际业务中实战。

:::

<slide class="aligncenter">

## 背景
----
工作中，几乎大家是不是经常抱怨别人写的代码->

- 没法改
- 耦合高 
- 无法扩展

:::note
今天就来探讨如何**克服**上面的问题～ {.slideInUp}
:::

<slide class="aligncenter">

## 场景
----
首先问个问题：

> 平常工作中来了一个业务需求，我们是如何开始写代码的？

我推测大多数人可能：

- 1、梳理业务
- 2、设计数据库、接口、缓存
- 3、评审
- 4、于是就开始了 `怎么怎么样...如果怎么怎么样...怎么怎么样...`愉快的码代码的过程

> 此处有人觉着有啥问题么？

:::note
备注：说出来问题的，本次分享就可以略过了~
:::

<slide :class="aligncenter">

#### 一个简单的业务场景
----

:::card

比如产品提了个需求：
描述刘超凡一天的生活，简单来看看他一天干些啥。 {.text-intro}

* 1.0 饿了吃饭
* 1.1 到点吃饭
* 2.0 渴了喝水
* 2.1 到点喝水
* 3.0 困了睡觉
* 3.1 到点睡觉
* 3.2 有可能一个人睡觉，也有可能... 是吧？复杂
{.description}

---
![](http://cdn.tigerb.cn/20191020234013.png)

:::

<slide :class="size-200">

### 代码演化

:::gallery

![](http://cdn.tigerb.cn/20191020234051.png)

一个业务逻辑(拆成多个函数)从头写到尾

---

![](http://cdn.tigerb.cn/20191020234118.png)

一个业务逻辑(引入类)从头写到尾

---

![](http://cdn.tigerb.cn/20191020234526.png)

一个业务逻辑(拆成多个类方法)从头写到尾

---

![](http://cdn.tigerb.cn/20191020234848.png)

一个业务逻辑(拆成多类)从头写到尾

:::

<slide class="aligncenter size-50">

#### 典型的策略(状态)模式
----

![](http://cdn.tigerb.cn/20191020235015.png)

一个业务逻辑(拆成类、抽象类、接口)从头写到尾。

<slide class="aligncenter size-50">

### 上面就是面向对象设计的代码结果

<slide class="aligncenter size-50">

## 思考🤔
----

> 上面的代码就没啥问题了吗？

<slide class="aligncenter size-50">

## 思考🤔
----

> 所以，如何设计出完全面向对象的代码？


<slide>

:::cta

#### 什么是代码建模？

---

把业务抽象成**事物**(类class、抽象类abstact class)和**行为**(接口interface)的过程。

:::

<slide class="fullscreen">

:::column

#### 实栗🌰分析

`--------------`

看一个实际的业务场景：

最近刘超凡开始创业了，刚创立了一家电商公司，B2C，自营书籍《3分钟学会交际》。最近开始写提交订单的代码。

注意场景 
1.刚创业 
2.简单的单体应用 
3.此处不探讨架构

---

```
定义接口API、设计数据库、缓存、技术评审等就开始码代码:
---------------------------------------------

接口参数：
uid
address_id
coupon_id
.etc

业务逻辑：
参数校验->
地址校验->
其他校验->
写订单表->
写订单商品信息表->
写日志->
扣减商品库存->
清理购物车->
扣减各种促销优惠活动的库存->
使用优惠券->
其他营销逻辑等等->
发送消息->
等等...
```
:::

<slide class="fullscreen aligncenter">

#### 业务分析少不了
----

>换个角度看业务其实很简单：根据用户相关信息生成一个订单。

:::column

```
1. 梳理得到业务逻辑:
-----------------

参数校验->
地址校验->
其他校验->
写订单表->
写订单商品信息表->
写日志->
扣减商品库存->
清理购物车->
扣减各种促销优惠活动的库存->
使用优惠券->
其他营销逻辑等等->
发送消息->
等等...
```
---

```
2. 梳理业务逻辑依赖信息:
--------------------

用户信息
商品信息
地址信息
优惠券信息
等等...
```
:::

<slide :class="size-70">

## 获取事物 {.aligncenter}
---

:::card {.quote}

> 比如，我们把订单生成的过程可以想象成**机器人**，一个生成订单的**订单生成机器人**。

---

![](http://cdn.tigerb.cn/20191020223812.jpg)

:::

<slide :class="size-70">

## 获取行为 {.aligncenter}
---

:::card {.quote}

> 行为呢？毫无义务就是上面各种业务逻辑。

---

![](http://cdn.tigerb.cn/20191020224230.jpg)

:::

<slide :class="size-70">

## 得到UML {.aligncenter}
---

:::card {.quote}

![](http://cdn.tigerb.cn/20191020233121.png)

:::

<slide :class="size-200">

### 设计代码

----

:::gallery

<br>

`1. 定义一个类`
![](http://cdn.tigerb.cn/20191020235309.png)

---

<br>

`2. 定义一个订单创建行为的接口`
![](http://cdn.tigerb.cn/20191020235643.png)

---

<br>

`3. 定义具体的不同订单创建行为类`
![](http://cdn.tigerb.cn/20191020235840.png)

:::

<slide :class="size-200">

### 创建订单

----

:::gallery

<br>

`这里的代码该怎么写，这样？`
![](http://cdn.tigerb.cn/20191021000742.png)

---

<br>

`还可以继续优化吗？🤔️`
![](http://cdn.tigerb.cn/20191021001002.png)

---

<br>

`使用闭包。`
![](http://cdn.tigerb.cn/20191021001305.png)

:::

<slide :class="size-40">

## PHP完整代码
---

:::card {.quote}

![](http://cdn.tigerb.cn/20191024143840.png)

:::

<slide :class="size-50">

## Go完整代码
---

:::card {.quote}

![](http://cdn.tigerb.cn/20191024144623.png)

:::

<slide :class="size-80 aligncenter">

#### 上面的代码有什么好处？🤔️
---

:::card {.quote}

>假如刘超凡又要新开发一个新的应用。去除优惠逻辑、新增了增加用户积分的逻辑。

---

![](http://cdn.tigerb.cn/20191021001739.png)

:::


<slide :class="aligncenter">

## 所以，现在，什么是面向对象？😖

<slide :class="aligncenter">

## 面向对象的设计原则

----

- 对接口编程而不是对实现编程
- 优先使用对象组合而不是继承
- 抽象用于不同的事物，而接口用于事物的行为

<slide class="size-100 aligncenter">

#### 回归代码
----

:::gallery

![](http://cdn.tigerb.cn/20190714103845.jpg)

> 1.对接口编程而不是对实现编程

```
结果：RobotOrderCreate依赖了BehaviorOrderCreateInterface抽象接口
```

> 2.优先使用对象组合而不是继承

```
结果：完全没有使用继承，多个行为不同场景组合使用
```

> 3.抽象用于不同的事物，而接口用于事物的行为

```
结果：
1. 抽象了一个创建订单的机器人 RobotOrderCreate
2. 机器人又有不同的创建行为
3. 机器人的创建行为最终依赖于BehaviorOrderCreateInterface接口
```

---

![](http://cdn.tigerb.cn/20191024143840.png)

:::

<slide :class="aligncenter">

## 是不是完美契合，所以这就是“面向对象的设计过程”。😄

<slide :class="aligncenter">

## 预习

----

#### 设计模式又是什么？

:::note
前人面向对象编程过程中的经验总结
:::

<slide class="size-60 aligncenter">

#### 设计模式的设计原则（开闭原则）

----

:::gallery

![](http://cdn.tigerb.cn/20191022131439.png)

## 开闭原则：对扩展开放，对修改封闭

<slide class="size-60 aligncenter">

### 设计模式的设计原则

----

- 开闭原则：对扩展开放，对修改封闭
- 里氏代换：超类（父类）出现的地方，派生类（子类）都可以出现
- 依赖倒转：对接口编程，依赖于抽象而不依赖于具体
- 接口隔离：使用多个接口，而不是对一个接口编程，去依赖降低耦合
- 合成复用：多个独立的实体合成聚合，而不是使用继承
- 迪米特法则，又称最少知道原则：减少内部依赖，尽可能的独立

:::

<slide class="size-60 aligncenter">


### 下回预告👋

----

上面预习了设计模式的概念，下次我们进行《设计模式业务实战》。

<slide class="size-60 aligncenter">

### 完了？没有～ 重点来了

<slide class="size-60 aligncenter">

### 😨作业😨

----

找一个你最近写过的业务，重新设计你的业务代码。

