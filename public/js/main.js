const messaging = firebase.messaging();

function onSignIn(googleUser) {
  let id_token = googleUser.getAuthResponse().id_token;

  // send the id_token to app.js
  sendIDToken(id_token);

  // login the user using firebase too
  logInFirebase(id_token);

  document.getElementById('signOut').style = 'display: visible';
  document.getElementById('signIn').style = 'display: none';
  document.getElementById("launchPageEditBtn").style = 'display: visible';
  document.getElementById("launchPageCreateBtn").style = 'display: visible';
  document.getElementById("navBarEdit").style = 'display: visible';
  document.getElementById("navBarCreate").style = 'display: visible';
}

function logInFirebase(id_token) {
  let credential = firebase.auth.GoogleAuthProvider.credential(id_token);
  firebase.auth().signInWithCredential(credential).then(function (user) {
    // store uid on local storage.
    window.localStorage.setItem('uid', firebase.auth().currentUser.uid);
    window.localStorage.setItem('name', firebase.auth().currentUser.displayName);
    subscribeToNotifications();
  }).catch(function (error) {
    // Handle Errors here.
    console.log(error);
  });
}

function sendIDToken(id_token) {
  let id = { idToken: id_token };
  $.ajax({
    type: 'POST',
    url: '/home',
    data: id,
    success: function (data) {
      //do something with the data via front-end framework
      location.reload();
    }
  });
}

function signOut() {
  console.log("did something")
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });

  // log out in firebase
  firebase.auth().signOut().then(function () {
    console.log('sign out successfull');
  }, function (error) {
    console.log(error);
  });

  // make a post request and logout user in the server side
  logOutInServer();

  document.getElementById('signIn').style = 'display: visible';
  document.getElementById('signOut').style = 'display: none';
  document.getElementById("launchPageCreateBtn").style = 'display: none';
  document.getElementById("launchPageEditBtn").style = 'display: none';
  document.getElementById("navBarCreate").style = 'display: none';
  document.getElementById("navBarEdit").style = 'display: none';
}

function logOutInServer() {
  // send back false instead of user id.
  let id = { idToken: false };
  $.ajax({
    type: 'POST',
    url: '/home',
    data: id,
    success: function (data) {
      //do something with the data via front-end framework
      location.reload();
    }
  });
}
document.getElementById("launchPageCreateBtn").style = 'display: none';
document.getElementById("launchPageEditBtn").style = 'display: none';

function subscribeToNotifications() {
  // Get Instance ID token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  messaging.getToken().then((currentToken) => {
    if (currentToken) {
      console.log(currentToken);
      //sendTokenToServer(currentToken);
      updateUIForPushEnabled(currentToken);
    } else {
      // Show permission request.
      console.log('No Instance ID token available. Request permission to generate one.');
      // Show permission UI.
      updateUIForPushPermissionRequired();
      setTokenSentToServer(false);
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    showToken('Error retrieving Instance ID token. ', err);
    setTokenSentToServer(false);
  });
}

// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(() => {
  messaging.getToken().then((refreshedToken) => {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    setTokenSentToServer(false);
    // Send Instance ID token to app server.
    sendTokenToServer(refreshedToken);
    // ...
  }).catch((err) => {
    console.log('Unable to retrieve refreshed token ', err);
    showToken('Unable to retrieve refreshed token ', err);
  });
});