$( () => {
    $("body").append(Toast)
});

export const Toast = (  ) => {
    return `
        <div class="toast-container top-0 end-0 toast toast-dark" data-bs-delay="10000" style="min-width: 350px; max-width: 500px;">
            <div class="mt-5"></div>
            <div class="toast fade w-100 bg-waring" role="alert" aria-live="assertive" aria-atomic="true" id="root-toast" ></div>
        </div>
    `
}

export const showToast = (idToast) => {
    const toastElement = $(idToast);
    const toastInstance = new bootstrap.Toast(toastElement);
    toastInstance.show();
}

