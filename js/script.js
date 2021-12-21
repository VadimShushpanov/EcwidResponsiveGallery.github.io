let images = new Object();
let regExpJson = /\.(json)$/;
let regExpImg = /(\.|\/)(gif|jpg|jpeg|tiff|png)$/;

let getJSON = function (url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    let status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

function isImg(url) {
  return regExpImg.test(url);
}

function isJson(url) {
  return regExpJson.test(url);
}

function loadImgLink(url) {
    images['properties'] = Object.assign({}, { "url": url});
    addImgs();
}

function loadJsonLink(url) {
  getJSON(url,
    function (err, result) {
      if (err !== null) {
        alert('Something went wrong: ' + err);
      } else {
        images = result["galleryImages"];
        addImgs();
      }
    });
}

function buttonLoadImg(inputField) {
  if (inputField.files && inputField.files[0]) {
    let reader = new FileReader();
    $(reader).load(function (e) {
      images['properties'] = Object.assign({}, { "url": e.target.result});
      addImgs();
    });
    reader.readAsDataURL(inputField.files[0]);
  }
}

function buttonLoadJson(inputField) {

  if (inputField.files && inputField.files[0]) {
    let file = new FileReader();
    file.onload = function () {
      let result = JSON.parse(file.result);
      images = result["galleryImages"];
      addImgs();
    };
    file.onerror = function () {
      alert("Ошибка во время загрузки json файла ");
    };
    file.readAsText(inputField.files[0]);
  }
}

function uploadImages() {
  let url = $('.loader-images__input').val();
  let uploadFile = $('.loader-images__input-file').val();
  let inputField = document.getElementsByClassName("loader-images__input-file")[0];

  if (url.trim() === '' && uploadFile === '') {
    alert("Выберете файл или введите url до файла");
    return;
  }

  if (url.trim() != '') {
    if (isImg(url)) {
      loadImgLink(url);
    } else if (isJson(url)) {
      loadJsonLink(url);
    }
    else {
      alert("Выберете файл или введите url до файла");
    }
  }

  if (uploadFile != '') {
    if (isImg(uploadFile)) {
      buttonLoadImg(inputField)
    }
    else if (isJson(uploadFile)) {
      buttonLoadJson(inputField)
    }
    else {
      alert("Неверный формат файла");
      $('.loader-images__file-name').text('');
      $('.loader-images__input-file').val('');
    }
  }
}

function addImgs() {

  Object.entries(images).forEach(([key, img]) => {
    let photo = document.createElement("img");
    let block = document.createElement("div");
    let button = document.createElement("button");

    photo.classList.add('gallery__img');
    button.classList.add('gallery__button-delete');
    block.classList.add('gallery__div');
    
    photo.src = img.url;
    $('.gallery__content').append(block);

    $(block).append(photo);
    $(block).append(button);
  });

  $('.gallery__button-delete').click(function() {
    $(this).parent().remove();
  });
  $('.loader-images__input').val('');
  $('.loader-images__file-name').text('');
  $('.loader-images__input-file').val('');

  images = {};
}

function getFileName() {
  $('.loader-images__file-name').text($('.loader-images__input-file').val().split("\\").pop());
}

function chooseFile() {
  $('.loader-images__input-file').click();
  $('.loader-images__input').val('');
}

function removeUploadedFile() {
  $('.loader-images__input-file').val('');
  $('.loader-images__file-name').text('');  
}

function clearGallery(clearImages) {
  $('.gallery__content div').remove();
}

$( document ).ready(function() {
  
  $('.gallery__content').text('');

  $(".loader-images__input").on("keypress", function (event) {
    if (event.keyCode == 13) {
      uploadImages();
    }
  });

  let formData = new FormData();

  gallery__content.addEventListener('dragenter', function(){
    $('.gallery__content').addClass('hover');
  });

  ['drop', 'dragleave'].forEach(eventName => gallery__content.addEventListener(eventName, function(){
    $('.gallery__content').removeClass('hover');
  }));

  ['drop', 'dragover'].forEach(eventName => gallery__content.addEventListener(eventName, function(e){
    e.preventDefault()
    e.stopPropagation()
    
    let files = e.dataTransfer.files;
    
    files = [...files];
    
    files.forEach(file => {

      formData.append('file', file);
      
      if (isImg(file.type)) {
      
        makePreview(file).then(image => {
          images['properties'] = Object.assign({}, { "url": image});
          addImgs();
        });

      } else {
        alert(`Файл ${file.name} не является изображением`);
      }
      
    });
    
  }, false));

  function makePreview(file){
    let fr = new FileReader();
    
    return new Promise(resolve => {
      fr.readAsDataURL(file);
      fr.onloadend = () => resolve(fr.result)
    });
  }

});