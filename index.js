import { mapUnits } from "./src/service/guzman.js";
import { TOKEN_WIALON } from "./src/config/wialon.config.js";
import { GROUPS_FILTER } from "./src/config/guzman.config.js";
import { showLoader, hideLoader } from "./src/components/components/Loader/Loader.js";
import { initMap, getLocationsOfUnits } from "./src/components/components/Maps/Maps.js";

$(async () => {
    const initWialon = async () => {
        try {
            showLoader();
            await WialonService.login(TOKEN_WIALON);

            const groups_with_units = await WialonService.loadGroupsWithUnits(GROUPS_FILTER);
            mapUnits( groups_with_units );
            
            // const google_maps = await initMap([]);
            // console.log(google_maps);
            // $("body").append(google_maps)
            
        } catch (err) {
            console.error(err);
        }
    };
    
    const relouder = async () => {
        try {
            console.log('Recargando informacion');
            
            // const units = await WialonService.loadUnits();
            // console.log(units);

            const groups_with_units = await WialonService.loadGroupsWithUnits(GROUPS_FILTER);
            // console.log(groups_with_units);
            mapUnits( groups_with_units );

        } catch (err) {
            console.error(err);
        }
    };

    // Ejecutar login + primera carga
    await initWialon();

    // Repetir cada 50 segundos
    // setInterval(relouder, 50 * 1000);
})