function TxLogCtrl($scope, $routeParams, $http) {
	
	$scope.buySort = $scope.buyProfit;
	$scope.buySortReverse = true;
	
	$scope.sellSort = $scope.sellProfit;
	$scope.sellSortReverse = true;
	
	$scope.buyProfitFormat = "%";
	$scope.sellProfitFormat = "%";
	
	
	$scope.cancelTrade = function(transaction) {
		
		API.cancelTransaction(transaction, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
			
			}
		
		});
		
	};
	
	
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
			$scope.createTransaction($scope.user.currentTradeStats.pair, transaction.amount, $scope.actualTradeRate(reverseType), reverseType);
		
		reverseTransaction.reversedTransaction = transaction;
		
		return reverseTransaction;
		
	};
	
	
	$scope.removeTransaction = function(transaction) {
		
		API.deleteTransaction(transaction, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.setTransactions(response.data);
			
			}
		
		});
		
	}
	
	
	$scope.buyProfit = function(buy) {
		
		var totalFeeFactor = (1-0.002)*(1-0.002);
		totalFeeFactor = totalFeeFactor*totalFeeFactor;
		
		if($scope.buyProfitFormat == "%") {
			return 100*(1-(buy.rate / ($scope.actualTradeRate("sell"))));
		} else if($scope.buyProfitFormat == "$") {
			return ((buy.amount*totalFeeFactor)*$scope.actualTradeRate("sell")) - ((buy.amount*totalFeeFactor)*buy.rate); 
		}
		
	};
	
	
	$scope.sellProfit = function(sell) {
		
		var totalFeeFactor = (1-0.002)*(1-0.002);
		totalFeeFactor = totalFeeFactor*totalFeeFactor;
		
		if($scope.sellProfitFormat == "%") {
			return 100*((sell.rate / ($scope.actualTradeRate("buy")))-1);
		} else if($scope.sellProfitFormat == "$") {
			return ((sell.amount*totalFeeFactor)*sell.rate) - ((sell.amount*totalFeeFactor)*$scope.actualTradeRate("buy")); 
		}
		
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
	
	$scope.changeProfitFormat = function(type) {
		if(type == "buy") {
			$scope.buyProfitFormat = $scope.otherProfitFormat(type);
		} else if(type == "sell") {
			$scope.sellProfitFormat = $scope.otherProfitFormat(type);
		}
	};
	
	
		
	
};
