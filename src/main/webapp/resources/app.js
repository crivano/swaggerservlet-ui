var app = angular.module('app', [ 'ngAnimate', 'ngRoute', 'cgBusy' ]);

app.config([ '$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {
			$routeProvider.when('/home', {
				templateUrl : 'resources/home.html',
				controller : 'ctrl'
			}).when('/convert', {
				templateUrl : 'resources/convert.html',
				controller : 'ctrlConvert'
			}).otherwise({
				redirectTo : '/home'
			});
			// enable html5Mode for pushstate ('#'-less URLs)
			$locationProvider.html5Mode(false);
		} ]);

app
		.controller(
				'routerCtrl',
				function($scope, $http, $window, $q, $location) {
					$scope.parseLocation = function(location) {
						var pairs = location.substring(1).split("&");
						var obj = {};
						var pair;
						var i;

						for (i in pairs) {
							if (pairs[i] === "")
								continue;

							var idx = pairs[i].indexOf("=");
							obj[decodeURIComponent(pairs[i].substring(0, idx))] = decodeURIComponent(pairs[i]
									.substring(idx + 1));
						}

						return obj;
					};

					$scope.querystring = $scope
							.parseLocation($window.location.search);
				});

app.controller('ctrlConvert', function($scope, $http, $window, $q, $location) {
	$scope.yaml = localStorage.getItem("swaggerservlet-converting-yaml");

	$scope.convert = function() {
		$scope.promise = $http({
			url : "api/v1/convert",
			method : "POST",
			data : {
				yaml : $scope.yaml
			}
		}).then(function successCallback(response) {
			localStorage.setItem("swaggerservlet-converting-yaml", $scope.yaml);
			$scope.java = response.data.java;
		});
	}

	if ($scope.yaml) {
		$scope.convert();
	}
});

app.controller('ctrl',
		function($scope, $http, $sce) {

			$scope.url = localStorage.getItem("swaggerservlet-monitoring-url");

			$scope.buildTestList = function(tr) {
				var list = [];
				var parse = function(t) {
					list.push(t);
					if (t.hasOwnProperty("dependencies"))
						for (var i = 0; i < t.dependencies.length; i++) {
							parse(t.dependencies[i]);
						}
				}
				parse(tr);
				return list;
			}

			$scope.VizWorker = new Worker("assets/viz.js");
			$scope.VizWorker.onmessage = function(oEvent) {
				$scope.svg = $sce.trustAsHtml(oEvent.data.svg);
				$scope.$apply();
			};

			$scope.buildsvg = function(graph) {
				$scope.VizWorker.postMessage({
					id : "graph",
					graph : graph
				});
			}

			$scope.fetch = function() {
				var callback = function(response) {
					console.log(response);
					$scope.svg = $sce.trustAsHtml("<p>Loading graph...</p>");
					$scope.testresult = response.data;
					$scope.graphresult = $scope.buildGraph($scope.testresult);
					$scope.testlist = $scope.buildTestList($scope.testresult);
					$scope.buildsvg($scope.graphresult);
				}
				localStorage.setItem("swaggerservlet-monitoring-url", $scope.url);
				delete $scope.testresult;
				delete $scope.graphresult;
				delete $scope.testlist;
				delete $scope.svg;
				$scope.promise = $http({
					url : $scope.url + "/test",
					method : "GET"
				}).then(callback, callback);
			}

			$scope.buildGraph = function() {
				var categories = {};
				var services = {}
				var edges = [];

				var parse = function(t) {
					if (!categories.hasOwnProperty(t.category))
						categories[t.category] = [];
					categories[t.category].push({
						service : t.service,
						available : t.available
					});
					services[t.service] = t;
					if (t.hasOwnProperty("dependencies"))
						for (var i = 0; i < t.dependencies.length; i++) {
							parse(t.dependencies[i]);
							edges.push({
								from : t.service,
								to : t.dependencies[i].service,
								partial : t.dependencies[i].partial == true
							});
						}
				}

				parse($scope.testresult);

				var fix = function(s) {
					return "\"" + s + "\"";
				}

				// console.log(JSON.stringify(categories));
				// console.log(JSON.stringify(edges));

				var s = "digraph G {rankdir=LR;edge [arrowhead=vee];";
				var subcluster = 0;
				for ( var prop in categories) {
					if (!categories.hasOwnProperty(prop))
						continue;
					if (prop !== "undefined")
						s += '\nsubgraph cluster_' + subcluster++
								+ ' {label = ' + prop + ';';
					for (var i = 0; i < categories[prop].length; i++) {
						var t = categories[prop][i];
						s += '\n' + fix(t.service);
						if (t.hasOwnProperty("available")
								&& t.available !== undefined) {
							if (t.available)
								s += '[color=green]';
							else
								s += '[color=red]';
						}
						s += ';';
					}
					if (prop !== "undefined")
						s += '}';
				}
				for (var i = 0; i < edges.length; i++) {
					s += '\n' + fix(edges[i].from) + ' -> ' + fix(edges[i].to);
					if (edges[i].partial)
						s += '[style=dotted]';
					else if (services[edges[i].to].available == false)
						s += '[color=red]';
					s += ';';
				}
				s += '}';
				return s;
			}

		});

app
		.directive(
				'modal',
				function($parse) {
					return {
						template : '<div class="modal fade">'
								+ '<div class="modal-dialog">'
								+ '<div class="modal-content">'
								+ '<div class="modal-header">'
								+ '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
								+ '<h4 class="modal-title">{{ title }}</h4>'
								+ '</div>'
								+ '<div class="modal-body" ng-transclude></div>'
								+ '<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button></div>'
								+ '</div>' + '</div>' + '</div>',
						restrict : 'E',
						transclude : true,
						replace : true,
						scope : {
							title : '@',
							visible : '=',
							onSown : '&',
							onHide : '&'
						},
						link : function postLink(scope, element, attrs) {

							$(element).modal({
								show : false,
								keyboard : attrs.keyboard,
								backdrop : attrs.backdrop,
								title : attrs.title
							});

							scope.$watch(function() {
								return scope.visible;
							}, function(value) {

								if (value == true) {
									$(element).modal('show');
								} else {
									$(element).modal('hide');
								}
							});

							$(element).on('show.bs.modal', function() {
								scope.onSown({});
							});

							$(element).on(
									'hide.bs.modal',
									function() {
										scope.onHide({});
										$parse(attrs.visible).assign(
												scope.$parent, false);
										if (!scope.$parent.$$phase
												&& !scope.$root.$$phase)
											scope.$parent.$apply();
									});
						}
					};
				});