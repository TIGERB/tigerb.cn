---
title: 利用php重载和curl的并行方式优雅的封装小米推送sdk
date: 2016-10-12 19:06:55
tags: mipush
---

##背景

前段时间迁移小米推送部分代码，这部分之前是其他人负责的。读了代码，发现了两点：
1. 所有接口的实现除了url和传参基本都是一致的
2. android和ios的设备需要分别推送一次

刚好这段时间了解了一下php的**重载概念**【动态的创建类属型和方法，不同于java等的参数不同方法名相通的概念，具体的概念可以[RTFM](http://php.net/manual/zh/language.oop5.overloading.php)】和**curl的并发方式**，所以
- 对于以上第一点：是否可以利用php的重载概念，用魔术方法__call()动态的变更接口调用的url参数和请求参数，去实现对小米推送不同接口的调用，也就是说我们所有的调用逻辑都是实现在__call这一个方法中，却对外提供小米推送不同接口的调用方法，这样就会极大的简化代码
- 对于以上第二点：是否可以利用curl的并行方式一次性推送给android和ios设备，这样理论上我们可以减少一次推送调用的时间，因为我们不需要再去等待给一类设备推送完了，再去推送给另一类设备

-------
## 具体实现

####接下来，我们开始造代码。首先，构造一个mipush的实体，实体的成员属性包括：运行环境、初始化的一些配置参数、所实现的小米接口的信息(接口uri和参数等)####
```
    /**
	 * 运行环境 develop：开发环境 product：生产环境
	 * @var string
	 */
	private $_environment = 'develop';

	/**
	 * 设备系统类型 android ios
	 * @var string
	 */
	private $_osType      = '';

	/**
	 * 小米推送域名
	 * @var string
	 */
	private $_host        = '';

	/**
	 * 请求头
	 * @var string
	 */
	private $_headers     = '';

	/**
	 * 接口url
	 * @var string
	 */
	private $_url         = '';

	/**
	 * 调用的接口方法名称
	 * @var array
	 */
	private $_function    = [];

	/**
	 * 请求参数
	 * @var array
	 */
	private $_data        = [];

	/**
	 * 小米推送设置
	 * @var array
	 */
	private $_options = [
		'title'                   => '消息通知自定义title',
		'restricted_package_name' => '',
		'pass_through'            => 0, // 0 通知栏消息 1 透传
		'notify_type'             => -1, // -1:默认所有,1:使用默认提示音提示,2:使用默认震动提示,4:使用默认led灯光提示
		'time_to_send'			 => 0, // 定时推送 单位毫秒 默认0
	];

	/**
	 * 运行环境配置
	 * @var array
	 */
	private static $_environmentConfig = [
		'domain' => [
			'product'  => 'https://api.xmpush.xiaomi.com/',
			'develop'  => 'https://sandbox.xmpush.xiaomi.com/'
		],
	];

	/**
	 * 小米推送接口信息定义
	 *
	 * url/请求参数
	 * @var array
	 */
	private $_functionDefine = [
		'regid' => [
			'uri' => 'v3/message/regid',
			'arguments' => [
				'registration_id' => [
					'type' => 'array',
					'must' => 'y'
				],
				'description' => [
					'type' => 'string',
					'must' => 'y'
				],
				'params' => [//自定义参数
					'type' => 'array',
					'must' => 'n'
				],
			]
		],
		'userAccount' => [
			'uri' => 'v2/message/user_account',
			'arguments' => [
				'user_account' => [
					'type' => 'array',
					'must' => 'y'
				],
				'description' => [
					'type' => 'string',
					'must' => 'y'
				],
				'params' => [//自定义参数
					'type' => 'array',
					'must' => 'n'
				],
			]
		],
		'alias' => [
			'uri' => 'v3/message/alias',
			'arguments' => [
				'alias' => [
					'type' => 'array',
					'must' => 'y'
				],
				'description' => [
					'type' => 'string',
					'must' => 'y'
				],
				'params' => [//自定义参数
					'type' => 'array',
					'must' => 'n'
				],
			]
		],
		'topic' => [
			'uri' => 'v3/message/topic',
			'arguments' => [
				'topics' => [
					'type' => 'array',
					'must' => 'y'
				],
				'description' => [
					'type' => 'string',
					'must' => 'y'
				],
				'params' => [//自定义参数
					'type' => 'array',
					'must' => 'n'
				],
			]
		],
		'multiTopic' => [
			'uri' => 'v3/message/multi_topic',
			'arguments' => [
				'topics' => [
					'type' => 'array',
					'must' => 'y'
				],
				'topics_op' => [// UNION并集，INTERSECTION交集，EXCEPT差集
					'type' => 'string',
					'must' => 'y'
				],
				'description' => [
					'type' => 'string',
					'must' => 'y'
				],
				'params' => [//自定义参数
					'type' => 'array',
					'must' => 'n'
				],
			]
		],
		'all' => [
			'uri' => 'v3/message/all',
			'arguments' => [
				'description' => [
					'type' => 'string',
					'must' => 'y'
				],
				'params' => [//自定义参数
					'type' => 'array',
					'must' => 'n'
				],
			]
		],
	];
```

####mipush实体的构造函数：实现对一系列配置的初始化####
```
/**
	 * 初始化配置
	 *
	 * @param $string $os_type 系统类型
	 * @param $string $config  配置
	 * @param array   $options 设置 [
	 *                        'title'        => 'string,标题',
	 *                        'pass_through' => 'tinyint,0通知栏消息,1透传,默认0'
	 *                        'notify_type'  => 'tinyint,-1,1,2,3,4',
	 *                        'time_to_send' => 'int, 定时推送, 毫秒'
	 *                        ]
	 * @param string  $environment 环境
	 */
	public function __construct($os_type='', $config=array(), $options=array(), $environment='')
	{
		/* init environment */
		if ($environment) {
			$this->_environment = $environment;
		}
		if ($os_type === 'ios') {
			$this->_host     = self::$_environmentConfig['domain'][$this->_environment];// ios
		}else{
			$this->_host     = self::$_environmentConfig['domain']['product'];// android
		}

		/* init option */
		$this->_headers   = [];
		$this->_headers[] = 'Authorization: key=' . $config['secret'];
		if ($os_type === 'android') {
			$this->_options['restricted_package_name'] = $config['package_name'];
		}
		foreach ($this->_options as $k => &$v) {
			if (in_array($k, $options)) {
				$v = $options[$k];
			}
		}
	}
```

####mipush实体的魔法方法__call：动态实现对小米推送接口的参数验证和调用，以至于我们未来实现新的小米推送接口及实现配置就可以。
```
/**
	 * 魔术方法
	 *
	 * 重载对象方法
	 * @param  string $name      小米推送方法名称
	 * @param  array  $arguments 请求参数
	 * @return mixed             void||object
	 */
	public function __call($name,$arguments)
	{
		$arguments = $arguments[0];
		$this->_function = $this->_functionDefine[$name];
		$this->_url = $this->_host . $this->_function['uri'];
		$this->dataCheck($arguments);

		switch ($name) {
			case 'regid':
				$this->_data['registration_id'] = $arguments['registration_id'];
				break;
			case 'userAccount':
				$this->_data['user_account'] = implode(',', $arguments['user_account']);
				break;
			case 'alias':
				$this->_data['alias']        = implode(',', $arguments['alias']);
				break;
			case 'topic':
				$this->_data['topic']        = $arguments['topic'];
				break;
			case 'multiTopic':
				$this->_data['topics']       = implode(";$;", $arguments['topics']);
				$this->_data['topic_op']     = $arguments['topic_op'];
				break;
			case 'all':
				$this->_data['topics']       = implode(";$;", $topics);
				$this->_data['topic_op']     = 'UNION';
				break;

				default:
				throw new \Exception('Sorry, This function is useless in this version', 404);
				break;
		}

		$this->_data['description']  = $arguments['description'];
		if($arguments['params']) {
			foreach ($arguments['params'] as $k => $v) {
				$this->_data['extra.'.$k] = $v;// 自定义参数
			}
		}
		if ($this->_osType === 'android') {
			$this->_data = array_merge($this->_data, $this->_options);
		}
	}
```

定义完小米推送实体后，我们只需要通过mipush这个实体，实例化生产不同设备类型的对象，再由curl并行的方式发起推送即可。
```
/**
	 * 并行推送
	 *
	 * @param  Mipush $mipush_ios     ios端实体
	 * @param  Mipush $mipush_android android端实体
	 * @return array                  推送结果
	 */
	private static function curlRequest(Mipush $mipush_ios, Mipush $mipush_android)
	{
		$ch_ios     = curl_init();
		$ch_android = curl_init();
		curl_setopt($ch_ios, CURLOPT_URL, $mipush_ios->_url);
		curl_setopt($ch_ios, CURLOPT_POST, 1);
		curl_setopt($ch_ios, CURLOPT_POSTFIELDS, $mipush_ios->_data);
		curl_setopt($ch_ios, CURLOPT_HTTPHEADER, $mipush_ios->_headers);
		curl_setopt($ch_ios, CURLOPT_RETURNTRANSFER, 1);

		curl_setopt($ch_android, CURLOPT_URL, $mipush_android->_url);
		curl_setopt($ch_android, CURLOPT_POST, 1);
		curl_setopt($ch_android, CURLOPT_POSTFIELDS, $mipush_android->_data);
		curl_setopt($ch_android, CURLOPT_HTTPHEADER, $mipush_android->_headers);
		curl_setopt($ch_android, CURLOPT_RETURNTRANSFER, 1);

		$mh = curl_multi_init();
		curl_multi_add_handle($mh, $ch_ios);
		curl_multi_add_handle($mh, $ch_android);

		$running=null;
		do {
		   curl_multi_exec($mh,$running);
		} while($running > 0);

		$result['ios'] 	   = json_decode(curl_multi_getcontent($ch_ios), true);
		$result['android'] = json_decode(curl_multi_getcontent($ch_android), true);

		curl_multi_remove_handle($mh, $ch_ios);
		curl_multi_remove_handle($mh, $ch_android);
		curl_multi_close($mh);
		return $result;
	}
```
以上就是这些了，通过以上的方式我们就用很少的代码封装了一个小米sdk，目前只实现了按regid(登记id),alias(别名),user_account(用户账号),topic(标签), multi_topic(多标签),all(全体)推送。

-------
##如何使用？

```
composer require tigerb/easy-mipush

使用格式：
try {
    Push::init(
        ['secret' => 'string,必传,ios密钥'],
        ['secret' => 'string,必传,android密钥', 'package_name' => 'string,必传,android包名']
        [   
          'title'        => 'string,非必传,消息通知自定义title',
          'pass_through' => 'int,非必传,0通知栏消息,1透传,默认0',
          'notify_type'  => 'int,非必传,-1:默认所有,1:使用默认提示音提示,2:使用默认震动提示,4:使用默认led灯光提示',
          'time_to_send' => 'int,非必传,定时推送,单位毫秒,默认0',
        ],
        'string,develop开发环境，product生产环境, 默认develop'
        );  
    $res = Push::toUse('string,小米push方法名', 'array, 该方法对应的参数');
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo $e->getMessage();
}

使用示例：
use Mipush\Push;

require './vendor/autoload.php';

try {
    Push::init(
        ['secret' => 'test'],
        ['secret' => 'test', 'package_name' => 'com.test'],
        [   
          'title'        => 'test',
          'pass_through' => 0,
          'notify_type'  => -1,
          'time_to_send' => 0,
        ],
        'develop'
        );  
    $res = Push::toUse('userAccount', [
            'user_account' => [1],
            'description'  => 'test'
        ]);
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo $e->getMessage();
}
```

最后，第一次写这种文章，写的不是很好，写的不对的地方谢谢大家留言指证出来，其次，还没验证过这里使用魔术方法的性能消耗，因为之前有看过鸟哥的文章不赞成使用魔术方法，欢迎大家留言指证，谢谢。

完整代码地址： <https://github.com/TIGERB/easy-mipush>


> [Easy PHP：一个极速轻量级的PHP全栈框架](http://easy-php.tigerb.cn)
