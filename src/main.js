// Create a styles array to use with the map.
var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 },
    ],
  },
  {
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 },
    ],
  },
];

var map;
// Create a new blank array for all the listing markers.
var markers = [];
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 45.5079637, lng: -73.57338 },
    zoom: 14,
    styles: styles,
    mapTypeControl: false,
  });

  // Yelp base URL
  var searchURL = 'https://api.yelp.com/v2/search';

  // Passing parameters to Yelp search
  var parameters = {
    oauth_consumer_key: 'WJ_UTQ5o_wg2fnRa2YDvzQ',
    oauth_token: 'OGFV6dB_0MdRYZ8FO7i8LFxp_UduSoIm',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_nonce: Math.floor(Math.random() * 1e12).toString(),

    oauth_version: '1.0',
    callback: 'cb',

    term: 'food',
    location: '1555 Rue Jeanne-Mance, Montreal, QC',
    latitude: 45.5079637,
    longitude: -73.57338,
    limit: 40,
    radius_filter: 5000,
  };

  // Yelp credentials
  var consumerSecret = 'wmCiGL9GHre-8x7cfoFq2VX1M9Y';
  var tokenSecret = 'w2_pwJSjwJWjoYdC1oVW3JD4zwo';

  var signature = oauthSignature.generate('GET', searchURL, parameters, consumerSecret, tokenSecret);

  parameters.oauth_signature = signature;

  var locations = [];

  $.ajax({
    url: searchURL,
    type: 'GET',
    cache: true,
    data: parameters,
    dataType: 'jsonp',
    success: function (data) {
      data.businesses.forEach(function (r) {
        locations.push({
          title: r.name,
          location: {
            lat: r.location.coordinate.latitude,
            lng: r.location.coordinate.longitude,
          },
          address: r.location.address[0],
          rating_img_url: r.rating_img_url,
          url: r.url,
          cat: r.categories[0][0],
        });
      });

      var largeInfowindow = new google.maps.InfoWindow();
      // The following group uses the location array to create an array of markers on initialize.
      for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
          map: map,
          position: position,
          title: title,
          animation: google.maps.Animation.DROP,
          id: i,
          address: locations[i].address,
          rating_img_url: locations[i].rating_img_url,
          url: locations[i].url,
          cat: locations[i].cat,
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
          populateInfoWindow(this, largeInfowindow);
        });
      }

      showListings();
      displayList(markers);

      document.getElementById('search-result')
        .innerHTML = data.businesses.length + ' restos';

      document.getElementById('show-listings').addEventListener('click', showListings);
      document.getElementById('hide-listings').addEventListener('click', hideListings);
    },
    error: function (err) {
      console.log('Err', err);
    },
  });
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker !== marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' +
                            '<h3>' +
                              '<a href=' + marker.url + ' target="_blank">' +
                                marker.title +
                              '</a>' +
                            '</h3>' +
                            '<span class="category">' + marker.cat + '</span>' +
                            '<p>' + marker.address + '</p>' +
                            '<img src=' + marker.rating_img_url + '>' +
                          '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function () {
      infowindow.setMarker(null);
    });
  }
}

// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
// This function will loop through the listings and hide them all.
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// Display resto list in the sidebar
function displayList(markers) {
  for (var i = 0; markers.length > i; i++) {
    var id = 'resto-' + i;
    var node = document.createElement('li');
    node.setAttribute('id', id);
    node.setAttribute('class', 'resto-item');
    var textnode = document.createTextNode(markers[i].title);
    node.appendChild(textnode);
    document
      .getElementById('resto-list')
      .appendChild(node);

    // When clicked a restaurant in list, it opens infowindow
    document
      .getElementById(id)
      .addEventListener('click', function (marker) {
        return function () {
          google.maps.event.trigger(marker, 'click');
        };
      }(markers[i]));
  }
}
