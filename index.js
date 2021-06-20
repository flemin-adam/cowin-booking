const { default: axios } = require('./axios');
const CONSTANTS = require('./constant');
const SHA256 = require("crypto");
const ask = require("./userinput");
const R = require("ramda");
const moment = require("moment"); 

require('dotenv').config()
const currentDate = moment().format('DD-MM-YYYY');
const availableDate = moment().add(1, 'days').format('DD-MM-YYYY');
const SPLIT = "###"
const MATCH_CRITERIA = availableDate + SPLIT + process.env.MIN_AGE + SPLIT + process.env.VACCINE;

async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

console.log("Initializing...");
main();

async function executeAuth(){
    try{
        const transaction = await generateOtp();
        return await processOTP(transaction);
    }
    catch(ex){
        console.log("Error getting Token");
        console.log(ex);
        throw ex;
    }
}

async function getMember(token){
    try{
        const beneficiaries = await getBeneficiaries(token);
        return await processBeneficiaries(beneficiaries, token);
    }
    catch(ex){
        console.log("Error getting Beneficiaries");
        console.log(ex);
        throw ex;
    }
}

async function executeVaccineCheck(appointmentId, token){
    let isRetry = true;
    let starttime = moment();
    let counter = 0;
    try{
        do{
            counter++;
            const isBooked = await checkVaccinationAvailability(appointmentId, token);
            if(isBooked){
                console.log("Appointment Booked. Enjoy!");
                return isBooked;
            }
            else{
                isRetry= true;
                let duration = moment.duration(moment().diff(starttime));
                let remainingSeconds = (CONSTANTS.RETRY_LIMIT_SECONDS - duration.asSeconds());
                console.log(counter + " check complete. Waiting for " + remainingSeconds + " seconds.")
                await wait(remainingSeconds * 1000);
                starttime = moment();
            }
        }
        while(isRetry);
    }
    catch(ex){
        console.log("Error in executeVaccineCheck")
        console.log(ex);
        throw ex;
    }
}

async function main(){
    let isRetry = true;
    try{
        do{
            try{
                const token = await executeAuth();
                //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJmZmIwNmVlNC1kZjY3LTRlZDUtYWZmOS03MTgwMjZkZDA1MjYiLCJ1c2VyX2lkIjoiZmZiMDZlZTQtZGY2Ny00ZWQ1LWFmZjktNzE4MDI2ZGQwNTI2IiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo4MDA3ODYxOTg2LCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjc1NzI1MTk2NjM3MzEwLCJzZWNyZXRfa2V5IjoiYjVjYWIxNjctNzk3Ny00ZGYxLTgwMjctYTYzYWExNDRmMDRlIiwic291cmNlIjoiY293aW4iLCJ1YSI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85MS4wLjQ0NzIuMTA2IFNhZmFyaS81MzcuMzYiLCJkYXRlX21vZGlmaWVkIjoiMjAyMS0wNi0yMFQxMDoxMDozMS43NjRaIiwiaWF0IjoxNjI0MTgzODMxLCJleHAiOjE2MjQxODQ3MzF9.MBz1TVRhH93i8C3wW8y6qY72KLMav7K0DoSgBi91AGg";
                const member = await getMember(token);
                console.log(member);
                const appointmentId = R.last(member["appointments"]);
                const isBooked = await executeVaccineCheck(appointmentId, token);
                if(isBooked){
                    console.log("Appointment Booked. Main()");
                    isRetry = false;
                    process.exit(0);
                }
            }
            catch(ex){
                console.log(ex);
                if(ex.response.status === 403){
                    isRetry = true;
                }
                else{
                    process.exit(0);
                }
            }
        }
        while(isRetry);
    }
    catch(ex){
        console.log("Error in Main")
        console.log(ex);
        process.exit(0)
    }
}

async function processBeneficiaries(beneficiaries){
    if(beneficiaries.length > 0){
        console.log("You have regitered for " + beneficiaries.length + " members.");
        console.log("Please choose the member for which you have to book.");
        let i;
        for(i = 0; i < beneficiaries.length; i++){
            console.log(i+1 + ". " + beneficiaries[i].name);
        }
        console.log(i+1 + ". Exit");
        let memberIndex = 0;
        do{
            memberIndex  = await ask("Enter the number next to the name of member: ");
            memberIndex = parseInt(memberIndex);
            if(memberIndex > 0 && memberIndex <= beneficiaries.length){
                console.log("Proceeding for " + beneficiaries[memberIndex - 1].name);
                return beneficiaries[memberIndex - 1];
            }
            else if(memberIndex == i+1){
                process.exit(0);
            }
        }
        while(memberIndex >= 0 && memberIndex <= i);            
    }
    else{
        console.log("Looks like you have not regitered.")
        throw new Exception("Oops! Something went wrong.");
    }
}

async function getBeneficiaries(token){
    const url = CONSTANTS.DOMAIN + CONSTANTS.BENEFICIARIES_URL;
    const headers = {
        "authorization": "Bearer " + token
    }
    try{
        const response = await axios.get(url, { headers: headers} );
        return response.data["beneficiaries"];
    }
    catch(ex){
        console.log(ex);
        throw ex;
    }

}

async function generateOtp(){
    const generateOtpURL = CONSTANTS.DOMAIN + CONSTANTS.GENERATE_OTP_URL;
    console.log(generateOtpURL);
    const data = {
        "secret": CONSTANTS.SECRET,
        "mobile": parseInt(process.env.MOBILE_NUMBER) 
    }
    try{
        let response = await axios.post(generateOtpURL, data);
        console.log(response.data);
        return response.data;
    }
    catch(ex){
        console.log(ex);
        throw ex;
    }
}

async function processOTP(transaction){
    const otp = await ask("Enter OTP (Mobile No: " + process.env.MOBILE_NUMBER + "): ");
    console.log("You have entered: " + otp);
    transaction.otp = SHA256.createHash("sha256").update(otp).digest("hex");
    const validateOtpURL = CONSTANTS.DOMAIN + CONSTANTS.VALIDATE_OTP_URL;
    console.log(transaction);
    try{
        const response = await axios.post(validateOtpURL, transaction);
        console.log(response.data.token);
        return response.data.token
    }
    catch(ex){
        console.log(ex);
        throw ex;
    }
}

//checkVaccinationAvailability(token);


async function checkVaccinationAvailability(appointmentId, token){
    const params = "?district_id="+ process.env.DISTRICT_ID +"&date=" + currentDate;
    const centersURL = CONSTANTS.DOMAIN + CONSTANTS.CALENDAR_URL + params;
    const headers = {
        "authorization": "Bearer " + token
    }
    try{
        const response = await axios.get(centersURL, { headers: headers} );
        const AvailableCenters = response.data["centers"];
        const Pincodes = JSON.parse(process.env.PIN_CODE);
        const isPresent = center => Pincodes[center["pincode"]] || false;
        const filteredCenters = R.filter(isPresent, AvailableCenters);
        console.log(filteredCenters);
        return R.find(center => sanitizeCenters(appointmentId, token, center), filteredCenters);
    }
    catch(ex){
        console.log(ex);
        throw ex;
    }
}

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

function sanitizeCenters(appointmentId, token, center){
    if(center.sessions && center.sessions.length > 0){
        const isAvailable = R.find(findAvailableSessions, center.sessions)
        if(isAvailable){
            console.log("Booking Time!!!!");
            try{
                const data = {
                    "appointment_id": appointmentId.appointment_id,
                    "session_id": isAvailable.session_id,
                    "slot": R.last(isAvailable.slots)
                }

                const url = CONSTANTS.DOMAIN + CONSTANTS.SCHEDULE_URL;
                const headers = {
                    "authorization": "Bearer " + token
                }
                //const response = await axios.post(validateOtpURL, data, { headers: headers});
                //console.log(response);
                console.log(data)
            }
            catch(ex){
                console.log(ex);
                throw ex;
            }
            
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