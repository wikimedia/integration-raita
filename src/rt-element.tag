<rt-element>
	<p if={ tags && tags.length > 0 }><rt-tag each={ tags }></rt-tag></p>

	<h4 class="list-group-item-heading">
		<span class="keyword">{ keyword }</span>: { name }
	</h4>
	<p>
		<span class="label label-{ statuses[result.status] }">{ result.status }</span>
		<span each={ links() }><a target="_blank" href="{ data }" class="octicon octicon-device-desktop"></a></span>
	</p>

	<div class="steps list-group">
		<rt-step each={ nonBackgroundSteps() }
			class="list-group-item list-group-item-{ parent.statuses[result.status] }"></rt-step>
	</div>

	<script>
		var self = this;

		self.background = opts.background;
		self.statuses = { 'passed': 'success', 'skipped': 'warning', 'failed': 'danger' };

		self.embeddings = function () {
			if (self.steps.length > 0) {
				return self.steps[self.steps.length - 1].embeddings || [];
			} else {
				return [];
			}
		};

		self.links = function () {
			return self.embeddings().filter(function (embed) { return embed.mime_type === 'text/url'; });
		};

		self.nonBackgroundSteps = function () {
			if (self.type === 'background' || !self.background) {
				return self.steps;
			} else {
				return self.steps.slice(self.background.steps.length);
			}
		};
	</script>
</rt-element>
