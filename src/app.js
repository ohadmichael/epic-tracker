require('angular/angular.min');
require('angular-aria/angular-aria.min');
require('angular-animate/angular-animate.min');
require('angular-material/angular-material.min');

var LocationsService = require('./services/LocationsService');
var LineParserService = require('./services/LineParserService');
var FileLoaderService = require('./services/FileLoaderService');
var DefaultRoutesService = require('./services/DefaultRouteService');
var UserLocationsService = require('./services/UserLocationsService');
var DistanceService = require('./services/DistanceService');
var AuthService = require('./services/AuthService');
var MapDirective = require('./directives/MapDirective');
var FileUploaderDirective = require('./directives/FileUploaderDirective');
var LocationsFetchDirective = require('./directives/LocationsFetchDirective');
var MainController = require('./controllers/MainController');

var app = angular.module('cyclingRouteApp', ['ngMaterial']);

app.value('locationsPageSize', 50);

app.service('locationsService', LocationsService);
app.service('lineParserService', LineParserService);
app.service('defaultRouteService', DefaultRoutesService);
app.service('fileLoaderService', FileLoaderService);
app.service('userLocationsService', UserLocationsService);
app.service('distanceService', DistanceService);
app.service('authService', AuthService);

app.directive('map', MapDirective);
app.directive('fileUploader', FileUploaderDirective);
app.directive('locationsFetch', LocationsFetchDirective);

app.controller('mainController', MainController);