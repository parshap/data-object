"use strict";

// ## Model Attributes
//
// Gives Models attributes to hold state. Attributes are set with the
// `Model#set` function and retrieved with the `Model#get` function.
//
// You can see an attribute value has changed since the last time the model
// was saved or loaded with the `Model#isChanged` function.

var _ = require("underscore");

module.exports = function(Model) {
	// `Model#attributes` holds the model's attributes
	Model.on("initialize", function() {
		// Initialize to model's defaults
		this.attributes = this.defaults();
	});

	// `Model#_changed` holds which fields have changed
	// This starts empty and gets reset each time the model is loaded (from
	// the database) or saved (do the database).
	Model.on("initialize save load", function() {
		this._changed = {};
	});

	Model.prototype.defaults = function() {
		return {};
	};

	// Returns if the model's attribute(s) have changed since the last load or
	// save.
	//
	// If called with no arguments, returns if any attributes have changed.
	//
	// If called with an attribute name, returns if that attribute has changed.
	Model.prototype.isChanged = function(name) {
		if (arguments.length === 0) {
			return Object.keys(this._changed).length > 0;
		}

		return this._changed.hasOwnProperty(name);
	};

	// ### Model#get
	//
	// Returns the value of the model's attribute(s).
	//
	// If called with no arguments, all of the model's attributes are
	// returned.
	//
	// If called with a single attribute name, only the value of that
	// attribute is returned.
	//
	// Otherwise, the values of all of the given attribute names are returned.
	Model.prototype.get = function(name) {
		var _get = this._get,
			attrs = this.attributes,
			args = Array.prototype.slice.call(arguments);

		// Returns the value of a single named attribute
		function getOne(name) {
			// Run the value through any getter middleware
			return _get(name, attrs[name]);
		}

		// Returns an object with the values of each named attribute
		function getMulti(names) {
			var mapped = {};

			names.forEach(function(name) {
				mapped[name] = getOne(name);
			});

			return mapped;
		}

		// Return an array of attribute names passed as arguments
		function getArgNames() {
			var names = [];

			// Add each argument to the list of names
			args.forEach(function(value) {
				// Add each element of array arguments
				if (_.isArray(value)) {
					names.push.apply(names, value);
				}
				else {
					names.push(value);
				}
			});

			return names;
		}

		// No arguments - get all attributes
		if (args.length === 0) {
			return getMulti(Object.keys(attrs));
		}

		// A single string key
		else if (args.length === 1 && _.isString(name)) {
			return getOne(name);
		}

		// Multiple keys
		else {
			return getMulti(getArgNames());
		}
	};

	// ### Model#set
	//
	// Sets model attribute value(s)
	//
	// If called with a single argument, each property of the given object
	// is set.
	//
	// If called with two arguments (*name*, *value*) the single attribute
	// is set.
	Model.prototype.set = function(attrs) {
		var _this = this;

		// Sets the value of a single named attribute
		function setOne(name, val) {
			// Run the value through any setter middleware
			val = _this._set(name, val);

			// Only do anything if the value is actually changing
			if ( ! _.isEqual(val, _this.attributes[name])) {
				// Set the attribute value and mark this attribute as changed
				// @TODO Should we track and expose the "previous" value(s)?
				_this.attributes[name] = val;
				_this._changed[name] = true;

				// Trigger a change event for this attribute
				//
				// @TODO Should we trigger a global "change" event in addition
				// to the "change:*name*" event?
				//
				// @TODO Should pass the attribute name and the new
				// (and/or) old value as additional trigger arguments?
				_this.trigger("change:" + name);
			}
		}

		// Set multiple
		if (arguments.length === 1) {
			Object.keys(attrs).forEach(function(name) {
				setOne(name, attrs[name]);
			});
		}
		// Set single
		else {
			setOne(arguments[0], arguments[1]);
		}

		return this;
	};

	// ### Getter and Setter Middleware
	//
	// Runs the value trough any middleware. This starts out as simply
	// returning the value (because no middleware is defined yet). When
	// middleware functions are added, these functions are redefined to run
	// the value through the middleware functions. See `./middleware.js`.
	["_get", "_set"].forEach(function(fnName) {
		Model.prototype[fnName] = function(name, val) {
			return val;
		};
	});

	// ### Model#toJSON
	//
	// Returns a JSON representation of the Model object. This method is
	// intended to be used during JSON serialization.
	Model.prototype.toJSON = function() {
		return this.get();
	};
};
