function AppCtrl($scope, $routeParams, $http) {
	
	$scope.currentView = "app";
	
	$scope.refreshCounter = 0;
	$scope.currentTradingSessionId = 0;
	
	$scope.user = null; 
	
	$scope.setUser = function(user) {
		
		if(user != undefined) {
			
			API.userId = user.username;
			API.authToken = user.authToken;
			
			$scope.setCookie("fluxToken", user.authToken, 15);
			$scope.setCookie("fluxUser", user.username, 15);
			
			$scope.user = user;
			
			var tradingSessions = $scope.user.tradingSessions;
			var tradingSessionId = tradingSessions[0].id
			API.tradingSessionId = tradingSessionId;
			
			$scope.go("/tradingSession/"+tradingSessionId);
			
		} else {
		
			API.getUser(function(users) {
			
				$scope.user = users[0];
				console.log($scope.user);
			
				var tradingSessions = $scope.user.tradingSessions;
				var tradingSessionId = tradingSessions[0].id
				API.tradingSessionId = tradingSessionId;
			
				$scope.go("/tradingSession/"+tradingSessionId);
			
			});
			
		}

		
	};
	
	$scope.deleteCurrentTab = function() {
		
		API.deleteTradingSession($scope.user.currentTradingSession, function(response) {
			
			if(response.success == 1) {
				
				var tabs = response.data;
				
				console.log(tabs);
				
				$scope.user.tradingSession = tabs;
				
				if(tabs.length > 0) {
					$scope.user.currentTradingSession = tabs[0];
					var tabId = tabs[0].id;
					API.tradingSessionId = tabId;
					$scope.go("/tradingSession/"+tabId);
				}
				
			}
			
		});
		
	};
	
	$scope.changeToTestUser = function() {
		
		API.userId = $scope.user.username+" (test)";
		
		$scope.setUser();
		
		
	};
	
	$scope.changeToLiveUser = function() {
		
		API.userId = $scope.user.username.substring(0, $scope.user.username.length-7);
		
		$scope.setUser();
		
		
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
	
	
	$scope.go = function (hash) {
		console.log("go to #"+hash);
		location.href = "#"+hash;
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
	
	console.log("setting up user");
	
	var cookieUserId = $scope.getCookie("fluxUser");
	var cookieToken = $scope.getCookie("fluxToken");
	
	console.log("cookie user: "+cookieUserId+" / cookie token: "+cookieToken);
	
	if(cookieUserId != null && cookieToken != null) {
		
		API.userId = cookieUserId;
		API.authToken = cookieToken;
		
		$scope.setUser();
	
	} else {
		
		$scope.go("/front");
	
	}
	
	//$scope.setUser();
	
	
};