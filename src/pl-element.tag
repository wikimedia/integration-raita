<pl-element>
	<h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4>
	<p><span class="label label-{ statuses[status] }">{ status }</span></p>

	<div class="steps list-group">
		<pl-step each={ steps }
			class="list-group-item list-group-item-{ parent.statuses[result.status] }"></pl-step>
	</div>

	<script>
		this.statuses = {
			'passed': 'success',
			'skipped': 'warning',
			'failed': 'danger'
		};

		function statusOf(steps) {
			for (var i = 0; i < steps.length; i++) {
				if (steps[i].result.status == 'failed') {
					return 'failed';
				} else if (steps[i].result.status == 'skipped') {
					return 'skipped';
				}
			}

			return 'passed';
		};

		this.on('update', function () {
			if (this.steps) {
				this.status = statusOf(this.steps);
			}
		});
	</script>
</pl-element>
