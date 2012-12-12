injectorJs
==========

A simple [Dependency Injector][DI] in Javascript, based on Jan Kuča's [injector.js][DI-JS].

Feature:
* support AMD
* it can import services based on a configuration
* a dependant can be instantiated with custom method (instead of simply using new Dependant())
* when instantiate a class, none-dependant parameters can be passed as well.

[DI-JS]:http://blog.jankuca.com/post/23066002249/dependency-injection-javascript
[DI]:http://en.wikipedia.org/wiki/Dependency_injection
