// Popup script for DOM Flood extension

const activateBtn = document.getElementById('activate-btn');
const deactivateBtn = document.getElementById('deactivate-btn');
const statusDiv = document.getElementById('status');

// Activate DOM Flood on current page
activateBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to activate
    chrome.tabs.sendMessage(tab.id, { action: 'activate' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            statusDiv.textContent = '❌ Erreur d\'activation';
            statusDiv.className = 'inactive';
        } else {
            statusDiv.textContent = '✅ Inondation active !';
            statusDiv.className = 'active';
        }
    });
});

// Deactivate DOM Flood on current page
deactivateBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to deactivate
    chrome.tabs.sendMessage(tab.id, { action: 'deactivate' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
        } else {
            statusDiv.textContent = '❌ Inactif sur cette page';
            statusDiv.className = 'inactive';
        }
    });
});

// Check initial status
async function checkStatus() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
        if (!chrome.runtime.lastError && response && response.active) {
            statusDiv.textContent = '✅ Inondation active !';
            statusDiv.className = 'active';
        } else {
            statusDiv.textContent = '❌ Inactif sur cette page';
            statusDiv.className = 'inactive';
        }
    });
}

// Check status on popup open
checkStatus();
