
const loginUser = (email, password) => {
    let user = null;
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

