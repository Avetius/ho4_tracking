'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User'),
	Note = mongoose.model('Note'),
	_ = require('lodash');

/**
 * Show the current insurance
 */
exports.read = function(req, res) {
	res.json(req.note);
};

exports.createNote = function(req, res) {
	var note = new Note(req.body);
	note.user = req.user;
	note.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(note);
		}
	});
};

/**
 * Property middleware
 */
exports.noteById = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Note is invalid'
		});
	}

	Note.findById(id).exec(function(err, note) {
		if (err) return next(err);
		if (!insurance) {
			return res.status(404).send({
				message: 'Note not found'
			});
		}
		req.note = note;
		next();
	});
};
