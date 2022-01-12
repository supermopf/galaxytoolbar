if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_init) galaxytoolbar.GTPlugin_init={};

//window.addEventListener("load", function(){ galaxytoolbar.GTPlugin_init.init(); }, false);
window.addEventListener('DOMContentLoaded', function(){ galaxytoolbar.GTPlugin_init.init(); }, false);

// new with V6: inject script code into the page that can then interact with our extension via window.postMessage()
// Chrome DOMContentLoaded event is called after the OGame script startet its execution. Therefore this hook must be placed first!
var script = document.createElement("script");
script.type = "text/javascript";
script.innerHTML  = '(function(open) { ' +
'	XMLHttpRequest.prototype.open = function(method, url, async, user, pass) { ' +
'		this.addEventListener("readystatechange", function() { ' +
'			if (this.readyState == 4) { ' +
'				if (this.status == 200) { ' +
'					window.postMessage({'+
'						direction: "from-ogame-page",'+
'						url: this.responseURL,'+
'						responseText: this.responseText'+
'					}, "*");'+
'				} ' +
'			} ' +
'		}, false); ' +
'		open.call(this, method, url, async, user, pass); ' +
'	}; ' +
'})(XMLHttpRequest.prototype.open);';
document.documentElement.appendChild(script);

galaxytoolbar.GTPlugin_init = {
	
	init: function() {
		setTimeout(function() {galaxytoolbar.GTPlugin_storage.delete_old_espionage_entries();},500);
		
		galaxytoolbar.GTPlugin_general.Prefs = galaxytoolbar.GTPlugin_general.getPrefs;
		
		var doc = document;
		if (doc == null || doc.URL == null) return;
		
		// only execute on OGame pages, and only ingame
		if (doc.location.host.indexOf(".ogame.") == -1 || doc.URL.search("/game/index.php") == -1) return;
		
		try {
			this.add_menu_icon(doc);
			this.inject_custom_js_css(doc);
		} catch(e) {}
		
		// check if an update is needed and run update
		galaxytoolbar.GTPlugin_general.update_check();
		
		this.onPageDomLoadCont(doc);
		return;
	},
	
	
	onPageDomLoadCont: function(doc) {
		var general = galaxytoolbar.GTPlugin_general;
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var element;
		// get debugsettings
		if (general.Prefs.prefHasUserValue("gtplugin.settings.debug")) {
			general.debug_mode = general.Prefs.getBoolPref("gtplugin.settings.debug");
		} else {
			general.debug_mode = false;
		}
		
		var host = doc.location.host;
		try {
			//only execute ingame
			if (doc.URL.search("/game/index.php") > -1) {
				general.oGameVersionCheck(doc,general.getLocString("toolbar_name"),"https://chrome.google.com/webstore/detail/baphbmdmbobikapopnggboiopbinogeo");
				
				
				
				if (!galaxytoolbar.GTPlugin_storage.tool_exists_for_ogame_url(doc.URL)) 
					return;
					
				if ((doc.URL.search("page=highscore") > -1) ||
				 (doc.URL.search("page=messages") > -1) ||
				 (doc.URL.search("page=shipyard") > -1) ||
				 (doc.URL.search("page=resources") > -1) ||
				 (doc.URL.search("page=station") > -1) ||
				 (doc.URL.search("page=defense") > -1) ||
				 (doc.URL.search("page=research") > -1) ||
				 (doc.URL.search("page=overview") > -1) ||
				 (doc.URL.search("page=empire") > -1) ||
				 (doc.URL.search("page=alliance") > -1) ||
				 (doc.URL.search("page=galaxy") > -1)) {
					
					this.update_summer_wintertime(general.get_script_of_page(doc));
				}
				
				if (doc.getElementById("eventboxContent") != null) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"fmovement")) {
						element = doc.getElementById('eventboxContent');
						if (MutationObserver) {
							var observer2 = new MutationObserver(
								function(mutations){ 
									mutations.forEach(function(mutation) {
										var nodes = mutation.addedNodes;
										for (var i = 0; i < nodes.length; i++) {
											if (nodes[i].nodeType == 1) {
												if (nodes[i].hasAttribute("id"))
													if (nodes[i].getAttribute("id") == "eventListWrap") {
														galaxytoolbar.GTPlugin_init.add_send_fleet_movements_button(doc);
														galaxytoolbar.GTPlugin_fleet_movement.save_fleet_contents(doc);
														if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
															galaxytoolbar.GTPlugin_fleet_movement.send_fleet_movements_ogeneral_only(e,doc,true);
														}
														return;
													}
											}
										}
									});
								});
							observer2.observe(element, { childList: true });
						} else {
							element.addEventListener("DOMNodeInserted", function(e){
								if (e.target.innerHTML == undefined) return;
								if (e.target.innerHTML.trim() == "") return;
								if (e.target.innerHTML.indexOf('id="eventHeader"') == -1) return;
								galaxytoolbar.GTPlugin_init.add_send_fleet_movements_button(doc);
								galaxytoolbar.GTPlugin_fleet_movement.save_fleet_contents(doc);
								if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
									galaxytoolbar.GTPlugin_fleet_movement.send_fleet_movements_ogeneral_only(e,doc,true);
								}
							}, false );
						}
						if (doc.getElementById("eventHeader") != null) {
							galaxytoolbar.GTPlugin_init.add_send_fleet_movements_button(doc);
							galaxytoolbar.GTPlugin_fleet_movement.save_fleet_contents(doc);
							if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
								galaxytoolbar.GTPlugin_fleet_movement.send_fleet_movements_ogeneral_only("",doc,false);
							}
						}
					}
				}

				// now that we registered the message sender, register the receiver
				var OGameOrigin = window.location.origin;
				window.addEventListener("message", function(event) {
				  if (event.source == window &&
					  event.origin === OGameOrigin && // only accept messages from the OGame Window
					  event.data.direction &&
					  event.data.direction == "from-ogame-page") {
						
						// http://s680-en.ogame.gameforge.com/game/index.php?page=messages&messageId=120141&tabid=21&ajax=1
						var message_id = event.data.url.match(/messageId=(\d+)/);
						if (!message_id && event.data.url.indexOf("page=messages") > -1) {
							// sometimes OGame is sending POST requests - grab it from response message then
							message_id = event.data.responseText.match(/data-msg-id="(\d+)"/);
						}
						
						if (message_id && message_id.length) {
							message_id = message_id[1]; // take over the id
							// OGame requested to display a message
							// check for combat report
							var combat_start = event.data.responseText.indexOf("ogame.messages.combatreport.loadData(");
							if (doc && combat_start >  -1) {
								galaxytoolbar.GTPlugin_messages.submit_v6_combat_report(doc, message_id, event.data.responseText);
							}
							// check for espionage report
							var espionage_start = event.data.url.indexOf("tabid=20&");
							if (espionage_start === -1 && event.data.url.indexOf("tab=20&") === -1) {
								espionage_start = event.data.responseText.indexOf("<input value='sr-"); // API key starts with sr- for standard reports; there is no other good content inside the HTML
							}
							if (doc && espionage_start >  -1) {
								var dom_content = document.createElement("div");
								dom_content.innerHTML = event.data.responseText;
								galaxytoolbar.GTPlugin_messages.submit_v6_reports_data(doc, dom_content, message_id);
							}
							
							// check for foreign espionage actions
							if (event.data.url.indexOf("tab=20&") > -1) {
								var dom_content = document.createElement("div");
								dom_content.innerHTML = event.data.responseText;
								galaxytoolbar.GTPlugin_messages.parse_espionage_activities_V6(doc, dom_content);
							}
						} 
						
						if (event.data.url.indexOf("page=ajaxChat") > -1) {
							// response is a JSON object
							var oResponse = JSON.parse(event.data.responseText);
							// the JSON response contains the complete messages and an HTML fragment with al messages etc. to display
							// the JSON message content is WRONG as it always shows the same playername :-(
							// so we have to use the HTML fragment
							var dom_content = document.createElement("div");
							if (oResponse.data) {
								// single player chatbox
								dom_content.innerHTML = oResponse.data;
								galaxytoolbar.GTPlugin_messages.submit_single_player_chatbox(doc, dom_content);
							} else if (oResponse.content) {
								// since ogame 6.1.6 the online chatbox with all users is also a XHR request
								dom_content.innerHTML = oResponse.content;
								galaxytoolbar.GTPlugin_messages.submit_player_messages_and_activities(doc, dom_content);
							}
						}
				  }
				});
				
				/* Chat works now only via ajax requests....
				// chatbar active? -> fetch messages and activities
				// TODO: how to catch messages that get added when the page was already loaded?
				if (doc.getElementById("chatBar")) {
					galaxytoolbar.GTPlugin_messages.submit_player_messages_and_activities(doc);
				}
				*/
				
				
				if (doc.URL.search("page=galaxy") > -1) { // /game/galaxy.php
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"galaxy")) {
						
						element = doc.getElementById('galaxyContent');
						if (MutationObserver) {
							var observer = new MutationObserver(function(m){ galaxytoolbar.GTPlugin_galaxyview.submit_galaxydata_mutation_handler(m,doc); });
							observer.observe(element, { childList: true });
						} else {
							element.addEventListener("DOMNodeInserted", 
								function(e){ 
									try {
										//added the check here, just to avoid multiple, unnecessary updates of the Messagedoc
										var id = e.relatedNode.getAttribute("id");
										if (id != "galaxyContent") {
											return;
										}
										galaxytoolbar.GTPlugin_galaxyview.submit_galaxydata_event_handler(e,doc); 
									} catch (e) {
										return;
									} 
								}, 
								false);
						}
					}
					
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"phalanx")) {
						
						var el = doc.createElement("span");
						el.setAttribute("style", "display: none;");
						el.setAttribute("id", "galaxytoolbar_arrivaltime_storage");
						el.setAttribute("data-value","");
						
						doc.body.appendChild(el);
						
						var string =
						'$(document).ajaxSuccess(function(e, xhr, settings) {'+"\n"+
						'	if (settings.url.indexOf("page=phalanx") > -1) {'+"\n"+
						'		var phalanx_overlay_text = xhr.responseText;'+"\n"+
						'		try {'+"\n"+
						'			var script = phalanx_overlay_text.substring(phalanx_overlay_text.indexOf("<script"),phalanx_overlay_text.length);'+"\n"+
						'			$("#galaxytoolbar_arrivaltime_storage").attr("data-value", script);'+"\n"+
						'		} catch(e) {'+"\n"+
						'		}'+"\n"+
						'	}'+"\n"+
						'});';
						
						this.injectScript(doc, string);
						
						// this will fire after the response has been received,
						// so after we have parsed the incoming arrival times in the script section (which becomes invisible for us, even if we'd listen to DOMNodeInserted)
						element = doc.body;
						if (MutationObserver) {
							var observer = new MutationObserver(
									function(m) {
										galaxytoolbar.GTPlugin_fleet_movement.phalanx_reports_mutation_handler(m,doc);
									});
							observer.observe(element, { childList: true });
						} else {
							element.addEventListener("DOMNodeInserted",
								function(e) {
									galaxytoolbar.GTPlugin_fleet_movement.phalanx_reports_event_handler(e,doc);
								}, false );
						}
					}
					return;
				}
				//enable this Code as soon as we want to deliver this feature
				/*if (doc.URL.search("page=traderOverview") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"auctioneer")) {
						galaxytoolbar.GTPlugin_auctioneer.oldBids[doc.location.host] = undefined;
						element = doc.getElementById('inhalt');
						if (MutationObserver) {
							var observer = new MutationObserver(function(m){ galaxytoolbar.GTPlugin_auctioneer.found_auctioneer_sub_page_mutation_handler(m,doc); });
							observer.observe(element, { childList: true });
						} else {
							doc.getElementById('inhalt').addEventListener("DOMNodeInserted", galaxytoolbar.GTPlugin_auctioneer.found_auctioneer_sub_page,true);
						}
					}
					return;
				}*/
				
				// Allyhistory
				if (doc.URL.search("page=alliance") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"allypage")) {
						element = doc.getElementById('eins');
						if (MutationObserver) {
							var observer = new MutationObserver(function(m){ galaxytoolbar.GTPlugin_allypage.submit_allydata_mutation_handler(m,doc); });
							observer.observe(element, { childList: true });
						} else {
							element.addEventListener("DOMNodeInserted", function(e){ galaxytoolbar.GTPlugin_allypage.submit_allydata_event_handler(e,doc); }, false );
						}
					}
					return;
				}
				
				// Empire view
				if (doc.URL.search("page=empire") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"empire")) {
						element = doc.getElementById('mainWrapper');
						
						if (MutationObserver) {
							var observer = new MutationObserver(function(m){ galaxytoolbar.GTPlugin_empire.submit_empiredata_mutation_handler(m,doc); });
							observer.observe(element, { childList: true});
						} else {
							element.addEventListener("DOMNodeInserted", function(e){ galaxytoolbar.GTPlugin_empire.submit_empiredata_event_handler(e, doc, true); }, false );
						}
						
						if (doc.getElementById("empireTab")) {
							galaxytoolbar.GTPlugin_empire.submit_empiredata(doc);
						}
					}
					return;
				}
				
				// messageContent
				// overall message view - reports can be part of it, but also combat reports etc. since OGame V6
				if (doc.URL.search("page=messages") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"reports")) {
						element = doc.getElementById('messages');
												
						if (MutationObserver) {
							var observer = new MutationObserver(function(m){ if (galaxytoolbar.GTPlugin_messages) galaxytoolbar.GTPlugin_messages.parseMessages_V6(m,doc); });
							observer.observe(element, { childList: true, subtree: true });
						} // no else - Chrome supports it anyway and FF since version 14
						return;
					}
				}
				
				if (doc.URL.search("page=overview") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
						galaxytoolbar.GTPlugin_planet_data.get_overview_data(doc);
					}
					return;
				}
				
				// OGame 3.0.0 Highscores
				if (doc.URL.search("page=highscore") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"stats")) {
						if (doc.getElementById("ranks") != null) {
							galaxytoolbar.GTPlugin_highscore.submit_highscoredata(doc);
						}
						
						element = doc.getElementById('stat_list_content');
						if (MutationObserver) {
							var observer = new MutationObserver(function(m){ galaxytoolbar.GTPlugin_highscore.submit_highscoredata_mutation_handler(m,doc); });
							observer.observe(element, { childList: true });
						} else {
							element.addEventListener("DOMNodeInserted", function(e){ galaxytoolbar.GTPlugin_highscore.submit_highscoredata_event_handler(e,doc,true); }, false );
						}
					}
					return;
				}
				
				// single message view (iframe) - reports
				if (doc.URL.search("page=showmessage") > -1) { // TODO: no longer there with OGame V6
					// in fact, a link to an espionage action should have "cat=4" in its link
					// but there is an OGame bug:
					// when going into such a message, the cat-number is correct, but if I click on "previous" or "next"
					// message, the cat-number stays, no matter what kind of message it is. 
					// besides, espionage actions don't have their own cat-number
					var res = galaxytoolbar.GTPlugin_messages.parse_Messages(doc);
					
					// add defenders coords/techs to crs
					if (doc.getElementById("battlereport") != null) {
						if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
							/**
							 * Note: this code reads the onclick attribute of OGame (which will open the detailed combat report)
							 * and add some more information from the combat report overview to it
							 * after that, it is written back
							 */
							var coords = doc.getElementById("battlereport").getElementsByTagName("a")[0].innerHTML.trim();
							var link = doc.getElementById("shortreport").getElementsByTagName("a")[doc.getElementById("shortreport").getElementsByTagName("a").length-1];
							
							// read the onclick attribute from OGame
							var onc = link.getAttribute("onclick").split("',");
							onc[0] += "&def_coords="+coords;
							
							// add defenders techs only in case it is no acs defend to the onclick attribute value
							var defenders = doc.getElementById("combatants").getElementsByTagName("div")[2].getElementsByTagName("a");
							if (defenders.length == 1) {
								var shortreport = doc.getElementById("shortreport").getElementsByTagName("tr");
								onc[0]+= "&def_weapon="+parseInt(shortreport[2].getElementsByTagName("td")[4].innerHTML.match(/(\d+)/)[1]);
								onc[0]+= "&def_shield="+parseInt(shortreport[3].getElementsByTagName("td")[4].innerHTML.match(/(\d+)/)[1]);
								onc[0]+= "&def_armour="+parseInt(shortreport[4].getElementsByTagName("td")[4].innerHTML.match(/(\d+)/)[1]);
							}
							
							// add repaired defense
							var line = doc.getElementById("shortreport").getElementsByClassName("summary")[0].
														getElementsByTagName("tr")[3].getElementsByTagName("td")[1].innerHTML;
							var string = galaxytoolbar.GTPlugin_combat_reports.parse_repaired(doc,line);
							
							onc[0] += string;
							
							onc = onc.join("',");
							// set the onclick attribute with adjusted URL, so that we have more information available in the pop-up window (of OGame),
							//  which will be opened when the users clicks on the link
							link.setAttribute("onclick",onc);
						}
					}
					
					if (!res && galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"reports")) {
						galaxytoolbar.GTPlugin_messages.findSingleReport(doc);
					}
					
					return;
				}
				
				var tmp;
				// fleet
				if (doc.URL.search("page=fleet1") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"fleet")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("fleetpagefound"),"All Galaxytools");
						if (doc.getElementById("warning") != null) {
							general.set_status(doc, "galaxyplugin"+1 , 2, general.getLocString("fleetpagenofleet"),"All Galaxytools");
						} else {
							tmp = galaxytoolbar.GTPlugin_planet_data.getData(doc,["military","civil"],1); // civil = ID to look for
							//alert(data2_xml);
							if (tmp != "") {
								general.send(doc,"fleet",tmp,doc.URL);
						} else {
								general.set_status(doc, "galaxyplugin"+1 , 3, general.getLocString("nodatafound"),"All Galaxytools");	
							}
						}
					}
					return;
				}
				
				// shipyard
				if (doc.URL.search("page=shipyard") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"shipyard")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("shipyardfound"),"All Galaxytools");
						tmp = galaxytoolbar.GTPlugin_planet_data.getData(doc,["military","civil"],2); // civil = ID to look for
						//alert(data2_xml);
						if (tmp != "") {
							general.send(doc,"shipyard",tmp,doc.URL);
						} else {
							general.set_status(doc, "galaxyplugin"+1 , 3, general.getLocString("nodatafound"),"All Galaxytools");
						}
					}
					
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
						galaxytoolbar.GTPlugin_planet_data.get_fleet_queue_only(doc);
					}
					return;
				}
				
				// resources buildings
				if (doc.URL.search("page=resources") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"buildings")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("buildingpagefound"),"All Galaxytools");
						tmp = galaxytoolbar.GTPlugin_planet_data.getData(doc,["building","storage"],2); // storage = ID to look for
						if (tmp != "") {
							general.send(doc,"buildings",tmp,doc.URL);
						} else {
							general.set_status(doc, "galaxyplugin"+1 , 3, general.getLocString("nodatafound"),"All Galaxytools");
						}
					}
					
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
						var xml = galaxytoolbar.GTPlugin_planet_data.get_planetinfo_header(doc);
						xml += galaxytoolbar.GTPlugin_planet_data.get_building_queue_only(doc);
						xml += galaxytoolbar.GTPlugin_planet_data.get_fleet_queue_from_building_pages(doc,1);
						xml += "\t</planetinfo>\n";
						general.send(doc,"queue",xml,doc.URL);
					}
					return;
				}
				
				// facilities
				if (doc.URL.search("page=station") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"buildings")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("buildingpagefound"),"All Galaxytools");
						tmp = galaxytoolbar.GTPlugin_planet_data.getData(doc,["stationbuilding"],2); // stationbuilding = ID to look for
						//alert(data_xml);
						if (tmp != "") {
							general.send(doc,"buildings",tmp,doc.URL);
						} else {
							general.set_status(doc, "galaxyplugin"+1 , 3, general.getLocString("nodatafound"),"All Galaxytools");
						}
						
						if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
							var xml = galaxytoolbar.GTPlugin_planet_data.get_planetinfo_header(doc);
							xml += galaxytoolbar.GTPlugin_planet_data.get_building_queue_only(doc);
							xml += "\t</planetinfo>\n";
							general.send(doc,"queue",xml,doc.URL);
						}
					}
					return;
				}
				
				// defense
				if (doc.URL.search("page=defense") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"defense")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("defensepagefound"),"All Galaxytools");
						tmp = galaxytoolbar.GTPlugin_planet_data.getData(doc,["defensebuilding"],2);
						//alert(data_xml);
						if (tmp != "") {
							general.send(doc,"defense",tmp,doc.URL);
						} else {
							general.set_status(doc, "galaxyplugin"+1 , 3, general.getLocString("nodatafound"),"All Galaxytools");
						}
						
						
					}
					
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
						galaxytoolbar.GTPlugin_planet_data.get_fleet_queue_only(doc);
					}
					return;
				}
				
				// research
				if (doc.URL.search("page=research") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"research")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("techpagefound"),"All Galaxytools");
						
						tmp = galaxytoolbar.GTPlugin_planet_data.getData(doc,["base1","base2","base3","base4"],2);
						
						if (tmp != "") {
							general.send(doc,"techs",tmp,doc.URL);
						} else {
							general.set_status(doc, "galaxyplugin"+1 , 3, general.getLocString("nodatafound"),"All Galaxytools");
						}
						
						if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
							var xml = galaxytoolbar.GTPlugin_planet_data.get_planetinfo_header(doc);
							xml += galaxytoolbar.GTPlugin_planet_data.get_active_research(doc);
							xml += "\t</planetinfo>\n";
							general.send(doc,"queue",xml,doc.URL);
						}
					}
					return;
				}
				
				if (doc.URL.search("page=resourceSettings") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
						general.set_status(doc, "galaxyplugin"+1 , 0, "Resource settings found","All Galaxytools");
						var xml = galaxytoolbar.GTPlugin_planet_data.get_planetinfo_header(doc);
						xml += galaxytoolbar.GTPlugin_planet_data.get_resourceSettings(doc);
						xml += "\t</planetinfo>\n";
						general.send(doc,"resourceSettings",xml,doc.URL);
					}
				}
				
				// read all Techs
				if (doc.URL.search("page=globalTechtree") > -1 || doc.URL.search("page=techtree&tab=3") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"reports")) {
						galaxytoolbar.GTPlugin_techtreeparser.parse_techtree(doc,doc);
					}
					return;
				}
				
				// send full crs, just to ogeneral
				if (doc.URL.search("page=combatreport") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"ogeneral")) {
						galaxytoolbar.GTPlugin_combat_reports.submit_complete_cr(doc);
					}
					return;
				}
				
				// save the activity you are causing on your own (e.g. by attacking a planet)
				if (doc.URL.search("page=movement") > -1) {
					if (galaxytoolbar.GTPlugin_storage.target_tool_exists(doc.URL,"galaxy")) {
						galaxytoolbar.GTPlugin_messages.save_own_activities(doc);
					}
					return;
				}
				
				// decomment to get an alert of all translations for our probes_files when visiting the settings
				/*if (doc.URL.search("page=preferences") > -1) {
					var resources_names = galaxytoolbar.GTPlugin_planet_data.get_resources_names(doc);
					galaxytoolbar.GTPlugin_techtreeparser.get_language_file(doc.URL,resources_names);
					//galaxytoolbar.GTPlugin_techtreeparser.get_androgame_language_file(doc.URL,null);
					return;
				}*/
			}
		} catch(error) {
			// nothing to do
			general.log_to_console("error at initialization: "+error);
		}
	},
	
	update_summer_wintertime: function(script) {
		var pos = script.indexOf("startServerTime");
		if (pos > -1) {
			var tmp = script.substring(pos,pos+100);
			
			var match = tmp.match(/\((-{0,1}\d+)\)/);
			if (match[1]) {
				// NOTE: difference to Firefox here, because Chrome has its JS-variables per frame and not per window
				localStorage.setItem("galaxytool_timezone_difference",parseInt(match[1]));
			} else {
				localStorage.setItem("galaxytool_timezone_difference",0);
			}
		}
	},
	
	add_menu_icon: function(doc) {
		var menu = doc.getElementById("menuTableTools");
		
		if (menu == null) 
			menu = doc.getElementById("menuTable");
			
		if (menu == null)
			return 0;
		
		var li = doc.createElement("li");

		var span = doc.createElement("span");
		
		span.setAttribute("class",'menu_icon');
		
		
		var el = doc.createElement("img");
		
		el.setAttribute("height",'29');
		
		el.setAttribute("width",'38');
		
		el.setAttribute("src",chrome.extension.getURL("img/menuicon.png"));
		
		span.appendChild(el);
		li.appendChild(span);
		
		el = doc.createElement("a");
		
		el.setAttribute("class",'menubutton');
		
		el.setAttribute("href",'#');
		
		span = doc.createElement("span");
		
		span.setAttribute("class",'textlabel');
		
		var txt = doc.createTextNode("Galaxytoolbar");
		span.appendChild(txt);
		
		el.appendChild(span);
		
		li.appendChild(el);
		
		li.addEventListener("click",function(e) { galaxytoolbar.GTPlugin_options2.toggleOptions(doc); },false);
		
		menu.appendChild(li);
	},
	
	inject_custom_js_css: function(doc) {
		this.injectScript(doc,"function galaxytoolbarManageTabs(id) {"+
							"	var selector = '#' + id;"+
							"	var rel = $(selector).attr('rel');"+
							"	if ($(selector).hasClass('opened')) {"+
							"		$(selector).addClass('closed');"+
							"		$(selector).removeClass('opened');"+
							"		$(\"#\" + rel).hide();"+
							"	} else {"+
							"		$(selector).removeClass('closed');"+
							"		$(selector).addClass('opened');"+
							"		$(\"#\" + rel).show();"+
							"	}"+
							"}");
							
		var link = doc.createElement("link");
		
		link.setAttribute("type",'text/css');
		
		link.setAttribute("rel","stylesheet");
		
		link.setAttribute("href",chrome.extension.getURL("css/galaxytoolbar.css"));
		
		doc.getElementsByTagName("head")[0].appendChild(link);
	},
	
	add_send_reports_button: function(doc) {
		var p = doc.getElementById("tabs-nfFavorites").firstChild;  // better placement possible within LI Tags but no longer needed with Ogame V6
		
		var a = doc.createElement("a");
		
		a.setAttribute("class","tooltipHTML");
		
		a.setAttribute("title",galaxytoolbar.GTPlugin_general.getLocString("toolbar_name")+"|"+galaxytoolbar.GTPlugin_general.getLocString("submit_espionage_msg"));
		
		a.setAttribute("style","float:right; margin-right:50px; margin-top: 2px; cursor:pointer;");
		
		a.setAttribute("href","javascript:void(0);");
		
		var img = doc.createElement("img");
		
		img.setAttribute("src",chrome.extension.getURL("img/send_to_galaxytool.png"));
		
		a.appendChild(img);
		
		a.addEventListener("click",function(e) {
			galaxytoolbar.GTPlugin_messages.findMultipleReport(doc,true);
		},false);
		p.parentNode.insertBefore(a,p);
	},
	
	add_send_fleet_movements_button: function(doc) {
		var p = doc.getElementById("eventHeader").firstChild;
		
		var a = doc.createElement("a");
		
		a.setAttribute("class","tooltipHTML");
		
		
		a.setAttribute("title",galaxytoolbar.GTPlugin_general.getLocString("toolbar_name")+"|"+galaxytoolbar.GTPlugin_general.getLocString("submit_fmovments"));
		
		a.setAttribute("style","float:left; margin-left:30px; margin-top: 7px; cursor:pointer;");
		
		a.setAttribute("href","javascript:void(0);");
		
		var img = doc.createElement("img");
		
		img.setAttribute("src",chrome.extension.getURL("img/send_to_galaxytool_small.png"));
		
		a.appendChild(img);
		
		a.addEventListener("click",function(e) {
			galaxytoolbar.GTPlugin_fleet_movement.get_fleet_data_210(doc,false);
		},false);
		p.parentNode.insertBefore(a,p);
	},
	
	injectScript: function(doc,source) {
		var script = doc.createElement("script");
		
		script.setAttribute("type",'text/javascript');
		
		script.innerHTML = source;
		
		doc.getElementsByTagName("head")[0].appendChild(script);
	}
};