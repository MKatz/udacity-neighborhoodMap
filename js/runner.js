var map;
var place = [{
    name: "Doc's Wine & Food",
    lat: 36.113242,
    lng: -95.975398,
    address: '3509 S Peoria Ave, Tulsa, OK 74105',
    phone: '(918) 949-3663',
    description: 'Creole classics & creative cocktails served in a brick-accented dining room or large outdoor patio.'
}, {
    name: 'R Bar & Grill',
    lat: 36.113623,
    lng: -95.975416,
    address: '3421 S Peoria Ave, Tulsa, OK 74105',
    phone: '(918) 392-4811',
    description: 'Casual gastropub serving craft beer & American eats such as chicken & waffles, pizza & sandwiches.'
}, {
    name: 'Blue Moon Cafe',
    lat: 36.113026,
    lng: -95.975937,
    address: '3512 S Peoria Ave, Tulsa, OK 74105',
    phone: '(918) 749-7800',
    description: 'Airy, funky bakery/cafe offering ample portions of American eats, plus pastries & cakes.'
}, {
    name: 'Cafe Ole',
    lat: 36.113135,
    lng: -95.975279,
    address: '3509 S Peoria Ave, Tulsa, OK 74105',
    phone: '(918) 745-6699',
    description: 'Casual, contemporary spot with a popular patio serving Southwestern favorites with beer & cocktails.'
}, {
    name: 'Brookside By Day',
    lat: 36.114591,
    lng: -95.975405,
    address: '3313 S Peoria Ave, Tulsa, OK 74105',
    phone: '(918) 745-9989',
    description: 'Casual eatery whipping up hearty breakfasts, burgers & sandwiches, plus daily chalkboard specials.'
}, {
    name: "Leon's On The Restless Ribbon",
    lat: 36.115117,
    lng: -95.975523,
    address: '3301 S Peoria Ave, Tulsa, OK 74105',
    phone: '(918) 933-5366',
    description: 'Open, brick-lined sports bar with many local beers on tap & a menu of creative pub grub & brunch.'
}];
var Place = function(data) {
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.address = data.address;
    this.phone = data.phone;
    this.description = data.description;
};
function initMap() {
    var ViewModel = function() {
        var self = this;
        this.placeList = ko.observableArray([]);
        this.igImages = ko.observableArray([]);
        this.search = ko.observable('');
        // Create place object. Push to array.
        place.forEach(function(item) {
            this.placeList.push(new Place(item));
        }, this);
        // set first place
        this.currentPlace = ko.observable(this.placeList()[0]);
        // list click
        this.setPlace = function(clickedPlace) {
            google.maps.event.trigger(clickedPlace.marker, 'click');
        };
        this.renderMarkers = function(arrayInput) {
            // use place array to create marker array
            for (var i = 0, len = arrayInput.length; i < len; i++) {
                var location = {
                    lat: arrayInput[i].lat,
                    lng: arrayInput[i].lng
                };
                var marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    myPlace: arrayInput[i]
                });
                // save the map marker as part of the location object
                arrayInput[i].marker = marker;
                // create event listener in external function
                self.createEventListener(arrayInput[i]);
            };
        };
        function toggleBounce(myMarker) {
            myMarker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                myMarker.setAnimation(null);
            }, 2500);
        }
        this.createEventListener = function(location) {
            location.marker.addListener('click', function () {
                toggleBounce(location.marker);
                self.currentPlace(location);
                self.updateContent(location);
                self.instagramImg(location.lat, location.lng);
                // does the infowindow exist?
                if (self.infowindow) {
                    self.infowindow.close(); // close the infowindow
                }
                // open the infowindow with this map marker location
                self.infowindow.open(map, location.marker);
            });
        };
        this.filteredItems = ko.computed(function() {
            var searchTerm = self.search().toLowerCase();
            // is the search term undefined or empty?
            if (!searchTerm || searchTerm === '') {
                // for each location
                for (var i = 0; i < self.placeList().length; i++) {
                    // does the map marker exist?
                    if (self.placeList()[i].marker !== undefined) {
                        self.placeList()[i].marker.setVisible(true); // show the map marker
                    }
                }
                return self.placeList(); // return location list
            } else {
                return ko.utils.arrayFilter(self.placeList(),
                    function(item) {
                        // does the place name contain the search term?
                        if (item.name.toLowerCase().indexOf(searchTerm) < 0) {
                            item.marker.setVisible(false); // hide the map marker
                        } else {
                            item.marker.setVisible(true); // show the map marker
                        }
                        return item.name.toLowerCase().indexOf(searchTerm) !== -1; // return filtered location list
                    });
            }
        });
        // Google Maps
        var styleArray = [{
            featureType: "all",
            stylers: [{
                saturation: -80
            }]
        }, {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{
                hue: "#00ffee"
            }, {
                saturation: 50
            }]
        }, {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }];
        if(map = true){
            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: 36.114251,
                    lng: -95.975714
                },
                zoom: 18,
                mapTypeControl: false,
                scrollwheel: false,
                styles: styleArray,
                streetViewControl: false
            });
        } else {
            alert('Google Maps Error');
        }
        // this.markers = [];
        this.infowindow = new google.maps.InfoWindow({
            maxWidth: 250
        });
        this.renderMarkers(self.placeList());
    };
    // infowindow content
    ViewModel.prototype.updateContent = function(place) {
        var html = '<div class="info-content">' + '<h3>' + place.name + '</h3>' + '<p>' + place.address + '</p>' + '<p>' + place.phone + '</p>' + '<p>' + place.description + '</p>' + '</div>';
        this.infowindow.setContent(html);
    };
    // Instagram API
    ViewModel.prototype.instagramImg = function(lat, lng) {
        var self = this;
        var igLat = lat,
            igLng = lng,
            locationURLList = [],
            imageObjList = [],
            imageList = [],
            infoBox = $('#igInfo'),
            imgDiv = $('.igDiv');
        // find location ID within 15 meters of lat & lng
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            cache: true,
            url: 'https://api.instagram.com/v1/locations/search?lat=' + igLat.toString() + '&lng=' + igLng.toString() + '&distance=15&access_token=1137819202.4400571.ddb143985bbe4037a23664722dcd79a4'
        }).done(function(data) {
            // loop through location ID to make second call
            for (var i = 0; i < data.data.length; i++) {
                var targetURL =
                    'https://api.instagram.com/v1/locations/' + data.data[i].id + '/media/recent?access_token=1137819202.4400571.ddb143985bbe4037a23664722dcd79a4';
                locationURLList.push(targetURL);
            }
            // call with location ID
            $.when.apply($, locationURLList.map(function(url) {
                return $.ajax({
                    type: "GET",
                    dataType: "jsonp",
                    cache: true,
                    url: url
                });
            })).done(function() {
                if(locationURLList.length > 0) {
                    // loop to make image array
                    for (var i = 0; i < arguments.length; i++) {
                        imageObjList.push.apply(
                            imageObjList, arguments[i][0].data);
                    }
                    // display six images
                    imageObjList = imageObjList.slice(0, 6);
                    $('#imageArea').empty();
                    for (var i = 0; i < imageObjList.length; i++) {
                        self.igImages.push(imageObjList[i].images.low_resolution.url);
                    }
                    infoBox.hide();
                } else {
                    alert('Instagram API Error');
                }
            });
        }).error(function() {
            alert('Instagram API Error');
        });
    };
    ko.applyBindings(new ViewModel());
} initMap();
