'use strict';

// Units controller
angular.module('units').controller('UnitsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Units',
	'$modal', '$rootScope', 'prompt',
	function($scope, $stateParams, $location, Authentication, Units, $modal, $rootScope, prompt) {
		$scope.authentication = Authentication;
		$scope.propertyId = $stateParams.propertyId;
		$scope.propertyManagerId = $stateParams.propertyManagerId;
		if(!$scope.authentication.user || ($scope.authentication.user.roles.indexOf('admin') < 0 && $scope.authentication.user.roles.indexOf('pmanager') < 0)) return $location.path('/');

		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.pages = [];
		$scope.itemsByPage = 10;
		$scope.stDisplayedPages = 3;

		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: null,
			sort: null
		};

		$scope.selectPage = function (page) {
			if (page > 0 && page <= $scope.numberOfPages) {
				var start = (page - 1) * $scope.itemsByPage;
				var t = {
					pagination: {start: start, number: $scope.itemsByPage, numberOfPages: $scope.numberOfPages},
					search: $scope.tableState.search,
					sort: $scope.tableState.sort
				};
				$scope.currentPage = page;
				$scope.findUnits(t);
			}
		};

		$scope.findUnits = function(tableState) {
			$scope.tableState.sort = tableState.sort;
			var pagination = tableState.pagination;

			var start = pagination.start || 0;
			var number = pagination.number || 10;
			var sort = tableState.sort || '';
			var search = tableState.search;
			if(typeof search === 'object' || search == undefined) search = '';
			if(!sort.predicate) sort = '';

			Units.getPage(start, number, $scope.propertyId, $scope.propertyManagerId, sort, search).then(function (result) {
				$scope.units = result.data;
				$scope.property = result.property;
				$scope.property_manager = result.property_manager;
				$scope.numberOfPages = result.numberOfPages;
				$scope.totalItems = result.count;
				redrawPagination(start, number)
			});
		};

		$scope.removeUnit = function(unit) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/confirm.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.title = 'Confirmation';
					scope.content = 'Are you sure, that you want to remove this unit?';
					return scope;
				}(),
				controller: 'ManagerInsuranceFormController'
			});
			modalInstance.result.then(function () {
				Units.deleteUnit(unit).then(function (result) {
					$scope.findUnits($scope.tableState);
				});
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openPropertyInfo = function(unit) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/units/views/property-info.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.property = $scope.property;

					return scope;
				}(),
				controller: 'UnitFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findUnits($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openUnitModal = function(unit) {
			Units.getResidents().then(function(residents) {
				var modalInstance = $modal.open({
					templateUrl: 'modules/units/views/unit-form.modal.html',
					scope: function () {
						var scope = $rootScope.$new();
						scope.unit = unit || {};
						scope.propertyId = $scope.propertyId;
						scope.residents = residents.data;
						scope.add_unit= !unit || !unit._id;
						return scope;
					}(),
					controller: 'UnitFormController'
				});

				modalInstance.result.then(function (selectedItem) {
					if(selectedItem.resident_modal) {
						$scope.openResidentModal(selectedItem.unit);
					} else {
						$scope.findUnits($scope.tableState);
					}
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			});
		};

		$scope.displayExtraResidentModal = function(unit) {
			Units.getResidents().then(function(residents) {
				var modalInstance = $modal.open({
					templateUrl: 'modules/users/views/residents/extra-resident-form.modal.html',
					size: 'lg',
					scope: function () {
						var scope = $rootScope.$new();
						scope.unit = unit || {};
						scope.propertyId = $scope.propertyId;
						scope.residents = residents.data;
						scope.add_unit= !unit || !unit._id;
						return scope;
					}(),
					controller: 'UnitFormController'
				});

				modalInstance.result.then(function (selectedItem) {
					if(selectedItem.resident_modal) {
						$scope.displayResidentModal(selectedItem.unit);
					} else {
						$scope.findUnits($scope.tableState);
					}
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			});
			/*var modalInstance = $modal.open({
			 templateUrl: 'modules/users/views/residents/extra-resident-form.modal.html',
			 scope: function () {
			 var scope = $rootScope.$new();
			 scope.resident = {appartmentNumber: unit};
			 scope.add_resident = true;
			 return scope;
			 }(),
			 controller: 'ResidentFormController'
			 });

			 modalInstance.result.then(function (selectedItem) {
			 $scope.findUnits($scope.tableState);
			 }, function () {
			 console.log('Modal dismissed at: ' + new Date());
			 });*/
		};

		$scope.displayResidentModal = function(unit) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/residents/resident-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.resident = {appartmentNumber: unit};
					scope.add_resident = true;
					return scope;
				}(),
				controller: 'ResidentFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findUnits($scope.tableState);
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		$scope.openResidentModal = function(unit) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/users/views/residents/resident-form.modal.html',
				scope: function () {
					var scope = $rootScope.$new();
					scope.resident =  {appartmentNumber:$rootScope.appartmentNumber};
					scope.add_resident = true;
					return scope;
				}(),
				controller: 'ResidentFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				unit.resident = selectedItem.data;
				$scope.openUnitModal(unit);
			}, function () {
				$scope.openUnitModal(unit);
				console.log('Modal dismissed at: ' + new Date());
			});
		};

		var redrawPagination = function(start_index, number) {
			var start = 1;
			var end;
			var i;
			var prevPage = $scope.currentPage;
			$scope.totalItemCount = $scope.totalItems;
			$scope.currentPage = Math.floor(start_index / number) + 1;

			start = Math.max(start, $scope.currentPage - Math.abs(Math.floor($scope.stDisplayedPages / 2)));
			end = start + $scope.stDisplayedPages;

			if (end > $scope.numberOfPages) {
				end = $scope.numberOfPages + 1;
				start = Math.max(1, end - $scope.stDisplayedPages);
			}

			$scope.pages = [];
			$scope.numPages = $scope.numberOfPages;

			for (i = start; i < end; i++) {
				$scope.pages.push(i);
			}
		};

		$scope.searchWithText = function(e) {
			if (e.keyCode == 13) {
				$scope.tableState.search = $scope.search;
				$scope.findUnits($scope.tableState);
			}
		};

		$scope.searchUnits = function() {
			$scope.tableState.search = $scope.search;
			$scope.findUnits($scope.tableState);
		}
	}
]);
