const btnSalir = document.querySelector('#salir');
$(document).ready(async() => {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log(user);
            // user.displayName? nombreUsuario.innerText = "Bienvenid@: " + user.displayName:nombreUsuario.innerText = "Bienvenid@: " + user.email;
        } else {
            // No user is signed in.
        }
    });
});
btnSalir.addEventListener('click', e => {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("salio de la sesion");
        $(location).attr('href', "index.html");
    }).catch((error) => {
        // An error happened.
    });

})