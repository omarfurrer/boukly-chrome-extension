// tab url updated
chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.url) {
            const url = changeInfo.url;
            handleTogglingIcon(url);
        }
    }
);

// main tab changed
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.getSelected(null, function (tab) {
        var url = tab.url;
        handleTogglingIcon(url);
    });
});

// windows changed
chrome.windows.onFocusChanged.addListener(function (windowInfo) {
    chrome.tabs.getSelected(null, function (tab) {
        var url = tab.url;
        handleTogglingIcon(url);
    });
});

// keyboard shortcuts
chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case 'bookmark-page':
            chrome.tabs.getSelected(null, function (tab) {
                var url = tab.url;
                bookmark(url);
            });
            break;
        default:
            break;
    }
});

/**
 * Bookmark a url.
 * 
 * @param string url 
 */
function bookmark(url) {
    chrome.storage.sync.get(['auth'], function (result) {
        if (result && result.auth) {
            fetch(config[env].baseUrl + '/api/bookmarks', {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + result.auth.access_token
                    },
                    body: JSON.stringify({
                        url: url
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        // create error object and reject if not a 2xx response code
                        var err = new Error("HTTP status code: " + response.status);
                        err.response = response;
                        err.status = response.status;
                        throw err;
                    }
                    return response.json();
                })
                .then(result => {
                    const bookmark = result.bookmark;
                    // make sure we are still on the same page
                    chrome.tabs.getSelected(null, function (tab) {
                        var selectedUrl = tab.url;
                        if (selectedUrl == url) {
                            setIconSuccess();
                        }
                    });
                })
                .catch(error => {
                    console.error(error);
                    if (error.status == 401) {
                        chrome.storage.sync.clear(function () {
                            setIconFail();
                            alert('Please login with your extension to start bookmarking. Click on the icon in the top bar.');
                        });
                        return;
                    }
                    resetIcon();
                });
        } else {
            setIconFail();
            alert('Please login with your extension to start bookmarking. Click on the icon in the top bar.');
        }
    });
}

/**
 * Check if bookmark exists or not and handle icon accordingly.
 * 
 * @param string url 
 */
function handleTogglingIcon(url) {
    chrome.storage.sync.get(['auth'], function (result) {
        if (result && result.auth) {
            fetch(config[env].baseUrl + '/api/bookmarks/exists?url=' + encodeURIComponent(url), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + result.auth.access_token
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        // create error object and reject if not a 2xx response code
                        var err = new Error("HTTP status code: " + response.status);
                        err.response = response;
                        err.status = response.status;
                        throw err;
                    }
                    return response.json();
                })
                .then(result => {
                    const exists = result.exists;
                    if (exists) {
                        setIconSuccess();
                    } else {
                        resetIcon();
                    }
                })
                .catch(error => {
                    console.error(error);
                    if (error.status == 401) {
                        chrome.storage.sync.clear(function () {
                            setIconFail();
                        });
                        return;
                    }
                    resetIcon();
                });
        } else {
            setIconFail();
            // alert('Please login with your extension to start bookmarking. Click on the icon in the top bar.');
        }
    });
}