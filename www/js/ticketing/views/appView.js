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
			this.scanner = cordova.require("com.phonegap.plugins.barcodescanner.barcodescanner");
			$.mobile.loading('show', {
				text: 'Loading...',
				textVisible: true,
				theme: 'a',
				html: ""
			});

			$.getJSON('/js/ticketing/data/tickets.json', _.bind(this.ready, this));

			return this;
		},

		ready: function (data) {
			this.tickets = new TicketsCollection(data);
			$.mobile.loading('hide');
			this.$el.removeClass('hide');
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
				console.log('ticket', ticket);
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