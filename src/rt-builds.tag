<rt-builds>
	<ul class="builds nav nav-pills">
		<li each={ builds } role="presentation" class={ selected: parent.currentBuildId == _id }>
			<a href="{ parent.pathTo(this) }" class="label label-{ raita.statuses[result.status] }">Build { number }</a>
		</li>
	</ul>

	<style>
		rt-builds .builds > li {
			font-size: larger;
		}

		rt-builds .builds > li.selected > a {
			padding-bottom: 5px;
			border-bottom: 5px solid rgba(119, 119, 119, 0.75);
		}
	</style>

	<script>
		var self = this;

		self.builds = [];

		self.pathTo = function (build) {
			var path = 'builds/' + build._id;

			if (typeof self.currentProject !== 'undefined' && build.project.repo == self.currentProject) {
				return '#projects/' + encodeURIComponent(self.currentProject) + '/' + path;
			} else {
				return '#' + path;
			}
		};
	</script>
</rt-builds>
