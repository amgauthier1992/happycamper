const campApp = {
  searchStarted: false,
  resultsPage: 1,
  campSelected: false,
}

const apiKey = "KFwuzmQlFFSDXKHJJPZNEj1rHD4YKRBlD9OOhqrh"
const baseUrl = "https://developer.nps.gov/api/v1/campgrounds"

/********** TEMPLATE GENERATION FUNCTIONS **********/

// These functions return HTML templates. Some functions will conditionally return HTML templates based on JSON data received from the API.

function generateSearchPage(){
  return `
  <div class="header">
  <!-- <img class="header-logo" src="happycampimg/arrow.png" alt="horizontal-arrow-icon"> -->
  <h1>Happy Camper</h1>
  <h2>Discover National Park campsites in your area that are suitable for RVs, trailers and other mobile campers</h2>
  </div>

  <form id="js-form">
  <label for="js-search-state">Enter a valid state code</label>
  <input id="js-search-state" type="text" name="max-results" required>
  <label for="js-max-results">Results to display:</label>
  <input id="js-max-results" type="number" name="max-results" value="5" required>
  <button type="submit">Submit</button>
  </form>

  <p id="js-error-message" class="error-message"></p>
  `;
}

function generateCampsites(responseJson){
  for (let i = 0; i < responseJson.data.length; i++){
    let parkName = responseJson.data[i].name
    let parkImgHtml = `<img src="happycampimg/placeholderImage.png" alt="placeholderDescription">`
    let parkAddress = responseJson.data[i].addresses.find(addresses => addresses.type === "Physical");
    let physicalAddressHtml = "No address provided";
    console.log(responseJson.data[i].accessibility.rvAllowed);
    console.log(responseJson.data[i].accessibility.trailerAllowed);

    //if the campsite allows RVs or trailers, conditionally display results
    if (responseJson.data[i].accessibility.rvAllowed !== 0 || responseJson.data[i].accessibility.trailerAllowed !== 0){
      return `<h2>${parkName}</h2>`

      // if(parkAddress){
      //   return `<h3>${parkAddress}</h3>`
      // }
    }

    //if the campsite does not allow RVs or trailers, display a message to the user that says `no parks found`.
    else if (responseJson.data[i].accessibility.rvAllowed || responseJson.data[i].accessibility.trailerAllowed === 0){
      
    }
  }
}

function generateExpandedResult(responseJson){

}


/********** RENDER FUNCTION **********/

// This function conditionally replaces the contents of the <main> tag based on the state of the app. It bundles together
// all of our template generation functions within if/if-else/else statement logic to render select HTML templates.

function renderCampApp(){
  console.log(`renderCampApp ran!`);

  //if no search has been initiated by the user- generate the search page
  if (campApp.searchStarted === false){
    $('main').html(generateSearchPage);
  }
  //if a search has been initiated by the user- generate the search results page
  else if (campApp.searchStarted){
    $('main').html(generateCampsites(responseJson));
  }
  //if a campsite has been selected by the user
  else if (campApp.campSelected){
    $('main').html(generateExpandedResult(responseJson));
  }
  // else {
  //   $('main').html(generateExpandedResult(responseJson));
  // }
}

/********** EVENT HANDLER FUNCTIONS **********/

// These functions handle events (submit, click, etc)
// When the user submits their search,
// When they select a campsite,
// When they interact with the home button, more results button, or the back to results button

function handleSearchSubmit() {
  $('form').submit(function(event){
    event.preventDefault();
    console.log(`handleSearchSubmit ran!`);
    const stateValue = $('#js-search-state').val();
    const maxResults = $('#js-max-results').val();
    console.log(stateValue);
    console.log(maxResults);
    campApp.searchStarted = true;
    console.log(campApp.searchStarted)
    getCampsites(stateValue,maxResults);
    });
  }

function handleCampsiteSelect(){

};

function handleHomeSelect(){
 
};

function handleMoreResults(){

};

function handleBackToResults(){

};

//********* API Fetch Search Results **********//

function getCampsites(stateValue,maxResults){
  const settings = {
    api_key: apiKey,
    stateCode: stateValue,
    limit: maxResults
    };
  const queryString = $.param(settings);
  const url = `${baseUrl}?${queryString}`;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => generateCampsites(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//********* Master **********//

// this function will be our callback when the page loads. it's responsible for
// initially rendering the Quiz App (render bundles together all our template generation functions), and activating our event handler functions
// for initializing the app, verifying the user's campsite choice 
// and user interaction with the "submit", "home", "more results" and "back to results" buttons.

function handleCampApp(){
  renderCampApp();
  handleSearchSubmit();
  handleCampsiteSelect();
  handleHomeSelect();
  handleMoreResults();
  handleBackToResults();
}

$(handleCampApp)