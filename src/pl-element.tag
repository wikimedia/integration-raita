<pl-element>
	<h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4>
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
	</script>
</pl-element>
