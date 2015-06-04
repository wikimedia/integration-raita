<rt-build-features>
	<div class="list-group { filterFlags }">
		<rt-feature each={ nonEmptyFeatures() } class="list-group-item"></rt-feature>
	</div>

	<style>
		/* When results are filtered, collapse steps until they are expanded */
		rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded),
		rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) {
			padding: 0 15px;
		}

		rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(1),
		rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(1) {
			cursor: pointer;
		}

		rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(1):before,
		rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(1):before {
			display: block;
			content: '...';
		}

		rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(1) *,
		rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(n+2),
		rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(1) *,
		rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(n+2) {
			display: none;
		}
	</style>

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
