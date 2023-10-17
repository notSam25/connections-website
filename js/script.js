// script.js

const selectedWords = [];
const usedWords = [];
const divContainer = document.getElementById("div-container");
const containerControls = document.querySelector(
  ".connections-container-controls"
);
let remainingMistakes = 5;

// Function to randomize an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to convert a rgb string color to a hex string
function rgbToHex(rgbColor) {
  const rgb = rgbColor.match(/\d+/g);
  return `#${Number(rgb[0]).toString(16)}${Number(rgb[1]).toString(16)}${Number(
    rgb[2]
  ).toString(16)}`;
}

// Function to get word connections from config.json
async function getWordConnections() {
  try {
    const response = await fetch("config.json");
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    if (!Array.isArray(data.connections)) {
      throw new Error("Invalid data structure");
    }
    return data.connections;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function that checks if two arrays have the same elements
function arraysHaveSameElements(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false; // Different lengths, cannot have the same elements
  }

  const sortedArr1 = arr1.slice().sort(); // Create a sorted copy of arr1
  const sortedArr2 = arr2.slice().sort(); // Create a sorted copy of arr2

  for (let i = 0; i < arr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false; // Different elements found
    }
  }

  return true; // All elements match
}

// Function to check if player has a connection
async function hasConnection() {
  const connections = await getWordConnections();
  if (connections) {
    for (let i = 0; i < connections.length; i++) {
      const curWords = connections[i].words;
      if (arraysHaveSameElements(curWords, selectedWords)) {
        return true; // If a match is found, return true immediately
      }
    }
  }
  return false; // No match was found
}

// Setup the game on load
document.addEventListener("DOMContentLoaded", async function () {
  if (!divContainer) {
    console.error("Failed to find button container");
  }

  const connections = await getWordConnections();
  if (!connections) {
    console.error("Failed to get connections");
    return;
  }

  let words = [];
  connections.forEach((connection) => {
    const curWords = connection.words;
    curWords.forEach((word) => {
      words.push(word);
    });
  });

  words = shuffleArray(words);
  if (words.length != 16) {
    console.error("failed to load words");
    return;
  }

  for (let i = 0; i < 4; i++) {
    const rowContainer = document.createElement("div");
    rowContainer.className = "row-container";
    divContainer.appendChild(rowContainer);
    for (let j = 0; j < 4; j++) {
      let word = words[i * 4 + j];
      const clickableDiv = document.createElement("div");
      clickableDiv.className = "clickable-div";
      clickableDiv.textContent = word;
      rowContainer.appendChild(clickableDiv);

      // Add a click event listener to 'clickableDiv'
      clickableDiv.addEventListener("click", function () {
        if (selectedWords.length < 4) {
          // If we have fewer than four words, add the current word to the list
          if (selectedWords.includes(word)) {
            // If the word is already selected, deselect it
            selectedWords.splice(selectedWords.indexOf(word), 1);
            // Restore the unselected color
            clickableDiv.style.backgroundColor = "#efefe6";
            clickableDiv.style.color = "black";
          } else {
            // If the word is not selected, select it
            selectedWords.push(word);
            // Set the selected color
            clickableDiv.style.backgroundColor = "#5a594e";
            clickableDiv.style.color = "white";
          }
        } else {
          // If we have four words, check if the clicked word is already selected
          if (selectedWords.includes(word)) {
            // If the word is already selected, deselect it
            selectedWords.splice(selectedWords.indexOf(word), 1);
            // Restore the unselected color
            clickableDiv.style.backgroundColor = "#efefe6";
            clickableDiv.style.color = "black";
          }
        }
      });
    }
  }
});

// Setup global click events
document.addEventListener("click", async function (event) {
  if (!divContainer) {
    console.error("Failed to find button container");
    return;
  }

  // Check if the click target is within the container controls
  if (event.target.parentNode === containerControls) {
    // Ensure you have mistakes you can use
    if (remainingMistakes <= 0) {
      return;
    }

    // Ensure you have exactly 4 selected words
    if (selectedWords.length !== 4) {
      return;
    }

    const paragraphElement = containerControls.querySelector("p");
    if (await hasConnection()) {
      console.log("You got a pair!");

      // Iterate through clickable divs and apply changes
      const clickableDivs = divContainer.querySelectorAll(".clickable-div");
      clickableDivs.forEach(function (clickableDiv) {
        if (selectedWords.includes(clickableDiv.textContent)) {
          clickableDiv.classList.add("fade-out");
          clickableDiv.style.pointerEvents = "none";
        }
      });

      // Remove all the words from selectedWords
      selectedWords.splice(0, 4);

      // Update the mistakes remaining count
      paragraphElement.textContent = "Mistakes Remaining: " + remainingMistakes;
    } else {
      // Handle the case where there's no connection
      remainingMistakes--;
      paragraphElement.textContent = "Mistakes Remaining: " + remainingMistakes;
    }

    if (remainingMistakes <= 0) {
      paragraphElement.textContent = "You Failed The Connections Game!";
      const clickableDivs = divContainer.querySelectorAll(".clickable-div");
      clickableDivs.forEach(function (clickableDiv) {
        clickableDiv.classList.add("fade-out");
        clickableDiv.style.pointerEvents = "none";
      });
      return;
    }
  }
});
