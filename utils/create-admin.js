var init = require('../config/init')(),
	config = require('../config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk');

require('../app/models/user.server.model');
require('../app/models/profile.server.model');
var User = mongoose.model('User');
var Profile = mongoose.model('Profile');

var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
	var newUser = User({
		firstName: 'Admin',
		lastName: 'User',
		displayName: 'Admin User',
		email: 'admin@admin.com',
		username: 'admin@admin.com',
		password: 'password',
		roles: ['admin'],
		provider: 'local'
	});

// save the user
	newUser.save(function(err) {
		if (err) throw err;
		var profile = new Profile({
			user: newUser._id
		});
		profile.save(function(err) {
			if (err) throw err;
			console.log('Admin User created!');
			mongoose.connection.close()
		});
	});


});
