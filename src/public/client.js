// Immutable.js is assumed to be imported

// Initial state setup with Immutable.js Maps and Lists
let store = Immutable.Map({
  user: Immutable.Map({ name: 'Tristen' }),
  apod: null, // Initially null to indicate no data
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  currentRover: null, // Initially null to indicate no selection
});

// Reference to the root DOM element where content will be rendered
const root = document.getElementById('root');

// Function to update the global state and re-render the UI
const updateStore = newState => {
  store = store.merge(newState); // Merge new state with the existing state
  render(root, store); // Re-render the UI with the updated state
};

// Main render function to update the UI based on the current state
const render = (root, state) => {
  const rovers = state.get('rovers').toArray();
  const apodSectionHTML = createApodSectionHTML(
    state.get('apod')
  );
  const roverSelectorHTML = RoverSelectorHTML(rovers);
  const navbarHTML = Navbar(rovers);

  let contentHTML = navbarHTML

  if (state.get('currentRover')) {
    const roverGalleryHTML = RoverImageGalleryHTML(state.get('currentRover'));
    contentHTML += roverGalleryHTML;
  } else {
    contentHTML += apodSectionHTML + roverSelectorHTML;
  }

  root.innerHTML = `<div>${contentHTML}</div>`; // Wrap the content in a div and set as innerHTML of root

  // After updating the innerHTML, the DOM elements are re-created. Attach the event listener.
  attachRoverSelectorListener();
  attachNavbarEventListeners(rovers);
};



// Event listener to render the UI once the page loads
window.addEventListener('load', () => {
  getImageOfTheDay(); // Fetch APOD data on load
  render(root, store); // Initial render
});

// ------------------------------------------------------  LISTENERS

// Function to attach the onchange event listener to the rover selector
const attachRoverSelectorListener = () => {
  const roverSelector = document.getElementById('roverSelector');
  if (roverSelector) {
    roverSelector.onchange = event => getRoverData(event.target.value);
  }
};

const attachNavbarEventListeners = (rovers) => {
  rovers.forEach(rover => {
    const roverButton = document.getElementById(`${rover}-btn`);
    if (roverButton) {
      roverButton.onclick = () => getRoverData(rover);
    }
  });

  const navbar = document.querySelector('.navbar-logo');
  navbar.onclick = () => clearRoverSelection();
};


// ------------------------------------------------------  COMPONENTS

function createApodSectionHTML(apod) {
  let apodContentHTML = 'Loading APOD...';
  if (apod) {
    apodContentHTML = ImageOfTheDayHTML(apod);
  }

  return `
    <section>
      <h3>Astronomy Picture of the Day</h3>
      ${apodContentHTML}
    </section>
  `;
}

function RoverSelectorHTML(rovers) {
  const optionsHTML = rovers
    .map(rover => `<option value="${rover}">${rover}</option>`)
    .join('');

  return `
    <select id="roverSelector">
      <option value="" disabled selected>Select a Rover</option>
      ${optionsHTML}
    </select>
  `;
}

function RoverImageGalleryHTML(roverData) {
  const imagesHTML = roverData.latest_photos
    .map(
      photo =>
        `<img src="${photo.img_src}" alt="${photo.rover.name} Rover Image" style="height: 350px; width: 100%;">`
    )
    .join('');

  return `<div class="rover-image-gallery">${imagesHTML}</div>`;
}

function Navbar(rovers) {
  // Logo HTML
  const logoHTML = `
    <div class="navbar-logo" onclick="clearRoverSelection()">
      <img src="https://static.thenounproject.com/png/547826-200.png" alt="Logo" class="logo-icon">
      <span class="website-title">Mars Rovers</span>
    </div>
  `;

  // Generate buttons for each rover
  const roverButtonsHTML = rovers.map(rover => {
    return `<button id="${rover}-btn">${rover}</button>`;
  }).join('');

  // Return the complete Navbar HTML with logo and menu
  return `
    <nav class="navbar">
      ${logoHTML}
      <div class="menu">${roverButtonsHTML}</div>
    </nav>
  `;
}

const ImageOfTheDayHTML = apod => {
  if (apod.media_type === 'video') {
    return `
      <div>
        <a href="${apod.url}">See today's featured video here</a>
      </div>
    `;
  } else {
    return `
      <div>
        <img src="${apod.image.url}" alt="Astronomy Picture of the Day" style="height: 350px; width: 100%;">
        <h4>${apod.image.title}</h4>
        <p>${apod.image.explanation}</p>
      </div>
    `;
  }
};

// ------------------------------------------------------  HANDLERS

const clearRoverSelection = () => {
  updateStore({ currentRover: null });
};

// ------------------------------------------------------  API CALLS

// Function to fetch and update the store with APOD data
const getImageOfTheDay = () => {
  fetch(`http://localhost:8000/apod`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => updateStore({ apod: data }))
    .catch(error => console.error('Error fetching APOD:', error));
};

// Function to fetch and update the store with selected rover data
const getRoverData = roverName => {
  fetch(`/rover/${roverName}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Network response was not ok, status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => updateStore({ currentRover: data }))
    .catch(error => console.error('Problem fetching rover data:', error));
};
