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
 * Property Schema
 */
var PropertySchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	propertyName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in property name']
	},
	propertyCode: {
		type: String,
		default: ''
	},
	propertyId: {
		type: String
	},
	managementCompany: {
		type: String
	},
	phoneNumber: {
		type: String
	},
	faxNumber: {
		type: String
	},
	email: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	secondaryEmail: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	invoiceEmail: {
		type: String,
		trim: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	status: {
		type: String
	},
	state: {
		type: String
	},
	city: {
		type: String
	},
	country: {
		type: String
	},
	streetAddress: {
		type: String
	},
	zip: {
		type: String
	},
	totalUnits: {
		type: Number,
		default: 0
	},
	totalOccupiedUnits: {
		type: Number,
		default: 0
	},
	propertyManager: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Property', PropertySchema);
