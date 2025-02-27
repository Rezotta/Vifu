window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  const loaderSite = document.getElementById("loader-site");

  setTimeout(() => {
    preloader.style.display = "none";
    loaderSite.style.display = "none";
  }, 1000);
});

// Объект с языковыми кодами
const languages = {
  ru: "RU",
  en: "EN",
};

let currentLang = "EN"; // Текущий язык

const btnLang = document.getElementById("BtnLang"); // Кнопка выбора языка
const textLang = document.getElementById("text-lang-button"); // Текст кнопки языка

// Функция переключения языка
function toggleLanguage() {
  currentLang = currentLang === "ru" ? "en" : "ru"; // Переключение языка
  textLang.textContent = languages[currentLang]; // Обновление текста кнопки
}

btnLang.addEventListener("click", toggleLanguage); // Обработчик события для кнопки

// Установка начального значения для fileName
const fileNameElement = document.getElementById("fileName");
fileNameElement.textContent = "Выберите файл для загрузки:";

document.getElementById("file").addEventListener("change", function () {
  const fileName = this.files[0]
    ? this.files[0].name
    : "Выберите файл для загрузки:";

  // Анимация смены текста
  fileNameElement.classList.remove("show");
  setTimeout(() => {
    fileNameElement.textContent = fileName;
    fileNameElement.classList.add("show");
  }, 300);
});

document.getElementById("uploadForm").onsubmit = function (e) {
  e.preventDefault(); // Отменяем стандартное поведение формы

  const fileInput = document.getElementById("file");
  const file = fileInput.files[0]; // Получаем первый выбранный файл

  // Проверка на наличие файла
  if (!file) {
    alert("Пожалуйста, выберите файл для загрузки.");
    return;
  }

  // Проверка размера файла (650 МБ = 650 * 1024 * 1024 байт)
  const maxSize = 650 * 1024 * 1024; // 650 МБ
  if (file.size > maxSize) {
    // Преобразование размера файла в удобочитаемый формат
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2); // Размер в МБ
    alert(
      `Ошибка: Размер файла не должен превышать 650 МБ. Ваш файл весит ${fileSizeMB} МБ.`
    );
    return; // Отменяем отправку формы
  }

  const formData = new FormData(this);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "upload.php", true);

  // Показать индикатор загрузки и затемняющий фон
  document.getElementById("loader").style.display = "block";
  document.getElementById("overlay").style.display = "block";

  xhr.onload = function () {
    // Скрыть индикатор загрузки и затемняющий фон
    document.getElementById("loader").style.display = "none";
    document.getElementById("overlay").style.display = "none";

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.error) {
        alert(response.error);
      } else {
        // Обработка успешного ответа
        document.getElementById("maliciousCount").innerText =
          response.malicious;
        document.getElementById("suspiciousCount").innerText =
          response.suspicious;
        document.getElementById("harmlessCount").innerText = response.harmless;
        const isSafeMessageElement = document.getElementById("isSafeMessage");
        isSafeMessageElement.innerText = response.isSafe;

        // Изменение цвета текста в зависимости от результата
        if (response.malicious > 0) {
          isSafeMessageElement.style.color = "rgb(221, 0, 0)"; // Красный для опасного файла
        } else {
          isSafeMessageElement.style.color = "rgb(0, 197, 66)"; // Зеленый для безопасного файла
        }

        document.getElementById("resultModal").style.display = "block";
      }
    } else {
      alert("Произошла ошибка при загрузке файла.");
    }
  };

  xhr.send(formData); // Отправляем данные формы
};

// Закрытие модального окна
document.querySelectorAll(".close, .button-close").forEach(function (element) {
  element.onclick = function () {
    document.getElementById("resultModal").style.display = "none";
  };
});

window.onclick = function (event) {
  if (event.target == document.getElementById("resultModal")) {
    document.getElementById("resultModal").style.display = "none";
  }
};
