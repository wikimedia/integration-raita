(function (binding, factory) {
	if (typeof define === 'function' && define.amd) {
		define('platter', ['riot', 'jquery'], factory);
	} else {
		binding.Platter = factory(binding.riot, binding.jQuery);
	}
})(this, function (riot, $) {
	'use strict';

	var Platter = {};

	Platter.VERSION = '0.0.0';

	Platter.start = function () {
		var app = Platter.App();

		riot.route(app.dispatch);
		riot.mount('*', app);
		riot.route.exec(app.dispatch);

		return app;
	};

	Platter.App = function () {
		var self = {};

		var dbURL = '/db/builds';

		function load(collection, id) {
			return request('get', pathTo(collection, id));
		}

		function pathTo() {
			return dbURL + '/' + Array.prototype.join.call(arguments, '/');
		}

		function request(method, url, data) {
			var options = { method: method, url: url };

			if (typeof data !== 'undefined') {
				options.data = JSON.stringify(data);
				options.contentType = 'application/json';
			}

			return $.ajax(options);
		}

		function search(collection, query) {
			return request('post', pathTo(collection, '_search'), query);
		}

		function sourcesOf(results) {
			var sources = [];

			for (var i = 0; i < results.length; i++) {
				sources.push(results[i]._source);
				sources[i]._id = results[i]._id;
			}

			return sources;
		}

		self.dispatch = function (collection, id) {
			switch (collection) {
				case 'builds':
					self.loadBuild(id);
					break;
			}
		};

		self.loadBuild = function (id) {
			if (id == 'latest') {
				self.loadLatestBuild();
			} else {
				load('build', id)
					.done(function (data) {
						self.loadFeatures(data._id);
						self.trigger('load-build', data._id, data._source);
					});
			}
		};

		self.loadBuilds = function(limit) {
			search('build', {
				sort: [ { _timestamp: { order: 'desc' } } ]
			})
			.done(function (data) {
				if (data.hits.hits.length > 0) {
					self.trigger('load-builds', sourcesOf(data.hits.hits));
				}
			});
		};

		self.loadFeatures = function (buildId) {
			search('feature', {
				query: {
					has_parent: {
						type: 'build', query: { match: { _id: buildId } }
					}
				}
			})
			.done(function (data) {
				self.trigger('load-build-features', buildId, sourcesOf(data.hits.hits));
			});
		};

		self.loadLatestBuild = function () {
			search('build', {
				size: 1,
				sort: [ { _timestamp: { order: 'desc' } } ]
			})
			.done(function (data) {
				if (data.hits.hits.length > 0) {
					var hit = data.hits.hits[0];
					self.loadFeatures(hit._id);
					self.trigger('load-build', hit._id, hit._source);
				}
			});
		};

		self.subscribe = function (tag, callbacks) {
			tag.on('mount', function () {
				for (var ev in callbacks) {
					self.on(ev, callbacks[ev]);
				}
			});

			tag.on('unmount', function () {
				for (var ev in callbacks) {
					self.off(ev, callbacks[ev]);
				}
			});
		};


		riot.observable(self);

		return self;
	};

	return Platter;
});
