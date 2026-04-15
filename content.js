// Content script - Detects and converts timestamps on webpages

// TIMEZONE_CONFIG - same as popup.js
const TIMEZONE_CONFIG = {
    IST: { zone: 'Asia/Kolkata', emoji: '🇮🇳', label: 'IST', hasDST: false },
    GMT: { zone: 'UTC', emoji: '🌐', label: 'GMT', hasDST: false },
    PST: { zone: 'America/Los_Angeles', emoji: '🇺🇸', label: 'PST/PDT', hasDST: true, dstName: 'PDT', standardName: 'PST' },
    EST: { zone: 'America/New_York', emoji: '🇺🇸', label: 'EST/EDT', hasDST: true, dstName: 'EDT', standardName: 'EST' },
    CST: { zone: 'America/Chicago', emoji: '🇺🇸', label: 'CST/CDT', hasDST: true, dstName: 'CDT', standardName: 'CST' },
    JST: { zone: 'Asia/Tokyo', emoji: '🇯🇵', label: 'JST', hasDST: false },
    AEST: { zone: 'Australia/Sydney', emoji: '🇦🇺', label: 'AEST/AEDT', hasDST: true, dstName: 'AEDT', standardName: 'AEST' },
    CST_CHINA: { zone: 'Asia/Shanghai', emoji: '🇨🇳', label: 'CST (Shanghai)', hasDST: false },
    CET: { zone: 'Europe/Paris', emoji: '🇪🇺', label: 'CET/CEST', hasDST: true, dstName: 'CEST', standardName: 'CET' }
};

// Default settings
const DEFAULT_SETTINGS = {
    tooltipTimezones: ['IST', 'GMT'],
    timestampMode: 'milliseconds',
    doubleClickEnabled: true
};

// User settings
let userSettings = DEFAULT_SETTINGS;

// Load user settings
chrome.storage.sync.get('timezoneSettings', (data) => {
    if (data.timezoneSettings) {
        userSettings = data.timezoneSettings;
    }
});

// Listen for settings updates
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.timezoneSettings) {
        userSettings = changes.timezoneSettings.newValue;
    }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "convertTimestamp") {
        showTimestampPopup(request.timestamp);
    }
});

// Auto-detect timestamps on page load
let currentTooltip = null;

// Add double-click listener to detect timestamps
document.addEventListener('dblclick', function(e) {
    // Skip if double-click conversion is disabled
    if (userSettings.doubleClickEnabled === false) return;

    let selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    // Check if the character immediately before the selection is a minus sign.
    // Browsers typically select only the digits on double-click, so "-86400"
    // would select "86400". We attempt multiple strategies to recover the "-".
    if (/^\d+$/.test(selectedText)) {
        let foundMinus = false;

        // Strategy 1: Check the full text of the containing text node directly.
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const container = range.startContainer;
            const offset = range.startOffset;

            if (container.nodeType === Node.TEXT_NODE && offset > 0) {
                const charBefore = container.textContent.charAt(offset - 1);
                if (/^[-\u2212\u2013]$/.test(charBefore)) {
                    foundMinus = true;
                }
            }
        }

        // Strategy 2: Walk the DOM backwards via getCharBeforeSelection()
        if (!foundMinus) {
            const charBefore = getCharBeforeSelection();
            if (charBefore && /^[-\u2212\u2013]$/.test(charBefore)) {
                foundMinus = true;
            }
        }

        if (foundMinus) {
            selectedText = '-' + selectedText;
        }
    }

    const detected = detectTimestampFormat(selectedText);
    if (detected) {
        e.preventDefault();
        showQuickTooltip(selectedText, e.pageX, e.pageY);
    }
});

// Show quick tooltip (IST and GMT only)
function showQuickTooltip(timestampStr, x, y) {
    const detected = detectTimestampFormat(timestampStr);
    
    if (!detected) return;
    
    const date = new Date(detected.value);
    if (isNaN(date.getTime())) return;
    
    // Remove existing tooltip
    if (currentTooltip) {
        currentTooltip.remove();
    }
    
    // Build tooltip HTML based on user settings
    let tooltipRows = '';
    userSettings.tooltipTimezones.forEach(tzCode => {
        let config = TIMEZONE_CONFIG[tzCode];
        
        // Check if it's a custom timezone
        if (!config && tzCode.startsWith('CUSTOM_')) {
            const customTz = (userSettings.customTimezones || []).find(tz => tz.id === tzCode);
            if (customTz) {
                config = { zone: customTz.zone, emoji: '🌐', label: customTz.label };
            }
        }
        
        if (!config) return;
        
        const time = convertToTimezone(date, config.zone);
        tooltipRows += `
            <div class="tz-tooltip-row">
                <span class="tz-tooltip-label">${config.emoji} ${config.label}</span>
                <span class="tz-tooltip-value">${formatTime(time)} ${formatDate(time)}</span>
            </div>
        `;
    });
    
    // Create quick tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tz-quick-tooltip';
    tooltip.innerHTML = `
        <div class="tz-tooltip-content">
            ${tooltipRows}
        </div>
    `;
    
    // Position tooltip near cursor with overflow detection
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '9999999';
    tooltip.style.visibility = 'hidden'; // hide while measuring
    tooltip.style.left = '0px';
    tooltip.style.top = '0px';
    
    document.body.appendChild(tooltip);
    
    // Force layout so we get accurate dimensions
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // x, y are page coordinates (e.pageX, e.pageY)
    // Convert to viewport-relative for overflow checks
    const cursorViewportX = x - scrollX;
    const cursorViewportY = y - scrollY;
    
    // Horizontal: prefer right of cursor, flip to left if it overflows viewport
    let left;
    if (cursorViewportX + 15 + tooltipWidth > viewportWidth) {
        // Overflows right → try left of cursor
        left = x - tooltipWidth - 15;
        // If flipping left also overflows (tooltip wider than space on both sides),
        // pin to the right edge of the viewport
        if (left < scrollX) {
            left = scrollX + viewportWidth - tooltipWidth - 5;
        }
    } else {
        left = x + 15;
    }
    // Final clamp: never go off the left edge
    if (left < scrollX + 5) {
        left = scrollX + 5;
    }
    
    // Vertical: prefer above cursor, flip below if it overflows
    let top;
    if (cursorViewportY - tooltipHeight - 10 < 0) {
        // Overflows top → show below cursor
        top = y + 20;
    } else {
        top = y - tooltipHeight - 10;
    }
    // Clamp so it never goes off the bottom
    if (top + tooltipHeight > scrollY + viewportHeight) {
        top = scrollY + viewportHeight - tooltipHeight - 5;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.visibility = 'visible';
    
    currentTooltip = tooltip;
    
    // Auto-hide after 5 seconds or on click
    setTimeout(() => {
        if (currentTooltip === tooltip) {
            tooltip.remove();
            currentTooltip = null;
        }
    }, 5000);
    
    tooltip.addEventListener('click', () => {
        tooltip.remove();
        currentTooltip = null;
    });
    
    // Hide on any click outside
    document.addEventListener('click', function hideTooltip(e) {
        if (!tooltip.contains(e.target)) {
            tooltip.remove();
            currentTooltip = null;
            document.removeEventListener('click', hideTooltip);
        }
    });
}

// Get the character immediately before the current selection.
// Walks back through text nodes and sibling elements to find it.
function getCharBeforeSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;

    // Case 1: Selection starts mid-way through a text node — just look back one char
    if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
        return startContainer.textContent.charAt(startOffset - 1);
    }

    // Case 2: Selection is at the start of a text node (offset 0), or inside an element node.
    // Walk backwards through the DOM to find the preceding character.
    let node = startContainer;

    // If we're in an element node, step into the child before startOffset
    if (node.nodeType === Node.ELEMENT_NODE && startOffset > 0) {
        node = node.childNodes[startOffset - 1];
        // Walk to the last text content of this node
        while (node && node.lastChild) {
            node = node.lastChild;
        }
        if (node && node.nodeType === Node.TEXT_NODE && node.textContent.length > 0) {
            return node.textContent.charAt(node.textContent.length - 1);
        }
    }

    // Walk to the previous sibling (or parent's previous sibling)
    let current = startContainer;
    while (current) {
        if (current.previousSibling) {
            let prev = current.previousSibling;
            // Drill into the last text content of the previous sibling
            while (prev.lastChild) {
                prev = prev.lastChild;
            }
            if (prev.nodeType === Node.TEXT_NODE && prev.textContent.length > 0) {
                return prev.textContent.charAt(prev.textContent.length - 1);
            }
            // If previous sibling had no text, keep walking
            current = prev;
        } else {
            // Go up to parent and try its previous sibling
            current = current.parentNode;
            if (!current || current === document.body) return null;
        }
    }

    return null;
}

// Detect timestamp format
function detectTimestampFormat(input) {
    const trimmed = input.trim();
    // Accept pure numeric strings with optional leading minus — reject IPs, alphanumeric, etc.
    if (!/^-?\d+$/.test(trimmed)) return null;

    const num = Number(trimmed);
    if (isNaN(num) || num === 0) return null;

    const mode = userSettings.timestampMode || 'milliseconds';

    if (mode === 'seconds') {
        return { type: 'seconds', value: num * 1000, original: input };
    } else {
        return { type: 'milliseconds', value: num, original: input };
    }
}

// Convert to timezone
function convertToTimezone(date, zone) {
    try {
        // Format the date in the target timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const parts = formatter.formatToParts(date);
        const dateParts = {};
        parts.forEach(part => {
            dateParts[part.type] = part.value;
        });
        
        // Create a new date object with the formatted parts
        return new Date(
            `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
        );
    } catch (e) {
        return date;
    }
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Check if DST
function isDST(date) {
    try {
        const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            timeZoneName: 'short'
        }).format(date);
        
        return formatted.includes('DT') || formatted.includes('Daylight');
    } catch (e) {
        return false;
    }
}

// Show popup with converted times
function showTimestampPopup(timestampStr) {
    const detected = detectTimestampFormat(timestampStr);
    
    if (!detected) {
        showErrorPopup('Invalid timestamp format. Please select a 10-digit (seconds) or 13-digit (milliseconds) number.');
        return;
    }
    
    const date = new Date(detected.value);
    
    if (isNaN(date.getTime())) {
        showErrorPopup('Invalid timestamp - could not convert to date');
        return;
    }
    
    // Build timezone cards based on user's display settings
    let timezoneCards = '';
    userSettings.displayTimezones.forEach(tzCode => {
        const config = TIMEZONE_CONFIG[tzCode];
        if (!config) return;
        
        const time = convertToTimezone(date, config.zone);
        const isDSTActive = config.hasDST && isDST(date);
        
        timezoneCards += `
            <div class="tz-result-card">
                <div class="tz-result-label">${config.emoji} ${config.label}</div>
                <div class="tz-result-time">${formatTime(time)}</div>
                <div class="tz-result-date">${formatDate(time)}</div>
                ${config.hasDST ? `<div class="tz-dst-badge">${isDSTActive ? '☀️ Daylight' : '🌙 Standard'}</div>` : ''}
            </div>
        `;
    });
    
    // Create popup HTML
    const popupHTML = `
        <div class="tz-converter-popup">
            <div class="tz-popup-header">
                <span>🌍 Timestamp Conversion</span>
                <button class="tz-close-btn">×</button>
            </div>
            <div class="tz-popup-body">
                <div class="tz-info-row">
                    <span class="tz-info-label">Input:</span>
                    <span class="tz-info-value">${detected.original}</span>
                </div>
                
                <div class="tz-result-section">
                    ${timezoneCards}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing popup if any
    const existingPopup = document.getElementById('tz-converter-popup-container');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create and add popup
    const popupContainer = document.createElement('div');
    popupContainer.id = 'tz-converter-popup-container';
    popupContainer.innerHTML = popupHTML;
    document.body.appendChild(popupContainer);
    
    // Add close button listener
    const closeBtn = popupContainer.querySelector('.tz-close-btn');
    closeBtn.addEventListener('click', () => {
        popupContainer.remove();
    });
    
    // Close on outside click
    popupContainer.addEventListener('click', (e) => {
        if (e.target === popupContainer) {
            popupContainer.remove();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            popupContainer.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Show error popup
function showErrorPopup(message) {
    const errorHTML = `
        <div class="tz-converter-popup tz-error">
            <div class="tz-popup-header">
                <span>⚠️ Invalid Timestamp</span>
                <button class="tz-close-btn">×</button>
            </div>
            <div class="tz-popup-body">
                <p>${message}</p>
                <div class="tz-help-text">
                    Valid formats:<br>
                    • 10 digits (seconds): 1737194785<br>
                    • 13 digits (milliseconds): 1737194785432
                </div>
            </div>
        </div>
    `;
    
    const existingPopup = document.getElementById('tz-converter-popup-container');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    const popupContainer = document.createElement('div');
    popupContainer.id = 'tz-converter-popup-container';
    popupContainer.innerHTML = errorHTML;
    document.body.appendChild(popupContainer);
    
    const closeBtn = popupContainer.querySelector('.tz-close-btn');
    closeBtn.addEventListener('click', () => {
        popupContainer.remove();
    });
    
    popupContainer.addEventListener('click', (e) => {
        if (e.target === popupContainer) {
            popupContainer.remove();
        }
    });
}
