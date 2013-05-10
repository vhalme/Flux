function AppCtrl($scope, $routeParams, $http) {
	
	$scope.currentView = "app";
	
	$scope.refreshCounter = 0;
	$scope.currentTradeStatsId = 0;
	
	$scope.user = null; 
	
	$scope.setUser = function(user) {
		
		if(user != undefined) {
			API.userId = user.username;
			API.authToken = user.authToken;
			$scope.setCookie("fluxToken", user.authToken, 15);
			$scope.setCookie("fluxUser", user.username, 15);
			$scope.go("/tradeStats/0");
		}
		
		API.getUser(function(users) {
			
			$scope.user = users[0];
			console.log($scope.user);
			var userTabs = $scope.user.tradeStats;
			
			API.tradeStatsId = userTabs[0].id;
			//$scope.currentTradeStatsId = userTabs[0].id;
			$scope.go("/tradeStats/"+userTabs[0].id);
			
		});

		
	};
	
	$scope.deleteCurrentTab = function() {
		
		API.deleteTradeStats($scope.user.currentTradeStats, function(response) {
			
			if(response.success == 1) {
				
				var tabs = response.data;
				
				console.log(tabs);
				
				$scope.user.tradeStats = tabs;
				
				if(tabs.length > 0) {
					$scope.user.currentTradeStats = tabs[0];
					var tabId = tabs[0].id;
					API.tradeStatsId = tabId;
					$scope.go("/tradeStats/"+tabId);
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
			$scope.user.currentTradeStats.rate.sell += parseFloat(Math.random()*0.01);
			$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell + parseFloat(0.005 * Math.random());
			$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell + parseFloat(0.00025 * Math.random());
		} else {
			$scope.user.currentTradeStats.rate.sell += 0.1000;
			$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell;
			$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell;
		}
		
		API.setRate($scope.user.currentTradeStats.rate, function(response) {
			$scope.user.currentTradeStats.rate = response.data;
		});
		
		
	};
	
	
	$scope.lowerPrice = function() {
		
		var random = true;
		
		if(random) {
			var priceChange = -parseFloat(Math.random()*0.01);
			if($scope.user.currentTradeStats.rate.sell + priceChange > 0.1) {
				$scope.user.currentTradeStats.rate.sell += priceChange;
				$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell + parseFloat(0.005 * Math.random());
				$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell + parseFloat(0.00025 * Math.random());
			}
		} else {
			$scope.user.currentTradeStats.rate.sell -= 0.1000;
			$scope.user.currentTradeStats.rate.buy = $scope.user.currentTradeStats.rate.sell;
			$scope.user.currentTradeStats.rate.last = $scope.user.currentTradeStats.rate.sell;
		}
		
		API.setRate($scope.user.currentTradeStats.rate, function(response) {
			$scope.user.currentTradeStats.rate = response.data;
		});
		
	};
	
	$scope.removeFundsLeft = function() {
		
		$scope.user.currentTradeStats.fundsLeft -= 10;
	
	};
	
	$scope.addFundsLeft = function() {
		
		$scope.user.currentTradeStats.fundsLeft += 10;
	
	};
	
	$scope.removeFundsRight = function() {
		
		$scope.user.currentTradeStats.fundsRight -= 10;
	
	};
	
	$scope.addFundsRight = function() {
		
		$scope.user.currentTradeStats.fundsRight += 10;
	
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