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
  root.innerHTML = ''; // Clear the root element

  // Components based on the state
  const apodSection = createApodSection(
    state.get('user').get('name'),
    state.get('apod')
  );
  const roverSelectorElement = RoverSelector(
    state.get('rovers').toArray(),
    getRoverData
  );

  // Append APOD section and rover selector to the root
  root.appendChild(apodSection);
  root.appendChild(roverSelectorElement);

  // Append rover image gallery if a rover is selected
  if (state.get('currentRover')) {
    const roverGalleryElement = RoverImageGallery(state.get('currentRover'));
    root.appendChild(roverGalleryElement);
  }
};

// Event listener to render the UI once the page loads
window.addEventListener('load', () => {
  render(root, store); // Initial render
  getImageOfTheDay(); // Fetch APOD data on load
});

// ------------------------------------------------------  COMPONENTS

// Function to create and return the APOD section element
function createApodSection(user, apod) {
  const section = document.createElement('section');

  const heading = document.createElement('h3');
  heading.textContent = 'Astronomy Picture of the Day';
  section.appendChild(heading);

  // Append APOD content or loading text based on apod data availability
  if (apod) {
    section.appendChild(ImageOfTheDay(apod));
  } else {
    const loadingText = document.createElement('p');
    loadingText.textContent = 'Loading APOD...';
    section.appendChild(loadingText);
  }

  return section;
}

// Function to create and return the rover selector dropdown element
function RoverSelector(rovers, getRoverDataCallback) {
  const selectElement = document.createElement('select');

  // Default placeholder option
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Select a Rover';
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectElement.appendChild(defaultOption);

  // Add an option for each rover
  rovers.forEach(rover => {
    const optionElement = document.createElement('option');
    optionElement.value = rover;
    optionElement.textContent = rover;
    selectElement.appendChild(optionElement);
  });

  // Fetch rover data on selection change
  selectElement.onchange = event => getRoverDataCallback(event.target.value);

  return selectElement;
}

// Function to create and return the rover image gallery element
function RoverImageGallery(roverData) {
  const galleryElement = document.createElement('div');
  galleryElement.className = 'rover-image-gallery';

  // Check for and append images from rover data
  if (roverData && roverData.latest_photos) {
    roverData.latest_photos.forEach(photo => {
      const imgElement = document.createElement('img');
      imgElement.src = photo.img_src;
      imgElement.alt = `${photo.rover.name} Rover Image`;
      galleryElement.appendChild(imgElement);
    });
  }

  return galleryElement;
}

// Function to create and return the Image of the Day content
const ImageOfTheDay = apod => {
  const container = document.createElement('div');

  // Check for media type and append appropriate content
  if (apod.media_type === 'video') {
    const videoLink = document.createElement('a');
    videoLink.href = apod.url;
    videoLink.textContent = "See today's featured video here";
    container.appendChild(videoLink);
  } else {
    const image = document.createElement('img');
    image.src = apod.image.url;
    image.style.height = '350px';
    image.style.width = '100%';
    container.appendChild(image);
  }

  // Append explanation paragraph
  const explanationParagraph = document.createElement('p');
  explanationParagraph.textContent = apod.explanation;
  container.appendChild(explanationParagraph);

  return container;
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
