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
			$.getJSON('/js/ticketing/data/tickets.json', _.bind(this.ready, this));

			return this;
		},

		ready: function (data) {
			this.tickets = new TicketsCollection(data);
			this.$el.removeClass("hide");
		},

		// Test Object:
		// {"text":"l2VK0lQdGQ", "format":"QRCode","cancelled":false}
		scan: function () {
			// Remove all other classes (ticket type)
			this.$el.find('.ticketDetails').attr('class', 'ticketDetails');
			this.scanner.scan(_.bind(this.ticketScanned, this), _.bind(this.ticketFailed, this));
		},

		ticketScanned: function (result) {
			var ticket = this.tickets.where({ticket: result.text});
			if (ticket.length == 1) {
				this.setTicketFields(ticket[0]);
				// alert('ticket' + ticket[0].get("description"));
			} else {
				var ticketDetails = this.$el.find('.ticketDetails').addClass("error");
				var msg;
				if (ticket.length > 1) {
					msg = "Duplicate ticket found!";
				} else {
					msg = "No ticket Found!";
				}
				ticketDetails.find('.errormsg').html(msg);
			}
		},

		setTicketFields: function (ticket) {
			var ticketDetails = this.$el.find('.ticketDetails').addClass(ticket.get("type"));
			ticketDetails.find("#purchaseId").val(ticket.get("purchaseId"));
			ticketDetails.find("#ticket").val(ticket.get("ticket"));
			ticketDetails.find("#email").val(ticket.get("email"));
			ticketDetails.find("#description").val(ticket.get("description"));
			ticketDetails.find("#category").val(ticket.get("category"));
		},

		ticketFailed: function (error) {
			var ticketDetails = this.$el.find('.ticketDetails').addClass("error");
			ticketDetails.find('.errormsg').html("Scanning failed: " + error);
		}
	});
});