=======
jQswipe
=======

Add swipe (or rightSwipe) and leftSwipe events to jQuery.
E.g, in the following example, swiping a task will reveal the link to remove it::

	<script src="http://code.jquery.com/jquery-latest.js" type="text/javascript"></script>
	<script src="jqswipe.js" type="text/javascript"></script>
	
	<ul id="tasks">
		<li>Task 1 <a href="#tasks">remove</a></li>
		<li>Task 2 <a href="#tasks">remove</a></li>
		<li>Task 3 <a href="#tasks">remove</a></li>
	</ul>
	
	<script type="text/javascript">
		// On click of 'complete' links, their list item are hidden,
		// but hide them for now.
		$('#tasks li > a').click(function(){
			$(this).parent().hide();
		}).hide();
		
		// On swipe, show the link.
		$('#tasks li').bind('swipe', function(){
			$(this).children('a').show();
		});
	</script>
	
By default, jQswipe only add a swipe (or leftSwipe) and a rightSwipe event, but
You can add your own swipe event by defining a `validate` function to validate the progress
of the swipe (on a touchmove event) and the final swipe (on the touchend event).
E.g., how jQswipe add the leftSwipe::

	jQswipe.register('leftSwipe', {
		validate: function() {
			var diffWithStart = this.diff(0, -1),
				diffWithPrevious = this.diff(-2, -1),
				STATE = $.jQswipe.STATE;
	
			// If the swipe has been cancelled in the past,
			// it cannot be valide any more.
			if (this.state === STATE.CANCELLED) {
				return false;
			}
	
			// validate progression
			if (diffWithStart.y > this.maxWidth ||  // Should not be too hight
				diffWithStart.y < -this.maxWidth || // or too low
				diffWithPrevious.x > 0              // should not move back to the left
			) {
				this.cancel();
				return false;
			}
	
			// Validate the comple swipe
			if (this.state === STATE.ENDED && diffWithStart.x > -(this.minLength)) {
				return false;
			}
	
			return true;
		}
	});

$.jQswipe.register, register an event type, e.g. `rightSwipe`, with some settings
to extend the Swipe object properties which record a swipe on an element.



