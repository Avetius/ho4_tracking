'use strict';

// Property manager controller
angular.module('users').controller('ResidentController', ['$scope', '$stateParams', '$location', 'Authentication', 'Residents', '$modal', '$rootScope',
	function($scope, $stateParams, $location, Authentication, Residents, $modal, $rootScope) {
		$scope.authentication = Authentication;

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
				$scope.findResidents(t);
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

		$scope.removeResident = function(resident) {
			Residents.deleteResident(resident).then(function (result) {
				$scope.findResidents($scope.tableState);
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
				$scope.findResidents($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};
	}
]);
