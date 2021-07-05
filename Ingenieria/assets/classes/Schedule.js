class Schedule {
    listaDias = [];
    esActual;

    constructor(esActual) {
        this.esActual = esActual;
        this.initListaDias();
    }

    initListaDias(day) {
        for (let index = 0; index < 7; index++) {
            this.listaDias.push(day);
        }
    }
}