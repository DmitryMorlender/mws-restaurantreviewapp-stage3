
let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  
  
  
  createAndInitDB();
  fetchNeighborhoods();
  fetchCuisines();
  createReviewsDB();

  if(!navigator.serviceWorker) return;
  
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      if (!navigator.serviceWorker.controller) {
        return;
      }
  
      if (registration.waiting) {
        updateReady(registration.waiting);
        return;
      }
  
      if (registration.installing) {
        trackInstalling(registration.installing);
        return;
      }
  
      registration.addEventListener('updatefound', function() {
        trackInstalling(registration.installing);
      });
  

      console.log('Service worker registration succeeded:', registration);
    }).catch(function(error) {
      console.log('Service worker registration failed:', error);
    }); 

    let toastButtons  = document.querySelectorAll('.toast-button');
    if(toastButtons.length){
      toastButtons.forEach((element) => {
        element.addEventListener('click', (e) => {
          let worker = navigator.serviceWorker.waiting;
          let answer = e.target.getAttribute('data-title');
          let toast = document.getElementById("toast");
          
           if (answer != 'refresh') {
            toast.className = toast.className.replace("show", "");
            return;
          }
          toast.className = toast.className.replace("show", "");
          waitingWorker.postMessage({action: 'skipWaiting'});
        });
      });
    }

      setTimeout(function(){
        document.querySelectorAll('.fa.fa-star').forEach((item) => {
          item.addEventListener('click',() => {
            let resID = item.getAttribute('res-id');
            
            const isFavourite = item.classList.contains('checked');

            item.classList.toggle('checked');
            const url = 'http://localhost:1337/restaurants/' + resID + '/?is_favorite=' + !isFavourite;
            fetch(url,{
              method: 'PUT'
            }).then((response) => {
              console.log(response);
              return response.json();
            }).then((data) => {
              console.log(data);
            }).catch((err) => {
              let resInfo = {'id' : resID, 'is_favourite' : !isFavourite};
              DBHelper.updateRestaurantFavourite(resInfo);
            });


          });
        });
      },300);
    
});

var waitingWorker;
trackInstalling = (worker) => {

  worker.addEventListener('statechange', function() {
    if (worker.state == 'installed') {
      updateReady(worker);
    }
  });
};

swap_map = () => {    
  if (document.getElementById('map').style.display === 'none')      
  {        
  document.getElementById('map').style.display = 'block';       
   //document.getElementById('static_map').style.display = 'none'      
  }    
  }

updateReady = (worker) =>{
  let x = document.getElementById("toast")
  x.className = "show";
  waitingWorker = worker;
};

createAndInitDB = () => {
  DBHelper.openDataBase();
}

createReviewsDB = () => {
  DBHelper.createDefferdReviewsDB();
}
/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });

}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute('role','link');
  li.setAttribute('tabindex','0');

  const picture = document.createElement('picture');
  picture.className = 'restaurant-img';
  const smallSource = document.createElement('source');
  smallSource.setAttribute('media','(max-width: 1000px)');
  smallSource.setAttribute('srcset',DBHelper.imageUrlsForSmallRestaurant(restaurant));

  picture.appendChild(smallSource);
  const bigSource = document.createElement('source');
  bigSource.setAttribute('media','(min-width: 1001px)');
  bigSource.setAttribute('srcset',DBHelper.imageUrlsForBigRestaurant(restaurant));

  picture.appendChild(bigSource);
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('src',DBHelper.imageUrlsForRestaurant(restaurant));

  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt','picture of ' + restaurant.name + " " + "Restaurant");
  image.setAttribute('tabindex','0');
  picture.appendChild(image);
  li.append(picture);

  const name = document.createElement('h2');
  name.setAttribute('id',restaurant.id);
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-describedby',restaurant.id);
  more.href = DBHelper.urlForRestaurant(restaurant);

  const favouriteContainer = document.createElement('div');
  favouriteContainer.classList.add('favourite-container');
  const favouriteStar = document.createElement('span');
  favouriteStar.classList.add('fa');
  favouriteStar.classList.add('fa-star');
  if(restaurant.is_favorite == 'true'){
    favouriteStar.classList.add('checked');
  }
  favouriteStar.setAttribute('res-id',restaurant.id);
  favouriteContainer.appendChild(more);
  favouriteContainer.appendChild(favouriteStar);

  //li.append(more);
  li.append(favouriteContainer);
  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
