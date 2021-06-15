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

const cardNueva = (customName, id, lastValue) => {
    let divCard = document.createElement("div");
    divCard.classList.add("card");
    let imgCard = document.createElement("img");
    imgCard.classList.add("card-img-top");
    imgCard.alt = "Sensor de ruido";
    imgCard.src = "https://images-na.ssl-images-amazon.com/images/I/71hEtk3aCpL._SL1500_.jpg";
    divCard.appendChild(imgCard);
    let divBody = document.createElement("div");
    divBody.classList.add("card-body");
    let titleCard = document.createElement("h5");
    titleCard.classList.add("card-title");
    titleCard.innerText = customName;
    divBody.appendChild(titleCard);
    let paragraphCard = document.createElement("p");
    paragraphCard.classList.add("card-text");
    paragraphCard.innerText = lastValue;
    divBody.appendChild(paragraphCard);
    let buttonCard = document.createElement("a");
    buttonCard.classList.add("btn-primary", "btn");
    buttonCard.innerText = "Configurar";
    buttonCard.href = id;
    divBody.appendChild(buttonCard);
    divCard.appendChild(divBody);

    return divCard;
}




const loadData = async() => {
    let resultado = await getData();

    let customName;
    let id;
    let lastValue;
    let divContainer = document.createElement("div");
    divContainer.classList.add("container-fluid");
    let cardDiv = document.querySelector("#Cards");
    let divRow;
    let divCol;
    let card;
    let counter = 0;

    for (let index = 0; index < resultado.length; index++) {

        if (index === 0 || counter === 4) {
            divRow = document.createElement("div");
            divRow.classList.add("row");
            divContainer.append(divRow);
            counter = 0;
        }

        divCol = document.createElement("div");
        divCol.classList.add("col-sm-6", "col-md-6", "col-xl-3");
        customName = resultado[index][1].customName;
        lastValue = resultado[index][1].lastValue;
        id = resultado[index][0];
        card = cardNueva(customName, id, lastValue);
        console.log("CaRTA");

        console.log({ card });

        divCol.append(card);
        divRow.append(divCol);

        counter++;
    }

    cardDiv.append(divContainer);
}
const loggedIn = (user) => {
    console.log("logged in !!");
    console.log({ user });
    $("#labelLoginImage").toggleClass("fa-sign-out-alt fa-lg fas fa-user fas");
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
    $('#signUpModal').modal('hide')
    await loadData();
})
})
