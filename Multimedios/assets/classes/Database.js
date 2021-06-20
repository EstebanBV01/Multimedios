class DataBase {
    db = firebase.firestore();
    constructor() {

    }

    async obtenerDocumento(coleccion, documento) {

        var docRef = this.db.collection(coleccion).doc(documento);
        let result;

        await docRef.get().then((doc) => {
            if (doc.exists) {
                result = doc.data();

            } else {

                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
        return result;
    }
    async loginEmailPassword(email, password) {
        let user;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                user = userCredential.user;
                // ...
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
            });
        return user;
    }

    async registroEmailPassword(email, password) {
        let user;
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even
                // if a user forgets to sign out.
                // ...
                // New sign-in will be persisted with session persistence.
                return firebase.auth().signInWithEmailAndPassword(email, password);
            })
            .catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
            });
        return Promise.resolve(user);
    }

    async agregarDispositivo(id) {

        let docRef = this.db.collection("Devices").doc(id).withConverter(deviceConverter);
        let user = firebase.auth().currentUser;
        docRef.get().then((doc) => {
            if (doc.exists && doc.data().activated == false) {
                let device = doc.data();
                let userDevice = {
                    devices: {
                        [id]: {
                            customName: device.customName,
                            lastValue: device.lastValue,
                            type: device.type,

                        }
                    }
                };
                this.db.collection("Users").doc(user.uid).update(userDevice).then(() => {
                    console.log("Document successfully written!");
                }).catch((error) => {
                    console.error("Error writing document: ", error);
                }).catch((error) => {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    console.log(errorMessage);

                });

            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });


    }

    async loginRegistroGoogle() {
        let provider = new firebase.auth.GoogleAuthProvider();
        let user;
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence[persistencia])
            .then(() => {
                return firebase.auth()
                    .signInWithPopup(provider)
                    .then((result) => {
                        /** @type {firebase.auth.OAuthCredential} */
                        let credential = result.credential;

                        // This gives you a Google Access Token. You can use it to access the Google API.
                        let token = credential.accessToken;
                        // The signed-in user info.
                        user = result.user;

                        let docReg = this.db.collection("Users").doc(user.uid);

                        docReg.get().then((doc) => {
                            if (doc.exists) {

                            } else {
                                this.db.collection("Users").doc(user.uid).set({
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

                    });
            })


        return Promise.resolve(user);
    }
}