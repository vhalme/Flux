function AppCtrl($scope, $routeParams, $http) {
	
	$scope.refreshCounter = 0;
	$scope.currentTradeStatsId = 0;
	
	
	$scope.user = {
		
		uninitialized: true,
		
		currentTradeStats: {
			
			rate: {
				buy: 0,
				sell: 0,
				last: 0
			},
			
			uninitialized: true,
			
			live: false,
			currencyLeft: "usd",
			currencyRight: "ltc",
		
		}
		
	};
	
	$scope.newCurrencyPair = "ltc_usd";
	
	$scope.addTab = function() {
		
		API.addTradeStats($scope.newCurrencyPair, function(newTradeStats) {
			console.log(angular.fromJson(newTradeStats));
			$scope.user.tradeStats.push(angular.fromJson(newTradeStats));
		});
		
	};
	
	$scope.setUser = function() {
		
		API.getUser(function(users) {
			
			$scope.user = users[0];
			console.log($scope.user);
			var userTabs = $scope.user.tradeStats;
			
			$scope.go("/tradeStats/"+userTabs[0].id);
			
		});

		
	};
	
	$scope.changeToTestUser = function() {
		
		if(API.userId != "testUser123") {
			API.tradeStatsId = null;
		}
		
		console.log("user changed from "+API.userId+" to testuser123");
		
		API.userId = "testUser123";
		
		$scope.setUser();
		
		
	};
	
	$scope.changeToLiveUser = function() {
		
		if(API.userId != "testUser456") {
			API.tradeStatsId = null;
		}
		
		console.log("user changed from "+API.userId+" to testuser456");
		
		API.userId = "testUser456";
		
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
	
	
	console.log("setting up user");
	
	$scope.setUser();
	
	
};