<pl-build-info>
	<h2 if={ !buildId }>Loading build...</h2>
	<h2 if={ buildId }>Build { buildNumber }</h2>
	<div class="progress">
		<a class="progress-bar progress-bar-striped progress-bar-danger"
			style="width: { stats.fail_rate }%"
			onclick={ failedClicked }>
			<span class="label label-default" if={ stats.failed > 0 }>{ stats.failed } failed</span>
		</a>
		<a
			class="progress-bar progress-bar-striped progress-bar-warning"
			style="width: { stats.skip_rate }%"
			onclick={ skippedClicked }>
			<span class="label label-default" if={ stats.skipped > 0 }>{ stats.skipped } skipped</span>
		</a>
		<a class="progress-bar progress-bar-striped progress-bar-success"
			style="width: { stats.pass_rate }%"
			onclick={ passedClicked }>
			<span class="label label-default"  if={ stats.passed > 0 }>{ stats.passed } passed</span>
		</a>
	</div>

	<style>
		pl-build-info .label {
			font-size: 100%;
			background-color: rgba(119, 119, 119, 0.75);
		}

		pl-build-info a {
			cursor: pointer;
		}
	</style>

	<script>
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
				self.trigger('pl:status-click', status);
			};
		});

		self.on('update', recalculate);
	</script>
</pl-build-info>
