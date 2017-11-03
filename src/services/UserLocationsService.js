function UserLocationsService($http) {
    var API_KEY = '';
    var url = `https://api.mongolab.com/api/1/databases/trip/collections/UserLocations/1?apiKey=${API_KEY}`;

    return {
        getLocations: getLocations,
        saveLocations: saveLocations
    };

    function getLocations() {
        return $http.get(url);
    }

    function saveLocations(locations) {
        return $http.put(url, {locations: locations});
    }
};

module.exports = UserLocationsService;