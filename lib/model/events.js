"use strict";

// ## Model Events
//
// Adds event functionality to `Model`. Models can listen to events via the
// `Model.on` function, and model objects can trigger events with the
// `Model#trigger` function.
//
// Events are implemented in a functional programming style, adding a new
// listener will redefine the trigger function to call the listener callback.

module.exports = function(Model) {

	// Adds *callback* as a listener on the whitespace-separated list of
	// *events*. The callback is called any time a model object triggers one
	// of the named events. In the callback, `this` is bound to the model
	// object triggering the event.
	Model.on = function(events, callback) {
		var ctor = this;

		// Adds a listener for the given single event
		function addListener(event) {
			var orig = ctor.prototype.trigger;

			// Redefine the model's trigger function call our listener
			ctor.prototype.trigger = function(triggeredEvent) {
				orig.apply(this, arguments);

				// Only call when it's our event:w
				if (triggeredEvent === event) {
					// Call the listener, passing any additional parameters
					callback.apply(this, Array.prototype.slice.call(arguments, 1));
				}

				return this;
			};
		}

		// Split the whitespace separated list of events and add a listener
		// for each of them.
		events.trim().split(/\s+/).forEach(function(event) {
			addListener(event);
		});

		return this;
	};

	// The trigger function starts as a noop as no event listenered have been
	// added yet. When an event listener is added, this function is redefined
	// to call the listener.
	Model.prototype.trigger = function() {
		return this;
	};
};
