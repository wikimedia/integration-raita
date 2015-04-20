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
			location.hash = '#builds/latest';
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

		self.search = function (collection, query, fields) {
			fields = fields || [ '_source' ];
			return request('post', pathTo(collection, '_search') + '?fields=' + fields.join(','), query);
		};

		self.sourcesOf = function (results, mapByProperty) {
			var sources = mapByProperty ? {} : [];

			for (var i = 0; i < results.length; i++) {
				var source = results[i]._source;

				source._id = results[i]._id;

				if (results[i].fields) {
					for (var k in results[i].fields) {
						source[k] = results[i].fields[k];
					}
				}

				if (mapByProperty) {
					sources[source[mapByProperty]] = sources[source[mapByProperty]] || [];
					sources[source[mapByProperty]].push(source);
				} else {
					sources.push(source);
				}
			}

			return sources;
		}

		return self;
	};

	Platter.Dashboard = function (dbURL) {
		var self = {},
				db = Platter.Database(dbURL);

		self.compileUserFilter = function (type, ufilter) {
			var esfilter = { bool: { must: [], should: [] } };

			function relation(filter) {
				if (type === 'feature-element') {
					return { has_parent: { type: 'feature', filter: filter } };
				} else {
					return { has_child: { type: 'feature-element', filter: filter } };
				}
			}

			if (ufilter) {
				for (var i = 0; i < ufilter.length; i++) {
					for (var key in ufilter[i]) {
						var val = ufilter[i][key];

						switch (key) {
							case 'tag':
								var filter = { nested: { path: 'tags', filter: { term: { 'tags.name': val } } } };

								esfilter.bool.should.push(filter, relation(filter));
								break;
							case 'status':
								var filter = { term: { 'result.status': val } };

								esfilter.bool.must.push(type === 'feature' ? relation(filter) : filter);
								break;
						}
					}
				}
			}

			esfilter.bool = self.pruneFilter(esfilter.bool);

			return esfilter;
		};

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
			db.search('build', { sort: [ { _timestamp: { order: 'desc' } } ] })
				.done(function (data) {
					if (data.hits.hits.length > 0) {
						self.trigger('load-builds', db.sourcesOf(data.hits.hits));
					}
				});
		};

		self.loadElements = function (featureIds, ufilter) {
			var elementFilter = {
				bool: {
					must: { has_parent: { type: 'feature', filter: { ids: { values: featureIds } } } }
				}
			};

			ufilter = self.compileUserFilter('feature-element', ufilter);

			if (Object.keys(ufilter.bool).length > 0) {
				elementFilter.bool.should = [
					{ term: { type: "background" } },
					ufilter
				];
			}

			db.search('feature-element', { filter: elementFilter }, [ '_source', '_parent'])
				.done(function (data) {
					self.trigger('load-build-features-elements', db.sourcesOf(data.hits.hits, '_parent'));
				});
		};

		self.loadFeatures = function (buildId, ufilter) {
			var featureFilter = {
				bool: {
					must: [ { has_parent: { type: 'build', filter: { term: { _id: buildId } } } } ]
				}
			};

			ufilter = self.compileUserFilter('feature', ufilter);

			if (ufilter.bool.must) {
				for (var i = 0; i < ufilter.bool.must.length; i++) {
					featureFilter.bool.must.push(ufilter.bool.must[i]);
				}
			}

			if (ufilter.bool.should) {
				featureFilter.bool.should = ufilter.bool.should;
			}

			db.search('feature', { filter: featureFilter }).done(function (data) {
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

		self.pruneFilter = function (filter) {
			var newFilter = {};

			for (var k in filter) {
				if (filter[k].length > 0) {
					newFilter[k] = filter[k];
				}
			}

			return newFilter;
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
