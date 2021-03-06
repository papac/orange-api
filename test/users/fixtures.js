"use strict";

var mongoose  = require("mongoose"),
    Monky     = require("../common/monky.js");

var monky = module.exports = new Monky(mongoose);

/*eslint-disable key-spacing */
monky.factory("User", {
    email:          "foo#n@bar.com",
    phone:          "6177140000",
    password:       "password",
    rawPassword:    "password",
    first_name:     "Foo #n",
    last_name:      "Bar"
});
/*eslint-enable key-spacing */
