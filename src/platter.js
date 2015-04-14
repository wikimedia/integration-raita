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

	Platter.dashboard = function (selector, dbURL) {
		var dash = Platter.Dashboard(dbURL);

		riot.route(dash.route);
		dash.mount(selector);
		riot.route.exec(dash.route);

		if (location.hash.length === 0) {
			location.hash = '#builds/latest'
		}

		return dash;
	};

	Platter.Database = function (url) {
		var self = {};

		function pathTo() {
			return url + '/' + Array.prototype.join.call(arguments, '/');
		}

		function request(method, url, data) {
			var options = { method: method, url: url };

			if (typeof data !== 'undefined') {
				options.data = JSON.stringify(data);
				options.contentType = 'application/json';
			}

			return $.ajax(options);
		}

		self.get = function (collection, id) {
			return request('get', pathTo(collection, id));
		};

		self.search = function (collection, query) {
			return request('post', pathTo(collection, '_search'), query);
		};

		self.sourcesOf = function (results) {
			var sources = [];

			for (var i = 0; i < results.length; i++) {
				sources.push(results[i]._source);
				sources[i]._id = results[i]._id;
			}

			return sources;
		}

		return self;
	};

	Platter.Dashboard = function (dbURL) {
		var self = {},
				db = Platter.Database(dbURL);

		self.loadBuild = function (id) {
			if (id == 'latest') {
				self.loadLatestBuild();
			} else {
				db.get('build', id)
					.done(function (data) {
						self.trigger('load-build', data._id, data._source);
					});
			}
		};

		self.loadBuilds = function (limit) {
			db.search('build', {
				sort: [ { _timestamp: { order: 'desc' } } ]
			})
			.done(function (data) {
				if (data.hits.hits.length > 0) {
					self.trigger('load-builds', db.sourcesOf(data.hits.hits));
				}
			});
		};

		self.loadFeatures = function (buildId) {
			db.search('feature', {
				query: {
					has_parent: {
						type: 'build', query: { match: { _id: buildId } }
					}
				}
			})
			.done(function (data) {
				self.trigger('load-build-features', buildId, db.sourcesOf(data.hits.hits));
			});
		};

		self.loadLatestBuild = function () {
			db.search('build', {
				size: 1,
				sort: [ { _timestamp: { order: 'desc' } } ]
			})
			.done(function (data) {
				if (data.hits.hits.length > 0) {
					var hit = data.hits.hits[0];
					self.trigger('load-build', hit._id, hit._source);
				}
			});
		};

		self.mount = function (selector) {
			riot.mount(selector, 'pl-dashboard', self);
		};

		self.route = function (collection, id) {
			switch (collection) {
				case 'builds':
					self.loadBuild(id);
					break;
			}
		};

		self.subscribe = function (tag, callbacks) {
			function sub(onOff) {
				return function () {
					for (var ev in callbacks) {
						self[onOff](ev, callbacks[ev]);
					}
				};
			}

			tag.on('mount', sub('on'));
			tag.on('unmount', sub('off'));
		};

		riot.observable(self);

		return self;
	};

	return Platter;
});
