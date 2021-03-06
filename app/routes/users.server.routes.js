'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var multipart = require('connect-multiparty'),
	multipartMiddleware = multipart();
module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	app.route('/user/verify').get(users.verifyUser);

	app.route('/profiles/byuser/:userId')
		.get(users.requiresLogin, users.getProfileByUserId)
		.put(users.requiresLogin, users.updateProfile);

	app.route('/user_policies/:userId').get(users.requiresLogin, users.getPoliciesByUserId);

	app.route('/policy')
		.get(users.requiresLogin, users.getPolicies)
		.post(users.requiresLogin, users.createPolicy);

	app.route('/policy/:policyId')
		.get(users.requiresLogin, users.getPolicy)
		.put(users.requiresLogin, users.updatePolicy);

	app.route('/upload_insurance').post(multipartMiddleware, users.uploadInsurance);

	app.route('/residents_list').get(users.requiresLogin, users.isPropertyManager, users.getAllResidentsList);

	app.route('/property_managers')
		.get(users.requiresLogin, users.isAdminUser, users.getAllPropertyManagerList)
		.post(users.requiresLogin, users.isAdminUser, users.addPropertyManager);

	app.route('/property_managers/:propertyManagerId')
		.get(users.requiresLogin, users.isAdminUser, users.getPropertyManager)
		.put(users.requiresLogin, users.isAdminUser, users.updatePropertyManager)
		.delete(users.requiresLogin, users.isAdminUser, users.deletePropertyManager);

	app.route('/residents')
		.get(users.requiresLogin, users.isAdminUser, users.getAllResidentList)
		.post(users.requiresLogin, users.isAdminUser, users.addResident);

	app.route('/allresidents')
		.get(users.requiresLogin, users.isAdminUser, users.getAllResitents);
	app.route('/residents/:residentId')
		.get(users.requiresLogin, users.isAdminUser, users.getResident)
		.put(users.requiresLogin, users.isAdminUser, users.updateResident)
		.delete(users.requiresLogin, users.isAdminUser, users.deleteResident);

	app.route('/transfer_residents_rll').post(users.requiresLogin, users.isAdminUser, users.transferResidentsRLLCoverage);

	app.route('/contact_email').post(users.sendContactEmail);
	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
