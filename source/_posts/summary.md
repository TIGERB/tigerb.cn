---
title: PHPer的月工作总结之构建抽奖工具
date: 2017-04-23 20:10:57
tags: summary
---

## 前言
目标是每个月写一篇文章，对从事编程开发的基础知识做一个学习总结。这个月的计划本来是对基础的数据结构做一个沉淀，但是，但是，但是......这个月的的状态就是工作工作...既然这样就总结下这个月的工作吧。

## 工作内容

促销活动的抽奖工具，具备如下功能：

- 根据不同的订单金额抽奖，可设置最高订单金额限制
- 根据不同的抽奖次数抽奖，可设置积分消耗限制
- 根据不同的时间段抽奖，可设置积分消耗限制

## 建模

一看到上面的需求，很显然的我们会想到策略模式，制定三种不同的策略实体类：

- 按订单抽奖策略：LotteryOrderStrategy
- 按次数抽奖策略：LotteryTimesStrategy
- 时间段抽奖策略：LotteryTimeScopeStrategy

建立了具体的三个策略实体类之后，由于不同的抽奖策略其实有很多的相似行为，我们开始进行抽象，最后整个的抽奖行为如下：

- 活动参与条件验证: check[抽象方法]
- 读取规则信息: getRule[具体方法]
- 匹配符合的规则区间: getNodeByRule[抽象方法]
- 活动参与次数验证: checkTimes[具体方法]
- 活动规则限制验证: checkJoinLimit[抽象方法]
- 消费积分: consumePoints[抽象方法]
- 读取该规则对应的所有奖品: getPrize[具体方法]
- 抽奖: draw[具体方法]
- 组装奖品信息: packagePrizeInfo[具体方法]

接着,建立抽象类：LotteryAbstract。抽象完成以后：

- 相同的逻辑: 不同抽奖实体类直接继承使用即可
- 不同的逻辑: 不同抽奖实体类具体实现即可

具体抽象类如下：

```
abstract class LotteryAbstract
{
    abstract protected function check();

    protected function getRule()
    {
        # code...
    }
    abstract protected function getNodeByRule();
    protected function checkTimes()
    {
        # code...
    }
    abstract protected function checkJoinLimit();
    abstract protected function consumePoints();
    protected function getPrize()
    {
        # code...
    }
    protected function draw()
    {
        # code...
    }
    protected function packagePrizeInfo()
    {
        # code...
    }
}

```

接着我们发现其实不同的抽奖策略的抽奖流程基本一致，这样我们就联想到了设计模式的“模板模式”，我们对抽象类做些小的调整，我们把抽奖的算法调用流程实现在抽象类中，最后抽象类就构成了一个抽奖类的模板。以后我们增加新的抽象方式，只需要实现抽奖模板的抽象方法即可，变更后的抽象类如下：


```
abstract class LotteryAbstract
{
    /**
     * 抽奖算法
     */
    public function run ()
    {
        $this->check();
        $this->getRule();
        $this->getNodeByRule();
        $this->checkTimes();
        $this->checkJoinLimit();
        $this->consumePoints();
        $this->getPrize();
        $this->draw();
        $this->packagePrizeInfo();
    }
    abstract protected function check();
    protected function getRule()
    {
        # code...
    }
    abstract protected function getNodeByRule();
    protected function checkTimes()
    {
        # code...
    }
    abstract protected function checkJoinLimit();
    abstract protected function consumePoints();
    protected function getPrize()
    {
        # code...
    }
    protected function draw()
    {
        # code...
    }
    protected function packagePrizeInfo()
    {
        # code...
    }
}

```

## 并发

建模完成后，还存一个并发的问题：并发下对奖品领取数量的变更问题。当然可能都会想到加锁，让并发的过程变成串行的过程，这样就不会存在问题了。一是使用mysql的悲观锁(for update),但是考虑到这个去抽奖的过程有在类似秒杀的场景中使用，所以我就考虑用redis的悲观锁实现，毕竟内存的io性能比磁盘要高的多，所以开始的方案一如下：

- [redis悲观锁](https://github.com/TIGERB/easy-tips/blob/master/redis/pessmistic-lock.php)

本地ab -c 100 -n 1000　压测正常。

然后上线就出问题了，顺时redis大量的操作，远远的超过了以前的峰值。然后方案二出来了，抢不到锁，睡５毫秒，降低抢锁的频率，方案如下：


```
伪代码：

do {
    抢锁...
    if (! 失败) {
        usleep(5000);
    }
} while (! 失败);

```

上面的方案有效的降低了峰值，但是又造成了499的请求，接着方案三出来了，具体方案如下：

- 由于redis是单线程的利用redis的decr自减，保证奖品库存的准确性
- 活动开始前注入奖品库存到redis
- 定时同步库存到mysql(减少了直接从mysql中减少库存的主库压力)

通过这个方案，redis，mysql主库的压力基本减轻。

## 问题

接着来说说这段时间工作中遇到的一些问题:

- 个人问题：
    + 错误的使用redis的悲观锁,抢锁失败没有进行睡眠，导致线上redis瞬时大量的操作(本地压测未发现问题)，后期会对这块进行深度的研究
    + 没有从头到尾认真的进行code review(项目开发时间过于紧急)
- 项目排期混乱：每年定期搞的活动，却只预留了５天开发时间
- 接口文档：老式的wiki文档，没有返回值的示例，没有返回值的类型说明。增加了前后端开发成本，低效率。
- 前端依赖：前端重度的依赖后端数据进行调试
- 测试低效：纯手工的测试，也缺乏对一些基础工具的使用
- 低效的后台项目项目代码：基本不具备代码复用能力的代码，组织混乱
- 各个环境的使用：目前我们开发测试灰度环境，每次使用前都靠“吼”，经常会出现代码被别人覆盖的问题
- svn问题
    + 同事本地代码丢失
    + 代码发布的分支，发布通过合并trunk，导致线上紧急修复分支被阻塞
    + 代码发布的分支，经常导致忘记合并回trunk
    + 每次发布前需要到专门的线上代码diff机器进行代码diff

## 解决方案

提出了问题，当然得给出对应的解决方案:

- 个人问题：
    + 继续对基础知识进行深度学习，目前对于nginx,linux,redis,mysql,mongo我都还需要大力的去学习。
    + 有质量的code review是必须的
- 项目排期混乱：对产品和上级反馈希望我们能从中挖掘出原因，避免和减少同样的事情的发生
- 接口文档：内部推动试行api blueprint，和对snowboard,swagger等这样工具的使用，目前从我做起。
- 前端依赖：推动前端同事自行打断点调试和api　mock
- 测试低效：推动至少目前对简单代理工具的使用
- 低效的后台项目项目代码：有可能推动内部使用yii2开发后台，个人觉着开发后台gii还是蛮有效率
- 各个环境的使用: 有空写一个简单的页面，使用对应环境的机器checkbox选中即可，一目了然，完全避免以前的问题
- svn问题
    - 推动内部转向git
    - git stash 本地暂存未提交的代码，从而避免丢代码问题
    - 紧急的修补分支，采用git workflow的热补丁分之随时上线即可
    - git workflow的工作流可以避免我们目前的使用svn代码经常忘记合并到trunk问题
    - git 本地diff分支代码即可　提高了效率

## 经验

- 写代码前一定要尽可能的弄清楚要做什么
- 写代码前进行必要的抽象过程，这样通常可以写出易于阅读和扩展的代码(不过，脱离业务的代码是耍流氓哦，哈哈～)
- code review 必不可少，慢慢养成习惯吧，骚年们
- 压测，对我们写完的代码进行压测,简单的可以使用ab,siege
- 项目完成后的总结和沉淀

> [Easy PHP：一个极速轻量级的PHP全栈框架](http://easy-php.tigerb.cn)
