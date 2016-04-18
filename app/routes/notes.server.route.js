'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var notes = require('../../app/controllers/notes.server.controller');

	app.route('/notes')
		.post(users.requiresLogin, users.isAdminUser, notes.createNote);

	// Finish by binding the user middleware
	app.param('noteId', notes.noteById);
};
