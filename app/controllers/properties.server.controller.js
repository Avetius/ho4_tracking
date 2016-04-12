'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Property = mongoose.model('Property'),
	_ = require('lodash');

/**
 * Create a property
 */
exports.create = function(req, res) {
	var property = new Property(req.body);
	if(req.user.roles.indexOf('pmanager')>-1) {
		property.propertyManager = req.user;
	}
	property.updated = Date.now();
	property.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(property);
		}
	});
};

/**
 * Show the current property
 */
exports.read = function(req, res) {
	res.json(req.property);
};

/**
 * Update a property
 */
exports.update = function(req, res) {
	var property = req.property;

	property = _.extend(property, req.body);
	property.updated = Date.now();

	property.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(property);
		}
	});
};

/**
 * Delete a property
 */
exports.delete = function(req, res) {
	var property = req.property;

	property.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(property);
		}
	});
};

/**
 * List of Properties
 */
exports.list = function(req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var query = {};
	if(req.user.roles.indexOf('pmanager')>-1) {
		query = {propertyManager: req.user.id};
	}

	if(req.query.propertyManagerId) {
		query = {propertyManager: req.query.propertyManagerId};
	}

	Property.count(query, function (err, count) {
		Property.find(query).sort('-created').populate('propertyManager', 'displayName').limit(num).skip(start).exec(function (err, properties) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				if(req.query.propertyManagerId) {
					User.findById(req.query.propertyManagerId).exec(function (err, property_manager) {
						res.json({count: count, properties: properties, property_manager: property_manager});
					});
				} else {
					res.json({count: count, properties: properties, property_manager: null});
				}
			}
		});
	});
};

/**
 * Property middleware
 */
exports.propertyByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Property is invalid'
		});
	}

	Property.findById(id).populate('propertyManager', 'displayName').exec(function(err, property) {
		if (err) return next(err);
		if (!property) {
			return res.status(404).send({
				message: 'Property not found'
			});
		}
		req.property = property;
		next();
	});
};
