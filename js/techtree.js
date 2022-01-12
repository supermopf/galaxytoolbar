"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_techtreeparser) galaxytoolbar.GTPlugin_techtreeparser={};

galaxytoolbar.GTPlugin_techtreeparser = {
	
	parse_techtree: function(techtreedoc, originaldoc, thispointer, callback, callbackargs) {
		try {
			var general = galaxytoolbar.GTPlugin_general;
			general.set_status(originaldoc,"galaxyplugin"+1,0,general.getLocString("techtreefound"),"All Galaxytools");
			var tech_ids = new Array();
			var translated_tech_names = new Array();
			var td;
			var i = 0;
			var tmp;
			var t = techtreedoc.getElementById("technology");
			while (td = t.getElementsByTagName("td")[i]) {
				i++;
				if (td.hasAttribute("class")) {
					if (td.getAttribute("class") == "item") {
						tmp = td.getElementsByTagName("img")[0].getAttribute("src");
						if (tmp != "") {
							tmp = tmp.replace("img/tiny/tiny_","");
							tmp = tmp.replace(".jpg","");
						}
						if (isNaN(parseInt(tmp))) {
							tmp = td.getElementsByTagName("a")[0].getAttribute("href");
							tmp = tmp.match(/techID=(\d+)/)[1];
						}
						tech_ids.push(parseInt(tmp));
						translated_tech_names.push(general.trimString(td.getElementsByTagName("a")[0].text));
					}
				}
			}
			
			var english_technames = galaxytoolbar.GTPlugin_planet_data.translate_techids_to_english(tech_ids);
			
			var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(originaldoc.URL);
			if (tool_ids.length > 0) {
				
				if (galaxytoolbar.GTPlugin_storage.insert_translations(tool_ids,english_technames,translated_tech_names)) {
					general.set_status(originaldoc,"galaxyplugin"+1,1,general.getLocString("techtreeparsed"),"All Galaxytools");
					
					// check, if we need to retry the action that caused this techtree parsing
					if (callback)
						callback.apply(thispointer,callbackargs);
				} else {
					general.set_status(originaldoc,"galaxyplugin"+1,3,general.getLocString("error.techtreenotparsed"),"All Galaxytools");
				}
			}
			
			return false;
	 	} catch(error) {
	 		galaxytoolbar.GTPlugin_general.set_status(originaldoc,"galaxyplugin"+1,3,"Unexpected error while parsing techtree: "+error,"All Galaxytools");
	 		return false;
	 	}
	},
	
	download_and_parse_techtree: function(doc,thispointer,callback,callbackargs) {
		var loc = doc.URL;
		loc = loc.substring(0,loc.indexOf('?'));
		
		if (!galaxytoolbar.GTPlugin_general.compare_ogame_version_with(doc,5,3,0))
			loc = loc+'?page=globalTechtree&techID=109';
		else
			loc = loc+'?page=techtree&tab=3&open=all';
		
		var httpRequest = new XMLHttpRequest();
		httpRequest.onload = function gtool_techtree_onsuccess() {
			var techtreedoc = galaxytoolbar.GTPlugin_general.HTMLParser(httpRequest.responseText);
			galaxytoolbar.GTPlugin_techtreeparser.parse_techtree(techtreedoc,doc,thispointer,callback,callbackargs);
		};
		
		httpRequest.open("GET", loc, true);
		httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
		httpRequest.send(null);
	},
	
	get_language_file: function(url,resources_names) {
		try {
			
			var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(url);
			
			var language_file =
				"$probe_array = array(\n"+
				"/*********************************************************************/\n"+
				"/***************************  Resources  *****************************/\n"+
				"/*********************************************************************/\n"+
				"\""+resources_names[0]+"\" => R_METAL,\n"+
				"\""+resources_names[1]+"\" => R_CRYSTAL,\n"+
				"\""+resources_names[2]+"\" => R_DEUTERIUM,\n"+
				"\""+resources_names[3]+"\" => R_ENERGY,\n\n"+
				"/*********************************************************************/\n"+
				"/*****************************  Fleet   ******************************/\n"+
				"/*********************************************************************/\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Small Cargo",tool_ids[0])+"\" => F_SMALLCARGOSHIP,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Large Cargo",tool_ids[0])+"\" => F_LARGECARGOSHIP,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Light Fighter",tool_ids[0])+"\" => F_LIGHFIGHTER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Heavy Fighter",tool_ids[0])+"\" => F_HEAVYFIGHTER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Cruiser",tool_ids[0])+"\" => F_CRUISER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Battleship",tool_ids[0])+"\" => F_BATTLESHIP,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Colony Ship",tool_ids[0])+"\" => F_COLONYSHIP,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Recycler",tool_ids[0])+"\" => F_RECYCLER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Espionage Probe",tool_ids[0])+"\" => F_ESPIONAGEPROBE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Bomber",tool_ids[0])+"\" => F_BOMBER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Destroyer",tool_ids[0])+"\" => F_DESTROYER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Deathstar",tool_ids[0])+"\" => F_DEATHSTAR,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Battlecruiser",tool_ids[0])+"\" => F_BATTLECRUISER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Solar Satellite",tool_ids[0])+"\" => F_SOLARSATELLITE,\n\n"+
				"/*********************************************************************/\n"+
				"/**************************  Defense  ********************************/\n"+
				"/*********************************************************************/\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Rocket Launcher",tool_ids[0])+"\" => D_MISSILELAUNCHER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Light Laser",tool_ids[0])+"\" => D_SMALLLASER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Heavy Laser",tool_ids[0])+"\" => D_HEAVYLASER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Ion Cannon",tool_ids[0])+"\" => D_IONCANNON,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Gauss Cannon",tool_ids[0])+"\" => D_GAUSSCANNON,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Plasma Turret",tool_ids[0])+"\" => D_PLASMACANNON,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Small Shield Dome",tool_ids[0])+"\" => D_SMALLSHIELDDOME,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Large Shield Dome",tool_ids[0])+"\" => D_LARGESHILDDOME,\n"+ 
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Anti-Ballistic Missiles",tool_ids[0])+"\" => D_ANTIBALLISTICMISSILE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Interplanetary Missiles",tool_ids[0])+"\" => D_INTERPLANETARYMISSILE,\n\n"+
				"/*********************************************************************/\n"+
				"/*****************************  Buildings  ***************************/\n"+
				"/*********************************************************************/\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Metal Mine",tool_ids[0])+"\" => B_METALMINE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Crystal Mine",tool_ids[0])+"\" => B_CRYSTALMINE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Deuterium Synthesizer",tool_ids[0])+"\" => B_DEUTERIUMSYNTHESIZER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Solar Plant",tool_ids[0])+"\" => B_SOLARPLANT,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Fusion Reactor",tool_ids[0])+"\" => B_FUSIONPLANT,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Robotics Factory",tool_ids[0])+"\" => B_ROBOTFACTORY,\n"+ 
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Nanite Factory",tool_ids[0])+"\" => B_NANITEFACTORY,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Shipyard",tool_ids[0])+"\" => B_SHIPYARD,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Metal Storage",tool_ids[0])+"\" => B_METALSTORAGE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Crystal Storage",tool_ids[0])+"\" => B_CRYSTALSTORAGE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Deuterium Tank",tool_ids[0])+"\" => B_DEUTERIUMTANK,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Research Lab",tool_ids[0])+"\" => B_RESAERCHLAB,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Terraformer",tool_ids[0])+"\" => B_TERRAFORMER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Alliance Depot",tool_ids[0])+"\" => B_ALLIANCEDEPOT,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Missile Silo",tool_ids[0])+"\" => B_ROCKETSILO,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Lunar Base",tool_ids[0])+"\" => B_LUNARBASE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Sensor Phalanx",tool_ids[0])+"\" => B_SENSORPHALANX,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Jump Gate",tool_ids[0])+"\" => B_JUMPGATE,\n\n"+
				"/*********************************************************************/\n"+
				"/*****************************  Research   ***************************/\n"+
				"/*********************************************************************/\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Espionage Technology",tool_ids[0])+"\" => RS_ESPIONAGE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Computer Technology",tool_ids[0])+"\" => RS_COMPUTER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Weapons Technology",tool_ids[0])+"\" => RS_WEAPON,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Shielding Technology",tool_ids[0])+"\" => RS_SHIELDING,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Armour Technology",tool_ids[0])+"\" => RS_ARMOUR,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Energy Technology",tool_ids[0])+"\" => RS_ENERGY,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Hyperspace Technology",tool_ids[0])+"\" => RS_HYPERSPACE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Combustion Drive",tool_ids[0])+"\" => RS_COMBUSTIONENGINE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Impulse Drive",tool_ids[0])+"\" => RS_IMPULSEENGINE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Hyperspace Drive",tool_ids[0])+"\" => RS_HYPERSPACEENGINE,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Laser Technology",tool_ids[0])+"\" => RS_LASER,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Ion Technology",tool_ids[0])+"\" => RS_ION,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Plasma Technology",tool_ids[0])+"\" => RS_PLASMA,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Intergalactic Research Network",tool_ids[0])+"\" => RS_IRNETWORK,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Astrophysics",tool_ids[0])+"\" => RS_EXPEDITION,\n"+
				"\""+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Graviton Technology",tool_ids[0])+"\" => RS_GRAVITON";
				
				alert(language_file);
		} catch(error) {
			alert("Error while creating translation: "+error);
		}
	},
	
	get_androgame_language_file: function(url,resources_names) {
		var tool_ids = galaxytoolbar.GTPlugin_storage.read_tool_ids_for_ogame_url(url);
			
			var language_file =
				galaxytoolbar.GTPlugin_general.get_tld(url)+":\n\n"+
				"[spoiler='Buildings']"+
				'<?xml version="1.0" encoding="utf-8"?>\n'+
				'<resources>\n'+
				'<string name="bat_MineMetal">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Metal Mine",tool_ids[0])+"</string>\n"+
				'<string name="bat_MineCristal">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Crystal Mine",tool_ids[0])+"</string>\n"+
				'<string name="bat_MineDeut">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Deuterium Synthesizer",tool_ids[0])+"</string>\n"+
				'<string name="bat_CentraleSolaire">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Solar Plant",tool_ids[0])+"</string>\n"+
				'<string name="bat_CentraleFusion">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Fusion Reactor",tool_ids[0])+"</string>\n"+
				'<string name="bat_HangarMetal">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Metal Storage",tool_ids[0])+"</string>\n"+
				'<string name="bat_HangarCristal">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Crystal Storage",tool_ids[0])+"</string>\n"+
				'<string name="bat_HangarDeut">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Deuterium Tank",tool_ids[0])+"</string>\n"+
				'<string name="bat_ChantierSpacial">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Shipyard",tool_ids[0])+"</string>\n"+
				'<string name="bat_UsineRobots">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Robotics Factory",tool_ids[0])+"</string>\n"+ 
				'<string name="bat_Laboratoire">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Research Lab",tool_ids[0])+"</string>\n"+
				'<string name="bat_DepotRavitaillement">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Alliance Depot",tool_ids[0])+"</string>\n"+
				'<string name="bat_SiloMissile">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Missile Silo",tool_ids[0])+"</string>\n"+
				'<string name="bat_UsineNanites">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Nanite Factory",tool_ids[0])+"</string>\n"+
				'<string name="bat_Terraformeur">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Terraformer",tool_ids[0])+"</string>\n"+
				'<string name="bat_BaseLunaire">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Lunar Base",tool_ids[0])+"</string>\n"+
				'<string name="bat_Phalange">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Sensor Phalanx",tool_ids[0])+"</string>\n"+
				'<string name="bat_PorteSaut">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Jump Gate",tool_ids[0])+"</string>\n"+
				'</resources>\n'+
				"[/spoiler]\n\n"+
				
				"[spoiler='Research']"+
				'<?xml version="1.0" encoding="utf-8"?>\n'+
				'<resources>\n'+
				'<string name="srch_technoEnergie">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Energy Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoLaser">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Laser Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoIons">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Ion Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoHyperespace">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Hyperspace Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoPlasma">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Plasma Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_reactComb">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Combustion Drive",tool_ids[0])+"</string>\n"+
				'<string name="srch_reactImp">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Impulse Drive",tool_ids[0])+"</string>\n"+
				'<string name="srch_propHyper">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Hyperspace Drive",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoEspio">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Espionage Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoOrdi">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Computer Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_astrophysique">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Astrophysics",tool_ids[0])+"</string>\n"+
				'<string name="srch_resRechInter">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Intergalactic Research Network",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoGraviton">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Graviton Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoArmes">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Weapons Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoBouclier">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Shielding Technology",tool_ids[0])+"</string>\n"+
				'<string name="srch_technoProtection">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Armour Technology",tool_ids[0])+"</string>\n"+
				'</resources>\n'+
				"[/spoiler]\n\n"+
				
				"[spoiler='Ships']"+
				'<?xml version="1.0" encoding="utf-8"?>\n'+
				'<resources>\n'+
				'<string name="vsx_Chasseur_Leger">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Light Fighter",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Chasseur_Lourd">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Heavy Fighter",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Croiseur">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Cruiser",tool_ids[0])+"</string>\n"+
				'<string name="vsx_VdB">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Battleship",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Ptrans">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Small Cargo",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Gtrans">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Large Cargo",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Colonisation">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Colony Ship",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Traq">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Battlecruiser",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Dest">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Destroyer",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Bomb">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Bomber",tool_ids[0])+"</string>\n"+
				'<string name="vsx_EdlM">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Deathstar",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Recycleur">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Recycler",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Sonde_Espio">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Espionage Probe",tool_ids[0])+"</string>\n"+
				'<string name="vsx_Satellite_Solaire">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Solar Satellite",tool_ids[0])+"</string>\n"+
				'</resources>\n'+
				"[/spoiler]\n\n"+
				
				"[spoiler='Defense']"+
				'<?xml version="1.0" encoding="utf-8"?>\n'+
				'<resources>\n'+
				'<string name="def_Lance_Missile">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Rocket Launcher",tool_ids[0])+"</string>\n"+
				'<string name="def_Laser_leger">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Light Laser",tool_ids[0])+"</string>\n"+
				'<string name="def_Laser_lourd">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Heavy Laser",tool_ids[0])+"</string>\n"+
				'<string name="def_Gauss">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Gauss Cannon",tool_ids[0])+"</string>\n"+
				'<string name="def_Artillerie_Ions">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Ion Cannon",tool_ids[0])+"</string>\n"+
				'<string name="def_Lanceur_plasma">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Plasma Turret",tool_ids[0])+"</string>\n"+
				'<string name="def_Petit_Bouclier">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Small Shield Dome",tool_ids[0])+"</string>\n"+
				'<string name="def_Grand_Bouclier">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Large Shield Dome",tool_ids[0])+"</string>\n"+
				'<string name="def_Missile_Interception">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Anti-Ballistic Missiles",tool_ids[0])+"</string>\n"+
				'<string name="def_Missile_Interplanetaire">'+galaxytoolbar.GTPlugin_storage.get_translation_for_language_file("Interplanetary Missiles",tool_ids[0])+"</string>\n"+
				'</resources>\n'+
				"[/spoiler]\n\n";

		alert(language_file);
		
	}
};