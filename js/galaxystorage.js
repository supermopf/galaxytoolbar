"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_storage) galaxytoolbar.GTPlugin_storage={};

galaxytoolbar.GTPlugin_storage={
	
	dbConn:			null,
	db_tools:		"galaxytool_tools",
	db_languages:	"galaxytool_languages",
	db_espionage:	"galaxytool_espionage",
	db_tools_ids:	"galaxytool_tools_ids",
	db_activities:  "galaxytool_activities", // stores recent activity updates to the tools
	current_translation: "",
	current_translation_obj: new Object(),
	
	insert_tool: function(id,tool_name, ogame_url, tool_url, tool_version_major, tool_version_minor, 
						  tool_version_revision,  tool_user, tool_password, tool_token, universe, is_ogeneral,
						  ogeneral_ip, ogeneral_port, s_galaxy, s_stats, s_reports, s_allypage, s_espionage_action,
						   s_short_cr, s_player_message, s_player_message_c, s_phalanx, s_buildings, s_research,
						  s_fleet, s_defense, s_empire, s_shipyard, s_fmovement) {
		try {
			
			var new_id = this.get_free_id();
			var key = this.db_tools+new_id;
			
			var tool = new Object();
			
			tool["id"]					= new_id;
			tool["name"]				= tool_name;
			tool["ogame_url"]			= ogame_url;
			tool["tool_url"]			= tool_url;
			tool["tool_version_major"] = tool_version_major;
			tool["tool_version_minor"] = tool_version_minor;
			tool["tool_version_revision"] = tool_version_revision;
			tool["tool_user"]			= tool_user;
			tool["tool_password"] 		= tool_password;
			tool["tool_token"]			= tool_token;
			tool["universe"]			= universe;
				
			tool["is_ogeneral"]		= is_ogeneral;
			tool["ogeneral_ip"]		= ogeneral_ip;
			tool["ogeneral_port"]		= ogeneral_port;
			
			// universe data checkboxes
			tool["submit_galaxy"]   = s_galaxy;
			tool["submit_stats"]	= s_stats;
			tool["submit_reports"]  = s_reports;
			tool["submit_allypage"] = s_allypage;
			tool["submit_phalanx"]  = s_phalanx;
			tool["submit_espionage_action"] = s_espionage_action;
			tool["submit_short_cr"] = s_short_cr;
			tool["submit_player_message"] = s_player_message;
			tool["submit_player_message_c"] = s_player_message_c;
				
			// own data checkboxes
			tool["submit_buildings"] = s_buildings;
			tool["submit_research"]  = s_research;
			tool["submit_fleet"]	 = s_fleet;
			tool["submit_defense"]   = s_defense;
			tool["submit_empire"]	= s_empire;
			tool["submit_shipyard"]  = s_shipyard;
			tool["submit_fmovement"] = s_fmovement;
			
			localStorage.setItem(key, JSON.stringify(tool));
			this.add_new_id(new_id);
			return new_id;
		} catch(error) {
			alert("error at insert: "+error);
		}
	},
	
	get_free_id: function() {
		var res = localStorage.getItem(this.db_tools_ids);
		// we don't have any tool stored
		if (res === null) return 0;
		
		//otherwise, there is at least one tool/there was once one tool
		res = JSON.parse(res);
		
		if (res.length == 0)
			return 0;
		
		if (parseInt(res[0]) > 0)
			return 0;
			
		// we have one tool at 0
		for (var i = 0; i < res.length-1; i++) {
			if (parseInt(res[i])+1 != parseInt(res[i+1])) {
				return parseInt(res[i])+1;
			}
		}
		
		// we have no gaps
		return parseInt(res[res.length-1])+1;
	},
	
	add_new_id: function(id) {
		var res = localStorage.getItem(this.db_tools_ids);
		
		if (res === null) {
			var tmp = new Array();
			tmp.push(id);
			localStorage.setItem(this.db_tools_ids, JSON.stringify(tmp));
		} else {
			res = JSON.parse(res);
			res.push(id);
			res.sort(function(a, b) {
				if (a < b) 
					return -1;
				
				if (b < a)
					return 1;
					
				return 0;
			});
			localStorage.setItem(this.db_tools_ids, JSON.stringify(res));
		}
	},
	
	delete_id: function(id) {
		var res = localStorage.getItem(this.db_tools_ids);
		
		if (res !== null) {
			res = JSON.parse(res);
			
			for (var i = 0; i < res.length; i++)
				if (res[i] == id) {
					res.splice(i,1);
					localStorage.setItem(this.db_tools_ids, JSON.stringify(res));
				}
		}
	},
	
	update_tool: function(id,tool_name, ogame_url, tool_url, tool_version_major, tool_version_minor, 
						  tool_version_revision,  tool_user, tool_password, tool_token, universe, is_ogeneral,
						  ogeneral_ip, ogeneral_port, s_galaxy, s_stats, s_reports, s_allypage, s_espionage_action,
						   s_short_cr, s_player_message, s_player_message_c, s_phalanx, s_buildings, s_research,
						  s_fleet, s_defense, s_empire, s_shipyard, s_fmovement) {
		
		try {
			var key = this.db_tools+id;
			
			var tool = new Object();
			
			tool["id"]					= id;
			tool["name"]				= tool_name;
			tool["ogame_url"]			= ogame_url;
			tool["tool_url"]			= tool_url;
			tool["tool_version_major"] = tool_version_major;
			tool["tool_version_minor"] = tool_version_minor;
			tool["tool_version_revision"] = tool_version_revision;
			tool["tool_user"]			= tool_user;
			tool["tool_password"] 		= tool_password;
			tool["tool_token"]			= tool_token;
			tool["universe"]			= universe;
				
			tool["is_ogeneral"]		= is_ogeneral;
			tool["ogeneral_ip"]		= ogeneral_ip;
			tool["ogeneral_port"]		= ogeneral_port;
				
			// universe data checkboxes
			tool["submit_galaxy"]   = s_galaxy;
			tool["submit_stats"]	= s_stats;
			tool["submit_reports"]  = s_reports;
			tool["submit_allypage"] = s_allypage;
			tool["submit_phalanx"]  = s_phalanx;
			tool["submit_espionage_action"] = s_espionage_action;
			tool["submit_short_cr"] = s_short_cr;
			tool["submit_player_message"] = s_player_message;
			tool["submit_player_message_c"] = s_player_message_c;
				
			// own data checkboxes
			tool["submit_buildings"] = s_buildings;
			tool["submit_research"]  = s_research;
			tool["submit_fleet"]	 = s_fleet;
			tool["submit_defense"]   = s_defense;
			tool["submit_empire"]	= s_empire;
			tool["submit_shipyard"]  = s_shipyard;
			tool["submit_fmovement"] = s_fmovement;
			
			localStorage.setItem(key, JSON.stringify(tool));
		} catch(error) {
			alert("error at update: "+error);
			
		}
	},
	
	insert_translations: function(tool_ids,english_names,translations) {
		try {
			var obj = new Object();
			for(var i=0;i < english_names.length;i++) {
				obj[translations[i]] = english_names[i];
			}
			
			localStorage.setItem(this.db_languages, JSON.stringify(obj));
			
			return true;
		} catch(error) {
			alert("update techs error: "+error);
			return false;
		}
	},
	
	get_translation: function(tool_id,word,set_locking_var,loc) {
		try {
			
			var res = localStorage.getItem(this.db_languages);
			if (res !== null) {
				if (res == this.current_translation) {
					var t = this.current_translation_obj[word];
					if (t)
						return t;
				}
				
				this.current_translation = res;
				res = JSON.parse(res);
				this.current_translation_obj = res;
				
				var t = res[word];
				if (t)
					return t;
			}
			
			return "Unknown entry";
		} catch(error) {
			alert("get translations error: "+error);
		}
	},
	
	hasTranslation: function(tool_id) {
		return localStorage.getItem(this.db_languages) != null;
	},
	
	insert_espionage_action: function(uni,galaxy,system,planet) {
		try {
			var res = localStorage.getItem(this.db_espionage);
			if (res === null) {
				var arr = new Array();
				
				arr[0] = new Object();
				arr[0].universe = uni;
				arr[0].galaxy = galaxy;
				arr[0].system = system;
				arr[0].planet = planet;
				arr[0].time = Math.round((new Date()).getTime() / 1000);
				
				localStorage.setItem(this.db_espionage, JSON.stringify(arr));
			} else {
				res = JSON.parse(res);
				
				var arr= new Object();
				arr.universe = uni;
				arr.galaxy = galaxy;
				arr.system = system;
				arr.planet = planet;
				arr.time = Math.round((new Date()).getTime() / 1000);
				
				res.push(arr);
				
				localStorage.setItem(this.db_espionage, JSON.stringify(res));
			}
		} catch(e) {
			alert("Error in insert_espionage_action: "+e);
		}
	},
	
	insert_fleet_action: function(uni,galaxy,system,planet,utc_time) {
		try {
			var res = localStorage.getItem(this.db_espionage);
			if (res === null) {
				var arr = new Array();
				
				arr[0] = new Object();
				arr[0].universe = uni;
				arr[0].galaxy = galaxy;
				arr[0].system = system;
				arr[0].planet = planet;
				arr[0].time = utc_time;
				
				localStorage.setItem(this.db_espionage, JSON.stringify(arr));
			} else {
				res = JSON.parse(res);
				
				var arr= new Object();
				arr.universe = uni;
				arr.galaxy = galaxy;
				arr.system = system;
				arr.planet = planet;
				arr.time = utc_time;
				
				res.push(arr);
				
				localStorage.setItem(this.db_espionage, JSON.stringify(res));
			}
		} catch(e) {
			alert("Error in insert_fleet_action: "+e);
		}
	},
	
	delete_old_espionage_entries: function() {
		try {
			//delete entries older than 1 hour
			var res = localStorage.getItem(this.db_espionage);
			if (res === null) return;
			
			res = JSON.parse(res);
			var t = Math.round((new Date()).getTime() / 1000)-3600;
			
			for (var i = res.length-1; i >= 0; i--) {
				if (res[i].time < t) {
					res.splice(i,1);
				}
			}
			
			localStorage.setItem(this.db_espionage, JSON.stringify(res));
		} catch(e) {
			alert("Error in delete_old_espionage_entries: "+e);
		}
	},
	
	caused_activity_self: function(url,galaxy,system,planet,minutes) {
		try {
			
			if (minutes == 7) {
				minutes = 15;
			} else {
				//rounding problems may occur otherwise
				minutes += 1;
			}
			
			var res = localStorage.getItem(this.db_espionage);
			if (res === null) {
				return false;
			}
			
			res = JSON.parse(res);
			var param1 = Math.round((new Date()).getTime() / 1000);
			var param2 = param1 -(minutes*60);
			
			for (var i = 0; i < res.length; i++) {
				if(res[i].galaxy != galaxy) continue;
				if(res[i].system != system) continue;
				if(res[i].planet != planet) continue;
				
				if (param2 < res[i].time && res[i].time < param1)
					return true;
			}
			
			return false;
		} catch(e) {
			//alert(e);
			return false;
		}
	},
	
	insert_current_activities: function(sUniverseUrl, aPlayerIds, aDate) {
		// insert activities detected from chat bar (buddies and alliance member)
		// it is not intended to insert any other activities here - they would be deleted
		// as non-recent activities!
		try {
			if (!aPlayerIds || aPlayerIds.length == 0) {
				return;
			}
			var uni = sUniverseUrl.substring(8,sUniverseUrl.indexOf("/game"));
			
			var res = localStorage.getItem(this.db_activities);
			if (res === null) {
				res = new Array();
			} else {
				res = JSON.parse(res);
			}
			
			// first delete outdated information
			var roundedDate = this._round_date(aDate);
			var currentDate = new Date(roundedDate[0], roundedDate[1], roundedDate[2], roundedDate[3], roundedDate[4], roundedDate[5], 0)
			for (var i=res.length -1; i>= 0; i--) {
				if (res.universe === uni) {
					// compare dates
					var oldDate = new Date(res.dateArray[0], res.dateArray[1], res.dateArray[2], res.dateArray[3], res.dateArray[4], res.dateArray[5], 0)
					if (oldDate < currentDate) {
						// remove from stack
						res.splice(i,1);
					}
				}
			}
			
			// then insert the new activities
			for (var i=0; i<aPlayerIds.length; i++) {
				var arr= new Object();
				arr.universe = uni;
				arr.playerid = aPlayerIds[i];
				arr.dateArray = this._round_date(aDate);
				
				res.push(arr);
			}
			
			// .. and save
			localStorage.setItem(this.db_activities, JSON.stringify(res));
			
		} catch(e) {
			alert("Error in insert_submitted_activities: "+e);
		}
	},
	
	read_current_activities: function(sUniverseUrl, aDate) {
		try {
			var uni = sUniverseUrl.substring(8,sUniverseUrl.indexOf("/game"));
			
			var res = localStorage.getItem(this.db_activities);
			if (res === null) {
				res = new Array();
			} else {
				res = JSON.parse(res);
			}

			var aResult = new Array();
			var aRoundedDate = this._round_date(aDate);
			for (var i=res.length -1; i>= 0; i--) {
				if (res[i].universe === uni) {
					// compare dates up to the minute only
					if (res[i].dateArray[0] === aRoundedDate[0] &&
						res[i].dateArray[1] === aRoundedDate[1] &&
						res[i].dateArray[2] === aRoundedDate[2] &&
						res[i].dateArray[3] === aRoundedDate[3] &&
						res[i].dateArray[4] === aRoundedDate[4]) {
							
							aResult.push(res[i].playerid);
						}
				}
			}

			return aResult;
		} catch(e) {
			alert("Error in read_current_activities: "+e);
		}
	},
	
	_round_date: function(aDate) {
		var date;
		var year = aDate[0];
		var month = aDate[1];
		var day = aDate[2];
		var hour = aDate[3];
		var minute = aDate[4];
		
		if (minute > 52) {
			date = new Date(aDate[0], aDate[1], aDate[2], aDate[3], aDate[4], 0, 0);
			date = new Date(date.getTime() + 10 *60000); // add 10 minutes to get next full hour (day, month or even year)

			year   = date.getFullYear();
			month  = date.getMonth() + 1;
			day    = date.getDate();
			hour   = date.getHours();
			minute = 0;
		} else if (minute < 8) {
			minute = 0;
		} else if (minute >= 8 && minute < 23) {
			minute = 15;
		} else if (minute >= 23 && minute < 38) {
			minute = 30;
		} else {
			minute = 45;
		}
		
		return [year, month, day, hour, minute, 0, 0];
	},
	
	reload_all_universe_names: function() {
		var tools = this.read_tools();
		
		for (var i=0; i < tools.length; i++) {
			var id = tools[i]["id"];
			var url = tools[i]["ogame_url"];
			galaxytoolbar.GTPlugin_options2.reload_ogame_servername(id,url,true);
		}
	},
	
	tool_exists: function(id) {
		try {
			if (id == null)
				return false;
			
			return localStorage.getItem(this.db_tools+id) !== null;
			
		} catch(error) {
			alert("tool exists error: "+error);
			return false;
		}
	},
	
	delete_tool: function(id) {
		try {
			if (id != null) {
				localStorage.removeItem(this.db_tools+id);
				this.delete_id(id);
			}
		} catch(error) {
			alert("delete tool error: "+error);
		}		
	},
	
	read_tools: function() {
		try {
			var ids = localStorage.getItem(this.db_tools_ids);
			var return_value = new Array();
			if (ids !== null) {
				ids = JSON.parse(ids);
				for (var i = 0; i < ids.length; i++) {
					var array_index = return_value.length;
					return_value[array_index] = JSON.parse(localStorage.getItem(this.db_tools+ids[i]));
				}
			}
			
			return return_value;
			
		} catch(error) {
			alert("read tools error: "+error);
		}		
	},
	
	read_tool_ids_for_ogame_url: function(universe_url) {
		try {
			//loalstorage stores per website anyway
			var res = localStorage.getItem(this.db_tools_ids);
			
			if (res === null) return new Array();
			
			return JSON.parse(res);
			
		} catch (error) {
			alert("read tools for ogame url error: "+error);
		}
	},
	
	read_tools_for_ogame_url: function(universe_url) {
		try {
			return this.read_tools();
		} catch(error) {
			alert("read tools for ogame url error: "+error);
		}
	},
	
	tool_exists_for_ogame_url: function(universe_url) {
		try {
			return this.read_tools().length > 0;
		} catch (error) {
			alert("read tools for ogame url error: "+error+"\n\nSQL error details: "+this.dbConn.lastErrorString);
			return false;
		}
	},
	

	target_tool_exists: function(universe_url,parameter) {
		try {
			switch(parameter) {
				case "galaxy"		: parameter = "submit_galaxy"; break;
				case "stats"		: parameter = "submit_stats"; break;
				case "reports"		: parameter = "submit_reports"; break;
				case "allypage"		: parameter = "submit_allypage"; break;
				case "espionage_action"  : parameter = "submit_espionage_action"; break;
				case "short_cr"		: parameter = "submit_short_cr"; break;
				case "message"		: parameter = "submit_player_message"; break;
				case "message_c"	: parameter = "submit_player_message_c"; break;
				case "buildings"	: parameter = "submit_buildings"; break;
				case "research"		: parameter = "submit_research"; break;
				case "fleet"		: parameter = "submit_fleet"; break;
				case "defense"		: parameter = "submit_defense"; break;
				case "shipyard"		: parameter = "submit_shipyard"; break;
				case "empire"		: parameter = "submit_empire"; break;
				case "phalanx"		: parameter = "submit_phalanx"; break;
				case "fmovement"	: parameter = "submit_fmovement"; break;
				case "ogeneral"		: parameter = "is_ogeneral"; break;
				default: parameter = "submit_galaxy";
			}
			
			var tools = this.read_tools();
			
			for (var i = 0; i < tools.length; i++) {
				if (tools[i][parameter])
					return true;
			}
			
			return false;
			
		} catch(error) {
			alert("target_tool_exists error: "+error);
			return false;
		}		
	},
	
	get_number_of_tools: function() {
		try {
			var res =  localStorage.getItem(this.db_tools_ids);
			
			if (res === null) return 0;
			
			res = JSON.parse(res);
			return res.length;
			
		} catch(error) {
			alert("get number of tools error: "+error);
		}		
	},
	
	update_universe_for_ogame_url: function(universe_url,universe_name) {
		try {
			
			var tools = this.read_tools();
			
			for (var i = 0; i < tools.length; i++) {
				tools[i].universe = universe_name;
				localStorage.setItem(this.db_tools+tools[i]["id"], JSON.stringify(tools[i]));
			}
			
		} catch(error) {
			alert("update universe for ogame url error: "+error);
		}
	},
	
	update_galaxytool_version: function(tool_url,tool_version_major,tool_version_minor,tool_version_revision) {
		try {
			var tools = this.read_tools();
			
			for (var i = 0; i < tools.length; i++) {
				if (tools[i].tool_url == tool_url) {
					tools[i].tool_version_major = tool_version_major;
					tools[i].tool_version_minor = tool_version_minor;
					tools[i].tool_version_revision = tool_version_revision;
					localStorage.setItem(this.db_tools+tools[i]["id"], JSON.stringify(tools[i]));
				}
			}
		} catch(error) {
			alert("update galaxytool version error: "+error);
		}
	},
	
	get_translation_for_language_file: function(tech_name_english,tool_id) {
		
		var res = localStorage.getItem(this.db_languages);
		
		if (res == null) return "";
		
		for (var i in res){
			if (tech_name_english == res[i])
				return i;
		}
		
		return "";
	},
};