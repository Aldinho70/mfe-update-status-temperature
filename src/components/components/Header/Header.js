export const Header = (data = {}) => {

    return `
        <header class="header-premier container-fluid shadow-lg py-3 mb-4">

            <div class="d-flex align-items-center justify-content-between position-relative" style="z-index:2;">

                <!-- Logo -->
                <div class="d-flex align-items-center gap-2">
                    <img  src="${data?.logo || ''}"  alt="logo" class="img-fluid" style="width:45px;height:45px;object-fit:contain;"/>
                    <h1 class="h4 mb-0 fw-bold text-white">
                        Jornada Digital
                    </h1>
                </div>

                <!-- Title -->
                <div class="text-center">

                    <h1 class="h4 mb-0 fw-bold text-white">
                        ${data?.title || 'Micro frontend para actualizar status de temperatura'}
                    </h1>

                </div>

                <!-- Button -->
                <div>

                    <button id="${data?.button_id || 'headerButton'}" class="btn btn-light fw-semibold d-flex align-items-center gap-2 shadow-sm">
                        <i class="${data?.button_icon || 'bi bi-save'}"></i>
                        ${data?.button_text || 'Guardar cambios'}
                    </button>

                </div>

            </div>

        </header>
    `;
}

$(() => {
    $("body").append(Header({
        logo: 'http://ws4cjdg.com/JD.INTEGRACIONES.COM/img/logojd.png',
        title: 'Micro frontend para actualizar status de temperatura',
        button_text: 'Guardar cambios',
        button_id: 'saveChanges',
        button_icon: 'bi bi-cloud-upload'
    }));
})