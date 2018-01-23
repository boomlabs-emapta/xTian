Router.config({ mode: 'history'});
// ****************************************************************************
// AJAX PAGE ROUTER
// This enables content to be loaded dynamically. The router uses the Pushstate
// to captuer the route changes and pass the requests to the serverside route
// manger. 
// ****************************************************************************
// ****************************************************************************
// ROUTE EXTENSIONS 
// ****************************************************************************
// 1. HTML PAGE LOADER
// 2. Get nav elements
// 3. Set Active Navigation Route
// 4. Pagination Lazy Loader

// ****************************************************************************
// 1. AJAX PAGE LOADER
// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element 
// ****************************************************************************
Router.getScriptsTags= function(html,scripts){
	var scriptTemp = html.getElementsByTagName("script")[0];
	console.log("scriptTemp",scriptTemp);
	if(scriptTemp) {
		scripts.push(scriptTemp.parentNode.removeChild(scriptTemp));
		this.getScriptsTags(html,scripts);
	}
	return scripts;
}
Router.contentRequest = function(url,data,method,callBack) {

	var method	= method ? method : "GET";
	var xhr		= (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	
	xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4 && xhr.status == 200) {
		    // Script
			var scripts = Router.getScriptsTags(xhr.responseXML,[]);
			
			var body = xhr.responseXML.getElementsByTagName("body")[0];
			if(bcPlayer) {
				Router.removeElementId('video');
			}
			if(callBack) {
				callBack.call(body.innerHTML,scripts);
		    }
		    
		    Router.lazyload = document.querySelectorAll('[data-lazyloader]');
		    if(Router.lazyload.length)	Router.lazyloading =  false;
		}
	}
	
	xhr.open(method, url, true);
	xhr.setRequestHeader("Content-type","text/html");
	xhr.setRequestHeader("RequestType","ajax");
	xhr.responseType = "document";
	
	if(data) {
		previous = data.current;
		data = JSON.stringify(data);	
	}
	
	xhr.send(data);

};

// ****************************************************************************
// 2. Get nav elements
// ****************************************************************************
Router.getNavElements = function() {
	var nav = document.getElementsByTagName('nav')[0];
	this.navElements = nav.querySelectorAll('[href]');
};

// ****************************************************************************
// 3. Set Active Navigation Route
// ****************************************************************************
Router.setActive = function(url) {
	var urlArray = url.slice(1).split("/");
	if(this.navElements === undefined) {
		this.getNavElements();
	}
	console.log("urlArray",urlArray);
	for(var i=0; i < this.navElements.length; i++) {
		var href = this.navElements[i].getAttribute("href");
		this.navElements[i].parentElement.removeClass('active');
		
		if(urlArray[0] === ""){
			if(href === "/"){
				this.navElements[i].parentElement.addClass('active');
			}
		} else {
			if(href.indexOf(urlArray[0]) > -1) {
				this.navElements[i].parentElement.addClass('active');
			}
		}
	}
}

// ****************************************************************************
// 4. Lazy Loader Content Load Trigger
// ****************************************************************************
Router.lazyLoader = function(pos){
	var body 			= document.getElementById("body");
    var html 			= document.documentElement;
    var footerHeight 	= document.getElementsByTagName("footer")[0].clientHeight;
    
	var height 			= Math.max( body.scrollHeight, body.offsetHeight, 
                       	  html.clientHeight, html.scrollHeight, html.offsetHeight);
                       	  
    var winHeight		= window.innerHeight;
    var posOffset 		= height - winHeight - footerHeight;
	
	if(pos >= posOffset && !this.lazyloading){
		if(Router.lazyload.length) {
			var next = Router.lazyload[0].dataset.next;
			var tpl = Router.lazyload[0].dataset.tpl;
			var name = Router.lazyload[0].dataset.name;
			if(next) {
				Router.lazyloading = true;
				Router.contentRequest("/pagination?api="+urlEncode(next)+"&tpl="+tpl+"&name="+name,0,"GET",function() {
					// Remove pagination element
					var parent = Router.lazyload[0].parentNode;
					removeElement(Router.lazyload[0]);
					// Insert HTML
					parent.insertAdjacentHTML("beforeend",this);
					Router.lazyloading = false;
				});
			}
		}
		console.log("POS",Router.lazyload);
	}
}


Router.handler = function(obj){
	if(!obj)	return false;
	var uri 	= obj[0];
	var params	= obj[1] ? obj[1] : {};
	var token	= params.token ? params.token : 0;
	
	console.log("*",obj);
	
	var queries	= Router.getQueries();
	var path	= Router.currentRouteUrl();
	
	// Set Active Main Navigvation Item 
	Router.setActive(window.location.pathname);
	
	// Set Active route
	if(queries.playlist) {
		path = Router.currentRouteUrl().replace("show","player").replace("series","player");
		var player = document.getElementById("player");
		if(player){
			player.insertAdjacentHTML('beforeEnd', '<div class="content-loader bg-black"><div class="loader"><div class="spinner"><span class="fal fa-cog fa-spin fa-3x fa-fw"></span></div></div></div>');
		}
	} else {
		// Add Content Overlay
		var content = document.getElementById("content");
		if(content){
			content.insertAdjacentHTML('afterBegin', '<div class="content-loader"><div class="loader"><div class="spinner"><span class="fal fa-cog fa-spin fa-3x fa-fw"></span></div></div></div>');
		}
	}
	
	
	// Load Content Based on Route
	Router.contentRequest(path,0,"GET",function(scripts) {
		/* Add Content load callback actions */
		
		if(queries.playlist) {
			Router.getElementId("player").innerHTML = this; 
		} else {
			// Insert response markup to page
			if(Router.getElementId("content")) {
				Router.getElementId("content").innerHTML = this;
			}
		}
		
		// Insert and execute page Scripts
		if(scripts) {
			for(var s=0; s<scripts.length;s++){
				//scripts[s].id = "pageActions";
				console.log(scripts[s]);
				var script = document.createElement( "script" );
				script.text = scripts[s].innerHTML;
				document.getElementById("body").appendChild( script ).parentNode.removeChild( script );
			}
			//scripts = null;
			
		}
		Router.updatePageLinks();
		var pos 	= window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		if(pos > 82) {
			window.scrollTo(82,0);
		}
		if(ga) {
			ga('send', 'pageview');
		}			
	});
};


// ****************************************************************************
// Set Current Route Variable
// ****************************************************************************
// adding routes
Router.add(/(.*)/, function() {
	Router.handler(arguments);
}).listen();