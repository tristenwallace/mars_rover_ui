let store = Immutable.Map({
  user: Immutable.Map({ name: 'Tristen' }),
  apod: '',
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  currentRover: 'none'
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
  store = store.merge(newState);
  render(root, store);
};

// Content
const render = async (root, state) => {
  const apod = state.get('apod');
  const rovers = Array.from(state.get('rovers'));

  const app = createApodSection(state.get('user').get('name'), apod);
  const roverSelectorElement = RoverSelector(rovers, onSelect);

  app.appendChild(roverSelectorElement) 

  root.appendChild(app);
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
function RoverSelector(rovers, onSelect) {
  const selectElement = document.createElement('select');
  selectElement.onchange = (event) => onSelect(event.target.value);
  
  const optionElements = rovers.map(rover => `<option value="${rover}">${rover}</option>`).join('')
  selectElement.innerHTML = optionElements;

  return selectElement;  
}

function onSelect(roverName) {
  console.log(`Selected rover: ${roverName}`); 
}

// Return Image of The Day
const ImageOfTheDay = apod => {
  const container = document.createElement('div'); // Container for all content

  // If image does not already exist, or it is not from today -- request it again
  const today = new Date();
  const photodate = new Date(apod.date);
  console.log(photodate.getDate(), today.getDate());

  console.log(photodate.getDate() === today.getDate());
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
  let apod = state.get('apod');

  fetch(`http://localhost:8000/apod`)
    .then(res => res.json())
    .then(apod => updateStore(store, { apod }));

  return data;
};
