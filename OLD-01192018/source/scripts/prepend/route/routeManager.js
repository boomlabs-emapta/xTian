/* 
# BOOMLABS PUSHSTATE ROUTE MANAGER
# Based on some opencode and extended to work with twig templates
*/

var Router = {
    routes: [],
    mode: null,
    root: '/',
    config: function(options) {
        this.mode = options && options.mode && options.mode == 'history' 
                    && !!(history.pushState) ? 'history' : 'hash';
        this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
        return this;
    },
    serialize : function(obj, prefix) {
		var str = [], p;
		for(p in obj) {
			if (obj.hasOwnProperty(p)) {
				var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
				str.push((v !== null && typeof v === "object") ? this.serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
			}
		}
		return str.join("&");
	},
    getFragment: function() {
        var fragment = '';
        if(this.mode === 'history') {
            fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
            fragment = fragment.replace(/\?(.*)$/, '');
            fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
        } else {
            var match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        return this.clearSlashes(fragment);
    },
    clearSlashes: function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    add: function(re, handler) {
        if(typeof re == 'function') {
            handler = re;
            re = '';
        }
        this.routes.push({ re: re, handler: handler});
        return this;
    },
    remove: function(param) {
        for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                this.routes.splice(i, 1); 
                return this;
            }
        }
        return this;
    },
    flush: function() {
        this.routes = [];
        this.mode = null;
        this.root = '/';
        return this;
    },
    check: function(f) {
        var fragment = f || this.getFragment();
        for(var i=0; i<this.routes.length; i++) {
            var match = fragment.match(this.routes[i].re);
            if(match) {
                match.shift();
                var params = this.getQueries();
                console.log("params",params);
                if(params){
                	match.push(params);
                }
                this.routes[i].handler.apply({}, match);
                return this;
            }           
        }
        return this;
    },
    objToString : function objToString(obj) {
	    if(!obj) return false;
		return JSON.stringify(obj);
    },
    validatePathChange : function validatePathChange(pathA,pathB,paramA,paramB) {
	    if(pathA !== pathB) return true;
	    if(paramA || paramB) {
		    if(pathA === pathB && paramA !== paramB) return true;
	    }
	    return false;
    },
    listen: function() {
        var self = this;
        var current = self.getFragment();
        var params = self.getQueries();
		self.params = params;
			
			
        var fn = function() {
	        if(self.validatePathChange(current,self.getFragment(),self.objToString(self.params),self.objToString(self.getQueries()))) {
                current = self.getFragment();
                self.params = self.getQueries();
                self.check(current);
            }
            
        }
        clearInterval(this.interval);
        this.interval = setInterval(fn, 100);
        return this;
    },
    navigate: function(path) {
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    },
    getElementId : function getElementId(id) {
		return document.getElementById(id);
	},
	removeElementId : function getElementId(id) {
		var el = document.getElementById(id);
		el.parentNode.removeChild(el);
	},
    findElements: function findElements(parentId,className) {
	    if(!parentId || !className) return false;
	    return [].slice.call(this.getElementId(parentId).getElementsByClassName(className));
	},
    findLinks: function findLinks(id) {
	    return [].slice.call(document.querySelectorAll(id ||'[data-router]'));
	},
	getLinkPath: function getLinkPath(link) {
		return link.pathname+link.search || link.getAttribute('href');
	},
    updatePageLinks: function updatePageLinks() {
		var self = this;
		
		if (typeof document === 'undefined') return;
		
		self.findLinks().forEach(function (link) {
			if (!link.hasListenerAttached) {
				link.addEventListener('click', function (e) {
					var location = self.getLinkPath(link);
		
					if (!self.destroyed) {
						e.preventDefault();
						self.navigate(location.replace(/\/+$/, '').replace(/^\/+/, '/'));
			  		}
				});
				link.hasListenerAttached = true;
			}
		});
	},
    getQueries : function getQueries() {
    	if(window.location.href.indexOf('?') >= 0){
	    	var urlParams;
			var match,
	        pl     = /\+/g,  // Regex for replacing addition symbol with a space
	        search = /([^&=]+)=?([^&]*)/g,
	        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	        query  = window.location.search.substring(1);
	
			urlParams = {};
			while (match = search.exec(query))
				urlParams[decode(match[1])] = decode(match[2]);

			return urlParams;
    	}
		return false;
	},
	getQueryString : function() {
    	if(window.location.href.indexOf('?') >= 0){
	    	return window.location.search.substring(1);
    	}
		return false;
	},
    currentRouteUrl: function() {
	    //var obj = this.getQueries();
	    var url = window.location.pathname;
	    if(window.location.search){
		    url += window.location.search
	    }
		return url;
    }
}