async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function extractYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function render(character) {
    const source = document.getElementById("character").innerHTML;
    const compile = Handlebars.compile(source);
    const context = {
        name: character.name,
        id: character.id,
        image: character.image || "assets/images/default.png",
        weapon: character.weapon,
        vision: character.vision,
        birthday: character.birthday,
        region: character.region.join(', '),
        affiliation: character.affiliation.join(', '),
        special_dish: character.special_dish,
        wiki_url: character.wiki_url,
        videos: character.videos.map(extractYouTubeID)
    };
    document.getElementById("content").innerHTML = compile(context);
}

async function loadCharacter(index) {
    document.getElementById("loading").style.display = 'block';
    document.getElementById("content").style.display = 'none';
    document.getElementById("nav-buttons").style.display = 'none';

    const characterUrl = `https://gsi.fly.dev/characters/${index}`;
    const mediaUrl = `https://gsi.fly.dev/characters/${index}/media`;

    const characterData = await fetchData(characterUrl);
    const mediaData = await fetchData(mediaUrl);

    const character = {
        ...characterData.result,
        videos: mediaData.result.videos || []
    };

    render(character);

    document.getElementById("nav-buttons").style.display = 'block';
    document.getElementById("loading").style.display = 'none';
    document.getElementById("content").style.display = 'block';
}

async function searchCharacterByName(name) {
    const searchUrl = `https://gsi.fly.dev/characters/search?name=${encodeURIComponent(name)}`;
    const data = await fetchData(searchUrl);

    if (data && data.result && data.result.length > 0) {
        const character = data.result[0];
        currentIndex = character.id;
        await loadCharacter(currentIndex);
    } else {
        alert('Character not found!');
    }
}

function getRandomCharacter() {
    return Math.floor(Math.random() * 51) + 1; 
}

let currentIndex = 1;

document.getElementById("right").addEventListener('click', () => {
    if (currentIndex < 51) { 
        currentIndex++;
        loadCharacter(currentIndex);
    }
});

document.getElementById("left").addEventListener('click', () => {
    if (currentIndex > 1) {
        currentIndex--;
        loadCharacter(currentIndex);
    }
});

document.getElementById("search-button").addEventListener('click', async () => {
    const searchQuery = document.getElementById("search-bar").value.trim();
    if (searchQuery) {
        await searchCharacterByName(searchQuery);
    }
});

document.getElementById("search-bar").addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const searchQuery = event.target.value.trim();
        if (searchQuery) {
            await searchCharacterByName(searchQuery);
        }
    }
});

loadCharacter(currentIndex);

document.getElementById('theme-toggle').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    this.querySelector('.toggle-circle').classList.toggle('active');
});
