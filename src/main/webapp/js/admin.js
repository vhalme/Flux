function AdminCtrl($scope, $routeParams, $http) {
	
	$scope.currentView = "admin";
	
	$scope.btceTxReqs = [];
	
	$scope.refresh = function() {
		
		var type = "addToBtce,returnFromBtce";
		var state = "transferReqBtce,readyTransferBtce,transferBtce";
		
		API.refreshReqTransactions(type, state, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				var result = response.data;
				
				$scope.btceTxReqs = [];
				
				var transactions = result.transactions;
				console.log(transactions);
				
				for(var i=0; i<transactions.length; i++) {
					
					var type = transactions[i].type;
					var currency = transactions[i].currency;
					
					if(!(type == "addToBtce" && currency != "usd")) {
						$scope.btceTxReqs.push(transactions[i]);
					}
				
				}
				
			}
			
		});
		
	};
	
	$scope.setTransactionState = function(id, state) {
		
		API.setTransactionState(id, state, function(response) {
			
			if(response.success == 1) {
				
				var transaction = response.data;
				
				for(var i=0; i<$scope.btceTxReqs.length; i++) {
					
					if($scope.btceTxReqs[i].id == transaction.id) {
						$scope.btceTxReqs[i] = transaction;
						return;
					}
					
				}
				
			}
			
			
		});
		
	};
	
	$scope.refresh();
	
	
};