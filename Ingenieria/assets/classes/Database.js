class DataBase {
  db = firebase.firestore();
  constructor() { }
  
  // Esta función sirve para setear la "bandera" que hará que el dispositivo lea la configuración para actualizársela
  async flagUpdate(deviceID) {
    const docRef = this.db.collection("Devices").doc(deviceID);

    return await docRef.update({ updateConfig: true });
  }

  async obtenerDocumento(coleccion, documento) {
    var docRef = this.db.collection(coleccion).doc(documento);
    let result;

    await docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const d = doc.data();
          console.log("data es ", d);

          result = d;
        } else {
          console.log("No such document!");
          return Promise.reject(null); // Antes no estaba
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
        return Promise.reject(error); // Antes no estaba
      });
      return result;
  }

  async escribirDocumento(coleccion, documento, datos) {
    const docRef = this.db.collection(coleccion).doc(documento);
    let successful = false;
    let e;

    await docRef.set(datos).then(() => {
      console.log("Document successfully overwritten!");
      successful = true;
    }).catch((error) => {
      console.log(error);
      e = error;
    });

    if (successful) return Promise.resolve(null);
    else return Promise.reject(e);
  }

  async loginEmailPassword(email, password, session) {
    
    let resultUser = null;
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
            resultUser = result.user;
          });
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
      });
    return  resultUser;
  }

  async registroEmailPassword(email, password) {
    let user;
    let resultUser = null;
    await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        user = userCredential.user;
        return this.db
          .collection("Users")
          .doc(user.uid)
          .set({
            email: user.email,
          })
          .then(() => {
            resultUser= user;
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

    return resultUser;
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

  async cargarHorario(idMeter) {
    let schedule = new Schedule(true);
    let scheduleDB = schedule.toScheduleDB();


    for (let index = 0; index < 7; index++) {
      let docRef = this.db.collection("Config").doc(idMeter).collection("Schedule").doc(`d${index}`);
      await docRef.get().then((doc) => {
        if (doc.exists) {

          scheduleDB[`d${index}`] = doc.data();
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    }
    console.log("db es ", scheduleDB);
    return schedule.toScheduleUI(scheduleDB);
  }

  async acutalizarHorario(idMeter, schedule) {
    let scheduleDB = schedule.toScheduleDB();
    for (let index = 0; index < 7; index++) {
      let configRef = this.db.collection("Config").doc(idMeter).collection("Schedule").doc(`d${index}`);
      await configRef.set(
        scheduleDB[`d${index}`], {
        merge: true
      }
      )
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {

          console.error("Error updating document: ", error);
        });
    }
  }

  async loginRegistroGoogle(session) {
    let provider = new firebase.auth.GoogleAuthProvider();
    let user = null;
    let resultUser = null;
    console.log("LOGIN REGISTRO GOOGLE");
     await firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence[session])
      .then(() => {
        return firebase
          .auth()
          .signInWithPopup(provider)
          .then((result) => {

            console.log("FINISH AUTH");
            /** @type {firebase.auth.OAuthCredential} */
            let credential = result.credential;
   
            // This gives you a Google Access Token. You can use it to access the Google API.
            let token = credential.accessToken;
            // The signed-in user info.
            user = result.user;
            console.log(user.uid);
            let docReg = this.db.collection("Users").doc(user.uid);

           return docReg
              .get()
              .then((doc) => {
                console.log("FINISH GET");
                if (!doc.exists) {
                 return this.db
                  .collection("Users")
                  .doc(user.uid)
                  .set({
                    email: user.email,
                  },{merge:true})
                  .then(() => {
                    resultUser = user;
                   
                    console.log("Document successfully written! gooooogle");
                    
                  })
                  .catch((error) => {
                    console.error("Error writing document: ", error);
                  });
                } 
                resultUser = user;
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

      return resultUser;
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

  async addDates(idMeter, cutOffDay, payDay) {

    await this.db.collection("Devices").doc(idMeter).update({
      cutOffDay: cutOffDay,
      payDay: payDay,
    })
      .then(() => {
        console.log("Document successfully written!");

      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  };

  async addDateForUser(idUser, idMeter, cutOffDay, payDay) {

    let pathUserConfig = `users.${idUser}.config`;

    let dateUser = {
      cutOffDayUser: cutOffDay,
      payDayUser: payDay,
    };

    this.db
      .collection("Devices")
      .doc(idMeter)
      .update({
        [pathUserConfig]: dateUser,
      })
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

  async buscarUsuarioXemail(email) {
    let id;
    await this.db.collection("Users").where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          id = doc.id;
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
    return id;
  }

  async agregarUsuarioAlista(idMeter, userId, email, rol) {

    let path = `users.${userId}`;
    this.db
      .collection("Devices")
      .doc(idMeter)
      .update({
        [path]: {
          email,
          rol
        }
      })
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }
  async activarDispositivoParaUserAdmin(id, idUser, emailUser, rolUser) {
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

          if (sfDoc.exists) {
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
}