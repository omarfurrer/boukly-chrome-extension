function setIconSuccess() {
    chrome.browserAction.setIcon({
        path: {
            "16": "images/logo-success-16x16.png",
            "32": "images/logo-success-32x32.png",
            "48": "images/logo-success-32x32.png",
            "128": "images/logo-success-32x32.png"
        }
    });
}

function setIconFail() {
    chrome.browserAction.setIcon({
        path: {
            "16": "images/logo-fail-16x16.png",
            "32": "images/logo-fail-32x32.png",
            "48": "images/logo-fail-32x32.png",
            "128": "images/logo-fail-32x32.png"
        }
    });
}

function resetIcon() {
    chrome.browserAction.setIcon({
        path: {
            "16": "images/logo-16x16.png",
            "32": "images/logo-32x32.png",
            "48": "images/logo-32x32.png",
            "128": "images/logo-32x32.png"
        }
    });
}