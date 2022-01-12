"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_general) galaxytoolbar.GTPlugin_general={};

galaxytoolbar.GTPlugin_general = {
	
	Prefs: null,
	selectedTyp: -1,
	selectedWer: -1,
	selectedRanks: -1,
	debug_mode: false,
	//always use format "major.minor.revision"
	version: "2.8.4",
	tested_with_ogame_version : "6.3.3",
	
	getLocString: function(string) {
		try {
			string = "gt_"+string;
			return chrome.i18n.getMessage(string.replace(/(\w)\.(\w)/g,"$1_$2")).replace(/^\./, '').replace(/\.$/, '');
		} catch(e) {
			alert("unexpected error at getLocString for string: "+string+"\nerror: "+e);
			return "";
		}
	},
	
	get_ui_string: function(string) {
		try {
			return chrome.i18n.getMessage(string);
		} catch(e) {
			alert("unexpected error at getLocString for string: "+string+"\nerror: "+e);
			return "";
		}
	},
	
	getPrefs: {
		prefHasUserValue: function(pref) {
			return localStorage.getItem(pref) !== null;
		},
		
		getBoolPref: function(pref) {
			var res = localStorage.getItem(pref);
			if (res == true || res == "true")
				return true;
			
			return false;
		},
		
		getCharPref: function(pref) {
			return localStorage.getItem(pref);
		},
		
		setBoolPref: function(pref, value) {
			localStorage.setItem(pref, value);
		},
		
		setCharPref: function(pref, value) {
			localStorage.setItem(pref, value);
		}
	},
	
	openOptionsDialog: function(createNewTool,tool_url,token,tool_version_major,tool_version_minor,tool_version_revision) {
		if (createNewTool) {
			window.openDialog("chrome://galaxyplugin/content/galaxyoptions2.xul", "options", "chrome",createNewTool,tool_url,token,tool_version_major,tool_version_minor,tool_version_revision);
		} else {
			var win = this.get_options_window();
			if (win != null) {
				 //we have an already openend gtool-settings-window
				win.focus();
			} else {
				window.openDialog("chrome://galaxyplugin/content/galaxyoptions2.xul", "options", "chrome");
			}
		}
	},
	
	get_options_window: function() {
		var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var enumerator = windowMediator.getEnumerator(null);
		var win = null;
		while(enumerator.hasMoreElements()) {
			win = enumerator.getNext();
			if (win.document.getElementById("GTPlugin-options") != null) return win;
		}
		
		return null; //we have an already openend gtool-settings-window
	},
	
	trimString: function(string) {
		// Return empty if nothing was passed in
		if (!string) return "";
		
		// Efficiently replace any leading or trailing whitespace
		var value = string.replace(/^\s+/, '');
		value = value.replace(/\s+$/, '');
		
		// Replace any multiple whitespace characters with a single space
		value = value.replace(/\s+/g, ' ');
		
		// Return the altered string
		return value;
	},
	
	get_tld: function(url) {
		var tmp = url;
	
		try {
			// remove http:// and www
			tmp = tmp.replace(/http\:\/\//, "");
			tmp = tmp.replace(/https\:\/\//, "");
			tmp = tmp.replace(/www\./, "");
			
			// remove all behind the first /
			var pos = tmp.indexOf("/");
			tmp = tmp.substring(0,pos);
			
			// remove first part in front of . (uni1.ogame.org)
			pos = tmp.indexOf(".");
			tmp = tmp.substring(pos+1);
			
			// remove ogame. and o-game.
			tmp = tmp.replace(/ogame\./, "");
			tmp = tmp.replace(/o\-game\./, "");
			
			return tmp;
		} catch(e) {
			// alert("error at galaxytoolbar.GTPlugin_general.get_language: "+e);
			return false;
		}	
	},
	
	get_language: function(doc) {
		return doc.getElementsByName("ogame-language")[0].content;
	},
	
	get_script_of_page: function(doc) {
		try {
			var scripts = doc.getElementsByTagName("script");
			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i].hasAttribute("src")) continue;
				if (!scripts[i].hasChildNodes()) continue;
				if (scripts[i].childNodes[0] == undefined) continue;
				if (!(scripts[i].childNodes[0].nodeValue.indexOf('var timerHandler') > -1)) continue;
				return scripts[i].innerHTML;
			}
			
			return "";
		} catch(e) {
			return "";
		}
	},
	
	create_status_tab: function(docroot) {
		try {
			var my_div;
			var main_div;
			var my_row;
			var my_td;
			var my_attribute = "";
			var needsExtraCSS = docroot.URL.search("page=techtree&tab=3&open=all") > -1 
								|| docroot.URL.search("page=empire") > -1
								|| docroot.URL.search("page=combatreport") > -1;
			
			// check if we are on techtree or empire view
			try {
				if (needsExtraCSS) {
					
					var missing_styles = docroot.createElement("style");
					missing_styles.setAttribute("type","text/css");
					missing_styles.textContent = "\n"+ 
					".content-box-s .content {\n"+
					"background:url(http://gf3.geo.gfsrv.net/cdnea/bd764e9b39a1a48ad708039fda1bde.gif) repeat-y;\n"+
					"padding:0px 15px;\n"+
					"color:#f1f1f1;\n"+
					"font: 100 12px Verdana, Arial, SunSans-Regular, Sans-Serif;\n"+
					"border: 0 none;\n"+
					"margin: 0;\n"+
					"}\n"+
					
					".content-box-s .header {\n"+
					"background:url(http://gf1.geo.gfsrv.net/cdnfe/b9de2f5b06c823d628d22c4067ee35.gif) no-repeat;\n"+ 
					"height:32px;\n"+
					"font-size:11px;\n"+
					"color:#f1f1f1;\n"+
					"font: 100 11px Verdana, Arial, SunSans-Regular, Sans-Serif;\n"+
					"border: 0 none;\n"+
					"margin: 0;\n"+
					"padding: 0;\n"+
					"width: 222px;\n"+
					"float: none;\n"+
					"}\n"+
					
					".content-box-s .footer {\n"+
					"background:url(http://gf3.geo.gfsrv.net/cdn23/174d5c09f617701fcaf1664a414869.gif) no-repeat;\n"+
					"height:21px;\n"+
					"color:#f1f1f1;\n"+
					"font: 100 11px Verdana, Arial, SunSans-Regular, Sans-Serif;\n"+
					"border: 0 none;\n"+
					"padding: 0;\n"+
					"}\n"+
					
					"div.content-box-s .header h3 {\n"+
					"color:#6F9FC8;\n"+
					"font-size:11px;\n"+
					"font-weight:700;\n"+
					"padding-top:10px;\n"+
					"width:222px;\n"+
					"text-align:center;\n"+
					"background:none;\n"+
					"height:13px;\n"+
					"overflow:visible;\n"+
					"line-height:13px;\n"+
					"}\n"+
					
					"a.close_details {\n"+
					"height:16px;\n"+
					"width:16px;\n"+
					"float: left; \n"+
					"margin-top: 2px; \n"+
					"margin-left: 5px;\n"+
					"}\n"+
					"a.close_details:link,\n"+
					"a.close_details:visited { background:transparent url(http://gf1.geo.gfsrv.net/cdnca/5f463369e91b4c183874c87d673fba.gif) -207px 0px no-repeat;}\n"+
					"a.close_details:hover { background:transparent url(http://gf1.geo.gfsrv.net/cdnca/5f463369e91b4c183874c87d673fba.gif) -207px -17px no-repeat;}\n"+
					"a.close_details:active,\n"+
					"a.close_details:focus {background:transparent url(http://gf1.geo.gfsrv.net/cdnca/5f463369e91b4c183874c87d673fba.gif) -207px 0px no-repeat;}\n"+
					
					".content-box-s .table {\n"+
					"border: 0 none;\n"+
					"}\n"+
					
					".content-box-s .td {\n"+
					"border: 0 none;\n"+
					"padding: 0;\n"+
					"}\n";
					
					docroot.getElementsByTagName("head")[0].appendChild(missing_styles);
				}
			} catch(e) {
				//alert(e);
				// nothing to do
			}
			
			main_div = docroot.createElement("div");
			main_div.setAttribute("class","content-box-s");
			
			try {
				if (galaxytoolbar.GTPlugin_general.Prefs.getBoolPref("gtplugin.settings.show_statuswindow")) {
					// display block must be kept
					my_attribute = "display: block; z-index: 9999;"+galaxytoolbar.GTPlugin_general.Prefs.getCharPref("gtplugin.status_style_window");
				} else {
					my_attribute = "display: none; z-index: 9999;"+galaxytoolbar.GTPlugin_general.Prefs.getCharPref("gtplugin.status_style_window");
				}
			} catch(not_set) {
				// didn't open options dialogue once - default value:
				my_attribute = "display: block;position:fixed;top:10px;left:10px;z-index: 9999;";
			}
			
			main_div.setAttribute("style",my_attribute);
			main_div.setAttribute("id","galaxytool_status");
			
			my_div = docroot.createElement("div");
			my_div.setAttribute("class","header");
			
			var my_link = docroot.createElement("a");
			my_link.setAttribute("class","close_details");
			my_link.setAttribute("style","float: right; margin: 5px;");
			my_link.setAttribute("onclick","document.getElementById('galaxytool_status').style.display = 'none';");
			my_link.setAttribute("href","#");
			my_div.appendChild(my_link);
			
			var my_h3 = docroot.createElement("h3");
			my_h3.setAttribute("style",galaxytoolbar.GTPlugin_general.Prefs.getCharPref("gtplugin.status_style_header"));
			var myText = docroot.createTextNode(galaxytoolbar.GTPlugin_general.getLocString("status_window"));
			my_h3.appendChild(myText);
			my_div.appendChild(my_h3);
			
			// my_div.innerHTML = galaxytoolbar.GTPlugin_general.getLocString("status_window");
			main_div.appendChild(my_div);
			
			my_div = docroot.createElement("div");
			my_div.setAttribute("class","content");
			my_div.setAttribute("style","max-height:200px; max-width: 190px; overflow: auto;");
			main_div.appendChild(my_div);
			
			var my_table = my_div.appendChild(docroot.createElement("table"));
			if (needsExtraCSS) {
				my_table.setAttribute("class","content-box-s table");
			}
			
			// cellpadding + spacing = 0
			my_table.setAttribute("style", "width: 192px;");
			my_table.setAttribute("border","0");
			my_table.setAttribute("cellpadding","0");
			my_table.setAttribute("cellspacing","0");
			my_table.setAttribute("align","center");
			// results for all galaxytools
			var number_of_rows = galaxytoolbar.GTPlugin_storage.get_number_of_tools();
			if (number_of_rows < 1) number_of_rows = 5; // fallback
			for (var i=1; i <= number_of_rows; i++) {
				my_row = my_table.appendChild(docroot.createElement("tr"));
				my_td = my_row.appendChild(docroot.createElement("td"));
				my_td.setAttribute("id","galaxyplugin"+i);
				
				if (needsExtraCSS) {
					my_td.setAttribute("class","td tooltip");
				} else {
					my_td.setAttribute("class","tooltip");
				}
				
				my_td.setAttribute("title","");
				
				my_td.setAttribute("style","text-align:left; display: none; z-index: 9999;"+galaxytoolbar.GTPlugin_general.Prefs.getCharPref("gtplugin.status_style_results"));
				
				var myText = docroot.createTextNode(" ");
				my_td.appendChild(myText);
			}
			
			my_div = docroot.createElement("div");
			my_div.setAttribute("class","footer");
			main_div.appendChild(my_div);
			
			var cn = docroot.body.childNodes;
			
			// workaround for a strange issue: try to insert it as the first element in the body instead of as the last element
			// in order to avoid jumping to the top of a dialog window when clicking on the attack button
			if (cn.length <= 0)
				docroot.body.appendChild(main_div);
			else
				docroot.body.insertBefore(main_div, cn[0]);
			return true;
		} catch(e) {
			// some users had problems with slow Galaxytool servers
			this.log_to_console("Error at create_status_tab: "+e);
			return false;
		}
	},
	
	clear_status: function(docroot) {
		try {
			var tmp = docroot.getElementById("galaxytool_status");
			if (tmp == null) {
				// we did not yet create our status tab, so we have nothing to do
				return;
			}
			var number_of_rows = galaxytoolbar.GTPlugin_storage.get_number_of_tools();
			if (number_of_rows < 1) number_of_rows = 5; // fallback
			for (var i=1; i<=number_of_rows; i++) {
				docroot.getElementById("galaxyplugin"+i).innerHTML = '';
			}
		} catch(error) {
			this.log_to_console("unexpected error at galaxytoolbar.GTPlugin_general.clear_status: "+error);
		}
	},
	
	set_status: function(docroot, html_id , status, text, tool_name, create_pre, pre_style) {
		try {
			var tmp = docroot.getElementById("galaxytool_status");
			var created = tmp != null;
			if (tmp == null) {
				// we did not create our status tab yet
				created = this.create_status_tab(docroot);
				
				if (!created) return false;
			} else {
				// just in case the window was hidden meanwhile
				// check if it should be hidden
				if (galaxytoolbar.GTPlugin_general.Prefs.getBoolPref("gtplugin.settings.show_statuswindow")) {
					docroot.getElementById("galaxytool_status").style.display = "block";
				} else {
					// keep window hidden in case it was no error
					if (status == 3) {
						docroot.getElementById("galaxytool_status").style.display = "block";
					}
				}
			}
			
		} catch(error) {
			this.log_to_console("unexpected error at galaxytoolbar.GTPlugin_general.set_status: "+error);
		}
		
		try {
			var picture = docroot.createElement("img");
			picture.setAttribute("width", "10px");
			picture.setAttribute("height", "10px");
			switch (status) {
				case 0:
					picture = "";
					break;
				case 1:
					picture.setAttribute("src",chrome.extension.getURL("img/green.png"));
					break;
				case 2:
					picture.setAttribute("src",chrome.extension.getURL("img/yellow.png"));
					break;
				case 3:
					picture.setAttribute("src",chrome.extension.getURL("img/red.png"));
					break;
			}
			
			this.set_title(docroot,html_id,tool_name);
			
			if (!this.debug_mode) {
				docroot.getElementById(html_id).innerHTML = "";
			} else {
				docroot.getElementById(html_id).appendChild(docroot.createElement("br"));
			}
			
			if (create_pre) {
				// ignore image!
				var pre = docroot.createElement("pre");
				pre.setAttribute("style",pre_style);
				pre.appendChild(docroot.createTextNode(text));
				docroot.getElementById(html_id).appendChild(pre);
			} else {
				if (picture !== "") {
					docroot.getElementById(html_id).appendChild(picture);
					docroot.getElementById(html_id).appendChild(docroot.createTextNode(" "+text));
				} else {
					docroot.getElementById(html_id).appendChild(docroot.createTextNode(text));
				}
			}
			
			docroot.getElementById(html_id).style.display = "block";
		} catch(e) {
			this.log_to_console("Error at set_status: "+e+" for html_id="+html_id+" and text="+text);
		}
	},
	
	set_title: function(doc,html_id,title) {
		if (doc != null) {
			if (doc.getElementById(html_id) != null) {
				doc.getElementById(html_id).setAttribute("title",title);
			}
		}
	},
	
	submit_galaxytool_version: function(galaxytool_url) {
		var major = 0;
		var minor = 0;
		var revision = 0;
		var version;
		try {
			var param = 'type=validate';
			// new approach to avoid "mixed content" errors when sending from OGame https pages to galaxytool http pages
			// directly from content scripts
			chrome.runtime.sendMessage({
			    method: "POST",
			    action: "xhttp",
			    url: galaxytool_url,
			    mimeType: "text/xml",
			    data: param
			}, function(httpRequest) {
				if (httpRequest.status == 200) {
					try {
						//alert(httpRequest.responseText);
						var response = (new window.DOMParser()).parseFromString(httpRequest.responseText, "text/xml");
					
						version = response.getElementsByTagName("version")[0];
						
						major = parseInt(version.getAttribute("major"));
						
						if (version.hasAttribute("minor")) {
							minor = parseInt(version.getAttribute("minor"));
						}
						
						if (version.hasAttribute("revision")) {
							revision = parseInt(version.getAttribute("revision"));
						}
						
						galaxytoolbar.GTPlugin_storage.update_galaxytool_version(galaxytool_url,major,minor,revision); 	
						return 1;
					} catch(invalid_xml_or_old_tool) {
						//nothing to do
						return 0;
					}
				} else {
					//could not reach the Galaxytool
					return 0;
				}			
			});
			
			//old approach
			/*
			var httpRequest = new XMLHttpRequest();
			httpRequest.open("POST", galaxytool_url, true);
			httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
			httpRequest.overrideMimeType("text/xml");
			httpRequest.onreadystatechange = function () {
				if (httpRequest.readyState == 4) {
					if (httpRequest.status == 200) {
						try {
							//alert(httpRequest.responseText);
							version = httpRequest.responseXML.getElementsByTagName("version")[0];
							
							major = parseInt(version.getAttribute("major"));
							
							if (version.hasAttribute("minor")) {
								minor = parseInt(version.getAttribute("minor"));
							}
							
							if (version.hasAttribute("revision")) {
								revision = parseInt(version.getAttribute("revision"));
							}
							
							galaxytoolbar.GTPlugin_storage.update_galaxytool_version(galaxytool_url,major,minor,revision); 	
							return 1;
						} catch(invalid_xml_or_old_tool) {
							//nothing to do
							return 0;
						}
					} else {
					//could not reach the Galaxytool
					return 0;
					}
				}
			};
			
			httpRequest.send(param);
			*/
		} catch(error) {
			//alert("error while getting galaxytool version: "+error+ " from URL: "+galaxytool_url);
		}
	},
	
	/* Status Codes:
	 * - 200 = generally okay
	 * - 403 = forbidden
	 * - 503 = maintenance mode
	 * Response Text:
	 * - 601: galaxy view inserted
	 * - 602: problem with inserting galaxy view
	 * - 611: report inserted
	 * - 612: at least one report was wrong
	 * - 621: stats updated
	 * - 622: stats not updated
	 * - 631: allyhistory updated
	 * - 632: allyhistory not updated
	 * - 641: Fleet_movement updated
	 * - 642: Fleet_movement not updated
	 * - 651: espionage updated
	 * - 652: espionage not updated
	 * - 661: player message updated
	 * - 662: player message not updated
	 * - 671: short combat report updated
	 * - 672: short combat report not updated
	 * - 700: no content
	 * - 701: wrong universe
	 * - 702: toolbar outdated
	 * - 703: invalid XML 
	 */
	sendData: function(docroot,type,text_xml,content_type_xml,target_url,
			toolnumber,tool_name,universe,tool_version_major,tool_version_minor,tool_version_revision,pos) {
		try {
			var responsetext = "";
			//compatibility with Galaxytool 5.1
			if (!this.compare_versions(tool_version_major,tool_version_minor,tool_version_revision,5,2,0)) {
				if (content_type_xml == "galaxyview") {
					// remove admin status
					text_xml = text_xml.replace(/status="(\w*)A"/g,'status="$1"');
				}
			}
			
			// compatibility with Galaxytool v4.9
			if (!this.compare_versions(tool_version_major,tool_version_minor,tool_version_revision,5,0,0)) {
				// don't send 2 activity tags, but only the first one and don't send outlaw status
				if (content_type_xml == "galaxyview") {
					text_xml = text_xml.replace(/(\t\t\t\<activity.+\/\>\n)\t\t\t\<activity.+\/\>\n/g,"$1").replace(/status="(\w*)o"/g,'status="$1"');
				} else
				// remove number of ships
				if (content_type_xml == "player_highscore" && this.selectedTyp == 3) {
					text_xml = text_xml.replace(/\sships="\d+"/g,"");
				} else
				
				// remove allyid
				if (content_type_xml == "allypage") {
					text_xml = text_xml.replace(/\sallyid="\d+"/g,"");
				}
			}
			
			// compatibility with Galaxytool v4.8 
			if (!this.compare_versions(tool_version_major,tool_version_minor,tool_version_revision,4,9,0)) {
				// don't send new highscores to old Galaxytools - will return error message anyway
				if (content_type_xml == "player_highscore" || content_type_xml == "ally_highscore" ) {
					this.set_title(docroot,"galaxyplugin"+toolnumber,tool_name);
					return;
				}
			}
			//compatibility with Galaxytool v4.7
			if (!this.compare_versions(tool_version_major,tool_version_minor,tool_version_revision,4,8,0)) {
				// remove own playerid from planetinfo
				if (content_type_xml == "planetinfo") {
					text_xml = text_xml.replace(/\splayerid\=\"\d+\"/g,"");
				}
			}
			
			// compatibility with Galaxytool v4.6
			if (!this.compare_versions(tool_version_major,tool_version_minor,tool_version_revision,4,7,0)) {
				//remove activity
				if (content_type_xml == "galaxyview") { 
					text_xml = text_xml.replace(/\t\t\t\<activity.+\/\>\n/g,"");
				} else 
				// remove activity
				if (content_type_xml == "allypage") {
					text_xml = text_xml.replace(/>\n\t\t\t<activity.+\/\>\n\t<\/player>\n/g,"/>\n");
				} else
				//remove msg_id
				if (content_type_xml == "reports") { 
					text_xml = text_xml.replace(/\smsg_id=\"\d+\"/g,"");
				} else
				//don't send fleet_movement
				if (content_type_xml == "fleet_movement") {
					this.set_title(docroot,"galaxyplugin"+toolnumber,tool_name);
					return;
				} else
				//don't send activities
				if (content_type_xml == "espionage" || content_type_xml == "message" || content_type_xml == "combat_report") {
					this.set_title(docroot,"galaxyplugin"+toolnumber,tool_name);
					return;
				}
			}
			
			switch (content_type_xml) {
				case "galaxyview" :
					responsetext = this.getLocString("galaxyupdated.prefix")+pos[0]+":"+pos[1]+this.getLocString("galaxyupdated.suffix");
					break;
				case "reports" :
				case "planetinfo" :
					responsetext = this.getLocString("reportsupdated");
					break;
				case "player_stats" :
					responsetext = galaxytoolbar.GTPlugin_general.getLocString("statsupdated.playerprefix");
					if (this.selectedTyp == 0) responsetext = responsetext + this.getLocString("statsupdated.scoreinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix");
					if (this.selectedTyp == 1) responsetext = responsetext + this.getLocString("statsupdated.fleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix");
					if (this.selectedTyp == 2) responsetext = responsetext + this.getLocString("statsupdated.researchinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix");
					break;
				case "ally_stats" :
					responsetext = galaxytoolbar.GTPlugin_general.getLocString("statsupdated.allyprefix");
					if (this.selectedTyp == 0) responsetext = responsetext + this.getLocString("statsupdated.scoreinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix");
					if (this.selectedTyp == 1) responsetext = responsetext + this.getLocString("statsupdated.fleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix");
					if (this.selectedTyp == 2) responsetext = responsetext + this.getLocString("statsupdated.researchinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix");
					break;
				case "ally_highscore" :
					responsetext = galaxytoolbar.GTPlugin_general.getLocString("statsupdated.allyprefix");
					switch (this.selectedTyp) {
						case 0 : responsetext = responsetext + this.getLocString("statsupdated.scoreinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 1 : responsetext = responsetext + this.getLocString("statsupdated.economyinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 2 : responsetext = responsetext + this.getLocString("statsupdated.researchinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 3 : responsetext = responsetext + this.getLocString("statsupdated.fleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 4 : responsetext = responsetext + this.getLocString("statsupdated.lostfleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 5 : responsetext = responsetext + this.getLocString("statsupdated.builtfleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 6 : responsetext = responsetext + this.getLocString("statsupdated.destroyedfleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 7 : responsetext = responsetext + this.getLocString("statsupdated.honorinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
					}
					break;
				case "player_highscore" :
					responsetext = galaxytoolbar.GTPlugin_general.getLocString("statsupdated.playerprefix");
					switch (this.selectedTyp) {
						case 0 : responsetext = responsetext + this.getLocString("statsupdated.scoreinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 1 : responsetext = responsetext + this.getLocString("statsupdated.economyinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 2 : responsetext = responsetext + this.getLocString("statsupdated.researchinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 3 : responsetext = responsetext + this.getLocString("statsupdated.fleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 4 : responsetext = responsetext + this.getLocString("statsupdated.lostfleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 5 : responsetext = responsetext + this.getLocString("statsupdated.builtfleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 6 : responsetext = responsetext + this.getLocString("statsupdated.destroyedfleetinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
						case 7 : responsetext = responsetext + this.getLocString("statsupdated.honorinfix")+this.selectedRanks+this.getLocString("statsupdated.suffix"); break;
					}
					break;
				case "allypage" :
					responsetext = this.getLocString("allyhistoryupdated");
					break;
				case "fleet_movement" :
					responsetext = this.getLocString("movementupdated");
					break;
				case "espionage" :
					responsetext = this.getLocString("espionageupdated");
					break;
				case "message" :
					responsetext = this.getLocString("pmessageupdated");
					break;
				case "combat_report" :
					responsetext = this.getLocString("shortcrupdated");
					break;
			}
			
			if (this.debug_mode) {
				this.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Target URL:"+target_url,tool_name);
				this.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Data to send:",tool_name);
				this.set_status(docroot, "galaxyplugin"+toolnumber , 0, text_xml,tool_name,true,'color: white; font-size:7pt;');
			}
			
			var params ='type='+content_type_xml+'&content='+encodeURIComponent(text_xml)+"&uni_url="+docroot.location.host;
			
			// new approach to avoid "mixed content" errors when sending from OGame https pages to galaxytool http pages
			// directly from content scripts
			chrome.runtime.sendMessage({
			    method: "POST",
			    action: "xhttp",
			    url: target_url,
			    mimeType: "text/xml",
			    data: params
			}, function(httpRequest) {
				var general = galaxytoolbar.GTPlugin_general;
				
				// error handling
				if (!httpRequest.responseText) {
					if (httpRequest.status == 403) { // forbidden
							general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.permissiondenied"),tool_name);
							return 0;
					} else if (httpRequest.status == 404) { // Server responsed
							general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.pagenotfound"),tool_name);
							return 0;
					} else {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.badstatuscode")+httpRequest.status,tool_name);
						return 0;
					}
					return;
				}
				
				// success handling
				var returncode = 0;
				if (httpRequest.status == 503) {
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.gtmaintenance_mode"),tool_name);
					return 0;
				}
				
				var gtool_result;
				try {
					gtool_result = (new window.DOMParser()).parseFromString(httpRequest.responseText, "text/xml");
					returncode = parseInt(gtool_result.getElementsByTagName("returncode")[0].childNodes[0].nodeValue);
					
					var major = 0;
					var minor = 0;
					var revision = 0;
					var version;
					
					try {
						version = gtool_result.getElementsByTagName("version")[0];
						
						major = parseInt(version.getAttribute("major"));
						
						if (version.hasAttribute("minor")) {
							minor = parseInt(version.getAttribute("minor"));
						}
						
						if (version.hasAttribute("revision")) {
							revision = parseInt(version.getAttribute("revision"));
						}
						
						galaxytoolbar.GTPlugin_storage.update_galaxytool_version(target_url,major,minor,revision);
					} catch(missing_version_tag) {
						//nothing to do
					}
				} catch(error) {
					returncode = 0;
				}
				
				var debug_mode = general.debug_mode; 
				
				if (returncode == 601 || returncode == 611 || returncode == 621 || returncode == 631 
						 || returncode == 641 || returncode == 651 || returncode == 661 || returncode == 671) {
							general.set_status(docroot, "galaxyplugin"+toolnumber , 1, responsetext,tool_name);
							return 1;
				} else
				
				var error_messages = galaxytoolbar.GTPlugin_general.get_messages(gtool_result);
				var first_error_message = galaxytoolbar.GTPlugin_general.get_first_message(gtool_result);
				if (error_messages == "") error_messages = "none";
				
				if (returncode == 602) { // gv not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.gvnotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 612) { // at least 1 report not inserted
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.reporterror"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 622) { // stats not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.statserror"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 632) { // allyhistory not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.allyhistoryerror"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 642) { // fleet movement not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.movementnotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 652) { // espionage not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.espionagenotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 662) { // player message not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.pmessagenotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 672) { // short combat report not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.shortcrnotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 700) { // no content
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, "no content",tool_name);
					return 0;
				} else if (returncode == 701) { // wrong universe
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.wrong_universe"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 702) { // toolbar outdated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.toolbar_outdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 703) { //Invalid XML
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.invalidxml"),tool_name+": "+first_error_message);
					return 0;
				} else {
					general.submit_galaxytool_version(target_url);
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "ResponseText:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, httpRequest.responseText,tool_name);
					}
					if (this.responseText.indexOf("starting to work") > -1) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.tool_outdated"),tool_name);
					} else {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.unknown"),tool_name);
					}
					return 0;
				}
			});
			
			// old approach
			/*
			var httpRequest = new XMLHttpRequest();
			
			httpRequest.onload = function gtool_xml_onsuccess() {
				var general = galaxytoolbar.GTPlugin_general;
				
				var returncode = 0;
				if (httpRequest.status == 503) {
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.gtmaintenance_mode"),tool_name);
					return 0;
				}
				
				var gtool_result;
				try {
					//alert(httpRequest.responseText);
					gtool_result = httpRequest.responseXML;
					returncode = parseInt(gtool_result.getElementsByTagName("returncode")[0].childNodes[0].nodeValue);
					
					var major = 0;
					var minor = 0;
					var revision = 0;
					var version;
					
					try {
						version = gtool_result.getElementsByTagName("version")[0];
						
						major = parseInt(version.getAttribute("major"));
						
						if (version.hasAttribute("minor")) {
							minor = parseInt(version.getAttribute("minor"));
						}
						
						if (version.hasAttribute("revision")) {
							revision = parseInt(version.getAttribute("revision"));
						}
						
						galaxytoolbar.GTPlugin_storage.update_galaxytool_version(target_url,major,minor,revision);
					} catch(missing_version_tag) {
						//nothing to do
					}
				} catch(error) {
					returncode = 0;
				}
				
				var debug_mode = general.debug_mode; 
				
				if (returncode == 601 || returncode == 611 || returncode == 621 || returncode == 631 
						 || returncode == 641 || returncode == 651 || returncode == 661 || returncode == 671) {
							general.set_status(docroot, "galaxyplugin"+toolnumber , 1, responsetext,tool_name);
							return 1;
				} else
				
				var error_messages = galaxytoolbar.GTPlugin_general.get_messages(gtool_result);
				var first_error_message = galaxytoolbar.GTPlugin_general.get_first_message(gtool_result);
				if (error_messages == "") error_messages = "none";
				
				if (returncode == 602) { // gv not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.gvnotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 612) { // at least 1 report not inserted
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.reporterror"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 622) { // stats not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.statserror"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 632) { // allyhistory not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.allyhistoryerror"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 642) { // fleet movement not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.movementnotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 652) { // espionage not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.espionagenotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 662) { // player message not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.pmessagenotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 672) { // short combat report not updated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.shortcrnotupdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 700) { // no content
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, "no content",tool_name);
					return 0;
				} else if (returncode == 701) { // wrong universe
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.wrong_universe"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 702) { // toolbar outdated
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.toolbar_outdated"),tool_name+": "+first_error_message);
					return 0;
				} else if (returncode == 703) { //Invalid XML
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "Details:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, error_messages,tool_name,true,"color: red; font-size:7pt");
					}
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.invalidxml"),tool_name+": "+first_error_message);
					return 0;
				} else {
					general.submit_galaxytool_version(target_url);
					if (debug_mode) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, "ResponseText:",tool_name);
						general.set_status(docroot, "galaxyplugin"+toolnumber , 0, httpRequest.responseText,tool_name);
					}
					if (this.responseText.indexOf("starting to work") > -1) {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.tool_outdated"),tool_name);
					} else {
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.unknown"),tool_name);
					}
					return 0;
				}
			};
			httpRequest.onerror = function gtool_xml_onerror() {
				var general = galaxytoolbar.GTPlugin_general;
				if (httpRequest.status == 403) { // forbidden
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.permissiondenied"),tool_name);
						return 0;
				} else if (httpRequest.status == 404) { // Server responsed
						general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.pagenotfound"),tool_name);
						return 0;
				} else {
					general.set_status(docroot, "galaxyplugin"+toolnumber , 3, general.getLocString("error.badstatuscode")+httpRequest.status,tool_name);
					return 0;
				}
			};
			
			httpRequest.open("POST", target_url, true);
			httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
			httpRequest.overrideMimeType("text/xml");
			httpRequest.send(params);
			*/
		} catch(e) {
			this.set_status(docroot, "galaxyplugin"+toolnumber , 0, this.getLocString("error.gtserveronotfound")+e,tool_name);
			return 0;
		}
		return 0;
		
	},
	
	get_messages: function(xml_doc) {
		if (!xml_doc) return "";
		var output = "";
		try {
			var messages = xml_doc.getElementsByTagName("message");
			var tabs = "";
			
			for (var i = 0; i < messages.length; i++) {
				for (var j = 1; j < parseInt(messages[i].getAttribute("depth")); j++) {
					tabs += "	";
				}
				output += tabs+messages[i].childNodes[0].nodeValue.replace(/\n/g,'\n'+tabs)+"\n";
				tabs = "";
			}
		} catch (no_messages) {
			// nothing to do
		}
		return output;
	},
	
	get_first_message: function(xml_doc) {
		if (!xml_doc) return "";
		try {
			var messages = xml_doc.getElementsByTagName("message");
			
			if (messages.length > 0) {
				return messages[0].childNodes[0].nodeValue.replace(/\n/g," ");
			}
			return "";
		} catch (no_messages) {
			return "";
		}
	},
	
	send: function(docroot,type,text_xml,source_url,misc) {
		var target_url  = "";
		var sent		= false;
		var universe	= 0;
		var tool_version_major   = 0;
		var tool_version_minor   = 0;
		var tool_version_revision = 0;
		var tool_name = "";
		
		var xml_language = this.get_language_for_xml(this.get_language(docroot));
		
		try {
			var current_tool_number = 0;
			var tools = galaxytoolbar.GTPlugin_storage.read_tools_for_ogame_url(source_url);
			
			var content_type;
			var xs_def;
			var xs_def_end;
			
			switch(type) {
				case "galaxy": 
					content_type	= 'galaxyview';
					xs_def			= '<galaxyviews xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="galaxyview.xsd">\n';
					xs_def_end		= '</galaxyviews>';
					break;
				case "queue":
					content_type	= "queue";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "overview":
					content_type	= "overview";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break; 
				case "fleet": 
					content_type	= "planetinfo";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "shipyard": 
					content_type	= "planetinfo";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "buildings": 
					content_type	= "planetinfo";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "defense": 
					content_type	= "planetinfo";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "techs": 
					content_type	= "planetinfo";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "resourceSettings": 
					content_type	= "resourceSettings";
					xs_def			= '<planetinfos xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="planetinfo.xsd">\n';
					xs_def_end		= '</planetinfos>';
					break;
				case "stats": 
					content_type = this.selectedWer == 0 ? "player_stats" : "ally_stats";
					xs_def			= '<stats xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="stats.xsd">\n';
					xs_def_end		= '</stats>';
					break;
				case "highscore" : 
					content_type = this.selectedWer == 0 ? "player_highscore" : "ally_highscore";
					xs_def			= '<stats xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="stats.xsd">\n';
					xs_def_end		= '</stats>';
					break;
				case "allyhistory": 
					content_type	= "allypage";
					xs_def			= '<allypage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="allypage.xsd">\n';
					xs_def_end		= '</allypage>';
					break;
				case "reports":
					content_type	= "reports";
					xs_def			= '<reports xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="reports.xsd">\n';
					xs_def_end		= '</reports>';
					break;
				case "empire":
					content_type	= "reports";
					xs_def			= '<reports xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="reports.xsd">\n';
					xs_def_end		= '</reports>';
					break;
				case "eventList":
					content_type	= "fleet_movement";
					xs_def			= '<fleets xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="fleet_movement.xsd">\n';
					xs_def_end		= '</fleets>';
					break;
				case "phalanx":
					content_type	= "fleet_movement";
					xs_def			= '<fleets xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="fleet_movement.xsd">\n';
					xs_def_end		= '</fleets>';
					break;
				case "espionage": 
					content_type	= "espionage";
					xs_def			= '<espionage_actions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="galaxyview.xsd">\n';
					xs_def_end		= '</espionage_actions>';
					break;
				case "cr":
					content_type	= "combat_report";
					xs_def			= '<combat_reports xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="combat_report.xsd">\n';
					xs_def_end		= '</combat_reports>';
					break;
				case "msg":
					content_type	= "message";
					xs_def			= '<messages xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="message.xsd">\n';
					xs_def_end		= '</messages>';
					break;
				case "auctioneer":
					content_type	= "auctioneer";
					xs_def			= '<auctioneer xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="auctioneer.xsd">\n';
					xs_def_end		= '</auctioneer>';
					break;
				case "full_cr" :
					content_type	= "full_combat_report";
					xs_def			= '<full_combat_reports xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
									  ' xsi:noNamespaceSchemaLocation="full_combat_reports.xsd">\n';
					xs_def_end		= '</full_combat_reports>';
					break;
				default: alert("incorrect content type provided "); return 0;
			}
			
			// change shipyard to fleet
			var s_type = type == "shipyard" ? "fleet" : type; 
			var number_of_rows = galaxytoolbar.GTPlugin_storage.get_number_of_tools();
			if (number_of_rows < 1) number_of_rows = 5; // fallback
			
			for (var i=0; i < tools.length; i++) {
				// check if the information shall be sent or not 
				if (((type == "fleet"			&& tools[i]["submit_fleet"]				== false) ||
					(type == "defense"			&& tools[i]["submit_defense"]			== false) ||
					(type == "buildings"		&& tools[i]["submit_buildings"]			== false) ||
					(type == "techs"			&& tools[i]["submit_research"]			== false) ||
					(type == "galaxy"			&& tools[i]["submit_galaxy"]			== false) ||
					((type == "stats" || type == "highscore")&& tools[i]["submit_stats"]== false) ||
					(type == "reports"			&& tools[i]["submit_reports"]			== false) ||
					(type == "empire"			&& tools[i]["submit_empire"]			== false) ||
					(type == "allyhistory"		&& tools[i]["submit_allypage"]			== false) ||
					(type == "espionage"		&& tools[i]["submit_espionage_action"]  == false) ||
					(type == "cr"				&& tools[i]["submit_short_cr"]			== false) ||
					(type == "msg"				&& tools[i]["submit_player_message"]	== false) ||
					(type == "eventList"		&& 
					 (tools[i]["submit_fmovement"] == false || (misc == true && !tools[i]["is_ogeneral"]))) ||
					(type == "phalanx"			&& tools[i]["submit_phalanx"]			== false) ||
					(type == "shipyard"			&& tools[i]["submit_shipyard"]			== false) ||
					(type == "overview") || (type == "queue") || (type == "full_cr") || (type == "resourceSettings")) &&
					!tools[i]["is_ogeneral"]) {
					
					continue;
				}
				
				var text_xml_a = text_xml;
				if (type == "msg" && !tools[i]["submit_player_message_c"] && !tools[i]["is_ogeneral"]) {
					//don't submit subject, message content, and your own name
					text_xml_a = text_xml.replace(/subject\=\".+\"/g,"").replace(/\t\t<message_content>(.*\n)*.+<\/message_content>\n/g,"").replace(/\t\t\<to playername=\".+\" playerid="\d+"\/\>\n/g,"");
				}
				
				current_tool_number++;	
				
				target_url  = tools[i]["tool_url"];
				
				universe			 = tools[i]["universe"];
				tool_version_major   = tools[i]["tool_version_major"];
				tool_version_minor   = tools[i]["tool_version_minor"];
				tool_version_revision= tools[i]["tool_version_revision"];
				tool_name			 = tools[i]["name"];
				
				//after this, the xml-string is ready to be sent
				var xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
							+xs_def
							+'\t<header version="'+this.version+'" universe="'+tools[i]["universe"]
							+'" debug="'+this.debug_mode+'" language="'+xml_language;
							
				if (tools[i]["tool_token"].match(/[0-9a-f]{32}/i) != null &&
					this.compare_versions(tool_version_major,tool_version_minor,tool_version_revision,4,8,0)) {
					xml +=	'" token="'+tools[i]["tool_token"];
				} else if(!tools[i]["is_ogeneral"]) {
					xml +=		'" username="'+tools[i]["tool_user"] +'" password="'+this.get_MD5(tools[i]["tool_password"]);
				}
				
				xml +=		'" content_type="'+content_type+'"/>\n'
							+text_xml_a
							+xs_def_end; 
				/*Maybe later
				if (tools[i]["is_ogeneral"]) {
					this.ogeneral_send_data(docroot,xml,tools[i]["ogeneral_ip"],tools[i]["ogeneral_port"],tool_name,current_tool_number,number_of_rows);
					sent = true;
					continue;
				}*/
				
				this.sendData(docroot,s_type,xml,content_type,target_url,
								current_tool_number,tool_name,universe,tool_version_major,
								tool_version_minor,tool_version_revision,misc);
				sent = true;
			}
			
			if (!sent) {
				this.set_status(docroot, "galaxyplugin"+1 , 0, galaxytoolbar.GTPlugin_general.getLocString("error.unknownuni"),tool_name);
				return 0;
			}
		} catch(e) {
			this.set_status(docroot, "galaxyplugin"+1 , 3, galaxytoolbar.GTPlugin_general.getLocString("error.gtserveronotfound")+e,tool_name);
			return 0;
		}
		return 1;
	},
	/* Maybe later, if I find a way to do this in Chrome
	ogeneral_send_data: function(doc,xml,ip,PORT,tool_name,toolnumber,number_of_rows) {
		var tn = this.set_is_og(doc,toolnumber,number_of_rows);
		try{
			if (this.debug_mode) {
					this.set_status(doc, "galaxyplugin"+tn , 0, "Sending to OGeneral",tool_name);
					this.set_status(doc, "galaxyplugin"+tn , 0, "Target IP: "+ip,tool_name);
					this.set_status(doc, "galaxyplugin"+tn , 0, "Target Port: "+PORT,tool_name);
					this.set_status(doc, "galaxyplugin"+tn , 0, "Protocol: udp",tool_name);
					this.set_status(doc, "galaxyplugin"+tn , 0, 'Data to send:',tool_name);
					this.set_status(doc, "galaxyplugin"+tn , 0, xml, tool_name, true, "color: white; font-size:7pt;");
			}
			var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
			var transport = transportService.createTransport(["udp"],1,ip,PORT,null);
			var outstream = transport.openOutputStream(0,0,0);
			outstream.write(xml,xml.length);
			outstream.close();
			this.set_status(doc, "galaxyplugin"+tn , 1, "Sent to oGeneral",tool_name);
		} catch(e) {
			this.set_status(doc, "galaxyplugin"+tn , 3, "Error while sending to oGeneral: "+e,tool_name);
		}
	},*/
	
	set_is_og: function(doc,toolnumber,numtools) {
		for (var i=1; i <= numtools; i++) {
			if (doc.getElementById("galaxyplugin"+i).hasAttribute("is_ogeneral")) {
				return i;
			}
		}
		doc.getElementById("galaxyplugin"+toolnumber).setAttribute("is_ogeneral","true");
		return toolnumber;
	},
	
	get_language_for_xml: function(lang_code) {
		switch (lang_code) {
			case "es"		: 
			case "ar"		: return "spanish";
			case "it"		: return "italian";
			case "en"		:
			case "us"		: return "english";
			case "pt"		: return "portugues";
			case "de"		: return "german";
			case "br"		: return "brazilian";
			case "nl"		: return "dutch";
			case "ru"		: return "russian";
			case "hu"		: return "hungarian";
			case "cz"		: return "czech";
			case "gr"		: return "greek";
			case "tr"		: return "turkish";
			case "pl"		: return "polish";
			case "dk"		: return "danish";
			case "fr"		: return "french";
			case "tw"		: return "taiwan";
			case "yu"		: return "balkan";
			case "hr"		: return "croatian";
			case "jp"		: return "japan";
			case "sk"		: return "slovak";
			case "fi"		: return "finnish";
			case "se"		: return "swedish";
			case "si"		: return "slovenian";
			case "ro"		: return "romanian";
			case "mx"		: return "spanish";
			case "no"		: return "norwegian";
			default			: return "english";
		}
	},
	
	get_MD5 : function(string) {
		// md5-function from:
		// http://www.myersdaily.org/joseph/javascript/md5-text.html
		// replaced, because for some users the Mozilla API returned a
		// 36-characters-value for the MD5-Hash (!)
		// when using the function from here:
		// https://developer.mozilla.org/en/nsICryptoHash#Computing_the_Hash_of_a_String
		function md5cycle(x, k) {
			var a = x[0], b = x[1], c = x[2], d = x[3];
			
			a = ff(a, b, c, d, k[0], 7, -680876936);
			d = ff(d, a, b, c, k[1], 12, -389564586);
			c = ff(c, d, a, b, k[2], 17, 606105819);
			b = ff(b, c, d, a, k[3], 22, -1044525330);
			a = ff(a, b, c, d, k[4], 7, -176418897);
			d = ff(d, a, b, c, k[5], 12, 1200080426);
			c = ff(c, d, a, b, k[6], 17, -1473231341);
			b = ff(b, c, d, a, k[7], 22, -45705983);
			a = ff(a, b, c, d, k[8], 7, 1770035416);
			d = ff(d, a, b, c, k[9], 12, -1958414417);
			c = ff(c, d, a, b, k[10], 17, -42063);
			b = ff(b, c, d, a, k[11], 22, -1990404162);
			a = ff(a, b, c, d, k[12], 7, 1804603682);
			d = ff(d, a, b, c, k[13], 12, -40341101);
			c = ff(c, d, a, b, k[14], 17, -1502002290);
			b = ff(b, c, d, a, k[15], 22, 1236535329);
			
			a = gg(a, b, c, d, k[1], 5, -165796510);
			d = gg(d, a, b, c, k[6], 9, -1069501632);
			c = gg(c, d, a, b, k[11], 14, 643717713);
			b = gg(b, c, d, a, k[0], 20, -373897302);
			a = gg(a, b, c, d, k[5], 5, -701558691);
			d = gg(d, a, b, c, k[10], 9, 38016083);
			c = gg(c, d, a, b, k[15], 14, -660478335);
			b = gg(b, c, d, a, k[4], 20, -405537848);
			a = gg(a, b, c, d, k[9], 5, 568446438);
			d = gg(d, a, b, c, k[14], 9, -1019803690);
			c = gg(c, d, a, b, k[3], 14, -187363961);
			b = gg(b, c, d, a, k[8], 20, 1163531501);
			a = gg(a, b, c, d, k[13], 5, -1444681467);
			d = gg(d, a, b, c, k[2], 9, -51403784);
			c = gg(c, d, a, b, k[7], 14, 1735328473);
			b = gg(b, c, d, a, k[12], 20, -1926607734);
			
			a = hh(a, b, c, d, k[5], 4, -378558);
			d = hh(d, a, b, c, k[8], 11, -2022574463);
			c = hh(c, d, a, b, k[11], 16, 1839030562);
			b = hh(b, c, d, a, k[14], 23, -35309556);
			a = hh(a, b, c, d, k[1], 4, -1530992060);
			d = hh(d, a, b, c, k[4], 11, 1272893353);
			c = hh(c, d, a, b, k[7], 16, -155497632);
			b = hh(b, c, d, a, k[10], 23, -1094730640);
			a = hh(a, b, c, d, k[13], 4, 681279174);
			d = hh(d, a, b, c, k[0], 11, -358537222);
			c = hh(c, d, a, b, k[3], 16, -722521979);
			b = hh(b, c, d, a, k[6], 23, 76029189);
			a = hh(a, b, c, d, k[9], 4, -640364487);
			d = hh(d, a, b, c, k[12], 11, -421815835);
			c = hh(c, d, a, b, k[15], 16, 530742520);
			b = hh(b, c, d, a, k[2], 23, -995338651);
			
			a = ii(a, b, c, d, k[0], 6, -198630844);
			d = ii(d, a, b, c, k[7], 10, 1126891415);
			c = ii(c, d, a, b, k[14], 15, -1416354905);
			b = ii(b, c, d, a, k[5], 21, -57434055);
			a = ii(a, b, c, d, k[12], 6, 1700485571);
			d = ii(d, a, b, c, k[3], 10, -1894986606);
			c = ii(c, d, a, b, k[10], 15, -1051523);
			b = ii(b, c, d, a, k[1], 21, -2054922799);
			a = ii(a, b, c, d, k[8], 6, 1873313359);
			d = ii(d, a, b, c, k[15], 10, -30611744);
			c = ii(c, d, a, b, k[6], 15, -1560198380);
			b = ii(b, c, d, a, k[13], 21, 1309151649);
			a = ii(a, b, c, d, k[4], 6, -145523070);
			d = ii(d, a, b, c, k[11], 10, -1120210379);
			c = ii(c, d, a, b, k[2], 15, 718787259);
			b = ii(b, c, d, a, k[9], 21, -343485551);
			
			x[0] = add32(a, x[0]);
			x[1] = add32(b, x[1]);
			x[2] = add32(c, x[2]);
			x[3] = add32(d, x[3]);
			
		}
		
		function cmn(q, a, b, x, s, t) {
			a = add32(add32(a, q), add32(x, t));
			return add32((a << s) | (a >>> (32 - s)), b);
		}
		
		function ff(a, b, c, d, x, s, t) {
			return cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		
		function gg(a, b, c, d, x, s, t) {
			return cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		
		function hh(a, b, c, d, x, s, t) {
			return cmn(b ^ c ^ d, a, b, x, s, t);
		}
		
		function ii(a, b, c, d, x, s, t) {
			return cmn(c ^ (b | (~d)), a, b, x, s, t);
		}
		
		function md51(s) {
			var n = s.length, state = [ 1732584193, -271733879, -1732584194, 271733878 ], i;
			for (i = 64; i <= s.length; i += 64) {
				md5cycle(state, md5blk(s.substring(i - 64, i)));
			}
			s = s.substring(i - 64);
			var tail = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
			for (i = 0; i < s.length; i++)
				tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
			tail[i >> 2] |= 0x80 << ((i % 4) << 3);
			if (i > 55) {
				md5cycle(state, tail);
				for (i = 0; i < 16; i++)
					tail[i] = 0;
			}
			tail[14] = n * 8;
			md5cycle(state, tail);
			return state;
		}
		
		/*
		 * there needs to be support for Unicode here, unless we pretend that we
		 * can redefine the MD-5 algorithm for multi-byte characters (perhaps by
		 * adding every four 16-bit characters and shortening the sum to 32
		 * bits). Otherwise I suggest performing MD-5 as if every character was
		 * two bytes--e.g., 0040 0025 = @%--but then how will an ordinary MD-5
		 * sum be matched? There is no way to standardize text to something like
		 * UTF-8 before transformation; speed cost is utterly prohibitive. The
		 * JavaScript standard itself needs to look at this: it should start
		 * providing access to strings as preformed UTF-8 8-bit unsigned value
		 * arrays.
		 */
		function md5blk(s) { /* I figured global was faster. */
			var md5blks = [], i; /* Andy King said do it this way. */
			for (i = 0; i < 64; i += 4) {
				md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16)
						+ (s.charCodeAt(i + 3) << 24);
			}
			return md5blks;
		}
		
		var hex_chr = '0123456789abcdef'.split('');
		
		function rhex(n) {
			var s = '', j = 0;
			for (; j < 4; j++)
				s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
			return s;
		}
		
		function hex(x) {
			for ( var i = 0; i < x.length; i++)
				x[i] = rhex(x[i]);
			return x.join('');
		}
		
		function md5(s) {
			return hex(md51(s));
		}
		
		/*
		 * this function is much faster, so if possible we use it. Some IEs are
		 * the only ones I know of that need the idiotic second function,
		 * generated by an if clause.
		 */

		function add32(a, b) {
			return (a + b) & 0xFFFFFFFF;
		}
		
		// utf8_encode from: http://phpjs.org/functions/utf8_encode:577
		function utf8_encode(argString) {
			var utftext = "";
			var start, end;
			var stringl = 0;
			start = end = 0;
			stringl = string.length;
			for ( var n = 0; n < stringl; n++) {
				var c1 = string.charCodeAt(n);
				var enc = null;
				
				if (c1 < 128) {
					end++;
				} else if (c1 > 127 && c1 < 2048) {
					enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
				} else {
					enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128)
							+ String.fromCharCode((c1 & 63) | 128);
				}
				
				if (enc !== null) {
					if (end > start) {
						utftext += string.substring(start, end);
					}
					utftext += enc;
					start = end = n + 1;
				}
			}
			
			if (end > start) {
				utftext += string.substring(start, string.length);
			}
			
			return utftext;
		}
		
		/*
		 * // we use it in Firefox, so it should not be necessary to use this
		 * function:
		 * 
		 * if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') { function
		 * add32(x, y) { var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) +
		 * (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xFFFF); } }
		 */

		return md5(utf8_encode(string));
	},
	
	/**
	 * returns: if version (first three values) is greater than or equal to version2
	 */
	compare_versions: function(major,minor,revision,major2,minor2,revision2) {
		return (major > major2) || 
				((major == major2) && (minor > minor2)) || 
				((major == major2) && (minor == minor2) && (revision >= revision2));
	},
	
	compare_ogame_version_with: function(doc,maj,min,rev) {
		var ogv = this.get_ogame_version(doc);
		return this.compare_versions(ogv[0],ogv[1],ogv[2],maj,min,rev);
	},
	
	/**
	 * taken from here:
	 * http://userscripts.org/scripts/version/118453/511690.user.js
	 * and adjusted to own needs
	 * 
	 * OGameVersion Check will be necessary as of OGame 5.0.0
	 */
	// Call oGameVersionCheck(scriptName, testedOgameVersion, scriptUrl) at the beginning of your script - document.readyState must be 'interactive' or 'complete'
	// scriptName: name of your script / addon
	// testedOgameVersion: current Ogame version , e.g 5.1.0
	// scriptUrl: URL to your script page, e.g on userscripts.org 
	// For more details see http://board.origin.ogame.de/board6-origin/board38-tools-scripts-skins/4321-ogame-version-check-for-tools-scripts/
	oGameVersionCheck : function(doc, scriptName, scriptUrl) {
		var testedOgameVersion = this.tested_with_ogame_version;
		// default check false means script is not tested yet
		// default language for ogame.org
		var coms = {
				ae: {domain: 'AE.OGAME.ORG',	text: 'Scripts'		},
				ar: {domain: 'OGAME.COM.AR',	text: 'Scripts'		},
				ba: {domain: 'BA.OGAME.ORG',	text: 'Skripte'		},
				br: {domain: 'OGAME.COM.BR',	text: 'Scripts'		},
				cz: {domain: 'OGAME.CZ',		text: 'Skripty'		},
				de: {domain: 'OGAME.DE',		text: 'Scripts'		},
				dk: {domain: 'OGAME.DK',		text: 'Scripts'		},
				es: {domain: 'OGAME.COM.ES',	text: 'Scripts'		},
				fi: {domain: 'FI.OGAME.ORG',	text: 'Scripts'		},
				fr: {domain: 'OGAME.FR',		text: 'Scripts'		},
				gr: {domain: 'OGAME.GR',		text: 'Σενάρια'		},
				hr: {domain: 'HR.OGAME.ORG',	text: 'Skripte'		},
				hu: {domain: 'OGAME.HU',		text: 'Szkriptek'	},
				it: {domain: 'OGAME.IT',		text: 'Script'		},
				jp: {domain: 'OGAME.JP',		text: 'スクリプト'		},
				mx: {domain: 'MX.OGAME.ORG',	text: 'Scripts'		},
				nl: {domain: 'OGAME.NL',		text: 'Scripts'		},
				no: {domain: 'OGAME.NO',		text: 'Skript'		},
				pl: {domain: 'OGAME.PL',		text: 'Skrypty'		},
				pt: {domain: 'OGAME.COM.PT',	text: 'Scripts'		},
				ro: {domain: 'OGAME.RO',		text: 'Scripturi'	},
				ru: {domain: 'OGAME.RU',		text: 'сценарии'	},
				se: {domain: 'OGAME.SE',		text: 'Skript'		},
				si: {domain: 'OGAME.SI',		text: 'Skripti'		},
				sk: {domain: 'OGAME.SK',		text: 'Skripty'		},
				tr: {domain: 'TR.OGAME.ORG',	text: 'Scriptler'	},
				tw: {domain: 'OGAME.TW',		text: '脚本'		},
				us: {domain: 'OGAME.US',		text: 'Scripts'		},
				// MUST stay at the end to avoid matching on AR FI .....
				org:{domain: 'OGAME.ORG',		text: 'Scripts'		}
		};
	
		var domain							= doc.location.hostname.toUpperCase(),
			server							= '',
			titleText						= '';
			
		for (var c in coms) {
			if ((coms[c].domain !== '') && (domain.indexOf(coms[c].domain) > -1)) {
				server						= c;
				titleText					= coms[c].text;
				break;
			}
		}
		// return immediately if site is not from ogame
		if (! server) { return false; }

		// get list (ul) for menubuttons left
		var MenuTableTools = doc.getElementById('menuTableTools');
		
		if (MenuTableTools) {	
		
			var Data = doc.getElementById('oGameVersionCheckData');
		
			if (! Data) {
				
				var ListElement = doc.createElement('li');
				
				var div = doc.createElement('div');
				div.setAttribute("id","oGameVersionCheckData");
				div.setAttribute("style","display: none;");
				ListElement.appendChild(div);
				
				var a = doc.createElement("a");
				a.setAttribute("id","oGameVersionCheckMenuButton");
				a.setAttribute("href","javascript:void(0)");
				a.setAttribute("class","menubutton");
				
				var span = doc.createElement("span");
				span.setAttribute("class","textlabel");
				span.textContent = titleText;
				
				a.appendChild(span);
				
				ListElement.appendChild(a);

				// append new list entry on first place into toolbutton list
				if (MenuTableTools.childNodes.length) {
					MenuTableTools.insertBefore( ListElement, MenuTableTools.childNodes[0]);
				}
				else {
					MenuTableTools.appendChild(ListElement);
				}
				
				Data						= doc.getElementById('oGameVersionCheckData');
				Data.parentNode.addEventListener('click', showTools, false);
			}

			if (Data) {
				
				var ogameVersion					= doc.getElementsByName('ogame-version');
				ogameVersion						= (ogameVersion && ogameVersion.length) ? ogameVersion[0].content : '9.9.9';
					
				// compare versions
				var versionCheck					= (getVersion( testedOgameVersion ) >= getVersion( ogameVersion ));
				
				// save current script data in html
				var ScriptData						= doc.createElement('span');
				ScriptData.style.display			= 'none';
				
				var span = doc.createElement("span");
				span.textContent = scriptName;
				ScriptData.appendChild(span);
				
				span = doc.createElement("span");
				span.textContent = testedOgameVersion;
				ScriptData.appendChild(span);
				
				span = doc.createElement("span");
				span.textContent = scriptUrl;
				ScriptData.appendChild(span);
				
				span = doc.createElement("span");
				span.textContent = versionCheck;
				ScriptData.appendChild(span);
				
				Data.appendChild(ScriptData);
				
				var MenuButton						= doc.getElementById('oGameVersionCheckMenuButton');
				
				// color red of menu button text if one script is not compatible
				if (MenuButton && ! versionCheck) {
					// Use higher number to avoid always orange button
					var count						= 11;
					
					if (localStorage) {
						var value					= localStorage.getItem('OGameVersionCheck') || '';
						count						= parseInt( value.split('|')[1], 10) || 0;
						// Reset count when new Ogame version
						if ( value.split('|')[0] != ogameVersion ) { count = 0; }
					}
					
					if ( count < 11 && MenuButton.style.color != '#FF4B00') {
						if (localStorage)			{ localStorage.setItem('OGameVersionCheck', ogameVersion + '|' + (++count) ); }
						MenuButton.style.color = '#FF4B00';
					}
				}
			}
		}
		
		// OK 3.00 - Parse version strings into integer (zb.: 4.1.3 --> 04010300)
		function getVersion(version) {
			// parse ogame-version into integer (zb.: 4.1.3 --> 04010300)
			var temp						= /(\d+)\D*(\d*)\D*(\d*)\D*(\d*)/.exec( (version) ? version.toString() : '' );
			return (temp) ? parseInt(('00' + temp[1]).slice(-2) + ('00' + temp[2]).slice(-2) + ('00' + temp[3]).slice(-2) + ('00' + temp[4]).slice(-2), 10) : 0;
		}
		
		function showTools() {
			
			var ContentWrapper				= doc.getElementById('contentWrapper');
			if (ContentWrapper) {
				
				var Inhalt					= doc.getElementById('inhalt'),
					Container				= doc.getElementById('oGameVersionCheck');
					
				if (Inhalt)					{ Inhalt.style.display						= (Container) ? 'block' : 'none'; }	
					
				if (Container) {
					ContentWrapper.removeChild( Container );
				}
				else {
				
					Container				= doc.createElement('div');
					Container.id			= 'oGameVersionCheck';
				
					if (ContentWrapper.childNodes.length) {
						ContentWrapper.insertBefore( Container, ContentWrapper.childNodes[0] );
					}
					else {
						ContentWrapper.appendChild( Container );
					}	
					
					/*
					 * create Header
					 */
					
					var header = doc.createElement("div");
					header.setAttribute("style","background: url('http://gf1.geo.gfsrv.net/cdn63/10e31cd5234445e4084558ea3506ea.gif') no-repeat scroll 0px 0px transparent; height: 28px; margin-top: 8px; position: relative; text-align: center;");
					
					var div2 = doc.createElement("div");
					div2.setAttribute("style","font: 700 12px/23px Verdana,Arial,Helvetica,sans-serif; color: rgb(111, 159, 200); padding-top: 3px;");
					div2.textContent = titleText;
					
					header.appendChild(div2);
					
					doc.getElementById('oGameVersionCheck').appendChild(header);
					
					var innerContent = doc.createElement("div");
					innerContent.setAttribute("style","background: url('http://gf1.geo.gfsrv.net/cdn9e/4f73643e86a952be4aed7fdd61805a.gif') repeat-y scroll 5px 0px transparent; color: rgb(132, 132, 132); margin: 0px; padding: 17px 0px 10px; width: 100%; text-align: center;");
					
					
					/**
					 * create actual content
					 */
					for (var i = 0; i < Data.childNodes.length; i++) {
						var p = doc.createElement("p");
						p.setAttribute("style",'padding: 3px 0px; color: ' + ( (Data.childNodes[i].childNodes[3].innerHTML == 'true') ? 'green' : '#FF4B00' ));
						
						p.appendChild(doc.createTextNode(Data.childNodes[i].childNodes[0].textContent));
						
						p.appendChild(doc.createTextNode(" ( "));
						
						var a = doc.createElement("a");
						a.setAttribute("href",Data.childNodes[i].childNodes[2].textContent);
						a.setAttribute("style","text-decoration: none;");
						a.setAttribute("target","_blank");
						a.textContent = "link";
						
						p.appendChild(a);
						
						p.appendChild(doc.createTextNode(" )"));
						
						innerContent.appendChild(p);
					}
					
					doc.getElementById('oGameVersionCheck').appendChild(innerContent);
					
					/**
					 * Footer
					 */
					var footer = doc.createElement("div");
					footer.setAttribute("style","background: url('http://gf1.geo.gfsrv.net/cdn30/aa3e8edec0a2681915b3c9c6795e6f.gif') no-repeat scroll 2px 0px transparent; height: 17px;");
					doc.getElementById('oGameVersionCheck').appendChild(footer);
				}
			}
		}
	},
	
	update_check: function() {
		// check if update is needed
		var old_version;
		try {
			old_version = this.Prefs.getCharPref("gtplugin.settings.version");
		} catch(pref_not_found) {
			//was not installed yet
			this.Prefs.setCharPref("gtplugin.settings.version", this.version);
			return;
		}
		
		if (this.version != old_version) {
			// check, if we have to set default values
			if (old_version == null) {
				this.Prefs.setBoolPref("gtplugin.settings.debug", false); // set a pref
				this.Prefs.setBoolPref("gtplugin.settings.show_statuswindow", true);
				
				// Status window
				this.Prefs.setCharPref("gtplugin.status_style_window", "position:fixed;top:10px;left:10px;z-index: 9999;");
				this.Prefs.setCharPref("gtplugin.status_style_window_iframe", "position:fixed;top:20px;right:25px;z-index: 9999;");
				this.Prefs.setCharPref("gtplugin.status_style_header", "font-weight:bold;");
				this.Prefs.setCharPref("gtplugin.status_style_results", "color:white;");
				galaxytoolbar.GTPlugin_general.Prefs.setCharPref("gtplugin.settings.version", this.version);
				return;
			}
			
			old_version = old_version.split(".");
			
			for (var i = 0; i < 3-old_version.length; i++)
				old_version.push(0);
			
			old_version = old_version.map(function(n) {return parseInt(n,10);});
			
			if (!galaxytoolbar.GTPlugin_general.compare_versions(old_version[0],old_version[1],old_version[2],2,6,25)) {
				// make sure, that all tools have valid server names, since we do not update them with every page call from now on
				galaxytoolbar.GTPlugin_storage.reload_all_universe_names();
			}
			
			galaxytoolbar.GTPlugin_general.Prefs.setCharPref("gtplugin.settings.version", this.version);
		}
	},
	
	receive_player_id: function(session,url) {
		var loc = url.substring(0,url.indexOf('?'));
		loc = loc+'?page=buddies&session='+session+"&action=12";
		var httpRequest = new XMLHttpRequest();
		httpRequest.open("GET", loc, true);
		httpRequest.onreadystatechange = function (aEvt) {
			if (httpRequest.readyState == 4) {
				if (httpRequest.status == 200) {
					var id = httpRequest.responseText.match(/refId\=\d+.(\d+)/i);
					if (id.length > 1) {
						id = parseInt(id[1]);
						galaxytoolbar.GTPlugin_general.set_player_id(session,id);
					}
					return 1;
				} else {
					return 0;
				}
			}
		};
		httpRequest.send(null);
	},
	
	get_ogame_session: function(doc) {
		var session = "";
		try {
			session = doc.getElementsByName("ogame-session")[0].getAttribute("content");
		} catch(e) {
			session = doc.URL.match(/session\=(\w+)/)[1];
		}
		
		return session;
	},
	
	
	get_ogame_version: function(doc) {
		try {
			var v = doc.getElementsByName("ogame-version")[0].getAttribute("content").split('.');
			// fill the array, until we have 3 numbers in it
			for (var i = 0; i < 3-v.length; i++)
				v.push(0);
			
			return v.map(function(n) {return parseInt(n,10);});
		} catch (e) {
			try {
				return doc.getElementById("siteFooter").getElementsByTagName("a")[0].innerHTML.trim().split('.').map(function(n) {return parseInt(n,10);});
			} catch(no_version) {
				return [0,0,0];
			}
		}
	},
	
	get_ogame_time: function(doc) {
		try {
			var clock;
			if (!this.compare_ogame_version_with(doc,5,0,0))
				clock = doc.getElementById("OGameClock");
			else
				clock = doc.getElementsByClassName("OGameClock")[0];
			
			var day_month_year = galaxytoolbar.GTPlugin_general.trimString(clock.childNodes[0].nodeValue);
			// 17:22:42
			var hours_minutes_seconds = clock.getElementsByTagName("span")[0].innerHTML.trim();
			
			var tmp1 = day_month_year.split('.',3);
			var tmp2 = hours_minutes_seconds.split(':',3);
			
			return new Date(parseInt(tmp1[2],10),parseInt(tmp1[1],10)-1,parseInt(tmp1[0],10),parseInt(tmp2[0],10),parseInt(tmp2[1],10),parseInt(tmp2[2],10));
		} catch(e) {
			return false;
		}
	},
	
	get_tzd: function(host) {
		var tzd = parseInt(localStorage.getItem("galaxytool_timezone_difference"));
		
		if (isNaN(tzd))
			tzd = 0;
		
		return tzd;
	},
	
	get_playername: function(doc) {
		try {
			return doc.getElementsByName("ogame-player-name")[0].getAttribute("content");
		} catch(e) {
			this.log_to_console("Could not find out Player Name on "+doc.URL+" because of the following error: "+e);
			return "";
		}
	},
	
	get_player_id: function(doc) {
		try {
			return doc.getElementsByName("ogame-player-id")[0].getAttribute("content");
		} catch(e) {
			this.log_to_console("Could not find out Player ID on "+doc.URL+" because of the following error: "+e);
			return 0;
		}
	},
	
	get_player_rank: function(doc) {
		var tmp = doc.getElementById("bar").getElementsByTagName("li");
		for (var l = 0; l < tmp.length; l++) {
			if (tmp[l].getElementsByTagName("a").length > 0)
				if (tmp[l].getElementsByTagName("a")[0].hasAttribute("href"))
					if (tmp[l].getElementsByTagName("a")[0].getAttribute("href").indexOf("page=statistics") > -1 || 
						tmp[l].getElementsByTagName("a")[0].getAttribute("href").indexOf("page=highscore") > -1) {
							if (tmp[l].innerHTML.indexOf("(") > -1 ) {
								return parseInt(tmp[l].innerHTML.match(/\((\d+)\)/)[1].replace(/\D/g,""));
							}
						}
		}
		
		return 0;
	},
	
	get_ally_name: function(doc) {
		try {
			return doc.getElementsByName("ogame-alliance-tag")[0].getAttribute("content");
		} catch(e) {
			this.log_to_console("Could not find out Alliance name on "+doc.URL+" because of the following error: "+e);
			return "";
		}
	},
		
	get_ally_id: function(doc) {
		try {
			return doc.getElementsByName("ogame-alliance-id")[0].getAttribute("content");
		} catch(e) {
			this.log_to_console("Could not find out Alliance ID on "+doc.URL+" because of the following error: "+e);
			return 0;
		}
	},
	
	replace_unhandable_chars: function(string) {
		return string.replace(/\|/g,"");
	},
	
	get_coords: function(string) {
		try {
			var tmp = string.trim();
			return tmp.slice(1,tmp.length-1).split(':');
		} catch(e) {
			alert("error in get_coords: "+e);
		}
	},
	
	get_filename: function(url_or_relativ_url) {
		if (url_or_relativ_url.indexOf("/") > -1) {
			return url_or_relativ_url.slice(url_or_relativ_url.lastIndexOf('/')+1,url_or_relativ_url.lastIndexOf('.'));
		} else {
			return url_or_relativ_url;
		}
	},
	
	log_to_console: function(text) {
		try {
			console.log(text);
			
		} catch(error) {
			alert("log to console: "+error);
		}
	},
	
	HTMLParser: function (aHTMLString){
		var html = document.implementation.createHTMLDocument ("");
		html.body.innerHTML = aHTMLString;
		return html;
	}
};