'use strict';

// Insurances controller
angular.module('insurances').controller('ManagerInsurancesController', ['$scope', '$stateParams', '$location', 'Authentication', 'ManagerInsurance', '$modal', '$rootScope',
	function($scope, $stateParams, $location, Authentication, ManagerInsurance, $modal, $rootScope) {
		$scope.authentication = Authentication;
		$scope.propertyId = $stateParams.propertyId;
		$scope.unitId = $stateParams.unitId;
		$scope.residentId = $stateParams.residentId;
		$scope.insuranceId = $stateParams.insuranceId;
		// Find existing Insurance
		$scope.findOne = function() {
			ManagerInsurance.getInsurance($scope.propertyId, $scope.unitId, $scope.residentId, $scope.insuranceId).then(function(result) {
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurance = result.insurance;
			});
		};

		$scope.findPolicies = function() {
			ManagerInsurance.getInsurances($scope.propertyId, $scope.unitId, $scope.residentId).then(function(result) {
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurances = result.insurances;
				$scope.resident = result.resident;
			});
		};

		$scope.openInsuranceModal = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/insurance-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = insurance || {};
					scope.add_insurance = !insurance;
					scope.propertyId = $scope.propertyId;
					scope.unitId = $scope.unitId;
					scope.residentId = $scope.residentId;
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findPolicies();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openResidentInfo = function() {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/resident-info.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.resident = $scope.resident;

					return scope;
				}()
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findUnits($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		}
	}
]);
