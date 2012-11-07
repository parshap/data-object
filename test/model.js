var assert = require("assert"),
	Model = require("../lib/model"),
	_ = require("underscore");

describe("Model", function() {
	describe("Attributes", function() {
		it("should keep track of changed attributes", function() {
			var model = new Model();

			assert( ! model.isChanged());
			assert( ! model.isChanged("test"));

			model.set({ test: "foo" });

			assert(model.isChanged());
			assert(model.isChanged("test"));
			assert( ! model.isChanged("test2"));

			// Should not be considered changed right after loading from db
			model.fromDB({});

			assert( ! model.isChanged());
		});

		it("should set and get attribute values", function() {
			var model = new Model();

			assert(Object.keys(model.get()).length === 0);
			assert(model.get("foo") === undefined);

			model.set({
				foo: 1,
				bar: 2,
			});

			assert(model.get("foo") === 1);
			assert(_.isEqual(model.get("foo", "bar"), { foo: 1, bar: 2}));
			assert(_.isEqual(model.get(), { foo: 1, bar: 2 }));
			assert(_.isEqual(model.get(["foo"]), { foo: 1 }));
		});
	});

	describe("Events", function() {
		it("should trigger initialize when created", function() {
			var MyModel = Model.extend(),
				called = false;

			MyModel.on("initialize", function() {
				called = true;
			});

			var model = new MyModel();

			assert(called);
		});

		// @TODO: Add tests for other events triggering (e.g., create, save)

		it("should listeners trigger in order", function() {
			var MyModel = Model.extend(),
				model = new MyModel(),
				count = 0;

			MyModel.on("test", function() {
				count += 1;
				assert(count === 1);
			}).on("test", function() {
				count += 1;
				assert(count === 2);
			});

			model.trigger("test");

			assert(count === 2);
		});

		it("should only trigger on the listening class", function() {
			var MyModel1 = Model.extend(),
				MyModel2 = Model.extend(),
				model1 = new MyModel1(),
				called = false;

			// Should trigger
			MyModel1.on("foo", function() {
				called = true;
			});

			// Should not trigger
			MyModel2.on("foo", function() {
				assert(false);
			});

			model1.trigger("foo");
			assert(called);
		});

		it("should trigger multiple whitespace-separated events", function() {
			var MyModel = Model.extend(),
				model = new MyModel(),
				count = 0;

			MyModel.on("foo bar", function() {
				count += 1;
			});

			model.trigger("foo").trigger("bar");

			assert(count === 2);
		});
	});

	// @TODO Add tests for middleware
});
