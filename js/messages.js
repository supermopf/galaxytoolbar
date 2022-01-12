"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_messages) galaxytoolbar.GTPlugin_messages={};

galaxytoolbar.GTPlugin_messages={
	parse_Messages: function(doc,overlay) {
		try {
			var storage = galaxytoolbar.GTPlugin_storage;
			var note = overlay.getElementsByClassName("note")[0];
			var infohead = overlay.getElementsByClassName("infohead");
			
			if (overlay.getElementsByTagName("form").length > 0
				&& infohead[0].getElementsByTagName("td")[0].getElementsByTagName("span")[0].
				getElementsByTagName("a").length > 0) {
				if (storage.target_tool_exists(doc.URL,"message")) {
					this.submit_player_message(doc, 0, overlay, infohead, note);
				}
				return true;
			}
			
			if (note.firstElementChild.hasAttribute("class") 
				&& note.firstElementChild.getAttribute("class").indexOf("battlereport") > -1) {
				if (storage.target_tool_exists(doc.URL,"short_cr")) {
					//battlereport found
					this.submit_short_cr(doc,overlay,infohead,note);
				}
				return true;
			}
			
			if (note.getElementsByClassName("spy").length > 2) {
				if (storage.target_tool_exists(doc.URL,"reports")) {
					this.findSingleReport(doc,overlay,infohead,note);
				}
			}

			var coords = note.getElementsByTagName("a");
			
			if (coords.length == 2) {
				/** enable this when sending auctioneer messages has been fully implemented
				var spans = note.getElementsByTagName("span");
				if (spans.length == 1 && spans[0].hasAttribute("class") &&
					spans[0].getAttribute("class") == "tipsPlayer" &&
					coords[1].getAttribute("href").search("page=traderAuctioneer") > -1) {
					// we found a message about somone overbidding us
					if (storage.target_tool_exists(doc.URL,"auctioneer")) {
						this.submit_auctioneer_activity_by_message(doc,spans[0]);
					}
					return true;
				}*/
				
				// Test Links in OGame 2.0.5 as well as links from OGame 2.1.0 and above
				if (((coords[0].getAttribute("href").search("javascript:showGalaxy") > -1) &&
					(coords[1].getAttribute("href").search("javascript:showGalaxy") > -1)) || 
					(coords[0].getAttribute("href").match(/page\=galaxy&(?:session\=\w+)?&galaxy\=\d+&system\=\d+/) &&
					coords[1].getAttribute("href").match(/page\=galaxy&(?:session\=\w+)?&galaxy\=\d+&system\=\d+/))) {
					// test, if there is info about espionage defense
					var espionage_action_test = /\s*\d+\s*%/; // no ':' in Norway, so generally no ':' here
					var espionage_action_test2 = /\s*%\s*\d+/; // Turkish
					
					var test1 = espionage_action_test.test(note.innerHTML); 
					var test2 = espionage_action_test2.test(note.innerHTML);
					if (test1 || test2) {
						//finally, we have found out, that it is espionage activity
						if (storage.target_tool_exists(doc.URL,"espionage_action")) {
							this.submit_espionage_activity(doc,coords[0],coords[1],overlay,infohead);
						}
						return true;
					}
				}
			}
			
			return false;
			
			//TODO: check for settings (not implemented at all)
			/**
			if (true) {
				if (coords.length == 1) {
					if (coords[0].getAttribute("href").search("javascript:showGalaxy") > -1) {
						if (note[0].getElementsByTagName("span").length == 0) {
							var tmp = note[0].innerHTML;
							// remove thousands separators
							tmp = tmp.replace(/[.,]/g,"");
							// remove the link inside
							tmp = tmp.replace(/<a.+<\/a>/gi,"");
							var numbers = tmp.match(/\d+/g);
							if (numbers.length == 6) {
								//we found the harvesting report
								this.submit_harvest_report(doc,numbers,coords[0].innerHTML);
								return;
							}
						}
					}
				}
			}
			 */

		} catch (e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in parse_Messages:"+e,"All Galaxytools");
			return false;
		}
		
	},
	
	submit_player_message: function(doc,type, overlay, infohead, note) {
		try {
			galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,galaxytoolbar.GTPlugin_general.getLocString("pmessagefound"),"All Galaxytools");
			var from, to, msg_xml = "";
			var player_id_from, player_id_to = 0;
			var head = (infohead || doc.getElementById("messagebox").getElementsByClassName("infohead"))[0].getElementsByTagName("td") ;
			if (type == 0) {
				from = head[0].getElementsByTagName("span")[0].innerHTML.replace(/\<a.+\<\/a\>/,"").trim();
				to = head[1].innerHTML.trim();
				player_id_from = parseInt((overlay ? overlay : doc).getElementsByTagName("form")[0].getAttribute("action").match(/to\=(\d+)/)[1]);
				player_id_to = galaxytoolbar.GTPlugin_general.get_player_id(doc);
			} else {
				from = head[0].getElementsByTagName("span")[0].innerHTML.trim();
				to = head[1].innerHTML.replace(/\<a.+\<\/a\>/,"").trim();
				player_id_from = galaxytoolbar.GTPlugin_general.get_player_id(doc);
				// player_id_to = 0; // not available
				if (player_id_from == 0) return false;
			}
			
			var msg_id = overlay ? this.get_Message_Id(overlay) : parseInt(doc.URL.match(/msg_id\=(\d+)/)[1]);
			
			var date = this.get_date(infohead ? infohead : doc.getElementsByClassName("infohead"));
			var date_full = this.get_date_string(date);
			
			var msg_c_needed = galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"message_c");
			if (msg_c_needed && overlay.outerHTML) {
				var msg_content = "";
				var msg = overlay.getElementsByClassName("newMessage");
				if (msg.length == 1) {
					msg_content = this.HTMLToBBCode(msg[0].cloneNode(true));
				} else {
					//error
				}
				
		 		var subject = head[2].innerHTML;
				//alert("\""+msg_content+"\"");
				msg_xml =	'\t<message msg_id="'+msg_id+'" datetime="'+date_full+'" subject="'+subject+'">\n'+
								this.get_activity_line(date) +
								'\t\t<message_content><![CDATA['+msg_content.replace(/]]>/g,"").replace(/<!\[CDATA\[/gi,"")+']]></message_content>\n'+
								'\t\t<from playername="'+from+'" playerid="'+player_id_from+'"/>\n'+
								'\t\t<to playername="'+to+'" playerid="'+player_id_to+'"/>\n'+
								'\t</message>\n';
			} else {
				if (!overlay.outerHTML)
					galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Won't submit message content - upgrade your browser to at least Firefox 11","All Galaxytools");
					
				msg_xml = 	'\t<message msg_id="'+msg_id+'" datetime="'+date_full+'">\n'+
								this.get_activity_line(date) +
								'\t\t<from playername="'+from+'" playerid="'+player_id_from+'"/>\n'+
								'\t</message>\n';
			}
			
			return galaxytoolbar.GTPlugin_general.send(doc,"msg",msg_xml,doc.URL);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_player_message:"+e,"All Galaxytools");
		}
		
	},
	
	submit_player_messages_and_activities: function(doc, dom_content) {
		try {
			if (!dom_content) {
				// in case we are not called from the ajax interception but directly from the page load
				dom_content = doc;
			}
			// own playerid and name is stored in "meta" tags of the page
			var iToPlayerId = galaxytoolbar.GTPlugin_general.get_player_id(doc);
			var sToPlayername = galaxytoolbar.GTPlugin_general.get_playername(doc);
			var aCurrentDate = this.get_date_array( new Date() );
			var aCollected = galaxytoolbar.GTPlugin_storage.read_current_activities(doc.URL, aCurrentDate);
			var msg_xml = "";
			
			// check for messages in chat windows
			var chatWindows = dom_content.getElementsByClassName("chat_bar_list_item ");
			if (chatWindows) {
				for (var i=0; i<chatWindows.length; i++) {
					var iFromPlayerId = parseInt(chatWindows[i].getAttribute("data-playerid"), 10);
					aCollected.push(iFromPlayerId);
					var oFromPlayername = chatWindows[i].getElementsByClassName("cb_playername")[0];
					var sFromPlayername = oFromPlayername.textContent || oFromPlayername.innerText || ""; // Firefox does not have innerText but textContent;
					// activity done centrally below
					// new message included?
					var iNewMessages = parseInt(chatWindows[i].getElementsByClassName("new_msg_count")[0].getAttribute("data-new-messages"), 10);
					if (iNewMessages > 0) {
						var aChatMessages = chatWindows[i].getElementsByClassName("chat_msg");
						for (var j=0; j<aChatMessages.length; j++) {
							// ignore those with "odd" as they are the own messages and only take the NEW messages (even though OGame marks all as "new" in 6.1.5)
							if (aChatMessages[j].getAttribute("class").indexOf("odd") === -1 && aChatMessages[j].getElementsByClassName("msg_title")[0].getAttribute("class").indexOf("new") > -1) {
								var oDate = aChatMessages[j].getElementsByClassName("msg_date")[0];
								var sDate = oDate.textContent || oDate.innerText || ""; // Firefox does not have innerText but textContent
								var aDate = this.get_date_from_string(sDate);
								// generate unique message ID based on player id and chat id
								var sMessageId = iFromPlayerId + "" + aChatMessages[j].getAttribute("data-chat-id");
								
								// HTML to BB Code
								var sContent =  this.HTMLToBBCode(aChatMessages[j].getElementsByClassName("msg_content")[0].cloneNode(true));
								
								msg_xml +=	'\t<message msg_id="'+sMessageId+'" datetime="'+this.get_date_string(aDate)+'" subject="Chat">\n'+
											this.get_activity_line(aDate) +
											'\t\t<message_content><![CDATA['+sContent.replace(/]]>/g,"").replace(/<!\[CDATA\[/gi,"")+']]></message_content>\n'+
											'\t\t<from playername="'+sFromPlayername+'" playerid="'+iFromPlayerId+'"/>\n'+
											'\t\t<to playername="'+sToPlayername+'" playerid="'+iToPlayerId+'"/>\n'+
											'\t</message>\n';
							}
						}
					}
				}
			}
			
			// check for online players and submit them too
			var oChatBarPlayerList;
			if (typeof dom_content.getElementById != "undefined") {
				oChatBarPlayerList = dom_content.getElementById("chatBarPlayerList"); // directly loaded within each page and not in the messages section
			}
			if (!oChatBarPlayerList) {
				oChatBarPlayerList = dom_content.getElementsByClassName("playerlist")[0];
			}
			
			var aPlayers = oChatBarPlayerList.getElementsByClassName("playerlist_item");
			for (var i=0; i<aPlayers.length; i++) {
				if (aPlayers[i].getAttribute("data-filteronline") === "on") {
					var iPlayerId = aPlayers[i].getAttribute("data-playerid");
					var oPlayername = aPlayers[i].getElementsByClassName("playername")[0];
					var sPlayername = oPlayername.textContent || oPlayername.innerText || "";
					
					// check if the player was already added (might be buddy and ally mate or we collected one of his new messages above)
					if (aCollected.indexOf(iPlayerId) === -1) {
						// msg_id is irrelevant for activities but required from XSD
						msg_xml +=	'\t<message msg_id="1" datetime="'+this.get_date_string(aCurrentDate)+'">\n'+
							this.get_activity_line(aCurrentDate) +
							'\t\t<from playername="'+sPlayername.trim()+'" playerid="'+iPlayerId+'"/>\n'+
							'\t</message>\n';
						
						aCollected.push(iPlayerId);
					}
				}
			}
			
			if (msg_xml !== "") {
				var result = galaxytoolbar.GTPlugin_general.send(doc,"msg",msg_xml,doc.URL);
				if (result) {
					galaxytoolbar.GTPlugin_storage.insert_current_activities(doc.URL, aCollected, aCurrentDate);
				}
				return result;
			}
		} catch(error) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_player_messages_and_activities:"+error,"All Galaxytools");
		}
	},
	
	// deprecated... no longer used with Version 6.1.6 onwards (delete with next shipment)
	submit_player_chatbar_activities: function(doc) {
		try {
			var msg_xml = "";
			var aCurrentDate = this.get_date_array( new Date() );
			var aCollected = galaxytoolbar.GTPlugin_storage.read_current_activities(doc.URL, aCurrentDate);
			
			var oChatBarPlayerList = doc.getElementsByClassName("pl_container")[0];
			var aPlayers = oChatBarPlayerList.getElementsByClassName("playerlist_item");
			for (var i=0; i<aPlayers.length; i++) {
				if (aPlayers[i].getAttribute("data-filteronline") === "on") {
					var iPlayerId = aPlayers[i].getAttribute("data-playerid");
					var oPlayername = aPlayers[i].getElementsByClassName("playername")[0];
					var sPlayername = oPlayername.textContent || oPlayername.innerText || "";
					
					// check if the player was already added (might be buddy and ally mate or we collected one of his new messages above)
					if (aCollected.indexOf(iPlayerId) === -1) {
						// msg_id is irrelevant for activities but required from XSD
						msg_xml +=	'\t<message msg_id="1" datetime="'+this.get_date_string(aCurrentDate)+'">\n'+
							this.get_activity_line(aCurrentDate) +
							'\t\t<from playername="'+sPlayername.trim()+'" playerid="'+iPlayerId+'"/>\n'+
							'\t</message>\n';
						
						aCollected.push(iPlayerId);
					}
				}
			}
			
			if (msg_xml !== "") {
				var result = galaxytoolbar.GTPlugin_general.send(doc,"msg",msg_xml,doc.URL);
				if (result) {
					galaxytoolbar.GTPlugin_storage.insert_current_activities(doc.URL, aCollected, aCurrentDate);
				}
				return result;
			}
		} catch(error) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_player_chatbar_activities:"+error,"All Galaxytools");
		}
	},
	
	submit_single_player_chatbox: function(doc, dom_content) {
		try {
			var msg_xml = "";
			var iFromPlayerId = parseInt(dom_content.getElementsByClassName("contentbox")[0].getAttribute("data-chatPlayerId"), 10); // getElementById is not supported on a DOM subnode but only on a document
			var sFromPlayername = "";
			
			var iToPlayerId = galaxytoolbar.GTPlugin_general.get_player_id(doc);
			var sToPlayername = galaxytoolbar.GTPlugin_general.get_playername(doc);
			
			
			var aChatMessages = dom_content.getElementsByClassName("chat_msg");
			for (var j=0; j<aChatMessages.length; j++) {
				// ignore those with "odd" as they are the own messages and only take the NEW messages (even though OGame marks all as "new" in 6.1.5)
				if (aChatMessages[j].getAttribute("class").indexOf("odd") === -1 && aChatMessages[j].getElementsByClassName("msg_title")[0].getAttribute("class").indexOf("new") > -1) {
					var oDate = aChatMessages[j].getElementsByClassName("msg_date")[0];
					var sDate = oDate.textContent || oDate.innerText || ""; // Firefox does not have innerText but textContent
					var aDate = this.get_date_from_string(sDate);
					// generate unique message ID based on player id and chat id
					var sMessageId = iFromPlayerId + "" + aChatMessages[j].getAttribute("data-chat-id");
					
					if (!sFromPlayername) {
						var oFromPlayername = aChatMessages[j].getElementsByClassName("msg_title")[0];
						var sFromPlayername = oFromPlayername.textContent || oFromPlayername.innerText || "";
						sFromPlayername = sFromPlayername.trim();
					}
					
					// HTML to BB Code
					var sContent =  this.HTMLToBBCode(aChatMessages[j].getElementsByClassName("msg_content")[0].cloneNode(true));
					
					msg_xml +=	'\t<message msg_id="'+sMessageId+'" datetime="'+this.get_date_string(aDate)+'" subject="Chat">\n'+
								this.get_activity_line(aDate) +
								'\t\t<message_content><![CDATA['+sContent.replace(/]]>/g,"").replace(/<!\[CDATA\[/gi,"")+']]></message_content>\n'+
								'\t\t<from playername="'+sFromPlayername+'" playerid="'+iFromPlayerId+'"/>\n'+
								'\t\t<to playername="'+sToPlayername+'" playerid="'+iToPlayerId+'"/>\n'+
								'\t</message>\n';
				}
			}
			
			if (msg_xml !== "") {
				return galaxytoolbar.GTPlugin_general.send(doc,"msg",msg_xml,doc.URL);
			}
		} catch(error) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_single_player_chatbox:"+error,"All Galaxytools");
		}
	},
	
	parse_espionage_activities_V6: function(doc, dom_content) {
		try {
			var messages = dom_content.getElementsByClassName("msg");
			if (!messages) {
				return;
			}
			galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,galaxytoolbar.GTPlugin_general.getLocString("espionagefound"),"All Galaxytools");
			
			var esp_xml = "";
			for (var i=0; i<messages.length; i++) {
				var msg_id = messages[i].getAttribute("data-msg-id");
				var date = this.get_date_from_string(messages[i].getElementsByClassName("msg_date")[0].innerHTML);
				
				var attack_url = messages[i].getElementsByClassName("msg_actions")[0].getElementsByTagName("a")[2].getAttribute("href"); // third link is "attack" link
				var coord_enemy = [attack_url.match(/galaxy=(\d)/)[1], attack_url.match(/system=(\d+)/)[1], attack_url.match(/position=(\d+)/)[1] ]
				
				var own_url = messages[i].getElementsByClassName("msg_title")[0].getElementsByTagName("a")[0].getAttribute("href");
				var coord_own = [own_url.match(/galaxy=(\d)/)[1], own_url.match(/system=(\d+)/)[1], own_url.match(/position=(\d+)/)[1] ]
			
				esp_xml += '\t<espionage msg_id="'+msg_id+'">\n'+
							this.get_activity_line(date) +
							'\t\t<source galaxy="'+coord_enemy[0]+'" system="'+coord_enemy[1]+'" planet="'+coord_enemy[2]+'"/>\n'+
							'\t\t<target galaxy="'+coord_own[0]+'" system="'+coord_own[1]+'" planet="'+coord_own[2]+'"/>\n'+
							'\t</espionage>\n';
				
			}
			galaxytoolbar.GTPlugin_general.send(doc,"espionage",esp_xml,doc.URL);
		} catch(error) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in parse_espionage_activities:"+error,"All Galaxytools");
		}
		
	},
	
	submit_espionage_activity: function(doc,coords_enemy,coords_own,overlay,infohead) {
		try {
			galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,galaxytoolbar.GTPlugin_general.getLocString("espionagefound"),"All Galaxytools");
			var date = this.get_date(infohead ? infohead : doc.getElementsByClassName("infohead"));
			var coord_enemy = this.get_coords(coords_enemy.innerHTML);
			var coord_own = this.get_coords(coords_own.innerHTML);
			var msg_id = overlay ? this.get_Message_Id(overlay) : parseInt(doc.URL.match(/msg_id\=(\d+)/)[1]);
			
			var esp_xml = '\t<espionage msg_id="'+msg_id+'">\n'+
							this.get_activity_line(date) +
							'\t\t<source galaxy="'+coord_enemy[0]+'" system="'+coord_enemy[1]+'" planet="'+coord_enemy[2]+'"/>\n'+
							'\t\t<target galaxy="'+coord_own[0]+'" system="'+coord_own[1]+'" planet="'+coord_own[2]+'"/>\n'+
							'\t</espionage>\n';
			
			galaxytoolbar.GTPlugin_general.send(doc,"espionage",esp_xml,doc.URL);
			return;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_espionage_activity:"+e,"All Galaxytools");
		}
	},
	
	submit_short_cr: function(doc,overlay,infohead,note) {
		try {
			galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,galaxytoolbar.GTPlugin_general.getLocString("shortcrfound"),"All Galaxytools");
			var date = this.get_date(infohead ? infohead : doc.getElementsByClassName("infohead"));
			var date_full = this.get_date_string(date);
			
			var cr_place = this.get_coords((note || doc.getElementById("battlereport")).getElementsByTagName("a")[0].innerHTML.trim());
			//collect all attackers coords
			var att_coords = new Array();
			var att_names = new Array();
			var attackers = (note ? note.getElementsByClassName("combatants")[0] : doc.getElementById("combatants")).children[0];
			var attackers_coords = attackers.getElementsByTagName("a");
			var attackers_names = attackers.querySelectorAll('span[class*="status_abbr"]');
			for (var i = 0; i < attackers_coords.length; i++) {
				att_coords[i]= attackers_coords[i].textContent;
				att_names[i] = attackers_names[i].textContent.trim();
			}
			
			var def_coords = new Array();
			var def_names = new Array();
			var defenders = (note ? note.getElementsByClassName("combatants")[0] : doc.getElementById("combatants")).children[2];
			var defenders_coords = defenders.getElementsByTagName("a");
			var defenders_names = defenders.querySelectorAll('span[class*="status_abbr"]');
			var acs_defend = defenders.length > 1;
			for (var i = 0; i < defenders_coords.length; i++) {
				def_coords[i] = defenders_coords[i].textContent;
				def_names[i] = defenders_names[i].textContent.trim();
			}
			
			var shortreport = note ? note.getElementsByTagName("table")[0].getElementsByTagName("tr") : doc.getElementById("shortreport").getElementsByTagName("tr");
			var att_lostunits = parseInt(shortreport[1].getElementsByTagName("td")[1].innerHTML.replace(/\D/g,"").trim());
			var att_weapon = parseInt(shortreport[2].getElementsByTagName("td")[1].innerHTML.match(/(\d+)/)[1]);
			var att_shields = parseInt(shortreport[3].getElementsByTagName("td")[1].innerHTML.match(/(\d+)/)[1]);
			var att_armour = parseInt(shortreport[4].getElementsByTagName("td")[1].innerHTML.match(/(\d+)/)[1]);
			
			var def_lostunits = parseInt(shortreport[1].getElementsByTagName("td")[4].innerHTML.replace(/\D/g,"").trim());
			var def_weapon = parseInt(shortreport[2].getElementsByTagName("td")[4].innerHTML.match(/(\d+)/)[1]);
			var def_shields = parseInt(shortreport[3].getElementsByTagName("td")[4].innerHTML.match(/(\d+)/)[1]);
			var def_armour = parseInt(shortreport[4].getElementsByTagName("td")[4].innerHTML.match(/(\d+)/)[1]);
				
			var coord;
			var att_coords_galaxy = new Array();			
			var att_coords_system = new Array();
			var att_coords_planet = new Array();
			//var playerids = new Array();
			
			for (i in att_coords) {
				coord = this.get_coords(att_coords[i]);
				att_coords_galaxy.push(coord[0]);
				att_coords_system.push(coord[1]);
				att_coords_planet.push(coord[2]);
				//playerids.push(0); // can't be determined atm
			}
			
			var def_coords_galaxy = new Array();
			var def_coords_system = new Array();
			var def_coords_planet = new Array();
			//var playerids = new Array();
			
			for (i in def_coords) {
				coord = this.get_coords(def_coords[i]);
				def_coords_galaxy.push(coord[0]);
				def_coords_system.push(coord[1]);
				def_coords_planet.push(coord[2]);
				//playerids.push(0); // can't be determined atm
			}
			
			//determine combat result
			var result= (note ? note : doc).getElementsByClassName("winner")[1].getElementsByTagName("span")[0];
			
			if (result.innerHTML.indexOf(':') == -1) {
				result = "nobody";
			} else {
				var all_winners = result.querySelectorAll('span[class*="status_abbr"]');
				var all_winner_names = Array();
				for (var i = 0; i < all_winners.length; i++)
					all_winner_names[i] = all_winners[i].textContent.trim();
					
				result = this.getCRResult(all_winner_names,att_names,def_names);
			}
			
			var msg_id = overlay ? this.get_Message_Id(overlay) : parseInt(doc.URL.match(/msg_id\=(\d+)/)[1]);
			
			var summary = (note || doc.getElementById("shortreport")).getElementsByClassName("summary")[0];
			
			var loot = summary.getElementsByTagName("tr")[1].getElementsByTagName("td")[1].innerHTML.replace(/[,.]/g,'').match(/(\d+)/g);
			var loot_metal = parseInt(loot[0]);
			var loot_crystal = parseInt(loot[1]);
			var loot_deut = parseInt(loot[2]);
			
			var debris = summary.getElementsByTagName("tr")[2].getElementsByTagName("td")[1].innerHTML.replace(/[,.]/g,'').match(/(\d+)/g);
			var debris_metal = parseInt(debris[0]);
			var debris_crystal = parseInt(debris[1]);
			
			var cr_xml = "";
			cr_xml += 	'\t<combat_report msg_id="'+msg_id+'">\n'+
						'\t\t<combat_result winner="'+result+'" datetime="'+date_full+'" galaxy="'+cr_place[0]+'" system="'+cr_place[1]+'" planet="'+cr_place[2]+'">\n'+
						'\t\t\t<loot metal="'+loot_metal+'" crystal="'+loot_crystal+'" deuterium="'+loot_deut+'"/>\n'+
						'\t\t\t<debris metal="'+debris_metal+'" crystal="'+debris_crystal+'"/>\n'+
						'\t\t</combat_result>\n';
						
			for (var i = 0; i < att_coords_galaxy.length; i++) {
				if (att_coords_planet[i] > 15) return;
				cr_xml += 	'\t\t<combat_party type="attacker" galaxy="'+att_coords_galaxy[i]+'" system="'+att_coords_system[i]+
							'" planet="'+att_coords_planet[i]+'" weapon="'+att_weapon+'" shield="'+att_shields+
							'" armor="'+att_armour+'" lost_units="'+att_lostunits+'">\n'+
							'\t'+this.get_activity_line(date) +
							'\t\t</combat_party>\n';
			}
			
			for (var i = 0; i < def_coords_galaxy.length; i++) {
				if (def_coords_planet[i] > 15) return;
				cr_xml += 	'\t\t<combat_party type="defender" galaxy="'+def_coords_galaxy[i]+'" system="'+def_coords_system[i]+
							'" planet="'+def_coords_planet[i]+'" weapon="'+def_weapon+'" shield="'+def_shields+
							'" armor="'+def_armour+'" lost_units="'+def_lostunits+'">\n';
				if (acs_defend) {
					cr_xml += 	'\t'+this.get_activity_line(date);
				}
				cr_xml += 	'\t\t</combat_party>\n';
			}
			cr_xml += 	'\t</combat_report>\n';
			
			galaxytoolbar.GTPlugin_general.send(doc,"cr",cr_xml,doc.URL);
			return;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_short_cr:"+e,"All Galaxytools");
		}
	},
	
	submit_v6_combat_report(doc, message_id, ajax_content) {
		try {
			galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,galaxytoolbar.GTPlugin_general.getLocString("shortcrfound"),"All Galaxytools");
			var coords_exp = /(\d+):(\d+):(\d+)/;
			
			// get attacker data from JSON content within a script tag
			var attacker_data = ajax_content.match(/ogame\.messages\.combatreport\.loadData\((.*),\s*'attacker'\);/);
			// get defender data
			var defender_data = ajax_content.match(/ogame\.messages\.combatreport\.loadData\((.*),\s*'defender'\);/);
			
			if (!attacker_data || attacker_data.length < 2 || !defender_data || defender_data.length < 2) {
				return;
			}
			
			attacker_data = JSON.parse(attacker_data[1]);
			defender_data = JSON.parse(defender_data[1]);
			
			//collect all attacker values
			var att_coords_galaxy = new Array();			
			var att_coords_system = new Array();
			var att_coords_planet = new Array();
			var att_weapon  = new Array();
			var att_shields = new Array();
			var att_armour  = new Array();			
			// iterate each attacker
			/*
			armorPercentage: 240
			fleetID: "6803"
			ownerAlliance: "GALAXYTOOL"
			ownerAllianceTag: "GTOOL"
			ownerCoordinates: "1:5:9"
			ownerHomePlanet: "Galaxytool4"
			ownerID: "100013"
			ownerName: "eX0du5"
			ownerPlanetType: "1"
			planetId: "33625191"
			shieldPercentage: 220
			shipDetails: Object
			weaponPercentage: 230
			*/
			for (var attacker in attacker_data.member) { 
				attacker = attacker_data.member[attacker];
				var a_coords = attacker.ownerCoordinates.match(coords_exp);
				att_coords_galaxy.push(a_coords[1]);
				att_coords_system.push(a_coords[2]);
				att_coords_planet.push(a_coords[3]);
				att_weapon.push(attacker.weaponPercentage / 10);
				att_shields.push(attacker.shieldPercentage / 10);
				att_armour.push(attacker.armorPercentage / 10);
			}
				
			// collect all defender values
			var def_coords_galaxy = new Array();
			var def_coords_system = new Array();
			var def_coords_planet = new Array();
			var def_weapon  = new Array();
			var def_shields = new Array();
			var def_armour  = new Array();
			
			// iterate each defender
			for (var defender in defender_data.member) { 
				defender = defender_data.member[defender];
				var d_coords = defender.ownerCoordinates.match(coords_exp);
				def_coords_galaxy.push(d_coords[1]);
				def_coords_system.push(d_coords[2]);
				def_coords_planet.push(d_coords[3]);
				def_weapon.push(defender.weaponPercentage / 10);
				def_shields.push(defender.shieldPercentage / 10);
				def_armour.push(defender.armorPercentage / 10);
			}
			var acs_defend = def_coords_galaxy.length > 1;
			
			// now create a DOM object out of the HTML text content
			var dom_content = document.createElement("div");
			dom_content.innerHTML = ajax_content;
			
			// determine the winner
			var attacker_result = dom_content.getElementsByClassName("combat_participant attacker")[0];
			attacker_result = attacker_result.getAttribute("class");
			var result = 'nobody';
			if (attacker_result.indexOf("winner") > -1) {
				result = 'attacker';
			} else if (attacker_result.indexOf("defeated") > -1) {
				result = 'defender';
			}
			
			//date including year!
			//06.08.2010 14:43:34
			var date_exp = /(\d{2}).(\d{2}).(\d{4})\s(.+)/;
			var datetime_exp = /(\d{2}).(\d{2}).(\d{4})\s(\d{2}):(\d{2}):(\d{2})/;
			var date_full;
			var tmp = dom_content.getElementsByClassName("msg_date")[0].textContent;
			date_full = date_exp.exec(tmp);
			date_full = date_full[3]+"."+date_full[2]+"."+date_full[1]+" "+date_full[4];
			// needed for activity including Day of Week
			date = datetime_exp.exec(tmp);
			var date = this.get_date_array(new Date(date[3],date[2]-1,date[1], date[4], date[5], date[6]));
			
			
			// cr location
			tmp = dom_content.getElementsByClassName("msg_title")[0].getElementsByTagName("a")[0];
			var planetname = tmp.textContent; // Planetname [1:2:3]
			var cr_place = coords_exp.exec(planetname);
			
			// loot
			tmp = dom_content.getElementsByClassName("resourcedisplay loot")[0];
			tmp = tmp.getElementsByClassName("res_value");
			var loot_metal   = parseInt(tmp[0].getAttribute("title").replace(/[,.]/g,''), 10);
			var loot_crystal = parseInt(tmp[1].getAttribute("title").replace(/[,.]/g,''), 10);
			var loot_deut    = parseInt(tmp[2].getAttribute("title").replace(/[,.]/g,''), 10);
			
			// debris
			tmp = dom_content.getElementsByClassName("resourcedisplay tf")[0];
			tmp = tmp.getElementsByClassName("res_value");
			var debris_metal   = parseInt(tmp[0].getAttribute("title").replace(/[,.]/g,''), 10);
			var debris_crystal = parseInt(tmp[1].getAttribute("title").replace(/[,.]/g,''), 10);
			
			var cr_xml = "";
			cr_xml += 	'\t<combat_report msg_id="'+message_id+'">\n'+
						'\t\t<combat_result winner="'+result+'" datetime="'+date_full+'" galaxy="'+cr_place[1]+'" system="'+cr_place[2]+'" planet="'+cr_place[3]+'">\n'+
						'\t\t\t<loot metal="'+loot_metal+'" crystal="'+loot_crystal+'" deuterium="'+loot_deut+'"/>\n'+
						'\t\t\t<debris metal="'+debris_metal+'" crystal="'+debris_crystal+'"/>\n'+
						'\t\t</combat_result>\n';
						
			for (var i = 0; i < att_coords_galaxy.length; i++) {
				if (att_coords_planet[i] > 15) return;
				cr_xml += 	'\t\t<combat_party type="attacker" galaxy="'+att_coords_galaxy[i]+'" system="'+att_coords_system[i]+
							'" planet="'+att_coords_planet[i]+'" weapon="'+att_weapon[i]+'" shield="'+att_shields[i]+
							'" armor="'+att_armour[i]+'">\n'+
							'\t'+this.get_activity_line(date) +
							'\t\t</combat_party>\n';
			}
			
			for (var i = 0; i < def_coords_galaxy.length; i++) {
				if (def_coords_planet[i] > 15) return;
				cr_xml += 	'\t\t<combat_party type="defender" galaxy="'+def_coords_galaxy[i]+'" system="'+def_coords_system[i]+
							'" planet="'+def_coords_planet[i]+'" weapon="'+def_weapon[i]+'" shield="'+def_shields[i]+
							'" armor="'+def_armour[i]+'">\n';
				if (acs_defend) {
					cr_xml += 	'\t'+this.get_activity_line(date);
				}
				cr_xml += 	'\t\t</combat_party>\n';
			}
			cr_xml += 	'\t</combat_report>\n';
			
			galaxytoolbar.GTPlugin_general.send(doc,"cr",cr_xml,doc.URL);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_v6_combat_report:"+e,"All Galaxytools");
		}
	},
		
	submit_auctioneer_activity_by_message: function(doc, span) {
		try {
			var msg_id = doc.URL.match(/msg_id\=(\d+)/)[1];
			var title = span.getAttribute("title");
			var playername = span.innerHTML.trim();
			var playerid = parseInt(title.match(/&to=(\d+)&/)[1]);
			
			var date = this.get_date(doc);
			
			return this.submit_auctioneer_activity(doc,playername,date,playerid,msg_id);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Error in submit_auctioneer_activity_by_message:"+e,"All Galaxytools");
			return false;
		}
	},
	
//	submit_harvest_report: function(doc,numbers,coords) {
//		var coord = this.get_coords(coords);
//		
//		var floating_metal = parseInt(numbers[2]);
//		var floating_crystal = parseInt(numbers[3]);
//		
//		var harvested_metal = parseInt(numbers[4]);
//		var harvested_crystal = parseInt(numbers[5]);
//		
//		var date = this.get_date(doc);
//			
//		var year   = date.getFullYear();
//		var month  = date.getMonth()+1; // 0 = January
//		var day    = date.getDate();
//		var hour   = date.getHours();
//		var minute = date.getMinutes();
//		var second = date.getSeconds();
//		var weekday = date.getDay();
//		
//		alert("Found harvesting report: At ["+coord[0]+":"+coord[1]+":"+
//				coord[2]+"] are floating "+floating_metal+" metal and "+
//				floating_crystal+" crystal. You harvested "+harvested_metal+" metal and "+harvested_crystal+ " crytal.");
//		//TODO: implement the rest
//	},
	
	save_own_activities: function(doc) {
		try {
			var script = galaxytoolbar.GTPlugin_general.get_script_of_page(doc);
			
			var CONST_DAY =script.match(/LocalizationStrings.timeunits\['short'\]\.day[\s\t]*=[\s\t]*'(.+)'/i)[1];
			var CONST_HOUR = script.match(/LocalizationStrings.timeunits\['short']\.hour[\s\t]*=[\s\t]*'(.+)'/i)[1];
			var CONST_MINUTE = script.match(/LocalizationStrings.timeunits\['short'\]\.minute[\s\t]*=[\s\t]*'(.+)'/i)[1];
			var CONST_SECOND = script.match(/LocalizationStrings.timeunits\['short'\]\.second[\s\t]*=[\s\t]*'(.+)'/i)[1];
			
			var url = doc.URL.substring(7,doc.URL.indexOf("/game"));
			var content = doc.getElementById("inhalt").getElementsByTagName("div");
			var minute = 0;
			var second = 0;
			var has_minute;
			for (var i = 0; i < content.length; i++) {
				try {
					if (!content[i].hasAttribute("id")) continue;
					if (content[i].getAttribute("id").match(/fleet\d+/) == null) continue;
					// now we found a fleet
					var fleet_info = content[i].getElementsByTagName("span");
					// don't save returning fleets
					if (content[i].getElementsByClassName("fleet_icon_reverse").length > 0) continue;
					// don't save too long flying fleets (more than one hour)
					// they are sorted by flying time, so we can break here...
					if (fleet_info[0].innerHTML.indexOf(CONST_DAY) > -1) break;
					if (fleet_info[0].innerHTML.indexOf(CONST_HOUR) > -1) break;
					// don't save fleets flying to a debris field
					if (content[i].getElementsByClassName("destination fixed")[0].getElementsByTagName("img")[0].getAttribute("src").indexOf("3ca961edd69ea535317329e75b0e13.gif") > -1) continue;
					
					var values = fleet_info[0].innerHTML.match(/\d+/g);
					
					has_minute = false;
					if (fleet_info[0].innerHTML.indexOf(CONST_MINUTE) > -1) {
						minute = parseInt(values[0]);
						has_minute = true;
					}
					
					if (fleet_info[0].innerHTML.indexOf(CONST_SECOND) > -1) {
						if (has_minute) {
							second = parseInt(values[1]);
						} else {
							second = parseInt(values[0]);
						}
					}
					
					// Adjusted for Chrome
					var time = Math.round((new Date()).getTime() / 1000)+minute*60+second;
					
					minute = 0;
					second = 0;
					var coords =content[i].getElementsByClassName("destinationCoords tipsStandard")[0].getElementsByTagName("a")[0].innerHTML.match(/\d+/g);
					if (coords.length != 3) continue;
					galaxytoolbar.GTPlugin_storage.insert_fleet_action(url,parseInt(coords[0]),parseInt(coords[1]),parseInt(coords[2]),time);
				} catch(e) {
					// no notification here 
					galaxytoolbar.GTPlugin_general.log_to_console("error while saving own activities: "+e);
					continue;
				}
			}
		} catch (ignore_me) {
			//alert(ignore_me)
		}
	},
	
	getCRResult: function(winners,attackers,defenders) {
		var res = true;
		for (var i= 0; i < winners.length; i++) {
			if (winners[i] == undefined || attackers[i] == undefined || winners[i] != attackers[i]) {
				res = false;
				break;
			}
		}
		
		var res2 = true;
		for (var i= 0; i < winners.length; i++) {
			if (winners[i] == undefined || defenders[i] == undefined || winners[i] != defenders[i]) {
				res2 = false;
				break;
			}
		}
		
		if (res && !res2)
			return "attacker";
		else if (!res && res2)
			return "defender";
		else
			return "nobody";
	},
	
	findSingleReport: function(doc, overlay, infohead, note) {
		try {			
			var header = overlay ? infohead[0].getElementsByTagName("tr")[3] : doc.getElementById("messagebox").getElementsByClassName("infohead")[0].getElementsByTagName("tr")[3];
			var language = galaxytoolbar.GTPlugin_general.get_language(doc);
			
			var tmp = this.extract_report(doc,header,"messagebox",language, true, overlay, infohead, note);
			
			if (tmp == false) {
				if (galaxytoolbar.GTPlugin_general.debug_mode) {
					galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("noreportsfound"),"All Galaxytools");
				}
				return;
			}
			
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("reportsfound"),"All Galaxytools");
			galaxytoolbar.GTPlugin_general.send(doc,"reports",tmp,doc.URL);
			return;
		} catch(e) {
			// unexpected error
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "FindSinglereport() unexpected error: "+e,"All Galaxytools");
			return;
		}
	},
	
	findMultipleReport: function(doc,send_old_reports) {
		var report_content_xml = "";
		try {
			var tr;
			var header;
			var i = 2;
			var language = galaxytoolbar.GTPlugin_general.get_language(doc);
			if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"reports")) {
				while (tr = doc.getElementById("mailz").getElementsByTagName("tr")[i]) {
					try {
						if (tr.getAttributeNode("id").value.indexOf("spioDetails") > -1) {
							header = doc.getElementById("mailz").getElementsByTagName("tr")[i-1];
							
							if (header.hasAttribute("class")) {
								if (!(header.getAttribute("class").indexOf("new") > -1) && !send_old_reports) {
									i++;
									continue;
								}
							}
							
							var tmp = galaxytoolbar.GTPlugin_messages.extract_report(doc,header,tr.getAttributeNode("id").value,language,false, undefined, send_old_reports);
							
							if (tmp == false) {
								break;
							}
							
							if (tmp != "") {
								report_content_xml += tmp;
							}
							
						}
						i++;
					} catch(no_spiomessage) {
						// nothing to do
						i++;
					}
				}
			}
		} catch(error) {
			// error occured, but we ignore it
		}
		
		if (report_content_xml == "") {
			if (galaxytoolbar.GTPlugin_general.debug_mode) {
				galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("nounreadreportsfound"),"All Galaxytools");
			}
			return;
		}
		
		galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("reportsfound"),"All Galaxytools");
		
		try {
			galaxytoolbar.GTPlugin_general.send(doc,"reports",report_content_xml,doc.URL);
		} catch(e) {
			// unexpected error
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "FindMultipleReport() unexpected error: "+e,"All Galaxytools");
		}
	},
	
	extract_report: function(doc,header,container_id,language,is_single_report, overlay, infohead_or_find_old_reports, note) {
		var general = galaxytoolbar.GTPlugin_general;
		var msg_id, coords;
		var galaxy, system, planet;
		var moon = false;
		try {
			msg_id = is_single_report ? (overlay ? this.get_Message_Id(overlay) : parseInt(doc.URL.match(/msg_id\=(\d+)/)[1])) : parseInt(container_id.replace(/\D/g,""));
		} catch(e) {
			return false;
		}
		//this is the only language dependent thing
		var planetname = "";
		var playername = "";
		
		//date including year!
		//06.08.2010 14:43:34
		var date_exp = /(\d{2}).(\d{2}).(\d{4})\s(.+)/;
		var tmp;
		var date;
		try {
			if (header.getElementsByTagName("td").length == 1) {
				//single report
				tmp = header.getElementsByTagName("td")[0];
			} else {
				tmp = header.getElementsByTagName("td")[3];
			}
			
			// Antigame or other scripts should set an attribute called "original" if it changes the values
			if (tmp.hasAttribute("original")) {
				tmp = tmp.getAttribute("original");
			} else {
				tmp = tmp.innerHTML;
			}
			
			tmp = date_exp.exec(tmp);
			date = tmp[3]+"."+tmp[2]+"."+tmp[1]+" "+tmp[4];
			//converted to varchar(19)
		} catch (no_date_error) {
			 galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Could not determine reportdate!","All Galaxytools");
			 date = "";
		}
		
		var contents = new Array();
		var values = new Array();
				
		// find report
		var trow;
		var i = 0;
		var scan_depth = 0;
		var full_report = note || doc.getElementById(container_id);
		while (trow = full_report.getElementsByTagName("tr")[i]) {
			i++;
			// check each tr content
			try {
				if (trow.parentNode.parentNode.getAttribute("class").indexOf("anti_") > -1 )
					// ignore AntiGame's additions
					continue;
				
				if (trow.cells.length == 4) {
					// Resources have:
					// cell 1 + 3 = class "item"
					if (trow.cells[0].getAttribute("class") == "item" &&
						trow.cells[2].getAttribute("class") == "item") {
						
						contents.push(general.trimString(trow.cells[0].innerHTML));
						values.push(parseInt(trow.cells[1].innerHTML.replace(/\D/g,"")));
						contents.push(general.trimString(trow.cells[2].innerHTML));
						values.push(parseInt(trow.cells[3].innerHTML.replace(/\D/g,""))); 
					}
					
					// all attributes except resources have:
					// cell 1 + 3 = class "key"
					// cell 2 + 4 = class "value"
					if (trow.cells[0].getAttribute("class") == "key" &&
						trow.cells[1].getAttribute("class") == "value" &&
						trow.cells[2].getAttribute("class") == "key" &&
						trow.cells[3].getAttribute("class") == "value") {

						contents.push(general.trimString(trow.cells[0].innerHTML));
						values.push(parseInt(trow.cells[1].innerHTML.replace(/\D/g,"")));
						// should only occur on the right table cell - as of OGame 5.0.0
						if (trow.cells[3].innerHTML.indexOf("&nbsp;") == -1) {
							contents.push(general.trimString(trow.cells[2].innerHTML));
							values.push(parseInt(trow.cells[3].innerHTML.replace(/\D/g,"")));
						}
					}
				} else if (trow.cells.length == 2) {
					// just in case only one entry at the line
					if (trow.cells[0].getAttribute("class") == "key" &&  
	  					trow.cells[1].getAttribute("class") == "value") {
						
						contents.push(general.trimString(trow.cells[0].innerHTML));
						values.push(parseInt(trow.cells[1].innerHTML.replace(/\D/g,"")));
					}
				} else if (trow.cells.length == 1) {
					// table header contains planetname and that stuff
					var thead = trow.getElementsByTagName("th")[0];
					if (thead && thead.getAttribute("class") == "area") {
						// we found the table header we were looking for
						try {
							var coords_exp = /(\d+):(\d+):(\d+)/;
							coords = coords_exp.exec(thead.getElementsByTagName("a")[0].innerHTML);
							galaxy = coords[1];
							system = coords[2];
							planet = coords[3];
						} catch (e) {
							//no Header
						}
						
						if (contents.length == 0) {
							// planetname and that stuff
							playername = thead.innerHTML.match(/<span\s*class=\"status_.+\">\s*(.+?)\s*<\/span>/)[1];
							
							if (thead.hasAttribute("plunder_status")) {
								// AntiGame added a span
								planetname = thead.innerHTML.substring(thead.innerHTML.indexOf('</span>')+7,thead.innerHTML.indexOf('<a')+1);
							} else {
								planetname = thead.innerHTML.substring(0,thead.innerHTML.indexOf('<a')+1);
							}
							
							// delete moon image
							planetname = planetname.replace(/<figure.+<\/figure>/i,"");
							
							planetname = this.get_planet_name(planetname, language);
						} else {
							// Fleet, defense, buildings, techs (and activity)
							scan_depth++;
						}
					}
				}
			} catch(no_error) {
				// we will halt here in case "class" attribute does not exist
			}
		}
		try {
			// find out via the "attack" button, if it is moon or planet
			if (is_single_report) {
				moon = (note || doc).getElementsByClassName("attack")[0].getElementsByTagName("a")[0].getAttribute("href").indexOf("type=3") > -1;
			} else {
				moon = full_report.getElementsByClassName("attack")[0].getElementsByTagName("a")[0].getAttribute("href").indexOf("type=3") > -1;
			}
		} catch(e) {
			//alert(e);
		}
		
		if (contents.length == 0) {
			return false;
		} 
		
		//translate each value to English
		var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(doc.URL);
		if (tool_ids.length > 0) {
			var callback;
			var args;
			if (is_single_report) { 
				callback = galaxytoolbar.GTPlugin_messages.findSingleReport;
				args = new Array(doc,overlay,infohead_or_find_old_reports,note);
			} else {
				callback = galaxytoolbar.GTPlugin_messages.findMultipleReport;
				args = new Array(doc,infohead_or_find_old_reports);
			}
			
			contents = this.translate_array(tool_ids[0],contents,doc, callback, args);
		}
		
		// no translation available
		if (contents == false) {
			return false;
		}
		
		//create xml from everything
		return this.create_report_xml_string(msg_id,playername,planetname,galaxy,system,planet,date,scan_depth,contents,values,moon);
	},
	
	get_planet_name : function (string, language) {
		if (this.planet_name_pattern.hasOwnProperty(language)) {
			var res = string.match(this.planet_name_pattern[language]);
			if (res !== null)
				return res[1];
			else
				return "";
		} else {
			return "";
		}
	},
	
	planet_name_pattern : {
		"ar"	: /^Recursos en\s*(.+)\s</,		//Argentinian .com.ar
		"br"	: /^Recursos no\s*(.+)\s</,		//Brazilian .com.br
		"cz"	: /^Suroviny na\s*(.+)\s</,		//Czech .cz
		"de"	: /^Rohstoffe auf\s*(.+)\s</, 	//German .de
		"dk"	: /^Ressurcer på\s*(.+)\s</,	//Danish .dk
		"en"	: /^Resources on\s*(.+)\s</, 	//English .org
		"es"	: /^Recursos en\s*(.+)\s</,		//Spanish .com.es
		"fr"	: /^Ressources sur\s*(.+)\s</,	//French .fr
		"fi"	: /^Resurssit\s*(.+)\s</,		//Finnish .fi.org
		"gr"	: /^Πόροι στο\s*(.+)\s</,		//Greek .gr
		"hr"	: /^Resursi na\s*(.+)\s</,		//Croatian .hr.org
		"hu"	: /^Nyersanyagok itt:\s*(.+)\s</,//Hungarian .hu
		"it"	: /^Risorse su\s*(.+)\s</,		//Italian .it
		"jp"	: /時点の(.+)\s</,				//Japanese .jp
		"mx"	: /^Recursos en\s*(.+)\s</,		//Mexican .mx.org
		"nl"	: /^Grondstoffen op\s*(.+)\s</,	//Dutch .nl
		"no"	: /^Ressurser på\s*(.+)\s</,	//Norwegian .no
		"pl"	: /^Surowce na\s*(.+)\s</,		//Polish .pl
		"pt"	: /^Recursos em\s*(.+)\s</,		//Portuguese .com.pt
		"ro"	: /^Resurse la\s*(.+)\s</,		//Romanian .ro
		"ru"	: /^Сырьё на\s*(.+)\s</,		//Russian .ru
		"se"	: /^Resurser på\s*(.+)\s</,		//Swedish .se
		"si"	: /^Surovine na\s*(.+)\s</,		//Slovenian .si
		"sk"	: /^Zdroje na\s*(.+)\s</,		//Slovak .sk
		"tr"	: /tarihinde\s*(.+)\s</,		//Turkish .tr.org
		"tw"	: /時\s*(.+)\s</,				//Taiwanese .tw
		"us"	: /^Resources on\s*(.+)\s</,	//American .us
		"yu"	: /^Resursi na\s*(.+)\s</,		//Balkan .ba.org
		
		// unsupported - old OGame Version on it
		"ae.org"	: /^موارد على\s*(.+)\s</,		//Arabic ae.org
			
		// old - no OGame exists in this country anymore
		"bg"	: /^Ресурси на\s*(.+)\s</,		//Bulgarian .bg.org
		"lv"		: /^Resursi uz\s*(.+)\s</,	//Latvian
		"lt"		: /^Resursų\s*(.+)\s</,		//Lituanian
		"rs"		: /^Ресурси на\s*(.+)\s</	//Serbian
	},
	
	translate_array: function(tool_id,array,doc,callback,callbackargs) {
		var translation = new Array();
		var tmp;
		//the first four entries are always Metal,Crystal, Deut and Energy
		translation.push("Metal");
		translation.push("Crystal");
		translation.push("Deuterium");
		translation.push("Energy");
		
		for (var i=4;i < array.length; i++) {
			tmp = galaxytoolbar.GTPlugin_storage.get_translation(tool_id,array[i],false,doc.URL);
			if(tmp != "Unknown entry") {
				translation.push(tmp);
			} else {
				var general = galaxytoolbar.GTPlugin_general;
				if (!galaxytoolbar.GTPlugin_messages.last_missing) { // only try to read the tree once -> else it will fail over and over again
					general.set_status(doc,"galaxyplugin"+1,2,general.getLocString("error.missing_techs_prefix")+array[i]+'"',"All Galaxytools");
					galaxytoolbar.GTPlugin_techtreeparser.download_and_parse_techtree(doc,galaxytoolbar.GTPlugin_messages,callback,callbackargs);
					galaxytoolbar.GTPlugin_messages.last_missing = array[i];
				} else {
					general.set_status(doc,"galaxyplugin"+1,2,general.getLocString("error.missing_techs_prefix")+array[i]+'"',"All Galaxytools");
				}
				
				return false;
			}
		}
		
		return translation;
	},
	
	create_report_xml_string: function(msg_id,playername,planetname,galaxy,system,planet,datetime,scandepth,translated_contents,values,moon) {
		if (datetime == "") {
			return false;
		}
		
		var content = "";
		
		var depth = "resources";
		
		switch(scandepth) {
			case 1: depth = "resources"; 
					break;
			case 2: depth = "fleet";
					break;
			case 3: depth = "defence";
					break;
			case 4: depth = "buildings";
					break;
			case 5: depth = "research";
					break;
		}
		
		content +=  '\t<report playername="'+playername+'" planetname="'+planetname.replace(/&nbsp;/g," ")+'" moon="'+moon+
					'" galaxy="'+galaxy+'" system="'+system+'" planet="'+planet+'" datetime="'+datetime+
					'" scandepth="'+depth+'" msg_id="'+msg_id+'">\n';
					
		for (var i = 0;i < values.length; i++) {
			content += '\t\t<entry name="'+translated_contents[i]+'" amount="'+values[i]+'"/>\n';
		}
		
		content += '\t</report>\n';
		
		return content;
	},
	
	get_Message_Id: function(overlay) {
		return parseInt(overlay.getElementsByTagName("div")[0].getAttribute("data-message-id"));
	},
	
	add_Overlay_Content_Listener: function(doc, overlay) {
		// check, if already one listener is installed here
		// Chromium has a bug -> deletedNodes are added to addedNodes, so we can't distinguish between delete and add operations
		if (!overlay.hasAttribute("galaxytoolbar_overlay_listener_installed")) {
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
			if (MutationObserver) {
				var observer = new MutationObserver(function(mutations){ 
					mutations.forEach(function(mutation) {
						var nodes = mutation.addedNodes;
						for (var i = 0; i < nodes.length; i++) {
							if (nodes[i].nodeType == 1
								&& nodes[i].hasAttribute("class") 
								&& nodes[i].getAttribute("class") == "showmessage") {
									galaxytoolbar.GTPlugin_general.clear_status(doc);
									galaxytoolbar.GTPlugin_messages.parse_Messages(doc,overlay);
							}
						}
					});
				});
				observer.observe(overlay, { childList: true });
			}
			// no DOMNodeInsertedRequired
		}
	},
	
	add_Overlay_Listener_For_Messages: function(doc) {
		if (!doc.body.hasAttribute("galaxytoolbar_overlay_listener_installed")) {
			// only install, if no listener is created yet
			var element = doc.body;
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
			if (MutationObserver) {
				var observer = new MutationObserver(function(mutations){ 
					mutations.forEach(function(mutation) {
						var nodes = mutation.addedNodes;
						for (var i = 0; i < nodes.length; i++) {
							if (nodes[i].nodeType == 1
								&& nodes[i].hasAttribute("class") 
								&& nodes[i].getAttribute("class").indexOf("overlayDiv") > -1) {
									galaxytoolbar.GTPlugin_messages.add_Overlay_Content_Listener(doc,nodes[i]);
									return;
							}
						}
					});
				});
				observer.observe(element, { childList: true });
			} else {
				element.addEventListener("DOMNodeInserted", function(e){
					if (e && e.target && e.target.className == "showmessage") {
						var overlay = e.target.parentNode;
						galaxytoolbar.GTPlugin_general.clear_status(doc);
						galaxytoolbar.GTPlugin_messages.parse_Messages(doc,overlay);
					}
				}, false );
			}
			doc.body.setAttribute("galaxytoolbar_overlay_listener_installed",true);
		}
	},
	
	submit_reports_data: function(doc) {
		// reset status window content from any previous transmission
		try {
			galaxytoolbar.GTPlugin_general.clear_status(doc);
		} catch(e) {
			//alert("error: "+e);
		}
		
		if (parseInt(doc.getElementById("new_msg_count").getAttribute("value")) < 1) {
			if (galaxytoolbar.GTPlugin_general.debug_mode) {
				galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("nounreadreportsfound"),"All Galaxytools");
			}
			return;
		}
		
		galaxytoolbar.GTPlugin_messages.findMultipleReport(doc, false);
	},
	
	
	submit_reports_data_event_handler: function(e,doc) {
		//mailz
		try {
			if (e.target.innerHTML.indexOf('id="mailz"') == -1) {
				// something else was added to the message page, but not the messages itself
				return;
			}
		} catch(e) {
			//alert(e);
			return;
		}
		// reset status window content from any previous transmission
		try {
			galaxytoolbar.GTPlugin_general.clear_status(doc);
		} catch(e) {
			//alert("error: "+e);
		}
		
		galaxytoolbar.GTPlugin_messages.add_Overlay_Listener_For_Messages(doc);
		galaxytoolbar.GTPlugin_messages.submit_reports_data(doc);
	},
	
	parseMessages_V6: function(mutations,doc) {
		mutations.forEach(function(mutation) {
			if (!mutation.addedNodes || mutation.addedNodes.length == 0) return; // nothing added, only deleted
		
			var nodes = mutation.addedNodes;
			if (nodes.length === 2 && nodes[0].nodeType === 3 && nodes[1].nodeType === 1) return; // clock updates each second!
			
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1 && ( nodes[i].className === "detail_msg" ||
					                           (nodes[i].dataset && nodes[i].dataset.msgId) )
					   ) {
						// TODO: player messages (maybe)
						
						// first check if the API key icon is there - if not, this might just be a message that somebody sent an espionage probe to you
						var tmp = nodes[i].getElementsByClassName("icon_apikey");
						if (tmp && tmp.length > 0) {
							// if there is an API key, it can be a) espionage report or b) combat report -> check the parent node for this
							var href = (tmp[0].parentNode) ? tmp[0].parentNode.getAttribute("href") : null;
							if (href && href.indexOf("ogame-api://cr") > -1) {
								// do nothing, done elsewhere
							} else if (href && href.indexOf("ogame-api://sr") > -1) {
								// espionage report API href example of universe 680 (en) : ogame-api://sr-en-680-fbdc37744864c0aaa3a5fd483ff85e05dbcc88c7
								galaxytoolbar.GTPlugin_messages.add_Overlay_Listener_For_Messages(doc);
								galaxytoolbar.GTPlugin_messages.submit_v6_reports_data(doc, nodes[i]);
							}
						} else {
							doc.getElementById("galaxytool_status").style.display = "none";
						}
						return;
				}
			}
		});
	},
	
			
	submit_v6_reports_data: function(doc, reportHTML, messageId) {
		try {			
			// reset status window content from any previous transmission	
			galaxytoolbar.GTPlugin_general.clear_status(doc);
			
			var language = galaxytoolbar.GTPlugin_general.get_language(doc);
			
			var tmp = galaxytoolbar.GTPlugin_messages.extract_v6_report(doc, reportHTML, "messagebox", language, messageId);
			
			if (tmp == false) {
				if (galaxytoolbar.GTPlugin_general.debug_mode) {
					galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("noreportsfound"),"All Galaxytools");
				}
				return;
			}
			
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("reportsfound"),"All Galaxytools");
			galaxytoolbar.GTPlugin_general.send(doc,"reports",tmp,doc.URL);
			return;
		} catch(e) {
			// unexpected error
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "FindSinglereport() unexpected error: "+e,"All Galaxytools");
			return;
		}
	},
	
	extract_v6_report: function(doc,reportHTML,container_id,language, messageId         /*old:*/,is_single_report, overlay, infohead_or_find_old_reports, note) {
		var general = galaxytoolbar.GTPlugin_general;

		var scan_depth = 1; // resources are always there
		var msg_id, coords;
		var galaxy, system, planet;
		var moon = false;
		try {
			msg_id = (!messageId) ? parseInt(reportHTML.dataset.msgId, 10) : messageId;
		} catch(e) {
			return false;
		}
		//this is the only language dependent thing
		var planetname = ""
		var playername = "";
		
		//date including year!
		//06.08.2010 14:43:34
		var date_exp = /(\d{2}).(\d{2}).(\d{4})\s(.+)/;
		var tmp;
		var date;
		try {
			tmp = reportHTML.getElementsByClassName("msg_date")[0].innerHTML;
			tmp = date_exp.exec(tmp);
			date = tmp[3]+"."+tmp[2]+"."+tmp[1]+" "+tmp[4];
			//converted to varchar(19)
		} catch (no_date_error) {
			 galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Could not determine reportdate!","All Galaxytools");
			 date = "";
		}
		try {
			tmp = reportHTML.getElementsByClassName("msg_title")[0].getElementsByTagName("a")[0];
		
			planetname = tmp.textContent; // Planetname [1:2:3]
			var coords_exp = /(\d+):(\d+):(\d+)/;
			coords = coords_exp.exec(planetname);
			galaxy = coords[1];
			system = coords[2];
			planet = coords[3];		
			
			planetname = planetname.substring(0, planetname.indexOf("[") - 1).trim();
			moon = (tmp.getElementsByClassName("moon").length === 1);
		} catch (no_planet_error) {
			 galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Could not determine planet name or coordinates!","All Galaxytools");
			 return false;
		}
		try {
			//var playername_exp = /<span\s*class=\"status_.+\">\&nbsp;(.+?)\s*<\/span>/;
			var playername_exp = /\&nbsp;(.+?)<\/span><span\s*class=\"status_/;
			
			 playername = reportHTML.getElementsByClassName("detail_txt")[0].innerHTML.match(playername_exp)[1];
			 if (playername.indexOf(";") > -1) {
				 playername = playername.substring(playername.lastIndexOf(";") + 1);
			 }
		} catch (no_planet_error) {
			 galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Could not determine playername!","All Galaxytools");
			 return false;
		}
		
		try {
			var contents = new Array();
			var values = new Array();
			
			// get resources
			var i = 0;
			var j = 0;
			
			var resources = reportHTML.getElementsByClassName("resource_list_el");
			for(i=0; i<resources.length; i++) {
				var amount = resources[i].title.replace(/\D/g,"");
				values.push(parseInt(amount, 10));
				
				switch(i) {
					case 0: contents.push("Metal"); break;
					case 1: contents.push("Crystal"); break;
					case 2: contents.push("Deuterium"); break;
					case 3: contents.push("Energy"); break;
				}
			}
			
			// get other content 
			var others = reportHTML.getElementsByClassName("detail_list_el");
			for(i=0; i<others.length; i++) {
				// amount
				var span = others[i].getElementsByClassName("fright")[0];
				var amount = span.textContent.replace(/\D/g,"");
	
				// name
				var classContent = others[i].getElementsByTagName("img")[0].getAttribute("class");
				var class_exp = /\w+\d+/;
				classContent = classContent.match(class_exp)[0];
				var scan = galaxytoolbar.GTPlugin_messages.getNameAndDepthByImageId(classContent);
				if (scan.depth > scan_depth) {
					scan_depth = scan.depth;
				}
				
				// insert
				if (name !== false) {
					contents.push(scan.name);
					values.push(parseInt(amount, 10));
				} else {
					galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Could not identify ID: "+name+"!","All Galaxytools");
				}
				
			}
			
			// alternative way for scan depth (in case no fleet or defense was there and scan depth was not until buildings or tech)
			var scan_depth2 = 1;
			var list = reportHTML.getElementsByClassName("detail_list");
			for (i=0; i < list.length; i++) {
				if (list[i].children.length !== 1) { // one LI entry => message that nothing was found. No entry => nothing exists. More than one entry => results
					scan_depth2 = i+1;
				}
			}
			if (scan_depth2 > scan_depth) {
				scan_depth = scan_depth2;
			}
			
			if (contents.length == 0) {
				return false;
			} 
			/*
			//translate each value to English - no longer needed with V6 which includes images for each text
			var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(doc.URL);
			if (tool_ids.length > 0) {
				var callback = galaxytoolbar.GTPlugin_messages.submit_v6_reports_data;
				var args = new Array(doc,reportHTML,container_id,language);
				
				contents = this.translate_array(tool_ids[0],contents,doc, callback, args);
			}
			
			// no translation available
			if (contents == false) {
				return false;
			}
			*/
			
			//create xml from everything
			return this.create_report_xml_string(msg_id,playername,planetname,galaxy,system,planet,date,scan_depth,contents,values,moon);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, "Could not determine report data!","All Galaxytools");
			return false;	
		}
				
	},
	
	getNameAndDepthByImageId: function(imageId) {
		// return the english name of the Fleet, Defence, Building or Technology based on the image ID
		switch(imageId) {
			// Fleet
			case "tech204": return { name: "Light Fighter", depth: 2 };
			case "tech205": return { name: "Heavy Fighter", depth: 2 };
			case "tech206": return { name: "Cruiser", depth: 2 };
			case "tech207": return { name: "Battleship", depth: 2 };
			case "tech215": return { name: "Battlecruiser", depth: 2 };
			case "tech211": return { name: "Bomber", depth: 2 };
			case "tech213": return { name: "Destroyer", depth: 2 };
			case "tech214": return { name: "Deathstar", depth: 2 };
			case "tech202": return { name: "Small Cargo", depth: 2 };
			case "tech203": return { name: "Large Cargo", depth: 2 };
			case "tech208": return { name: "Colony Ship", depth: 2 };
			case "tech209": return { name: "Recycler", depth: 2 };
			case "tech210": return { name: "Espionage Probe", depth: 2 };
			case "tech204": return { name: "Light Fighter", depth: 2 };
			case "tech212": return { name: "Solar Satellite", depth: 2 };
			// Defence
			case "defense401": return { name: "Rocket Launcher", depth: 3 };
			case "defense402": return { name: "Light Laser", depth: 3 };
			case "defense403": return { name: "Heavy Laser", depth: 3 };
			case "defense405": return { name: "Ion Cannon", depth: 3 };
			case "defense404": return { name: "Gauss Cannon", depth: 3 };
			case "defense406": return { name: "Plasma Turret", depth: 3 };
			case "defense407": return { name: "Small Shield Dome", depth: 3 };
			case "defense408": return { name: "Large Shield Dome", depth: 3 };
			case "defense502": return { name: "Anti-Ballistic Missiles", depth: 3 };
			case "defense503": return { name: "Interplanetary Missiles", depth: 3 };			
			// Building
			case "building1": return { name: "Metal Mine", depth: 4 };
			case "building2": return { name: "Crystal Mine", depth: 4 };
			case "building3": return { name: "Deuterium Synthesizer", depth: 4 };
			case "building4": return { name: "Solar Plant", depth: 4 };
			case "building12": return { name: "Fusion Reactor", depth: 4 };
			case "building14": return { name: "Robotics Factory", depth: 4 };
			case "building15": return { name: "Nanite Factory", depth: 4 };
			case "building21": return { name: "Shipyard", depth: 4 };
			case "building22": return { name: "Metal Storage", depth: 4 };
			case "building23": return { name: "Crystal Storage", depth: 4 };
			case "building24": return { name: "Deuterium Tank", depth: 4 };
			case "building31": return { name: "Research Lab", depth: 4 };
			case "building33": return { name: "Terraformer", depth: 4 };
			case "building44": return { name: "Missile Silo", depth: 4 };
			case "building34": return { name: "Alliance Depot", depth: 4 };
			case "building41": return { name: "Lunar Base", depth: 4 };
			case "building42": return { name: "Sensor Phalanx", depth: 4 };
			case "building43": return { name: "Jump Gate", depth: 4 };
			// Research
			case "research113": return { name: "Energy Technology", depth: 5 };
			case "research120": return { name: "Laser Technology", depth: 5 };
			case "research121": return { name: "Ion Technology", depth: 5 };
			case "research114": return { name: "Hyperspace Technology", depth: 5 };
			case "research122": return { name: "Plasma Technology", depth: 5 };
			case "research115": return { name: "Combustion Drive", depth: 5 };
			case "research117": return { name: "Impulse Drive", depth: 5 };
			case "research118": return { name: "Hyperspace Drive", depth: 5 };
			case "research106": return { name: "Espionage Technology", depth: 5 };
			case "research108": return { name: "Computer Technology", depth: 5 };
			case "research124": return { name: "Astrophysics", depth: 5 };
			case "research123": return { name: "Intergalactic Research Network", depth: 5 };
			case "research199": return { name: "Graviton Technology", depth: 5 };
			case "research109": return { name: "Weapons Technology", depth: 5 };
			case "research110": return { name: "Shielding Technology", depth: 5 };
			case "research111": return { name: "Armour Technology", depth: 5 };
			
			default: return false;
		}
	},
	
	parseHTML: function(msg) {
		//change lists
		var tmp = msg.replace(/<li\>/gi,"[*]");
		tmp = tmp.replace(/<\/li\>/gi,"");
		tmp = tmp.replace(/<ul\>/gi,"[list]");
		tmp = tmp.replace(/<\/ul\>/gi,"[/list]");
		
		//replace sub/sup
		tmp = tmp.replace(/<sub\>/gi,"[sub]");
		tmp = tmp.replace(/<\/sub\>/gi,"[/sub]");
		tmp = tmp.replace(/<sup\>/gi,"[sup]");
		tmp = tmp.replace(/<\/sup\>/gi,"[/sup]");
		
		//replace bold/italics/...
		tmp = tmp.replace(/<b\>/gi,"[b]");
		tmp = tmp.replace(/<\/b\>/gi,"[/b]");
		
		tmp = tmp.replace(/<em\>/gi,"[i]");
		tmp = tmp.replace(/<\/em\>/gi,"[/i]");
		tmp = tmp.replace(/<em\>/gi,"[i]");
		tmp = tmp.replace(/<\/em\>/gi,"[/i]");
		
		tmp = tmp.replace(/<u\>/gi,"[u]");
		tmp = tmp.replace(/<\/u\>/gi,"[/u]");
		
		tmp = tmp.replace(/<s\>/gi,"[s]");
		tmp = tmp.replace(/<\/s\>/gi,"[/s]");
		tmp = tmp.replace(/<del\>/gi,"[s]");
		tmp = tmp.replace(/<\/del\>/gi,"[/s]");
		
		//p tag
		tmp = tmp.replace(/<p\>/gi,"[p]");
		tmp = tmp.replace(/<\/p\>/gi,"[/p]");
		
		//br tag - will be replaced later by \n
		tmp = tmp.replace(/<br\\?>/gi,"[[galaxytool_br]]");
		//hr tag
		tmp = tmp.replace(/<hr\\?>/gi,"[hr]");
		//code
		tmp = tmp.replace(/<code>/gi,"[code]");
		tmp = tmp.replace(/<\/code>/gi,"[/code]");
		
		//player tooltip
		tmp = tmp.replace(/<span.+searchRelId=(\d+).+class=".+?player.+">([\s\S]+)<\/span>/gi,'[player=$1]$2[/player]');
		// player tooltip - admin (has no highscore position)
		tmp = tmp.replace(/<span.+writemessage&amp;to=(\d+).+class=".+?player.+">([\s\S]+)<\/span>/gi,'[player=$1]$2[/player]');
		//player tooltip [player]space[/player], only set the name there
		tmp = tmp.replace(/<span.+class=".+?player.+">([\s\S]+)<\/span>/gi,'$1');
		
		// coordinate links in messages
		tmp = tmp.replace(/<a.+class\=\"galaxylink\">(\[\d+:\d+:\d+\])<\/a>/gi,'[coordinates]$1[/coordinates]');
		
		//URL
		tmp = tmp.replace(/<a\s+href=\"(.+)\"\s+class=\"bbcodeLink\">([\s\S]*)<\/a>/gi,'[url=$1]$2[/url]');
		//email
		tmp = tmp.replace(/<a\s+href=\"mailto:(.+?)">([\s\S]*)\<\/a>/gi,'[email=$1]$2[/email]');
		
		//item - remove the html only and keep the name
		tmp = tmp.replace(/<a\s+href=\".+page=shop.+".+class="tooltipHTML">([\s\S]*)\<\/a>/gi,'$1');
		
		// underlined
		tmp = tmp.replace(/<span style\=\"text-decoration:underline;\"\>([\s\S]*)<\/span>/gi,'[u]$1[/u]');
		
		//fonts
		//font sizes
		tmp = tmp.replace(/<span style\=\"font-size:\s*(\d+)px;(?:line-height:\s*\d+px;)?\"\>([\s\S]*)<\/span>/gi,'[size=$1]$2[/size]');
		//font names
		tmp = tmp.replace(/<span style\=\"font-family:\s*(\w+);\"\>([\s\S]*)<\/span>/gi,'[font=$1]$2[/font]');
		//font colors
		var c1;
		var c2;
		var c3;
		var result;
		var color_test = /<span\s+style\=\"color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\);\"\>([\s\S]*)\<\/span\>/i;
		while (result = color_test.exec(tmp)) {
			parseInt(result[1]) < 16 ? c1 = "0"+parseInt(result[1]).toString(16) : c1 = parseInt(result[1]).toString(16);
			parseInt(result[2]) < 16 ? c2 = "0"+parseInt(result[2]).toString(16) : c2 = parseInt(result[2]).toString(16);
			parseInt(result[3]) < 16 ? c3 = "0"+parseInt(result[3]).toString(16) : c3 = parseInt(result[3]).toString(16);
			tmp = tmp.replace(color_test,'[color=#'+c1+c2+c3+']'+result[4]+'[/color]');
		}
		
		// new color - both variants exist!
		tmp = tmp.replace(/<span\s+style\=\"color:(#[0-9A-F]+);\">([\s\S]+)<\/span>/gi,"[color=$1]$2[/color]");
		
		color_test = /<div\s+style=\"background-color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\);\"\>([\s\S]+)\<\/div\>/i;
		while (result = color_test.exec(tmp)) {
			parseInt(result[1]) < 16 ? c1 = "0"+parseInt(result[1]).toString(16) : c1 = parseInt(result[1]).toString(16);
			parseInt(result[2]) < 16 ? c2 = "0"+parseInt(result[2]).toString(16) : c2 = parseInt(result[2]).toString(16);
			parseInt(result[3]) < 16 ? c3 = "0"+parseInt(result[3]).toString(16) : c3 = parseInt(result[3]).toString(16);
			tmp = tmp.replace(color_test,'[background color=#'+c1+c2+c3+']'+result[4]+'[/background]');
		}
		
		// new bg color - both variants exist!
		tmp = tmp.replace(/<div\s+style\=\"background-color:(#[0-9A-F]+);\">([\s\S]+)<\/div>/gi,"[background color=$1]$2[/background]");
		
		//tooltips
		tmp = tmp.replace(/<span\s+title=\"(.+)"\s+class=\"tooltipCustom\">([\s\S]+)<\/span>/gi,'[tooltip text="$1"]$2[/tooltip]');
		
		// spoiler html
		tmp = tmp.replace(/<a(?:\s+href=".+")?\s*class="spoilerHeader"(?:\s+href=".+")?>[\s\S]+<\/a>/gi,"");
		tmp = tmp.replace(/<div(?:\s*style=".+")?\s*class="spoilerText"(?:\s+style=".+")?>([\s\S]+)<\/div>/gi,"$1");
		tmp = tmp.replace(/<div\s*class="spoiler">([\s\S]+)<\/div>/gi,"[spoiler]$1[/spoiler]");
		
		//alignments
		tmp = tmp.replace(/<div\s+class\=\"center\"\>([\s\S]+)<\/div\>/gi,"[align=center]$1[/align]");
		tmp = tmp.replace(/<div\s+class\=\"left\"\>([\s\S]+)<\/div\>/gi,"[align=left]$1[/align]");
		tmp = tmp.replace(/<div\s+class\=\"right\"\>([\s\S]+)<\/div\>/gi,"[align=right]$1[/align]");
		tmp = tmp.replace(/<div\s+class\=\"justify\"\>([\s\S]+)<\/div\>/gi,"[align=justify]$1[/align]");
		
		tmp = tmp.replace(/<span\s+class=\"seperator\"><\/span>/gi,"");
		
		// emojis
		tmp = tmp.replace(/<div\s+class\=\"emoji (\w+)\"\><\/div\>/gi, ":$1:")
		
		return tmp;
	},
	
	HTMLToBBCode: function(msg_node_copy, isMainNode=true) {
		// var isNotMainNode = !(msg_node_copy.hasAttribute("class") && msg_node_copy.getAttribute("class").indexOf("newMessage") > -1);
		if (msg_node_copy.childElementCount == 0) {
			// we have only text in this node, so replace the node with the appropriate BBcode text, but not, if it is the main node
			if (!isMainNode) {
				msg_node_copy.parentNode.replaceChild(msg_node_copy.ownerDocument.createTextNode(this.parseHTML(msg_node_copy.outerHTML)),msg_node_copy);
				return;
			}
		} else {
			// we have several elements inside, these need to be investigated first
			// start wrong way round, so we don't destroy our dom tree on our own
			var num = msg_node_copy.childElementCount-1;
			for (var i = num; i >= 0; i--) {
				this.HTMLToBBCode(msg_node_copy.children[i], false);
			}
			// after replacing all sub-nodes, replace the node itself, except of the main node
			if (!isMainNode) {
				msg_node_copy.parentNode.replaceChild(msg_node_copy.ownerDocument.createTextNode(this.parseHTML(msg_node_copy.outerHTML)),msg_node_copy);
				return;
			}
		}
		// finally, take out the built string from the node
		return this.htmlDecode(msg_node_copy.innerHTML.replace(/\r?\n/g,"").replace(/\[\[galaxytool_br\]\]/gi,"\n"));
	},
	
	get_date: function(head) {
		var date = head[0].getElementsByTagName("td")[3];
		
		if (date.hasAttribute("original")) {
			date = date.getAttribute("original");
		} else {
			date = date.innerHTML;
		}
		
		var date_exp = /(\d{2}).(\d{2}).(\d{4})\s(\d{2}):(\d{2}):(\d{2})/;
		var tmp = date_exp.exec(date);
					
		var date_obj = new Date(tmp[3],tmp[2]-1,tmp[1],tmp[4],tmp[5],tmp[6]);
		
		return this.get_date_array(date_obj);
	},
	
	get_date_from_string: function(dateString) {
		var date_exp = /(\d{2}).(\d{2}).(\d{4})\s(\d{2}):(\d{2}):(\d{2})/;
		var tmp = date_exp.exec(dateString);
					
		var date_obj = new Date(tmp[3],tmp[2]-1,tmp[1],tmp[4],tmp[5],tmp[6]);
		
		return this.get_date_array(date_obj);
	},
	
	get_date_array: function(date_obj) {
		return [date_obj.getFullYear(),date_obj.getMonth()+1,date_obj.getDate(),date_obj.getHours(),date_obj.getMinutes(),date_obj.getSeconds(),date_obj.getDay()];
	},
	
	get_date_string: function(date) {
		var d_month,d_day,d_hour,d_minute,d_second;
		if (date[1] < 10) d_month  = "0"+date[1]; else d_month  = date[1];
		if (date[2] < 10) d_day    = "0"+date[2]; else d_day    = date[2];
		if (date[3] < 10) d_hour   = "0"+date[3]; else d_hour   = date[3];
		if (date[4] < 10) d_minute = "0"+date[4]; else d_minute = date[4];
		if (date[5] < 10) d_second = "0"+date[5]; else d_second = date[5];
		return date[0]+"."+d_month+"."+d_day+" "+d_hour+":"+d_minute+":"+d_second;
	},
	
	get_activity_line: function(date) {
		return '\t\t<activity year="'+date[0]+'" month="'+date[1]+'" day="'+date[2]+'" hour="'+date[3]+'" minute="'+date[4]+'" weekday="'+date[6]+'"/>\n';
	},
	
	in_array: function(array,element) {
		for (var i=0; i < array.length; i++) {
			if (array[i] == element) return true;
		}
		return false;
	},
	
	get_coords: function(string) {
		try {
			var tmp = string.trim();
			tmp = tmp.slice(1,tmp.length-1);
			var coord = tmp.split(':');
			return coord;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in get_coords:"+e);
		}
	},

/**
 * the following functions were taken from here:
 * http://www.strictly-software.com/scripts/downloads/encoder.js
 * I did not change these functions in any way!
 */
	// When encoding do we convert characters into html or numerical entities
	EncodeType : "entity",  // entity OR numerical

	isEmpty : function(val){
		if(val){
			return ((val===null) || val.length==0 || /^\s+$/.test(val));
		}else{
			return true;
		}
	},
	
	// arrays for conversion from HTML Entities to Numerical values
	arr1: ['&nbsp;','&iexcl;','&cent;','&pound;','&curren;','&yen;','&brvbar;','&sect;','&uml;','&copy;','&ordf;','&laquo;','&not;','&shy;','&reg;','&macr;','&deg;','&plusmn;','&sup2;','&sup3;','&acute;','&micro;','&para;','&middot;','&cedil;','&sup1;','&ordm;','&raquo;','&frac14;','&frac12;','&frac34;','&iquest;','&Agrave;','&Aacute;','&Acirc;','&Atilde;','&Auml;','&Aring;','&AElig;','&Ccedil;','&Egrave;','&Eacute;','&Ecirc;','&Euml;','&Igrave;','&Iacute;','&Icirc;','&Iuml;','&ETH;','&Ntilde;','&Ograve;','&Oacute;','&Ocirc;','&Otilde;','&Ouml;','&times;','&Oslash;','&Ugrave;','&Uacute;','&Ucirc;','&Uuml;','&Yacute;','&THORN;','&szlig;','&agrave;','&aacute;','&acirc;','&atilde;','&auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&ouml;','&divide;','&oslash;','&ugrave;','&uacute;','&ucirc;','&uuml;','&yacute;','&thorn;','&yuml;','&quot;','&amp;','&lt;','&gt;','&OElig;','&oelig;','&Scaron;','&scaron;','&Yuml;','&circ;','&tilde;','&ensp;','&emsp;','&thinsp;','&zwnj;','&zwj;','&lrm;','&rlm;','&ndash;','&mdash;','&lsquo;','&rsquo;','&sbquo;','&ldquo;','&rdquo;','&bdquo;','&dagger;','&Dagger;','&permil;','&lsaquo;','&rsaquo;','&euro;','&fnof;','&Alpha;','&Beta;','&Gamma;','&Delta;','&Epsilon;','&Zeta;','&Eta;','&Theta;','&Iota;','&Kappa;','&Lambda;','&Mu;','&Nu;','&Xi;','&Omicron;','&Pi;','&Rho;','&Sigma;','&Tau;','&Upsilon;','&Phi;','&Chi;','&Psi;','&Omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigmaf;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&thetasym;','&upsih;','&piv;','&bull;','&hellip;','&prime;','&Prime;','&oline;','&frasl;','&weierp;','&image;','&real;','&trade;','&alefsym;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&crarr;','&lArr;','&uArr;','&rArr;','&dArr;','&hArr;','&forall;','&part;','&exist;','&empty;','&nabla;','&isin;','&notin;','&ni;','&prod;','&sum;','&minus;','&lowast;','&radic;','&prop;','&infin;','&ang;','&and;','&or;','&cap;','&cup;','&int;','&there4;','&sim;','&cong;','&asymp;','&ne;','&equiv;','&le;','&ge;','&sub;','&sup;','&nsub;','&sube;','&supe;','&oplus;','&otimes;','&perp;','&sdot;','&lceil;','&rceil;','&lfloor;','&rfloor;','&lang;','&rang;','&loz;','&spades;','&clubs;','&hearts;','&diams;'],
	arr2: ['&#160;','&#161;','&#162;','&#163;','&#164;','&#165;','&#166;','&#167;','&#168;','&#169;','&#170;','&#171;','&#172;','&#173;','&#174;','&#175;','&#176;','&#177;','&#178;','&#179;','&#180;','&#181;','&#182;','&#183;','&#184;','&#185;','&#186;','&#187;','&#188;','&#189;','&#190;','&#191;','&#192;','&#193;','&#194;','&#195;','&#196;','&#197;','&#198;','&#199;','&#200;','&#201;','&#202;','&#203;','&#204;','&#205;','&#206;','&#207;','&#208;','&#209;','&#210;','&#211;','&#212;','&#213;','&#214;','&#215;','&#216;','&#217;','&#218;','&#219;','&#220;','&#221;','&#222;','&#223;','&#224;','&#225;','&#226;','&#227;','&#228;','&#229;','&#230;','&#231;','&#232;','&#233;','&#234;','&#235;','&#236;','&#237;','&#238;','&#239;','&#240;','&#241;','&#242;','&#243;','&#244;','&#245;','&#246;','&#247;','&#248;','&#249;','&#250;','&#251;','&#252;','&#253;','&#254;','&#255;','&#34;','&#38;','&#60;','&#62;','&#338;','&#339;','&#352;','&#353;','&#376;','&#710;','&#732;','&#8194;','&#8195;','&#8201;','&#8204;','&#8205;','&#8206;','&#8207;','&#8211;','&#8212;','&#8216;','&#8217;','&#8218;','&#8220;','&#8221;','&#8222;','&#8224;','&#8225;','&#8240;','&#8249;','&#8250;','&#8364;','&#402;','&#913;','&#914;','&#915;','&#916;','&#917;','&#918;','&#919;','&#920;','&#921;','&#922;','&#923;','&#924;','&#925;','&#926;','&#927;','&#928;','&#929;','&#931;','&#932;','&#933;','&#934;','&#935;','&#936;','&#937;','&#945;','&#946;','&#947;','&#948;','&#949;','&#950;','&#951;','&#952;','&#953;','&#954;','&#955;','&#956;','&#957;','&#958;','&#959;','&#960;','&#961;','&#962;','&#963;','&#964;','&#965;','&#966;','&#967;','&#968;','&#969;','&#977;','&#978;','&#982;','&#8226;','&#8230;','&#8242;','&#8243;','&#8254;','&#8260;','&#8472;','&#8465;','&#8476;','&#8482;','&#8501;','&#8592;','&#8593;','&#8594;','&#8595;','&#8596;','&#8629;','&#8656;','&#8657;','&#8658;','&#8659;','&#8660;','&#8704;','&#8706;','&#8707;','&#8709;','&#8711;','&#8712;','&#8713;','&#8715;','&#8719;','&#8721;','&#8722;','&#8727;','&#8730;','&#8733;','&#8734;','&#8736;','&#8743;','&#8744;','&#8745;','&#8746;','&#8747;','&#8756;','&#8764;','&#8773;','&#8776;','&#8800;','&#8801;','&#8804;','&#8805;','&#8834;','&#8835;','&#8836;','&#8838;','&#8839;','&#8853;','&#8855;','&#8869;','&#8901;','&#8968;','&#8969;','&#8970;','&#8971;','&#9001;','&#9002;','&#9674;','&#9824;','&#9827;','&#9829;','&#9830;'],
		
	// Convert HTML entities into numerical entities
	HTML2Numerical : function(s){
		return this.swapArrayVals(s,this.arr1,this.arr2);
	},	

	// Convert Numerical entities into HTML entities
	NumericalToHTML : function(s){
		return this.swapArrayVals(s,this.arr2,this.arr1);
	},


	// Numerically encodes all unicode characters
	numEncode : function(s){ 
		if(this.isEmpty(s)) return ""; 

		var a = [],
			l = s.length; 
		
		for (var i=0;i<l;i++){ 
			var c = s.charAt(i); 
			if (c < " " || c > "~"){ 
				a.push("&#"); 
				a.push(c.charCodeAt()); //numeric value of code point 
				a.push(";"); 
			}else{ 
				a.push(c); 
			} 
		} 
		
		return a.join(""); 	
	}, 
	
	// HTML Decode numerical and HTML entities back to original values
	htmlDecode : function(s){

		var c,m,d = s;
		
		if(this.isEmpty(d)) return "";

		// convert HTML entites back to numerical entites first
		d = this.HTML2Numerical(d);
		
		// look for numerical entities &#34;
		var arr=d.match(/&#[0-9]{1,5};/g);
		
		// if no matches found in string then skip
		if(arr!=null){
			for(var x=0;x<arr.length;x++){
				m = arr[x];
				c = m.substring(2,m.length-1); //get numeric part which is refernce to unicode character
				// if its a valid number we can decode
				if(c >= -32768 && c <= 65535){
					// decode every single match within string
					d = d.replace(m, String.fromCharCode(c));
				}else{
					d = d.replace(m, ""); //invalid so replace with nada
				}
			}			
		}

		return d;
	},		

	// encode an input string into either numerical or HTML entities
	htmlEncode : function(s,dbl){
			
		if(this.isEmpty(s)) return "";

		// do we allow double encoding? E.g will &amp; be turned into &amp;amp;
		dbl = dbl || false; //default to prevent double encoding
		
		// if allowing double encoding we do ampersands first
		if(dbl){
			if(this.EncodeType=="numerical"){
				s = s.replace(/&/g, "&#38;");
			}else{
				s = s.replace(/&/g, "&amp;");
			}
		}

		// convert the xss chars to numerical entities ' " < >
		s = this.XSSEncode(s,false);
		
		if(this.EncodeType=="numerical" || !dbl){
			// Now call function that will convert any HTML entities to numerical codes
			s = this.HTML2Numerical(s);
		}

		// Now encode all chars above 127 e.g unicode
		s = this.numEncode(s);

		// now we know anything that needs to be encoded has been converted to numerical entities we
		// can encode any ampersands & that are not part of encoded entities
		// to handle the fact that I need to do a negative check and handle multiple ampersands &&&
		// I am going to use a placeholder

		// if we don't want double encoded entities we ignore the & in existing entities
		if(!dbl){
			s = s.replace(/&#/g,"##AMPHASH##");
		
			if(this.EncodeType=="numerical"){
				s = s.replace(/&/g, "&#38;");
			}else{
				s = s.replace(/&/g, "&amp;");
			}

			s = s.replace(/##AMPHASH##/g,"&#");
		}
		
		// replace any malformed entities
		s = s.replace(/&#\d*([^\d;]|$)/g, "$1");

		if(!dbl){
			// safety check to correct any double encoded &amp;
			s = this.correctEncoding(s);
		}

		// now do we need to convert our numerical encoded string into entities
		if(this.EncodeType=="entity"){
			s = this.NumericalToHTML(s);
		}

		return s;					
	},

	// Encodes the basic 4 characters used to malform HTML in XSS hacks
	XSSEncode : function(s,en){
		if(!this.isEmpty(s)){
			en = en || true;
			// do we convert to numerical or html entity?
			if(en){
				s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
				s = s.replace(/\"/g,"&quot;");
				s = s.replace(/</g,"&lt;");
				s = s.replace(/>/g,"&gt;");
			}else{
				s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
				s = s.replace(/\"/g,"&#34;");
				s = s.replace(/</g,"&#60;");
				s = s.replace(/>/g,"&#62;");
			}
			return s;
		}else{
			return "";
		}
	},

	// returns true if a string contains html or numerical encoded entities
	hasEncoded : function(s){
		if(/&#[0-9]{1,5};/g.test(s)){
			return true;
		}else if(/&[A-Z]{2,6};/gi.test(s)){
			return true;
		}else{
			return false;
		}
	},

	// will remove any unicode characters
	stripUnicode : function(s){
		return s.replace(/[^\x20-\x7E]/g,"");
		
	},

	// corrects any double encoded &amp; entities e.g &amp;amp;
	correctEncoding : function(s){
		return s.replace(/(&amp;)(amp;)+/,"$1");
	},


	// Function to loop through an array swaping each item with the value from another array e.g swap HTML entities with Numericals
	swapArrayVals : function(s,arr1,arr2){
		if(this.isEmpty(s)) return "";
		var re;
		if(arr1 && arr2){
			//ShowDebug("in swapArrayVals arr1.length = " + arr1.length + " arr2.length = " + arr2.length)
			// array lengths must match
			if(arr1.length == arr2.length){
				for(var x=0,i=arr1.length;x<i;x++){
					re = new RegExp(arr1[x], 'g');
					s = s.replace(re,arr2[x]); //swap arr1 item with matching item from arr2	
				}
			}
		}
		return s;
	},

	inArray : function( item, arr ) {
		for ( var i = 0, x = arr.length; i < x; i++ ){
			if ( arr[i] === item ){
				return i;
			}
		}
		return -1;
	}
};