// ****************************************************************************
// GLOBAL FUNCTIONS
// ****************************************************************************
Node.prototype.getElementsByAttributeValue = function(attribute, value){
    var dom = this.all || this.getElementsByTagName("*");
    var match = new Array();
    for (var i in dom) {
        if ((typeof dom[i]) === "object"){
            if (dom[i].getAttribute(attribute) === value){
                match.push(dom[i]);
            }
        }
    }
    return match;
};

Node.prototype.hasClass = function(className) {
	if (this.classList) {
		return this.classList.contains(className);
	} else {
		return !!this.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
	}
};

Node.prototype.addClass = function(className) {
	if (this.classList) {
		this.classList.add(className);
	} else if (!hasClass(className)) {
		this.className += " " + className;
	}
};

Node.prototype.removeClass = function(className) {
	if (this.classList){
		this.classList.remove(className);
	} else if (hasClass(className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		this.className=this.className.replace(reg, ' ');
	}
};