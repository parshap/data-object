"use strict";

// Export Model
var Model = module.exports = require("./lib");

// Run Model through all "mixin" functions to add functionality
require("./events")(Model);
require("./attributes")(Model);
require("./middleware")(Model);
require("./persist")(Model);
