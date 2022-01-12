"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_highscore) galaxytoolbar.GTPlugin_highscore={};
//OGame 3.0.0 stats parser
galaxytoolbar.GTPlugin_highscore = {
	
	selectedRanks: -1,
	selectedTyp: -1,
	selectedWho: -1,
	
	/*
	 * 0 = Players
	 * 1 = Alliances
	 */
	getHighscoreWho: function(docroot) {
		// get information about what was selected - player=0 or ally=1
		try {
			if (docroot.getElementById("categoryButtons").getElementsByClassName("active")[0].getAttribute("id") == "player")
				return 0;
			else
				return 1;
		} catch(e) {
			return -1;
		}
	},
	
	/*
	 * 0 = Points
	 * 1 = Economy
	 * 2 = Research
	 * 3 = Fleet
	 * 4 = Fleet lost
	 * 5 = Fleet built
	 * 6 = Fleet destroyed
	 * 7 = Honor Points
	 */
	getHighscoreTyp: function(docroot) {
		// get information about what was selected - points=0 or fleet=1 or research=2
		try {
			var active_buttons = docroot.getElementById("typeButtons").getElementsByClassName("active");
			if (active_buttons.length == 2) {
				return parseInt(active_buttons[1].getAttribute("rel"));
			} else if (active_buttons.length == 1) {
				return parseInt(active_buttons[0].getAttribute("rel"));
			} else {
				return -1;
			}
		} catch(e) {
			return -1;
		}
		
	},
	/*
	 * returns array [from,to]
	 */
	getHighscoreWhich: function(docroot) {
		// get information about what ranks were selected
		try {
			var rows = docroot.getElementById("ranks").rows;
			if (rows[1].cells[0].getElementsByTagName("a").length > 0)
				return [parseInt(rows[1].cells[0].getElementsByTagName("a")[0].innerHTML.trim().replace(/\D/g,"")),parseInt(rows[rows.length-1].cells[0].getElementsByTagName("a")[0].innerHTML.trim().replace(/\D/g,""))];
			else
				return [parseInt(rows[1].cells[0].innerHTML.trim().replace(/\D/g,"")),parseInt(rows[rows.length-1].cells[0].innerHTML.trim().replace(/\D/g,""))];
		} catch(e) {
			return -1;
		}
		
	},
	
	getHighscoreText: function(docroot) {
		var rows;
		var line_cells;
		var ally_xml = "";
		var player_xml = "";
		var tmp;
		var statstype = "";
		var num_of_entries;
		
		var hasShips = this.selectedTyp == 3;
		
		switch (this.selectedTyp) {
			case 0: statstype = "score";
					break;
			case 1: statstype = "economy";
					break;
			case 2: statstype = "research";
					break;
			case 3: statstype = "fleet";
					break;
			case 4: statstype = "fleet_lost";
					break;
			case 5: statstype = "fleet_built";
					break;
			case 6: statstype = "fleet_destroyed";
					break;
			case 7: statstype = "honor_points";
					break;
		}
		
		if (this.selectedWho == 0) { // Players

			try {
				
				rows = docroot.getElementById("ranks").rows;
				
				num_of_entries = rows.length-1;
				var ranks = new Array(num_of_entries);
				var players = new Array(num_of_entries);
				var pIds = new Array(num_of_entries);
				var alliances = new Array(num_of_entries);
				var ally_ids = new Array(num_of_entries);
				var points = new Array(num_of_entries);
				var ships = new Array(num_of_entries);
				var homegalaxies = new Array(num_of_entries);
				var homesystems = new Array(num_of_entries);
				var homeplanets = new Array(num_of_entries);
				var players_with_playerid_0 = 0;
				
				for (var i = 0; i < num_of_entries; i++) {
					line_cells = rows[i+1].cells; // ignore table head
					
					if (line_cells[0].getElementsByTagName("a").length > 0)
						ranks[i] = parseInt(line_cells[0].getElementsByTagName("a")[0].innerHTML.trim().replace(/\D/g,""));
					else
						ranks[i] = parseInt(line_cells[0].innerHTML.trim().replace(/\D/g,""));
					
					// third cell (since Ogame v1.2, only playerstats) contains allyname (first link) and playername (second link)
					alliances[i] = "";
					homegalaxies[i] = 0;
					homesystems[i] = 0;
					homeplanets[i] = 0;
					ships[i] = 0;
					
					if (line_cells[2].getElementsByTagName("a").length == 2) {
						// get second link
						players[i] = line_cells[2].getElementsByTagName("a")[1].getElementsByTagName("span")[0].innerHTML.trim();
						
						if (players[i] == "") {
							alliances[i] = "";
							ally_ids[i] = 0;
							pIds[i] = 0;
							points[i] = 0;
							continue;
						}
						
						if (line_cells[2].getElementsByTagName("a")[1].getAttribute("href").indexOf("&position=") > -1) {
							// from OGame 3.1.0
							var match = line_cells[2].getElementsByTagName("a")[1].getAttribute("href").match(/galaxy=(\d+)&system=(\d+)&position=(\d+)/i);
							homegalaxies[i] = isNaN(parseInt(match[1])) ? 0 : parseInt(match[1]);
							homesystems[i] = isNaN(parseInt(match[2])) ? 0 : parseInt(match[2]);
							homeplanets[i] = isNaN(parseInt(match[3])) ? 0 : parseInt(match[3]);
						}
						
						// remove first [ and last ], anything else belongs to the allyname
						alliances[i] = line_cells[2].getElementsByTagName("a")[0].innerHTML.replace(/\n/g,"").replace(/^[\s\t]*\[/,"").replace(/\][\s\t]*$/,"").trim();
						
						tmp = line_cells[2].getElementsByTagName("a")[0].getAttribute("href");
						
						try {
							ally_ids[i] = parseInt(tmp.match(/id=(\d+)/i)[1]);
						} catch(own_ally) {
							if (tmp.indexOf("page=alliance") > -1) {
								ally_ids[i] = galaxytoolbar.GTPlugin_general.get_ally_id(docroot);
							} else {
								// inconsistent data
								galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, 
																		"Inconsistent data found\nwhile parsing page:\n" +
																		"Could not determine alliance id but player has one alliance.","All Galaxytools",true,"");
								return false;
							}
						}
						
					} else {
						// player has no ally - first link is playername
						players[i] = line_cells[2].getElementsByTagName("a")[0].getElementsByTagName("span")[0].innerHTML.trim();
						
						if (players[i] == "") {
							alliances[i] = "";
							ally_ids[i] = 0;
							pIds[i] = 0;
							points[i] = 0;
							continue;
						}
						
						if (line_cells[2].getElementsByTagName("a")[0].getAttribute("href").indexOf("&position=") > -1) {
							// from OGame 3.1.0
							var match = line_cells[2].getElementsByTagName("a")[0].getAttribute("href").match(/galaxy=(\d+)&system=(\d+)&position=(\d+)/i);
							homegalaxies[i] = isNaN(parseInt(match[1])) ? 0 : parseInt(match[1]);
							homesystems[i] = isNaN(parseInt(match[2])) ? 0 : parseInt(match[2]);
							homeplanets[i] = isNaN(parseInt(match[3])) ? 0 : parseInt(match[3]);
						}
						
						//no ally
						ally_ids[i] = 0;
					}
					
					// fourth cell (since Ogame v1.2, only playerstats) contains write message including playerid
					try {
						try {
							// &to=101072&
							pIds[i] = parseInt(line_cells[3].getElementsByTagName("a")[0].getAttribute("href").match(/to\=(\d+)/)[1], 10);
						} catch(try_v6_style) {
							// data-playerid="101072" since OGame V6
							pIds[i] = parseInt(line_cells[3].getElementsByTagName("a")[0].getAttribute("data-playerid"), 10);
						}
					} catch (own_payer) {
						// in case we found ourselve
						pIds[i] = galaxytoolbar.GTPlugin_general.get_player_id(docroot);
						players_with_playerid_0++;
					}
					
					// fifth cell contains score
					// OGame bug: sometimes there are negative points - no bug on honor points page
					points[i] = line_cells[4].childNodes[0].textContent.trim();
					if (points[i].indexOf('-') > -1 && this.selectedTyp != 7) {
						points[i] = 0;
					} else if (points[i].indexOf('-') > -1 && this.selectedTyp == 7) {
						points[i] = parseInt(points[i].replace(/\D/g,"")) * -1;
					} else {
						points[i] = parseInt(points[i].replace(/\D/g,""));
					}
					
					if (hasShips)
						ships[i] = line_cells[4].getAttribute("title").replace(/\D/g,"");
					
					// check consistency of data
					if ((players[i] == "") || 
						(pIds[i] == 0) || players_with_playerid_0 > 1 ||
						(isNaN(points[i]))) {
						
						// inconsistent data
						galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Inconsistent data found\nwhile parsing page:\n"
						+ "playername: " + players[i] + "\n"
						+ "playerid: " + pIds[i] + "\n"
						+ "number of players without playerid: " + players_with_playerid_0 + "\n"
						+ "points: " + points[i] + "\n","All Galaxytools",true,"");
						
						return false;
					}
				}
				
				
				player_xml += '\t<stats_header type="'+statstype+'"/>\n';
				for (var i = 0; i < ranks.length; i++) {
					if (players[i] != "") {
						player_xml += '\t<player rank="'+ranks[i]+'" playername="';
						player_xml += players[i].indexOf('&') > -1 ? players[i].replace(/&nbsp;/g," ") : players[i];
						player_xml += '" playerid="'+pIds[i];
						if (homegalaxies[i] > 0) {
							player_xml += '" galaxy="'+homegalaxies[i]+'" system="'+homesystems[i]+'" planet="'+homeplanets[i];
						}
						if (alliances[i] != "") {
							player_xml += '" allyname="';
							player_xml += alliances[i].indexOf('&') > -1 ? alliances[i].replace(/&nbsp;/g," ") : alliances[i];
							if (ally_ids[i] != -1) {
								//own alliance
								player_xml += '" allyid="'+ally_ids[i];
							}
						}
						player_xml += '" score="'+points[i];
						
						if (hasShips) {
							player_xml += '" ships="'+ships[i];
						}
						
						player_xml += '"/>\n';
					}
				}
				
				return player_xml;
			} catch(e) {
				galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Unexpected error: "+e,"All Galaxytools");
				return false;
			}
		} else {
			try {
				// alliances
				rows = docroot.getElementById("ranks").rows;
				num_of_entries = rows.length-1;
				var ranks = new Array(num_of_entries);
				var alliances = new Array(num_of_entries);
				var members = new Array(num_of_entries);
				var points = new Array(num_of_entries);
				var alliance_ids = new Array(num_of_entries);
				
				for (var i = 0; i < num_of_entries; i++ ) {
					line_cells = rows[i+1].cells;
					
					// cell one for rank
					if (line_cells[0].getElementsByTagName("a").length > 0)
						ranks[i] = parseInt(line_cells[0].getElementsByTagName("a")[0].innerHTML.trim().replace(/\D/g,""));
					else
						ranks[i] = parseInt(line_cells[0].innerHTML.trim().replace(/\D/g,""));
					
					// cell three for name
					alliances[i] = line_cells[2].getElementsByTagName("a")[0].innerHTML.replace(/\n/g,"").replace(/^[\s\t]*\[/,"").replace(/\][\s\t]*$/,"").trim();
					
					// ogame deletes alliances at 1:15
					// before that time, there are sometimes alliances without name
					// this would make the toolbar recognize the whole page as inconsistent
					if (alliances[i] == "") {
						alliances[i] = "EmptyAlliance";
					}
					
					
					tmp = line_cells[2].getElementsByTagName("a")[0].getAttribute("href");
					try {
						alliance_ids[i] = parseInt(tmp.match(/id=(\d+)/i)[1]);
					} catch(own_ally) {
						if (tmp.indexOf("page=alliance") > -1) {
							alliance_ids[i] = galaxytoolbar.GTPlugin_general.get_ally_id(docroot);
						} else {
							// inconsistent data
							galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, 
																	"Inconsistent data found\nwhile parsing page:\n" +
																	"Could not determine alliance id.","All Galaxytools",true,"");
							return false;
						}
					}
					
					// OGame 5.0.0 has no symbol for applying, in case you are in an alliance
					var num = 3;
					if (line_cells[3].hasAttribute("class") && line_cells[3].getAttribute("class").indexOf("sendmsg") > -1) {
						num++;
					}
					
					//  members
					members[i] = parseInt(line_cells[num].innerHTML.split("<")[0].trim());
					
					// points, check for negative points - no OGame bug at honor points page
					points[i] = line_cells[num+1].childNodes[0].textContent.trim();
					if (points[i].indexOf('-') > -1 && this.selectedTyp != 7) {
						points[i] = 0;
					} else if (points[i].indexOf('-') > -1 && this.selectedTyp == 7) {
						points[i] = parseInt(points[i].replace(/\D/g,"")) * -1;
					} else {
						points[i] = parseInt(points[i].replace(/\D/g,""));
					}
					
					// check consistency of data
					if (isNaN(ranks[i]) || 
						isNaN(points[i]) ||
						isNaN(members[i]) || 
						alliance_ids[i] == 0) {
						
						// inconsistent data
						galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Inconsistent data found\nwhile parsing page:\n"
						+ "rank: " + ranks[i]  + "\n"
						+ "alliance: " + alliances[i] + "\n"
						+ "points: " + points[i] + "\n"
						+ "member: " + members[i] + "\n","All Galaxytools",true,"");
						
						return false;
					}
				}
				ally_xml += '\t<stats_header type="'+statstype+'"/>\n';
				var num_allies = 0;
				
				for (var i = 0; i < ranks.length; i++) {
					if (alliances[i] != "EmptyAlliance" && members[i] > 0) {
						ally_xml += '\t<ally rank="'+ranks[i]+'" allyname="';
						ally_xml += alliances[i].indexOf('&') > -1 ? alliances[i].replace(/&nbsp;/g," ") : alliances[i];
						if (alliance_ids[i] > 0) {
							//own ally
							ally_xml += '" allyid="'+alliance_ids[i];
						}
						ally_xml += '" member="'+members[i]+'" score="'+points[i]+'"/>\n';
						num_allies++;
					}
				}
				 
				//there was no ally 
				if (num_allies == 0) {
					return false;
				}
				
				return ally_xml;
				
			} catch(e) {
				galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Unexpected error: "+e,"All Galaxytools");
				return false;
			}
			
		}
	},
	
	submit_highscoredata: function(doc) {
		try {
			try {
				galaxytoolbar.GTPlugin_general.clear_status(doc);
			} catch(e) {
				//alert("error: "+e);
			}
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("statsfound"),"All Galaxytools");
			galaxytoolbar.GTPlugin_general.selectedTyp = this.selectedTyp = this.getHighscoreTyp(doc);
			if (this.selectedTyp == -1) return; // no content loaded yet
			galaxytoolbar.GTPlugin_general.selectedWer = this.selectedWho = this.getHighscoreWho(doc);
			if (this.selectedWho == -1) return; // no content loaded yet
			this.selectedRanks = this.getHighscoreWhich(doc);
			if (this.selectedRanks == -1) return; // no content loaded yet
			galaxytoolbar.GTPlugin_general.selectedRanks = this.selectedRanks[0] + "-" + this.selectedRanks[1];
			var text_xml = this.getHighscoreText(doc);
			
			if (text_xml != false)
				galaxytoolbar.GTPlugin_general.send(doc,"highscore",text_xml,doc.URL);
			
			// ignore the content - table was resorted ***not possible atm anyway***
			// galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 3, galaxytoolbar.GTPlugin_general.getLocString("error.statssort"),"All Galaxytools");
			//}
		} catch(no_error) {
			// alert(no_error);
			// nothing to do here
			return;
		}
	},
	
	submit_highscoredata_event_handler: function(e,doc,isDOMloaded) {
		try {
			if (isDOMloaded) {
				var id = e.relatedNode.getAttribute("id");
				if (id != "stat_list_content" || e.target.innerHTML.indexOf('<table id="ranks"') == -1) {
					return;
				}
			}
			
			try {
				galaxytoolbar.GTPlugin_general.clear_status(doc);
			} catch(e) {
				//alert("error: "+e);
			}
			galaxytoolbar.GTPlugin_highscore.submit_highscoredata(doc);	
			// ignore the content - table was resorted ***not possible atm anyway***
			// galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 3, galaxytoolbar.GTPlugin_general.getLocString("error.statssort"),"All Galaxytools");
			//}
		} catch(no_error) {
			// alert(no_error);
			// nothing to do here
			return;
		}
	},
	
	submit_highscoredata_mutation_handler: function(mutations,doc) {
		mutations.forEach(function(mutation) {
			var nodes = mutation.addedNodes;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1) {
					for (var j =0; j < nodes[i].children.length; j++)
						if (nodes[i].children[j].hasAttribute("id") && 
							nodes[i].children[j].getAttribute("id") == "ranks") {
								galaxytoolbar.GTPlugin_highscore.submit_highscoredata(doc);
								return;
						}
				}
			}
		});
	}
};