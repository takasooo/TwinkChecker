let elements = document.querySelectorAll('a.link_lock[onclick*="Mi.showMemberChars"]');
let currentIndex = 0;
let isWorking = true;
let nickname = "kenny"; // Default nickname
let totalElements = elements.length;

// Load admin nickname from settings
chrome.storage.local.get(['adminNickname'], function(result) {
	if (result.adminNickname && result.adminNickname.trim() !== '') {
		nickname = result.adminNickname.trim();
	}
});

// Send initial progress
chrome.runtime.sendMessage({
	type: 'progress',
	total: totalElements,
	processed: 0
});

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

function processElement(element) {
	element.click();
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
    sendData(content);
}

function processNextElement() {
	// Check if we should stop processing
	chrome.storage.local.get(['isWorking'], function(result) {
		if (result.isWorking === false) {
			console.log('Script stopped by user');
			return;
		}
		
		if (currentIndex < elements.length) {
			const element = elements[currentIndex];
			processElement(element);
			currentIndex++;
			setTimeout(processNextElement, 250);
		}
	});
}

async function sendData(content) {
	// Send progress update
	chrome.runtime.sendMessage({
		type: 'progress',
		total: totalElements,
		processed: currentIndex
	});
	
	if (content.trim() !== '') {
		// Store results in persistent storage
		chrome.storage.local.get(['storedResults'], function(result) {
			const existingResults = result.storedResults || '';
			const updatedResults = existingResults + content;
			chrome.storage.local.set({ 'storedResults': updatedResults });
		});
		
		// Send result to popup
		await chrome.runtime.sendMessage({
			type: 'result',
			content: content
		});
	}
}

processNextElement();