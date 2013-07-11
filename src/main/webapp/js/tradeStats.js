function TradingSessionCtrl($scope, $routeParams, $http) {
	
	if($routeParams.tradingSessionId != 0) {
		$scope.currentTradingSessionId = $routeParams.tradingSessionId;
		API.tradingSessionId = $scope.currentTradingSessionId;
	}
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 15;
	
	console.log("tradingSessionId="+$scope.currenTradingSessionId);
	
	$scope.transactions = [];
	
	$scope.chart = null;
	
	$scope.autoTradingOptions = 
		[
		 	{ name: "Accumulate USD", value: "accumulateUsd" }
	    ];
	
	$scope.rateChange = 0;
	
	$scope.trackManualTransactions = true;
	$scope.rateAuto = true;
	$scope.rateBuffered = true;
	$scope.manualRateBuffer = 0.001;
	$scope.manualBuyCurrencyRight = 0;
	$scope.manualBuyCurrencyLeft = 0;
	$scope.manualSellCurrencyRight = 0;
	$scope.manualSellCurrencyLeft = 0;
	$scope.manualSellRate = 0;
	$scope.manualBuyRate = 0;
	
	$scope.newFundsLeft = undefined;
	$scope.newFundsRight = undefined;
	
	
	
	$scope.start = function() {
		
		console.log("starting...");
		
		$scope.refreshInterval = 15;
		$scope.refreshCounter = $scope.refreshInterval;
		
		//$scope.refresh();
		
		$scope.intervalIds.main = setInterval( function() { 
			$scope.$apply( function() {
				$scope.refreshCounter--; 
			});
		}, 1000);
		
		$scope.intervalIds.loop = setInterval( function() { 
			$scope.$apply( function() {
				$scope.loop();
			});
		}, $scope.refreshInterval*1000);
		
		
	
	};
	
	
	$scope.loop = function() {
		
		$scope.refresh();
		
	};
	
	$scope.refresh = function() {
		
		$scope.refreshCounter = $scope.refreshInterval;
		
		$scope.chart = null;
		
		API.refreshTradingSession(function(response) {
			
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				
				console.log(response);
				
				$scope.user.currentTradingSession = response.data.session;
				
				/*
				$scope.user.currentTradingSession.fundsLeft = response.data.fundsLeft;
				$scope.user.currentTradingSession.fundsRight = response.data.fundsRight;
				$scope.user.currentTradingSession.profitLeft = response.data.profitLeft;
				$scope.user.currentTradingSession.profitRight = response.data.profitRight;
				$scope.user.currentTradingSession.rate = response.data.rate;
				*/
				
				$scope.setTransactions(response.data.orders);
				
			} else {
				
				console.log(response);
			
			}
			
		});
			
	
	};
	
	
	$scope.update = function() {
		
		$scope.rateChange = $scope.user.currentTradingSession.currentRate - $scope.user.currentTradingSession.oldRate;
		
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
	
	
	$scope.setTransactions = function(transactions) {
		
		if(transactions == undefined) {
			return;
		}
		
		var updatedTransactions = [];
		updatedTransactions["buy"] = [];
		updatedTransactions["sell"] = [];
		
		for(var i=0; i<transactions.length; i++) {
			updatedTransactions[transactions[i].type].push(transactions[i]);
		}
		
		$scope.transactions = updatedTransactions;
		
	};
	

	$scope.manualTransaction = function(type) {
		
		var amount;
		var rate;
		
		if(type == "buy") {
			rate = $scope.manualBuyRate;
			amount = $scope.manualBuyCurrencyRight;
		} else if(type == "sell") {
			rate = $scope.manualSellRate;
			amount = $scope.manualSellCurrencyRight;
		}
		
		if(rate == undefined || amount == undefined) {
			return;
		}
		
		var transaction = $scope.createTransaction($scope.user.currentTradingSession.pair, amount, rate, type);
		transaction.save = $scope.trackManualTransactions;
		
		$scope.performTransaction(transaction, function() {
			
		});
		
	};
	
	
	$scope.createTransaction = function(pair, amount, rate, type) {
		
		var transaction = { 
				
				time: (new Date()).getTime(),
				pair: pair,
				rate: rate, 
				amount: amount,
				type: type
		
		};
		
		return transaction;
		
	};
	
	
	$scope.performTransaction = function(transaction, performed) {
		
		API.postTransaction(transaction, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
				
				performed();
			
			} else {
				
				var error = {
						message: response.message,
						code: response.success
				};
				
				$scope.errors["orders"] = error;
				
			}
		
		});
			
			
	};
	
	$scope.setFundsLeft = function() {
		
		API.setFunds($scope.user.currentTradingSession.fundsLeft, null, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				$scope.user.activeFunds[$scope.user.currentTradingSession.service] = response.data;
			} else {
				var sFunds = response.data.split("_");
				$scope.user.currentTradingSession.fundsLeft = parseFloat(sFunds[0]);
				alert(response.message);
			}
		});
		
	};
	
	$scope.setFundsRight = function() {
		
		API.setFunds(null, $scope.user.currentTradingSession.fundsRight, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				$scope.user.activeFunds[$scope.user.currentTradingSession.service] = response.data;
			} else {
				var sFunds = response.data.split("_");
				$scope.user.currentTradingSession.fundsRight = parseFloat(sFunds[1]);
				$scope.user.activeFunds[$scope.user.currentTradingSession.service] = response.data;
				alert(response.message);
			}
		});
		
	};
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == "buy") {
			return $scope.user.currentTradingSession.rate.buy - parseFloat($scope.user.currentTradingSession.autoTradingOptions.rateBuffer);
		} else if(type == "sell") {
			return $scope.user.currentTradingSession.rate.sell + parseFloat($scope.user.currentTradingSession.autoTradingOptions.rateBuffer);
		}
		
	};
	
	
	$scope.currencyRightCashout = function() {
		return $scope.user.currentTradingSession.fundsRight + ($scope.user.currentTradingSession.fundsLeft / $scope.user.currentTradingSession.rate.buy);
	};
	
	$scope.currencyLeftCashout = function() {
		return $scope.user.currentTradingSession.fundsLeft + ($scope.user.currentTradingSession.fundsRight * $scope.user.currentTradingSession.rate.sell);
	};
	
	
	/* Variable properties */
	
	$scope.showSessionFunds = true;
	$scope.showAutoTrading = true;
	$scope.showManualTrading = true;
	$scope.showGraphs = true;
	
	/* Watchers */
	
	$scope.firstPassConvert = true;
	$scope.firstPassDetails = true;
	
	$scope.$watch('manualBuyCurrencyRight', function(value) {
		
		//console.log(value);
		
	    if(value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var fundsLeft = $scope.truncate(parseFloat(value)*$scope.manualBuyRate, 6);
	    		$scope.manualBuyCurrencyLeft = fundsLeft;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('manualBuyCurrencyLeft', function(value) {
		
		if(value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var fundsRight = $scope.truncate(parseFloat(value)/$scope.manualBuyRate, 6);
				$scope.manualBuyCurrencyRight = fundsRight;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	$scope.$watch('manualSellCurrencyRight', function(value) {
		
	    if (value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var fundsLeft = $scope.truncate(parseFloat(value)*$scope.manualSellRate, 6);
	    		$scope.manualSellCurrencyLeft = fundsLeft;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('manualSellCurrencyLeft', function(value) {
		
		if (value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var fundsRight = $scope.truncate(parseFloat(value)/$scope.manualSellRate, 6);
				$scope.manualSellCurrencyRight = fundsRight;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	
	$scope.$watch('user.currentTradingSession.rate.buy', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.user.currentTradingSession.rate.buy, 6);
	    }
		
	}, true);
	
	$scope.$watch('user.currentTradingSession.rate.sell', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.user.currentTradingSession.rate.sell, 6);
	    }
		
	}, true);
	
	
	$scope.$watch('user.currentTradingSession.autoTradingOptions', function(value) {
		
		if(value != null) {
			
			console.log("autotrading options changed");
			
			var buyThreshold = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
			var sellThreshold = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
			var buyChunk = $scope.user.currentTradingSession.autoTradingOptions.buyChunk;
			var sellChunk = $scope.user.currentTradingSession.autoTradingOptions.sellChunk;
			var buyCeiling = $scope.user.currentTradingSession.autoTradingOptions.buyCeiling;
			var sellFloor = $scope.user.currentTradingSession.autoTradingOptions.sellFloor;
			
			if(buyThreshold == undefined || sellThreshold == undefined || buyChunk == undefined || sellChunk == undefined || 
					buyCeiling == undefined | sellFloor == undefined) {
				return;
			}
			
			API.saveAutoTradingOptions(value, function(response) {
				
				console.log(response);
				
				$scope.checkResponse(response);
				
				if(response.success == 1) {
					$scope.user.currentTradingSession.autoTradingOptions = response.data;
				}
			
			});
			
			
		}
		
	}, true);
	
	
	$scope.$watch('currentTradingSessionId', function(value) {
		
		console.log("currentTradingSessionId set: "+value);
		
		API.getTradingSession(function(response) {
			
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				console.log(response.data);
				$scope.user.currentTradingSession = response.data;
				$scope.refresh();
			} else {
				console.log(response);		
			}
			
		});
		
	}, true);
	
	$scope.$watch('user.currentTradingSession.fundsLeft', function(value) {
		
		console.log("fundsLeft set: "+value);
		
		$scope.setFundsLeft();
		
	}, true);
	
	$scope.$watch('user.currentTradingSession.fundsRight', function(value) {
		
		console.log("fundsRight set: "+value);
		
		$scope.setFundsRight();
		
	}, true);
	
	
	$scope.truncate = function(val, length) {
		
		val = ""+val;
		
		if(val.length > length) {
			val = val.substring(0, length);
		}
		
		return parseFloat(val);
		
	};
		
	$scope.$on('$destroy', function() {
        console.log("destroying intervals: "+$scope.intervalIds);
        clearInterval($scope.intervalIds.main);
        clearInterval($scope.intervalIds.loop);
    });
	
	$scope.start();
	
	
};
