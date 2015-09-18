/*! backbone.syncer - v0.1.0 - 2015-09-17
* Copyright (c) 2015 Nacho Codoñer; Licensed MIT */

(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['backbone', 'underscore'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS
		var Backbone = require('backbone'),
			_ = require('underscore');

		module.exports = factory(Backbone, _);
	} else {
		// Browser globals
		factory(root.Backbone, root._);
	}
}(this, function (Backbone, _) {
	'use strict';

	Backbone.Syncer = {};

	Backbone.Syncer.VERSION =  '0.1.0';





}));
