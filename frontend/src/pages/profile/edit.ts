const FILE_SIZE_LIMIT = 1024 * 500; // .5MB
const FILE_WIDTH_LIMIT = 1024;
const FILE_HEIGHT_LIMIT = 1024;
const uploadEl = document.querySelector("input[type='file']") as HTMLInputElement;
const imageEl = document.querySelector("#profile-image") as HTMLImageElement;
if (uploadEl && imageEl) {
    uploadEl.addEventListener("change", () => {
        const files = uploadEl.files;

        if (files?.length) {
            let file: File | null;
            if ((file = files.item(0))) {
                if (file.size > FILE_SIZE_LIMIT) {
                    return;
                }
                const image = new Image();

                const _URL = window.URL || window.webkitURL;
                const url = _URL.createObjectURL(file);

                image.onload = function() {
                    if (image.width > FILE_WIDTH_LIMIT) {
                        return;
                    }
                    if (image.height > FILE_HEIGHT_LIMIT) {
                        return;
                    }
                    console.log("HEHEHE")
                    imageEl.src = url;

                    //_URL.revokeObjectURL(url);
                    image.onload = null;
                }
                image.src = url;
            }
        }
    });
}
