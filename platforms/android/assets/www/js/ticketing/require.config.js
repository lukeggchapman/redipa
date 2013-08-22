/*global require, define */

require.config({
	baseUrl: 'js/ticketing',
	paths: {
		jquery: '../vendor/jquery',
		jquerymobile: '../vendor/jquery.mobile',
		underscore: '../vendor/underscore',
		backbone: '../vendor/backbone',
		localstorage: '../vendor/backbone.localStorage'
	},
	shim: {
		jquery: {
			exports: function () {
				'use strict';
				return this.jQuery;
			}
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		}
	}
});

// Includes File Dependencies
require(["jquery", "app", "jquerymobile"], function ($, ticketingApp) {
	"use strict";

	// Prevents all anchor click handling
	$.mobile.linkBindingEnabled = false;

	// Disabling this will prevent jQuery Mobile from handling hash changes
	$.mobile.hashListeningEnabled = false;

	ticketingApp.init();
});