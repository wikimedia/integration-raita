<pl-dashboard>
	<pl-builds></pl-builds>
	<pl-build-info></pl-build-info>
	<pl-build-filter></pl-build-filter>
	<pl-build-features></pl-build-features>

	<script>
		var self = this,
				dash = opts,
				currentBuildId;

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
				dash.loadFeatures(id);

				self.tags['pl-build-info'].update({ buildId: id, buildNumber: build.build_number });
				self.tags['pl-builds'].update({ currentBuildId: id });
			},

			'load-builds': function (builds) {
				self.tags['pl-builds'].update({ builds: builds });
			},

			'load-build-features': function (buildId, features) {
				self.tags['pl-build-info'].update({ features: features });
				self.tags['pl-build-features'].update({ features: features });
			}
		});
	</script>
</pl-dashboard>
