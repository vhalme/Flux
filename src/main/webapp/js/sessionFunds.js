controllers.controller('SessionFundsCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
	
	$scope.sessionFundsCtrl.fundsSettingsChanged = false;
	$scope.sessionFundsCtrl.fundsLoaded = false;
	
	$scope.sessionFundsCtrl.newFundsLeft = undefined;
	$scope.sessionFundsCtrl.newFundsRight = undefined;
	$scope.sessionFundsCtrl.oldFundsLeft = undefined;
	$scope.sessionFundsCtrl.oldFundsRight = undefined;
	
	$scope.sessionFundsCtrl.saveSessionFundsSettings = function() {
		
		console.log("Saving session funds options: "+$scope.sessionFundsCtrl.newFundsLeft+", "+$scope.sessionFundsCtrl.newFundsRight);
		
		API.setFunds($scope.sessionFundsCtrl.newFundsLeft, $scope.sessionFundsCtrl.newFundsRight, function(response) {
			
			console.log(response);
			
			if(response.success == 1) {
				
				$scope.user.accountFunds.activeFunds[$scope.user.currentTradingSession.service] = response.data;
				$scope.user.currentTradingSession.fundsLeft = $scope.sessionFundsCtrl.newFundsLeft;
				$scope.user.currentTradingSession.fundsRight = $scope.sessionFundsCtrl.newFundsRight;
				$scope.sessionFundsCtrl.fundsSettingsChanged = false;
				$scope.autoTradingCtrl.updateProjections();
				$scope.user.currentTradingSession.autoChange = true;
				$scope.autoTradingCtrl.updateAutoSettings();
			
			} else {
				
				$scope.user.accountFunds.activeFunds[$scope.user.currentTradingSession.service] = response.data;
				
				var currencyLeft = $scope.user.currentTradingSession.currencyLeft;
				var currencyRight = $scope.user.currentTradingSession.currencyRight;
				
				if(response.success == -3) {
					alert("Insufficient "+currencyLeft+" and "+currencyRight+" funds.");
				} else if(response.success == -2) {
					alert("Insufficient "+currencyRight+" funds.");
				} else if(response.success == -1) {
					alert("Insufficient "+currencyLeft+" funds.");
				}
				
			}
			
		});
		
	};
	
	
	$scope.$watch('sessionFundsCtrl.newFundsLeft', function(value) {
		
		console.log("sesload="+$scope.sessionLoaded+", "+$scope.initialLoad+" leftVal "+$scope.sessionFundsCtrl.oldFundsLeft+"=>"+value+" ("+$scope.sessionFundsCtrl+")");
		
		if($scope.sessionFundsCtrl.oldFundsLeft != undefined) {
			console.log("fundsLeft set: "+value);
			$scope.sessionFundsCtrl.fundsSettingsChanged = true;
		}
		
		$scope.sessionFundsCtrl.oldFundsLeft = value;
		
	}, true);
	
	$scope.$watch('sessionFundsCtrl.newFundsRight', function(value) {
		
		console.log("sesload="+$scope.sessionLoaded+", "+$scope.initialLoad+" rightVal "+$scope.sessionFundsCtrl.oldFundsRight+"=>"+value+" ("+$scope.sessionFundsCtrl+")");
		
		if($scope.sessionFundsCtrl.oldFundsRight != undefined) {
			console.log("fundsRight set: "+value);
			$scope.sessionFundsCtrl.fundsSettingsChanged = true;
		}
		
		$scope.sessionFundsCtrl.oldFundsRight = value;
		
	}, true);
	
	
}]);