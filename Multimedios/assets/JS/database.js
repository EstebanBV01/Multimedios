// Estoy tratando de hacer esta función reutilizable
const getData = async(collName, docName) => {

    let db = firebase.firestore();
    //let user = firebase.auth().currentUser; // El dato del uid ahora se lo tiene que pasar por parámetro

    var docRef = db.collection(collName).doc(docName); // Antes: db.collection("Users").doc(user.uid);
    let result;

    await docRef.get().then((doc) => {
        if (doc.exists) {
            result = doc.data(); // Antes: result=Object.entries(doc.data().WaterMeters);
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