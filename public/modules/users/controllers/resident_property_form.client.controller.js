'use strict';

angular.module('users').controller('ResidentPropertyFormController', ['$scope', '$location', 'Authentication', 'Residents', '$modalInstance', '$http',
	function ($scope, $location, Authentication, Residents, $modalInstance, $http) {
		$scope.authentication = Authentication;

		$scope.saveResident = function () {
			var invalidItems = 0;
			$scope.errorProperty = false;

			if (!$scope.resident.property || $scope.resident.property == "") {
				$scope.errorProperty = true;
				invalidItems++;
			}

			if (invalidItems == 0) {
				if ($scope.add_resident) {
					Residents.addResident($scope.resident).then(function (response) {
						$modalInstance.close(response);
					}, function (errorResponse) {
						$scope.error = errorResponse.message;
					});
				} else {
					Residents.saveResident($scope.resident).then(function () {
						$modalInstance.close({resident: $scope.resident});
					}, function (errorResponse) {
						$scope.error = errorResponse;
					});
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$http.get('/all_properties').success(function(data) {
			$scope.properties = data;
		});

	}
]);
