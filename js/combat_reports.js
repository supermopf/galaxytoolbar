"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_combat_reports) galaxytoolbar.GTPlugin_combat_reports={};

galaxytoolbar.GTPlugin_combat_reports={
	
	translation: null,
	noticed: false,
	
	submit_complete_cr: function(doc) {
		try {
			var general = galaxytoolbar.GTPlugin_general;
			
			if (this.translation == null) this.init_translation();
			var lang = galaxytoolbar.GTPlugin_general.get_tld(doc.URL);
			
			var combat = doc.getElementById("master");
			
			var combat_rounds = combat.getElementsByClassName("combat_round");
			var combat_date = combat_rounds[0].getElementsByTagName("p")[0].innerHTML.match(/\((\d+.\d+.\d+\s\d+:\d+:\d+)\)/)[1];
			var msg_id = parseInt(doc.URL.match(/nID\=(\d+)/)[1]);
			
			var tmp;
			var techs;
			var attackers;
			var defenders;
			var dam_att;
			var dam_def;
			var attackers_info = new Array();
			var defenders_info = new Array();
			var rounds_info_att = new Array();
			var rounds_info_def = new Array();
			var rounds_dam = new Array();
			
			general.set_status(doc, "galaxyplugin"+1 , 0, "Full CR found","All Galaxytools");
			for (var i = 0; i < combat_rounds.length; i++) {
				attackers = combat_rounds[i].getElementsByTagName("table")[0].getElementsByTagName("table")[0].getElementsByClassName("newBack");
				defenders = combat_rounds[i].getElementsByTagName("table")[0].nextElementSibling.getElementsByClassName("newBack");
				
				rounds_info_att[i] = new Array();
				for (var j = 0; j < attackers.length; j++) {
					if (i == 0) {
						//get techs and coordinates for each attacker
						tmp = general.get_coords(attackers[j].getElementsByTagName("a")[0].innerHTML);
						attackers_info[j] = new Array(2);
						attackers_info[j][0] = new Array(3);
						attackers_info[j][0][0] = parseInt(tmp[0]);
						attackers_info[j][0][1] = parseInt(tmp[1]);
						attackers_info[j][0][2] = parseInt(tmp[2]);
						
						techs = attackers[j].getElementsByTagName("span")[1].innerHTML.match(/\d+/g);
						attackers_info[j][1] = new Array(3);
						attackers_info[j][1][0] = parseInt(techs[0]);
						attackers_info[j][1][1] = parseInt(techs[1]);
						attackers_info[j][1][2] = parseInt(techs[2]);
					}
					
					var ship_info = attackers[j].getElementsByTagName("table");
					
					rounds_info_att[i][j] = new Array();
					rounds_info_att[i][j][0] = false;
					if (ship_info.length == 0) {
						rounds_info_att[i][j][0] = true;
						continue;
					}
					
					var ship_names = ship_info[0].getElementsByTagName("tr")[0].getElementsByTagName("th");
					var ship_amounts = ship_info[0].getElementsByTagName("tr")[1].getElementsByTagName("td");
					
					//get the current content of each fleet of the attackers
					for (var k = 1; k < ship_names.length; k++) {
						rounds_info_att[i][j][k-1] = new Array(2);
						rounds_info_att[i][j][k-1][0] = this.translate(lang,ship_names[k].innerHTML.trim());
						if (this.noticed) { this.noticed = false; return; }
						rounds_info_att[i][j][k-1][1] = parseInt(ship_amounts[k].innerHTML.replace(/\D/g,""));
					}
				}
				
				rounds_info_def[i] = new Array();
				for (var j = 0; j < defenders.length; j++) {
					if (i == 0) {
						//get techs and coordinates for each defender
						if (defenders[j].getElementsByTagName("a").length == 0) {
							tmp = general.get_coords(doc.URL.match(/&def_coords=(\[\d+\:\d+:\d+\])/)[1]);
							techs[0] = doc.URL.match(/&def_weapon=(\d+)/) != null ? parseInt(doc.URL.match(/&def_weapon=(\d+)/)[1]) : -1;
							techs[1] = doc.URL.match(/&def_shield=(\d+)/) != null ? parseInt(doc.URL.match(/&def_shield=(\d+)/)[1]) : -1;
							techs[2] = doc.URL.match(/&def_armour=(\d+)/) != null ? parseInt(doc.URL.match(/&def_armour=(\d+)/)[1]) : -1;
						} else {
							tmp = general.get_coords(defenders[j].getElementsByTagName("a")[0].innerHTML);
							techs = defenders[j].getElementsByTagName("span")[1].innerHTML.match(/\d+/g);
						}
						
						defenders_info[j] = new Array(2);
						defenders_info[j][0] = new Array(3);
						defenders_info[j][0][0] = tmp[0];
						defenders_info[j][0][1] = tmp[1];
						defenders_info[j][0][2] = tmp[2];
						
						
						defenders_info[j][1] = new Array(3);
						defenders_info[j][1][0] = techs[0];
						defenders_info[j][1][1] = techs[1];
						defenders_info[j][1][2] = techs[2];
					}
					
					var ship_info = defenders[j].getElementsByTagName("table");
					
					rounds_info_def[i][j] = new Array();
					rounds_info_def[i][j][0] = false;
					if (ship_info.length == 0) {
						rounds_info_def[i][j][0] = true;
						continue;
					}
					
					var ship_names = ship_info[0].getElementsByTagName("tr")[0].getElementsByTagName("th");
					var ship_amounts = ship_info[0].getElementsByTagName("tr")[1].getElementsByTagName("td");
					
					//get the current content of each fleet/defense of the defenders
					for (var k = 1; k < ship_names.length; k++) {
						rounds_info_def[i][j][k-1] = new Array(2);
						rounds_info_def[i][j][k-1][0] = this.translate(doc,lang,ship_names[k].innerHTML.trim());
						if (this.noticed) { this.noticed = false; return; }
						rounds_info_def[i][j][k-1][1] = parseInt(ship_amounts[k].innerHTML.replace(/\D/g,""));
					}
				}
				
				//get damages in the rounds
				if (i > 0) {
					rounds_dam[i] = new Array(2);
					rounds_dam[i][0] = new Array(3);
					rounds_dam[i][1] = new Array(3);
					
					dam_att = combat_rounds[i].getElementsByTagName("p")[0].innerHTML.replace(/[,.]/g,'').match(/(\d+)/g);
					rounds_dam[i][0][0] = parseInt(dam_att[0]);
					rounds_dam[i][0][1] = parseInt(dam_att[1]);
					rounds_dam[i][0][2] = parseInt(dam_att[2]);
					
					dam_def = combat_rounds[i].getElementsByTagName("p")[1].innerHTML.replace(/[,.]/g,'').match(/(\d+)/g);
					rounds_dam[i][1][0] = parseInt(dam_def[0]);
					rounds_dam[i][1][1] = parseInt(dam_def[1]);
					rounds_dam[i][1][2] = parseInt(dam_def[2]);
				}
			}
			
			var attacker_won = false;
			for (var j = 0; j < rounds_info_att[combat_rounds.length-1].length; j++) {
				if (rounds_info_att[combat_rounds.length-1][j][0] != true) {
					attacker_won = true;
					break;
				}
			}
			
			var defender_won = false;
			for (var j = 0; j < rounds_info_def[combat_rounds.length-1].length; j++) {
				if (rounds_info_def[combat_rounds.length-1][j][0] != true) {
					defender_won = true;
					break;
				}
			}
			var winner = "nobody";
			if (attacker_won && !defender_won) {
				winner = "attacker";
			} else if (!attacker_won && defender_won) {
				winner = "defender";
			}
			
			var combat_result = doc.getElementById("combat_result");
			
			if (winner == "attacker") {
				var loot = combat_result.getElementsByTagName("p")[0].innerHTML.replace(/[,.]/g,'').match(/(\d+)/g);
				var loot_metal = parseInt(loot[0]);
				var loot_crystal = parseInt(loot[1]);
				var loot_deut = parseInt(loot[2]);
			}
			
			var misc = combat_result.getElementsByTagName("p")[1].innerHTML.split("<br>");
			var lost_units_att = misc[0].replace(/\D/g,"").trim();
			var lost_units_def = misc[1].replace(/\D/g,"").trim();
			var debris = misc[2].replace(/[,.]/g,'').match(/(\d+)/g);
			var debris_metal = debris[0];
			var debris_crystal = debris[1];
			
			// TODO: improve this
			var moon_chance = 0;
			var moon_created = false;
			if (misc.length > 4) {
				if (misc[3].indexOf("%") > -1) {
					moon_chance = misc[3].replace(/\D/g,"").trim();
				}
			}
			if (moon_chance > 0) {
				if (misc.length > 5) {
					if (misc.length > 6) {
						moon_created = true;
					} else if (misc[4].match(/\d+/) != null) {
						//repaired defense
						moon_created = false;
					}
				}
			}
			
			//&gtool_ships_defenses&Rocket%20Launcher=2520&Light%20Laser=1170&Heavy%20Laser=125&Gauss%20Cannon=210&Ion%20Cannon=9&Plasma%20Turret=10
			var repaired;
			if (doc.URL.indexOf("&gtool_ships_defenses=unknown") > -1) {
				repaired = "unknown";
			} else if (doc.URL.indexOf("&gtool_ships_defenses=false") > -1) {
				repaired = "false";
			} else {
				repaired = "true";
				var pos = doc.URL.indexOf("&gtool_ships_defenses");
				var array = new Array();
				if (pos > -1) {
					var url = doc.URL;
					url = url.substr(pos+22).replace(/%20/g," ");
					url = url.split("&");
					for (var i = 0; i < url.length; i++) {
						array[i] = url[i].split("=");
					}
				}
			}
			// parsing done - now create the xml
			var xml = '\t<combat date="'+combat_date+'" msg_id="'+msg_id+'">\n';
			for (var i = 0; i < combat_rounds.length; i++) {
				xml += '\t\t<round number="'+i+'">\n';
				if (i > 0) {
					xml += '\t\t\t<combat_damage by="attacker" number_of_shots="'+rounds_dam[i][0][0]+
							'" firepower="'+rounds_dam[i][0][1]+'" absorbed="'+rounds_dam[i][0][2]+'"/>\n';
					xml += '\t\t\t<combat_damage by="defender" number_of_shots="'+rounds_dam[i][1][0]+
							'" firepower="'+rounds_dam[i][1][1]+'" absorbed="'+rounds_dam[i][1][2]+'"/>\n';
				}
				for (var j = 0; j < rounds_info_att[i].length; j++) {
					xml += '\t\t\t<combat_party type="attacker" galaxy="'+attackers_info[j][0][0]+
							'" system="'+attackers_info[j][0][1]+'" planet="'+attackers_info[j][0][2]+
							'" weapon="'+attackers_info[j][1][0]+'" shield="'+attackers_info[j][1][1]+
							'" armor="'+attackers_info[j][1][2];
					if (rounds_info_att[i][j][0] != true) {
						xml += '">\n';
						for (var k = 0; k < rounds_info_att[i][j].length; k++) {
							xml += '\t\t\t\t<entry name="'+rounds_info_att[i][j][k][0]+'" amount="'+rounds_info_att[i][j][k][1]+'"/>\n';
						}
						xml += '\t\t\t</combat_party>\n';
					} else {
						xml += '"/>\n';
					}
				}
				
				for (var j = 0; j < rounds_info_def[i].length; j++) {
					xml += '\t\t\t<combat_party type="defender" galaxy="'+defenders_info[j][0][0]+
							'" system="'+defenders_info[j][0][1]+'" planet="'+defenders_info[j][0][2];
					if (defenders_info[j][1][0] > -1) {
						xml += '" weapon="'+defenders_info[j][1][0]+'" shield="'+defenders_info[j][1][1]+
								'" armor="'+defenders_info[j][1][2];
					}
					if (rounds_info_def[i][j][0] != true) {
						xml += '">\n';
						for (var k = 0; k < rounds_info_def[i][j].length; k++) {
							xml += '\t\t\t\t<entry name="'+rounds_info_def[i][j][k][0]+'" amount="'+rounds_info_def[i][j][k][1]+'"/>\n';
						}
						xml += '\t\t\t</combat_party>\n';
					} else {
						xml += '"/>\n';
					}
				}
				xml += '\t\t</round>\n';
			}
			xml += '\t\t<combat_result winner="'+winner+'">\n';
			
			if	(winner == "attacker") {
				xml += '\t\t\t<loot metal="'+loot_metal+'" crystal="'+loot_crystal+'" deuterium="'+loot_deut+'"/>\n';
			}
			
			xml += '\t\t\t<debris metal="'+debris_metal+'" crystal="'+debris_crystal+'"/>\n'+
					'\t\t\t<lost_units attacker="'+lost_units_att+'" defender="'+lost_units_def+'"/>\n';
					
			if (moon_chance > 0) {
				xml += '\t\t\t<moon chance="'+moon_chance+'" created="'+moon_created+'"/>\n';
			}
			
			if (repaired != "true") {
				xml += '\t\t\t<repaired_defense repaired="'+repaired+'"/>\n';
			} else {
				xml += '\t\t\t<repaired_defense repaired="true">\n';
					
					for (var j = 0; j < array.length; j++) {
						xml += '\t\t\t\t<entry name="'+array[j][0]+'" amount="'+array[j][1]+'"/>\n';
					}
					
				xml += '\t\t\t</repaired_defense>\n';
			}
					
			xml += '\t\t</combat_result>\n';
			xml += '\t</combat>\n';
			galaxytoolbar.GTPlugin_general.send(doc,"full_cr",xml,doc.URL);
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 3, "Error in submit_complete_cr: "+e,"All Galaxytools");
		}
	}, 
	
	translate: function(doc,lang,key) {
		try {
			if (this.translation[lang] == undefined) {
				galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 2, 
					"We currently do not support this language.\n" +
					"If you want to use this feature in your OGame language then provide " +
					"a translation of all abbreviated ship and defense names " +
					"in our <a href='http://board.galaxytool.eu/'>board</a> or " +
					"ask for complete ship names in combat reports in your local OGame board. \n" +
					"If the ship names were complete, we could " +
					"make this feature language independent."
					,"All Galaxytools");
					
					this.noticed = true;
					return false;
			}
			
			var translation = this.translation[lang][key];
			
			if (translation == undefined) {
				galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 2, 
					"The language information for your OGame language are outdated. At least, we did not find the following ship/defense: \""+key+"\". \n" +
					"If you want to use this feature in your OGame language then provide " +
					"an updated translation of all abbreviated ship and defense names " +
					"in our <a href='http://board.galaxytool.eu/'>board</a> or " +
					"ask for complete ship names in combat reports in your local OGame board. If the ship names were complete, we could " +
					"make this feature language independent."
					,"All Galaxytools");
					
					this.noticed = true;
					return false;
			}
			
			return translation;
		} catch(e) {
			//alert(e);
		}
	},
	
		
	parse_repaired: function(doc,line) {
		try {
			if (line.indexOf("?") > -1) return "&gtool_ships_defenses=unknown";
			if (line.match(/(\d)/) == null) return "&gtool_ships_defenses=false";
			
			// remove thousands separator, but not the comma that separates the entries
			var array = line.replace(/(\d)[,.](\d)/g,"$1$2").trim().split(",");
			var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(doc.URL);
			if (tool_ids.length == 0) return "&gtool_ships_defenses=unknown";
			var result1;
			var result2;
			var string = "";
			for (var i = 0; i < array.length; i++) {
				result1 = parseInt(array[i].match(/(\d+)/)[1]);
				array[i] = galaxytoolbar.GTPlugin_general.trimString(array[i].replace(/\d/g,''));
				result2 = galaxytoolbar.GTPlugin_storage.get_translation(tool_ids[0],array[i],false,doc.URL);
				
				if (result2 == "Unknown entry") return "&gtool_ships_defenses=unknown";
				
				string += "&"+result2+"="+result1;
	 		}
			
			if (string.length > 0) {
				return "&gtool_ships_defenses"+string;
			}
		
		} catch(e) {
			return "";
		}
	},
	
	init_translation: function() {
		this.translation = {
			"de" : {
				// ships
				"L.Jäger"		: "Light Fighter",
				"S.Jäger"		: "Heavy Fighter",
				"Kreuzer"		: "Cruiser",
				"Schlachts."	: "Battleship",
				"Schlachtkr."	: "Battlercruiser",
				"Bomber"		: "Bomber",
				"Zerst."		: "Destroyer",
				"Rip"			: "Deathstar",
				
				"Kl.Trans"		: "Small Cargo",
				"Gr.Trans"		: "Large Cargo",
				"Kol.Schiff"	: "Colony Ship",
				"Recy."			: "Recycler",
				"Spio.Sonde"	: "Espionage Probe",
				"Sol.Sat"		: "Solar Satellite",
				
				// defense
				"Rak."			: "Rocket Launcher",
				"L.Laser"		: "Light Laser",
				"S.Laser"		: "Heavy Laser",
				"Gauß"			: "Gauss Cannon",
				"Ion.W"			: "Ion Cannon",
				"Plasma"		: "Plasma Turret",
				"S.Kuppel"		: "Small Shield Dome",
				"GS.Kuppel"		: "Large Shield Dome"
			},
			
			"org" : {
				// ships
				"L.Fighter"		: "Light Fighter",
				"H.Fighter"		: "Heavy Fighter",
				"Cruiser"		: "Cruiser",
				"Battleship"	: "Battleship",
				"Battlecr."		: "Battlercruiser",
				"Bomber"		: "Bomber",
				"Dest."			: "Destroyer",
				"Deathstar"		: "Deathstar",
				
				"S.Cargo"		: "Small Cargo",
				"L.Cargo"		: "Large Cargo",
				"Col.Ship"		: "Colony Ship",
				"Recy."			: "Recycler",
				"Esp.Probe"		: "Espionage Probe",
				"Sol. Sat"		: "Solar Satellite",
				
				// defense
				"R.Launcher"	: "Rocket Launcher",
				"L.Laser"		: "Light Laser",
				"H.Laser"		: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Ion C."		: "Ion Cannon",
				"Plasma"		: "Plasma Turret",
				"S.Dome"		: "Small Shield Dome",
				"L.Dome"		: "Large Shield Dome"
			},
			
			"us" : {
				// ships
				"L.Fighter"		: "Light Fighter",
				"H.Fighter"		: "Heavy Fighter",
				"Cruiser"		: "Cruiser",
				"Battleship"	: "Battleship",
				"Battlecr."		: "Battlercruiser",
				"Bomber"		: "Bomber",
				"Dest."			: "Destroyer",
				"Deathstar"		: "Deathstar",
				
				"S.Cargo"		: "Small Cargo",
				"L.Cargo"		: "Large Cargo",
				"Col.Ship"		: "Colony Ship",
				"Recy."			: "Recycler",
				"Esp.Probe"		: "Espionage Probe",
				"Sol. Sat"		: "Solar Satellite",
				
				// defense
				"R.Launcher"	: "Rocket Launcher",
				"L.Laser"		: "Light Laser",
				"H.Laser"		: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Ion C."		: "Ion Cannon",
				"Plasma"		: "Plasma Turret",
				"S.Dome"		: "Small Shield Dome",
				"L.Dome"		: "Large Shield Dome"
			},
			
			"com.es" : {
				// ships
				"Ligero"		: "Light Fighter",
				"Pesado"		: "Heavy Fighter",
				"Crucero"		: "Cruiser",
				"NB"			: "Battleship",
				"Acoraz."		: "Battlercruiser",
				"Bomb."			: "Bomber",
				"Destr."		: "Destroyer",
				"EDLM"			: "Deathstar",
				
				"NPC"			: "Small Cargo",
				"NGC"			: "Large Cargo",
				"Coloniz."		: "Colony Ship",
				"Recicl."		: "Recycler",
				"Sonda"			: "Espionage Probe",
				"Satélite"		: "Solar Satellite",
				
				// defense
				"Lanzamis."		: "Rocket Launcher",
				"Láser P"		: "Light Laser",
				"Láser G"		: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Iónico"		: "Ion Cannon",
				"Plasma"		: "Plasma Turret",
				"Cúpula P"		: "Small Shield Dome",
				"Cúpula G"		: "Large Shield Dome"
			},
			
			"nl" : {
				// ships
				"LG"			: "Light Fighter",
				"ZG"			: "Heavy Fighter",
				"XXER"			: "Cruiser",
				"SS"			: "Battleship",
				"Inter"			: "Battlercruiser",
				"Bomwerper"		: "Bomber",
				"Vern"			: "Destroyer",
				"RIP"			: "Deathstar",
				
				"KV"			: "Small Cargo",
				"GV"			: "Large Cargo",
				"Kol schip"		: "Colony Ship",
				"Recycler"		: "Recycler",
				"Spiosonde"		: "Espionage Probe",
				"Zonne-sat"		: "Solar Satellite",
				
				// defense
				"RL"			: "Rocket Launcher",
				"KL"			: "Light Laser",
				"GL"			: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Ionkanon"		: "Ion Cannon",
				"Plasma"		: "Plasma Turret",
				"K koepel"		: "Small Shield Dome",
				"G koepel"		: "Large Shield Dome"
			},
			
			"dk" : {
				// ships
				"L.Jæger"		: "Light Fighter",
				"S.Jæger"		: "Heavy Fighter",
				"Krydser"		: "Cruiser",
				"Slagskib"		: "Battleship",
				"Interc.."		: "Battlercruiser",
				"Bomber"		: "Bomber",
				"Destr."		: "Destroyer",
				"Rip"			: "Deathstar",
				
				"LL.Trans"		: "Small Cargo",
				"St.Trans"		: "Large Cargo",
				"Kol. Skib"		: "Colony Ship",
				"Recy."			: "Recycler",
				"Spio.Sonde"	: "Espionage Probe",
				"S.Satellit"	: "Solar Satellite",
				
				// defense
				"Rak."			: "Rocket Launcher",
				"L.Laser"		: "Light Laser",
				"S.Laser"		: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Ion."			: "Ion Cannon",
				"Plasma"		: "Plasma Turret",
				"L.Skjold"		: "Small Shield Dome",
				"S.Skjold"		: "Large Shield Dome"
			},
			
			"gr" : {
				// ships
				"Ε.Μαχητικό"	: "Light Fighter",
				"Β.Μαχητικό"	: "Heavy Fighter",
				"Καταδιωκτικό"	: "Cruiser",
				"Καταδρομικό"	: "Battleship",
				"Θ. Αναχαίτισης": "Battlercruiser",
				"Βομβαρδιστικό"	: "Bomber",
				"Dest."			: "Destroyer",
				"Deathstar"		: "Deathstar",
				
				"Μικ.Μεταγωγικό": "Small Cargo",
				"Μεγ.Μεταγωγικό": "Large Cargo",
				"Σκάφος Αποικ."	: "Colony Ship",
				"Ανακυκλ."		: "Recycler",
				"Κατασκ.Στέλ."	: "Espionage Probe",
				"Ηλ. Συλ."		: "Solar Satellite",
				
				// defense
				"Εκτ.Ρουκετών"	: "Rocket Launcher",
				"Ε.Λέιζερ"		: "Light Laser",
				"Β.Λέιζερ"		: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Κ. Ιόντων"		: "Ion Cannon",
				"Πλάσμα"		: "Plasma Turret",
				"Μικ. Θόλος"	: "Small Shield Dome",
				"Μεγ. Θόλος"	: "Large Shield Dome"
			},
			
			"ru" : {
				// ships
				"Л. истр."		: "Light Fighter",
				"Т. истр."		: "Heavy Fighter",
				"Крейсер"		: "Cruiser",
				"Линк"			: "Battleship",
				"Лин. Кр."		: "Battlercruiser",
				"Бомб."			: "Bomber",
				"Уничт."		: "Destroyer",
				"ЗC"			: "Deathstar",
				
				"М. трансп."	: "Small Cargo",
				"Л. трансп."	: "Large Cargo",
				"Колон-р"		: "Colony Ship",
				"Раб"			: "Recycler",
				"Шп. зонд"		: "Espionage Probe",
				"СС"			: "Solar Satellite",
				
				// defense
				"РУ"			: "Rocket Launcher",
				"Лёг. лазер"	: "Light Laser",
				"Тяж. лазер"	: "Heavy Laser",
				"Гаусс"			: "Gauss Cannon",
				"Ион"			: "Ion Cannon",
				"Плазма"		: "Plasma Turret",
				"М. купол"		: "Small Shield Dome",
				"Б. купол"		: "Large Shield Dome"
			},
			
			"ro" : {
				// ships
				"V. Usor"		: "Light Fighter",
				"V. Greu"		: "Heavy Fighter",
				"Cruzere"		: "Cruiser",
				"N. razboi"		: "Battleship",
				"Intercept"		: "Battlercruiser",
				"Bombardie"		: "Bomber",
				"Destr"			: "Destroyer",
				"Rip"			: "Deathstar",
				
				"Tran. Mici"	: "Small Cargo",
				"Tran. Mari"	: "Large Cargo",
				"Colonizar"		: "Colony Ship",
				"Recicl."		: "Recycler",
				"Proba spi."	: "Espionage Probe",
				"Sat. Solar"	: "Solar Satellite",
				
				// defense
				"L. Rachete"	: "Rocket Launcher",
				"L.Laser"		: "Light Laser",
				"Lasere grele"	: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Magnetice"		: "Ion Cannon",
				"Plasme"		: "Plasma Turret",
				"Scut mic"		: "Small Shield Dome",
				"Scut mare"		: "Large Shield Dome"
			},
			
			"hu" : {
				// ships
				"K.Harcos"		: "Light Fighter",
				"N.Harcos"		: "Heavy Fighter",
				"Cirkáló"		: "Cruiser",
				"Csatahajó"		: "Battleship",
				"Csatacir"		: "Battlercruiser",
				"Bomb"			: "Bomber",
				"Romb"			: "Destroyer",
				"Deathstar"		: "Deathstar",
				
				"K.Szállító"	: "Small Cargo",
				"N.Szállító"	: "Large Cargo",
				"Col.hajó"		: "Colony Ship",
				"Szem"			: "Recycler",
				"Kém Szonda"	: "Espionage Probe",
				"Nap Műhold"	: "Solar Satellite",
				
				// defense
				"R.Kilövő"		: "Rocket Launcher",
				"K.Lézer"		: "Light Laser",
				"N.Lézer"		: "Heavy Laser",
				"Gauss"			: "Gauss Cannon",
				"Ion Á."		: "Ion Cannon",
				"Plazma"		: "Plasma Turret",
				"K.Kupola"		: "Small Shield Dome",
				"N.Kupola"		: "Large Shield Dome"
			},
			
			"hr.org" : {
				// ships
				"MA.LOVAC"		: "Light Fighter",
				"VE.LOVAC"		: "Heavy Fighter",
				"KRSTARICA"		: "Cruiser",
				"B. BROD"		: "Battleship",
				"O.K."		: "Battlercruiser",
				"BOMBARDER"		: "Bomber",
				"RAZAR."		: "Destroyer",
				"Rip"			: "Deathstar",
				
				"MA.TRANS."		: "Small Cargo",
				"VE.TRANS."		: "Large Cargo",
				"KOL.BROD."		: "Colony Ship",
				"RECIKL"		: "Recycler",
				"SONDE.ŠPIJU."	: "Espionage Probe",
				"SOL.SAT."		: "Solar Satellite",
				
				// defense
				"RAKETOB."	: "Rocket Launcher",
				"MA.LASER"		: "Light Laser",
				"VE.LASER"		: "Heavy Laser",
				"GAUS.TOP"		: "Gauss Cannon",
				"ION.TOP"		: "Ion Cannon",
				"Plazma"		: "Plasma Turret",
				"MA.KUPO"		: "Small Shield Dome",
				"VE.KUPO"		: "Large Shield Dome"
			},
			
			"tr.org" : {
				// ships
				"H.Avci"		: "Light Fighter",
				"A.Avci"		: "Heavy Fighter",
				"Kru."			: "Cruiser",
				"Kom."			: "Battleship",
				"Firk"			: "Battlercruiser",
				"Bomb"			: "Bomber",
				"Muhrip"		: "Destroyer",
				"RIP"			: "Deathstar",
				
				"K.Nakliye"		: "Small Cargo",
				"B.Nakliye"		: "Large Cargo",
				"Koloni"		: "Colony Ship",
				"GD"			: "Recycler",
				"Sonda"			: "Espionage Probe",
				"Solar."		: "Solar Satellite",
				
				// defense
				"Roketatar"		: "Rocket Launcher",
				"H.Lazer"		: "Light Laser",
				"A.Lazer"		: "Heavy Laser",
				"Gaus"			: "Gauss Cannon",
				"Iyon T."		: "Ion Cannon",
				"Plazma"		: "Plasma Turret",
				"K.Kalkan"		: "Small Shield Dome",
				"B.Kalkan"		: "Large Shield Dome"
			},
			
			"sk" : {
				// ships
				"L.Stíhač"		: "Light Fighter",
				"T.Stíhač"		: "Heavy Fighter",
				"Krížnik"		: "Cruiser",
				"Bojová Loď"	: "Battleship",
				"Bojový Krížnik": "Battlercruiser",
				"Bombardér"		: "Bomber",
				"Devastátor"	: "Destroyer",
				"RIP"			: "Deathstar",
				
				"M.Transportér"	: "Small Cargo",
				"V.Transportér"	: "Large Cargo",
				"Kol. Loď"		: "Colony Ship",
				"Recyklátor"	: "Recycler",
				"Sp.Sonda"		: "Espionage Probe",
				"Sol. Sat"		: "Solar Satellite",
				
				// defense
				"R.Komplet"		: "Rocket Launcher",
				"L.Laser"		: "Light Laser",
				"T.Laser"		: "Heavy Laser",
				"Gauss.Kanón"	: "Gauss Cannon",
				"Ion.Kanón."	: "Ion Cannon",
				"Plazma"		: "Plasma Turret",
				"M.Štít"		: "Small Shield Dome",
				"V.Štít"		: "Large Shield Dome"
			},
			
			"ae.org" : {
				// ships
				"مقاتلة خ"		: "Light Fighter",
				"مقاتلة ث"		: "Heavy Fighter",
				"طراد"			: "Cruiser",
				"مركبة حرب"		: "Battleship",
				"مطارد"			: "Battlercruiser",
				"قاذف"			: "Bomber",
				"مدمر"			: "Destroyer",
				"نجمة موت"		: "Deathstar",
				
				"ناقل ص"		: "Small Cargo",
				"ناقل ك"		: "Large Cargo",
				"م توطين"		: "Colony Ship",
				"تدوير"			: "Recycler",
				"مسبار"			: "Espionage Probe",
				"قمر شمسي"		: "Solar Satellite",
				
				// defense
				"ق صواريخ"		: "Rocket Launcher",
				"ليزر.خ"		: "Light Laser",
				"ليزر.ث"		: "Heavy Laser",
				"غاوس"			: "Gauss Cannon",
				"م.أيونات"		: "Ion Cannon",
				"بلازما"			: "Plasma Turret",
				"درع.ص"			: "Small Shield Dome",
				"درع.ك"			: "Large Shield Dome"
			},
			
			"jp" : {
				// ships
				"軽.戦闘機"		: "Light Fighter",
				"重.戦闘機"		: "Heavy Fighter",
				"巡洋艦"			: "Cruiser",
				"バトルシップ"		: "Battleship",
				"大型戦艦"		: "Battlercruiser",
				"爆撃機"			: "Bomber",
				"Dest."			: "Destroyer",
				"デススター"		: "Deathstar",
				
				"軽.輸送機"		: "Small Cargo",
				"重.輸送機"		: "Large Cargo",
				"Col. シップ"		: "Colony Ship",
				"Recy."			: "Recycler",
				"スパイ偵察機"		: "Espionage Probe",
				"Sol.サテライト"	: "Solar Satellite",
				
				// defense
				"R.ランチャー"		: "Rocket Launcher",
				"L.レーザー"		: "Light Laser",
				"H.レーザー"		: "Heavy Laser",
				"ガウス"			: "Gauss Cannon",
				"イオン C."		: "Ion Cannon",
				"プラズマ"			: "Plasma Turret",
				"S.ドーム"		: "Small Shield Dome",
				"L.ドーム"		: "Large Shield Dome"
			},
			
			"pl" : {
				// ships
				"L.myśliw.": "Light Fighter",
				"C.mysliw.": "Heavy Fighter",
				"Krazownik": "Cruiser",
				"O.wojenny.": "Battleship",
				"Panc.": "Battlercruiser",
				"Bombowiec": "Bomber",
				"Niszcz.": "Destroyer",
				"G.Smierci": "Deathstar",
				
				"M.transp.": "Small Cargo",
				"D.transp.": "Large Cargo",
				"St.kolon.": "Colony Ship",
				"Recykler": "Recycler",
				"So.szpieg.": "Espionage Probe",
				"Sat.slon.": "Solar Satellite",
				
				// defense
				"Wyrz.rak": "Rocket Launcher",
				"L.laser": "Light Laser",
				"C.laser": "Heavy Laser",
				"Gauss": "Gauss Cannon",
				"Jon": "Ion Cannon",
				"Plazma": "Plasma Turret",
				"M.powloka": "Small Shield Dome",
				"D.powloka": "Large Shield Dome"
			},
			
			"it" : {
				// ships
				"Caccia L.": "Light Fighter",
				"Caccia P.": "Heavy Fighter",
				"Incrociatori": "Cruiser",
				"Nave da B.": "Battleship",
				"Inc. da B.": "Battlercruiser",
				"Bombardieri": "Bomber",
				"Corazzate": "Destroyer",
				"Morti Nere": "Deathstar",
				
				"Cargo L.": "Small Cargo",
				"Cargo P.": "Large Cargo",
				"Colon.": "Colony Ship",
				"Rici.": "Recycler",
				"S. Spia": "Espionage Probe",
				"Sat. Sol.": "Solar Satellite",
				
				// defense
				"L.missili": "Rocket Launcher",
				"Laser L.": "Light Laser",
				"Laser P.": "Heavy Laser",
				"Gauss": "Gauss Cannon",
				"Ionici": "Ion Cannon",
				"Plasma": "Plasma Turret",
				"C. Scudo": "Small Shield Dome",
				"C. Scudo Pot.": "Large Shield Dome"
			},
			
			"fi.org" : {
				// ships
				"K.Hävittäjä": "Light Fighter",
				"R.Hävittäjä": "Heavy Fighter",
				"Risteilijä": "Cruiser",
				"Taistelualus": "Battleship",
				"Taistelurist.": "Battlercruiser",
				"Pommittaja": "Bomber",
				"Tuhoaja": "Destroyer",
				"Kuolemantähti": "Deathstar",
				
				"P.rahtialus": "Small Cargo",
				"S.Rahtialus": "Large Cargo",
				"Retk. alus": "Colony Ship",
				"Kierr.": "Recycler",
				"Vak.luotain": "Espionage Probe",
				"Aur.sat": "Solar Satellite",
				
				// defense
				"R.heitin": "Rocket Launcher",
				"K.Laser": "Light Laser",
				"R.Laser": "Heavy Laser",
				"Gauss": "Gauss Cannon",
				"Ioni T.": "Ion Cannon",
				"Plasma": "Plasma Turret",
				"P.Suoja": "Small Shield Dome",
				"S.Suoja": "Large Shield Dome"
			},
			
			"com.br": {
				// ships
				"Caça.L": "Light Fighter",
				"Caça.P": "Heavy Fighter",
				"Cruzador": "Cruiser",
				"N.Batalha": "Battleship",
				"Interceptador": "Battlercruiser",
				"Bombardeiro": "Bomber",
				"Destruidor.": "Destroyer",
				"EdM": "Deathstar",
				
				"Cg.Pequeno": "Small Cargo",
				"Cg.Grande": "Large Cargo",
				"N.Colonização": "Colony Ship",
				"Reciclador": "Recycler",
				"Sondas": "Espionage Probe",
				"Sat.Solar": "Solar Satellite",
				
				// defense
				"L.Misseis.": "Rocket Launcher",
				"Laser L.": "Light Laser",
				"Laser P.": "Heavy Laser",
				"C.Gauss": "Gauss Cannon",
				"C.Íons.": "Ion Cannon",
				"C.Plasma": "Plasma Turret",
				"P.Escudo": "Small Shield Dome",
				"G.Escudo": "Large Shield Dome"
			}
			//add translations here, missing:
			//com.ar, ba.org, cz, fr, mx.org, no, com.pt, rs, si, se, tw
		};

	}
};