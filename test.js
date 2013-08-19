var test = require("tape"),
	Model = require("./lib/model"),
	_ = require("underscore");

// @TODO Add tests for middleware

test("should keep track of changed attributes", function(t) {
	var model = new Model();

	t.ok( ! model.isChanged());
	t.ok( ! model.isChanged("test"));

	model.set({ test: "foo" });

	t.ok(model.isChanged());
	t.ok(model.isChanged("test"));
	t.ok( ! model.isChanged("test2"));

	// Should not be considered changed right after loading from db
	model.fromDB({});

	t.ok( ! model.isChanged());
	t.end();
});

test("should set and get attribute values", function(t) {
	var model = new Model();

	t.ok(Object.keys(model.get()).length === 0);
	t.ok(model.get("foo") === undefined);

	model.set({
		foo: 1,
		bar: 2,
	});

	t.ok(model.get("foo") === 1);
	t.ok(_.isEqual(model.get("foo", "bar"), { foo: 1, bar: 2}));
	t.ok(_.isEqual(model.get(), { foo: 1, bar: 2 }));
	t.ok(_.isEqual(model.get(["foo"]), { foo: 1 }));
	t.end();
});

// -- Events
test("should trigger initialize when created", function(t) {
	var MyModel = Model.extend(),
		called = false;

	MyModel.on("initialize", function() {
		called = true;
	});

	var model = new MyModel();

	t.ok(called);
	t.end();
});

// @TODO: Add tests for other events triggering (e.g., create, save)

test("should listeners trigger in order", function(t) {
	var MyModel = Model.extend(),
		model = new MyModel(),
		count = 0;

	MyModel.on("test", function() {
		count += 1;
		t.ok(count === 1);
	}).on("test", function() {
		count += 1;
		t.ok(count === 2);
	});

	model.trigger("test");

	t.ok(count === 2);
	t.end();
});

test("should only trigger on the listening class", function(t) {
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
		t.ok(false);
	});

	model1.trigger("foo");
	t.ok(called);
	t.end();
});

test("should trigger multiple whitespace-separated events", function(t) {
	var MyModel = Model.extend(),
		model = new MyModel(),
		count = 0;

	MyModel.on("foo bar", function() {
		count += 1;
	});

	model.trigger("foo").trigger("bar");

	t.ok(count === 2);
	t.end();
});
