<pl-dashboard>
	<pl-builds></pl-builds>
	<pl-build-info></pl-build-info>
	<pl-build-filter></pl-build-filter>
	<pl-build-features></pl-build-features>

	<script>
		var self = this,
				dash = opts,
				currentBuildId,
				currentFeatures;

		self.on('mount', function () {
			dash.loadBuilds();

			self.tags['pl-build-info'].on('pl:status-click', function (status) {
				var filter = [ { status: status } ];

				self.tags['pl-build-filter'].update({ filter: filter });
			});

			self.tags['pl-build-filter'].on('update', function () {
				if (currentBuildId && self.tags['pl-build-filter'].filter) {
					dash.loadFeatures(currentBuildId, self.tags['pl-build-filter'].filter);
				}
			});
		});

		dash.subscribe(self, {
			'load-build': function (id, build) {
				currentBuildId = id;

				// Updating the filter triggers a reload of features
				// TODO this is confusing
				self.tags['pl-build-filter'].update({ filter: [] });

				self.tags['pl-build-info'].update({ buildId: id, buildNumber: build.build_number });
				self.tags['pl-builds'].update({ currentBuildId: id });
			},

			'load-builds': function (builds) {
				self.tags['pl-builds'].update({ builds: builds });
			},

			'load-build-features': function (buildId, features) {
				currentFeatures = features;

				dash.loadElements(
					features.map(function (f) { return f._id; }),
					self.tags['pl-build-filter'].filter
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

				self.tags['pl-build-info'].update({ features: currentFeatures });
				self.tags['pl-build-features'].update({ features: currentFeatures });
			},
		});
	</script>
</pl-dashboard>
