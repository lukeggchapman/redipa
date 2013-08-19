/*global define*/

define(['backbone', 'models/ticket'], function (Backbone, Ticket) {
	"use strict";

	return Backbone.Collection.extend({

		/**
         * Type of model that this collection contains.
         */
		model: Ticket
	});
});