const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

let shiprocketToken = null;
let tokenExpiry = null;

// Function to get ShipRocket API token
async function getShipRocketToken() {
    // Check if the token exists and if it's expired
    const currentTime = Date.now(); // Get current time in milliseconds
    if (shiprocketToken && tokenExpiry && currentTime < tokenExpiry) {
        return shiprocketToken; // Return the existing token if it's still valid
    }

    try {
        // If no valid token, fetch a new one
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });

        // Store the token and set the expiration time (e.g., token valid for 1 hour)
        shiprocketToken = response.data.token;
        tokenExpiry = currentTime + 3600000; // 1 hour from the current time

        return shiprocketToken; // Return the new token
    } catch (error) {
        console.error("Error fetching ShipRocket token:", error);
        throw error;
    }
}
module.exports = { getShipRocketToken };
