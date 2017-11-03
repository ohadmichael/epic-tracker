var $ = require('jquery/dist/jquery.min');
var template = require('html!../../templates/LocationsFetch.html');

function LocationsFetchDirective(){
    return {
        restrict: 'E',
        template: template,
        controller: Ctrl
    };

    function Ctrl($scope, $rootScope, locationsService, $interval, $timeout, locationsPageSize) {
        var intervalPromise;
        var stopTimeoutPromise;
        var fetchOptions = {};

        $scope.isAutoLoading = true;

        $scope.refreshFetchInterval = refreshFetchInterval;
        $scope.loadFetchOptions = loadFetchOptions;

        $scope.$on('fetchNextLocations', _fetchNextLocations);

        _init();

        function refreshFetchInterval() {
            _cancelInterval();

            if($scope.isAutoLoading) {
                intervalPromise = $interval(_loadFirstLocations, 5 * 60 * 1000);
                _loadFirstLocations();
            }
        }

        function loadFetchOptions() {
            fetchOptions = {};
            if($scope.fromDate)
                fetchOptions.startDate = _getMixedDateString($scope.fromDate, $scope.fromTime);
            if($scope.toDate)
                fetchOptions.endDate = _getMixedDateString($scope.toDate, $scope.toTime);

            $rootScope.$broadcast('clearLocations');
            if($scope.isAutoLoading)
                refreshFetchInterval();
            else
                _loadLocations();
        }

        function _fetchNextLocations() {
            fetchOptions.start = (fetchOptions.start || 1) + locationsPageSize;
            _loadLocations();
        }

        function _init() {
            refreshFetchInterval();
            $(window).on('focus', _onWindowFocus).on('blur', _onWindowBlur);
        }

        function _loadFirstLocations() {
            fetchOptions.start = undefined;
            _loadLocations();
        }

        function _loadLocations() {
            locationsService.getLocations(fetchOptions).then(function(res){
                $rootScope.$broadcast('loadLocations', res.data);
            });
        }

        function _getMixedDateString(date, time) {
            var clone = new Date(date);
            if(time) {
                clone.setHours(time.getHours());
                clone.setMinutes(time.getMinutes());
            }
            return clone.toISOString().slice(0, 19) + '-0000';
        }

        function _cancelInterval() {
            if(!intervalPromise) return;

            $interval.cancel(intervalPromise);
            intervalPromise = null;
        }

        function _onWindowFocus() {
            if(stopTimeoutPromise) {
                $timeout.cancel(stopTimeoutPromise);
                if(stopTimeoutPromise.$$state.status == 1) refreshFetchInterval();
                stopTimeoutPromise = null;
            }
        }

        function _onWindowBlur() {
            stopTimeoutPromise = $timeout(_cancelInterval, 60 * 60 * 1000);
        }
    }
}

module.exports = LocationsFetchDirective;