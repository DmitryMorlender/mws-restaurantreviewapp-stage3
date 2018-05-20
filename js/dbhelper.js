/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Creates IndexedDB
   */
  static createDB(){
    
     this._dbPromise = idb.open('restaurants-db', 1, function(upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          // a placeholder case so that the switch block will
          // execute when the database is first created
          // (oldVersion is 0)
        case 1:
          upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
          var store = upgradeDb.transaction.objectStore('restaurants');
          store.createIndex('updatedAt', 'updatedAt');
      }
      
    });
    this._NUMBER_OF_UP_TO_DATE_RESTAURANTS = 10;
  }

  /**
   * Adds fetched restaurants to local storage and saves 10 up-to-date restaurants.
   * @param {*} restaurants - fecthed restaurants.
   */
  static addRestaurantsToDB(restaurants){
    const _NUMBER_OF_UP_TO_DATE_RESTAURANTS = this._NUMBER_OF_UP_TO_DATE_RESTAURANTS;
    this._dbPromise.then(function(db){
      var tx = db.transaction('restaurants', 'readwrite');
      var store = tx.objectStore('restaurants');
      restaurants.forEach(function(res){
        store.put(res);
      });

      store.index('updatedAt').openCursor(null,'prev').then(function(cursor){
        return cursor.advance(_NUMBER_OF_UP_TO_DATE_RESTAURANTS);
      }).then(function deleteRest(cursor){
        if(!cursor) return;
        cursor.delete();
        return cursor.continue().then(deleteRest);
      })
    });
   
  }
  
   /**
   * Open IndexedDB.
   */
   static openDataBase(){

    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }
    DBHelper.createDB();
   
   }

   /**
   * Fetch all restaurants.
   */

  static fetchRestaurants(callback) {

    let indexedDBIsEmpty = false;
    if(!this._dbPromise){
      this._dbPromise = idb.open('restaurants-db', 1, function(upgradeDb) {});
    }
    this._dbPromise.then(function(db){

      var tx = db.transaction('restaurants');
      var store = tx.objectStore('restaurants');

      return store.getAll();
    }).then(function(rests){
      const restaurants = rests;
      if(!rests.length){
        DBHelper.getRestaurantsFromNetwork(callback);
      }
      callback(null, restaurants);
    }).catch(function(err){
      DBHelper.getRestaurantsFromNetwork(callback);
    });
  }

  /**
   * Fetches restaurant information from the network
   * @param {*} callback 
   */
  static getRestaurantsFromNetwork(callback){
    fetch(DBHelper.DATABASE_URL).
    then(response => response.json())
    .then(function(res){
      const restaurants = res;
      DBHelper.addRestaurantsToDB(restaurants);
      callback(null, restaurants);
    })
    .catch(function(err){
      const error = (`Request failed. Returned status of ${err}`);
      callback(error, null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/dist/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
