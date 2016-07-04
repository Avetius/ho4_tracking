'use strict';

// Setting up route
angular.module('properties').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.
		state('listProperty', {
			url: '/properties/:companyid',
			templateUrl: 'modules/properties/views/property-list.client.view.html'
		}).
		state('listPropertyByPropertyManagerId', {
			url: '/properties_by_manager/:propertyManagerId/properties',
			templateUrl: 'modules/properties/views/property-list.client.view.html'
		}).
		state('company', {
			url: '/companies',
			templateUrl: 'modules/properties/views/companies-list.client.view.html'
		}).		
		state('companyId', {
			url: '/company/:id',
			templateUrl: 'modules/properties/views/company.client.view.html'
		}).
		state('companyIdAndPr_id', {
			url: '/company/:id/:pr_id',
			templateUrl: 'modules/properties/views/companyPrId.client.view.html'
		}).
		state('units', {
			url: '/company/:id/:pr_id/units',
			templateUrl: 'modules/properties/views/units.client.view.html'
		});		
	}
]);
