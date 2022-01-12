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
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback({status: xhttp.status, 
            	      responseText: xhttp.responseText});
        };
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback(xhttp.status);
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
        if (request.mimeType) {
        	xhttp.overrideMimeType(request.mimeType);
        }
        
        
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
});