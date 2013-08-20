/*global define*/

define(['backbone'], function (Backbone) {
	"use strict";

	return Backbone.Model.extend({

		defaults: function () {
			return {
				scanned: false
			};
		},

		initialize: function (options) {
			this.save();
			return this;
		}
	});
});