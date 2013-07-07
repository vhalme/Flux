function LoginCtrl($scope, $routeParams, $http) {
	
	$scope.username = "";
	
	$scope.password = undefined;
	$scope.passwordHidden = true;
	
	$scope.registration = false;
	
	$scope.login = function(register) {
		
		console.log("try to log in user "+$scope.email);
		
		$scope.errors["login"] = undefined;
		
		API.login($scope.username, $scope.username, $scope.password, register, function(response) {
			
			response = angular.fromJson(response);
			
			console.log(response);
			console.log(typeof(response)+" success="+response.success+"("+typeof(response.success)+")");
			
			if(response.success > 0) {
				
				if(response.success == 2) {
					
					$scope.registration = true;
				
				} else if(response.success == 3 || response.success == 1) {
				
					console.log("call setUser");
					$scope.setUser(response.data);
			
				}
				
			} else {
				
				var error = {
					message: "Log-In Failed. "+response.message,
					code: response.success,
				}
				
				$scope.errors["login"] = error;
				
			}
			
		});
		
	};
	
	
};