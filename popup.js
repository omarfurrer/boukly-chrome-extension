document.addEventListener('DOMContentLoaded', function () {
    function setError(error) {
        document.getElementById('error-message').innerHTML = error;
    }

    function clearError() {
        document.getElementById('error-message').innerHTML = '';
    }

    function handleAuthed() {
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("authed-container").style.display = "block";
        resetIcon();
    }

    function handleUnauthed() {
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("authed-container").style.display = "none";
        setIconFail();
    }

    document.getElementById('auth-button').addEventListener('click', auth, false);
    document.getElementById('logout-button').addEventListener('click', logout, false);

    // check if storage has token
    chrome.storage.sync.get(['auth'], function (result) {
        if (result && result.auth) {
            handleAuthed();
        } else {
            handleUnauthed();
        }
    });

    function logout() {
        // clear token from storage
        chrome.storage.sync.clear(function () {
            handleUnauthed();
        });
    }

    function auth(e) {

        e.preventDefault();

        clearError();

        const username = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            setError('Email and Password cannot be empty');
            return;
        }

        // get access token
        fetch(config[env].baseUrl + '/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'password',
                    client_id: config[env].authClientId,
                    client_secret: config[env].authClientSecret,
                    username: username,
                    password: password,
                    scope: ''
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
                const resultStringified = result;
                // set token in storage
                chrome.storage.sync.set({
                    'auth': resultStringified
                }, function () {
                    handleAuthed();
                });
                //TODO: on login check current page
            })
            .catch(error => {
                error.response.json().then(body => {
                    if (error.status == 401 && body.message) {
                        setError(body.message);
                        return;
                    }
                    setError("An unknown error occured.");
                });
            });

    }

}, false);