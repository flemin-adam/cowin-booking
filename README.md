# cowin-booking

## You'll require Node js installed on your machine to run this

After cloning this project, run the following command:

### npm install

rename .env.example to .env and populate the values like this

```
MOBILE_NUMBER=9876543210 // Add your phone number
DISTRICT_ID=303 // This is the district code, need to improve this.
PIN_CODE={"680561": true, "680012": true, "680301": true"} // This json is the pincodes where you'll want to book appointment
MIN_AGE=18 // minimum age criteria for 18+, can put 45 for 45+ category
VACCINE=COVISHIELD // Vaccine name, can put COWAXIN
DOSE=1 // indicates 1st dose or put 2 for 2nd dose
```

## Run the app

### npm start

It will ask for the details, enter the details as required and the app will run till it books an appointment
