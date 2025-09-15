# Custom Homepage Chrome Extension

A beautiful Chrome extension that replaces your new tab page with a customizable homepage featuring:

- **Live Clock & Date** - Always shows current time and date
- **Dynamic Backgrounds** - Random Unsplash photos based on your search preferences
- **Website Shortcuts** - Organized categories with website screenshots
- **Custom Screenshots** - Preview and capture website screenshots directly in the extension
- **Responsive Design** - Automatically adjusts columns based on screen width
- **Easy Customization** - Add your own websites and categories

## 🚀 Features

### Time & Date Display
- Large, clean time display that updates every second
- Full date with day of week
- Beautiful text shadows for readability over any background

### Dynamic Backgrounds
- Random Unsplash photos based on your chosen search terms
- Fallback gradients if Unsplash is unavailable
- Background changes every 30 minutes automatically
- Customizable search terms (nature, abstract, city, etc.)

### Website Management
- **Pre-loaded Categories**: Social Media, Productivity, Entertainment
- **Custom Categories**: Create your own categories
- **Website Screenshots**: 1024x1024px screenshots displayed at 150x150px
- **Interactive Preview**: Preview websites before adding them
- **Screenshot Capture**: Capture screenshots directly in the extension

### Responsive Grid System
- **Mobile (< 768px)**: 3 columns
- **Tablet (768px+)**: 4 columns  
- **Laptop (1024px+)**: 5 columns
- **Desktop (1440px+)**: 6 columns
- **Ultrawide (1920px+)**: 8+ columns

### Settings & Customization
- Easy-to-use settings panel
- Custom website addition with preview
- Background search term customization
- Reset to defaults option

## 📦 Installation

### Prerequisites
1. **Unsplash API Key** (Free)
   - Go to [unsplash.com/developers](https://unsplash.com/developers)
   - Create a new application
   - Copy your Access Key

2. **Screenshot API Key** (Optional)
   - Go to [screenshotmachine.com](https://screenshotmachine.com) or similar service
   - Sign up for free tier (100 screenshots/month)
   - Copy your API key

### Setup Steps
1. **Download the Extension**
   - Clone or download this repository
   - Extract to a folder on your computer

2. **Configure API Keys**
   - Open `script.js`
   - Replace `YOUR_UNSPLASH_ACCESS_KEY_HERE` with your Unsplash API key
   - Replace `YOUR_SCREENSHOT_API_KEY_HERE` with your screenshot API key (optional)

3. **Add Extension Icons** (Optional)
   - Add `icon16.png`, `icon48.png`, and `icon128.png` to the `/icons/` folder
   - Or remove the icons section from `manifest.json`

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the extension folder
   - The extension will now replace your new tab page!

## 🎯 Usage

### Basic Usage
- Open a new tab to see your custom homepage
- Click on any website to open it in a new tab
- Press **S** to open settings
- Press **R** to refresh the background
- Press **Escape** to close modals

### Adding Websites
1. Click the settings gear (⚙️) in the top right
2. Fill in the website details:
   - **URL**: Full website URL (include https://)
   - **Name**: Display name for the website
   - **Description**: Short description (optional)
   - **Category**: Choose existing or create custom category
3. **Preview**: Enter URL and click the preview box to see the website
4. **Capture**: Click "📸 Capture Screenshot" when satisfied with the preview
5. **Add**: Click "Add Website" to save

### Customizing Backgrounds
1. Open settings
2. Change the "Unsplash Search Term"
3. Popular terms: `nature`, `abstract`, `minimal`, `ocean`, `mountains`, `city`, `space`
4. Click "🔄 Refresh Background" to see immediate changes

## 🛠️ Technical Details

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── index.html            # Main homepage HTML
├── styles.css            # All styling and responsive design
├── script.js             # Core functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Technologies
- **Chrome Extension Manifest V3**
- **Unsplash API** for background images
- **Screenshot APIs** for website previews
- **html2canvas** for local screenshot capture
- **CSS Grid** with responsive breakpoints
- **Chrome Storage API** for settings persistence

### Responsive Design
The extension uses CSS Grid with automatic column calculation:

```css
/* Base: 3 columns */
.websites-grid {
    grid-template-columns: repeat(3, 1fr);
}

/* Responsive breakpoints */
@media (min-width: 768px) { /* 4 columns */ }
@media (min-width: 1024px) { /* 5 columns */ }
@media (min-width: 1440px) { /* 6 columns */ }
@media (min-width: 1920px) { /* 8 columns */ }
```

### Screenshot Services
The extension supports multiple screenshot services:
1. **ScreenshotMachine** (Primary)
2. **HTMLCSStoImage** (Fallback)
3. **ApiFlash** (Fallback)
4. **Local Capture** (iframe + html2canvas)
5. **Favicon Fallback** (Final fallback)

## 🔧 Configuration

### API Configuration
Edit these values in `script.js`:

```javascript
const CONFIG = {
    UNSPLASH_ACCESS_KEY: 'your_unsplash_key_here',
    SCREENSHOT_API_KEY: 'your_screenshot_key_here',
    DEFAULT_SEARCH_TERMS: ['nature', 'landscape', 'abstract'],
    // ... other settings
};
```

### Default Websites
You can modify the default websites in `script.js`:

```javascript
const DEFAULT_WEBSITES = {
    social: [
        { name: 'Twitter', desc: 'Social networking', url: 'https://twitter.com' },
        // ... add more
    ],
    // ... other categories
};
```

## 🐛 Troubleshooting

### Common Issues

**Background images not loading**
- Check that your Unsplash API key is correct
- Ensure you have internet connection
- Try different search terms

**Screenshots not working**
- Some websites block iframe embedding
- Try using different screenshot API services
- Check that API keys are configured correctly

**Extension not loading**
- Ensure all files are in the correct structure
- Check Chrome Extensions page for error messages
- Verify manifest.json syntax

**Preview not working**
- Many sites block iframe embedding for security
- The extension will fallback to API screenshots
- Some sites may require API capture only

### Permission Issues
If you see CORS errors:
1. The extension includes necessary host permissions
2. Some APIs may require additional configuration
3. Try different screenshot services if one fails

## 🔒 Security & Privacy

- **Local Storage**: Settings stored in Chrome's sync storage
- **No Data Collection**: Extension doesn't collect or transmit personal data
- **API Keys**: Stored locally, never transmitted except to respective APIs
- **Screenshot Privacy**: Screenshots are captured and stored locally
- **HTTPS Only**: All external requests use HTTPS

## 📈 Performance

- **Lazy Loading**: Website images load as needed
- **Caching**: Screenshots cached locally to reduce API calls
- **Responsive**: Grid automatically adapts to screen size
- **Optimized**: Minimal resource usage, fast loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Tips
- Test with different screen sizes
- Verify all keyboard shortcuts work
- Test with and without API keys
- Check error handling for failed API calls

## 📄 License

This project is open source. Feel free to modify and distribute.

## 🙏 Credits

- **Unsplash** for beautiful background images
- **Chrome Extensions API** for the platform
- **html2canvas** for local screenshot functionality
- **Various Screenshot APIs** for website capture

---

**Enjoy your new custom homepage! 🎉**