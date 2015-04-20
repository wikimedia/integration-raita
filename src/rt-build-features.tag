<rt-build-features>
	<div class="list-group">
		<rt-feature each={ nonEmptyFeatures() } class="list-group-item"></rt-feature>
	</div>

	<script>
		var self = this;

		self.nonEmptyFeatures = function () {
			return self.features.filter(function (feature) {
				return feature.elements.length > 1 || feature.elements[0].type !== 'background';
			});
		};
	</script>
</rt-build-features>
