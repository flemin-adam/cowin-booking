const { default: axios } = require('axios');

axios.defaults.headers.common = { 
    'origin': 'https://selfregistration.cowin.gov.in', 
    'authority': 'cdn-api.co-vin.in', 
    'sec-fetch-site': 'cross-site', 
    'sec-fetch-mode': 'cors', 
    'sec-fetch-dest': 'empty', 
    'referer': 'https://selfregistration.cowin.gov.in', 
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36'
}

module.exports = axios;