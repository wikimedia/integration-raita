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
		var dash = new Platter.Dashboard(dbURL);

		function router() {
			dash.route.apply(dash, arguments);
		}

		riot.route(router);
		dash.mount(selector);
		riot.route.exec(router);

		if (location.hash.length === 0) {
			location.hash = '#builds/latest';
		}

		return dash;
	};

	Platter.Database = function (url) {
		this.url = url;
	};

	(function (db) {
		db.get = function (collection, id) {
			return this.request('get', this.pathTo(collection, id));
		};

		db.pathTo = function () {
			return this.url + '/' + Array.prototype.join.call(arguments, '/');
		};

		db.request = function (method, url, data) {
			var options = { method: method, url: url };

			if (typeof data !== 'undefined') {
				options.data = JSON.stringify(data);
				options.contentType = 'application/json';
			}

			return $.ajax(options);
		};

		db.search = function (collection, query, fields) {
			fields = (fields || [ '_source' ]).join(',');
			return this.request('post', this.pathTo(collection, '_search') + '?fields=' + fields, query);
		};

		db.sourcesOf = function (results, mapByProperty) {
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
		};

	})(Platter.Database.prototype);

	Platter.Dashboard = function (dbURL) {
		this.db = new Platter.Database(dbURL);
		riot.observable(this);
	};

	(function (dash) {
		dash.compileUserFilter = function (type, ufilter) {
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

			esfilter.bool = this.pruneFilter(esfilter.bool);

			return esfilter;
		};

		dash.loadBuild = function (id) {
			var self = this;

			if (id == 'latest') {
				this.loadLatestBuild();
			} else {
				this.db.get('build', id)
					.done(function (data) {
						self.trigger('load-build', data._id, data._source);
					});
			}
		};

		dash.loadBuilds = function (limit) {
			var self = this;

			this.db.search('build', { sort: [ { _timestamp: { order: 'desc' } } ] })
				.done(function (data) {
					if (data.hits.hits.length > 0) {
						self.trigger('load-builds', self.db.sourcesOf(data.hits.hits));
					}
				});
		};

		dash.loadElements = function (featureIds, ufilter) {
			var self = this;

			var elementFilter = {
				bool: {
					must: { has_parent: { type: 'feature', filter: { ids: { values: featureIds } } } }
				}
			};

			ufilter = this.compileUserFilter('feature-element', ufilter);

			if (Object.keys(ufilter.bool).length > 0) {
				elementFilter.bool.should = [
					{ term: { type: "background" } },
					ufilter
				];
			}

			this.db.search('feature-element', { filter: elementFilter }, [ '_source', '_parent'])
				.done(function (data) {
					self.trigger('load-build-features-elements', self.db.sourcesOf(data.hits.hits, '_parent'));
				});
		};

		dash.loadFeatures = function (buildId, ufilter) {
			var self = this;

			var featureFilter = {
				bool: {
					must: [ { has_parent: { type: 'build', filter: { term: { _id: buildId } } } } ]
				}
			};

			ufilter = this.compileUserFilter('feature', ufilter);

			if (ufilter.bool.must) {
				for (var i = 0; i < ufilter.bool.must.length; i++) {
					featureFilter.bool.must.push(ufilter.bool.must[i]);
				}
			}

			if (ufilter.bool.should) {
				featureFilter.bool.should = ufilter.bool.should;
			}

			this.db.search('feature', { filter: featureFilter }).done(function (data) {
				self.trigger('load-build-features', buildId, self.db.sourcesOf(data.hits.hits));
			});
		};

		dash.loadLatestBuild = function () {
			var self = this;

			this.db.search('build', {
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

		dash.mount = function (selector) {
			riot.mount(selector, 'pl-dashboard', this);
		};

		dash.pruneFilter = function (filter) {
			var newFilter = {};

			for (var k in filter) {
				if (filter[k].length > 0) {
					newFilter[k] = filter[k];
				}
			}

			return newFilter;
		};

		dash.route = function (collection, id) {
			switch (collection) {
				case 'builds':
					this.loadBuild(id);
					break;
			}
		};

		dash.subscribe = function (tag, callbacks) {
			var self = this;

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

	})(Platter.Dashboard.prototype);

	return Platter;
});
