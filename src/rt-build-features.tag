<rt-build-features>
	<div class="list-group { filterFlags }">
		<rt-feature each={ nonEmptyFeatures() } class="list-group-item"></rt-feature>
	</div>

	<script>
		var self = this;

		self.filters = function () {
			var classes = [];

			if (self.filter) {
				for (var i = 0; i < self.filter.length; i++) {
					if ('status' in self.filter[i]) {
						classes.push(self.filter[i].status);
					}
				}
			}

			return classes;
		};

		self.nonEmptyFeatures = function () {
			return self.features.filter(function (feature) {
				return feature.elements.length > 0 &&
					(feature.elements.length > 1 || feature.elements[0].type !== 'background');
			});
		};

		self.on('update', function () {
			if (typeof self.filter !== 'undefined') {
				var flags = [];

				for (var i = 0; i < self.filter.length; i++) {
					for (var k in self.filter[i]) {
						flags.push(k + '-' + self.filter[i][k]);
					}
				}

				self.filterFlags = flags.join(' ');
			}
		});

		self.on('updated', function () {
			raita.bubble(self, 'rt-feature', 'rt:select-tag');
		});
	</script>
</rt-build-features>
