'use strict';

// Property manager controller
angular.module('users').controller('ResidentController', ['$scope', '$stateParams', '$location', 'Authentication',
	'Residents', '$modal', '$rootScope', 'prompt',
	function($scope, $stateParams, $location, Authentication, Residents, $modal, $rootScope, prompt) {
		$scope.authentication = Authentication;

		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.currentRllPage = 1;
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
				$scope.findResidents(t);
			}
		};

		$scope.selectRllPage = function (page) {
			if (page > 0 && page <= $scope.numberOfPages) {
				var start = (page - 1) * $scope.itemsByPage;
				var t = {
					pagination: {start: start, number: $scope.itemsByPage, numberOfPages: $scope.numberOfPages},
					search: $scope.tableState.search,
					sort: {}
				};
				$scope.currentRllPage = page;
				$scope.findRLLResidents(t);
			}
		};

		$scope.findResidents = function(tableState) {

			var pagination = tableState.pagination;

			var start = pagination.start || 0;
			var number = pagination.number || 10;
			Residents.getPage(start, number).then(function (result) {
				$scope.residents = result.data;
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
			});
		};

		$scope.findRLLResidents = function(tableState) {

			var pagination = tableState.pagination;

			var start = pagination.start || 0;
			var number = pagination.number || 10;
			Residents.getTransferPage(start, number).then(function (result) {
				$scope.rllResidents = result.data;
				$scope.rllNumberOfPages = result.numberOfPages;
				$scope.rllTotalItems = result.count;
			});
		};

		$scope.removeResident = function(resident) {
			prompt({
				title: 'Confirmation',
				message: 'Are you sure, that you want to remove this resident?'
			}).then(function() {
				Residents.deleteResident(resident).then(function (result) {
					if($scope.currentTab == 'resident')
						$scope.findResidents($scope.tableState);
					else
						$scope.findRLLResidents($scope.tableState);
				});
			});
		};

		$scope.openResidentModal = function(resident) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/residents/resident-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.resident = resident || {};
					scope.add_resident = !resident;
					return scope;
				}(),
				controller: 'ResidentFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				if($scope.currentTab == 'resident')
					$scope.findResidents($scope.tableState);
				else
					$scope.findRLLResidents($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.transferToRllCoverage = function() {
			var residentIds = [];
			angular.forEach($scope.residents, function(resident) {
				if(resident.transferRLL) residentIds.push(resident._id);
			});
			Residents.transferToRLLCoverage(residentIds).then(function(result) {
				$scope.findResidents($scope.tableState);
				$scope.findRLLResidents($scope.tableState);
			});
		};

		$scope.selectTab = function(tab) {
			$scope.currentTab = tab;
		}
	}
]);
