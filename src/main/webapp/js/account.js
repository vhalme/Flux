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
	
	$scope.editBtceKey = false;
	$scope.editBtceSecret = false;
	
	$scope.setNextMethod = $scope.user.accountFunds.serviceProperties["payment"].properties["nextMethod"];
	$scope.setNextCurrency = $scope.user.accountFunds.serviceProperties["payment"].properties["nextCurrency"];
	$scope.showCurrency = "btc";
	
	$scope.start = function() {
		
		$scope.refreshIntervalId = setInterval( function() { 
			$scope.$apply( function() {
				$scope.refreshTransactions(); 
			});
		}, 2000);
		
	};
	
	
	$scope.refreshTransactions = function() {
		
		API.refreshTransactions($scope.user.accountFunds.accountName, "completed", function(response) {
			
			
			$scope.pendingTxBtc = [];
			$scope.pendingTxLtc = [];
			$scope.pendingTxUsd = [];
			$scope.pendingTxBtce = [];
			$scope.pendingTxMtgox = [];
			
			console.log(response);
			
			var result = response.data;
			
			var transactions = result.transactions;
			
			for(var i=0; i<transactions.length; i++) {
				
				var transaction = transactions[i];
				transaction.dateStr = $scope.getDateString(transaction.time);
				transaction.type = transaction.type.substring(0, 1).toUpperCase()+transaction.type.substring(1);
				
				if(transaction.currency == "btc" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxBtc.push(transaction);
				} else if(transaction.currency == "ltc" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxLtc.push(transaction);
				} else if(transaction.currency == "usd" && 
						(transaction.state == "deposited" || transaction.type == "Withdrawal")) {
					$scope.pendingTxUsd.push(transaction);
				} else if(transaction.state == "transferReqBtce" || transaction.state == "readyTransferBtce" || transaction.state == "transferBtce") {
					$scope.pendingTxBtce.push(transaction);
				} else if(transaction.state == "mtgoxReqIn" || transaction.state == "mtgoxReqOut") {
					$scope.pendingTxMtgox.push(transaction);
				}
				
			}
			
			
			$scope.user.accountFunds.reserves = result.reserves;
			$scope.user.accountFunds.activeFunds = result.activeFunds;
			
			
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
			
			if(response.success == 1) {
				
			} else {
				alert("Failed to transfer funds. Error message: "+response.message);
			}
			
		});
		
		
	};
	
	$scope.gotoOkpayPayment = function() {
		
		var date = new Date();
		var invoice = date.getTime()+"_"+$scope.user.accountFunds.accountName;
		var url = "https://www.okpay.com/process.html?ok_receiver=OK990732954&ok_item_1_name=Add+USD&ok_currency=USD&ok_item_1_type=service&ok_invoice="+invoice;
		
		location.href = url;
		
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
	
	$scope.setServiceProperties = function(service, propertyMap) {
		
		API.setServiceProperties(service, propertyMap, function(response) {
			
			console.log(response);
			
			if(response.success > 0) {
				
				$scope.user.accountFunds.serviceProperties[service] = response.data;
				
				if(service == "btce") {
					$scope.editBtceKey = false;
					$scope.editBtceSecret = false;
				}
			
			}
			
		});

	};
	
	$scope.setServiceProperty = function(service, key, value) {
		
		console.log("set "+key+"="+value+" for "+service);
		
		var propertyMap = {
			properties : {}
		};
		
		propertyMap.properties[key] = value;
		
		$scope.setServiceProperties(service, propertyMap);
		
	};
	
	$scope.setNextPaymentMethod = function() {
		
		console.log("set next payment mehod: "+$scope.setNextMethod+"/"+$scope.setNextCurrency);
		
		var propertyMap = {
			properties : {}
		};
		
		propertyMap.properties["nextMethod"] = $scope.setNextMethod;
		propertyMap.properties["nextCurrency"] = $scope.setNextCurrency;
		
		$scope.setServiceProperties("payment", propertyMap);
		
	};
	
	$scope.$on('$destroy', function() {
        console.log("destroying interval "+$scope.refreshIntervalId);
        clearInterval($scope.refreshIntervalId);
    });
	
	$scope.start();
	
	Holder.run({images:".img", nocss:true});
	
	
};