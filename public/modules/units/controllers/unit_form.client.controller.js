'use strict';

angular.module('units').controller('UnitFormController', ['$scope', '$location', 'Authentication', 'Units', '$modalInstance',
	function($scope, $location, Authentication, Units, $modalInstance) {
		$scope.authentication = Authentication;
		var now = new Date();
		var fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
		$scope.dateFilter = {
			fromDate: null,
			untilDate: null
		};

		$scope.datePickerOptions = {
			showWeeks: false
		};

		$scope.fromElements = {};
		$scope.fromElements.opened = false;

		$scope.toElements = {};
		$scope.toElements.opened = false;

		$scope.from_open = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.fromElements.opened = !$scope.fromElements.opened;
		};

		$scope.to_open = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.toElements.opened = !$scope.toElements.opened;
		};

		$scope.saveUnit = function () {
			var invalidItems = 0;
			$scope.errorUnitNumber = false;

			if(!$scope.unit.unitNumber || $scope.unit.unitNumber == "") {
				$scope.errorUnitNumber = true;
				invalidItems++;
			}


			if(invalidItems == 0) {
				if($scope.add_unit) {
					// Redirect after save
					if($scope.unit.resident)
						$scope.unit.resident = $scope.unit.resident._id;
					Units.addUnit($scope.unit, $scope.propertyId).then(function(response) {
						$modalInstance.close(response);
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				} else {
					Units.saveUnit($scope.unit).then(function() {
						$modalInstance.close({unit: $scope.unit});
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.openResidentModalForUnit = function() {
			$modalInstance.close({resident_modal: true, unit: $scope.unit});
		};
	}
]);
