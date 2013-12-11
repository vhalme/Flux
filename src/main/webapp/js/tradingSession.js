controllers.controller('TradingSessionCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	if($routeParams.tradingSessionId != 0) {
		$scope.currentTradingSessionId = $routeParams.tradingSessionId;
		API.tradingSessionId = $scope.currentTradingSessionId;
		$scope.sessionLoaded = false;
	}
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 15;
	
	console.log("tradingSessionId="+$scope.currentTradingSessionId);
	
	$scope.transactions = [];
	
	$scope.chart = null;
	
	$scope.autoTradingOptions = 
		[
		 	{ name: "Simple Delta", value: "simpleDelta" },
		 	{ name: "Moving Average", value: "movingAvg" }
	    ];
	
	
	$scope.ma1visible = true;
	$scope.ma2visible = true;
	
	$scope.maOptions = [ 
	        "sma10min", "ema10min", "sma30min", "ema30min", "sma1h", "ema1h", "sma2h", "ema2h", "sma4h", "ema4h", "sma6h", "ema6h",
	        "sma12h", "ema12h", "sma1d", "ema1d", "sma7d", "ema7d", "sma14d", "ema14d", "sma21d", "ema21d", "sma1m", "ema1m"
	    ];
	
	$scope.maTitles = [];
	$scope.maTitles["sma10min"] = "SMA 10 min";
	$scope.maTitles["sma30min"] = "SMA 30 min";
	$scope.maTitles["sma1h"] = "SMA 1 hour";
	$scope.maTitles["sma2h"] = "SMA 2 hours";
	$scope.maTitles["sma4h"] = "SMA 4 hours";
	$scope.maTitles["sma6h"] = "SMA 6 hours";
	$scope.maTitles["sma12h"] = "SMA 12 hours";
	$scope.maTitles["sma1d"] = "SMA 1 day";
	$scope.maTitles["sma7d"] = "SMA 7 days";
	$scope.maTitles["sma14d"] = "SMA 14 days";
	$scope.maTitles["sma21d"] = "SMA 21 days";
	$scope.maTitles["sma1m"] = "SMA 1 month";
	$scope.maTitles["ema10min"] = "EMA 10 min";
	$scope.maTitles["ema30min"] = "EMA 30 min";
	$scope.maTitles["ema1h"] = "EMA 1 hour";
	$scope.maTitles["ema2h"] = "EMA 2 hours";
	$scope.maTitles["ema4h"] = "EMA 4 hours";
	$scope.maTitles["ema6h"] = "EMA 6 hours";
	$scope.maTitles["ema12h"] = "EMA 12 hours";
	$scope.maTitles["ema1d"] = "EMA 1 day";
	$scope.maTitles["ema7d"] = "EMA 7 days";
	$scope.maTitles["ema14d"] = "EMA 14 days";
	$scope.maTitles["ema21d"] = "EMA 21 days";
	$scope.maTitles["ema1m"] = "EMA 1 month";
	$scope.maTitles["testLong"] = "TEST LONG";
	$scope.maTitles["testShort"] = "TEST SHORT";
	
	$scope.maLengths = [];
	$scope.maLengths["sma10min"] = 1;
	$scope.maLengths["sma30min"] = 2;
	$scope.maLengths["sma1h"] = 3;
	$scope.maLengths["sma2h"] = 4;
	$scope.maLengths["sma4h"] = 5;
	$scope.maLengths["sma6h"] = 6;
	$scope.maLengths["sma12h"] = 7;
	$scope.maLengths["sma1d"] = 8;
	$scope.maLengths["sma7d"] = 9;
	$scope.maLengths["sma14d"] = 10;
	$scope.maLengths["sma21d"] = 11;
	$scope.maLengths["sma1m"] = 12;
	$scope.maLengths["ema10min"] = 1;
	$scope.maLengths["ema30min"] = 2;
	$scope.maLengths["ema1h"] = 3;
	$scope.maLengths["ema2h"] = 4;
	$scope.maLengths["ema4h"] = 5;
	$scope.maLengths["ema6h"] = 6;
	$scope.maLengths["ema12h"] = 7;
	$scope.maLengths["ema1d"] = 8;
	$scope.maLengths["ema7d"] = 9;
	$scope.maLengths["ema14d"] = 10;
	$scope.maLengths["ema21d"] = 11;
	$scope.maLengths["ema1m"] = 12;
	$scope.maLengths["testLong"] = 1;
	$scope.maLengths["testShort"] = 1;
	
	$scope.rateChange = 0;
	$scope.trackManualTransactions = true;
	$scope.rateAuto = true;
	$scope.rateBuffered = true;
	
	$scope.manualRateBuffer = 0.0;
	$scope.manualBuyCurrencyRight = 0;
	$scope.manualBuyCurrencyLeft = 0;
	$scope.manualSellCurrencyRight = 0;
	$scope.manualSellCurrencyLeft = 0;
	$scope.manualSellRate = 0;
	$scope.manualBuyRate = 0;
	
	$scope.buySellProfit = 0;
	$scope.sellBuyProfit = 0;
	$scope.rangeLeft = 0;
	$scope.rangeRight = 0;
	
	$scope.sessionKeysSet = false;
	
	$scope.maDurationCaption = "...";
	$scope.initialLoad = true;
	
	$scope.serviceName = "BTC-e";
	
	console.log("init sesfunctrl");
	$scope.sessionFundsCtrl = {};
	$scope.autoTradingCtrl = {};
	
	
	$scope.start = function() {
		
		console.log("starting...");
		
		$scope.refreshInterval = 15;
		$scope.refreshCounter = $scope.refreshInterval;
		
		if($scope.user != undefined) {
			$scope.refreshErrors();
		}
		
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
				
				$("[rel=tooltip]").tooltip({ placement: 'bottom'});
				
				console.log(response);
				
				response.data.session.noChange = false;
				response.data.session.change = false;
				
				if($scope.user.currentTradingSession != undefined && $scope.user.currentTradingSession.autoTradingOptions != undefined
						&& $scope.sessionLoaded == true && $scope.initialLoad == false) {
					
					var buyChunk = undefined;
					var sellChunk = undefined;
					var rangeBottom = undefined;
					var rangeTop = undefined;
					
					if(response.data.session.autoTradingOptions.manualSettings == false && 
							($scope.user.currentTradingSession.change == false || $scope.user.currentTradingSession.change == undefined)) {
						
						response.data.session.autoChange = true;
						
						buyChunk = response.data.session.autoTradingOptions.buyChunk;
						sellChunk = response.data.session.autoTradingOptions.sellChunk;
						rangeBottom = response.data.session.autoTradingOptions.tradingRangeBottom;
						rangeTop = response.data.session.autoTradingOptions.tradingRangeTop;
					}
					
					response.data.session.autoTradingOptions = $scope.user.currentTradingSession.autoTradingOptions;
					
					if(buyChunk != undefined && sellChunk != undefined) {
						response.data.session.autoTradingOptions.buyChunk = buyChunk;
						response.data.session.autoTradingOptions.sellChunk = sellChunk;
					}
					
					if(rangeBottom != undefined && rangeTop != undefined) {
						response.data.session.autoTradingOptions.tradingRangeBottom = rangeBottom;
						response.data.session.autoTradingOptions.tradingRangeTop = rangeTop;
						console.log("TRADING RANGE SET: "+rangeBottom+"/"+rangeTop);
					}
					
				}
				
				$scope.user.currentTradingSession = response.data.session;
				
				if($scope.sessionLoaded == false) {
					
					$scope.ma1type = $scope.user.currentTradingSession.autoTradingOptions.maLong;
					$scope.ma2type = $scope.user.currentTradingSession.autoTradingOptions.maShort;
					$scope.autoTradingCtrl.updateAutoSettings();
					$scope.autoTradingCtrl.setAutoRulerStyles($scope.user.currentTradingSession.autoTradingOptions.manualSettings);
					
					var service = $scope.user.currentTradingSession.service;
					if(service == "btce") {
						$scope.serviceName = "BTC-e";
					} else if(service == "mtgox") {
						$scope.serviceName = "Mt. Gox";
					}
					
					console.log("setting session funds");
					$scope.sessionFundsCtrl.newFundsLeft = $scope.user.currentTradingSession.fundsLeft;
					$scope.sessionFundsCtrl.newFundsRight = $scope.user.currentTradingSession.fundsRight;
					
					$scope.sessionLoaded = true;
					
				}
				
				$scope.setTransactions(response.data.orders);
				
				$scope.user.accountFunds = response.data.accountFunds; //.activeFunds[$scope.user.currentTradingSession.service] = response.data.activeFunds;
				$scope.serviceFees = response.data.serviceFees;
				$scope.user.errors = response.data.userErrors;
				$scope.user.sessionErrors = response.data.sessionErrors;
				
				$scope.refreshErrors();
				
			} else {
				
				console.log(response);
			
			}
			
		});
			
	
	};
	
	
	$scope.update = function() {
		
		$scope.rateChange = $scope.user.currentTradingSession.currentRate - $scope.user.currentTradingSession.oldRate;
		
	};
	
	$scope.refreshErrors = function() {
		
		var periods = $scope.user.accountFunds.serviceProperties["payment"].properties["periods"];
		
		var currency = periods[1]["currency"];
		var method = periods[1]["method"];
		
		$scope.errors["general"] = [];
		$scope.sessionKeysSet = true;
		$scope.paymentMethodSet = true;
		$scope.okToTrade = true;
		
		var service = $scope.user.currentTradingSession.service;
		
		var apiKey = $scope.user.accountFunds.serviceProperties[service].properties['apiKey'];
		var apiSecret = $scope.user.accountFunds.serviceProperties[service].properties['apiSecret'];
		
		if(apiKey == undefined || apiKey.length == 0 || apiSecret == undefined || apiSecret.length == 0) {
			
			if(service == "btce") {
				service = "BTC-e";
			}
			
			var error = {	
				code: 3001,
				service: service
			};
			
			$scope.errors["general"].push(error);
			
			$scope.sessionKeysSet = false;
			$scope.okToTrade = false;
			
		}
				
		if(method == undefined || method.length == 0) {
			
			var error = {	
				code: 2001
			};
			
			$scope.errors["general"].push(error);
			$scope.okToTrade = false;
			$scope.paymentMethodSet = false;
			
		} else {
			
			var reserves = $scope.user.accountFunds.reserves[currency];
			
			var requiredReserves = 0;
			
			if(method == "monthly") {
				if(currency == "btc") {
					requiredReserves = 0;
				} else if(currency == "ltc") {
					requiredReserves = 0;
				} else if(currency == "usd") {
					requiredReserves = 0;
				}
			} else if(method == "profit") {
				if(currency == "btc") {
					requiredReserves = 0;
				} else if(currency == "ltc") {
					requiredReserves = 0;
				} else if(currency == "usd") {
					requiredReserves = 0;
				}
			}
			
			var missing = requiredReserves - reserves;
			$scope.missingReserves = missing;
			
			if(missing > 0) {
				
				var error = {	
					code: 2002,
					currency: currency,
					missingFunds: missing
				}
				
				$scope.errors["general"].push(error);
				$scope.okToTrade = false;
			
			}
			
		}
		
		if(($scope.user.errors != undefined && $scope.user.errors.length > 0) ||
				($scope.user.sessionErrors[service] != undefined && $scope.user.sessionErrors[service].length > 0)) {
			
			$scope.okToTrade = false;
		
		}
		
	};
	
	
	$scope.setTransactions = function(transactions) {
		
		if(transactions == undefined) {
			return;
		}
		
		var updatedTransactions = [];
		updatedTransactions["buy"] = [];
		updatedTransactions["buy"]["manual"] = [];
		updatedTransactions["buy"]["auto"] = [];
		
		updatedTransactions["sell"] = [];
		updatedTransactions["sell"]["manual"] = [];
		updatedTransactions["sell"]["auto"] = [];
		
		for(var i=0; i<transactions.length; i++) {
			updatedTransactions[transactions[i].type][transactions[i].mode].push(transactions[i]);
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
	
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == "buy") {
			return $scope.user.currentTradingSession.rate.buy - parseFloat($scope.user.currentTradingSession.autoTradingOptions.rateBuffer);
		} else if(type == "sell") {
			return $scope.user.currentTradingSession.rate.sell + parseFloat($scope.user.currentTradingSession.autoTradingOptions.rateBuffer);
		}
		
	};
	
	
	$scope.currencyRightCashout = function() {
		if($scope.user == undefined || $scope.user.currentTradingSession.fundsRight == undefined) {
			return 0;
		} else {
			return $scope.user.currentTradingSession.fundsRight + ($scope.user.currentTradingSession.fundsLeft / $scope.user.currentTradingSession.rate.buy);
		}
	};
	
	$scope.currencyLeftCashout = function() {
		if($scope.user == undefined || $scope.user.currentTradingSession.fundsLeft == undefined) {
			return 0;
		} else {
			return $scope.user.currentTradingSession.fundsLeft + ($scope.user.currentTradingSession.fundsRight * $scope.user.currentTradingSession.rate.sell);
		}
	};
	
	
	
	
	$scope.resetProfit = function(profitSide) {
	
		API.resetProfit(profitSide, function(response) {
			
			console.log(response);
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				if(profitSide == "left") {
					$scope.user.currentTradingSession.profitLeft = 0;
					$scope.user.currentTradingSession.profitLeftSince = new Date();
				} else {
					$scope.user.currentTradingSession.profitRight = 0;
					$scope.user.currentTradingSession.profitRightSince = new Date();
				}
			}
			
		});
		
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
	
	
	$scope.$watch('currentTradingSessionId', function(value) {
		
		console.log("currentTradingSessionId set: "+value);
		
		$scope.sessionLoaded = false;
		$scope.initialLoad = true;
		
		$scope.refresh();
		
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
	
	
	
}]);
