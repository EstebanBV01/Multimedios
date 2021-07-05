document.addEventListener("DOMContentLoaded", async function () {
  let btnAgregar = document.querySelector("#btnAgregarUsuario");
  let inputIdMeter = document.querySelector("#inputIdMeter");
  let inputIdUser = document.querySelector("#inputIdUser");
  let inputEmail = document.querySelector("#inputEmail");
  let inputRol = document.querySelector("#inputRol");
  let btnEliminar = document.querySelector("#btnEliminarMedidor");
  let mensajeError = document.querySelector("#mensajeError");
  let contenidoConfig = document.querySelector("#v-pills-tabContent");
  let meterId;
  let meterName = document.querySelector("#inputName");
  let datosDB;
  let btnEliminarModal = document.querySelector("#btnEliminarDispositivo");
  let divCargando = document.querySelector("#divCargando");

  let db = new DataBase();

  meterId = sessionStorage.getItem("id");

  const revisarVariable = async () => {
    if (meterId === "" || meterId === null) {

      btnEliminar.disable = true;
      mensajeError.classList.remove("hideElement");
      mensajeError.classList.add("showElement", 'estiloMensajeError');
      contenidoConfig.classList.remove("showElement");
      contenidoConfig.classList.add("hideElement");
    } else {
      datosDB = await db.consultarMedidorID(meterId);

      btnEliminar.disable = false;
      mensajeError.classList.add("hideElement");
      mensajeError.classList.remove("showElement", "estiloMensajeError");
      contenidoConfig.classList.add("showElement");
      contenidoConfig.classList.remove("hideElement");
      meterName.placeholder = datosDB.customName;
      nombreActual.placeholder = datosDB.customName;
    }
  }
  
  await revisarVariable();

  const loadUsers = (users) => {
    console.log(users);
    
    for (let index = 0; index < users.length; index++) {
      const user = users[index][1];
     
     
      
      let newRow = 
    ` 
    <tr>
    <td>${user.email}</td>
    <td class="text-center">${user.rol}</td>
    <td class="text-end">
        <button class="btn btn-primary "><i class="bi bi-sliders"></i></button>
    </td>
  </tr>`

  $("#cuerpoTablaUsuarios").append(newRow);
    }
    
  }

  loadUsers(Object.entries(datosDB.users));
  divCargando.classList.remove("showElement");
  divCargando.classList.add("hideElement");
  $("#weekly-schedule").dayScheduleSelector({
    /* options */

    // Sun - Sat
    days: [0, 1, 2, 3, 4, 5, 6],

    // HH:mm format
    startTime: "00:00",

    // HH:mm format
    endTime: "24:00",

    // minutes
    interval: 30,

    stringDays: ["Dom", "Lun", "Mar", "Mier", "Jue", "Vie", "Sab"],
  });


  /*btnAgregar.addEventListener("click", async () => {
    let db = new DataBase();

    await db.agregarDispositivo(
      inputIdMeter.value,
      inputIdUser.value,
      inputEmail.value,
      inputRol.value
    );

    console.log("DONE ADDING");
  });*/

  btnEliminar.addEventListener("click", async () => {
    $("#modalEliminarMedidor").modal("show");
  });

  btnEliminarModal.addEventListener("click", async () => {
    let db = new DataBase();
    if (meterName.value === datosDB.customName) {
      await db.eliminarDispositivo(meterId);
      console.log("ELIMINAR");
      meterId = null;
      sessionStorage.removeItem("id");
      revisarVariable();
      $("#modalEliminarMedidor").modal("hide");
    }
  });
  window.onbeforeunload = function () {
    if (document.referrer === "") {
      sessionStorage.removeItem("id");
    } else {
      // do foo
    }
  };

  window.onload = function () {
    if (document.referrer === "") {
      sessionStorage.removeItem("id");
    } else {
      // do foo
    }
  };
});