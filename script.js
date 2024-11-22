const wrapper = document.querySelector(".wrapper"),
      searchInput = wrapper.querySelector("input"),
      volume = wrapper.querySelector(".word i"),
      infoText = wrapper.querySelector(".info-text"),
      synonyms = wrapper.querySelector(".synonyms .list"),
      removeIcon = wrapper.querySelector(".search span"),
      wordImage = document.querySelector("#word-image"); // Reference to the image tag

let audio;

function data(result, word) {
    if(result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    } else {
        wrapper.classList.add("active");
        let definitions = result[0].meanings[0].definitions[0];

        document.querySelector(".word p").innerText = result[0].word;
        document.querySelector(".meaning span").innerText = definitions.definition;
        document.querySelector(".example span").innerText = definitions.example;

        // Play audio if available (loop through all phonetics)
        let audioFound = false;
        if (result[0].phonetics && result[0].phonetics.length > 0) {
            for (let i = 0; i < result[0].phonetics.length; i++) {
                if (result[0].phonetics[i].audio) {
                    audio = new Audio(result[0].phonetics[i].audio);
                    audioFound = true;

                    // Ensure the audio is loaded before playing
                    audio.addEventListener('canplaythrough', () => {
                        audio.play();
                    });
                    break; // Play the first available audio
                }
            }
        }

        // If no audio found, you can decide to play a default sound or do nothing
        if (!audioFound) {
            console.log('No audio found for this word');
        }

        // Fetch and display image for the word from Unsplash
        fetchImage(word);

        if(definitions.synonyms[0] == undefined) {
            synonyms.parentElement.style.display = "none";
        } else {
            synonyms.parentElement.style.display = "block";
            synonyms.innerHTML = "";
            for (let i = 0; i < 5; i++) {
                let tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[i]},</span>`;
                tag = i == 4 ? tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[4]}</span>` : tag;
                synonyms.insertAdjacentHTML("beforeend", tag);
            }
        }
    }
}

// Fetch image related to the word using Unsplash API
function fetchImage(word) {
    const unsplashAPI = `https://api.unsplash.com/photos/random?query=${word}&client_id=Aw8irJA2Vz4TMwZDE79WPxYImynwxXmlhAf4trbwVBk`;
    
    fetch(unsplashAPI)
        .then(response => response.json())
        
        .then(data => {
            console.log(data)
            if (data && data.urls && data.urls.small) {
                
                wordImage.src = data.urls.small; // Set the image src
            } else {
                wordImage.src = ''; // Set to a default image if no result
            }
        })
        .catch(err => {
            console.error("Error fetching image:", err);
            wordImage.src = ''; // Set to default if error occurs
        });
}

// Handle word search
function search(word){
    fetchApi(word);
    searchInput.value = word;
}

// Fetch dictionary data from the API
function fetchApi(word){
    wrapper.classList.remove("active");
    infoText.style.color = "#000";
    infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(result => data(result, word))
        .catch(() =>{
            infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
            wordImage.src = ''; // Reset image if not found
        });
}

// Event listeners
searchInput.addEventListener("keyup", e => {
    let word = e.target.value.replace(/\s+/g, ' ');
    if (e.key == "Enter" && word) {
        fetchApi(word);
    }
});

volume.addEventListener("click", () => {
    volume.style.color = "#4D59FB";
    if (audio) {
        audio.play();
    }
    setTimeout(() => {
        volume.style.color = "#999";
    }, 800);
});

removeIcon.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    wrapper.classList.remove("active");
    infoText.style.color = "#9A9A9A";
    infoText.innerHTML = "Type any existing word and press enter to get meaning, example, synonyms, etc.";
    wordImage.src = ''; // Reset image when search is cleared
});