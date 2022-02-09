/**
 * Possible parameters for request:
 *  action     : "xhttp" for a cross-origin HTTP request
 *  method     : Default "GET"
 *  mimeType   :    set overrideMimeType to this value (if defined)
 *  url        : required, but not validated
 *  data       : data to send in a POST request
 *
 * The callback function is called upon completion of the request 
 * 
 * Based on: http://stackoverflow.com/questions/7699615/cross-domain-xmlhttprequest-using-background-pages/7699773#7699773
  * */
  
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	sendRequest(request).then(callback);
	return true;
});


async function sendRequest(request){
		if (request.action == "xhttp") {
		var myHeaders = new Headers();
		var method = request.method ? request.method.toUpperCase() : 'GET';
		//myHeaders.append('Access-Control-Allow-Origin', '*');
		
		if (request.mimeType) {
        	myHeaders.append('mimeType', request.mimeType);
        }
		if (method == 'POST') {
            myHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
		var myRequest = new Request(request.url, {
		  method: method,
		  headers: myHeaders,
		  mode: 'cors',
		  cache: 'no-cache',
		  body: request.data,
		});
		
	    let response = await fetch(myRequest);

		if (response.status === 200) {
			let data = await response.text();
			return {status: response.status, responseText: data};	
		}else{
			//Error
			return response.status;			
		}	
	}
}