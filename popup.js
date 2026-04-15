// Timezone Configuration with Daylight Saving Time support
const TIMEZONE_CONFIG = {
    IST: {
        offset: 5.5, // Fixed offset (UTC+5:30)
        hasDST: false,
        name: 'India Standard Time',
        zone: 'Asia/Kolkata',
        emoji: '🇮🇳',
        label: 'IST (India)'
    },
    GMT: {
        offset: 0, // Fixed offset (UTC+0)
        hasDST: false,
        name: 'Greenwich Mean Time',
        zone: 'UTC',
        emoji: '🌐',
        label: 'GMT/UTC'
    },
    PST: {
        offset: -8, // Standard offset (UTC-8)
        hasDST: true,
        name: 'Pacific Standard/Daylight Time',
        zone: 'America/Los_Angeles',
        dstName: 'PDT',
        standardName: 'PST',
        emoji: '🇺🇸',
        label: 'PST/PDT (Pacific)'
    },
    EST: {
        offset: -5, // Standard offset (UTC-5)
        hasDST: true,
        name: 'Eastern Standard/Daylight Time',
        zone: 'America/New_York',
        dstName: 'EDT',
        standardName: 'EST',
        emoji: '🇺🇸',
        label: 'EST/EDT (Eastern)'
    },
    CST: {
        offset: -6, // Standard offset (UTC-6)
        hasDST: true,
        name: 'Central Standard/Daylight Time',
        zone: 'America/Chicago',
        dstName: 'CDT',
        standardName: 'CST',
        emoji: '🇺🇸',
        label: 'CST/CDT (Central)'
    },
    JST: {
        offset: 9, // Fixed offset (UTC+9)
        hasDST: false,
        name: 'Japan Standard Time',
        zone: 'Asia/Tokyo',
        emoji: '🇯🇵',
        label: 'JST (Japan)'
    },
    AEST: {
        offset: 10, // Standard offset (UTC+10)
        hasDST: true,
        name: 'Australian Eastern Standard/Daylight Time',
        zone: 'Australia/Sydney',
        dstName: 'AEDT',
        standardName: 'AEST',
        emoji: '🇦🇺',
        label: 'AEST/AEDT (Australia)'
    },
    CST_CHINA: {
        offset: 8, // Fixed offset (UTC+8)
        hasDST: false,
        name: 'China Standard Time',
        zone: 'Asia/Shanghai',
        emoji: '🇨🇳',
        label: 'CST (Shanghai)'
    },
    CET: {
        offset: 1, // Standard offset (UTC+1)
        hasDST: true,
        name: 'Central European Time',
        zone: 'Europe/Paris',
        dstName: 'CEST',
        standardName: 'CET',
        emoji: '🇪🇺',
        label: 'CET/CEST (Europe)'
    }
};

// Default settings
const DEFAULT_SETTINGS = {
    primaryTimezone: 'IST',
    displayTimezones: ['IST', 'GMT', 'PST'],
    tooltipTimezones: ['IST', 'GMT'],
    copyDateFormat: 'default', // default, iso, iso-space, us, eu, compact
    customTimezones: [], // Array of { id, zone, label }
    timestampMode: 'milliseconds', // 'seconds' or 'milliseconds'
    doubleClickEnabled: true // Enable/disable double-click timestamp conversion on pages
};

// Date format configurations
const DATE_FORMATS = {
    'default': {
        label: 'Default (Sat, Feb 21, 2026 17:53:48 IST)',
        example: 'Sat, Feb 21, 2026 17:53:48 IST',
        format: (date, abbr) => `${formatDate(date)} ${formatTime(date)} ${abbr}`
    },
    'iso': {
        label: 'ISO 8601 (2026-02-21T17:53:48)',
        example: '2026-02-21T17:53:48',
        format: (date, abbr) => formatDateCustom(date, 'yyyy-MM-ddTHH:mm:ss')
    },
    'iso-ms-tz': {
        label: 'ISO with ms+offset (2026-02-21T17:53:48.398+05:30)',
        example: '2026-02-21T17:53:48.398+05:30',
        format: (date, abbr, zone) => formatISOWithOffset(date, abbr, zone)
    },
    'iso-space': {
        label: 'ISO with space (2026-02-21 17:53:48)',
        example: '2026-02-21 17:53:48',
        format: (date, abbr) => formatDateCustom(date, 'yyyy-MM-dd HH:mm:ss')
    },
    'iso-tz': {
        label: 'ISO with TZ (2026-02-21 17:53:48 IST)',
        example: '2026-02-21 17:53:48 IST',
        format: (date, abbr) => `${formatDateCustom(date, 'yyyy-MM-dd HH:mm:ss')} ${abbr}`
    },
    'us': {
        label: 'US Format (02/21/2026 05:53:48 PM)',
        example: '02/21/2026 05:53:48 PM',
        format: (date, abbr) => formatDateCustom(date, 'MM/dd/yyyy hh:mm:ss A')
    },
    'eu': {
        label: 'EU Format (21/02/2026 17:53:48)',
        example: '21/02/2026 17:53:48',
        format: (date, abbr) => formatDateCustom(date, 'dd/MM/yyyy HH:mm:ss')
    },
    'compact': {
        label: 'Compact (20260221_175348)',
        example: '20260221_175348',
        format: (date, abbr) => formatDateCustom(date, 'yyyyMMdd_HHmmss')
    },
    'readable': {
        label: 'Readable (21 Feb 2026, 17:53:48)',
        example: '21 Feb 2026, 17:53:48',
        format: (date, abbr) => formatDateCustom(date, 'dd MMM yyyy, HH:mm:ss')
    },
    'date-only': {
        label: 'Date Only (2026-02-21)',
        example: '2026-02-21',
        format: (date, abbr) => formatDateCustom(date, 'yyyy-MM-dd')
    },
    'time-only': {
        label: 'Time Only (17:53:48)',
        example: '17:53:48',
        format: (date, abbr) => formatDateCustom(date, 'HH:mm:ss')
    }
};

// Custom date formatter
function formatDateCustom(date, pattern) {
    const pad = (n, width = 2) => String(n).padStart(width, '0');
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return pattern
        .replace('yyyy', year)
        .replace('MM', pad(month))
        .replace('MMM', monthNames[month - 1])
        .replace('dd', pad(day))
        .replace('HH', pad(hours24))
        .replace('hh', pad(hours12))
        .replace('mm', pad(minutes))
        .replace('ss', pad(seconds))
        .replace('A', ampm);
}

// Format ISO with milliseconds and timezone offset (yyyy-MM-dd'T'HH:mm:ss.SSSXXX)
function formatISOWithOffset(date, abbr, zone) {
    const pad = (n, width = 2) => String(n).padStart(width, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    
    // Calculate timezone offset using the IANA zone name
    let offsetMinutes = 0;
    
    if (zone) {
        try {
            // Use the IANA zone directly to calculate offset
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: zone }));
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            offsetMinutes = (tzDate - utcDate) / (1000 * 60);
        } catch (e) {
            // Fallback: try to get offset from built-in config
            const tzKey = abbr.replace(/PDT|PST/, 'PST')
                              .replace(/EDT|EST/, 'EST')
                              .replace(/CDT|CST(?!_)/, 'CST')
                              .replace(/AEDT|AEST/, 'AEST')
                              .replace(/CEST|CET/, 'CET');
            
            if (TIMEZONE_CONFIG[tzKey]) {
                const config = TIMEZONE_CONFIG[tzKey];
                let offsetHours = config.offset;
                if (config.hasDST && isDST(date, tzKey)) {
                    offsetHours += 1;
                }
                offsetMinutes = offsetHours * 60;
            } else {
                // Last resort: use local timezone
                offsetMinutes = -date.getTimezoneOffset();
            }
        }
    } else {
        // No zone provided, use local timezone
        offsetMinutes = -date.getTimezoneOffset();
    }
    
    const offsetSign = offsetMinutes >= 0 ? '+' : '-';
    const offsetHrs = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const offsetMins = pad(Math.abs(offsetMinutes) % 60);
    const offset = `${offsetSign}${offsetHrs}:${offsetMins}`;
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offset}`;
}

// Format for clipboard based on user settings
function formatForClipboard(date, abbr, zone) {
    const formatKey = userSettings.copyDateFormat || 'default';
    const formatConfig = DATE_FORMATS[formatKey];
    return formatConfig ? formatConfig.format(date, abbr, zone) : DATE_FORMATS['default'].format(date, abbr, zone);
}

// Current user settings
let userSettings = { ...DEFAULT_SETTINGS };

// Check if Daylight Saving Time is active
function isDST(date, timezone) {
    const config = TIMEZONE_CONFIG[timezone];
    if (!config.hasDST) return false;

    try {
        const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: config.zone,
            timeZoneName: 'short'
        }).format(date);
        
        return formatted.includes('DT') || formatted.includes('Daylight');
    } catch (e) {
        return false;
    }
}

// Get timezone abbreviation
function getTimezoneAbbr(timezone, date) {
    const config = TIMEZONE_CONFIG[timezone];
    if (!config.hasDST) return timezone;
    
    return isDST(date, timezone) ? config.dstName : config.standardName;
}

// Convert date to specific timezone
function convertToTimezone(date, timezone) {
    const config = TIMEZONE_CONFIG[timezone];
    
    try {
        // Format the date in the target timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: config.zone,
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
        // Fallback to manual calculation
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const offset = config.hasDST && isDST(date, timezone) 
            ? (config.offset + 1) * 3600000 
            : config.offset * 3600000;
        return new Date(utc + offset);
    }
}

// Format time as HH:MM:SS
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
}

// Format date as Day, DD Mon YYYY
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Convert date to timezone by IANA zone name (for custom timezones)
function convertToTimezoneByZone(date, zone) {
    try {
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
        
        return new Date(
            `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
        );
    } catch (e) {
        return date;
    }
}

// Check if DST is active for a given IANA zone
function isDSTByZone(date, zone) {
    try {
        const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            timeZoneName: 'short'
        }).format(date);
        
        return formatted.includes('DT') || formatted.includes('Daylight') || formatted.includes('Summer');
    } catch (e) {
        return false;
    }
}

// Get timezone abbreviation for a given IANA zone
function getAbbreviationForZone(zone, date) {
    try {
        const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            timeZoneName: 'short'
        }).format(date);
        
        // Extract the abbreviation (last word)
        return formatted.split(' ').pop();
    } catch (e) {
        return zone.split('/').pop().replace(/_/g, ' ');
    }
}

// Update current time displays
function updateCurrentTimes() {
    const now = new Date();
    
    // Update live epoch timestamp (milliseconds)
    const epochMillis = now.getTime();
    const epochSeconds = Math.floor(epochMillis / 1000);
    document.getElementById('live-epoch-millis').textContent = epochMillis;
    document.getElementById('live-epoch-seconds').textContent = epochSeconds;
    
    // Get display container
    const timeGrid = document.querySelector('.time-display-grid');
    if (!timeGrid) return;
    
    // Sort display timezones to show primary first
    const sortedTimezones = [...userSettings.displayTimezones].sort((a, b) => {
        if (a === userSettings.primaryTimezone) return -1;
        if (b === userSettings.primaryTimezone) return 1;
        return 0;
    });
    
    // Check if we need to rebuild the grid (timezone list changed)
    const existingCards = timeGrid.querySelectorAll('.time-card');
    const needsRebuild = existingCards.length !== sortedTimezones.length || 
        Array.from(existingCards).some((card, index) => {
            const btn = card.querySelector('.card-copy-btn');
            return btn && btn.getAttribute('data-timezone') !== sortedTimezones[index];
        });
    
    if (needsRebuild) {
        // Full rebuild needed - clear and recreate
        timeGrid.innerHTML = '';
        buildTimeCards(timeGrid, sortedTimezones, now);
    } else {
        // Just update the time values
        sortedTimezones.forEach((tzCode, index) => {
            const card = existingCards[index];
            if (!card) return;
            
            let config = TIMEZONE_CONFIG[tzCode];
            let isCustom = false;
            
            if (!config && tzCode.startsWith('CUSTOM_')) {
                const customTz = (userSettings.customTimezones || []).find(tz => tz.id === tzCode);
                if (customTz) {
                    config = {
                        zone: customTz.zone,
                        emoji: '🌐',
                        label: customTz.label,
                        hasDST: false
                    };
                    isCustom = true;
                }
            }
            
            if (!config) return;
            
            const time = isCustom ? convertToTimezoneByZone(now, config.zone) : convertToTimezone(now, tzCode);
            const abbr = isCustom ? getAbbreviationForZone(config.zone, now) : (config.hasDST ? getTimezoneAbbr(tzCode, now) : tzCode);
            const ianaZone = isCustom ? config.zone : (TIMEZONE_CONFIG[tzCode] ? TIMEZONE_CONFIG[tzCode].zone : 'UTC');
            
            // Update only the changing elements
            const timeValue = card.querySelector('.time-value');
            const dateValue = card.querySelector('.date-value');
            const copyBtn = card.querySelector('.card-copy-btn');
            
            if (timeValue) timeValue.textContent = formatTime(time);
            if (dateValue) dateValue.textContent = formatDate(time);
            if (copyBtn) {
                copyBtn.setAttribute('data-timestamp', time.getTime());
                copyBtn.setAttribute('data-abbr', abbr);
                copyBtn.setAttribute('data-zone', ianaZone);
            }
        });
    }
}

// Build time cards (called on initial load or when timezone list changes)
function buildTimeCards(timeGrid, sortedTimezones, now) {
    sortedTimezones.forEach(tzCode => {
        let config = TIMEZONE_CONFIG[tzCode];
        let isCustom = false;
        
        // Check if it's a custom timezone
        if (!config && tzCode.startsWith('CUSTOM_')) {
            const customTz = (userSettings.customTimezones || []).find(tz => tz.id === tzCode);
            if (customTz) {
                config = {
                    zone: customTz.zone,
                    emoji: '🌐',
                    label: customTz.label,
                    hasDST: false
                };
                isCustom = true;
            }
        }
        
        if (!config) return;
        
        const time = isCustom ? convertToTimezoneByZone(now, config.zone) : convertToTimezone(now, tzCode);
        const isDSTActive = isCustom ? isDSTByZone(now, config.zone) : isDST(now, tzCode);
        const timeStr = formatTime(time);
        const dateStr = formatDate(time);
        const abbr = isCustom ? getAbbreviationForZone(config.zone, now) : (config.hasDST ? getTimezoneAbbr(tzCode, now) : tzCode);
        const isPrimary = tzCode === userSettings.primaryTimezone;
        
        // Determine CSS class for the card
        let cardClass = tzCode.toLowerCase();
        if (isCustom) {
            const customIndex = (userSettings.customTimezones || []).findIndex(tz => tz.id === tzCode);
            cardClass = `custom-tz-${(customIndex % 5) + 1}`;
        }
        
        // Get the IANA zone for the timezone
        const ianaZone = isCustom ? config.zone : (TIMEZONE_CONFIG[tzCode] ? TIMEZONE_CONFIG[tzCode].zone : 'UTC');
        
        // Create time card
        const card = document.createElement('div');
        card.className = `time-card ${cardClass}${isPrimary ? ' primary' : ''}`;
        
        card.innerHTML = `
            <button class="card-copy-btn" data-timezone="${tzCode}" data-timestamp="${time.getTime()}" data-abbr="${abbr}" data-zone="${ianaZone}"></button>
            ${isPrimary ? '<div class="primary-badge">⭐ Primary</div>' : ''}
            <div class="timezone-label">${config.emoji} ${config.label}</div>
            <div class="time-value">${timeStr}</div>
            <div class="date-value">${dateStr}</div>
            ${config.hasDST ? `<div class="dst-indicator ${isDSTActive ? 'active' : ''}">${isDSTActive ? '☀️ Daylight Saving Time' : '🌙 Standard Time'}</div>` : ''}
        `;
        
        timeGrid.appendChild(card);
    });
    
    // Add copy button listeners
    document.querySelectorAll('.card-copy-btn').forEach(btn => {
        btn.onclick = function() {
            const timestamp = parseInt(this.getAttribute('data-timestamp'));
            const abbr = this.getAttribute('data-abbr');
            const zone = this.getAttribute('data-zone');
            const date = new Date(timestamp);
            const formattedText = formatForClipboard(date, abbr, zone);
            const button = this;
            
            navigator.clipboard.writeText(formattedText).then(() => {
                // Add bounce animation
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 300);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        };
    });
}

// Validate and detect timestamp format
function detectTimestampFormat(input, mode) {
    const trimmed = input.trim();
    // Accept pure numeric strings with optional leading minus — reject IPs, alphanumeric, etc.
    if (!/^-?\d+$/.test(trimmed)) return null;

    const num = Number(trimmed);
    if (isNaN(num) || num === 0) return null;

    if (mode === 'seconds') {
        return { type: 'seconds', value: num * 1000, original: input };
    } else {
        return { type: 'milliseconds', value: num, original: input };
    }
}

// Convert timestamp to times
function convertTimestampToTimes(mode) {
    const input = document.getElementById('timestamp-input').value.trim();
    
    if (!input) {
        alert('Please enter a timestamp');
        return;
    }
    
    const detected = detectTimestampFormat(input, mode);
    
    if (!detected) {
        alert('Invalid timestamp format.\n\nPlease enter a numeric timestamp:\n- Positive for dates after Jan 1, 1970\n- Negative for dates before Jan 1, 1970\n\nExamples: 1737194785, -62135596800');
        return;
    }
    
    // Create date from timestamp
    const date = new Date(detected.value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        alert('Invalid timestamp - could not convert to date');
        return;
    }
    
    // Get result grid
    const resultGrid = document.querySelector('.timestamp-result-grid');
    if (!resultGrid) return;
    
    // Clear existing results
    resultGrid.innerHTML = '';
    
    // Convert to user's selected display timezones
    userSettings.displayTimezones.forEach((tzCode, index) => {
        let config = TIMEZONE_CONFIG[tzCode];
        let isCustom = false;
        let abbr = tzCode;
        
        // Check if it's a custom timezone (IDs start with CUSTOM_)
        if (!config && tzCode.startsWith('CUSTOM_')) {
            const customTz = (userSettings.customTimezones || []).find(tz => tz.id === tzCode);
            if (customTz) {
                isCustom = true;
                config = {
                    zone: customTz.zone,
                    label: customTz.label,
                    emoji: '�',
                    hasDST: false
                };
                abbr = getAbbreviationForZone(customTz.zone, date);
            }
        }
        
        if (!config) return;
        
        const time = isCustom ? convertToTimezoneByZone(date, config.zone) : convertToTimezone(date, tzCode);
        const isDSTActive = isCustom ? isDSTByZone(date, config.zone) : (config.hasDST && isDST(date, tzCode));
        
        // Get proper abbreviation (handle DST for standard timezones)
        if (!isCustom && config.hasDST) {
            abbr = getTimezoneAbbr(tzCode, date);
        }
        
        // Determine class for styling
        let cardClass = 'timestamp-result-card';
        if (isCustom) {
            // Find the index in custom timezones array (1-based for class)
            const customIndex = (userSettings.customTimezones || []).findIndex(tz => tz.id === tzCode);
            cardClass += ` custom-tz-${(customIndex % 5) + 1}`;
        } else {
            cardClass += ` ${tzCode.toLowerCase()}`;
        }
        
        const card = document.createElement('div');
        card.className = cardClass;
        
        // Get the IANA zone for the timezone
        const ianaZone = isCustom ? config.zone : (TIMEZONE_CONFIG[tzCode] ? TIMEZONE_CONFIG[tzCode].zone : 'UTC');
        
        card.innerHTML = `
            <button class="copy-result-btn" data-timezone="${abbr}" data-timestamp="${time.getTime()}" data-zone="${ianaZone}"></button>
            <div class="result-label">${config.emoji} ${config.label}</div>
            <div class="result-time">${formatTime(time)}</div>
            <div class="result-date">${formatDate(time)}</div>
            ${config.hasDST ? `<div class="result-dst">${isDSTActive ? '☀️ ' + config.dstName + ' (Daylight)' : '🌙 ' + config.standardName + ' (Standard)'}</div>` : ''}
        `;
        
        resultGrid.appendChild(card);
    });
    
    // Show results
    document.getElementById('timestamp-conversion-results').style.display = 'block';
    
    // Add copy button listeners for timestamp results
    document.querySelectorAll('.timestamp-result-card .copy-result-btn').forEach(btn => {
        btn.onclick = function() {
            const abbr = this.getAttribute('data-timezone');
            const zone = this.getAttribute('data-zone');
            const timestamp = parseInt(this.getAttribute('data-timestamp'));
            const dateObj = new Date(timestamp);
            const button = this;
            
            // Use user's selected copy format
            const formattedText = formatForClipboard(dateObj, abbr, zone);
            
            navigator.clipboard.writeText(formattedText).then(() => {
                // Add jiggle animation
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 300);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        };
    });
}

// Convert time based on user input
function convertTime() {
    const timezone = document.getElementById('input-timezone').value;
    const dateInput = document.getElementById('input-date').value;
    const timeInput = document.getElementById('input-time').value;
    
    if (!dateInput || !timeInput) {
        alert('Please enter both date and time');
        return;
    }
    
    // Time input with step="1" returns HH:MM:SS format
    // If only HH:MM is provided (older browsers), append :00
    const timeWithSeconds = timeInput.length === 5 ? `${timeInput}:00` : timeInput;
    
    // Get the source timezone configuration
    let sourceConfig = TIMEZONE_CONFIG[timezone];
    let isCustomSource = false;
    let sourceZone = null;
    
    // Check if it's a custom timezone
    if (!sourceConfig && timezone.startsWith('CUSTOM_')) {
        const customTz = (userSettings.customTimezones || []).find(tz => tz.id === timezone);
        if (customTz) {
            sourceZone = customTz.zone;
            isCustomSource = true;
        }
    }
    
    // Create the date in the source timezone and convert to UTC
    const localDateStr = `${dateInput}T${timeWithSeconds}`;
    let utcTime;
    
    if (isCustomSource) {
        // For custom timezones, use the IANA zone directly
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: sourceZone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });
        // Parse the input as if it's in the custom timezone
        const tempDate = new Date(localDateStr);
        const parts = formatter.formatToParts(tempDate);
        // Calculate offset by comparing
        const sourceDate = new Date(localDateStr + 'Z');
        const tzDate = new Date(tempDate.toLocaleString('en-US', { timeZone: sourceZone }));
        const offset = tempDate.getTime() - tzDate.getTime();
        utcTime = new Date(sourceDate.getTime() + offset);
    } else {
        // For standard timezones, use the offset method
        let sourceOffsetHours = sourceConfig.offset;
        const tempDate = new Date(`${dateInput}T${timeWithSeconds}Z`);
        if (sourceConfig.hasDST && isDST(tempDate, timezone)) {
            sourceOffsetHours += 1;
        }
        utcTime = new Date(`${dateInput}T${timeWithSeconds}Z`);
        utcTime.setTime(utcTime.getTime() - (sourceOffsetHours * 3600000));
    }
    
    // Convert to all timezones
    displayConversionResults(utcTime, timezone);
    
    // Show results
    document.getElementById('conversion-results').style.display = 'block';
}

// Display conversion results
function displayConversionResults(sourceDate, sourceTimezone) {
    const resultGrid = document.querySelector('.conversion-result-grid');
    if (!resultGrid) return;
    
    // Clear existing results
    resultGrid.innerHTML = '';
    
    // Convert to user's selected display timezones
    userSettings.displayTimezones.forEach(tzCode => {
        let config = TIMEZONE_CONFIG[tzCode];
        let isCustom = false;
        
        // Check if it's a custom timezone
        if (!config && tzCode.startsWith('CUSTOM_')) {
            const customTz = (userSettings.customTimezones || []).find(tz => tz.id === tzCode);
            if (customTz) {
                config = {
                    zone: customTz.zone,
                    emoji: '🌐',
                    label: customTz.label,
                    hasDST: false
                };
                isCustom = true;
            }
        }
        
        if (!config) return;
        
        const time = isCustom ? convertToTimezoneByZone(sourceDate, config.zone) : convertToTimezone(sourceDate, tzCode);
        const isDSTActive = isCustom ? isDSTByZone(sourceDate, config.zone) : (config.hasDST && isDST(sourceDate, tzCode));
        const abbr = isCustom ? getAbbreviationForZone(config.zone, sourceDate) : (config.hasDST ? getTimezoneAbbr(tzCode, sourceDate) : tzCode);
        
        // Determine CSS class for the card
        let cardClass = tzCode.toLowerCase();
        if (isCustom) {
            const customIndex = (userSettings.customTimezones || []).findIndex(tz => tz.id === tzCode);
            cardClass = `custom-tz-${(customIndex % 5) + 1}`;
        }
        
        const card = document.createElement('div');
        card.className = `result-card ${cardClass}`;
        
        // Get the IANA zone for the timezone
        const ianaZone = isCustom ? config.zone : (TIMEZONE_CONFIG[tzCode] ? TIMEZONE_CONFIG[tzCode].zone : 'UTC');
        
        card.innerHTML = `
            <button class="copy-result-btn" data-timezone="${abbr}" data-timestamp="${time.getTime()}" data-zone="${ianaZone}"></button>
            <div class="result-label">${config.emoji} ${config.label}</div>
            <div class="result-time">${formatTime(time)}</div>
            <div class="result-date">${formatDate(time)}</div>
            ${config.hasDST ? `<div class="result-dst">${isDSTActive ? '☀️ Daylight Saving' : '🌙 Standard Time'}</div>` : ''}
        `;
        
        resultGrid.appendChild(card);
    });
    
    // Add copy button listeners for conversion results
    resultGrid.querySelectorAll('.copy-result-btn').forEach(btn => {
        btn.onclick = function() {
            const abbr = this.getAttribute('data-timezone');
            const zone = this.getAttribute('data-zone');
            const timestamp = parseInt(this.getAttribute('data-timestamp'));
            const dateObj = new Date(timestamp);
            const button = this;
            
            // Use user's selected copy format
            const formattedText = formatForClipboard(dateObj, abbr, zone);
            
            navigator.clipboard.writeText(formattedText).then(() => {
                // Add jiggle animation
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 300);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        };
    });
    
    // Unix timestamp
    document.getElementById('unix-timestamp').textContent = sourceDate.getTime();
}

// Copy to clipboard
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback only if button element is provided
        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✅ Copied!';
            setTimeout(() => {
                buttonElement.textContent = originalText;
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Populate the "From Timezone" dropdown based on user's display timezones
function populateFromTimezoneDropdown() {
    const dropdown = document.getElementById('input-timezone');
    if (!dropdown) return;
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add options for each display timezone
    userSettings.displayTimezones.forEach(tzCode => {
        let config = TIMEZONE_CONFIG[tzCode];
        let label = '';
        
        // Check if it's a custom timezone
        if (!config && tzCode.startsWith('CUSTOM_')) {
            const customTz = (userSettings.customTimezones || []).find(tz => tz.id === tzCode);
            if (customTz) {
                label = `🌐 ${customTz.label}`;
                config = { label: customTz.label };
            }
        } else if (config) {
            label = `${config.emoji} ${config.label}`;
        }
        
        if (config) {
            const option = document.createElement('option');
            option.value = tzCode;
            option.textContent = label;
            dropdown.appendChild(option);
        }
    });
    
    // Set primary timezone as default if it's in the list
    if (userSettings.displayTimezones.includes(userSettings.primaryTimezone)) {
        dropdown.value = userSettings.primaryTimezone;
    }
}

// Sync the timestamp mode toggle UI with current settings
// Initialize
function init() {
    // Set today's date and current time as default
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    document.getElementById('input-date').value = today;
    
    // Set current time with seconds (HH:MM:SS format)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('input-time').value = `${hours}:${minutes}:${seconds}`;
    
    // Open settings button
    document.getElementById('open-settings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
    
    // Load user settings
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get('timezoneSettings', (data) => {
            userSettings = data.timezoneSettings || DEFAULT_SETTINGS;
            populateFromTimezoneDropdown();
            updateCurrentTimes();
        });
    } else {
        // Use default settings if chrome.storage not available
        userSettings = DEFAULT_SETTINGS;
        populateFromTimezoneDropdown();
    }
    
    // Update current times immediately and every second
    updateCurrentTimes();
    setInterval(updateCurrentTimes, 1000);
    
    // Convert button
    document.getElementById('convert-btn').addEventListener('click', convertTime);
    
    // Timestamp converter buttons
    document.getElementById('convert-timestamp-ms').addEventListener('click', () => convertTimestampToTimes('milliseconds'));
    document.getElementById('convert-timestamp-sec').addEventListener('click', () => convertTimestampToTimes('seconds'));
    
    // Allow Enter key in timestamp input (default: milliseconds)
    document.getElementById('timestamp-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertTimestampToTimes('milliseconds');
        }
    });
    
    // Copy timestamp button (same behavior as live epoch copy)
    document.getElementById('copy-timestamp').addEventListener('click', function() {
        const timestamp = document.getElementById('unix-timestamp').textContent;
        const button = this;
        
        navigator.clipboard.writeText(timestamp).then(() => {
            // Add jiggle animation
            button.classList.add('copied');
            setTimeout(() => {
                button.classList.remove('copied');
            }, 300);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });
    
    // Copy live epoch timestamp
    document.getElementById('copy-live-epoch').addEventListener('click', function() {
        const timestamp = document.getElementById('live-epoch-millis').textContent;
        const button = this;
        
        navigator.clipboard.writeText(timestamp).then(() => {
            // Add jiggle animation
            button.classList.add('copied');
            setTimeout(() => {
                button.classList.remove('copied');
            }, 300);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    });
    
    // Listen for settings updates
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'settingsUpdated') {
                userSettings = request.settings;
                populateFromTimezoneDropdown();
                updateCurrentTimes();
            }
        });
    }
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
