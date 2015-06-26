// As per README matches the HH:MM format specified in ISO 8601
module.exports.TIME_REGEXP = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;

// Matches all valid ISO 8601 datetimes from
// http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
/*eslint-disable max-len */
module.exports.DATE_REGEXP = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

// From http://stackoverflow.com/questions/4766845
// Match YYYY-MM-DD only
module.exports.DATE_ONLY_REGEXP = new RegExp("^(?:(?:(?:(?:(?:[13579][26]|[2468][048])00)|(?:[0-9]{2}(?:(?:[13579][26])|(?:[2468][048]|0[48]))))-(?:(?:(?:09|04|06|11)-(?:0[1-9]|1[0-9]|2[0-9]|30))|(?:(?:01|03|05|07|08|10|12)-(?:0[1-9]|1[0-9]|2[0-9]|3[01]))|(?:02-(?:0[1-9]|1[0-9]|2[0-9]))))|(?:[0-9]{4}-(?:(?:(?:09|04|06|11)-(?:0[1-9]|1[0-9]|2[0-9]|30))|(?:(?:01|03|05|07|08|10|12)-(?:0[1-9]|1[0-9]|2[0-9]|3[01]))|(?:02-(?:[01][0-9]|2[0-8])))))$");
/*eslint-enable max-len */

// ISO 8601 data format
module.exports.DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ";