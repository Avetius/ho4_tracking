'use strict';

angular.module('users').controller('PropertyManagerFormController', ['$scope', '$location', 'Authentication', 'PropertyManagers', '$modalInstance',
	function($scope, $location, Authentication, PropertyManagers, $modalInstance) {
		$scope.authentication = Authentication;

		$scope.savePropertyManager = function () {
			var invalidItems = 0;
			$scope.errorFirstName = false;
			$scope.errorLastName = false;
			$scope.errorEmail = false;

			if(!$scope.propertyManager.firstName || $scope.propertyManager.firstName == "") {
				$scope.errorFirstName = true;
				invalidItems++;
			}
			if(!$scope.propertyManager.lastName || $scope.propertyManager.lastName == "") {
				$scope.errorLastName = true;
				invalidItems++;
			}
			if(!$scope.propertyManager.email || $scope.propertyManager.email == "" || !validateEmail($scope.propertyManager.email)) {
				$scope.errorEmail = true;
				invalidItems++;
			}
			if(invalidItems == 0) {
				if($scope.add_property_manager) {
					PropertyManagers.addPropertyManager($scope.propertyManager).then(function(response) {
						$modalInstance.close(response);
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				} else {
					PropertyManagers.savePropertyManager($scope.propertyManager).then(function() {
						$modalInstance.close({propertyManager: $scope.propertyManager});
					}, function(errorResponse) {
						$scope.error = errorResponse;
					});
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.assignNewProperty = function(newProperty) {
			if(!$scope.propertyManager.assigned_properties) $scope.propertyManager.assigned_properties = [];
			$scope.propertyManager.assigned_properties.pushIfNotExist(newProperty, function(e) {
				return e._id === newProperty._id;
			});
		};

		$scope.removeAssignedProperty = function(assigned_property, index) {
			$scope.propertyManager.assigned_properties.splice(index, 1);
		};

		var validateEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};

		Array.prototype.inArray = function(comparer) {
			for(var i=0; i < this.length; i++) {
				if(comparer(this[i])) return true;
			}
			return false;
		};

		Array.prototype.pushIfNotExist = function(element, comparer) {
			if (!this.inArray(comparer)) {
				this.push(element);
			}
		};
	}
]);
