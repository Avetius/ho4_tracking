'use strict';

// Setting up route
angular.module('units').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.state('listUnit', {
			url: '/propertyunits/:companyId/:propertyId',
			templateUrl: 'modules/units/views/unit-list.client.view.html'
		}).state('listUnitByPropertyManagerId', {
			url: '/properties_by_manager/:propertyManagerId/properties/:propertyId/units',
			templateUrl: 'modules/units/views/unit-list.client.view.html'
		}).state('listInsuranceByUnitId', {
			url: '/unit/insurances/:companyId/:propertyId/:unitID',
			templateUrl: 'modules/units/views/unit-coverage.client.view.html'
		})
	}
]);
