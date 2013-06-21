function AccountCtrl($scope, $routeParams, $http) {
	
	$scope.btceTransferAmount;
	$scope.btceTransferCurrency = "ltc";
	
	$scope.btceAdd = true;
	$scope.mtgoxAdd = true;
	
	$scope.withdrawAddress = [];
	$scope.withdrawAmount = [];
	
	$scope.pendingTxBtc = [];
	$scope.pendingTxLtc = [];
	$scope.pendingTxUsd = [];
	$scope.pendingTxBtce = [];
	$scope.pendingTxMtgox = [];
	
	$scope.refreshIntervalId = 0;
	
	$scope.start = function() {
		
		$scope.refreshIntervalId = setInterval( function() { 
			$scope.$apply( function() {
				$scope.refreshTransactions(); 
			});
		}, 2000);
		
	};
	
	$scope.withdrawCoins = function(currency, address, amount) {
		
		console.log("withdraw "+currency+" "+amount+" to "+address);
		
		API.execCoinCommand("sendfrom", [ currency, address, amount ], function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				$scope.user.funds[currency] = response.data.funds[currency] - amount;
			}
			
		});
		
	};
	
	$scope.addUserFunds = function(currency, amount) {
		
		API.addUserFunds(currency, amount, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				$scope.user.funds[currency] = response.data.funds[currency];
			}
			
		});
		
	};
	
	
	$scope.refreshTransactions = function() {
		
		API.refreshTransactions($scope.user.accountName, "completed", function(response) {
			
			$scope.pendingTxBtc = [];
			$scope.pendingTxLtc = [];
			$scope.pendingTxUsd = [];
			$scope.pendingTxBtce = [];
			$scope.pendingTxMtgox = [];
			
			//console.log(response);
			
			for(var i=0; i<response.length; i++) {
				
				var transaction = response[i];
				transaction.dateStr = $scope.getDateString(transaction.time);
				transaction.type = transaction.type.substring(0, 1).toUpperCase()+transaction.type.substring(1);
				
				if(transaction.currency == "btc" && transaction.state == "deposited") {
					$scope.pendingTxBtc.push(transaction);
				} else if(transaction.currency == "ltc" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxLtc.push(transaction);
				} else if(transaction.currency == "usd" && transaction.state == "deposited") {
					$scope.pendingTxUsd.push(transaction);
				} else if(transaction.state == "transferReqBtce" || transaction.state == "transferBtce") {
					$scope.pendingTxBtce.push(transaction);
				} else if(transaction.state == "mtgoxReqIn" || transaction.state == "mtgoxReqOut") {
					$scope.pendingTxMtgox.push(transaction);
				}
				
			}
			
		});
		
	};
	
	$scope.transfer = function(type, amount, currency, toAddress) {
		
		console.log(type+"/"+amount+"/"+currency+" from "+$scope.user.accountName);
		
		var address = null;
		if(toAddress != undefined) {
			address = toAddress;
		}
		
		API.transferFunds(type, $scope.user.accountName, toAddress, amount, currency, function(response) {
			
			console.log(response);
			
		});
		
		
	};
	
	$scope.getDateString = function(time) {
		
		var date = new Date(time*1000);
		
		var year = date.getUTCFullYear();
		var month = date.getUTCMonth()+1;
		var day = date.getUTCDate();
		
		var hours = date.getUTCHours();
		var minutes = date.getUTCMinutes();
		
		return (""+year).substring(2)+"/"+$scope.addZero(month)+"/"+$scope.addZero(day)+
			" "+$scope.addZero(hours)+":"+$scope.addZero(minutes);
		
	};
	
	$scope.addZero = function(number) {
		if((""+number).length == 1) {
			return "0"+number;
		} else {
			return ""+number;
		}
	}
	
	$scope.$on('$destroy', function() {
        console.log("destroying interval "+$scope.refreshIntervalId);
        clearInterval($scope.refreshIntervalId);
    });
	
	$scope.start();
	
	
};