'use strict';

// Insurances controller
angular.module('insurances').controller('InsurancesController', ['$scope', '$http', '$stateParams', '$location',
	'Authentication', 'Insurances', 'Properties','$modal', '$rootScope', 'Residents',
	function($scope, $http, $stateParams, $location, Authentication, Insurances, Properties, $modal, $rootScope, Residents) {
		$scope.authentication = Authentication;
		if(!$scope.authentication.user) return $location.path('/');
		Residents.getResident($scope.authentication.user._id).then(function(response) {
			$scope.unit = response.data.unit;
		});
		// Find existing Insurance
		$scope.findOne = function() {
			$scope.policy = Insurances.get({
				policyId: $stateParams.insuranceId
			});
		};

		//Get Property info
		$http.get('/properties/'+Authentication.user.propertyID).then(function(datax){
			$scope.property = datax.data;
		});

		$http.get('/property_unit_list/'+Authentication.user.propertyID).then(function(datax){
			$scope.units = datax.data;
		});

		$scope.policies = [];
		$scope.findPolicies = function() {
			if($scope.authentication.user) {
				Insurances.query({}, function(data) {
					$scope.policies = data;
					if(data.length == 0) $scope.openInsuranceModal();
					else {
						var incompleteCount = 0;
						for(var i = 0; i < data.length; i++) {
							if(data[i].status == 'incomplete') incompleteCount++;
						}
						if(incompleteCount == data.length && $rootScope.fromState.name === 'home') $scope.openInsuranceModal();
					}
				});
			}
		};

		$scope.openInsuranceModal = function(insurance) {
			var modalInstance = $modal.open({
				templateUrl: 'modules/insurances/views/policy-form.modal.html',
				size: 'lg',
				scope: function () {
					var scope = $rootScope.$new();
					scope.insurance = insurance || {};
					scope.add_insurance = !insurance;
					scope.propertyID = Authentication.user.propertyID;
					return scope;
				}(),
				controller: 'InsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				if(!insurance) $scope.findPolicies();
				else $scope.findOne();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		}
	}
]);
