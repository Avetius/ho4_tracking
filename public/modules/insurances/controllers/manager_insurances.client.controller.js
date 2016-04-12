'use strict';

// Insurances controller
angular.module('insurances').controller('ManagerInsurancesController', ['$scope', '$stateParams', '$location', 'Authentication',
	'ManagerInsurance', '$modal', '$rootScope', '$timeout',
	function($scope, $stateParams, $location, Authentication, ManagerInsurance, $modal, $rootScope, $timeout) {
		$scope.authentication = Authentication;
		$scope.propertyId = $stateParams.propertyId;
		$scope.unitId = $stateParams.unitId;
		$scope.residentId = $stateParams.residentId;
		$scope.insuranceId = $stateParams.insuranceId;

		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.itemsByPage = 10;

		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: {}
		};

		$scope.selectPage = function (page) {
			if (page > 0 && page <= $scope.numberOfPages) {
				var start = (page - 1) * $scope.itemsByPage;
				var t = {
					pagination: {start: start, number: $scope.itemsByPage, numberOfPages: $scope.numberOfPages},
					search: $scope.tableState.search,
					sort: {}
				};
				$scope.currentPage = page;
				$scope.findRecentInsurances(t);
			}
		};

		// Find existing Insurance
		$scope.findOne = function() {
			var propertyManagerId = $stateParams.propertyManagerId || null;
			ManagerInsurance.getInsurance($scope.propertyId, $scope.unitId, $scope.residentId, $scope.insuranceId, propertyManagerId).then(function(result) {
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurance = result.insurance;
				$scope.property_manager = result.property_manager;
			});
		};

		$scope.findPolicies = function() {
			var propertyManagerId = $stateParams.propertyManagerId || null;
			ManagerInsurance.getInsurances($scope.propertyId, $scope.unitId, $scope.residentId, propertyManagerId).then(function(result) {
				$scope.property = result.property;
				$scope.unit = result.unit;
				$scope.insurances = result.insurances;
				$scope.resident = result.resident;
				$scope.property_manager = result.property_manager;
			});
		};

		$scope.findRecentInsurances = function(tableState) {
			var pagination = tableState.pagination;
			var start = pagination.start || 0;
			var number = pagination.number || 10;
			ManagerInsurance.getRecentInsurances(start, number).then(function(result) {
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
				$scope.insurances = result.data;
			});
		};

		$scope.findOneRecentInsurance = function() {
			ManagerInsurance.getRecentInsuranceDetail($scope.insuranceId).then(function(result) {
				$scope.insurance = result.insurance;
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
				$scope.findOne();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openRecentInsuranceModal = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/insurance-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = insurance || {};
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findOneRecentInsurance();
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
		};

		$scope.alerts = [];
		$scope.updateInsuranceStatus = function(insurance) {
			ManagerInsurance.updateStatusInsurance(insurance).then(function(response) {
				if(response.data.success) {
					var alert = {
						msg: 'Status updated successfully.'
					};
					$scope.alerts.push(alert);
					$timeout(function(){
						$scope.alerts.splice($scope.alerts.indexOf(alert), 1);
					}, 2500);
				}
			});
		};
	}
]);
