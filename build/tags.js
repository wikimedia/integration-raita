riot.tag('rt-build-features', '<div class="list-group"> <rt-feature each="{ nonEmptyFeatures() }" class="list-group-item"></rt-feature> </div>', function(opts) {
		var self = this;

		self.nonEmptyFeatures = function () {
			return self.features.filter(function (feature) {
				return feature.elements.length > 1 || feature.elements[0].type !== 'background';
			});
		};
	
});

riot.tag('rt-build-filter', '<form onsubmit="{ submit }"> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-default" type="button" onclick="{ clear }"><span class="glyphicon glyphicon-filter"></span></button> </span> <input class="form-control" type="text" name="filterString" value="{ filterToString() }" placeholder="e.g. \'status:failed\', \'status:skipped\', \'@some-tag-name\'"> <span class="input-group-btn"> <button class="btn btn-info" type="submit">Update</button> </span> </div> </form>', function(opts) {
		var self = this;

		self.filter = [];

		function filterFromString(str) {
			return str.split(/\s+/).map(function (item) {
				var m, pair = {};

				if (m = item.match(/^(@.+)$/)) {
					pair.tag = m[1];
				} else if (m = item.match(/^(status):(.+)$/)) {
					pair[m[1]] = m[2];
				}

				return pair;
			});
		}

		self.clear = function () {
			self.filter = [];
			self.trigger('pl:filter', self.filter);
			self.filterString.focus();
		};

		self.filterToString = function () {
			return self.filter.map(function (pair) {
				for (var k in pair) {
					switch (k) {
						case 'tag':
							return pair[k];
						default:
							return k + ':' + pair[k];
					}
				}
			})
			.join(' ');
		};

		self.submit = function () {
			self.filter = filterFromString(self.filterString.value);
			self.trigger('pl:filter', self.filter);
		};
	
});

riot.tag('rt-build-info', '<h2 if="{ !buildId }">Loading build...</h2> <h2 if="{ buildId }">Build { buildNumber }</h2> <div class="progress"> <a class="progress-bar progress-bar-striped progress-bar-danger" riot-style="width: { stats.fail_rate }%" onclick="{ failedClicked }"> <span class="label label-default" if="{ stats.failed > 0 }">{ stats.failed } failed</span> </a> <a class="progress-bar progress-bar-striped progress-bar-warning" riot-style="width: { stats.skip_rate }%" onclick="{ skippedClicked }"> <span class="label label-default" if="{ stats.skipped > 0 }">{ stats.skipped } skipped</span> </a> <a class="progress-bar progress-bar-striped progress-bar-success" riot-style="width: { stats.pass_rate }%" onclick="{ passedClicked }"> <span class="label label-default" if="{ stats.passed > 0 }">{ stats.passed } passed</span> </a> </div>', 'rt-build-info .label { font-size: 100%; background-color: rgba(119, 119, 119, 0.75); } rt-build-info a { cursor: pointer; }', function(opts) {
		var self = this;

		function recalculate() {
			self.stats = { failed: 0, skipped: 0, passed: 0, fail_rate: 0, skip_rate: 0, passed_rate: 0 };

			if (self.features) {
				var total = 0;

				self.features.forEach(function (feature) {
					feature.elements.forEach(function (element) {
						if (element.type == 'scenario') {
							if (typeof self.stats[element.result.status] !== 'undefined') {
								self.stats[element.result.status]++;
							}

							total++;
						}
					});
				});

				self.stats.fail_rate = self.stats.failed / total * 100;
				self.stats.skip_rate = self.stats.skipped / total * 100;
				self.stats.pass_rate = self.stats.passed / total * 100;
			}
		}

		recalculate();

		['failed', 'skipped', 'passed'].forEach(function (status) {
			self[status + 'Clicked'] = function () {
				self.trigger('rt:status-click', status);
			};
		});

		self.on('update', recalculate);
	
});

riot.tag('rt-builds', '<ul class="builds nav nav-pills"> <li each="{ builds }" role="presentation" class="{ active: parent.currentBuildId == _id }"> <a href="#builds/{ _id }">Build { build_number }</a> </li> </ul>', function(opts) {
		this.builds = [];
	
});

riot.tag('rt-dashboard', '<rt-builds></rt-builds> <rt-build-info></rt-build-info> <rt-build-filter></rt-build-filter> <rt-build-features></rt-build-features>', function(opts) {
		var self = this,
				dash = opts,
				currentBuildId,
				currentFeatures;

		self.on('mount', function () {
			dash.loadBuilds();

			self.tags['rt-build-info'].on('rt:status-click', function (status) {
				var filter = [ { status: status } ];

				self.tags['rt-build-filter'].update({ filter: filter });
			});

			self.tags['rt-build-filter'].on('update', function () {
				if (currentBuildId && self.tags['rt-build-filter'].filter) {
					dash.loadFeatures(currentBuildId, self.tags['rt-build-filter'].filter);
				}
			});
		});

		dash.subscribe(self, {
			'load-build': function (id, build) {
				currentBuildId = id;


				self.tags['rt-build-filter'].update({ filter: [] });

				self.tags['rt-build-info'].update({ buildId: id, buildNumber: build.build_number });
				self.tags['rt-builds'].update({ currentBuildId: id });
			},

			'load-builds': function (builds) {
				self.tags['rt-builds'].update({ builds: builds });
			},

			'load-build-features': function (buildId, features) {
				currentFeatures = features;

				dash.loadElements(
					features.map(function (f) { return f._id; }),
					self.tags['rt-build-filter'].filter
				);
			},

			'load-build-features-elements': function (elements) {
				for (var fid in elements) {
					for (var i = 0; i < currentFeatures.length; i++) {
						if (currentFeatures[i]._id === fid) {
							currentFeatures[i].elements = elements[fid];
						}
					}
				}

				self.tags['rt-build-info'].update({ features: currentFeatures });
				self.tags['rt-build-features'].update({ features: currentFeatures });
			},
		});
	
});

riot.tag('rt-element', '<h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4> <p><span class="label label-{ statuses[result.status] }">{ result.status }</span></p> <div class="steps list-group"> <rt-step each="{ nonBackgroundSteps() }" class="list-group-item list-group-item-{ parent.statuses[result.status] }"></rt-step> </div>', function(opts) {
		var self = this;

		self.background = opts.background;
		self.statuses = { 'passed': 'success', 'skipped': 'warning', 'failed': 'danger' };

		self.nonBackgroundSteps = function () {
			if (self.type === 'background' || !self.background) {
				return self.steps;
			} else {
				return self.steps.slice(self.background.steps.length);
			}
		};
	
});

riot.tag('rt-feature', '<h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4> <div class="scenarios list-group"> <rt-element each="{ elements }" background="{ parent.background }" class="list-group-item"></rt-element> </div>', function(opts) {
		var self = this;

		self.elements = [];

		self.on('update', function () {
			if (self.elements.length > 0 && self.elements[0].type === 'background') {
				self.background = self.elements[0];
			}
		});
	
});

riot.tag('rt-step', '<p class="list-group-item-text"> <span class="keyword">{ keyword }</span> <span class="step-name">{ name }</span> </p> <p if="{ match.location }" class="list-group-item-text"> <small>{ match.location }</small> </p>', function(opts) {

});
