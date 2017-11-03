var $ = require('jquery/dist/jquery.min');
var _ = require('lodash/lodash.min');
var google = require('google');

function LineParserService() {
    return {
        parseFromGpx: parseFromGpx,
        parseFromSerializedPoints: parseFromSerializedPoints
    };

    function parseFromGpx(file) {
        var points = _.map($(file).find("trkpt"), function(point) {
            point = $(point);
            return new google.maps.LatLng(point.attr("lat"), point.attr("lon"));
        });

        return _createPolyline(points);
    }

    function parseFromSerializedPoints(points) {
        var points = _.map(points, function(point) {
            return new google.maps.LatLng(point);
        });

        return _createPolyline(points);
    }

    function _createPolyline(points) {
        return new google.maps.Polyline({
            path: points,
            strokeColor: "#FF00AA",
            strokeOpacity: 0.8,
            strokeWeight: 4,
            zIndex: 2
        });
    }
};

module.exports = LineParserService;