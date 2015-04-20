<rt-builds>
	<ul class="builds nav nav-pills">
		<li each={ builds } role="presentation" class={ active: parent.currentBuildId == _id }>
			<a href="#builds/{ _id }">Build { build_number }</a>
		</li>
	</ul>

	<script>
		this.builds = [];
	</script>
</rt-builds>
