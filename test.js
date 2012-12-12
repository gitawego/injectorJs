// --- prepare test data
function Backend(ponny) {
    console.log('@Backend ctor - ' + ponny.speak());
}
Backend.prototype.draw = function () {
    return "drawn";
};
var Application = {
    Ponny: function (no) {
        console.log('@Ponny ctor - ' + no);
        this.speak = function () {
            return "moooo...";
        };
    },
    Test:function(){
        this.info = 'test info';
    }
};
function Renderer(backend, test) {
    console.log("test", test, backend);
    console.log('@Renderer ctor - ' + backend.draw());
}

var test1 = function () {
    function Ponny(no) {
        console.log('@Ponny ctor - ' + no);
    }
    Ponny.prototype.speak = function () {
        return "moooo...";
    };
// --- configure it
    var injector = new Injector();
    injector.addService("backend", Backend);
    injector.addService("ponny", Ponny, function (Ponny) {
        return new Ponny(123);
    });
// -- run it
    var renderer = injector.create(Renderer, {
        "test": 1
    });
    console.log(renderer,injector);
};


//another test

var test2 = function(){

    var config = {
        "amd":false,
        "services":{
            //in global
            "backend": {
                "cls": "Backend"
            },
            "ponny": {
                "cls": "Ponny",
                "scope": "Application",
                "factory": "return new Constructor(123)"
            },
            "test": {
                "cls": "Test",
                "scope": "Application"
            }
        }
    };
    var injector = new Injector();
    injector.importServices(config,function(){
        var renderer = injector.create(Renderer);
        console.log(renderer,injector);
    });

};
