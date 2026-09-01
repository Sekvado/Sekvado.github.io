/*
	Eventually by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function() {

	"use strict";

	var	$body = document.querySelector('body');

	// Methods/polyfills.

		// classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
			!function(){function t(t){this.el=t;for(var n=t.className.replace(/^\s+|\s+$/g,"").split(/\s+/),i=0;i<n.length;i++)e.call(this,n[i])}function n(t,n,i){Object.defineProperty?Object.defineProperty(t,n,{get:i}):t.__defineGetter__(n,i)}if(!("undefined"==typeof window.Element||"classList"in document.documentElement)){var i=Array.prototype,e=i.push,s=i.splice,o=i.join;t.prototype={add:function(t){this.contains(t)||(e.call(this,t),this.el.className=this.toString())},contains:function(t){return-1!=this.el.className.indexOf(t)},item:function(t){return this[t]||null},remove:function(t){if(this.contains(t)){for(var n=0;n<this.length&&this[n]!=t;n++);s.call(this,n,1),this.el.className=this.toString()}},toString:function(){return o.call(this," ")},toggle:function(t){return this.contains(t)?this.remove(t):this.add(t),this.contains(t)}},window.DOMTokenList=t,n(Element.prototype,"classList",function(){return new t(this)})}}();

		// canUse
			window.canUse=function(p){if(!window._canUse)window._canUse=document.createElement("div");var e=window._canUse.style,up=p.charAt(0).toUpperCase()+p.slice(1);return p in e||"Moz"+up in e||"Webkit"+up in e||"O"+up in e||"ms"+up in e};

		// window.addEventListener
			(function(){if("addEventListener"in window)return;window.addEventListener=function(type,f){window.attachEvent("on"+type,f)}})();

	// Play initial animations on page load.
		window.addEventListener('load', function() {
			window.setTimeout(function() {
				$body.classList.remove('is-preload');
			}, 100);
		});

	// Slideshow Background.
		(function() {

			// Settings.
				var settings = {

					// Images (in the format of 'url': 'alignment').
						images: {
							'images/Riding_on_road_with_trees_1920x.jpg': 'center',
							'images/rikki-chan_1920x.jpg': 'center',
							'images/tessa-rampersad_1920x.jpg': 'center'
						},

					// Delay.
						delay: 6000

				};

			// Vars.
				var	pos = 0, lastPos = 0,
					$wrapper, $bgs = [], $bg,
					k, v;

			// Create BG wrapper, BGs.
				$wrapper = document.createElement('div');
					$wrapper.id = 'bg';
					$body.appendChild($wrapper);

				for (k in settings.images) {

					// Create BG.
						$bg = document.createElement('div');
							$bg.style.backgroundImage = 'url("' + k + '")';
							$bg.style.backgroundPosition = settings.images[k];
							$wrapper.appendChild($bg);

					// Add it to array.
						$bgs.push($bg);

				}

			// Main loop.
				$bgs[pos].classList.add('visible');
				$bgs[pos].classList.add('top');

				// Bail if we only have a single BG or the client doesn't support transitions.
					if ($bgs.length == 1
					||	!canUse('transition'))
						return;

				window.setInterval(function() {

					lastPos = pos;
					pos++;

					// Wrap to beginning if necessary.
						if (pos >= $bgs.length)
							pos = 0;

					// Swap top images.
						$bgs[lastPos].classList.remove('top');
						$bgs[pos].classList.add('visible');
						$bgs[pos].classList.add('top');

					// Hide last image after a short delay.
						window.setTimeout(function() {
							$bgs[lastPos].classList.remove('visible');
						}, settings.delay / 2);

				}, settings.delay);

		})();

	// Signup Form.
		(function() {

			// Vars.
				var $form = document.querySelector('#signup-form'),
					$submit,
					$message,
					endpoint;

			// Bail if the form isn't on the page, or if the browser can't do a
			// background submission. In the latter case the form posts natively to
			// its action attribute, which is the no-JS fallback.
				if (!$form
				||	!('addEventListener' in $form)
				||	typeof window.fetch !== 'function'
				||	typeof window.FormData !== 'function')
					return;

				$submit = $form.querySelector('input[type="submit"]');
				endpoint = $form.getAttribute('data-endpoint');

			// Message.
				$message = document.createElement('span');
					$message.classList.add('message');
					$message.setAttribute('role', 'status');
					$message.setAttribute('aria-live', 'polite');
					$form.appendChild($message);

				$message._show = function(type, text, autoHide) {

					$message.classList.remove('success');
					$message.classList.remove('failure');

					$message.textContent = text;
					$message.classList.add(type);
					$message.classList.add('visible');

					if (autoHide)
						window.setTimeout(function() {
							$message._hide();
						}, 6000);

				};

				$message._hide = function() {
					$message.classList.remove('visible');
				};

			// Events.
				$form.addEventListener('submit', function(event) {

					event.stopPropagation();
					event.preventDefault();

					$message._hide();

					// No endpoint configured yet: say so instead of claiming the
					// address was stored. See README.md.
						if (!endpoint
						||	endpoint.indexOf('REPLACE_WITH') === 0) {
							$message._show('failure', 'Sign-up isn\'t live yet. Please email support@sekvado.com.', true);
							return;
						}

					// Disable submit.
						$submit.disabled = true;

					window.fetch(endpoint, {
						method: 'POST',
						headers: { 'Accept': 'application/json' },
						body: new FormData($form)
					})
						.then(function(response) {

							if (!response.ok)
								throw new Error('HTTP ' + response.status);

							$form.reset();
							$message._show('success', 'Thank you! Check your inbox to confirm.', false);

						})
						.catch(function() {
							$message._show('failure', 'Something went wrong. Please try again.', true);
						})
						.then(function() {
							$submit.disabled = false;
						});

				});

		})();

})();
