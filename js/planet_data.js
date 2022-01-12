"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_planet_data) galaxytoolbar.GTPlugin_planet_data={};

galaxytoolbar.GTPlugin_planet_data = {
	
	get_resources: function(docroot,element_id) {
		if (element_id == "resources_energy") return this.getPlanetEnergy(docroot);
		// this is more efficient than reading the tooltip
		try {
			var temp = docroot.getElementById(element_id).innerHTML;
			temp = temp.replace(/\.|\,/g,""); // remove decimal comma/point
			// check if "K" or "M" is inside
			temp = temp.slice(temp.search(/(\d)+[KM]*/));
			if (temp.indexOf("K") > -1) {
				temp = parseInt(temp) * 1000;
			} else if (temp.indexOf("M") > -1) {
				temp = parseInt(temp) * 1000000;
			} else {
				temp = parseInt(temp);
			}
			
			if (isNaN(temp)) {
				return 0;
			}
			
			return temp;
		} catch(e) {
			// no chance to find resources
			return 0;
		}
	},
	
	getPlanetEnergy: function(docroot) {
		try {
			var temp = galaxytoolbar.GTPlugin_general.get_script_of_page(docroot);
			
			temp = temp.match(/"energy":.+?"tooltip":"(.+?<\\\/table>)"/)[1];
			// remove .5/,5
			temp = parseInt(temp.split("<td")[2].match(/0|[1-9]{1}\d{0,2}(?:[,\.]\d{3})*/)[0].replace(/\D/g,""));
			
			if (isNaN(temp)) {
				return 0;
			}
			return temp;
		} catch(e) {
			return 0;
		}
	},
	
	getPlanetname: function(doc) {
		// return currently selected planet: Array of [planetname,coordinates,moon_or_planet]
		var planetname = "";
		var coordinates = "";
		var moon_or_planet = "";
		
		var metas = doc.getElementsByTagName("head")[0].getElementsByTagName("meta");
			
		for (var i = 0; i < metas.length; i++) {
			switch (metas[i].getAttribute("name")) {
				case "ogame-planet-type" : moon_or_planet = metas[i].getAttribute("content"); break;
				case "ogame-planet-coordinates" : coordinates = "["+metas[i].getAttribute("content")+"]"; break;
				case "ogame-planet-name" : planetname = metas[i].getAttribute("content");
			}
		}
		
		return [planetname,coordinates,moon_or_planet];
	},
	
	getEnglishNameForID: function(id) {
		switch (id) {
			// buildings
			case 1:		return "Metal Mine";
			case 2:		return "Crystal Mine";
			case 3:		return "Deuterium Synthesizer";
			case 4:		return "Solar Plant";
			case 12:	return "Fusion Reactor";
			case 22:	return "Metal Storage";
			case 23:	return "Crystal Storage";
			case 24:	return "Deuterium Tank";
			case 25:	return "Shielded Metal Den";
			case 26:	return "Underground Crystal Den";
			case 27:	return "Seabed Deuterium Den";
			
			// facilities
			case 14:	return "Robotics Factory";
			case 21:	return "Shipyard";
			case 31:	return "Research Lab";
			case 34:	return "Alliance Depot";
			case 44:	return "Missile Silo";
			case 15:	return "Nanite Factory";
			case 33:	return "Terraformer";
			// techs
			case 113:	return "Energy Technology";
			case 120:	return "Laser Technology";
			case 121:	return "Ion Technology";
			case 114:	return "Hyperspace Technology";
			case 122:	return "Plasma Technology";
			case 115:	return "Combustion Drive";
			case 117:	return "Impulse Drive";
			case 118:	return "Hyperspace Drive";
			case 106:	return "Espionage Technology";
			case 108:	return "Computer Technology";
			case 124:	return "Astrophysics";
			case 123:	return "Intergalactic Research Network";
			case 199:	return "Graviton Technology";
			case 111:	return "Armour Technology";
			case 109:	return "Weapons Technology";
			case 110:	return "Shielding Technology";
			// ships
			case 204:	return "Light Fighter";
			case 205:	return "Heavy Fighter";
			case 206:	return "Cruiser";
			case 207:	return "Battleship";
			case 215:	return "Battlecruiser";
			case 211:	return "Bomber";
			case 213:	return "Destroyer";
			case 214:	return "Deathstar";
			case 202:	return "Small Cargo";
			case 203:	return "Large Cargo";
			case 208:	return "Colony Ship";
			case 209:	return "Recycler";
			case 210:	return "Espionage Probe";
			case 212:	return "Solar Satellite";
			// defense
			case 401:	return "Rocket Launcher";
			case 402:	return "Light Laser";
			case 403:	return "Heavy Laser";
			case 404:	return "Gauss Cannon";
			case 405:	return "Ion Cannon";
			case 406:	return "Plasma Turret";
			case 407:	return "Small Shield Dome";
			case 408:	return "Large Shield Dome";
			case 502:	return "Anti-Ballistic Missiles";
			case 503:	return "Interplanetary Missiles";
			// moon
			case 41:	return "Lunar Base";
			case 42:	return "Sensor Phalanx";
			case 43:	return "Jump Gate";
			
			default: 
			//alert("Unknown entry "+ id +" found.");
			return false;
		}
	},
	
	getIDForFileName: function(filename) {
		//some filenames, not all
		switch(filename) {
			//Metal Mine
			case "ab350d9a3da1240ebe36c44fe3e26a"	:
			case "696be2632de1977d0bd923e05d37b0"	: 
			case "small_1"							:
			case "tiny_1"							: return 1;
			//Crystal Mine
			case "fc0b3cbabb11e6835d15a251c93dea"	:
			case "6468ceef42917eea7b76f72dd3b70a"	:
			case "small_2"							:
			case "tiny_2"							: return 2;
			//Deuterium Synthesizer
			case "d2c517937cf0726783e1f2f89ce228"	:
			case "f208f485246b04abc54cb9a229fff7"	:
			case "small_3"							:
			case "tiny_3"							: return 3;
			//Solar Plant
			case "c1e3e90c18b1014ea68be04374baad"	:
			case "6ae8432102c9b802ec4eec6917e020"	:
			case "small_4"							:
			case "tiny_4"							: return 4;
			//Fusion Reactor
			case "dce3a2441481ff2a732ec6312da9aa"	:
			case "42f8c414d245b04a0104f411958dde"	:
			case "small_12"							:
			case "tiny_12"							: return 12;
			//Metal Storage
			case "9e07148b94f6da74f9cd8e35f3bc97"	:
			case "472a30155cdad9776b319a6590099c"	:
			case "small_22"							:
			case "tiny_22"							: return 22;
			//Crystal Storage
			case "f9edb3733ab2a770ca687eb3c4c7f6"	:
			case "c95c16f22b5a2c6ced74bcf32f3932"	:
			case "small_23"							:
			case "tiny_23"							: return 23;
			//Deuterium Tank
			case "f8b1990ed6959f925fdf3460e5073a"	:
			case "6fb935649c27645d709977ad47cb98"	:
			case "small_24"							:
			case "tiny_24"							: return 24;
			//Shielded Metal Den
			case "small_25"							:
			case "tiny_25"							: return 25;
			//Underground Crystal Den
			case "small_26"							:
			case "tiny_26"							: return 26;
			//Seabed Deuterium Den
			case "small_27"							:
			case "tiny_27"							: return 27;
			
			// facilities
			//Robotics Factory
			case "55dd3addf66c34f94b23b8de4c44c9"	:
			case "034ea2b2e9d16eb350116cb1391a8f"	:
			case "small_14"							:
			case "tiny_14"							: return 14;
			//Shipyard
			case "4fc6ab35dfc12192c1d2025abebc01"	:
			case "8443bf78a6cbe448f68c791f3532f6"	:
			case "small_21"							:
			case "tiny_21"							: return 21;
			//Research Lab
			case "89ab089f94de954d0cdb4baa50fab9"	:
			case "81c2103d9ae1d22abb23dddd4e45cc"	:
			case "small_31"							:
			case "tiny_31"							: return 31;
			//Alliance Depot
			case "7e137ef37dc97b928304e0b1298fa5"	:
			case "8cdbff7898af1160195944b20feed7"	:
			case "small_34"							:
			case "tiny_34"							: return 34;
			//Missile Silo
			case "d2448ee3aea828761753a8629e81f1"	:
			case "99d1eeb073c2654140cd353677881e"	:
			case "small_44"							:
			case "tiny_44"							: return 44;
			//Nanite Factory
			case "203bf2febc6a24812457f1611621c5"	:
			case "small_15"							:
			case "tiny_15"							: return 15;
			//Terraformer
			case "d3e0cada844ed9331ad9566fb07575"	:
			case "162541a8e2df809b2d8655334157b1"	:
			case "small_33"							:
			case "tiny_33"							: return 33;
			// techs
			//Energy Technology
			case "small_113"						:
			case "tiny_113"							: return 113;
			//Laser Technology
			case "small_120"						:
			case "tiny_120"							: return 120;
			//Ion Technology
			case "small_121"						:
			case "tiny_121"							: return 121;
			//Hyperspace Technology
			case "small_114"						:
			case "tiny_114"							: return 114;
			//Plasma Technology
			case "small_122"						:
			case "tiny_122"							: return 122;
			//Combustion Drive
			case "263772e13ccbd567250f4499348316"	:
			case "small_115"						:
			case "tiny_115"							: return 115;
			//Impulse Drive
			case "a60f53d5ea7d0f2038dae8a5613103"	:
			case "small_117"						:
			case "tiny_117"							: return 117;
			//Hyperspace Drive
			case "small_118"						:
			case "tiny_118"							: return 118;
			//Espionage Technology
			case "small_106"						:
			case "tiny_106"							: return 106;
			//Computer Technology
			case "small_108"						:
			case "tiny_108"							: return 108;
			//Astrophysics
			case "small_124"						:
			case "tiny_124"							: return 124;
			//Intergalactic Research Network
			case "small_123"						:
			case "tiny_123"							: return 123;
			//Graviton Technology
			case "small_199"						:
			case "tiny_199"							: return 199;
			//Armour Technology
			case "small_111"						:
			case "tiny_111"							: return 111;
			//Weapons Technology
			case "small_109"						:
			case "tiny_109"							: return 109;
			//Shielding Technology
			case "990b8dac9ab69451384eacee2509b3"	:
			case "small_110"						:
			case "tiny_110"							: return 110;
			// ships
			//Light Fighter
			case "9ed5c1b6aea28fa51f84cdb8cb1e7e"	:
			case "small_204"						:
			case "tiny_204"							: return 204;
			//Heavy Fighter
			case "8266a2cbae5ad630c5fedbdf270f3e"	:
			case "small_205"						:
			case "tiny_205"							: return 205;
			//Cruiser
			case "b7ee4f9d556a0f39dae8d2133e05b7"	:
			case "small_206"						:
			case "tiny_206"							: return 206;
			//Battleship
			case "3f4a081f4d15662bed33473db53d5b"	:
			case "small_207"						:
			case "tiny_207"							: return 207;
			//Battlecruiser
			case "24f511ec14a71e2d83fd750aa0dee2"	:
			case "small_215"						:
			case "tiny_215"							: return 215;
			//Bomber
			case "4d55a520aed09d0c43e7b962f33e27"	:
			case "small_211"						:
			case "tiny_211"							: return 211;
			//Destroyer
			case "c2b9fedc9c93ef22f2739c49fbac52"	:
			case "small_213"						:
			case "tiny_213"							: return 213;
			//Deathstar
			case "155e9e24fc1d34ed4660de8d428f45"	:
			case "small_214"						:
			case "tiny_214"							: return 214;
			//Small Cargo
			case "60555c3c87b9eb3b5ddf76780b5712"	:
			case "small_202"						:
			case "tiny_202"							: return 202;
			//Large Cargo
			case "fdbcc505474e3e108d10a3ed4a19f4"	:
			case "small_203"						:
			case "tiny_203"							: return 203;
			//Colony Ship
			case "41a21e4253d2231f8937ddef1ba43e"	:
			case "small_208"						:
			case "tiny_208"							: return 208;
			//Recycler
			case "6246eb3d7fa67414f6b818fa79dd9b"	:
			case "small_209"						:
			case "tiny_209"							: return 209;
			//Espionage Probe
			case "347821e80cafc52aec04f27c3a2a4d"	:
			case "small_210"						:
			case "tiny_210"							: return 210;
			//Solar Satellite
			case "665c65072887153d44a6684ec276e9"	:
			case "5f3ca7e91fc0a9b1ee014c3c01ea41"	:
			case "small_212"						:
			case "tiny_212"							: return 212;
			// defense
			//Rocket Launcher
			case "4c4fbd313bc449e16f5212f23d6311"	:
			case "small_401"						:
			case "tiny_401"							: return 401;
			//Light Laser
			case "68e11c389f7f62134def76575b27e5"	:
			case "small_402"						:
			case "tiny_402"							: return 402;
			//Heavy Laser
			case "3adede7d38b3ecfc7457375a4cd2a5"	:
			case "small_403"						:
			case "tiny_403"							: return 403;
			//Gauss Cannon
			case "2e7227f88e3601612093ee2e9101e0"	:
			case "small_404"						:
			case "tiny_404"							: return 404;
			//Ion Cannon
			case "2add2bd4bf0cbcf07f779bf85d43cc"	:
			case "small_405"						:
			case "tiny_405"							: return 405;
			//Plasma Turret
			case "ceed170b2583498228e9ab6b087af1"	:
			case "small_406"						:
			case "tiny_406"							: return 406;
			//Small Shield Dome
			case "58390eb6945e04861c99eb311366cc"	:
			case "small_407"						:
			case "tiny_407"							: return 407;
			//Large Shield Dome
			case "1c77121b235b5a9e9591c7c78883d3"	:
			case "small_408"						:
			case "tiny_408"							: return 408;
			//Anti-Ballistic Missiles
			case "fb4e438cabd12ef1b0500a0f41abc1"	:
			case "small_502"						:
			case "tiny_502"							: return 502;
			//Interplanetary Missiles
			case "36221e9493458b9fcc776bf350983e"	:
			case "small_503"						:
			case "tiny_503"							: return 503;
			// moon
			//Lunar Base
			case "7bb89c3672e57ff2e0cefcaca40d90"	:
			case "94b9b8a961d01b3dff6cc8d1962031"	:
			case "small_41"							:
			case "tiny_41"							: return 41;
			//Sensor Phalanx
			case "69654461f73a5670ab0c4e9099d8de"	:
			case "47840e9f771909ba356a6384799005"	:
			case "small_42"							:
			case "tiny_42"							: return 42;
			//Jump Gate
			case "776a88aef9634ee9a30a50a62417ad"	:
			case "f5b003cb40143133188be46600b0a7"	:
			case "small_43"							:
			case "tiny_43"							: return 43;
		}
		return 0;
	},
	
	translate_techids_to_english: function(tech_id_array) {
		var translation = new Array();
		
		for (var i = 0; i < tech_id_array.length; i++) {
			translation.push(this.getEnglishNameForID(tech_id_array[i]));
		}
		
		return translation;
		
	},
	
	get_resources_names: function(docroot) {
		var translated_names = new Array();
		translated_names.push(docroot.getElementById("metal_box").getAttribute("title").split(":")[0]);
		translated_names.push(docroot.getElementById("crystal_box").getAttribute("title").split(":")[0]);
		translated_names.push(docroot.getElementById("deuterium_box").getAttribute("title").split(":")[0]);
		translated_names.push(docroot.getElementById("energy_box").getAttribute("title").split(":")[0]);
		
		return translated_names;
	},
	
	getData: function(docroot,param_name,num_childn) {
		var i = 0;
		var j = 0;
		var entries;
		var tmp;
		var names = new Array();
		var amount = new Array();
		try {
			for (var l = 0; l < param_name.length; l++) {
				entries = docroot.getElementById(param_name[l]).getElementsByTagName("li");
				for (i = 0; i < entries.length; i++) {
					// the building is currently built one level up
					var num_cn = entries[i].getElementsByClassName("construction").length > 0 ? 0 : num_childn;
					// now we have one entry of the buildings, techs, fleets or defense
					try {
						if (entries[i].getElementsByTagName("input").length > 0) {
							names[j] = this.getEnglishNameForID(parseInt(entries[i].getElementsByTagName("input")[0].getAttribute("id").replace(/\D/g,"")));
						} else {
							names[j] = this.getEnglishNameForID(parseInt(entries[i].getElementsByTagName("div")[0].getAttribute("class").replace(/\D/g,"")));
						}
					} catch (e) {
						names[j] = "";
					}
					
					// initialize value to have no gaps in our arrays
					amount[j] = 0;
					try {
						tmp = entries[i].getElementsByClassName("level")[0];
						// Technocrat = "2 (+2)" at espionage tech
						// innerHTML: <span class="textlabel">Spionagetechnik </span>17<span class="undermark">(+2)</span>
						if (tmp.getElementsByTagName("span").length == 2) {
							if (tmp.getElementsByTagName("span")[1].innerHTML.indexOf("+2") > -1) {
								amount[j] = parseInt(tmp.childNodes[num_cn].nodeValue.replace(/\D/g,""))+2;
							} else {
								amount[j] = parseInt(tmp.childNodes[num_cn].nodeValue.replace(/\D/g,""));
							}
						} else {
							amount[j] = parseInt(tmp.childNodes[num_cn].nodeValue.replace(/\D/g,""));
						}
					} catch(e) {
						// nothing to do
					}
					j++;
				}
			}
			
			var planet_xml = this.get_planetinfo_header(docroot);
			if (planet_xml === false)
				return "";
			
			planet_xml += '\t\t<entry name="Metal" amount="'+this.get_resources(docroot,"resources_metal")+'"/>\n';
			planet_xml += '\t\t<entry name="Crystal" amount="'+this.get_resources(docroot,"resources_crystal")+'"/>\n';
			planet_xml += '\t\t<entry name="Deuterium" amount="'+this.get_resources(docroot,"resources_deuterium")+'"/>\n';
			planet_xml += '\t\t<entry name="Energy" amount="'+this.get_resources(docroot,"resources_energy")+'"/>\n';
			
			for (i = 0; i < names.length; i++) {
				if (!isNaN(amount[i]) && ((names[i] != "" && amount[i] > 0) || names[i] == "Solar Satellite")) {
					planet_xml += '\t\t<entry name="'+names[i]+'" amount="'+amount[i]+'"/>\n';
				}
			}
			
			planet_xml += '\t</planetinfo>\n';
			
			return planet_xml;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Error in getData: "+e,"All Galaxytools");
			return "";
		}
	},
	
	get_overview_data: function(doc) {
		try {
			galaxytoolbar.GTPlugin_general.set_status(doc,"galaxyplugin"+1,0,"Overview found","All tools");
			var ogame_servertime = galaxytoolbar.GTPlugin_general.get_ogame_time(doc);
			var numchecks = 0;
			// it should be more efficient to poll the dom node every 200ms than listening to DOMNOdeInserted
			// which would trigger a check each time one letter is inserted
			
			var checks = setInterval(function waitForScf() {
				if (numchecks>50) { clearInterval(checks); return; }
				var text = doc.getElementById("scoreContentField").innerHTML;
				if (text.indexOf('</a>') > -1 && text.indexOf("(") > -1 && text.indexOf(")") > -1) {
					clearInterval(checks);
					galaxytoolbar.GTPlugin_planet_data.process_overview_data(doc,ogame_servertime);
				}
				numchecks++;
			},200);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console(e);
		}
	},
	
	process_overview_data: function(doc,server_time) {
		try {
			var dcf = doc.getElementById("diameterContentField");
			
			var used_fields = dcf.getElementsByTagName("span")[0].innerHTML.replace(/\D/g,"");
			var all_fields = dcf.getElementsByTagName("span")[1].innerHTML.replace(/\D/g,"");
			//var size = dcf.innerHTML.replace(/[.,]/g,"").match(/(\d+)/)[1];
			
			var tcf = doc.getElementById("temperatureContentField").innerHTML;
			var num_of_minus = tcf.split("-").length-1;
			var max_temp = 0;
			if (num_of_minus > 1) {
				max_temp = parseInt(tcf.match(/\d+/g)[1]) * -1;
			}  else {
				max_temp = parseInt(tcf.match(/\d+/g)[1]);
			}
			
			var scf = doc.getElementById("scoreContentField").getElementsByTagName("a")[0].innerHTML;
			scf = scf.replace(/[.,]/g,"");
			var scores = scf.match(/\d+/g);
			var points = parseInt(scores[0]);
			
			var ownrank = parseInt(scores[1]) <= parseInt(scores[2]) ? parseInt(scores[1]) : parseInt(scores[2]);
			var num_of_players = parseInt(scores[1]) <= parseInt(scores[2]) ? parseInt(scores[2]) : parseInt(scores[1]);
			
			var officers = doc.getElementById("officers").getElementsByTagName("a");
			// commander, admiral, engineer, geologist, technocrat
			var officers_enabled = new Array(false,false,false,false,false);
			for (var i = 0; i < officers.length; i++) {
				var cl = officers[i].getAttribute("class");
				officers_enabled[i] = cl == "on" || cl.indexOf(" on ") > -1;
			}
			
			var script =galaxytoolbar.GTPlugin_general.get_script_of_page(doc);
			var bq = this.get_building_queue_only(doc,server_time,script);
			
			var names, levels;
			var tmp;
			var content_box_s = doc.getElementById("inhalt").getElementsByClassName("content-box-s");
			// there is no real queue for researches
			var research_queue = new Array();
			if (content_box_s[1].getElementsByClassName("idle").length == 0) {
				tmp = content_box_s[1].getElementsByClassName("data")[0].getElementsByTagName("td");
				names = this.getEnglishNameForID(parseInt(tmp[0].getElementsByTagName("a")[0].getAttribute("onclick").match(/(\d+)/)[1]));
				levels = parseInt(tmp[1].getElementsByTagName("span")[0].innerHTML.replace(/\D/g,""));
				research_queue.push([names,levels]);
				
				var research_finish_t = this.get_finish_time(server_time,parseInt(script.match(/new\s*baulisteCountdown\(getElementByIdWithCache\(["']researchCountdown["']\),\s*(\d+)/i)[1]));
			}
			
			var fq = this.get_fleet_queue_from_building_pages(doc,2,server_time,script);
			
			tmp = this.getPlanetname(doc);
			var tmp2 = galaxytoolbar.GTPlugin_general.get_coords(tmp[1]);
			var playername = galaxytoolbar.GTPlugin_general.get_playername(doc);
			var playerid = galaxytoolbar.GTPlugin_general.get_player_id(doc);
			var planet_xml = '\t<planetinfo playername="'+playername+'" rank="'+ownrank+'" points="'+points+'" num_players="'+num_of_players;
			
			if (playerid > 0) {
				planet_xml += '" playerid="'+playerid;
			}
	
			planet_xml += '" planetname="'+tmp[0]+'" moon="'+(tmp[2]=="moon")+
							 '" galaxy="'+tmp2[0]+'" system="'+tmp2[1]+'" planet="'+tmp2[2]+'" used_fields="'+used_fields+
							 '" fields="'+all_fields+'" max_temp="'+max_temp+'">\n';
			
			planet_xml += '\t\t<officers>\n'; 
			
			for (var i = 0; i < officers_enabled.length; i++) {
				planet_xml += '\t\t\t<officer name="';
				switch(i) {
					case 0: planet_xml += 'commander" enabled="'+officers_enabled[0]+'"/>\n'; break;
					case 1: planet_xml += 'admiral" enabled="'+officers_enabled[1]+'"/>\n'; break;
					case 2: planet_xml += 'engineer" enabled="'+officers_enabled[2]+'"/>\n'; break;
					case 3: planet_xml += 'geologist" enabled="'+officers_enabled[3]+'"/>\n'; break;
					case 4: planet_xml += 'technocrat" enabled="'+officers_enabled[4]+'"/>\n'; break;
					default: return; //unknown officer found
				}
			}
			
			planet_xml += '\t\t</officers>\n';
			
			// add building_queue
			planet_xml += bq;
			
			if (research_queue.length > 0) {
				planet_xml += '\t\t<queue type="research" year="'+research_finish_t[0]+'" month="'+research_finish_t[1]+
								'" day="'+research_finish_t[2]+'" hour="'+research_finish_t[3]+'" minute="'+research_finish_t[4]+'" second="'+research_finish_t[5]+'">\n';
				for (var i = 0; i < research_queue.length; i++) {
					planet_xml += '\t\t\t<entry name="'+research_queue[i][0]+'" level="'+research_queue[i][1]+'"/>\n';
				}
				planet_xml += '\t\t</queue>\n';
			} else {
				planet_xml += '\t\t<queue type="research"/>\n';
			}
			
			//add fleet queue
			planet_xml += fq;
			
			planet_xml += '\t</planetinfo>\n'; 
			galaxytoolbar.GTPlugin_general.send(doc,"overview",planet_xml,doc.URL);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in process_overview_data: "+e);
		} 
	},
	
	get_building_queue_only: function(doc,server_time,script) {
		try {
			if (server_time == undefined) var server_time = galaxytoolbar.GTPlugin_general.get_ogame_time(doc);
			if (script == undefined) var script = galaxytoolbar.GTPlugin_general.get_script_of_page(doc);
			var content_box_s = doc.getElementById("inhalt").getElementsByClassName("content-box-s");
			var planet_xml = "";
			var names = "";
			var levels = 0;
			var building_queue = new Array();
			if (content_box_s[0].getElementsByClassName("idle").length == 0) {
				// first building in the queue is special
				var tmp = content_box_s[0].getElementsByClassName("data")[0].getElementsByTagName("td");
				names = this.getEnglishNameForID(parseInt(tmp[0].getElementsByTagName("a")[0].getAttribute("onclick").match(/(\d+)/)[1]));
				levels = parseInt(tmp[1].getElementsByTagName("span")[0].innerHTML.replace(/\D/g,""));
				building_queue.push([names,levels]);
				var building_endtime = this.get_finish_time(server_time,parseInt(script.match(/new\s*baulisteCountdown\(getElementByIdWithCache\(["']Countdown["']\),\s*(\d+)/i)[1]));
				tmp = content_box_s[0].getElementsByClassName("queue");
				if (tmp.length > 0) {
					tmp = tmp[0].getElementsByTagName("tbody")[0].getElementsByTagName("td");
					for (var i = 0; i < tmp.length; i++) {
						
						names = this.getEnglishNameForID(parseInt(tmp[i].getElementsByTagName("a")[0].getAttribute("onclick").match(/(\d+)/)[1]));
						levels = parseInt(tmp[i].getElementsByTagName("span")[0].innerHTML.replace(/\D/g,""));
						building_queue.push([names,levels]);
					}
				}
			}
			
			if (building_queue.length > 0) {
				planet_xml += '\t\t<queue type="building">\n';
				for (var i = 0; i < building_queue.length; i++) {
					switch(i) {
						case 0: planet_xml += '\t\t\t<entry name="'+building_queue[i][0]+'" level="'+building_queue[i][1]+
												'" year="'+building_endtime[0]+'" month="'+building_endtime[1]+
												'" day="'+building_endtime[2]+'" hour="'+building_endtime[3]+
												'" minute="'+building_endtime[4]+'" second="'+building_endtime[5]+'"/>\n'; break;
						default: planet_xml += '\t\t\t<entry name="'+building_queue[i][0]+'" level="'+building_queue[i][1]+'"/>\n';
					}
					
				}
				planet_xml += '\t\t</queue>\n';
			} else {
				planet_xml += '\t\t<queue type="building"/>\n';
			}
			
			return planet_xml;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in get_building_queue_only: "+e);
			return "";
		}
	},
	
	get_fleet_queue_only: function(doc) {
		try {
			var planet_xml = "";
			
			planet_xml += this.get_planetinfo_header(doc);
			var names, levels;
			if (doc.getElementById("line") != null) {
				var content_box_s = doc.getElementById("line").getElementsByClassName("content-box-s");
				if (content_box_s.length == 0) return false;
				
				var ogame_servertime = galaxytoolbar.GTPlugin_general.get_ogame_time(doc);
				if (ogame_servertime == false) return false;
				
				var script = galaxytoolbar.GTPlugin_general.get_script_of_page(doc);
				var shipcountdown = script.substring(script.indexOf("getElementByIdWithCache('shipSumCount'),"),script.length);
				var seconds_to_build = parseInt(shipcountdown.substring(0,shipcountdown.indexOf(";")).match(/(\d+)/g)[2]);
				
				var finish_time = this.get_finish_time(ogame_servertime,seconds_to_build);
				var fleet_queue = new Array();
				
				var tmp = content_box_s[0].getElementsByClassName("data")[1].getElementsByTagName("td");
				
				if (tmp[0].getElementsByTagName("a")[0].getAttribute("onclick").trim() != "") {
					names = this.getEnglishNameForID(parseInt(tmp[0].getElementsByTagName("a")[0].getAttribute("onclick").match(/(\d+)/)[1]));
				} else if (tmp[0].getElementsByTagName("a")[0].getAttribute("href").trim().substring(0,1) != "#") {
					names = this.getEnglishNameForID(this.getIDForFileName(parseInt(tmp[0].getElementsByTagName("a")[0].getAttribute("href").match(/openTech=(\d+)/)[1])));
				} else {
					//hopefully, we can soon remove this, since it is a OGame Bug
					names = this.getEnglishNameForID(this.getIDForFileName(galaxytoolbar.GTPlugin_general.get_filename(tmp[0].getElementsByTagName("img")[0].getAttribute("src"))));
				}
				
				levels = parseInt(doc.getElementById("shipSumCount").innerHTML.replace(/\D/g,""));
				fleet_queue.push([names,levels]);
				
				var queue = doc.getElementById("pqueue");
				if (queue != null) {
					var li = queue.getElementsByTagName("li");
					for (var i = 0; i < li.length; i++) {
						if (li[i].getElementsByTagName("a")[0].getAttribute("href").trim().substring(0,1) != "#" && li[i].getElementsByTagName("a")[0].getAttribute("href").substring(0,11) != "javascript:") {
							names = this.getEnglishNameForID(parseInt(li[i].getElementsByTagName("a")[0].getAttribute("href").match(/openTech=(\d+)/)[1]));
						} else {
							names = this.getEnglishNameForID(parseInt(li[i].getElementsByTagName("a")[0].getAttribute("ref")));
						}
						
						levels = parseInt(li[i].getElementsByTagName("span")[0].innerHTML.replace(/\D/g,""));
						fleet_queue.push([names,levels]);
					}
				}
				
				
				planet_xml += '\t\t<queue type="fleet_def" year="'+finish_time[0]+'" month="'+finish_time[1]+
								'" day="'+finish_time[2]+'" hour="'+finish_time[3]+'" minute="'+finish_time[4]+'" second="'+finish_time[5]+'">\n';
				for (var i = 0; i < fleet_queue.length; i++) {
					planet_xml += '\t\t\t<entry name="'+fleet_queue[i][0]+'" level="'+fleet_queue[i][1]+'"/>\n';
				}
				planet_xml += '\t\t</queue>\n';
			} else {
				planet_xml += '\t\t<queue type="fleet_def"/>\n';
			}
			
			planet_xml += '\t</planetinfo>\n';
			
			galaxytoolbar.GTPlugin_general.send(doc,"queue",planet_xml,doc.URL);
			
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in get_fleet_queue_only: "+e);
		}
	},
	
	get_fleet_queue_from_building_pages: function(doc,cbno,server_time,script) {
		try {
			var tmp, names, levels;
			if (server_time == undefined) 
				server_time = galaxytoolbar.GTPlugin_general.get_ogame_time(doc);
				
			if (script == undefined)
				script = galaxytoolbar.GTPlugin_general.get_script_of_page(doc);
				
			var content_box_s = doc.getElementById("inhalt").getElementsByClassName("content-box-s");
			var fleet_queue = new Array();
			if (content_box_s[cbno].getElementsByClassName("idle").length == 0) {
				var shipcountdown = script.substring(script.indexOf("getElementByIdWithCache('shipSumCount'),"),script.length);
				var seconds_to_build = parseInt(shipcountdown.substring(0,shipcountdown.indexOf(";")).match(/(\d+)/g)[2]);
				
				var finish_time = this.get_finish_time(server_time,seconds_to_build);
				tmp = content_box_s[cbno].getElementsByClassName("data")[1].getElementsByTagName("td");
				names = this.getEnglishNameForID(parseInt(tmp[0].getElementsByTagName("a")[0].getAttribute("href").match(/openTech=(\d+)/)[1]));
				levels = parseInt(tmp[0].getElementsByTagName("div")[0].innerHTML.replace(/\D/g,""));
				fleet_queue.push([names,levels]);
				
				if (content_box_s[cbno].getElementsByClassName("queue").length > 0) {
					tmp = content_box_s[cbno].getElementsByClassName("queue")[0].getElementsByTagName("tbody")[0].getElementsByTagName("td");
					if (tmp.length < 4) {
						for (var i = 0; i < tmp.length; i++) {
							names = this.getEnglishNameForID(parseInt(tmp[i].getElementsByTagName("a")[0].getAttribute("href").match(/openTech=(\d+)/)[1]));
							levels = parseInt(tmp[i].innerHTML.split("<br>")[1].trim());
							fleet_queue.push([names,levels]);
						}
					} else {
						//submit only in case we have less than 5 entries in the queue, otherwise we can't know, if there is something missing
						return "";
					}
				}
			}
			
			var planet_xml = "";
			if (fleet_queue.length > 0) {
				planet_xml += '\t\t<queue type="fleet_def" year="'+finish_time[0]+'" month="'+finish_time[1]+
								'" day="'+finish_time[2]+'" hour="'+finish_time[3]+'" minute="'+finish_time[4]+'" second="'+finish_time[5]+'">\n';
				for (var i = 0; i < fleet_queue.length; i++) {
					planet_xml += '\t\t\t<entry name="'+fleet_queue[i][0]+'" level="'+fleet_queue[i][1]+'"/>\n';
				}
				planet_xml += '\t\t</queue>\n';
			} else {
				planet_xml += '\t\t<queue type="fleet_def"/>\n';
			}
			
			return planet_xml;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in get_fleet_queue_from_building_pages: "+e);
			return "";
		}
	},
	
	get_active_research: function(doc) {
		try {
			var planet_xml = "";
			var tl = doc.getElementById("timeLink");
			if (tl != null) {
				
				var script = galaxytoolbar.GTPlugin_general.get_script_of_page(doc);
				var shipcountdown = script.substring(script.indexOf("getElementByIdWithCache('b_research"),script.length);
				var seconds_to_build = parseInt(shipcountdown.substring(0,shipcountdown.indexOf(";")).match(/(\d+)/g)[2]);
				var finish_time = this.get_finish_time(galaxytoolbar.GTPlugin_general.get_ogame_time(doc),seconds_to_build);
				var level = parseInt(tl.parentNode.nextElementSibling.getElementsByClassName("eckeoben")[0].getElementsByTagName("span")[0].innerHTML.trim());
				
				planet_xml += '\t\t<queue type="research" year="'+finish_time[0]+'" month="'+finish_time[1]+
								'" day="'+finish_time[2]+'" hour="'+finish_time[3]+'" minute="'+finish_time[4]+'" second="'+finish_time[5]+'">\n';
				planet_xml += '\t\t\t<entry name="'+this.getEnglishNameForID(parseInt(tl.getAttribute("ref").trim()))+'" level="'+level+'"/>\n';
				planet_xml += '\t\t</queue>\n';
			} else {
				planet_xml += '\t\t<queue type="research"/>\n';
			}
			
			return planet_xml;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in get_active_research: "+e);
			return "";
		}
	},
	
	get_resourceSettings: function(doc) {
		try {
			var main = doc.getElementById("inhalt").getElementsByClassName("mainRS")[0];
			var form_selects = main.getElementsByTagName("form")[0].getElementsByTagName("select");
			
			var planet_xml = '';
			planet_xml += '\t\t<production type="Metal Mine" level="'+form_selects[0].value.replace(/\D/g,"")+'"/>\n';
			planet_xml += '\t\t<production type="Crystal Mine" level="'+form_selects[1].value.replace(/\D/g,"")+'"/>\n';
			planet_xml += '\t\t<production type="Deuterium Synthesizer" level="'+form_selects[2].value.replace(/\D/g,"")+'"/>\n';
			planet_xml += '\t\t<production type="Solar plant" level="'+form_selects[3].value.replace(/\D/g,"")+'"/>\n';
			planet_xml += '\t\t<production type="Fusion Reactor" level="'+form_selects[4].value.replace(/\D/g,"")+'"/>\n';
			planet_xml += '\t\t<production type="Solar Satellite" level="'+form_selects[5].value.replace(/\D/g,"")+'"/>\n';
			
			
			var boster_cells = main.getElementsByTagName("tr")[9].cells;
			planet_xml += '\t\t<booster type="Metal" amount="'+parseInt(boster_cells[2].innerHTML.replace(/\D/g,""))+'"/>\n';
			planet_xml += '\t\t<booster type="Crystal" amount="'+parseInt(boster_cells[3].innerHTML.replace(/\D/g,""))+'"/>\n';
			planet_xml += '\t\t<booster type="Deuterium" amount="'+parseInt(boster_cells[4].innerHTML.replace(/\D/g,""))+'"/>\n';
			
			return planet_xml;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.log_to_console("Error in get_resourceSettings: "+e);
			return "";
		}
	},
	
	get_finish_time: function(current_time,offset) {
		var finished = new Date(current_time.getTime() + offset*1000);
		var year   = finished.getFullYear();
		var month  = finished.getMonth()+1; // 0 = January
		var day    = finished.getDate();
		var hour   = finished.getHours();
		var minute = finished.getMinutes();
		var second = finished.getSeconds();
		
		return [year,month,day,hour,minute,second];
	},
	
	get_planetinfo_header: function(doc) {
		var tmp = this.getPlanetname(doc);
		
		var tmp2 = galaxytoolbar.GTPlugin_general.get_coords(tmp[1]);
		var playername = galaxytoolbar.GTPlugin_general.get_playername(doc);
		var playerid = galaxytoolbar.GTPlugin_general.get_player_id(doc);
		var planet_xml = '\t<planetinfo playername="'+playername;
		
		if (playerid > 0) {
			planet_xml += '" playerid="'+playerid;
		} else {
			return false;
		}
		
		planet_xml += '" planetname="'+tmp[0]+'" moon="'+(tmp[2]=="moon")+
						 '" galaxy="'+tmp2[0]+'" system="'+tmp2[1]+'" planet="'+tmp2[2]+'">\n';
						 
		return planet_xml;
	}
};