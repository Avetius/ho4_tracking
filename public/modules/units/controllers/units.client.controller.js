'use strict';

// Units controller
angular.module('units').controller('UnitsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Units',
	'$modal', '$rootScope', 'prompt', '$http',
	function($scope, $stateParams, $location, Authentication, Units, $modal, $rootScope, prompt, $http) {
		$scope.authentication = Authentication;
		if(!$scope.authentication.user || $scope.authentication.user.roles.indexOf('admin') < 0) return $location.path('/');
		if($scope.authentication.user.roles.indexOf('admin') > -1){
			$rootScope.admin = true;
		}
		$scope.numberOfPages = 1;
		$scope.currentPage = 1;
		$scope.itemsByPage = 20;
		$scope.pages = [];
		$scope.stDisplayedPages = 3;
		$scope.propertyId = $stateParams.propertyId;
		$scope.companyId = $stateParams.companyId;
		$scope.tableState = {
			pagination: {
				number: $scope.itemsByPage,
				numberOfPages: $scope.numberOfPages,
				start: 0
			},
			search: null,
			sort: null
		};

		if($stateParams.propertyId == '' || $stateParams.companyId == ''){
			return $location.path('/companies');
		}

		$scope.pageSize = 10;
		$scope.unitsPage = 1;
		$http.get('/property/'+$stateParams.propertyId).success(function (data) {
			console.log(data);
			$scope.coreproperty = data;
			$scope.property = {
				name: data.propertyName,
				company_id: data.c_id,
				pr_id: data.pr_id,
			};
		}).catch(function(){
			//return $location.path('/companies');
		});

		$scope.openPropertyInfo = function(unit) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/units/views/property-info.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.property = $scope.coreproperty;
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

		$http.get('/property_unit_list/'+$stateParams.propertyId ).success(function (result) {
			$scope.propertyunits = result;
		}).catch(function(err){
			console.log(err);

		//	return $location.path('/companies');
		});

		$http.get('/company/'+$stateParams.companyId).success(function (data) {
			$scope.company = {
				name: data.name,
				id: data.mysql_id
			};
		}).catch(function(err){
			console.log(err);
			//return $location.path('/companies');
		});

	}
]).controller('UnitInsuranceController', ['$scope', '$stateParams', '$location','$http','Units','$modal','$rootScope',
	function($scope, $stateParams, $location,$http, Units, $modal, $rootScope) {
		$scope.id = parseInt($stateParams.unitID);
		$http.post('http://api.rllinsure.com/api/unit', {username: 'mbarrus', password: 'password', pr_id: $stateParams.propertyId, c_id:$stateParams.companyId}).success(function(result) {
			$scope.units = result;
		});
		$http.post("/insurancesByAPIUnitID",{apiunitID:$scope.id}).success(function (coverages) {
			$scope.coverages = coverages.insurances;

		});

		$scope.openUnitModal = function(unit,index) {
			unit.ApiUnitId = unit.ApiUnitId || $scope.id;
			unit.moveInDate = unit.policyStartDate || "";
			unit.moveOutDate = unit.policyEndDate || "";
			unit.unit_no = unit.unitNumber || unit.unit_no;
			unit.buildingNumber = unit.policyNumber || "";
			unit.resident = unit.user;
			Units.getResidents(unit.ApiUnitId).then(function(residents) {
				//console.log(residents.data)
				var modalInstance = $modal.open({
					templateUrl: 'modules/units/views/unit-form.modal.html',
					scope: function () {
						var scope = $rootScope.$new();
						scope.unit = unit || {};
						scope.coverages = $scope.coverages || {};
						scope.propertyId = $scope.propertyId;
						scope.residents = residents.data;
						scope.add_unit= !unit || !unit._id;
						scope.index = index;
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


		$scope.deleteInsurance = function(insurance,index){
			if(confirm("Are you sure, you want to delete policy?")){
				$http.post("/deleteInsurance",{id:insurance._id}).success(function (data) {
					if(!data.status) return
					$scope.coverages.splice(index,1);
				})
			}
		}


	}
]).filter('startFrom', function(){
	return function(data, start){
		if(data)
			return data.slice(start);
	}
});
