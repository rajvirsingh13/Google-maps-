/* =========================================================
   LOCATION MAP WEBSITE
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   1. GLOBAL VARIABLES
========================================================= */

let map = null;
let userMarker = null;
let userAccuracyCircle = null;
let currentLocation = null;

let standardMapLayer = null;
let satelliteLikeLayer = null;

let isMapReady = false;


/* =========================================================
   2. DOM ELEMENTS
========================================================= */

const searchInput =
    document.getElementById("searchInput");

const searchLocationButton =
    document.getElementById("searchLocationButton");

const voiceSearchButton =
    document.getElementById("voiceSearchButton");

const currentLocationButton =
    document.getElementById("currentLocationButton");

const layersButton =
    document.getElementById("layersButton");

const mapStatus =
    document.getElementById("mapStatus");

const mapStatusText =
    document.getElementById("mapStatusText");

const permissionMessage =
    document.getElementById("permissionMessage");

const permissionTitle =
    document.getElementById("permissionTitle");

const permissionText =
    document.getElementById("permissionText");

const locationResult =
    document.getElementById("locationResult");

const locationTitle =
    document.getElementById("locationTitle");

const locationAddress =
    document.getElementById("locationAddress");

const latitudeValue =
    document.getElementById("latitudeValue");

const longitudeValue =
    document.getElementById("longitudeValue");

const accuracyValue =
    document.getElementById("accuracyValue");

const locationMarker =
    document.getElementById("locationMarker");

const setHomeButton =
    document.getElementById("setHomeButton");

const restaurantsButton =
    document.getElementById("restaurantsButton");

const petrolButton =
    document.getElementById("petrolButton");

const exploreNav =
    document.getElementById("exploreNav");

const youNav =
    document.getElementById("youNav");

const contributeNav =
    document.getElementById("contributeNav");


/* =========================================================
   3. INITIALIZE APPLICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMap();

    setupEventListeners();

    /*
     * Request location shortly after the page loads.
     * The browser controls the actual permission popup.
     */
    setTimeout(() => {

        requestUserLocation();

    }, 300);

});


/* =========================================================
   4. INITIALIZE MAP
========================================================= */

function initializeMap() {

    if (typeof L === "undefined") {

        showMapStatus(
            "Map library could not be loaded."
        );

        return;
    }


    map = L.map("map", {

        zoomControl: false,

        attributionControl: true,

        worldCopyJump: true

    }).setView(
        [20, 0],
        2
    );


    /* =====================================================
       STANDARD MAP
    ====================================================== */

    standardMapLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'

        }

    );


    standardMapLayer.addTo(map);


    /* =====================================================
       ALTERNATE MAP STYLE
    ====================================================== */

    satelliteLikeLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors, Tiles style by HOT'

        }

    );


    isMapReady = true;


    setTimeout(() => {

        if (map) {

            map.invalidateSize();

        }

    }, 200);

}


/* =========================================================
   5. EVENT LISTENERS
========================================================= */

function setupEventListeners() {


    /* =====================================================
       CURRENT LOCATION
    ====================================================== */

    if (currentLocationButton) {

        currentLocationButton.addEventListener(

            "click",

            () => {

                requestUserLocation(true);

            }

        );

    }


    /* =====================================================
       SEARCH LOCATION BUTTON
    ====================================================== */

    if (searchLocationButton) {

        searchLocationButton.addEventListener(

            "click",

            () => {

                handleSearch();

            }

        );

    }


    /* =====================================================
       SEARCH INPUT
    ====================================================== */

    if (searchInput) {

        searchInput.addEventListener(

            "keydown",

            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    handleSearch();

                }

            }

        );

    }


    /* =====================================================
       VOICE SEARCH
    ====================================================== */

    if (voiceSearchButton) {

        voiceSearchButton.addEventListener(

            "click",

            startVoiceSearch

        );

    }


    /* =====================================================
       MAP LAYERS
    ====================================================== */

    if (layersButton) {

        layersButton.addEventListener(

            "click",

            toggleMapLayer

        );

    }


    /* =====================================================
       QUICK ACTIONS
    ====================================================== */

    if (setHomeButton) {

        setHomeButton.addEventListener(

            "click",

            handleSetHome

        );

    }


    if (restaurantsButton) {

        restaurantsButton.addEventListener(

            "click",

            handleRestaurantSearch

        );

    }


    if (petrolButton) {

        petrolButton.addEventListener(

            "click",

            handlePetrolSearch

        );

    }


    /* =====================================================
       BOTTOM NAVIGATION
    ====================================================== */

    if (exploreNav) {

        exploreNav.addEventListener(

            "click",

            () => {

                setActiveNavigation(
                    exploreNav
                );

            }

        );

    }


    if (youNav) {

        youNav.addEventListener(

            "click",

            () => {

                setActiveNavigation(
                    youNav
                );

            }

        );

    }


    if (contributeNav) {

        contributeNav.addEventListener(

            "click",

            () => {

                setActiveNavigation(
                    contributeNav
                );

            }

        );

    }


    /* =====================================================
       WINDOW RESIZE
    ====================================================== */

    window.addEventListener(

        "resize",

        () => {

            if (map) {

                map.invalidateSize();

            }

        }

    );

}


/* =========================================================
   6. REQUEST USER LOCATION
========================================================= */

function requestUserLocation(showLoading = false) {

    if (!navigator.geolocation) {

        showPermissionError(

            "Location is not supported",

            "Your browser does not support location services."

        );

        return;

    }


    /*
     * Geolocation works reliably on HTTPS.
     */

    if (

        window.location.protocol !== "https:" &&

        window.location.hostname !== "localhost" &&

        window.location.hostname !== "127.0.0.1"

    ) {

        showMapStatus(

            "Location works best on HTTPS."

        );

    }


    if (showLoading) {

        showMapStatus(

            "Getting your location..."

        );

    }


    /*
     * IMPORTANT:
     *
     * The browser controls the permission popup.
     *
     * This code does NOT bypass permission.
     *
     * Location is requested only through the
     * browser's official Geolocation API.
     */

    navigator.geolocation.getCurrentPosition(

        handleLocationSuccess,

        handleLocationError,

        {

            enableHighAccuracy: true,

            timeout: 20000,

            maximumAge: 0

        }

    );

}


/* =========================================================
   7. LOCATION SUCCESS
========================================================= */

async function handleLocationSuccess(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;


    /*
     * Current location exists only for this page session.
     *
     * It is NOT automatically sent to a server.
     */

    currentLocation = {

        latitude: latitude,

        longitude: longitude,

        accuracy: accuracy

    };


    /* =====================================================
       UPDATE LATITUDE
    ====================================================== */

    if (latitudeValue) {

        latitudeValue.textContent =

            latitude.toFixed(6);

    }


    /* =====================================================
       UPDATE LONGITUDE
    ====================================================== */

    if (longitudeValue) {

        longitudeValue.textContent =

            longitude.toFixed(6);

    }


    /* =====================================================
       UPDATE ACCURACY
    ====================================================== */

    if (accuracyValue) {

        accuracyValue.textContent =

            formatAccuracy(accuracy);

    }


    /* =====================================================
       HIDE PERMISSION MESSAGE
    ====================================================== */

    hidePermissionMessage();


    /* =====================================================
       SHOW LOCATION MARKER
    ====================================================== */

    showLocationMarker();


    /* =====================================================
       UPDATE MAP
    ====================================================== */

    updateMapLocation(

        latitude,

        longitude,

        accuracy

    );


    /* =====================================================
       SHOW LOCATION RESULT
    ====================================================== */

    if (locationResult) {

        locationResult.hidden = false;

    }


    if (locationTitle) {

        locationTitle.textContent =
            "Your location";

    }


    if (locationAddress) {

        locationAddress.textContent =
            "Finding address information...";

    }


    showMapStatus(
        "Location found"
    );


    /* =====================================================
       REVERSE GEOCODING
    ====================================================== */

    await getAddressFromCoordinates(

        latitude,

        longitude

    );


    setTimeout(() => {

        hideMapStatus();

    }, 2500);

}


/* =========================================================
   8. LOCATION ERROR
========================================================= */

function handleLocationError(error) {

    if (!error) {

        showPermissionError(

            "Location unavailable",

            "We could not get your current location."

        );

        return;

    }


    switch (error.code) {


        /* =================================================
           PERMISSION DENIED
        ================================================== */

        case error.PERMISSION_DENIED:

            showPermissionError(

                "Location permission required",

                "Please allow location access in your browser settings to show your location."

            );

            break;


        /* =================================================
           LOCATION UNAVAILABLE
        ================================================== */

        case error.POSITION_UNAVAILABLE:

            showPermissionError(

                "Location unavailable",

                "Your device could not determine your current location. Please check your device location settings."

            );

            break;


        /* =================================================
           TIMEOUT
        ================================================== */

        case error.TIMEOUT:

            showPermissionError(

                "Location could not be found",

                "The location request took too long. Please check your device location settings."

            );

            break;


        /* =================================================
           UNKNOWN ERROR
        ================================================== */

        default:

            showPermissionError(

                "Unable to find location",

                "Something went wrong while getting your location."

            );

            break;

    }

}


/* =========================================================
   9. UPDATE MAP LOCATION
========================================================= */

function updateMapLocation(

    latitude,

    longitude,

    accuracy

) {

    if (!map || !isMapReady) {

        return;

    }


    const position = [

        latitude,

        longitude

    ];


    /* =====================================================
       REMOVE OLD MARKER
    ====================================================== */

    if (userMarker) {

        map.removeLayer(
            userMarker
        );

    }


    /* =====================================================
       REMOVE OLD ACCURACY CIRCLE
    ====================================================== */

    if (userAccuracyCircle) {

        map.removeLayer(

            userAccuracyCircle

        );

    }


    /* =====================================================
       USER LOCATION ICON
    ====================================================== */

    const locationIcon =

        L.divIcon({

            className:
                "custom-user-location",

            html: `

                <div style="
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #1683ff;
                    border: 4px solid #ffffff;
                    box-shadow:
                        0 1px 7px rgba(0,0,0,0.35);
                "></div>

            `,

            iconSize: [

                24,

                24

            ],

            iconAnchor: [

                12,

                12

            ]

        });


    /* =====================================================
       CREATE MARKER
    ====================================================== */

    userMarker =

        L.marker(

            position,

            {

                icon:
                    locationIcon,

                keyboard:
                    false

            }

        ).addTo(map);


    /* =====================================================
       TOOLTIP
    ====================================================== */

    userMarker.bindTooltip(

        "Your current location",

        {

            direction:
                "top",

            offset:
                [0, -10]

        }

    );


    /* =====================================================
       ACCURACY CIRCLE
    ====================================================== */

    if (

        Number.isFinite(accuracy) &&

        accuracy > 0

    ) {

        userAccuracyCircle =

            L.circle(

                position,

                {

                    radius:
                        accuracy,

                    fillColor:
                        "#1683ff",

                    fillOpacity:
                        0.12,

                    color:
                        "#1683ff",

                    opacity:
                        0.25,

                    weight:
                        1

                }

            ).addTo(map);

    }


    /* =====================================================
       CENTER MAP
    ====================================================== */

    map.setView(

        position,

        getSuitableZoom(
            accuracy
        ),

        {

            animate:
                true

        }

    );


    /* =====================================================
       INVALIDATE MAP SIZE
    ====================================================== */

    setTimeout(() => {

        if (map) {

            map.invalidateSize();

        }

    }, 250);

}


/* =========================================================
   10. SUITABLE MAP ZOOM
========================================================= */

function getSuitableZoom(accuracy) {

    if (!Number.isFinite(accuracy)) {

        return 16;

    }


    if (accuracy <= 20) {

        return 18;

    }


    if (accuracy <= 50) {

        return 17;

    }


    if (accuracy <= 100) {

        return 16;

    }


    if (accuracy <= 500) {

        return 14;

    }


    if (accuracy <= 2000) {

        return 12;

    }


    return 10;

}


/* =========================================================
   11. FORMAT ACCURACY
========================================================= */

function formatAccuracy(accuracy) {

    if (!Number.isFinite(accuracy)) {

        return "Unknown";

    }


    if (accuracy < 1000) {

        return `${Math.round(accuracy)} m`;

    }


    return `${(

        accuracy / 1000

    ).toFixed(2)} km`;

}


/* =========================================================
   12. REVERSE GEOCODING
========================================================= */

async function getAddressFromCoordinates(

    latitude,

    longitude

) {

    if (!locationAddress) {

        return;

    }


    const url =

        "https://nominatim.openstreetmap.org/reverse" +

        `?format=jsonv2` +

        `&lat=${encodeURIComponent(latitude)}` +

        `&lon=${encodeURIComponent(longitude)}` +

        `&zoom=18` +

        `&addressdetails=1`;


    try {

        const response =

            await fetch(

                url,

                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }

            );


        if (!response.ok) {

            throw new Error(

                "Address service unavailable"

            );

        }


        const data =

            await response.json();


        if (

            data &&

            data.display_name

        ) {

            locationAddress.textContent =

                data.display_name;

            return;

        }


        locationAddress.textContent =

            "Address information is not available.";

    }

    catch (error) {

        console.error(

            "Reverse geocoding error:",

            error

        );


        locationAddress.textContent =

            "Could not retrieve address information.";

    }

}


/* =========================================================
   13. SHOW LOCATION MARKER PLACEHOLDER
========================================================= */

function showLocationMarker() {

    if (!locationMarker) {

        return;

    }


    locationMarker.hidden = false;

}


/* =========================================================
   14. SHOW MAP STATUS
========================================================= */

function showMapStatus(message) {

    if (

        !mapStatus ||

        !mapStatusText

    ) {

        return;

    }


    mapStatusText.textContent =

        message;

    mapStatus.hidden = false;

}


/* =========================================================
   15. HIDE MAP STATUS
========================================================= */

function hideMapStatus() {

    if (!mapStatus) {

        return;

    }


    mapStatus.hidden = true;

}


/* =========================================================
   16. SHOW PERMISSION MESSAGE
========================================================= */

function showPermissionError(

    title,

    message

) {

    if (permissionTitle) {

        permissionTitle.textContent =

            title;

    }


    if (permissionText) {

        permissionText.textContent =

            message;

    }


    if (permissionMessage) {

        permissionMessage.hidden = false;

    }


    hideMapStatus();

}


/* =========================================================
   17. HIDE PERMISSION MESSAGE
========================================================= */

function hidePermissionMessage() {

    if (permissionMessage) {

        permissionMessage.hidden = true;

    }

}


/* =========================================================
   18. TOGGLE MAP LAYER
========================================================= */

function toggleMapLayer() {

    if (

        !map ||

        !standardMapLayer

    ) {

        return;

    }


    if (

        map.hasLayer(

            standardMapLayer

        )

    ) {

        map.removeLayer(

            standardMapLayer

        );


        if (satelliteLikeLayer) {

            satelliteLikeLayer.addTo(

                map

            );

        }


        showMapStatus(

            "Alternate map style"

        );

    }

    else {

        if (satelliteLikeLayer) {

            map.removeLayer(

                satelliteLikeLayer

            );

        }


        standardMapLayer.addTo(

            map

        );


        showMapStatus(

            "Standard map"

        );

    }


    setTimeout(() => {

        hideMapStatus();

    }, 1500);

}


/* =========================================================
   19. SEARCH
========================================================= */

async function handleSearch() {

    if (!searchInput) {

        return;

    }


    const query =

        searchInput.value.trim();


    if (!query) {

        showMapStatus(

            "Enter a place or address to search."

        );


        setTimeout(

            hideMapStatus,

            2000

        );

        return;

    }


    showMapStatus(

        `Searching for "${query}"...`

    );


    try {

        const url =

            "https://nominatim.openstreetmap.org/search" +

            `?format=jsonv2` +

            `&q=${encodeURIComponent(query)}` +

            `&limit=1`;


        const response =

            await fetch(

                url,

                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }

            );


        if (!response.ok) {

            throw new Error(

                "Search service unavailable"

            );

        }


        const results =

            await response.json();


        if (

            !Array.isArray(results) ||

            results.length === 0

        ) {

            showMapStatus(

                "Location not found."

            );

            return;

        }


        const result =

            results[0];


        const latitude =

            Number(result.lat);


        const longitude =

            Number(result.lon);


        if (

            !Number.isFinite(latitude) ||

            !Number.isFinite(longitude)

        ) {

            throw new Error(

                "Invalid search coordinates"

            );

        }


        if (map) {

            map.setView(

                [

                    latitude,

                    longitude

                ],

                16,

                {

                    animate:
                        true

                }

            );

        }


        if (locationResult) {

            locationResult.hidden = false;

        }


        if (locationTitle) {

            locationTitle.textContent =

                result.name ||

                "Search result";

        }


        if (locationAddress) {

            locationAddress.textContent =

                result.display_name ||

                "Address unavailable.";

        }


        if (latitudeValue) {

            latitudeValue.textContent =

                latitude.toFixed(6);

        }


        if (longitudeValue) {

            longitudeValue.textContent =

                longitude.toFixed(6);

        }


        if (accuracyValue) {

            accuracyValue.textContent =

                "Search result";

        }


        showMapStatus(

            "Location found"

        );


    }

    catch (error) {

        console.error(

            "Search error:",

            error

        );


        showMapStatus(

            "Could not search for that location."

        );

    }


    setTimeout(() => {

        hideMapStatus();

    }, 2500);

}


/* =========================================================
   20. VOICE SEARCH
========================================================= */

function startVoiceSearch() {

    const SpeechRecognition =

        window.SpeechRecognition ||

        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        showMapStatus(

            "Voice search is not supported by this browser."

        );

        setTimeout(

            hideMapStatus,

            2500

        );

        return;

    }


    const recognition =

        new SpeechRecognition();


    recognition.lang =

        "en-IN";


    recognition.interimResults =

        false;


    recognition.maxAlternatives =

        1;


    showMapStatus(

        "Listening..."

    );


    recognition.start();


    recognition.onresult =

        (event) => {

            const text =

                event.results[0][0].transcript;


            if (searchInput) {

                searchInput.value =

                    text;

            }


            handleSearch();

        };


    recognition.onerror =

        (event) => {

            console.error(

                "Voice search error:",

                event.error

            );


            showMapStatus(

                "Voice search could not be started."

            );


            setTimeout(

                hideMapStatus,

                2500

            );

        };


    recognition.onend =

        () => {

            hideMapStatus();

        };

}


/* =========================================================
   21. SET HOME
========================================================= */

function handleSetHome() {

    if (!currentLocation) {

        showMapStatus(

            "Allow location access first."

        );

        setTimeout(

            hideMapStatus,

            2000

        );

        return;

    }


    showMapStatus(

        "Home location selected for this session."

    );


    setTimeout(

        hideMapStatus,

        2000

    );

}


/* =========================================================
   22. RESTAURANT SEARCH
========================================================= */

function handleRestaurantSearch() {

    if (!searchInput) {

        return;

    }


    searchInput.value =

        "Restaurants";


    handleSearch();

}


/* =========================================================
   23. PETROL SEARCH
========================================================= */

function handlePetrolSearch() {

    if (!searchInput) {

        return;

    }


    searchInput.value =

        "Petrol pump";


    handleSearch();

}


/* =========================================================
   24. BOTTOM NAVIGATION
========================================================= */

function setActiveNavigation(activeElement) {

    const navigationItems = [

        exploreNav,

        youNav,

        contributeNav

    ];


    navigationItems.forEach(

        (item) => {

            if (!item) {

                return;

            }


            item.classList.toggle(

                "active",

                item === activeElement

            );

        }

    );

}


/* =========================================================
   25. PUBLIC API
========================================================= */

window.LocationMapApp = {

    getCurrentLocation: () => {

        return currentLocation;

    },

    requestLocation: () => {

        requestUserLocation(true);

    },

    search: () => {

        handleSearch();

    }

};


/* =========================================================
   END OF SCRIPT
========================================================= */
