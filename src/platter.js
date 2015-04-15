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

		self.compileUserFilter = function (ufilter) {
			var esfilter = { must: [], should: [] };

			if (ufilter) {
				for (var i = 0; i < ufilter.length; i++) {
					for (var k in ufilter[i]) {
						var val = ufilter[i][k];

						switch (k) {
							case 'tag':
								esfilter.should.push({ term: { 'tags.name': val } });
								break;
							case 'status':
								esfilter.must.push({
									nested: {
										path: 'elements.steps',
										filter: { term: { 'elements.steps.result.status': val } }
									}
								});
								break;
						}
					}
				}
			}

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
			db.search('build', { sort: [ { _timestamp: { order: 'desc' } } ] }).done(function (data) {
				if (data.hits.hits.length > 0) {
					self.trigger('load-builds', db.sourcesOf(data.hits.hits));
				}
			});
		};

		self.loadFeatures = function (buildId, ufilter) {
			var filter = self.compileUserFilter(ufilter);
			filter.must.push({ has_parent: { type: 'build', filter: { term: { _id: buildId } } } });

			if (filter.should.length === 0) {
				delete filter.should;
			}

			db.search('feature', { filter: { bool: filter } }).done(function (data) {
				var features = db.sourcesOf(data.hits.hits);

				self.postFilterScenarios(features, ufilter);
				self.trigger('load-build-features', buildId, features);
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

		self.matchesFilter = function (element, ufilter) {
			var index = { tag: [], status: 'passed' },
					filters = [],
					matches = {},
					match = true;

			if (!ufilter || element.type === 'background') {
				return true;
			}

			for (var i = 0; i < ufilter.length; i++) {
				for (var k in ufilter[i]) {
					filters.push(k);
				}
			}

			if (element.name.match(/advanced setting/i)) debugger;

			for (var i = 0; i < element.steps.length; i++) {
				var step = element.steps[i];

				if (index.status !== 'failed' && step.result.status !== index.status) {
					index.status = step.result.status;
				}

				for (var j = 0; step.tags && j < step.tags.length; j++) {
					index.tag.push(step.tags[j].name);
				}
			}

			for (var k in index) {
				matches[k] = filters.indexOf(k) === -1;
			}

			for (var i = 0; i < ufilter.length; i++) {
				for (var k in ufilter[i]) {
					if (typeof index[k] !== undefined) {
						var val = ufilter[i][k];

						if (index[k] === val || index[k].indexOf(val) > -1) {
							matches[k] = true;
						}
					}
				}
			}

			for (var k in matches) {
				match = match && matches[k];
			}

			return match;
		};

		self.mount = function (selector) {
			riot.mount(selector, 'pl-dashboard', self);
		};

		self.postFilterScenarios = function (features, ufilter) {
			for (var i = 0; i < features.length; i++) {
				features[i].elements = features[i].elements.filter(function (element) {
					return self.matchesFilter(element, ufilter);
				});
			}
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
