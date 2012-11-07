"use strict";

// Export Model
var Model = module.exports = require("./model");

// Run Model through all "mixin" functions to add functionality
require("./events")(Model);
require("./attributes")(Model);
require("./middleware")(Model);
require("./persist")(Model);
