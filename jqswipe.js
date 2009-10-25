/*!
 * jQswipe v@VERSION - Swipe event for jQuery.
 * http://github.com/dinoboff/jQswipe/
 *
 * Copyright (c) 2009 Damien Lebrun
 * licenced under BSD
 * http://github.com/dinoboff/jQswipe/blob/master/LICENSE
 * 
 * Date: @DATE
 */
 
/**
 * based on "Safari Web Content Guide > Handling Events > Handling Multi-Touch Events"
 * http://bit.ly/Q6uOD
 * 
 * Implement special events as explained by Brandon Aaron:
 * http://brandonaaron.net/blog/2009/03/26/special-events
 */

 (function() {
	var jQswipe,
		window = this,
		$ = window.jQuery;
	
	/**
	 * Monkey patch to add the touches and targetTouches properties
	 * to jQuery.Event objects.
	 */
	$.each(['touches', 'targetTouches'], function(i, propName){
		if ( $.inArray(propName, $.event.props) < 0 ) {
			$.event.props.push(propName);
		}
	});
	
	// jQswipe namespace
	jQswipe = $.jQswipe = {};
	
	
	/**
	 * Point - representation of a point on the page
	 * 
	 * Used to store touch history 
	 */
	
	/**
	 * Constructor
	 */
	jQswipe.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	
	/**
	 * return the difference on x and y between two point.
	 */
	jQswipe.Point.prototype.diff = function(point) {
		return {
			x: this.x - point.x,
			y: this.y - point.y
		};
	};
	
	/**
	 * String representation of a Point.
	 */
	jQswipe.Point.prototype.toString = function() {
		return 'x: ' + this.x + ', y: ' + this.y;
	};
	
	
	/**
	 * Create a point from a a pair of pageX/pageY.
	 */
	jQswipe.Point.fromTouch = function(touch) {
		return new $.jQswipe.Point(touch.pageX, touch.pageY);
	};

	/**
	 * Collection of points
	 */
	jQswipe.PointCollection = function(startPoint) {
		this.points = [];
		if (startPoint) {
			this.points.push(startPoint);
		}
	}
	
	jQswipe.PointCollection.prototype = {
		start: function() {
			return this.atIndex(0);
		},
		
		previous: function() {
			return this.atIndex(-2);
		},
		
		current: function() {
			return this.atIndex(-1);
		},
		
		atIndex: function(index) {
			var length = this.points.length;
			
			if (length < 1) {
				return
			}
			
			index = ((Math.floor(Math.abs(index / length)) +1) * length + index) % length
			return this.points[index];
		},
		
		push: function(point) {
			if (point.x !== undefined && point.y !== undefined) {
				return this.points.push(point);
			}
		},
		
		size: function(point) {
			return this.points.length;
		},
		
		/**
		 * Remove old points.
		 * 
		 * should remove all points except start, previous and current point.
		 */
		compress: function(keep) {
			var length = this.size(),
				cleanUpLength;
			keep = keep || 2;
			cleanUpLength = length - keep - 1;
			if (cleanUpLength > 0) {
				this.points.splice(1, cleanUpLength);
			}
		}
		
	};
		
	
	/**
	 * Swipe object - special event factory
	 */
	 
	/**
	 * Constructor
	 * 
	 * Set the setup and teardown methodes. They bind safari touch events to store
	 * touches position and validate them.
	 *
	 * The default validator make sure a swipe always go to the right,
	 * and doesn't go up or down (not more than 10 pixel by default).
	 *
	 * Also set the swipe data namespace for storing the touches.  
	 */
	jQswipe.Swipe = function(eventType, validator) {
		var that = this;
	
		eventType = eventType || 'swipe';
		
		this.dataPrefix = 'events.special.' + eventType;
		if (validator) {
			this.validate = validator;
		}
	
		this.setup = function(data, namespaces) {
			var $el = $(this);
			$el.bind('touchstart', that.startHandler);
			$el.bind('touchmove', that.moveHandler);
			$el.bind('touchcancel', that.cancelHandler);
			$el.bind('touchend', that.endHandler);
		};
	
		this.teardown = function(namespaces) {
			var $el = $(this);
			$el.unbind('touchstart', that.startHandler);
			$el.unbind('touchmove', that.moveHandler);
			$el.unbind('touchcancel', that.cancelHandler);
			$el.unbind('touchend', that.endHandler);
		};
	
		that.startHandler = function(event) {
			that.start(this, that.getTouches(event));
		};
	
		that.moveHandler = function(event) {
			that.update(this, that.getTouches(event));
		};
	
		that.cancelHandler = function() {
			that.cancelled(this, true);
		};
	
		that.endHandler = function(event) {
			that.end(this);
	
			if (that.cancelled(this) === false) {
				event.type = eventType;
				$.event.handle.apply(this, arguments);
			}
	
		};
	};
	
	/**
	 * prototype methodes
	 */
	jQswipe.Swipe.prototype = {
		
		/**
		 * prefix for data name used with $.fn.data(name, value)
		 */
		dataPrefix: 'events.special.swipe',
		
		/**
		 * limits for validating a swipe.
		 */
		threshold: {
			minLength: 30,
			maxWidth: 10
		},
	
		/**
		 * Set initials value of swipe event and save the start position
		 */ 
		start: function(el, touches) {
			var jQswipe = $.jQswipe;
	
			if (touches.length === 1) {
				this.cancelled(el, false);
				this.ended(el, false);
				this.points(el, new jQswipe.PointCollection(
					jQswipe.Point.fromTouch(touches[0]))
				);
			} else {
				this.cancelled(el, true);
			}
		},
	
		/**
		 * Update the last position of finger and validate it
		 */
		update: function(el, touches) {
			var newPoint, points = this.points(el);
	
			if (this.cancelled(el)) {
				return;
			}
	
			if (touches.length !== 1) {
				this.cancelled(el, true);
				return;
			}
			
			newPoint = $.jQswipe.Point.fromTouch(touches[0])
			points.push(newPoint);
			if (this.validate(el, points)) {
				this.points(el, points);
			} else {
				this.cancelled(el, true);
			}
		},
	
		/**
		 * Default swipe validator. Validate a left swipe
		 */
		validate: function(el, points) {
			var diffWithStart = points.current().diff(points.start()),
				diffWithPrevious = points.current().diff(points.previous());
			
			// Should not be too hight or too low
			if (diffWithStart.y > this.threshold.maxWidth || diffWithStart.y < -this.threshold.maxWidth) {
				return false;
			}
	
			// should not move back to the left
			if (diffWithPrevious.x < 0) {
				return false;
			}
	
			// If swipe ended, the swipe be long enough
			if (this.ended(el) && diffWithStart.x < this.threshold.minLength) {
				return false;
			}
	
			return true;
		},
	
		/**
		 * Validate the last position of finger
		 */
		end: function(el) {
			this.ended(el, true);
			
			// we don't need to update it if it's already true
			if (this.cancelled(el) === false &&
				this.validate(el, this.points(el)) === false
			) {
				this.cancelled(el, true);
			}
		},
		
		/**
		 * Accessors
		 */
		points: function(el, points) {
			return this.data(el, 'points', points)
		},
	
		cancelled: function(el, cancelled) {
			return this.data(el, 'cancelled', cancelled);
		},
	
		ended: function(el, ended) {
			return this.data(el, 'ended', ended);
		},
	
		/**
		 * Helpers
		 */
		 data: function(el, name, value) {
			 var result = $(el).data(this.dataPrefix + '.' + name, value);
			 if (value === undefined) {
				 return result;
			 }
		 }, 
		
		getTouches: function(event) {
			var touches = event.targetTouches,
				console = window.console;
				
			if (touches === undefined && console) {
				console.warn('No event.targetTouches');
			}
			
			return touches;
		}
	};
	
	/**
	 * Register special swipe event
	 * 
	 * Take the event name,
	 * and the validator function that will validate each finger position of the swipe
	 */
	jQswipe.register = function(type, validator) {
		$.event.special[type] = new this.Swipe(type, validator);
	};
	
	/**
	 * Register by default a right and left swipe.
	 */
	jQswipe.register('swipe');
	jQswipe.register('rightSwipe');
	jQswipe.register('leftSwipe', function(el, points) {
		var diffWithStart = points.current().diff(points.start()),
			diffWithPrevious = points.current().diff(points.previous());
	
		// Should not be hight or too low
		if (diffWithStart.y > this.threshold.maxWidth || diffWithStart.y < -this.threshold.maxWidth) {
			return false;
		}
	
		// should not move back to the right
		if (diffWithPrevious.x > 0) {
			return false;
		}
	
		// If swipe ended, the swipe be long enough
		if (this.ended(el) && diffWithStart.x > -this.threshold.minLength) {
			return false;
		}
	
		return true;
	});
	
	/**
	 * Shortcut for the left swipe. 
	 */
	$.fn.swipe = function(cb) {
		return $(this).bind('swipe', cb);
	};

})();