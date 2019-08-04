chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        console.log(tabId, changeInfo, tab);
        if (changeInfo.url) {
            const url = changeInfo.url;
            console.log('update change');
            console.log(url);
            handleTogglingIcon(url);
        }
    }
);

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.getSelected(null, function (tab) {
        var url = tab.url;
        console.log('active change');
        console.log(url);
        handleTogglingIcon(url);
    });
});

chrome.windows.onFocusChanged.addListener(function (windowInfo) {
    chrome.tabs.getSelected(null, function (tab) {
        var url = tab.url;
        console.log('window change');
        console.log(url);
        handleTogglingIcon(url);
    });
});

chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case 'bookmark-page':
            chrome.tabs.getSelected(null, function (tab) {
                var url = tab.url;
                console.log('key');
                console.log(url);
                bookmark(url);
            });
            break;
        default:
            break;
    }
});

function bookmark(url) {
    chrome.storage.sync.get(['auth'], function (result) {
        if (result && result.auth) {
            fetch('http://bkly.test/api/bookmarks', {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        'Content-Type': 'application/json',
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
                            chrome.browserAction.disable();
                        }
                    });
                })
                .catch(error => {
                    console.error(error);
                    chrome.browserAction.enable();
                });
        } else {
            chrome.browserAction.enable();
            alert('Please login with your extension to start bookmarking. Click on the icon in the top bar.');
        }
    });
}

function handleTogglingIcon(url) {
    chrome.storage.sync.get(['auth'], function (result) {
        if (result && result.auth) {
            fetch('http://bkly.test/api/bookmarks/exists?url=' + encodeURIComponent(url), {
                    method: 'GET', // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        'Content-Type': 'application/json',
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
                        chrome.browserAction.disable();
                    } else {
                        chrome.browserAction.enable();
                    }
                })
                .catch(error => {
                    console.error(error);
                    chrome.browserAction.enable();
                });
            chrome.browserAction.disable();
        } else {
            chrome.browserAction.enable();
            alert('Please login with your extension to start bookmarking. Click on the icon in the top bar.');
        }
    });
}