<rt-step>
	<p class="list-group-item-text">
		<span class="keyword">{ keyword }</span>
		<span each={ nameFragments } class={ argument: isArgument }>{ value }</span>
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

		rt-step .argument {
			font-weight: bold;
		}
	</style>

	<script>
		var self = this;

		/**
		 * Represents the given step name as an array of text fragments so that we
		 * can render the arguments differently.
		 */
		function fragmentize(name, match) {
			var frags = [],
					pos = 0;

			if (typeof match === 'undefined' || typeof match.arguments === 'undefined') {
				return [ { isArgument: false, value: name } ];
			}

			for (var i = 0; i < match.arguments.length; i++) {
				var arg = match.arguments[i];

				if (typeof arg.offset !== 'undefined') {
					// Leading string before current argument
					if (pos < arg.offset) {
						frags.push({ isArgument: false, value: name.substr(pos, arg.offset - pos) });
					}

					// Argument value
					frags.push({ isArgument: true, value: arg.val });

					pos = arg.offset + arg.val.length;
				}
			}

			// Trailing string after all arguments
			if (pos < name.length) {
				frags.push({ isArgument: false, value: name.substr(pos) });
			}

			return frags;
		}

		self.showErrorMessage = function (e) {
			$(e.target).removeClass('collapsed');
		};

		self.on('update', function () {
			if (self.name) {
				self.nameFragments = fragmentize(self.name, self.match);
			}
		});
	</script>
</rt-step>
