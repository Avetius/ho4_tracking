'use strict';

angular.module('units').controller('UnitFormController', ['$scope', '$location', 'Authentication','$http', 'Units', '$modalInstance','$rootScope',
	function($scope, $location, Authentication, $http, Units, $modalInstance,$rootScope) {
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

		$scope.saveUnitResidenId = function () {
			Units.saveUnit($scope.unit).then(function() {
				$modalInstance.close({unit: $scope.unit});
			}, function(errorResponse) {
				$scope.error = errorResponse.message;
			});
		};

		$scope.saveInsurance = function(insurance){
			if(!insurance.buildingNumber.trim("") || !insurance.moveInDate || !insurance.moveOutDate || !insurance.resident) return alert("Please fill all fields!")

			var policy = {};
			policy.ApiUnitId = insurance.ApiUnitId;
			policy.unitNumber = insurance.unit_no;
			policy.id = insurance.resident._id;
			policy.user = insurance.resident;
			policy.policyStartDate = insurance.moveInDate;
			policy.policyEndDate = insurance.moveOutDate;
			policy.policyNumber = insurance.buildingNumber;
			policy.ApiResId = insurance.resident.res_id;
			console.log(policy)
			$http.post("/createInsurance",policy).success(function(newPolicy){
				$scope.coverages.push(newPolicy);
				$modalInstance.close({coverages: $scope.coverages});
			}).catch(function(){
				$modalInstance.close();
			});
		}


		$scope.updateInsurance = function(insurance){
			if(!insurance.buildingNumber.trim("") || !insurance.moveInDate || !insurance.moveOutDate || !insurance.resident) return alert("Please fill all fields!")
			var policy = {};
			policy.ApiUnitId = insurance.ApiUnitId;
			policy.unitNumber = insurance.unit_no;
			policy.id = insurance.resident._id;
			policy.user = insurance.resident;
			policy.policyStartDate = insurance.moveInDate;
			policy.policyEndDate = insurance.moveOutDate;
			policy.policyNumber = insurance.buildingNumber;
			policy._id = insurance._id;
			policy.status = insurance.status;
			policy.ApiResId = insurance.resident.res_id;
			//console.log(policy)
			$http.post("/updateInsurance",policy).success(function(updatedPolicy){
				//$scope.coverages.push(newPolicy);
				for(var i in $scope.coverages){
					if($scope.coverages[i]._id == policy._id){
						$scope.coverages[i] = policy;
					}
				}
		//		console.log(updatedPolicy);
				$modalInstance.close({coverages: $scope.coverages});
			}).catch(function(){
				$modalInstance.close();
			});
		}



		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.openResidentModalForUnit = function() {
			$modalInstance.close({resident_modal: true, unit: $scope.unit});
		};

		$scope.savebuildingNumber = function() {
			$rootScope.appartmentNumber = document.getElementById("buildingNumber").value;
		}
	}
]);
