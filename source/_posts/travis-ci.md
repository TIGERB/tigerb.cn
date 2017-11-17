---
title: 持续集成你的PHP项目
date: 2017-05-30 22:01:20
tags: travis-ci
---

最近才发现了github MarketPlace，进去逛了逛发现了travis-ci，一个和github结合紧密的持续集成部署工具。之前也一直想接触与之相关的东西，所以立即拿来搞一搞，通过ci我们就可以自动的测试和部署我们的项目了，最后只需要跟踪可视化的部署过程，和结果反馈即可，效率大大的提升了。

## 准备

点击：
install it for free

点击：
complete order and begin installation

开关：
开启你需要持续集成的项目

## 安装travis

```
mac:
brew install ruby

debian:
sudo apt-get install ruby
```

```
gem install travis
```
## .travis.yml文件

```
travis login

输入你的：
github username
github password
```

```
travis init

语言选择：
php
```


加密你ssh私钥：
```
travis encrypt-file ~/.ssh/id_rsa --add
```

执行这个命令后会生成下面的命令到.travis.yml文件before_install中
```
- openssl aes-256-cbc -K $encrypted_fee1ab4be628_key -iv $encrypted_fee1ab4be628_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
```

travis ci不支持交互式的操作，所以我们使用ssh免密登录的方式执行我们的部署命令。在此之前，确保这个ssh秘钥是通过免密登录过的，因为第一次添加到authorized_keys时的登录还是需要输入密码的。上面的命令把我们private key解密后添加到travis ci执行集成的环境中。

### before_install

在执行此次集成前需要的操作。

例如，持续集成测试，travis ci会执行phpunit命令来测试我们的项目,所以在此之前安装我们的依赖：
```
composer install
```

设置权限保证秘钥文件可读：
```
- chmod 600 ~/.ssh/id_rsa
```

设置ssh　config不强制验证host：
```
echo -e "Host ip\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
```

### script

集成中的操作。

### after_success

集成测试成功后操作。

例如，到我们的目标项目下执行git pull更新代码
```
ssh username@ip 'cd /mnt/www/yourproject && git pull origin master'
```

最终的文件：
```
language: php
php:
- '7.1'
before_install:
- openssl aes-256-cbc -K $encrypted_fee1ab4be628_key -iv $encrypted_fee1ab4be628_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
- chmod 600 ~/.ssh/id_rsa
- composer install
- echo -e "Host ip\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config

after_success:
- ssh username@ip 'cd /mnt/www/yourproject && git pull origin master'

```

最后我们每次更新我们的代码的时候travis ci都会自动帮我们集成测试和部署我们的项目。

其次，我们还可以指定监听的分支：

```
branches:
    only:
    - release
```

最后，结合api buleprint协议工具snowboard，实现了一个持续集成部署的接口文档和mock服务,每次编写完接口文档后，travis-ci就会自动帮我们部署。我们把部署的命令写进一个shell脚本中，最后执行这个脚本即可，脚本如下：
```
#!/bin/bash

# git pull
git pull origin master

# generate api doc
cd ./apib && ./snowboard html -i ./v1/index.apib -o ./v1/index.html

# kill old mock api process
sudo kill $(ps -aux | grep "snowboard" | awk '{print $2}' | head -n 1)

# new mock api
nohup sudo ./snowboard mock -i ./v1/index.apib -b 'domain:8080' &
```

持续集成极大的解放了生产力，另外写单元测试的作用在这里也极大的体现了，所以在我们的开发中单元测试真的必不可少，潜移默化中提高了我们代码的健壮性。同理我们也可以使用它来部署我们的博客等。虽然travis-ci只能使用在github的仓库，但是一定有别的友善的工具待我发现。

> [Easy PHP：一个极速轻量级的PHP全栈框架](http://easy-php.tigerb.cn)
