var live = true;

function AppCtrl($scope, $routeParams, $http) {
	
	$scope.intervalIds = { main: 0, loop: 0 };
	
	$scope.refreshInterval = 1;
	$scope.refreshCounter = 0;
	
	$scope.transactions = [];
	
	$scope.user = {
		
		uninitialized: true,
		
		tradeAuto: false,
		autoTradingModel: null,
		
		profitUsd: 0,
		
		usd: 0,
		ltc: 0,
		
		currentRate: 2.5,
		oldRate: 2.5,
		currentBuyRate: 2.5,
		currentSellRate: 2.5,
		
		profitTarget: 0,
		rateBuffer: 0,
		tradeChunk: 0,
		buyCeiling: 0,
		sellFloor: 0
		
	};
	
	$scope.selectedUser = "testUser123";
	
	$scope.availableUsers =
		[
		 
		 	"testUser123",
		 	"testUser456"
		 
		];
	
	$scope.autoTradingOptions = 
		[
		 	{ name: "Accumulate USD", value: "accumulateUsd" }
	    ];
	
	$scope.unusedUsd = 0;
	$scope.unusedLtc = 0;
	
	$scope.rateChange = 0;
	$scope.cashoutRate = 1;
	
	$scope.trackManualTransactions = true;
	$scope.rateAuto = true;
	$scope.rateBuffered = true;
	$scope.buyLtc = 0;
	$scope.buyUsd = 0;
	$scope.sellLtc = 0;
	$scope.sellUsd = 0;
	$scope.manualSellRate = 0;
	$scope.manualBuyRate = 0;
	
	
	$scope.start = function() {
		
		console.log("starting...");
			
		$scope.refreshInterval = 15;
		$scope.refresh();
		
		$scope.intervalIds.counter = setInterval( function() { 
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
	
	$scope.stop = function() {
		
		console.log("stopping...");
		
		clearInterval($scope.intervalIds.counter);
		clearInterval($scope.intervalIds.loop);
		
	}
	
	$scope.loop = function() {
		
		if(live) {
			$scope.refresh();
		} else {
			$scope.update();
		}

	};
	
	$scope.refresh = function() {
		
		if(live) {
			$scope.refreshCounter = $scope.refreshInterval;
		}
		
		API.getInfo(function(response) {
			
			if(response.success == 1) {
				
				$scope.user = response.data;
				
				if($scope.user.live) {
				
					API.getRates(function(response) {
					
						//$scope.user.currentRate = response.data.last;
						//$scope.user.currentBuyRate = response.data.buy;
						//$scope.user.currentSellRate = response.data.sell;
						
						/*
						if($scope.user.oldRate == 0) {
							$scope.user.oldRate = $scope.user.currentRate;
						}
						*/
						
						API.getTransactions(function(transactions) {
							
							$scope.setTransactions(transactions);
							$scope.update();
							
						});
						
					});
				
				} else {
					
					API.getTransactions(function(transactions) {
						
						$scope.setTransactions(transactions);
						$scope.update();
						
					});
					
				}
			
			} else {
				
				console.log(response);
			
			}
			
		});
			
	
	};
	
	
	$scope.setTransactions = function(transactions) {
		
		$scope.transactions["buy"] = [];
		$scope.transactions["sell"] = [];
		
		for(var i=0; i<transactions.length; i++) {
			$scope.transactions[transactions[i].type].push(transactions[i]);
		}
		
	}
	
	$scope.update = function() {
	
		if(!live) {
			$scope.refreshCounter = $scope.refreshInterval;
		}
		
		$scope.rateChange = $scope.user.currentRate - $scope.user.oldRate;
		//console.log($scope.user.currentRate+" - "+$scope.user.oldRate+" = "+$scope.rateChange);
			
	};
	
	
	$scope.manualTransaction = function(type) {
		
		var amount;
		var rate;
		
		if(type == "buy") {
			rate = $scope.manualBuyRate;
			amount = $scope.buyLtc;
		} else if(type == "sell") {
			rate = $scope.manualSellRate;
			amount = $scope.sellLtc;
		}
		
		var transaction = $scope.createTransaction("ltc_usd", amount, rate, type);
		transaction.save = $scope.trackManualTransactions;
		
		$scope.performTransaction(transaction, function() {
			
		});
		
	}
	
	$scope.reverseTrade = function(transaction, save) {
		
		console.log("reverse trading...");
		
		var reverseTransaction = $scope.createReverseTransaction(transaction);
		reverseTransaction.save = save;
		
		$scope.performTransaction(reverseTransaction, function() {
			
		});
		
		
	};
	
	
	$scope.createReverseTransaction = function(transaction) {
		
		var reverseType;
		
		if(transaction.type == "sell") {
			reverseType = "buy";
		} else if(transaction.type == "buy") {
			reverseType = "sell";
		}
		
		console.log("REVERSED TYPE TO "+reverseType);
		
		var reverseTransaction = 
			$scope.createTransaction("ltc_usd", transaction.amount, $scope.actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.reverseTransaction = transaction;
		
		return reverseTransaction;
		
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
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
				
				performed();
			
			}
		
		});
			
			
	};
	
	
	$scope.removeTransaction = function(transaction) {
		
		API.deleteTransaction(transaction, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
			
			}
		
		});
		
	}
	
	
	$scope.changeProfitFormat = function(type) {
		if(type == "buy") {
			$scope.buyProfitFormat = $scope.otherProfitFormat(type);
		} else if(type == "sell") {
			$scope.sellProfitFormat = $scope.otherProfitFormat(type);
		}
	}
	
	/* Calculated properties */
	
	$scope.actualTradeRate = function(type) {
		
		if(type == "buy") {
			return $scope.user.currentBuyRate - parseFloat($scope.user.rateBuffer);
		} else if(type == "sell") {
			return $scope.user.currentSellRate + parseFloat($scope.user.rateBuffer);
		}
		
	}
	
	$scope.buyProfit = function(buy) {
		
		var totalFeeFactor = (1-0.002)*(1-0.002);
		
		if($scope.buyProfitFormat == "%") {
			return 100*(1-(buy.rate / ($scope.actualTradeRate("sell"))));
		} else if($scope.buyProfitFormat == "$") {
			return ((buy.amount*totalFeeFactor)*$scope.actualTradeRate("sell")) - ((buy.amount*totalFeeFactor)*buy.rate); 
		}
		
	};
	
	$scope.sellProfit = function(sell) {
		
		var totalFeeFactor = (1-0.002)*(1-0.002);
		
		if($scope.sellProfitFormat == "%") {
			return 100*((sell.rate / ($scope.actualTradeRate("buy")))-1);
		} else if($scope.sellProfitFormat == "$") {
			return ((sell.amount*totalFeeFactor)*sell.rate) - ((sell.amount*totalFeeFactor)*$scope.actualTradeRate("buy")); 
		}
		
	};
	
	
	$scope.ltcCashout = function() {
		return $scope.user.ltc + ($scope.user.usd / $scope.actualTradeRate("buy"));
	};
	
	$scope.usdCashout = function() {
		return $scope.user.usd + ($scope.user.ltc * $scope.actualTradeRate("sell"));
	};
	
	$scope.fixedLtcCashout = function() {
		return $scope.user.ltc + ($scope.user.usd / $scope.cashoutRate);
	};
	
	$scope.fixedUsdCashout = function() {
		return $scope.user.usd + ($scope.user.ltc * $scope.cashoutRate);
	};
	
	$scope.otherProfitFormat = function(type) {
		
		var profitFormat;
		
		if(type == "buy") {
			profitFormat = $scope.buyProfitFormat;
		} else if(type == "sell") {
			profitFormat = $scope.sellProfitFormat;
		}
		
		if(profitFormat == "$") {
			return "%";
		} else if(profitFormat == "%") {
			return "$";
		}
		
	};
	
	
	/* Test mode methods */
	
	$scope.raisePrice = function() {
		
		var random = true;
		
		if(random) {
			$scope.user.currentSellRate += parseFloat(Math.random()*0.01);
			$scope.user.currentBuyRate = $scope.user.currentSellRate + parseFloat(0.005 * Math.random());
			$scope.user.currentRate = $scope.user.currentSellRate + parseFloat(0.00025 * Math.random());
		} else {
			$scope.user.currentSellRate += 0.1000;
			$scope.user.currentBuyRate = $scope.user.currentSellRate;
			$scope.user.currentRate = $scope.user.currentSellRate;
		}
		
		/*
		API.setRate($scope.user.currentRate, function(user) {
			//$scope.user = user;
		});
		*/
		
	};
		
	$scope.lowerPrice = function() {
		
		var random = true;
		
		if(random) {
			var priceChange = -parseFloat(Math.random()*0.01);
			if($scope.user.currentSellRate + priceChange > 0.1) {
				$scope.user.currentSellRate += priceChange;
				$scope.user.currentBuyRate = $scope.user.currentSellRate + parseFloat(0.005 * Math.random());
				$scope.user.currentRate = $scope.user.currentSellRate + parseFloat(0.00025 * Math.random());
			}
		} else {
			$scope.user.currentSellRate -= 0.1000;
			$scope.user.currentBuyRate = $scope.user.currentSellRate;
			$scope.user.currentRate = $scope.user.currentSellRate;
		}
		
		/*
		API.setRate($scope.user.currentRate, function(user) {
			//$scope.user = user;
		});
		*/
		
	};
	
	$scope.removeMoney = function() {
		
		API.changeFunds("usd", -10, function(user) {});
	
	};
	
	$scope.addMoney = function() {
		
		API.changeFunds("usd", 10, function() {});
	
	};
	
	$scope.removeCoins = function() {
		
		API.changeFunds("ltc", -10, function() {});
	
	};
	
	$scope.addCoins = function() {
		
		API.changeFunds("ltc", 10, function() {});
	
	};
	
	
	/* Variable properties */
	
	$scope.showAutoTrading = true;
	$scope.showManualTrading = true;
	$scope.showGraphs = false;
	
	$scope.buySort = $scope.buyProfit;
	$scope.buySortReverse = true;
	
	$scope.sellSort = $scope.sellProfit;
	$scope.sellSortReverse = true;
	
	$scope.buyProfitFormat = "%";
	$scope.sellProfitFormat = "%";
	
	
	
	/* Watchers */
	
	$scope.firstPassConvert = true;
	$scope.firstPassDetails = true;
	
	$scope.$watch('buyLtc', function(value) {
		
		console.log("changed buyLtc: "+value+" first pass: "+$scope.firstPassConvert);
		
	    if(value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var usd = $scope.truncate(parseFloat(value)*$scope.manualBuyRate, 6);
	    		$scope.buyUsd = usd;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('buyUsd', function(value) {
		
		if(value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var ltc = $scope.truncate(parseFloat(value)/$scope.manualBuyRate, 6);
				$scope.buyLtc = ltc;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	$scope.$watch('sellLtc', function(value) {
		
	    if (value && value !== '' && value !== '0') {
	    	
	    	if($scope.firstPassConvert) {
	    		$scope.firstPassConvert = false;
	    		var usd = $scope.truncate(parseFloat(value)*$scope.manualSellRate, 6);
	    		$scope.sellUsd = usd;
	    	} else {
	    		$scope.firstPassConvert = true;
	    	}
	    	
	    }
	}, true);
	
	$scope.$watch('sellUsd', function(value) {
		
		if (value && value !== '' && value !== '0') {
		
			if($scope.firstPassConvert) {
				$scope.firstPassConvert = false;
				var ltc = $scope.truncate(parseFloat(value)/$scope.manualSellRate, 6);
				$scope.sellLtc = ltc;
			} else {
				$scope.firstPassConvert = true;
			}
			
		}
    	
	}, true);
	
	$scope.$watch('user.currentBuyRate', function(value) {
		
		if($scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.user.currentBuyRate, 6);
	    }
		
	}, true);
	
	$scope.$watch('user.currentSellRate', function(value) {
		
		if($scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.user.currentSellRate, 6);
	    }
		
	}, true);
	
	$scope.$watch('user', function(value) {
		
		if(!value.uninitialized) {
			
			API.saveUserDetails(value, function(response) {
				$scope.user = response;
			});
			
		}
		
	}, true);
	
	
	$scope.$watch('selectedUser', function(value) {
				
		console.log("user changed to "+value);
			
		API.userId = value;
		
	}, true);
	
	$scope.truncate = function(val, length) {
		
		val = ""+val;
		
		if(val.length > length) {
			val = val.substring(0, length);
		}
		
		return parseFloat(val);
		
	}
	
	
	
};

var myApp = angular.module('myApp', ['filters']);

angular.module('filters', []).filter('truncate', function () {
    
	return function (text, length, end) {
		
		text = ""+text;
		
		if(isNaN(length))
			length = 10;

        if(end === undefined)
        	end = "...";

        if(text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length-end.length) + end;
        }

    };
});

myApp.directive('customstyle', function () {
	
	return {
		
		restrict: 'AC',
		link: function (scope, element, attrs) {          
			
			console.log(attrs);
			console.log(attrs.myWidth);
			element.css('width', attrs.myWidth);
			
			scope.$watch(attrs.myWidth, function(value) {     
				console.log("myWidth: "+value);
				element.css('width', (value*100)+'%');            
			});
			
		}
		
   }
	
});