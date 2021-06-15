let bntGoogle = document.querySelector("#btnGoogle");
let h1UserName = document.querySelector("#h1UserName");
let btnLogin = document.querySelector("#loginBtn");
let btnRegistro = document.querySelector("#registroBtn")
let modal = document.querySelector("#signUpModal");
let labelImage = document.querySelector("#labelLogin");

const btnClick = (btnOn, btnOff) => {
    btnOn.classList.add("btnOnClick");
    btnOff.classList.remove("btnOnClick");

}

labelImage.addEventListener('click', async() => {
    let user = firebase.auth().currentUser
    console.log(user);

    if (!user) {
        $('#signUpModal').modal('show')
    } else {
        console.log("false");
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    }

})

btnLogin.addEventListener("click", () => {
    btnClick(btnLogin, btnRegistro);
})

btnRegistro.addEventListener("click", () => {
    btnClick(btnRegistro, btnLogin);
})

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {

        loggedIn(user);

    } else {
        loggedOut();
    }
});
const loggedOut = () => {
    $("#labelLoginImage").toggleClass("fas fa-user fas fa-sign-out-alt fa-lg");
    $("#labelLoginTexto").html("Login or SignUp");
    h1UserName.innerHTML = "Nadie esta logueado";
    $("#userProfileLi").remove();
}
const loggedIn = (user) => {
    console.log("logged in !!");
    console.log({ user });
    $("#labelLoginImage").toggleClass("fas fa-user fas fa-sign-out-alt fa-lg");
    $("#labelLoginTexto").html("Salir");
    let picture = document.createElement('img');
    let list = document.createElement("li");
    list.id = "userProfileLi";
    list.classList.add("nav-item");
    picture.src = user.photoURL;
    picture.classList.add("rounded-circle");
    h1UserName.innerHTML = user.displayName;
    picture.id = "userPicture";
    list.append(picture);
    $("#listaNavBar").prepend(list);
}


bntGoogle.addEventListener('click', async() => {
    await registerUserGoogle("SESSION");
    console.log("DONE!");
    $('#signUpModal').modal('hide')
})