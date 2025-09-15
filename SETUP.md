# Setup Instructions

## Quick Start

1. **Get API Keys** (5 minutes)
   - Unsplash: Go to [unsplash.com/developers](https://unsplash.com/developers)
   - Screenshot: Go to [screenshotmachine.com](https://screenshotmachine.com) (optional but recommended)

2. **Configure Extension**
   - Open `script.js`
   - Replace `YOUR_UNSPLASH_ACCESS_KEY_HERE` with your key
   - Replace `YOUR_SCREENSHOT_API_KEY_HERE` with your key (optional)

3. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this folder

4. **Open New Tab**
   - Your custom homepage will appear!
   - Press 'S' for settings

## Dealing with Screenshot Errors

### "Could not capture screenshot" Error
This is **completely normal**! Many websites (like Google, Facebook, Twitter) block embedding for security reasons.

**What to do:**
1. **Don't panic** - this is expected behavior
2. Click the **"📸 Get Screenshot"** button that appears
3. The extension will use API services to capture the website
4. If that fails, click **"🌐 Use Favicon"** for a clean icon

### Screenshot Solutions (in order of quality):
1. **Best**: Configure screenshot API (ScreenshotMachine, etc.)
2. **Good**: Use the automatic API fallback
3. **Okay**: Use favicons (Google's service)
4. **Manual**: Upload your own images

## API Key Setup

### Unsplash API (Required for backgrounds)
1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Click "New Application"
3. Accept terms and fill out form
4. Copy your "Access Key"
5. Paste into `script.js` where it says `YOUR_UNSPLASH_ACCESS_KEY_HERE`

### Screenshot API (Optional - for better website previews)
1. Go to [screenshotmachine.com](https://screenshotmachine.com)
2. Sign up for free account (100 screenshots/month)
3. Get your API key from dashboard
4. Paste into `script.js` where it says `YOUR_SCREENSHOT_API_KEY_HERE`

**Other Screenshot Services:**
- [ApiFlash](https://apiflash.com) - 100 free screenshots/month
- [HTMLCSStoImage](https://htmlcsstoimage.com) - 50 free screenshots/month
- [Urlbox](https://urlbox.io) - 1000 free screenshots/month

## Without API Keys
The extension works without API keys but with limitations:
- **No Unsplash**: Will use gradient backgrounds instead
- **No Screenshots**: Will use favicons as website icons
- **Still Functional**: All other features work perfectly

## Troubleshooting

**Extension won't load?**
- Check that all files are in the same folder
- Make sure you selected the correct folder in Chrome
- Look for errors in Chrome Extensions page

**No background images?**
- Check your Unsplash API key is correct
- Try opening Developer Tools (F12) and look for errors
- Test with different search terms in settings

**Screenshots not working?**
- This is normal for many websites (Google, Facebook, etc.)
- Use the "📸 Get Screenshot" button for API capture
- Fall back to "🌐 Use Favicon" for clean icons
- Some APIs work better than others - try different services

**Preview shows "Website blocks preview"?**
- This is expected and normal for security reasons
- Click "📸 Get Screenshot" to use API services
- The extension handles this gracefully

## Tips for Best Results

1. **Get a screenshot API key** - Makes adding websites much smoother
2. **Use HTTPS URLs** - Always include `https://` in website URLs
3. **Try different screenshot services** - If one fails, try another
4. **Favicons work great** - Don't hesitate to use them for clean, recognizable icons
5. **Be patient** - Screenshot APIs can take 5-10 seconds to process