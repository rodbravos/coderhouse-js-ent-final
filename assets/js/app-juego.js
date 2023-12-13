let brightnessEnabled = false;
document.getElementById("reset-button").addEventListener("click", resetGame);

function getRandomPokemonId() {
  return Math.floor(Math.random() * 898) + 1;
}

async function fetchData(url) {
  const response = await fetch(url);
  return await response.json();
}

function loadPokemon() {
  const localStorageKey = "pokemonGame";
  const localStorageData = JSON.parse(
    localStorage.getItem(localStorageKey)
  ) || { attempts: 0, pokemonList: [] };

  if (localStorageData.attempts >= 3) {
    Swal.fire({
      icon: "error",
      title: "Juego terminado",
      text: "Has excedido el límite de intentos fallidos (3).",
    }).then(() => {
      showResetButton();
    });
    return;
  }

  document.getElementById("pokemon-image").style.filter = brightnessEnabled
    ? "brightness(1)"
    : "brightness(0)";
  document.getElementById("pokemon-image").style.transition =
    "filter 0.5s ease";

  const tableBody = document.getElementById("results-table-body");
  tableBody.innerHTML = "";

  localStorageData.pokemonList.forEach((pokemon) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <th scope="row">${pokemon.id}</th>
          <td>${pokemon.name}</td>
          <td>${pokemon.selected || "-"}</td>
          <td>${
            pokemon.correct !== null ? (pokemon.correct ? "Sí" : "No") : "-"
          }</td>
        `;
    tableBody.appendChild(row);
  });

  const pokemonId = getRandomPokemonId();
  const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`;

  fetchData(apiUrl).then((data) => {
    const pokemonName = data.name;
    const pokemonImage =
      data.sprites.other.dream_world.front_default !== null
        ? data.sprites.other.dream_world.front_default
        : data.sprites.front_default;

    localStorageData.pokemonList.push({
      id: pokemonId,
      name: pokemonName,
      selected: null,
      correct: null,
    });
    localStorage.setItem(localStorageKey, JSON.stringify(localStorageData));

    document.getElementById("pokemon-image").src = pokemonImage;
    document.getElementById("pokemon-image").style.filter = "brightness(0)";

    setTimeout(() => {
      document.getElementById("pokemon-image").style.opacity = "brightness(1)";
      document.getElementById("pokemon-image").style.transition =
        "filter 0.5s ease";
    }, 100);

    fetchData(apiUrl).then((data) => {
      const options = [data.name];

      for (let i = 0; i < 3; i++) {
        const randomId = getRandomPokemonId();
        fetchData(`https://pokeapi.co/api/v2/pokemon/${randomId}/`).then(
          (randomData) => {
            options.push(randomData.name);
            options.sort(() => Math.random() - 0.5);

            const optionsContainer =
              document.getElementById("options-container");
            optionsContainer.innerHTML = "";
            options.forEach((option) => {
              const button = document.createElement("button");
              button.className = "btn btn-secondary py-3 px-5";
              button.textContent = option;
              button.addEventListener("click", checkAnswer);
              optionsContainer.appendChild(button);
            });
          }
        );
      }
    });
  });
}

function checkAnswer(event) {
  const selectedPokemon = event.target.textContent;
  const localStorageKey = "pokemonGame";
  let localStorageData = JSON.parse(localStorage.getItem(localStorageKey)) || {
    attempts: 0,
    pokemonList: [],
  };

  const currentPokemon =
    localStorageData.pokemonList[localStorageData.pokemonList.length - 1];
  currentPokemon.selected = selectedPokemon;
  currentPokemon.correct = selectedPokemon === currentPokemon.name;

  if (!currentPokemon.correct) {
    localStorageData.attempts += 1;
  }

  localStorage.setItem(localStorageKey, JSON.stringify(localStorageData));

  const resultMessage = currentPokemon.correct
    ? "¡Correcto! ¡Ese es el Pokémon!"
    : `Incorrecto. El Pokémon correcto es ${currentPokemon.name}. ¡Inténtalo de nuevo!`;

  document.getElementById("pokemon-image").style.filter = "brightness(1)";
  document.getElementById("pokemon-image").style.transition =
    "filter 0.5s ease";

  Swal.fire({
    icon: currentPokemon.correct ? "success" : "error",
    title: currentPokemon.correct ? "Correcto" : "Incorrecto",
    text: resultMessage,
    confirmButtonText: "OK",
  }).then(() => {
    document.getElementById("options-container").innerHTML = "";
    document.getElementById("pokemon-image").style.filter = "brightness(1)";
    document.getElementById("pokemon-image").style.transition =
      "filter 0.5s ease";
    setTimeout(() => {
      document.getElementById("pokemon-image").style.opacity = 1;
      loadPokemon();
    }, 1000);
  });
}

function showResetButton() {
  const resetButton = document.getElementById("reset-button");
  resetButton.style.display = "block";
}

function resetGame() {
  const localStorageKey = "pokemonGame";
  localStorage.removeItem(localStorageKey);
  document.getElementById("pokemon-image").style.filter = "brightness(0)";
  window.location.reload();
}

window.onload = function () {
  const localStorageKey = "pokemonGame";
  const localStorageData = localStorage.getItem(localStorageKey);

  if (localStorageData) {
    localStorage.removeItem(localStorageKey);
  }
  loadPokemon();
};

loadPokemon();
