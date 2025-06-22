'use strict';

const $navbar = document.querySelector("[data-navbar]");
const $navtoggler = document.querySelector("[data-nav-toggler]");

$navtoggler.addEventListener("click", () => $navbar.classList.toggle("active"));


const $header = document.querySelector("[data-header]");

window.addEventListener("scroll", e => {
    $header.classList[window.scrollY > 50 ? "add" : "remove"]("active");
});

const $toggleBtns = document.querySelectorAll("[data-toggle-btn]");

$toggleBtns.forEach($toggleBtn => {
    $toggleBtn.addEventListener("click", () => {
        $toggleBtn.classList.toggle("active")
    });
});





// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const propertyList = document.getElementById('property-list');

    const defaultLat = 26.699459597267264;
    const defaultLng = 882.44856872289559;
    
        // Try to get user's current position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success - use user's location
                    const { latitude, longitude } = position.coords;
                    fetchProperties(latitude, longitude);
                },
                (error) => {
                    // Error or denied - use default location
                    console.warn('Geolocation error:', error.message);
                    fetchProperties(defaultLat, defaultLng);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            // Geolocation not supported - use default location
            console.warn('Geolocation not supported by browser');
            fetchProperties(defaultLat, defaultLng);
        }
       
    
   async function fetchProperties(latitude, longitude) {
    const apiUrl = `https://nesthub-e20x.onrender.com/api/v1/get-nearby-posts?latitude=${latitude}&longitude=${longitude}`;
        fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            propertyList.innerHTML = '';
            const allProperties = [...(data.premiumTiers || []), ...(data.standard || [])];
            
            if (allProperties.length > 0) {
                allProperties.forEach(property => {
                    const card = createPropertyCard(property, property.phone);
                    propertyList.appendChild(card);
                    
                    // Add click event to WhatsApp buttons
                    card.querySelector('.whatsapp-btn')?.addEventListener('click', () => {
                        const message = `Hi, I'm interested in this property: ${property.title} (${window.location.href})`;
                        window.open(`https://wa.me/${property.phone}?text=${encodeURIComponent(message)}`, '_blank');
                    });
                    
                    // Add click event to call buttons
                    card.querySelector('.call-btn')?.addEventListener('click', () => {
                        window.location.href = `tel:${property.phone || property.phone}`;
                    });
                });
            } else {
                fetchRandomProperties(property.phone);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage();
        });
    };

    function createPropertyCard(property, defaultPhone) {
        const card = document.createElement('div');
        card.className = 'card';
        const displayPrice = property.adjustedPrice || property.price || '0.00';
        const phoneNumber = property.phone || defaultPhone;
        const whatsappLink = `https://wa.me/${phoneNumber}?text=Hi, I'm interested in ${encodeURIComponent(property.title || 'this property')} (${window.location.href})`;
        // 'https://wa.me/$phoneNumber?text=${Uri.encodeComponent(message)}';

        card.innerHTML = `
                <div class="card-banner">
                    <figure class="img-holder" style="--width: 585; --height: 390;" 
                            data-images='${JSON.stringify(property.image || [])}' 
                            onclick="handleImageClick(this)">
                    <img src="${property.image?.[0] || "assets/images/default-property.jpg"}"
                        width="585" height="390"
                        alt="${property.title || "Property"}"
                        class="img-cover">
                    </figure>

                 
                
                ${
                  property.isNew
                    ? '<span class="badge label-medium">New</span>'
                    : ""
                }
            
            </div>
            
            <div class="card-content">
            <div class="card-meta" style="display: flex; justify-content: space-between; align-items: center;"> 
               <span class="title-large">₹${displayPrice.toLocaleString()}</span>
                  <a href="${whatsappLink}" class="btn whatsapp-btn" target="_blank">
                        <img src="assets/images/wt.png" alt="WhatsApp" width="20">
                    </a>
            </div>
             
                
                <h3 class="title-small card-title">
                   
                        ${property.title || "Property Title"}
                    
                </h3>
                
                <address class="body-medium card-text">
                    ${property.address || "Address not available"}
                </address>
                
                <div class="card-meta-list">
                    <div class="meta-item">
                        <span class="material-symbols-rounded meta-icon" aria-hidden="true">bed</span>
                        <span class="meta-text label-medium">${
                          property.rooms || "0"
                        } Bed</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="material-symbols-rounded meta-icon" aria-hidden="true">bathtub</span>
                        <span class="meta-text label-medium">${
                          property.bathrooms || "0"
                        } Bath</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="material-symbols-rounded meta-icon" aria-hidden="true">straighten</span>
                        <span class="meta-text label-medium">${
                          property.size || "0"
                        } sqft</span>
                    </div>
                </div>
                
           
            </div>
        `;
        
        return card;
    }
//     <div class="card-footer">
//     <a href="${whatsappLink}" class="btn whatsapp-btn" target="_blank">
//         <img src="assets/images/wt.png" alt="WhatsApp" width="20">
//         WhatsApp
//     </a>
//     <a href="tel:${phoneNumber}" class="btn call-btn">
//         <span class="material-symbols-rounded" aria-hidden="true">call</span>
//         Call
//     </a>
// </div>

    async function fetchRandomProperties(defaultPhone) {
        try {
            const response = await fetch('/api/v1/properties/random');
            const data = await response.json();
            
            if (data.length > 0) {
                data.forEach(property => {
                    const card = createPropertyCard(property, defaultPhone);
                    propertyList.appendChild(card);
                });
            } else {
                showErrorMessage();
            }
        } catch (error) {
            console.error('Error fetching random properties:', error);
            showErrorMessage();
        }
    }

    function showErrorMessage() {
        propertyList.innerHTML = `
            <div class="error-message">
                <span class="material-symbols-rounded" aria-hidden="true">error</span>
                <p>We couldn't find any properties matching your criteria.</p>
                <button class="btn" id="retry-btn">Try Again</button>
                <a href="https://wa.me/${whatsappNumber}" class="btn whatsapp-btn" target="_blank">
                    <img src="assets/images/whatsapp-icon.svg" alt="WhatsApp" width="20">
                    Contact via WhatsApp
                </a>
            </div>
        `;
        
        document.getElementById('retry-btn')?.addEventListener('click', () => location.reload());
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("login") === "true";
    const email = localStorage.getItem("email");

    const loginBtn = document.getElementById("loginBtn");
    const getStartedBtn = document.getElementById("getStartedBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    function showLoggedInUI() {
      if (loginBtn) loginBtn.style.display = "none";
      if (getStartedBtn) {
        getStartedBtn.textContent = "Profile";
        getStartedBtn.href = "profile.html";
      }
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    }

    function showLoggedOutUI() {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (getStartedBtn) {
        getStartedBtn.textContent = "Get Started";
        getStartedBtn.href = "#";
      }
      if (logoutBtn) logoutBtn.style.display = "none";
    }

    if (isLoggedIn && email) {
      showLoggedInUI();
    } else {
      showLoggedOutUI();
    }

    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("login");
      localStorage.removeItem("email");

      localStorage.clear();
      sessionStorage.clear();
      location.reload();
      showLoggedOutUI();
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("login") === "true";
    const email = localStorage.getItem("email");
    const sellLink = document.getElementById("sellLink");

    if (isLoggedIn && email) {
      sellLink.href = "sell.html";
    } else {
      sellLink.href = "login.html";
    }
  });




  document.addEventListener('DOMContentLoaded', function() {
    const propertyList = document.getElementById('filter-property-list');
    const searchForm = document.querySelector('.search-bar');
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const wantTo = searchForm.querySelector('[name="want-to"]').value;
        const pinCode = searchForm.querySelector('[name="pin-code"]').value;
        const location = searchForm.querySelector('[name="location"]').value;
        
        // Validate inputs
        if (!pinCode && !location) {
            alert('Please enter either a pin code or location');
            return;
        }
        
        // Show loading state
        propertyList.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Searching properties...</p>
            </div>
        `;
        
        // Call API with search parameters
        
        if (location.trim() === '') {
            fetchProperties(wantTo, pinCode, location);
        } else {
            fetchPropertiesByAdd(wantTo, location, pinCode);
        }
    });

    function fetchProperties(wantTo, pinCode, location) {
        let apiUrl = `https://nesthub-e20x.onrender.com/api/v1/get-post-by-pincode/${pinCode}`;
        
        // if (pinCode) apiUrl += `&pincode=${pinCode}`;
        // if (location) apiUrl += `&location=${encodeURIComponent(location)}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                propertyList.innerHTML = '';
                
                const allProperties = data;
                
                if (allProperties.length > 0) {
                    allProperties.forEach(property => {
                        const card = createPropertyCard(property);
                        propertyList.appendChild(card);
                    });
                } else {
                    showNoResults();
                }
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
                showErrorState();
            });
    }

    function fetchPropertiesByAdd(wantTo, Add, location) {
        let apiUrl = `https://nesthub-e20x.onrender.com/api/v1/get-post-by-add/${Add}`;
        
        // if (pinCode) apiUrl += `&pincode=${pinCode}`;
        // if (location) apiUrl += `&location=${encodeURIComponent(location)}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                propertyList.innerHTML = '';
                
                const allProperties = data;
                
                if (allProperties.length > 0) {
                    allProperties.forEach(property => {
                        const card = createPropertyCard(property);
                        propertyList.appendChild(card);
                    });
                } else {
                    showNoResults();
                }
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
                showErrorState();
            });
    }



    function createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Use adjustedPrice if available, otherwise use price
        const displayPrice = property.adjustedPrice || property.price || '0.00';
        
        card.innerHTML = `
        <div class="card-banner">
                    <figure class="img-holder" style="--width: 585; --height: 390;" 
                            data-images='${JSON.stringify(property.image || [])}' 
                            onclick="handleImageClick(this)">
                    <img src="${property.image?.[0] || "assets/images/default-property.jpg"}"
                        width="585" height="390"
                        alt="${property.title || "Property"}"
                        class="img-cover">
                    </figure>
                
                ${property.isNew ? '<span class="badge label-medium">New</span>' : ''}
                
                <div class="card-actions">
                 
                    <div class="contact-buttons">
                        <button class="icon-btn whatsapp-btn" aria-label="Contact via WhatsApp">
                            <img src="assets/images/wt.png" alt="WhatsApp" width="20">
                        </button>
                      
                    </div>
                </div>
                
                ${property.tier ? `<span class="badge tier-${property.tier}">Tier ${property.tier}</span>` : ''}
            </div>
            
            <div class="card-content">

                
                <span class="title-large">₹${displayPrice.toLocaleString()}</span>
                
                <h3>
                    <a href="/properties/${property._id || '#'}" class="title-small card-title">
                        ${property.title || 'Property Title'}
                    </a>
                </h3>
                
                <address class="body-medium card-text">
                    ${property.address || 'Address not available'}
                </address>
                
                <div class="card-meta-list">
                    <div class="meta-item">
                        <span class="material-symbols-rounded meta-icon" aria-hidden="true">bed</span>
                        <span class="meta-text label-medium">${property.rooms || '0'} Bed</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="material-symbols-rounded meta-icon" aria-hidden="true">bathtub</span>
                        <span class="meta-text label-medium">${property.bathrooms || '0'} Bath</span>
                    </div>
                    
                    <div class="meta-item">
                        <span class="material-symbols-rounded meta-icon" aria-hidden="true">straighten</span>
                        <span class="meta-text label-medium">${property.size || '0'} sqft</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add click events to buttons
        card.querySelector('.whatsapp-btn')?.addEventListener('click', () => {
            const message = `Hi, I'm interested in ${property.title || 'this property'} (${window.location.href})`;
            window.open(`https://wa.me/${property.phone}?text=${encodeURIComponent(message)}`, '_blank');
        });
        
        card.querySelector('.call-btn')?.addEventListener('click', () => {
            window.location.href = `tel:${property.phone || '0000000000'}`;
        });
        
        return card;
    }

    function showNoResults() {
        propertyList.innerHTML = `
            <div class="error-message">
                <span class="material-symbols-rounded">search_off</span>
                <p>No properties found matching your search criteria</p>
                <button class="btn" id="retry-btn">Try Different Search</button>
            </div>
        `;
        
        document.getElementById('retry-btn')?.addEventListener('click', () => {
            propertyList.innerHTML = '';
        });
    }

    function showErrorState() {
        propertyList.innerHTML = `
            <div class="error-message">
                <p>Not found any properties matching your search criteria</p>
            </div>
        `;
        
        document.getElementById('retry-btn')?.addEventListener('click', () => {
            location.reload();
        });
    }
});