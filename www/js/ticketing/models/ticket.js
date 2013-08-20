/*global define*/

define(['backbone'], function (Backbone) {
	"use strict";

	return Backbone.Model.extend({

		initialize: function (options) {
			this.save();
			return this;
		}
	});
});