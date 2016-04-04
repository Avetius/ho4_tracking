'use strict';

// Setting up route
angular.module('insurances').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.
		state('viewInsurance', {
			url: '/insurances/:insuranceId',
			templateUrl: 'modules/insurances/views/policy-detail.client.view.html'
		});
	}
]);
