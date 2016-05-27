'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		}).state('/services', {
			url: '/services',
			templateUrl: 'modules/core/views/services.client.view.html',
			controller: 'ServicesController'
		}).state('/contact-us', {
			url: '/contact-us',
			templateUrl: 'modules/core/views/contact.clients.view.html'
		}).state('/faqs', {
			url: '/faqs',
			templateUrl: 'modules/core/views/faqs.clients.view.html'
		}).state('/privacy-policy', {
			url: '/privacy-policy',
			templateUrl: 'modules/core/views/privacy-policy.client.view.html'
		});
	}
]);
