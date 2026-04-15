// Timezone utility functions - extracted for testing

const TIMEZONE_CONFIG = {
    IST: {
        offset: 5.5,
        hasDST: false,
        name: 'India Standard Time',
        zone: 'Asia/Kolkata',
        emoji: '🇮🇳',
        label: 'IST (India)'
    },
    GMT: {
        offset: 0,
        hasDST: false,
        name: 'Greenwich Mean Time',
        zone: 'UTC',
        emoji: '🌐',
        label: 'GMT/UTC'
    },
    PST: {
        offset: -8,
        hasDST: true,
        name: 'Pacific Standard/Daylight Time',
        zone: 'America/Los_Angeles',
        dstName: 'PDT',
        standardName: 'PST',
        emoji: '🇺🇸',
        label: 'PST/PDT (Pacific)'
    },
    EST: {
        offset: -5,
        hasDST: true,
        name: 'Eastern Standard/Daylight Time',
        zone: 'America/New_York',
        dstName: 'EDT',
        standardName: 'EST',
        emoji: '🇺🇸',
        label: 'EST/EDT (Eastern)'
    },
    CST: {
        offset: -6,
        hasDST: true,
        name: 'Central Standard/Daylight Time',
        zone: 'America/Chicago',
        dstName: 'CDT',
        standardName: 'CST',
        emoji: '🇺🇸',
        label: 'CST/CDT (Central)'
    },
    JST: {
        offset: 9,
        hasDST: false,
        name: 'Japan Standard Time',
        zone: 'Asia/Tokyo',
        emoji: '🇯🇵',
        label: 'JST (Japan)'
    },
    AEST: {
        offset: 10,
        hasDST: true,
        name: 'Australian Eastern Standard/Daylight Time',
        zone: 'Australia/Sydney',
        dstName: 'AEDT',
        standardName: 'AEST',
        emoji: '🇦🇺',
        label: 'AEST/AEDT (Australia)'
    },
    CST_CHINA: {
        offset: 8,
        hasDST: false,
        name: 'China Standard Time',
        zone: 'Asia/Shanghai',
        emoji: '🇨🇳',
        label: 'CST (Shanghai)'
    },
    CET: {
        offset: 1,
        hasDST: true,
        name: 'Central European Time',
        zone: 'Europe/Paris',
        dstName: 'CEST',
        standardName: 'CET',
        emoji: '🇪🇺',
        label: 'CET/CEST (Europe)'
    },
    SAST: {
        offset: 2,
        hasDST: false,
        name: 'South Africa Standard Time',
        zone: 'Africa/Johannesburg',
        emoji: '🇿🇦',
        label: 'SAST (Johannesburg)'
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
    
    // Use placeholder for AM/PM to avoid conflicts with month names like "Apr", "Mar", "May"
    // Also use placeholder for MMM to protect it from other replacements
    return pattern
        .replace('A', '\x00AMPM\x00')      // Placeholder for AM/PM
        .replace('MMM', '\x00MONTH\x00')   // Placeholder for month name
        .replace('yyyy', year)
        .replace('MM', pad(month))
        .replace('dd', pad(day))
        .replace('HH', pad(hours24))
        .replace('hh', pad(hours12))
        .replace('mm', pad(minutes))
        .replace('ss', pad(seconds))
        .replace('\x00MONTH\x00', monthNames[month - 1])  // Replace month placeholder
        .replace('\x00AMPM\x00', ampm);                    // Replace AM/PM placeholder
}

// Format ISO with milliseconds and timezone offset
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
            // Fallback: use local timezone
            offsetMinutes = -date.getTimezoneOffset();
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

// Get timezone offset for a specific IANA zone
function getTimezoneOffset(zone, date = new Date()) {
    try {
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: zone }));
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        return (tzDate - utcDate) / (1000 * 60);
    } catch (e) {
        return 0;
    }
}

// Format offset as string (e.g., +05:30, -08:00)
function formatOffset(offsetMinutes) {
    const pad = (n) => String(n).padStart(2, '0');
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const hours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
    const mins = pad(Math.abs(offsetMinutes) % 60);
    return `${sign}${hours}:${mins}`;
}

// Convert date to a specific timezone
function convertToTimezone(date, zone) {
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

        // Node.js ICU may return hour "24" instead of "00" for midnight;
        // "24:xx:xx" is not valid ISO 8601, so normalise it to "00".
        if (dateParts.hour === '24') {
            dateParts.hour = '00';
        }
        
        return new Date(
            `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
        );
    } catch (e) {
        return date;
    }
}

// Validate and detect timestamp format
// mode: 'seconds' | 'milliseconds' (default: 'milliseconds')
// Accepts any pure-numeric string (optionally negative) — rejects IPs, alphanumeric, etc.
// Negative values represent dates before Unix epoch (Jan 1, 1970).
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

// Calculate tooltip position with smart overflow detection
// Returns { left, top } in page coordinates
function calculateTooltipPosition(cursorX, cursorY, tooltipWidth, tooltipHeight, viewportWidth, viewportHeight, scrollX, scrollY) {
    const cursorViewportX = cursorX - scrollX;
    const cursorViewportY = cursorY - scrollY;

    // Horizontal: prefer right of cursor, flip to left if it overflows
    let left;
    if (cursorViewportX + 15 + tooltipWidth > viewportWidth) {
        // Overflows right → try left of cursor
        left = cursorX - tooltipWidth - 15;
        // If flipping left also overflows (tooltip wider than space on both sides),
        // pin to the right edge of the viewport
        if (left < scrollX) {
            left = scrollX + viewportWidth - tooltipWidth - 5;
        }
    } else {
        left = cursorX + 15;
    }
    // Final clamp: never go off the left edge
    if (left < scrollX + 5) {
        left = scrollX + 5;
    }

    // Vertical: prefer above cursor, flip below if it overflows
    let top;
    if (cursorViewportY - tooltipHeight - 10 < 0) {
        top = cursorY + 20;
    } else {
        top = cursorY - tooltipHeight - 10;
    }
    // Clamp so it never goes off the bottom
    if (top + tooltipHeight > scrollY + viewportHeight) {
        top = scrollY + viewportHeight - tooltipHeight - 5;
    }

    return { left, top };
}

// Check if DST is active for a timezone using IANA zone
function isDSTByZone(date, zone) {
    try {
        const jan = new Date(date.getFullYear(), 0, 1);
        const jul = new Date(date.getFullYear(), 6, 1);
        
        const janOffset = getTimezoneOffset(zone, jan);
        const julOffset = getTimezoneOffset(zone, jul);
        const currentOffset = getTimezoneOffset(zone, date);
        
        // If offsets differ, DST exists. Current offset matching the larger offset means DST is active
        if (janOffset !== julOffset) {
            const maxOffset = Math.max(janOffset, julOffset);
            return currentOffset === maxOffset;
        }
        
        return false;
    } catch (e) {
        return false;
    }
}

// Format time as HH:MM:SS
function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Format date as "Sat, Feb 21, 2026"
function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TIMEZONE_CONFIG,
        formatDateCustom,
        formatISOWithOffset,
        getTimezoneOffset,
        formatOffset,
        convertToTimezone,
        detectTimestampFormat,
        calculateTooltipPosition,
        isDSTByZone,
        formatTime,
        formatDate
    };
}
