class RessponsiveGallery extends HTMLElement {
  constructor() {
    super();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/ResponsiveGallery/ResponsiveGallery.min.css";
    document.head.appendChild(link);
    this.innerHTML = `<div class="gallery__content" ondragstart="return false;"> </div>`;
    this.images = new Object();
    this.image = new Image();
    this.regExpJson = /(\.|\/)(json)$/;
    this.regExpImg = /(\.|\/)(gif|jpg|jpeg|tiff|png)$/;

    this._dragAndDropEvent();
  }

  _dragAndDropEvent() {
    $(".gallery__content").text("");

    let galleryContents = document.querySelectorAll(".gallery__content");

    for (let galleryContent of galleryContents) {
      let formData = new FormData();

      galleryContent.addEventListener("dragenter", function () {
        $(".gallery__content").addClass("gallery__content_hover");
      });

      ["drop", "dragleave"].forEach((eventName) =>
        galleryContent.addEventListener(eventName, function () {
          $(".gallery__content").removeClass("gallery__content_hover");
        })
      );

      ["drop", "dragover"].forEach((eventName) =>
        galleryContent.addEventListener(
          eventName,
          (e) => {
            e.preventDefault();
            e.stopPropagation();

            let files = e.dataTransfer.files;

            Object.entries(files).forEach(([key, file]) => {
              formData.append("file", file);

              if (this.isImg(file.type)) {
                let reader = new FileReader();
                $(reader).load((e) => {
                  if (this.image.width === 0 || this.image.height === 0) {
                    let img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                      this.images["properties-" + key] = Object.assign(
                        {},
                        {
                          url: img.src,
                          width: img.width,
                          height: img.height,
                        }
                      );
                      this.addImgs();
                    };
                  } else {
                    this.images["properties-" + key] = Object.assign(
                      {},
                      {
                        url: e.target.result,
                      }
                    );
                  }
                });
                reader.readAsDataURL(file);

                Object.entries(this.images).forEach(([key, img]) => {
                  this.image.src = img.src;
                  this.image.onload = () => {
                    this.images["properties-" + key] = Object.assign(
                      {},
                      {
                        url: this.image.src,
                        width: this.image.width,
                        height: this.image.height,
                      }
                    );
                  };
                });

                this.addImgs();
              } else if (this.isJson(file.type)) {
                this.loadJson(file);
              } else {
                alert(`Файл ${file.name} не является изображением`);
              }
            });
          },
          false
        )
      );
    }
  }
  getJSON(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function () {
      let status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
  }

  isImg(url) {
    return this.regExpImg.test(url);
  }

  isJson(url) {
    return this.regExpJson.test(url);
  }

  loadJson(inputField) {
    let jsonFile =
      inputField.files && inputField.files[0]
        ? inputField.files[0]
        : inputField;
    let file = new FileReader();
    file.onload = () => {
      let result = JSON.parse(file.result);
      this.images = result["galleryImages"];
      this.addImgs();
    };
    file.onerror = function () {
      alert("Ошибка во время загрузки json файла ");
    };
    file.readAsText(jsonFile);
  }

  addImgs() {
    Object.entries(this.images).forEach(([key, img]) => {
      let photo = document.createElement("img");
      let block = document.createElement("div");
      let button = document.createElement("button");

      photo.classList.add("gallery__img");
      button.classList.add("gallery__button-delete", "button");
      block.classList.add("gallery__div");

      img.width = (img.width * 140) / img.height;

      $(block).css({ width: img.width });

      photo.src = img.url;

      $(".gallery__content").append(block);

      $(block).append(photo);
      $(block).append(button);
    });

    $(".gallery__button-delete").click(function () {
      $(this).parent().remove();
    });
    $(".loader-images__input").val("");
    $(".loader-images__file-name").text("");
    $(".loader-images__input-file").val("");

    this.images = {};
  }
}

customElements.define("ressponsive-gallery", RessponsiveGallery);
