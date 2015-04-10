<pl-build-features>
	<ul class="features list-group">
		<pt-feature each={ features }></pt-feature>
		<li each={ features } class="list-group-item">
			<h4 class="list-group-item-heading">{ keyword }: { name }</h4>
			<ul class="scenarios list-group">
				<li each={ elements } class="list-group-item">
					<h5 class="list-group-item-heading">{ keyword }: { name }</h5>
					<ul class="steps list-group">
						<li each={ steps } class="list-group-item list-group-item-{
							success: result.status == 'passed',
							info: result.status == 'skipped',
							danger: result.status == ''
						}">
							<p class="list-group-item-text">{ keyword } { name }</p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>

	<script>
		var self = this,
				app = opts;

		self.buildId = null;
		self.features = [];

		app.subscribe(self, {
			'load-build': function (id, build) {
				self.buildId = id;
			},
			'load-build-features': function (buildId, features) {
				if (buildId === self.buildId) {
					console.log(features);
					self.update({ features: features });
				}
			}
		});
	</script>
</pl-build-features>
