"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_empire) galaxytoolbar.GTPlugin_empire={};

galaxytoolbar.GTPlugin_empire = {
	
	get_empire_data: function(docroot,playername) {
		var i = 0;
		var j = 0;
		var k = 0;
		var l = 0;
		var classname = null;
		var moon = null;
		var empire_xml = "";
		
		try {
			if (docroot.URL.search("planetType=1") > -1) {
				moon = true;
			} else {
				moon = false;
			}
			
			var div = docroot.getElementById('mainWrapper');
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Unexpected error: no empire table found","All Galaxytools");
			return false;
			// nothing to do
		}
		
		var current_div = null;
		var planets_div = null;
		try {
			i = 0;
			while(current_div = div.getElementsByTagName('div')[i]) {
				try {
					if (current_div.getAttribute("class").indexOf("planetWrapper") > -1) {
						planets_div = current_div;
						break;
					}
				} catch(e) {
					// ignore exceptions for non existing class attribute
				}
				i++;
			}
		} catch(e) {
			// nothing to do
		}
		if (planets_div == null) {
			return false;
		}
		
		try {
			var details_div = null;
			var planets = 0;
			
			planets = planets_div.childNodes.length;
			
			// the sum field is part of the empire view from v5.2.0 on
			planets -= 1;
				
			var planetheader	= new Array(planets);
			var resources		= new Array(planets);
			var res_buildings	= new Array(planets);
			var facilities		= new Array(planets);
			var defence			= new Array(planets);
			var research		= new Array(planets);
			var fleet			= new Array(planets);
			
			for (i=0;i<planets;i++) {
				planetheader[i]		= new Array(2);
				resources[i]		= [0,0,0,0];
				res_buildings[i]	= [0,0,0,0,0,0,0,0];
				facilities[i]		= [0,0,0,0,0,0,0];
				defence[i]			= [0,0,0,0,0,0,0,0,0,0];
				research[i]			= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
				fleet[i]			= [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
			}
			
			// Loop all planets or moons
			var planets_i = 0;
			for (i=0; i<planets_div.childNodes.length - 1; i++) {  // ignore the last childNode as it is the Sum columns
				current_div = planets_div.childNodes[i];
				try {
					classname = current_div.getAttribute("class");
				} catch(e) {
					classname = "";
				}
				if (classname.indexOf("planet") > -1) {
					// loop planet information
					for (j=0; j<current_div.childNodes.length; j++) {
						details_div = current_div.childNodes[j];
						try {
							classname = details_div.getAttribute("class");
						} catch(e) {
							classname = null;
						}
						
						// sequence of ships, buildings etc is always the same. Buildings that do not exist yet are shown anyway
						if (classname == "planetHead") {
							for (k=0; k<details_div.childNodes.length; k++) { 
								var tmp = details_div.childNodes[k];
								var tmp_class = "";
								
								if (tmp.hasAttribute("class"))
									tmp_class = tmp.getAttribute("class");
								else
									continue;
									
								if (tmp_class.indexOf("planetname") > -1) {
									// planetname
									planetheader[planets_i][0] = tmp.getAttribute("title") || tmp.innerHTML.trim();
								} else if (tmp_class == "planetData") {
									// coordinates
									planetheader[planets_i][1] = tmp.getElementsByTagName('li')[0].firstChild.textContent.replace(/[\[\]]/g,"");
									
									if (tmp.childNodes.length > 1 && (!galaxytoolbar.GTPlugin_general.compare_ogame_version_with(docroot, 5,6,3) || !moon)) {
										// we can get energy here
										// as of v5.6.3 not for moons
										resources[planets_i][3] = parseInt(tmp.childNodes[1].getElementsByTagName("div")[0].getAttribute("title").replace(/[.,']/g,"").match(/\/\s*(\d+)/)[1]);
									}
								}
							}
						} else if (classname.indexOf("groupresources") > -1) { // resources
							for (l=0; l<3; l++) {
								resources[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,"");
								if (resources[planets_i][l] == "") resources[planets_i][l] = 0;
							}
						} else if (classname.indexOf("groupsupply") > -1 && !moon) { // resource buildings
							for (l=0; l<8; l++) {
								res_buildings[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,"");
								if (res_buildings[planets_i][l] == "") res_buildings[planets_i][l] = 0;
							}
						
						} else if (classname.indexOf("groupstation") > -1) {   // facilities
							if (moon) {
								for (l=0; l<5; l++) {
									facilities[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,"");
									if (facilities[planets_i][l] == "") facilities[planets_i][l] = 0;
								}
							} else {
								for (l=0; l<7; l++) {
									facilities[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,"");
									if (facilities[planets_i][l] == "") facilities[planets_i][l] = 0;
								}
							}
						
						} else if (classname.indexOf("groupdefence") > -1) {   // defence - no information about defence in progress
							for (l=0; l<10; l++) {
								defence[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,"");
								if (defence[planets_i][l] == "") defence[planets_i][l] = 0;
							}
						
						} else if (classname.indexOf("groupresearch") > -1) {  // research
							for (l=0; l<16; l++) {
								research[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,""); // parseInt will remove also the new tech that might be next to current tech
								if (research[planets_i][l] == "") research[planets_i][l] = 0;
							}
						
						} else if (classname.indexOf("groupships") > -1) {	 // ships - no information about ships in progress
							for (l=0; l<14; l++) {
								fleet[planets_i][l] = details_div.getElementsByTagName('div')[l].firstChild.textContent.replace(/\D/g,"");
								if (fleet[planets_i][l] == "") fleet[planets_i][l] = 0;
							}
						}
					}
					planets_i++;
				} // ignore all other classes that might come up
			}
			
			// create XML
			var date_now	= new Date();
			var year		= date_now.getFullYear();
			var month		= date_now.getMonth()+1; // 0 = January
			var day			= date_now.getDate();
			var hour		= date_now.getHours();
			var minute		= date_now.getMinutes();
			var second		= date_now.getSeconds();
			
			if (month < 10)		month	= "0"+month;
			if (day < 10)		day		= "0"+day;
			if (hour < 10)		hour	= "0"+hour;
			if (minute < 10)	minute	= "0"+minute;
			if (second < 10)	second	= "0"+second;
			
			//adjusted for Google Chrome - read COGame settings, because it offers the possibility to delete research area
			var hasResearch = !moon || !galaxytoolbar.GTPlugin_general.getPrefs.getBoolPref("cogame_"+galaxytoolbar.GTPlugin_general.get_player_id(docroot)+"_empire_moon_research_off");
			
			for (i=0; i<planets; i++) {
				var report_xml = "";
				if (planetheader[i][1] != "") {
					var coords_exp = /(\d+):(\d+):(\d+)/;
					var coords = coords_exp.exec(planetheader[i][1]);
					var galaxy = coords[1];
					var system = coords[2];
					var planet = coords[3];
					
					if (hasResearch) {
						// report "header"
						report_xml = '\t<report playername="'+playername+'" planetname="'+planetheader[i][0]+'" moon="'+moon+'" galaxy="'+galaxy+'" system="'+system+'" planet="'+planet+'" ';
						report_xml += 'datetime="'+year+'.'+month+'.'+day+' '+hour+':'+minute+':'+second+'" scandepth="research">\n';
					} else {
						// report "header"
						report_xml = '\t<report playername="'+playername+'" planetname="'+planetheader[i][0]+'" moon="'+moon+'" galaxy="'+galaxy+'" system="'+system+'" planet="'+planet+'" ';
						report_xml += 'datetime="'+year+'.'+month+'.'+day+' '+hour+':'+minute+':'+second+'" scandepth="buildings">\n';
					} 
					
					// report "body"
					// resources
					report_xml += '\t\t<entry name="Metal" amount="'+resources[i][0]+'"/>\n';
					report_xml += '\t\t<entry name="Crystal" amount="'+resources[i][1]+'"/>\n';
					report_xml += '\t\t<entry name="Deuterium" amount="'+resources[i][2]+'"/>\n';
					
					// as of 5.6.3 no energy value for moons
					if (!galaxytoolbar.GTPlugin_general.compare_ogame_version_with(docroot, 5,6,3) || !moon)
						report_xml += '\t\t<entry name="Energy" amount="'+resources[i][3]+'"/>\n';
					
					// fleet (14)
					report_xml += '\t\t<entry name="Small Cargo" amount="'+fleet[i][0]+'"/>\n';
					report_xml += '\t\t<entry name="Large Cargo" amount="'+fleet[i][1]+'"/>\n';
					report_xml += '\t\t<entry name="Light Fighter" amount="'+fleet[i][2]+'"/>\n';
					report_xml += '\t\t<entry name="Heavy Fighter" amount="'+fleet[i][3]+'"/>\n';
					report_xml += '\t\t<entry name="Cruiser" amount="'+fleet[i][4]+'"/>\n';
					report_xml += '\t\t<entry name="Battleship" amount="'+fleet[i][5]+'"/>\n';
					report_xml += '\t\t<entry name="Colony Ship" amount="'+fleet[i][6]+'"/>\n';
					report_xml += '\t\t<entry name="Recycler" amount="'+fleet[i][7]+'"/>\n';
					report_xml += '\t\t<entry name="Espionage Probe" amount="'+fleet[i][8]+'"/>\n';
					report_xml += '\t\t<entry name="Bomber" amount="'+fleet[i][9]+'"/>\n';
					report_xml += '\t\t<entry name="Solar Satellite" amount="'+fleet[i][10]+'"/>\n';
					report_xml += '\t\t<entry name="Destroyer" amount="'+fleet[i][11]+'"/>\n';
					report_xml += '\t\t<entry name="Deathstar" amount="'+fleet[i][12]+'"/>\n';
					report_xml += '\t\t<entry name="Battlecruiser" amount="'+fleet[i][13]+'"/>\n';
					
					// defense (10)
					report_xml += '\t\t<entry name="Rocket Launcher" amount="'+defence[i][0]+'"/>\n';
					report_xml += '\t\t<entry name="Light Laser" amount="'+defence[i][1]+'"/>\n';
					report_xml += '\t\t<entry name="Heavy Laser" amount="'+defence[i][2]+'"/>\n';
					report_xml += '\t\t<entry name="Gauss Cannon" amount="'+defence[i][3]+'"/>\n';
					report_xml += '\t\t<entry name="Ion Cannon" amount="'+defence[i][4]+'"/>\n';
					report_xml += '\t\t<entry name="Plasma Turret" amount="'+defence[i][5]+'"/>\n';
					report_xml += '\t\t<entry name="Small Shield Dome" amount="'+defence[i][6]+'"/>\n';
					report_xml += '\t\t<entry name="Large Shield Dome" amount="'+defence[i][7]+'"/>\n';
					report_xml += '\t\t<entry name="Anti-Ballistic Missiles" amount="'+defence[i][8]+'"/>\n';
					report_xml += '\t\t<entry name="Interplanetary Missiles" amount="'+defence[i][9]+'"/>\n';
					
					if (!moon) {
						// resource buildings (8)
						report_xml += '\t\t<entry name="Metal Mine" amount="'+res_buildings[i][0]+'"/>\n';
						report_xml += '\t\t<entry name="Crystal Mine" amount="'+res_buildings[i][1]+'"/>\n';
						report_xml += '\t\t<entry name="Deuterium Synthesizer" amount="'+res_buildings[i][2]+'"/>\n';
						report_xml += '\t\t<entry name="Solar Plant" amount="'+res_buildings[i][3]+'"/>\n';
						report_xml += '\t\t<entry name="Fusion Reactor" amount="'+res_buildings[i][4]+'"/>\n';
						report_xml += '\t\t<entry name="Metal Storage" amount="'+res_buildings[i][5]+'"/>\n';
						report_xml += '\t\t<entry name="Crystal Storage" amount="'+res_buildings[i][6]+'"/>\n';
						report_xml += '\t\t<entry name="Deuterium Tank" amount="'+res_buildings[i][7]+'"/>\n';
						
						// facilities (7)
						report_xml += '\t\t<entry name="Robotics Factory" amount="'+facilities[i][0]+'"/>\n';
						report_xml += '\t\t<entry name="Nanite Factory" amount="'+facilities[i][1]+'"/>\n';
						report_xml += '\t\t<entry name="Shipyard" amount="'+facilities[i][2]+'"/>\n';
						report_xml += '\t\t<entry name="Research Lab" amount="'+facilities[i][3]+'"/>\n';
						report_xml += '\t\t<entry name="Terraformer" amount="'+facilities[i][4]+'"/>\n';
						report_xml += '\t\t<entry name="Alliance Depot" amount="'+facilities[i][5]+'"/>\n';
						report_xml += '\t\t<entry name="Missile Silo" amount="'+facilities[i][6]+'"/>\n';
					} else {
						// moon has only facilities
						report_xml += '\t\t<entry name="Robotics Factory" amount="'+facilities[i][0]+'"/>\n';
						report_xml += '\t\t<entry name="Shipyard" amount="'+facilities[i][1]+'"/>\n';
						report_xml += '\t\t<entry name="Lunar Base" amount="'+facilities[i][2]+'"/>\n';
						report_xml += '\t\t<entry name="Sensor Phalanx" amount="'+facilities[i][3]+'"/>\n';
						report_xml += '\t\t<entry name="Jump Gate" amount="'+facilities[i][4]+'"/>\n';
					}
					//adjusted for Google Chrome - read COGame settings, because it offers the possibility to delete research area
					if (hasResearch) {
						// research (16)
						report_xml += '\t\t<entry name="Espionage Technology" amount="'+research[i][0]+'"/>\n';
						report_xml += '\t\t<entry name="Computer Technology" amount="'+research[i][1]+'"/>\n';
						report_xml += '\t\t<entry name="Weapons Technology" amount="'+research[i][2]+'"/>\n';
						report_xml += '\t\t<entry name="Shielding Technology" amount="'+research[i][3]+'"/>\n';
						report_xml += '\t\t<entry name="Armour Technology" amount="'+research[i][4]+'"/>\n';
						report_xml += '\t\t<entry name="Energy Technology" amount="'+research[i][5]+'"/>\n';
						report_xml += '\t\t<entry name="Hyperspace Technology" amount="'+research[i][6]+'"/>\n';
						report_xml += '\t\t<entry name="Combustion Drive" amount="'+research[i][7]+'"/>\n';
						report_xml += '\t\t<entry name="Impulse Drive" amount="'+research[i][8]+'"/>\n';
						report_xml += '\t\t<entry name="Hyperspace Drive" amount="'+research[i][9]+'"/>\n';
						report_xml += '\t\t<entry name="Laser Technology" amount="'+research[i][10]+'"/>\n';
						report_xml += '\t\t<entry name="Ion Technology" amount="'+research[i][11]+'"/>\n';
						report_xml += '\t\t<entry name="Plasma Technology" amount="'+research[i][12]+'"/>\n';
						report_xml += '\t\t<entry name="Intergalactic Research Network" amount="'+research[i][13]+'"/>\n';
						report_xml += '\t\t<entry name="Astrophysics" amount="'+research[i][14]+'"/>\n';
						report_xml += '\t\t<entry name="Graviton Technology" amount="'+research[i][15]+'"/>\n';
					}
					// close report "header"
					report_xml += '\t</report>\n';
					
					empire_xml += report_xml;
				}
				
			}
			
			return empire_xml;
		} catch(error) {
			galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Unexpected error: "+error,"All Galaxytools");
			return false;
		}
	},
	
	submit_empiredata: function(doc) {
		// now we found HTML content that contained the ID
		var playername = galaxytoolbar.GTPlugin_general.get_playername(doc);
		if (playername != "") {
			var data_xml = galaxytoolbar.GTPlugin_empire.get_empire_data(doc,playername);
			if (data_xml != false) {
				galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("empirefound"),"All Galaxytools");
				galaxytoolbar.GTPlugin_general.send(doc,"empire",data_xml,doc.URL);
			}
		}
	},
	
	submit_empiredata_event_handler: function(e, doc, isDOMloaded) {
		try {
			if (isDOMloaded) {
				var id = e.relatedNode.getAttribute("id");
				if (id != "mainWrapper") {
					return;
				}	
				
				try {
					if (e.target.getAttribute("id") != "empireTab") {
						return;
					}
				} catch(e) {
					// ID attribute does not exist
					return;
				}
			}
			this.submit_empiredata(doc);
		} catch(e) {
			// do nothing
			//alert("error: "+e);
		}
	},
	
	submit_empiredata_mutation_handler: function(mutations,doc) {
		mutations.forEach(function(mutation) {
			var nodes = mutation.addedNodes;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1) {
					if (nodes[i].hasAttribute("id"))
						if (nodes[i].getAttribute("id") == "total" || nodes[i].getAttribute("id") == "planet0") {
							galaxytoolbar.GTPlugin_empire.submit_empiredata(doc);
							return;
						}
				}
			}
		});
	}
};