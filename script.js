document.addEventListener('DOMContentLoaded', () => {

	// ==========================================
	// 1. SCENE MANAGER & VARIABLES
	// ==========================================
	const scenes = {
		invite: document.getElementById('scene-invite'),
		start: document.getElementById('scene-start'),
		main: document.getElementById('scene-main')
	};

	const video = document.getElementById('intro-video');

	// Audio & Mute Variables
	const bgMusic = document.getElementById('bg-music');
	const muteBtn = document.getElementById('mute-btn');
	let isMusicMuted = false;

	// Slider Variables
	const track = document.getElementById('slide-track');
	const trackText = document.querySelector('.track-text');
	const thumb = document.getElementById('slide-thumb');
	const curtainLeft = document.querySelector('.curtain-left');
	const curtainRight = document.querySelector('.curtain-right');

	let isDragging = false;
	let startX = 0;
	let currentX = 0;
	const maxDrag = 200;
	const threshold = maxDrag * 0.8;

	// ==========================================
	// 2. UTILITY FUNCTIONS
	// ==========================================
	const switchScene = (currentScene, nextScene) => {
		currentScene.classList.remove('active');
		setTimeout(() => {
			currentScene.style.display = '';
			nextScene.style.display = '';
			nextScene.classList.add('active');
			window.scrollTo(0, 0);
		}, 400);
	};

	const initScrollAnimations = () => {
		const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
		const observer = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					obs.unobserve(entry.target);
				}
			});
		}, observerOptions);

		document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
	};

	// ==========================================
	// 3. FLOW ACT 1 -> ACT 2 (Invite -> Slider)
	// ==========================================
	document.getElementById('open-invite-btn').addEventListener('click', () => {
		if (video && video.preload === 'none') {
			video.preload = 'metadata';
			video.load();
		}
		switchScene(scenes.invite, scenes.start);
	});

	// ==========================================
	// 4. FLOW ACT 2 -> ACT 3 (Slider -> Video)
	// ==========================================
	const startDrag = (e) => {
		isDragging = true;
		startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
		thumb.style.animation = 'none';
		thumb.style.transition = 'none';
		curtainLeft.style.transition = 'none';
		curtainRight.style.transition = 'none';
		trackText.classList.add('hide');
	};

	const onDrag = (e) => {
		if (!isDragging) return;
		const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
		let deltaX = clientX - startX;

		if (deltaX < 0) deltaX = 0;
		if (deltaX > maxDrag) deltaX = maxDrag;

		currentX = deltaX;
		thumb.style.transform = `translateX(${currentX}px)`;

		const progress = currentX / maxDrag;
		curtainLeft.style.transform = `translateX(-${progress * 100}%)`;
		curtainRight.style.transform = `translateX(${progress * 100}%)`;
	};

	const endDrag = () => {
		if (!isDragging) return;
		isDragging = false;

		curtainLeft.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
		curtainRight.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

		if (currentX >= threshold) {
			thumb.style.transform = `translateX(${maxDrag}px)`;
			thumb.style.background = '#ffffff';
			curtainLeft.style.transform = `translateX(-100%)`;
			curtainRight.style.transform = `translateX(100%)`;
			completeSlide();
		} else {
			thumb.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
			thumb.style.transform = `translateX(0)`;
			currentX = 0;
			curtainLeft.style.transform = `translateX(0)`;
			curtainRight.style.transform = `translateX(0)`;
			trackText.classList.remove('hide');
			setTimeout(() => { thumb.style.animation = 'breatheX 2.5s infinite ease-in-out'; }, 400);
		}
	};

	const completeSlide = () => {
		track.style.transition = 'opacity 0.3s ease';
		track.style.opacity = '0';
		setTimeout(() => { track.style.display = 'none'; }, 300);
		video.play().catch(e => console.log("Video autoplay failed:", e));
	};

	// Slider Event Listeners
	thumb.addEventListener('mousedown', startDrag);
	window.addEventListener('mousemove', onDrag);
	window.addEventListener('mouseup', endDrag);
	thumb.addEventListener('touchstart', startDrag, { passive: false });
	window.addEventListener('touchmove', onDrag, { passive: false });
	window.addEventListener('touchend', endDrag);

	// Keyboard Accessibility
	thumb.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			trackText.classList.add('hide');
			thumb.style.transform = `translateX(${maxDrag}px)`;
			thumb.style.background = '#ffffff';
			curtainLeft.style.transform = `translateX(-100%)`;
			curtainRight.style.transform = `translateX(100%)`;
			completeSlide();
		}
	});

	// ==========================================
	// 5. DOLLHOUSE CONFETTI BURST (Lightweight)
	// ==========================================
	const triggerSuperConfetti = () => {
		if (typeof confetti !== 'function') return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		if (typeof confetti.reset === 'function') {
			confetti.reset();
		}

		const palette = ['#ff69b4', '#ffd13b', '#2ec4b6', '#9b5de5', '#ffffff'];

		confetti({
			particleCount: 45,
			spread: 90,
			origin: { y: 0.6 },
			zIndex: 9999,
			colors: palette,
			disableForReducedMotion: true,
			ticks: 35
		});

		const duration = 1200;
		const animationEnd = Date.now() + duration;
		const defaults = {
			startVelocity: 22,
			spread: 360,
			ticks: 35,
			zIndex: 9999,
			colors: palette
		};

		function randomInRange(min, max) {
			return Math.random() * (max - min) + min;
		}

		function frame() {
			const timeLeft = animationEnd - Date.now();
			if (timeLeft <= 0) return;

			const particleCount = Math.max(4, Math.round(10 * (timeLeft / duration)));

			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));

			requestAnimationFrame(frame);
		}

		requestAnimationFrame(frame);
	};

	// ==========================================
	// 6. FLOW ACT 3 -> ACT 4 (Video -> Main Event)
	// ==========================================
	let hasTransitionedToMain = false;

	const transitionToMain = () => {
		if (hasTransitionedToMain) return;
		hasTransitionedToMain = true;

		if (bgMusic) {
			bgMusic.volume = 0.75;
			bgMusic.play().catch(e => console.log("BG music autoplay blocked:", e));
			muteBtn.classList.add('active');
		}

		triggerSuperConfetti();

		setTimeout(() => {
			const heroElements = document.querySelectorAll('#scene-main .hero .animate-on-scroll');
			heroElements.forEach(el => {
				el.style.transition = 'none';
				el.classList.add('is-visible');
			});

			scenes.start.style.transition = 'none';
			scenes.start.classList.remove('active');
			scenes.start.style.display = 'none';

			scenes.main.style.transition = 'opacity 0.6s ease-in-out';
			scenes.main.style.display = 'flex';
			scenes.main.style.opacity = '0';
			scenes.main.classList.add('active');

			window.scrollTo(0, 0);
			initScrollAnimations();

			requestAnimationFrame(() => {
				setTimeout(() => {
					scenes.main.style.opacity = '1';
				}, 10);
			});

			setTimeout(() => {
				heroElements.forEach(el => { el.style.transition = ''; });
				scenes.main.style.transition = '';
				scenes.main.style.opacity = '';
			}, 600);

			setTimeout(() => {
				if (typeof confetti.reset === 'function') {
					confetti.reset();
				}
			}, 2500);
		}, 200);
	};

	if (video) {
		video.addEventListener('timeupdate', () => {
			if (hasTransitionedToMain || !video.duration) return;
			if (video.currentTime >= video.duration - 0.15) {
				transitionToMain();
			}
		});

		video.addEventListener('ended', transitionToMain);
	}

	// --- MUTE BUTTON LOGIC ---
	if (muteBtn) {
		muteBtn.addEventListener('click', () => {
			if (isMusicMuted) {
				bgMusic.play();
				muteBtn.classList.remove('is-muted');
				muteBtn.setAttribute('aria-label', 'Mute background music');
			} else {
				bgMusic.pause();
				muteBtn.classList.add('is-muted');
				muteBtn.setAttribute('aria-label', 'Unmute background music');
			}
			isMusicMuted = !isMusicMuted;
		});
	}

	// ==========================================
	// 7. COUNTDOWN TIMER (Nov. 27, 2026 at 4:00 PM)
	// ==========================================
	const eventDate = new Date(2026, 10, 27, 16, 0, 0).getTime();

	const updateCountdown = () => {
		const now = new Date().getTime();
		const distance = eventDate - now;
		const countdownEl = document.getElementById('countdown');
		if (!countdownEl) return;

		if (distance < 0) {
			countdownEl.innerHTML = "<h3 class='heading'>The Party Has Started!</h3>";
			return;
		}

		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		countdownEl.innerHTML = `
            <div class="count-box"><span>${days}</span><small>Days</small></div>
            <div class="count-box"><span>${hours}</span><small>Hrs</small></div>
            <div class="count-box"><span>${minutes}</span><small>Mins</small></div>
            <div class="count-box"><span>${seconds}</span><small>Secs</small></div>
        `;
	};

	setInterval(updateCountdown, 1000);
	updateCountdown();

	// ==========================================
	// 8. ADD TO CALENDAR (.ics) GENERATOR + FALLBACK
	// ==========================================
	const calendarBtn = document.getElementById('add-to-calendar-btn');

	if (calendarBtn) {
		calendarBtn.addEventListener('click', (e) => {
			e.preventDefault();

			const isInApp = /FBAN|FBAV|Messenger/i.test(navigator.userAgent);
			const googleCalendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Alona+Briella's+6th+Birthday&dates=20261127T080000Z/20261127T110000Z&details=Join+us+in+celebrating+Alona+Briella+Japlos's+6th+Birthday!&location=Japlos+Residence,+Fortune+Village,+Valenzuela+City";

			if (isInApp) {
				window.open(googleCalendarUrl, '_blank');
				return;
			}

			const title = "Alona Briella's 6th Birthday";
			const location = "Japlos Residence, Fortune Village, Valenzuela City";
			const description = "Party starts at 4:00 PM at Japlos Residence, Fortune Village, Valenzuela City. We can't wait to celebrate with you!";

			// 4:00 PM PHT (GMT+8) is 08:00 AM UTC; 7:00 PM PHT is 11:00 AM UTC
			const startTime = "20261127T080000Z";
			const endTime = "20261127T110000Z";

			const icsLines = [
				"BEGIN:VCALENDAR",
				"VERSION:2.0",
				"PRODID:-//Alona Birthday Invite//EN",
				"CALSCALE:GREGORIAN",
				"METHOD:PUBLISH",
				"BEGIN:VEVENT",
				`UID:${Date.now()}@alonabirthday.com`,
				`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
				`DTSTART:${startTime}`,
				`DTEND:${endTime}`,
				`SUMMARY:${title}`,
				`LOCATION:${location}`,
				`DESCRIPTION:${description}`,
				"STATUS:CONFIRMED",
				"SEQUENCE:0",
				"END:VEVENT",
				"END:VCALENDAR"
			];

			const icsContent = icsLines.join("\r\n");
			const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
			const link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);
			link.download = 'Alona_Briella_Birthday_Invite.ics';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});
	}

	// ==========================================
	// 9. RSVP FORM HANDLING (Validation & AJAX)
	// ==========================================
	const form = document.getElementById('rsvp-form');
	if (form) {
		const fieldsContainer = document.getElementById('form-fields');
		const successMessage = document.getElementById('form-success');
		const submitBtn = document.getElementById('submit-btn');
		const btnText = document.getElementById('btn-text');
		const btnIcon = document.getElementById('btn-icon');

		form.addEventListener('submit', function (e) {
			e.preventDefault();

			let isValid = true;
			const nameInput = document.getElementById('name');
			const attendanceInputs = document.querySelectorAll('input[name="attendance"]');

			document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));

			if (nameInput.value.trim() === '') {
				nameInput.parentElement.classList.add('has-error');
				isValid = false;
			}

			let attendanceSelected = false;
			attendanceInputs.forEach(input => {
				if (input.checked) attendanceSelected = true;
			});
			if (!attendanceSelected) {
				document.querySelector('.attendance-toggle').parentElement.classList.add('has-error');
				isValid = false;
			}

			if (!isValid) {
				form.style.animation = 'none';
				setTimeout(() => { form.style.animation = 'shake 0.4s ease'; }, 10);
				return;
			}

			btnText.innerText = "Sending...";
			btnIcon.style.display = 'none';
			submitBtn.disabled = true;

			const formData = new FormData(form);

			fetch(form.action, {
				method: 'POST',
				body: formData
			})
				.then(response => response.json())
				.then(data => {
					if (data.success) {
						fieldsContainer.style.display = 'none';
						successMessage.classList.remove('hidden');
					} else {
						alert("Something went wrong. Please check your Web3Forms access key.");
						resetButton();
					}
				})
				.catch(error => {
					console.error('Error:', error);
					alert("Network error. Please try again.");
					resetButton();
				});

			function resetButton() {
				btnText.innerText = "Send RSVP Response";
				btnIcon.style.display = 'block';
				submitBtn.disabled = false;
			}
		});
	}

	// ==========================================
	// 10. CUSTOM DROPDOWN LOGIC
	// ==========================================
	const dropdown = document.getElementById('guest-dropdown');
	const trigger = document.getElementById('guest-trigger');
	const options = document.querySelectorAll('.select-options li');
	const label = document.getElementById('guest-label');
	const hiddenInput = document.getElementById('guests-input');

	if (dropdown && trigger) {
		trigger.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			dropdown.classList.toggle('open');
		});

		options.forEach(option => {
			option.addEventListener('click', (e) => {
				e.stopPropagation();

				options.forEach(o => o.classList.remove('selected'));
				option.classList.add('selected');

				const value = option.getAttribute('data-value');
				label.textContent = value;
				hiddenInput.value = value;

				dropdown.classList.remove('open');
			});
		});

		document.addEventListener('click', (e) => {
			if (!dropdown.contains(e.target)) {
				dropdown.classList.remove('open');
			}
		});
	}

});