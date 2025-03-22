// Константы для backend
const BACKEND_URL = 'https://your-backend.com/upload';

// Функция конвертации Base64 в Blob
function base64ToBlob(base64, mimeType) {
// Проверяем, что base64 содержит корректные данные
if (!base64 || !base64.includes(',')) {
  throw new Error('Некорректный формат Base64');
}

const byteCharacters = atob(base64.split(',')[1]);
const byteNumbers = new Array(byteCharacters.length);

for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}

const byteArray = new Uint8Array(byteNumbers);
return new Blob([byteArray], { type: mimeType });
}

// Основная функция загрузки
async function uploadImage() {
const previewImage = document.getElementById('previewImage');
const uploadBtn = document.getElementById('uploadBtn');

// Блокируем кнопку во время загрузки
uploadBtn.disabled = true;

try {
  // Проверяем наличие изображения
  if (!previewImage || !previewImage.src) {
    throw new Error('Изображение не выбрано');
  }

  // Получаем Base64 изображения
  const base64Image = previewImage.src;
  
  // Создаем FormData
  const formData = new FormData();
  
  // Конвертируем Base64 в Blob
  const imageBlob = base64ToBlob(base64Image, 'image/png');
  
  // Добавляем файл в FormData
  formData.append('image', imageBlob, 'uploaded_image.png');
  
  // Опционально: добавить дополнительные данные
  formData.append('userId', 'example_user_id');
  formData.append('timestamp', new Date().toISOString());

  // Получаем токен безопасно
  const token = localStorage.getItem('token') || '';

  // Отправка на backend с настройками CORS
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    // Добавляем опции для CORS
    mode: 'cors',
    credentials: 'include'
  });

  // Обработка ответа
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка загрузки: ${errorText}`);
  }

  const result = await response.json();
  
  // Показываем успешный результат
  alert('Изображение успешно загружено');
  
  // Сохраняем результат в локальное хранилище Chrome
  chrome.storage.local.set({
    lastUploadedImage: {
      url: result.imageUrl,
      uploadedAt: new Date().toISOString()
    }
  });

} catch (error) {
  console.error('Ошибка:', error);
  alert(`Не удалось загрузить изображение: ${error.message}`);
} finally {
  // Разблокируем кнопку после загрузки
  uploadBtn.disabled = false;
}
}

// Навешиваем обработчик на кнопку
document.addEventListener('DOMContentLoaded', () => {
const uploadBtn = document.getElementById('uploadBtn');
if (uploadBtn) {
  uploadBtn.addEventListener('click', uploadImage);
}
});