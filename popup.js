const tabs = document.querySelectorAll('.tab');
const switches = document.querySelectorAll('.switch');

const resultsContent = document.getElementById('results-content');
const progressSection = document.getElementById('progress-section');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressStatus = document.getElementById('progress-status');

// Progress tracking variables
let totalPlayers = 0;
let processedPlayers = 0;

// Load stored results when popup opens
document.addEventListener('DOMContentLoaded', function() {
	// Initialize first tab as active
	if (tabs.length > 0) {
		tabs[0].classList.add('active-tab');
	}
	
	chrome.storage.local.get(['storedResults', 'progressData', 'adminNickname', 'exportSettings'], function(result) {
		if (result.storedResults && result.storedResults.trim() !== '') {
			resultsContent.innerHTML = result.storedResults;
		}
		
		// Load progress data if exists
		if (result.progressData) {
			totalPlayers = result.progressData.total || 0;
			processedPlayers = result.progressData.processed || 0;
			updateProgressDisplay();
		}
		
		// Load admin nickname if exists
		const nicknameInput = document.getElementById('admin-nickname');
		const currentNicknameDisplay = document.getElementById('current-nickname-display');
		const resultsNicknameDisplay = document.getElementById('results-nickname-display');
		const savedNickname = result.adminNickname || 'kenny';
		
		if (nicknameInput) {
			nicknameInput.value = savedNickname;
		}
		
		if (currentNicknameDisplay) {
			currentNicknameDisplay.textContent = savedNickname;
		}
		
		if (resultsNicknameDisplay) {
			resultsNicknameDisplay.textContent = savedNickname;
		}
		
		// Load export settings
		const exportEnabled = document.getElementById('auto-export-enabled');
		
		if (result.exportSettings) {
			if (exportEnabled) {
				exportEnabled.checked = result.exportSettings.enabled || false;
			}
		}
	});
	
	// Handle export checkbox toggle (simplified - no path section needed)
	const exportEnabled = document.getElementById('auto-export-enabled');
	
	// Handle faction link clicks
	document.addEventListener('click', function(e) {
		if (e.target.tagName === 'A' && e.target.href) {
			e.preventDefault();
			chrome.tabs.create({ url: e.target.href });
		}
	});
	
	// Add clear results button functionality
	const clearButton = document.getElementById('clear-results');
	if (clearButton) {
		clearButton.addEventListener('click', function() {
			// Clear stored results
			chrome.storage.local.set({ 'storedResults': '' });
			
			// Clear displayed results in the results tab
			resultsContent.innerHTML = 'Пока результатов нет...';
			
			// Reset progress
			resetProgress();
		});
	}

	// Add copy all commands button functionality
	const copyAllButton = document.getElementById('copy-all-commands');
	if (copyAllButton) {
		copyAllButton.addEventListener('click', function() {
			const resultsText = resultsContent.innerHTML;
			
			if (resultsText === 'Пока результатов нет...') {
				// Show message if no results
				copyAllButton.textContent = '❌ Нет результатов';
				copyAllButton.style.backgroundColor = '#ff6b6b';
				setTimeout(() => {
					copyAllButton.textContent = '📋 Копировать все команды';
					copyAllButton.style.backgroundColor = 'rgb(255, 138, 0)';
				}, 1500);
				return;
			}
			
			// Extract only command text (remove HTML tags)
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = resultsText;
			const commandsText = tempDiv.textContent || tempDiv.innerText || '';
			
			// Copy to clipboard
			navigator.clipboard.writeText(commandsText).then(() => {
				// Success feedback
				copyAllButton.textContent = '✅ Скопировано!';
				copyAllButton.style.backgroundColor = '#4CAF50';
				setTimeout(() => {
					copyAllButton.textContent = '📋 Копировать все команды';
					copyAllButton.style.backgroundColor = 'rgb(255, 138, 0)';
				}, 1500);
			}).catch(() => {
				// Error feedback
				copyAllButton.textContent = '❌ Ошибка копирования';
				copyAllButton.style.backgroundColor = '#ff6b6b';
				setTimeout(() => {
					copyAllButton.textContent = '📋 Копировать все команды';
					copyAllButton.style.backgroundColor = 'rgb(255, 138, 0)';
				}, 1500);
			});
		});
	}

	// Add start button functionality
	const startButton = document.getElementById('start-button');
	if (startButton) {
		startButton.addEventListener('click', function() {
			chrome.storage.local.set({ "isWorking": true });
			chrome.tabs.executeScript({ file: "content.js" });
			
			// Initialize progress
			initializeProgress();
			
			// Visual feedback
			startButton.style.backgroundColor = 'rgb(46, 175, 46)';
			setTimeout(() => {
				startButton.style.backgroundColor = 'rgb(34, 139, 34)';
			}, 200);
		});
	}

	// Add stop button functionality
	const stopButton = document.getElementById('stop-button');
	if (stopButton) {
		stopButton.addEventListener('click', function() {
			chrome.storage.local.set({ "isWorking": false });
			
			// Update progress status
			if (progressStatus) {
				progressStatus.textContent = 'Остановлено пользователем';
			}
			
			// Visual feedback
			stopButton.style.backgroundColor = 'rgb(240, 73, 89)';
			setTimeout(() => {
				stopButton.style.backgroundColor = 'rgb(220, 53, 69)';
			}, 200);
		});
	}
	
	// Add settings save functionality
	const saveSettingsButton = document.getElementById('save-settings');
	const nicknameInput = document.getElementById('admin-nickname');
	const saveStatus = document.getElementById('save-status');
	
	if (saveSettingsButton && nicknameInput) {
		saveSettingsButton.addEventListener('click', function() {
			const nickname = nicknameInput.value.trim() || 'kenny'; // Fallback to kenny if empty
			const exportEnabled = document.getElementById('auto-export-enabled');
			
			// Prepare settings object
			const exportSettings = {
				enabled: exportEnabled ? exportEnabled.checked : false,
				path: '' // Always use default Downloads folder
			};
			
			// Save to storage
			chrome.storage.local.set({ 
				'adminNickname': nickname,
				'exportSettings': exportSettings
			}, function() {
				// Update current nickname display in settings
				const currentNicknameDisplay = document.getElementById('current-nickname-display');
				if (currentNicknameDisplay) {
					currentNicknameDisplay.textContent = nickname;
				}
				
				// Update nickname display in results
				const resultsNicknameDisplay = document.getElementById('results-nickname-display');
				if (resultsNicknameDisplay) {
					resultsNicknameDisplay.textContent = nickname;
				}
				
				// Show success message
				if (saveStatus) {
					saveStatus.style.display = 'block';
					setTimeout(() => {
						saveStatus.style.display = 'none';
					}, 2000);
				}
				
				// Visual feedback on button
				saveSettingsButton.style.backgroundColor = 'rgb(76, 175, 80)';
				saveSettingsButton.textContent = 'Сохранено!';
				setTimeout(() => {
					saveSettingsButton.style.backgroundColor = 'rgb(255, 138, 0)';
					saveSettingsButton.textContent = 'Сохранить';
				}, 1000);
			});
		});
		
		// Add input styling on focus
		nicknameInput.addEventListener('focus', function() {
			this.style.borderColor = 'rgb(255, 138, 0)';
		});
		
		nicknameInput.addEventListener('blur', function() {
			this.style.borderColor = 'rgba(255, 138, 0, 0.3)';
		});
	}
});

// Progress management functions
function updateProgressDisplay() {
	if (totalPlayers > 0) {
		progressSection.style.display = 'block';
		const percentage = (processedPlayers / totalPlayers) * 100;
		
		progressBar.style.width = percentage + '%';
		progressText.textContent = `${processedPlayers} / ${totalPlayers}`;
		
		if (processedPlayers === totalPlayers) {
			progressStatus.textContent = 'Сканирование завершено';
		} else if (processedPlayers > 0) {
			progressStatus.textContent = 'Сканирование в процессе...';
		}
	}
}

function initializeProgress() {
	progressSection.style.display = 'block';
	progressStatus.textContent = 'Инициализация сканирования...';
	progressBar.style.width = '0%';
	progressText.textContent = '0 / 0';
}

function resetProgress() {
	totalPlayers = 0;
	processedPlayers = 0;
	progressSection.style.display = 'none';
	progressBar.style.width = '0%';
	progressText.textContent = '0 / 0';
	progressStatus.textContent = 'Готов к запуску';
	
	// Clear stored progress
	chrome.storage.local.set({ 'progressData': { total: 0, processed: 0 } });
}

// Export results to file function
function exportResultsToFile() {
	chrome.storage.local.get(['exportSettings', 'storedResults'], function(result) {
		if (!result.exportSettings || !result.exportSettings.enabled) {
			return; // Export disabled
		}
		
		const results = result.storedResults || '';
		if (results.trim() === '') {
			return; // No results to export
		}
		
		// Create filename with timestamp
		const now = new Date();
		const timestamp = now.getFullYear() + '-' + 
			String(now.getMonth() + 1).padStart(2, '0') + '-' + 
			String(now.getDate()).padStart(2, '0') + '_' + 
			String(now.getHours()).padStart(2, '0') + '-' + 
			String(now.getMinutes()).padStart(2, '0');
		const filename = `twink_results_${timestamp}.txt`;
		
		// Extract text content from HTML
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = results;
		const textContent = tempDiv.textContent || tempDiv.innerText || '';
		
		// Create blob and download
		const blob = new Blob([textContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		
		// Always save to default Downloads folder
		chrome.downloads.download({
			url: url,
			filename: filename, // Just filename, Chrome will save to Downloads
			saveAs: false
		}, function(downloadId) {
			URL.revokeObjectURL(url);
		});
	});
}


// Tab switching functionality
for (const tabSwitch of switches) {
	tabSwitch.addEventListener('change', (e) => {
		const tabIndex = Number(e.target.id.split('-')[1]) - 1;
	
		tabs.forEach((tab, i) => {
			const isActive = i === tabIndex;
			tab.classList.toggle('active-tab', isActive);
		});
		
		// If switching to settings tab (index 2), refresh settings display
		if (tabIndex === 2) {
			refreshSettingsDisplay();
		}
	});
}

// Function to refresh settings display
function refreshSettingsDisplay() {
	chrome.storage.local.get(['adminNickname', 'exportSettings'], function(result) {
		const nicknameInput = document.getElementById('admin-nickname');
		const currentNicknameDisplay = document.getElementById('current-nickname-display');
		const exportEnabled = document.getElementById('auto-export-enabled');
		const savedNickname = result.adminNickname || 'kenny';
		
		if (nicknameInput) {
			nicknameInput.value = savedNickname;
		}
		
		if (currentNicknameDisplay) {
			currentNicknameDisplay.textContent = savedNickname;
		}
		
		if (result.exportSettings && exportEnabled) {
			exportEnabled.checked = result.exportSettings.enabled || false;
		}
	});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'progress') {
		// Handle progress updates
		totalPlayers = message.total;
		processedPlayers = message.processed;
		
		// Save progress data
		chrome.storage.local.set({ 
			'progressData': { 
				total: totalPlayers, 
				processed: processedPlayers 
			} 
		});
		
		updateProgressDisplay();
		
		// Check if scanning is completed and trigger export
		if (totalPlayers > 0 && processedPlayers >= totalPlayers) {
			setTimeout(() => {
				exportResultsToFile();
			}, 1000); // Small delay to ensure all results are saved
		}
	} else if (message.type === 'result') {
		// Handle twink results
		let element = document.createElement('div');
		element.innerHTML = message.content;
		resultsContent.appendChild(element);
		
		// Save results
		chrome.storage.local.get(['storedResults'], function(result) {
			let currentResults = result.storedResults || '';
			currentResults += message.content;
			chrome.storage.local.set({ 'storedResults': currentResults });
		});
	} else {
		// Legacy support for old message format
		let element = document.createElement('div');
		element.innerHTML = message;
		resultsContent.appendChild(element);
	}
});