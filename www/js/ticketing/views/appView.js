/*global define, cordova*/

define(['backbone', 'underscore', 'collections/tickets', 'jquery', 'jquerymobile'], function (Backbone, _, TicketsCollection, $) {
	'use strict';
	return Backbone.View.extend({

		tickets: undefined,

		EVENTS: {
			READY: 'ready'
		},

		events: {
			"click .btn-scan" : "scan"
		},

		initialize: function () {
			this.scanner = window.cordova ? cordova.require("com.phonegap.plugins.barcodescanner.barcodescanner") : {};
			if (!window.localStorage.getItem('tickets')) {
				console.log('Loading tickets from JSON...');
				$.getJSON('js/ticketing/data/tickets.json')
				.done(function () {
					console.log('Fetching tickets completed');
				})
				.fail(function () {
					var errorMsg = 'An error occured while fetching the tickets';
					if (window.navigator.notification) {
						window.navigator.notification.alert(
							errorMsg,
							function callback() {
								// reset local storage
								window.localStorage.clear();
							},
							'Error',
							'Close'
						);
					} else {
						window.alert(errorMsg);
					}
				})
				.always(_.bind(this.ready, this));
			} else {
				this.ready(null);
			}
			return this;
		},

		ready: function (data) {
			this.tickets = new TicketsCollection(data);
			if (!data) {
				this.tickets.fetch();
			}
			this.$el.removeClass("hide");
		},

		// Test Object:
		// {"text":"l2VK0lQdGQ", "format":"QRCode","cancelled":false}
		scan: function () {
			this.scanner.scan(_.bind(this.ticketScanned, this), _.bind(this.ticketFailed, this));
		},

		ticketScanned: function (result) {
			var ticket = this.tickets.where({ticket: result.text});
			if (ticket.length == 1) {
				// TODO: write success UI
				alert('ticket' + ticket[0].get("description"));
			} else {
				// TODO: write error UI
				alert("Ticket Error");
			}
		},

		ticketFailed: function (error) {
			alert("Scanning failed: " + error);
		}
	});
});