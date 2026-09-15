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

const retryLocationButton =
    document.getElementById("retryLocationButton");

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
     * Request location shortly after the page becomes ready.
     * The browser itself controls the permission popup.
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


    /*
     * Initial map position.
     * This is only a temporary world view.
     * After permission is granted, the map moves
     * to the user's location.
     */
    map = L.map("map", {
        zoomControl: false,
        attributionControl: true,
        worldCopyJump: true
    }).setView([20, 0], 2);


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
       ALTERNATE MAP LAYER
       Used by the layers button.
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


    /*
     * Fix map dimensions after initialization.
     */
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


    /* Current location button */

    if (currentLocationButton) {

        currentLocationButton.addEventListener(
            "click",
            () => {

                requestUserLocation(true);

            }
        );

    }


    /* Search location icon */

    if (searchLocationButton) {

        searchLocationButton.addEventListener(
            "click",
            () => {

                requestUserLocation(true);

            }
        );

    }


    /* Retry */

    if (retryLocationButton) {

        retryLocationButton.addEventListener(
            "click",
            () => {

                hidePermissionMessage();

                requestUserLocation(true);

            }
        );

    }


    /* Search */

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


    /* Voice button */

    if (voiceSearchButton) {

        voiceSearchButton.addEventListener(
            "click",
            startVoiceSearch
        );

    }


    /* Layers */

    if (layersButton) {

        layersButton.addEventListener(
            "click",
            toggleMapLayer
        );

    }


    /* Quick action buttons */

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


    /* Bottom navigation */

    if (exploreNav) {

        exploreNav.addEventListener(
            "click",
            () => {

                setActiveNavigation(exploreNav);

            }
        );

    }


    if (youNav) {

        youNav.addEventListener(
            "click",
            () => {

                setActiveNavigation(youNav);

            }
        );

    }


    if (contributeNav) {

        contributeNav.addEventListener(
            "click",
            () => {

                setActiveNavigation(contributeNav);

            }
        );

    }


    /* Map movement */

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
     * HTTPS is recommended/required by modern browsers
     * for reliable geolocation access.
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
     * Browser displays its own permission prompt
     * when permission is required.
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


    currentLocation = {
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy
    };


    /* Update displayed coordinates */

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
            formatAccuracy(accuracy);

    }


    /* Hide permission message */

    hidePermissionMessage();


    /* Show location marker */

    showLocationMarker();


    /* Move map */

    updateMapLocation(
        latitude,
        longitude,
        accuracy
    );


    /* Show result */

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


    /*
     * Reverse geocoding.
     * Converts coordinates into readable
     * address information when available.
     */
    await getAddressFromCoordinates(
        latitude,
        longitude
    );


    /*
     * Remove temporary status after address lookup.
     */
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

        case error.PERMISSION_DENIED:

            showPermissionError(
                "Location permission denied",
                "Please allow location access in your browser settings to find your location."
            );

            break;


        case error.POSITION_UNAVAILABLE:

            showPermissionError(
                "Location unavailable",
                "Your device could not determine the current location. Check GPS or location services and try again."
            );

            break;


        case error.TIMEOUT:

            showPermissionError(
                "Location request timed out",
                "It took too long to find your location. Please try again."
            );

            break;


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


    const position =
        [latitude, longitude];


    /*
     * Remove previous marker.
     */
    if (userMarker) {

        map.removeLayer(userMarker);

    }


    /*
     * Remove previous accuracy circle.
     */
    if (userAccuracyCircle) {

        map.removeLayer(
            userAccuracyCircle
        );

    }


    /* =====================================================
       USER LOCATION MARKER
    ====================================================== */

    const locationIcon =
        L.divIcon({
            className: "custom-user-location",
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
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });


    userMarker =
        L.marker(
            position,
            {
                icon: locationIcon,
                keyboard: false
            }
        ).addTo(map);


    userMarker.bindTooltip(
        "Your current location",
        {
            direction: "top",
            offset: [0, -10]
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
                    radius: accuracy,
                    fillColor: "#1683ff",
                    fillOpacity: 0.12,
                    color: "#1683ff",
                    opacity: 0.25,
                    weight: 1
                }
            ).addTo(map);

    }


    /*
     * Center map on user.
     */
    map.setView(
        position,
        getSuitableZoom(accuracy),
        {
            animate: true
        }
    );


    /*
     * Keep map UI responsive.
     */
    setTimeout(() => {

        map.invalidateSize();

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


    /*
     * Nominatim / OpenStreetMap reverse geocoding.
     *
     * This is used only after the user has
     * granted location permission.
     */
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
                    method: "GET",
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

    } catch (error) {

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

    if (!mapStatus || !mapStatusText) {
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
   16. SHOW PERMISSION ERROR
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

    if (!map || !standardMapLayer) {
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

    } else {

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

function handleSearch() {

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


    /*
     * Full place-search functionality will be
     * connected in a later version.
     */
    showMapStatus(
        `Searching for "${query}"...`
    );


    /*
     * For now we use a geocoding request to
     * find the entered place/address.
     */
    searchPlace(
        query
    );

}


/* =========================================================
   20. PLACE SEARCH
========================================================= */

async function searchPlace(query) {

    const searchUrl =
        "https://nominatim.openstreetmap.org/search" +
        `?format=jsonv2` +
        `&q=${encodeURIComponent(query)}` +
        `&limit=1`;


    try {

        const response =
            await fetch(
                searchUrl,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Search unavailable"
            );

        }


        const results =
            await response.json();


        if (
            !Array.isArray(results) ||
            results.length === 0
        ) {

            showMapStatus(
                "No location found."
            );

            setTimeout(
                hideMapStatus,
                2000
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
                "Invalid coordinates"
            );

        }


        if (map) {

            map.setView(
                [latitude, longitude],
                16,
                {
                    animate: true
                }
            );

        }


        showMapStatus(
            result.display_name ||
            "Location found"
        );


        setTimeout(
            hideMapStatus,
            2500
        );


    } catch (error) {

        console.error(
            "Search error:",
            error
        );


        showMapStatus(
            "Search could not be completed."
        );


        setTimeout(
            hideMapStatus,
            2500
        );

    }

}


/* =========================================================
   21. VOICE SEARCH
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

            const transcript =
                event.results[0][0].transcript;


            if (searchInput) {

                searchInput.value =
                    transcript;

            }


            handleSearch();

        };


    recognition.onerror =
        () => {

            showMapStatus(
                "Voice search could not be completed."
            );

            setTimeout(
                hideMapStatus,
                2000
            );

        };


    recognition.onend =
        () => {

            /*
             * Search result handling is already
             * performed in onresult.
             */

        };

}


/* =========================================================
   22. SET HOME
========================================================= */

function handleSetHome() {

    if (!currentLocation) {

        showMapStatus(
            "Find your location first."
        );

        setTimeout(
            hideMapStatus,
            2000
        );

        return;

    }


    /*
     * At this stage we only demonstrate the action.
     * Permanent saved-home functionality can be
     * added later with explicit user confirmation.
     */
    showMapStatus(
        "Current location selected as home."
    );


    setTimeout(
        hideMapStatus,
        2000
    );

}


/* =========================================================
   23. RESTAURANT SEARCH
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
   24. PETROL SEARCH
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
   25. BOTTOM NAVIGATION
========================================================= */

function setActiveNavigation(
    activeButton
) {

    const navItems =
        [
            exploreNav,
            youNav,
            contributeNav
        ];


    navItems.forEach(
        (button) => {

            if (!button) {
                return;
            }


            button.classList.remove(
                "active"
            );


            button.removeAttribute(
                "aria-current"
            );

        }
    );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );


        activeButton.setAttribute(
            "aria-current",
            "page"
        );

    }

}


/* =========================================================
   26. PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !document.hidden &&
            map
        ) {

            setTimeout(
                () => {

                    map.invalidateSize();

                },
                100
            );

        }

    }
);


/* =========================================================
   27. PREVENT ACCIDENTAL PAGE SCROLL
========================================================= */

document.addEventListener(
    "touchmove",
    (event) => {

        /*
         * Allow scrolling inside designated
         * scrollable areas.
         */
        const target =
            event.target;


        const isScrollable =
            target.closest(
                ".bottom-sheet-content, .quick-actions"
            );


        if (!isScrollable) {

            /*
             * The app itself should remain fixed.
             */
            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


/* =========================================================
   28. SECURITY / SAFE TEXT HELPERS
========================================================= */

/*
 * This helper can be used later whenever
 * external API data is inserted into HTML.
 */
function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   29. DEBUG INFORMATION
========================================================= */

function getCurrentLocationData() {

    if (!currentLocation) {

        return null;

    }


    return {
        latitude:
            currentLocation.latitude,

        longitude:
            currentLocation.longitude,

        accuracy:
            currentLocation.accuracy
    };

}


/* =========================================================
   30. APPLICATION READY
========================================================= */

window.LocationMapApp = {

    getCurrentLocation:
        getCurrentLocationData,

    requestLocation:
        requestUserLocation,

    search:
        searchPlace

};
