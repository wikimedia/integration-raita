<rt-build-filter>
	<form onsubmit={ submit }>
		<div class="filter input-group">
			<span class="input-group-btn">
				<button class="btn btn-default" type="button" onclick={ clear }><span class="octicon octicon-circle-slash"></span></button>
			</span>
			<input class="form-control" type="text" name="filterString" value="{ filterToString() }"
				placeholder="e.g. 'status:failed', 'status:skipped', '@some-tag-name'">
			<span class="input-group-btn">
				<button class="btn btn-info" type="submit">Update</button>
			</span>
		</div>
	</form>

	<script>
		var self = this;

		self.filter = [];

		function filterFromString(str) {
			return str.split(/\s+/).map(function (item) {
				var m, pair = {};

				if (m = item.match(/^(@.+)$/)) {
					pair.tag = m[1];
				} else if (m = item.match(/^(status):(.+)$/)) {
					pair[m[1]] = m[2];
				}

				return pair;
			});
		}

		self.clear = function () {
			self.filter = [];
			self.trigger('rt:filter', self.filter);
			self.filterString.focus();
		};

		self.filterToString = function () {
			return self.filter.map(function (pair) {
				for (var k in pair) {
					switch (k) {
						case 'tag':
							return pair[k];
						default:
							return k + ':' + pair[k];
					}
				}
			})
			.join(' ');
		};

		self.submit = function () {
			self.filter = filterFromString(self.filterString.value);
			self.trigger('rt:filter', self.filter);
		};
	</script>
</rt-build-filter>
