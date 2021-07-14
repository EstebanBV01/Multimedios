document.addEventListener("DOMContentLoaded", async function () {
  //console.log("Sección", 1);
  let btnEliminar = document.querySelector("#btnEliminarMedidor");
  let mensajeError = document.querySelector("#mensajeError");
  let contenidoConfig = document.querySelector("#v-pills-tabContent");
  let meterId;
  let meterName = document.querySelector("#inputName");
  let datosDB;
  let btnEliminarModal = document.querySelector("#btnEliminarDispositivo");
  let divCargando = document.querySelector("#divCargando");
  let emailAgregarUsuario = document.querySelector("#emailAgregarUsuario");
  let formAgregarUsuario = document.querySelector("#btnAgregarUsuarioModal");
  let btnGuardarFecha = document.querySelector("#btnguardarFechas");
  let fechaCorte = document.querySelector("#slcCutOffDay");
  let fechaPago = document.querySelector("#slcPayDay");
  let db = new DataBase();
  let scheduleObject = new Schedule(true);
  const btnSalir = document.querySelector('#salir');
  let btnGuardarFechaUsuario = document.querySelector("#btnguardarFechasUsuarios");
  let fechaCorteUsuario = document.querySelector("#slcCutOffDayUser");
  let fechaPagoUsuario = document.querySelector("#slcPayDayUser");
  let user = firebase.auth().currentUser;
  let combo = document.getElementById("rolSelect");
  //let btnModificar = document.querySelector('#btnguardarModificar');
  let newName = document.querySelector("#nuevoNombreInput");


  meterId = sessionStorage.getItem("id");

  //console.log("Sección", 2);
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
  };
  //console.log("Sección", 3);

  const cutDays = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcCutOffDay").append(newRow);
    }
  };

  const payDays = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcPayDay").append(newRow);
    }
  };

  const cutDaysUser = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcCutOffDayUser").append(newRow);
    }
  };

  const payDaysUser = (days) => {
    for (let index = 1; index < days; index++) {
      const day = index;
      let newRow =
        `<option value="${day}">${day}</option>`

      $("#slcPayDayUser").append(newRow);
    }
  };

  //console.log("Sección", 4);

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

  //console.log("Sección", 5);
  const cargarConfig = async () => {
    /* Estructura de documentos de la colección "Config"
    const datos = {
      colorEnEspera: {
        Red: number,
        Green: number,
        Blue: number
      },

      colorAlerta: {
        Red: number,
        Green: number,
        Blue: number
      },

      enModoPrueba: boolean,
      umbralSonido: number,
      tiempoDeEspera: number,
      mensajeNotificacion: string
    }; */

    let datos = null;
    await db.obtenerDocumento("Devices", meterId).then((d) => {
      datos = d;

    }).catch((error) => {
      if (error === null) alert("DISPOSITIVO NO ENCONTRADO\n"
      + "Regrese a la lista de dispositivos y seleccione uno.");
      else alert("ERROR AL CARGAR CONFIGURACIÓN.\nPor favor recargue la página asegurando una buena conexión a internet.");
      return Promise.reject(error);
    });


    document.getElementById("alarm-sw").checked = datos.activated;


    await db.obtenerDocumento("Config", meterId).then((d) => {
      datos = d;

    }).catch((error) => {
      if (error === null) {
        alert("¡Dispositivo nuevo detectado!\n"
        + "Guarde sus configuraciones para que no vuelva a aparecer este mensaje con este dispositivo.");
        
        // Mensaje de notificación por defecto
        document.getElementById("notificationMessage").value = 
        "Por favor baje el nivel de ruido que me está molestando en este momento.\n¡Gracias de antemano por su cooperación!";
    } else alert("ERROR AL CARGAR CONFIGURACIÓN.\nPor favor recargue la página asegurando una buena conexión a internet.");
      return Promise.reject(error);
    });

    const colorEspera = datos.colorEnEspera;
    const colorEnAlerta = datos.colorAlerta;
    document.getElementById("standby-color").value = valuesTohtmlRGB(colorEspera.Red, colorEspera.Green, colorEspera.Blue);
    document.getElementById("alert-color").value = valuesTohtmlRGB(colorEnAlerta.Red, colorEnAlerta.Green, colorEnAlerta.Blue);
    document.getElementById("test-sw").checked = datos.enModoPrueba;
    document.getElementById("sensitivity").value = datos.umbralSonido;
    document.getElementById("cooldown").value = datos.tiempoDeEspera;
    document.getElementById("notificationMessage").value = datos.mensajeNotificacion;

    return Promise.resolve(null);
  };

  //console.log("Sección", 6);

  

  // Aquí es donde se carga todo verdad?
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
  };
  //console.log("Sección", 7);
  await revisarVariable();
  //console.log("Sección", 8);
  await cargarConfig().catch((e) => {
    console.log("No hay configuración guardada", e);
  });

  const obtenerHorario = () => {
    const scheduleUI = $("#weekly-schedule").data('artsy.dayScheduleSelector').serialize();
    console.log(scheduleUI);

    const sch = new Schedule(true);

    scheduleObject.toScheduleObject(scheduleUI);
    console.log(scheduleObject);

    sch.toScheduleObject(scheduleUI);
    let ui = sch.toScheduleUI(sch.toScheduleDB());
    console.log("--------------------------------------------");

    console.log(ui);
  };

  const crearDocumentoConfig = () => {
    const colorEspera = htmlRGBToValues(document.getElementById("standby-color").value);
    const colorEnAlerta = htmlRGBToValues(document.getElementById("alert-color").value);

    return {
      colorEnEspera: {
        Red: colorEspera[0],
        Green: colorEspera[1],
        Blue: colorEspera[2]
      },

      colorAlerta: {
        Red: colorEnAlerta[0],
        Green: colorEnAlerta[1],
        Blue: colorEnAlerta[2]
      },

      enModoPrueba: document.getElementById("test-sw").checked,
      umbralSonido: parseInt(document.getElementById("sensitivity").value),
      tiempoDeEspera: parseInt(document.getElementById("cooldown").value),
      mensajeNotificacion: document.getElementById("notificationMessage").value.trim(),
      notificar: false
    };
  };
  //console.log("Sección", 11);
  function htmlRGBToValues(htmlRGB) {
    // htmlRGB is expected to be an string of RGB values in HTML format (aka "#RRGGBB", every value in two hexadecimal digits)
    return [parseInt(htmlRGB.substr(1, 2), 16), parseInt(htmlRGB.substr(3, 2), 16), parseInt(htmlRGB.substr(5, 2), 16)];
  }
  //console.log("Sección", 12);
  // red, green and blue are integers between 0 and 255
  function valuesTohtmlRGB(red, green, blue) {
    // Faster than % 256
    red &= 255;
    green &= 255;
    blue &= 255;

    return "#" + intToHex(red) + intToHex(green) + intToHex(blue);
  }
  //console.log("Sección", 13);

  function intToHex(val) {
    return ((val < 16 ? "0" : "") + val.toString(16)).toUpperCase();
  }

  // Funciona parecido al showMessageDialog del JOptionPane de Java Swing
  function mostrarModalMensaje(titulo, mensaje) {
    document.getElementById("messageModalToggleLabel").innerText = titulo;
    document.getElementById("messageModalBody").innerText = mensaje;
    $("#messageModalToggle").modal("show");
  }
  console.log("Sección", 14);

  // Esto no le funka a María aparentemente
  btnEliminar.addEventListener("click", async () => {
    $("#modalEliminarMedidor").modal("show");
  });
  console.log("Sección", 15);

  btnEliminarModal.addEventListener("click", async () => {
    let db = new DataBase();
    if (meterName.value.trim() === datosDB.customName) {
      await db.eliminarDispositivo(meterId);
      console.log("ELIMINAR");
      meterId = null;
      sessionStorage.removeItem("id");
      revisarVariable();
      $("#modalEliminarMedidor").modal("hide");
      mostrarModalMensaje("Mensaje al usuario", "Dispositivo eliminado con éxito");
    } else {
      alert("Los nombres no coinciden, no se puede continuar.");
    }
  });
  //console.log("Sección", 16);
  window.onbeforeunload = function () {
    if (document.referrer === "") {
      sessionStorage.removeItem("id");
    } else {
      // do foo
    }
  };
  //console.log("Sección", 17);
  window.onload = function () {
    if (document.referrer === "") {
      sessionStorage.removeItem("id");
    } else {
      // do foo
    }
  };
  //console.log("Sección", 18);
  btnSalir.addEventListener('click', e => {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      console.log("salio de la sesion");
      $(location).attr('href', "index.html");
    }).catch((error) => {
      // An error happened.
    });
  })
  //console.log("Sección", 19);
  // Esto no es del proyecto SoundMeter verdad? De no ser así definitivamente no lo toco
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
  //console.log("Sección", 20);

  // Esto no es del proyecto SoundMeter verdad? De no ser así definitivamente no lo toco
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


  //console.log("Sección", 21)
  formAgregarUsuario.addEventListener('click', async e => {
    //e.preventDefault();
    let selected = combo.options[combo.selectedIndex].text;

    let rol = null;
    await buscarElRol(Object.entries(datosDB.users))
    .then((v) => {
      rol = v;
    })
    .catch((error) => {
      console.log("Error al obtener el rol:", error);
    });

    let idUsuarioaAgregar = await db.buscarUsuarioXemail(emailAgregarUsuario.value.trim().toLowerCase());
    if (rol === "Admin" && idUsuarioaAgregar != undefined) {
      console.log(rol + " " + emailAgregarUsuario.value + " " + selected);
      await db.agregarUsuarioAlista(meterId, idUsuarioaAgregar, emailAgregarUsuario.value, selected);
      await db.activarDispositivoParaUserAdmin(meterId, idUsuarioaAgregar, emailAgregarUsuario.value, selected);
    } else {
      alert("Usted no tiene permisos de administrador, o el usuario (correo) digitado no existe");
    }

    $("#modalAgregarUsuario").modal("hide");
  });

  //console.log("Sección", 22);

  const buscarElRol = async (array) => {
    let arr = [];
    let user = await firebase.auth().currentUser;
    let roll;
    for (let i = 0; i < array.length; i++) {
      arr = array[i]
      for (let j = 0; j < arr.length; j++) {
        let { email, rol } = arr[j];
        console.log(email + " " + user.email);
        if (email == user.email) {
          roll = rol;
        }
      }
    };
    return roll;
  }
  //console.log("Sección", 23);

  $("#guardarBtn").click(async function(e) {
    let rol = null;
    await buscarElRol(Object.entries(datosDB.users))
    .then((v) => {
      rol = v;
    })
    .catch((error) => {
      console.log("Error al obtener el rol:", error);
    });
    console.log("Rol del usuario actual:", rol);
    if (rol !== "Admin") {
      alert("No se puede guardar, el usuario actual no tiene permiso de administrador sobre este dispositivo.");
      return;
    }

    if (document.getElementById("notificationMessage").value.trim().length === 0) {
      alert("El mensaje de notificación no puede estar vacío o con solamente espacios en blanco");
      return;
    }

    const localDB = firebase.firestore();
    const lote = localDB.batch();
    const nuevoNombre = newName.value.trim();
    const cambiarNombre = nuevoNombre.length !== 0;

    const datosDispositivo = {
      activated: document.getElementById("alarm-sw").checked,
      customName: (cambiarNombre ? nuevoNombre : nombreActual.placeholder),
      lastValue: 0,
      type: "SoundMeter",
      updateConfig: false
      //users: {}
    };

    obtenerHorario();
    const scheduleDB = scheduleObject.toScheduleDB();

    // Establecer operaciones de escritura
    lote.update(localDB.doc("Devices/" + meterId), datosDispositivo);
    lote.set(localDB.doc("Config/" + meterId), crearDocumentoConfig());

    if (cambiarNombre) {
      const user = await firebase.auth().currentUser;
      lote.update(localDB.doc("Users/" + user.uid), {[`devices.${meterId}.customName`]:nuevoNombre});
    }
    
    let documentoHorario;
    // Setear el horario de cada día
    for (let index = 0; index < 7; index++) {
      documentoHorario = localDB.collection("Config").doc(meterId).collection("Schedule").doc(`d${index}`);
      lote.set(documentoHorario, scheduleDB[`d${index}`], { merge: true });
    }

    await lote.commit()
    .then((v) => {
      mostrarModalMensaje("Mensaje al usuario", "¡Todos los cambios se han guardado con éxito! "
      + "Ahora presione el botón de \"Actualizar config\" para que surjan efecto en el dispositivo.");
    })
    .catch((error) => {
      console.log("Error al guardar todo:", error);
      alert("No se pudieron guardar todos los cambios".toUpperCase()
      + "\nPor favor inténtelo de nuevo asegurando una buena conexión a internet.");
    });

    if (cambiarNombre) {
      nombreActual.placeholder = nuevoNombre;
    }
    newName.value = "";
  });
});
