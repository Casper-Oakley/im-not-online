var app = angular.module('myApp', []);

app.controller('search', function($scope, $http) {
  $scope.results = [];
  $scope.searchValue = "";

  $scope.search = function() {
    if($scope.searchValue) {
      $http({
        method: 'GET',
        url: $scope.searchValue
      }).then(function(res) {
        console.log(res);
        $scope.results = res.data.map(function(e) {
          return e.name;
        });
      }, function(res) {
        console.log('ERRRR');
        console.log(res);
      });
    } else {
      $scope.results = [];
    }
  };
});
