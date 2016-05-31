'use strict';

// Insurances controller
angular.module('insurances').controller('InsurancesController', ['$scope', '$http', '$stateParams', '$location',
	'Authentication', 'Insurances', 'Properties','$modal', '$rootScope', 'Residents',
	function($scope, $http, $stateParams, $location, Authentication, Insurances, Properties, $modal, $rootScope, Residents) {
		$scope.authentication = Authentication;
		Residents.getResident($scope.authentication.user._id).then(function(response) {
			$scope.unit = response.data.unit;
		});
		// Find existing Insurance
		$scope.findOne = function() {
			$scope.insurance = Insurances.get({
				policyId: $stateParams.insuranceId
			});
		};

		//Get Property info
		$http.get('/properties/'+Authentication.user.propertyID).then(function(datax){
			$scope.property = datax.data;
		});


		$scope.policies = [];
		$scope.findPolicies = function() {
			if($scope.authentication.user) {
				Insurances.query({}, function(data) {
					$scope.policies = data;
					if(data.length == 0) $scope.openInsuranceModal();
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
					return scope;
				}(),
				controller: 'InsuranceFormController'
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.findPolicies();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		}
	}
]);
