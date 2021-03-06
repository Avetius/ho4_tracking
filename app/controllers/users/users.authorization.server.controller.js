'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	errorHandler = require('../errors.server.controller'),
	User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
	User.findById(id).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.profile = user;
		next();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).send({
					message: 'User is not authorized'
				});
			}
		});
	};
};

exports.verifyUser = function(req, res, next) {
	User.update({verifyToken: req.query.token}, {verified: true, verifyToken: ''}, function(err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.redirect('/#!/settings/profile');
		}
	});
};

/**
 * Admin authorization middleware
 */
exports.isAdminUser = function(req, res, next) {
	if (!req.user.roles.indexOf('admin') < 0) {
		return res.status(403).send({
			message: 'You don\'t have a permission for this page'
		});
	}
	next();
};

/**
 * Property Manager authorization middleware
 */
exports.isPropertyManager = function(req, res, next) {
	if (!(req.user.roles.indexOf('pmanager') < 0) && !(req.user.roles.indexOf('admin') < 0)) {
		return res.status(403).send({
			message: 'You don\'t have a permission for this page'
		});
	}
	next();
};
