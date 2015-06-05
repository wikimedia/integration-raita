<rt-projects>
	<ul class="projects nav nav-pills">
		<li role="presentation" class={ active: !currentProject }>
			<a href="#builds/latest">All</a>
		</li>
		<li each={ projects } role="presentation" class={ active: parent.currentProject === repo }>
			<a href="#projects/{ encodeURIComponent(repo) }/builds/latest">{ label }</a>
		</li>
	</ul>

	<style>
		rt-projects > ul.projects.nav {
			margin-bottom: 10px;
		}
	</style>

	<script>
		var self = this;

		self.projects = [];

		self.labelFromName = function (name) {
			return name.replace(/^r\/(mediawiki\/extensions\/)?/, '');
		};

		self.on('update', function () {
			for (var i = 0; i < self.projects.length; i++) {
				self.projects[i].label = self.labelFromName(self.projects[i].name);
			}

			// Sort projects by case-insensitive label
			self.projects.sort(function (a, b) {
				var x = a.label.toLowerCase(),
						y = b.label.toLowerCase();

				return x.localeCompare(y);
			});
		});
	</script>
</rt-projects>
