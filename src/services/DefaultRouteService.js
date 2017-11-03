function DefaultRouteService($http) {
    var API_KEY = '';
    var url = `https://api.mongolab.com/api/1/databases/trip/collections/DefaultRoutes/1?apiKey=${API_KEY}`;

    return {
        getRoute: getRoute,
        saveRoute: saveRoute
    };

    function getRoute() {
        return $http.get(url);
    }

    function saveRoute(points) {
        return $http.put(url, {points: points});
    }
};

module.exports = DefaultRouteService;