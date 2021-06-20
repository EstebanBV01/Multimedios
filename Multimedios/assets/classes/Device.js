class Device {
    customName;
    id;
    updateConfig;
    lastValue;
    type;
    activated;
    constructor(customName, id, updateConfig, lastValue, type, activated) {
        this.customName = customName;
        this.id = id;
        this.updateConfig = updateConfig;
        this.lastValue = lastValue;
        this.type = type;
        this.activated = activated;
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

let deviceConverter = {
    toFirestore: function(device) {
        return {
            customName: device.customName,
            id: device.id,
            updateConfig: device.updateConfig,
            lastValue: device.lastValue,
            type: device.type,
            activated: device.activated
        };
    },
    fromFirestore: function(snapshot, options) {
        const data = snapshot.data(options);
        return new Device(data.customName, data.id, data.updateConfig, data.lastValue, data.type, data.activated);
    }
};