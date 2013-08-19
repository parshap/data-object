"use strict";

// ## Model Middleware
//
// Middleware allows functions to be run during some specific model tasks.
// There are two types of middleware: *persist middleware* and *getter/setter
// middleware*.
//
// Persist middleware allows functions to be run when a model is created,
// updated, or deleted. These functions are *asynchronous* and are passed a
// *callback* argument that should be called when complete. These functions
// will always have `this` bound the model object performing the persist.
//
// Getter/setter middleware allow functions to change attribute values before
// they are set or retrieved. These functions are *synchronous* and simply
// passed a value and expect a return value. These functions must also execute
// outside of the context of a model object, thus `this` is not bound.
//
// Multiple middleware functions are ran in the order that they were defined.
//
// Middleware is implemented in a functional programming style, adding a new
// middleware will redefine the associated middleware function to call the new
// middleware.
//
// @TODO Should we allow the middleware function being defined to be optionally
// placed at the beginning of the current middleware stack (i.e., called
// before the other middleware functions currently defined)?

module.exports = function(Model) {

	// Defines a middleware function
	Model.use = function(name, fn) {
		var ctor = this;

		// Defines a getter/setter middleware function
		function defineGetSet() {
			var type = name.substr(0, 3), // "get" or "set"
				mAttrName = name.substr(4), // attribute name
				fnName = "_" + type,
				orig = ctor.prototype[fnName];

			// Redefine the middleware functions
			ctor.prototype[fnName] = function(attrName, val) {
				val = orig(attrName, val);

				if (attrName === mAttrName) {
					val = fn(val);
				}

				return val;
			};
		}

		// Defines a persist middleware function
		function definePersist() {
			var orig = ctor.prototype["_" + name];

			// Redefine the middleware functions
			ctor.prototype["_" + name] = function(callback) {
				var _this = this;

				return orig.call(this, function(err) {
					if (err) return callback(err);

					fn.call(_this, callback);
				});
			};
		}

		// Getter/setter middleware
		if (["get:", "set:"].indexOf(name.substr(0, 4)) > -1) {
			defineGetSet();
		}

		// Persist middleware
		else if (["create", "update", "delete"].indexOf(name) > -1) {
			definePersist();
		}

		return this;
	};
};
