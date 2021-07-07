document.addEventListener("DOMContentLoaded", async function () {

  let btnEliminar = document.querySelector("#btnEliminarMedidor");
  let mensajeError = document.querySelector("#mensajeError");
  let contenidoConfig = document.querySelector("#v-pills-tabContent");
  let meterId;
  let meterName = document.querySelector("#inputName");
  let datosDB;
  let btnEliminarModal = document.querySelector("#btnEliminarDispositivo");
  let divCargando = document.querySelector("#divCargando");
  let emailAgregarUsuario = document.querySelector("#emailAgregarUsuario");
  let formAgregarUsuario = document.querySelector("#formAgregarUsuario");
  let btnGuardarFecha = document.querySelector("#btnguardarFechas");
  let fechaCorte = document.querySelector("#slcCutOffDay");
  let fechaPago = document.querySelector("#slcPayDay");
  let db = new DataBase();
  let scheduleObject = new Schedule(true);
  const btnSalir = document.querySelector('#salir');

  meterId = sessionStorage.getItem("id");

  const loadUsers = (users) => {
    console.log(users);

    for (let index = 0; index < users.length; index++) {
      const user = users[index][1];




      let newRow =
        `<tr>
      <td>${user.email}</td>
      <td class="text-center">${user.rol}</td>
      <td class="text-end">
          <button class="btn btn-primary "><i class="bi bi-sliders"></i></button>
      </td>
  </tr>`

      $("#cuerpoTablaUsuarios").append(newRow);
    }

  }


  $("#weekly-schedule").dayScheduleSelector({
    /* options */

    // Sun - Sat
    days: [0, 1, 2, 3, 4, 5, 6],

    // HH:mm format
    startTime: "00:00",

    // HH:mm format
    endTime: "23:30",

    // minutes
    interval: 30,

    stringDays: ["Dom", "Lun", "Mar", "Mier", "Jue", "Vie", "Sab"],
  });

  const revisarVariable = async () => {

    if (meterId === "" || meterId === null) {

      btnEliminar.disable = true;
      mensajeError.classList.remove("hideElement");
      mensajeError.classList.add("showElement", 'estiloMensajeError');
      contenidoConfig.classList.remove("showElement");
      contenidoConfig.classList.add("hideElement");
    } else {
      datosDB = await db.consultarMedidorID(meterId);
      loadUsers(Object.entries(datosDB.users));
   

      $("#weekly-schedule").data('artsy.dayScheduleSelector').deserialize(await db.cargarHorario(meterId));
      btnEliminar.disable = false;
      mensajeError.classList.add("hideElement");
      mensajeError.classList.remove("showElement", "estiloMensajeError");
      contenidoConfig.classList.add("showElement");
      contenidoConfig.classList.remove("hideElement");
      meterName.placeholder = datosDB.customName;
      nombreActual.placeholder = datosDB.customName;
      
      
    }
    divCargando.classList.remove("showElement");
    
    divCargando.classList.add("hideElement");
   
  }

  await revisarVariable();


  $("#actualizarHorario").click(async () => {
    let scheduleUI = $("#weekly-schedule").data('artsy.dayScheduleSelector').serialize();
    console.log(scheduleUI);

    let sch = new Schedule(true);


    scheduleObject.toScheduleObject(scheduleUI);
    console.log(scheduleObject);

    sch.toScheduleObject(scheduleUI);
    let ui = sch.toScheduleUI(sch.toScheduleDB());
    console.log("--------------------------------------------");

    console.log(ui);

    await db.acutalizarHorario(meterId, scheduleObject);
  });


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


  formAgregarUsuario.addEventListener('submit', async e => {
    e.preventDefault();
    let db = new DataBase();
    let userId = await db.buscarUsuarioXemail(emailAgregarUsuario.value);
    if (userId !== undefined) {
      await db.agregarUsuarioAlista(meterId, userId, emailAgregarUsuario.value, "User");
    }
    $("#modalAgregarUsuario").modal("hide");
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

  btnGuardarFecha.addEventListener("click", async () => {
    let db = new DataBase();
    let optCorte;
    let optPago;

    for (let i = 0, len = fechaCorte.options.length; i < len; i++) {
      optCorte = fechaCorte.options[i];
      if (optCorte.selected === true) {
        break;
      }
    }

    for (let i = 0, len = fechaPago.options.length; i < len; i++) {
      optPago = fechaPago.options[i];
      if (optPago.selected === true) {
        break;
      }
    }

    if (optCorte.value * 1 < optPago.value * 1) {
      await db.addDates(meterId, optCorte.value, optPago.value);
      console.log("Dias agregados");
    } else {
      //Esteban agregue el error de que la fecha corte debe ser menor a la de pago...
    }

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


});