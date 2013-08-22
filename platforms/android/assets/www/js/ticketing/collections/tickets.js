/*global define*/

define(['backbone', 'models/ticket', 'localstorage'], function (Backbone, Ticket) {
	"use strict";

	return Backbone.Collection.extend({

		/**
         * Type of model that this collection contains.
         */
		model: Ticket,

		localStorage: new Backbone.LocalStorage('tickets'),

		initialize: function () {
			// console.log(this);
			window.tickets = this;
		},

		setScannedTicket: function (id) {
			var ticket = this.get(id);
			if (!ticket) {
				var errorMsg = 'The ticket ID:' + id + ' does not exist in our database';
				if (window.navigator.notification) {
					window.navigator.notification.alert(
						errorMsg,
						null,
						'Error',
						'Close'
					);
				} else {
					window.alert(errorMsg);
				}
				return this;
			}
			ticket.set('scanned', true);
			this.localStorage.update(ticket);
			return ticket;
		}
	});
});