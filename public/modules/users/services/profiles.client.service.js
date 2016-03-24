'use strict';

//Profiles service used for communicating with the articles REST endpoints
angular.module('users').factory('Profiles', ['$resource',
	function($resource) {
		return $resource('profiles/byuser/:userId', {
			userId: '@userId'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
