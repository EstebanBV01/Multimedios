class Schedule {
    dias = {};
    esActual;
    numeroDias = 7;
    constructor(esActual) {
        this.esActual = esActual;
        this.initListaDias();
    }

    initListaDias() {

        for (let index = 0; index < 7; index++) {
            this.dias[`d${index}`] = new Day()

        }
    }

    toScheduleDB() {
        let scheduleDB = {};
        for (let index = 0; index < this.numeroDias; index++) {
            scheduleDB[`d${index}`] = this.dias[`d${index}`].horas;

        }
   

        return scheduleDB;
    }

    toScheduleUI(scheduleDB) {
        let intervalo = [];

        let scheduleUI = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        let horaResult;
        let horaTemp;
        let diaActual;
        let lastHour;
        let esInvertalo = false;
        for (let indexDia = 0; indexDia < this.numeroDias; indexDia++) {
            diaActual = `d${indexDia}`;
            
            
            for (let indexHoras = 0; indexHoras < 24; indexHoras++) {

                if (indexHoras < 10) {
                    horaResult = String(indexHoras).padStart(2, '0');
                } else {
                    horaResult = indexHoras;
                }

                horaTemp = horaResult + ":00";
                if (scheduleDB[diaActual][horaTemp] === true && esInvertalo) {
                    intervalo.push(lastHour);
                    esInvertalo = false;
                    scheduleUI[indexDia].push(intervalo);
                
                   
                    intervalo = [];
                }
               
                lastHour = horaTemp;

                if (scheduleDB[diaActual][horaTemp] === false && esInvertalo === false) {
                    intervalo.push(horaTemp);
                    esInvertalo = true;
               
                }

                horaTemp = horaResult + ":30";
                
                if (scheduleDB[diaActual][horaTemp] === true && esInvertalo) {
                    intervalo.push(lastHour);
                    esInvertalo = false;
                    scheduleUI[indexDia].push(intervalo);
                
                    intervalo = [];
                }
               
                lastHour = horaTemp;
                if (scheduleDB[diaActual][horaTemp] === false && esInvertalo === false) {
                    intervalo.push(horaTemp);
                    esInvertalo = true;
               
                }
                
                if(indexHoras ==23 && scheduleDB[diaActual][horaTemp] === false ){
                    intervalo.push(lastHour);
                    esInvertalo = false;
                    scheduleUI[indexDia].push(intervalo);
                   
                    intervalo = [];
                }
            
                
            }
        }
        return scheduleUI;
    }

    toScheduleObject(scheduleUI) {

        for (let index = 0; index < this.numeroDias; index++) {
            let intervalo = 0;


            while (scheduleUI[index][intervalo]) {
                this.dias[`d${index}`].desactivarHoras(scheduleUI[index][intervalo][0], scheduleUI[index][intervalo][1]);
                

                intervalo++;
            }



        }
    }
}