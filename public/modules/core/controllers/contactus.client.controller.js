'use strict';

angular.module('users').controller('ContactController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');
		$scope.contact = {};
		$scope.sendContactEmail = function() {
			var invalidItems = 0;
			$scope.errorEmail = false;
			$scope.errorMessage = false;

			if(!$scope.contact.email || $scope.contact.email == "" || !validateEmail($scope.contact.email)) {
				$scope.errorEmail = true;
				invalidItems++;
			}
			if(!$scope.contact.message || $scope.contact.message == "") {
				$scope.errorMessage = true;
				invalidItems++;
			}


			if(invalidItems == 0) {
				$scope.success = $scope.error = null;

				$http.post('/contact_email', $scope.contact).success(function(response) {
					// Show user success message and clear form
					$scope.contact = null;
					$scope.success = response.message;

				}).error(function(response) {
					// Show user error message and clear form
					$scope.contact = null;
					$scope.error = response.message;
				});
			}
		};

		var validateEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};
	}
]);
