// ****************************************************************************
// REQUIRED JAVASCRIPT FILES
// Codekit is being used to prepend, compile and compress the javascript files 
// ****************************************************************************

// @codekit-prepend "swiper.js";
// @codekit-prepend "global.js";
// @codekit-prepend "TMPRouter.min.js";

// ****************************************************************************
// MAIN NAVIGATION FUNCTION
// Open close main navigation
// ****************************************************************************

var openCloseNav = function(state) {
	var header = document.getElementsByTagName('header')[0];
	if (header.hasClass('active') || state == "close") {
        header.removeClass('active');
    } else {
         header.addClass('active');
    }
};

// ****************************************************************************
// TOGGLE FUNCTION
// Use to toggle a class on and off
// ****************************************************************************

var toggle = function(btn,id,className) {
	console.log(btn);
	var element = document.getElementById(id);
	if (element.hasClass(className)) {
        element.removeClass(className);
        if(btn.hasClass('toggle')) {
			btn.parentElement.removeClass('active');
		}
    } else {
		element.addClass(className);
		if(btn.hasClass('toggle')) {
			btn.parentElement.addClass('active');
		}
    }
};


var urlEncode = function (text) {
        return encodeURIComponent(text).replace(/!/g,  '%21')
                                       .replace(/'/g,  '%27')
                                       .replace(/\(/g, '%28')
                                       .replace(/\)/g, '%29')
                                       .replace(/\*/g, '%2A')
                                       .replace(/%20/g, '+');
}

var replaceElement = function(element,markup) {
	element.parentNode.replaceChild(element, replace);
}

var removeElement = function(element) {
	element.parentNode.removeChild(element)
}




// ****************************************************************************
// FOCUS ELEMENT FUNCTION
// Use to toggle a class on and off
// ****************************************************************************

var focusElement = function(id) {
	document.getElementById(id).focus();
};

// ****************************************************************************
// GET PAGE ELEMENT BY ID
// ****************************************************************************

// getElementById wrapper
var $id = function(id) {
	return document.getElementById(id);
};

// ****************************************************************************
// AJAX PAGE ROUTER
// This enables content to be loaded dynamically. The router uses the Pushstate
// to captuer the route changes and pass the requests to the serverside route
// manger. 
// ****************************************************************************
router = new TMPRouter(document.location.origin, false);

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

router.contentRequest = function(url,data,method,callBack) {

	var method	= method ? method : "GET";
	var xhr		= (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	
	xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4 && xhr.status == 200) {
		    // Script
			var scriptTemp = xhr.responseXML.getElementsByTagName("script");
			
			if(scriptTemp.length) {
				var scripts = [];
				for(var s=0; s<scriptTemp.length;s++){
					scripts.push(scriptTemp[s].parentNode.removeChild(scriptTemp[s]));
				}
				 
				//var script = scriptTemp[0].parentNode.removeChild(scriptTemp[0]);
			}
			
			var body = xhr.responseXML.getElementsByTagName("body")[0];
			
			if(callBack) {
				callBack.call(body.innerHTML,scripts);
		    }
		    
		    router.lazyload = document.querySelectorAll('[data-lazyloader]');
		    if(router.lazyload.length)	router.lazyloading =  false;
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
router.getNavElements = function() {
	var nav = document.getElementsByTagName('nav')[0];
	this.navElements = nav.querySelectorAll('[href]');
};

// ****************************************************************************
// 3. Set Active Navigation Route
// ****************************************************************************
router.setActive = function(url) {
	var urlArray = url.split("/");
	if(this.navElements === undefined) {
		this.getNavElements();
	}
	
	for(var i=0; i < this.navElements.length; i++) {
		var href = this.navElements[i].getAttribute("href");
		this.navElements[i].parentElement.removeClass('active');
		
		if(urlArray.length > 1) {
			if(href.indexOf(urlArray[1]) > -1) {
				this.navElements[i].parentElement.addClass('active');
			}
		} else {
			if(href === "/") {
				this.navElements[i].parentElement.addClass('active');
			}
		}
	}
	
	
}

// ****************************************************************************
// 4. Lazy Loader Content Load Trigger
// ****************************************************************************
router.lazyLoader = function(pos){
	var body 			= document.getElementById("body");
    var html 			= document.documentElement;
    var footerHeight 	= document.getElementsByTagName("footer")[0].clientHeight;
    
	var height 			= Math.max( body.scrollHeight, body.offsetHeight, 
                       	  html.clientHeight, html.scrollHeight, html.offsetHeight);
                       	  
    var winHeight		= window.innerHeight;
    var posOffset 		= height - winHeight - footerHeight;
	
	if(pos >= posOffset && !this.lazyloading){
		if(router.lazyload.length) {
			var next = router.lazyload[0].dataset.next;
			var tpl = router.lazyload[0].dataset.tpl;
			var name = router.lazyload[0].dataset.name;
			if(next) {
				this.lazyloading = true;
				this.contentRequest("/pagination?api="+urlEncode(next)+"&tpl="+tpl+"&name="+name,0,"GET",function() {
					// Remove pagination element
					var parent = router.lazyload[0].parentNode;
					removeElement(router.lazyload[0]);
					// Insert HTML
					parent.insertAdjacentHTML("beforeend",this);
					router.lazyloading = false;
				});
			}
		}
		console.log("POS",router.lazyload);
		
	}
}

router.handler = function(params,query){
	var queries = {};
	// Set Active Main Navigvation Item 
	router.setActive(router._lastRouteResolved.url);
	
	// Set Active route 
	router.currentRoute = router._lastRouteResolved.url;
	if(router._lastRouteResolved.query) {
		router.currentRoute += "?" + router._lastRouteResolved.query;
		
		queries = router._lastRouteResolved.query;
		queries?JSON.parse('{"' + queries.replace(/&/g, '","').replace(/=/g,'":"') + '"}',function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
	
	}
	
	var path = router.currentRoute;
	
	console.log(params,query,queries,router.currentRoute,query);
	if(queries.playlist) {
		path = router.currentRoute.replace("show","player");
	} else {
		// Add Content Overlay
		var content = document.getElementById("content");
		content.insertAdjacentHTML('afterbegin', '<div class="content-loader"><div class="loader"><div class="spinner"><span class="fal fa-cog fa-spin fa-3x fa-fw"></span></div></div></div>');
	}
	
	
	// Load Content Based on Route
	router.contentRequest(path,0,"GET",function(scripts) {
		/* Add Content load callback actions */
		
		if(queries.playlist) {
			$id("player").innerHTML = this; 
		} else {
			// Insert response markup to page
			$id("content").innerHTML = this; 
		}
		
		// Insert and execute page Scripts
		if(scripts) {
			for(var s=0; s<scripts.length;s++){
				scripts[s].id = "pageActions";
			
				var script = document.createElement( "script" );
				script.text = scripts[s].innerHTML;
				document.head.appendChild( script ).parentNode.removeChild( script );
			}
			scripts = null;
			
		}
		router.updatePageLinks();				
	});
};


// ****************************************************************************
// Set Current Route Variable
// ****************************************************************************
router.currentRoute = document.location.pathname;
router.on("/show/:showid/:id",function(params,query) {
	router.handler(params,query);
});	
// Global Route Event Handler
router.on("*",function(params,query) {
	router.handler(params,query);
});

// ****************************************************************************
// Enable Router after page load
// ****************************************************************************
// Use timeout or onload event to trigger route setup functions.
window.onload = function(){
	//router.resolve(); Only enable if using s3 bucket to host index file. 
	router.lazyload = document.querySelectorAll('[data-lazyloader]');
	console.log("lazyload",router.lazyload);
	router.updatePageLinks();
	
	// ****************************************************************************
	// ADD SITE LISTENERS
	// ****************************************************************************
	// 1. VERTICAL PAGE SCROLL LISTENER
	// Controls page header resize function and pagination lazy loader actions
	// ****************************************************************************
	
	document.addEventListener("scroll", function(e) {
		var body 	= document.getElementById('body');
	    var pos 	= window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		
		if(router.lazyload.length) {
			router.lazyLoader(pos);
		} 
		
		if(pos > 27) {
			body.addClass('header-min');
		} else {
			body.removeClass('header-min');
		}
		
		
	});
	

	// Add search event listener.
	document.getElementById("search").addEventListener("submit", function(e) {
		e.preventDefault();    //stop form from submitting
		var term = document.getElementById("term").value;
		router.navigate(this.getAttribute('action')+"?term="+term);
	});
	
};

// ****************************************************************************