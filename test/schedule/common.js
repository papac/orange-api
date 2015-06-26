"use strict";

var chakram     = require("chakram"),
    extend      = require("xtend"),
    common      = require("../common/chakram.js");
var expect = chakram.expect;

// verify successful responses
/*eslint-disable key-spacing */
// one 'event' item within the schedule
var scheduleItemSchema = {
    required: ["type", "date", "medication_id", "took_medication"],
    properties: {
        type:               { type: "string" },
        date:               { type: "string" },
        medication_id:      { type: "number" },
        took_medication:    { type: "boolean" },
        delay:              { type: "number" },
        dose_id:            { type: "number" }
    }
};
// overall schedule stats
var statsSchema = {
    required: ["took_medication", "delay", "delta"],
    properties: {
        took_medication:    { type: ["number", "null"] },
        delay:              { type: ["number", "null"] },
        delta:              { type: ["number", "null"] }
    }
};
var scheduleSchema = {
    required: ["schedule", "statistics"],
    properties: {
        schedule: {
            type:   "array",
            items:  scheduleItemSchema
        },
        statistics: extend(statsSchema, { type: "object" })
    }
};
/*eslint-enable key-spacing */

common.addApiChain("schedule", {
    "success": function (respObj) {
        expect(respObj).to.be.an.api.getSuccess;
        expect(respObj).to.have.schema(scheduleSchema);
    }
});

