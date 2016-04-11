'use strict';

//Properties service used for communicating with the properties REST endpoints
angular.module('properties').factory('Properties', ['$resource',
	function($resource) {
		return $resource('properties/:propertyId', {
			propertyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
