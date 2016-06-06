'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html',
			controller: 'AuthenticationController'
		}).
		state('signup.user_info', {
			url: '/signup_user_info',
			templateUrl: 'modules/users/views/authentication/signup_user_info.client.view.html'
		}).
		state('signup.account_info', {
			url: '/signup_account_info',
			templateUrl: 'modules/users/views/authentication/signup_account_info.client.view.html'
		}).
		state('signup.policy_info', {
			url: '/signup_policy_info',
			templateUrl: 'modules/users/views/authentication/signup_policy_info.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot?email',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('edit_policy', {
			url: '/settings/policy',
			templateUrl: 'modules/users/views/settings/edit-policy.client.view.html'
		}).
		state('property_manager_list', {
			url: '/property_managers',
			templateUrl: 'modules/users/views/property_managers/property-manager-list.client.view.html'
		}).
		state('residents_list', {
			url: '/residents',
			templateUrl: 'modules/users/views/residents/resident-list.client.view.html'
		});
	}
]);
