
# 关于我

--------------------------------------------------------------------------------

# 个人资料

- 姓名: 方元梅
- 邮箱: 973782295@qq.com
- 年龄: 23
- QQ: 973782295
- 手机号码: 18292090437
- 毕业学校: 西安财经大学（2014-2018）
- 专业: 信息与计算科学

# 工作经历

时间               | 公司           |　负责产品　| 职位
---------------- | ------------ | ------------ | --------
2018.03 - 2019.03 | 北京潘达互娱科技有限公司 | 熊猫直播APP |  服务端(PHP)开发
# 项目经验

1. 直播间礼物发放系统
  - 时间: 2018-12 ～ 2019-1
  - 项目简述: 该系统主要负责直播间礼物的发放功能，该系统提供给所有直播间使用，直播间又是我司用户流量最大的地方，所以接口的性能要求会比较高。该系统包含以下功能：
    1. 用户进入房间获取可以赠送的礼物列表
    2. 用户选择礼物并赠送给主播，并通过赠送结果获取前端相对应的交互效果
    3. 同时用户以及主播可以通过页面查看到礼物的赠送记录
    4. 可以查询用户剩余猫币数量
  - 项目接口:
    1. 礼物列表接口 展示该主播可被赠送的礼物列表
    2. 礼物缓存接口
    3. 赠送记录接口 展示该主播被赠送礼品的历史记录 以及数量
    4. 赠送礼物接口 会返回前端展示效果相关数据
    5. 赠送礼物内网接口
    6. 查询剩余猫币数量接口 
  - 个人职责:
    1. 负责接口的维护工作
    2. 利用proxy_cache优化礼物系统中礼物列表接口
    3. 礼物缓存接口的重构
  - 项目收益:
    1. 礼物列表接口QPS从原来350提升到9000多
    2. 
    3. 学习了fastcgi_cache,proxy_cache的使用
2. 项目发布系统
  - 时间：2018-7 ~ 2018-9
  - 项目简述：该系统负责星颜部门测试，灰度，线上环境代码版本的代码发布和管理。该系统包含以下功能：
    1. 用户可以查看最近十个版本tag，及相关commit，是否测试通过信息
    2. 支持测试人员确认测试通过
    3. 支持单台服务器代码版本的发布，支持一键发布代码版本到多台服务器
    4. 支持查看待发布版本与线上版本的diff信息
    5. 支持nginx,php-fpm的重启
  - 项目职责：
    1. 负责整个系统后台所有接口的开发
    2. 对前后端的权限进行控制，保证系统的安全性
  - 项目收获：
    1. 第一次接触整个项目的开发流程，从开发到测试，到发布
    2. 对代码的封装和架构有了进一步的认识，对git的使用更加了解，学习了前后端是如何进行分离开发
3. 星颜弹幕房间接口系统
  - 时间：2018-9 ~ 2018-11
  - 项目描述：该系统主要用于星颜星秀房间与用户相关信息的查询，短视频发言，辅助机器人系统的运行
  - 项目接口：
    1. 获取房间用户列表接口
    2. 获取房间在线人数接口
    3. 获取房间用户状态内网接口
    4. 机器人进出房间内网接口
    5. 机器人发言内网接口
    6. 短视频发言接口
    7. 获取房间英雄列表接口
  - 项目职责：
    1. 负责重构上面的所有接口
    2. 开发英雄列表接口
  - 项目收获：
    1. 学习了接口的安全封装如何防止csrf攻击，了解了rabbitmq的使用
# 职业技能
- 熟悉php+Mysql+Nginx+Linux编程环境的开发
- 掌握常用的的数据结构和排序算法
- 熟悉http//tcp/ip等网络协议
- 熟练常用的git命令，yaf框架
- 了解nginx和php-fpm交互原理

# 其它技能
- 使用Bootstrap进行简单的前端页面开发