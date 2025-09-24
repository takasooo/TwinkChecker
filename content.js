// Check for browser compatibility
if (!window.MutationObserver && !window.WebKitMutationObserver && !window.MozMutationObserver) {
    console.warn('MutationObserver is not supported by your browser.');
}

// Balanced delays to avoid captcha while maintaining reasonable speed
const MIN_DELAY = 800; // Slower: 800ms-1.5s between clicks to avoid captcha
const MAX_DELAY = 1500; 
const LONG_PAUSE_CHANCE = 0.15; // 15% chance for longer pause
const LONG_PAUSE_MIN = 2000; // Medium breaks: 2-4s
const LONG_PAUSE_MAX = 4000; 
const VERY_LONG_PAUSE_CHANCE = 0.05; // 5% chance for very long pause
const VERY_LONG_PAUSE_MIN = 5000; // Longer pauses: 5-8s
const VERY_LONG_PAUSE_MAX = 8000;

function getRandomDelay() {
    // Very rare long pauses
    if (Math.random() < VERY_LONG_PAUSE_CHANCE) {
        console.log('Quick break...');
        return Math.floor(Math.random() * (VERY_LONG_PAUSE_MAX - VERY_LONG_PAUSE_MIN + 1)) + VERY_LONG_PAUSE_MIN;
    }
    
    // Rare short pauses
    if (Math.random() < LONG_PAUSE_CHANCE) {
        return Math.floor(Math.random() * (LONG_PAUSE_MAX - LONG_PAUSE_MIN + 1)) + LONG_PAUSE_MIN;
    }
    
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

// Minimal time-based multiplier for speed
function getTimeBasedMultiplier() {
    return 1.0; // Disabled time-based slowdown for maximum speed
}

// More realistic human behavior simulation to avoid detection
function simulateHumanBehavior(element) {
    return new Promise(resolve => {
        // More realistic delay before interaction
        const microDelay = Math.random() * 200 + 100; // 100-300ms
        
        setTimeout(() => {
            // Simulate hover with more realistic timing
            element.dispatchEvent(new MouseEvent('mouseover', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            
            // More realistic hesitation before click
            setTimeout(() => {
                element.click();
                resolve();
            }, Math.random() * 300 + 150); // 150-450ms hesitation
        }, microDelay);
    });
}

// More realistic page interaction to avoid detection
async function simulatePageInteraction() {
    // Multiple mouse movements to simulate human behavior
    for (let i = 0; i < 2; i++) {
        document.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: true,
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight
        }));
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
    
    // Occasional scroll to simulate reading
    if (Math.random() < 0.5) {
        window.scrollBy(0, Math.random() * 100 - 50);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    }
}

// Add user agent check to ensure compatibility
function checkCompatibility() {
    const userAgent = navigator.userAgent;
    if (!userAgent.includes('Chrome') && !userAgent.includes('Firefox') && !userAgent.includes('Safari')) {
        console.warn('Browser compatibility may be limited');
    }
    
    // Check for common anti-bot detection
    if (window.navigator.webdriver) {
        console.warn('WebDriver detected - may trigger anti-bot measures');
    }
    
    // Check for headless mode
    if (window.navigator.plugins.length === 0) {
        console.warn('Minimal plugin support detected');
    }
}

checkCompatibility();

let elements = document.querySelectorAll('a.link_lock[onclick*="Mi.showMemberChars"]');
let currentIndex = 0;
let isWorking = true;
let nickname = "kenny"; // Default nickname
let totalElements = elements.length;

// High-speed rate limiting with adaptive response to errors
let requestTimestamps = [];
let slowdownMultiplier = 1.0;
let errorCount = 0;

function updateRequestFrequency() {
    const now = Date.now();
    requestTimestamps.push(now);
    
    // Keep only timestamps from last 30 seconds for faster adaptation
    requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < 30000);
    
    // Adaptive thresholds based on error history
    let threshold = 50 - (errorCount * 5); // Reduce threshold if errors occurred
    threshold = Math.max(20, threshold); // Minimum threshold of 20
    
    if (requestTimestamps.length > threshold) {
        slowdownMultiplier = Math.min(2.0, slowdownMultiplier * 1.2); // Increased max slowdown
        console.log(`High frequency (${requestTimestamps.length}/${threshold}) - slowdown: ${slowdownMultiplier.toFixed(1)}x`);
    } else if (requestTimestamps.length < threshold * 0.5) {
        slowdownMultiplier = Math.max(1.0, slowdownMultiplier * 0.95); // Quick recovery
        errorCount = Math.max(0, errorCount - 0.1); // Gradually reduce error count
    }
    
    return slowdownMultiplier;
}

// Track and respond to connection errors
function handleConnectionError() {
    errorCount++;
    console.log(`Connection error #${errorCount} - adjusting behavior...`);
    
    // Increase slowdown based on error frequency
    if (errorCount >= 3) {
        slowdownMultiplier = Math.min(3.0, slowdownMultiplier * 1.5);
        console.log(`Multiple errors detected - significant slowdown: ${slowdownMultiplier.toFixed(1)}x`);
    }
}

// Enhanced delay calculation with rate limiting
function getAdaptiveDelay() {
    const baseDelay = getRandomDelay();
    const timeMultiplier = getTimeBasedMultiplier();
    const rateMultiplier = updateRequestFrequency();
    
    return baseDelay * timeMultiplier * rateMultiplier;
}

// Load admin nickname from settings using async/await
async function loadAdminNickname() {
    try {
        const result = await chrome.storage.local.get(['adminNickname']);
        if (result.adminNickname && result.adminNickname.trim() !== '') {
            nickname = result.adminNickname.trim();
        }
    } catch (error) {
        console.warn('Error loading admin nickname:', error);
    }
}

// Initialize nickname loading
loadAdminNickname();

// Load saved position if resuming
async function loadSavedPosition() {
    try {
        const result = await chrome.storage.local.get(['savedPosition']);
        if (result.savedPosition !== undefined) {
            currentIndex = result.savedPosition;
            console.log(`Resuming from position: ${currentIndex}`);
        }
    } catch (error) {
        console.error('Error loading saved position:', error);
    }
}

loadSavedPosition();

// Send initial progress with error handling
async function sendInitialProgress() {
    try {
        await chrome.runtime.sendMessage({
            type: 'progress',
            total: totalElements,
            processed: 0
        });
    } catch (error) {
        console.warn('Error sending initial progress:', error);
    }
}

sendInitialProgress();

const fractions = {
	"Crime": [
		"Армянская Мафия",
		"Итальянская Мафия",
		"Мексиканская Мафия",
		"Русская Мафия",
		"Японская Мафия",
		"The Ballas Gang",
		"Bloods",
		"The Families",
		"Marabunta Grande",
		"Los Santos Vagos"
	],
	"Other": [],
	"State": [
		"FIB",
		"LS Army",
		"Мэрия ЛС",
		"LSPD",
		"LSSD",
		"Федеральная Тюрьма",
		"Medical Services",
		"Weazel News"
	]
};

let doNotRepeat = [];

// Captcha and anti-bot detection
function detectCaptcha() {
    // Check for common captcha indicators
    const captchaSelectors = [
        '.cf-challenge-form',
        '#challenge-form',
        '.captcha',
        '[data-captcha]',
        '.recaptcha',
        '.hcaptcha',
        '.cloudflare-challenge',
        '.challenge-running',
        '.ray-id',
        '.cf-wrapper',
        '#cf-challenge-running'
    ];
    
    for (const selector of captchaSelectors) {
        if (document.querySelector(selector)) {
            return true;
        }
    }
    
    // Check for Cloudflare challenge text (more comprehensive)
    const bodyText = document.body.textContent.toLowerCase();
    const challengeIndicators = [
        'checking your browser',
        'verifying you are human',
        'cloudflare',
        'ddos protection',
        'please wait',
        'browser check',
        'security check',
        'verifying',
        'challenge',
        'ray id'
    ];
    
    for (const indicator of challengeIndicators) {
        if (bodyText.includes(indicator)) {
            return true;
        }
    }
    
    // Check for suspicious page behavior
    if (document.title.toLowerCase().includes('just a moment') ||
        document.title.toLowerCase().includes('please wait') ||
        window.location.href.includes('challenge')) {
        return true;
    }
    
    return false;
}

// Enhanced suspicious activity detection with rate limit error detection
function detectSuspiciousActivity() {
    // Check for rate limiting responses
    const errorElements = document.querySelectorAll('[class*="error"], [class*="limit"], [class*="block"]');
    for (const element of errorElements) {
        const text = element.textContent.toLowerCase();
        if (text.includes('rate limit') || 
            text.includes('too many') || 
            text.includes('blocked') ||
            text.includes('нельзя загружать') ||
            text.includes('так часто') ||
            text.includes('слишком много')) {
            return true;
        }
    }
    
    // Check console errors for connection issues
    const consoleErrors = document.querySelectorAll('*');
    for (const element of consoleErrors) {
        const text = element.textContent || '';
        if (text.includes('Could not establish connection') ||
            text.includes('Receiving end does not exist') ||
            text.includes('нельзя загружать эту страницу так часто')) {
            return true;
        }
    }
    
    // Check for empty responses or loading issues
    const memberElements = document.querySelectorAll('a.link_lock[onclick*="Mi.showMemberChars"]');
    if (memberElements.length === 0 && currentIndex === 0) {
        return true; // Possible block if no elements found
    }
    
    return false;
}

// New function to detect specific rate limit errors
function detectRateLimitError() {
    // Check for the specific Russian error message
    const bodyText = document.body.textContent;
    if (bodyText.includes('Нельзя загружать эту страницу так часто') ||
        bodyText.includes('#11536337') ||
        bodyText.includes('нельзя загружать') ||
        bodyText.includes('так часто')) {
        return true;
    }
    
    // Check console for connection errors
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        if (script.textContent && script.textContent.includes('Could not establish connection')) {
            return true;
        }
    }
    
    return false;
}

// Handle captcha detection
async function handleCaptchaDetection() {
    console.log('Captcha detected - pausing script');
    
    // Save current position
    try {
        await chrome.storage.local.set({ "savedPosition": currentIndex });
    } catch (error) {
        console.error('Error saving position:', error);
    }
    
    // Notify popup about captcha
    try {
        await chrome.runtime.sendMessage({
            type: 'captcha_detected',
            message: 'Обнаружена капча. Пожалуйста, решите её вручную и нажмите "Продолжить после капчи".'
        });
    } catch (error) {
        console.error('Error sending captcha notification:', error);
    }
    
    // Stop script execution
    await chrome.storage.local.set({ "isWorking": false });
    
    return false; // Stop processing
}

// Add DOM change monitoring for better reliability
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

async function processElement(element) {
	try {
		// More realistic processing delays to avoid detection
		const baseDelay = Math.random() * 400 + 200; // 200-600ms
		await new Promise(resolve => setTimeout(resolve, baseDelay));
		
		// Occasional page interaction to seem more human
		if (Math.random() < 0.3) { // 30% chance
			await simulatePageInteraction();
		}
		
		// Realistic click with proper simulation
		await simulateHumanBehavior(element);

	const cardFractions = [];
	const cardElements = document.getElementsByClassName('card');

	Array.from(cardElements).forEach(function(cardElement) {
		const listItems = cardElement.getElementsByClassName('list-group-item');

		Array.from(listItems).forEach(function(listItem) {
			const text = listItem.textContent.trim();
			if (text.includes('Фракция:')) {
				const factionText = text.replace(/Фракция:|\(rank: \d+\)/g, '').trim();
				const cardIdMatch = cardElement.textContent.match(/ID: (\d+)/);

				if (factionText.length > 1 && cardIdMatch) {
					cardFractions.push([factionText, cardIdMatch[1]]);
				} else {
					return
				}
			}
		});
	});

	const crimeFractions = fractions["Crime"];
	const stateFractions = fractions["State"];
	const onlyFractions = cardFractions.map(currentValue => currentValue[0]);

	let content = '';

	const uniqueCrimeFractions = [...new Set(onlyFractions.filter(fraction => crimeFractions.includes(fraction)))];
    const repeatedStateKeys = [];
    const stateFractionsSet = new Set();

	onlyFractions.forEach(fraction => {
        if (stateFractionsSet.has(fraction)) {
            repeatedStateKeys.push(fraction);
        } else if (fractions["State"].includes(fraction)) {
            stateFractionsSet.add(fraction);
        }
    });

	if (
        (onlyFractions.some(item => crimeFractions.includes(item)) && onlyFractions.some(item => stateFractions.includes(item))) || 
        (uniqueCrimeFractions.length > 1) || 
        (repeatedStateKeys.length > 0)
    ) {
        // Check if it's only Crime + Weazel News combination (should be allowed)
        const hasCrime = onlyFractions.some(item => crimeFractions.includes(item));
        const hasState = onlyFractions.some(item => stateFractions.includes(item));
        const hasOnlyWeazelNews = hasState && onlyFractions.filter(item => stateFractions.includes(item)).length === 1 && onlyFractions.includes("Weazel News");
        
        // Skip punishment if it's only Crime + Weazel News
        if (hasCrime && hasOnlyWeazelNews) {
            // Do nothing - this combination is allowed
        } else {
            for (let i = 0; i < cardFractions.length; i++) {
                const currentCard = cardFractions[i];
                const others = cardFractions.filter((_, index) => index !== i).map(card => card[0]).join(' | ');
                let line = `offwarn ${currentCard[1]} Твинк: ${currentCard[0]} | ${others} // by ${nickname}<br>`;
                if (!doNotRepeat.includes(line)){
                    doNotRepeat.push(line);
                    content += line;
                }
            }
        }
    }
    await sendData(content);
	} catch (error) {
		console.error('Error in processElement:', error);
	}
}

async function processNextElement() {
	try {
		// Check for captcha before processing
		if (detectCaptcha()) {
			return await handleCaptchaDetection();
		}
		
		// Check for rate limit error specifically
		if (detectRateLimitError()) {
			console.log('🚫 Rate limit detected! Pausing for 10 seconds...');
			slowdownMultiplier = Math.min(3.0, slowdownMultiplier * 2.0);
			
			// Send notification to popup
			try {
				await chrome.runtime.sendMessage({
					type: 'rate_limit_detected',
					message: 'Обнаружено ограничение скорости. Пауза 10 секунд...'
				});
			} catch (error) {
				console.error('Error sending rate limit notification:', error);
			}
			
			await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second pause
			
			// Reload the page to reset
			window.location.reload();
			return;
		}
		
		// Minimal response to suspicious activity
		if (detectSuspiciousActivity()) {
			console.log('Minor adjustment for activity...');
			slowdownMultiplier = Math.min(1.3, slowdownMultiplier * 1.1); // Very small impact
			await new Promise(resolve => setTimeout(resolve, 500)); // Tiny pause
		}
		
		// Check if we should stop processing
		const result = await chrome.storage.local.get(['isWorking']);
		if (result.isWorking === false) {
			console.log('Script stopped by user');
			return;
		}
		
		// Regular breaks to prevent captcha (every 8-15 elements)
		if (currentIndex > 0 && currentIndex % (Math.floor(Math.random() * 8) + 8) === 0) {
			const breakDuration = Math.random() * 3000 + 2000; // 2-5s break
			console.log(`Anti-captcha break (${Math.round(breakDuration/1000)}s) after ${currentIndex} elements...`);
			
			// Send notification about break
			try {
				await chrome.runtime.sendMessage({
					type: 'break_notification',
					message: `Пауза ${Math.round(breakDuration/1000)}с для предотвращения капчи...`
				});
			} catch (error) {
				console.error('Error sending break notification:', error);
			}
			
			await new Promise(resolve => setTimeout(resolve, breakDuration));
		}
		
		if (currentIndex < elements.length) {
			const element = elements[currentIndex];
			await processElement(element);
			currentIndex++;
			
			// Mandatory post-processing delay to prevent captcha
			const postProcessDelay = Math.random() * 500 + 300; // 300-800ms after each element
			await new Promise(resolve => setTimeout(resolve, postProcessDelay));
			
			// Save progress periodically (every 5 elements)
			if (currentIndex % 5 === 0) {
				try {
					await chrome.storage.local.set({ "savedPosition": currentIndex });
				} catch (error) {
					console.error('Error saving progress position:', error);
				}
			}
			
			// Use much longer randomized delays with time-based adaptation and rate limiting
			const delay = getAdaptiveDelay();
			console.log(`Next element in ${Math.round(delay/1000)}s... (slowdown: ${slowdownMultiplier.toFixed(1)}x)`);
			setTimeout(processNextElement, delay);
		} else {
			// Clear saved position when completed
			try {
				await chrome.storage.local.remove(['savedPosition']);
				console.log('Scanning completed successfully');
			} catch (error) {
				console.error('Error clearing saved position:', error);
			}
		}
	} catch (error) {
		console.error('Error in processNextElement:', error);
	}
}

async function sendData(content) {
	try {
		// Send progress update (currentIndex + 1 because we just processed the current element)
		await chrome.runtime.sendMessage({
			type: 'progress',
			total: totalElements,
			processed: currentIndex + 1,
			slowdownMultiplier: slowdownMultiplier
		});
		
		if (content.trim() !== '') {
			// Store results in persistent storage
			const result = await chrome.storage.local.get(['storedResults']);
			const existingResults = result.storedResults || '';
			const updatedResults = existingResults + content;
			await chrome.storage.local.set({ 'storedResults': updatedResults });
			
			// Send result to popup with retry mechanism
			let retries = 3;
			while (retries > 0) {
				try {
					await chrome.runtime.sendMessage({
						type: 'result',
						content: content
					});
					break;
				} catch (error) {
					retries--;
					if (retries === 0) {
						handleConnectionError(); // Track connection errors
						throw error;
					}
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}
		}
	} catch (error) {
		console.error('Error in sendData:', error);
		handleConnectionError(); // Track this error
		// Continue processing even if messaging fails
	}
}

processNextElement();