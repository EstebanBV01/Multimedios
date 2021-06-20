class Day {
    listaHoras = [];
    habilitado = true;
    numeroDia = 0;

    constructor(habilitado, numeroDia) {

        this.habilitado = habilitado;
        this.numeroDia = numeroDia;
        this.initListaHoras();
    }

    initListaHoras() {
        let horaResult;
        let horaTemp;
        for (let index = 0; index < 24; index++) {

            if (index < 9) {
                horaResult = String(index).padStart(2, '0');
            } else {
                horaResult = index;
            }

            horaTemp = horaResult + ":00";
            this.listaHoras.push(horaTemp);

            horaTemp = horaResult + ":30";
            this.listaHoras.push(horaTemp);
        }
    }
}