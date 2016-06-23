'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../config/config'),
	sendgrid  = require('sendgrid')(config.sendgrid_api);

/**
 * Update user details
 */
exports.send = function (templateId, template_params, email, subject, text, done) {
	// Init Variables

	var sendEmail = new sendgrid.Email({
		to: email,
		from: 'enterscompliance@veracityins.com',
		subject: subject,
		html: '<h2>'+text+'</h2>',
		text:  text
	});
	sendEmail.setFilters({"templates": {"settings": {"enabled": 1, "template_id": templateId}}});
	_.each(template_params, function(item) {
		sendEmail.addSubstitution(item.key, item.val);
	});
	sendgrid.send(sendEmail, function (err, json) {
		console.log(json);
		done(err, json);
	});
};

exports.sendContactEmail = function (data, done) {
	sendgrid.send({
		to: 'enterscompliance@veracityins.com',
		from: data.email,
		subject: 'New inquiry received on HO4 Tracking system',
		text:  data.message
	}, function (err, json) {
		console.log(json);
		done(err, json);
	});
};
