class Device {
    customName;
    id;
    updateConfig;
    lastValue;
    type;
    constructor(customName, id, updateConfig, lastValue, type) {
        this.customName = customName;
        this.id = id;
        this.updateConfig = updateConfig;
        this.lastValue = lastValue;
        this.type = type;
    }

    set setCustomName(customName) {
        this.customName = customName;
    }

    set setId(id) {
        this.id = id;
    }

    set setUpdateConfig(updateConfig) {
        this.updateConfig = updateConfig;
    }

    set setLastValue(lastValue) {
        this.lastValue = lastValue;
    }

    get getCustmName() {
        return this.customName;
    }

    get getUpdateConfig() {
        return this.updateConfig;
    }

    get getLastValue() {
        return this.lastValue;
    }

    get getId() {
        return this.id;
    }

}