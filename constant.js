const CONSTANTS = {
    DOMAIN:"https://cdn-api.co-vin.in/api/v2/",
    GENERATE_OTP_URL:"auth/generateMobileOTP",
    VALIDATE_OTP_URL:"auth/validateMobileOtp",
    CALENDAR_URL:"appointment/sessions/calendarByDistrict",
    BENEFICIARIES_URL: "appointment/beneficiaries",
    SCHEDULE_URL: "appointment/reschedule",
    SECRET:"U2FsdGVkX1+RLpCZDZlhdy36tpsa8qMVh475G1vARZLPSM7AFJ6Gx7Nv3rsArSymz0Y0j9kCfzGHf8nwoGr6fw==",
    RETRY_LIMIT_SECONDS: 45,
    RETRY_LIMIT_NUMBER: 20,
}

module.exports = CONSTANTS;