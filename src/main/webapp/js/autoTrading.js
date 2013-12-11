controllers.controller('AutoTradingCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
	
	$scope.autoTradingCtrl.autoSettingsChanged = false;
	$scope.autoTradingCtrl.tradeDuration = 0;
	$scope.autoTradingCtrl.tradeFrequency = 100;
	
	$scope.autoTradingCtrl.saveAutoSettings = function() {
		
		console.log("Saving auto trading options...");
		
		API.saveAutoTradingOptions($scope.user.currentTradingSession.autoTradingOptions, function(response) {
			
			console.log(response);
			
			$scope.checkResponse(response);
			
			if(response.success == 1) {
				$scope.user.currentTradingSession.noChange = true;
				$scope.user.currentTradingSession.autoTradingOptions = response.data;
				console.log("options set");
				console.log($scope.user.currentTradingSession.autoTradingOptions);
				$scope.autoTradingCtrl.autoSettingsChanged = false;
				$scope.user.currentTradingSession.change = false;
				console.log("autoSettingsChanged = "+$scope.autoTradingCtrl.autoSettingsChanged);
			}
		
		});
		
	};
	
	
	$scope.autoTradingCtrl.toggleAllIn = function(allIn) {
		
		$scope.user.currentTradingSession.autoTradingOptions.allIn = allIn;
		
	};
	
	
	$scope.autoTradingCtrl.setTradeFrequency = function(value) {
		
		if(value > 80) {
			if($scope.user.currentTradingSession.autoTradingOptions.autoDuration < 20) {
				value = 80 + (-0.05+(Math.random()*0.1));
			}
		}
		
		if(value < 20) {
			if($scope.user.currentTradingSession.autoTradingOptions.autoDuration > 80) {
				value = 20 + (-0.05+(Math.random()*0.1));
			}
		}
		
		var threshold = 10-((value/100)*9);
		if((""+threshold).length > 5) {
			threshold = (threshold+"").substring(0, 5);
		}
		
		$scope.user.currentTradingSession.autoTradingOptions.autoFrequency = value;
		$("#slider-vertical2").slider("value", $scope.user.currentTradingSession.autoTradingOptions.autoFrequency);
		$scope.autoTradingCtrl.tradeFrequency = value;
		
		if($scope.user.currentTradingSession.autoTradingOptions.manualSettings == false) {
			
			$scope.user.currentTradingSession.change = true;
			
			$scope.user.currentTradingSession.autoTradingOptions.buyThreshold = threshold;
			$scope.user.currentTradingSession.autoTradingOptions.sellThreshold = threshold;
		}
		
	};
	
	
	$scope.autoTradingCtrl.setTradeDuration = function(value) {
		
		if($scope.user.currentTradingSession.fundsLeft <= 0 || $scope.user.currentTradingSession.fundsRight <= 0) {
			return;
		}
		
		if(value > 80) {
			if($scope.user.currentTradingSession.autoTradingOptions.autoFrequency < 20) {
				$scope.autoTradingCtrl.setTradeFrequency(20);
			}
		}
		
		if(value < 20) {
			if($scope.user.currentTradingSession.autoTradingOptions.autoFrequency > 80) {
				$scope.autoTradingCtrl.setTradeFrequency(80);
			}
		}
		
		var leftTotal = $scope.user.currentTradingSession.fundsLeft;
		var rightTotal = $scope.user.currentTradingSession.fundsRight * $scope.user.currentTradingSession.rate.buy;
		var total = leftTotal + rightTotal;
		var leftPart = leftTotal/total;
		var rightPart = rightTotal/total;
		
		var valueLeft = 10+(leftPart * value);
		var valueRight = 10+(rightPart * value);
		
		var sellCount = valueRight/$scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
		if(sellCount < 1) {
			sellCount = 1;
		}
		
		var buyCount = valueLeft/$scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
		if(buyCount < 1) {
			buyCount = 1;
		}
		
		var maxCount = buyCount > sellCount ? buyCount : sellCount;
		var stepCount = (sellCount + buyCount)/2;
		
		var sellChunk = $scope.user.currentTradingSession.fundsRight / stepCount;
		var buyChunk = $scope.user.currentTradingSession.fundsLeft / (stepCount * $scope.user.currentTradingSession.rate.buy);
		
		var maLong = "ema1h";
		var maShort = "ema30min";
		
		if(value < 10) {
			maLong = "ema1h";
			maShort = "ema30min";
			$scope.maDurationCaption = "Profits expected on a daily or weekly basis.";
		} else if(value >= 10 && value < 20) {
			maLong = "ema2h";
			maShort = "ema1h";
			$scope.maDurationCaption = "Profits expected on a daily or weekly basis.";
		} else if(value >= 20 && value < 30) {
			maLong = "ema4h";
			maShort = "ema2h";
			$scope.maDurationCaption = "Profits expected on a daily or weekly basis.";
		} else if(value >= 30 && value < 40) {
			maLong = "ema6h";
			maShort = "ema4h";
			$scope.maDurationCaption = "Profits expected on a daily or weekly basis.";
		} else if(value >= 40 && value < 50) {
			maLong = "ema12h";
			maShort = "ema6h";
			$scope.maDurationCaption = "Profits expected on a weekly basis.";
		} else if(value >= 50 && value < 60) {
			maLong = "ema1d";
			maShort = "ema12h";
			$scope.maDurationCaption = "Profits expected on a weekly or monthly basis.";
		} else if(value >= 60 && value < 70) {
			maLong = "ema7d";
			maShort = "ema1d";
			$scope.maDurationCaption = "Profits expected on a monthly basis.";
		} else if(value >= 70 && value < 80) {
			maLong = "ema14d";
			maShort = "ema7d";
			$scope.maDurationCaption = "Profits expected on a monthly basis.";
		} else if(value >= 80) {
			maLong = "ema1m";
			maShort = "ema14d";
			$scope.maDurationCaption = "Profits expected on a monthly or yearly basis.";
		}
		
		var range = $scope.user.currentTradingSession.rate.last * 0.5;
		var rangeBottom = $scope.user.currentTradingSession.rate.last - range;
		var rangeTop = $scope.user.currentTradingSession.rate.last + range;
		
		$scope.user.currentTradingSession.autoTradingOptions.autoDuration = value;
		$scope.autoTradingCtrl.tradeDuration = value;
		
		$("#slider-vertical1").slider("value", value);
		
		if($scope.user.currentTradingSession.autoTradingOptions.manualSettings == false) {
			
			$scope.user.currentTradingSession.change = true;
			
			$scope.user.currentTradingSession.autoTradingOptions.buyChunk = buyChunk;
			$scope.user.currentTradingSession.autoTradingOptions.sellChunk = sellChunk;
			$scope.user.currentTradingSession.autoTradingOptions.maLong = maLong;
			$scope.user.currentTradingSession.autoTradingOptions.maShort = maShort;
			
			$scope.user.currentTradingSession.autoTradingOptions.tradingRangeBottom = rangeBottom;
			$scope.user.currentTradingSession.autoTradingOptions.tradingRangeTop = rangeTop;
		
		}
		
	};
	
	$scope.autoTradingCtrl.toggleManualSettings = function() {
		
		$scope.user.currentTradingSession.change = true;
		$scope.user.currentTradingSession.autoTradingOptions.manualSettings = !$scope.user.currentTradingSession.autoTradingOptions.manualSettings;
		//$scope.setAutoRulerStyles($scope.user.currentTradingSession.autoTradingOptions.manualSettings);
		
	};
	
	$scope.autoTradingCtrl.setAutoRulerStyles = function(active) {
		if(active == true) {
			$("#slider-vertical1").slider("disable");
			$("#slider-vertical2").slider("disable");
			$(".ui-slider").css("background", "#aaaaaa");
			$(".ui-slider-range").css("background", "#aaaaaa");
			$(".ui-slider-handle").css("background", "#888888");
		} else {
			$("#slider-vertical1").slider("enable");
			$("#slider-vertical2").slider("enable");
			$(".ui-slider").css("background", "green");
			$(".ui-slider-range").css("background", "red");
			$(".ui-slider-handle").css("background", "black");
		}
	}
	
	$scope.autoTradingCtrl.updateAutoSettings = function() {
		
		if($scope.user.currentTradingSession.autoTradingOptions.manualSettings == false &&
				$scope.user.currentTradingSession.autoTradingOptions.autoTradingModel == "movingAvg") {
			return;
		}
		
		var buyThreshold = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
		var sellThreshold = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
		var buyChunk = $scope.user.currentTradingSession.autoTradingOptions.buyChunk;
		var sellChunk = $scope.user.currentTradingSession.autoTradingOptions.sellChunk;
		
		var tradeFrequency = ((100-(((buyThreshold-1)/9)*100))+(100-(((sellThreshold-1)/9)*100)))/2;
		
		var leftTotal = $scope.user.currentTradingSession.fundsLeft;
		var rightTotal = $scope.user.currentTradingSession.fundsRight * $scope.user.currentTradingSession.rate.buy;
		var total = leftTotal + rightTotal;
		var leftPart = leftTotal/total;
		var rightPart = rightTotal/total;
		
		var sellCount = $scope.user.currentTradingSession.fundsRight / (sellChunk);
		var buyCount = $scope.user.currentTradingSession.fundsLeft / ((buyChunk) * $scope.user.currentTradingSession.rate.buy);
		
		var maxCount = buyCount > sellCount ? buyCount : sellCount;
		var stepCount = (sellCount + buyCount)/2;
		
		var sellVal = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold * stepCount;
		var buyVal = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold * stepCount;
		
		var tradeDuration = (sellVal+buyVal)-20;
		
		if(tradeFrequency < 0) {
			tradeFrequency = 0;
		} else if(tradeFrequency > 100) {
			tradeFrequency = 100;
		}
		
		if(tradeDuration < 0) {
			tradeDuration = 0;
		} else if(tradeDuration > 100) {
			tradeDuration = 100;
		}
		
		$scope.user.currentTradingSession.autoTradingOptions.autoDuration = tradeDuration;
		$scope.user.currentTradingSession.autoTradingOptions.autoFrequency = tradeFrequency;
		
		$scope.autoTradingCtrl.setTradeDuration(tradeDuration);
		$scope.autoTradingCtrl.setTradeFrequency(tradeFrequency);
		
	};
	
	
	$scope.autoTradingCtrl.updateProjections = function() {
		
		var buyThreshold = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
		var sellThreshold = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
		var buyChunk = $scope.user.currentTradingSession.autoTradingOptions.buyChunk;
		var sellChunk = $scope.user.currentTradingSession.autoTradingOptions.sellChunk;
		var buyCeiling = $scope.user.currentTradingSession.autoTradingOptions.buyCeiling;
		var sellFloor = $scope.user.currentTradingSession.autoTradingOptions.sellFloor;
		var tradingRangeBottom = $scope.user.currentTradingSession.autoTradingOptions.tradingRangeBottom;
		var tradingRangeTop = $scope.user.currentTradingSession.autoTradingOptions.tradingRangeTop;
		
		console.log("updating projections");
		
		if(buyThreshold == undefined || sellThreshold == undefined || buyChunk == undefined || sellChunk == undefined || 
				buyCeiling == undefined || sellFloor == undefined) {
			console.log("insufficient data for projections");
			return;
		}
		
		var currentLastRate = $scope.user.currentTradingSession.rate.last;
		var currentBuyRate = $scope.user.currentTradingSession.rate.buy;
		var currentSellRate = $scope.user.currentTradingSession.rate.sell;
		var buyRate = currentBuyRate * (1-(buyThreshold/100));
		var sellRate = currentSellRate * (1+(sellThreshold/100));
		$scope.buySellProfit = (buyChunk*currentBuyRate)-(buyChunk*buyRate)-(0.002*2*buyChunk*currentBuyRate);
		$scope.sellBuyProfit = (sellChunk*sellRate)-(sellChunk*currentSellRate)-(0.002*2*sellChunk*currentSellRate);
		console.log("buySellP: "+$scope.buySellProfit+", sellBuyP: "+$scope.sellBuyProfit);
		if((""+$scope.buySellProfit).indexOf("e-") != -1) {
			$scope.buySellProfit = 0;
		}
		
		if((""+$scope.sellBuyProfit).indexOf("e-") != -1) {
			$scope.sellBuyProfit = 0;
		}
		
		var chunksRight = $scope.user.currentTradingSession.fundsRight/sellChunk;
		$scope.rangeRight = Math.pow(1+(sellThreshold/100), chunksRight) * currentSellRate;
		
		var rangeLeft = currentBuyRate;
		var fundsLeft = $scope.user.currentTradingSession.fundsLeft;
		
		var decr = 1-(buyThreshold/100);
		
		var minRate = currentBuyRate/100;
		
		while(fundsLeft > 0 && rangeLeft > minRate) {
			fundsLeft = fundsLeft - (buyChunk*rangeLeft);
			rangeLeft = rangeLeft*decr;
		}
		
		$scope.rangeLeft = rangeLeft;
		
		console.log("projections updated");
		
	};
	
	
	$scope.$watch('user.currentTradingSession.autoTradingOptions.tradeAuto', function(value) {
		
		if($scope.initialLoad == false && $scope.sessionLoaded == true) {
			$scope.autoTradingCtrl.saveAutoSettings();
		}
		
	}, true);


	$scope.$watch('user.currentTradingSession.autoTradingOptions', function(value) {
		
		console.log("sessionLoaded="+$scope.sessionLoaded);
		
		if((value != undefined && $scope.sessionLoaded) && 
				((!$scope.user.currentTradingSession.noChange) || $scope.user.currentTradingSession.change)) {
			
			console.log("autotrading options changed");
			
			if($scope.initialLoad == true) {
				$scope.initialLoad = false;
				return;
			}
			
			if($scope.user.currentTradingSession.autoChange == true) {
				$scope.user.currentTradingSession.autoChange = false;
				return;
			}
			
			$scope.autoTradingCtrl.autoSettingsChanged = true;
			
			var buyThreshold = $scope.user.currentTradingSession.autoTradingOptions.buyThreshold;
			var sellThreshold = $scope.user.currentTradingSession.autoTradingOptions.sellThreshold;
			var buyChunk = $scope.user.currentTradingSession.autoTradingOptions.buyChunk;
			var sellChunk = $scope.user.currentTradingSession.autoTradingOptions.sellChunk;
			var buyCeiling = $scope.user.currentTradingSession.autoTradingOptions.buyCeiling;
			var sellFloor = $scope.user.currentTradingSession.autoTradingOptions.sellFloor;
			var tradingRangeBottom = $scope.user.currentTradingSession.autoTradingOptions.tradingRangeBottom;
			var tradingRangeTop = $scope.user.currentTradingSession.autoTradingOptions.tradingRangeTop;
			var maLong = $scope.user.currentTradingSession.autoTradingOptions.maLong;
			var maShort = $scope.user.currentTradingSession.autoTradingOptions.maShort;
			
			if(buyThreshold == undefined || sellThreshold == undefined || buyChunk == undefined || sellChunk == undefined || 
					buyCeiling == undefined || sellFloor == undefined || tradingRangeBottom == undefined || 
					tradingRangeTop == undefined || maLong == undefined || maShort == undefined) {
				return;
			}
			
			$scope.autoTradingCtrl.setAutoRulerStyles($scope.user.currentTradingSession.autoTradingOptions.manualSettings);
			
			$scope.autoTradingCtrl.updateProjections();
			$scope.autoTradingCtrl.updateAutoSettings();
			
		} else {
			
			//$scope.initialLoad = false;
			//$scope.user.currentTradingSession.noChange = false;
			$scope.autoTradingCtrl.tradeDuration = $scope.user.currentTradingSession.autoTradingOptions.autoDuration;
			$scope.autoTradingCtrl.tradeFrequency = $scope.user.currentTradingSession.autoTradingOptions.autoFrequency;
			
		}
		
	}, true);
	
	
	$scope.$watch('user.currentTradingSession.rate.buy', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualBuyRate = $scope.truncate($scope.user.currentTradingSession.rate.buy, 6);
	    	$scope.autoTradingCtrl.updateProjections();
	    	//$scope.updateAutoSettings();
	    }
		
	}, true);
	
	
	$scope.$watch('user.currentTradingSession.rate.sell', function(value) {
		
		if(value != null && $scope.rateAuto) {
	    	$scope.manualSellRate = $scope.truncate($scope.user.currentTradingSession.rate.sell, 6);
	    	$scope.autoTradingCtrl.updateProjections();
	    	//$scope.updateAutoSettings();
	    }
		
	}, true);
	
	// EXTERNAL FUNCTIONS
	
	$(function() {
	    $( "#slider-vertical1" ).slider({
	      orientation: "vertical",
	      range: "min",
	      min: 0,
	      max: 100,
	      value: $scope.user.currentTradingSession.autoTradingOptions.autoDuration,
	      slide: function( event, ui ) {
			$scope.autoTradingCtrl.setTradeDuration(ui.value);
	      }
	    });
	  });
	  $(function() {
		    $( "#slider-vertical2" ).slider({
		      orientation: "vertical",
		      range: "min",
		      min: 0,
		      max: 100,
		      value: $scope.user.currentTradingSession.autoTradingOptions.autoFrequency,
		      slide: function( event, ui ) {
				$scope.autoTradingCtrl.setTradeFrequency(ui.value);
		      }
		    });
		  });  
	
}]);