controllers.controller('VerifyEmailCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
	
	$scope.status = "Verifying...";
	
	$scope.verifyEmail = function() {
		
		console.log("verify email");
		
		API.verifyEmail($routeParams.token, function(response) {
			
			console.log(response);
			
			if(response.success == 0) {
				
				$scope.status = "Could not verify e-mail address.";
			
			} else if(response.success == 1) {
				
				$scope.status = "E-mail verified successfully.";
				
			} else if(response.success == 2) {
				
				$scope.status = "This e-mail has already been verified.";
				
			}
			
		});
		
	};
	
	
	$scope.verifyEmail();
	
	
}]);