<rt-build-info>
	<div class="build-details panel panel-default">
		<div class="panel-heading">
			<h3 if={ !buildId }>Loading build...</h3>
			<h3 if={ buildId }>Build { build.number } <a href="{ build.url }" class="glyphicon glyphicon-new-window"></a></h3>
			<h4><span class="label label-{ raita.statuses[build.result.status] }">{ build.result.status }</span></h4>
		</div>
		<table class="table">
			<tr data-toggle="tooltip" title="Repository">
				<th><span class="octicon octicon-repo"></span></th>
				<td><a href="{ build.repoURL() }">{ build.project.repo }</a></td></tr>
			<tr data-toggle="tooltip" title="Branch">
				<th><span class="octicon octicon-git-branch"></span></th>
				<td>{ build.project.branch }</td></tr>
			<tr data-toggle="tooltip" title="Commit">
				<th><span class="octicon octicon-git-commit"></span></th>
				<td><a href="{ build.commitURL() }">{ build.project.commit }</a></td></tr>
			<tr data-toggle="tooltip" title="Environment URL">
				<th><span class="octicon octicon-cloud-upload"></span></th>
				<td><a hef="{ build.environment.url }">{ build.environment.url }</a></td></tr>
			<tr data-toggle="tooltip" title="Browser">
				<th><span class="octicon octicon-browser"></span></th>
				<td>{ build.browser.name }</td></tr>
			<tr data-toggle="tooltip" title="Browser version">
				<th><span class="octicon octicon-versions"></span></th>
				<td>{ build.browser.version || '(latest)' }</td></tr>
			<tr data-toggle="tooltip" title="Platform">
				<th><span class="octicon octicon-terminal"></span></th>
				<td>{ build.browser.platform }</td></tr>
		</table>
	</div>

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
		rt-build-info .build-details {
			margin-top: 20px;
		}

		rt-build-info .build-details th {
			width: 1%;
		}

		rt-build-info .build-details td {
			width: 99%;
		}

		rt-build-info .progress {
			margin-top: 20px;
		}

		rt-build-info .progress .label {
			font-size: 100%;
			background-color: rgba(119, 119, 119, 0.75);
		}

		rt-build-info a {
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
					if (typeof feature.elements !== 'undefined') {
						feature.elements.forEach(function (element) {
							if (element.type == 'scenario') {
								if (typeof self.stats[element.result.status] !== 'undefined') {
									self.stats[element.result.status]++;
								}

								total++;
							}
						});
					}
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

		self.on('updated', function () {
			$('[data-toggle="tooltip"]', self.root).tooltip({ placement: 'left' });
		});
	</script>
</rt-build-info>
