// Content script for detecting images and popups
(function() {
  'use strict';
  
  const SCAN_DELAY = 2000; // Debounce delay
  let scanTimer = null;
  let scannedElements = new WeakSet();
  
  // Initialize
  console.log('CyberShield content script loaded');
  
  // Scan page on load
  setTimeout(() => {
    scanPage();
  }, 1000);
  
  // Monitor DOM changes
  const observer = new MutationObserver((mutations) => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      scanPage();
    }, SCAN_DELAY);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Scan page for threats
  function scanPage() {
    scanImages();
    scanPopups();
  }
  
  // Scan images
  function scanImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      if (scannedElements.has(img)) return;
      if (!img.complete || !img.naturalWidth) return;
      
      // Skip very small images (likely icons)
      if (img.naturalWidth < 50 || img.naturalHeight < 50) return;
      
      scannedElements.add(img);
      
      // Create thumbnail
      createThumbnail(img).then(thumbnail => {
        if (!thumbnail) return;
        
        // Send to service worker for scanning
        chrome.runtime.sendMessage({
          type: 'SCAN_IMAGE',
          data: {
            src: img.src,
            thumbnail: thumbnail,
            width: img.naturalWidth,
            height: img.naturalHeight,
            mime: getMimeType(img.src)
          }
        }, response => {
          if (response && response.action === 'quarantine') {
            blockImage(img, response);
          }
        });
      });
    });
  }
  
  // Create thumbnail from image
  async function createThumbnail(img, maxSize = 400) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate thumbnail size
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      return null;
    }
  }
  
  // Get MIME type from URL
  function getMimeType(url) {
    const ext = url.split('.').pop().split('?')[0].toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'image/unknown';
  }
  
  // Block malicious image
  function blockImage(img, response) {
    // Create warning overlay
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: relative;
      display: inline-block;
      width: ${img.width}px;
      height: ${img.height}px;
      background: #FFE5E5;
      border: 2px solid #E53E3E;
    `;
    
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #E53E3E;
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      z-index: 1000;
    `;
    warning.textContent = '⚠️ Blocked by CyberShield';
    
    // Replace image
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(warning);
    img.style.display = 'none';
  }
  
  // Scan for suspicious popups
  function scanPopups() {
    // Look for modal/overlay elements
    const popups = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"], [class*="dialog"]');
    
    popups.forEach(popup => {
      if (scannedElements.has(popup)) return;
      if (!isVisible(popup)) return;
      
      scannedElements.add(popup);
      
      // Extract text and form fields
      const text = extractText(popup);
      const fields = extractFormFields(popup);
      
      // Check if it looks suspicious
      if (text.length < 20) return; // Too short
      if (fields.length === 0 && !hasSuspiciousText(text)) return;
      
      // Send to service worker
      chrome.runtime.sendMessage({
        type: 'SCAN_POPUP',
        data: {
          text: text,
          fields: fields
        }
      }, response => {
        if (response && response.action === 'quarantine') {
          blockPopup(popup, response);
        }
      });
    });
  }
  
  // Check if element is visible
  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }
  
  // Extract visible text
  function extractText(element) {
    const clone = element.cloneNode(true);
    // Remove script and style tags
    clone.querySelectorAll('script, style').forEach(el => el.remove());
    return clone.textContent.trim().slice(0, 500); // Max 500 chars
  }
  
  // Extract form field labels
  function extractFormFields(element) {
    const fields = [];
    const inputs = element.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const type = input.type || input.tagName.toLowerCase();
      const name = input.name || input.id || input.placeholder || '';
      fields.push(type + (name ? ':' + name : ''));
    });
    
    return fields;
  }
  
  // Check for suspicious text patterns
  function hasSuspiciousText(text) {
    const suspicious = [
      /urgent/i,
      /verify/i,
      /suspended/i,
      /account.*locked/i,
      /credit\s*card/i,
      /social\s*security/i,
      /aadhar/i,
      /pan\s*card/i,
      /otp/i,
      /cvv/i
    ];
    
    return suspicious.some(pattern => pattern.test(text));
  }
  
  // Block malicious popup
  function blockPopup(popup, response) {
    // Create warning overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(229, 62, 62, 0.95);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; max-width: 500px; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🛡️</div>
        <h1 style="font-size: 32px; margin-bottom: 16px;">Threat Blocked</h1>
        <p style="font-size: 18px; margin-bottom: 24px;">
          CyberShield has detected and blocked a potentially malicious popup on this page.
        </p>
        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 32px;">
          Confidence: ${(response.confidence * 100).toFixed(0)}% | 
          Severity: ${response.severity}/10
        </p>
        <button id="cybershield-close" style="
          background: white;
          color: #E53E3E;
          border: none;
          padding: 12px 32px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        ">Close Warning</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Hide original popup
    popup.style.display = 'none';
    
    // Close button handler
    document.getElementById('cybershield-close').addEventListener('click', () => {
      overlay.remove();
    });
  }
  
  // Listen for scan requests from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCAN_NOW') {
      scanPage();
      sendResponse({ success: true });
    }
  });
  
})();
