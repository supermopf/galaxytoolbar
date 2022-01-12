"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_auctioneer) galaxytoolbar.GTPlugin_auctioneer={};

galaxytoolbar.GTPlugin_auctioneer={
	oldBids: new Object(),
	found_auctioneer_sub_page: function(e) {
		if (!e) return;
		if (!e.target) return;
		if (e.target.nodeType != 3) return;
		if (!e.target.ownerDocument) return;
		var doc = e.target.ownerDocument;
		
		// different in Chrome: we need to delay this function, otherwise we run too early
		// (before the new bidder is written)
		setTimeout( function() {
			var trd_akt = doc.getElementById("div_traderAuctioneer");
			if (trd_akt != null) {
				var lbox = trd_akt.getElementsByClassName("left_box");
				if (lbox.length > 0) {
					var bids = lbox[0].getElementsByClassName("numberOfBids");
					if (bids.length == 1) {
						var curr_bid = parseInt(bids[0].innerHTML);
						var act = galaxytoolbar.GTPlugin_auctioneer;
						var prev_bid = act.oldBids[doc.location.host];
						if (prev_bid != undefined && curr_bid > 0) {
							if (curr_bid > prev_bid) {
								galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,"Auctioneer Activity found!");
								act.oldBids[doc.location.host] = curr_bid;
								
								var ot = galaxytoolbar.GTPlugin_general.get_ogame_time(doc);
								if (ot == false)
									return;
									
								var date = galaxytoolbar.GTPlugin_messages.get_date_array(ot);
								var player = lbox[0].getElementsByClassName("currentPlayer")[0].innerHTML.trim();
								// now submit the new bidder
								act.submit_auctioner_activity(doc,player, date);
								return;
							}
						}
						
						galaxytoolbar.GTPlugin_auctioneer.oldBids[doc.location.host] = curr_bid;
					}
				}
			}
		}, 10);
	},
	
	found_auctioneer_sub_page_mutation_handler: function(mutations,doc) {
		mutations.forEach(function(mutation) {
			var nodes = mutation.addedNodes;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1) {
					if (nodes[i].hasAttribute("id")
						&& nodes[i].getAttribute("id") == "div_traderAuctioneer") {
						try {
							var bids = parseInt(doc.getElementById("div_traderAuctioneer").getElementsByClassName("left_box")[0].getElementsByClassName("numberOfBids")[0].innerHTML);
							if (!isNaN(bids))
								galaxytoolbar.GTPlugin_auctioneer.oldBids[doc.location.host] = bids;
							else
								return;
						} catch(e) {
							// the number of bids is not at the expected place!
							return;
						}
							
						var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
						var observer2 = new MutationObserver(function(mutations2) {  
						mutations2.forEach(function(mutation2) {
							if (mutation2.type == "characterData") {
								var curr_bid = parseInt(mutation2.target.textContent);
								var act = galaxytoolbar.GTPlugin_auctioneer;
								var prev_bid = act.oldBids[doc.location.host];
								if (prev_bid != undefined && curr_bid > 0) {
									if (curr_bid > prev_bid) {
										galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,"Auctioneer Activity found!");
										act.oldBids[doc.location.host] = curr_bid;
										
										var ot = galaxytoolbar.GTPlugin_general.get_ogame_time(doc);
										if (ot == false)
											return;
											
										var date = galaxytoolbar.GTPlugin_messages.get_date_array(ot);
										var player = doc.getElementById("div_traderAuctioneer").getElementsByClassName("left_box")[0].getElementsByClassName("currentPlayer")[0].innerHTML.trim();
										// now submit the new bidder
										act.submit_auctioneer_activity(doc,player, date);
										return;
									}
								}
								galaxytoolbar.GTPlugin_auctioneer.oldBids[doc.location.host] = curr_bid;
							}
							});
						});
						// important: Google Chrome requires subtree set to be true in order to recognize characterData changes!
						// see https://code.google.com/p/chromium/issues/detail?id=134322
						observer2.observe(doc.getElementById("div_traderAuctioneer").getElementsByClassName("numberOfBids")[0], { characterData: true, subtree: true});
					}
				}
			}
		});
	},
	
	submit_auctioneer_activity: function(doc,playername,date,playerid,msg_id) {
		var auct_xml = '\t<auctioneer';
		
		if (msg_id)
			auct_xml += ' msg_id="'+msg_id+'"';
			
		auct_xml += '>\n';
		
		auct_xml += galaxytoolbar.GTPlugin_messages.get_activity_line(date) +
					'\t\t<player playername="'+playername+'"';
					
		if (playerid)
			auct_xml += 'playerid="'+playerid+'"';
			
		auct_xml += '/>\n'+
					'\t</auctioneer>\n';
		
		
		galaxytoolbar.GTPlugin_general.send(doc,"auctioneer",auct_xml,doc.URL);
		
		return true;
	}
};