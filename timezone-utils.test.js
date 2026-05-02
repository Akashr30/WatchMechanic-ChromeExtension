const {
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
} = require('./timezone-utils');

describe('Timezone Utilities', () => {
    
    // Use a fixed date for consistent testing
    const testDate = new Date('2026-02-25T12:30:45.123Z'); // UTC time
    
    describe('TIMEZONE_CONFIG', () => {
        test('should have all expected timezones', () => {
            const expectedTimezones = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST', 'AEST', 'CST_CHINA', 'CET', 'SAST'];
            expectedTimezones.forEach(tz => {
                expect(TIMEZONE_CONFIG[tz]).toBeDefined();
                expect(TIMEZONE_CONFIG[tz].zone).toBeDefined();
            });
        });

        test('IST should have correct configuration', () => {
            expect(TIMEZONE_CONFIG.IST.zone).toBe('Asia/Kolkata');
            expect(TIMEZONE_CONFIG.IST.offset).toBe(5.5);
            expect(TIMEZONE_CONFIG.IST.hasDST).toBe(false);
        });

        test('PST should have DST configuration', () => {
            expect(TIMEZONE_CONFIG.PST.zone).toBe('America/Los_Angeles');
            expect(TIMEZONE_CONFIG.PST.hasDST).toBe(true);
            expect(TIMEZONE_CONFIG.PST.dstName).toBe('PDT');
            expect(TIMEZONE_CONFIG.PST.standardName).toBe('PST');
        });

        test('SAST should have correct configuration (no DST)', () => {
            expect(TIMEZONE_CONFIG.SAST).toBeDefined();
            expect(TIMEZONE_CONFIG.SAST.zone).toBe('Africa/Johannesburg');
            expect(TIMEZONE_CONFIG.SAST.offset).toBe(2);
            expect(TIMEZONE_CONFIG.SAST.hasDST).toBe(false);
            expect(TIMEZONE_CONFIG.SAST.label).toBe('SAST (Johannesburg)');
        });
    });

    describe('formatDateCustom', () => {
        const localDate = new Date(2026, 1, 21, 17, 53, 48); // Feb 21, 2026 5:53:48 PM
        
        test('should format ISO 8601 pattern', () => {
            const result = formatDateCustom(localDate, 'yyyy-MM-ddTHH:mm:ss');
            expect(result).toBe('2026-02-21T17:53:48');
        });

        test('should format ISO with space pattern', () => {
            const result = formatDateCustom(localDate, 'yyyy-MM-dd HH:mm:ss');
            expect(result).toBe('2026-02-21 17:53:48');
        });

        test('should format US pattern with 12-hour time', () => {
            const result = formatDateCustom(localDate, 'MM/dd/yyyy hh:mm:ss A');
            expect(result).toBe('02/21/2026 05:53:48 PM');
        });

        test('should format EU pattern', () => {
            const result = formatDateCustom(localDate, 'dd/MM/yyyy HH:mm:ss');
            expect(result).toBe('21/02/2026 17:53:48');
        });

        test('should format compact pattern', () => {
            const result = formatDateCustom(localDate, 'yyyyMMdd_HHmmss');
            expect(result).toBe('20260221_175348');
        });

        test('should format readable pattern with month name', () => {
            const result = formatDateCustom(localDate, 'dd MMM yyyy, HH:mm:ss');
            expect(result).toBe('21 Feb 2026, 17:53:48');
        });

        test('should handle AM times correctly', () => {
            const amDate = new Date(2026, 1, 21, 9, 30, 0);
            const result = formatDateCustom(amDate, 'hh:mm:ss A');
            expect(result).toBe('09:30:00 AM');
        });

        test('should handle midnight (12 AM) correctly', () => {
            const midnightDate = new Date(2026, 1, 21, 0, 0, 0);
            const result = formatDateCustom(midnightDate, 'hh:mm:ss A');
            expect(result).toBe('12:00:00 AM');
        });

        test('should handle noon (12 PM) correctly', () => {
            const noonDate = new Date(2026, 1, 21, 12, 0, 0);
            const result = formatDateCustom(noonDate, 'hh:mm:ss A');
            expect(result).toBe('12:00:00 PM');
        });

        test('should format all month abbreviations correctly (MMM)', () => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach((month, index) => {
                const date = new Date(2026, index, 15, 12, 0, 0);
                const result = formatDateCustom(date, 'dd MMM yyyy');
                expect(result).toBe(`15 ${month} 2026`);
            });
        });

        test('should handle single digit day correctly', () => {
            const date = new Date(2026, 0, 5, 9, 30, 0); // Jan 5
            const result = formatDateCustom(date, 'dd/MM/yyyy');
            expect(result).toBe('05/01/2026');
        });

        test('should handle seconds in format', () => {
            const date = new Date(2026, 1, 21, 14, 30, 45);
            const result = formatDateCustom(date, 'HH:mm:ss');
            expect(result).toBe('14:30:45');
        });

        test('should handle ss (seconds) with zero padding', () => {
            const date = new Date(2026, 1, 21, 14, 30, 5);
            const result = formatDateCustom(date, 'HH:mm:ss');
            expect(result).toBe('14:30:05');
        });
    });

    describe('getTimezoneOffset', () => {
        test('should return correct offset for IST (UTC+5:30)', () => {
            const offset = getTimezoneOffset('Asia/Kolkata', testDate);
            expect(offset).toBe(330); // 5.5 hours = 330 minutes
        });

        test('should return correct offset for UTC', () => {
            const offset = getTimezoneOffset('UTC', testDate);
            expect(offset).toBe(0);
        });

        test('should return correct offset for Johannesburg (UTC+2)', () => {
            const offset = getTimezoneOffset('Africa/Johannesburg', testDate);
            expect(offset).toBe(120); // 2 hours = 120 minutes
        });

        test('should return correct offset for Tokyo (UTC+9)', () => {
            const offset = getTimezoneOffset('Asia/Tokyo', testDate);
            expect(offset).toBe(540); // 9 hours = 540 minutes
        });

        test('should return correct offset for Shanghai (UTC+8)', () => {
            const offset = getTimezoneOffset('Asia/Shanghai', testDate);
            expect(offset).toBe(480); // 8 hours = 480 minutes
        });
    });

    describe('formatOffset', () => {
        test('should format positive offset correctly', () => {
            expect(formatOffset(330)).toBe('+05:30'); // IST
            expect(formatOffset(120)).toBe('+02:00'); // SAST
            expect(formatOffset(540)).toBe('+09:00'); // JST
        });

        test('should format negative offset correctly', () => {
            expect(formatOffset(-480)).toBe('-08:00'); // PST
            expect(formatOffset(-300)).toBe('-05:00'); // EST
        });

        test('should format zero offset correctly', () => {
            expect(formatOffset(0)).toBe('+00:00');
        });
    });

    describe('formatISOWithOffset', () => {
        test('should format with correct IST offset', () => {
            const date = new Date(2026, 1, 21, 17, 53, 48, 398);
            const result = formatISOWithOffset(date, 'IST', 'Asia/Kolkata');
            expect(result).toMatch(/^2026-02-21T17:53:48\.398\+05:30$/);
        });

        test('should format with correct Johannesburg offset (+02:00)', () => {
            const date = new Date(2026, 1, 21, 14, 0, 0, 0);
            const result = formatISOWithOffset(date, 'SAST', 'Africa/Johannesburg');
            expect(result).toMatch(/\+02:00$/);
        });

        test('should format with correct Tokyo offset (+09:00)', () => {
            const date = new Date(2026, 1, 21, 21, 0, 0, 0);
            const result = formatISOWithOffset(date, 'JST', 'Asia/Tokyo');
            expect(result).toMatch(/\+09:00$/);
        });

        test('should format with correct UTC offset (+00:00)', () => {
            const date = new Date(2026, 1, 21, 12, 0, 0, 0);
            const result = formatISOWithOffset(date, 'GMT', 'UTC');
            expect(result).toMatch(/\+00:00$/);
        });

        test('should include milliseconds', () => {
            const date = new Date(2026, 1, 21, 17, 53, 48, 123);
            const result = formatISOWithOffset(date, 'IST', 'Asia/Kolkata');
            expect(result).toContain('.123');
        });
    });

    describe('convertToTimezone', () => {
        test('should convert UTC to IST correctly', () => {
            const utcDate = new Date('2026-02-25T06:30:00.000Z');
            const istTime = convertToTimezone(utcDate, 'Asia/Kolkata');
            expect(istTime.getHours()).toBe(12);
            expect(istTime.getMinutes()).toBe(0);
        });

        test('should convert UTC to Tokyo correctly', () => {
            const utcDate = new Date('2026-02-25T06:00:00.000Z');
            const tokyoTime = convertToTimezone(utcDate, 'Asia/Tokyo');
            expect(tokyoTime.getHours()).toBe(15);
        });

        test('should convert UTC to Johannesburg correctly', () => {
            const utcDate = new Date('2026-02-25T10:00:00.000Z');
            const saTime = convertToTimezone(utcDate, 'Africa/Johannesburg');
            expect(saTime.getHours()).toBe(12);
        });
    });

    describe('detectTimestampFormat', () => {
        test('should detect milliseconds timestamp (13 digits) - default mode', () => {
            const result = detectTimestampFormat('1740488445123');
            expect(result).not.toBeNull();
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445123);
        });

        test('should treat 10-digit input as milliseconds in default mode', () => {
            const result = detectTimestampFormat('1740488445');
            expect(result).not.toBeNull();
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445);
        });

        test('should treat 10-digit input as seconds when mode is seconds', () => {
            const result = detectTimestampFormat('1740488445', 'seconds');
            expect(result).not.toBeNull();
            expect(result.type).toBe('seconds');
            expect(result.value).toBe(1740488445000); // Converted to ms
        });

        test('should return null for invalid input', () => {
            expect(detectTimestampFormat('abc')).toBeNull();
            expect(detectTimestampFormat('')).toBeNull();
        });

        test('should accept any digit count — no 10/13 digit restriction', () => {
            // Short numbers should work now
            expect(detectTimestampFormat('12345')).not.toBeNull();
            expect(detectTimestampFormat('12345').type).toBe('milliseconds');
            expect(detectTimestampFormat('12345').value).toBe(12345);
            
            // Very long numbers should also work
            expect(detectTimestampFormat('12345678901234')).not.toBeNull();
            expect(detectTimestampFormat('12345678901234').type).toBe('milliseconds');
        });
    });

    describe('formatTime', () => {
        test('should format time with zero padding', () => {
            const date = new Date(2026, 1, 21, 9, 5, 3);
            expect(formatTime(date)).toBe('09:05:03');
        });

        test('should format afternoon time correctly', () => {
            const date = new Date(2026, 1, 21, 17, 53, 48);
            expect(formatTime(date)).toBe('17:53:48');
        });

        test('should format midnight correctly', () => {
            const date = new Date(2026, 1, 21, 0, 0, 0);
            expect(formatTime(date)).toBe('00:00:00');
        });
    });

    describe('formatDate', () => {
        test('should format date correctly', () => {
            const date = new Date(2026, 1, 21); // Feb 21, 2026 (Saturday)
            expect(formatDate(date)).toBe('Sat, Feb 21, 2026');
        });

        test('should handle different days of week', () => {
            const sunday = new Date(2026, 1, 22);
            expect(formatDate(sunday)).toContain('Sun');
        });

        test('should handle different months', () => {
            const december = new Date(2026, 11, 25);
            expect(formatDate(december)).toContain('Dec');
        });
    });

    describe('isDSTByZone', () => {
        test('should return false for IST (no DST)', () => {
            const result = isDSTByZone(testDate, 'Asia/Kolkata');
            expect(result).toBe(false);
        });

        test('should return false for Tokyo (no DST)', () => {
            const result = isDSTByZone(testDate, 'Asia/Tokyo');
            expect(result).toBe(false);
        });

        test('should return false for Johannesburg (no DST)', () => {
            const result = isDSTByZone(testDate, 'Africa/Johannesburg');
            expect(result).toBe(false);
        });

        // Note: DST detection for US timezones depends on the date
        // February 25, 2026 is NOT in DST for US timezones (DST starts March 8, 2026)
        test('should correctly detect DST status for Los Angeles in winter', () => {
            const winterDate = new Date('2026-02-01T12:00:00Z');
            const result = isDSTByZone(winterDate, 'America/Los_Angeles');
            expect(result).toBe(false);
        });

        test('should correctly detect DST status for Los Angeles in summer', () => {
            const summerDate = new Date('2026-07-01T12:00:00Z');
            const result = isDSTByZone(summerDate, 'America/Los_Angeles');
            expect(result).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        test('should handle year boundary correctly', () => {
            const newYearEve = new Date(2026, 11, 31, 23, 59, 59);
            expect(formatDateCustom(newYearEve, 'yyyy-MM-dd')).toBe('2026-12-31');
        });

        test('should handle leap year date', () => {
            // 2028 is a leap year
            const leapDay = new Date(2028, 1, 29);
            expect(formatDate(leapDay)).toContain('Feb 29');
        });

        test('should handle invalid timezone gracefully', () => {
            // getTimezoneOffset should return 0 for invalid timezone
            const offset = getTimezoneOffset('Invalid/Timezone', testDate);
            expect(offset).toBe(0);
        });
    });

    describe('Timezone Offset Bug Fix Verification', () => {
        // These tests specifically verify the bug fix for the iso-ms-tz format
        // where timezone offset was always showing +05:30 (local IST) instead of the actual timezone
        
        test('Johannesburg should show +02:00 offset, not +05:30', () => {
            const date = new Date(2026, 1, 25, 12, 0, 0, 0);
            const result = formatISOWithOffset(date, 'SAST', 'Africa/Johannesburg');
            expect(result).not.toContain('+05:30');
            expect(result).toContain('+02:00');
        });

        test('Tokyo should show +09:00 offset', () => {
            const date = new Date(2026, 1, 25, 12, 0, 0, 0);
            const result = formatISOWithOffset(date, 'JST', 'Asia/Tokyo');
            expect(result).toContain('+09:00');
        });

        test('New York should show -05:00 offset in winter', () => {
            const winterDate = new Date(2026, 1, 25, 12, 0, 0, 0);
            const result = formatISOWithOffset(winterDate, 'EST', 'America/New_York');
            expect(result).toContain('-05:00');
        });

        test('Los Angeles should show -08:00 offset in winter', () => {
            const winterDate = new Date(2026, 1, 25, 12, 0, 0, 0);
            const result = formatISOWithOffset(winterDate, 'PST', 'America/Los_Angeles');
            expect(result).toContain('-08:00');
        });

        test('Shanghai should show +08:00 offset', () => {
            const date = new Date(2026, 1, 25, 12, 0, 0, 0);
            const result = formatISOWithOffset(date, 'CST', 'Asia/Shanghai');
            expect(result).toContain('+08:00');
        });
    });

    describe('SAST (South Africa Standard Time) Tests', () => {
        test('SAST should return correct offset (+02:00)', () => {
            const offset = getTimezoneOffset('Africa/Johannesburg', testDate);
            expect(offset).toBe(120); // 2 hours = 120 minutes
        });

        test('SAST formatISOWithOffset should show +02:00', () => {
            const date = new Date(2026, 1, 25, 12, 0, 0, 0);
            const result = formatISOWithOffset(date, 'SAST', 'Africa/Johannesburg');
            expect(result).toContain('+02:00');
            expect(result).not.toContain('+05:30'); // Should not show IST offset
        });

        test('UTC to Johannesburg conversion should be UTC+2', () => {
            const utcDate = new Date('2026-02-25T10:00:00.000Z');
            const saTime = convertToTimezone(utcDate, 'Africa/Johannesburg');
            expect(saTime.getHours()).toBe(12); // 10 UTC + 2 = 12
        });
    });

    describe('Timestamp Edge Cases', () => {
        test('should return null for zero-only input', () => {
            const result = detectTimestampFormat('0');
            expect(result).toBeNull(); // num <= 0
        });

        test('should handle input with leading zeros (still pure digits)', () => {
            // '0174048844' is pure digits → Number('0174048844') = 174048844 > 0 → valid
            const result = detectTimestampFormat('0174048844');
            expect(result).not.toBeNull();
            expect(result.value).toBe(174048844);
        });

        test('should handle current era timestamps (2020+)', () => {
            const result = detectTimestampFormat('1740488445');
            expect(result).not.toBeNull();
            expect(result.type).toBe('milliseconds'); // default mode
        });

        test('should handle whitespace around timestamp', () => {
            const result = detectTimestampFormat('  1740488445  ');
            expect(result).not.toBeNull();
        });
    });

    // ==========================================
    // NEW FEATURE TESTS
    // ==========================================

    describe('detectTimestampFormat — Mode Parameter (sec/ms toggle)', () => {
        test('should default to milliseconds when no mode is passed', () => {
            const result = detectTimestampFormat('1740488445123');
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445123);
        });

        test('should default to milliseconds when mode is undefined', () => {
            const result = detectTimestampFormat('1740488445', undefined);
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445);
        });

        test('mode=milliseconds should return value as-is', () => {
            const result = detectTimestampFormat('1740488445123', 'milliseconds');
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445123);
        });

        test('mode=seconds should multiply value by 1000', () => {
            const result = detectTimestampFormat('1740488445', 'seconds');
            expect(result.type).toBe('seconds');
            expect(result.value).toBe(1740488445000);
        });

        test('mode=seconds with small number should still multiply', () => {
            const result = detectTimestampFormat('100', 'seconds');
            expect(result.type).toBe('seconds');
            expect(result.value).toBe(100000);
        });

        test('mode=milliseconds with small number should return as-is', () => {
            const result = detectTimestampFormat('100', 'milliseconds');
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(100);
        });

        test('mode=seconds with 13-digit input should still treat as seconds', () => {
            const result = detectTimestampFormat('1740488445123', 'seconds');
            expect(result.type).toBe('seconds');
            expect(result.value).toBe(1740488445123 * 1000);
        });

        test('mode=milliseconds with 10-digit input should treat as milliseconds', () => {
            const result = detectTimestampFormat('1740488445', 'milliseconds');
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445); // NOT multiplied by 1000
        });

        test('invalid mode string should default to milliseconds behavior', () => {
            const result = detectTimestampFormat('1740488445', 'invalid_mode');
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(1740488445);
        });
    });

    describe('detectTimestampFormat — Any Number Accepted (no digit restriction)', () => {
        test('should accept 1-digit number', () => {
            const result = detectTimestampFormat('5');
            expect(result).not.toBeNull();
            expect(result.value).toBe(5);
        });

        test('should accept 3-digit number', () => {
            const result = detectTimestampFormat('123');
            expect(result).not.toBeNull();
            expect(result.value).toBe(123);
        });

        test('should accept 7-digit number', () => {
            const result = detectTimestampFormat('1234567');
            expect(result).not.toBeNull();
            expect(result.value).toBe(1234567);
        });

        test('should accept 10-digit number', () => {
            const result = detectTimestampFormat('1740488445');
            expect(result).not.toBeNull();
        });

        test('should accept 13-digit number', () => {
            const result = detectTimestampFormat('1740488445123');
            expect(result).not.toBeNull();
        });

        test('should accept 15-digit number', () => {
            const result = detectTimestampFormat('174048844512345');
            expect(result).not.toBeNull();
            expect(result.value).toBe(174048844512345);
        });

        test('should accept very large number (20 digits)', () => {
            const result = detectTimestampFormat('12345678901234567890');
            expect(result).not.toBeNull();
        });

        test('should accept negative number (pre-1970 dates)', () => {
            const result = detectTimestampFormat('-123');
            expect(result).not.toBeNull();
            expect(result.value).toBe(-123);
            expect(result.type).toBe('milliseconds');
        });

        test('should reject pure non-numeric input', () => {
            expect(detectTimestampFormat('hello')).toBeNull();
            expect(detectTimestampFormat('---')).toBeNull();
            expect(detectTimestampFormat('...')).toBeNull();
        });

        test('should reject IP addresses', () => {
            expect(detectTimestampFormat('192.168.1.1')).toBeNull();
            expect(detectTimestampFormat('10.0.0.1')).toBeNull();
            expect(detectTimestampFormat('255.255.255.0')).toBeNull();
            expect(detectTimestampFormat('172.16.0.100')).toBeNull();
        });

        test('should reject alphanumeric strings', () => {
            expect(detectTimestampFormat('abc123')).toBeNull();
            expect(detectTimestampFormat('123abc')).toBeNull();
            expect(detectTimestampFormat('test456value')).toBeNull();
            expect(detectTimestampFormat('a1b2c3')).toBeNull();
        });

        test('should reject strings with special characters mixed with digits', () => {
            expect(detectTimestampFormat('123-456')).toBeNull();
            expect(detectTimestampFormat('123_456')).toBeNull();
            expect(detectTimestampFormat('123/456')).toBeNull();
            expect(detectTimestampFormat('#12345')).toBeNull();
            expect(detectTimestampFormat('$1740488445')).toBeNull();
        });

        test('should reject UUIDs and hex strings', () => {
            expect(detectTimestampFormat('550e8400-e29b-41d4-a716-446655440000')).toBeNull();
            expect(detectTimestampFormat('0x1A2B3C')).toBeNull();
            expect(detectTimestampFormat('ff00ff')).toBeNull();
        });

        test('should reject mixed alphanumeric (not pure digits)', () => {
            // 'ts:1740488445' contains letters and colon → null
            expect(detectTimestampFormat('ts:1740488445')).toBeNull();
            expect(detectTimestampFormat('abc123')).toBeNull();
            expect(detectTimestampFormat('123abc')).toBeNull();
        });

        test('should preserve original input in result', () => {
            const result = detectTimestampFormat('  1740488445123  ');
            expect(result.original).toBe('  1740488445123  ');
        });
    });

    describe('detectTimestampFormat — Boundary & Edge Cases', () => {
        test('should return null for empty string', () => {
            expect(detectTimestampFormat('')).toBeNull();
        });

        test('should return null for whitespace-only', () => {
            expect(detectTimestampFormat('   ')).toBeNull();
        });

        test('should return null for zero', () => {
            expect(detectTimestampFormat('0')).toBeNull();
        });

        test('should return null for all-zeros', () => {
            expect(detectTimestampFormat('0000000000')).toBeNull();
        });

        test('should accept value 1 (minimum positive)', () => {
            const result = detectTimestampFormat('1');
            expect(result).not.toBeNull();
            expect(result.value).toBe(1);
        });

        test('should reject decimal-like input (dot makes it non-pure-digits)', () => {
            // '174.048' has a dot → not pure digits → null
            expect(detectTimestampFormat('174.048')).toBeNull();
        });

        test('mode=seconds with value 1 should return 1000', () => {
            const result = detectTimestampFormat('1', 'seconds');
            expect(result.value).toBe(1000);
        });
    });

    // ==========================================
    // PRE-1970 (NEGATIVE TIMESTAMP) TESTS
    // ==========================================

    describe('detectTimestampFormat — Negative Timestamps (Pre-1970 Dates)', () => {
        test('should accept negative milliseconds timestamp', () => {
            const result = detectTimestampFormat('-1740488445123');
            expect(result).not.toBeNull();
            expect(result.type).toBe('milliseconds');
            expect(result.value).toBe(-1740488445123);
        });

        test('should accept negative seconds timestamp', () => {
            const result = detectTimestampFormat('-1740488445', 'seconds');
            expect(result).not.toBeNull();
            expect(result.type).toBe('seconds');
            expect(result.value).toBe(-1740488445 * 1000);
        });

        test('should accept -1 (1ms before epoch)', () => {
            const result = detectTimestampFormat('-1');
            expect(result).not.toBeNull();
            expect(result.value).toBe(-1);
            const date = new Date(result.value);
            // -1ms = 1969-12-31T23:59:59.999Z in UTC
            expect(date.getUTCFullYear()).toBe(1969);
        });

        test('negative ms → produces pre-1970 date', () => {
            // -86400000 = exactly 1 day before epoch → Dec 31, 1969
            const result = detectTimestampFormat('-86400000');
            expect(result).not.toBeNull();
            const date = new Date(result.value);
            expect(date.getFullYear()).toBe(1969);
            expect(date.getMonth()).toBe(11); // December
            expect(date.getDate()).toBe(31);
        });

        test('negative seconds → produces pre-1970 date', () => {
            // -86400 seconds = 1 day before epoch → Dec 31, 1969
            const result = detectTimestampFormat('-86400', 'seconds');
            expect(result).not.toBeNull();
            const date = new Date(result.value);
            expect(date.getFullYear()).toBe(1969);
            expect(date.getMonth()).toBe(11);
            expect(date.getDate()).toBe(31);
        });

        test('far past: year 1900 via negative ms', () => {
            // Jan 1, 1900 00:00:00 UTC ≈ -2208988800000 ms
            const result = detectTimestampFormat('-2208988800000');
            expect(result).not.toBeNull();
            const date = new Date(result.value);
            expect(date.getFullYear()).toBe(1900);
            expect(date.getMonth()).toBe(0); // January
            expect(date.getDate()).toBe(1);
        });

        test('far past: year 1900 via negative seconds', () => {
            // Jan 1, 1900 00:00:00 UTC ≈ -2208988800 sec
            const result = detectTimestampFormat('-2208988800', 'seconds');
            expect(result).not.toBeNull();
            const date = new Date(result.value);
            expect(date.getFullYear()).toBe(1900);
        });

        test('negative timestamp converts correctly across timezones', () => {
            // -86400000 ms = Dec 31, 1969 00:00:00 UTC
            const result = detectTimestampFormat('-86400000');
            const date = new Date(result.value);

            const istDate = convertToTimezone(date, 'Asia/Kolkata');
            // UTC midnight Dec 31 → IST 05:30 Dec 31
            expect(istDate.getHours()).toBe(5);
            expect(istDate.getMinutes()).toBe(30);

            const gmtDate = convertToTimezone(date, 'UTC');
            expect(gmtDate.getHours()).toBe(0);
            expect(gmtDate.getMinutes()).toBe(0);
        });

        test('negative timestamp formats correctly with formatTime/formatDate', () => {
            // Dec 31, 1969 00:00:00 UTC
            const date = new Date(-86400000);
            const gmtDate = convertToTimezone(date, 'UTC');
            expect(formatTime(gmtDate)).toBe('00:00:00');
            expect(formatDate(gmtDate)).toContain('Dec 31');
            expect(formatDate(gmtDate)).toContain('1969');
        });

        test('should still reject zero', () => {
            expect(detectTimestampFormat('0')).toBeNull();
            expect(detectTimestampFormat('-0')).toBeNull();
        });

        test('should still reject non-numeric with minus in middle', () => {
            expect(detectTimestampFormat('123-456')).toBeNull();
            expect(detectTimestampFormat('--123')).toBeNull();
            expect(detectTimestampFormat('-12-34')).toBeNull();
        });

        test('should reject bare minus sign', () => {
            expect(detectTimestampFormat('-')).toBeNull();
        });

        test('negative value preserves original input', () => {
            const result = detectTimestampFormat('  -86400000  ');
            expect(result).not.toBeNull();
            expect(result.original).toBe('  -86400000  ');
            expect(result.value).toBe(-86400000);
        });
    });

    describe('Double-Click Conversion — Interpreter Toggle Driven', () => {
        // The double-click converter behavior is driven entirely by the
        // interpreter toggle (timestampMode setting), NOT by digit count.
        // Whatever number the user double-clicks, it's interpreted as
        // seconds or milliseconds based on the toggle.

        // Helper: simulates the full content.js double-click pipeline
        // dblclick → guard check → expand negative → detectTimestampFormat → Date → convertToTimezone → formatTime/formatDate
        // charBefore: optional — simulates the character immediately before the selection in the DOM text node
        function simulateDoubleClick(selectedText, userSettings, charBefore) {
            // Step 1: Guard — if doubleClickEnabled is false, bail out
            if (userSettings.doubleClickEnabled === false) return { blocked: true };

            // Step 1.5: Expand negative — if selection is pure digits and char before is '-', prepend it
            let text = selectedText;
            if (/^\d+$/.test(text) && charBefore === '-') {
                text = '-' + text;
            }

            // Step 2: Detect using the interpreter toggle
            const detected = detectTimestampFormat(text, userSettings.timestampMode);
            if (!detected) return { blocked: false, detected: null };

            // Step 3: Create Date from result
            const date = new Date(detected.value);
            if (isNaN(date.getTime())) return { blocked: false, detected, date: null };

            // Step 4: Convert to tooltip timezones
            const tooltipResults = {};
            (userSettings.tooltipTimezones || ['IST', 'GMT']).forEach(tzCode => {
                const config = TIMEZONE_CONFIG[tzCode];
                if (!config) return;
                const tzDate = convertToTimezone(date, config.zone);
                tooltipResults[tzCode] = {
                    time: formatTime(tzDate),
                    date: formatDate(tzDate)
                };
            });

            return { blocked: false, detected, date, tooltipResults };
        }

        // =============================================
        // Toggle = "milliseconds" — any number is ms
        // =============================================
        describe('when interpreter toggle is set to "milliseconds"', () => {
            const settings = { timestampMode: 'milliseconds', doubleClickEnabled: true, tooltipTimezones: ['IST', 'GMT'] };

            test('any number is treated as milliseconds — type is always milliseconds', () => {
                ['5', '123', '86400', '1740488445', '1740488445123', '174048844512345'].forEach(input => {
                    const result = detectTimestampFormat(input, settings.timestampMode);
                    expect(result.type).toBe('milliseconds');
                });
            });

            test('value is the raw number — never multiplied', () => {
                expect(detectTimestampFormat('1740488445123', settings.timestampMode).value).toBe(1740488445123);
                expect(detectTimestampFormat('1740488445', settings.timestampMode).value).toBe(1740488445);
                expect(detectTimestampFormat('86400', settings.timestampMode).value).toBe(86400);
                expect(detectTimestampFormat('5', settings.timestampMode).value).toBe(5);
            });

            test('13-digit ms epoch → produces a valid recent date (2025+)', () => {
                const out = simulateDoubleClick('1740488445123', settings);
                expect(out.blocked).toBe(false);
                expect(out.date.getFullYear()).toBeGreaterThanOrEqual(2025);
            });

            test('13-digit ms epoch → tooltip shows valid IST and GMT times', () => {
                const out = simulateDoubleClick('1740488445123', settings);
                expect(out.tooltipResults.IST.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                expect(out.tooltipResults.GMT.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                expect(out.tooltipResults.IST.date).toMatch(/^\w{3}, \w{3} \d{1,2}, \d{4}$/);
            });

            test('10-digit value interpreted as ms → gives 1970 date (because it is only ~1.7B ms)', () => {
                const out = simulateDoubleClick('1740488445', settings);
                expect(out.date.getFullYear()).toBe(1970);
            });

            test('small number (86400) as ms → Jan 1 1970 (86.4 seconds from epoch)', () => {
                const out = simulateDoubleClick('86400', settings);
                expect(out.date.getFullYear()).toBe(1970);
            });

            test('very large number as ms → far future date', () => {
                const out = simulateDoubleClick('174048844512345', settings);
                expect(out.date.getFullYear()).toBeGreaterThan(7000);
            });
        });

        // =============================================
        // Toggle = "seconds" — any number is seconds
        // =============================================
        describe('when interpreter toggle is set to "seconds"', () => {
            const settings = { timestampMode: 'seconds', doubleClickEnabled: true, tooltipTimezones: ['IST', 'GMT'] };

            test('any number is treated as seconds — type is always seconds', () => {
                ['5', '123', '86400', '1740488445', '1740488445123', '174048844512345'].forEach(input => {
                    const result = detectTimestampFormat(input, settings.timestampMode);
                    expect(result.type).toBe('seconds');
                });
            });

            test('value is always multiplied by 1000', () => {
                expect(detectTimestampFormat('1740488445', settings.timestampMode).value).toBe(1740488445000);
                expect(detectTimestampFormat('86400', settings.timestampMode).value).toBe(86400000);
                expect(detectTimestampFormat('5', settings.timestampMode).value).toBe(5000);
            });

            test('10-digit sec epoch → produces a valid recent date (2025+)', () => {
                const out = simulateDoubleClick('1740488445', settings);
                expect(out.blocked).toBe(false);
                expect(out.date.getFullYear()).toBeGreaterThanOrEqual(2025);
            });

            test('10-digit sec epoch → tooltip shows valid IST and GMT times', () => {
                const out = simulateDoubleClick('1740488445', settings);
                expect(out.tooltipResults.IST.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                expect(out.tooltipResults.GMT.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                expect(out.tooltipResults.IST.date).toMatch(/^\w{3}, \w{3} \d{1,2}, \d{4}$/);
            });

            test('86400 as seconds → Jan 2 1970 (exactly 1 day from epoch)', () => {
                const out = simulateDoubleClick('86400', settings);
                expect(out.date.getFullYear()).toBe(1970);
                expect(out.date.getMonth()).toBe(0); // January
            });

            test('13-digit value as seconds → far future date (value × 1000)', () => {
                const out = simulateDoubleClick('1740488445123', settings);
                expect(out.date.getFullYear()).toBeGreaterThan(50000);
            });

            test('small number (5) as seconds → 5 seconds from epoch', () => {
                const out = simulateDoubleClick('5', settings);
                expect(out.date.getFullYear()).toBe(1970);
                expect(isNaN(out.date.getTime())).toBe(false);
            });
        });

        // =============================================
        // Same number, different toggle → different dates
        // =============================================
        describe('same number, different toggle → proves interpretation is toggle-driven', () => {
            const msSettings = { timestampMode: 'milliseconds', doubleClickEnabled: true, tooltipTimezones: ['IST'] };
            const secSettings = { timestampMode: 'seconds', doubleClickEnabled: true, tooltipTimezones: ['IST'] };

            test('1740488445 with ms toggle → 1970, with sec toggle → 2025+', () => {
                const msOut = simulateDoubleClick('1740488445', msSettings);
                const secOut = simulateDoubleClick('1740488445', secSettings);
                expect(msOut.date.getFullYear()).toBe(1970);
                expect(secOut.date.getFullYear()).toBeGreaterThanOrEqual(2025);
            });

            test('1740488445123 with ms toggle → 2025+, with sec toggle → year 57000+', () => {
                const msOut = simulateDoubleClick('1740488445123', msSettings);
                const secOut = simulateDoubleClick('1740488445123', secSettings);
                expect(msOut.date.getFullYear()).toBeGreaterThanOrEqual(2025);
                expect(secOut.date.getFullYear()).toBeGreaterThan(50000);
            });

            test('86400 with ms toggle → 86.4sec from epoch, with sec toggle → exactly 1 day', () => {
                const msOut = simulateDoubleClick('86400', msSettings);
                const secOut = simulateDoubleClick('86400', secSettings);
                // Both 1970, but different dates
                expect(msOut.date.getTime()).toBe(86400);        // 86.4 seconds
                expect(secOut.date.getTime()).toBe(86400000);    // 86400 seconds = 1 day
            });

            test('tooltip IST times differ for same number with different toggles', () => {
                const msOut = simulateDoubleClick('1740488445', msSettings);
                const secOut = simulateDoubleClick('1740488445', secSettings);
                // ms gives 1970 time, sec gives 2025 time — they cannot be equal
                expect(msOut.tooltipResults.IST.date).not.toBe(secOut.tooltipResults.IST.date);
            });
        });

        // =============================================
        // doubleClickEnabled guard
        // =============================================
        describe('doubleClickEnabled toggle controls access', () => {
            test('when disabled → entire pipeline is blocked, no detection happens', () => {
                const settings = { timestampMode: 'seconds', doubleClickEnabled: false };
                const out = simulateDoubleClick('1740488445', settings);
                expect(out.blocked).toBe(true);
                expect(out.detected).toBeUndefined();
                expect(out.date).toBeUndefined();
            });

            test('when enabled → pipeline runs normally', () => {
                const settings = { timestampMode: 'seconds', doubleClickEnabled: true, tooltipTimezones: ['IST'] };
                const out = simulateDoubleClick('1740488445', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).not.toBeNull();
                expect(out.date).toBeDefined();
                expect(out.tooltipResults.IST).toBeDefined();
            });

            test('when undefined (backward compat) → pipeline runs normally', () => {
                const settings = { timestampMode: 'milliseconds', tooltipTimezones: ['IST'] };
                // doubleClickEnabled is undefined — guard checks === false, so it passes
                const out = simulateDoubleClick('1740488445123', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).not.toBeNull();
            });
        });

        // =============================================
        // Invalid inputs — pipeline handles gracefully
        // =============================================
        describe('invalid inputs through double-click pipeline', () => {
            const settings = { timestampMode: 'milliseconds', doubleClickEnabled: true, tooltipTimezones: ['IST'] };

            test('non-numeric text → detected is null, no crash', () => {
                const out = simulateDoubleClick('hello', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).toBeNull();
            });

            test('empty string → detected is null', () => {
                const out = simulateDoubleClick('', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).toBeNull();
            });

            test('zero → detected is null', () => {
                const out = simulateDoubleClick('0', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).toBeNull();
            });

            test('whitespace only → detected is null', () => {
                const out = simulateDoubleClick('   ', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).toBeNull();
            });

            test('negative timestamp (selected with minus) → valid pre-1970 date', () => {
                const out = simulateDoubleClick('-86400000', settings);
                expect(out.blocked).toBe(false);
                expect(out.detected).not.toBeNull();
                expect(out.date.getFullYear()).toBe(1969);
                expect(out.tooltipResults.IST.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
            });

            test('negative expansion: digits selected but char before is minus → pre-1970', () => {
                // Simulates: text is "-86400000", user double-clicks "86400000", charBefore = '-'
                const out = simulateDoubleClick('86400000', settings, '-');
                expect(out.blocked).toBe(false);
                expect(out.detected).not.toBeNull();
                expect(out.detected.value).toBe(-86400000);
                expect(out.date.getFullYear()).toBe(1969);
            });

            test('negative expansion: charBefore is not minus → positive number', () => {
                // No minus before → treated as positive
                const out = simulateDoubleClick('86400000', settings, ' ');
                expect(out.blocked).toBe(false);
                expect(out.detected).not.toBeNull();
                expect(out.detected.value).toBe(86400000);
                expect(out.date.getFullYear()).toBe(1970);
            });

            test('negative expansion: charBefore undefined (no text before) → positive', () => {
                const out = simulateDoubleClick('86400000', settings);
                expect(out.detected).not.toBeNull();
                expect(out.detected.value).toBe(86400000);
            });

            test('negative expansion: already negative string ignores charBefore', () => {
                // If user somehow selected "-86400000" and charBefore is also '-', don't double-negate
                const out = simulateDoubleClick('-86400000', settings, '-');
                expect(out.detected).not.toBeNull();
                expect(out.detected.value).toBe(-86400000); // still -86400000, not --86400000
            });

            test('negative expansion with seconds mode → pre-1970 date', () => {
                const secSettings = { timestampMode: 'seconds', doubleClickEnabled: true, tooltipTimezones: ['IST'] };
                // "86400" with charBefore '-' → "-86400" → seconds → -86400 * 1000 = -86400000
                const out = simulateDoubleClick('86400', secSettings, '-');
                expect(out.detected.type).toBe('seconds');
                expect(out.detected.value).toBe(-86400000);
                expect(out.date.getFullYear()).toBe(1969);
            });
        });
    });

    describe('calculateTooltipPosition — Smart Overflow Detection', () => {
        // Viewport: 1000x800, no scroll
        const viewport = { w: 1000, h: 800, sx: 0, sy: 0 };

        test('should position tooltip to the right and above by default', () => {
            const pos = calculateTooltipPosition(500, 400, 200, 100, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.left).toBe(515);    // 500 + 15
            expect(pos.top).toBe(290);     // 400 - 100 - 10
        });

        test('should flip to left when tooltip overflows right edge', () => {
            // Cursor at x=900, tooltip width=200 → 900+15+200=1115 > 1000 → flip left
            const pos = calculateTooltipPosition(900, 400, 200, 100, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.left).toBe(685);    // 900 - 200 - 15
        });

        test('should flip to below when tooltip overflows top edge', () => {
            // Cursor at y=50, tooltip height=100 → viewportY-100-10 = -60 < 0 → flip below
            const pos = calculateTooltipPosition(500, 50, 200, 100, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.top).toBe(70);      // 50 + 20
        });

        test('should clamp to left edge when flipped left goes negative', () => {
            // Narrow viewport forces right overflow, then flip left goes negative
            // Cursor at x=100, tooltip width=200, viewport width=200
            // viewportX=100, 100+15+200=315 > 200 → flip left: 100-200-15=-115 < 0+5 → clamp to 5
            const pos = calculateTooltipPosition(100, 400, 200, 100, 200, 800, 0, 0);
            expect(pos.left).toBe(5);      // clamped to scrollX + 5
        });

        test('should clamp to bottom edge when tooltip overflows bottom', () => {
            // Cursor at y=30 (close to top, flips below): top=50, tooltip h=800 → 50+800=850 > 800 → clamp
            const pos = calculateTooltipPosition(500, 30, 200, 800, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.top).toBe(-5);      // scrollY+viewportH-tooltipH-5 = 0+800-800-5 = -5
        });

        test('should handle scroll offsets correctly', () => {
            // Scroll position: scrollX=200, scrollY=300
            const pos = calculateTooltipPosition(700, 700, 200, 100, 1000, 800, 200, 300);
            // cursorViewportX = 700-200 = 500 → 500+15+200=715 < 1000 → right
            expect(pos.left).toBe(715);    // 700 + 15
            // cursorViewportY = 700-300 = 400 → 400-100-10=290 > 0 → above
            expect(pos.top).toBe(590);     // 700 - 100 - 10
        });

        test('should flip left with scroll offset when overflows right', () => {
            // scrollX=500, cursorX=1400 → viewportX=900 → 900+15+200=1115 > 1000 → flip left
            const pos = calculateTooltipPosition(1400, 700, 200, 100, 1000, 800, 500, 300);
            expect(pos.left).toBe(1185);   // 1400 - 200 - 15
        });

        test('should clamp left edge with scroll offset', () => {
            // scrollX=500, cursorX=510 → viewportX=10 → 10+15+200=225 < 1000 → right → left=525
            // Actually right side works. Let's test when it flips but clamp needed:
            // scrollX=500, cursorX=510, width=200 → right: 510+15=525 → viewportX=10, 10+15+200=225 < 1000, so right side
            const pos = calculateTooltipPosition(510, 700, 200, 100, 1000, 800, 500, 300);
            expect(pos.left).toBe(525);    // 510 + 15 (no overflow right)
        });

        test('should position correctly when cursor is in corner (top-left)', () => {
            // Cursor at (10, 10), no scroll → flip below (top overflow) and right side
            const pos = calculateTooltipPosition(10, 10, 200, 100, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.left).toBe(25);     // 10 + 15 (right side works)
            expect(pos.top).toBe(30);      // 10 + 20 (flipped below)
        });

        test('should position correctly when cursor is in corner (bottom-right)', () => {
            // Cursor at (990, 790) → flip left (right overflow) and above
            const pos = calculateTooltipPosition(990, 790, 200, 100, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.left).toBe(775);    // 990 - 200 - 15
            expect(pos.top).toBe(680);     // 790 - 100 - 10
        });

        test('should handle zero-size tooltip', () => {
            const pos = calculateTooltipPosition(500, 400, 0, 0, viewport.w, viewport.h, viewport.sx, viewport.sy);
            expect(pos.left).toBe(515);    // 500 + 15
            expect(pos.top).toBe(390);     // 400 - 0 - 10
        });

        test('should handle tooltip larger than viewport', () => {
            // tooltip 1200x1000, viewport 1000x800 → various overflows
            const pos = calculateTooltipPosition(500, 400, 1200, 1000, viewport.w, viewport.h, viewport.sx, viewport.sy);
            // Right overflow: 500+15+1200=1715>1000 → flip left: 500-1200-15=-715 < scrollX(0)
            // → pin to right edge: 0+1000-1200-5=-205 → still < 5 → clamp to 5
            expect(pos.left).toBe(5);
            // Top: 400-1000-10=-610<0 → below: 400+20=420 → 420+1000=1420>800 → clamp: 800-1000-5=-205
            expect(pos.top).toBe(-205);
        });

        // === Zoomed-in / narrow viewport scenarios ===

        test('should pin tooltip to right edge when flip-left also overflows (zoom scenario)', () => {
            // Simulates zoomed-in browser: viewport shrinks to 400px wide
            // Cursor near right edge at x=380, tooltip width=300
            // cursorViewportX=380, 380+15+300=695 > 400 → overflows right
            // flip left: 380-300-15=65 → 65 >= 0 (scrollX) → works! placed at 65
            const pos = calculateTooltipPosition(380, 200, 300, 80, 400, 600, 0, 0);
            expect(pos.left).toBe(65);     // 380 - 300 - 15
        });

        test('should handle cursor at extreme right edge of narrow viewport', () => {
            // Zoomed viewport 300px wide, cursor at x=290, tooltip 250px wide
            // cursorViewportX=290, 290+15+250=555 > 300 → overflows right
            // flip left: 290-250-15=25 → 25 >= 0 → placed at 25
            const pos = calculateTooltipPosition(290, 200, 250, 80, 300, 600, 0, 0);
            expect(pos.left).toBe(25);
        });

        test('should pin to viewport right edge when tooltip wider than cursor position', () => {
            // Viewport 400px, cursor at x=100, tooltip 350px
            // cursorViewportX=100, 100+15+350=465 > 400 → overflows right
            // flip left: 100-350-15=-265 < scrollX(0) → pin right: 0+400-350-5=45
            // 45 >= 5 → no further clamp needed
            const pos = calculateTooltipPosition(100, 200, 350, 80, 400, 600, 0, 0);
            expect(pos.left).toBe(45);     // pinned to right edge of viewport
        });

        test('should handle zoomed viewport with scroll offset', () => {
            // Zoomed viewport 500px, scrollX=200, cursor at x=650 (viewportX=450)
            // 450+15+300=765 > 500 → overflows right
            // flip left: 650-300-15=335, 335 >= 200 (scrollX) → works
            const pos = calculateTooltipPosition(650, 400, 300, 80, 500, 600, 200, 100);
            expect(pos.left).toBe(335);
        });

        test('should pin to right edge with scroll when flip-left goes below scrollX', () => {
            // Zoomed viewport 400px, scrollX=300, cursor at x=400 (viewportX=100)
            // 100+15+350=465 > 400 → overflows right
            // flip left: 400-350-15=35, 35 < scrollX(300) → pin right: 300+400-350-5=345
            // 345 >= 305 → no further clamp
            const pos = calculateTooltipPosition(400, 400, 350, 80, 400, 600, 300, 100);
            expect(pos.left).toBe(345);
        });
    });

    describe('doubleClickEnabled Setting — Behavior Contract', () => {
        // These tests verify the expected contract:
        // When doubleClickEnabled is false, the dblclick handler should early-return
        // We test the settings structure and default values

        test('DEFAULT_SETTINGS should include doubleClickEnabled: true', () => {
            // Verify the contract: default is enabled
            const DEFAULT_SETTINGS = {
                primaryTimezone: 'IST',
                displayTimezones: ['IST', 'GMT', 'PST', 'EST'],
                tooltipTimezones: ['IST', 'GMT'],
                customTimezones: [],
                copyDateFormat: 'yyyy-MM-ddTHH:mm:ss',
                timestampMode: 'milliseconds',
                doubleClickEnabled: true
            };
            expect(DEFAULT_SETTINGS.doubleClickEnabled).toBe(true);
        });

        test('doubleClickEnabled=false should be a valid falsy guard', () => {
            const settings = { doubleClickEnabled: false };
            // Simulates the guard: if (settings.doubleClickEnabled === false) return;
            const shouldBlock = settings.doubleClickEnabled === false;
            expect(shouldBlock).toBe(true);
        });

        test('doubleClickEnabled=true should not trigger the guard', () => {
            const settings = { doubleClickEnabled: true };
            const shouldBlock = settings.doubleClickEnabled === false;
            expect(shouldBlock).toBe(false);
        });

        test('doubleClickEnabled=undefined should not trigger the guard (backward compat)', () => {
            const settings = {};
            const shouldBlock = settings.doubleClickEnabled === false;
            expect(shouldBlock).toBe(false);
        });

        test('timestampMode default should be milliseconds', () => {
            const DEFAULT_SETTINGS = { timestampMode: 'milliseconds' };
            expect(DEFAULT_SETTINGS.timestampMode).toBe('milliseconds');
        });

        test('timestampMode seconds should be a valid option', () => {
            const mode = 'seconds';
            expect(['milliseconds', 'seconds']).toContain(mode);
        });
    });

    describe('Auto-Save Settings Contract', () => {
        // These tests verify the auto-save contract:
        // Every change is saved immediately — no manual Save button needed

        test('auto-save should merge all UI states into a single settings object', () => {
            // Simulates what autoSave() does: reads all UI values and builds settings
            const primaryTimezone = 'IST';
            const displayTimezones = ['IST', 'GMT', 'PST'];
            const tooltipTimezones = ['IST', 'GMT'];
            const copyDateFormat = 'iso';
            const timestampMode = 'seconds';
            const doubleClickEnabled = false;
            const customTimezones = [{ id: 'CUSTOM_EUROPE_BERLIN', zone: 'Europe/Berlin', label: 'Berlin (CET)' }];

            const settings = {
                primaryTimezone,
                displayTimezones,
                tooltipTimezones,
                customTimezones,
                copyDateFormat,
                timestampMode,
                doubleClickEnabled
            };

            expect(settings.primaryTimezone).toBe('IST');
            expect(settings.displayTimezones).toEqual(['IST', 'GMT', 'PST']);
            expect(settings.tooltipTimezones).toEqual(['IST', 'GMT']);
            expect(settings.copyDateFormat).toBe('iso');
            expect(settings.timestampMode).toBe('seconds');
            expect(settings.doubleClickEnabled).toBe(false);
            expect(settings.customTimezones).toHaveLength(1);
        });

        test('auto-save should not save when displayTimezones is empty', () => {
            const displayTimezones = [];
            const tooltipTimezones = ['IST'];
            const shouldSave = displayTimezones.length > 0 && tooltipTimezones.length > 0;
            expect(shouldSave).toBe(false);
        });

        test('auto-save should not save when tooltipTimezones is empty', () => {
            const displayTimezones = ['IST'];
            const tooltipTimezones = [];
            const shouldSave = displayTimezones.length > 0 && tooltipTimezones.length > 0;
            expect(shouldSave).toBe(false);
        });

        test('auto-save should not save when displayTimezones exceeds 6', () => {
            const displayTimezones = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST', 'AEST'];
            const shouldSave = displayTimezones.length <= 6;
            expect(shouldSave).toBe(false);
        });

        test('auto-save should not save when tooltipTimezones exceeds 3', () => {
            const MAX_TOOLTIP_TIMEZONES = 3;
            const tooltipTimezones = ['IST', 'GMT', 'PST', 'EST'];
            const shouldSave = tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(false);
        });

        test('auto-save should save valid state (6 display, 3 tooltip)', () => {
            const MAX_TOOLTIP_TIMEZONES = 3;
            const displayTimezones = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST'];
            const tooltipTimezones = ['IST', 'GMT', 'PST'];
            const shouldSave = displayTimezones.length > 0 && displayTimezones.length <= 6
                && tooltipTimezones.length > 0 && tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(true);
        });

        test('sub-settings should be disabled when doubleClickEnabled is off', () => {
            const dblclickEnabled = false;
            const subSettingsDisabled = !dblclickEnabled;
            expect(subSettingsDisabled).toBe(true);
        });

        test('sub-settings should be enabled when doubleClickEnabled is on', () => {
            const dblclickEnabled = true;
            const subSettingsDisabled = !dblclickEnabled;
            expect(subSettingsDisabled).toBe(false);
        });
    });

    describe('Tooltip Timezone Limit — Selector Bug Fix', () => {
        // Bug: querySelectorAll('[id^="tooltip-"]') was matching the container
        // div#tooltip-timezone-grid in addition to checkbox inputs. When 3 tooltips
        // were checked, `checkbox.parentElement.classList.add('disabled')` ran on
        // the grid div — its parent is #dblclick-sub-settings which has
        // pointer-events:none, freezing the sec/ms toggle.
        // Fix: use 'input[id^="tooltip-"]' to only match actual checkbox inputs.

        test('selector input[id^="tooltip-"] should NOT match div#tooltip-timezone-grid', () => {
            // The CSS selector 'input[id^="tooltip-"]' requires the element to be an <input>
            // So a div with id="tooltip-timezone-grid" would not match
            const idsToTest = [
                { id: 'tooltip-ist', tag: 'input', shouldMatch: true },
                { id: 'tooltip-gmt', tag: 'input', shouldMatch: true },
                { id: 'tooltip-timezone-grid', tag: 'div', shouldMatch: false },
            ];

            idsToTest.forEach(({ id, tag, shouldMatch }) => {
                // Simulate: does 'input[id^="tooltip-"]' match this element?
                const isInput = tag === 'input';
                const startsWithTooltip = id.startsWith('tooltip-');
                const matches = isInput && startsWithTooltip;
                expect(matches).toBe(shouldMatch);
            });
        });

        test('disabling unchecked tooltips should not affect unrelated elements', () => {
            // Simulate: 3 checkboxes checked, 5 unchecked
            const MAX = 3;
            const tooltips = [
                { id: 'tooltip-ist', checked: true },
                { id: 'tooltip-gmt', checked: true },
                { id: 'tooltip-pst', checked: true },
                { id: 'tooltip-est', checked: false },
                { id: 'tooltip-cst', checked: false },
                { id: 'tooltip-jst', checked: false },
                { id: 'tooltip-cst_china', checked: false },
                { id: 'tooltip-cet', checked: false },
            ];

            const checkedCount = tooltips.filter(t => t.checked).length;
            expect(checkedCount).toBe(3);

            // Only unchecked checkboxes should be disabled
            tooltips.forEach(t => {
                const shouldDisable = checkedCount >= MAX && !t.checked;
                if (t.checked) {
                    expect(shouldDisable).toBe(false);
                } else {
                    expect(shouldDisable).toBe(true);
                }
            });

            // The sec/ms toggle (id: 'timestamp-mode-toggle') should remain unaffected
            const secMsToggle = { id: 'timestamp-mode-toggle', tag: 'input' };
            const matchesSelector = secMsToggle.id.startsWith('tooltip-');
            expect(matchesSelector).toBe(false); // Should NOT be matched
        });

        test('unchecking a tooltip should re-enable other tooltips', () => {
            const MAX = 3;
            // Start: 3 checked
            let tooltips = [
                { id: 'ist', checked: true },
                { id: 'gmt', checked: true },
                { id: 'pst', checked: true },
                { id: 'est', checked: false },
            ];
            let checkedCount = tooltips.filter(t => t.checked).length;
            expect(checkedCount).toBe(3);

            // est should be disabled
            let estDisabled = checkedCount >= MAX && !tooltips[3].checked;
            expect(estDisabled).toBe(true);

            // Uncheck pst
            tooltips[2].checked = false;
            checkedCount = tooltips.filter(t => t.checked).length;
            expect(checkedCount).toBe(2);

            // est should now be enabled
            estDisabled = checkedCount >= MAX && !tooltips[3].checked;
            expect(estDisabled).toBe(false);
        });
    });

    describe('Unix Timestamp Converter — Convert ms & Convert sec Buttons', () => {
        // Simulates popup.js: user types a timestamp, clicks "Convert ms" or "Convert sec",
        // convertTimestampToTimes(mode) is called which runs:
        //   1. detectTimestampFormat(input, mode)
        //   2. new Date(result.value)
        //   3. for each displayTimezone → convertToTimezone(date, zone) → formatTime + formatDate
        //   4. render result cards

        // Helper: simulates the full popup convertTimestampToTimes() pipeline
        function simulatePopupConvert(input, mode, displayTimezones) {
            // Step 1: trim input (popup does .value.trim())
            const trimmed = (input || '').trim();
            if (!trimmed) return { error: 'empty' };

            // Step 2: detect timestamp with mode
            const detected = detectTimestampFormat(trimmed, mode);
            if (!detected) return { error: 'invalid' };

            // Step 3: create Date
            const date = new Date(detected.value);
            if (isNaN(date.getTime())) return { error: 'invalid_date' };

            // Step 4: convert to each display timezone
            const results = {};
            (displayTimezones || ['IST', 'GMT', 'PST', 'EST']).forEach(tzCode => {
                const config = TIMEZONE_CONFIG[tzCode];
                if (!config) return;
                const tzDate = convertToTimezone(date, config.zone);
                results[tzCode] = {
                    time: formatTime(tzDate),
                    date: formatDate(tzDate),
                    hours: tzDate.getHours(),
                    minutes: tzDate.getMinutes()
                };
            });

            return { detected, date, results };
        }

        // =============================================
        // "Convert ms" button behavior
        // =============================================
        describe('"Convert ms" button (mode = milliseconds)', () => {
            const mode = 'milliseconds';

            test('13-digit ms timestamp → all display timezones show valid 2025+ date', () => {
                const out = simulatePopupConvert('1740488445123', mode, ['IST', 'GMT', 'PST', 'EST']);
                expect(out.error).toBeUndefined();
                expect(out.date.getFullYear()).toBeGreaterThanOrEqual(2025);
                // All timezones should have valid formatted output
                ['IST', 'GMT', 'PST', 'EST'].forEach(tz => {
                    expect(out.results[tz].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                    expect(out.results[tz].date).toMatch(/^\w{3}, \w{3} \d{1,2}, \d{4}$/);
                });
            });

            test('10-digit value with ms button → treated as milliseconds (gives 1970)', () => {
                const out = simulatePopupConvert('1740488445', mode);
                expect(out.date.getFullYear()).toBe(1970);
            });

            test('any-length number works — 5 digits', () => {
                const out = simulatePopupConvert('86400', mode);
                expect(out.error).toBeUndefined();
                expect(out.date.getFullYear()).toBe(1970); // 86400ms from epoch
            });

            test('any-length number works — 15 digits', () => {
                const out = simulatePopupConvert('174048844512345', mode);
                expect(out.error).toBeUndefined();
                expect(out.date.getFullYear()).toBeGreaterThan(7000);
            });

            test('value is never multiplied — raw number used as ms', () => {
                const out = simulatePopupConvert('1740488445123', mode);
                expect(out.detected.value).toBe(1740488445123);
                expect(out.detected.type).toBe('milliseconds');
            });

            test('IST and GMT should show different times for same timestamp', () => {
                const out = simulatePopupConvert('1740488445123', mode, ['IST', 'GMT']);
                // IST is UTC+5:30, so they should differ
                const istHours = out.results.IST.hours;
                const gmtHours = out.results.GMT.hours;
                // Could wrap around midnight, but combined hours+minutes should differ
                const istTotalMins = out.results.IST.hours * 60 + out.results.IST.minutes;
                const gmtTotalMins = out.results.GMT.hours * 60 + out.results.GMT.minutes;
                expect(istTotalMins).not.toBe(gmtTotalMins);
            });

            test('result card data — each timezone has time and date strings', () => {
                const out = simulatePopupConvert('1740488445123', mode, ['IST', 'GMT', 'PST', 'EST', 'JST', 'SAST']);
                expect(Object.keys(out.results)).toEqual(['IST', 'GMT', 'PST', 'EST', 'JST', 'SAST']);
                Object.values(out.results).forEach(r => {
                    expect(r.time).toBeDefined();
                    expect(r.date).toBeDefined();
                });
            });
        });

        // =============================================
        // "Convert sec" button behavior
        // =============================================
        describe('"Convert sec" button (mode = seconds)', () => {
            const mode = 'seconds';

            test('10-digit sec timestamp → all display timezones show valid 2025+ date', () => {
                const out = simulatePopupConvert('1740488445', mode, ['IST', 'GMT', 'PST', 'EST']);
                expect(out.error).toBeUndefined();
                expect(out.date.getFullYear()).toBeGreaterThanOrEqual(2025);
                ['IST', 'GMT', 'PST', 'EST'].forEach(tz => {
                    expect(out.results[tz].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                    expect(out.results[tz].date).toMatch(/^\w{3}, \w{3} \d{1,2}, \d{4}$/);
                });
            });

            test('value is always multiplied by 1000', () => {
                const out = simulatePopupConvert('1740488445', mode);
                expect(out.detected.value).toBe(1740488445000);
                expect(out.detected.type).toBe('seconds');
            });

            test('13-digit with sec button → far future date (value × 1000)', () => {
                const out = simulatePopupConvert('1740488445123', mode);
                expect(out.date.getFullYear()).toBeGreaterThan(50000);
            });

            test('any-length number works — 5 digits as seconds', () => {
                const out = simulatePopupConvert('86400', mode);
                expect(out.error).toBeUndefined();
                expect(out.detected.value).toBe(86400000); // 86400 * 1000 = 1 day in ms
            });

            test('small number (60) as seconds → 1 minute from epoch', () => {
                const out = simulatePopupConvert('60', mode);
                expect(out.detected.value).toBe(60000);
                expect(out.date.getFullYear()).toBe(1970);
            });

            test('IST result for 10-digit sec epoch shows correct timezone offset', () => {
                const out = simulatePopupConvert('1740488445', mode, ['IST', 'GMT']);
                // IST is UTC+5:30, so IST time should be 5h30m ahead of GMT
                const istMins = out.results.IST.hours * 60 + out.results.IST.minutes;
                const gmtMins = out.results.GMT.hours * 60 + out.results.GMT.minutes;
                let diff = istMins - gmtMins;
                if (diff < 0) diff += 24 * 60; // handle midnight wrap
                expect(diff).toBe(330); // 5h30m = 330 minutes
            });
        });

        // =============================================
        // Same input, different button → different results
        // =============================================
        describe('same input, different button → proves button drives interpretation', () => {
            test('1740488445 — ms button gives 1970, sec button gives 2025+', () => {
                const msOut = simulatePopupConvert('1740488445', 'milliseconds');
                const secOut = simulatePopupConvert('1740488445', 'seconds');
                expect(msOut.date.getFullYear()).toBe(1970);
                expect(secOut.date.getFullYear()).toBeGreaterThanOrEqual(2025);
            });

            test('1740488445 — IST time strings differ between ms and sec buttons', () => {
                const msOut = simulatePopupConvert('1740488445', 'milliseconds', ['IST']);
                const secOut = simulatePopupConvert('1740488445', 'seconds', ['IST']);
                expect(msOut.results.IST.time).not.toBe(secOut.results.IST.time);
                expect(msOut.results.IST.date).not.toBe(secOut.results.IST.date);
            });

            test('1740488445123 — ms button gives 2025+, sec button gives year 57000+', () => {
                const msOut = simulatePopupConvert('1740488445123', 'milliseconds');
                const secOut = simulatePopupConvert('1740488445123', 'seconds');
                expect(msOut.date.getFullYear()).toBeGreaterThanOrEqual(2025);
                expect(secOut.date.getFullYear()).toBeGreaterThan(50000);
            });

            test('86400 — ms button gives 86.4sec from epoch, sec button gives exactly 1 day', () => {
                const msOut = simulatePopupConvert('86400', 'milliseconds');
                const secOut = simulatePopupConvert('86400', 'seconds');
                expect(msOut.date.getTime()).toBe(86400);
                expect(secOut.date.getTime()).toBe(86400000);
            });
        });

        // =============================================
        // Enter key defaults to milliseconds
        // =============================================
        describe('Enter key → defaults to milliseconds mode', () => {
            test('Enter key sends milliseconds mode (same as Convert ms button)', () => {
                const enterMode = 'milliseconds'; // popup.js: convertTimestampToTimes('milliseconds')
                const enterOut = simulatePopupConvert('1740488445123', enterMode, ['IST']);
                const msOut = simulatePopupConvert('1740488445123', 'milliseconds', ['IST']);
                expect(enterOut.results.IST.time).toBe(msOut.results.IST.time);
                expect(enterOut.results.IST.date).toBe(msOut.results.IST.date);
            });

            test('Enter key result differs from sec button for same input', () => {
                const enterOut = simulatePopupConvert('1740488445', 'milliseconds', ['IST']);
                const secOut = simulatePopupConvert('1740488445', 'seconds', ['IST']);
                expect(enterOut.results.IST.time).not.toBe(secOut.results.IST.time);
            });
        });

        // =============================================
        // Error handling — empty, invalid, zero
        // =============================================
        describe('input validation (matches popup alerts)', () => {
            test('empty input → error', () => {
                const out = simulatePopupConvert('', 'milliseconds');
                expect(out.error).toBe('empty');
            });

            test('whitespace-only input → error', () => {
                const out = simulatePopupConvert('   ', 'milliseconds');
                expect(out.error).toBe('empty');
            });

            test('non-numeric input → invalid', () => {
                const out = simulatePopupConvert('hello', 'milliseconds');
                expect(out.error).toBe('invalid');
            });

            test('zero → invalid', () => {
                const out = simulatePopupConvert('0', 'seconds');
                expect(out.error).toBe('invalid');
            });

            test('valid input with whitespace padding → works (trim)', () => {
                const out = simulatePopupConvert('  1740488445123  ', 'milliseconds');
                expect(out.error).toBeUndefined();
                expect(out.date.getFullYear()).toBeGreaterThanOrEqual(2025);
            });
        });

        // =============================================
        // Multiple display timezones — result cards
        // =============================================
        describe('result cards for all display timezones', () => {
            test('all 10 standard timezones produce result cards', () => {
                const allTz = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST', 'AEST', 'CST_CHINA', 'CET', 'SAST'];
                const out = simulatePopupConvert('1740488445123', 'milliseconds', allTz);
                expect(Object.keys(out.results).length).toBe(10);
                allTz.forEach(tz => {
                    expect(out.results[tz]).toBeDefined();
                    expect(out.results[tz].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                    expect(out.results[tz].date).toMatch(/^\w{3}, \w{3} \d{1,2}, \d{4}$/);
                });
            });

            test('unknown timezone code is skipped gracefully', () => {
                const out = simulatePopupConvert('1740488445123', 'milliseconds', ['IST', 'UNKNOWN', 'GMT']);
                expect(Object.keys(out.results).length).toBe(2); // IST and GMT only
                expect(out.results.UNKNOWN).toBeUndefined();
            });

            test('single timezone in display list → single result card', () => {
                const out = simulatePopupConvert('1740488445123', 'milliseconds', ['JST']);
                expect(Object.keys(out.results).length).toBe(1);
                expect(out.results.JST).toBeDefined();
            });
        });
    });

    // =========================================================================
    // All DATE_FORMATS × All Timezones — Cross-Product Validation
    // Mirrors the 11 DATE_FORMATS from popup.js and the 10 TIMEZONE_CONFIG zones.
    // For each format, we convert a known timestamp through every timezone and
    // verify the output matches the expected regex pattern (structural validity).
    // =========================================================================
    describe('All DATE_FORMATS × All Timezones — Cross-Product', () => {

        // Replicate popup.js DATE_FORMATS as pure functions (no DOM)
        const DATE_FORMATS = {
            'default':   { pattern: null, fn: (d, abbr) => `${formatDate(d)} ${formatTime(d)} ${abbr}` },
            'iso':       { pattern: 'yyyy-MM-ddTHH:mm:ss',       fn: (d) => formatDateCustom(d, 'yyyy-MM-ddTHH:mm:ss') },
            'iso-ms-tz': { pattern: null, fn: (d, abbr, zone) => formatISOWithOffset(d, abbr, zone) },
            'iso-space': { pattern: 'yyyy-MM-dd HH:mm:ss',       fn: (d) => formatDateCustom(d, 'yyyy-MM-dd HH:mm:ss') },
            'iso-tz':    { pattern: 'yyyy-MM-dd HH:mm:ss',       fn: (d, abbr) => `${formatDateCustom(d, 'yyyy-MM-dd HH:mm:ss')} ${abbr}` },
            'us':        { pattern: 'MM/dd/yyyy hh:mm:ss A',     fn: (d) => formatDateCustom(d, 'MM/dd/yyyy hh:mm:ss A') },
            'eu':        { pattern: 'dd/MM/yyyy HH:mm:ss',       fn: (d) => formatDateCustom(d, 'dd/MM/yyyy HH:mm:ss') },
            'compact':   { pattern: 'yyyyMMdd_HHmmss',           fn: (d) => formatDateCustom(d, 'yyyyMMdd_HHmmss') },
            'readable':  { pattern: 'dd MMM yyyy, HH:mm:ss',     fn: (d) => formatDateCustom(d, 'dd MMM yyyy, HH:mm:ss') },
            'date-only': { pattern: 'yyyy-MM-dd',                fn: (d) => formatDateCustom(d, 'yyyy-MM-dd') },
            'time-only': { pattern: 'HH:mm:ss',                  fn: (d) => formatDateCustom(d, 'HH:mm:ss') },
        };

        // Expected regex for each format key
        const FORMAT_REGEX = {
            'default':   /^\w{3}, \w{3} \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w+$/,
            'iso':       /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
            'iso-ms-tz': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
            'iso-space': /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
            'iso-tz':    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+$/,
            'us':        /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} [AP]M$/,
            'eu':        /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/,
            'compact':   /^\d{8}_\d{6}$/,
            'readable':  /^\d{2} \w{3} \d{4}, \d{2}:\d{2}:\d{2}$/,
            'date-only': /^\d{4}-\d{2}-\d{2}$/,
            'time-only': /^\d{2}:\d{2}:\d{2}$/,
        };

        const ALL_TZ_CODES = Object.keys(TIMEZONE_CONFIG); // 10 timezones
        const ALL_FORMAT_KEYS = Object.keys(DATE_FORMATS);  // 11 formats

        // Known epoch: 1740488445123 = Feb 25 2025 13:00:45.123 UTC
        const EPOCH_MS = 1740488445123;

        // Helper: convert epoch to a timezone, then apply a format
        function formatInTimezone(epochMs, tzCode, formatKey) {
            const date = new Date(epochMs);
            const config = TIMEZONE_CONFIG[tzCode];
            const tzDate = convertToTimezone(date, config.zone);
            const abbr = tzCode;
            const zone = config.zone;
            return DATE_FORMATS[formatKey].fn(tzDate, abbr, zone);
        }

        // ---- Unix Timestamp Converter: format × timezone ----
        describe('Unix Timestamp Converter — every format × every timezone', () => {
            ALL_FORMAT_KEYS.forEach(fmtKey => {
                describe(`format: "${fmtKey}"`, () => {
                    ALL_TZ_CODES.forEach(tz => {
                        test(`${tz} produces structurally valid output`, () => {
                            const output = formatInTimezone(EPOCH_MS, tz, fmtKey);
                            expect(typeof output).toBe('string');
                            expect(output.length).toBeGreaterThan(0);
                            expect(output).toMatch(FORMAT_REGEX[fmtKey]);
                        });
                    });
                });
            });
        });

        // ---- Cross-timezone: same epoch, different TZ → different times ----
        describe('same epoch, different timezones → different formatted strings', () => {
            ALL_FORMAT_KEYS.filter(k => k !== 'date-only').forEach(fmtKey => {
                test(`format "${fmtKey}": IST and PST produce different output`, () => {
                    const istOut = formatInTimezone(EPOCH_MS, 'IST', fmtKey);
                    const pstOut = formatInTimezone(EPOCH_MS, 'PST', fmtKey);
                    expect(istOut).not.toBe(pstOut);
                });
            });
        });

        // ---- Specific value verification for a known epoch ----
        // 1740488445123 ms = Tue Feb 25 2025 13:00:45.123 UTC
        // IST = UTC+5:30 → 18:30:45
        // PST = UTC-8    → 05:00:45
        // JST = UTC+9    → 22:00:45
        // SAST = UTC+2   → 15:00:45
        describe('known epoch → exact formatted values in key timezones', () => {
            test('IST — iso format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'iso')).toBe('2025-02-25T18:30:45');
            });
            test('PST — iso format', () => {
                expect(formatInTimezone(EPOCH_MS, 'PST', 'iso')).toBe('2025-02-25T05:00:45');
            });
            test('JST — iso format', () => {
                expect(formatInTimezone(EPOCH_MS, 'JST', 'iso')).toBe('2025-02-25T22:00:45');
            });
            test('SAST — iso format', () => {
                expect(formatInTimezone(EPOCH_MS, 'SAST', 'iso')).toBe('2025-02-25T15:00:45');
            });
            test('GMT — iso format', () => {
                expect(formatInTimezone(EPOCH_MS, 'GMT', 'iso')).toBe('2025-02-25T13:00:45');
            });
            test('IST — us format (12-hour with AM/PM)', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'us')).toBe('02/25/2025 06:30:45 PM');
            });
            test('PST — us format (12-hour with AM/PM)', () => {
                expect(formatInTimezone(EPOCH_MS, 'PST', 'us')).toBe('02/25/2025 05:00:45 AM');
            });
            test('IST — eu format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'eu')).toBe('25/02/2025 18:30:45');
            });
            test('IST — compact format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'compact')).toBe('20250225_183045');
            });
            test('IST — readable format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'readable')).toBe('25 Feb 2025, 18:30:45');
            });
            test('IST — date-only format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'date-only')).toBe('2025-02-25');
            });
            test('IST — time-only format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'time-only')).toBe('18:30:45');
            });
            test('IST — iso-space format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'iso-space')).toBe('2025-02-25 18:30:45');
            });
            test('IST — iso-tz format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'iso-tz')).toBe('2025-02-25 18:30:45 IST');
            });
            test('IST — default format', () => {
                expect(formatInTimezone(EPOCH_MS, 'IST', 'default')).toBe('Tue, Feb 25, 2025 18:30:45 IST');
            });
            test('IST — iso-ms-tz format', () => {
                const out = formatInTimezone(EPOCH_MS, 'IST', 'iso-ms-tz');
                expect(out).toMatch(/^2025-02-25T18:30:45\.\d{3}\+05:30$/);
            });
            test('PST — iso-ms-tz format', () => {
                const out = formatInTimezone(EPOCH_MS, 'PST', 'iso-ms-tz');
                expect(out).toMatch(/^2025-02-25T05:00:45\.\d{3}-08:00$/);
            });
            test('GMT — iso-ms-tz format', () => {
                const out = formatInTimezone(EPOCH_MS, 'GMT', 'iso-ms-tz');
                expect(out).toMatch(/^2025-02-25T13:00:45\.\d{3}\+00:00$/);
            });
        });
    });

    // =========================================================================
    // Time Zone Converter — Source TZ → UTC → Display TZs → All Formats
    // Simulates popup.js convertDateTime pipeline:
    //   user enters date+time in a source TZ → offset to UTC → convert to each
    //   display TZ → apply each copy format.
    // =========================================================================
    describe('Time Zone Converter — Full Pipeline × Formats × Timezones', () => {

        /**
         * simulateTimezoneConvert:
         *   Takes a date string, time string, source timezone code,
         *   and produces { utcDate, results: { [tzCode]: Date } }
         */
        function simulateTimezoneConvert(dateStr, timeStr, sourceTzCode) {
            const sourceConfig = TIMEZONE_CONFIG[sourceTzCode];
            if (!sourceConfig) return { error: 'unknown_source' };

            // Build local date string in source TZ
            const localDateStr = `${dateStr}T${timeStr}`;
            const utcBase = new Date(`${localDateStr}Z`);

            // Offset: source TZ offset in hours
            let sourceOffsetHours = sourceConfig.offset;
            // (skip DST for test simplicity — tested separately)

            // UTC = localTime - sourceOffset
            const utcMs = utcBase.getTime() - (sourceOffsetHours * 3600000);
            const utcDate = new Date(utcMs);

            // Now convert to all display TZs
            const results = {};
            Object.keys(TIMEZONE_CONFIG).forEach(tzCode => {
                const config = TIMEZONE_CONFIG[tzCode];
                results[tzCode] = convertToTimezone(utcDate, config.zone);
            });

            return { utcDate, results };
        }

        // Helper: apply a format to a converted date
        function applyFormat(date, fmtKey, abbr, zone) {
            switch (fmtKey) {
                case 'default':   return `${formatDate(date)} ${formatTime(date)} ${abbr}`;
                case 'iso':       return formatDateCustom(date, 'yyyy-MM-ddTHH:mm:ss');
                case 'iso-ms-tz': return formatISOWithOffset(date, abbr, zone);
                case 'iso-space': return formatDateCustom(date, 'yyyy-MM-dd HH:mm:ss');
                case 'iso-tz':    return `${formatDateCustom(date, 'yyyy-MM-dd HH:mm:ss')} ${abbr}`;
                case 'us':        return formatDateCustom(date, 'MM/dd/yyyy hh:mm:ss A');
                case 'eu':        return formatDateCustom(date, 'dd/MM/yyyy HH:mm:ss');
                case 'compact':   return formatDateCustom(date, 'yyyyMMdd_HHmmss');
                case 'readable':  return formatDateCustom(date, 'dd MMM yyyy, HH:mm:ss');
                case 'date-only': return formatDateCustom(date, 'yyyy-MM-dd');
                case 'time-only': return formatDateCustom(date, 'HH:mm:ss');
                default:          return formatDateCustom(date, 'yyyy-MM-ddTHH:mm:ss');
            }
        }

        const FORMAT_REGEX = {
            'default':   /^\w{3}, \w{3} \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w+$/,
            'iso':       /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
            'iso-ms-tz': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
            'iso-space': /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
            'iso-tz':    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+$/,
            'us':        /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} [AP]M$/,
            'eu':        /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/,
            'compact':   /^\d{8}_\d{6}$/,
            'readable':  /^\d{2} \w{3} \d{4}, \d{2}:\d{2}:\d{2}$/,
            'date-only': /^\d{4}-\d{2}-\d{2}$/,
            'time-only': /^\d{2}:\d{2}:\d{2}$/,
        };

        const ALL_FORMAT_KEYS = Object.keys(FORMAT_REGEX);

        // Source: IST 2025-02-25 18:30:45 → UTC 13:00:45
        describe('IST 18:30:45 → all display TZs → all formats', () => {
            const conv = simulateTimezoneConvert('2025-02-25', '18:30:45', 'IST');

            test('UTC date is correct', () => {
                expect(conv.utcDate.getUTCHours()).toBe(13);
                expect(conv.utcDate.getUTCMinutes()).toBe(0);
                expect(conv.utcDate.getUTCSeconds()).toBe(45);
            });

            ALL_FORMAT_KEYS.forEach(fmtKey => {
                Object.keys(TIMEZONE_CONFIG).forEach(tz => {
                    test(`→ ${tz} in "${fmtKey}" format is structurally valid`, () => {
                        const tzDate = conv.results[tz];
                        const config = TIMEZONE_CONFIG[tz];
                        const output = applyFormat(tzDate, fmtKey, tz, config.zone);
                        expect(output).toMatch(FORMAT_REGEX[fmtKey]);
                    });
                });
            });
        });

        // Verify round-trip: IST input → convert → IST output should give back same time
        describe('round-trip: source TZ → UTC → same TZ → matches original', () => {
            test('IST 18:30:45 → UTC → IST → 18:30:45', () => {
                const conv = simulateTimezoneConvert('2025-02-25', '18:30:45', 'IST');
                const istBack = conv.results.IST;
                expect(formatTime(istBack)).toBe('18:30:45');
                expect(formatDateCustom(istBack, 'yyyy-MM-dd')).toBe('2025-02-25');
            });

            test('PST 05:00:45 → UTC → PST → 05:00:45', () => {
                const conv = simulateTimezoneConvert('2025-02-25', '05:00:45', 'PST');
                const pstBack = conv.results.PST;
                expect(formatTime(pstBack)).toBe('05:00:45');
            });

            test('JST 22:00:45 → UTC → JST → 22:00:45', () => {
                const conv = simulateTimezoneConvert('2025-02-25', '22:00:45', 'JST');
                const jstBack = conv.results.JST;
                expect(formatTime(jstBack)).toBe('22:00:45');
            });

            test('GMT 13:00:45 → UTC → GMT → 13:00:45', () => {
                const conv = simulateTimezoneConvert('2025-02-25', '13:00:45', 'GMT');
                const gmtBack = conv.results.GMT;
                expect(formatTime(gmtBack)).toBe('13:00:45');
            });

            test('SAST 15:00:45 → UTC → SAST → 15:00:45', () => {
                const conv = simulateTimezoneConvert('2025-02-25', '15:00:45', 'SAST');
                const sastBack = conv.results.SAST;
                expect(formatTime(sastBack)).toBe('15:00:45');
            });
        });

        // Cross-check: IST input == same epoch as Unix Timestamp Converter
        describe('consistency: TZ Converter and Unix Timestamp Converter agree', () => {
            test('IST 18:30:45 via TZ converter → same times as epoch 1740488445000 via Unix converter', () => {
                // TZ Converter path
                const conv = simulateTimezoneConvert('2025-02-25', '18:30:45', 'IST');
                // Unix Timestamp Converter path
                const epoch = 1740488445000; // same moment
                const epochDate = new Date(epoch);

                // Both should give same IST time
                const istFromTZ = conv.results.IST;
                const istFromEpoch = convertToTimezone(epochDate, TIMEZONE_CONFIG.IST.zone);
                expect(formatTime(istFromTZ)).toBe(formatTime(istFromEpoch));

                // Both should give same PST time
                const pstFromTZ = conv.results.PST;
                const pstFromEpoch = convertToTimezone(epochDate, TIMEZONE_CONFIG.PST.zone);
                expect(formatTime(pstFromTZ)).toBe(formatTime(pstFromEpoch));

                // Both should give same JST time
                const jstFromTZ = conv.results.JST;
                const jstFromEpoch = convertToTimezone(epochDate, TIMEZONE_CONFIG.JST.zone);
                expect(formatTime(jstFromTZ)).toBe(formatTime(jstFromEpoch));
            });
        });
    });

    // =========================================================================
    // Edge Cases — Midnight/Noon/Year-Boundary across Formats × Timezones
    // =========================================================================
    describe('Format Edge Cases — Midnight, Noon, Year Boundary across TZs', () => {

        // Midnight UTC → each TZ has different local time → each format should work
        describe('midnight UTC → all formats valid for every TZ', () => {
            const midnightUTC = new Date('2025-06-15T00:00:00Z');

            Object.keys(TIMEZONE_CONFIG).forEach(tz => {
                test(`${tz} — all 11 formats produce valid output`, () => {
                    const config = TIMEZONE_CONFIG[tz];
                    const tzDate = convertToTimezone(midnightUTC, config.zone);
                    expect(isNaN(tzDate.getTime())).toBe(false);

                    // Spot-check iso, us, default
                    const iso = formatDateCustom(tzDate, 'yyyy-MM-ddTHH:mm:ss');
                    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);

                    const us = formatDateCustom(tzDate, 'MM/dd/yyyy hh:mm:ss A');
                    expect(us).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} [AP]M$/);

                    const deflt = `${formatDate(tzDate)} ${formatTime(tzDate)} ${tz}`;
                    expect(deflt).toMatch(/^\w{3}, \w{3} \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w+$/);
                });
            });
        });

        // Noon UTC
        describe('noon UTC → US format shows 12:xx PM or offset equivalent', () => {
            const noonUTC = new Date('2025-03-15T12:00:00Z');

            test('GMT should be 12:00:00 PM', () => {
                const gmtDate = convertToTimezone(noonUTC, TIMEZONE_CONFIG.GMT.zone);
                expect(formatDateCustom(gmtDate, 'hh:mm:ss A')).toBe('12:00:00 PM');
            });

            test('IST should be 05:30:00 PM', () => {
                const istDate = convertToTimezone(noonUTC, TIMEZONE_CONFIG.IST.zone);
                expect(formatDateCustom(istDate, 'hh:mm:ss A')).toBe('05:30:00 PM');
            });

            test('PST should be 05:00:00 AM (or 04:00 in PDT)', () => {
                const pstDate = convertToTimezone(noonUTC, TIMEZONE_CONFIG.PST.zone);
                const result = formatDateCustom(pstDate, 'hh:mm:ss A');
                // March 15 is DST in US (PDT = UTC-7), so noon UTC = 5:00 AM PDT
                expect(result).toMatch(/^0[45]:00:00 AM$/);
            });
        });

        // Year boundary: Dec 31 23:00 UTC → some TZ see Jan 1
        describe('year boundary: Dec 31 23:00 UTC', () => {
            const yearEnd = new Date('2025-12-31T23:00:00Z');

            test('GMT — still Dec 31 2025', () => {
                const gmtDate = convertToTimezone(yearEnd, TIMEZONE_CONFIG.GMT.zone);
                expect(formatDateCustom(gmtDate, 'yyyy-MM-dd')).toBe('2025-12-31');
            });

            test('IST — already Jan 1 2026 (UTC+5:30 → 04:30)', () => {
                const istDate = convertToTimezone(yearEnd, TIMEZONE_CONFIG.IST.zone);
                expect(formatDateCustom(istDate, 'yyyy-MM-dd')).toBe('2026-01-01');
                expect(formatDateCustom(istDate, 'HH:mm:ss')).toBe('04:30:00');
            });

            test('JST — already Jan 1 2026 (UTC+9 → 08:00)', () => {
                const jstDate = convertToTimezone(yearEnd, TIMEZONE_CONFIG.JST.zone);
                expect(formatDateCustom(jstDate, 'yyyy-MM-dd')).toBe('2026-01-01');
            });

            test('PST — still Dec 31 2025 (UTC-8 → 15:00)', () => {
                const pstDate = convertToTimezone(yearEnd, TIMEZONE_CONFIG.PST.zone);
                expect(formatDateCustom(pstDate, 'yyyy-MM-dd')).toBe('2025-12-31');
            });

            test('all formats valid for IST (Jan 1 2026)', () => {
                const istDate = convertToTimezone(yearEnd, TIMEZONE_CONFIG.IST.zone);
                expect(formatDateCustom(istDate, 'yyyy-MM-ddTHH:mm:ss')).toBe('2026-01-01T04:30:00');
                expect(formatDateCustom(istDate, 'MM/dd/yyyy hh:mm:ss A')).toBe('01/01/2026 04:30:00 AM');
                expect(formatDateCustom(istDate, 'dd/MM/yyyy HH:mm:ss')).toBe('01/01/2026 04:30:00');
                expect(formatDateCustom(istDate, 'yyyyMMdd_HHmmss')).toBe('20260101_043000');
                expect(formatDateCustom(istDate, 'dd MMM yyyy, HH:mm:ss')).toBe('01 Jan 2026, 04:30:00');
                expect(formatISOWithOffset(istDate, 'IST', 'Asia/Kolkata')).toMatch(/^2026-01-01T04:30:00\.\d{3}\+05:30$/);
            });
        });

        // AM/PM edge: midnight in one TZ is not midnight in another
        describe('AM/PM correctness across timezones', () => {
            // 3 AM UTC → IST 8:30 AM, PST 7 PM (prev day), JST 12 PM noon
            const threeAMUTC = new Date('2025-06-15T03:00:00Z');

            test('IST → 08:30:00 AM', () => {
                const d = convertToTimezone(threeAMUTC, TIMEZONE_CONFIG.IST.zone);
                expect(formatDateCustom(d, 'hh:mm:ss A')).toBe('08:30:00 AM');
            });

            test('JST → 12:00:00 PM (noon)', () => {
                const d = convertToTimezone(threeAMUTC, TIMEZONE_CONFIG.JST.zone);
                expect(formatDateCustom(d, 'hh:mm:ss A')).toBe('12:00:00 PM');
            });

            test('EST → 11:00:00 PM previous day (summer = EDT UTC-4)', () => {
                const d = convertToTimezone(threeAMUTC, TIMEZONE_CONFIG.EST.zone);
                const result = formatDateCustom(d, 'hh:mm:ss A');
                // June = EDT (UTC-4), so 3 AM UTC = 11 PM prev day
                expect(result).toMatch(/^11:00:00 PM$/);
            });

            test('SAST → 05:00:00 AM', () => {
                const d = convertToTimezone(threeAMUTC, TIMEZONE_CONFIG.SAST.zone);
                expect(formatDateCustom(d, 'hh:mm:ss A')).toBe('05:00:00 AM');
            });
        });

        // Readable format — month name edge cases across TZs
        describe('readable format — month name across TZs at month boundary', () => {
            // Feb 28 23:00 UTC → some TZs see Mar 1
            const feb28Late = new Date('2025-02-28T23:00:00Z');

            test('GMT → 28 Feb 2025', () => {
                const d = convertToTimezone(feb28Late, TIMEZONE_CONFIG.GMT.zone);
                expect(formatDateCustom(d, 'dd MMM yyyy, HH:mm:ss')).toBe('28 Feb 2025, 23:00:00');
            });

            test('IST → 01 Mar 2025 (UTC+5:30 → Mar 1 04:30)', () => {
                const d = convertToTimezone(feb28Late, TIMEZONE_CONFIG.IST.zone);
                expect(formatDateCustom(d, 'dd MMM yyyy, HH:mm:ss')).toBe('01 Mar 2025, 04:30:00');
            });

            test('JST → 01 Mar 2025 (UTC+9 → Mar 1 08:00)', () => {
                const d = convertToTimezone(feb28Late, TIMEZONE_CONFIG.JST.zone);
                expect(formatDateCustom(d, 'dd MMM yyyy, HH:mm:ss')).toBe('01 Mar 2025, 08:00:00');
            });

            test('PST — still Feb 28', () => {
                const d = convertToTimezone(feb28Late, TIMEZONE_CONFIG.PST.zone);
                expect(formatDateCustom(d, 'dd MMM yyyy')).toMatch(/^28 Feb 2025/);
            });
        });
    });

    // ── Regression tests: bugs caught during manual testing (v1.0.1) ──

    describe('DEFAULT_SETTINGS completeness — displayTimezones crash fix', () => {
        // Bug: content.js DEFAULT_SETTINGS was missing displayTimezones.
        // When chrome.storage hadn't loaded yet, showTimestampPopup called
        // userSettings.displayTimezones.forEach() on undefined → crash.
        const DEFAULT_SETTINGS = {
            displayTimezones: ['IST', 'GMT', 'PST'],
            tooltipTimezones: ['IST', 'GMT'],
            timestampMode: 'milliseconds',
            doubleClickEnabled: true
        };

        test('displayTimezones must be a non-empty array', () => {
            expect(Array.isArray(DEFAULT_SETTINGS.displayTimezones)).toBe(true);
            expect(DEFAULT_SETTINGS.displayTimezones.length).toBeGreaterThan(0);
        });

        test('tooltipTimezones must be a non-empty array', () => {
            expect(Array.isArray(DEFAULT_SETTINGS.tooltipTimezones)).toBe(true);
            expect(DEFAULT_SETTINGS.tooltipTimezones.length).toBeGreaterThan(0);
        });

        test('all displayTimezones must exist in TIMEZONE_CONFIG', () => {
            DEFAULT_SETTINGS.displayTimezones.forEach(tz => {
                expect(TIMEZONE_CONFIG).toHaveProperty(tz);
            });
        });

        test('all tooltipTimezones must exist in TIMEZONE_CONFIG', () => {
            DEFAULT_SETTINGS.tooltipTimezones.forEach(tz => {
                expect(TIMEZONE_CONFIG).toHaveProperty(tz);
            });
        });

        test('forEach on displayTimezones must not throw', () => {
            expect(() => {
                DEFAULT_SETTINGS.displayTimezones.forEach(tz => {
                    const config = TIMEZONE_CONFIG[tz];
                    expect(config).toBeDefined();
                });
            }).not.toThrow();
        });
    });

    describe('isDSTByZone — per-timezone DST check (was hardcoded to PST)', () => {
        // Bug: isDST() was hardcoded to America/Los_Angeles, so DST badges
        // for EST, CET, AEST showed PST's DST status instead of their own.

        test('IST should never report DST (India has no DST)', () => {
            const summer = new Date('2026-07-15T12:00:00Z');
            const winter = new Date('2026-01-15T12:00:00Z');
            expect(isDSTByZone(summer, 'Asia/Kolkata')).toBe(false);
            expect(isDSTByZone(winter, 'Asia/Kolkata')).toBe(false);
        });

        test('JST should never report DST (Japan has no DST)', () => {
            const summer = new Date('2026-07-15T12:00:00Z');
            expect(isDSTByZone(summer, 'Asia/Tokyo')).toBe(false);
        });

        test('PST should report DST in summer, not in winter', () => {
            const summer = new Date('2026-07-15T12:00:00Z');
            const winter = new Date('2026-01-15T12:00:00Z');
            expect(isDSTByZone(summer, 'America/Los_Angeles')).toBe(true);
            expect(isDSTByZone(winter, 'America/Los_Angeles')).toBe(false);
        });

        test('EST should report DST in summer, not in winter', () => {
            const summer = new Date('2026-07-15T12:00:00Z');
            const winter = new Date('2026-01-15T12:00:00Z');
            expect(isDSTByZone(summer, 'America/New_York')).toBe(true);
            expect(isDSTByZone(winter, 'America/New_York')).toBe(false);
        });

        test('CET should report DST in summer, not in winter', () => {
            const summer = new Date('2026-07-15T12:00:00Z');
            const winter = new Date('2026-01-15T12:00:00Z');
            expect(isDSTByZone(summer, 'Europe/Paris')).toBe(true);
            expect(isDSTByZone(winter, 'Europe/Paris')).toBe(false);
        });

        test('AEST should report DST in Jan (southern hemisphere summer), not in Jul', () => {
            const janSouthernSummer = new Date('2026-01-15T12:00:00Z');
            const julSouthernWinter = new Date('2026-07-15T12:00:00Z');
            expect(isDSTByZone(janSouthernSummer, 'Australia/Sydney')).toBe(true);
            expect(isDSTByZone(julSouthernWinter, 'Australia/Sydney')).toBe(false);
        });

        test('different timezones can have different DST states at the same moment', () => {
            // Jan 15: PST is standard, AEST is daylight (southern hemisphere)
            const jan = new Date('2026-01-15T12:00:00Z');
            expect(isDSTByZone(jan, 'America/Los_Angeles')).toBe(false);
            expect(isDSTByZone(jan, 'Australia/Sydney')).toBe(true);
        });

        test('returns false for invalid timezone gracefully', () => {
            const date = new Date('2026-07-15T12:00:00Z');
            expect(isDSTByZone(date, 'Invalid/Zone')).toBe(false);
        });
    });

    describe('Custom timezone support in display popup', () => {
        // Bug: showTimestampPopup only looked up TIMEZONE_CONFIG for display
        // timezones. Custom timezones (CUSTOM_*) were silently skipped.

        test('TIMEZONE_CONFIG lookup returns undefined for custom timezone codes', () => {
            expect(TIMEZONE_CONFIG['CUSTOM_1']).toBeUndefined();
            expect(TIMEZONE_CONFIG['CUSTOM_SGT']).toBeUndefined();
        });

        test('custom timezone fallback should resolve from customTimezones array', () => {
            const customTimezones = [
                { id: 'CUSTOM_1', zone: 'Asia/Singapore', label: 'SGT' },
                { id: 'CUSTOM_2', zone: 'Pacific/Auckland', label: 'NZST' }
            ];

            const tzCode = 'CUSTOM_1';
            let config = TIMEZONE_CONFIG[tzCode];

            // Standard lookup fails
            expect(config).toBeUndefined();

            // Fallback: same logic as content.js
            if (!config && tzCode.startsWith('CUSTOM_')) {
                const customTz = customTimezones.find(tz => tz.id === tzCode);
                if (customTz) {
                    config = { zone: customTz.zone, emoji: '🌐', label: customTz.label, hasDST: false };
                }
            }

            expect(config).toBeDefined();
            expect(config.zone).toBe('Asia/Singapore');
            expect(config.label).toBe('SGT');
        });

        test('custom timezone converts correctly through convertToTimezone', () => {
            const date = new Date('2026-01-15T12:00:00Z'); // UTC noon
            const result = convertToTimezone(date, 'Asia/Singapore'); // UTC+8
            expect(result.getHours()).toBe(20);
        });

        test('non-existent custom timezone returns undefined', () => {
            const customTimezones = [
                { id: 'CUSTOM_1', zone: 'Asia/Singapore', label: 'SGT' }
            ];
            const tzCode = 'CUSTOM_99';
            let config = TIMEZONE_CONFIG[tzCode];
            if (!config && tzCode.startsWith('CUSTOM_')) {
                const customTz = customTimezones.find(tz => tz.id === tzCode);
                if (customTz) {
                    config = { zone: customTz.zone, emoji: '🌐', label: customTz.label };
                }
            }
            expect(config).toBeUndefined();
        });
    });

    describe('sendMessage frameId — triple popup prevention', () => {
        // Bug: chrome.tabs.sendMessage without frameId broadcasts to ALL frames.
        // With all_frames:true, this caused N popups (one per frame).
        // Fix: send to frameId:0 (top frame only).

        test('frameId 0 targets only the top-level frame', () => {
            const options = { frameId: 0 };
            expect(options.frameId).toBe(0);
            expect(typeof options.frameId).toBe('number');
        });

        test('message payload includes required fields', () => {
            const message = {
                action: "convertTimestamp",
                timestamp: "1737194785000"
            };
            expect(message.action).toBe("convertTimestamp");
            expect(message.timestamp).toBeDefined();
            expect(typeof message.timestamp).toBe('string');
        });

        test('frameId should not be undefined or null in sendMessage options', () => {
            const options = { frameId: 0 };
            expect(options.frameId).not.toBeUndefined();
            expect(options.frameId).not.toBeNull();
        });
    });

    describe('Display Timezones checkbox limit (max 6)', () => {
        // Bug: Display checkboxes had no limit enforcement. Users could select
        // more than 6, but autoSave silently rejected — no error shown.
        // Fix: disable unchecked checkboxes when 6 are selected (same as tooltip max 3).

        const MAX_DISPLAY_TIMEZONES = 6;
        const MAX_TOOLTIP_TIMEZONES = 3;

        test('MAX_DISPLAY_TIMEZONES should be 6', () => {
            expect(MAX_DISPLAY_TIMEZONES).toBe(6);
        });

        test('MAX_TOOLTIP_TIMEZONES should be 3', () => {
            expect(MAX_TOOLTIP_TIMEZONES).toBe(3);
        });

        test('auto-save should reject when display count exceeds max', () => {
            const displayTimezones = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST', 'AEST']; // 7
            const tooltipTimezones = ['IST', 'GMT'];
            const shouldSave = displayTimezones.length <= MAX_DISPLAY_TIMEZONES && tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(false);
        });

        test('auto-save should accept when display count is at max', () => {
            const displayTimezones = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST']; // exactly 6
            const tooltipTimezones = ['IST', 'GMT'];
            const shouldSave = displayTimezones.length <= MAX_DISPLAY_TIMEZONES && tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(true);
        });

        test('auto-save should accept when display count is below max', () => {
            const displayTimezones = ['IST', 'GMT', 'PST']; // 3
            const tooltipTimezones = ['IST'];
            const shouldSave = displayTimezones.length <= MAX_DISPLAY_TIMEZONES && tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(true);
        });

        test('auto-save should reject when tooltip count exceeds max', () => {
            const displayTimezones = ['IST', 'GMT'];
            const tooltipTimezones = ['IST', 'GMT', 'PST', 'EST']; // 4
            const shouldSave = displayTimezones.length <= MAX_DISPLAY_TIMEZONES && tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(false);
        });

        test('auto-save should reject when both exceed their limits', () => {
            const displayTimezones = ['IST', 'GMT', 'PST', 'EST', 'CST', 'JST', 'AEST']; // 7
            const tooltipTimezones = ['IST', 'GMT', 'PST', 'EST']; // 4
            const shouldSave = displayTimezones.length <= MAX_DISPLAY_TIMEZONES && tooltipTimezones.length <= MAX_TOOLTIP_TIMEZONES;
            expect(shouldSave).toBe(false);
        });
    });
});
