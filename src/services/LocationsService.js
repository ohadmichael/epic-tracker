function LocationsService($http) {
    var FEED_ID = '';

    return {
      getLocations: getLocations
    };

    function getLocations(options) {
        return $http.get(`https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/${FEED_ID}/message.json`, {params: options});
    }
};

module.exports = LocationsService;