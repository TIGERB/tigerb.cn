---
title: 电商设计手册之用户体系[上]
date: 2018-08-15 21:50:08
tags: shop
cover_index: "https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20190330182424.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
---

# 前言

一直从事互联网电商开发三年多的时间了，回头想想却对整个业务流程不是很了解，说出去很是惭愧。但是身处互联网电商的环境中，或多或少接触了其中的各个业务，其次周边还有很多从事电商的同事和朋友，这都是资源。于是，我决定和我的同事、盆友们、甚至还有你们去梳理整个流程并分享出来，谈不上结果要做的多么好，至少在每一个我们有能力去做好的地方，一定会细致入微。

除此之外，同时为了满足我们自身在工作中可能得不到的技术满足感，我们在做整个系统设计的过程中，会去使用我们最想用的技术栈。技术栈这一点我们借助docker去实现，所以最终的结果：一方面我们掌握了业务的东西，另一方面又得到了技术上的满足感，二者兼得。

最后，出于时间的考虑，我们提出了一个想法**Do design No code**。**【只设计不码码】**这句话的意思：最终我们设计出来整个系统的数据模型，接口文档，甚至交互过程，以及环境部署等，但是最后我们却不写代码。是吧？如果这样了写代码还有什么意义。当然，也不全是这样，出于时间的考虑当然也会用代码实现出来的，说不定最后正是对面的你去实现的。

其次，这些内容肯定有考虑不全面或者在上规模的业务中存在更复杂的地方，欢迎指出，我们也希望学习和分享您的经验。

今天，我们开始第一部分**用户体系**的设计。本文分为如下四大模块：

- 架构设计
- 数据模型设计
- 交互设计
- 接口设计

# 架构设计

### 简单来看用户体系

当你第一次接触和用户相关的互联网产品时，或者曾今在我眼里。**用户体系**无非就是“登录”和“注册”，“修改用户信息”这些，等。简单来做的话，无非我们需要一张表去记录用户的身份信息：注册时(insert操作)，往表里插入一个数据；登录时(select&update操作)，通过用户标识(手机号、邮箱等)判断用户的密码是否正确；修改用户信息(select&update操作)，就是直接update这个uid的用户信息(头像、昵称等)。

<p align="center">
  <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-smaple-structure.png" style="width:20%">
</p>

这样设计的确没什么问题，很简单不是么。但是随着业务的发展，一方面我们需要提供统一的用户管理(高内聚)，又要提高系统的可扩展性，所以我想呈现出来的是我理解的**一个基本用户体系应该有的东西**。

### 一个基本用户体系应该有的东西

首先我们对原有的用户表进行再一次的抽象(抽离用户注册、登录依赖的字段、第三方登陆) -> **账户表**，为什么这么做？随着业务的发展，以前只维护一个产品，也许某一天又开发新的产品，这样我们就可以统一的维护我们公司所有产品的注册登录逻辑，不同的产品只维护该产品和用户相关的信息即可(具体依赖产品形态)。如下图所示：

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-user-system-2.png" style="width:80%">

上图中，还提到了第三方登陆/员工表/后台权限管理，这些都是一些用户体系基本必备的结构。

第三方登录：第三方也是登陆方式的一种，我们也把它抽象到账户的一部分，如上图所示。其次，关于第三方登录这里存在一个交互方式设计存在的问题，后面交互设计时会提到。

员工：因为上面我们抽离了账户表，所以内部的管理系统后台也可以统一的使用账户表的登录逻辑，这样全公司在账号这个事情上达到了真正的高内聚。

提到了员工，我们的内部各种系统后台肯定涉及各种的权限管理，所以这里提到了简单的RBAC(基于角色的权限控制)，具体的逻辑数据模型设计会提到。

### 最终的架构

随着业务产品形态的越来越复杂，在设计架构的时候，我们需要分析其中的**变与不变**：

- 变：越来越多的产品个性化用户需求
- 不变：注册登陆的逻辑

最终的结果，我们把原有的用户拆成了**账户**和**用户**，同时我们也要在这里明确这两个概念的区别：

- 账户：整个体系唯一生产uid的地方，内聚注册登陆逻辑，不涉及产品业务需求
- 用户：不同产品个性化的用户需求信息

最终的架构图如下：

- 第一部分：账户(**服务层**)
- 第二部分：用户(**应用层**，无限水平扩展)
- 第三部分：员工(**应用层**，员工权限体系)

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-structure.jpg" style="width:80%">


# 数据模型设计

对应上面的架构，我们很容易设计出我们的数据模型(这里假设我们目前只有一个对C端的应用)：

```
账户 -> 1.账户表
用户 -> 2.用户表
员工 -> 3.员工表
```

除了上面三张表外，还需要我们的R(role)B(base)A(access)C(control)权限管理,RBAC基于角色的权限管理大家应该很熟悉，这里我就不详细说了，简单的RBAC首先需要：

```
4.系统菜单表(菜单即权限)，系统的uri路径
5.权限表(菜单即权限)，具体的权限就是访问系统的菜单
6.角色表，一个角色具有哪些权限
7.员工和角色的关联表，一个员工属于哪个角色
```

好了一个简单的RBAC涉及的表基本罗列出来了，但是在我的工作经历中大家实现的权限管理往往只针对某个系统，这样对于众多的系统后台来说就是乱、重复造轮子、权限管理效率低。所以我在上面的架构设计中把权限作为了一个服务为全系统提供基础服务能力。而达到这个目的的结果我只需要再增加一张表：

```
8.后台管理系统表, 登记所有的后台管理系统(这样通过系统id和系统资源uri的id就可以全局构成唯一性，单纯的uri存在重复的可能性，用uri不用url的原因是域名存在变动的可能性)
```

最后我们的用户体系应该基本就上面8张表。咦，貌似漏掉了第三方登陆，我们加上吧，很简单如下：

```
9. 第三方用户登陆表，记录不同第三方的用户标示
```

最最后就是上面的9张表了，具体的表结构和sql如下：

<img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-model-2.png" style="width:100%">


### 表sql

**账户模型**

```sql

-- 账户模型

CREATE TABLE `account_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '账号id',
  `email` varchar(30) NOT NULL DEFAULT '' COMMENT '邮箱',
  `phone` varchar(15) NOT NULL DEFAULT '' COMMENT '手机号',
  `username` varchar(30) NOT NULL DEFAULT '' COMMENT '用户名',
  `password` varchar(32) NOT NULL DEFAULT '' COMMENT '密码',
  `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `create_ip_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建ip',
  `last_login_at` int(11) NOT NULL DEFAULT '0' COMMENT '最后一次登陆时间',
  `last_login_ip_at` varchar(12) NOT NULL DEFAULT '' COMMENT '最后一次登陆ip',
  `login_times` int(11) NOT NULL DEFAULT '0' COMMENT '登录次数',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1:enable, 0:disable, -1:deleted',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户';
```


```sql
-- 第三方账户

CREATE TABLE `account_platform` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `uid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '账号id',
  `platform_id` varchar(60) NOT NULL DEFAULT '' COMMENT '平台id',
  `platform_token` varchar(60) NOT NULL DEFAULT '' COMMENT '平台access_token',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '平台类型 0:未知,1:facebook,2:google,3:wechat,4:qq,5:weibo,6:twitter',
  `nickname` varchar(60) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '头像',
  `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_platform_id` (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方用户信息';
```

**用户模型**

```sql

-- 用户模型
CREATE TABLE `skr_member` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `uid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '账号id',
  `nickname` varchar(30) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '头像(相对路径)',
  `gender` enum('male','female','unknow') NOT NULL DEFAULT 'unknow' COMMENT '性别',
  `role` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '角色 0:普通用户 1:vip',
  `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户信息';
```

**员工模型**

```sql

-- 员工表
CREATE TABLE `staff_info` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '员工id',
    `uid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '账号id',
    `email` varchar(30) NOT NULL DEFAULT '' COMMENT '员工邮箱',
    `phone` varchar(15) NOT NULL DEFAULT '' COMMENT '员工手机号',
    `name` varchar(30) NOT NULL DEFAULT '' COMMENT '员工姓名',
    `nickname` varchar(30) NOT NULL DEFAULT '' COMMENT '员工昵称',
    `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '员工头像(相对路径)',
    `gender` enum('male','female','unknow') NOT NULL DEFAULT 'unknow' COMMENT '员工性别',
    `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_uid` (`uid`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息(这里列了大概的信息，多的可以垂直拆表)';

```

**系统权限管理模型**

```sql

-- 权限管理: 系统map
CREATE TABLE `auth_ms` (
    `id` smallint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `ms_name` varchar(255) NOT NULL DEFAULT '0' COMMENT '系统名称',
    `ms_desc` varchar(255) NOT NULL DEFAULT '0' COMMENT '系统描述',
    `ms_domain` varchar(255) NOT NULL DEFAULT '0' COMMENT '系统域名',
    `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1:enable, 0:disable, -1:deleted',
    PRIMARY KEY (`id`),
    KEY `idx_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统map(登记目前存在的后台系统信息)';

-- 权限管理: 系统menu
CREATE TABLE `auth_ms_menu` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `ms_id` smallint(11) unsigned NOT NULL DEFAULT '0' COMMENT '系统id',
    `parent_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '父菜单id',
    `menu_name` varchar(255) NOT NULL DEFAULT '0' COMMENT '菜单名称',
    `menu_desc` varchar(255) NOT NULL DEFAULT '0' COMMENT '菜单描述',
    `menu_uri` varchar(255) NOT NULL DEFAULT '0' COMMENT '菜单uri',
    `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    `is_show` enum('yes','no') NOT NULL DEFAULT 'no' COMMENT '是否展示菜单',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1:enable, 0:disable, -1:deleted',
    PRIMARY KEY (`id`),
    KEY `idx_ms_id` (`ms_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统menu';

-- 权限管理: 系统权限
CREATE TABLE `auth_item` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `ms_id` tinyint(11) unsigned NOT NULL DEFAULT '0' COMMENT '系统id',
    `menu_id` varchar(255) NOT NULL DEFAULT '0' COMMENT '页面/接口uri',
    `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1:enable, 0:disable, -1:deleted',
    PRIMARY KEY (`id`),
    KEY `idx_ms_menu` (`ms_id`, `menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限';

-- 权限管理: 系统权限(权限的各个集合)
CREATE TABLE `auth_role` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `name` varchar(255) NOT NULL DEFAULT '0' COMMENT '角色名称',
    `desc` varchar(255) NOT NULL DEFAULT '0' COMMENT '角色描述',
    `auth_item_set` text COMMENT '权限集合 多个值,号隔开',
    `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1:enable, 0:disable, -1:deleted',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工角色';

-- 权限管理: 角色与员工关系
CREATE TABLE `auth_role_staff` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `staff_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '员工id',
    `role_set` text COMMENT '角色集合 多个值,号隔开',
    `create_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1:enable, 0:disable, -1:deleted',
    PRIMARY KEY (`id`),
    KEY `idx_staff_id` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限角色与员工关系';

```

# 结语

文章太长，拆成了两部分，**交互设计**与**接口设计**请查看[电商设计手册之用户体系[下]](/2018/08/15/account-system-two/)

最后，如果有写的不对或者不完善的地方，希望大家多多评论，互相学习互相进步～

项目地址: <https://github.com/skr-shop/manuals>

# skr-shop项目成员简介

排名不分先后，字典序

昵称|简介|个人博客
--------|--------|--------
AStraw|研究生创业者, 现于小米科技海外商城组从事商城后端研发工作|--------
大愚Dayu|国内大多人使用的PHP第三方支付聚合项目[Payment](https://github.com/helei112g/payment)作者，创过业，现于小米科技海外商城组从事商城后端研发工作|[大愚Talk](https://juejin.im/user/58c50c75570c35006d632e8e)
lwhcv|曾就职于百度/融360, 现于小米科技海外商城组从事商城后端研发工作|--------
TIGERB|PHP框架[EasyPHP](http://easy-php.tigerb.cn/#/)作者，拥有A/B/C轮电商创业公司工作经验，现于小米科技海外商城组从事商城后端研发工作| [TIGERB.cn](http://tigerb.cn)

