<pl-builds>
	<ul class="builds">
		<li each={ builds }><a href="#builds/{ _id }">Build { build_number }</a></li>
	</ul>

	<script>
		var self = this,
				app = opts,
				limit = opts.limit || 5;

		self.builds = [];

		self.on('mount', app.loadBuilds);

		app.subscribe(self, {
			'load-builds': function (builds) {
				self.update({ builds: builds });
			}
		});
	</script>
</pl-builds>
