'use strict';

angular.module('properties').controller('PropertyFormController', ['$scope', '$location', 'Authentication', 'Properties', 'PropertySmartList', '$modalInstance',
	function($scope, $location, Authentication, Properties, PropertySmartList, $modalInstance) {
		var randomFixedInteger = function (length) {
			return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
		}
		$scope.authentication = Authentication;

		$scope.saveProperty = function () {
			var invalidItems = 0;
			$scope.errorPropertyName = false;

			$scope.errorEmail = false;
			if(!$scope.property.propertyName || $scope.property.propertyName == "") {
				$scope.errorPropertyName = true;
				invalidItems++;
			}
			if(!$scope.property.email || $scope.property.email == "" || !validateEmail($scope.property.email)) {
				$scope.errorEmail = true;
				invalidItems++;
			}
			$scope.property.propertyCode = randomFixedInteger(5);
			if(invalidItems == 0) {
				if($scope.add_property) {
					var property = new Properties($scope.property);
					// Redirect after save
					property.$save(function(response) {
						$modalInstance.close(response);
						alert('Property code for this property is '+$scope.property.propertyCode);
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				} else {
					var property = $scope.property;
					PropertySmartList.saveProperty(property).then(function() {
						$modalInstance.close({property: $scope.property});
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				}
			}
		};

		$scope.openPropertyManagerModalForProperty = function () {
			$modalInstance.close({manager_modal: true, property: $scope.property});
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		var validateEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};


	}
]);
