'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


/**
 * Notes Schema
 */
var NoteSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	subject: {
		type: String
	},
	content: {
		type: String
	},
	email: {
		type: String
	},
	policy: {
		type: Schema.ObjectId,
		ref: 'Policy'
	},
	editor: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Note', NoteSchema);
