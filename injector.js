/**
 * @constructor
 */
function Injector() {
    /**
     * @type {!Object.<string, function(Injector=): !Object>}
     */
    this.factories = {};
    /**
     * @type {!Object.<string, !Object>}
     */
    this.services = {
        '$injector': this
    };

}

/**
 * Adds a service factory.
 * @param {string} key A service key.
 * @param {Function} Klass class
 * @param {function(Injector=): !Object} factory A service factory.
 */
Injector.prototype.addService = function (key, Klass, factory) {
    var self = this;
    console.log('key',key,Klass,factory);
    if (!factory) {
        factory = function () {
            return self.create(Klass);
        };
    }
    this.factories[key] = function () {
        return factory(Klass);
    };
};

/**
 * Returns a service by its key.
 * @param {string|Function} key The key of the service to get.
 * @return {!Object} The service.
 */
Injector.prototype.getService = function (key) {
    var service = this.services[key];
    if (!service) {
        if (!(key in this.factories)) {
            return null;
        }
        service = this.factories[key]();
        this.services[key] = service;
    }
    return service;
};


/**
 * Instantiates the given constructor providing it with its dependencies.
 * @param  {Function} Constructor The constructor function to use.
 * @return {!Object} An instance of the constructor.
 */
Injector.prototype.create = function (Constructor, args) {
    args = args || {};
    var Dependant = function () {
    };
    Dependant.prototype = Constructor.prototype;

    var instance = new Dependant();
    this.inject(Constructor, instance, args);

    return instance;
};

/**
 * Injects dependencies to a constructor in the context of the given instance.
 * @param {Function} Constructor The constructor function to use.
 * @param {!Object} instance The instance to use.
 */
Injector.prototype.inject = function (Constructor, instance, args) {
    //var keys = Constructor.prototype.$deps || [];
    //var deps = keys.map(this.getService, this);
    var deps = [];
    var params = this.getParams(Constructor);
    console.log('params',params);
    params.map(function (param) {
        //console.log('inject',param,this.getService(params));
        deps.push(this.getService(param) || (param in args ? args[param] : undefined));

    }, this);
    switch (deps.length) {
        case 1:
            Constructor.call(instance, deps[0]);
            break;
        case 2:
            Constructor.call(instance, deps[0], deps[1]);
            break;
        case 3:
            Constructor.call(instance, deps[0], deps[1], deps[2]);
            break;
        case 4:
            Constructor.call(instance, deps[0], deps[1], deps[2], deps[3]);
            break;
        case 5:
            Constructor.call(instance, deps[0], deps[1], deps[2], deps[3], deps[4]);
            break;
        default:
            Constructor.apply(instance, deps);
    }

};
/**
 * @method importServices
 * @param {Object} config
 * @param {Boolean} config.amd if it's in amd format
 * @param {Object} config.services
 * @param {String|Function} config.services.cls
 * @param {String} [config.services.scope] required if in amd format
 * @param {String} config.services.factory
 * @param callback
 * @return {*}
 */
Injector.prototype.importServices = function (config,callback) {
    var req = [],keys = [],factories = [],self = this;
    Object.keys(config.services).forEach(function (key) {
        var serv = config.services[key]
            , glb = typeof(global) == 'undefined'?window:global
            , factory = typeof(serv.factory) == "string" ?
            new Function("Constructor", serv.factory) : serv.factory;
        if(typeof(serv.cls) == "function"){
            return this.addService(key,serv.cls,factory);
        }
        if(config.amd){
            req.push(serv.scope.replace(/./g,"/")+"/"+serv.cls);
            keys.push(key);
            factories.push(factory);
            return;
        }

        this.addService(key, !serv.scope?glb[serv.cls]:this.getProp(serv.scope.split("."))[serv.cls], factory);

    }, this);
    if(config.amd){
        return require(req,function(){
            var args = [].slice.call(arguments, 0);
            keys.forEach(function(k,i){
                self.addService(k,args[i],factories[i]);
            });
            callback && callback();
        });
    }
    callback && callback();
};

/**
 *
 * @param {Array} parts
 * @param {Boolean} create
 * @param {Object} [context]
 * @return {*}
 */
Injector.prototype.getProp = function (parts, create, context) {
    var p, i = 0, glb = typeof(global) == 'undefined'?window:global;
    if (!context) {
        if (!parts.length) {
            return glb;
        } else {
            p = parts[i++];

            context = p in glb ? glb[p] : (create ? glb[p] = {} : undefined);
        }
    }
    while (context && (p = parts[i++])) {
        context = (p in context ? context[p] : (create ? context[p] = {} : undefined));
    }
    return context; // mixed
};

Injector.prototype.getParams = function (fn) {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    function annotate(fn) {
        var $inject,
            fnText,
            argDecl,
            last;

        if (typeof fn == 'function') {
            if (!($inject = fn.$inject)) {
                $inject = [];
                fnText = fn.toString().replace(STRIP_COMMENTS, '');
                argDecl = fnText.match(FN_ARGS);
                argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
                    arg.replace(FN_ARG, function (all, underscore, name) {
                        $inject.push(name);
                    });
                });
                fn.$inject = $inject;
            }
        } else if (Array.isArray(fn)) {
            last = fn.length - 1;
            //assertArgFn(fn[last], 'fn')
            $inject = fn.slice(0, last);
        } else {
            //assertArgFn(fn, 'fn', true);
        }
        return $inject;
    }

    return annotate(fn);
};
