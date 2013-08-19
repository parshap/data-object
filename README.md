# Model

A base class to provide common functionality for all models.


## Attributes

Attributes are the model's persisted state.

#### Set multiple values

    employee.set({
      name: "Dominic",
      wage_history: [ 55, 45, 38, ],
    });

#### Set a single value

    employee.set("dob", new Date(1974, 2, 14))

#### Get a single value

    employee.get("name")

#### Get multiple values

    employee.get() // Returns all attributes
    employee.get(["name", "age"]) // -> { name, age }
    employee.get("name", ["age", "gender"]) // -> { name, age, gender }
	mployees.get(["name"]) // -> { name }

### Changed values

You can check to see if a model's attributes' value has changed since
the last save.

    employee.isChanged() // `true` if any attributes have changed
    employee.isChanged("name") // `true` if the *name* attribute has changed

### Attribute Aliases

Attributes can also be fetched using an alias.

    employee.alias(":id", "_id") // define the alias
    employee.get(":id") // returns `_id` value

### Attribute Middleware

Attributes can have a set of "middleware" functions that can process the
value (or perform other tasks) when getting or setting attribute values.

    employee.use("set:name", function(value) {
      // Uppercase first letter
      return value[0].toUpperCase() + value.slice(1)
    })

Values are passed between middleware functions in the order that they
are defined.

@TODO: Should there be JSON and DB specific attribute middleware?


## Middleware

 * `create`
 * `update`
 * `delete`


## Events

 * `initialize`
 * `load`
 * `create`
 * `update`
 * `delete`
 * `save`


## Validation

The `Model#validate` function is called before a save (create or update)
occurs. This function should throw an error if the state of the model is
not valid for saving to the database.
