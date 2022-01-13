class ImageLoader extends HTMLElement {
  constructor() {
    super();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/ImageLoader/ImageLoader.min.css";
    document.head.appendChild(link);

    this.innerHTML = `
    <div class='loader-images'>
        <input class="loader-images__input input" placeholder="Введите URL" />
        <input class="loader-images__btn-upload input" type="button"  value="Загрузить" />
        <input class="loader-images__btn-choose-file input" type="button" value="Выбрать файл" />
        <label class="loader-images__file-name label"></label>
        <input class="loader-images__btn-clear input" type="button" value="Очистить галлерею" />
        <input class="loader-images__input-file input" type="file" />
      </div>`;
    this.images = new Object();
    this.image = new Image();
    this.regExpJson = /(\.|\/)(json)$/;
    this.regExpImg = /(\.|\/)(gif|jpg|jpeg|tiff|png)$/;

    this.btnUpload = this.querySelector(".loader-images__btn-upload");
    this.btnChooseFile = this.querySelector(".loader-images__btn-choose-file");
    this.btnClearGallery = this.querySelector(".loader-images__btn-clear");
    this.inputLoader = this.querySelector(".loader-images__input");
    this.inputFile = this.querySelector(".loader-images__input-file");

    this._btnUploadClickEvent();
    this._btnChooseFileClickEvent();
    this._btnClearGalleryClickEvent();
    this._inputLoaderOnChangeEvent();
    this._inputFileOnChangeEvent();
  }

  _btnUploadClickEvent() {
    this.btnUpload.addEventListener("click", (ev) => {
      this.uploadImages();
    });
  }

  _btnChooseFileClickEvent() {
    this.btnChooseFile.addEventListener("click", (ev) => {
      this.chooseFile();
    });
  }

  _btnClearGalleryClickEvent() {
    this.btnClearGallery.addEventListener("click", (ev) => {
      this.clearGallery();
    });
  }

  _inputLoaderOnChangeEvent() {
    this.inputLoader.addEventListener("change", (ev) => {
      this.removeUploadedFile();
    });
  }
  _inputFileOnChangeEvent() {
    this.inputFile.addEventListener("change", (ev) => {
      this.getFileName();
    });
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

  loadImgLink(url) {
    this.image.src = url;
    this.image.onload = () => {
      this.images["properties"] = Object.assign(
        {},
        { url: url, width: this.image.width, height: this.image.height }
      );
      this.addImgs();
    };
  }

  loadJsonLink(url) {
    this.getJSON(url, (err, result) => {
      if (err !== null) {
        alert("Something went wrong: " + err);
      } else {
        this.images = result["galleryImages"];
        this.addImgs();
      }
    });
  }

  buttonLoadImg(inputField) {
    if (inputField.files && inputField.files[0]) {
      let reader = new FileReader();
      $(reader).load((e) => {
        this.image.src = e.target.result;
        this.image.onload = () => {
          this.images["properties"] = Object.assign(
            {},
            {
              url: e.target.result,
              width: this.image.width,
              height: this.image.height,
            }
          );
          this.addImgs();
        };
      });
      reader.readAsDataURL(inputField.files[0]);
    }
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

  uploadImages() {
    let url = $(".loader-images__input").val();
    let uploadFile = $(".loader-images__input-file").val();
    let inputField = document.getElementsByClassName(
      "loader-images__input-file"
    )[0];

    if (url.trim() === "" && uploadFile === "") {
      alert("Выберете файл или введите url до файла");
      return;
    }

    if (url.trim() != "") {
      if (this.isImg(url)) {
        this.loadImgLink(url);
      } else if (this.isJson(url)) {
        this.loadJsonLink(url);
      } else {
        alert("Выберете файл или введите url до файла");
      }
    }

    if (uploadFile != "") {
      if (this.isImg(uploadFile)) {
        this.buttonLoadImg(inputField);
      } else if (this.isJson(uploadFile)) {
        this.loadJson(inputField);
      } else {
        alert("Неверный формат файла");
        $(".loader-images__file-name").text("");
        $(".loader-images__input-file").val("");
      }
    }
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

  getFileName() {
    $(".loader-images__file-name").text(
      $(".loader-images__input-file").val().split("\\").pop()
    );
  }

  removeUploadedFile() {
    $(".loader-images__input-file").val("");
    $(".loader-images__file-name").text("");
  }

  clearGallery() {
    $(".gallery__content div").remove();
  }

  chooseFile() {
    $(".loader-images__input-file").click();
    $(".loader-images__input").val("");
  }
}

customElements.define("image-loader", ImageLoader);
