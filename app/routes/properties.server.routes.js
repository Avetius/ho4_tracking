'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var multipart = require('connect-multiparty'),
	multipartMiddleware = multipart();
module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var properties = require('../../app/controllers/properties.server.controller');

	app.route('/properties')
		.get(users.requiresLogin, users.isPropertyManager, properties.list)
		.post(users.requiresLogin, users.isPropertyManager, properties.create);

	app.route('/properties/:propertyId')
		.get(users.requiresLogin, users.isPropertyManager, properties.read)
		.put(users.requiresLogin, users.isPropertyManager, properties.update)
		.delete(users.requiresLogin, users.isPropertyManager, properties.delete);


	// Finish by binding the user middleware
	app.param('propertyId', properties.propertyByID);
};
