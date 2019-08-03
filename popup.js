document.addEventListener('DOMContentLoaded', function () {

    function setError(error) {
        document.getElementById('error-message').innerHTML = error;
    }

    function clearError() {
        document.getElementById('error-message').innerHTML = '';
    }

    document.getElementById('auth-button').addEventListener('click', auth, false);
    document.getElementById('logout-button').addEventListener('click', logout, false);

    chrome.storage.sync.get(['auth'], function (result) {
        if (result && result.auth) {
            document.getElementById("auth-container").style.display = "none";
            document.getElementById("authed-container").style.display = "block";
        } else {
            document.getElementById("auth-container").style.display = "block";
            document.getElementById("authed-container").style.display = "none";
        }
    });

    function logout() {
        chrome.storage.sync.clear(function () {
            document.getElementById("auth-container").style.display = "block";
            document.getElementById("authed-container").style.display = "none";
            chrome.storage.sync.get(['auth'], function (result) {
                console.log(result);
            });
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

        fetch('http://bkly.test/oauth/token', {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'password',
                    client_id: 2,
                    client_secret: 'vXdgX78ZZLGRd2R20QSxkko8VcDk2x3mbGOkkiQg',
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
                // const resultStringified = JSON.stringify(result);
                chrome.storage.sync.set({
                    'auth': resultStringified
                }, function () {
                    document.getElementById("auth-container").style.display = "none";
                    document.getElementById("authed-container").style.display = "block";
                });
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