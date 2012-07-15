//Object.create doesn't work in older browsers - use a polyfill 
if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		//create a constructor function
		var F = function (){};

		//set it's prototype to what was passed to it
		F.prototype = obj;

		//return a new instance of it
		return new F();
	};
}

(function($, window, document, undefined){
	var SSJ = {

		init: function(options, el) {
			var self = this;

			this.el = el;
			this.$el = $(el);
			this.options = $.extend( {}, $.fn.ssj.defaults, options);

			this.currentStyleIndex = 0;
			this.powerLevelStyleRanges = this.options.powerLevelStyleRanges;
			this.immediate = this.options.immediate;
			this.grow = this.options.grow;
			this.styleAttrs = this.powerLevelStyleRanges[this.currentStyleIndex];

			this.blurColor = this.styleAttrs.blurColor;
			this.blurRadius = this.styleAttrs.blurRadiusMax;
			this.blurRadiusMax = this.styleAttrs.blurRadiusMax;
			this.blurRadiusMin = this.styleAttrs.blurRadiusMin;
			this.incrementSize = this.styleAttrs.incrementSize;
			this.color = this.styleAttrs.color;
			

			this.glowing = false;
			this.animateGlowTimeout = this.options.animateGlowTimeout;
			this.clickCount = 0;

			if (this.immediate) {
				this.animateGlow();
			}

			this.$el.on('click', $.proxy(this.handleClick, this));
		},

		handleClick: function(){
			this.clickCount++;
			this.updateStyleAttributes();

			//grow if we're already glowing - wont grow on the first click
			if (this.glowing) {
				this.growMe();
			}

			//start glowing if needed
			if (!this.glowing) {
				this.animateGlow();
			}
		},

		updateStyleAttributes: function() {

			//if we've reached the max clicks for this style and there is another style
			//after this one, update style attributes accordingly
			if (this.styleAttrs.maxClicks < this.clickCount && this.powerLevelStyleRanges[this.currentStyleIndex+1]) {
				
				//update style index and then set style attrs accordingly
				this.styleAttrs = this.powerLevelStyleRanges[++this.currentStyleIndex];

				for (style in this.styleAttrs) {
					this[style] = this.styleAttrs[style];
				}
			}
		},

		animateGlow: function(){
			var self = this;

			//set glowing flag to true
			this.glowing = true;

			//toggle between two different blur radii		        
			this.blurRadius = (this.blurRadius === this.blurRadiusMax ? this.blurRadiusMin : this.blurRadiusMax);
		        
	        //set the text shadow and color
	        this.$el.css({
	        	'text-shadow': "0px 0px " + this.blurRadius + "px " + this.blurColor,
	        	color: this.color
	        });

	        //animate every specified time period
	        setTimeout(function(){
	        	
	        	self.animateGlow();

	        }, self.animateGlowTimeout);
		},

		growMe: function(){
			if (this.grow) {
				var self = this;

				this.$el.animate({
					'font-size': ('+=' + self.incrementSize)
				});
			}
		}
	}

	$.fn.ssj = function(options){
		//inside here 'this' is the jQuery object, so we dont need to do things like $(this)

		return this.each(function(){
			
			//create a new function with SSJ object as it's prototype
			//need to do this instead of using 'new' since we didn't define SSJ 
			//as a function - we're using prototypal inheritance
			var ssj = Object.create(SSJ);

			//protect against multiple instantiations
			if (!$.data(this, 'ssj_plugin')) {
				$.data(this, 'ssj_plugin', ssj.init(options, this) );
			}
			
		});	
	}

	$.fn.ssj.defaults = {
	    animateGlowTimeout: 180,  	//milliseconds between each glow animation
	    immediate: true,	//config to make it happen now or wait for a click
	    grow: false,		//confic to get bigger with more clicks 
	    powerLevelStyleRanges: [ //array of styles for each 'level' 
	    	//SSJ!!
	    	{				
	    		incrementSize: 20,
	    		blurRadiusMin: 18,
	    		blurRadiusMax: 27,
	    		blurColor: 'yellow',
	    		color: 'orange',
	    		incrementSize: 10
	    	}
	    ]
	};

})(jQuery, window, document);