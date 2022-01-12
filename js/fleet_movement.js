"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_fleet_movement) galaxytoolbar.GTPlugin_fleet_movement={};

galaxytoolbar.GTPlugin_fleet_movement = {
	
	/**
	 * general_fleet_info[i][0]  = int			fleet id
	 * general_fleet_info[i][1]  = array		0=>arrival date-time, 1=>scantime
	 * general_fleet_info[i][2]  = string		mission
	 * general_fleet_info[i][3]  = string		source planet name
	 * general_fleet_info[i][4]  = array		source planet coords
	 * general_fleet_info[i][5]  = array		fleet composition
	 * general_fleet_info[i][6]  = boolean		if the http_request has to be processed
	 * general_fleet_info[i][7]  = string		planet name of the destination
	 * general_fleet_info[i][8]  = array		destination planet coords
	 * general_fleet_info[i][9]  = boolean|null if the http_request to get the fleet comp has been processed completely
	 * general_fleet_info[i][10] = int			federationID (for acs attacks)
	 * general_fleet_info[i][11] = boolean		is the source planet a moon?
	 * general_fleet_info[i][12] = boolean		is the destination a moon?
	 *  
	 */
	
	general_fleet_info : new Array(),
	// holds information about the arrival times of fleets for a given host and event-id:
	// arrival_times_storage["uni1.ogame.de"][12345] will contain the arrival time of that fleet
	arrival_times_storage : new Object(),
	tooltip_storage : new Object(),
	
	ships : new Array(),
	error_occured: false,
	reqs: null,
	
	mission_ids : new Array(
			undefined, /*0*/
			"attack",
			"acs_attack",
			"transport",
			"deployment",
			"acs_defend",
			"espionage",
			"colonization",
			"recycle",
			"moon_destruction",
			"missile_attack",
			undefined, /*11*/
			undefined,
			undefined,
			undefined, /*14*/
			"expedition"
	),
	
	parsePhalanx : function(doc,only_og) {
		try {
			var fleet_content = doc.getElementById("phalanxWrap");
			if (fleet_content == null) return;
			
			fleet_content = doc.getElementById("phalanxWrap").children[0];
			
			var number_of_events = fleet_content.getElementsByTagName("div").length;
			if (number_of_events < 1) return;
			
			var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(doc.URL);
			if (tool_ids.length < 1) return;
			
			if (!galaxytoolbar.GTPlugin_storage.hasTranslation(tool_ids[0]))
				return galaxytoolbar.GTPlugin_techtreeparser.download_and_parse_techtree(doc,this,this.parsePhalanx,new Array(doc,only_og));
			
			var general = galaxytoolbar.GTPlugin_general;
			
			// now we found the phalanx view
			general.clear_status(doc);
			general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("phalanxfound"),"All Galaxytools");

			//make sure, that we have the correct number of divs after possibly creating a status tab
			var fleet_events = fleet_content.getElementsByTagName("div");
			var host = doc.location.host;
			var fleet_event;
			var classname;
			var j = 0;
			var acs_found = false;
			
			for (var i = 0; i < fleet_events.length; i++) {
				if (this.error_occured) {
					this.reset_global_arrays();
					return;
				}
				fleet_event = fleet_events[i];
				j=0;
				// save fleet id
				this.general_fleet_info[i] = new Array();
				
				if (fleet_event.hasAttribute("id")) {
					
					if (fleet_event.getAttribute("id").match(/(\d+)/) == null
							|| (fleet_event.getAttribute("id").indexOf("eventRow") == -1
							&& fleet_event.getAttribute("id").indexOf("unionRow") == -1)) {
						//for example "resources in flight" adds one additional div
						this.general_fleet_info[i][9] = false; // do not submit
						this.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
						continue;
					}
					
					// check if we have an acs attack - collect subfleet id here
					if (fleet_event.getAttribute("id").indexOf("unionRow") > -1) {
						// event id
						this.general_fleet_info[i][0] = parseInt(fleet_event.getAttribute("class").match(/(\d+)/)[1]);
						// subfleet id
						this.general_fleet_info[i][10] = parseInt(fleet_event.getAttribute("id").match(/(\d+)/)[1]);
					} else {
						this.general_fleet_info[i][0] = parseInt(fleet_event.getAttribute("id").match(/(\d+)/)[1]);
						this.general_fleet_info[i][10] = 0;
					}
				} else {
					// antigame adds rows without id - but each phalanx row must have one id
					this.general_fleet_info[i][9] = false; // do not submit
					this.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
					continue;
				}
				
				// get information about the mission of the fleet
				this.general_fleet_info[i][2] = this.mission_ids[parseInt(fleet_event.getAttribute("data-mission-type"))];
				// does the fleet return?
				this.general_fleet_info[i][5] = fleet_event.getAttribute("data-return-flight") == "true";
				
				var list_entry;
				while (list_entry = fleet_event.getElementsByTagName("li")[j]) {
					if (list_entry.hasAttribute("class")) {
						classname = list_entry.getAttribute("class");
						
						// antigame adds some own properties
						if (classname.indexOf("coordsOrigin") > -1)
							classname = "coordsOrigin";
						
						switch(classname) {
							// collect information from countdown
							case "countDown" 	:
								this.general_fleet_info[i][1] = new Array(2);
								this.general_fleet_info[i][1] = this.get_time(galaxytoolbar.GTPlugin_general.get_tzd(host),this.arrival_times_storage[host]["servertime"],this.arrival_times_storage[host][this.general_fleet_info[i][0]]);
								break;
							// get Planetname of the origin
							case "originFleet"	:
								if (list_entry.getElementsByTagName("a").length > 0) {
									this.general_fleet_info[i][3] = list_entry.getElementsByTagName("a")[0].textContent.trim();
								} else if (list_entry.getElementsByTagName("span").length > 0){
									this.general_fleet_info[i][3] = list_entry.getElementsByTagName("span")[0].textContent.trim();
								} else {
									this.general_fleet_info[i][3] = list_entry.textContent.trim();
								}
								
								this.general_fleet_info[i][11] = list_entry.getElementsByTagName("figure").length > 0 
																	&& list_entry.getElementsByTagName("figure")[0].getAttribute("class").indexOf("moon") > 0;
								break;
							// get coords of the origin
							case "coordsOrigin"	:
								this.general_fleet_info[i][4] = new Array(3);
								if (this.general_fleet_info[i][2] == "acs_attack") {
									if (list_entry.getElementsByTagName("span").length > 0) {
										this.general_fleet_info[i][9] = false; // do not submit
										this.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
										acs_found = true;
										break;
									} else {
										this.general_fleet_info[i][9] = true; //submit this entry
									}
								} else {
									this.general_fleet_info[i][9] = true; //submit this entry
								}
								this.general_fleet_info[i][4] = this.get_coords(list_entry.getElementsByTagName("a")[0].innerHTML); 
								break;
							// perform an XMLHttpRequest, to GET information, what is in the fleet
							// also find out if it returns from destination, or not
							case "detailsFleet"	: 
								this.general_fleet_info[i][6] = true;
								var tmp = list_entry.getElementsByTagName("span");
								if (tmp[0].hasAttribute("title")) {
									this.parse_fleet_info(i, tmp[0].getAttribute("title"), tool_ids, doc.URL);
								} else if (this.general_fleet_info[i][2] == "missile_attack") {
									// isn't inside anyway...
									this.ships[i] = new Array();
									this.ships[i][0] = galaxytoolbar.GTPlugin_planet_data.getEnglishNameForID(503);
									this.ships[i][1] = parseInt(list_entry.childNodes[0].nodeValue.trim());
									this.general_fleet_info[i][9] = true;
								} else {
									if (general.debug_mode) general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("error.espionagetoolow")
																										+" - FleetID="+this.general_fleet_info[i][0],"All Galaxytools");
									this.general_fleet_info[i][9] = false; //don't submit this entry
								}
								break;
							// get planetname of the destination planet
							case "destFleet"	:
								if (list_entry.getElementsByTagName("span").length > 0) {
									this.general_fleet_info[i][7] = list_entry.getElementsByTagName("span")[0].textContent.trim();
								} else {
									this.general_fleet_info[i][7] = list_entry.textContent.trim();
								}
									
	 							this.general_fleet_info[i][12] = list_entry.getElementsByTagName("figure").length > 0 
																		&& list_entry.getElementsByTagName("figure")[0].getAttribute("class").indexOf("moon") > 0;
								
								break;
							// get coords of the destination planet
							case "destCoords"	:
									this.general_fleet_info[i][8] = new Array(3);
									this.general_fleet_info[i][8] = this.get_coords(list_entry.getElementsByTagName("a")[0].innerHTML); 
									break;
						}
						if (acs_found) break;
					}
					j++;
				}
				if (acs_found) {
					acs_found = false;
					continue;
				}
			}
			
			galaxytoolbar.GTPlugin_fleet_movement.submit_fleet_data(doc,"phalanx",only_og);
			
		} catch(error) {
			this.reset_global_arrays();
			// alert("error occured in parse_phalanx: "+error);
		}
	},
	
	//OGame 2.1.0+ has a different eventList
	get_fleet_data_210 : function(doc,only_og) {
		try {
			var fleet_content = doc.getElementById("eventboxContent");
			
			if (fleet_content.getElementsByTagName("table").length < 1) return;
			fleet_content = fleet_content.getElementsByTagName("table")[0];
			var number_of_events = fleet_content.getElementsByTagName("tr").length;
			if (number_of_events < 1) return;
			
			var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(doc.URL);
			if (tool_ids.length < 1) return;
			
			var fmove = this;
			
			if (!galaxytoolbar.GTPlugin_storage.hasTranslation(tool_ids[0]))
				return galaxytoolbar.GTPlugin_techtreeparser.download_and_parse_techtree(doc,fmove,fmove.get_fleet_data_210,new Array(doc,only_og));
			
			//we have to load the <script>-section in order to find out, when the fleets arrive
			//this is missing in the regular OGame source code
			var general = galaxytoolbar.GTPlugin_general;
			var loc = doc.URL;

			loc = loc.substring(0,loc.indexOf('?'));
			loc = loc+'?page=eventList&ajax=1';
			
			var httpRequest = new XMLHttpRequest();
			httpRequest.open("GET", loc, true);
			httpRequest.onload = function fleet_onload() {
				var script = this.responseText.substring(httpRequest.responseText.lastIndexOf("<script type"),httpRequest.responseText.lastIndexOf('</script>'));
				general.set_status(doc, "galaxyplugin"+1 , 0, general.getLocString("movementfound"),"All Galaxytools");
				// recalculate number of events, in case AntiGame added something in the meantime
				var fleet_events = fleet_content.getElementsByTagName("tr");
				var fleet_event;
				var classname;
				var j = 0;
				var acs_found = false;
				for (var i = 0; i < fleet_events.length; i++) {
					if (fmove.error_occured) {
						fmove.reset_global_arrays();
						return;
					}
					fleet_event = fleet_events[i];
					j=0;
					// save fleet id
					fmove.general_fleet_info[i] = new Array();
					if (fleet_event.hasAttribute("id")) {
						if (fleet_event.getAttribute("id").match(/(\d+)/) == null || fleet_event.getAttribute("id").indexOf("eventRow") == -1) {
							//for example "resources in flight" adds one additional div
							fmove.general_fleet_info[i][9] = false; // do not submit
							fmove.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
							continue;
						}
						fmove.general_fleet_info[i][0] = parseInt(fleet_event.getAttribute("id").match(/(\d+)/)[1]);
					} else if (fleet_event.hasAttribute("class")) {
						if (fleet_event.getAttribute("class") == "allianceAttack") {
							fmove.general_fleet_info[i][0] = parseInt(fleet_event.getElementsByTagName("td")[0].getAttribute("id").match(/(\d+)/)[1]);
						} else if (fleet_event.getAttribute("class").match(/(\d+)/) != null) {
							fmove.general_fleet_info[i][0] = parseInt(fleet_event.getAttribute("class").match(/(\d+)/)[1]);
						} else {
							//Example: AntiGame's extra lines
							fmove.general_fleet_info[i][9] = false; // do not submit
							fmove.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
							continue;
						}
					} else {
						//no OGame html-code here (has always class and/or id)
						fmove.general_fleet_info[i][9] = false; // do not submit
						fmove.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
						continue;
					}
					
					// get information about the mission of the fleet
					fmove.general_fleet_info[i][2] = fmove.mission_ids[parseInt(fleet_event.getAttribute("data-mission-type"))];
					// does the fleet return?
					fmove.general_fleet_info[i][5] = fleet_event.getAttribute("data-return-flight") == "true";
					
					var list_entry;
					while (list_entry = fleet_event.getElementsByTagName("td")[j]) {
						if (list_entry.hasAttribute("class")) {
							classname = list_entry.getAttribute("class");
							if (classname.indexOf("countDown") > -1) {
									fmove.general_fleet_info[i][1] = new Array(2);
									fmove.general_fleet_info[i][1] = fmove.get_arrival_time(doc.location.host,script,fmove.general_fleet_info[i][0]);
									j++;
									continue;
							}
							
							// antigame adds some own properties - only clean it up in case, it is not the acs overview
							if (classname.indexOf("coordsOrigin") > -1 && classname.indexOf("textBeefy") == -1)
								classname = "coordsOrigin";
							if (classname.indexOf("destCoords") > -1 && classname.indexOf("textBeefy") == -1)
								classname = "destCoords";
							
							switch (classname) {
								// get Planetname of the origin
								case "originFleet"	:
									fmove.general_fleet_info[i][3] = list_entry.textContent.trim();
										
									// moon or planet - there is a moon figure in case of a moon
									fmove.general_fleet_info[i][11] = list_entry.getElementsByTagName("figure").length > 0 
																		&& list_entry.getElementsByTagName("figure")[0].getAttribute("class").indexOf("moon") > 0;
									
									break;
								//this is the overview of an acs attack
								case "coordsOrigin textBeefy" :
									fmove.general_fleet_info[i][9] = false; // do not submit
									fmove.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
									acs_found = true;
									break;
								// get coords of the origin
								case "coordsOrigin"	:
									fmove.general_fleet_info[i][4] = new Array(3);
									if (fmove.general_fleet_info[i][2] == "acs_attack") {
										if (list_entry.getElementsByTagName("span").length > 0) {
											fmove.general_fleet_info[i][9] = false; // do not submit
											fmove.general_fleet_info[i][6] = true; // the http_request doesn't have to be processed
											acs_found = true;
											break;
										} else {
											fmove.general_fleet_info[i][9] = true; //submit this entry
										}
									} else {
										fmove.general_fleet_info[i][9] = true; //submit this entry
									}
									fmove.general_fleet_info[i][4] = fmove.get_coords(list_entry.getElementsByTagName("a")[0].innerHTML);
									break;
								case "detailsFleet" :
									if (fmove.general_fleet_info[i][2] == "missile_attack") {
										fmove.general_fleet_info[i][6] = true;
										fmove.ships[i] = new Array();
										fmove.ships[i][0] = galaxytoolbar.GTPlugin_planet_data.getEnglishNameForID(503);
										fmove.ships[i][1] = parseInt(list_entry.getElementsByTagName("span")[0].innerHTML.trim());
										fmove.general_fleet_info[i][9] = true;
									}
									break;
								// perform an XMLHttpRequest, to GET information, what is in the fleet
								// also find out if it returns from destination, or not
								case "icon_movement"	: 
								case "icon_movement_reserve" :
									if (fmove.general_fleet_info[i][2] == "acs_attack" && !fmove.general_fleet_info[i][5]) {
										//save subfleet_id
										fmove.general_fleet_info[i][10] = parseInt(list_entry.getElementsByTagName("span")[0].getAttribute("data-federation-user-id"));
									} else {
										fmove.general_fleet_info[i][10] = 0;
									}
									
									
									// we don't have to do this in case of a missile attack - there would be no link anyway
									if (fmove.general_fleet_info[i][2] != "missile_attack") {
										fmove.general_fleet_info[i][6] = true;
										if (fmove.general_fleet_info[i][10] > 0)
											fmove.parse_fleet_info(i, fmove.tooltip_storage[doc.location.host][fmove.general_fleet_info[i][10]], tool_ids, doc.URL);
										else
											fmove.parse_fleet_info(i, fmove.tooltip_storage[doc.location.host][fmove.general_fleet_info[i][0]], tool_ids, doc.URL);
									}
									break;
								// get planetname of the destination planet
								case "destFleet"	:
									fmove.general_fleet_info[i][7] = list_entry.textContent.trim();
									fmove.general_fleet_info[i][12] = list_entry.getElementsByTagName("figure").length > 0 
																		&& list_entry.getElementsByTagName("figure")[0].getAttribute("class").indexOf("moon") > 0;
									break;
								// get coords of the destination planet
								case "destCoords"	:
										fmove.general_fleet_info[i][8] = new Array(3);
										fmove.general_fleet_info[i][8] = fmove.get_coords(list_entry.getElementsByTagName("a")[0].innerHTML);
										break;
							}
							if (acs_found) break;
						}
						j++;
					}
					if (acs_found) {
						acs_found = false;
						continue;
					}
				}
				
				// check every 50ms, if all requests have been passed
				galaxytoolbar.GTPlugin_fleet_movement.submit_fleet_data(doc,"eventList",only_og);
			};
			
			httpRequest.onerror = function() {return;};
			httpRequest.send(null);
		} catch(error) {
			this.reset_global_arrays();
			//alert("error occured in get_fleet_data_210: "+error);
		}
	},
	
	get_fleet_info : function(i,url,href,tool_ids) {
		try {
			var fleet_url = url.substring(0,url.lastIndexOf('/')+1)+href;
			var httpRequest = new XMLHttpRequest();
			httpRequest.open("GET", fleet_url, true);
			httpRequest.onreadystatechange = function (aEvt) {  
				if (httpRequest.readyState == 4) {  
					if (httpRequest.status == 200) { 
						galaxytoolbar.GTPlugin_fleet_movement.parse_fleet_info(i,httpRequest.responseText,tool_ids,url);
					} else {
						galaxytoolbar.GTPlugin_fleet_movement.general_fleet_info[i][6] = null;
					}
				}
			};
			httpRequest.send(null);  
		} catch(error) {
			galaxytoolbar.GTPlugin_fleet_movement.general_fleet_info[i][6] = null;
			// alert("error occured in get_fleet_info: "+error);
		}
	},
	
	save_fleet_contents : function(doc) {
		// no need to do this before OGame 5.2.2
		if (!galaxytoolbar.GTPlugin_general.compare_ogame_version_with(doc,5,2,2))
			return;
		
		var fleet_content = doc.getElementById("eventboxContent");
		
		if (fleet_content.getElementsByTagName("table").length < 1) return;
		fleet_content = fleet_content.getElementsByTagName("table")[0];
		
		var fleet_entries = fleet_content.getElementsByTagName("tr");
		if (fleet_entries.length < 1) return;
		
		this.tooltip_storage[doc.location.host] = new Object();
		for (var i = 0; i < fleet_entries.length; i++) {
			var id = 0;
			if (fleet_entries[i].hasAttribute("id")) {
				if (fleet_entries[i].getAttribute("id").match(/(\d+)/) == null || fleet_entries[i].getAttribute("id").indexOf("eventRow") == -1)
					//for example "resources in flight" adds one additional div
					continue;
				
				id = parseInt(fleet_entries[i].getAttribute("id").match(/(\d+)/)[1]);
			}
			
			var f = fleet_entries[i].getElementsByClassName("icon_movement");
			
			if (f.length == 0)
				f = fleet_entries[i].getElementsByClassName("icon_movement_reserve");
			
			if (f.length == 0)
				continue;
			
			f = f[0].getElementsByTagName("span");
			
			// missile attacks
			if (f.length == 0)
				continue;
			
			f = f[0];
			
			if (f.hasAttribute("data-federation-user-id") && f.getAttribute("data-federation-user-id").trim() != "")
				id = parseInt(f.getAttribute("data-federation-user-id"));
			
			if (f.hasAttribute("title") && id > 0)
				this.tooltip_storage[doc.location.host][id] = f.getAttribute("title");
			
		}
	},
	
	parse_fleet_info : function (i,answer_txt,tool_ids,url) {
		var answer_doc = galaxytoolbar.GTPlugin_general.HTMLParser(answer_txt);
		var storage = galaxytoolbar.GTPlugin_storage;
		var general = galaxytoolbar.GTPlugin_general;
		this.ships[i] = new Array();
		try {
			var fleet = answer_doc.getElementsByTagName("td");
			var j = 0;
			var resources = false;
			while ( j < fleet.length ) {
				if (this.error_occured) return;
				if (fleet[j].innerHTML == "&nbsp;" || fleet[j].hasAttribute("colspan")) {
					resources = true; break;
				}
				
				this.ships[i][j] = storage.get_translation(tool_ids[0],general.trimString(fleet[j].innerHTML).replace(/:/,""),true,url);
				this.ships[i][j+1] = parseInt(fleet[j+1].innerHTML.replace(/\D/g,""));
				j += 2;
			}
			
			if (resources) {
				var x = j;
				j++;
				this.ships[i][x] = "Metal";
				this.ships[i][x+1] = parseInt(fleet[j+1].innerHTML.replace(/\D/g,""));
				this.ships[i][x+2] = "Crystal";
				this.ships[i][x+3] = parseInt(fleet[j+3].innerHTML.replace(/\D/g,""));
				this.ships[i][x+4] = "Deuterium";
				this.ships[i][x+5] = parseInt(fleet[j+5].innerHTML.replace(/\D/g,""));
			}
			
			this.general_fleet_info[i][6] = true;
		} catch (error) {
			this.general_fleet_info[i][6] = null;
		}
	},
	
	get_arrival_time : function (host,script,count_down_id) {
		//var timeDelta = 1289060944000 - (new Date()).getTime();
		var ogame_servertime_ms = parseInt(script.substring(0,script.indexOf("LocalizationStrings")).match(/timeDelta\s*\=\s*(\d+)/)[1]);
		//function initEventlist() {
		//    var countdowns = new Array();
		//    new eventboxCountdown(getElementByIdWithCache("counter-94825543"), 45221);
		//
		//    $('.eventFleet:odd').addClass('odd'); 
		//    $('.partnerInfo:even').addClass('part-even');  
		//}   
		var reduced_string = "";
		var additional_seconds = 0;
		reduced_string = script.substring(script.indexOf("$(document).ready(function()"));
		reduced_string = reduced_string.substring(reduced_string.indexOf("counter-eventlist-"+count_down_id)-1);
		additional_seconds = parseInt(reduced_string.match(/\-\d+\"\)\s*,\s*(\d+)/)[1]);
		
		var tzd = galaxytoolbar.GTPlugin_general.get_tzd(host);

		// now create time_string in ogame_servertime format
		return this.get_time(tzd,ogame_servertime_ms,additional_seconds);
	},
	
	get_time: function(tzd, ogame_server_time,additional_seconds) {
		var utc_arrival = ogame_server_time + additional_seconds*1000;
		
		var utc_date = new Date(utc_arrival + tzd);
		var year   = utc_date.getUTCFullYear();
		var month  = utc_date.getUTCMonth()+1; // 0 = January
		var day    = utc_date.getUTCDate();
		var hour   = utc_date.getUTCHours();
		var minute = utc_date.getUTCMinutes();
		var second = utc_date.getUTCSeconds();
		
		if (month < 10)  month  = "0"+month;
		if (day < 10)    day    = "0"+day;
		if (hour < 10)   hour   = "0"+hour;
		if (minute < 10) minute = "0"+minute;
		if (second < 10) second = "0"+second;
		
		var ogame_time = new Date(ogame_server_time + tzd);
		var ogameyear   = ogame_time.getUTCFullYear();
		var ogamemonth  = ogame_time.getUTCMonth()+1; // 0 = January
		var ogameday    = ogame_time.getUTCDate();
		var ogamehour   = ogame_time.getUTCHours();
		var ogameminute = ogame_time.getUTCMinutes();
		var ogamesecond = ogame_time.getUTCSeconds();
			
		if (ogamemonth < 10)  ogamemonth  = "0"+ogamemonth;
		if (ogameday < 10)    ogameday    = "0"+ogameday;
		if (ogamehour < 10)   ogamehour   = "0"+ogamehour;
		if (ogameminute < 10) ogameminute = "0"+ogameminute;
		if (ogamesecond < 10) ogamesecond = "0"+ogamesecond;
		
		return [year+'.'+month+'.'+day+' '+hour+':'+minute+':'+second,
		ogameyear+'.'+ogamemonth+'.'+ogameday+' '+ogamehour+':'+ogameminute+':'+ogamesecond];
	},
	
	save_all_arrival_times : function(phalanx_overlay_text,host) {
		try {
			galaxytoolbar.GTPlugin_fleet_movement.arrival_times_storage[host] = new Object();
			var script = phalanx_overlay_text.substring(phalanx_overlay_text.indexOf("<script"),phalanx_overlay_text.length);
			
			galaxytoolbar.GTPlugin_fleet_movement.arrival_times_storage[host]["servertime"] = 
				parseInt(script.match(/timeDelta\s*\=\s*(\d+)/)[1]);
				
			var regex = /counter-phalanx-(\d+)"\)\[\d\],(\d+)/g;
			var match;
			while (match = regex.exec(script)) {
				galaxytoolbar.GTPlugin_fleet_movement.arrival_times_storage[host][parseInt(match[1])] = parseInt(match[2]);
			}
		} catch(e) {
			// ignore any errors that might come up in order to not interrupt the request
		}
	},
	
	get_coords : function(coords_string) {
		var coords_exp = /(\d+):(\d+):(\d+)/;
		var coords = coords_exp.exec(coords_string);
		return [coords[1],coords[2],coords[3]];
	},
	
	reset_global_arrays: function() {
			//drop values from all arrays / variable
			galaxytoolbar.GTPlugin_fleet_movement.error_occured = false;
			galaxytoolbar.GTPlugin_fleet_movement.general_fleet_info = new Array();
			galaxytoolbar.GTPlugin_fleet_movement.ships = new Array();
			galaxytoolbar.GTPlugin_fleet_movement.reqs = null;
	},
	
	check_requests: function(doc,type,only_og) {
		if (galaxytoolbar.GTPlugin_fleet_movement.error_occured) {
			clearInterval(galaxytoolbar.GTPlugin_fleet_movement.reqs);
			galaxytoolbar.GTPlugin_fleet_movement.reset_global_arrays();
			return;
		}
		
		var current_status = false;
		for (var i = 0; i < galaxytoolbar.GTPlugin_fleet_movement.general_fleet_info.length; i++) {
			if (galaxytoolbar.GTPlugin_fleet_movement.general_fleet_info[i][6] == false) {
				current_status = false;
				break;
			} else {
				current_status = true;
			}
		}
		
		if (current_status) {
			// now all xml_http_requests have been done
			// create fleet xml
			clearInterval(galaxytoolbar.GTPlugin_fleet_movement.reqs);
			galaxytoolbar.GTPlugin_fleet_movement.submit_fleet_data(doc,type,only_og);
		}
	},
	
	submit_fleet_data : function (doc,type,only_og) {
		try {
			var fleet_xml_fleet = "";
			var fleet_xml = "";
			var fleet_xml_entries = "";
			var moon;
			for (var i = 0; i < this.general_fleet_info.length; i++ ) {
				// do not submit first row of ACS_attack or if no fleet could be obtained
				if(!this.general_fleet_info[i][9] || (this.general_fleet_info[i][6] == null)) continue;
				
				fleet_xml_fleet = 	'\t<fleet '+
								'fleet_id="'+this.general_fleet_info[i][0];
				if (this.general_fleet_info[i][10] > 0) fleet_xml_fleet += '" sub_fleet_id="'+this.general_fleet_info[i][10];
				fleet_xml_fleet += 	'" mission="'+this.general_fleet_info[i][2]+
								'" arrival_time="'+this.general_fleet_info[i][1][0]+
								'" scantime="'+this.general_fleet_info[i][1][1]+
								'" returning="'+this.general_fleet_info[i][5]+'">\n';
								
				moon = "unknown";
				if (this.general_fleet_info[i][11] != undefined)
					moon = this.general_fleet_info[i][11];
				
				fleet_xml_fleet += 	'\t\t<origin galaxy="'+this.general_fleet_info[i][4][0]+
								'" system="'+this.general_fleet_info[i][4][1]+
								'" planet="'+this.general_fleet_info[i][4][2]+
								'" moon="'+moon+'">\n'+
								'\t\t\t<planetname>'+this.general_fleet_info[i][3]+'</planetname>\n'+
								'\t\t</origin>\n';
				
				moon = "unknown";
				if (this.general_fleet_info[i][12] != undefined)
					moon = this.general_fleet_info[i][12];
				
				fleet_xml_fleet += 	'\t\t<destination galaxy="'+this.general_fleet_info[i][8][0]+
								'" system="'+this.general_fleet_info[i][8][1]+
								'" planet="'+this.general_fleet_info[i][8][2]+
								'" moon="'+moon+'">\n'+
								'\t\t\t<planetname>'+this.general_fleet_info[i][7]+'</planetname>\n'+
								'\t\t</destination>\n';
				for (var j = 0; j < this.ships[i].length;) {
					if (this.ships[i][j] == "Unknown entry") return;
					if (isNaN(this.ships[i][j+1])) {
						galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("error.espionagetoolow")
																							+" - FleetID="+this.general_fleet_info[i][0],"All Galaxytools");
						break;
					}
					fleet_xml_entries +=  '\t\t<entry '+
									'name="'+this.ships[i][j]+
									'" amount="'+this.ships[i][j+1]+'"/>\n';
					j += 2;
				}
				if (fleet_xml_entries != "") {
					fleet_xml += fleet_xml_fleet+fleet_xml_entries+'\t</fleet>\n';
					fleet_xml_fleet = "";
					fleet_xml_entries = "";
				}
			}
			this.reset_global_arrays();
			//submit
			if (fleet_xml != "")
				galaxytoolbar.GTPlugin_general.send(doc,type,fleet_xml,doc.URL,only_og);
		} catch (error) {
			//alert("error occured in submit_fleet_data: "+error);
			this.reset_global_arrays();
		}
	},
	
	send_fleet_movements_ogeneral_only: function(e,doc,isDOMloaded) {
		if (isDOMloaded) {
			if (e.target.innerHTML == undefined) return;
			if (e.target.innerHTML.trim() == "") return;
			if (e.target.innerHTML.indexOf('id="eventHeader"') == -1) return;
		}
		
		
		this.get_fleet_data_210(doc,true);
	},
	
	phalanx_reports_mutation_handler: function (mutations,doc) {
		mutations.forEach(function(mutation) {
			var nodes = mutation.addedNodes;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1
					&& nodes[i].hasAttribute("class") 
					&& nodes[i].getAttribute("class").indexOf("phalanx") > -1) {
						var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
						var observer = new MutationObserver(
										function(m) {
											m.forEach(function(mut) {
														var n = mut.addedNodes;
														for (var i = 0; i < n.length; i++) {
															if (n[i].nodeType == 1
																&& n[i].hasAttribute("id") 
																&& n[i].getAttribute("id").indexOf("phalanxWrap") > -1) {
																	galaxytoolbar.GTPlugin_fleet_movement.save_all_arrival_times(doc.getElementById("galaxytoolbar_arrivaltime_storage").getAttribute("data-value"), doc.location.host);
																	galaxytoolbar.GTPlugin_fleet_movement.parsePhalanx(doc,false);
																	return;
															}
														}
													});
											});
						observer.observe(nodes[i], { childList: true });
						return;
					}
			}
		});
	},
	
	phalanx_reports_event_handler: function(e,doc) {
		if (e && e.target && e.target.id == "phalanxWrap") {
			// for some strange reasons, we need to delay parsing in this event handler
			setTimeout(function() {
				galaxytoolbar.GTPlugin_fleet_movement.save_all_arrival_times(doc.getElementById("galaxytoolbar_arrivaltime_storage").getAttribute("data-value"), doc.location.host);
				galaxytoolbar.GTPlugin_fleet_movement.parsePhalanx(doc,false);
			},5);
		}
	}
};