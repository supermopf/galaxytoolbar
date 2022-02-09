function galaxytoolbarManageTabs(id) {
	var selector = '#' + id;
	var rel = $(selector).attr('rel');
	if ($(selector).hasClass('opened')) {
		$(selector).addClass('closed');
		$(selector).removeClass('opened');
		$("#" + rel).hide();
	} else {
		$(selector).removeClass('closed');
		$(selector).addClass('opened');
		$("#" + rel).show();
	}
}