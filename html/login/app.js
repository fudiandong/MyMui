/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	var ajax_lock = false;
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length != 11) {
			var un = document.getElementById('username');
			owner.showSoftInput(un);
			return callback('请输入11位手机号码');
		}
		if (loginInfo.password == '') {
			return callback('密码不能为空');
		}
		
		var url = "http://192.168.44.203:8082/cisp/AppUserAction?act=login";
		if(ajax_lock) {
			$.toast("请稍等待");
			return;
		}
		ajax_lock = true;
		$.ajax(url,{
			data: {
				'user.phone': loginInfo.account,
				'user.password': loginInfo.password
			},
			dataType: 'json', 	//服务器返回json格式数据
			type: 'post', 		//HTTP请求类型
			timeout: 10000, 	//超时时间设置为10秒
//			crossDomain:true, 	// 2017年4月17日 16:49:24 修改
			success: function(data) {
				if(data.code == 1) {
					$.toast("登录成功！");
					ajax_lock = false;
					return owner.createState(loginInfo.account, callback);
				}else {
					$.toast(data.message);
					ajax_lock = false;
					
				}
				
			},
			error: function(xhr, type, errorThrown) {
				console.log(type);
				ajax_lock = false;
			}
		});
		
		
		
//		var users = JSON.parse(localStorage.getItem('$users') || '[]');
//		var authed = users.some(function(user) {
//			return loginInfo.account == user.account && loginInfo.password == user.password;
//		});
//		if (authed) {
//			return owner.createState(loginInfo.account, callback);
//		} else {
//			return callback('用户名或密码错误');
//		}
	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		console.log("name = "+ name);
		state.token = "token123456789";
		owner.setState(state);
		console.log("222");
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.account.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if (!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(users));
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = plus.storage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		console.log("state = "+state);
		plus.storage.setItem('$state', JSON.stringify(state));
		console.log("111");
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};
	var nativeWebview, imm, InputMethodManager;
	owner.initNativeObjects = function() {
		if($.os.android) {
			var main = plus.android.runtimeMainActivity();
			var Context = plus.android.importClass("android.content.Context");
			InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
		} else {
			nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
		}
	};

	owner.showSoftInput = function(input) {
		if($.os.android) {
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
		} else {
			nativeWebview.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		}
		setTimeout(function() {
			input.focus();
		}, 200);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 设置应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 获取应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));