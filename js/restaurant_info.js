
let restaurant;
var map;
let ratingStars;


document.addEventListener('DOMContentLoaded', (event) => {
  
  ratingStars = document.querySelectorAll('.rating-container span.fa-star');

  ratingStars.forEach(function(item, index){
    item.setAttribute('data-index-of-item',index);

    item.addEventListener('click',function(){
      let index = item.getAttribute('data-index-of-item');
      
      ratingStars.forEach(function(item){
        item.classList.remove('checked');
        if(index >= item.getAttribute('data-index-of-item')){
          item.classList.toggle('checked');
        }
      });

      let rating = [].filter.call(ratingStars, function (el) {
        return el.classList.contains('checked');
      }).length;
     
      let ratingField = document.getElementById('rating').setAttribute('value',rating);
    
    });

    document.getElementById("reviews-form").addEventListener('submit', submitHandlerFunction);
    document.getElementById('id').setAttribute('value',getParameterByName('id'));

    document.querySelectorAll('#reviews-form input[type="text"]').forEach(function(elem){
      elem.addEventListener('change',function(){
        this.classList.remove('error');
      });
    });

    document.querySelectorAll('#reviews-form textarea').forEach(function(elem){
      elem.addEventListener('change',function(){
        this.classList.remove('error');
      });
    });


  });

  setTimeout(function(){
    let favourite = document.querySelectorAll('.restaurant-info-fav .fa.fa-star');
    if(!favourite.length){
      return;
    }
    
    favourite[0].addEventListener('click',(e) => {
        let resID = getParameterByName('id');
        
        const isFavourite = e.target.classList.contains('checked');

        e.target.classList.toggle('checked');

        if(!isFavourite){
          let scrollToStartingPos = document.getElementById('reviews-form-container').offsetTop;
          scrollTo(document.documentElement, scrollToStartingPos, 1250);
        }
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
   
  },300);
  
});

scrollTo = (element, to, duration) => {
  var start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;
      
  var animateScroll = function(){        
      currentTime += increment;
      var val = easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if(currentTime < duration) {
          setTimeout(animateScroll, increment);
      }
  };
  animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
easeInOutQuad =  (t, b, c, d) => {
t /= d/2;
if (t < 1) return c/2*t*t + b;
t--;
return -c/2 * (t*(t-2) - 1) + b;
};

submitHandlerFunction = (e) => {



  e.preventDefault();
  let $fname = document.getElementById("fname");
  let $lname = document.getElementById("lname");
  let $comment = document.getElementById("comment");
  let rating = document.getElementById("rating").value;
  let id = document.getElementById('id').value;
  if($fname.value == '' || $lname.value == '' || $comment.value == ''){
    if(!fname.value){
      $fname.classList.add('error');
    }
    if(!$lname.value){
      $lname.classList.add('error');
    }
    if(!$comment.value){
      $comment.classList.add('error');
    }
    return;
  }
  var customerReview = {
    "restaurant_id" : id,
    "name" : $fname.value + " " + $lname.value,
    "rating" : parseInt(rating) || 0,
    "comments" : $comment.value
  };

  if(!navigator.onLine){
    alert('You are currently offline, your review will be submitted as soon as your connection comes back.');
  }
  DBHelper.addReviewsToDB(customerReview).then(function(){
      // request a one-off sync:
      navigator.serviceWorker.ready.then(function(swRegistration) {
      swRegistration.sync.register('review-submission');
    
    }); 

  }).catch(function(err) {
    // something went wrong with the database or the sync registration, log and submit the form
    console.error(err);
  });

  const ul = document.getElementById('reviews-list');
  customerReview.createdAt = new Date();
  ul.appendChild(createReviewHTML(customerReview)); 
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

  const restaurantInfoFavouritesContainer = document.getElementById('restaurant-info-fav');

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favouriteStar = document.createElement('span');
  favouriteStar.classList.add('fa');
  favouriteStar.classList.add('fa-star');
  if(restaurant.is_favorite == 'true'){
    favouriteStar.classList.add('checked');
  }
  restaurantInfoFavouritesContainer.appendChild(favouriteStar);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const imageContainer = document.querySelector('div.image-container');

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


  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt','picture of ' + restaurant.name + " " + "Restaurant");
  image.setAttribute('tabindex','0');
  picture.appendChild(image);
  imageContainer.appendChild(picture);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML(restaurant);
  
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (restaurant) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  fetch('http://localhost:1337/reviews/?restaurant_id=' + restaurant.id).then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    reviews = myJson;
    DBHelper.getReviewsFromDB().then(function(cachedRevs){

      if(cachedRevs && cachedRevs.length){
        const ul = document.getElementById('reviews-list');
        cachedRevs.forEach(cr => {
          if(cr.restaurant_id == restaurant.id){
            ul.appendChild(createReviewHTML(cr));
          }
          
        });
      }
    });
    
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  });


  


}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('tabindex','0');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleDateString("en-US");
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current','page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
