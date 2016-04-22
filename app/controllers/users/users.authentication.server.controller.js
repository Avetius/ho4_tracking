'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	config = require('../../../config/config'),
	sendgrid  = require('sendgrid')(config.sendgrid_api),
	crypto = require('crypto'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	Policy = mongoose.model('Policy');

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var residentObj = req.body;
	var user = new User({
		firstName: residentObj.firstName,
		lastName: residentObj.lastName,
		email: residentObj.email,
		password: residentObj.password,
		propertyID: residentObj.propertyID
	});
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;
	user.username = user.email;
	user.verifyToken = crypto.randomBytes(32).toString('base64').replace(/[^A-Z0-9]+/ig, "_");

	// Then save the user
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;
			var profile = new Profile({
				user: user._id
			});
			profile.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					req.login(user, function (err) {
						if (err) {
							res.status(400).send(err);
						} else {
							res.render('templates/email-verify', {
								name: user.displayName,
								url: 'http://' + req.headers.host + '/user/verify?token=' + user.verifyToken
							}, function(err, emailHTML) {
								sendgrid.send({
									to: user.email,
									from: 'enterscompliance@veracityins.com',
									subject: user.displayName + ' Please verify your email address ',
									html: emailHTML
								}, function (err, json) {
									console.log(json);
								});
								res.json(user);
							});
							/*var emailHTML = '<table width="100%" align="center" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">';
							 emailHTML += '<tbody><tr>';
							 emailHTML += '<td width="100%" align="left" bgcolor="#FFFFFF" style="padding:0px 0px 0px 0px; color:#000000; text-align:left">';
							 emailHTML += '<table width="100%" align="center" cellspacing="0" cellpadding="0" border="0" style="display:none!important; visibility:hidden; color:transparent; height:0; width:0" class="x_module x_preheader x_preheader-hide">';
							 emailHTML += '<tbody><tr><td><p></p></td></tr></tbody></table>';
							 emailHTML += '<table width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed" class="x_module">';
							 emailHTML += '<tbody><tr><td bgcolor="#ffffff" style="padding:0px 0px 0px 0px">';
							 emailHTML += '<div><span class="x_sg-image"><img width="250" height="71" style="width:250px; height:71px" src="https://marketing-image-production.s3.amazonaws.com/uploads/05ecfeceadcbb1b43ca02460647f0bc083e6d47e0dafd49445e50f1d6cf75625641df17d5e3ec20193c2f6af04b64bc580b42ab4ac8c04137912f0dd450ce51e.png"></span></div>';
							 emailHTML += '<div></div><div>&nbsp;</div>';
							 emailHTML += '<div>Hi <span style="color:rgb(34,34,34); font-family:Menlo,Monaco,'Andale Mono','lucida console','Courier New',monospace; font-size:13px; line-height:19.5px; white-space:pre; background-color:rgb(251,251,252)">'+ user.displayName +'</span>,</div>';
							 emailHTML += '<div><br>Thanks for creating an account with RLL.</div>';
							 emailHTML += '<div><br><div>Click below to confirm your email address:</div></div>';
							 var verifyURL = 'http://127.0.0.1:3000/user/verify?token=' + user.verifyToken;
							 emailHTML += '<a href="'+verifyURL+'">'+verifyURL+'</a>';
							 emailHTML += '<div><br>If you have problems, please paste the above URL into your web browser.<br>&nbsp;</div>';
							 emailHTML += '<div><br>Thanks,<br>RLL Support</div><div>&nbsp;</div>';
							 emailHTML += '</td></tr></tbody></table></td></tr></tbody></table>';
							 sendgrid.send({
							 to: user.email,
							 from: 'enterscompliance@veracityins.com',
							 subject: user.displayName + ' Please verify your email address ',
							 html: emailHTML
							 }, function (err, json) {
							 console.log(json);
							 });*/

						}
					});
				}
			});
		}
	});
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {

		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function(err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};
