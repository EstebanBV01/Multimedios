class DataBase {
  db = firebase.firestore();
  constructor() { }

  async obtenerDocumento(coleccion, documento) {
    var docRef = this.db.collection(coleccion).doc(documento);
    let result;

    await docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("data es ", doc.data());

          result = doc.data();
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
    return result;
  }
  async loginEmailPassword(email, password, session) {
    let user;
    await firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence[session])
      .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.

        return firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then((result) => {
            user = result.user;
          });
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
      });
    return Promise.resolve(user);
  }

  async registroEmailPassword(email, password) {
    let user;
    await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        user = userCredential.user;
        this.db
          .collection("Users")
          .doc(user.uid)
          .set({
            email: user.email,
          })
          .then(() => {
            console.log("Document successfully written!");
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ..
      });

    return user;
  }
  async activarDispositivo(id, idUser, emailUser, rolUser) {
    let docRef = await this.db
      .collection("Devices")
      .withConverter(deviceConverter)
      .doc(id);

    return await this.db
      .runTransaction((transaction) => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(docRef).then((sfDoc) => {
          if (!sfDoc.exists) {
            throw "El medidor no existe!";
          }

          let path = `devices.${id}`;
          let pathUser = `users.${idUser}`;
          let complete = true;

          if (sfDoc.exists && sfDoc.data().activated == false) {
            let device = sfDoc.data();
            let userDevice = {
              customName: device.customName,
              lastValue: device.lastValue,
              type: device.type,
            };

            this.db
              .collection("Users")
              .doc(idUser)
              .update({
                [path]: userDevice,
              })
              .then(() => {
                complete = true;
                console.log("Document successfully written!");
              })
              .catch((error) => {
                console.error("Error writing document: ", error);
                complete = false;
              });
          } else {
            console.log("No such document!");
            throw "Error, medidor en uso";
          }

          if (!complete) {
            throw "Error al escribir en usuario";
          }

          let deviceUser = {
            email: emailUser,
            rol: rolUser,
          };

          transaction.update(docRef, {
            activated: true,
            [pathUser]: deviceUser,
          });
        });
      })
      .then((result) => {
        console.log("Transaction successfully committed!");
      })
      .catch((error) => {
        console.log("Transaction failed: ", error);
        $("#modalContent").text("El medidor no existe o esta en uso");
        $("#modalMessages").modal("show");
      });
  }

  async agregarMedidor(device) {
    let id;
    await this.db.collection("Devices").add({
      activated: device.activated,
      customName: device.customName,
      lastValue: device.lastValue,
      type: device.type,
      updateConfig: device.updateConfig,
    })
      .then((docRef) => {

        id = docRef.id;
        console.log("Document successfully written!", docRef.id);

      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
    return id;
  }

  async loginRegistroGoogle(session) {
    let provider = new firebase.auth.GoogleAuthProvider();
    let user;
    await firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence[session])
      .then(() => {
        return firebase
          .auth()
          .signInWithPopup(provider)
          .then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            let credential = result.credential;

            // This gives you a Google Access Token. You can use it to access the Google API.
            let token = credential.accessToken;
            // The signed-in user info.
            user = result.user;

            let docReg = this.db.collection("Users").doc(user.uid);

            docReg
              .get()
              .then((doc) => {
                if (doc.exists) { } else {
                  this.db
                    .collection("Users")
                    .doc(user.uid)
                    .set({
                      email: user.email,
                    })
                    .then(() => {
                      console.log("Document successfully written!");
                    })
                    .catch((error) => {
                      console.error("Error writing document: ", error);
                    });
                }
              })
              .catch((error) => {
                console.log("Error getting document:", error);
              });

            // ...
          })
          .catch((error) => {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;
            // The email of the user's account used.
            let email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            let credential = error.credential;
            // ...
          });
      });

    return Promise.resolve(user);
  }

  async eliminarDispositivo(id) {
    let docRef = this.db.collection("Devices").doc(id);
    return this.db
      .runTransaction((transaction) => {
        return transaction.get(docRef).then((docResult) => {
          if (!docResult.exists) {
            throw "Document does not exist!";
          }
          let newUsers = Object.entries(docResult.data().users);
          let path = `devices.${id}`;
          transaction.update(docRef, {
            users: firebase.firestore.FieldValue.delete(),
            activated: false
          });
          console.log(newUsers);
          for (let index = 0; index < newUsers.length; index++) {
            console.log("INDEX", index);
            let userRef = this.db.collection("Users").doc(newUsers[index][0]);
            transaction.update(userRef, {
              [path]: firebase.firestore.FieldValue.delete(),
            });
          }
        });
      })
      .then(() => {
        console.log("Transaction successfully committed!");
      })
      .catch((error) => {
        console.log("Transaction failed: ", error);
      });
  }
  async consultarMedidorID(id) {
    let device;
    var docRef = this.db.collection("Devices").doc(id);

    await docRef.get().then((doc) => {
      if (doc.exists) {
        device = doc.data();
      
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });
    return device;
  }

  async addDates(idMeter, cutOffDate, payDay) {

    await this.db.collection("Devices").doc(idMeter).update({
      cutOffDate: cutOffDate,
      payDay: payDay,
    })
      .then(() => {
        console.log("Document successfully written!");

      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  };

  async addDateForUser(idUser, idMeter, cutOffDate, payDay) {

    let path=`users.${idUser}`;

    let dateUser = {
      cutOffDateUser: cutOffDate,
      payDayUser: payDay,
    };

    this.db
      .collection("Devices")
      .doc(idMeter)
      .update({
        [path]: dateUser,
      })
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

}