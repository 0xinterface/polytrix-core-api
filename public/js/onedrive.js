var app = angular.module("onedrive",[]);

app.controller('fileInfo',function($scope,$http){
	$scope.data = [];
	$scope.status = "ready";
	$scope.i = 'me/skydrive/';
	$scope.submit = function(){
		$scope.status = "loading...";
		//$scope.data = [];
		$.ajax({
			type: "GET",
			url: "/api/onedrive/fileIndex/",
			data: { i : $scope.i }
		}).done(function(res){
			$scope.status = "ready";
			$scope.data = res.content;
			$scope.$apply();
			console.log(res);
		});
	};
	$scope.click = function(i){
		$scope.i = i;
		$scope.submit();
	};
	$scope.download = function(i){
		$scope.status = "downlading...";
		$.ajax({
			type: "GET",
			url: "/api/onedrive/download/",
			data: { i : i }
		}).done(function(res){
			$scope.status = res;
			console.log(res);
		});
	};
	$scope.submit();
});