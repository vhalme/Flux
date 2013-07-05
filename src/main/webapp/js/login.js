function LoginCtrl($scope, $routeParams, $http) {
	
	$scope.username = undefined;
	
	$scope.password = undefined;
	$scope.passwordHidden = true;
	
	$scope.login = function() {
		
		console.log("try to log in user "+$scope.email);
		
		API.login($scope.username, $scope.username, $scope.password, function(response) {
			
			response = angular.fromJson(response);
			
			console.log(response);
			console.log(typeof(response)+" success="+response.success+"("+typeof(response.success)+")");
			
			if(response.success > 0) {
				console.log("call setUser");
				$scope.setUser(response.data);
			}
			
		});
		
	};
	
	
};