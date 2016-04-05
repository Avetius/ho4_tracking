'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return property.length;
};
/**
 * Policy Schema
 */
var PolicySchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	unitNumber: {
		type: String
	},
	policyHolderName: {
		type: String
	},
	policyName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in policy name']
	},
	policyNumber: {
		type: String
	},
	policyStartDate: {
		type: Date
	},
	policyEndDate: {
		type: Date
	},
	insuranceFilePath: {
		type: String
	},
	status: {
		type: String,
		trim: true,
		default: 'pending'
	},
	insuranceName: {
		type: String
	},
	insurerName: {
		type: String
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Policy', PolicySchema);
