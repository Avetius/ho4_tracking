'use strict';

angular.module('users').controller('ResidentFormController', ['$scope', '$location', 'Authentication', 'Residents', '$modalInstance',
	function($scope, $location, Authentication, Residents, $modalInstance) {
		$scope.authentication = Authentication;

		$scope.saveResident = function () {
			var invalidItems = 0;
			$scope.errorFirstName = false;
			$scope.errorLastName = false;
			$scope.errorEmail = false;

			if(!$scope.resident.firstName || $scope.resident.firstName == "") {
				$scope.errorFirstName = true;
				invalidItems++;
			}
			if(!$scope.resident.lastName || $scope.resident.lastName == "") {
				$scope.errorLastName = true;
				invalidItems++;
			}
			if(!$scope.resident.email || $scope.resident.email == "" || !validateEmail($scope.resident.email)) {
				$scope.errorEmail = true;
				invalidItems++;
			}

			if(invalidItems == 0) {
				if($scope.add_resident) {
					Residents.addResident($scope.resident).then(function (response) {
						$modalInstance.close(response);
					}, function (errorResponse) {
						$scope.error = errorResponse.message;
					});
					//sending email
					if ($scope.resident.invite == true) {


						console.log(mailer);

						var transporter = mailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

						var mailOptions = {
							from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
							to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
							subject: 'Hello ✔', // Subject line
							text: 'Hello world 🐴', // plaintext body
							html: '<b>Hello world 🐴</b>' // html body
						};

						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								return console.log(error);
							}
							console.log('Message sent: ' + info.response);
						});
					}
					// end of sending email
				} else {
					Residents.saveResident($scope.resident).then(function() {
						$modalInstance.close({resident: $scope.resident});
					}, function(errorResponse) {
						$scope.error = errorResponse;
					});
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.getUnits = function(val) {
			return Residents.getUnits(val).then(function(response){
				return response.data;
			});
		};

		var validateEmail = function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};
	}
]);
