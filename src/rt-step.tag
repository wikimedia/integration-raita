<rt-step>
	<p class="list-group-item-text">
		<span class="keyword">{ keyword }</span> <span class="step-name">{ name }</span>
	</p>
	<p if={ match.location } class="list-group-item-text">
		<small>{ match.location }</small>
	</p>

	<pre if={ result.error_message }
		onclick={ showErrorMessage }
		class="list-group-item-text error-message collapsed">{ result.error_message }</pre>

	<style>
		rt-step > .error-message {
			transition: max-height 0.6s ease;
			max-height: 500em;
		}

		rt-step > .error-message.collapsed {
			cursor: pointer;
			max-height: 3em;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	</style>

	<script>
		var self = this;

		self.showErrorMessage = function (e) {
			$(e.target).removeClass('collapsed');
		};
	</script>
</rt-step>
