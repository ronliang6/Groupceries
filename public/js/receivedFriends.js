function acceptRequest(friendID) {
    let currentUser = window.localStorage.getItem('uid');
    // document friends of current user
    let currentUserDocs = db.collection(currentUser).doc("Friends");

    // document friends of friend
    let friendDocs = db.collection(friendID).doc("Friends");

    // add the current uid to the friends' accepted
    friendDocs.set({ accepted: firebase.firestore.FieldValue.arrayUnion(currentUser) }, { merge: true }).catch((error) => { console.log(error) });

    // delete the current uid from the friends' sent
    friendDocs.update({ sent: firebase.firestore.FieldValue.arrayRemove(currentUser) }).catch((error) => { console.log(error) });

    // delete the friends' uid from the user's recceived
    currentUserDocs.update({ received: firebase.firestore.FieldValue.arrayRemove(friendID) }).catch((error) => { console.log(error) });

    // send the friend a notification

    // add the friend uid to the cuurent users' accepted
    currentUserDocs.set({ accepted: firebase.firestore.FieldValue.arrayUnion(friendID) }, { merge: true }).catch((error) => { console.log(error) });
}

function declineRequest(friendID) {
    let currentUser = window.localStorage.getItem('uid');
    // document friends of current user
    let currentUserDocs = db.collection(currentUser).doc("Friends");

    // document friends of friend
    let friendDocs = db.collection(friendID).doc("Friends");
    /* If the user declines, should we inform the user who sent the friend request ?*/
    // delete the current email or uid to the friends' sent
    friendDocs.update({ sent: firebase.firestore.FieldValue.arrayRemove(currentUser) }).catch((error) => { console.log(error) });

    // remove the notification (maybe ?)

    // delete the friend email or uid to the cuurent users' received
    currentUserDocs.update({ received: firebase.firestore.FieldValue.arrayRemove(friendID) }).catch((error) => { console.log(error) });
}

function addReceivedHTML(uid) {
    db.collection(uid).doc('userInfo').get().then((doc) => {
        if (doc.exists) {
            let name = doc.data().name;
            let email = doc.data().email;
            if (!document.getElementById(uid + "_R_row")) {
                $('.receivedFriends').prepend(generateReceivedHTML(name, email, uid));
            }
        }
    }).catch(err => console.log(err));
}

function generateReceivedHTML(name, email, uid) {
    return `
    <div class="p-2 listCollapsibleLayer2 received" id=${uid}_R_row>
        <label class="inputLabels"><h4 class="collapsibleText">${name}</h4></label>
        <button id=${uid}_R onclick="acceptRequest('${uid}')" class="btn acceptRequestButton"><i class="fas fa-check"></i></button>
        <button id=${uid}_R onclick="declineRequest('${uid}')" class="btn cancelRequestButton"><i class="fas fa-times"></i></button>
    </div>
    `
}

db.collection(window.localStorage.getItem('uid')).doc("Friends")
    .onSnapshot(function (doc) {
        if ($('.received').length != doc.data().received.length) {
            $(".received").remove();
            doc.data().received.forEach(function (item) {
                addReceivedHTML(item);
            })
        }
    })
