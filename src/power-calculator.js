const validate = require('./validator');
const constants = Object.freeze(require('./json-data/constants'));

const calculate = input => {
    validate(input);
    return solve(getHoursCostMap(input.rates), sortDevicesByPowerComsumption(input.devices), input.maxPower);
}

// Returns 48-hours price map of every hour ([6.46, 6.46, 6.46, 5.38, ...1.79])
const getHoursCostMap = rates => {
    let hoursCostMap = new Array(constants.hoursInDay);
    rates.forEach(rate => {
        if (rate.from > rate.to) {
            hoursCostMap.fill(rate.value, rate.from, constants.hoursInDay);
            hoursCostMap.fill(rate.value, constants.firstHourInDay, rate.to);
        } else {
            hoursCostMap.fill(rate.value, rate.from, rate.to);
        }
    });
    const offsettedHourMap = applyTimeOffset(hoursCostMap);
    const fourtyEightHourMap = offsettedHourMap.concat(offsettedHourMap)
    return fourtyEightHourMap;
}

// Applying offset will start the day from "day mode" (7 am)
const applyTimeOffset = hoursCostMap => {
    return hoursCostMap.concat(hoursCostMap.splice(constants.firstHourInDay, constants.dayModeBreakpoint));
}

const sortDevicesByPowerComsumption = devices => {
    return devices.sort((a, b) => {
        return (b.power * b.duration) - (a.power * a.duration);
    });
}

const solve = (hoursCostMap, devices, maxPower) => {
    // Haven't found a well-readable way to decrease for-nesting yet
    let i, j, startHour, endHour;
    let powerMap = new Array(constants.hoursInDay).fill(0);
    const output = {
        schedule: {},
        consumedEnergy: {
            value: 0,
            devices: {}
        }
    };

    devices.forEach(device => {
        let minConsumedEnergy, minPowerUsedByOtherDevices, minStartIndex;
        for (i = 0; i < constants.hoursInDay; i++) {
            startHour = i;
            endHour = i + device.duration;
            if (!isInsideMode(startHour, endHour, device.mode)) continue;

            let consumedEnergy = 0,
                alreadyUsedPower = 0,
                isExceedingMaxPower = false;
            for (j = startHour; j < endHour; j++ ) {
                consumedEnergy += device.power * hoursCostMap[j];
                alreadyUsedPower += powerMap[j];
                if (powerMap[j] + device.power > maxPower) {
                    isExceedingMaxPower = true;
                }
            }

            if ((!minConsumedEnergy || consumedEnergy < minConsumedEnergy) 
            && (!minPowerUsedByOtherDevices || alreadyUsedPower <= minPowerUsedByOtherDevices) 
            && !isExceedingMaxPower) {
                minConsumedEnergy = consumedEnergy;
                minPowerUsedByOtherDevices = alreadyUsedPower;
                minStartIndex = startHour;
            }

            if (device.duration === constants.hoursInDay) break;
        }

        if (!minConsumedEnergy) 
            throw new Error("Unable to solve");

        for (i = minStartIndex; i < minStartIndex + device.duration; i++) {
            powerMap[i] += device.power;
            writeToOutputSchedule(output.schedule, device.id, i);
        }

        minConsumedEnergy = minConsumedEnergy / constants.wattsInKilowatt;
        output.consumedEnergy.devices[device.id] = minConsumedEnergy
        output.consumedEnergy.value += Number((minConsumedEnergy).toFixed(3));
    });

    return output;
}

const isInsideMode = (startHour, endHour, mode) => {
    switch (mode) {
        case "day":
            return endHour <= constants.modesDuration["day"];
        case "night":
            return startHour >= constants.modesDuration["day"];
        default:
            return true;
    }
}

const writeToOutputSchedule = (schedule, deviceId, indexWithOffset) => {
    const index = removeTimeOffset(indexWithOffset);
    if (!schedule[index])
        schedule[index] = [];
    schedule[index].push(deviceId);
}

// Returns index without applied offset
const removeTimeOffset = index => {
    index = index + constants.dayModeBreakpoint;
    if (index > constants.hoursInDay - 1) {
        index -=  constants.hoursInDay;
    }
    return index;
}

module.exports = calculate