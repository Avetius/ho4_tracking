'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', '$state', 'Upload','$rootScope',
	function($scope, $http, $location, Authentication, $state, Upload, $rootScope) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$rootScope.hide_navigation = true;

		$scope.credentials = {};

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

		$scope.uploadFiles = function(files) {
			$scope.file = files[0];
			$scope.file.upload = Upload.upload({
				url: "/upload_insurance",
				file: $scope.file
			}).progress(function (e) {
				$scope.file.progress = Math.round((e.loaded * 100.0) / e.total);
				$scope.file.status = "Uploading... " + $scope.file.progress + "%";
			}).success(function (data, status, headers, config) {
				$scope.file.result = data;
				$scope.credentials.insuranceFilePath = data.file;
			}).error(function (data, status, headers, config) {
				$scope.file.result = data;
			});
		};

		$scope.checkValidationGotoNext = function(path){
			var invalidItems = 0;
			if(path === 'account_info') {
				$scope.errorFirstName = false;
				$scope.errorLastName = false;
				$scope.errorEmail = false;
				$scope.errorConfirmEmail = false;
				$scope.errorPassword = false;
				$scope.errorConfirmPassword = false;
				$scope.errorPropertyCode = false;
				$scope.errorUnitNum = false;
				if(!$scope.credentials.firstName || $scope.credentials.firstName == "") {
					$scope.errorFirstName = true;
					invalidItems++;
				}
				if(!$scope.credentials.lastName || $scope.credentials.lastName == "") {
					$scope.errorLastName = true;
					invalidItems++;
				}
				if(!$scope.credentials.email || $scope.credentials.email == "" || !validateEmail($scope.credentials.email)) {
					$scope.errorEmail = true;
					invalidItems++;
				}
				if(!$scope.credentials.confirm_email || $scope.credentials.confirm_email == "" ||
					!validateEmail($scope.credentials.confirm_email) || $scope.credentials.email != $scope.credentials.confirm_email) {
					$scope.errorConfirmEmail = true;
					invalidItems++;
				}
				if(!$scope.credentials.password || $scope.credentials.password == "") {
					$scope.errorPassword = true;
					invalidItems++;
				}
				if(!$scope.credentials.confirm_password || $scope.credentials.confirm_password == "" || $scope.credentials.password != $scope.credentials.confirm_password) {
					$scope.errorConfirmPassword = true;
					invalidItems++;
				}
				if(!$scope.credentials.propertyID || $scope.credentials.propertyID == "") {
					$scope.errorPropertyCode = true;
					invalidItems++;
				}
				if(!$scope.credentials.appartmentNumber || $scope.credentials.appartmentNumber == "") {
					$scope.errorUnitNum = true;
					invalidItems++;
				}
			} else if(path === 'policy_info') {
				$scope.errorPhone = false;
				$scope.errorAddress = false;
				$scope.errorCity = false;
				$scope.errorState = false;
				$scope.errorZip = false;
				$scope.errorCountry = false;
				/*if(!$scope.credentials.phoneNumber || $scope.credentials.phoneNumber == "") {
					$scope.errorPhone = true;
					invalidItems++;
				}
				if(!$scope.credentials.address || $scope.credentials.address == "") {
					$scope.errorAddress = true;
					invalidItems++;
				}
				if(!$scope.credentials.city || $scope.credentials.city == "") {
					$scope.errorCity = true;
					invalidItems++;
				}
				if(!$scope.credentials.state || $scope.credentials.state == "") {
					$scope.errorState = true;
					invalidItems++;
				}
				if(!$scope.credentials.zipcode || $scope.credentials.zipcode == "") {
					$scope.errorZip = true;
					invalidItems++;
				}
				if(!$scope.credentials.country || $scope.credentials.country == "") {
					$scope.errorCountry = true;
					invalidItems++;
				}*/
			}
			if(invalidItems == 0) {
				if(path === 'account_info') $scope.finishUserInfoStep = true;
				if(path === 'policy_info') $scope.finishAccountInfoStep = true;
				$state.go('signup.'+path);
			} else {
				if(path === 'account_info') $scope.finishUserInfoStep = false;
				if(path === 'policy_info') $scope.finishAccountInfoStep = false;
			}
		};

		$scope.signup = function() {
			var invalidItems = 0;
			$scope.errorFirstName = false;
			$scope.errorLastName = false;
			$scope.errorEmail = false;
			$scope.errorPassword = false;
			$scope.errorPropertyCode = false;

			if(!$scope.credentials.firstName || $scope.credentials.firstName == "") {
				$scope.errorFirstName = true;
				invalidItems++;
			}
			if(!$scope.credentials.lastName || $scope.credentials.lastName == "") {
				$scope.errorLastName = true;
				invalidItems++;
			}
			if(!$scope.credentials.email || $scope.credentials.email == "" || !validateEmail($scope.credentials.email)) {
				$scope.errorEmail = true;
				invalidItems++;
			}
			if(!$scope.credentials.password || $scope.credentials.password == "") {
				$scope.errorPassword = true;
				invalidItems++;
			}
			if(!$scope.credentials.property_code || $scope.credentials.property_code == "") {
				$scope.errorPropertyCode = true;
				invalidItems++;
			}

			var start =  0;
			var number = 20;
			var sort = '';
			var  propertyCode = $scope.credentials.property_code;
			var url = '/properties?start=' + start + '&num=' + number + '&propertyCode='+ propertyCode +'&sort=' + JSON.stringify(sort);


			$http.get(url).success(function (data) {
				if(data.count > 0)
				{
					$scope.credentials.propertyID = data.properties[0]._id;
				}
				else
				{
					$scope.errorPropertyCode = true;
					invalidItems++;
				}
				if(invalidItems == 0) {
					$http.post('/auth/signup', $scope.credentials).success(function(response) {
						// If successful we assign the response to the global user model
						$scope.authentication.user = response;

						// And redirect to the index page
						$location.path('/insurances');
					}).error(function(response) {
						if(response.message === 'Username already exists') response.message = 'Email already exists';
						$scope.error = response.message;
					});
				}
			}).error(function (msg, code) {
				console.log(msg);
			});

		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				if($scope.authentication.user.roles.indexOf('pmanager')> -1) $location.path('/property_insurances/'+response.property._id+'/insurances');
				else if($scope.authentication.user.roles.indexOf('admin')> -1) $location.path('/resident_insurances');
				else $location.path('/insurances');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		var validateEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};
	}
]);
