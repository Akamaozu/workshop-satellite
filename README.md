TorontoJS Workshop Satellite
===

Install
---
`git clone https://github.com/Akamaozu/workshop-satellite.git && cd workshop-satellite && npm install`

Start
---
`npm start` or `node satellite`

View Uploads
---
[https://torontojs-basestation.herokuapp.com](https://torontojs-basestation.herokuapp.com)

Change Satellite Name
---
1. open .env file
2. edit variable [ `SATELLITE_NAME` ]

Modify Pictures Taken
---
1. open .env file
2. edit variables [ `CAMERA_SUBJECT_QUERYSTRING`, `CAMERA_SUBJECT_KEYWORDS` ]
    _* note keywords is comma separated string and querystring is a literal string search term_

Adjust Component Logging
---
1. open .env file
2. edit variables [ `BRAIN_VERBOSE_LOGGING`, `CAMERA_VERBOSE_LOGGING`, `STORAGE_VERBOSE_LOGGING`, `ANTENNA_VERBOSE_LOGGING` ]

Adjust Supervisor Restart Policy
---
1. open .env file
2. edit variables [ `CITIZEN_REVIVE_DURATION_MINS`, `CITIZEN_REVIVES_PER_DURATION` ]