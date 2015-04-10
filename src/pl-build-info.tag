<pl-build-info>
	<h2 if={ !buildId }>Loading build...</h2>
	<h2 if={ buildId }>Build { buildNumber } ({ buildId })</h2>

	<script>
		var self = this,
				app = opts;

		self.buildId = null;
		self.buildNumber = null;

		app.subscribe(self, {
			'load-build': function (id, build) {
				self.update({ buildId: id, buildNumber: build.build_number });
			},
			'load-build-features': function (buildId, features) {
				if (buildId === self.buildId) {
					// TODO stats
				}
			}
		});
	</script>
</pl-build-info>
