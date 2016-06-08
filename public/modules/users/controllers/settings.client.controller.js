'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Profiles', 'Upload', 'Policies',
	function($scope, $http, $location, Users, Authentication, Profiles, Upload, Policies) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) return $location.path('/');
		$scope.policy = {};
		//search object to filter orders
		var now = new Date();
		var fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
		$scope.dateFilter = {
			fromDate: null,
			untilDate: null
		};

		$scope.datePickerOptions = {
			showWeeks: false
		};

		$scope.fromElements = {};
		$scope.fromElements.opened = false;

		$scope.toElements = {};
		$scope.toElements.opened = false;

		$scope.from_open = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.fromElements.opened = !$scope.fromElements.opened;
		};

		$scope.to_open = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.toElements.opened = !$scope.toElements.opened;
		};

		// Find existing Article
		$scope.findOne = function() {
			$scope.profile = Profiles.get({
				userId: $scope.user._id
			});
		};

		$scope.findLatestPolicy = function() {
			Policies.query(function(data) {
				$scope.policy = data[0];
			});
		};

		$scope.findPolicies = function() {
			$scope.policies = Policies.query();
		};

		// Check if there are additional accounts
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				$scope.profile.userId = $scope.profile.user._id.toString();
				var profile = new Profiles($scope.profile);

				profile.$update(function(response) {
					$scope.success = true;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.updateUserAccount = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				$scope.profile.userId = $scope.profile.user._id.toString();
				var profile = new Profiles($scope.profile);

				profile.$update(function(response) {
					$location.path('/signup_policy_info');
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.updatePolicy = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var policy = new Policies($scope.policy);

				policy.$update(function(response) {
					$scope.success = true;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.addPolicyInfo = function (isValid) {
			var policy = new Policies({
				insuranceName: $scope.policy.insuranceName,
				insurerName: $scope.policy.insurerName,
				unitNumber: $scope.policy.unitNumber,
				insuranceFilePath: $scope.policy.insuranceFilePath,
				policyHolderName: $scope.policy.policyHolderName,
				policyNumber: $scope.policy.policyNumber,
				policyStartDate: $scope.policy.policyStartDate,
				policyEndDate: $scope.policy.policyEndDate
			});

			// Redirect after save
			policy.$save(function(response) {
				$location.path('/settings/profile');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.pwd_success = $scope.pwd_error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.pwd_success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.pwd_error = response.message;
			});
		};

		$scope.uploadFiles = function(files) {
			$scope.file = files[0];
			$scope.file.upload = Upload.upload({
				url: "/upload_insurance",
				fields: {'user': $scope.user._id},
				file: $scope.file
			}).progress(function (e) {
				$scope.file.progress = Math.round((e.loaded * 100.0) / e.total);
				$scope.file.status = "Uploading... " + $scope.file.progress + "%";
			}).success(function (data, status, headers, config) {
				$scope.file.result = data;
				$scope.policy.insuranceFilePath = data.file;
			}).error(function (data, status, headers, config) {
				$scope.file.result = data;
			});
		};

		$scope.showPolicyDetailModal = function(policy) {

		};
	}
]);
