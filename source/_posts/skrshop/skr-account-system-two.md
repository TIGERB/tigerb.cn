---
title: 电商设计手册之用户体系[下]
date: 2018-08-15 21:50:08
tags: shop
cover_index: "https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20190330182424.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim"
---

# 前言

本文主要涉及交互设计和接口设计，**架构设计**与**数据模型设计**请查看[电商设计手册之用户体系[上]](/2018/08/15/account-system-one/)

# 交互设计

> 友情提示：一大波图片即将到来，此处图片较多，不清楚的可点击大图查看

### 注册

注册成功之后存在至少两种交互方式：

1. 注册成功 -> 跳转到登陆页面
2. 注册成功 -> 自动登陆 -> 跳转到应用首页(或者其他页面)

具体交互流程如下：

<p align="center">
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-register-bmpr.png" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-register-bmpr.png" width="39%">
    </a>
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-register.jpg" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-register.jpg" width="90%">
    </a>
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-register-result-2.png" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-register-result-2.png" width="90%">
    </a>
</p>

--- 

### 登陆

<p align="center">
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-login-page.png" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-login-page.png" width="30%">
    </a>
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-login-logic.jpg" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-login-logic.jpg" width="90%">
    </a>
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-home-page.png" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-home-page.png" width="30%">
    </a>
</p>

##### 快捷登陆

快捷登录的流程基本和上面一致只是验证密码换成了验证验证码。

<p align="center">
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-simple-login-page.png" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-simple-login-page.png" width="39%">
    </a>
</p>

---

### 第三方登陆

第三方登录的交互其实存在这样的问题：

1. 第三方账户登陆成功后还需要绑定手机号/Email吗？

因为我发现有些PM为了提高用户使用的简单快捷性，往往第三方登陆成功后会直接产生uid，而不进行账号的绑定。这样之后在再进行账号绑定就涉及账号合并的问题，很麻烦(如果有钱包等)。如果我们一开始就进行绑定操作，这样未来账号的关系就清晰明了便于维护，第三方登陆其实就相当于普通账号的别名。
最后这个事情做不做的结果就是，账户表account_user和第三方用户信息表account_platform是的**一对多**还是**一对一**的关系。

2. 如果绑定，已经注册的手机号/Email是否可以绑定？

这个还好说，一般来说绑定的选择基本是正确的。最后具体的流程图如下：


<p align="center">
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-platform-login.jpg" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-platform-login.jpg" width="100%">
    </a>
</p>


交互界面图如下：

<p align="center">
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-platform-login-page.png" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-account-platform-login-page.png" width="39%">
    </a>
</p>

---

### 后台权限管理

首先，我们的后台管理系统需要个响亮的称号，想了一会以前公司用过apollo,于是我准备用mars但突然冒出来个earth，地球万物之根，刚好我们这又是个全业务的基础服务管理系统，哈哈就这样吧～ **Earth System**

**Earth System**的权限管理功能主要分为以下四部分：

- 系统管理(The manage system page)
    + 编辑页面
    + 列表页面
- 菜单管理(The menu page)
    + 编辑页面
    + 列表页面
- 角色管理(The role page)
    + 编辑页面
    + 列表页面
- 员工与角色关联管理(The role staff map page)
    + 编辑页面
    + 列表页面

具体交互如下：

<p align="center">
    <a href="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-earth-2.jpg" data-lightbox="roadtrip">
        <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/skr-earth-2.jpg" width="100%">
    </a>
</p>

# 接口设计

### 应用层接口(对外)

1.注册接口

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
username|string|非必传|用户账号
email|string|email/phone两者择一|用户邮箱
phone|string|email/phone两者择一|用户手机号
code|int|必传|验证码

交互方式一(跳转到登陆页面)响应内容：
```json
{
    "code": "200",
    "msg": "OK",
    "result": []
}
```

交互方式二(跳转到首页页面)响应内容：
```json
{
    "code": "200",
    "msg": "OK",
    "result": {
        "s_token": "string, 用户会话标示",
        "s_token_expire": "string, 用户会话标示过期时间，0不过期",
        "username": "string, 用户名",
        "nickname": "string, 用户昵称",
        "avatar": "string, 用户头像",
        "gender": "string, 用户性别，male:男，female:女，other:未知",
    }
}
```

2.登录接口

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
username|string|username/email/phone三者择一|用户账号
email|string|username/email/phone三者择一|用户邮箱
phone|string|username/email/phone三者择一|用户手机号
password|string|必传|密码

响应内容：
```json
{
    "code": "200",
    "result": {
        "s_token": "string, 用户会话标示",
        "s_token_expire": "string, 用户会话标示过期时间，0不过期",
        "nickname": "string, 用户昵称",
        "username": "string, 用户名",
        "avatar": "string, 用户头像",
        "gender": "string, 用户性别，male:男，female:女，other:未知",
    }
}
```

3.快捷登录接口

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
email|string|email/phone两者择一|用户邮箱
phone|string|email/phone两者择一|用户手机号
code|int|必传|验证码

响应内容：
```json
{
    "code": "200",
    "result": {
        "s_token": "string, 用户会话标示",
        "s_token_expire": "string, 用户会话标示过期时间，0不过期",
        "nickname": "string, 用户昵称",
        "username": "string, 用户名",
        "avatar": "string, 用户头像",
        "gender": "string, 用户性别，male:男，female:女，other:未知",
    }
}
```

4.第三方登录接口

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
type|string|必传|平台类型 1:facebook,2:google,3:wechat,4:qq,5:weibo,6:twitter
platform_id|string|必传|第三方平台用户ID
platform_token|string|必传|第三方平台令牌

响应内容：
```json
{
    "code": "200",
    "result": {
        "s_token": "string, 用户会话标示",
        "s_token_expire": "string, 用户会话标示过期时间，0不过期",
        "username": "string, 用户名",
        "nickname": "string, 用户昵称",
        "avatar": "string, 用户头像",
        "gender": "string, 用户性别，male:男，female:女，other:未知",
    }
}
```

5.用户信息修改接口

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
username|string|非必传|用户账号
nickname|string|非必传|昵称
avatar|string|非必传|头像url
gender|string|非必传|用户性别，male:男，female:女，other:未知

响应内容：
```json
{
    "code": "200",
    "result": {
        "username": "string, 用户名",
        "nickname": "string, 用户昵称",
        "avatar": "string, 用户头像",
        "gender": "string, 用户性别，male:男，female:女，other:未知",
    }
}
```

6.用户登录状态校验

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
s_token|string|必传|用户会话标示

响应内容：
```json
{
    "code": "200",
    "result": {
        "s_token_expire": "string, 用户会话标示过期时间，0不过期， -1登陆失效",
    }
}
```

### 服务接口(基础服务，对内)

**账户服务：**

1. 注册

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
username|string|非必传|用户账号
email|string|email/phone两者择一|用户邮箱
phone|string|email/phone两者择一|用户手机号

交互方式一(跳转到登陆页面)响应内容：
```json
{
    "code": "200",
    "msg": "OK",
    "result": {
        "uid": "string, 账户ID"
    }
}
```

2. 登陆

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
username|string|非必传|用户账号
email|string|email/phone两者择一|用户邮箱
phone|string|email/phone两者择一|用户手机号
password|string|必传|密码

响应内容：
```json
{
    "code": "200",
    "msg": "OK",
    "result": {
        "uid": "string, 账户ID"
    }
}
```

3. 第三方登录

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
type|string|必传|平台类型 1:facebook,2:google,3:wechat,4:qq,5:weibo,6:twitter
platform_id|string|必传|第三方平台用户ID
platform_token|string|必传|第三方平台令牌

响应内容：
```json
{
    "code": "200",
    "result": {
        "uid": "string, 账户ID",
        "nickname": "string, 用户昵称",
        "avatar": "string, 用户头像",
    }
}
```


**权限服务**

1. 获取系统菜单

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
ms_id|string|必传|系统ID

响应内容：
```json
{
    "code": "200",
    "msg": "OK",
    "result": {
        "ms_name": "string, 系统名称",
        "ms_desc": "string, 系统描述",
        "ms_domain": "string, 系统域名",
        "list": [
            {
                "parent_id": "string, 父菜单ID",
                "menu_id": "string, 菜单ID",
                "menu_name": "string, 菜单ID",
                "menu_desc": "string, 菜单描述",
                "menu_uri": "string, 菜单uri",
                "child" : [
                    {
                        "parent_id": "string, 父菜单ID",
                        "menu_id": "string, 菜单ID",
                        "menu_name": "string, 菜单ID",
                        "menu_desc": "string, 菜单描述",
                        "menu_uri": "string, 菜单uri",
                        "child" : []
                    }
                ]
            }
        ]
    }
}

```

2. 权限校验

请求参数：

字段|类型|是否必传|描述
------------|------------|------------|------------
menu_id|string|必传|菜单ID

响应内容：
```json
{
    "code": "200",
    "msg": "OK",
    "result": []
}
```


# 结语

文章太长，拆成了两部分，**架构设计**与**数据模型设计**请查看[电商设计手册之用户体系[上]](/2018/08/15/account-system-one/)

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

