"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_allypage) galaxytoolbar.GTPlugin_allypage={};

galaxytoolbar.GTPlugin_allypage = {
	
	get_alliance_data: function(docroot) {
		try {
			var rows;
			
			try {
				rows = docroot.getElementById("member-list").getElementsByTagName("tbody")[0].rows;
			} catch(e) {
				// no alliance table found - player is not part of any alliance
				return false;
			}
			
			var ogame_servertime = galaxytoolbar.GTPlugin_general.get_ogame_time(docroot);
			
			var tmp,tmp2,tmp3,tmp5;
			var arr_length = rows.length-1;
			var playername = new Array(arr_length);
			var ogame_playerid = new Array(arr_length);
			var score = new Array(arr_length);
			var ranks = new Array(arr_length);
			var galaxies = new Array(arr_length);
			var systems = new Array(arr_length);
			var planets = new Array(arr_length);
			var activities = new Array(arr_length);
			
			var j = 0;
			
			for(var i = 0; i < rows.length; i++) { 
				try {
					playername[j]	= rows[i].getElementsByTagName("td")[0].innerHTML;
					playername[j]	= galaxytoolbar.GTPlugin_general.trimString(playername[j]);
					
					score[j]	= parseInt(rows[i].getElementsByTagName("td")[3].getAttribute("title").replace(/\D/g,""));
						
					ranks[j]	= parseInt(rows[i].getElementsByTagName("td")[3].getElementsByTagName("a")[0].innerHTML.replace(/\D/g,""));
					
					galaxies[j]		= parseInt(rows[i].getElementsByTagName("td")[4].getElementsByTagName("a")[0].innerHTML.match(/\[(\d+)\:/)[1]);
					systems[j]		= parseInt(rows[i].getElementsByTagName("td")[4].getElementsByTagName("a")[0].innerHTML.match(/\:(\d+)\:/)[1]);
					planets[j]		= parseInt(rows[i].getElementsByTagName("td")[4].getElementsByTagName("a")[0].innerHTML.match(/\:(\d+)\]/)[1]);
					
					tmp = rows[i].getElementsByTagName("td");
					activities[i]	= -1;
					
					// get the activities-td, and check, if it contains activities
					tmp2 = tmp[tmp.length-2].getElementsByTagName("span");
					if (tmp2.length > 0) {
						if (tmp2[0].getAttribute("class") == "middlemark") {
							activities[i] = parseInt(tmp2[0].innerHTML.replace(/\D/g,""));
						} else if (tmp2[0].getAttribute("class") == "undermark") {
							activities[i] = 7;
						}
					} 
					
					// get the last td
					tmp3 = tmp[tmp.length-1].getElementsByTagName("a");
					if (tmp3.length > 0) {
						// get last buttonlink (= send message)
						ogame_playerid[j] = parseInt(tmp3[tmp3.length-1].getAttribute("data-playerid"), 10);
					} else {
						// own player
						ogame_playerid[j] = galaxytoolbar.GTPlugin_general.get_player_id(docroot);
					}
				} catch(error) {
					//alert("error: "+error);
					return false;
				}
				j++;
			}
			
			var alliance_data_xml = '\t<allypage_header name="'+galaxytoolbar.GTPlugin_general.get_ally_name(docroot)+'" allyid="'+galaxytoolbar.GTPlugin_general.get_ally_id(docroot)+'"/>\n';
			for (i = 0; i < playername.length; i++) {
				alliance_data_xml += '\t<player rank="'+ranks[i]+'" playername="'+playername[i]+'" playerid="'+ogame_playerid[i]
									+'" galaxy="'+galaxies[i]+'" system="'+systems[i]
									+'" planet="'+planets[i]+'" score="'+score[i]+'"';
				if (activities[i] > -1 && ogame_servertime != false) {
					tmp5 = galaxytoolbar.GTPlugin_galaxyview.getActivityTime(ogame_servertime,activities[i]);
					alliance_data_xml += '>\n\t\t\t<activity year="'+tmp5[0]+'" month="'+tmp5[1]+
										 '" day="'+tmp5[2]+'" hour="'+tmp5[3]+'" minute="'+tmp5[4]+
										 '" weekday="'+tmp5[5]+'"/>\n';
					alliance_data_xml += '\t</player>\n';
				} else {
					alliance_data_xml += '/>\n';
				}
			}
			
			return alliance_data_xml;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Error in get_alliance_data:"+e,"All Galaxytools");
			return false;
		}
	},
	
	submit_allydata: function(doc) {
		// reset status window content from any previous transmission
		try {
			galaxytoolbar.GTPlugin_general.clear_status(doc);
		} catch(e) {
			//alert("error: "+e);
		}
		
		galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("allypagefound"),"All Galaxytools");
		var tmp = galaxytoolbar.GTPlugin_allypage.get_alliance_data(doc);
		
		if (tmp != false) {
			galaxytoolbar.GTPlugin_general.send(doc,"allyhistory",tmp,doc.URL);
		} else {
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 3, "No data found","All Galaxytools");
		}
	},
	
	submit_allydata_event_handler: function(e,doc) {
			
			var id = e.relatedNode.getAttributeNode("id").value;
			if (id != "eins") {
				return;
			}
			try {
				if (e.target.innerHTML.indexOf('id="member-list"') == -1) {
					// we need at least the member-list
					return;
				}
			} catch(error) {
				return;
			}
			// now we found HTML content that contained the ID
			
			galaxytoolbar.GTPlugin_allypage.submit_allydata(doc);
	}, 
	
	submit_allydata_mutation_handler: function(mutations,doc) {
		mutations.forEach(function(mutation) {
			var nodes = mutation.addedNodes;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1) {
					if (nodes[i].hasAttribute("id"))
						if (nodes[i].getAttribute("id") == "allyMemberlist") {
							galaxytoolbar.GTPlugin_allypage.submit_allydata(doc);
							return;
						}
				}
			}
		});
	}
};