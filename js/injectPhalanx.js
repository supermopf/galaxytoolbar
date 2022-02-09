$(document).ajaxSuccess(function(e, xhr, settings) {
	if (settings.url.indexOf("component=phalanx") > -1) {
		var phalanx_overlay_text = xhr.responseText;
		try {
			var script = phalanx_overlay_text.substring(phalanx_overlay_text.indexOf("<script"),phalanx_overlay_text.length);
			$("#galaxytoolbar_arrivaltime_storage").attr("data-value", script);
		} catch(e) {
			
		}
	}
});