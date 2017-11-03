function FileLoaderService($q) {
    return {
        load: load
    };

    function load(file) {
        var deffered = $q.defer();
        var reader = new FileReader();
        reader.onload = function () {
            deffered.resolve(reader.result);
        };

        reader.readAsText(file);
        return deffered.promise;
    }
};

module.exports = FileLoaderService;