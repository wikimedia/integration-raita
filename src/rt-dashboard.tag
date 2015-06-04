<rt-dashboard>
	<rt-projects></rt-projects>
	<rt-builds></rt-builds>
	<rt-build-info></rt-build-info>
	<rt-build-filter></rt-build-filter>
	<rt-build-features></rt-build-features>

	<script>
		var self = this,
				dash = opts,
				currentBuildId,
				currentFeatures,
				currentFilter = [],
				currentProject;

		self.on('mount', function () {
			dash.loadProjects();

			self.tags['rt-build-info'].on('rt:status-click', function (status) {
				self.tags['rt-build-filter'].update({ filter: [ { status: status } ] });
			});

			self.tags['rt-build-features'].on('rt:select-tag', function (tag) {
				self.tags['rt-build-filter'].update({ filter: [ { tag: tag.name } ] });
			});

			self.tags['rt-build-filter'].on('update', function () {
				if (currentBuildId && self.tags['rt-build-filter'].filter) {
					currentFilter = self.tags['rt-build-filter'].filter;
					dash.loadFeatures(currentBuildId, currentFilter);
				}
			});
		});

		dash.subscribe(self, {
			'load-projects': function (projects) {
				self.tags['rt-projects'].update({ projects: projects });
			},

			'load-build': function (id, build) {
				currentBuildId = id;

				// Updating the filter triggers a reload of features above
				self.tags['rt-build-filter'].update({ filter: [] });

				self.tags['rt-build-info'].update({ buildId: id, build: build });
				self.tags['rt-builds'].update({ currentBuildId: id });
			},

			'loading-builds': function (project) {
				self.tags['rt-projects'].update({ currentProject: project });
			},

			'loading-latest-build': function (project) {
				self.tags['rt-projects'].update({ currentProject: project });
			},

			'load-builds': function (builds, project) {
				self.tags['rt-builds'].update({ builds: builds });

				if (typeof project !== 'undefined') {
					dash.loadLatestBuild(project);
				}

				currentProject = project;
			},

			'load-build-features': function (buildId, features) {
				currentFeatures = features;

				dash.loadElements(
					features.map(function (f) { return f._id; }),
					self.tags['rt-build-filter'].filter
				);
			},

			'load-build-features-elements': function (elements) {
				for (var i = 0; i < currentFeatures.length; i++) {
					for (var fid in elements) {
						if (currentFeatures[i]._id === fid) {
							currentFeatures[i].elements = elements[fid];
						}
					}

					if (typeof currentFeatures[i].elements === 'undefined') {
						currentFeatures[i].elements = [];
					}
				}

				self.tags['rt-build-info'].update({ features: currentFeatures });
				self.tags['rt-build-features'].update({ features: currentFeatures, filter: currentFilter });
			},
		});
	</script>
</rt-dashboard>
