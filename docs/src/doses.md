# Group Dose Events
A dose event is when the patient takes their medication (either when they're
supposed to, _adhering_, or not, _non-adhering_) or skips their medication.

## Dose Events Collection [/patients/{patientid}/doses]
### Create an Event [POST]
Store details of a new dose event (e.g., when a patient signifies they've
taken their medication or skipped it). The current user will need write access to
**both** the patient and the medication.

+ Parameters
    + patientid (integer, required)

        unique ID of the patient (*url*)
    + medication_id (integer, required)

        unique ID of the medication for which the patient has adhered
    + date (string, required, `2015-05-31T19:27:09+00:00`)

    + dose (dictionary, optional)
        
        Dose of medication the patient should take. Formatted as
        `{quantity: QUANTITY, unit: UNIT}` where `QUANTITY` is numeric
        and `UNIT` is a string (e.g., `"mg"`)
        
        ISO 8601 combined date-time in UTC representing the date and time at which
        _the patient took the medication_
    + taken (boolean, required)

        Boolean representing whether the user took their medication (i.e., `true` if
        they took it, `false` if this dose event represents them *skipping* their
        medication)
    + scheduled (integer, optional)

        Integer representing the ID of a schedule event corresponding to the patient taking their medication.
        These are the same IDs used to set notification settings at the
        `/patients/{patientid}/medications/{medicationid}/times/{timeid}` endpoints. If this is not set for a
        dose, the matcher will assume the medication was taken for an `unspecified` schedule event or was
        taken out of schedule (as would be the case normally with an `as_needed` medication).

    + notes (string, optional)

        free-text field for things such as observations and reactions recorded by the patient

+ Request
    + Headers

            Authorization: Bearer ACCESS_TOKEN

    + Body
    
            {
                medication_id: 1,
                date: "2015-05-31T19:27:09+00:00",
                taken: true,
                scheduled: 3,
                notes: "Feeling sleepy now!"
            }

+ Response 201
    Errors
    + `access_token_required` (401) - no access token specified in
    `Authorization` header
    + `invalid_access_token` (401) - the access token specified is invalid
    + `invalid_date` (400) - the date field specified is not in valid ISO 8601 format
    + `invalid_medication_id` (400) - no medication with the specified ID can be found
    + `unauthorized` (403) - the current user does not have write access to this patient
    + `invalid_patient_id` (404) - a patient with the specified ID was not found
    + `taken_required` (400) - a value is not specified (it should be a boolean) for `taken`
    + `invalid_taken` (400) - `taken` is not a valid boolean
    + `invalid_scheduled` (400)

        `scheduled` is not a valid integer corresponding to an event with that ID in the schedule
        for the medication (with ID `medication_id`)

    + Body

            {
                id: 1,
                medication_id: 1,
                date: "2015-05-31T19:27:09+00:00",
                notes: "Feeling sleepy now!",
                taken: true,
                scheduled: 3,
                success: true
            }

### Retrieve all Doses [GET]
Get a list of all dose events for the patient. Includes full information on each,
but `medication_id` is not expanded out into `medication`. To get a successful
response from this endpoint, the user will need read access to the patient.
Further, only dose events for which the user has read access to the medication
will be shown.

+ Parameters
    + patientid (integer, required)

        unique ID of the patient
    + limit (integer, optional)

        Maximum number of results to return. Defaults to 25.

    + offset (integer, optional)

         Number of initial results to ignore (used in combination with `limit`)
         for pagination. Defaults to 0.

    + sort_by (string, optional)
    
        Field to sort results by. Must by either `id` or `date`, and defaults
        to `id`.

    + sort_order (string, optional)
    
        The order to sort results by: either `asc` or `desc`. Defaults to
        `asc`.

    + start_date (string, optional)

        Restrict results to events that took place after this date. Must be
        a valid ISO 8601 datetime. Defaults to 0.

    + end_date (string, optional)

        Restrict results to events that took place before this date. Must be
        a valid ISO 8601 datetime. Defaults to infinity.

    + medication_id (integer, optional)

        Restrict results to events for this medication. Must correspond to a medication
        owned by the current patient. Defaults to not filtering by medication.

+ Request
    + Headers

            Authorization: Bearer ACCESS_TOKEN

+ Response 200
    Errors
    + `access_token_required` (401) - no access token specified in
    `Authorization` header
    + `invalid_access_token` (401) - the access token specified is invalid
    + `unauthorized` (403) - the current user does not have read access to this patient
    + `invalid_patient_id` (404) - a patient with the specified ID was not found
    + `invalid_limit` (400) - the specified result limit is invalid
    + `invalid_offset` (400) - the specified result offset is invalid
    + `invalid_sort_by` (400) - the specified sort field is invalid
    + `invalid_sort_order` (400) - the specified sort order is invalid
    + `invalid_start` (400) - the specified start date is an invalid ISO 8601 datetime
    + `invalid_end` (400) - the specified end date is an invalid ISO 8601 datetime
    + `invalid_medication_id` (400) - the medication ID specified to sort by is invalid

    + Body

            {
                doses: [
                    {
                        id: 1,
                        medication_id: 1,
                        date: "2015-05-31T19:27:09+00:00",
                        taken: true,
                        scheduled: 3,
                        notes: "Feeling sleepy now!"
                    },
                    ...
                ],
                count: 46,
                success: true
            }


## Dose Event [/patients/{patientid}/doses/{doseid}]
### Retrieve One Event [GET]
View information on an individual dose event. `medication_id` is helpfully
expanded out into `medication`. The current user will need read access to **both**
the patient and the dose event.

+ Parameters
    + patientid (integer, required)

        unique ID of the patient
    + doseid (integer, required)

        unique ID of the dose

+ Request
    + Headers

            Authorization: Bearer ACCESS_TOKEN

+ Response 200
    Errors
    + `access_token_required` (401) - no access token specified in
    `Authorization` header
    + `invalid_access_token` (401) - the access token specified is invalid
    + `unauthorized` (403) - the current user does not have read access to this patient
    + `invalid_patient_id` (404) - a patient with the specified ID was not found
    + `invalid_dose_id` (404) - a dose with that ID was not found

    + Body

            {
                id: 1,
                date: "2015-05-31T19:27:09+00:00",
                notes: "Feeling sleepy now!",
                taken: true,
                scheduled: 3,
                medication: {
                    id: 1,
                    name: "Loratadine",
                    rx_norm: "324026",
                    ndc: "33261-0228",
                    dose: {
                        quantity: 100,
                        unit: "mg"
                    },
                    route: "oral",
                    form: "pill",
                    rx_number: "123456789",
                    quantity: 50,
                    type: "OTC",
                    schedule: {
                        ...
                    },
                    doctor_id: 1,
                    pharmacy_id: 1,
                    success: true
                },
                success: true
            }


### Change an Event [PUT]
Change information (medication, date and/or notes) of a single dose event. The current
user will need write access to the patient, the old medication, and the new medication
(if different).

+ Parameters
    + patientid (integer, required)

        unique ID of the patient (*url*)
    + doseid (integer, required)

        unique ID of the dose (*url*)

    + medication_id (integer, optional)

        ID of a medication to change the dose to. Must correspond to an existing
        medication.

    + date (string, optional) - new ISO 8601 datetime to change the date of the dose to
    + taken (boolean, required)

        Boolean representing whether the user took their medication (i.e., `true` if
        they took it, `false` if this dose event represents them *skipping* their
        medication)
    + scheduled (integer, optional)

        Number representing the ID of the scheduled dose event. See `POST` endpoint documentation
        for full details. Send `null` to remove an existing value.

    + notes (string, optional)

        String to change the notes field of the dose to. If blank, will save the notes
        field blank correspondingly.

+ Request
    + Headers

            Authorization: Bearer ACCESS_TOKEN

    + Body

            {
                medication_id: 1,
                date: "2015-05-31T19:27:09+00:00",
                taken: true,
                scheduled: 3,
                notes: "Not sleepy from this - forgot I took a melatonin pill earlier!"
            }

+ Response 200
    Errors
    + `access_token_required` (401) - no access token specified in
    `Authorization` header
    + `invalid_access_token` (401) - the access token specified is invalid
    + `unauthorized` (403) - the current user does not have write access to this patient
    + `invalid_patient_id` (404) - a patient with the specified ID was not found
    + `invalid_dose_id` (404) - a dose with that ID was not found
    + `invalid_date` (400) - the date field specified is not in valid ISO 8601 format
    + `invalid_medication_id` (400) - no medication with the specified ID can be found
    + `invalid_taken` (400) - `taken` is not a valid boolean
    + `invalid_scheduled` (400)

        `scheduled` is not a valid integer corresponding to an event with that ID in the schedule
        for the medication (with ID `medication_id`)
    
    + Body

            {
                id: 1,
                medication_id: 1,
                date: "2015-05-31T19:27:09+00:00",
                taken: true,
                scheduled: 3,
                notes: "Not sleepy from this - forgot I took a melatonin pill earlier!",
                success: true
            }

### Delete an Event [DELETE]
Remove a single dose event (this will update generated statistics correspondingly, so be careful!)
The current user will need write access to both the patient and the medication.

+ Parameters
    + patientid (integer, required)

        unique ID of the patient (*url*)
    + doseid (integer, required)

        unique ID of the dose (*url*)

+ Request
    + Headers

            Authorization: Bearer ACCESS_TOKEN

+ Response 200
    Errors
    + `access_token_required` (401) - no access token specified in
    `Authorization` header
    + `invalid_access_token` (401) - the access token specified is invalid
    + `unauthorized` (403) - the current user does not have write access to this patient
    + `invalid_patient_id` (404) - a patient with the specified ID was not found
    + `invalid_dose_id` (404) - a dose event with that ID was not found

    + Body

            {
                id: 1,
                medication_id: 1,
                date: "2015-05-31T19:27:09+00:00",
                taken: true,
                scheduled: 3,
                notes: "Feeling sleepy now!"
                success: true
            }


## First Dose Event [/patients/{patientid}/doses/nonempty/first]
### Retrieve first date medication (Dose) was taken [GET]
Get date of first dose taken by a patient.

+ Parameters
    + patientid (integer, required)

        unique ID of the patient

+ Request
    + Headers

            Authorization: Bearer ACCESS_TOKEN

+ Response 200
    Errors
    + `access_token_required` (401) - no access token specified in
    `Authorization` header
    + `invalid_access_token` (401) - the access token specified is invalid
    + `unauthorized` (403) - the current user does not have read access to this patient
    + `invalid_patient_id` (404) - a patient with the specified ID was not found

    + Body

            {
                min_dose_date: "2015-04-01T15:29:09.000-04:00",
                count: 46,
                success: true
            }


