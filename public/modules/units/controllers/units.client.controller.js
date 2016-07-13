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

		$http.post('http://api.rllinsure.com/api/unit', {username: 'mbarrus', password: 'password', pr_id: $stateParams.propertyId, c_id:$stateParams.companyId}).success(function (result) {
			$scope.units = result;
		}).catch(function(){
			return $location.path('/companies');
		});
		$http.post('http://api.rllinsure.com/api/property/'+$stateParams.propertyId, {username: 'mbarrus', password: 'password'}).success(function (data) {
			$scope.property = {
				name: data.pr_name,
				company_id: data.c_id,
				pr_id: data.pr_id,
			};
		}).catch(function(){
			return $location.path('/companies');
		});
		$http.post('http://api.rllinsure.com/api/company/'+$stateParams.companyId, {username: 'mbarrus', password: 'password'}).success(function (data) {
			$scope.company = {
				name: data.c_name,
				id: data.c_id
			};
		}).catch(function(){
			return $location.path('/companies');
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
			console.log($scope.coverages[0])

		});	

		$scope.openUnitModal = function(unit,index) {
			console.log(unit)
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
