controllers.controller('AppCtrl', ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location) {
	
	$scope.postUrl = "xxx";
	$scope.changedUser = false;
	
	API.http = $http;
	
	API.getPostUrl(function(response) {
		
		$scope.postUrl = response.data;
		
	});
	
	$scope.userLoaded = false;
	
	$scope.currentView = "app";
	$scope.tooltipsLoaded = false;
	
	$scope.refreshCounter = 0;
	$scope.currentTradingSessionId = 0;
	
	$scope.user = null;
	
	$scope.errors = [];
	$scope.infos = [];
	
	$scope.missingReserves = 1;
	$scope.paymentMethodSet = false;
	$scope.okToTrade = false;
	
	$scope.serviceFees = {};
	
	$scope.setUser = function(user) {
		
		console.log("setUser called");
		
		if(user != undefined) {
			
			console.log("set defined user");
			
			API.userId = user.username;
			API.authToken = user.authToken;
			
			$scope.setCookie("fluxToken", user.authToken, 15);
			$scope.setCookie("fluxUser", user.username, 15);
			
			$scope.user = user;
			$scope.userLoaded = true;
			
			var tradingSessions = $scope.user.tradingSessions;
			
			if($scope.user.live == true) {
				$scope.newSession = "ltc_usd_btce";
			} else {
				$scope.newSession = "ltc_usd_test";
			}
			
			var path = $location.path();
			
			if(path.substring(0, 15) == "/tradingSession") {
				var tradingSessionId = path.substring(16);
				API.tradingSessionId = tradingSessionId;
				$scope.go(path);
			} else if(path == "/front") {
				$scope.go(path);
			} else {
				var tradingSessionId = tradingSessions[0].id;
				API.tradingSessionId = tradingSessionId;
				$scope.go("/tradingSession/"+tradingSessionId);
			}
			
			
		} else {
			
			$scope.userLoaded = false;
			
			API.getUser(function(response) {
				
				$scope.checkResponse(response);
				
				var users = response.data;
				
				$scope.user = users[0];
				console.log($scope.user);
				$scope.userLoaded = true;
				
				var tradingSessions = $scope.user.tradingSessions;
				
				//var tradingSessionId = tradingSessions[0].id
				//API.tradingSessionId = tradingSessionId;
				
				if($scope.user.live == true) {
					$scope.newSession = "ltc_usd_btce";
				} else {
					$scope.newSession = "ltc_usd_test";
				}
				
				if($scope.changedUser) {
				
					var tradingSessionId = tradingSessions[0].id;
					API.tradingSessionId = tradingSessionId;
					$scope.go("/tradingSession/"+tradingSessionId);
					
				} else {
					
					var path = $location.path();
				
					if(path.substring(0, 15) == "/tradingSession") {
						var tradingSessionId = path.substring(16);
						API.tradingSessionId = tradingSessionId;
						$scope.go(path);
					} else if(path == "/front") {
						$scope.go(path);
					} else {
						var tradingSessionId = tradingSessions[0].id;
						API.tradingSessionId = tradingSessionId;
						$scope.go("/tradingSession/"+tradingSessionId);
					}
					
				
				}
				
				
				
			});
			
		}

		
	};
	
	
	$scope.addTab = function() {
		
		console.log($scope.newSession);
		
		API.addTradingSession($scope.newSession, function(response) {
			
			response = angular.fromJson(response);
			$scope.checkResponse(response);
			
			var newTradingSession = response.data;
			
			console.log(newTradingSession);
			$scope.user.tradingSessions.push(angular.fromJson(newTradingSession));
		
		});
		
	};
	
	
	$scope.deleteCurrentTab = function() {
		
		API.deleteTradingSession($scope.user.currentTradingSession.id, function(response) {
			
			response = angular.fromJson(response);
			
			console.log(response);
			
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				
				var tabs = response.data;
				
				console.log(tabs);
				
				$scope.user.tradingSessions = tabs;
				
				if(tabs.length > 0) {
					$scope.user.currentTradingSession = tabs[0];
					var tabId = tabs[0].id;
					API.tradingSessionId = tabId;
					$scope.go("/tradingSession/"+tabId);
				}
				
			}
			
		});
		
	};
	
	$scope.toggleUser = function() {
	
		if($scope.user.live) {
			$scope.changeToTestUser();
		} else {
			$scope.changeToLiveUser();
		}
		
	};
	
	
	$scope.changeToTestUser = function() {
		
		API.userId = $scope.user.username+" (test)";
		
		$scope.changedUser = true;
		$scope.setUser();
		
		
	};
	
	$scope.changeToLiveUser = function() {
		
		API.userId = $scope.user.username.substring(0, $scope.user.username.length-7);
		
		$scope.changedUser = true;
		$scope.setUser();
		
		
	};
	
	
	$scope.changeMa = function(period, direction) {
		
		var random = true;
		
		var changeAmount = 0.01;
		var rateChangeAmount = 0;
		
		if(random) {
			
			changeAmount = parseFloat(Math.random()*0.01);
			if(period == "testShort") {
				rateChangeAmount = changeAmount;
			}
			
		}
		
		if(direction == "down") {
			changeAmount = -changeAmount;
			rateChangeAmount = -rateChangeAmount;
		}
		
		var movingAverages = $scope.user.currentTradingSession.rate.movingAverages;
		var testMa = movingAverages[period];
		movingAverages[period] = testMa + changeAmount;
		
		var changedRate = $scope.user.currentTradingSession.rate.sell + rateChangeAmount;
		
		$scope.user.currentTradingSession.rate.sell = changedRate;
		$scope.user.currentTradingSession.rate.buy = changedRate;
		$scope.user.currentTradingSession.rate.last = changedRate;
		
		API.setRate($scope.user.currentTradingSession.rate, function(response) {
			$scope.checkResponse(response);
			$scope.user.currentTradingSession.rate = response.data;
		});
		
		
	};
	
	
	$scope.raisePrice = function() {
		
		var random = true;
		
		if(random) {
			$scope.user.currentTradingSession.rate.sell += parseFloat(Math.random()*0.01);
			$scope.user.currentTradingSession.rate.buy = $scope.user.currentTradingSession.rate.sell + parseFloat(0.005 * Math.random());
			$scope.user.currentTradingSession.rate.last = $scope.user.currentTradingSession.rate.sell + parseFloat(0.00025 * Math.random());
		} else {
			$scope.user.currentTradingSession.rate.sell += 0.1000;
			$scope.user.currentTradingSession.rate.buy = $scope.user.currentTradingSession.rate.sell;
			$scope.user.currentTradingSession.rate.last = $scope.user.currentTradingSession.rate.sell;
		}
		
		API.setRate($scope.user.currentTradingSession.rate, function(response) {
			$scope.checkResponse(response);
			$scope.user.currentTradingSession.rate = response.data;
		});
		
		
	};
	
	
	$scope.lowerPrice = function() {
		
		var random = true;
		
		if(random) {
			var priceChange = -parseFloat(Math.random()*0.01);
			if($scope.user.currentTradingSession.rate.sell + priceChange > 0.1) {
				$scope.user.currentTradingSession.rate.sell += priceChange;
				$scope.user.currentTradingSession.rate.buy = $scope.user.currentTradingSession.rate.sell + parseFloat(0.005 * Math.random());
				$scope.user.currentTradingSession.rate.last = $scope.user.currentTradingSession.rate.sell + parseFloat(0.00025 * Math.random());
			}
		} else {
			$scope.user.currentTradingSession.rate.sell -= 0.1000;
			$scope.user.currentTradingSession.rate.buy = $scope.user.currentTradingSession.rate.sell;
			$scope.user.currentTradingSession.rate.last = $scope.user.currentTradingSession.rate.sell;
		}
		
		API.setRate($scope.user.currentTradingSession.rate, function(response) {
			$scope.checkResponse(response);
			$scope.user.currentTradingSession.rate = response.data;
		});
		
	};
	
	$scope.removeFundsLeft = function() {
		
		$scope.user.currentTradingSession.fundsLeft -= 10;
	
	};
	
	$scope.addFundsLeft = function() {
		
		$scope.user.currentTradingSession.fundsLeft += 10;
	
	};
	
	$scope.removeFundsRight = function() {
		
		$scope.user.currentTradingSession.fundsRight -= 10;
	
	};
	
	$scope.addFundsRight = function() {
		
		$scope.user.currentTradingSession.fundsRight += 10;
	
	};
	
	
	$scope.go = function(path) {
		console.log("go to path "+path);
		$location.path(path);
	};
	
	$scope.setCookie = function(key, value, expires) {
		
		var expDate = new Date();
		expDate.setTime(expDate.getTime() + expires*1000*60);
		var expStr = expDate.toUTCString();
		console.log(key+" expires "+expStr);
		
		var value = escape(value) + ((expires==null) ? "" : "; expires="+expStr+"; path=/");
		document.cookie = key + "=" + value;
	
	};
	
	$scope.getCookie = function(key) {
		
		var value = document.cookie;
		var start = value.indexOf(" " + key + "=");
		if(start == -1) {
			start = value.indexOf(key + "=");
		}
		
		if(start == -1) {
			value = null;
		} else {
			start = value.indexOf("=", start) + 1;
			var end = value.indexOf(";", start);
			if(end == -1) {
				end = value.length;
			}
		
			value = unescape(value.substring(start,end));
		}
		
		return value;
	
	};
	
	$scope.logout = function() {
		
		console.log("logging out");
		
		$scope.user = null;
		API.userId = null;
		API.tradingSessionId = null;
		console.log($scope.user);
		
		$scope.setCookie("fluxUser", "", -1);
		$scope.setCookie("fluxToken", "", -1);
		
		console.log($scope.user);
		$scope.go("/front");
		
	};
	
	$scope.checkResponse = function(response) {
	
		var success = response.success;
		
		if(success == -1 || success == -2) {
			$scope.logout();
		}
		
	};
	
	console.log("setting up user");
	
	var cookieUserId = $scope.getCookie("fluxUser");
	var cookieToken = $scope.getCookie("fluxToken");
	
	console.log("cookie user: "+cookieUserId+" / cookie token: "+cookieToken);
	
	var url = $location.url();
	console.log("URL: "+url);
	
	if(url.substring(1, 12) != "verifyemail" && url.substring(1, 8) != "recover") {
		
		if(cookieUserId != null && cookieToken != null) {
		
			API.userId = cookieUserId;
			API.authToken = cookieToken;
		
			$scope.setUser();
	
		} else {
			
			var path = $location.path();
			
			if(path != "/support") {
				$scope.go("/front");
			}
	
		}
	
	}
	
	//Holder.run({images:".img", nocss:true});
	
	//$scope.setUser();
	
	//EXTERNAL SCRIPTS
	
	
	
}]);