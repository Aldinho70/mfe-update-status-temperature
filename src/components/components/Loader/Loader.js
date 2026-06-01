$(document).ready(() => {
    $("body").append(Loader());
});

const Loader = () => {
    return `
        <div id="loader-overlay" class="loader-overlay active">

            <div class="loader-container">

                <!-- Logo de la empresa -->
                <img
                    id="loader-logo"
                    src="http://ws4cjdg.com/JD.INTEGRACIONES.COM/img/logojd.png"
                    alt="Logo Empresa"
                    class="loader-logo"
                >

                <div class="loader-spinner"></div>

                <h2 class="loader-title">
                    Cargando información
                </h2>

                <p class="loader-subtitle">
                    Espere un momento...
                </p>

            </div>

        </div>
    `
}



export const showLoader = () => {
    $('#loader-overlay').addClass('active');
}

export const hideLoader = () => {
    $('#loader-overlay').removeClass('active');
}