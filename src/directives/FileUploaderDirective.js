function FileUploaderDirective(){
    return {
        restrict: 'A',
        link: Link,
        scope: {file: '='}
    };

    function Link($scope, element) {
        element.bind('change', function(e) {
            $scope.$apply(function(){
                $scope.file = e.target.files[0];
            });
        });
    }
}

module.exports = FileUploaderDirective;