<rt-builds>
	<ul class="builds nav nav-pills">
		<li each={ builds } role="presentation" class={ active: parent.currentBuildId == _id }>
			<a href="#builds/{ _id }" class="label label-{ raita.statuses[result.status] }">Build { number }</a>
		</li>
	</ul>

	<style>
		rt-builds .builds > li {
			font-size: larger;
		}
	</style>

	<script>
		this.builds = [];
	</script>
</rt-builds>
