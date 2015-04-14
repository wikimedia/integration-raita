<pl-dashboard>
	<pl-builds></pl-builds>
	<pl-build-info></pl-build-info>
	<pl-build-features></pl-build-features>

	<script>
		var self = this,
				dash = opts;

		dash.subscribe(self, {
			'load-build': function (id, build) {
				self.tags['pl-build-info'].update({ buildId: id, buildNumber: build.build_number });
				self.tags['pl-builds'].update({ currentBuildId: id });

				dash.loadFeatures(id);
			},

			'load-builds': function (builds) {
				self.tags['pl-builds'].update({ builds: builds });
			},

			'load-build-features': function (buildId, features) {
				self.tags['pl-build-features'].update({ features: features });
			}
		});

		self.on('mount', function () {
			dash.loadBuilds();
		});
	</script>
</pl-dashboard>
