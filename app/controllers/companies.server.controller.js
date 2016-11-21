'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    Company = mongoose.model('Company'),
    emailHandler = require('./email.server.controller.js'),
    _ = require('lodash'),
    request = require('request');



exports.read = function(req, res) {
    res.json(req.property);
};


exports.update = function(req, res) {

};


exports.delete = function(req, res) {

};


exports.all_list = function(req, res) {
    Company.find({status:'active'}).exec(function (err, companies) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(companies);
        }
    });
};

exports.get_company_by_id = function(req, res) {
    Company.find({status:'active',mysql_id:req.params.companyId}).exec(function (err, companies) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(companies[0]);
        }
    });
};
