const axios = require('axios');
const captainModel = require('../models/captain.model');



module.exports.getAddressCoordinates = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API; 
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error(`Error fetching coordinates: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error occurred while fetching coordinates:', error.message || error);
        throw error; 
    }
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and Destination are required');
    }
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.rows.length > 0) {
            const element = response.data.rows[0].elements[0];
            if (element.status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }
            return element; 
        } else {
            throw new Error(`Error fetching coordinates: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error occurred while fetching coordinates:', error.message || error);
        throw error;
    }
};

module.exports.getAutoCompleteSuggestions = async(input) => {
    if (!input) {
        throw new Error('input are required');
    }
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try{
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            const element = response.data.predictions;
            
            return element; 
        } else {
            throw new Error(`Error fetching prediction: ${response.data.status}`);
        }
    }catch(error){
        console.error('Error occurred while fetching coordinates:', error.message || error);
        throw error;
    }
};

module.exports.getCaptainInRadius = async(ltd, lng, radius) => {
    
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6378.1]
            }
        }
    });

    return captains;
};
