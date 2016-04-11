'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var multipart = require('connect-multiparty'),
	multipartMiddleware = multipart();
module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var units = require('../../app/controllers/units.server.controller');

	app.route('/units')
		.get(users.requiresLogin, users.isPropertyManager, units.list)
		.post(users.requiresLogin, users.isPropertyManager, units.create);

	app.route('/property_units/:propertyId')
		.get(users.requiresLogin, users.isPropertyManager, units.propertyUnitList)
		.post(users.requiresLogin, users.isPropertyManager, units.createUnitForProperty);

	app.route('/units/:unitId')
		.get(users.requiresLogin, users.isPropertyManager, units.read)
		.put(users.requiresLogin, users.isPropertyManager, units.update)
		.delete(users.requiresLogin, users.isPropertyManager, units.delete);


	// Finish by binding the user middleware
	app.param('unitId', units.unitByID);
};
