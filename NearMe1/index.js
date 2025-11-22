//Loading the saved user information from localStorage
document.addEventListener('DOMContentLoaded', function() {
let userLocation = { lat: null, lon: null }; //variable always updates after the GPS check to capture the user's location in coordinates

let userProfile = JSON.parse(localStorage.getItem('nearme_profile') || '{"name":"","email":""}');
let userCredentials = JSON.parse(localStorage.getItem('nearme_credentials') || '[]');
let userSettings = JSON.parse(localStorage.getItem('nearme_settings') || '{"darkMode":false,"gpsEnabled":true}');
let bookmarkedItems = JSON.parse(localStorage.getItem('nearme_bookmarks') || '[]');

// Creating a page object to store all the pages id that are used in the app
    const pages = {
    welcome: document.getElementById('welcomePage'),
    login: document.getElementById('loginPage'),
    signup: document.getElementById('signupPage'),
    forgot: document.getElementById('forgotPage'),
    reset: document.getElementById('resetPage'),
    main: document.getElementById('main')
};

// Applying dark mode on all the pages when a user selects darkmode in the settings section
if (userSettings.darkMode) {
    document.body.classList.add('dark-mode');
}

//The showing page function which hides all other pages by default and show only the selected page
function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.add('hidden'));
    if (pageName === 'main') {
        pages[pageName].style.display = 'block';


    } else {
        pages[pageName].classList.remove('hidden');

    }
}
// function to show error messages incase of any issues
function showError(message) {
    console.error('❌ ERROR:', message);
    alert(message);
}

// Get Started button which directs the user to the login page
document.getElementById('starting').addEventListener('click', () => {
    showPage('login');
});

// When a user click on the sign up button, redirect them to the sign up page where there is a signup form
document.getElementById('signUp').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('signup');
});
// When a user click on the login button, redirect them to the login page where there is a login form
document.getElementById('logIn').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('login');
});
// When a user click on the forgot link, redirect them to the forgot password page where they can reset their password
document.getElementById('forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('forgot');
});
// When a user click on the back to login link, redirect them to the login page where they can login to their account
document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('login');
});
// Fetching all the section elements from the main page by their ids
const homeSection = document.getElementById('home-section');
const nearbySection = document.getElementById('nearby-section');

const eventsSection = document.getElementById('events-section');
const profileSection = document.getElementById('profile-section');
const bookmarksSection = document.getElementById('bookmarks-section');




//Getting the last category item from the categories array returned by the Places API
function getLastCategoryPath(category) {
  if (!category) return 'No category';
  
  // If it's a string with dots, get the first part
  if (typeof category === 'string') {
    return category.split('.')[0];
  }
  
  // If it's an array, get the first part of each item and remove duplicates
  if (Array.isArray(category)) {
    const uniqueCategories = [...new Set(category.map(cat => {
      if (typeof cat === 'string') {
        return cat.split('.')[0];
      }
      return cat;
    }))];
    return uniqueCategories.join(', ');
  }
  
  return category;
}
//Generating avatars for the profile section customized for each user based on their name
function generateAvatar(name, size = 50) {
    //If there is no name return nothing
    if (!name) return null;
    //Creating a canvas element for drawing shapes and images
const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');

    // Generate a random color based on the name

    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

const hue = hash % 360;

    // Draw circle with random color
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
ctx.beginPath();
ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = `${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), size/2, size/2);

    return canvas.toDataURL();
}

function resetAllForms() {
    // Reset all forms 
    const forms = document.querySelectorAll('form');
forms.forEach(form => form.reset());

    // Clear input fields that might not be in forms
const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {

        if (input.type === 'text' || input.type === 'email' || input.type === 'password') {
            input.value = '';
        }
    });

    // Reset global variables
    userProfile = { name: '', email: '' };
}

// Bookmark function for saving events and places that a user likes

function toggleBookmark(item, type) {
    const bookmarkId = `${type}_${item.name}_${item.date || ''}`;
    const existingIndex = bookmarkedItems.findIndex(b => b.id === bookmarkId);
    // Removing a bookmark card if it already exists in the bookmarkedItems array
    if (existingIndex > -1) {
        bookmarkedItems.splice(existingIndex, 1);
        console.log('🗑️ Removed bookmark:', item.name);

    } 
    //Else add it to the bookmarkedItems array
    else {
        bookmarkedItems.push({
            id: bookmarkId,
            type: type,
            data: item,
            bookmarkedAt: new Date().toISOString()
        });
        console.log('⭐ Added bookmark:', item.name);
    }
//Save the bookmarkedItems array to the localStorage

    localStorage.setItem('nearme_bookmarks', JSON.stringify(bookmarkedItems));


// Update the UI with current places, events, and bookmarks

if (window.currentPlaces) displayPlaces(window.currentPlaces);
if (window.currentEvents) displayEvents(window.currentEvents);
displayBookmarks();

    // // Show item details if the modal is visible

const modal = document.getElementById('detailBox');
if (modal && !modal.classList.contains('hidden')) {
        showItemDetails(item, type);
    }
}
// Giving each book marked card an id
function isBookmarked(item, type) {
    const bookmarkId = `${type}_${item.name}_${item.date || ''}`;
    return bookmarkedItems.some(b => b.id === bookmarkId);
}
// display Book marked cards function 
function displayBookmarks() {
    const bookmarksContainer = document.querySelector('#bookmarks-section > div');

    if (!bookmarksContainer) return;

    if (bookmarkedItems.length === 0) {
        bookmarksContainer.innerHTML = '<div style="background: #f5f5f5; padding: 40px; border-radius: 10px; text-align: center;"><p>No bookmarks yet. Start exploring and save your favorite places!</p></div>';
        return;
    }

    bookmarksContainer.innerHTML = '<h3 style="color: rgb(30, 45, 100); margin: 20px 0;">Your Bookmarks</h3>';

    const bookmarksList = document.createElement('ul');
    bookmarksList.style.listStyle = 'none';
    bookmarksList.style.padding = '0';

    bookmarkedItems.forEach(bookmark => {
        const item = bookmark.data;
        const listItem = document.createElement('li');
        listItem.style.cssText = 'background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid rgb(30, 45, 100); position: relative; cursor: pointer;';

        // Store item data in HTML attributes for later use

        listItem.setAttribute('data-item', JSON.stringify(item));
        listItem.setAttribute('data-type', bookmark.type);

        // Get the first category
        const category = getLastCategoryPath(item.categories || item.category);
        // If the book marked card is a place apply these styles to it
        if (bookmark.type === 'place') {
            listItem.innerHTML = `
            <div class="card-container" style="display: flex; flex-direction: column; width: 100%;">
  ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 8px;">` : ''}
     <div class="card-content" style="padding: 10px 0;">
         <div style="display: flex; justify-content: space-between; align-items: flex-start;">
 <h4 style="color: rgb(30, 45, 100); margin: 0 0 8px 0;">${item.name}</h4>
      <button class="bookmark-btn" data-action="remove" style="background: #ff6b6b; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 16px;" title="Remove bookmark">🗑️</button>
                </div>
    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📍 ${item.address || 'No address'}</p>
        <p style="color: #666; font-size: 0.9em; margin: 4px 0;">🏷️ ${category}</p>
     <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📏 ${item.distance ? Math.round(item.distance) + 'm' : 'N/A'} away</p>
</div>
</div>
            `;
//else if it's an event apply these styles instead
        } else {
            listItem.innerHTML = `
     <div class="card-container" style="display: flex; flex-direction: column; width: 100%;">
     ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 8px;">` : ''}
            <div class="card-content" style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
     <h4 style="color: rgb(30, 45, 100); margin: 0 0 8px 0;">${item.name}</h4>
<button class="bookmark-btn" data-action="remove" style="background: #ff6b6b; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 16px;" title="Remove bookmark">🗑️</button>
                </div>
            <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📅 ${item.date}${item.time ? ` at ${item.time}` : ''}</p>
        <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📍 ${item.venue}</p>
    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">🏷️ ${getLastCategoryPath(item.category || 'Event')}</p>
            </div>
</div>
            `;
        }


        const bookmarkBtn = listItem.querySelector('.bookmark-btn');

        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(item, bookmark.type);
        });

        // Make the entire card clickable except for the bookmark button
        listItem.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-btn')) return;
            showItemDetails(item, bookmark.type);
        });

        bookmarksList.appendChild(listItem);
    });

    bookmarksContainer.appendChild(bookmarksList);
}


function showItemDetails(item, type) {

    const modal = document.getElementById('detailBox');
    const modalContent = document.getElementById('alert-boxDetailContent');

    if (!modal || !modalContent) {
        console.error('Detail modal elements not found');
        return;
    }

    const isBookmarkedItem = isBookmarked(item, type);

    // Get the first category 
    const category = getLastCategoryPath(item.categories || item.category);
// Removing a book mark if it's a place
    if (type === 'place') {
        modalContent.innerHTML = `
         <div style="text-align: left;">
 <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
         <h2 style="color: rgb(30, 45, 100); margin: 0;">${item.name}</h2>
                  <button id="detail-bookmark-btn"
       style="background: ${isBookmarkedItem ? '#ff6b6b' : 'rgb(30, 45, 100)'}; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-size: 20px;"
                    title="${isBookmarkedItem ? 'Remove bookmark' : 'Add bookmark'}">
                     ${isBookmarkedItem ? '🗑️' : '⭐'}
                    </button>
                </div>

                 ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; border-radius: 10px; margin-bottom: 15px;">` : ''}

            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 8px 0;"><strong>📍 Address:</strong> ${item.address || 'No address available'}</p>
     <p style="margin: 8px 0;"><strong>🏷️ Category:</strong> ${category}</p>
                    <p style="margin: 8px 0;"><strong>📏 Distance:</strong> ${item.distance ? Math.round(item.distance) + ' meters' : 'N/A'}</p>
                     ${item.phone ? `<p style="margin: 8px 0;"><strong>📞 Phone:</strong> ${item.phone}</p>` : ''}
         ${item.website ? `<p style="margin: 8px 0;"><strong>🌐 Website:</strong> <a href="${item.website}" target="_blank">${item.website}</a></p>` : ''}
  ${item.openingHours ? `<p style="margin: 8px 0;"><strong>🕐 Hours:</strong> ${item.openingHours}</p>` : ''}
                    <p style="margin: 8px 0;"><strong>🗺️ Source:</strong> ${item.source}</p>
                </div>

                <button id="open-map-btn"
                style="width: 100%; padding: 12px; background: rgb(30, 45, 100); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 10px;">
                🗺️ Open in Map
                </button>
            </div>
        `;
        // Removing a book mark if it's an event
    } else {
        modalContent.innerHTML = `
     <div style="text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
      <h2 style="color: rgb(30, 45, 100); margin: 0;">${item.name}</h2>
                    <button id="detail-bookmark-btn"
                    style="background: ${isBookmarkedItem ? '#ff6b6b' : 'rgb(30, 45, 100)'}; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-size: 20px;"
         title="${isBookmarkedItem ? 'Remove bookmark' : 'Add bookmark'}">
                     ${isBookmarkedItem ? '🗑️' : '⭐'}
                    </button>
                </div>

                 ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; border-radius: 10px; margin-bottom: 15px;">` : ''}

     <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
               <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${item.date}${item.time ? ` at ${item.time}` : ''}</p>
    <p style="margin: 8px 0;"><strong>📍 Venue:</strong> ${item.venue}</p>
                     ${item.address ? `<p style="margin: 8px 0;"><strong>🗺️ Address:</strong> ${item.address}</p>` : ''}
<p style="margin: 8px 0;"><strong>🏷️ Category:</strong> ${getLastCategoryPath(item.category || 'Event')}</p>
                     ${item.description ? `<p style="margin: 8px 0;"><strong>📝 Description:</strong> ${item.description}</p>` : ''}
                     ${item.distance ? `<p style="margin: 8px 0;"><strong>📏 Distance:</strong> ${Math.round(item.distance)}m from you</p>` : ''}
                    <p style="margin: 8px 0;"><strong>🎫 Source:</strong> ${item.source}</p>
                </div>

                 ${item.url ? `<a href="${item.url}" target="_blank" style="display: block; width: 100%; padding: 12px; background: rgb(30, 45, 100); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; text-align: center; text-decoration: none; margin-bottom: 10px;">🎟️ Get Tickets</a>` : ''}

                <button id="open-map-btn"
                style="width: 100%; padding: 12px; background: rgb(30, 45, 100); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
                🗺️ Open in Map
                </button>
            </div>
        `;
    }

   
    const bookmarkBtn = document.getElementById('detail-bookmark-btn');
    const mapBtn = document.getElementById('open-map-btn');

    bookmarkBtn.addEventListener('click', () => {
        toggleBookmark(item, type);
    });

    mapBtn.addEventListener('click', () => {
        openInMap(type, item);
    });

    modal.classList.remove('hidden');
}

function closeDetailModal() {
    
    const modal = document.getElementById('detailBox');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Open a new window with map and directions
function openInMap(type, item) {
    // Close the detail modal
    closeDetailModal();

    // Create a new window with a map
    const mapWindow = window.open('', '_blank');

    // Write the HTML for the map page 
    mapWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Map - ${item.name}</title>
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css" rel="stylesheet">
        <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; }
            .map-controls { position: absolute; top: 10px; right: 10px; z-index: 10; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
            .map-controls h3 { margin-top: 0; color: rgb(30, 45, 100); }
            .map-controls p { margin: 5px 0; }
            .directions-btn { background: rgb(30, 45, 100); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 10px; width: 100%; }
            .loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.2); text-align: center; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid rgb(30, 45, 100); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div class="map-controls">
            <h3>${item.name}</h3>
            <p><strong>Type:</strong> ${type === 'place' ? 'Place' : 'Event'}</p>
            ${type === 'place' ? 
                `<p><strong>Address:</strong> ${item.address || 'No address'}</p>` : 
                `<p><strong>Venue:</strong> ${item.venue}</p>
                 <p><strong>Date:</strong> ${item.date}${item.time ? ` at ${item.time}` : ''}</p>`
            }
            <button id="get-directions" class="directions-btn">Get Directions</button>
        </div>
        <div id="loading" class="loading">
            <div class="loader"></div>
            <p>Loading map...</p>
        </div>

        <script>
            // Set Mapbox access token
            mapboxgl.accessToken = '${API_KEYs.mapboxKey}';
            
            // Initialize variables
            let map;
            let destinationCoords;
            let userCoords = [${userLocation.lon}, ${userLocation.lat}];
            
            // Initialize the map
            function initMap() {
                map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: userCoords,
                    zoom: 12
                });
                
                // Add a marker for the user's location
                new mapboxgl.Marker()
                    .setLngLat(userCoords)
                    .setPopup(new mapboxgl.Popup().setHTML('Your Location'))
                    .addTo(map);
                
                // Get coordinates for the destination
                getDestinationCoords();
            }
            
            // Get coordinates for the destination
            function getDestinationCoords() {
                ${type === 'place' && item.lat && item.lon ? 
                    // If we have coordinates for a place, use them directly
                    `
                    destinationCoords = [${item.lon}, ${item.lat}];
                    addDestinationMarker();
                    ` :
                    // Otherwise, geocode the address
                    `
                    const searchQuery = '${type === 'place' ? item.address || item.name : item.venue || item.name}';
                    
                    fetch(\`https://nominatim.openstreetmap.org/search?q=\${encodeURIComponent(searchQuery)}&format=json&limit=1\`, {
                        headers: {
                            'User-Agent': 'NearMe App'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lon = parseFloat(data[0].lon);
                            destinationCoords = [lon, lat];
                            addDestinationMarker();
                        } else {
                            document.getElementById('loading').innerHTML = '<p>Could not find location for this place.</p>';
                        }
                    })
                    .catch(error => {
                        console.error('Geocoding error:', error);
                        document.getElementById('loading').innerHTML = '<p>Error finding location.</p>';
                    });
                    `
                }
            }
            
            // Add a marker for the destination
            function addDestinationMarker() {
                // Hide loading indicator
                document.getElementById('loading').style.display = 'none';
                
                // Add a marker for the destination
                new mapboxgl.Marker({color: '#ff6b6b'})
                    .setLngLat(destinationCoords)
                    .setPopup(new mapboxgl.Popup().setHTML('<strong>${item.name}</strong><br>${type === 'place' ? item.address || '' : item.venue || ''}'))
                    .addTo(map);
                
                // Fit map to show both markers
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend(userCoords);
                bounds.extend(destinationCoords);
                map.fitBounds(bounds, {padding: 50});
            }
            
            // Get directions
            function getDirections() {
                if (!destinationCoords) {
                    alert('Destination location not available');
                    return;
                }
                
                // Create a directions request
                const directionsUrl = \`https://api.mapbox.com/directions/v5/mapbox/driving/\${userCoords[0]},\${userCoords[1]};\${destinationCoords[0]},\${destinationCoords[1]}?access_token=\${mapboxgl.accessToken}&geometries=geojson&steps=true\`;
                
                fetch(directionsUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.routes && data.routes.length > 0) {
                            const route = data.routes[0];
                            const geojson = {
                                type: 'Feature',
                                properties: {},
                                geometry: route.geometry
                            };
                            
                            // If the route layer already exists, remove it
                            if (map.getLayer('route')) {
                                map.removeLayer('route');
                                map.removeSource('route');
                            }
                            
                            // Add the route to the map
                            map.addLayer({
                                id: 'route',
                                type: 'line',
                                source: {
                                    type: 'geojson',
                                    data: geojson
                                },
                                layout: {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                paint: {
                                    'line-color': '#3887be',
                                    'line-width': 5,
                                    'line-opacity': 0.75
                                }
                            });
                            
                            // Fit map to show the route
                            const coordinates = geojson.geometry.coordinates;
                            const bounds = new mapboxgl.LngLatBounds();
                            coordinates.forEach(coord => bounds.extend(coord));
                            map.fitBounds(bounds, {padding: 50});
                            
                            // Update button text
                            document.getElementById('get-directions').textContent = 'Show Route';
                        } else {
                            alert('Could not get directions');
                        }
                    })
                    .catch(error => {
                        console.error('Directions error:', error);
                        alert('Error getting directions');
                    });
            }
            
            // Add event listener for directions button
            document.getElementById('get-directions').addEventListener('click', getDirections);
            
            // Initialize the map when the page loads
            window.onload = initMap;
        </script>
    </body>
    </html>
    `);


    mapWindow.document.close();
}

window.toggleBookmark = toggleBookmark;
window.showItemDetails = showItemDetails;
window.closeDetailModal = closeDetailModal;
window.openInMap = openInMap;


// Displaying the profile function
function displayProfile() {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const avatarImg = document.getElementById('profile-avatar');

    // Reload userProfile from localStorage to ensure it's up to date
    userProfile = JSON.parse(localStorage.getItem('nearme_profile') || '{"name":"","email":""}');

    if (profileName) profileName.textContent = userProfile.name || 'No name set';
    if (profileEmail) profileEmail.textContent = userProfile.email || 'No email set';

    // Generate avatar if name is available
    if (avatarImg && userProfile.name) {
        avatarImg.src = generateAvatar(userProfile.name, 100);
    }
}
// Adding an event Listener to the edit profile button to be able to edit your name and email address
document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    
    document.getElementById('editProfileBox').classList.remove('hidden');
    document.getElementById('edit-name').value = userProfile.name || '';
    document.getElementById('edit-email').value = userProfile.email || '';
});
//Canceling the changes if the user clicks on cancel❌
document.getElementById('cancel-edit')?.addEventListener('click', () => {

    document.getElementById('editProfileBox').classList.add('hidden');
});
// Save the new changes and store their values
document.getElementById('save-profile')?.addEventListener('click', () => {
    const newName = document.getElementById('edit-name').value.trim();
    const newEmail = document.getElementById('edit-email').value.trim();
    // name and email patterns for validation and their logic
    const namePattern = /^[a-zA-Z][a-zA-Z\s]{1,}$/;
    const emailPattern = /^[A-Za-z0-9]+(?:[._%+-]?[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (newName && !namePattern.test(newName)) {
        alert('❌ Name must contain only letters and spaces');
        return;
    }

    if (newEmail && !emailPattern.test(newEmail)) {
        alert('❌ Invalid email format');
        return;
    }

    if (newName) userProfile.name = newName;
    if (newEmail) userProfile.email = newEmail;

    // Update avatar if name changed
    const avatarImg = document.getElementById('profile-avatar');
    if (avatarImg && newName) {
        avatarImg.src = generateAvatar(newName, 100);
    }

    localStorage.setItem('nearme_profile', JSON.stringify(userProfile));
    displayProfile();
    document.getElementById('editProfileBox').classList.add('hidden');
    alert('✅ Profile updated successfully!');
});

// DELETE ACCOUNT 
document.getElementById("delete-account-btn").addEventListener("click", () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This cannot be undone.");

    if (!confirmDelete) return;

    // Remove ALL user-related data
    localStorage.removeItem("nearme_profile");
    localStorage.removeItem("nearme_credentials");
    localStorage.removeItem("nearme_bookmarks");
    localStorage.removeItem("nearme_settings");
    localStorage.removeItem("nearme_loggedInUser");

    // Reload the app so it goes back to welcome page
    window.location.reload();
});


// SETTINGS SECTION


document.getElementById('settings-btn')?.addEventListener('click', () => {

    document.getElementById('settingsBox').classList.remove('hidden');
    // if the darkmode is checked then change to darkmode 
    document.getElementById('dark-mode-toggle').checked = userSettings.darkMode;
    //if gps is checked then use the user's location
    document.getElementById('gps-toggle').checked = userSettings.gpsEnabled;
});
// close settings button to exit the settings section
document.getElementById('close-settings')?.addEventListener('click', () => {
    
    document.getElementById('settingsBox').classList.add('hidden');
});
// dark mode changes
document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
    userSettings.darkMode = e.target.checked;
    localStorage.setItem('nearme_settings', JSON.stringify(userSettings));

    if (userSettings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});
// gps changes
document.getElementById('gps-toggle')?.addEventListener('change', (e) => {
    userSettings.gpsEnabled = e.target.checked;
    localStorage.setItem('nearme_settings', JSON.stringify(userSettings));
});

document.getElementById('change-location-btn')?.addEventListener('click', () => {
    
    document.getElementById('settingsBox').classList.add('hidden');
    document.getElementById('cityInputBox').classList.remove('hidden');
});

// Form validations 

// Add password visibility toggle 
function addPasswordToggles() {
    // Find all password inputs
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    passwordInputs.forEach(input => {
        // Create container for input and toggle
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.width = '100%';

        // Move the input into the container
        input.parentNode.insertBefore(container, input);
        container.appendChild(input);

        // Make the input take up the full width of the container
        input.style.width = '100%';
        input.style.paddingRight = '40px'; // Space for the toggle button

        // Create the toggle button
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.innerHTML = '👁️';
        toggle.style.position = 'absolute';
        toggle.style.right = '10px';
        toggle.style.top = '50%';
        toggle.style.transform = 'translateY(-50%)';
        toggle.style.background = 'none';
        toggle.style.border = 'none';
        toggle.style.cursor = 'pointer';
        toggle.style.fontSize = '16px';

        // Add click event to toggle visibility
        toggle.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.innerHTML = '👁️‍🗨️';
            } else {
                input.type = 'password';
                toggle.innerHTML = '👁️';
            }
        });

        // Add the toggle to the container
        container.appendChild(toggle);
    });
}

// Call this function when the page is loads
addPasswordToggles();
// login form validation
document.getElementById('form-1').addEventListener('submit', (e) => {
        e.preventDefault();
    const emailPattern = /^[A-Za-z0-9]+(?:[._%+-]?[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email) {
        alert('❌ Email is required');
        return;
    }

    if (!emailPattern.test(email)) {
        alert('❌ Invalid email format. Example: user@example.com');
        return;
    }

    if (!password) {
        alert('❌ Password is required');
        return;
    }

    if (!passwordPattern.test(password)) {
        if (password.length < 8) {
            alert('❌ Password must be at least 8 characters long');
        } else if (!/[a-z]/.test(password)) {
            alert('❌ Password must contain at least one lowercase letter');
        } else if (!/[A-Z]/.test(password)) {
            alert('❌ Password must contain at least one uppercase letter');
        } else if (!/\d/.test(password)) {
            alert('❌ Password must contain at least one number');
        } else if (!/[@$!%*?&]/.test(password)) {
            alert('❌ Password must contain at least one special character (@$!%*?&)');
        }
        return;
    }
    const userExists = userCredentials.find(u => u.email === email);
  
    if (!userExists) {
        alert('👋 Oops! Looks like you don\'t have an account. Try signing up first!');
        //  redirect to signup page
        showPage('signup');
        return;
    }
    // if the email or password doesn't match show that alert message
    const user = userCredentials.find(u => u.email === email && u.password === password);
    if (!user) {
        alert('❌ Invalid email or password');
        return;
    }

    // Update user profile with the name from credentials
    userProfile = { name: user.name, email: user.email };

        localStorage.setItem('nearme_profile', JSON.stringify(userProfile));
    localStorage.setItem('nearme_isLoggedIn', 'true');

    // Redirect to main page without confirmation after a user has logged in successfully
    pages.login.classList.add('hidden');
    pages.main.classList.remove('hidden');
    pages.main.style.display = 'block';

        homeSection.style.display = 'block';
    nearbySection.style.display = 'none';

        eventsSection.style.display = 'none';
    profileSection.style.display = 'none';
    bookmarksSection.style.display = 'none';

    displayProfile();

    
    // if the user has enabled gps remove both the location box and the city input box
    if (userSettings.gpsEnabled) {
        document.getElementById('locationBox').classList.remove('hidden');
    } else {
        document.getElementById('cityInputBox').classList.remove('hidden');
    }
});
// sign up form validation
document.getElementById('form-2').addEventListener('submit', (e) => {
    // prevent submission until all of these patterns are fullfilled
    e.preventDefault();
    const namePattern = /^[a-zA-Z][a-zA-Z]+(?:\s[a-zA-Z][a-zA-Z]+)+$/;
    const emailPattern = /^[A-Za-z0-9]+(?:[._%+-]?[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


    const name = document.getElementById('signup-username').value.trim();
const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!name) {
        alert('❌ Full name is required');
        return;
    }

    if (!namePattern.test(name)) {
        alert('❌ Please enter a valid full name (first and last name, letters only)');
        return;
    }

    if (!email) {
        alert('❌ Email is required');
        return;
    }

    if (!emailPattern.test(email)) {
        alert('❌ Invalid email format. Example: user@example.com');
        return;
    }

    if (userCredentials.find(u => u.email === email)) {
        alert('❌ This email is already registered');
        return;
    }

    if (!password) {
        alert('❌ Password is required');
        return;
    }

    if (!passwordPattern.test(password)) {
        if (password.length < 8) {
            alert('❌ Password must be at least 8 characters long');
        } else if (!/[a-z]/.test(password)) {
            alert('❌ Password must contain at least one lowercase letter');
        } else if (!/[A-Z]/.test(password)) {
            alert('❌ Password must contain at least one uppercase letter');
        } else if (!/\d/.test(password)) {
            alert('❌ Password must contain at least one number');
        } else if (!/[@$!%*?&]/.test(password)) {
            alert('❌ Password must contain at least one special character (@$!%*?&)');
        }
        return;
    }

    userCredentials.push({ name, email, password });
    localStorage.setItem('nearme_credentials', JSON.stringify(userCredentials));

    alert('✅ Account created successfully! Please sign in.');
    document.getElementById('form-2').reset();
    // Redirect to the login
    showPage('login');
});
//Forgot password form validation
document.getElementById('form-3').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const emailPattern = /^[A-Za-z0-9]+(?:[._%+-]?[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!email) {
        alert('❌ Email is required');
        return;
    }

    if (!emailPattern.test(email)) {
        alert('❌ Invalid email format');
        return;
    }

    alert('✅ Password reset link sent to your email!');
    showPage('reset');
});
// Reset password validation
document.getElementById('form-4').addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    const email = document.getElementById('reset-email').value.trim();

    if (!email) {
        alert('❌ Email is required');
        return;
    }

    if (!newPassword) {
        alert('❌ New password is required');
        return;
    }

    if (!passwordPattern.test(newPassword)) {
        if (newPassword.length < 8) {
            alert('❌ Password must be at least 8 characters long');
        } else if (!/[a-z]/.test(newPassword)) {
            alert('❌ Password must contain at least one lowercase letter');
        } else if (!/[A-Z]/.test(newPassword)) {
            alert('❌ Password must contain at least one uppercase letter');
        } else if (!/\d/.test(newPassword)) {
            alert('❌ Password must contain at least one number');
        } else if (!/[@$!%*?&]/.test(newPassword)) {
            alert('❌ Password must contain at least one special character (@$!%*?&)');
        }
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }

    // Find the user with this email and update their password
    const userIndex = userCredentials.findIndex(u => u.email === email);
    if (userIndex !== -1) {
        userCredentials[userIndex].password = newPassword;
        localStorage.setItem('nearme_credentials', JSON.stringify(userCredentials));

        // Updated ID to match HTML
        document.getElementById('resetSuccess').classList.remove('hidden');
        setTimeout(() => {
            showPage('login');
        }, 2000);
    } else {
        alert('❌ Email not found in our records');
    }
});

// log out button 
document.getElementById('logOut').addEventListener('click', () => {
    const confirmLogout = confirm('⚠️ Are you sure you want to log out?');
    if (!confirmLogout) return;
    // Reset all forms and input fields
    resetAllForms();
    localStorage.removeItem('nearme_isLoggedIn');

    // Redirect to landing page without confirmation
    pages.main.style.display = 'none';
    showPage('welcome');
});

// navigation section
const home = document.getElementById('home');
const nearby = document.getElementById('nearby');

const events = document.getElementById('events');

const bookmarks = document.getElementById('bookmarks');
const profile = document.getElementById('profile');


function updateActiveNav(activeButton) {
    
    [home, nearby, events, bookmarks, profile].forEach(btn => {
        btn.classList.remove('active');
    });

    // Adding active class to the current button so that the user can see where they are
    activeButton.classList.add('active');
}
//If I click on the home button show the home section and hide the other sections
        home.addEventListener('click', () => {
homeSection.style.display = 'block';
    nearbySection.style.display = 'none';

    eventsSection.style.display = 'none';
    profileSection.style.display = 'none';
    bookmarksSection.style.display = 'none';
    updateActiveNav(home);
});
//If I click on the nearby button show the  nearby section and hide the other sections
nearby.addEventListener('click', () => {
    homeSection.style.display = 'none';
    nearbySection.style.display = 'block';

    eventsSection.style.display = 'none';
    profileSection.style.display = 'none';

    bookmarksSection.style.display = 'none';
    updateActiveNav(nearby);

    // Initialize search and filter for nearby places
    initializeNearbySearch();
});
//If I click on the events button show the events section and hide the other sections
events.addEventListener('click', () => {
    homeSection.style.display = 'none';
    nearbySection.style.display = 'none';

    eventsSection.style.display = 'block';
    profileSection.style.display = 'none';

    bookmarksSection.style.display = 'none';
    updateActiveNav(events);

    // Initialize search and filter for events
    initializeEventsSearch();
});
//If I click on the profile button show the profile section and hide the other sections
profile.addEventListener('click', () => {
    homeSection.style.display = 'none';
    nearbySection.style.display = 'none';
    eventsSection.style.display = 'none';

    profileSection.style.display = 'block';
    bookmarksSection.style.display = 'none';
    updateActiveNav(profile);
    displayProfile();
});
//If I click on the Book marks button show the book mark section and hide the other sections
bookmarks.addEventListener('click', () => {
    homeSection.style.display = 'none';
    nearbySection.style.display = 'none';
    eventsSection.style.display = 'none';
    profileSection.style.display = 'none';
    bookmarksSection.style.display = 'block';
    updateActiveNav(bookmarks);
    displayBookmarks();
});

// Set home section as active by default
updateActiveNav(home);
homeSection.style.display = 'block';


// SEARCH AND FILTER FUNCTIONALITY

function initializeNearbySearch() {
    // Check if search controls already exist
    if (document.getElementById('nearby-search-container')) return;

    // Create search container
    const searchContainer = document.createElement('div');
searchContainer.id = 'nearby-search-container';
    searchContainer.style.cssText = 'margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px;';

 // Create search input
const searchInput = document.createElement('input');
    searchInput.id = 'nearby-search-input';

    searchInput.type = 'text';
    searchInput.placeholder = 'Search places...';

searchInput.style.cssText = 'width: 70%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-right: 10px;';

           // Create search button
    const searchButton = document.createElement('button');
searchButton.id = 'nearby-search-button';
    searchButton.textContent = 'Search';

    searchButton.style.cssText = 'padding: 10px 15px; background: rgb(30, 45, 100); color: white; border: none; border-radius: 5px; cursor: pointer;';

// Create category filter
    const categoryFilter = document.createElement('select');
    categoryFilter.id = 'nearby-category-filter';

    categoryFilter.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px;';

// Add default option
    const defaultOption = document.createElement('option');

    defaultOption.value = 'all';

    defaultOption.textContent = 'All Categories';

    categoryFilter.appendChild(defaultOption);

    // Add elements to container
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    searchContainer.appendChild(categoryFilter);

    // Insert search container at the beginning of nearby section
    const nearbySection = document.getElementById('nearby-section');
    nearbySection.insertBefore(searchContainer, nearbySection.firstChild.nextSibling);

    // Add event listeners
    searchButton.addEventListener('click', () => {
        filterNearbyPlaces();
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterNearbyPlaces();
        }
    });

    categoryFilter.addEventListener('change', () => {
        filterNearbyPlaces();
    });

    // Fill category filter with place categories returned from the Place API

    if (window.currentPlaces && window.currentPlaces.length > 0) {
        const categories = new Set();

        window.currentPlaces.forEach(place => {
            if (Array.isArray(place.categories)) {
                place.categories.forEach(cat => {
                    const cleanCat = getLastCategoryPath(cat);
                    categories.add(cleanCat);
                });
            } else if (place.categories) {
                const cleanCat = getLastCategoryPath(place.categories);
                categories.add(cleanCat);
            }
        });

        // Sort categories alphabetically
        const sortedCategories = Array.from(categories).sort();

        // Add categories to filter

        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;

            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
}

function initializeEventsSearch() {
    // Check if search controls already exist
if (document.getElementById('events-search-container')) return;

    // Create search container
    const searchContainer = document.createElement('div');

    searchContainer.id = 'events-search-container';

    searchContainer.style.cssText = 'margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px;';

    // Create search input
    const searchInput = document.createElement('input');
 searchInput.id = 'events-search-input';
    searchInput.type = 'text';
searchInput.placeholder = 'Search events...';

    searchInput.style.cssText = 'width: 70%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-right: 10px;';

// Create search button
    const searchButton = document.createElement('button');
searchButton.id = 'events-search-button';
searchButton.textContent = 'Search';
    searchButton.style.cssText = 'padding: 10px 15px; background: rgb(30, 45, 100); color: white; border: none; border-radius: 5px; cursor: pointer;';

    // Create category filter
    const categoryFilter = document.createElement('select');
    categoryFilter.id = 'events-category-filter';

    categoryFilter.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px;';

    // Add default option
    const defaultOption = document.createElement('option');
defaultOption.value = 'all';
    defaultOption.textContent = 'All Categories';
    categoryFilter.appendChild(defaultOption);

    // Add elements to container
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    searchContainer.appendChild(categoryFilter);

    // Insert search container at the beginning of events section
    const eventsSection = document.getElementById('events-section');
    eventsSection.insertBefore(searchContainer, eventsSection.firstChild.nextSibling);

    // Add event listeners
    searchButton.addEventListener('click', () => {
        filterEvents();
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterEvents();
        }
    });

    categoryFilter.addEventListener('change', () => {
        filterEvents();
    });

    // Fill category filter with events categories returned from PredictHQ API

    if (window.currentEvents && window.currentEvents.length > 0) {
        const categories = new Set();

        window.currentEvents.forEach(event => {
            if (event.category) {
                const cleanCat = getLastCategoryPath(event.category);
                categories.add(cleanCat);
            }
        });

        // Sort categories alphabetically
        const sortedCategories = Array.from(categories).sort();

        // Add categories to filter
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
}

function filterNearbyPlaces() {
    const searchTerm = document.getElementById('nearby-search-input').value.toLowerCase();
    const selectedCategory = document.getElementById('nearby-category-filter').value;

    if (!window.currentPlaces) return;



    let filteredPlaces = window.currentPlaces;

    // Filter by search term
    if (searchTerm) {
        filteredPlaces = filteredPlaces.filter(place => {
            return place.name.toLowerCase().includes(searchTerm) ||
            (place.address && place.address.toLowerCase().includes(searchTerm));
        });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
        filteredPlaces = filteredPlaces.filter(place => {

            if (Array.isArray(place.categories)) {
                return place.categories.some(cat => getLastCategoryPath(cat) === selectedCategory);

            } else {
                return getLastCategoryPath(place.categories) === selectedCategory;
            }
        });
    }

    displayPlaces(filteredPlaces);
}

function filterEvents() {
    const searchTerm = document.getElementById('events-search-input').value.toLowerCase();
    const selectedCategory = document.getElementById('events-category-filter').value;

    if (!window.currentEvents) return;

    let filteredEvents = window.currentEvents;

    // Filter by search term
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => {
            return event.name.toLowerCase().includes(searchTerm) ||
            (event.venue && event.venue.toLowerCase().includes(searchTerm));
        });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
        filteredEvents = filteredEvents.filter(event => {
            return getLastCategoryPath(event.category) === selectedCategory;
        });
    }

    displayEvents(filteredEvents);
}

// Location handling

    document.getElementById('allowBtn').addEventListener('click', allowLocation);
document.getElementById('denyBtn').addEventListener('click', manualCityInput);

document.getElementById('submitCity').addEventListener('click', submitCity);
// user location function using built-in geolocation api
function allowLocation() {
    
    document.getElementById('locationBox').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            userLocation.lat = lat;
            userLocation.lon = lon;
            try {
                await loadLocationData(lat, lon);
            } catch (error) {
                
                document.getElementById('loading').classList.add('hidden');
                showError('Failed to load location data');
                console.error('Location data error:', error);
            }
        }, () => {
            
            document.getElementById('loading').classList.add('hidden');
            showError('Location access denied. Please enter your city manually.');
            setTimeout(() => {
                document.getElementById('cityInputBox').classList.remove('hidden');
            }, 2000);
        });
    } else {
        
        document.getElementById('loading').classList.add('hidden');
        showError('Geolocation not supported by your browser');
        document.getElementById('cityInputBox').classList.remove('hidden');
    }
}
// City input incase the user denys the use of their location or wants to explore other cities
function manualCityInput() {
    
    document.getElementById('locationBox').classList.add('hidden');
    document.getElementById('cityInputBox').classList.remove('hidden');
}

async function submitCity() {
    const cityName = document.getElementById('cityInput').value.trim();
    console.log("📍 submitCity() CALLED with:", cityName);

    if (!cityName) {
        showError('Please enter a city name');
        return;
    }

    
    document.getElementById('cityInputBox').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');

    try {
        console.log("🌍 Fetching city coordinates from Nominatim…");
        // Using OpenStreet Map API to get city coordinates
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
        );

        console.log("🔎 Nominatim status:", response.status);

        const data = await response.json();
        console.log("🗺️ Nominatim response:", data);

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            console.log("🎯 City resolved to:", lat, lon);

            userLocation.lat = lat;
            userLocation.lon = lon;

            console.log("🌐 Calling loadLocationData(lat, lon)…");
            await loadLocationData(lat, lon);
            // If the city doesn't exist in the database of Openstreet Map show that error
        } else {
            console.log("❌ City not found");
            throw new Error('City not found');
        }
    } catch (err) {
        console.error("💥 submitCity() ERROR:", err);
        
        document.getElementById('loading').classList.add('hidden');
        showError('City not found. Please try again.');
        document.getElementById('cityInputBox').classList.remove('hidden');
    }
}
// Loading location data according to the coordinates of the user or the city entered
async function loadLocationData(lat, lon) {
    try {
        console.log("⚡ Starting loadLocationData for:", lat, lon);

        const weather3 = await Weather(lat, lon);
        displayWeather(weather3);

        const places = await Places(lat, lon);
        window.currentPlaces = places;
        displayPlaces(places);

        const events = await fetchEvents(lat, lon);
        window.currentEvents = events;
        displayEvents(events);

        
        document.getElementById('loading').classList.add('hidden');
        console.log("✅ Location data loaded for:", lat, lon);

    } catch (error) {
        
        document.getElementById('loading').classList.add('hidden');
        showError('Failed to load location-based data');
        console.error("❌ loadLocationData error:", error);
    }
}

// Weather function that fetches the weather of the user's location or the city's entered using OpenWeathermap API
async function Weather(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEYs.openWeatherKey}&units=metric`
    );
    const data = await response.json();
    return {
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
    };
}

function displayWeather(weather3) {
    const weatherDiv = document.getElementById('weather');
    if (!weatherDiv) return;
    weatherDiv.innerHTML = `
        <h3>Current Weather</h3>
        <p>🌡️ Temperature: ${Math.round(weather3.temperature)}°C</p>
        <p>☁️ Condition: ${weather3.description}</p>
        <p>💧 Humidity: ${weather3.humidity}%</p>
        <p>💨 Wind Speed: ${weather3.windSpeed} m/s</p>
    `;
}


// Using the OverPass API to fetch OpenStreetMap data according to the your preference or what you want to display

async function fetchOSMPlaces(lat, lon) {
    try {
        const radius = 5000;

        const query = `
        [out:json][timeout:25];
        (
    node["tourism"](around:${radius},${lat},${lon});

        node["amenity"~"restaurant|cafe|bar|fast_food|museum|library|theatre|cinema"](around:${radius},${lat},${lon});
    node["shop"](around:${radius},${lat},${lon});

        node["leisure"~"park|playground|sports_centre|stadium|swimming_pool"](around:${radius},${lat},${lon});
     way["tourism"](around:${radius},${lat},${lon});
        way["amenity"~"restaurant|cafe|bar|fast_food|museum|library|theatre|cinema"](around:${radius},${lat},${lon});
        way["shop"](around:${radius},${lat},${lon});

    way["leisure"~"park|playground|sports_centre|stadium|swimming_pool"](around:${radius},${lat},${lon});
        );
        out center;
        `;

        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error("❌ OSM Overpass API error:", response.status);
            return [];
        }

        const data = await response.json();

        console.log("🗺️ OSM elements found:", data.elements?.length || 0);

        if (!data.elements || data.elements.length === 0) {
            return [];
        }

        const places = data.elements
            .filter(element => element.tags?.name)
            .map(element => {
                const elementLat = element.lat || element.center?.lat;
                const elementLon = element.lon || element.center?.lon;

                // Calculating the distance
                const distance = calculateDistance(lat, lon, elementLat, elementLon);

                const categories = [];
                if (element.tags.tourism) categories.push(element.tags.tourism);
if (element.tags.amenity) categories.push(element.tags.amenity);
                if (element.tags.shop) categories.push(element.tags.shop);

    if (element.tags.leisure) categories.push(element.tags.leisure);

    const addressParts = [
         element.tags['addr:street'],

     element.tags['addr:housenumber'],
         element.tags['addr:city']
                ].filter(Boolean);

                let imageUrl = null;
                if (element.tags.image) {
                    imageUrl = element.tags.image;
                } else if (element.tags.wikimedia_commons) {
                    //Using Wikimedia Commons to get the images of events and places if available
                    imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${element.tags.wikimedia_commons}`;
                }

                return {
                    name: element.tags.name,
                    address: addressParts.length > 0 ? addressParts.join(', ') : 'Address unavailable',
    categories: categories,
                    distance: distance, // Make sure distance is properly set
                    phone: element.tags.phone || null,

          website: element.tags.website || null,
                    openingHours: element.tags.opening_hours || null,
  lat: elementLat,
             lon: elementLon,
         image: imageUrl,
      source: 'OpenStreetMap'
                };
            })
            .sort((a, b) => a.distance - b.distance);
        return places;

    } catch (error) {
        console.error("❌ OSM fetch failed:", error);
        return [];
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const Radius = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;

    const Δφ = (lat2 - lat1) * Math.PI / 180;

    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +

        Math.cos(φ1) * Math.cos(φ2) *

        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}


async function Places(lat, lon) {
    try {

        let allPlaces = [];

        if (API_KEYs.PlacesAPI) {
            try {
                //Using geoapify API to fetch nearby places
                const url = `https://api.geoapify.com/v2/places?categories=tourism,entertainment,catering,leisure,accommodation,sport&filter=circle:${lon},${lat},5000&limit=50&apiKey=${API_KEYs.PlacesAPI}`;
                console.log("🌍 Trying Geoapify first...");

                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();

                    if (data.features && data.features.length > 0) {
                        allPlaces = data.features.map(feature => {
        // Calculate distance if not provided
const featureLat = feature.geometry.coordinates[1];
                            const featureLon = feature.geometry.coordinates[0];

        const distance = feature.properties.distance || calculateDistance(lat, lon, featureLat, featureLon);

                            return {
                                name: feature.properties.name || 'Unnamed',
         address: feature.properties.address_line1 || feature.properties.address || 'No address',
                                categories: feature.properties.categories || [],
             distance: distance, // Make sure distance is properly set
                                lat: featureLat,

                                lon: featureLon,
             image: null,
                                source: 'Geoapify'
                            };
                        });

                        console.log(`✅ Geoapify: ${allPlaces.length} places`);
                    }
                }
            } catch (e) {
                console.log("⚠️ Geoapify failed:", e);
            }
        }

        if (allPlaces.length === 0) {
            console.log("🗺️ Using OpenStreetMap...");
            allPlaces = await fetchOSMPlaces(lat, lon);
        }

        const uniquePlaces = removeDuplicatePlaces(allPlaces);
        const finalPlaces = uniquePlaces.slice(0, 30);

        console.log(`📊 PLACES: ${finalPlaces.length} places`);

        return finalPlaces;

    } catch (error) {
        console.error("Failed to load places:", error);
        return [];
    }
}

function removeDuplicatePlaces(places) {
    const seen = new Map();

    return places.filter(place => {
        const key = place.name.toLowerCase().trim();
        if (seen.has(key)) {
            return false;
        }
        seen.set(key, true);
        return true;
    });
}

function displayPlaces(places) {
    if (!Array.isArray(places)) {
        console.error('Places is not an array:', places);
        places = [];
    }

    const placesListNearby = document.getElementById('places-list-nearby');

    function render(listElement) {
        if (!listElement) return;

        listElement.innerHTML = '';

        if (places.length === 0) {
            listElement.innerHTML = '<li><p>No places found nearby</p></li>';
            return;
        }

        places.forEach(place => {
            const isBookmarkedItem = isBookmarked(place, 'place');
            const listItem = document.createElement('li');
            listItem.style.cssText = 'background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid rgb(30, 45, 100); position: relative; cursor: pointer;';

            listItem.setAttribute('data-item', JSON.stringify(place));
            listItem.setAttribute('data-type', 'place');

            // Get the first category 
            const category = getLastCategoryPath(place.categories);

            listItem.innerHTML = `
                <div class="card-container" style="display: flex; flex-direction: column; width: 100%;">
                 ${place.image ? `<img src="${place.image}" alt="${place.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 8px;">` : ''}
                <div class="card-content" style="padding: 10px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h4 style="color: rgb(30, 45, 100); margin: 0 0 8px 0;">${place.name || 'Unnamed'}</h4>
                        <button class="bookmark-btn" data-action="${isBookmarkedItem ? 'remove' : 'add'}" style="background: ${isBookmarkedItem ? '#ff6b6b' : 'rgb(30, 45, 100)'}; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 16px;" title="${isBookmarkedItem ? 'Remove bookmark' : 'Add bookmark'}">${isBookmarkedItem ? '🗑️' : '⭐'}</button>
                    </div>
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📍 ${place.address || 'No address'}</p>
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">🏷️ ${category}</p>
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📏 ${place.distance ? Math.round(place.distance) + 'm' : 'N/A'} away</p>
                </div>
            </div>
            `;

            
            const bookmarkBtn = listItem.querySelector('.bookmark-btn');

            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleBookmark(place, 'place');
            });

            // Make the entire card clickable except for the bookmark button
            listItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('bookmark-btn')) return;
                showItemDetails(place, 'place');
            });

            listElement.appendChild(listItem);
        });
    }

    if (placesListNearby) render(placesListNearby);
}


// EVENT FETCHING


async function fetchEvents(lat, lon) {
    const allEvents = [];
    console.log("🌐 fetchEvents called with:", lat, lon);

    if (API_KEYs.ticketMasterKey) {
        try {
            // Using ticketmaster API to fetch for events nearby
            const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?latlong=${lat},${lon}&radius=50&unit=km&apikey=${API_KEYs.ticketMasterKey}`;
            console.log("🎫 TICKETMASTER REQUEST");

            const tmResponse = await fetch(tmUrl);
            console.log("🎫 Ticketmaster status:", tmResponse.status);

            if (tmResponse.ok) {
                const tmData = await tmResponse.json();

                if (tmData._embedded?.events?.length) {
               const tmEvents = tmData._embedded.events.map(event => {
 const venueLat = event._embedded.venues?.[0]?.location?.latitude;
      const venueLon = event._embedded.venues?.[0]?.location?.longitude;

                        let distance = null;
                        if (venueLat && venueLon) {
       distance = calculateDistance(lat, lon, parseFloat(venueLat), parseFloat(venueLon));
                        }

                        return {
                            name: event.name,
                            date: event.dates.start.localDate,
                            time: event.dates.start.localTime || 'TBD',

                            venue: event._embedded.venues?.[0]?.name || 'TBD',

                            address: event._embedded.venues?.[0]?.address?.line1 || '',
                            category: event.classifications?.[0]?.segment?.name || 'Event',

                            url: event.url,
                            image: event.images?.[0]?.url,
                            distance: distance,
                            lat: venueLat ? parseFloat(venueLat) : null,
                            lon: venueLon ? parseFloat(venueLon) : null,
                            source: 'Ticketmaster'
                        };
                    });
                    allEvents.push(...tmEvents);
                    console.log(`✅ Found ${tmEvents.length} Ticketmaster events`);
                }
            }
        } catch (e) {
            console.error("❌ Ticketmaster failed:", e);
        }
    }
// If ticketmaster doesn't have events nearby use PredictHQ's API
    if (API_KEYs.PredictHQKey) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 90);
            const future = futureDate.toISOString().split('T')[0];

    const phqUrl = `https://api.predicthq.com/v1/events/?within=50km@${lat},${lon}&active.gte=${today}&active.lte=${future}&limit=50&sort=rank`;
            console.log("🔮 PREDICTHQ REQUEST");

            const phqResponse = await fetch(phqUrl, {
                headers: {
                    "Authorization": `Bearer ${API_KEYs.PredictHQKey}`,

          "Accept": "application/json"
                }
            });

            console.log("🔮 PredictHQ status:", phqResponse.status);

            if (phqResponse.ok) {
                const phqData = await phqResponse.json();

                if (phqData.results && phqData.results.length > 0) {
                    const phqEvents = phqData.results.map(event => {
                        const eventLat = event.location?.[1];
                        const eventLon = event.location?.[0];

                        let distance = null;
                        if (eventLat && eventLon) {
                            distance = calculateDistance(lat, lon, eventLat, eventLon);
                        }

                        return {
                            name: event.title,
                            date: event.start.split('T')[0],
          time: event.start.split('T')[1]?.substring(0, 5) || 'TBD',
                          
                          venue: event.entities?.[0]?.name || event.location?.[0] || 'TBD',
  address: event.location?.[0] || '',
                            category: event.category || 'Event',
                 description: event.description || '',

                            impact: event.rank,
                 distance: distance,
                            lat: eventLat,
                        lon: eventLon,
             image: null,
                            url: '',

                            source: 'PredictHQ'
                        };
                    });
                    allEvents.push(...phqEvents);
                    console.log(`✅ Found ${phqEvents.length} PredictHQ events`);
                }
            }
        } catch (e) {
            console.error("❌ PredictHQ failed:", e);
        }
    }

const uniqueEvents = allEvents.filter((event, index, self) =>
        index === self.findIndex((e) =>
            e.name.toLowerCase() === event.name.toLowerCase() &&
            e.date === event.date
        )
    );

    uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    return uniqueEvents;
}
// display events function
function displayEvents(events) {
    const eventsListEvents = document.getElementById('events-list-events');

    function render(listElement) {
    if (!listElement) return;

 listElement.innerHTML = '';

        if (!events || events.length === 0) {

            listElement.innerHTML = '<li><p>No events found in this area</p></li>';
            return;
        }

        events.forEach(event => {
            const isBookmarkedItem = isBookmarked(event, 'event');
            const listItem = document.createElement('li');
            listItem.style.cssText = 'background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid rgb(30, 45, 100); position: relative; cursor: pointer;';

            listItem.setAttribute('data-item', JSON.stringify(event));
            listItem.setAttribute('data-type', 'event');

            listItem.innerHTML = `
                <div class="card-container" style="display: flex; flex-direction: column; width: 100%;">
                 ${event.image ? `<img src="${event.image}" alt="${event.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 8px;">` : ''}
                <div class="card-content" style="padding: 10px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h4 style="color: rgb(30, 45, 100); margin: 0 0 8px 0;">${event.name}</h4>
                        <button class="bookmark-btn" data-action="${isBookmarkedItem ? 'remove' : 'add'}" style="background: ${isBookmarkedItem ? '#ff6b6b' : 'rgb(30, 45, 100)'}; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 16px;" title="${isBookmarkedItem ? 'Remove bookmark' : 'Add bookmark'}">${isBookmarkedItem ? '🗑️' : '⭐'}</button>
                    </div>
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📅 ${event.date}${event.time ? ` at ${event.time}` : ''}</p>
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">📍 ${event.venue}</p>
                     ${event.address ? `<p style="color: #666; font-size: 0.9em; margin: 4px 0;">🗺️ ${event.address}</p>` : ''}
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">🏷️ ${getLastCategoryPath(event.category )}</p>
                     ${event.distance ? `<p style="color: #666; font-size: 0.9em; margin: 4px 0;">📏 ${Math.round(event.distance)}m away</p>` : ''}
                    <p style="color: #666; font-size: 0.9em; margin: 4px 0;">🎫 Source: ${event.source}</p>
                </div>
            </div>
            `;

            
            const bookmarkBtn = listItem.querySelector('.bookmark-btn');

            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleBookmark(event, 'event');
            });

            // Make the entire card clickable except for the bookmark button
            listItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('bookmark-btn')) return;
                showItemDetails(event, 'event');
            });

            listElement.appendChild(listItem);
        });
    }

    if (eventsListEvents) render(eventsListEvents);
}

// Close detail modal when clicking the close button
document.getElementById('close-detail-alert-box')?.addEventListener('click', closeDetailModal);

});