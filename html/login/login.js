(function($) {
	$.init({
		swipeBack: false, //启用右滑关闭功能
//		preloadPages: [{
//			url: 'syzc.html',
//			id: 'syzc.html'
//		}]
	});
	
	var nativeWebview, imm, InputMethodManager;
	var initNativeObjects = function() {
		if($.os.android) {
			var main = plus.android.runtimeMainActivity();
			var Context = plus.android.importClass("android.content.Context");
			InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
		} else {
			nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
		}
	};
	var showSoftInput = function(input) {
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
	$.plusReady(function() {
		var mainPage = $.preload({
			"id": 'main',
			"url": '../../index.html'
		});
		var main_loaded_flag = false;
		mainPage.addEventListener("loaded",function () {
			main_loaded_flag = true;
		});
		var toMain = function() {
			//使用定时器的原因：
			//可能执行太快，main页面loaded事件尚未触发就执行自定义事件，此时必然会失败
			var id = setInterval(function () {
				if(main_loaded_flag){
					clearInterval(id);
					$.fire(mainPage, 'show', null);
					mainPage.show("pop-in");
				}
			},20);
		};
		initNativeObjects();
		var ajax_lock = false;
		document.getElementById("login").addEventListener('tap', function() {
			var un = document.getElementById('username');
			var pw = document.getElementById('password');
			if(un.value == "" || un.value.length != 11) {
				$.alert('请输入11位手机号码', '提示信息', function() {
					showSoftInput(un);
				});
				return;
			}
			if(pw.value == "") {
				$.alert('密码不能为空', '提示信息', function() {
					showSoftInput(pw);
				});
				return;
			}
			var url = urlpath+"AppUserAction?act=login";
			if(ajax_lock) {
				$.toast("请稍等待");
				return;
			}
			ajax_lock = true;
			$.ajax(url, {
				data: {
					'user.phone': un.value,
					'user.password': pw.value
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				crossDomain:true, // 2017年4月17日 16:49:24 修改
				success: function(data) {
					if(data.code == 1) {
						plus.storage.setItem('$tffz_u_i', JSON.stringify(data.rows[0]));
//						plus.webview.currentWebview().hide();
//						$.fire(plus.webview.currentWebview().parent(), 'showfoot', {
//							targetTab: 'index1.html'
//						});
//						$.fire(plus.webview.currentWebview().parent(), 'targetTab', {
//							targetTab: 'index1.html'
//						});
						pw.value ='';
						console.log(JSON.parse(plus.storage.getItem('$tffz_u_i')).tfid);
//						
						toMain();
//						if(mui.os.ios) {
//							$.fire(plus.webview.getWebviewById('wo.html'),"shuaxin",null);
//							$.fire(plus.webview.getWebviewById('sp1.html'),"shuaxin",null);
//							$.fire(plus.webview.getWebviewById('index1.html'),"shuaxin",null);
//							$.fire(plus.webview.getWebviewById('fw.html'),"shuaxin",null);
//						} else{
//							plus.webview.getWebviewById('index1.html').reload();
//							plus.webview.getWebviewById('wo.html').reload();
//							plus.webview.getWebviewById('sp1.html').reload();
//							plus.webview.getWebviewById('fw.html').reload();
//						}
					} else {
						$.toast(data.message);
					}
					ajax_lock = false;
				},
				error: function(xhr, type, errorThrown) {
					console.log(type);
					ajax_lock = false;
				}
			});
		});
		document.getElementById("zc").addEventListener('tap', function() {
//			$.openWindow({
//				id: 'syzc.html',
//				url: 'syzc.html',
//				styles: {
//					popGesture: 'close'
//				},
//				show: {
//					aniShow: 'slide-in-bottom'
//				},
//				waiting: {
//					autoShow: false
//				}
//			});
		});
	});
})(mui);