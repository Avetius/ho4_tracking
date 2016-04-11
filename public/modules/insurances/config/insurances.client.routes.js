'use strict';

// Setting up route
angular.module('insurances').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.
		state('listInsurance', {
			url: '/insurances',
			templateUrl: 'modules/insurances/views/policy-list.client.view.html'
		}).
		state('viewInsurance', {
			url: '/insurances/:insuranceId',
			templateUrl: 'modules/insurances/views/policy-detail.client.view.html'
		}).
		state('listInsuranceForManager', {
			url: '/properties/:propertyId/units/:unitId/:residentId/insurances',
			templateUrl: 'modules/insurances/views/manager-insurance-list.client.view.html'
		}).
		state('viewInsuranceForManager', {
			url: '/properties/:propertyId/units/:unitId/:residentId/insurances/:insuranceId',
			templateUrl: 'modules/insurances/views/manager-insurance-detail.client.view.html'
		});
	}
]);
