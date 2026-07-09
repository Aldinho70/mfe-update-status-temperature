import { showNotifications, updateNotificationsBadge } from "../../Notifications/Notifications.js";

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
                        ${data?.title || 'Operacion temperaturas Guzman'}
                    </h1>

                </div>

                <!-- Button -->
                <div class="d-flex align-items-center gap-2">
                    <button id="${data?.button_id || 'headerButton'}" class="btn btn-warning fw-semibold d-flex align-items-center gap-2 shadow-sm">
                        <i class="${data?.button_icon || 'bi bi-save'}"></i>
                        ${data?.button_text || 'Guardar cambios'}
                    </button>

                    <button id="root-btn-notificaciones" class="btn btn-info fw-semibold d-flex align-items-center gap-2 shadow-sm" onClick="showNotificationsEvent()">
                        <i class="bi bi-bell-fill"></i>
                        <div class="d-flex align-items-center align-items-baseline gap-2">
                            Notificaciones <span class="badge text-bg-dark cont_notification " >0</span>
                        </div>
                    </button>
                </div>

            </div>

        </header>
    `;
}

$(() => {
    $("body").append(Header({
        logo: 'http://ws4cjdg.com/JD.INTEGRACIONES.COM/img/logojd.png',
        title: 'Operacion temperaturas Guzman',
        button_text: 'Guardar cambios',
        button_id: 'saveChanges',
        button_icon: 'bi bi-cloud-upload'
    }));

    setInterval(() => {
        const count = WialonService.getArrayNotifications().length;
        console.log('count', count);
        updateNotificationsBadge(count);
    }, 10000);

})

const showNotificationsEvent = () => {
    showNotifications();
}
window.showNotificationsEvent = showNotificationsEvent;