let store = Immutable.Map({
  user: Immutable.Map({ name: 'Tristen' }),
  apod: '',
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  currentRover: 'none'
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (state, newState) => {
  store = state.merge(newState);
  render(root, store);
};

// Content
const render = async (root, state) => {
  root.innerHTML = ''
  const apod = state.get('apod');
  const rovers = Array.from(state.get('rovers'));

  const ApodSection = createApodSection(state.get('user').get('name'), apod);
  const roverSelectorElement = RoverSelector(rovers, getRoverData);


  if (state.get('currentRover') != 'none') {
    const roverGalleryElement = RoverImageGallery(store.get('currentRover'));

    root.appendChild(roverGalleryElement);
    root.appendChild(roverSelectorElement)
  } else {
    root.appendChild(ApodSection);
    root.appendChild(roverSelectorElement)
  }
  
  
};


// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Return Image of the Day Section
function createApodSection(user, apod) {
  // Create the section element
  const section = document.createElement('section');

  // Create and append the heading
  const heading = document.createElement('h3');
  heading.textContent = 'Put things on the page!';
  section.appendChild(heading);

  // Create and append the first paragraph
  const paragraph1 = document.createElement('p');
  paragraph1.textContent = 'Here is an example section.';
  section.appendChild(paragraph1);

  // Create and append the second paragraph
  const paragraph2 = document.createElement('p');
  paragraph2.innerHTML = `One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
  the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
  This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
  applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
  explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
  but generally help with discoverability of relevant imagery.`;
  section.appendChild(paragraph2);

  // Assuming ImageOfTheDay returns a DOM element
  section.appendChild(ImageOfTheDay(apod));
  
  return section;
}

// Return Rover Selector
function RoverSelector(rovers, getRoverData) {
  const selectElement = document.createElement('select');
  selectElement.onchange = (event) => getRoverData(event.target.value);
  
  // Placeholder option
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Select a Rover';
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectElement.appendChild(defaultOption);

  // Create options for other rovers
  rovers.forEach(rover => {
    const optionElement = document.createElement('option');
    optionElement.value = rover;
    optionElement.textContent = rover;
    selectElement.appendChild(optionElement);
  });

  return selectElement;  
}

function RoverImageGallery(roverData) {
  const galleryElement = document.createElement('div');
  galleryElement.className = 'rover-image-gallery'; // For styling

  // Assuming roverData.photos is the array containing image data
  roverData.latest_photos.forEach(photo => {
    const imgElement = document.createElement('img');
    imgElement.src = photo.img_src; // Use the img_src property from each photo object
    imgElement.alt = `${photo.name} Rover Image`;
    galleryElement.appendChild(imgElement);
  });

  return galleryElement;
}


// Return Image of The Day
const ImageOfTheDay = apod => {
  const container = document.createElement('div'); // Container for all content

  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(`apod: ${photodate.getDate()} | today: ${today.getDate()}`);

  console.log(`apod exist: ${photodate.getDate() === today.getDate()}`);
  if (!apod || apod.date === today.getDate()) {
    getImageOfTheDay(store);
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === 'video') {
    const videoParagraph = document.createElement('p');
    const videoLink = document.createElement('a');
    videoLink.href = apod.url;
    videoLink.textContent = "See today's featured video here";
    videoParagraph.appendChild(videoLink);

    const titleParagraph = document.createElement('p');
    titleParagraph.textContent = apod.title;

    const explanationParagraph = document.createElement('p');
    explanationParagraph.textContent = apod.explanation;

    container.appendChild(videoParagraph);
    container.appendChild(titleParagraph);
    container.appendChild(explanationParagraph);
  } else {
    const image = document.createElement('img');
    image.src = apod.image.url;
    image.style.height = '350px';
    image.style.width = '100%';

    const explanationParagraph = document.createElement('p');
    explanationParagraph.textContent = apod.image.explanation;

    container.appendChild(image);
    container.appendChild(explanationParagraph);
  }

  return container;

}



// ------------------------------------------------------  API CALLS

// Get image from APOD API
const getImageOfTheDay = state => {
  let { apod } = state;

  fetch(`http://localhost:8000/apod`)
    .then(res => res.json())
    .then(apod => updateStore(store, { apod }));
};

// Get rover data from API
const getRoverData = (roverName) =>  {

  fetch(`/rover/${roverName}`)
  .then(res => {
    // Check if the response is OK (status in the range 200-299)
    if (!res.ok) {
      throw new Error(`Network response was not ok, status: ${res.status}`);
    }
    return res.json(); // Parse JSON body of the response
  })
  .then(data => {
    data.latest_photos.forEach(photo => console.log(photo));
    updateStore(store, { currentRover: data });
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
    // Handle the error or update the store with error information
  });
}