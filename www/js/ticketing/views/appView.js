/*global define, cordova*/

define(['backbone', 'underscore', 'collections/tickets', 'jquery', 'jquerymobile'], function (Backbone, _, TicketsCollection, $) {
	'use strict';
	return Backbone.View.extend({

		tickets: undefined,

		scanInProgress: false,

		EVENTS: {
			READY: 'ready'
		},

		events: {
			"touchstart .btn-scan" : "scan",
			"touchstart .btn-search" : "showSearch",
			"touchstart .btn-search-close" : "hideSearch",
			"touchstart .btn-search-action" : "search",
			"touchstart .btn-seach-result" : "showSearchResult",
			"touchstart .btn-process" : "processSearchedTicket"
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
		// {"text":"x5nSs39hpN", "format":"QRCode","cancelled":false}
		// {"text":"CRVheXlM4g", "format":"QRCode","cancelled":false}
		// {"text":"CRoztoO02L", "format":"QRCode","cancelled":false}
		// {"text":"NGirt6Hs9I", "format":"QRCode","cancelled":false}
		// {"text":"H5eMs4kl3l", "format":"QRCode","cancelled":false}
		scan: function () {
			if (!this.scanInProgress) {
				this.scanInProgress = true;
				this.hideSearch();
				// Remove all other classes (ticket type)
				this.$el.find('.ticketDetails').attr('class', 'ticketDetails').find('.errormsg').addClass('hide');
				this.$el.find('.successmsg').addClass('hide');
				this.scanner.scan(_.bind(this.ticketScanned, this), _.bind(this.ticketFailed, this));
			} else {
				var self = this;
				setTimeout(function () {
					self.scanInProgress = false;
				}, 3000);
			}
		},

		ticketScanned: function (result) {
			var ticketArr = this.tickets.where({ticket: result.text});
			var ticketDetails;
			if (ticketArr.length == 1) {
				var ticket = ticketArr[0];
				this.setTicketFields(ticket, '.ticketDetails');
				ticketDetails = this.$el.find('.ticketDetails');
				if (ticket.get('scanned')) {
					ticketDetails.addClass("errorScanned");
					ticketDetails.find('.errormsg').html("Ticket already scanned!");
				} else {
					this.tickets.setScannedTicket(ticket.id);
					if (ticket.get('type') == 'crew') {
						ticketDetails.find('.successmsg').removeClass('hide').html("Valid Crew Ticket!");
					} else {
						ticketDetails.find('.successmsg').removeClass('hide').html("Valid Ticket!");
					}
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
			this.scanInProgress = false;
		},

		setTicketFields: function (ticket, selector) {
			var ticketDetails = this.$el.find(selector).addClass(ticket.get("type"));
			ticketDetails.find(".purchaseId").val(ticket.get("purchaseId"));
			ticketDetails.find(".ticket").val(ticket.get("ticket"));
			ticketDetails.find(".email").val(ticket.get("email"));
			ticketDetails.find(".description").val(ticket.get("description"));
			ticketDetails.find(".category").val(ticket.get("category"));
			ticketDetails.find(".cost").val(ticket.get("cost"));
		},

		ticketFailed: function (error) {
			var ticketDetails = this.$el.find('.ticketDetails').addClass("error");
			ticketDetails.find('.errormsg').html("Scanning failed: " + error);
			this.scanInProgress = false;
		},

		showSearch: function () {
			this.$el.find('.ticketDetails').attr('class', 'ticketDetails');
			this.$el.find('.search').removeClass("hide");
		},

		hideSearch: function () {
			this.$el.find('.search').addClass("hide");
			this.$el.find('.resultTicket').attr('class', 'resultTicket hide');
			this.$el.find('.search .errormsg').addClass('hide');
			this.$el.find('.search .search-msg').addClass('hide');
			this.$el.find('.resultTicket').addClass('hide');
			this.$el.find('.search .resultList').html('');
		},

		search: function () {
			var searchEmail = this.$el.find('.search #search-email').val();
			var searchResult = this.tickets.filter(function (ticket) {
				return ticket.get('email').indexOf(searchEmail) > -1;
			});
			var resultList = this.$el.find('.search .resultList');
			resultList.html('');
			this.$el.find('.resultTicket').attr('class', 'resultTicket hide');
			this.$el.find('.search .errormsg').addClass('hide');
			this.$el.find('.search .search-msg').addClass('hide');
			var ticketScanned;

			if (searchResult.length === 0) {
				this.$el.find('.search .errormsg').html('No Tickets Found');
			} else {
				_.each(searchResult, function (ticket) {
					ticketScanned = ticket.get('scanned') ? 'ticket-scanned ' : '';
					resultList.append('<a class="' + ticketScanned + 'ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-left ui-btn-up-e btn-seach-result" data-id="' + ticket.id + '">' + ticket.get('email') + '</a>');
				});
			}
		},

		showSearchResult: function (event) {
			this.$el.find('.search .resultTicket').attr('class', 'resultTicket');
			var ticket = this.tickets.get($(event.target).data('id'));
			this.$el.find('.search .resultTicket').removeClass('hide').find('.btn-process').data('id', ticket.id);
			if (ticket.get('scanned')) {
				this.$el.find('.search .resultTicket').addClass("error");
			}
			this.setTicketFields(ticket, '.search .resultTicket');
		},

		processSearchedTicket: function (event) {
			var ticket = this.tickets.where({id: this.$el.find('.search .resultTicket .btn-process').data('id')})[0];
			if (ticket.get('scanned')) {
				this.$el.find('.search .errormsg').removeClass('hide').html("Ticket has previously been scanned!");
			} else {
				this.tickets.setScannedTicket(ticket.id);
				this.$el.find('.search-msg').removeClass('hide').html("Ticket Processed!");
				this.$el.find('.btn-seach-result[data-id="' + ticket.id + '"]').addClass('ticket-scanned');
			}
			this.$el.find('.resultTicket').attr('class', 'resultTicket hide');
		}
	});
});