const registerUser = (email, password) => {
    let user = null;
    let db = firebase.firestore();
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in

            user = userCredential.user;
            db.collection("Users").doc(user.uid).set({
                email: user.email,
            }).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            })
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;


            // ..
        });
    return user;
}



const registerUserGoogle = async(persistencia) => {

    let db = firebase.firestore();
    let provider = new firebase.auth.GoogleAuthProvider();
    let user = null;
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence[persistencia])
        .then(() => {
            // Existing and future Auth states are now persisted in the current
            // session only. Closing the window would clear any existing state even
            // if a user forgets to sign out.
            // ...
            // New sign-in will be persisted with session persistence.
            return firebase.auth()
                .signInWithPopup(provider)
                .then((result) => {
                    /** @type {firebase.auth.OAuthCredential} */
                    let credential = result.credential;

                    // This gives you a Google Access Token. You can use it to access the Google API.
                    let token = credential.accessToken;
                    // The signed-in user info.
                    user = result.user;

                    let docReg = db.collection("Users").doc(user.uid);

                    docReg.get().then((doc) => {
                        if (doc.exists) {

                        } else {
                            db.collection("Users").doc(user.uid).set({
                                email: user.email,
                            }).then(() => {
                                console.log("Document successfully written!");
                            }).catch((error) => {
                                console.error("Error writing document: ", error);
                            })
                        }
                    }).catch((error) => {
                        console.log("Error getting document:", error);
                    });

                    // ...
                }).catch((error) => {
                    // Handle Errors here.
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    // The email of the user's account used.
                    let email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    let credential = error.credential;
                    // ...
                    console.log(errorMessage);

                });
        })


    return Promise.resolve(user);
}