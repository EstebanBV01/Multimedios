const getData = async() => {
    let db = firebase.firestore();
    let user = firebase.auth().currentUser;
    var docRef = db.collection("Users").doc(user.uid);
    let result;

    await docRef.get().then((doc) => {
        if (doc.exists) {
            result = Object.entries(doc.data().WaterMeters);
            console.log(result);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    return result;
}