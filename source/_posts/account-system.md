---
title: 电商设计手册之用户体系
date: 2018-08-15 21:50:08
tags: shop
---

# 前言

一直从事互联网电商开发三年多的时间了，回头想想自我却对整个业务流程不是很了解，说出去很是惭愧。但是身处互联网电商的环境中，或多或少接触了其中的各个业务，其次周边还有很多的同事，所以这都是资源。于是，我决定和我的同事盆友们还有你们去梳理整个流程并分享出来，谈不上结果要做的多么好，至少在每一个我们有能力去做到的地方一定会细致入微。

除此之外，同时为了满足我们自身在工作中可能得不到的技术满足感，我们在做整个系统设计的过程中，会去使用我们最想用的技术栈。技术栈这一点我们借docker去实现，所以一方面我们掌握了业务的东西，同时得到了技术上的成长，二者兼得。

最后，出于时间的考虑，我们提出了一个想法“Do design No code”。“只设计不码码”这句话的意思：最终我们设计出来整个系统的数据模型，接口文档，交互过程，以及环境部署，但是最后我们却不写代码，是吧？如果这样了写代码还有什么意义。当然，也不全是这样，出于时间的考虑当然也会用代码实现出来的。

其次，这些内容可能有些考虑不全面或者在上规模的业务中存在更复杂的地方，欢迎指出，我们也希望学习和分享您的经验。

今天，我们开始第一部分**用户体系**的设计。

# 正文

### 简单来看用户体系

当你第一次接触和用户相关的互联网产品时，或者曾今在我眼里。**用户体系**无非就是“登录”和“注册”，“修改用户信息”这些。简单来做的话，无非我们需要一张表去记录用户的身份信息：注册时，往表里插入一个数据；登录时，通过用户标识(手机号、邮箱等)判断用户的密码是否正确；修改用户信息，就是直接update这个uid的用户信息(头像、昵称等)。

这个看来在添加些别的业务逻辑，这样设计的确没什么问题，很简单不是么。但是随着业务的发展，一方面我们提供统一的用户管理，又要提高系统的可扩展性，所以下面是我想呈现出来的**一个基本用户体系应该有的东西**。

### 一个基本用户体系应该有的东西

首先我们对原有的用户表进行再一次的抽象(抽离用户注册、登录依赖的字段) -> **账户表**，为什么这么做？随着业务的发展，以前只维护一个产品，也许某一天又开发新的产品，这样我们就可以统一的维护我们公司所有产品的注册登录逻辑，不同的产品只维护该产品和用户相关的信息即可(具体依赖产品形态)。如下图所示：

<p align="center"><img src="http://cdn.tigerb.cn/user-system.png"></p>

上图中，还提到了第三方登陆/员工表/后台权限管理，这些都是一些用户体系基本必备的结构。

第三方登录：除了普通账号登录的方式外，一般都会提供第三方快捷登录的方式。关于第三方登录这里存在一个交互方式设计存在的问题，后面交互设计时会提到。

员工：因为上面我们抽离了账户表，所以内部的管理系统后台也可以统一的使用账户表的登录逻辑，这样全公司在账号这个事情上达到了真正的高内聚。

提到了员工，我们的内部各种系统后台肯定涉及各种的权限管理，所以这里提到了简单的RBAC(基于角色的权限控制)，具体的逻辑下面会提到。

### 数据模型

<p align="center"><img src="http://cdn.tigerb.cn/er-db.png"></p>


**账户模型**

```sql

-- 账户模型
CREATE TABLE `account_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '账号id',
  `email` varchar(30) NOT NULL DEFAULT '' COMMENT '邮箱',
  `phone` varchar(15) NOT NULL DEFAULT '' COMMENT '手机号',
  `username` varchar(30) NOT NULL DEFAULT '' COMMENT '用户名',
  `password` varchar(32) NOT NULL DEFAULT '' COMMENT '密码',
  `create_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建时间',
  `create_ip_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建ip',
  `last_login_at` varchar(12) NOT NULL DEFAULT '' COMMENT '最后一次登陆时间',
  `last_login_ip_at` varchar(12) NOT NULL DEFAULT '' COMMENT '最后一次登陆ip',
  `status` enum('enable','disable','deleted','unactivated') NOT NULL DEFAULT 'unactivated' COMMENT '状态',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户';
```

**用户模型**

```sql
-- 用户模型
CREATE TABLE `skr_member` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '账号id',
  `nickname` varchar(30) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '头像(相对路径)',
  `gender` enum('male','female') NOT NULL DEFAULT 'male' COMMENT '性别',
  `role` enum('vip','normal') NOT NULL DEFAULT 'normal' COMMENT '角色',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户信息';

-- 第三方账户
CREATE TABLE `skr_platform` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `uid` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '账号id',
  `platform_id` varchar(60) NOT NULL DEFAULT '' COMMENT '平台id',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '平台类型 0:未知,1:facebook,2:google,3:wechat,4:qq,5:weibo,6:twitter',
  `nickname` varchar(60) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '头像',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_platform_id` (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方用户信息';
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
    `gender` enum('male','female') NOT NULL DEFAULT 'male' COMMENT '员工性别',
    `create_at` varchar(12) NOT NULL DEFAULT '' COMMENT '入职时间',
    PRIMARY KEY (`id`),
    KEY `idx_uid` (`uid`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息(这里列了大概的信息，多的可以垂直拆表)';
```

**系统权限管理模型**

```sql
-- 权限管理: 系统map
CREATE TABLE `auth_ms_map` (
    `id` tinyint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `ms_name` varchar(255) NOT NULL DEFAULT '0' COMMENT '系统名称',
    `ms_desc` varchar(255) NOT NULL DEFAULT '0' COMMENT '系统描述',
    `ms_domain` varchar(255) NOT NULL DEFAULT '0' COMMENT '系统域名',
    `create_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` varchar(12) NOT NULL DEFAULT '' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` enum('enable','disable','deleted') NOT NULL DEFAULT 'enable' COMMENT '状态',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统map(登记目前存在的后台系统信息)';

-- 权限管理: 系统权限
CREATE TABLE `auth_item` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `ms_id` tinyint(11) unsigned NOT NULL DEFAULT '0' COMMENT '系统id',
    `uri` varchar(255) NOT NULL DEFAULT '0' COMMENT '页面/接口uri',
    `create_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` varchar(12) NOT NULL DEFAULT '' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` enum('enable','disable','deleted') NOT NULL DEFAULT 'enable' COMMENT '状态',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统权限';

-- 权限管理: 系统权限(权限的各个集合)
CREATE TABLE `auth_role` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `name` varchar(255) NOT NULL DEFAULT '0' COMMENT '角色名称',
    `desc` varchar(255) NOT NULL DEFAULT '0' COMMENT '角色描述',
    `auth_item_set` text COMMENT '权限集合 多个值,号隔开',
    `create_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` varchar(12) NOT NULL DEFAULT '' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` enum('enable','disable','deleted') NOT NULL DEFAULT 'enable' COMMENT '状态',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工角色';

-- 权限管理: 角色与员工关系
CREATE TABLE `auth_role_staff` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
    `staff_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '员工id',
    `role_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '角色id',
    `create_at` varchar(12) NOT NULL DEFAULT '' COMMENT '创建时间',
    `create_by` int(11) NOT NULL DEFAULT '0' COMMENT '创建人staff_id',
    `update_at` varchar(12) NOT NULL DEFAULT '' COMMENT '更新时间',
    `update_by` int(11) NOT NULL DEFAULT '0' COMMENT '修改人staff_id',
    `status` enum('enable','disable','deleted') NOT NULL DEFAULT 'enable' COMMENT '状态',
    PRIMARY KEY (`id`),
    KEY `idx_staff_id` (`staff_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限角色与员工关系';

```


### 交互过程

### 接口设计

1.注册接口

- 请求参数
    + email: string, 用户邮箱
    + phone:　string, 用户手机号
    + code:　string, 验证码

响应内容：
```json
{
    "code": "200",
    "result": {
        "s_token": "string, 用户标示",
        "nickname": "string, 用户昵称",
        "avator": "string, 用户头像",
        "gender": "string, 用户性别，male:男，female:女",
    }
}
```

2.登录接口

3.第三方登录接口

4.用户信息修改接口

5.用户登录状态校验

# 结语
