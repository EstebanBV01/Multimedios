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
  let btnGuardarFechaUsuario = document.querySelector("#btnguardarFechasUsuarios");
  let fechaCorteUsuario = document.querySelector("#slcCutOffDayUser");
  let fechaPagoUsuario = document.querySelector("#slcPayDayUser");

  
  let combo = document.getElementById("rolSelect");
  
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

  const cutDays = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcCutOffDay").append(newRow);
    }
  }

  const payDays = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcPayDay").append(newRow);
    }
  }

  const cutDaysUser = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcCutOffDayUser").append(newRow);
    }
  }

  const payDaysUser = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcPayDayUser").append(newRow);
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
      cutDays(32);
      payDays(32);
      cutDaysUser(32);
      payDaysUser(32);
     
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

  btnSalir.addEventListener('click', e => {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("salio de la sesion");
        $(location).attr('href', "index.html");
    }).catch((error) => {
        // An error happened.
    });
})

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

  btnGuardarFechaUsuario.addEventListener("click", async () => {
    let db = new DataBase();
    let optCorteUsuario;
    let optPagoUsuario;

    for (let i = 0, len = fechaCorteUsuario.options.length; i < len; i++) {
      optCorteUsuario = fechaCorteUsuario.options[i];
      if (optCorteUsuario.selected === true) {
        break;
      }
    }

    for (let i = 0, len = fechaPagoUsuario.options.length; i < len; i++) {
      optPagoUsuario = fechaPagoUsuario.options[i];
      if (optPagoUsuario.selected === true) {
        break;
      }
    }

    if (optCorteUsuario.value * 1 < optPagoUsuario.value * 1) {
      await db.addDateForUser(user.uid, meterId, optCorteUsuario.value, optPagoUsuario.value);
      console.log("Dias agregados");
    } else {
      //Esteban agregue el error de que la fecha corte debe ser menor a la de pago...
    }
  });
  let user = firebase.auth().currentUser;
  formAgregarUsuario.addEventListener('submit', async e => {
    e.preventDefault();
    let selected = combo.options[combo.selectedIndex].text;
    let rol= buscarElRol(Object.entries(datosDB.users));
    let idUsuarioaAgregar=await db.buscarUsuarioXemail(emailAgregarUsuario.value);
    if(rol==="Admin"&& idUsuarioaAgregar!=undefined){
      console.log(rol+" "+emailAgregarUsuario.value+" "+selected);
      await db.agregarUsuarioAlista(meterId, idUsuarioaAgregar,emailAgregarUsuario.value, selected);
      await db.activarDispositivoParaUserAdmin(meterId, idUsuarioaAgregar,emailAgregarUsuario.value, selected);
    }else{
      alert("usted no tiene permisos de administrador o el usuario no existe");
    }

    $("#modalAgregarUsuario").modal("hide");
  });

  const buscarElRol = array => {
    let arr = [];
    let roll;
    for (let i = 0; i < array.length; i++) {
      arr = array[i]
      for (let j = 0; j < arr.length; j++) {
        let { email, rol } = arr[j];
        console.log(email+" "+user.email);
        if (email == user.email) {
          roll = rol;
        }
      }
    };
    return roll;
  }

});
