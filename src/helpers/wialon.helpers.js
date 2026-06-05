import { extractNumber } from "../utils/utils.js";

export const findBoxTruck = async (data) => {

    const groupNames = [
        'GUZMAN CAJAS DOBLES',
        'GUZMAN IRAPUATO CAJAS',
        'GUZMAN CAJAS',
    ];

    const groupsWithUnits =
        await WialonService.loadGroupsWithUnits(groupNames);

    const cajas = groupsWithUnits.flatMap(
        group => group?.units || []
    );

    const numBoxTruck = extractNumber(data);

    return cajas.find(caja =>
        extractNumber(caja.name) == numBoxTruck
    ) || null;

};