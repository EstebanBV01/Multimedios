const validateWaterMeter = async(waterMeterUid) => {

    let db = firebase.firestore();
    let user = firebase.auth().currentUser;
    
    if (user) {

    let docRef= db.collection("WaterMeters").doc(waterMeterUid);

    docRef.get().then((doc) => {
        if (doc.exists) {
            
            db.collection("Users").doc(user.uid).update({
                [waterMeterUid]: {
                    custonName: "Oficina C3",
                    lastValue: 300
                }
            }).then(() => {
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

    } else {

    }

}