"use strict";

// # Model
//
// Models represent units of related application state and logic. This *Model*
// constructor function provides some common functionality for all models. A
// model can be defined by "extending" this constructor function (using the
// `Model.extend` function).
//
// Most behavior is implemented elsewhere (see other files in this directory).

var util = require("util"),
	_ = require("underscore");

// Constructor allows the newly created model object to be given arbitrary
// properties via the `props` parameter.
function Model(attrs) {
	this.trigger("initialize");

	// Add any given attributes
	if (attrs) {
		this.set(attrs);
	}
}

// Extends the given constructor to inherit this class
//
// For example:
//
//     function MyModel() {
//     }
//
//     Model.extend(MyModel);
//
Model.extend = function(ctor) {
	var parent = this;

	// Default constructor if one is not provided
	if ( ! ctor) {
		ctor = function() {
			parent.apply(this, arguments);
		};
	}

	// Set up prototype chain
	util.inherits(ctor, this);

	// Copy any additional constructor properties
	_.extend(ctor, parent);

	return ctor;
};

module.exports = Model;
