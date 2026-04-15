// Background script for context menu
chrome.runtime.onInstalled.addListener(() => {
    // Remove all existing context menus first to avoid duplicate ID errors
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "convertTimestamp",
            title: "Convert timestamp to timezones",
            contexts: ["selection"]
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convertTimestamp") {
        const selectedText = info.selectionText.trim();
        
        // Send message to content script to show popup
        chrome.tabs.sendMessage(tab.id, {
            action: "convertTimestamp",
            timestamp: selectedText
        });
    }
});
