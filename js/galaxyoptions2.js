"use strict";
if(!galaxytoolbar) var galaxytoolbar={};
if(!galaxytoolbar.GTPlugin_options2) galaxytoolbar.GTPlugin_options2={};

galaxytoolbar.GTPlugin_options2={
	// new functions for new galaxytool options layout
	selected_tool: null,
	tools:		new Array(),
	do_not_set_fields : false,
	listeners: new Array(),
	old_inhalt: null,
	request_id : 0,
	
	toggleOptions: function(doc) {
		var inhalt = doc.getElementById("inhalt");
		if (!inhalt) {
			inhalt = doc.getElementById("buttonz"); // message page in OGame V6
		}
		
		if (doc.getElementById("GTPlugin-options-window") == null) {
			this.old_inhalt = inhalt;
			var og500 = galaxytoolbar.GTPlugin_general.compare_ogame_version_with(doc, 5,0,0);
			var myinhalt = doc.createElement("div");
		
			myinhalt.setAttribute("id",'inhalt');
			
			
			var string = '';
			string += this.open_Elem("div","GTPlugin-options-window");
				string += this.open_Elem("div","","galaxytoolbar_content");
					string += this.open_Elem("div","","galaxytoolbar_header");
						string += this.open_Elem("h4");
						string += galaxytoolbar.GTPlugin_general.get_ui_string("toolbar_options_t");
						string += this.close_Elem("h4");
					string += this.close_Elem("div");
					
					if (!og500) {
						string += this.createInput("button","GTPlugin-savebtn","button188","click",galaxytoolbar.GTPlugin_options2.saveValues,"OK","margin: auto;");
					} else {
						string += this.open_Elem("div","","textCenter");
							string += this.createInput("button","GTPlugin-savebtn","btn_blue","click",galaxytoolbar.GTPlugin_options2.saveValues,"OK");
						string += this.close_Elem("div");
					}
						
					string += this.open_Elem("div", "", "wrap ui-tabs-panel", "display: block;");
						string += this.open_Elem("div","","galaxytoolbar_section");
							string += this.open_Elem("h3");
							string += '<a href="javascript:void(0);" rel="galaxytoolbar_statuswindow" onclick="galaxytoolbarManageTabs(\'galaxytoolbar_link1\');" class="opened" id="galaxytoolbar_link1"><span>'+galaxytoolbar.GTPlugin_general.get_ui_string("dialog_tab2")+'</span></a>';
							string += this.close_Elem("h3");
						string += this.close_Elem("div");
						string += this.open_Elem("div", "galaxytoolbar_statuswindow", "sectioncontent", "display: block;");
							string += this.open_Elem("h2");
							string += galaxytoolbar.GTPlugin_general.get_ui_string("dialog_status_window");
							string += this.close_Elem("h2");
							string += this.open_Elem("h3");
							string += galaxytoolbar.GTPlugin_general.get_ui_string("dialog_status_style");
							string += this.close_Elem("h3");
							string += this.open_Elem("div", "", "group bborder", "display: block;");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_status_style_window");
									string += this.createInput("text", "GTPlugin-status_style_window", "galaxytoolbar_textInput");
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_status_style_window"," - iframe");
									string += this.createInput("text", "GTPlugin-status_style_window_iframe", "galaxytoolbar_textInput");
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_status_style_header");
									string += this.createInput("text", "GTPlugin-status_style_header", "galaxytoolbar_textInput");
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_status_style_results");
									string += this.createInput("text", "GTPlugin-status_style_results", "galaxytoolbar_textInput");
								string += this.close_Elem("div");
							string += this.close_Elem("div");
							string += this.open_Elem("h3");
							string += galaxytoolbar.GTPlugin_general.get_ui_string("dialog_general_data");
							string += this.close_Elem("h3");
							string += this.open_Elem("div", "", "group bborder", "display: block;");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_show_statuswindow");
									string += this.createInput("checkbox", "GTPlugin-show_statuswindow");
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_debug");
									string += this.createInput("checkbox", "GTPlugin-debug");
								string += this.close_Elem("div");
							string += this.close_Elem("div");
						string += this.close_Elem("div");
						string += this.open_Elem("div","","galaxytoolbar_section");
							string += this.open_Elem("h3");
							string += '<a href="javascript:void(0);" rel="galaxytoolbar_tools" onclick="galaxytoolbarManageTabs(\'galaxytoolbar_link2\');" class="closed" id="galaxytoolbar_link2"><span>'+galaxytoolbar.GTPlugin_general.get_ui_string("dialog_tab1")+'</span></a>';
							string += this.close_Elem("h3");
						string += this.close_Elem("div");
						string += this.open_Elem("div", "galaxytoolbar_tools", "sectioncontent", "display: none;");
							string += this.open_Elem("div","","fieldwrapper","margin:0px auto 0px;");
								string += '<select class="galaxytoolbar_pulldown" id="GTPlugin-tool_list" style="visibility: visible;"></select>';
								if (!og500) {
									string += this.createInput("button","GTPlugin-addbtn","button188","click",galaxytoolbar.GTPlugin_options2.add_new_tool,galaxytoolbar.GTPlugin_general.get_ui_string("dialog_add_tool"),"display:inline; margin-left: 5px;");
									string += this.createInput("button","GTPlugin-delbtn","galaxytoolbar_button","click",galaxytoolbar.GTPlugin_options2.delete_tool,galaxytoolbar.GTPlugin_general.get_ui_string("dialog_delete"));
								} else {
									string += this.createInput("button","GTPlugin-addbtn","btn_blue","click",galaxytoolbar.GTPlugin_options2.add_new_tool,galaxytoolbar.GTPlugin_general.get_ui_string("dialog_add_tool"),"margin-left: 5px;");
									string += this.createInput("button","GTPlugin-delbtn","btn_blue","click",galaxytoolbar.GTPlugin_options2.delete_tool,galaxytoolbar.GTPlugin_general.get_ui_string("dialog_delete"));
								}
							string += this.close_Elem("div");
							string += this.open_Elem("h3","GTPlugin-caption");
							//string += New Tool;
							string += this.close_Elem("h3");
							string += this.open_Elem("div", "", "group bborder", "display: block;");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_name");
									string += this.createInput("text","GTPlugin-name","galaxytoolbar_textInput","change", galaxytoolbar.GTPlugin_options2.on_name_changed);
									string += this.open_Elem("span","GTPlugin-resultimg","","");
									string += this.close_Elem("span");
									string += this.open_Elem("span","","","display:none");
										string += this.createInput("checkbox", "GTPlugin-isogeneral", "galaxytoolbar_textInput"); // no event
										string += this.createLabel("","oGeneral (udp)");
									string += this.close_Elem("span");
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper","display:none");
									string += this.createLabel("dialog_ogameurl");
									string += this.createInput("text","GTPlugin-ogameurl","galaxytoolbar_textInput"); //no event here, because isn't dsplayed anyway
									string += this.createLabel("dialog_ogameuni");
									string += this.createLabel("","","GTPlugin-uni");
								string += this.close_Elem("div");
								string += this.open_Elem("div","GTPlugin-url-hbox","fieldwrapper");
									string += this.createLabel("dialog_galaxytoolurl");
									string += this.createInput("text","GTPlugin-url","galaxytoolbar_textInput","change", galaxytoolbar.GTPlugin_options2.on_galaxytool_url_changed);
									if (!og500)
										string += this.createInput("button","GTPlugin-checkbtn","galaxytoolbar_button","click",galaxytoolbar.GTPlugin_options2.check_connection,galaxytoolbar.GTPlugin_general.get_ui_string("dialog_check_btn"));
									else
										string += this.createInput("button","GTPlugin-checkbtn","btn_blue","click",galaxytoolbar.GTPlugin_options2.check_connection,galaxytoolbar.GTPlugin_general.get_ui_string("dialog_check_btn"));
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_galaxytool_version");
									string += this.createLabel("","","GTPlugin-version","padding:0px");
								string += this.close_Elem("div");
								string += this.open_Elem("div","GTPlugin-token-hbox","fieldwrapper");
									string += this.createLabel("dialog_token");
									string += this.createInput("text","GTPlugin-token","galaxytoolbar_textInput","change", galaxytoolbar.GTPlugin_options2.on_token_changed);
								string += this.close_Elem("div");
								string += this.open_Elem("div","GTPlugin-username-hbox","fieldwrapper");
									string += this.createLabel("dialog_username");
									string += this.createInput("text","GTPlugin-username","galaxytoolbar_textInput","change", galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","GTPlugin-password-hbox","fieldwrapper");
									string += this.createLabel("dialog_password");
									string += this.createInput("password","GTPlugin-password","galaxytoolbar_textInput","change", galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","GTPlugin-ogeneralip-hbox","fieldwrapper","display:none");
									string += this.createLabel("","oGeneral IP");
									string += this.createInput("text","GTPlugin-ogeneralip","galaxytoolbar_textInput");
								string += this.close_Elem("div");
								string += this.open_Elem("div","GTPlugin-ogeneralport-hbox","fieldwrapper","display:none");
									string += this.createLabel("","oGeneral Port");
									string += this.createInput("text","GTPlugin-ogeneralport","galaxytoolbar_textInput");
								string += this.close_Elem("div");
							string += this.close_Elem("div");
							string += '<!--  <span id="GTPlugin-whattosend-hbox">-->';
							string += this.open_Elem("h3");
							string += galaxytoolbar.GTPlugin_general.get_ui_string("dialog_uni_data");
							string += this.close_Elem("h3");
							string += this.open_Elem("div", "", "group bborder", "display: block;");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_galaxy");
									string += this.createInput("checkbox","GTPlugin-submit_galaxy","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_stats");
									string += this.createInput("checkbox","GTPlugin-submit_stats","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_reports");
									string += this.createInput("checkbox","GTPlugin-submit_reports","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_allypage");
									string += this.createInput("checkbox","GTPlugin-submit_allypage","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_phalanx");
									string += this.createInput("checkbox","GTPlugin-submit_phalanx","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_espionage_action");
									string += this.createInput("checkbox","GTPlugin-submit_espionage_action","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_short_cr");
									string += this.createInput("checkbox","GTPlugin-submit_short_cr","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_player_message");
									string += this.createInput("checkbox","GTPlugin-submit_player_message","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_message_content");
									string += this.createInput("checkbox","GTPlugin-submit_player_message_content","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
							string += this.close_Elem("div");
							string += this.open_Elem("h3");
							string += galaxytoolbar.GTPlugin_general.get_ui_string("dialog_own_data");
							string += this.close_Elem("h3");
							string += this.open_Elem("div", "", "group bborder", "display: block;");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_buildings");
									string += this.createInput("checkbox","GTPlugin-submit_buildings","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_research");
									string += this.createInput("checkbox","GTPlugin-submit_research","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_defense");
									string += this.createInput("checkbox","GTPlugin-submit_defense","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_shipyard");
									string += this.createInput("checkbox","GTPlugin-submit_shipyard","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_fleet");
									string += this.createInput("checkbox","GTPlugin-submit_fleet","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_empire");
									string += this.createInput("checkbox","GTPlugin-submit_empire","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
								string += this.open_Elem("div","","fieldwrapper");
									string += this.createLabel("dialog_submib_fmovement");
									string += this.createInput("checkbox","GTPlugin-submit_fmovement","","change",galaxytoolbar.GTPlugin_options2.on_change);
								string += this.close_Elem("div");
							string += this.close_Elem("div");
						string += this.close_Elem("div");
						if (!og500) {
							string += this.createInput("button","GTPlugin-savebtn2","button188","click",galaxytoolbar.GTPlugin_options2.saveValues,"OK","margin: auto;");
						} else {
							string += this.open_Elem("div","","textCenter");
								string += this.createInput("button","GTPlugin-savebtn2","btn_blue","click",galaxytoolbar.GTPlugin_options2.saveValues,"OK");
							string += this.close_Elem("div");
						}
						string += this.open_Elem("div","","galaxytoolbar_new_footer");
						string += this.close_Elem("div");
					string += this.close_Elem("div");
				string += this.close_Elem("div");
			string += this.close_Elem("div");
			myinhalt.innerHTML = string;	
			if (inhalt) {
				inhalt.style.display = 'none';	
			}
			doc.getElementById("contentWrapper").appendChild(myinhalt);
			
			
			// load all tools
			this.initWindow();
			
			var listener = new Object();
			listener["id"] = "GTPlugin-tool_list";
			listener["event"] = "click";
			listener["callbackfunction"] = galaxytoolbar.GTPlugin_options2.load_selected_tool;
			this.listeners.push(listener);
			
			listener = new Object();
			listener["id"] = "GTPlugin-tool_list";
			listener["event"] = "change";
			listener["callbackfunction"] = galaxytoolbar.GTPlugin_options2.load_selected_tool;
			this.listeners.push(listener);
			
			// now activate all eventListeners
			for (var i = 0; i < this.listeners.length; i++)
				this.createListener(this.listeners[i]);
				
		} else {
			if (doc.getElementById("GTPlugin-options-window").style.display != 'none') {
				if (this.old_inhalt) this.old_inhalt.style.display = '';
				doc.getElementById("GTPlugin-options-window").style.display = 'none';
			} else {
				if (this.old_inhalt) this.old_inhalt.style.display = 'none';
				doc.getElementById("GTPlugin-options-window").style.display = '';
			}
		}
	},
	
	createLabel: function(labelcaption, customlabel, id, style) {
		if (labelcaption != "") {
			var _label = '<label class="galaxytoolbar_label textBeefy"';
			
			if (id) {
				_label += ' id="'+id+'"';
			}
			
			_label += '>'+galaxytoolbar.GTPlugin_general.get_ui_string(labelcaption);
			
			if (customlabel  && customlabel != "")
				_label += customlabel;
			
			return _label + '</label>';
			
		}
		
		if (customlabel && customlabel != "")
			if (id)
				return '<label class="galaxytoolbar_label textBeefy" id="'+id+'">'+customlabel+'</label>';
			else
				return '<label class="galaxytoolbar_label textBeefy">'+customlabel+'</label>';
		
		if (id)
			return '<label class="galaxytoolbar_label textBeefy" id="'+id+'"></label>';
		else
			return '<label class="galaxytoolbar_label textBeefy"></label>';
	},
	
	createInput: function(type, id, classname, event, callbackfunction, value, style) {
		var input = '<input type="'+type+'" id="'+id+'"';
		
		if (classname && classname != "")
			input += ' class="'+classname+'"';
			
		if (style && style != "")
			input += ' style="'+style+'"';
			
		if (value && value != "")
			input += ' value="'+value+'"';
			
		if (id && id != "" && event && event != "" && typeof callbackfunction == "function") { 
			var listener = new Object();
			listener["id"] = id;
			listener["event"] = event;
			listener["callbackfunction"] = callbackfunction;
			this.listeners.push(listener);
		}
		return input+'/>';
	},
	
	createListener: function(listener) {
		document.getElementById(listener["id"]).addEventListener(listener["event"], listener["callbackfunction"], false);
	},
	
	open_Elem: function(elem, id, classname, style) {
		var d = '<'+elem;
		
		if (id && id != "")
			d+= ' id="'+id+'"';
		
		if (classname && classname != "")
			d+= ' class="'+classname+'"';
			
		if (style && style != "")
			d += ' style="'+style+'"';
			
		d+= '>';
		return d;
	},
	
	close_Elem: function(elem) {
		return "</"+elem+">";
	},
	
	initWindow: function() {
		//galaxytoolbar.GTPlugin_storage.initStorage();
		this.loadValues();

		if (this.tools.length == 0) {
			this.toggle_status_of_inputs(true);
		} else {
			// select first one
			this.selected_tool = 0;
			this.set_userdata();
		}
	},
	
	copy_userdata: function() {
		try {
			
			if (galaxytoolbar.GTPlugin_options2.selected_tool == null) {
				// we did not have a tool selected yet
				return;
			}
			
			// copy previous values into array that shall be saved later on
			// textfields
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["name"]			= document.getElementById("GTPlugin-name").value;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_url"]		= document.getElementById("GTPlugin-ogameurl").value.trim();
			document.getElementById("GTPlugin-ogameurl").value = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_url"];
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_url"]		= document.getElementById("GTPlugin-url").value.trim();
			document.getElementById("GTPlugin-url").value	= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_url"];
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_user"]		= document.getElementById("GTPlugin-username").value;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_password"]	= document.getElementById("GTPlugin-password").value;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_token"]	= document.getElementById("GTPlugin-token").value;
			
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["is_ogeneral"]	=document.getElementById("GTPlugin-isogeneral").checked;
			var ip = document.getElementById("GTPlugin-ogeneralip").value.trim();
			var ip_cont = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogeneral_ip"]	= ip_cont != null && ip_cont[1] < 256 && ip_cont[2] < 256 && ip_cont[3] < 256 && ip_cont[4] < 256 ? ip : "127.0.0.1";
			
			var port = parseInt(document.getElementById("GTPlugin-ogeneralport").value);
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogeneral_port"]	= isNaN(port) ? 11000 : port;
			
			// universe data checkboxes
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_galaxy"]				= document.getElementById("GTPlugin-submit_galaxy").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_stats"]				= document.getElementById("GTPlugin-submit_stats").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_reports"]			= document.getElementById("GTPlugin-submit_reports").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_allypage"]			= document.getElementById("GTPlugin-submit_allypage").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_espionage_action"]	= document.getElementById("GTPlugin-submit_espionage_action").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_short_cr"]			= document.getElementById("GTPlugin-submit_short_cr").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_player_message"]		= document.getElementById("GTPlugin-submit_player_message").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_player_message_c"]	= document.getElementById("GTPlugin-submit_player_message_content").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_phalanx"]			= document.getElementById("GTPlugin-submit_phalanx").checked;
			
			// own data checkboxes
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_buildings"]	= document.getElementById("GTPlugin-submit_buildings").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_research"]	= document.getElementById("GTPlugin-submit_research").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_fleet"]		= document.getElementById("GTPlugin-submit_fleet").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_defense"]	= document.getElementById("GTPlugin-submit_defense").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_empire"]		= document.getElementById("GTPlugin-submit_empire").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_shipyard"]	= document.getElementById("GTPlugin-submit_shipyard").checked;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_fmovement"]	= document.getElementById("GTPlugin-submit_fmovement").checked;
		} catch(error) {
			alert("copy_userdata: "+error);
		}	
	},
	
	set_userdata: function() {
		try {
			if (galaxytoolbar.GTPlugin_options2.selected_tool == null) {
				return;
			}
			if (galaxytoolbar.GTPlugin_options2.tools == null) {
				return;
			}
			
			// set values at text fields
			document.getElementById("GTPlugin-caption").innerHTML = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["name"];
			document.getElementById("GTPlugin-name").value		= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["name"];
			document.getElementById("GTPlugin-ogameurl").value	= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_url"];
			if (galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_servername_color"] != "") {
				document.getElementById("GTPlugin-ogameurl").setAttribute("style","-moz-appearance:none; width: 250px;background-color:"+galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_servername_color"]);
			} else {
				document.getElementById("GTPlugin-ogameurl").setAttribute("style","width: 250px;");
			}
			document.getElementById("GTPlugin-url").value		= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_url"];
			
			var version;
			if (galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_major"] == 0) {
				 version = "≤4.5.4"; 
			} else {
				version = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_major"]+
				"."+galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_minor"]+
				"."+galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_revision"];
			}
			
			document.getElementById("GTPlugin-version").innerHTML	= version;
			
			document.getElementById("GTPlugin-username").value	= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_user"];
			document.getElementById("GTPlugin-password").value	= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_password"];
			document.getElementById("GTPlugin-token").value		= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_token"];
			document.getElementById("GTPlugin-uni").value		= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["universe"];
			
			if (galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["universe"] == "unknown") {
				document.getElementById("GTPlugin-uni").setAttribute("class","gt_label_uni_not_okay");	
			} else {
				document.getElementById("GTPlugin-uni").setAttribute("class","gt_label_uni_okay");
			}
			
			document.getElementById("GTPlugin-isogeneral").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["is_ogeneral"];
			document.getElementById("GTPlugin-ogeneralip").value		= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogeneral_ip"];
			document.getElementById("GTPlugin-ogeneralport").value		= galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogeneral_port"];
			
			// universe data checkboxes
			document.getElementById("GTPlugin-submit_galaxy").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_galaxy"];
			document.getElementById("GTPlugin-submit_stats").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_stats"];
			document.getElementById("GTPlugin-submit_reports").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_reports"];
			document.getElementById("GTPlugin-submit_allypage").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_allypage"];
			document.getElementById("GTPlugin-submit_espionage_action").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_espionage_action"];
			document.getElementById("GTPlugin-submit_short_cr").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_short_cr"];
			document.getElementById("GTPlugin-submit_player_message").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_player_message"];
			document.getElementById("GTPlugin-submit_player_message_content").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_player_message_c"];
			document.getElementById("GTPlugin-submit_phalanx").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_phalanx"];
			
			// own data checkboxes
			document.getElementById("GTPlugin-submit_buildings").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_buildings"];
			document.getElementById("GTPlugin-submit_research").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_research"];
			document.getElementById("GTPlugin-submit_fleet").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_fleet"];
			document.getElementById("GTPlugin-submit_defense").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_defense"];
			document.getElementById("GTPlugin-submit_empire").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_empire"];
			document.getElementById("GTPlugin-submit_shipyard").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_shipyard"];
			document.getElementById("GTPlugin-submit_fmovement").checked = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["submit_fmovement"];
			
			galaxytoolbar.GTPlugin_options2.remove_userpw_fields(galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_token"].match(/^[0-9a-f]{32}$/i) != null);
		} catch(error) {
			alert("set_userdata: "+error);
		}
	},
	
	load_selected_tool: function() {
		try {
			var old_tool = galaxytoolbar.GTPlugin_options2.selected_tool;
			if (galaxytoolbar.GTPlugin_options2.do_not_set_fields) {
				// we just want to set the focus to the new line without copying data
				// document.getElementById("GTPlugin-checkbtn").removeAttribute("image");
				galaxytoolbar.GTPlugin_options2.do_not_set_fields = false;
				return;
			}
			
			//alert(document.getElementById("GTPlugin-tool_list").selectedIndex);
			//alert("pressed "+variable.getAttribute("label"));
			// copy user entered data into array
			galaxytoolbar.GTPlugin_options2.copy_userdata();
			
			// now set the newly selected tool as global defined tool
			galaxytoolbar.GTPlugin_options2.selected_tool = parseInt(document.getElementById("GTPlugin-tool_list").options[document.getElementById("GTPlugin-tool_list").selectedIndex].getAttribute("value"));
			
			// set userdata for selected tool
			galaxytoolbar.GTPlugin_options2.set_userdata(); 
			try {
				if (old_tool != galaxytoolbar.GTPlugin_options2.selected_tool)
					document.getElementById("GTPlugin-resultimg").removeChild(document.getElementById("GTPlugin-resultimg").firstChild);
			} catch(e) {}
			
		} catch(e) {
			alert("error at load tool: "+e);
		}
	},
	
	add_new_tool: function() {
		try {
			var array_index = galaxytoolbar.GTPlugin_options2.tools.length;
			galaxytoolbar.GTPlugin_options2.tools[array_index] = new Object();
			galaxytoolbar.GTPlugin_options2.tools[array_index]["id"]						= null;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["deleted"]					= false;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["updated"]					= false;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["name"]						= "New Tool";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["ogame_url"]				= document.location.host;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_url"]					= "http://yourdomain.tld/galaxytool/secret/galaxyplugin.php";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_version_major"]		= 0;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_version_minor"]		= 0;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_version_revision"]	= 0;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_user"]				= "";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_password"]			= "";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["tool_token"]				= "";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["ogame_servername_color"]	= "";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["universe"]					= ""; //galaxytoolbar.GTPlugin_general.getUniverse(document);
			
			galaxytoolbar.GTPlugin_options2.reload_ogame_servername(array_index,document.location.host);
			// ogeneral
			galaxytoolbar.GTPlugin_options2.tools[array_index]["is_ogeneral"]				= false;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["ogeneral_ip"]				= "127.0.0.1";
			galaxytoolbar.GTPlugin_options2.tools[array_index]["ogeneral_port"]			= 11000;
			
			// universe data checkboxes
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_galaxy"]			= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_stats"]				= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_reports"]			= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_allypage"]			= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_espionage_action"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_short_cr"]			= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_player_message"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_player_message_c"]	= false;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_phalanx"]			= true;
			
			// own data checkboxes
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_buildings"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_research"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_fleet"]		= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_defense"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_empire"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_shipyard"]	= true;
			galaxytoolbar.GTPlugin_options2.tools[array_index]["submit_fmovement"]	= true;
			
			var option = document.createElement("option");
			
			option.setAttribute("value",array_index);
			
			option.innerHTML = galaxytoolbar.GTPlugin_options2.tools[array_index]["name"];
			
			// add item to menulist
 			galaxytoolbar.GTPlugin_options2.tools[array_index]["menuitem"] = document.getElementById("GTPlugin-tool_list").appendChild(option);
			
			if (galaxytoolbar.GTPlugin_options2.selected_tool != null) {
	 			// backup old values first
	 			galaxytoolbar.GTPlugin_options2.copy_userdata();
			}
 			
 			galaxytoolbar.GTPlugin_options2.selected_tool = galaxytoolbar.GTPlugin_options2.tools.length - 1;
 			
 			// select new tool in dropdown
 			galaxytoolbar.GTPlugin_options2.do_not_set_fields = true;
 			document.getElementById("GTPlugin-tool_list").selectedIndex = galaxytoolbar.GTPlugin_options2.selected_tool; 
 			
 			// set new data at fields
 			galaxytoolbar.GTPlugin_options2.set_userdata();
 			galaxytoolbar.GTPlugin_options2.toggle_status_of_inputs(false);
 			
 			try {
				document.getElementById("GTPlugin-resultimg").removeChild(document.getElementById("GTPlugin-resultimg").firstChild);
			} catch(e) {}
 			
		} catch(e) {
			alert("error at add tool: "+e);
		}
	},
	
	delete_tool: function() {
		try {
			// galaxytoolbar.GTPlugin_options2.selected_tool contains currently selected tool
			if (galaxytoolbar.GTPlugin_options2.selected_tool == null) {
				// nothing to delete
				return;
			}
			
			// database done in save only
			// hide item at list
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["menuitem"].style.display="none";
			
			// array content will be lost as soon as the window is closed; but mark it as deleted
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["deleted"] = true;
			
			// select another tool which is not yet marked as deleted
			var remaining_tools = false;		
			for (var i=0; i < galaxytoolbar.GTPlugin_options2.tools.length; i++) {
				if (!galaxytoolbar.GTPlugin_options2.tools[i]["deleted"]) {
					galaxytoolbar.GTPlugin_options2.selected_tool = i;
					galaxytoolbar.GTPlugin_options2.set_userdata();
					remaining_tools = true;
					
					// select tool in dropdown
 					galaxytoolbar.GTPlugin_options2.do_not_set_fields = true;
 					document.getElementById("GTPlugin-tool_list").selectedIndex = galaxytoolbar.GTPlugin_options2.selected_tool; 
					
					try {
						document.getElementById("GTPlugin-resultimg").removeChild(document.getElementById("GTPlugin-resultimg").firstChild);
					} catch(e) {}
					
					return;
				}
			}
			if (remaining_tools == false) {
				// we did not find any remaining tool
				// ignore in Chrome!
				// galaxytoolbar.GTPlugin_options2.add_new_tool();
				galaxytoolbar.GTPlugin_options2.toggle_status_of_inputs(true);
			}
			
			try {
				document.getElementById("GTPlugin-resultimg").removeChild(document.getElementById("GTPlugin-resultimg").firstChild);
			} catch(e) {}
			
		} catch(error) {
			alert("delete tool error: "+error);
		}
	},
	
	on_ogame_url_changed: function() {
		try {
			// we don't want to have leading http:// and trailing / or something else like that
			var new_url = document.getElementById("GTPlugin-ogameurl").value.trim().replace(/^http:\/\//,"").replace(/(\/.*)*$/,"");
			document.getElementById("GTPlugin-ogameurl").value = new_url;
			// change the menuitem description
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["menuitem"].setAttribute("description",new_url);
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["universe"]	= "";
			this.reload_ogame_servername(galaxytoolbar.GTPlugin_options2.selected_tool,new_url);
			document.getElementById("GTPlugin-uni").value = "";
			document.getElementById("GTPlugin-uni").setAttribute("class","gt_label_uni_not_okay");
			
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_servername_color"] = "";
			document.getElementById("GTPlugin-ogameurl").setAttribute("style","width: 250px;");
			galaxytoolbar.GTPlugin_options2.on_change();
		} catch(error) {
			alert("reset uni error: "+error);
		}
	},
	
	reload_ogame_servername: function(id,url,direct_update) {
		if (url.match(/\.ogame\.[\w\.]{2,}/) == null) {
			if (!direct_update) {
				galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["universe"]	= "";
				
				if (id == galaxytoolbar.GTPlugin_options2.selected_tool)
					document.getElementById("GTPlugin-uni").value = "";
			}
			return;
		}
			
		var api = document.location.protocol + "//" + url + "/api/serverData.xml";
		var req_id = ++galaxytoolbar.GTPlugin_options2.request_id;
		try {
			var httpRequest = new XMLHttpRequest();
			httpRequest.open("GET", api, true);
			httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
			httpRequest.overrideMimeType("text/xml");
			httpRequest.onload = function() {
				var servername = "";
				var el;
				try {
					el = httpRequest.responseXML.getElementsByTagName("name");
					
					if (el.length > 0)
						servername = httpRequest.responseXML.getElementsByTagName("name")[0].textContent;
					
					if (servername == "")
						servername = httpRequest.responseXML.getElementsByTagName("number")[0].textContent;
				} catch(e) {}
				
				if (req_id == galaxytoolbar.GTPlugin_options2.request_id && !direct_update) {
					galaxytoolbar.GTPlugin_options2.tools[id]["universe"] = servername;
					
					if (id == galaxytoolbar.GTPlugin_options2.selected_tool)
						document.getElementById("GTPlugin-uni").value = servername;
				} else {
					galaxytoolbar.GTPlugin_storage.update_universe_for_ogame_url(url,servername);
				}
			};
			httpRequest.onerror = function() {
				// prevent concurrence
				if (req_id == galaxytoolbar.GTPlugin_options2.request_id && !direct_update) {
					galaxytoolbar.GTPlugin_options2.tools[id]["universe"] = "";
					
					if (id == galaxytoolbar.GTPlugin_options2.selected_tool)
						document.getElementById("GTPlugin-uni").value = "";
				}
			};
			httpRequest.send(null);
		} catch(e) {
			if (!direct_update) {
				galaxytoolbar.GTPlugin_options2.tools[id]["universe"] = "";
					
				if (id == galaxytoolbar.GTPlugin_options2.selected_tool)
					document.getElementById("GTPlugin-uni").value = "";
			}
		}
	},
	
	on_ogame_url_input: function() {
		try {
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_servername_color"] = "";
			document.getElementById("GTPlugin-ogameurl").setAttribute("style","width: 250px;");
		} catch(e) {
			alert(e);
		}
	},
	
	on_galaxytool_url_changed: function() {
		try {
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_major"]	= 0;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_minor"]	= 0;
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_version_revision"]	= 0;
			document.getElementById("GTPlugin-version").innerHTML		= "≤4.5.4";
			
			galaxytoolbar.GTPlugin_options2.on_change();
		} catch(error) {
			alert("reset Galaxytool version error: "+error);
		}
	},
	
	on_change: function() {
		try {
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["updated"] = true;
			galaxytoolbar.GTPlugin_options2.copy_userdata();
		} catch(error) {
			alert("on change: "+error);
		}
	},
	
	on_name_changed: function() {
		// handle name changes
		try {
			// change the menuitem description
			galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["menuitem"].innerHTML = document.getElementById("GTPlugin-name").value;
			document.getElementById("GTPlugin-caption").innerHTML = document.getElementById("GTPlugin-name").value;
			galaxytoolbar.GTPlugin_options2.on_change();
		} catch(error) {
			alert("on name changed: "+error);
		}
	},
	
	on_token_changed: function() {
		document.getElementById("GTPlugin-token").value = document.getElementById("GTPlugin-token").value.trim();
		galaxytoolbar.GTPlugin_options2.remove_userpw_fields(document.getElementById("GTPlugin-token").value.match(/^[0-9a-f]{32}$/i) != null);
		galaxytoolbar.GTPlugin_options2.on_change();
	},
	
	on_isog_changed: function() {
		if (document.getElementById("GTPlugin-isogeneral").checked) {
			// remove gtool url, token, user, password fields
			document.getElementById("GTPlugin-url-hbox").style.display = "none";
			document.getElementById("GTPlugin-token-hbox").style.display = "none";
			galaxytoolbar.GTPlugin_options2.remove_userpw_fields(true);
			document.getElementById("GTPlugin-whattosend-hbox").style.display = "none";
			// display Ogeneral settings instead
			document.getElementById("GTPlugin-ogeneralip-hbox").setAttribute("style","");
			document.getElementById("GTPlugin-ogeneralport-hbox").setAttribute("style","");
			window.sizeToContent();
			galaxytoolbar.GTPlugin_options2.on_change();
		} else {
			// remove Ogeneral settings
			document.getElementById("GTPlugin-ogeneralip-hbox").style.display = "none";
			document.getElementById("GTPlugin-ogeneralport-hbox").style.display = "none";
			// show all gtool settings instead
			document.getElementById("GTPlugin-whattosend-hbox").setAttribute("style","");
			document.getElementById("GTPlugin-token-hbox").setAttribute("style","");
			document.getElementById("GTPlugin-url-hbox").setAttribute("style","");
			galaxytoolbar.GTPlugin_options2.on_token_changed();
		}
	},
	
	on_ip_changed: function() {
		//GTPlugin-ogeneralip

	},
	
	remove_userpw_fields: function(remove) {
		if (remove) {
			document.getElementById("GTPlugin-username-hbox").style.display = "none";
			document.getElementById("GTPlugin-password-hbox").style.display = "none";
		} else {
			document.getElementById("GTPlugin-username-hbox").setAttribute("style","");
			document.getElementById("GTPlugin-password-hbox").setAttribute("style","");
			
		}
		// trigger a resize, because of possible extra fields
		// not at chrome
		// window.sizeToContent();
	},
	
	getPrefs: function() {
		return galaxytoolbar.GTPlugin_general.getPrefs;
	},
	
	loadValues: function() {
		try {
			var prefs = this.getPrefs();
			// debugalaxytoolbar.GTPlugin_options2formation
			if (prefs.prefHasUserValue("gtplugin.settings.debug")) {
				var debug = prefs.getBoolPref("gtplugin.settings.debug");
				document.getElementById("GTPlugin-debug").checked = debug;
			}
			// status window
			if (prefs.prefHasUserValue("gtplugin.settings.show_statuswindow")) {
				var show_statuswindow = prefs.getBoolPref("gtplugin.settings.show_statuswindow");
				document.getElementById("GTPlugin-show_statuswindow").checked = show_statuswindow;
			}
			/* no need to save that value anymore
			if (prefs.prefHasUserValue("gtplugin.settings.get_own_player_id")) {
				var get_player_id = prefs.getBoolPref("gtplugin.settings.get_own_player_id");
				document.getElementById("GTPlugin-own_player_id").checked = get_player_id;
			}
			*/
			// Status window styles
			var style;
			if (prefs.prefHasUserValue("gtplugin.status_style_window")) {
				style = prefs.getCharPref("gtplugin.status_style_window");
				document.getElementById("GTPlugin-status_style_window").value = style;
			} else {
				// default value
				document.getElementById("GTPlugin-status_style_window").value = "position:fixed;top:10px;left:10px;z-index: 9999;";
			}
			
			if (prefs.prefHasUserValue("gtplugin.status_style_window_iframe")) {
				style = prefs.getCharPref("gtplugin.status_style_window_iframe");
				document.getElementById("GTPlugin-status_style_window_iframe").value = style;
			} else {
				// default value
				document.getElementById("GTPlugin-status_style_window_iframe").value = "position:fixed;top:20px;right:25px;z-index: 999;";
			}
			
			if (prefs.prefHasUserValue("gtplugin.status_style_header")) {
				style = prefs.getCharPref("gtplugin.status_style_header");
				document.getElementById("GTPlugin-status_style_header").value = style;
			} else {
				// default value
				document.getElementById("GTPlugin-status_style_header").value = "font-weight:bold;";
			}
			if (prefs.prefHasUserValue("gtplugin.status_style_results")) {
				style = prefs.getCharPref("gtplugin.status_style_results");
				document.getElementById("GTPlugin-status_style_results").value = style;
			} else {
				// default value
				document.getElementById("GTPlugin-status_style_results").value = "color:white;";
			}		
			
			// load tool specific information from SQLite
			this.tools = galaxytoolbar.GTPlugin_storage.read_tools();
			
			// add items to menulist
			var option;
			for (var i=0; i< this.tools.length; i++) {
				option = document.createElement("option");
				option.setAttribute("value",i);
				option.innerHTML = galaxytoolbar.GTPlugin_options2.tools[i]["name"];
				
				galaxytoolbar.GTPlugin_options2.tools[i]["ogame_servername_color"] = "";
				galaxytoolbar.GTPlugin_options2.tools[i]["menuitem"] = document.getElementById("GTPlugin-tool_list").appendChild( option);
			}
		} catch(error) {
			alert("loadValues error: "+error);
		}
	},
	
	saveValues: function() {
		try {
			// as a first step, copy values from input fields into array
			galaxytoolbar.GTPlugin_options2.copy_userdata();
			var prefs = galaxytoolbar.GTPlugin_options2.getPrefs();
			
			// Settings stored in PREF 
			prefs.setBoolPref("gtplugin.settings.debug", document.getElementById("GTPlugin-debug").checked); // set a pref
			prefs.setBoolPref("gtplugin.settings.show_statuswindow", document.getElementById("GTPlugin-show_statuswindow").checked);
			//prefs.setBoolPref("gtplugin.settings.get_own_player_id", document.getElementById("GTPlugin-own_player_id").checked);
			
			// Status window
			prefs.setCharPref("gtplugin.status_style_window", decodeURIComponent(galaxytoolbar.GTPlugin_options2.getValue("GTPlugin-status_style_window")));
			prefs.setCharPref("gtplugin.status_style_window_iframe", decodeURIComponent(galaxytoolbar.GTPlugin_options2.getValue("GTPlugin-status_style_window_iframe")));
			prefs.setCharPref("gtplugin.status_style_header", decodeURIComponent(galaxytoolbar.GTPlugin_options2.getValue("GTPlugin-status_style_header")));
			prefs.setCharPref("gtplugin.status_style_results", decodeURIComponent(galaxytoolbar.GTPlugin_options2.getValue("GTPlugin-status_style_results")));
			// data stored in SQLite 
			for (var i=0; i<galaxytoolbar.GTPlugin_options2.tools.length; i++) {
				var tool_exists = galaxytoolbar.GTPlugin_storage.tool_exists(galaxytoolbar.GTPlugin_options2.tools[i]["id"]);
				if (galaxytoolbar.GTPlugin_options2.tools[i]["deleted"] == false && !tool_exists) {
					// insert data into SQLite only, if the tool was not created yet and is not marked as deleted
					var id = galaxytoolbar.GTPlugin_storage.insert_tool(
						galaxytoolbar.GTPlugin_options2.tools[i]["id"],
						galaxytoolbar.GTPlugin_options2.tools[i]["name"],
						galaxytoolbar.GTPlugin_options2.tools[i]["ogame_url"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_url"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_version_major"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_version_minor"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_version_revision"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_user"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_password"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_token"],
						galaxytoolbar.GTPlugin_options2.tools[i]["universe"],
						// ogeneral
						false,
						"",
						0,
						// universe data checkboxes
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_galaxy"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_stats"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_reports"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_allypage"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_espionage_action"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_short_cr"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_player_message"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_player_message_c"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_phalanx"],
						// own data checkboxes
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_buildings"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_research"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_fleet"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_defense"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_empire"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_shipyard"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_fmovement"]);
						
						galaxytoolbar.GTPlugin_options2.tools[i]["updated"] = false;
						
						// set the new id
						galaxytoolbar.GTPlugin_options2.tools[i]["id"] = id;
				} else if (galaxytoolbar.GTPlugin_options2.tools[i]["deleted"] && tool_exists) {
					// delete tool from DB only, if the tool is marked as deleted and the tool exists
					galaxytoolbar.GTPlugin_storage.delete_tool(galaxytoolbar.GTPlugin_options2.tools[i]["id"]);
					galaxytoolbar.GTPlugin_options2.tools[i]["updated"] = false;
					
					galaxytoolbar.GTPlugin_options2.tools[i]["id"] = null;
				}
				
				if (galaxytoolbar.GTPlugin_options2.tools[i]["updated"] && tool_exists) {
					// update data only if necessary and tool exists
					galaxytoolbar.GTPlugin_storage.update_tool(
						galaxytoolbar.GTPlugin_options2.tools[i]["id"],
						galaxytoolbar.GTPlugin_options2.tools[i]["name"],
						galaxytoolbar.GTPlugin_options2.tools[i]["ogame_url"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_url"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_version_major"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_version_minor"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_version_revision"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_user"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_password"],
						galaxytoolbar.GTPlugin_options2.tools[i]["tool_token"],
						galaxytoolbar.GTPlugin_options2.tools[i]["universe"],
						// ogeneral
						false,
						"",
						0,
						// universe data checkboxes
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_galaxy"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_stats"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_reports"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_allypage"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_espionage_action"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_short_cr"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_player_message"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_player_message_c"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_phalanx"],
						// own data checkboxes
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_buildings"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_research"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_fleet"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_defense"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_empire"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_shipyard"],
						galaxytoolbar.GTPlugin_options2.tools[i]["submit_fmovement"]);
						
						galaxytoolbar.GTPlugin_options2.tools[i]["updated"] = false;
				}
			}
			galaxytoolbar.GTPlugin_options2.toggleOptions(document);
		} catch (error) {
			alert("Save values error: "+error);
		}
	},
	
	check_connection: function() {
		document.getElementById("GTPlugin-checkbtn").disabled = true;
		document.getElementById("GTPlugin-addbtn").disabled = true;
		document.getElementById("GTPlugin-delbtn").disabled = true;
		document.getElementById("GTPlugin-tool_list").disabled = true;
		galaxytoolbar.GTPlugin_options2.reload_ogame_servername(galaxytoolbar.GTPlugin_options2.selected_tool,galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["ogame_url"]);
		//TODO: improve regexp here
		if (/^https?:\/\/.+\.php$/.test(galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_url"])) {
			var galaxytool_url = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_url"];
			if ((galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_user"] != "" 
				&& galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_password"] != "")
				|| galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_token"].match(/^[0-9a-f]{32}$/i) != null) {
				
				var username = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_user"]; 
				var password = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_password"];
				var token = galaxytoolbar.GTPlugin_options2.tools[galaxytoolbar.GTPlugin_options2.selected_tool]["tool_token"];
				//now we can check the connection
				var major = 0;
				var minor = 0;
				var revision = 0;
				var version;
				var general = galaxytoolbar.GTPlugin_general;
				try {
					var param;
					if (token.match(/^[0-9a-f]{32}$/i) != null) {
						param = 'type=validate&token='+token;
					} else {
						param = 'type=validate&user='+username+'&password='+general.get_MD5(password);
					}
					// new approach to avoid "mixed content" errors when sending from OGame https pages to galaxytool http pages
					// directly from content scripts
					chrome.runtime.sendMessage({
					    method: "POST",
					    action: "xhttp",
					    url: galaxytool_url,
					    mimeType: "text/xml",
					    data: param
					}, function(httpRequest) {
					    /*Callback function to deal with the response*/
					    if (httpRequest.status === 200) {
							var options2 = galaxytoolbar.GTPlugin_options2;
							try {
								// we have to derive the responseXML from the responseText as the XML object is not sent via
								// postMessage
								var response = (new window.DOMParser()).parseFromString(httpRequest.responseText, "text/xml");
								version = response.getElementsByTagName("version")[0];
								
								major = parseInt(version.getAttribute("major"));
								
								if (version.hasAttribute("minor")) {
									minor = parseInt(version.getAttribute("minor"));
								}
								
								if (version.hasAttribute("revision")) {
									revision = parseInt(version.getAttribute("revision"));
								}
								
								options2.tools[options2.selected_tool]["tool_version_major"] = major;
								options2.tools[options2.selected_tool]["tool_version_minor"] = minor;
								options2.tools[options2.selected_tool]["tool_version_revision"] = revision;
								options2.tools[options2.selected_tool]["updated"] = true;		
								
								version = major+"."+minor+"."+revision;
								
								if (general.compare_versions(major,minor,revision,4,7,0)) {
									var permissions = response.getElementsByTagName("permission");
									var messages = response.getElementsByTagName("message");
									if (permissions.length > 0) {
										if (permissions[0].getAttribute("name") == "caninsert") {
											if (permissions[0].childNodes[0].nodeValue != "true") {
												options2.show_result("The connection test showed, that the Galaxytool URL is correct, but another error occured:",
												"You are not allowed to insert data. Ask you Galaxytool admin to give you all necessary permissions!",
												galaxytool_url,username,password,token,"",version,"yellow",true,true);
											} else {
												options2.show_result("","","","","","","",version,"green",false,true);
											}
										} else {
											options2.show_result("","","","","","","",version,"red",false,true);
										}
									} else if (messages.length > 0) {
										var all_messages = "";
										for ( var i=0; i < messages.length; i++) all_messages += messages[i].childNodes[0].nodeValue+"\n";
										options2.show_result("The connection test showed, that the Galaxytool URL is correct, but another error occured:",
												all_messages,
												galaxytool_url,
												username,
												password,token,"",version,"yellow",true,true);
									} else {
										options2.show_result("The connection test showed, that the Galaxytool URL is correct, but an unknown error occured. ResponseText:",
												httpRequest.responseText,galaxytool_url,username,password,token,"",version,"red",true,true);
									}
								} else {
									//Galaxytool v4.6
									options2.show_result("","","","","","",version,"green",false,true);
								}
								return 1;
							} catch(wrong_url) {
								options2.show_result("The connection test failed"+wrong_url,"",galaxytool_url,username,password,token,
													"Probably your Galaxytool URL is wrong!","","red",true,false);
								return 0;
							}	
						} else {
							var options2 = galaxytoolbar.GTPlugin_options2;
							// old tool
							if (httpRequest.responseText.indexOf("starting to work") > -1) {
								options2.tools[options2.selected_tool]["tool_version_major"] = 0;
								options2.tools[options2.selected_tool]["tool_version_minor"] = 0;
								options2.tools[options2.selected_tool]["tool_version_revision"] = 0;
								options2.tools[options2.selected_tool]["updated"] = true;
								options2.show_result("The connection test showed, that you are trying to connect to an old Galaxytool.\n",
													"This version of the Galaxytoolbar is not compatible with your Galaxytool version."+
													" Please make sure, that you have at least v4.6 of the Galaxytool installed.\n",
													galaxytool_url,username,password,token,"","≤4.5.4","red",true,true);
							} else {
							//could not reach the Galaxytool
							options2.show_result("The connection test failed","",galaxytool_url,username,password,token,"Connection Status Code: "+httpRequest.status+"\n"+
								"Probably your Galaxytool URL is wrong!","","red",true,false);
							}
							return 0;
						}
					});
/*					
					// old approach
					var httpRequest = new XMLHttpRequest();
					httpRequest.open("POST", galaxytool_url, true);
					httpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
					httpRequest.overrideMimeType("text/xml");
					httpRequest.onreadystatechange = function () {	
						if (httpRequest.readyState == 4) {
							if (httpRequest.status == 200) {
								
								var options2 = galaxytoolbar.GTPlugin_options2;
								try {
									var response = httpRequest.responseXML;
									version = response.getElementsByTagName("version")[0];
									
									major = parseInt(version.getAttribute("major"));
									
									if (version.hasAttribute("minor")) {
										minor = parseInt(version.getAttribute("minor"));
									}
									
									if (version.hasAttribute("revision")) {
										revision = parseInt(version.getAttribute("revision"));
									}
									
									options2.tools[options2.selected_tool]["tool_version_major"] = major;
									options2.tools[options2.selected_tool]["tool_version_minor"] = minor;
									options2.tools[options2.selected_tool]["tool_version_revision"] = revision;
									options2.tools[options2.selected_tool]["updated"] = true;		
									
									version = major+"."+minor+"."+revision;
									
									if (general.compare_versions(major,minor,revision,4,7,0)) {
										var permissions = response.getElementsByTagName("permission");
										var messages = response.getElementsByTagName("message");
										if (permissions.length > 0) {
											if (permissions[0].getAttribute("name") == "caninsert") {
												if (permissions[0].childNodes[0].nodeValue != "true") {
													options2.show_result("The connection test showed, that the Galaxytool URL is correct, but another error occured:",
													"You are not allowed to insert data. Ask you Galaxytool admin to give you all necessary permissions!",
													galaxytool_url,username,password,token,"",version,"yellow",true,true);
												} else {
													options2.show_result("","","","","","","",version,"green",false,true);
												}
											} else {
												options2.show_result("","","","","","","",version,"red",false,true);
											}
										} else if (messages.length > 0) {
											var all_messages = "";
											for ( var i=0; i < messages.length; i++) all_messages += messages[i].childNodes[0].nodeValue+"\n";
											options2.show_result("The connection test showed, that the Galaxytool URL is correct, but another error occured:",
													all_messages,
													galaxytool_url,
													username,
													password,token,"",version,"yellow",true,true);
										} else {
											options2.show_result("The connection test showed, that the Galaxytool URL is correct, but an unknown error occured. ResponseText:",
													httpRequest.responseText,galaxytool_url,username,password,token,"",version,"red",true,true);
										}
									} else {
										//Galaxytool v4.6
										options2.show_result("","","","","","",version,"green",false,true);
									}
									return 1;
								} catch(wrong_url) {
									options2.show_result("The connection test failed"+wrong_url,"",galaxytool_url,username,password,token,
														"Probably your Galaxytool URL is wrong!","","red",true,false);
									return 0;
								}	
							} else {
								var options2 = galaxytoolbar.GTPlugin_options2;
								// old tool
								if (httpRequest.responseText.indexOf("starting to work") > -1) {
									options2.tools[options2.selected_tool]["tool_version_major"] = 0;
									options2.tools[options2.selected_tool]["tool_version_minor"] = 0;
									options2.tools[options2.selected_tool]["tool_version_revision"] = 0;
									options2.tools[options2.selected_tool]["updated"] = true;
									options2.show_result("The connection test showed, that you are trying to connect to an old Galaxytool.\n",
														"This version of the Galaxytoolbar is not compatible with your Galaxytool version."+
														" Please make sure, that you have at least v4.6 of the Galaxytool installed.\n",
														galaxytool_url,username,password,token,"","≤4.5.4","red",true,true);
								} else {
								//could not reach the Galaxytool
								options2.show_result("The connection test failed","",galaxytool_url,username,password,token,"Connection Status Code: "+httpRequest.status+"\n"+
									"Probably your Galaxytool URL is wrong!","","red",true,false);
								}
								return 0;
							}
						}
					};
					httpRequest.send(param);
*/
				} catch (e) {
					galaxytoolbar.GTPlugin_options2.show_result("The connection test failed","",galaxytool_url,username,password,token,"Additionally, we got an error: "+e,"","red",true,false);
				}
			} else {
				alert("No username and password or valid login token specified!");
				galaxytoolbar.GTPlugin_options2.show_result("","","","","","","","","",false,false);
			}
		} else {
			alert("No valid Galaxytool URL specified - note that it has to start with http:// and end with .php!");
			galaxytoolbar.GTPlugin_options2.show_result("","","","","","","","","","",false,false);	
		}

	},
	
	show_result : function(prologue,details,galatool_url,username,password,token,epilogue,version,color,show_alert,set_version) {
		if (show_alert) {
			var params;
			
			if (token.match(/^[0-9a-f]{32}$/i) != null) {
				params = "Logon Key: "+token+"\n";
			} else {
				params = "Username: "+username+"\n"
						+"Password: "+password+"\n";
			}
			
			alert(prologue+"\n"
					+details+"\n"
					+"Parameters sent:\n"
					+"Galaxytool URL: "+galatool_url+"\n"
					+params
					+epilogue);
		}
		
		if (set_version) {
			document.getElementById("GTPlugin-version").innerHTML  = version;
		}
		
		// unlock all elements
		document.getElementById("GTPlugin-checkbtn").disabled = false;
		document.getElementById("GTPlugin-addbtn").disabled = false;
		document.getElementById("GTPlugin-delbtn").disabled = false;
		document.getElementById("GTPlugin-tool_list").disabled = false;
		if (color != "") {
			if (!document.getElementById("GTPlugin-resultimg").hasChildNodes()) {
				var img = document.createElement("img");
				img.setAttribute("style","margin-left:5px");
				
				img.setAttribute("src",chrome.extension.getURL("img/"+color+"_small.png"));
				document.getElementById("GTPlugin-resultimg").appendChild(img);
			} else {
				document.getElementById("GTPlugin-resultimg").firstChild.setAttribute("src",chrome.extension.getURL("img/"+color+"_small.png"));
			}
		} else {
			document.getElementById("GTPlugin-resultimg").removeChild(document.getElementById("GTPlugin-resultimg").firstChild);
		}
	},
	
	cancel: function() {
		//window.close();
	},
	
	toggle_status_of_inputs: function(bool) {
		var inputs = document.getElementById("galaxytoolbar_tools").getElementsByTagName("input");
		// enable/disable anything except of buttons (except of the "check"-button)
		for (var i = 0; i < inputs.length; i++)
			if (inputs[i].getAttribute("type") != "button" ||
				inputs[i].getAttribute("id") == "GTPlugin-checkbtn")
				inputs[i].disabled = bool;
				
		document.getElementById("GTPlugin-tool_list").disabled = bool;
	},
	
	getValue: function(elementID) {
		// Get a handle to our url textfield
		var textfield = document.getElementById(elementID);
		// Get the value, trimming whitespace as necessary
		var string = this.trimString(textfield.value);
		
		// If there is no url, we return ""
		// Otherwise, we convert the search terms to a safe URI version and return it
		if (string.length == 0) { 
			return "";
		} else {
			return encodeURIComponent(string);
		}
	},
	
	trimString: function(string) {
		// Return empty if nothing was passed in
		if (!string) return "";
		
		// Efficiently replace any leading or trailing whitespace
		var value = string.replace(/^\s+/, '');
		value = string.replace(/\s+$/, '');
		
		// Replace any multiple whitespace characters with a single space
		value = value.replace(/\s+/g, ' ');
		
		// Return the altered string
		return value;
	}
};