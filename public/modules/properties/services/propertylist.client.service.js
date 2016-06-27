'use strict';

//Properties service used for communicating with the properties REST endpoints
angular.module('properties').factory('PropertySmartList', ['$q', '$filter', '$timeout', '$http', '$rootScope',
	function ($q, $filter, $timeout, $http, $rootScope) {
		return {
			//Get orders by page and search values
			getPage: function (start, number, propertyManagerId, search, sort) {			
				var deferred = $q.defer();
				var url = '/properties?start=' + start + '&num=' + number + '&search=' + search + '&sort=' + JSON.stringify(sort);
				if(propertyManagerId) {
					url = '/properties?start=' + start + '&num=' + number + '&propertyManagerId=' + propertyManagerId + '&search=' + search + '&sort=' + JSON.stringify(sort);
				}

				if($rootScope.admin){					
					$http.post('http://localhost:3001/api/company', {username: 'mbarrus', password: 'password'}).success(function (data) {
						deferred.resolve({
							data: data,
							property_manager: data.property_manager,
							numberOfPages: Math.ceil(data.length / number),
							count: data.length,
							managers: ''
						});
					}).error(function (msg, code) {
						deferred.reject(msg);
					});
				}else{					
					$http.get(url).success(function (data) {
						deferred.resolve({
							data: data.properties,
							property_manager: data.property_manager,
							numberOfPages: Math.ceil(data.count / number),
							count: data.count,
							managers: data.managers
						});
					}).error(function (msg, code) {
						deferred.reject(msg);
					});					
				}

				return deferred.promise;
			},
			getProperties: function() {
				var deferred = $q.defer();
				$http.get('/properties_for_property_manager').success(function (data) {
					deferred.resolve(data);
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			saveProperty: function (property) {
				var deferred = $q.defer();
				var data = JSON.stringify(property);
				$http.put('/properties/'+property._id, data).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			},
			deleteProperty: function (property) {
				var deferred = $q.defer();
				$http.delete('/properties/'+property._id).success(function (data) {
					deferred.resolve({
						data: data
					});
				}).error(function (msg, code) {
					deferred.reject(msg);
				});
				return deferred.promise;
			}
		};
	}
]);
