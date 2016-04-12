'use strict';

angular.module('properties').controller('PropertyFormController', ['$scope', '$location', 'Authentication', 'Properties', 'PropertySmartList', '$modalInstance',
	function($scope, $location, Authentication, Properties, PropertySmartList, $modalInstance) {
		$scope.authentication = Authentication;

		$scope.saveProperty = function () {
			var invalidItems = 0;
			$scope.errorPropertyName = false;
			$scope.errorPropertyId = false;

			if(!$scope.property.propertyName || $scope.property.propertyName == "") {
				$scope.errorPropertyName = true;
				invalidItems++;
			}
			if(!$scope.property.propertyId || $scope.property.propertyId == "") {
				$scope.errorPropertyId = true;
				invalidItems++;
			}

			if(invalidItems == 0) {
				if($scope.add_property) {
					var property = new Properties($scope.property);
					if($scope.authentication.user.roles.indexOf('admin')>-1) {
						property.propertyManager = $scope.property_manager._id;
					}
					// Redirect after save
					property.$save(function(response) {
						$modalInstance.close(response);
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

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		var validateEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};
	}
]);
