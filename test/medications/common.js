"use strict";

var chakram     = require("chakram"),
    Q           = require("q"),
    auth        = require("../common/auth.js"),
    patients    = require("../patients/common.js"),
    common      = require("../common/chakram.js");
var expect = chakram.expect;

// verify successful responses
/*eslint-disable key-spacing */
var medicationSchema = {
    required: ["id", "name", "rx_norm", "ndc", "dose", "route", "form", "rx_number",
                "quantity", "type", "schedule", "fill_date", "number_left", "access_anyone",
                "access_family", "access_prime"],
    properties: {
        id:             { type: "number" },
        name:           { type: "string" },
        rx_norm:        { type: "string" },
        ndc:            { type: "string" },
        dose:           {
            type:           ["object", "null"],
            required:       ["quantity", "unit"],
            properties:     {
                quantity:       { type: "number" },
                unit:           { type: "string" }
            }
        },
        route:          { type: "string" },
        form:           { type: "string" },
        rx_number:      { type: "string" },
        fill_date:      { type: ["string", "null"] },
        number_left:    { type: ["number", "null"] },
        quantity:       { type: "number" },
        type:           { type: "string" },
        schedule:       { type: "object" }, // TODO: full schedule schema here
        access_anyone:  { type: "string" },
        access_family:  { type: "string" },
        access_prime:   { type: "string" },
        doctor_id:      { type: ["number", "null"] },
        pharmacy_id:    { type: ["number", "null"] },
        doctor:         { type: ["object", "null"] }, // TODO: full doctor schema here
        pharmacy:       { type: ["object", "null"] } // TODO: full pharmacy schema here
    }
};
/*eslint-enable key-spacing */
var medicationViewSchema = JSON.parse(JSON.stringify(medicationSchema)); // easy deep copy
medicationViewSchema.required.push("doctor");
medicationViewSchema.required.push("pharmacy");
medicationSchema.required.push("doctor_id");
medicationSchema.required.push("pharmacy_id");
common.addApiChain("medication", {
    "createSuccess": function (respObj) {
        expect(respObj).to.be.an.api.postSuccess;
        expect(respObj).to.have.schema(medicationSchema);
    },
    "viewSuccess": function (respObj) {
        expect(respObj).to.be.an.api.getSuccess;
        expect(respObj).to.have.schema(medicationViewSchema);
    },
    "success": function (respObj) {
        expect(respObj).to.be.an.api.getSuccess;
        expect(respObj).to.have.schema(medicationSchema);
    }
});

// helper methods for authentication
// endpoint should be a function taking (patient, medication)
var genAuthorizationTest = function (endpoint, levels) {
    // generate testcase names
    var accessName = function (level, scenario) {
        if (level) return "it gives me access to " + scenario;
        else return "it denies me access to " + scenario;
    };

    // generate entire testcase
    return function (slug, scenario, promisesGetter) {
        it(accessName(levels[slug], scenario), function () {
            return Q.spread(promisesGetter(), function (patient, medication) {
                if (levels[slug]) {
                    // if we should have access check success: true was in response
                    return expect(endpoint(patient, medication)).to.be.an.api.genericSuccess();
                } else {
                    // otherwise check a 403 was returned with the appropriate error slug
                    return expect(endpoint(patient, medication)).to.be.an.api.error(403, "unauthorized");
                }
            });
        });
    };
};
var requiresAuthentication = module.exports.itRequiresAuthentication = function (levels) {
    return function (endpoint) {
        var gen = genAuthorizationTest(endpoint, levels);

        describe("testing authorization", function () {
            // TODO: dry this up with test/patients/common.js
            var patientForMe = function () {
                return auth.createTestUser().then(patients.createMyPatient({}));
            };
            var patientForOther = function () {
                return Q.all([auth.createTestUser(), auth.createTestUser()]).spread(patients.createOtherPatient({}));
            };
            var share = function (access, group) {
                return function (patient) {
                    return Q.nbind(patient.share, patient)(patient.user.email, access, group);
                };
            };
            var setPermission = function (group, access) {
                return function (resource) {
                    // Q.nbind has issues here
                    var deferred = Q.defer();
                    resource.permissions[group] = access;
                    resource.save(function (err) {
                        if (err) return deferred.reject(err);
                        deferred.resolve(resource);
                    });
                    return deferred.promise;
                };
            };
            var createMed = function () {
                return function (patient) {
                    return Q.nbind(patient.createMedication, patient)({
                        name: "testmed"
                    });
                };
            };
            // must save patient after modifiying medication
            var save = function (patientPromise) {
                return function (medication) {
                    return patientPromise.then(function (patient) {
                        // save patient
                        // Q.nbind has issues here
                        var deferred = Q.defer();
                        patient.markModified("medications");
                        patient.save(function (err) {
                            if (err) return deferred.reject(err);
                            deferred.resolve(patient);
                        });
                        return deferred.promise;
                    }).then(function () {
                        // return medication
                        return medication;
                    });
                };
            };

            gen("me", "my patients", function () {
                var p = patientForMe();
                var m = p.then(createMed());
                return [p, m];
            });

            gen("unassociated", "patients not shared with me", function () {
                var p = patientForOther();
                var m = p.then(createMed()).then(save(p));
                return [p, m];
            });

            gen("defWrite", "medications with 'default' when the share has 'write' permissions", function () {
                var p = patientForOther().then(share("write", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "default")).then(save(p));
                return [p, m];
            });

            gen("defRead", "medications with 'default' when the share has 'read' permissions", function () {
                var p = patientForOther().then(share("read", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "default")).then(save(p));
                return [p, m];
            });

            gen("defDefRead", "medications with 'default' when the patient has 'read' permissions", function () {
                var p = patientForOther().then(setPermission("anyone", "read")).then(share("default", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "default")).then(save(p));
                return [p, m];
            });

            gen("defDefWrite", "medications with 'default' when the patient has 'write' permissions", function () {
                var p = patientForOther().then(setPermission("anyone", "write")).then(share("default", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "default")).then(save(p));
                return [p, m];
            });

            gen("none", "medications with 'none'", function () {
                var p = patientForOther().then(share("write", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "none")).then(save(p));
                return [p, m];
            });

            gen("read", "medications with 'read'", function () {
                var p = patientForOther().then(share("write", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "read")).then(save(p));
                return [p, m];
            });

            gen("write", "medications with 'write'", function () {
                var p = patientForOther().then(share("write", "anyone"));
                var m = p.then(createMed()).then(setPermission("anyone", "write")).then(save(p));
                return [p, m];
            });
        });
    };
};
module.exports.itRequiresReadAuthorization = requiresAuthentication({
    unassociated: false,
    me: true,
    defWrite: true,
    defRead: true,
    defDefRead: true,
    defDefWrite: true,
    none: false,
    read: true,
    write: true
});
module.exports.itRequiresWriteAuthorization = requiresAuthentication({
    unassociated: false,
    me: true,
    defWrite: true,
    defRead: false,
    defDefRead: false,
    defDefWrite: true,
    none: false,
    read: false,
    write: true
});
