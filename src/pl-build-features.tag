<pl-build-features>
	<div class="list-group">
		<pl-feature each={ nonEmptyFeatures() } class="list-group-item"></pl-feature>
	</div>

	<script>
		var self = this;

		self.nonEmptyFeatures = function () {
			return self.features.filter(function (feature) {
				return feature.elements.length > 1 || feature.elements[0].type !== 'background';
			});
		};
	</script>
</pl-build-features>
