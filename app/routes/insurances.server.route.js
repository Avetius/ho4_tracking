'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var multipart = require('connect-multiparty'),
	multipartMiddleware = multipart();
module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var insurances = require('../../app/controllers/insurances.server.controller');

	app.route('/resident_insurances/:propertyId/:unitId/:residentId/insurances')
		.get(users.requiresLogin, users.isPropertyManager, insurances.residentInsurances)
		.post(users.requiresLogin, users.isPropertyManager, insurances.createResidentInsurances);

	app.route('/resident_insurances/:propertyId/:unitId/:residentId/insurances/:insuranceId')
		.get(users.requiresLogin, users.isPropertyManager, insurances.residentInsurance)
		.put(users.requiresLogin, users.isPropertyManager, insurances.updateResidentInsurance);

	// Finish by binding the user middleware
	app.param('insuranceId', insurances.insuranceByID);
};
