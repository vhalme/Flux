function LoginCtrl($scope, $routeParams, $http) {
	
	$scope.email = undefined;
	
	$scope.password = undefined;
	
	$scope.login = function() {
		
		API.login($scope.email, $scope.password, function(response) {
			
			console.log(response);
			
			if(response.success > 0) {
				$scope.setUser(response.data);
			}
			
		});
		
	};
	
	
};