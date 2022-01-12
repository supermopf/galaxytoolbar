"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_galaxyview) galaxytoolbar.GTPlugin_galaxyview={};

galaxytoolbar.GTPlugin_galaxyview = {
	
	get_galaxyview_data: function(docroot,pos) {
		
		this.addEspionageActionListener(docroot);
		var rows;
		
		var moonsize, metal_debris, crystal_debris, playerid, playerstatus, playername;
		var planetname, player_rank, alliance, alliance_rank, alliance_member, alliance_id;
		var position = 0;
		var galaxy_xml = "";
		var planet_activity, moon_activity = -1; // not active = -1
		var url = docroot.location.host;
		var tmp, playerinfo, allyinfo;
		var ogame_servertime = galaxytoolbar.GTPlugin_general.get_ogame_time(docroot);
		var og500 = galaxytoolbar.GTPlugin_general.compare_ogame_version_with(docroot, 5,0,0);
		
		try {
			rows = docroot.getElementById('galaxytable').rows;
		} catch(e) {
			galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Unexpected error: no galaxy table found","All Galaxytools");
			return false;
		}
		
		try {
			for (var i = 2; i < rows.length; i++) {
				if (rows[i].getAttribute("class").indexOf("row") > -1) {
					// reset data
					position = 0;
					moonsize = 0;
					metal_debris = 0;
					crystal_debris = 0;
					playerid = 0;
					playerstatus = "";
					playername = "";
					planetname = "";
					player_rank = 0;
					alliance = "";
					alliance_rank = 0;
					alliance_member = 0;
					alliance_id = 0;
					planet_activity = -1;
					moon_activity = -1;
					playerinfo = null;
					allyinfo = null;
					
					// planet position
					position = i-1;
					// there are max. 15 positions in a system
					if (position > 15)
						break;
					
					if (rows[i].getElementsByClassName("planetname1").length > 0) {
						//no player at this position
						if(galaxy_xml == "") {
							galaxy_xml += '\t<galaxyview galaxy="'+pos[0]+'" system="'+pos[1]+'">\n';
						}
						tmp = this.get_debris(docroot.getElementById("debris"+position));
						metal_debris = tmp[0];
						crystal_debris = tmp[1];
						if (metal_debris > 0 || crystal_debris > 0) {
							galaxy_xml += '\t\t<position pos="'+position+'">\n';
							galaxy_xml += '\t\t\t<debris metal="'+metal_debris+'" crystal="'+crystal_debris+'"/>\n';
							galaxy_xml += '\t\t</position>\n';
						} else {
							galaxy_xml += '\t\t<position pos="'+position+'"/>\n';
						}
						continue;
					}
					
					planetname = docroot.getElementById("planet"+position).getElementsByTagName("span")[0].innerHTML.trim();
					
					// activity
					try {
						// Activity is inside the tooltip
						if (docroot.getElementById("planet"+position) != null) {
							var ll = docroot.getElementById("planet"+position).getElementsByClassName("ListLinks")[0];
							if (ll && ll.getElementsByTagName("li").length > 0 && ll.getElementsByTagName("li")[0].getElementsByTagName("a").length == 0) {
								if (ll.getElementsByTagName("li")[0].getElementsByTagName("img").length > 0) {
									planet_activity = 7;
								} else {
									planet_activity = parseInt(ll.getElementsByTagName("li")[0].innerHTML.replace(/\D/g,""));
								}
							}
							
							if (docroot.getElementById("moon"+position) != null) {
								var ll = docroot.getElementById("moon"+position).getElementsByClassName("ListLinks")[0];
								if (ll && ll.getElementsByTagName("li").length > 0 && ll.getElementsByTagName("li")[0].getElementsByTagName("a").length == 0) {
									if (ll.getElementsByTagName("li")[0].getElementsByTagName("img").length > 0) {
										moon_activity = 7;
									} else {
										moon_activity = parseInt(ll.getElementsByTagName("li")[0].innerHTML.replace(/\D/g,""));
									}
								}
							}
							
							// some validity checks and removal of invalid data
							if (planet_activity > 60 || planet_activity < -1)
								planet_activity = -1;
							
							if (moon_activity > 60 || moon_activity < -1)
								moon_activity = -1;
						}
					} catch (no_error) {
						//nothing to do
					}
					
					// moonsize
					try {
						tmp = rows[i].getElementsByClassName("moon");
						if (tmp[0].getElementsByTagName("a").length > 0) {
							//there must be a moon, if there is a link inside
							tmp = tmp[0].getElementsByTagName("li");
							if (tmp.length >= 3) {
								tmp = tmp[2].getElementsByTagName("span");
								if (tmp.length > 0) {
									moonsize = parseInt(tmp[0].innerHTML.replace(/\D/g,""));
								}
							} else {
								//own moon has only the link
								moonsize = 1;
							}
						} else {
							moonsize = 0;
						}
					} catch (error) {
						// nothing to do
					}
					
					// debris
					tmp = this.get_debris(docroot.getElementById("debris"+position));
					metal_debris = tmp[0];
					crystal_debris = tmp[1];
					
					// playername + id + rank
					playerinfo = rows[i].getElementsByClassName("playername")[0];
					try {
						tmp = playerinfo.getElementsByTagName("a");
						if (tmp.length > 0) {
							tmp = tmp[0].getAttribute("rel"); // rel="#player100446"
							tmp = tmp.replace(/\D/g,"");
							playerid = parseInt(tmp);
						} else {
							playerid = galaxytoolbar.GTPlugin_general.get_player_id(docroot);
						}
						
						if (playerinfo.getElementsByTagName("div").length == 0) {
							//own player
							if (playerid != 99999) {
								
								playername = galaxytoolbar.GTPlugin_general.get_playername(docroot);
								
								if (playername == "")
									playername = docroot.getElementById("playerName").getElementsByTagName("span")[0].innerHTML.trim();
							} else
								playername = "";
						} else {
							// use tooltip
							playername = playerinfo.getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerHTML.trim();
						}
						
						tmp = playerinfo.getElementsByTagName("li");
						if (tmp.length > 0) {
							tmp = playerinfo.getElementsByTagName("li")[0];
							
							if (tmp.getElementsByTagName("a").length > 0) {
								// OGame 3.0.0
								tmp = tmp.getElementsByTagName("a")[0].innerHTML;
							} else {
								// OGame 2.3.x and banned players
								tmp = tmp.innerHTML;
								if(tmp.search('-') > -1) {
									// GA or GO or something like this
									tmp = 0;
								}
							}
							tmp = tmp.replace(/\D/g,"");
							player_rank = parseInt(tmp);
							if (isNaN(player_rank))
								player_rank = 0;
						} else {
							// own player
							player_rank = galaxytoolbar.GTPlugin_general.get_player_rank(docroot);
						}
					} catch(no_error) {
						// no player
					}
					
					// player status - transfer the english letters for them
					tmp = playerinfo.getElementsByClassName("status")[0].getElementsByTagName("span");
					var className;
					for (var j = 0; j < tmp.length; j+=2) {
						className = tmp[j].getAttribute("class");
						if (className.indexOf("vacation") > -1) {
							playerstatus += "v";
						} else
						
						if (className.indexOf("longinactive") > -1) {
							playerstatus += "iI";
							planet_activity = -1;
							moon_activity = -1;
						} else
						if (className.indexOf("inactive") > -1) {
							playerstatus += "i";
							planet_activity = -1;
							moon_activity = -1;
						} else
						
						if (className.indexOf("banned") > -1) {
							playerstatus += "b";
							planet_activity = -1;
							moon_activity = -1;
						} else
						
						if (className.indexOf("strong") > -1) {
							playerstatus += "s";
						} else
						if (className.indexOf("noob") > -1) {
							playerstatus += "n";
						} else
						if (className.indexOf("outlaw") > -1) {
							playerstatus += "o";
						} else
						
						if (className.indexOf("admin") > -1) {
								playerstatus += "A";
						}
						/* don't send this
						if (className.indexOf("honorableTarget") > -1) {
							playerstatus += "hp";
						}*/
					}
					
					// ally tag + id + rank + member
					try {
						allyinfo = rows[i].getElementsByClassName("allytag")[0];
						tmp = allyinfo.getElementsByTagName("span");
						if (tmp.length > 0) {
							alliance = tmp[0].firstChild.nodeValue.trim();
							alliance_id = parseInt(tmp[0].getAttribute("rel").replace(/\D/g,""));
							
							tmp = allyinfo.getElementsByTagName("li")[0];
							
							if (tmp.getElementsByTagName("a").length > 0) {
								tmp = tmp.getElementsByTagName("a")[0].innerHTML.replace(/\D/g,"");
							} else {
								tmp = tmp.innerHTML.replace(/\D/g,"");
							}
							
							alliance_rank = parseInt(tmp);
							alliance_rank = isNaN(alliance_rank) ? 0 : alliance_rank;
							
							tmp = allyinfo.getElementsByTagName("li")[1].innerHTML;
							tmp = tmp.replace(/\D/g,"");
							alliance_member = parseInt(tmp);
						}
					} catch (error) {
						// nothing to do
					}
					
					// some validity checks
					// destroyed planet = planetname only + playerid = 99999
					if ((playername == "" && moonsize > 0 && playerid != 99999) || 
						(playername == "" && playerid > 0 && playerid != 99999) ||
						(playername == "" && alliance != "") ||
						(playername == "" && alliance_member > 0) ||
						(playername == "" && alliance_rank > 0) ||
						// don't send playerid = 0
						(playerid == 0)) { 
						/* ||
						(planetname == "" && moonsize > 0) ||
						(planetname == "" && playerid > 0) ||
						(planetname == "" && playerstatus != "") ||
						(planetname == "" && alliance != "") ||
						(planetname == "" && alliance_member > 0) ||
						(planetname == "" && alliance_rank > 0)) {
						*/
						
						galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Inconsistent data found \n"+
						"(other extensions may change\n" +
						"ogame source code so that no\n"+
						"data can be found or there\n"+
						"is a bug in OGame):\n"+
						"position: '"+position + "'\n" +
						"planetname: '"+planetname + "'\n" +
						"moonsize: '"+moonsize + "'\n" +
						"playername: '"+playername + "'\n" +
						"playerid: '"+playerid + "'\n" +
						"playerstatus: '"+playerstatus + "'\n" +
						"alliance: '"+alliance + "'\n" +
						"alliance member: '"+alliance_member + "'\n" +
						"alliance rank: '"+alliance_rank + "'\n","All Galaxytools", true, '');
						
						// inconsistent data
						return false;
					}
					
					// create new output
					if (galaxy_xml == "") {
						galaxy_xml += '\t<galaxyview galaxy="'+pos[0]+'" system="'+pos[1]+'">\n';
					}
					//create xml for the current position
					//complete entry (empty postion is created in the beginning)
					//playerid = 99999 seems to be a placeholder at ogame, nevertheless check if playername is empty, too
					if (planetname.indexOf('&') > -1) planetname = galaxytoolbar.GTPlugin_messages.htmlDecode(planetname);
					if (playername == "" && playerid == 99999) {
						if (metal_debris > 0 || crystal_debris > 0) {
							galaxy_xml += '\t\t<position pos="'+position+'">\n';
							galaxy_xml += '\t\t\t<debris metal="'+metal_debris+'" crystal="'+crystal_debris+'"/>\n';
							galaxy_xml += '\t\t</position>\n';
						} else {
							galaxy_xml += '\t\t<position pos="'+position+'"/>\n';
						}
					} else if (playername != "") {
						galaxy_xml += '\t\t<position pos="'+position+'">\n';
						if (planetname != "") {
							galaxy_xml += '\t\t\t<planetname>'+planetname+'</planetname>\n';
						}
						if (moonsize != 0) {
							galaxy_xml += '\t\t\t<moon size="'+moonsize+'"/>\n';
						}
						if (metal_debris > 0 || crystal_debris > 0) {
							galaxy_xml += '\t\t\t<debris metal="'+metal_debris+'" crystal="'+crystal_debris+'"/>\n';
						}
						if (playername != "") {
							galaxy_xml += '\t\t\t<player playername="'+playername+'" rank="'+player_rank+'" playerid="'+playerid+'"';
								if (playerstatus != "") {
									galaxy_xml += ' status="'+playerstatus+'"';
								}
							galaxy_xml += '/>\n';
						}
					 	if (alliance != "") {
						 	galaxy_xml += '\t\t\t<alliance allyname="';
						 	galaxy_xml += alliance.indexOf('&') > -1 ? alliance.replace(/&nbsp;/g," ") : alliance;
						 	galaxy_xml += '" allyid="'+alliance_id+'" rank="'+alliance_rank+'" member="'+alliance_member+'"/>\n';
						}
						// Activity
						if (planet_activity > -1 && moon_activity > -1) {
							//  always send the lower activity first
							if (planet_activity <= moon_activity) {
								if (!galaxytoolbar.GTPlugin_storage.caused_activity_self(url,pos[0],pos[1],position,planet_activity)  && ogame_servertime != "Invalid Date" && ogame_servertime != false) {
									tmp = this.getActivityTime(ogame_servertime,planet_activity);
									galaxy_xml += '\t\t\t<activity year="'+tmp[0]+'" month="'+tmp[1]+
												  '" day="'+tmp[2]+'" hour="'+tmp[3]+'" minute="'+tmp[4]+
												  '" weekday="'+tmp[5]+'"/>\n';
								}
								if (!galaxytoolbar.GTPlugin_storage.caused_activity_self(url,pos[0],pos[1],position,moon_activity)  && ogame_servertime != "Invalid Date" && ogame_servertime != false) {
									tmp = this.getActivityTime(ogame_servertime,moon_activity);
									galaxy_xml += '\t\t\t<activity year="'+tmp[0]+'" month="'+tmp[1]+
												  '" day="'+tmp[2]+'" hour="'+tmp[3]+'" minute="'+tmp[4]+
												  '" weekday="'+tmp[5]+'"/>\n';
								}
							} else {
								// otherwise round
								if (!galaxytoolbar.GTPlugin_storage.caused_activity_self(url,pos[0],pos[1],position,moon_activity)  && ogame_servertime != "Invalid Date" && ogame_servertime != false) {
									tmp = this.getActivityTime(ogame_servertime,moon_activity);
									galaxy_xml += '\t\t\t<activity year="'+tmp[0]+'" month="'+tmp[1]+
												  '" day="'+tmp[2]+'" hour="'+tmp[3]+'" minute="'+tmp[4]+
												  '" weekday="'+tmp[5]+'"/>\n';
								}
								if (!galaxytoolbar.GTPlugin_storage.caused_activity_self(url,pos[0],pos[1],position,planet_activity)  && ogame_servertime != "Invalid Date" && ogame_servertime != false) {
									tmp = this.getActivityTime(ogame_servertime,planet_activity);
									galaxy_xml += '\t\t\t<activity year="'+tmp[0]+'" month="'+tmp[1]+
												  '" day="'+tmp[2]+'" hour="'+tmp[3]+'" minute="'+tmp[4]+
												  '" weekday="'+tmp[5]+'"/>\n';
								}
							}
						} else if (planet_activity > -1) {
							if (!galaxytoolbar.GTPlugin_storage.caused_activity_self(url,pos[0],pos[1],position,planet_activity)  && ogame_servertime != "Invalid Date" && ogame_servertime != false) {
									tmp = this.getActivityTime(ogame_servertime,planet_activity);
									galaxy_xml += '\t\t\t<activity year="'+tmp[0]+'" month="'+tmp[1]+
												  '" day="'+tmp[2]+'" hour="'+tmp[3]+'" minute="'+tmp[4]+
												  '" weekday="'+tmp[5]+'"/>\n';
							}
						} else if (moon_activity > -1) {
							if (!galaxytoolbar.GTPlugin_storage.caused_activity_self(url,pos[0],pos[1],position,moon_activity)  && ogame_servertime != "Invalid Date" && ogame_servertime != false) {
								tmp = this.getActivityTime(ogame_servertime,moon_activity);
								galaxy_xml += '\t\t\t<activity year="'+tmp[0]+'" month="'+tmp[1]+
										  '" day="'+tmp[2]+'" hour="'+tmp[3]+'" minute="'+tmp[4]+
											  '" weekday="'+tmp[5]+'"/>\n';
							}
						}
						
						galaxy_xml += '\t\t</position>\n';
					} else {
						galaxy_xml += '\t\t<position pos="'+position+'"/>\n';
					}
				}
			}
			
			galaxy_xml += '\t</galaxyview>\n';
			
			return galaxy_xml;
		} catch(error) {
			// unexpected error
			galaxytoolbar.GTPlugin_general.set_status(docroot, "galaxyplugin"+1 , 0, "Unexpected error: "+error,"All Galaxytools");
			return false;
		}
	},
	
	getGalaxySystem: function(docroot) {
		// get information about what galaxy/system selected
		try {
			if (galaxytoolbar.GTPlugin_general.compare_ogame_version_with(docroot,5,0,0)) {
				var gtable = docroot.getElementById("galaxytable");
				return [parseInt(gtable.getAttribute("data-galaxy")),parseInt(gtable.getAttribute("data-system"))];
			}
			
			var coords;
			if (docroot.getElementById("galaxyContent").getElementsByClassName("ListImage").length > 0) {
				coords = galaxytoolbar.GTPlugin_general.get_coords(docroot.getElementById("galaxyContent").getElementsByClassName("ListImage")[0].getElementsByTagName("span")[0].innerHTML);
				return [parseInt(coords[0]),parseInt(coords[1])];
			}
			if (docroot.getElementsByClassName("planetMoveDefault").length > 0) {
				var onclick = docroot.getElementsByClassName("planetMoveDefault")[0].getAttribute("onclick");
				coords = onclick.match(/galaxy\=(\d+)&system\=(\d+)/);
				return [parseInt(coords[1]),parseInt(coords[2])];
			}
			
			var colonize = docroot.getElementsByClassName("colonize-active");
			for (var i = 0; i < colonize.length; i++) {
				var href = colonize[i].getAttribute("href");
				if (href.indexOf('#') == 0) continue;
				coords = href.match(/galaxy\=(\d+)&system\=(\d+)/);
				return [parseInt(coords[1]),parseInt(coords[2])];
			}
			
			var galaxy = parseInt(docroot.getElementsByName("galaxy")[0].value);
			if (isNaN(galaxy)) {
				return -1;
			}
			
			var system = parseInt(docroot.getElementsByName("system")[0].value);
			if (isNaN(system)) {
				return -1;
			}
			
			return [galaxy,system];
		} catch (e){
			//alert("error ocurred while parsing galaxy/system number:"+e);
			galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("error.gvnotupdated")+e,"All Galaxytools");
			return -1;
		}
	},
	
	get_debris: function(div) {
		var metal_debris = 0;
		var crystal_debris = 0;
		// debris metal + crystal
		if (div != null) {
			try {
				var tmp = div.getElementsByTagName("ul")[1].getElementsByTagName("li")[0].innerHTML; // metal
				
				//some debris-field have 4.500,5 for example; as we expect int-values here, delete everything behind the last ,
				//Taiwan OGame has 4,500 as DF !
				//maybe, we should change this in a later version of Galaxytool to float
				tmp = galaxytoolbar.GTPlugin_general.trimString(tmp);
				tmp = tmp.replace(/,\d$/,"");
				
				tmp = tmp.replace(/\D/g,"");
				
				metal_debris = parseInt(tmp);
			} catch(no_error) {
				metal_debris = 0;
			}
			
			try {
				var tmp = div.getElementsByTagName("ul")[1].getElementsByTagName("li")[1].innerHTML; // crystal
				
				// remove ,5
				tmp = galaxytoolbar.GTPlugin_general.trimString(tmp);
				tmp = tmp.replace(/,\d$/,"");
				
				tmp = tmp.replace(/\D/g,"");
				
				crystal_debris = parseInt(tmp);
			} catch(no_error) {
				crystal_debris = 0;
			}
		}
		return [metal_debris,crystal_debris];
	},
	
	getActivityTime: function(ogametime,minutes) {
		var date_activity = new Date(ogametime.getTime() - minutes*60000);
		var year   = date_activity.getFullYear();
		var month  = date_activity.getMonth()+1; // 0 = January
		var day	= date_activity.getDate();
		var hour   = date_activity.getHours();
		var minute = date_activity.getMinutes();
		var weekday = date_activity.getDay();
		
		return [year,month,day,hour,minute,weekday];
	},
	
	addEspionageActionListener: function(docroot) {	
		try {
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
			
			if (MutationObserver) {
				var observer = new MutationObserver(function(mutations) {  
					mutations.forEach(function(mutation) {
						var lastevent = mutation.addedNodes[0];
						if (lastevent.getAttribute("class") == "success") {
							var tmp = lastevent.innerHTML.match(/\d+:\d+:\d+/)[0].split(':');
							var url = docroot.location.host;
							galaxytoolbar.GTPlugin_storage.insert_espionage_action(url,parseInt(tmp[0]),parseInt(tmp[1]),parseInt(tmp[2]));
						}
				});});
				observer.observe(docroot.getElementById("fleetstatusrow"), { childList: true });
			} else {
				// backward compatibility
				docroot.getElementById("fleetstatusrow").addEventListener("DOMNodeInserted",function(e) {
					var lastevent = docroot.getElementById("fleetstatusrow").getElementsByTagName("div")[0];
					if (lastevent.getAttribute("class") == "success") {
						var tmp = lastevent.innerHTML.match(/\d+:\d+:\d+/)[0].split(':');
						var url = docroot.location.host;
						galaxytoolbar.GTPlugin_storage.insert_espionage_action(url,parseInt(tmp[0]),parseInt(tmp[1]),parseInt(tmp[2]));
					}
				},false);
			}
		} catch(e) {
			// alert(e);	
		}
	},
	
	submit_galaxydata: function(doc) {
		// reset status window content from any previous transmission
		try {
			galaxytoolbar.GTPlugin_general.clear_status(doc);
		} catch(e) {
			//alert("error: "+e);
		}
		
		var pos = this.getGalaxySystem(doc);
		galaxytoolbar.GTPlugin_general.set_status(doc, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("galaxyfound.prefix")+pos[0]+":"+pos[1]+galaxytoolbar.GTPlugin_general.getLocString("galaxyfound.suffix"),"All Galaxytools");
		var tmp = this.get_galaxyview_data(doc,pos);
		
		if (tmp != false) galaxytoolbar.GTPlugin_general.send(doc,"galaxy",tmp,doc.URL,pos);
	},
		
	submit_galaxydata_event_handler: function(ev,doc) {
		try {
			if (ev.target.innerHTML.indexOf('id="galaxyheadbg2"') == -1) {
				// something else was added to the galaxyview, but not the view itself
				return;
			}
		} catch(e) {
			// something else was added to the galaxyview, but not the view itself
			return;
		}
		galaxytoolbar.GTPlugin_galaxyview.submit_galaxydata(doc);
	}, 
	
	submit_galaxydata_mutation_handler: function(mutations,doc) {
		mutations.forEach(function(mutation) {
			var nodes = mutation.addedNodes;
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeType == 1) {
					if (nodes[i].hasAttribute("id"))
						if (nodes[i].getAttribute("id") == "galaxycontent" // new with 6.3
							|| nodes[i].getAttribute("id") == "galaxytable" // 6.0.x
							// OGame 5.2.0
							|| nodes[i].getAttribute("id") == "mobileDiv")
							galaxytoolbar.GTPlugin_galaxyview.submit_galaxydata(doc);
				}
			}
		});
	}
};