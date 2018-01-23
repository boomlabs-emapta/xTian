// ****************************************************************************
// REQUIRED JAVASCRIPT FILES
// Codekit is being used to prepend, compile and compress the javascript files 
// ****************************************************************************

// @codekit-prepend "prepend/swiper.js";
// @codekit-prepend "prepend/global.js";
// @codekit-prepend "prepend/route/routeManager.js";
// @codekit-prepend "prepend/route/routes.js";

// ****************************************************************************
// MAIN NAVIGATION FUNCTION
// Open close main navigation
// ****************************************************************************
var bcPlayer;
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
		
		document.getElementsByClassName('content-overlay')[0].addEventListener("click", function(){
			element.removeClass(className);
	        if(btn.hasClass('toggle')) {
				btn.parentElement.removeClass('active');
			}
		});
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
// Enable Router after page load
// ****************************************************************************
// Use timeout or onload event to trigger route setup functions.
window.onload = function(){
	//router.resolve(); Only enable if using s3 bucket to host index file. 
	Router.lazyload = document.querySelectorAll('[data-lazyloader]');
	Router.updatePageLinks();
	
	// ****************************************************************************
	// ADD SITE LISTENERS
	// ****************************************************************************
	// 1. VERTICAL PAGE SCROLL LISTENER
	// Controls page header resize function and pagination lazy loader actions
	// ****************************************************************************
	
	document.addEventListener("scroll", function(e) {
		var body 	= document.getElementById('body');
	    var pos 	= window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		
		if(Router.lazyload.length) {
			Router.lazyLoader(pos);
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
		Router.navigate(this.getAttribute('action')+"?term="+term);
		document.getElementById("body").removeClass('show-search');
		document.getElementById("term").value = "";
	});
	
};

// ****************************************************************************