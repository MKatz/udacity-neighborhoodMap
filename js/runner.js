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
(function() {
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
            self.currentPlace(clickedPlace);
            // find and store clicked place
            var index = self.filteredItems().indexOf(clickedPlace);
            // ready for infowindow
            self.updateContent(clickedPlace);
            // activate the marker
            self.activateMarker(self.markers[index], self, self.infowindow)();
            // Instagram API call
            self.instagramImg(clickedPlace.lat, clickedPlace.lng);
        };
        // place filter
        this.filteredItems = ko.computed(function() {
            var searchTerm = self.search().toLowerCase();
            if (!searchTerm) {
                return self.placeList();
            } else {
                return ko.utils.arrayFilter(self.placeList(),
                    function(item) {
                        return item.name.toLowerCase().indexOf(searchTerm) !== -1;
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
        this.map = new google.maps.Map(document.getElementById('map'), {
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
        this.markers = [];
        this.infowindow = new google.maps.InfoWindow({
            maxWidth: 250
        });
        this.renderMarkers(self.placeList());
        // Use filteredItems to render markers
  	    this.filteredItems.subscribe(function(){
		    self.renderMarkers(self.filteredItems());
  	    });
    };
    ViewModel.prototype.clearMarkers = function() {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
    };
    ViewModel.prototype.renderMarkers = function(arrayInput) {
        this.clearMarkers();
        var infowindow = this.infowindow;
        var context = this;
        var placeToShow = arrayInput;
        // use place array to create marker array
        for (var i = 0, len = placeToShow.length; i < len; i++) {
            var location = {
                lat: placeToShow[i].lat,
                lng: placeToShow[i].lng
            };
            var marker = new google.maps.Marker({
                position: location,
                map: this.map,
                animation: google.maps.Animation.DROP,
                myPlace: placeToShow[i]
            });
            this.markers.push(marker);
            this.markers[i].setMap(this.map);
            // click event
            (function () {
                var myMarker = marker;
                myMarker.addListener('click', function () {
                    context.setPlace(myMarker.myPlace);
                });
            })();
        }
    };
    // activate marker when menu list is clicked
    ViewModel.prototype.activateMarker = function(marker, context, infowindow) {
        return function() {
            infowindow.close();
            infowindow.open(context.map, marker);
        };
    };
    // infowindow content
    ViewModel.prototype.updateContent = function(place) {
        var html = '<div class="info-content">' + '<h3>' + place.name + '</h3>' + '<p>' + place.address + '</p>' + '<p>' + place.phone + '</p>' + '<p>' + place.description + '</p>' + '</div>';
        this.infowindow.setContent(html);
    };
    // Instagram API
    ViewModel.prototype.instagramImg = function(lat, lng) {
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
                // loop to make image array
                for (var i = 0; i < arguments.length; i++) {
                    imageObjList.push.apply(
                        imageObjList, arguments[i][0].data);
                }
                // display six images
                imageObjList = imageObjList.slice(0, 6);
                $('#imageArea').empty();
                var imageContainer = $('#imageArea');
                for (var i = 0; i < imageObjList.length; i++) {
                    imageContainer.append('<div class="igDiv"><a href="' + imageObjList[i].link + '"><img src="' + imageObjList[i].images.low_resolution.url + '" /></a></div>');
                    // $('#imageArea').empty();
                    // $(imageContainer).appendTo('#imageArea');
                }
                self.igImages.push(imageContainer);
                infoBox.hide();
            });
        });
    };
    ko.applyBindings(new ViewModel());
})();
