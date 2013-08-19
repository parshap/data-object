"use strict";

// ## Model Persisting
//
// Allows for models to be persisted to a database layer through the use of
// persist middleware functions.
//
// This implementation expects the model to be given a primary id as the `_id`
// attribute when the model is created.
//
// `Model#create` and `Model#update` are called to create or update a model at
// the database layer. `Model#save` is provided as a convenience to
// automatically call create or update depending on the model's state.
//
// `Model#delete` deletes the model from the database layer.
//
// ### Events
//
// Creating and updating trigger a `create` or `update` respectively in
// addition to a "save" event which both trigger.
//
// Deleting a model triggers a `delete` event.
//
// A `load` event is triggered when values are loaded from the database into
// the model.

module.exports = function(Model) {

	// A helper function that returns a callback function to be used as the
	// callback to persist middleware. If the persist action was successful
	// the events are triggered.
	function triggerAndCallback(model, events, callback) {
		return function(err) {
			if ( ! err) {
				events.forEach(function(event) {
					model.trigger(event);
				});
			}

			if (callback) {
				callback(err);
			}
		};
	}

	// ### Persist Functions
	//
	// Create, Update, and Delete
	//
	// These functions perform the persist action (given the state of the
	// model is valid), trigger events, run middleware, and call the passed
	// callback when done.
	//
	// Two types of errors can occur with calls to persist functions:
	//
	//  1. If the state of the model is not valid for the action, an error
	//     immediately thrown persist middleware is never ran.
	//
	//  2. If an error occurs in the middleware, the callback is called with
	//     the error object and the middleware stops running.
	//
	// See persist middleware implementation in `./middleware.js` for further
	// details.

	Model.prototype.create = function(callback) {
		// Make sure this model has *not* been previously created
		if (this.isCreated()) {
			throw new Error("Model must not have been previously created");
		}

		// Validate before saving to the database
		this.validate();

		// Trigger "before" events
		this.trigger("before-create");
		this.trigger("before-save");

		// Run middleware and call the callback when done
		this._create(triggerAndCallback(this, ["create save"], callback));

		return this;
	};

	Model.prototype.update = function(callback) {
		// Make sure this model has been previously created
		if ( ! this.isCreated()) {
			throw new Error("Model must be created before updating");
		}

		// Validate before saving to the database
		this.validate();

		// Trigger "before" events
		this.trigger("before-update");
		this.trigger("before-save");

		// Run middleware and call the callback when done
		this._update(triggerAndCallback(this, ["update save"], callback));

		return this;
	};

	Model.prototype.delete = function(callback) {
		// Make sure this model has been previously created
		if ( ! this.isCreated()) {
			throw new Error("Model must be created before deleting");
		}

		// Trigger "before" event
		this.trigger("before-delete");

		// Run middleware and call the callback when done
		this._delete(triggerAndCallback(this, ["delete"], callback));

		return this;
	};

	// Save simply calls create or update
	Model.prototype.save = function(callback) {
		var _this = this;

		return this[this.isCreated() ? "update" : "create"](callback);
	};

	// Create "noop" middleware functions as no middleware has been defined
	// yet. These functions are later redefined to run middleware functions
	// when middleware is defined. See `./middleware.js` for more details.
	["create", "update", "delete"].forEach(function(fnName) {
		var mFnName = "_" + fnName;

		Model.prototype[mFnName] = function(callback) {
			// Ensure "async" behavior
			process.nextTick(callback);
		};
	});

	// Validates the current state of the model, throwing an error if
	// validation fails
	Model.prototype.validate = function() {
		return this;
	}

	// Returns whether or not this model has been created
	Model.prototype.isCreated = function() {
		return !! this.attributes._id;
	};

	// Returns a representation of the model object intended to be used when
	// saving to the database.
	Model.prototype.toDB = function() {
		return this.attributes;
	};

	// Loads this model's attribute values from the database
	// @TODO What can happen if this function is called twice on a model? Will
	// this happen? Is it needed? It may put the model is an inconsistent
	// state?
	Model.prototype.fromDB = function(attrs) {
		this.attributes = attrs;
		this.trigger("load");

		return this;
	};

	// "Override" the `Model#toJSON` function to rename the  `_id` attribute
	// to `id`.
	var origToJSON = Model.prototype.toJSON;
	Model.prototype.toJSON = function() {
		var attrs = origToJSON.call(this);

		if (attrs._id) {
			attrs.id = attrs._id;
			delete attrs._id;
		}

		return attrs;
	};
};
