function MainController($scope, $mdSidenav, fileLoaderService, lineParserService, defaultRouteService, authService) {
    $scope.editPermitted = false;

    $scope.openSettingsBar = openSettingsBar;
    $scope.uploadRoute = uploadRoute;
    $scope.loadNextLocations = loadNextLocations;
    $scope.toggleUserLocationsEnabled = toggleUserLocationsEnabled;
    $scope.clearUserLocations = clearUserLocations;
    $scope.saveUserLocations = saveUserLocations;
    $scope.enableEdit = enableEdit;

    _init();

    function openSettingsBar() {
        $mdSidenav('settings-bar').open();
    }

    function uploadRoute() {
        fileLoaderService.load($scope.chosenFile).then(function(file){
            var line = lineParserService.parseFromGpx(file);
            if($scope.storeRouteFile)
                defaultRouteService.saveRoute(line.getPath().getArray());

            $scope.$broadcast('loadLine', {line: line, clearOthers: $scope.storeRouteFile});
            $mdSidenav('settings-bar').close();
        });
    }

    function loadNextLocations() {
        $scope.$broadcast('fetchNextLocations');
    }

    function toggleUserLocationsEnabled() {
        $scope.$broadcast('toggleUserLocationsEnabled');
        $mdSidenav('settings-bar').close();
    }

    function clearUserLocations() {
        $scope.$broadcast('clearUserLocations');
    }

    function saveUserLocations() {
        $scope.$broadcast('saveUserLocations');
    }
    
    function enableEdit() {
        $scope.editPermitted = authService.check($scope.password);
    }

    function _init() {
        defaultRouteService.getRoute().then(function(res){
            var line = lineParserService.parseFromSerializedPoints(res.data.points);
            $scope.$broadcast('loadLine', {line: line});
        });
    }
}

module.exports = MainController;