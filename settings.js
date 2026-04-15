// Settings page JavaScript

// Default settings
const DEFAULT_SETTINGS = {
    primaryTimezone: 'IST',
    displayTimezones: ['IST', 'GMT', 'PST'],
    tooltipTimezones: ['IST', 'GMT'],
    customTimezones: [], // Array of { id, zone, label }
    copyDateFormat: 'default', // Copy format for clipboard
    timestampMode: 'milliseconds', // 'seconds' or 'milliseconds'
    doubleClickEnabled: true // Enable/disable double-click timestamp conversion on pages
};

const MAX_TOOLTIP_TIMEZONES = 3;

// Load settings when page opens
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupTooltipCheckboxLimit();
    setupCustomTimezoneHandlers();
    setupCopyFormatHandler();
    setupConverterToggles();
});

// Setup copy format handler
function setupCopyFormatHandler() {
    // Copy format now auto-saves via the global change listener
}

// Setup converter toggle handlers (double-click on/off + sec/ms mode)
function setupConverterToggles() {
    const dblclickToggle = document.getElementById('dblclick-enabled-toggle');
    const modeToggle = document.getElementById('timestamp-mode-toggle');
    const modeSec = document.getElementById('settings-mode-sec');
    const modeMs = document.getElementById('settings-mode-ms');

    if (dblclickToggle) {
        // Set initial state of sub-settings
        updateDblclickSubSettings(dblclickToggle.checked);

        dblclickToggle.addEventListener('change', function() {
            updateDblclickSubSettings(this.checked);
        });
    }

    if (modeToggle) {
        modeToggle.addEventListener('change', function() {
            const mode = this.checked ? 'milliseconds' : 'seconds';
            if (modeSec) modeSec.classList.toggle('active', mode === 'seconds');
            if (modeMs) modeMs.classList.toggle('active', mode === 'milliseconds');
        });
    }
}

// Enable/disable the sub-settings (interpret toggle + tooltip timezones) based on double-click toggle
function updateDblclickSubSettings(enabled) {
    const subSettings = document.getElementById('dblclick-sub-settings');
    if (subSettings) {
        subSettings.classList.toggle('disabled', !enabled);
    }
}

// Setup custom timezone handlers
function setupCustomTimezoneHandlers() {
    document.getElementById('add-timezone-btn').addEventListener('click', addCustomTimezone);
}

// Add custom timezone
function addCustomTimezone() {
    const select = document.getElementById('timezone-select');
    const zoneName = select.value;
    
    if (!zoneName) {
        showStatus('Please select a timezone from the dropdown', 'error');
        return;
    }
    
    // Get current custom timezones
    chrome.storage.sync.get('timezoneSettings', (data) => {
        const settings = data.timezoneSettings || DEFAULT_SETTINGS;
        const customTimezones = settings.customTimezones || [];
        
        // Check if already exists
        if (customTimezones.some(tz => tz.zone === zoneName)) {
            showStatus('This timezone is already added!', 'error');
            return;
        }
        
        // Create timezone ID and label
        const tzId = 'CUSTOM_' + zoneName.replace(/\//g, '_').toUpperCase();
        const label = formatTimezoneLabel(zoneName);
        
        // Add to list
        customTimezones.push({ id: tzId, zone: zoneName, label: label });
        settings.customTimezones = customTimezones;
        
        // Save and refresh UI
        chrome.storage.sync.set({ timezoneSettings: settings }, () => {
            select.value = ''; // Reset dropdown
            renderCustomTimezones(customTimezones);
            addCustomTimezoneToSections(tzId, zoneName, label);
            showStatus(`✅ Added ${label}`, 'success');
        });
    });
}

// Format timezone label
function formatTimezoneLabel(zone) {
    const parts = zone.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    
    // Get current abbreviation
    try {
        const abbr = new Date().toLocaleString('en-US', { 
            timeZone: zone, 
            timeZoneName: 'short' 
        }).split(' ').pop();
        return `${city} (${abbr})`;
    } catch (e) {
        return city;
    }
}

// Render custom timezones list
function renderCustomTimezones(customTimezones) {
    const container = document.getElementById('custom-timezones-list');
    
    if (!customTimezones || customTimezones.length === 0) {
        container.innerHTML = '<p class="no-custom-tz">No custom timezones added yet.</p>';
        return;
    }
    
    container.innerHTML = customTimezones.map(tz => `
        <div class="custom-tz-tag" data-id="${tz.id}">
            🌐 ${tz.label}
            <button class="remove-btn" data-tz-id="${tz.id}" title="Remove">✕</button>
        </div>
    `).join('');
    
    // Add event listeners to remove buttons
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tzId = this.getAttribute('data-tz-id');
            removeCustomTimezone(tzId);
        });
    });
}

// Remove custom timezone
function removeCustomTimezone(tzId) {
    chrome.storage.sync.get('timezoneSettings', (data) => {
        const settings = data.timezoneSettings || DEFAULT_SETTINGS;
        settings.customTimezones = (settings.customTimezones || []).filter(tz => tz.id !== tzId);
        
        // Also remove from display and tooltip selections
        settings.displayTimezones = settings.displayTimezones.filter(tz => tz !== tzId);
        settings.tooltipTimezones = settings.tooltipTimezones.filter(tz => tz !== tzId);
        if (settings.primaryTimezone === tzId) {
            settings.primaryTimezone = 'IST';
        }
        
        chrome.storage.sync.set({ timezoneSettings: settings }, () => {
            // Remove from UI
            removeCustomTimezoneFromSections(tzId);
            renderCustomTimezones(settings.customTimezones);
            showStatus('🗑️ Timezone removed', 'success');
        });
    });
}

// Add custom timezone to all sections
function addCustomTimezoneToSections(tzId, zone, label) {
    const idLower = tzId.toLowerCase();
    
    // Add to Primary Timezone section
    const primarySelector = document.querySelector('.primary-selector');
    if (primarySelector && !document.getElementById(`primary-${idLower}`)) {
        const div = document.createElement('div');
        div.className = 'primary-option custom-tz';
        div.innerHTML = `
            <input type="radio" name="primary-timezone" id="primary-${idLower}" value="${tzId}">
            <label for="primary-${idLower}">🌐 ${label}</label>
        `;
        primarySelector.appendChild(div);
    }
    
    // Add to Display Timezones section
    const displayGrid = document.querySelector('#display-ist').closest('.timezone-grid');
    if (displayGrid && !document.getElementById(`display-${idLower}`)) {
        const div = document.createElement('div');
        div.className = 'timezone-checkbox custom-tz';
        div.innerHTML = `
            <input type="checkbox" id="display-${idLower}" value="${tzId}">
            <label for="display-${idLower}">🌐 ${label}</label>
        `;
        displayGrid.appendChild(div);
    }
    
    // Add to Tooltip Timezones section
    const tooltipGrid = document.querySelector('#tooltip-ist').closest('.timezone-grid');
    if (tooltipGrid && !document.getElementById(`tooltip-${idLower}`)) {
        const div = document.createElement('div');
        div.className = 'timezone-checkbox custom-tz';
        div.innerHTML = `
            <input type="checkbox" id="tooltip-${idLower}" value="${tzId}">
            <label for="tooltip-${idLower}">🌐 ${label}</label>
        `;
        tooltipGrid.appendChild(div);
        
        // Re-setup limit listeners
        div.querySelector('input').addEventListener('change', updateTooltipCheckboxStates);
        updateTooltipCheckboxStates();
    }
}

// Remove custom timezone from all sections
function removeCustomTimezoneFromSections(tzId) {
    const idLower = tzId.toLowerCase();
    
    document.querySelectorAll(`#primary-${idLower}, #display-${idLower}, #tooltip-${idLower}`).forEach(el => {
        el.closest('.primary-option, .timezone-checkbox')?.remove();
    });
    
    updateTooltipCheckboxStates();
}

// Setup tooltip checkbox limit (max 3)
function setupTooltipCheckboxLimit() {
    const tooltipCheckboxes = document.querySelectorAll('input[id^="tooltip-"]');
    
    tooltipCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateTooltipCheckboxStates();
        });
    });
    
    // Initial state check
    updateTooltipCheckboxStates();
}

// Update tooltip checkbox states - disable unchecked ones when 3 are selected
function updateTooltipCheckboxStates() {
    const tooltipCheckboxes = document.querySelectorAll('input[id^="tooltip-"]');
    const checkedCount = document.querySelectorAll('input[id^="tooltip-"]:checked').length;
    
    tooltipCheckboxes.forEach(checkbox => {
        if (checkedCount >= MAX_TOOLTIP_TIMEZONES && !checkbox.checked) {
            checkbox.disabled = true;
            checkbox.parentElement.classList.add('disabled');
        } else {
            checkbox.disabled = false;
            checkbox.parentElement.classList.remove('disabled');
        }
    });
}

// Auto-save: listen for changes on all settings inputs
let autoSaveTimer = null;

document.addEventListener('change', function(e) {
    const el = e.target;
    if (el.matches('input[type="checkbox"], input[type="radio"], select, input[type="text"]')) {
        // Debounce: wait 300ms after last change before saving
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => autoSave(), 300);
    }
});

function autoSave() {
    // Get primary timezone
    const primaryEl = document.querySelector('input[name="primary-timezone"]:checked');
    if (!primaryEl) return;
    const primaryTimezone = primaryEl.value;

    // Get display timezones
    const displayTimezones = Array.from(document.querySelectorAll('[id^="display-"]:checked')).map(cb => cb.value);

    // Get tooltip timezones
    const tooltipTimezones = Array.from(document.querySelectorAll('[id^="tooltip-"]:checked')).map(cb => cb.value);

    // Validate silently — don't save invalid states
    if (displayTimezones.length === 0 || tooltipTimezones.length === 0) return;
    if (displayTimezones.length > 6 || tooltipTimezones.length > MAX_TOOLTIP_TIMEZONES) return;

    chrome.storage.sync.get('timezoneSettings', (data) => {
        const existingSettings = data.timezoneSettings || DEFAULT_SETTINGS;

        const formatSelect = document.getElementById('copy-format-select');
        const copyDateFormat = formatSelect ? formatSelect.value : 'default';

        const dblclickToggle = document.getElementById('dblclick-enabled-toggle');
        const doubleClickEnabled = dblclickToggle ? dblclickToggle.checked : true;

        const modeToggle = document.getElementById('timestamp-mode-toggle');
        const timestampMode = modeToggle ? (modeToggle.checked ? 'milliseconds' : 'seconds') : 'milliseconds';

        const settings = {
            primaryTimezone,
            displayTimezones,
            tooltipTimezones,
            customTimezones: existingSettings.customTimezones || [],
            copyDateFormat,
            timestampMode,
            doubleClickEnabled
        };

        chrome.storage.sync.set({ timezoneSettings: settings }, () => {
            showSaveToast();
            chrome.runtime.sendMessage({ action: 'settingsUpdated', settings }, () => {
                if (chrome.runtime.lastError) {
                    // Popup not open, ignore
                }
            });
        });
    });
}

// Brief toast notification
let toastTimer = null;

function showSaveToast() {
    const toast = document.getElementById('auto-save-toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 1500);
}

// Reset button
document.getElementById('reset-settings').addEventListener('click', resetSettings);

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get('timezoneSettings', (data) => {
        const settings = data.timezoneSettings || DEFAULT_SETTINGS;
        
        // Clear all checkboxes first
        document.querySelectorAll('[id^="display-"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('[id^="tooltip-"]').forEach(cb => cb.checked = false);
        
        // Load custom timezones first (so they're available for selection)
        const customTimezones = settings.customTimezones || [];
        renderCustomTimezones(customTimezones);
        customTimezones.forEach(tz => {
            addCustomTimezoneToSections(tz.id, tz.zone, tz.label);
        });
        
        // Set primary timezone
        const primaryRadio = document.querySelector(`input[name="primary-timezone"][value="${settings.primaryTimezone}"]`);
        if (primaryRadio) {
            primaryRadio.checked = true;
        }
        
        // Set display timezones
        settings.displayTimezones.forEach(tz => {
            const checkbox = document.getElementById(`display-${tz.toLowerCase()}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Set tooltip timezones
        settings.tooltipTimezones.forEach(tz => {
            const checkbox = document.getElementById(`tooltip-${tz.toLowerCase()}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Update tooltip checkbox states after loading
        updateTooltipCheckboxStates();
        
        // Set copy date format dropdown
        const copyFormat = settings.copyDateFormat || 'default';
        const formatSelect = document.getElementById('copy-format-select');
        if (formatSelect) {
            formatSelect.value = copyFormat;
        }

        // Set double-click enabled toggle
        const dblclickToggle = document.getElementById('dblclick-enabled-toggle');
        const dblclickEnabled = settings.doubleClickEnabled !== false;
        if (dblclickToggle) {
            dblclickToggle.checked = dblclickEnabled;
        }
        updateDblclickSubSettings(dblclickEnabled);

        // Set timestamp mode toggle (checked = milliseconds)
        const modeToggle = document.getElementById('timestamp-mode-toggle');
        const modeSec = document.getElementById('settings-mode-sec');
        const modeMs = document.getElementById('settings-mode-ms');
        const mode = settings.timestampMode || 'milliseconds';
        if (modeToggle) {
            modeToggle.checked = (mode === 'milliseconds');
        }
        if (modeSec) modeSec.classList.toggle('active', mode === 'seconds');
        if (modeMs) modeMs.classList.toggle('active', mode === 'milliseconds');
    });
}

// Reset to defaults
function resetSettings() {
    if (confirm('Reset all settings to defaults? This will also remove all custom timezones.')) {
        chrome.storage.sync.set({ timezoneSettings: DEFAULT_SETTINGS }, () => {
            document.querySelectorAll('.custom-tz').forEach(el => el.remove());
            loadSettings();
            showSaveToast();
        });
    }
}

// Show status message (for errors only)
function showStatus(message, type) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}
