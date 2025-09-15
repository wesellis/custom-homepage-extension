// Configuration - REPLACE WITH YOUR UNSPLASH API KEY
const CONFIG = {
    UNSPLASH_ACCESS_KEY: 'YOUR_UNSPLASH_ACCESS_KEY_HERE', // Get from unsplash.com/developers
    DEFAULT_SEARCH_TERMS: ['nature', 'landscape', 'abstract', 'minimalist', 'ocean', 'mountains', 'forest', 'sunset']
};

// Default websites data
const DEFAULT_WEBSITES = {
    social: [
        { name: 'Twitter', desc: 'Social networking', url: 'https://twitter.com' },
        { name: 'Facebook', desc: 'Connect with friends', url: 'https://facebook.com' },
        { name: 'Instagram', desc: 'Photo sharing', url: 'https://instagram.com' },
        { name: 'LinkedIn', desc: 'Professional network', url: 'https://linkedin.com' },
        { name: 'Discord', desc: 'Gaming chat', url: 'https://discord.com' }
    ],
    productivity: [
        { name: 'Gmail', desc: 'Email service', url: 'https://gmail.com' },
        { name: 'Google Drive', desc: 'Cloud storage', url: 'https://drive.google.com' },
        { name: 'Notion', desc: 'All-in-one workspace', url: 'https://notion.so' },
        { name: 'Trello', desc: 'Project management', url: 'https://trello.com' },
        { name: 'Slack', desc: 'Team communication', url: 'https://slack.com' }
    ],
    entertainment: [
        { name: 'YouTube', desc: 'Video platform', url: 'https://youtube.com' },
        { name: 'Netflix', desc: 'Streaming service', url: 'https://netflix.com' },
        { name: 'Spotify', desc: 'Music streaming', url: 'https://spotify.com' },
        { name: 'Reddit', desc: 'Discussion platform', url: 'https://reddit.com' },
        { name: 'Twitch', desc: 'Live streaming', url: 'https://twitch.tv' }
    ]
};

// State management
let currentSettings = {
    searchTerm: 'nature',
    websites: {},
    customCategories: [],
    lastBackgroundUpdate: 0,
    defaultSort: 'default',
    websiteStats: {}, // Track usage: { url: { lastUsed: timestamp, useCount: number } }
    categoryOrder: [], // Track custom category order
    categorySorts: {} // Track individual sort method per category: { categoryKey: 'sortMethod' }
};

let currentSortMethod = 'default';

let previewScreenshot = null;

// Initialize the extension
document.addEventListener('DOMContentLoaded', function() {
    console.log('Custom Homepage Extension Starting...');
    loadSettings();
    updateTime();
    loadBackgroundImage();
    setupEventListeners();
    
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Change background every 30 minutes
    setInterval(() => {
        if (Date.now() - currentSettings.lastBackgroundUpdate > 30 * 60 * 1000) {
            loadBackgroundImage();
        }
    }, 5 * 60 * 1000); // Check every 5 minutes (more efficient)
});

// ===== TIME AND DATE FUNCTIONS =====
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    if (timeElement) timeElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
}

// ===== BACKGROUND IMAGE FUNCTIONS =====
async function loadBackgroundImage() {
    const searchTerm = currentSettings.searchTerm || getRandomSearchTerm();
    console.log(`Loading background image for: ${searchTerm}`);
    
    try {
        if (!CONFIG.UNSPLASH_ACCESS_KEY.includes('YOUR_')) {
            const response = await fetch(
                `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=landscape&w=1920&h=1080`,
                {
                    headers: {
                        'Authorization': `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}`
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                const imageUrl = data.urls.full;
                
                const backgroundImage = document.getElementById('backgroundImage');
                if (backgroundImage) {
                    backgroundImage.style.backgroundImage = `url(${imageUrl})`;
                    currentSettings.lastBackgroundUpdate = Date.now();
                    saveSettings();
                }
                return;
            }
        }
    } catch (error) {
        console.error('Error loading Unsplash image:', error);
    }
    
    // Fallback to gradient
    setFallbackBackground();
}

function getRandomSearchTerm() {
    return CONFIG.DEFAULT_SEARCH_TERMS[Math.floor(Math.random() * CONFIG.DEFAULT_SEARCH_TERMS.length)];
}

function setFallbackBackground() {
    const backgroundImage = document.getElementById('backgroundImage');
    if (backgroundImage) {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        backgroundImage.style.backgroundImage = randomGradient;
    }
}

// ===== SORTING FUNCTIONS =====
function sortWebsites(websites, method) {
    switch (method) {
        case 'alphabetical':
            return websites.sort((a, b) => a.name.localeCompare(b.name));
        
        case 'lastUsed':
            return websites.sort((a, b) => {
                const aLastUsed = currentSettings.websiteStats[a.url]?.lastUsed || 0;
                const bLastUsed = currentSettings.websiteStats[b.url]?.lastUsed || 0;
                return bLastUsed - aLastUsed; // Most recent first
            });
        
        case 'mostUsed':
            return websites.sort((a, b) => {
                const aUseCount = currentSettings.websiteStats[a.url]?.useCount || 0;
                const bUseCount = currentSettings.websiteStats[b.url]?.useCount || 0;
                return bUseCount - aUseCount; // Most used first
            });
        
        case 'default':
        default:
            return websites; // Return original order
    }
}

function changeSortMethod(newMethod, categoryKey = null) {
    if (categoryKey) {
        // Individual category sort
        currentSettings.categorySorts[categoryKey] = newMethod;
        saveSettings();
        renderCategories();
    } else {
        // Global default sort
        currentSortMethod = newMethod;
        currentSettings.defaultSort = newMethod;
        saveSettings();
        renderCategories();
    }
}

function trackWebsiteUsage(url) {
    if (!currentSettings.websiteStats[url]) {
        currentSettings.websiteStats[url] = {
            lastUsed: 0,
            useCount: 0
        };
    }
    
    currentSettings.websiteStats[url].lastUsed = Date.now();
    currentSettings.websiteStats[url].useCount++;
    
    saveSettings();
    console.log(`Tracked usage for ${url}: ${currentSettings.websiteStats[url].useCount} times`);
}

// ===== WEBSITE MANAGEMENT FUNCTIONS =====
function renderCategories() {
    console.log('renderCategories called');
    const container = document.getElementById('categoriesContainer');
    if (!container) {
        console.error('categoriesContainer not found!');
        return;
    }
    
    container.innerHTML = '';
    
    // Combine default and custom websites
    const allCategories = { ...DEFAULT_WEBSITES, ...currentSettings.websites };
    console.log('All categories to render:', allCategories);
    
    // Get ordered category keys
    const orderedCategoryKeys = getOrderedCategoryKeys(Object.keys(allCategories));
    console.log('Ordered category keys:', orderedCategoryKeys);
    
    orderedCategoryKeys.forEach((categoryKey, index) => {
        const websites = allCategories[categoryKey];
        if (websites && websites.length > 0) {
            console.log(`Rendering category ${categoryKey} with ${websites.length} websites`);
            const categoryElement = createCategoryElement(categoryKey, websites, index, orderedCategoryKeys.length);
            container.appendChild(categoryElement);
        } else {
            console.log(`Skipping empty category: ${categoryKey}`);
        }
    });
    
    console.log('renderCategories completed');
}

function getOrderedCategoryKeys(categoryKeys) {
    // Start with any custom order
    const ordered = [...currentSettings.categoryOrder];
    
    // Add any new categories that aren't in the custom order
    categoryKeys.forEach(key => {
        if (!ordered.includes(key)) {
            ordered.push(key);
        }
    });
    
    // Filter out any categories that no longer exist
    return ordered.filter(key => categoryKeys.includes(key));
}

function createCategoryElement(categoryKey, websites, categoryIndex, totalCategories) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    categoryDiv.dataset.categoryKey = categoryKey;
    
    const title = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/([A-Z])/g, ' $1');
    
    // Get sort method for this specific category
    const categorySortMethod = currentSettings.categorySorts[categoryKey] || currentSortMethod;
    
    // Sort websites based on category-specific method
    const sortedWebsites = sortWebsites([...websites], categorySortMethod);
    
    categoryDiv.innerHTML = `
        <div class="category-header">
            <div class="category-title-section">
                <div class="category-arrows">
                    <button class="arrow-btn" onclick="moveCategoryUp('${categoryKey}')" ${categoryIndex === 0 ? 'disabled' : ''}>▲</button>
                    <button class="arrow-btn" onclick="moveCategoryDown('${categoryKey}')" ${categoryIndex === totalCategories - 1 ? 'disabled' : ''}>▼</button>
                </div>
                <h2 class="category-title">${title}</h2>
            </div>
            <div class="sort-controls">
                <button class="sort-btn ${categorySortMethod === 'default' ? 'active' : ''}" data-sort="default" data-category="${categoryKey}">Default</button>
                <button class="sort-btn ${categorySortMethod === 'alphabetical' ? 'active' : ''}" data-sort="alphabetical" data-category="${categoryKey}">A-Z</button>
                <button class="sort-btn ${categorySortMethod === 'lastUsed' ? 'active' : ''}" data-sort="lastUsed" data-category="${categoryKey}">Recent</button>
                <button class="sort-btn ${categorySortMethod === 'mostUsed' ? 'active' : ''}" data-sort="mostUsed" data-category="${categoryKey}">Popular</button>
            </div>
        </div>
        <div class="websites-grid" data-category="${categoryKey}">
            ${sortedWebsites.map(website => createWebsiteHTML(website)).join('')}
        </div>
    `;
    
    // Add click listeners to sort buttons
    const sortButtons = categoryDiv.querySelectorAll('.sort-btn');
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sortMethod = button.dataset.sort;
            const categoryKey = button.dataset.category;
            changeSortMethod(sortMethod, categoryKey);
        });
    });
    
    // Add click listeners to website items
    const websiteItems = categoryDiv.querySelectorAll('.website-item');
    websiteItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            // Don't navigate if clicking the settings button
            if (e.target.closest('.website-settings')) {
                return;
            }
            
            const website = sortedWebsites[index];
            if (website && website.url) {
                trackWebsiteUsage(website.url);
                window.open(website.url, '_blank');
            }
        });
    });
    
    return categoryDiv;
}

function createWebsiteHTML(website) {
    const screenshotUrl = website.screenshot || generatePlaceholderImage(website);
    
    return `
        <div class="website-item" data-url="${website.url || '#'}">
            <div class="website-icon">
                <img src="${screenshotUrl}" alt="${website.name}" loading="lazy" 
                     onerror="this.src='${generatePlaceholderImage(website)}'">
                <div class="website-settings" onclick="editWebsite('${website.url}', '${website.name}', '${website.desc}')">
                    <span class="settings-icon">⚙️</span>
                </div>
            </div>
            <div class="website-name">${website.name}</div>
            <div class="website-desc">${website.desc}</div>
        </div>
    `;
}

function generatePlaceholderImage(website) {
    // Try favicon first
    if (website.url) {
        const faviconUrl = getFaviconFallback(website.url);
        if (faviconUrl) return faviconUrl;
    }
    
    // Use text placeholder as final fallback
    const encodedName = encodeURIComponent(website.name || 'Website');
    return `https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=${encodedName}`;
}

// ===== SCREENSHOT FUNCTIONS =====
async function getWebsiteScreenshot(url) {
    console.log(`Getting screenshot for: ${url}`);
    
    // Try multiple free screenshot services
    const services = [
        () => getMicrolinkScreenshot(url),
        () => getScreenshotOneDemo(url),
        () => getFaviconFallback(url)
    ];
    
    for (let i = 0; i < services.length; i++) {
        try {
            console.log(`Trying screenshot service ${i + 1}...`);
            const screenshot = await services[i]();
            if (screenshot) {
                console.log(`Screenshot service ${i + 1} succeeded`);
                return screenshot;
            }
        } catch (error) {
            console.log(`Screenshot service ${i + 1} failed:`, error.message);
        }
    }
    
    console.log('All services failed, using placeholder');
    return generatePlaceholderImage({name: 'Website', url});
}

// Service 1: Microlink API (free tier)
async function getMicrolinkScreenshot(url) {
    try {
        const apiUrl = `https://api.microlink.io/screenshot?url=${encodeURIComponent(url)}&viewport.width=1024&viewport.height=1024&screenshot.type=png&embed=screenshot.url`;
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data?.screenshot?.url) {
                return data.data.screenshot.url;
            }
        }
    } catch (error) {
        throw error;
    }
    return null;
}

// Service 2: ScreenshotOne Demo (free)
async function getScreenshotOneDemo(url) {
    try {
        const screenshotUrl = `https://api.screenshotone.com/take?access_key=_demo_&url=${encodeURIComponent(url)}&viewport_width=1024&viewport_height=1024&format=png&block_ads=true&block_cookie_banners=true`;
        
        const response = await fetch(screenshotUrl);
        if (response.ok) {
            return screenshotUrl;
        }
    } catch (error) {
        throw error;
    }
    return null;
}

// Service 3: Favicon fallback
function getFaviconFallback(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch (error) {
        return null;
    }
}

// ===== PREVIEW FUNCTIONS =====
function setupPreviewBox() {
    const previewBox = document.getElementById('previewBox');
    const websiteUrlInput = document.getElementById('websiteUrl');
    
    if (previewBox && websiteUrlInput) {
        previewBox.addEventListener('click', () => {
            let url = websiteUrlInput.value.trim();
            
            if (url) {
                // Auto-format URL before validation
                url = formatUrl(url);
                websiteUrlInput.value = url; // Update the input field
                
                if (isValidUrl(url)) {
                    loadWebsitePreview(url);
                } else {
                    showError('Please enter a valid URL');
                }
            } else {
                showError('Please enter a URL first');
            }
        });
    }
}

async function loadWebsitePreview(url) {
    console.log(`Loading preview for: ${url}`);
    
    const placeholder = document.querySelector('.preview-placeholder');
    const iframe = document.getElementById('previewIframe');
    const controls = document.querySelector('.preview-controls');
    const loading = document.querySelector('.loading-indicator');
    
    // Show loading state
    if (placeholder) placeholder.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    if (controls) controls.style.display = 'none';
    if (iframe) iframe.style.display = 'none';
    
    try {
        // Try to load the website in iframe
        if (iframe) {
            iframe.src = url;
            
            // Set a timeout for loading
            const loadTimeout = setTimeout(() => {
                handleIframeError();
            }, 10000);
            
            iframe.onload = () => {
                clearTimeout(loadTimeout);
                if (loading) loading.style.display = 'none';
                if (iframe) {
                    iframe.style.display = 'block';
                    console.log('Iframe loaded successfully, showing preview');
                }
                if (controls) controls.style.display = 'flex';
                console.log('Website loaded in iframe successfully');
            };
            
            iframe.onerror = () => {
                clearTimeout(loadTimeout);
                handleIframeError();
            };
        }
    } catch (error) {
        console.error('Preview loading failed:', error);
        handleIframeError();
    }
}

function handleIframeError() {
    console.log('Iframe loading failed, trying API screenshot');
    
    const loading = document.querySelector('.loading-indicator');
    const placeholder = document.querySelector('.preview-placeholder');
    const iframe = document.getElementById('previewIframe');
    const controls = document.querySelector('.preview-controls');
    
    if (loading) loading.style.display = 'none';
    if (iframe) iframe.style.display = 'none';
    if (controls) controls.style.display = 'none';
    
    // Show auto-capture message
    if (placeholder) {
        placeholder.innerHTML = `
            <span>⚠️ Website blocks preview</span>
            <small>Don't worry! We'll get a screenshot automatically</small>
            <div style="margin-top: 10px;">
                <button class="auto-capture-btn" onclick="tryAutoCapture()">📸 Get Screenshot</button>
            </div>
        `;
        placeholder.style.display = 'flex';
    }
}

async function capturePreview() {
    const iframe = document.getElementById('previewIframe');
    const previewBox = document.getElementById('previewBox');
    
    if (!iframe || iframe.style.display === 'none') {
        // If no iframe preview, try to get screenshot via API
        const url = document.getElementById('websiteUrl').value;
        if (url) {
            showLoadingMessage('Getting screenshot via API...');
            const screenshot = await getReliableScreenshot(url);
            if (screenshot) {
                previewScreenshot = screenshot;
                
                // Show success in preview box
                const placeholder = document.querySelector('.preview-placeholder');
                if (placeholder) {
                    placeholder.innerHTML = `
                        <span>✅ Screenshot captured!</span>
                        <small>Ready to add website</small>
                    `;
                    placeholder.style.display = 'flex';
                }
                
                showSuccess('Screenshot captured successfully!');
                return screenshot;
            }
        }
        
        showError('No preview available to capture');
        return null;
    }
    
    try {
        console.log('Capturing screenshot of preview box...');
        
        // Take screenshot of the iframe content
        if (window.html2canvas) {
            const canvas = await html2canvas(iframe.contentDocument.body, {
                width: 1024,
                height: 1024,
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            const dataUrl = canvas.toDataURL('image/png');
            console.log('Preview box screenshot captured successfully');
            
            previewScreenshot = dataUrl;
            
            // Show success in preview box
            const placeholder = document.querySelector('.preview-placeholder');
            if (placeholder) {
                placeholder.innerHTML = `
                    <span>✅ Screenshot captured!</span>
                    <small>Ready to add website</small>
                `;
                placeholder.style.display = 'flex';
            }
            
            // Hide iframe but keep controls visible
            iframe.style.display = 'none';
            
            showSuccess('Screenshot captured successfully!');
            return dataUrl;
        } else {
            throw new Error('html2canvas not available');
        }
    } catch (error) {
        console.error('Preview box capture failed:', error);
        
        // Fallback to API screenshot
        const url = document.getElementById('websiteUrl').value;
        return await getWebsiteScreenshot(url);
    }
}

// Try to automatically capture screenshot using API
window.tryAutoCapture = async function() {
    const url = document.getElementById('websiteUrl').value;
    const placeholder = document.querySelector('.preview-placeholder');
    
    if (!url) {
        showError('Please enter a URL first');
        return;
    }
    
    // Show loading
    if (placeholder) {
        placeholder.innerHTML = `
            <div class="spinner"></div>
            <span>Getting screenshot...</span>
            <small>This may take a few seconds</small>
        `;
    }
    
    try {
        // Try using screenshot services
        const screenshot = await getWebsiteScreenshot(url);
        if (screenshot) {
            previewScreenshot = screenshot;
            if (placeholder) {
                placeholder.innerHTML = `
                    <span>✅ Screenshot captured!</span>
                    <small>Click "Add Website" to save</small>
                `;
            }
            showSuccess('Screenshot ready! You can now add the website.');
        } else {
            throw new Error('Screenshot services failed');
        }
    } catch (error) {
        console.error('Auto capture failed:', error);
        
        // Use favicon as final fallback
        const faviconUrl = getFaviconFallback(url);
        if (faviconUrl) {
            previewScreenshot = faviconUrl;
            if (placeholder) {
                placeholder.innerHTML = `
                    <span>✅ Using favicon</span>
                    <small>Click "Add Website" to save</small>
                `;
            }
            showSuccess('Favicon ready!');
            return;
        }
        
        // Final fallback to favicon
        if (placeholder) {
            placeholder.innerHTML = `
                <span>⚠️ Screenshot failed</span>
                <small>Using favicon instead</small>
                <div style="margin-top: 10px;">
                    <button class="auto-capture-btn" onclick="useFaviconFallback()">🌐 Use Favicon</button>
                </div>
            `;
        }
    }
};

// Function removed - using getWebsiteScreenshot instead

// Function removed - using improved screenshot services

// Use favicon as fallback
window.useFaviconFallback = function() {
    const url = document.getElementById('websiteUrl').value;
    if (url) {
        const faviconUrl = getFaviconFallback(url);
        if (faviconUrl) {
            previewScreenshot = faviconUrl;
            
            const placeholder = document.querySelector('.preview-placeholder');
            if (placeholder) {
                placeholder.innerHTML = `
                    <span>✅ Using favicon</span>
                    <small>Click "Add Website" to save</small>
                `;
            }
            showSuccess('Favicon ready! You can now add the website.');
        } else {
            showError('Invalid URL format');
        }
    }
};

// ===== CATEGORY REORDERING FUNCTIONS =====
window.moveCategoryUp = function(categoryKey) {
    const allCategories = { ...DEFAULT_WEBSITES, ...currentSettings.websites };
    const orderedKeys = getOrderedCategoryKeys(Object.keys(allCategories));
    const currentIndex = orderedKeys.indexOf(categoryKey);
    
    if (currentIndex > 0) {
        // Swap with previous category
        const newOrder = [...orderedKeys];
        [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
        
        currentSettings.categoryOrder = newOrder;
        saveSettings();
        renderCategories();
        
        console.log(`Moved ${categoryKey} up`);
    }
};

window.moveCategoryDown = function(categoryKey) {
    const allCategories = { ...DEFAULT_WEBSITES, ...currentSettings.websites };
    const orderedKeys = getOrderedCategoryKeys(Object.keys(allCategories));
    const currentIndex = orderedKeys.indexOf(categoryKey);
    
    if (currentIndex < orderedKeys.length - 1) {
        // Swap with next category
        const newOrder = [...orderedKeys];
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
        
        currentSettings.categoryOrder = newOrder;
        saveSettings();
        renderCategories();
        
        console.log(`Moved ${categoryKey} down`);
    }
};

// Auto-format URL to include https://www. if missing
function formatUrl(inputUrl) {
    if (!inputUrl) return '';
    
    let url = inputUrl.trim();
    
    // If no protocol, add https://
    if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
    }
    
    // If no www. and it's a simple domain, add www.
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Only add www. if it's a simple domain (no subdomain) and doesn't already have www.
        if (hostname.includes('.') && // has a dot (valid domain)
            !hostname.startsWith('www.') && 
            hostname.split('.').length === 2 && // simple domain like twitter.com
            !hostname.match(/^(localhost|\d+\.\d+\.\d+\.\d+)$/)) { // not localhost or IP
            
            urlObj.hostname = 'www.' + hostname;
            url = urlObj.toString();
        }
        
        return url;
    } catch (error) {
        console.error('URL formatting error:', error);
        // If URL parsing fails, just return with https:// prefix
        return url;
    }
}

// Edit existing website - opens settings with current data filled in
window.editWebsite = function(url, name, desc) {
    console.log(`Editing website: ${name} (${url})`);
    
    // Open settings modal
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.classList.add('active');
    }
    
    // Fill in the form with current data
    const urlInput = document.getElementById('websiteUrl');
    const nameInput = document.getElementById('websiteName');
    const descInput = document.getElementById('websiteDesc');
    
    if (urlInput) urlInput.value = url;
    if (nameInput) nameInput.value = name;
    if (descInput) descInput.value = desc || '';
    
    // Set the category to the one this website is currently in
    const categorySelect = document.getElementById('websiteCategory');
    if (categorySelect) {
        let currentCategory = 'productivity'; // default
        
        // Find which category this website is in
        Object.keys(currentSettings.websites).forEach(categoryKey => {
            const websites = currentSettings.websites[categoryKey];
            if (websites.some(w => w.url === url)) {
                currentCategory = categoryKey;
            }
        });
        
        categorySelect.value = currentCategory;
    }
    
    // Load the website preview automatically
    setTimeout(() => {
        if (url) {
            loadWebsitePreview(url);
        }
    }, 100);
    
    // Store original URL so we can remove the old entry when saving
    window.editingOriginalUrl = url;
    
    showSuccess(`Editing ${name} - make changes and click "Add Website" to save`);
};

// Refresh screenshot for a specific website (keeping old function for backwards compatibility)
window.refreshWebsiteScreenshot = async function(url, websiteName) {
    // Just call editWebsite instead - much better UX
    const website = findWebsiteByUrl(url);
    if (website) {
        editWebsite(url, website.name, website.desc);
    }
};

// Helper function to find a website by URL
function findWebsiteByUrl(url) {
    for (const categoryKey of Object.keys(currentSettings.websites)) {
        const websites = currentSettings.websites[categoryKey];
        const website = websites.find(w => w.url === url);
        if (website) {
            return website;
        }
    }
    return null;
}

// ===== SETTINGS FUNCTIONS =====
function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['searchTerm', 'websites', 'customCategories', 'defaultSort', 'websiteStats', 'categoryOrder', 'categorySorts'], (result) => {
            currentSettings.searchTerm = result.searchTerm || 'nature';
            currentSettings.websites = result.websites || {};
            currentSettings.customCategories = result.customCategories || [];
            currentSettings.defaultSort = result.defaultSort || 'default';
            currentSettings.websiteStats = result.websiteStats || {};
            currentSettings.categoryOrder = result.categoryOrder || [];
            currentSettings.categorySorts = result.categorySorts || {};
            
            // Set current sort method
            currentSortMethod = currentSettings.defaultSort;
            
            // Update UI
            const searchTermInput = document.getElementById('searchTerm');
            if (searchTermInput) {
                searchTermInput.value = currentSettings.searchTerm;
            }
            
            const defaultSortSelect = document.getElementById('defaultSort');
            if (defaultSortSelect) {
                defaultSortSelect.value = currentSettings.defaultSort;
            }
            
            renderCategories();
            loadWebsiteScreenshots();
        });
    } else {
        // Fallback for development
        renderCategories();
        loadWebsiteScreenshots();
    }
}

function saveSettings() {
    console.log('saveSettings called, saving:', currentSettings);
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({
            searchTerm: currentSettings.searchTerm,
            websites: currentSettings.websites,
            customCategories: currentSettings.customCategories,
            defaultSort: currentSettings.defaultSort,
            websiteStats: currentSettings.websiteStats,
            categoryOrder: currentSettings.categoryOrder,
            categorySorts: currentSettings.categorySorts
        }, () => {
            console.log('Settings saved successfully');
        });
    } else {
        console.log('Chrome storage not available, settings not saved');
    }
}

async function loadWebsiteScreenshots() {
    console.log('Loading website screenshots...');
    
    // Load screenshots for custom websites only (default websites use favicons)
    for (const categoryKey of Object.keys(currentSettings.websites)) {
        const websites = currentSettings.websites[categoryKey];
        for (let i = 0; i < websites.length; i++) {
            const website = websites[i];
            if (website.url && !website.screenshot) {
                try {
                    // Only try to get actual screenshots for user-added websites
                    const screenshot = await getWebsiteScreenshot(website.url);
                    if (screenshot) {
                        website.screenshot = screenshot;
                        
                        // Update the image in the DOM
                        const grid = document.querySelector(`[data-category="${categoryKey}"]`);
                        if (grid) {
                            const items = grid.querySelectorAll('.website-item');
                            const img = items[i]?.querySelector('img');
                            if (img) {
                                img.src = screenshot;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Failed to load screenshot for ${website.name}:`, error);
                }
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    // Save updated screenshots
    saveSettings();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.add('active');
        });
    }
    
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            if (settingsModal) settingsModal.classList.remove('active');
        });
    }
    
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }
    
    // Search term change
    const searchTermInput = document.getElementById('searchTerm');
    if (searchTermInput) {
        searchTermInput.addEventListener('change', (e) => {
            currentSettings.searchTerm = e.target.value;
            saveSettings();
            loadBackgroundImage();
        });
    }
    
    // Default sort change
    const defaultSortSelect = document.getElementById('defaultSort');
    if (defaultSortSelect) {
        defaultSortSelect.addEventListener('change', (e) => {
            currentSettings.defaultSort = e.target.value;
            currentSortMethod = e.target.value;
            saveSettings();
            renderCategories();
        });
    }
    
    // Category selection change
    const categorySelect = document.getElementById('websiteCategory');
    const customCategoryInput = document.getElementById('customCategoryName');
    if (categorySelect && customCategoryInput) {
        categorySelect.addEventListener('change', (e) => {
            customCategoryInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }
    
    // Add website
    const addWebsiteBtn = document.getElementById('addWebsiteBtn');
    if (addWebsiteBtn) {
        console.log('Found addWebsiteBtn, setting up event listener');
        addWebsiteBtn.addEventListener('click', (e) => {
            console.log('Add website button clicked');
            e.preventDefault();
            addWebsite();
        });
    } else {
        console.error('addWebsiteBtn not found!');
    }
    
    // Preview controls
    setupPreviewBox();
    
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', async () => {
            console.log('Capture button clicked');
            const screenshot = await capturePreview();
            if (screenshot) {
                previewScreenshot = screenshot;
                console.log('Screenshot saved to previewScreenshot variable');
                
                // Update the preview box to show success
                const placeholder = document.querySelector('.preview-placeholder');
                const iframe = document.getElementById('previewIframe');
                const controls = document.querySelector('.preview-controls');
                
                // Hide iframe and controls, show success message
                if (iframe) iframe.style.display = 'none';
                if (controls) controls.style.display = 'none';
                if (placeholder) {
                    placeholder.innerHTML = `
                        <span>✅ Screenshot captured!</span>
                        <small>Click "Add Website" to save</small>
                    `;
                    placeholder.style.display = 'flex';
                }
                
                showSuccess('Screenshot captured! You can now add the website.');
            }
        });
    }
    
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const url = document.getElementById('websiteUrl').value;
            if (url) {
                loadWebsitePreview(url);
            }
        });
    }
    
    // Background controls
    const refreshBgBtn = document.getElementById('refreshBgBtn');
    if (refreshBgBtn) {
        refreshBgBtn.addEventListener('click', loadBackgroundImage);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefaults);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

async function addWebsite() {
    console.log('addWebsite function called');
    
    const urlInput = document.getElementById('websiteUrl');
    const nameInput = document.getElementById('websiteName');
    const descInput = document.getElementById('websiteDesc');
    const categorySelect = document.getElementById('websiteCategory');
    const customCategoryInput = document.getElementById('customCategoryName');
    
    if (!urlInput || !nameInput || !categorySelect) {
        console.error('Required form elements not found');
        showError('Form elements not found');
        return;
    }
    
    const rawUrl = urlInput.value.trim();
    const name = nameInput.value.trim();
    const desc = descInput ? descInput.value.trim() : '';
    const category = categorySelect.value;
    const customCategoryName = customCategoryInput ? customCategoryInput.value.trim() : '';
    
    console.log('Form values:', { rawUrl, name, desc, category, customCategoryName });
    
    if (!rawUrl || !name) {
        showError('Please enter both URL and website name');
        return;
    }
    
    // Auto-format the URL
    const url = formatUrl(rawUrl);
    urlInput.value = url;
    
    console.log('Formatted URL:', url);
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    const finalCategory = category === 'custom' ? 
        (customCategoryName || 'custom') : category;
    
    console.log('Final category:', finalCategory);
    
    // If we're editing, remove the old entry first
    if (window.editingOriginalUrl) {
        console.log('Editing mode: removing old entry for', window.editingOriginalUrl);
        removeWebsiteByUrl(window.editingOriginalUrl);
        window.editingOriginalUrl = null;
    }
    
    // Get screenshot
    let screenshot = previewScreenshot;
    if (!screenshot) {
        console.log('No preview screenshot, getting fallback');
        screenshot = getFaviconFallback(url) || generatePlaceholderImage({ name, url });
        console.log('Using fallback screenshot:', screenshot);
    }
    
    const website = {
        name,
        desc: desc || 'No description',
        url,
        screenshot
    };
    
    console.log('Website object:', website);
    
    // Add to settings
    if (!currentSettings.websites[finalCategory]) {
        currentSettings.websites[finalCategory] = [];
    }
    currentSettings.websites[finalCategory].push(website);
    
    console.log('Updated currentSettings.websites:', currentSettings.websites);
    
    saveSettings();
    renderCategories();
    
    // Clear form
    urlInput.value = '';
    nameInput.value = '';
    if (descInput) descInput.value = '';
    resetPreviewBox();
    previewScreenshot = null;
    
    showSuccess(`Added ${name} to ${finalCategory} category!`);
    console.log('Website added successfully');
}

// Helper function to remove a website by URL
function removeWebsiteByUrl(url) {
    Object.keys(currentSettings.websites).forEach(categoryKey => {
        const websites = currentSettings.websites[categoryKey];
        const index = websites.findIndex(w => w.url === url);
        if (index !== -1) {
            websites.splice(index, 1);
            console.log(`Removed website ${url} from ${categoryKey}`);
            
            // If category is now empty, remove it
            if (websites.length === 0) {
                delete currentSettings.websites[categoryKey];
                console.log(`Removed empty category ${categoryKey}`);
            }
        }
    });
}

function resetPreviewBox() {
    const placeholder = document.querySelector('.preview-placeholder');
    const iframe = document.getElementById('previewIframe');
    const controls = document.querySelector('.preview-controls');
    const loading = document.querySelector('.loading-indicator');
    
    if (placeholder) {
        placeholder.innerHTML = `
            <span>Enter URL above and click here to preview</span>
            <small>We'll capture a 1024x1024 screenshot</small>
        `;
        placeholder.style.display = 'flex';
    }
    if (iframe) iframe.style.display = 'none';
    if (controls) controls.style.display = 'none';
    if (loading) loading.style.display = 'none';
}

function resetToDefaults() {
    if (confirm('Reset all settings to defaults? This will remove custom websites and usage statistics.')) {
        currentSettings = {
            searchTerm: 'nature',
            websites: {},
            customCategories: [],
            lastBackgroundUpdate: 0,
            defaultSort: 'default',
            websiteStats: {},
            categoryOrder: [],
            categorySorts: {}
        };
        
        currentSortMethod = 'default';
        
        saveSettings();
        renderCategories();
        loadBackgroundImage();
        
        const searchTermInput = document.getElementById('searchTerm');
        if (searchTermInput) {
            searchTermInput.value = 'nature';
        }
        
        const defaultSortSelect = document.getElementById('defaultSort');
        if (defaultSortSelect) {
            defaultSortSelect.value = 'default';
        }
        
        showSuccess('Settings reset to defaults!');
    }
}

function handleKeyboardShortcuts(e) {
    // Press 'S' to open settings
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) settingsModal.classList.add('active');
    }
    
    // Press 'Escape' to close settings
    if (e.key === 'Escape') {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) settingsModal.classList.remove('active');
    }
    
    // Press 'R' to refresh background
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        loadBackgroundImage();
    }
}

// ===== UTILITY FUNCTIONS =====
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showError(message) {
    console.error(message);
    alert('Error: ' + message); // Replace with better UI notification
}

function showSuccess(message) {
    console.log(message);
    alert('Success: ' + message); // Replace with better UI notification
}

function showLoadingMessage(message) {
    console.log(message);
    // Could show a loading indicator
}

// ===== RESPONSIVE GRID MANAGEMENT =====
function updateGridColumns() {
    const grids = document.querySelectorAll('.websites-grid');
    grids.forEach(grid => {
        const containerWidth = grid.offsetWidth;
        const cardWidth = 150; // 150px card width
        const gap = 20; // gap between cards
        const minColumns = 3;
        const maxColumns = 10;
        
        const columns = Math.max(
            minColumns, 
            Math.min(
                maxColumns, 
                Math.floor((containerWidth + gap) / (cardWidth + gap))
            )
        );
        
        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    });
}

// Update grid on window resize
window.addEventListener('resize', updateGridColumns);

// Debug logging
console.log('Custom Homepage Extension Script Loaded');
console.log('Config:', CONFIG);
console.log('Default Websites:', DEFAULT_WEBSITES);