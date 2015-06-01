<rt-tag>
	<span class="tag label label-default" onclick={ click }>{ name }</span>

	<script>
		var self = this;

		self.click = function () {
			self.trigger('rt:select-tag', { name: self.name, line: self.line });
		};
	</script>
</rt-tag>
