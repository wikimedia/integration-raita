<rt-feature>
	<h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4>

	<div class="scenarios list-group">
		<rt-element each={ elements } background={ parent.background } class="list-group-item"></rt-element>
	</div>

	<script>
		var self = this;

		self.elements = [];

		self.on('update', function () {
			if (self.elements.length > 0 && self.elements[0].type === 'background') {
				self.background = self.elements[0];
			}
		});
	</script>
</rt-feature>