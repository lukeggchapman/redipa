/*global define, cordova*/

define(['backbone', 'underscore', 'collections/tickets', 'jquery', 'jquerymobile'], function (Backbone, _, TicketsCollection, $) {
	'use strict';
	return Backbone.View.extend({

		tickets: undefined,

		EVENTS: {
			READY: 'ready'
		},

		events: {
			"touchstart .btn-scan" : "scan",
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
			// Remove all other classes (ticket type)
			this.$el.find('.ticketDetails').attr('class', 'ticketDetails');
			this.scanner.scan(_.bind(this.ticketScanned, this), _.bind(this.ticketFailed, this));
		},

		ticketScanned: function (result) {
			var ticketArr = this.tickets.where({ticket: result.text});
			var ticketDetails;
			if (ticketArr.length == 1) {
				var ticket = ticketArr[0];
				this.setTicketFields(ticket);
				if (ticket.get('scanned')) {
					ticketDetails = this.$el.find('.ticketDetails').addClass("errorScanned");
					ticketDetails.find('.errormsg').html("Ticket already scanned!");
				} else {
					this.tickets.setScannedTicket(ticket.id);
				}
			} else {
				ticketDetails = this.$el.find('.ticketDetails').addClass("error");
				var msg;
				if (ticketArr.length > 1) {
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
			ticketDetails.find("#cost").val(ticket.get("cost"));
		},

		ticketFailed: function (error) {
			var ticketDetails = this.$el.find('.ticketDetails').addClass("error");
			ticketDetails.find('.errormsg').html("Scanning failed: " + error);
		}
	});
});