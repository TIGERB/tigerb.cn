---
title: PHP完整实战23种设计模式
date: 2016-12-14 20:01:36
tags:
---

## 前言

设计模式是面向对象的最佳实践

## 实战

### PHP实战创建型模式

   - [单例模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/singleton/test.php)
   - [工厂模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/factory/test.php)
   - [抽象工厂模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/factoryAbstract/test.php)
   - [原型模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/prototype/test.php)
   - [建造者模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/builder/test.php)


### PHP实战结构型模式

   - [桥接模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/bridge/test.php)
   - [享元模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/flyweight/test.php)
   - [外观模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/facade/test.php)
   - [适配器模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/adapter/test.php)
   - [装饰器模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/decorator/test.php)
   - [组合模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/composite/test.php)
   - [代理模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/proxy/test.php)
   - [过滤器模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/filter/test.php)

### PHP实战行为型模式

   - [模板模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/template/test.php)
   - [策略模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/strategy/test.php)
   - [状态模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/state/test.php)
   - [观察者模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/observer/test.php)
   - [责任链模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/chainOfResponsibility/test.php)
   - [访问者模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/visitor/test.php)
   - [解释器模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/interpreter/test.php)
   - [备忘录模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/memento/test.php)
   - [命令模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/command/test.php)
   - [迭代器模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/iterator/test.php)
   - [中介者器模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/mediator/test.php)
   - [空对象模式](https://github.com/TIGERB/easy-tips/blob/master/patterns/nullObject/test.php)

## 测试用例

23种设计模式都提供测试用例，使用方法：

- 克隆项目： git clone git@github.com:TIGERB/easy-tips.git
- 运行脚本： php patterns/[文件夹名称]/test.php，
例如测试责任链模式： 运行 php patterns/chainOfResponsibility/test.php
```
运行结果：

请求5850c8354b298: 令牌校验通过～
请求5850c8354b298: 请求频率校验通过～
请求5850c8354b298: 参数校验通过～
请求5850c8354b298: 签名校验通过～
请求5850c8354b298: 权限校验通过～
```

## 源码

源码地址 <https://github.com/TIGERB/easy-tips>


这是我的一个关于《一个php技术栈后端猿的知识储备大纲》的知识总结，目前只完成了“设计模式”。

## 纠错

如果大家发现有什么理解有误的地方，可以发起一个issue[点击纠错](https://github.com/TIGERB/easy-tips/issues),我会及时纠正，THX～
