'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

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
		type: String
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
		type: String
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
