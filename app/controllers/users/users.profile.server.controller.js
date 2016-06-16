'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),
	async = require('async'),
	randomstring = require('randomstring'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Profile = mongoose.model('Profile'),
	Property = mongoose.model('Property'),
	Unit = mongoose.model('Unit'),
	Policy = mongoose.model('Policy'),
	config = require('../../../config/config'),
	emailHandler = require('../email.server.controller.js'),
	sendgrid  = require('sendgrid')(config.sendgrid_api);

/**
 * Update user details
 */
exports.update = function (req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function (err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function (req, res) {
	res.json(req.user || null);
};

exports.getProfileByUserId = function (req, res) {
	Profile.findOne({user: req.params.userId}).populate('user').exec(function (err, profile) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(profile);
		}
	});
};

exports.updateProfile = function (req, res) {
	var user = req.user;
	Profile.findOne({user: req.params.userId}).populate('user').exec(function (err, profile) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			profile = _.extend(profile, req.body);
			var email_changed = (user.email !== profile.user.email);
			var old_email = user.email;
			user.firstName = profile.user.firstName;
			user.lastName = profile.user.lastName;
			user.email = profile.user.email;
			user.username = profile.user.email;
			user.updated = Date.now();
			user.displayName = user.firstName + ' ' + user.lastName;
			profile.save(function (err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					crypto.randomBytes(20, function(err, buffer) {
						if (email_changed) {
							user.resetPasswordToken = buffer.toString('hex');
							user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
						}
						user.save(function (err) {
							if (err) {
								var message = errorHandler.getErrorMessage(err);
								if (message.indexOf('already exists') > -1) message = 'Email already exists';
								return res.status(400).send({
									message: message
								});
							} else {
								if (email_changed) {
									var params = [{
										key: '-email_address-',
										val: user.email
									}, {
										key: '-reset_link-',
										val: 'http://' + req.headers.host + '/auth/reset/' + user.resetPasswordToken
									}, {
										key: '-setting_link-',
										val: 'http://' + req.headers.host + '/#!/settings/password'
									}];
									emailHandler.send('db13173b-794e-4f71-98f6-8968fa50f365', params, old_email, 'Recovery Email Changed', 'Recovery Email Changed', function (err, result) {
										console.log(err);
									});
								}
								res.json(profile);
							}
						});
					});
				}
			});

		}
	});
};

exports.uploadInsurance = function (req, res) {
	var files = req.files;
	if (files.file) {
		if (!fs.existsSync(path.resolve('public/insurance'))) {
			fs.mkdirSync(path.resolve('public/insurance'), '0777');
		}
		var fileName = files.file.name;
		var i = fileName.lastIndexOf('.');
		var fileExt = (i < 0) ? '' : fileName.substr(i);
		var newFileName = crypto.randomBytes(32).toString('base64');
		newFileName = newFileName.replace(/[=&\/\\#,+()$~%.'":*?<>{}]/g, '').replace(/\s/g, '');
		fs.rename(files.file.path, path.resolve('public/insurance/' + newFileName + fileExt), function () {
			res.jsonp({
				file: '/insurance/' + newFileName + fileExt,
				path: '/insurance/' + newFileName + fileExt,
				is_pdf: fileExt.indexOf('pdf') > -1
			});
		});
	} else {
		res.status(400).send({error: 'File upload error'});
	}
};

exports.getPoliciesByUserId = function (req, res) {
	Policy.find({user: req.params.userId}).populate('user').exec(function (err, policies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(policies);
		}
	});
};

exports.getPolicies = function (req, res) {
	var query = {user: req.user._id};
	if (req.user.roles.indexOf('admin') > -1) {
		query = {};
	}
	Policy.find(query).populate('user').sort('-updated').exec(function (err, policies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(policies);
		}
	});
};

exports.createPolicy = function (req, res) {
	var policy = new Policy(req.body);
	if (req.body.unitNumber && typeof req.body.unitNumber === 'object') {
		policy.unitNumber = req.body.unitNumber.unitNumber;
	}
	policy.user = req.user;
	if (policy.insuranceFilePath && policy.insuranceFilePath !== '' && policy.policyHolderName  && policy.policyHolderName !== '') policy.status = 'pending';
	else policy.status = 'incomplete';
	policy.updated = Date.now();
	policy.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(policy.status == 'incomplete') {
				var params = [{
					key: '-firstName-',
					val: req.user.firstName
				}, {
					key: '-note-',
					val: 'Insurance File is missing.'
				}];
				emailHandler.send('d3a9e377-6f76-4a78-9db5-d97b2527fe6b', params, req.user.email, 'You didn\'t complete the set up of the account', 'You didn\'t complete the set up of the account', function (err, result) {
					console.log(err);
				});
			}
			Unit.findOne({unitNumber: policy.unitNumber, resident: req.user._id}).populate('property').exec(function(err, unit) {
				if(unit && unit.property) {
					User.findOne({_id: unit.property.propertyManager}).exec(function(err, pmanager) {
						var params = [{
							key: '-firstName-',
							val: pmanager.firstName
						}, {
							key: '-Resident First Name and Last Name-',
							val: req.user.displayName
						}, {
							key: '-Unit#-',
							val: unit?unit.unitNumber:''
						}, {
							key: '-Property Name-',
							val: unit?unit.property.propertyName:''
						}, {
							key: '-link to resident\'s certificate on PM pr admin side-',
							val: unit?'http://' + req.headers.host + '/#!/'+'property_insurances/'+unit.property._id+'/'+unit._id+'/insurances/'+policy._id:''
						}];
						emailHandler.send('9eba3959-a659-473a-bfc0-a29612548a9b', params, pmanager.email, 'Insurance Certificate Changes', 'Insurance Certificate Changes', function (err, result) {
							console.log(err);
						});
					});
				}
				User.findOne({roles:'admin'}).exec(function(err, admin) {
					var params = [{
						key: '-firstName-',
						val: admin.firstName
					}, {
						key: '-Resident First Name and Last Name-',
						val: req.user.displayName
					}, {
						key: '-Unit#-',
						val: unit?unit.unitNumber:''
					}, {
						key: '-Property Name-',
						val: unit?unit.property.propertyName:''
					}, {
						key: '-link to resident\'s certificate on PM pr admin side-',
						val: unit?'http://' + req.headers.host + '/#!/' + 'properties/'+unit.property._id+'/units/'+unit._id+'/:residentId/insurances/'+policy._id:''
					}];
					emailHandler.send('9eba3959-a659-473a-bfc0-a29612548a9b', params, admin.email, 'Insurance Certificate Changes', 'Insurance Certificate Changes', function (err, result) {
						console.log(err);
					});
				});
			});
			if (req.body.unitNumber && typeof req.body.unitNumber === 'object') {
				Unit.update({resident: req.user._id}, {$unset: {resident: 1 }}, function(err, data) {
					Unit.update({_id: req.body.unitNumber._id}, {resident: req.user._id}, function (err, data) {
						res.json(policy);
					});
				});
			} else {
				res.json(policy);
			}
		}
	});
};

exports.getPolicy = function (req, res) {
	Policy.findOne({_id: req.params.policyId}).populate('user', 'propertyID').exec(function (err, policy) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!policy) {
			return res.status(404).send({
				message: 'Policy is invalid'
			});
		}
		Unit.findOne({resident: policy.user._id, property: policy.user.propertyID}).populate('property').exec(function(err, unit) {
			res.json({insurance: policy, unit: unit});
		});
	});
};

exports.updatePolicy = function (req, res) {
	Policy.findOne({_id: req.params.policyId}).populate('user').exec(function (err, policy) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!policy) {
			return res.status(404).send({
				message: 'Policy is invalid'
			});
		}
		var policy_user = policy.user;
		policy = _.extend(policy, req.body);
		if (req.body.unitNumber && typeof req.body.unitNumber === 'object') {
			policy.unitNumber = req.body.unitNumber.unitNumber;
		}
		if (policy.insuranceFilePath && policy.insuranceFilePath !== '' && policy.policyHolderName  && policy.policyHolderName !== '') policy.status = 'pending';
		else policy.status = 'incomplete';
		policy.updated = Date.now();
		policy.save(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				if(policy.status == 'incomplete') {
					var params = [{
						key: '-firstName-',
						val: policy_user.firstName
					}, {
						key: '-note-',
						val: 'Insurance File is missing.'
					}];
					emailHandler.send('d3a9e377-6f76-4a78-9db5-d97b2527fe6b', params, policy_user.email, 'You didn\'t complete the set up of the account', 'You didn\'t complete the set up of the account', function (err, result) {
						console.log(err);
					});
				}
				Unit.findOne({unitNumber: policy.unitNumber, resident: req.user._id}).populate('property').exec(function(err, unit) {
					if(unit && unit.property) {
						User.findOne({_id: unit.property.propertyManager}).exec(function(err, pmanager) {
							var params = [{
								key: '-firstName-',
								val: pmanager.firstName
							}, {
								key: '-Resident First Name and Last Name-',
								val: req.user.displayName
							}, {
								key: '-Unit#-',
								val: unit?unit.unitNumber:''
							}, {
								key: '-Property Name-',
								val: unit?unit.property.propertyName:''
							}, {
								key: '-link to resident\'s certificate on PM pr admin side-',
								val: unit?'http://' + req.headers.host + '/#!/'+'property_insurances/'+unit.property._id+'/'+unit._id+'/insurances/'+policy._id:''
							}];
							emailHandler.send('9eba3959-a659-473a-bfc0-a29612548a9b', params, pmanager.email, 'Insurance Certificate Changes', 'Insurance Certificate Changes', function (err, result) {
								console.log(err);
							});
						});
					}
					User.findOne({roles:'admin'}).exec(function(err, admin) {
						var params = [{
							key: '-firstName-',
							val: admin.firstName
						}, {
							key: '-Resident First Name and Last Name-',
							val: req.user.displayName
						}, {
							key: '-Unit#-',
							val: unit?unit.unitNumber:''
						}, {
							key: '-Property Name-',
							val: unit?unit.property.propertyName:''
						}, {
							key: '-link to resident\'s certificate on PM pr admin side-',
							val: unit?'http://' + req.headers.host + '/#!/' + 'properties/'+unit.property._id+'/units/'+unit._id+'/:residentId/insurances/'+policy._id:''
						}];
						emailHandler.send('9eba3959-a659-473a-bfc0-a29612548a9b', params, admin.email, 'Insurance Certificate Changes', 'Insurance Certificate Changes', function (err, result) {
							console.log(err);
						});
					});
				});
				if (req.body.unitNumber && typeof req.body.unitNumber === 'object') {
					Unit.update({resident: policy_user._id}, {$unset: {resident: 1 }}, function(err, data) {
						Unit.update({_id: req.body.unitNumber._id}, {resident: policy_user._id}, function(err, data) {
							res.json(policy);
						});
					});

				} else {
					res.json(policy);
				}
			}
		});
	});
};

exports.getAllResidentsList = function (req, res) {
	User.find({roles: 'user'}).exec(function (err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.json(users);
	});
};

exports.getAllPropertyManagerList = function (req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var query = {roles: 'pmanager'};
	User.count(query, function (err, count) {
		User.find(query).limit(num).skip(start).exec(function (err, users) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			Property.find({}).sort('propertyName').exec(function (err, properties) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				var user_property_callbacks = [];
				_.each(users, function (user) {
					user_property_callbacks.push(function (cb) {
						Profile.findOne({user: user._id}).exec(function(err, profile) {
							var tmp_user = user.toObject();
							tmp_user.phoneNumber = profile?profile.phoneNumber:'';
							Property.find({propertyManager: user._id}).sort('propertyName').exec(function (err, assigned_properties) {

								tmp_user.assigned_properties = assigned_properties;

								cb(err, tmp_user);
							});
						})
					});
				});
				async.parallel(user_property_callbacks, function (err, results) {
					res.json({count: count, property_managers: results, properties: properties});
				});
			});
		});
	});
};

exports.addPropertyManager = function (req, res) {
	var password = randomstring.generate(8);
	var propertyManager = new User(req.body);
	propertyManager.displayName = propertyManager.firstName + ' ' + propertyManager.lastName;
	propertyManager.username = propertyManager.email;
	propertyManager.roles = ['pmanager'];
	propertyManager.provider = 'local';
	propertyManager.password = password;
	propertyManager.updated = Date.now();
	propertyManager.save(function (err) {
		if (err) {
			var message = errorHandler.getErrorMessage(err);
			if(message.indexOf('already exists') > -1) message = 'Email already exists';
			return res.status(400).send({
				message: message
			});
		} else {
			var profile = new Profile({
				user: propertyManager._id,
				phoneNumber: req.body.phoneNumber
			});
			profile.save(function (err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				var assigned_property_ids = [];
				_.each(req.body.assigned_properties, function (property) {
					assigned_property_ids.push(property._id);
				});
				Property.update({_id: {$in: assigned_property_ids}}, {propertyManager: propertyManager._id}, {multi: true}, function (err, result) {
					var property_names = '';
					Property.find({_id: {$in: assigned_property_ids}}).exec(function(err, properties) {
						_.each(properties, function(property_item, i) {
							property_names += property_item.propertyName;
							if(i < properties.length-1) property_names += ', ';
						});
						if(assigned_property_ids.length > 0) {
							var params = [{
								key: '-firstName-',
								val: propertyManager.firstName
							}, {
								key: '-property_name-',
								val: property_names
							}, {
								key: '-property_manager_email-',
								val: propertyManager.email
							}, {
								key: '-password-',
								val: password
							}, {
								key: '-link-',
								val: 'http://' + req.headers.host + '/#!/signin'
							}];
							emailHandler.send('db25d056-0667-49a8-aec7-af46680e6132', params, propertyManager.email, 'You\'ve been assigned to a property', 'You\'ve been assigned to a property', function (err, result) {
								console.log(err);
							});
						}
						res.json(propertyManager);
					});
				});
			});
		}
	});
};

exports.getPropertyManager = function (req, res) {
	User.findById(req.params.propertyManagerId).exec(function (err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		Profile.findOne({user: user._id}).exec(function (err, profile) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			user.phoneNumber = profile.phoneNumber;
			res.json(user);
		});
	});
};

exports.updatePropertyManager = function (req, res) {
	var updateObj = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		displayName: req.body.firstName + ' ' + req.body.lastName
	};
	var phoneNumber = req.body.phoneNumber || '';
	User.update({_id: req.params.propertyManagerId}, updateObj, function (err, user) {
		if (err) {
			var message = errorHandler.getErrorMessage(err);
			if(message.indexOf('already exists') > -1) message = 'Email already exists';
			return res.status(400).send({
				message: message
			});
		}

		Profile.update({user: req.params.propertyManagerId}, {phoneNumber: phoneNumber}, function (err, profile) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			Property.update({propertyManager: req.params.propertyManagerId}, {propertyManager: null}, {multi: true}, function (err, result) {
				var assigned_property_ids = [];
				_.each(req.body.assigned_properties, function (property) {
					assigned_property_ids.push(property._id);
				});
				Property.update({_id: {$in: assigned_property_ids}}, {propertyManager: req.params.propertyManagerId}, {multi: true}, function (err, result) {
					res.json(user);
				});
			});
		});
	})
};

exports.deletePropertyManager = function (req, res) {
	User.findById(req.params.propertyManagerId).exec(function (err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		user.remove(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(user);
			}
		});
	});
};

exports.getAllResidentList = function (req, res) {
	var start = req.query.start;
	var num = req.query.num;
	var transfer = req.query.transfer;
	var query = {roles: 'user'};
	if(transfer==='true') query = {roles: 'user', rllCoverage: true};
	else if(transfer==='false') query = {roles: 'user', rllCoverage: {$ne: true}};
	User.find(query).exec(function(err, users) {
		var user_policy_callbacks = [];
		_.each(users, function (user) {
			user_policy_callbacks.push(function (cb) {
				Property.findOne({_id: user.propertyID}).exec(function(err, property) {
					Unit.findOne({unitNumber: user.appartmentNumber, property: user.propertyID}).exec(function(err, unit) {
						Policy.count({user: user._id}, function (err, policy_count) {
							var tmp_user = user.toObject();
							tmp_user.policy_count = policy_count;
							tmp_user.property = property;
							tmp_user.appartmentNumber = unit;
							cb(err, tmp_user);
						});

					});
				});
			});
		});
		async.parallel(user_policy_callbacks, function (err, results) {
			var display_residents = [];
			_.each(results, function(item) {
				if(item.property && item.appartmentNumber) display_residents.push(item);
			});
			var returnResult = display_residents.slice(start, (start + num));
			res.json({count: display_residents.length, residents: returnResult});
		});
	});
};

exports.addResident = function (req, res) {
	var password = randomstring.generate(8);
	var resident = new User(req.body);
	var inviteResident = req.body.invite;
	if (req.body.appartmentNumber && typeof req.body.appartmentNumber === 'object') {
		resident.appartmentNumber = req.body.appartmentNumber.unitNumber;
	} else {
		resident.appartmentNumber = req.body.appartmentNumber;

	}
	resident.propertyID = req.body.property._id;
	resident.displayName = resident.firstName + ' ' + resident.lastName;
	resident.username = resident.email;
	resident.roles = ['user'];
	resident.provider = 'local';
	resident.password = password;
	resident.updated = Date.now();
	resident.save(function (err) {
		if (err) {
			var message = errorHandler.getErrorMessage(err);
			if(message.indexOf('already exists') > -1) message = 'Email already exists';
			return res.status(400).send({
				message: message
			});
		} else {
			var profile = new Profile({
				user: resident._id
			});
			profile.save(function (err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}

				if (req.body.appartmentNumber && typeof req.body.appartmentNumber === 'object') {
					Unit.findById(req.body.appartmentNumber._id).populate('property', 'propertyName').exec(function (err, unit) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}
						unit.resident = resident._id;
						unit.save(function (err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							}
							if (inviteResident) {
								var params = [{
									key: '-firstName-',
									val: resident.firstName
								},{
									key: '-resident_email-',
									val: resident.email
								}, {
									key: '-password-',
									val: password
								}, {
									key: '-link-',
									val: 'http://' + req.headers.host + '/#!/insurances'
								}, {
									key: '-unit_number-',
									val: unit?unit.unitNumber:''
								}, {
									key: '-property_name-',
									val: req.body.property.propertyName
								}];
								emailHandler.send('18ee0a51-e673-4538-a9f6-fd449e8822cb', params, resident.email, 'Please upload your Insurance Certificate', 'Please upload your Insurance Certificate', function (err, result) {
									console.log(err);
								});
								res.json(resident);
							} else {
								res.json(resident);
							}
						});
					});
				} else {
					var unit = new Unit({
						unitNumber: req.body.appartmentNumber,
						property: req.body.property._id,
						resident: resident._id
					});
					unit.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}
						var unitCount = req.body.property.totalUnits + 1;
						Property.update({_id: req.body.property._id}, {totalUnits: unitCount}, function(err, response) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							}
							if (inviteResident) {
								var params = [{
									key: '-firstName-',
									val: resident.firstName
								},{
									key: '-resident_email-',
									val: resident.email
								}, {
									key: '-password-',
									val: password
								}, {
									key: '-link-',
									val: 'http://' + req.headers.host + '/#!/insurances'
								}, {
									key: '-unit_number-',
									val: req.body.appartmentNumber
								}, {
									key: '-property_name-',
									val: req.body.property.propertyName
								}];
								emailHandler.send('18ee0a51-e673-4538-a9f6-fd449e8822cb', params, resident.email, 'Please upload your Insurance Certificate', 'Please upload your Insurance Certificate', function (err, result) {
									console.log(err);
								});
								res.json(resident);
							} else {
								res.json(resident);
							}
						});
					});
				}
			});
		}
	});
};

exports.getResident = function (req, res) {
	User.findById(req.params.residentId).exec(function (err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		Unit.findOne({property: user.propertyID, resident: user._id}).populate('property').exec(function(err, unit) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}	else {
				var temp_user = user.toObject();
				temp_user.unit = unit;
				res.json(temp_user);
			}
		});
	});
};

exports.updateResident = function (req, res) {
	var updateObj = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		displayName: req.body.firstName + ' ' + req.body.lastName,
		username: req.body.email
	};

	if (req.body.appartmentNumber && typeof req.body.appartmentNumber === 'object') {
		updateObj.appartmentNumber = req.body.appartmentNumber.unitNumber;
	} else {
		if(req.body.appartmentNumber)
			updateObj.appartmentNumber = req.body.appartmentNumber;
	}
	if(req.body.property)
		updateObj.propertyID = req.body.property._id;
	User.update({_id: req.params.residentId}, updateObj, function (err, user) {
		if (err) {
			console.log(err)
			var message = errorHandler.getErrorMessage(err);
			if(message.indexOf('already exists') > -1) message = 'Email already exists';
			return res.status(400).send({
				message: message
			});
		}
		if (req.body.appartmentNumber && typeof req.body.appartmentNumber === 'object') {
			Unit.findById(req.body.appartmentNumber._id).exec(function (err, unit) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}
				unit.resident = req.params.residentId;
				unit.save(function (err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}
					res.json(user);
				});
			});
		} else {
			if(req.body.appartmentNumber && req.body.property) {
				var unit = new Unit({
					unitNumber: req.body.appartmentNumber,
					property: req.body.property._id,
					resident: req.params.residentId
				});
				unit.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}
					var unitCount = req.body.property.totalUnits + 1;
					Property.update({_id: req.body.property._id}, {totalUnits: unitCount}, function (err, response) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}
						res.json(user);
					});
				});
			} else {
				res.json(user);
			}
		}
	})
};

exports.deleteResident = function (req, res) {
	User.findById(req.params.residentId).exec(function (err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		user.remove(function (err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(user);
			}
		});
	});
};

exports.transferResidentsRLLCoverage = function(req, res) {
	var residentIds = req.body.residentIds;
	User.update({_id: {$in:residentIds}}, {rllCoverage: true}, {multi: true}, function (err, user) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.json({success: true});
	})
};

exports.sendContactEmail = function(req, res) {
	var data = req.body;
	emailHandler.sendContactEmail(data, function (err, result) {
		console.log(err);
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		res.json({message: 'Contact message has been sent to site administrator'})
	});
};
