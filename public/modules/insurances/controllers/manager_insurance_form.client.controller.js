'use strict';

// Insurances controller
angular.module('insurances').controller('ManagerInsuranceFormController', ['$scope', '$location', 'Authentication',
	'Upload', 'ManagerInsurance', '$modalInstance', 'Residents',
	function($scope, $location, Authentication, Upload, ManagerInsurance, $modalInstance, Residents) {
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

		$scope.uploadFiles = function(files) {
			$scope.file = files[0];
			$scope.file.upload = Upload.upload({
				url: "/upload_insurance",
				file: $scope.file
			}).progress(function (e) {
				$scope.file.progress = Math.round((e.loaded * 100.0) / e.total);
				$scope.file.status = "Uploading... " + $scope.file.progress + "%";
			}).success(function (data, status, headers, config) {
				$scope.file.result = data;
				$scope.insurance.insuranceFilePath = data.file;
			}).error(function (data, status, headers, config) {
				$scope.file.result = data;
			});
		};

		$scope.saveInsurance = function () {
			var invalidItems = 0;
			$scope.errorInsuranceName = false;
			$scope.errorInsurerName = false;
			$scope.errorUnitNumber = false;
			$scope.errorPolicyHolderName = false;
			$scope.errorPolicyName = false;
			$scope.errorPolicyNumber = false;
			$scope.errorPolicyStartDate = false;
			$scope.errorPolicyEndDate = false;
			$scope.errorInsuranceFile = false;
			if(!$scope.insurance.insuranceName || $scope.insurance.insuranceName == "") {
				$scope.errorInsuranceName = true;
				invalidItems++;
			}
			if(!$scope.insurance.insurerName || $scope.insurance.insurerName == "") {
				$scope.errorInsurerName = true;
				invalidItems++;
			}
			if(!$scope.insurance.unitNumber || $scope.insurance.unitNumber == "") {
				$scope.errorUnitNumber = true;
				invalidItems++;
			}
			if(!$scope.insurance.policyHolderName || $scope.insurance.policyHolderName == "") {
				$scope.errorPolicyHolderName = true;
				invalidItems++;
			}
			if(!$scope.insurance.policyName || $scope.insurance.policyName == "") {
				$scope.errorPolicyName = true;
				invalidItems++;
			}
			if(!$scope.insurance.policyNumber || $scope.insurance.policyNumber == "") {
				$scope.errorPolicyNumber = true;
				invalidItems++;
			}
			if(!$scope.insurance.policyStartDate || $scope.insurance.policyStartDate == "") {
				$scope.errorPolicyStartDate = true;
				invalidItems++;
			}
			if(!$scope.insurance.policyEndDate || $scope.insurance.policyEndDate == "") {
				$scope.errorPolicyEndDate = true;
				invalidItems++;
			}
			if(!$scope.insurance.insuranceFilePath || $scope.insurance.insuranceFilePath == "") {
				$scope.errorInsuranceFile = true;
				invalidItems++;
			}

			if(invalidItems == 0) {
				if($scope.add_insurance) {

					var insurance = {
						insuranceName: $scope.insurance.insuranceName,
						insurerName: $scope.insurance.insurerName,
						unitNumber: $scope.insurance.unitNumber,
						policyHolderName: $scope.insurance.policyHolderName,
						policyName: $scope.insurance.policyName,
						policyNumber: $scope.insurance.policyNumber,
						policyStartDate: $scope.insurance.policyStartDate,
						policyEndDate: $scope.insurance.policyEndDate,
						insuranceFilePath: $scope.insurance.insuranceFilePath
					};
					ManagerInsurance.addInsurance($scope.propertyId, $scope.unitId, $scope.residentId, insurance).then(function(response) {
						$modalInstance.close(response);
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				} else {
					var insurance = $scope.insurance;

					ManagerInsurance.saveInsurance($scope.propertyId, $scope.unitId, $scope.residentId, insurance).then(function() {
						$modalInstance.close({insurance: $scope.insurance});
					}, function(errorResponse) {
						$scope.error = errorResponse.message;
					});
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.getUnits = function(val) {
			return Residents.getUnits(val).then(function(response){
				return response.data;
			});
		};
	}
]);
