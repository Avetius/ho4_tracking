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
		.get(users.requiresLogin, users.isPropertyManager, insurances.residentInsurance);
	app.route('/resident_insurances/:insuranceId')
		.put(users.requiresLogin, users.isPropertyManager, insurances.updateResidentInsurance)
		.delete(users.requiresLogin, users.isPropertyManager, insurances.removeInsurance);

	app.route('/resident_insurance_list/:residentId')
		.get(users.requiresLogin, users.isAdminUser, insurances.residentInsuranceList);

	app.route('/recent_insurances').get(users.requiresLogin, users.isAdminUser, insurances.recentInsurances);
	app.route('/recent_insurances/:insuranceId')
		.get(users.requiresLogin, users.isAdminUser, insurances.recentInsuranceDetail);

	app.route('/insurance_status/:insuranceId')
		.post(users.requiresLogin, users.isAdminUser, insurances.updateStatusInsurance);

	// Finish by binding the user middleware
	app.param('insuranceId', insurances.insuranceByID);
};
