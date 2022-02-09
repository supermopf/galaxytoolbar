(function(open) { 
	XMLHttpRequest.prototype.open = function(method, url, async, user, pass) { 
		this.addEventListener("readystatechange", function() { 
			if (this.readyState == 4) { 
				if (this.status == 200) { 
					window.postMessage({
						direction: "from-ogame-page",
						url: this.responseURL,
						responseText: this.responseText
					}, "*");
				} 
			} 
		}, false); 
		open.call(this, method, url, async, user, pass); 
	}; 
})(XMLHttpRequest.prototype.open);