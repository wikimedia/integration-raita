<pl-element>
	<h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4>
	<p><span class="label label-{ statuses[result.status] }">{ result.status }</span></p>

	<div class="steps list-group">
		<pl-step each={ nonBackgroundSteps() }
			class="list-group-item list-group-item-{ parent.statuses[result.status] }"></pl-step>
	</div>

	<script>
		var self = this;

		self.background = opts.background;
		self.statuses = { 'passed': 'success', 'skipped': 'warning', 'failed': 'danger' };

		self.nonBackgroundSteps = function () {
			if (self.type === 'background' || !self.background) {
				return self.steps;
			} else {
				return self.steps.slice(self.background.steps.length);
			}
		};
	</script>
</pl-element>
