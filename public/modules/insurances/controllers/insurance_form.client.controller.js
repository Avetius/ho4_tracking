'use strict';

// Insurances controller
angular.module('insurances').controller('InsuranceFormController', ['$scope', '$location', 'Authentication', 'Upload',
	'Insurances', '$modalInstance', 'Residents', '$http',
	function($scope, $location, Authentication, Upload, Insurances, $modalInstance, Residents, $http) {
		$scope.authentication = Authentication;
		Residents.getResident($scope.authentication.user._id).then(function(response) {
			$scope.unit = response.data.unit;
			$scope.insurance.unitNumber = $scope.unit?$scope.unit.unitNumber:$scope.insurance.unitNumber ;
		});

		if($scope.propertyID) {
			$http.get('/property_unit_list/'+$scope.propertyID).then(function(datax){
				$scope.units = datax.data;
			});

			$http.get('/properties/'+$scope.propertyID).then(function(datax){
				$scope.property = datax.data;
			});
		}

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
			if($scope.add_insurance) {
				var insurance = new Insurances({
					insuranceName: $scope.insurance.insuranceName,
					unitNumber: $scope.insurance.unitNumber,
					policyHolderName: $scope.insurance.policyHolderName,
					policyNumber: $scope.insurance.policyNumber,
					policyStartDate: $scope.insurance.policyStartDate,
					policyEndDate: $scope.insurance.policyEndDate,
					insuranceFilePath: $scope.insurance.insuranceFilePath
				});

				// Redirect after save
				insurance.$save(function(response) {
					$modalInstance.close(response);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			} else {
				var insurance = $scope.insurance;
				Insurances.update(insurance, function() {
					$modalInstance.close({insurance: $scope.insurance});
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.submitInsurance = function () {
			var invalidItems = 0;
			$scope.errorPolicyHolderName = false;
			$scope.errorInsuranceFile = false;
			if(!$scope.insurance.policyHolderName || $scope.insurance.policyHolderName === '') {
				$scope.errorPolicyHolderName = true;
				invalidItems++;
			}
			if(!$scope.insurance.insuranceFilePath || $scope.insurance.insuranceFilePath === '') {
				$scope.errorInsuranceFile = true;
				invalidItems++;
			}
			if(invalidItems === 0) {
				if($scope.add_insurance) {
					var insurance = new Insurances({
						insuranceName: $scope.insurance.insuranceName,
						unitNumber: $scope.insurance.unitNumber,
						policyHolderName: $scope.insurance.policyHolderName,
						policyNumber: $scope.insurance.policyNumber,
						policyStartDate: $scope.insurance.policyStartDate,
						policyEndDate: $scope.insurance.policyEndDate,
						insuranceFilePath: $scope.insurance.insuranceFilePath
					});

					// Redirect after save
					insurance.$save(function(response) {
						$modalInstance.close(response);
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				} else {
					var insurance = $scope.insurance;
					Insurances.update(insurance, function() {
						$modalInstance.close({insurance: $scope.insurance});
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
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

		$scope.getResidentUnits = function(val) {
			return Residents.getUnits(val).then(function(response){
				return response.data;
			});
		};

	}
]);
