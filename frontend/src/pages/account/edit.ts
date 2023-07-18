import {initTooltips} from "../../util/tooltips";
(function() {
    window.addEventListener("load", main);
    function main() {
        initTooltips();

        const FILE_SIZE_LIMIT = 1024 * 2000; // .5MB
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
                            console.error("file size exceeded");
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
                            imageEl.src = url;

                            _URL.revokeObjectURL(url);
                            image.onload = null;
                        }
                        image.src = url;
                    }
                }
            });
        }


        // update username link
        const userLinkEl = document.getElementById("user-link");
        const usernameInputEl = document.getElementById("username") as HTMLInputElement;
        usernameInputEl.addEventListener("input", evt => {
            const username = usernameInputEl.value.trim();
            userLinkEl.innerText = username;
        });
    }
})();


