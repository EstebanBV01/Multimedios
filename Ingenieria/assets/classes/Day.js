class Day {
    horas = {};

    constructor() {

    
        this.initListaHoras();
    }

    initListaHoras() {
        let horaResult;
        let horaTemp;

        for (let index = 0; index < 24; index++) {

            if (index < 10) {
                horaResult = String(index).padStart(2, '0');
            } else {
                horaResult = index;
            }

            horaTemp = horaResult + ":00";
            this.horas[horaTemp] = true

            horaTemp = horaResult + ":30";
            this.horas[horaTemp] = true

        }
    }

    valorHora(hora) {
        let valor = parseInt(hora.split(":")[0]) + (parseFloat(hora.split(":")[1]))/60;
   
        
        return valor;
    }

    desactivarHoras(horaInicial, horaFinal) {
        let horaResult;
        let horaTemp;
        let horaTempValor;
        let horaInicialValor = this.valorHora(horaInicial);
        let horaFinalValor = this.valorHora(horaFinal);

        for (let index = 0; index < 24; index++) {

            if (index < 10) {
                horaResult = String(index).padStart(2, '0');
            } else {
                horaResult = index;
            }

            
            horaTemp = horaResult + ":00";
            horaTempValor = this.valorHora(horaTemp);

    
            console.log(horaTempValor >= horaInicialValor && horaTempValor <= horaFinalValor);
            if ( horaTempValor >= horaInicialValor && horaTempValor <= horaFinalValor) {
                this.horas[horaTemp] = false
            }

            horaTemp = horaResult + ":30";
            horaTempValor = this.valorHora(horaTemp);
        
            
            if (horaTempValor >= horaInicialValor && horaTempValor <= horaFinalValor) {
                this.horas[horaTemp] = false
            }

        }

    }

}