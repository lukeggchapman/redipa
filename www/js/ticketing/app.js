/* globals define */
define(["views/appView"], function (AppView) {
	"use strict";

	return {
		appView: undefined,

		init: function () {
			this.appView = new AppView({
				el: '#ticketingapp'
			});
		}
	};

});