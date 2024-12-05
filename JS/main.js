// Variables globales
const apiUrlTags = 'https://api.waifu.im/tags';
const apiUrlImages = 'https://api.waifu.im/search/';
const IMAGES_PER_PAGE = "10"; // 5 columnas x 8 filas
var count ="30"


// Función para obtener datos de la API
async function fetchData(url, params = {}) {
    const queryParams = new URLSearchParams();
    for (const key in params) {
        if (Array.isArray(params[key])) {
            params[key].forEach(value => queryParams.append(key, value));
        } else {
            queryParams.set(key, params[key]);
        }
    }
    const requestUrl = `${url}?${queryParams.toString()}`;

    try {
        const response = await axios.get(requestUrl);
        if (response.status == 200) {
            return response.data;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    } catch (error) {
        console.error('Error en la solicitud:', error.message);
    }
}

// Función para cargar imágenes por página
async function loadImagesPage(num) {
    try {
        const response = await axios.get(`${apiUrlImages}?limit=${num}`, { responseType: 'json' });
        if (response.status == 200) {
            console.log(response.data);
            const images = response.data.images; // Accedemos a las imágenes
            renderImages(images);
        }
    } catch (error) {
        console.error('Error al cargar la página de imágenes:', error);
    }
}

// Función para renderizar etiquetas
function renderTags(tags) {
    const menu = document.getElementById('menu-side');
    const versatileContainer = document.getElementById('dropbox1');

    tags.versatile.forEach((tag, index) => {
        const checkbox = createCheckbox(tag, index);
        versatileContainer.appendChild(checkbox);
    });

    menu.appendChild(versatileContainer);

}

// Función para crear un checkbox con su etiqueta
function createCheckbox(tag, index, category) {
    const container = document.createElement('div');
    container.classList.add('menu-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${category}-${index}`;
    checkbox.value = tag;
    checkbox.addEventListener('change', handleFilterChange);

    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = tag;

    container.appendChild(checkbox);
    container.appendChild(label);
    return container;
}

// Función para manejar el cambio de filtros
async function handleFilterChange() {
    const checkedTags = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const params = { included_tags: checkedTags, is_nsfw:"False", limit:count};
    const imagesData = await fetchData(apiUrlImages, params);
    renderImages(imagesData.images);
}

// Función para renderizar imágenes con paginación
function renderImages(images) {
    const container = document.querySelector('.containt');

    // Limpiar imágenes y paginación previas
    const existingImages = document.querySelectorAll('.image-item');
    const existingPagination = document.querySelector('.pagination');
    existingImages.forEach(image => image.remove());
    if (existingPagination) existingPagination.remove();

    const totalImages = images.length;
    const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

    let currentPage = 1;
    

    function renderPage(page) {
        // Limpiar imágenes actuales
        const existingImages = document.querySelectorAll('.image-item');
        existingImages.forEach(image => image.remove());

        const startIndex = (page - 1) * IMAGES_PER_PAGE;
        const endIndex = startIndex + IMAGES_PER_PAGE;
        const imagesToRender = images.slice(startIndex, endIndex);

        imagesToRender.forEach(image => {
            const imageElement = document.createElement('div');
            imageElement.classList.add('image-item');

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.artist?.name || 'Unknown Artist';

            const artistName = document.createElement('p');
            artistName.textContent = `Artista: ${image.artist?.name || 'Sin identificar'}`;

            imageElement.appendChild(img);
            imageElement.appendChild(artistName);
            container.appendChild(imageElement);
        });
    }

    function renderPagination() {
        const pagination = document.createElement('div');
        pagination.classList.add('pagination');

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('page-button');
            if (i === currentPage) pageButton.classList.add('active');

            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderPage(currentPage);
                document.querySelectorAll('.page-button').forEach(btn => btn.classList.remove('active'));
                pageButton.classList.add('active');
            });

            pagination.appendChild(pageButton);
        }

        document.body.appendChild(pagination);
    }

    renderPage(currentPage);
    renderPagination();
}

// Inicialización
async function init() {
    const tagsData = await fetchData(apiUrlTags);
    if (tagsData) {
        renderTags(tagsData);
    }

    // Cargar imágenes en la primera página
    await loadImagesPage(count);
}

document.addEventListener('DOMContentLoaded', init);
