var google = require('google');
var _ = require('lodash/lodash.min');
var infoWindowTemplate = require('html!../../templates/InfoWindow.html');

function MapDirective(locationsPageSize, userLocationsService, distanceService, $interval, $mdDialog, $compile){
    return {
        restrict: 'A',
        link: Link,
        scope: {isPossiblyMissed: '='}
    };

    function Link($scope, element) {
        var map;
        var locations = {};
        var routes = [];
        var userLocations = [];
        var markersLine;
        var statusesToIcons;
        var infoWindowCompiledTemplate;
        var lastOpenedInfoWindow;
        var latestLocation;
        var userLocationColors;

        $scope.isPossiblyMissed = false;
        $scope.isUserMarkersEnabled = false;

        $scope.$on('loadLine', _loadLine);
        $scope.$on('loadLocations', _loadLocations);
        $scope.$on('clearLocations', _clearLocations);
        $scope.$on('toggleUserLocationsEnabled', _toggleUserLocationsEnabled);
        $scope.$on('clearUserLocations', _clearUserLocations);
        $scope.$on('saveUserLocations', _saveUserLocations);

        _init();

        function _loadLine(e, data) {
            if(data.clearOthers) {
                _.forEach(routes, function(route){route.setMap(null)});
                routes = [];
            }
            data.line.setMap(map);
            routes.push(data.line);

            var bounds = new google.maps.LatLngBounds();
            var totalDistance = 0, markerCounter = 0;
            var points = data.line.getPath().getArray();
            var marksDistance = 10;
            _.forEach(points, function(point, index) {
                bounds.extend(point);
                if(index > 0) {
                    totalDistance += distanceService.calculate(points[index - 1], point);
                    if(totalDistance >= markerCounter * marksDistance + marksDistance) {
                        markerCounter++;
                        var distanceMarker = new google.maps.Marker({
                            map: map,
                            position: point,
                            zIndex: 2,
                            icon: {
                                url: 'http://chart.apis.google.com/chart?chst=d_bubble_text_small&chld=bbT|'+(markerCounter * marksDistance)+'|0f0f0f|ffffff',
                                scaledSize: new google.maps.Size(20, 20)
                            }
                        });
                        routes.push(distanceMarker);
                    }
                }
            });
            map.fitBounds(bounds);
        }

        function _loadLocations(e, data) {
            $scope.isPossiblyMissed = false;
            var receivedLocationsCount = data.response.feedMessageResponse.count;
            var existingLocationsCount = _mergeNewLocations(data.response.feedMessageResponse.messages.message);
            if(receivedLocationsCount == existingLocationsCount) return;

            _styleLatestLocation();
            _addMarkersLine();
            if(receivedLocationsCount == locationsPageSize && existingLocationsCount == 0)
                $scope.isPossiblyMissed = true;
        }

        function _mergeNewLocations(messages) {
            if(!_.isArray(messages)) messages = [messages];

            var existingLocationsCount = 0;

            _.forEach(messages, function(message) {
                if(locations[message.id]) {
                    existingLocationsCount++;
                    return;
                }

                var icon = _getLocationIcon(message);
                var marker =  new google.maps.Marker({
                    map: map,
                    position: {
                        lat: message.latitude,
                        lng: message.longitude
                    },
                    icon: icon,
                    zIndex: icon == statusesToIcons.default ? 3 : 4
                });

                message.dateTime = new Date(message.dateTime);
                _bindLocationInfoWindow(marker, message);
                locations[message.id] = {marker: marker, message: message};
            });
            return existingLocationsCount;
        }

        function _clearLocations() {
            _.forEach(locations, function(l){l.marker.setMap(null)});
            locations = {};
            latestLocation = null;
            _clearMarkersLine();
        }

        function _clearMarkersLine() {
            if(!markersLine) return;
            markersLine.setMap(null);
            markersLine = null;
        }

        function _toggleUserLocationsEnabled() {
            $scope.isUserMarkersEnabled = !$scope.isUserMarkersEnabled;
        }

        function _clearUserLocations() {
            _.forEach(userLocations, function(l){l.marker.setMap(null)});
            userLocations = [];
        }

        function _saveUserLocations() {
            var locations = _.map(userLocations, function(location) {
                return {name: location.name, color: location.color, position: location.marker.getPosition()}
            });

            userLocationsService.saveLocations(locations);
        }

        function _loadUserLocations() {
            userLocationsService.getLocations().then(function (res) {
                _.forEach(res.data.locations, _addUserLocation);
            });
        }

        function _init() {
            map = new google.maps.Map(element[0], {
                center: {lat: 37.3375, lng: -122.02896},
                zoom: 10
            });

            map.addListener('click', function(e) {
                if(lastOpenedInfoWindow) {
                    lastOpenedInfoWindow.close();
                    lastOpenedInfoWindow = null;
                    return;
                }

                if($scope.isUserMarkersEnabled)
                    _createUserLocation(e.latLng);
            });

            infoWindowCompiledTemplate = _.template(infoWindowTemplate);

            statusesToIcons = {
                'OK': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                'NEWMOVEMENT': 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|C0C0C0',
                'HELP': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                'HELP-CANCEL': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                'CUSTOM': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                default: {
                    url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0F0F0F|FFFFFF',
                    scaledSize: new google.maps.Size(10, 16)
                }
            };

            userLocationColors = ['0F0FF9', 'FF0FF9', '5F0F25', '12F456'];

            _loadUserLocations();

            $interval(_setLatestLocationLabel, 60 * 1000);
        }

        function _bindLocationInfoWindow(marker, message) {
            message.messageContent = message.messageContent || '';
            message.timeString = message.dateTime
                .toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});

            _bindInfoWindow(marker, infoWindowCompiledTemplate(message));
        }

        function _bindInfoWindow(marker, content) {
            var infoWindow = new google.maps.InfoWindow({
                content: content,
                maxWidth: 300
            });

            marker.addListener('click', function() {
                if(lastOpenedInfoWindow) lastOpenedInfoWindow.close();
                infoWindow.open(map, marker);
                lastOpenedInfoWindow = infoWindow;
            });
        }

        function _createUserLocation(position) {
            var confirm = $mdDialog.prompt()
                .title('Name this place')
                .placeholder('Name')
                .ok('ok')
                .cancel('cancel');

            $mdDialog.show(confirm).then(function(name) {
                _addUserLocation({position: position, name: name});
            });
        }

        function _addUserLocation(location) {
            var marker = new google.maps.Marker({
                map: map,
                position: location.position,
                zIndex: 2
            });

            var userLocation = {name: location.name, marker: marker, color: location.color || 0};
            userLocations.push(userLocation);

            _setUserLocationIcon(userLocation);
            _bindUserLocationInfoWindow(userLocation);
        }

        function _bindUserLocationInfoWindow(userLocation) {
            var scope = $scope.$new(true);
            scope.name = userLocation.name;
            scope.changeColor = changeColor;

            var infoContent = $compile('<span ng-click="changeColor()">{{name}}</span>')(scope);
            _bindInfoWindow(userLocation.marker, infoContent[0]);

            function changeColor() {
                userLocation.color++;
                if(userLocation.color == userLocationColors.length)
                    userLocation.color = 0;

                _setUserLocationIcon(userLocation);
            }
        }

        function _setUserLocationIcon(userLocation) {
            var color = userLocationColors[userLocation.color];
            userLocation.marker.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + color);
        }

        function _addMarkersLine(){
            _clearMarkersLine();
            var points = _(locations).map('message').filter({messageType: 'TRACK'}).sortBy('dateTime').map(function(message) {
                return new google.maps.LatLng(message.latitude, message.longitude);
            }).value();

            markersLine = new google.maps.Polyline({
                path: points,
                strokeColor: "#C0C0C0",
                strokeOpacity: 0.5,
                strokeWeight: 3,
                zIndex: 1,
                map: map
            });
        }

        function _styleLatestLocation() {
            var location = _.maxBy(_.values(locations), 'message.dateTime');
            if(latestLocation == location) return;

            if(latestLocation) {
                latestLocation.marker.setLabel(null);
                latestLocation.marker.setAnimation(null);
                latestLocation.marker.setIcon(_getLocationIcon(latestLocation.message));
            }

            location.marker.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF');
            latestLocation = location;
            _setLatestLocationLabel();
        }

        function _getLocationIcon(message) {
            return statusesToIcons[message.messageType] || statusesToIcons.default;
        }

        function _setLatestLocationLabel() {
            if(!latestLocation) return;
            var timeDiff = new Date() - latestLocation.message.dateTime;
            var hours = timeDiff / 1000 / 60 / 60;
            latestLocation.marker.setLabel(Math.floor(hours)+'h '+Math.floor(hours % 1 * 60)+'m ago');
            latestLocation.marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
}

module.exports = MapDirective;