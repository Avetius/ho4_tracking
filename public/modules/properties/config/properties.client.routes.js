'use strict';

// Setting up route
angular.module('properties').config(['$stateProvider',
	function($stateProvider) {
		// Insurances state routing
		$stateProvider.
		state('listProperty', {
			url: '/properties',
			templateUrl: 'modules/properties/views/property-list.client.view.html'
		}).
		state('listPropertyByPropertyManagerId', {
			url: '/properties_by_manager/:propertyManagerId/properties',
			templateUrl: 'modules/properties/views/property-list.client.view.html'
		});
	}
]);
