const campApp = {
  campsites: {},
  search: {
    criteria: {
      stateCode: undefined,
      resultsToDisplay: 5
    },
    campResults: {},
    weatherResults: {},
  },
  npsApi: {
    key: "KFwuzmQlFFSDXKHJJPZNEj1rHD4YKRBlD9OOhqrh",
    baseUrl: "https://developer.nps.gov/api/v1/campgrounds"
  },
  weatherApi: {
    key: "ebd87c92a3dbb9c388f839a7cfd18221",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather"
  },
  pageCounter: 0,
  currentPage: "",
  currentIndex: 0,
  totalPages: 0,
  campSelected: false
}

/********** TEMPLATE GENERATION FUNCTIONS **********/

// These functions return HTML templates. Some functions will conditionally return HTML templates based on JSON data received from the API.

function generateSearchPage(){
  return `
  <div class="header">
    <h1>&#10524;Happy Camper&#8608</h1>
    <h2>Discover National Park campsites in your state that are suitable for RVs, trailers and other mobile campers</h2>
  </div>

  <form id="js-form">
    <label for="js-search-state">Enter a valid state code:</label>
    <input id="js-search-state" type="text" name="search-state" placeholder="XX" required>
    <label for="js-max-results">Results to display:</label>
    <input id="js-max-results" type="number" name="max-results" value="5" required>
    <button class="submit-btn js-submit-btn" type="submit">Submit</button>
  </form>
  `;
}

function generateCampsites(){
  let campsites = campApp.search.campResults

  $('main').empty();
  $('main').append(`<button class="home-btn js-home-btn"><i class="fa fa-home"></i></button>`)
  $('main').append(`<h1><span>Choose a Park</span></h1>`)
  for (let i = campApp.currentIndex; i < (campApp.pageCounter * campApp.search.criteria.resultsToDisplay); i++){
    let camp = campsites.data[i]
    if (camp == undefined){
      continue;
    }
    
    let campImageUrl = camp.images[0]?.url
    let campImageAlt = camp.images[0]?.altText
    let campImgHtml = `<img class="camp-img js-camp-img" src="happycampimg/rv2.PNG" alt="rvPlaceholder" data-campId="${i}">`
    let campAddress = camp.addresses.find(addresses => addresses.type === "Physical");
    let campAddressHtml = "No address provided";

    // if the campsite allows RVs or trailers, conditionally display results
    if (camp.accessibility.rvAllowed != 0 || camp.accessibility.trailerAllowed != 0){

      if (campAddress) {
        campAddressHtml = `${camp.addresses[0].line1} ${camp.addresses[0].line2} ${camp.addresses[0].line3} ${camp.addresses[0].city}, ${camp.addresses[0].stateCode} ${camp.addresses[0].postalCode}`; 
      }

      if (camp.images && camp.images.length > 0) {
        campImgHtml = `<img class="camp-img js-camp-img" src="${campImageUrl}" alt="${campImageAlt}" data-campId="${i}">`
        }
      }

    $('main').append(`
      <h2>${camp.name}</h2>
      <h3>${campAddressHtml}</h3>
      ${campImgHtml} 
    `)

    campApp.currentIndex++;
  };

  $('main').append(`
    <div class= "button-container">
    </div>
  `)

    if (campApp.pageCounter >= 1 && campApp.pageCounter < campApp.totalPages) {
      $('.button-container').append(`<button class="more-btn js-more-btn" type="button" onclick="handleNextResultsPage()">More Results</button>`)
    }

    if (campApp.pageCounter > 1){
      $('.button-container').append(`<button class="prev-btn js-previous-btn" type="button" onclick="handlePreviousResultsPage()">Previous Page</button>`)
    }
  
    if (campApp.totalPages > 1){
      $('main').append(`<p class="pageCounter">Page ${campApp.pageCounter} of ${campApp.totalPages}</p>`)
    }

    handleCampsiteSelect();
}

function generateCampDetail(campId){
  let camp = campApp.search.campResults.data[campId]
  let campFees= camp.fees
  // let campHours = camp.operatingHours[0].description

  let campAccessibility = {
    additonalInfo: camp.accessibility.additonalInfo,
    rvInfo: camp.accessibility.rvInfo,
    rvMax: camp.accessibility.rvMaxLength,
    trailerMax: camp.accessibility.trailerMaxLength
  }

  let campImage = {
    url: camp.images[0]?.url,
    alt: camp.images[0]?.altText,
    html: `<img class="camp-img js-camp-img" src="happycampimg/rv2.PNG" alt="rvPlaceholder">`
  }

  let reservation = {
    info: camp.reservationInfo,
    url: camp.reservationUrl
  }

  if (camp.images && camp.images.length > 0) {
    campImage.html = `<img class="camp-img js-camp-img" src="${campImage.url}" alt="${campImage.alt}">`
  }
  
  let descriptionHtml = getCampDescriptionHtml(camp.description).html;
  let campAccessibilityHtml = getCampAccessibilityHtml(camp.accessibility.additionalInfo, campAccessibility.rvInfo,campAccessibility.rvMax,campAccessibility.trailerMax).html;
  //getCampFeesHtml(campFees) = result
  //getCampFeesHtml(campFees).html = result.html
  //return really just says "return at this point"
  //if you provide something to the right (like a variable or truthy thing) it returns that to whoever called it.
  //getCampFeesHtml(campFees).html does two things. It calls the function and knows there is an object there then accesses the html property
  let campFeesHtml = getCampFeesHtml(campFees).html;
  let reservationHtml = getReservationHtml(reservation.info, reservation.url).html;

  
  // $.when(getWeather(camp.latitude,camp.longitude),getCampsites("TX"),googleAPIfx)
  //   .then ((weather,campsites) =>{
  //     debugger
  //   })

  //validation for weather API. If lat/lon != undefined
  $('main').empty();
  $('main').append(`
    <div class="detail-btns">
      <button class="home-btn js-home-btn"><i class="fa fa-home"></i></button>
      <button class="js-back-results-btn"><span>Back To Results</span></button>
    </div>
    <h2 class="camp-header">${camp.name}</h2>
    ${campImage.html}
    
    <!-- <button class="directions-btn js-directions-btn">Get Directions</button> -->
    
    <div class="weather-info">
    </div>
    <div class="accordion-container">
      <button class="accordion">Description</button>
      <div class="panel">
        ${descriptionHtml}
      </div>
      
      <button class="accordion">RV/Trailer Info</button>
      <div class="panel">
        ${campAccessibilityHtml}
      </div>
      
      <button class="accordion">Fees</button>
      <div class="panel">
        ${campFeesHtml}
      </div>

      <!-- <button class="accordion">Amenities</button>
      <div class="panel">
        <p>Lorem ipsum...</p>
      </div> -->

      <button class="accordion">Reservations</button>
      <div class="panel">
        ${reservationHtml}
      </div>
    </div>
  `)
  if (camp.latitude && camp.longitude){
    getWeather(camp.latitude,camp.longitude)
      .then(weatherDetail => {
        console.log("weather", weatherDetail)
        $('.weather-info').append(`
            <h3>${weatherDetail.name}</h3>
            <h4>${weatherDetail.description}</h3>
            <img class="weatherIcon" src="${weatherDetail.icon}" alt="${weatherDetail.category}" />
            <h4>${weatherDetail.currentTemp}&#176;F</h3>
        `)
      })
  }   
  /************ Validation Functions ************/
  //These functions check to see if the data being displayed on the UI actually exists in the
  //json object. 

  function getCampDescriptionHtml(description){
    
    let result = {
      html: "",
      haveDataFor: haveDataFor(description)
    }

    if (result.haveDataFor){
      result.html = `<p>${description}</p>`
    }

    return result;
  }

  function getCampAccessibilityHtml(additionalInfo,rvInfo,rvMaxLength,trailerMaxLength){
    
    let result = {
      html: "",
      has: {
        additionalInfo: haveDataFor(additionalInfo),
        rvInfo: haveDataFor(rvInfo),
        rvMaxLength: haveDataFor(rvMaxLength),
        trailerMaxLength: haveDataFor(trailerMaxLength)
      }
    }

    if (result.has.additionalInfo){
      result.html += `<p>${additionalInfo}</p>`
    }

    if (result.has.rvInfo){
      result.html += `<p>Rv Info: ${rvInfo}</p>`
    }

    if (!result.has.rvInfo){
      result.html += `<p>No explicit constraints on RV/trailer size</p>`
    }

    if (result.has.rvMaxLength){
      result.html += `<p>Rv Max length: ${rvMaxLength}'</p>`
    }

    if (result.has.trailerMaxLength){
      result.html += `<p>Trailer Max length: ${trailerMaxLength}'</p>`
    }

    return result;
  }
}
function getCampFeesHtml(campFees){

  let result = {
    html: "",
    has: {}
  };
  
  if (campFees.length === 0){
    result.html += `<p>No Fee information provided</p>`
  }

  //wont execute for empty fee arrays
  for (let i = 0; i < campFees.length; i++){
    result.has.cost = haveDataFor(campFees[i].cost)
    result.has.description = haveDataFor(campFees[i].description)
    result.has.title = haveDataFor(campFees[i].title)

    if (result.has.title){
      result.html += `<p>${campFees[i].title}</p>`
    }
    
    if (result.has.cost){
      result.html += `<p>$${parseFloat(+campFees[i].cost).toFixed(2)}</p>`
    }
    
    if (result.has.description){
      result.html += `<p>${campFees[i].description}</p>`
    }
  }
  return result;
}

function getReservationHtml(reservationInfo, reservationUrl){
  let result = {
    html: "",
    has: {
      reservationInfo: haveDataFor(reservationInfo),
      reservationUrl: haveDataFor(reservationUrl)
    }
  }

  if (result.has.reservationInfo){
    result.html += `<p>${reservationInfo}</p>`
  }

  if (result.has.reservationUrl){
    result.html += `<a target="_blank" href="${reservationUrl}">Reservation Website</a>`
  }

  if (!result.has.reservationInfo){
    result.html += `<p>No reservation information provided</p>`
  }

  return result;
}

//Main validation
function haveDataFor() {
  
  let isValid = true;

  for(let i = 0; i < arguments.length; i++){
      let value = arguments[i];
      // console.log('Checking value:  ', value);

      if (value == null || value == "" || value == undefined || value == 0) {
          // console.log('Invalid value:  ', value);
          isValid = false;
      }
  }
  //returns a value that is set to either T/F
  return isValid;
}

//**********PAGE NAVIGATION**********//

//if curr page value is === landing then do whatever is inside of the case statement. if undefined, throw an error.
//where am i, what do i need to load?
function routePage(camp = undefined){
  switch(campApp.currentPage){
    case "Landing":
      $('main').html(generateSearchPage);
      break;
    case "ViewCamps":
      $('main').html(handleNextResultsPage);
      break;
    case "ViewCampDetail":
      $('main').html(generateCampDetail(camp));
      handleAccordion();
      break;
    default: 
      console.error(`Route Page: ${campApp.currentPage} not defined`)
      break;
  }
}

//where am i, where am i going?
function nextPage(){
  //if im on this do this
  switch(campApp.currentPage){
    case "Landing":
      campApp.currentPage = "ViewCamps"
      routePage();
      break;
    case "ViewCamps":
      campApp.currentPage = "ViewCampDetail"
      routePage();
      break;
    default: 
      console.error(`Next Page: ${campApp.currentPage} not defined`)
      break;
  }
}

function handlePreviousResultsPage(){
  campApp.pageCounter--;
  campApp.currentIndex = (campApp.pageCounter - 1) * campApp.search.criteria.resultsToDisplay;
  generateCampsites();
};

function handleNextResultsPage(){
  campApp.pageCounter++;
  generateCampsites();
};

// function handleBackToResults(){
//   campApp.pageCounter = 0;
//   generateCampsites();
// }; 

/********** EVENT HANDLER FUNCTIONS **********/

// These functions handle events (submit, click, etc)
// When the user submits their search,
// When they select a campsite,
// When they interact with the home button, more results button, or the back to results button

function handleSearchSubmit() {
  $('form').submit(function(event){
    event.preventDefault();
    console.log(`handleSearchSubmit ran!`);
    campApp.search.criteria.stateCode = $('#js-search-state').val();
    campApp.search.criteria.resultsToDisplay = $('#js-max-results').val();
    campApp.search.campResults = 0;
    $('main').empty();
    $('main').append(`<img class="gif" src="happycampimg/loading1.gif">`);
    $('main').append(`<h2>Loading...</h2>`)

    //getCampsites returns a promise. it gets us all campsites for a particular state.
    getCampsites(campApp.search.criteria.stateCode,campApp.search.criteria.resultsToDisplay)
    //after the promise is returned. campsiteSearchResults = responseJson
    .then(function(campsitesSearchResults){
      //assign json to results object
      campApp.search.campResults = campsitesSearchResults;
      campApp.totalPages = Math.round(Number(campApp.search.campResults.total) / Number(campApp.search.criteria.resultsToDisplay ))
      nextPage();
    })
  });
}

function campsiteSelect(event){
  $(event.currentTarget).off('click', campsiteSelect)
  campApp.currentPage = "ViewCampDetail"
  routePage(event.currentTarget.dataset.campid);
}

function handleCampsiteSelect(){
  $('.js-camp-img').on('click', campsiteSelect)
}

function handleHomeSelect(){
  $('main').on('click', '.js-home-btn', event =>{
    campApp.currentPage = "Landing"
    campApp.pageCounter = 0;
    campApp.currentIndex = 0;
    campApp.totalPages = 0;
    campApp.campSelected = false;
    routePage();
  })
}

//upon clicking the button we need to go back to the first result
//page after loading the results
//how do we get back to this exact page?
//
function handleBackToResults(){
  // $('.js-back-results-btn').on('click', handleBackToResults)
  $('main').on('click','.js-back-results-btn', event =>{
    console.log('button targeted')
    campApp.pageCounter = 0;
    campApp.currentIndex = 0;
    // campApp.totalPages = 0;
    campApp.currentPage = "ViewCamps"
    routePage();
  })
}

function panelSelect(event){
  this.classList.toggle("active");

  /* Toggle between hiding and showing the active panel */
  let panel = this.nextElementSibling;
  let newDisplay = ""

  switch (panel.style.display){
    case "block":
      newDisplay = "none"
      break;
    default: 
      newDisplay = "block"
      break;
  }

  panel.style.display = newDisplay
}

function handleAccordion(){
  $('main').on('click', '.accordion', panelSelect)
}

/*
what do i need to do?
what do i need to get this done?
is this something i can test in a url?- No (will be another API call)
//https://www.google.com/maps/place/Boston,+MA/
@42.31435,-70.970284,11z/data=!3m1!4b1!4m5!3m4!1s0x89e3652d0d3d311b:0x787cbf240162e8a0!8m2!3d42.3600825!4d-71.0588801?hl=en
*/

function handleGetDirections(){
  /*
  */
};

//********* API Fetch Search Results **********//

//get campsite data from API and return it back as json.

function getCampsites(stateValue){
  const parameters = {
    api_key: campApp.npsApi.key,
    stateCode: stateValue,
  };

  const queryString = $.param(parameters);
  const url = `${campApp.npsApi.baseUrl}?${queryString}`;
  
  //return the result of queryFor. give me a state to get json data from
  return queryFor(url);
}

function getWeather(latitude,longitude){
  //api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={your api key}
  const parameters = {
    appid: campApp.weatherApi.key,
    lat: latitude,
    lon: longitude,
    units: "imperial"
  };
  const queryString = $.param(parameters);
  const url = `${campApp.weatherApi.baseUrl}?${queryString}`;

  return queryFor(url)
    .then(response => {
      return {
        name: response.name,
        category: response.weather[0].main,
        description: response.weather[0].description,
        icon: `https://openweathermap.org/img/w/${response.weather[0].icon}.png`,
        currentTemp: response.main.temp,
        humidity: `${response.main.temp}%`
      }
    })
}

function queryFor(url){
  //returning the promise of something coming back. "im going to give you campsites". Can also use queryFor to use weather API.
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    // looks for the p tag in the UI and updates the text to the error message. message is a built in prop for error
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//********* Master **********//

function handleCampApp(){
  campApp.currentPage = "Landing"
  routePage();
  handleSearchSubmit();
  handleHomeSelect();
  handleBackToResults();
}

$(handleCampApp)