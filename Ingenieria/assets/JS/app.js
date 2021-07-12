let bntGoogle = document.querySelector("#btnGoogle");
let btnLogin = document.querySelector("#loginBtn");
let btnRegistro = document.querySelector("#registroBtn")
let modal = document.querySelector("#signUpModal");
let labelImage = document.querySelector("#labelLogin");
let checkBoxLogin = document.querySelector('#cbLogin');
let canLogin = true;
let btnConfirm_loginRegist = document.querySelector('#btnConfirm_loginRegist');
let inputEmail = document.querySelector('#inputEmail');
let inputPassword = document.querySelector('#inputPassword');
let divConfirmPassword = document.querySelector('#divConfirmPassword');
let inputConfirmPassword = document.querySelector('#inputConfirmPassword');
let divCheck = document.querySelector('#divCheck');
document.addEventListener('DOMContentLoaded', () => {
    divConfirmPassword.style.display = "none";

})

inputEmail.addEventListener('change', () => {
  inputEmail.value = inputEmail.value.toLowerCase();
});

btnConfirm_loginRegist.addEventListener('click', async(event) => {
    event.preventDefault();
    let db = new DataBase();
    let user;
    if (canLogin) {
      console.log('--------------------');
      try {
        user = await db.loginEmailPassword(
          inputEmail.value,
          inputPassword.value,
          "SESSION"
        );
  
        console.log(user);
        $(location).attr("href", "loged.html");
      } catch (e) {
        $("#modalContent").text(
          "Las credenciales son incorrectas o el usuario no se encuentra registrado"
        );
        $("#modalMessages").modal("show");
        $("#signUpModal").modal("hide");
      }
    } else if (inputPassword.value === inputConfirmPassword.value) {
      let result = await db.registroEmailPassword(
        inputEmail.value,
        inputPassword.value
      );
      console.log("registro", result);
      user=result;
      console.log(user);
      $("#signUpModal").modal("hide");
    } else {
      $("#modalContent").text(
        "Las contraseñas no coinciden o el email es invalido"
      );
      $("#modalMessages").modal("show");
    }
  
    if (user) {
      $("#signUpModal").modal("hide");
      $(location).attr("href", "loged.html");
    }
});

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
    canLogin = true;
    divConfirmPassword.style.display = "none";
    divCheck.style.display="block";
})
btnRegistro.addEventListener("click", () => {
    btnClick(btnRegistro, btnLogin);
    canLogin = false;
    divCheck.style.display="none";
    divConfirmPassword.style.display = "block";

})
bntGoogle.addEventListener('click', async() => {
    let db = new DataBase();
    if (checkBoxLogin.checked) {
        await db.loginRegistroGoogle("LOCAL");
    } else {
        await db.loginRegistroGoogle("SESSION");
    }
    console.log("saliendo");
    
    let user = await firebase.auth().currentUser;
   
    if(user){
        $('#signUpModal').modal('hide');
        $(location).attr('href', "loged.html");
    }
   
})