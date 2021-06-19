const { default: axios } = require('./axios');
const CONSTANTS = require('./constant');
const SHA256 = require("crypto");
const readline = require("readline");
const R = require("ramda");
const moment = require("moment"); 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

require('dotenv').config()

console.log("Initializing...");
generateOtp();

async function generateOtp(){
    const generateOtpURL = CONSTANTS.DOMAIN + CONSTANTS.GENERATE_OTP_URL;
    console.log(generateOtpURL);
    const data = {
        "secret": CONSTANTS.SECRET,
        "mobile": parseInt(process.env.MOBILE_NUMBER) 
    }
    try{
        let response = await axios.post(generateOtpURL, data);
        let transaction = response.data;
        console.log(transaction);
        response = await processOTP(transaction);
    }
    catch(ex){
        console.log(ex);
    }
}

async function processOTP(transaction){
    rl.question("Enter OTP (Mobile No: " + process.env.MOBILE_NUMBER + "): ", async function(mobile) {
        console.log("You have entered: " + mobile);
        const validateOtpURL = CONSTANTS.DOMAIN + CONSTANTS.VALIDATE_OTP_URL;
        transaction.otp = SHA256.createHash("sha256").update(mobile).digest("hex");
        console.log(transaction);
        try{
            const response = await axios.post(validateOtpURL, transaction);
            console.log(response.data.token);
            const isAvailable = await checkVaccinationAvailability(response.data.token);
        }
        catch(ex){
            console.log(ex);
        }
        process.exit(0);
    });
}

const currentDate = moment().format('DD-MM-YYYY');
const availableDate = moment().add(1, 'days').format('DD-MM-YYYY');
//checkVaccinationAvailability(token);

async function checkVaccinationAvailability(token){
    const params = "?district_id="+ process.env.DISTRICT_ID +"&date=" + currentDate;
    const centersURL = CONSTANTS.DOMAIN + CONSTANTS.CALENDAR_URL + params;
    const headers = {
        "authorization": "Bearer " + token
    }
    try{
        const response = await axios.get(centersURL, { headers: headers} );
        console.log(response);
        const AvailableCenters = response.data["centers"];
        const Pincodes = JSON.parse(process.env.PIN_CODE);
        const isPresent = center => Pincodes[center["pincode"]] || false;
        const filteredCenters = R.filter(isPresent, AvailableCenters);
        console.log(filteredCenters);
        const isBooked = R.find(sanitizeCenters, filteredCenters);
        if(isBooked){
            console.log("Appointment Booked. Please check SMS.");
        }
        else{
            console.log("Appointment not Booked.");
        }
    }
    catch(ex){
        console.log(ex);
    }
}
const SPLIT = "###"
const MATCH_CRITERIA = availableDate + SPLIT + process.env.MIN_AGE + SPLIT + process.env.VACCINE
function findAvailableSessions(session){
    const CRITERIA = session["date"] + SPLIT + session["min_age_limit"] + SPLIT + session["vaccine"];
    const DOSE_KEY = process.env.DOSE;
    if(CRITERIA === MATCH_CRITERIA && session["available_capacity_dose" + DOSE_KEY] > 0){
        return true;
    }    
    else{
        return false;
    }
}

function sanitizeCenters(center){
    if(center.sessions && center.sessions.length > 0){
        const isAvailable = R.find(findAvailableSessions, center.sessions)
        if(isAvailable){
            console.log("Booking Time!!!!");
            console.log(isAvailable.session_id)
            return true;
        }
        else{
            console.log("No Session with Matching Criteria");
            return false;
        }
    }
    else{
        console.log("No Session in this Center");
        return false;
    }
}