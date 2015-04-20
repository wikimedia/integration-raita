<rt-dashboard>
	<rt-builds></rt-builds>
	<rt-build-info></rt-build-info>
	<rt-build-filter></rt-build-filter>
	<rt-build-features></rt-build-features>

	<script>
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

				// Updating the filter triggers a reload of features
				// TODO this is confusing
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
	</script>
</rt-dashboard>
