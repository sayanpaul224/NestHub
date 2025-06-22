document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('dataForm');
    const submitBtn = document.getElementById('submitBtn');
    const buttonText = submitBtn.querySelector('.button-text');
    const spinner = submitBtn.querySelector('.spinner-border');
    const resultData = document.getElementById('resultData');
    const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    const getLocationBtn = document.getElementById('getLocationBtn');

    function validateInput(input) {
        if (!input.checkValidity()) {
            return false;
        }
        return true;
    }
        // Geolocation functionality
    async function getAddressFromCoords(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('Error getting address:', error);
            throw new Error('Failed to get address from coordinates');
        }
    }
    getLocationBtn.addEventListener('click', async function() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        // Show loading state
        getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        getLocationBtn.disabled = true;
        form.classList.add('loading-location');

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const address = await getAddressFromCoords(
                position.coords.latitude,
                position.coords.longitude
            );

            document.getElementById('address').value = address;
        } catch (error) {
            console.error('Error:', error);
            alert('Unable to retrieve your location. Please enter your address manually.');
        } finally {
            // Reset button state
            getLocationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
            getLocationBtn.disabled = false;
            form.classList.remove('loading-location');
        }
    });
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate all inputs
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (!isValid) return;

        // Show loading state
        buttonText.textContent = 'Submitting...';
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        try {
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const occupation = document.getElementById('occupation').value.trim();
            const address = document.getElementById('address').value.trim();

            const imageInput = document.getElementById('profileImage');
            const files = imageInput.files;

            if (files.length === 0) {
                alert('Please upload at least one image');
                return;
            }

            // Upload images
            const uploadFormData = new FormData();
            for (let i = 0; i < files.length; i++) {
                uploadFormData.append('images', files[i]); // backend must handle "images" as array
            }

            const uploadResponse = await fetch('https://nesthub-e20x.onrender.com/api/v1/upload-images', {
                method: 'POST',
                body: uploadFormData
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload images');
            }

            const uploadResult = await uploadResponse.json(); 
            const imageUrls = uploadResult.urls;
            console.log('Image URLs:', imageUrls);
            const title = document.getElementById('title').value.trim();
            const rooms = parseInt(document.getElementById('rooms').value);
            const bathrooms = parseInt(document.getElementById('bathrooms').value);
            const size = document.getElementById('size').value.trim();
            const city = document.getElementById('city').value.trim();
            const postalCode = document.getElementById('postalCode').value.trim();
            const price = parseFloat(document.getElementById('price').value);
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            // const payload = {
            //     title: title,
            //     email: email,
            //     fullName: fullName,
            //     userId: localStorage.getItem("id"), 
            //     phone: phone,
            //     occupation: occupation,
            //     content: "", 
            //     rooms: rooms,
            //     bathrooms: bathrooms,
            //     size:
            //     size,
            //     address: address,
            //     latitude: position.coords.latitude,
            //     longitude: position.coords.longitude,
            //     image: imageUrls,
            //     city: city,
            //     postalCode: postalCode,
            //     price:
            //     price,
            //     status: "live"
            // };
            const postData = {
                title: title,
                email:email,
                userId: localStorage.getItem("id"), // Must be a valid ObjectId from MongoDB
                phone: phone,
                content:occupation,
                rooms:rooms,
                bathrooms: bathrooms,
                size: size,
                address: address,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                image: imageUrls,
                city: city,
                postalCode: postalCode,
                price: price,
                status: "live" 
              };
            console.log('Payload:', postData);
            
            // Send to final API
            const submitResponse = await fetch(`https://nesthub-e20x.onrender.com/api/v1/post-data/${localStorage.getItem("id")}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            console.log('submitResponse:', submitResponse); 
            

            if (!submitResponse.ok) {
                throw new Error('Submission failed');
            }

            const result = await submitResponse.json();
            alert('Form submitted successfully!');
            resultData.textContent = JSON.stringify(result, null, 2);
            // resultModal.show();
            form.reset();
            inputs.forEach(input => input.classList.remove('is-invalid'));

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form. Please try again.');
        } finally {
            buttonText.textContent = 'Submit Information';
            spinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });

    // Price suggestion functionality
    function calculateSuggestedPrices(size, rooms, bathrooms) {
        // Base price per sq ft
        const basePricePerSqFt = 10;
        
        // Room and bathroom multipliers
        const roomMultiplier = 1.1;
        const bathroomMultiplier = 1.05;
        
        // Calculate base price
        let basePrice = size * basePricePerSqFt;
        
        // Apply multipliers for rooms and bathrooms
        basePrice *= Math.pow(roomMultiplier, rooms);
        basePrice *= Math.pow(bathroomMultiplier, bathrooms);
        
        // Calculate three price ranges
        const lowPrice = Math.round(basePrice * 0.9 / 1000) * 1000;
        const midPrice = Math.round(basePrice / 1000) * 1000;
        const highPrice = Math.round(basePrice * 1.3 / 1000) * 1000;
        
        return {
            low: lowPrice,
            mid: midPrice,
            high: highPrice
        };
    }

    function updatePriceSuggestions() {
        const size = parseInt(document.getElementById('size').value) || 0;
        const rooms = parseInt(document.getElementById('rooms').value) || 0;
        const bathrooms = parseInt(document.getElementById('bathrooms').value) || 0;
        
        if (size > 0 && rooms > 0 && bathrooms > 0) {
            const prices = calculateSuggestedPrices(size, rooms, bathrooms);
            
            // Create or update price suggestion buttons
            let priceSuggestions = document.getElementById('priceSuggestions');
            if (!priceSuggestions) {
                priceSuggestions = document.createElement('div');
                priceSuggestions.id = 'priceSuggestions';
                priceSuggestions.className = 'price-suggestions mt-2';
                document.getElementById('price').parentNode.appendChild(priceSuggestions);
            }
            
            priceSuggestions.innerHTML = `
                <div class="price-range-label mb-2">Select a price range:</div>
                <div class="btn-group w-100" role="group">
                    <button type="button" class="btn btn-outline-primary price-btn" onclick="setPrice(${prices.low})">
                        <div class="price-label">Economy</div>
                        <div class="price-value">₹${prices.low.toLocaleString()}</div>
                    </button>
                    <button type="button" class="btn btn-outline-primary price-btn" onclick="setPrice(${prices.mid})">
                        <div class="price-label">Standard</div>
                        <div class="price-value">₹${prices.mid.toLocaleString()}</div>
                    </button>
                    <button type="button" class="btn btn-outline-primary price-btn" onclick="setPrice(${prices.high})">
                        <div class="price-label">Premium</div>
                        <div class="price-value">₹${prices.high.toLocaleString()}</div>
                    </button>
                </div>
            `;
        }
    }

    // Add to window object so it can be called from onclick
    window.setPrice = function(price) {
        const priceInput = document.getElementById('price');
        priceInput.value = price;
        // Remove active class from all buttons
        document.querySelectorAll('.price-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        event.target.closest('.price-btn').classList.add('active');
    };

    // Add event listeners for size, rooms, and bathrooms inputs
    ['size', 'rooms', 'bathrooms'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePriceSuggestions);
    });

    // Add CSS for price suggestions
    const style = document.createElement('style');
    style.textContent = `
        .price-suggestions {
            margin-top: 0.5rem;
        }
        .price-suggestions .btn-group {
            display: flex;
            gap: 0.5rem;
        }
        .price-suggestions .btn {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.3s ease;
        }
        .price-suggestions .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .price-suggestions .btn.active {
            background-color: #0d6efd;
            color: white;
        }
        .price-label {
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }
        .price-value {
            font-size: 1.1rem;
            font-weight: 600;
        }
        .price-range-label {
            color: #666;
            font-size: 0.9rem;
        }
        #price {
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
});


// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', () => {
    fetchProfileData();
  });
  
  // Fetch data from API
  async function fetchProfileData() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`https://nesthub-e20x.onrender.com/api/v1/get-my-posts/${localStorage.getItem("id")}`);
        if (!response.ok) {    
        throw new Error('Network response was not ok');
        }
      const data = await response.json();
      console.log(data.posts);
      
      renderProfileCards(data.posts);
    } catch (error) {
      console.error('Error fetching data:', error);
      displayErrorMessage();
    }
  }
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  function renderProfileCards(profiles) {
    const propertyList = document.getElementById('property-list');
    propertyList.innerHTML = '';
 
    
    profiles.forEach((property, index) => {
    console.log(property.rooms);
    console.log(property.size);
      const propertyCard = document.createElement('div');
      propertyCard.className = 'col-md-6 col-lg-4';
      propertyCard.innerHTML = `
        <div class="card property-card">
          <div class="position-relative">
            <img src="${property.image[0] || 'https://via.placeholder.com/400x300'}" 
                 alt="${property.title}" 
                 class="property-img">
            <span class="badge badge-status ${property.status === 'live' ? 'live' : 'sold'}">
              ${property.status}
            </span>
          </div>
          <div class="card-body">
            <div class="property-price">₹${property.price.toLocaleString()}</div>
            <h5 class="property-title">${property.title}</h5>
            <p class="property-location">
              <i class="fas fa-map-marker-alt me-1"></i>
              ${property.address}
            </p>
            
            <div class="property-features">
              <div class="feature">
                <i class="fas fa-bed"></i>
                <div class="feature-value">${property.rooms}</div>
                <div class="feature-label">Rooms</div>
              </div>
              <div class="feature">
                <i class="fas fa-bath"></i>
                <div class="feature-value">${property.bathrooms}</div>
                <div class="feature-label">Bath</div>
              </div>
              <div class="feature">
                <i class="fas fa-ruler-combined"></i>
                <div class="feature-value">${property.size}</div>
                <div class="feature-label">Area</div>
              </div>
            </div>
            
            <p>${property.content}</p>
            
            <div class="property-footer">
              <small class="posted-date">
                <i class="far fa-clock me-1"></i>
                Posted ${formatDate(property.createdAt)}
              </small>
              <div class="status-control">
                <label class="toggle-switch">
                  <input type="checkbox" id="status-toggle-${index}" ${property.status === 'live' ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
      
      propertyList.appendChild(propertyCard);
    });

    // Add event listeners after all cards are rendered
    profiles.forEach((property, index) => {
      const toggle = document.getElementById(`status-toggle-${index}`);
      if (toggle) {
        toggle.addEventListener('change', function() {
          const newStatus = this.checked ? 'live' : 'closed';
          // Update the visual status
          const statusBadge = this.closest('.property-card').querySelector('.badge-status');
          const statusText = this.closest('.property-card').querySelector('.status-text');
          
          statusBadge.textContent = newStatus;
          statusBadge.className = `badge badge-status ${newStatus === 'live' ? 'live' : 'sold'}`;
        //   statusText.textContent = newStatus;
          
          // Here you would call your API to update the status
        //   console.log(`Updating property ${index} to status: ${newStatus}`);
          updatePropertyStatus(property._id, newStatus);
        });
      }
    });


    async function updatePropertyStatus(propertyId, newStatus) {
        if (!propertyId || !newStatus) {
          throw new Error('Missing required parameters');
        }
        
        if (!['live', 'closed'].includes(newStatus)) {
          throw new Error('Invalid status value');
        }
      
        try {
          const response = await fetch(
            `/api/v1/toggle-post-status/${propertyId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            //   body: JSON.stringify({ status: newStatus }),
            }
          );
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
          }
      
          return await response.json();
          
        } catch (error) {
          console.error('Error updating property status:', error);
          throw error; // Re-throw for calling function to handle
        }
      }



  }

// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('dataForm');
//     const submitBtn = document.getElementById('submitBtn');
//     const buttonText = submitBtn.querySelector('.button-text');
//     const spinner = submitBtn.querySelector('.spinner-border');
//     const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
//     const resultData = document.getElementById('resultData');
//     const getLocationBtn = document.getElementById('getLocationBtn');

//     // Input validation patterns
//     const patterns = {
//         email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//         phone: /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
//     };

//     function validateInput(input) {
//         let isValid = true;

//         if (input.required && !input.value.trim()) {
//             isValid = false;
//         } else if (input.type === 'email' && !patterns.email.test(input.value)) {
//             isValid = false;
//         } else if (input.type === 'tel' && !patterns.phone.test(input.value)) {
//             isValid = false;
//         }

//         input.classList.toggle('is-invalid', !isValid);
//         return isValid;
//     }

//     // Geolocation functionality
//     async function getAddressFromCoords(lat, lng) {
//         try {
//             const response = await fetch(
//                 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
//             );
//             const data = await response.json();
//             return data.display_name;
//         } catch (error) {
//             console.error('Error getting address:', error);
//             throw new Error('Failed to get address from coordinates');
//         }
//     }

//     getLocationBtn.addEventListener('click', async function() {
//         if (!navigator.geolocation) {
//             alert('Geolocation is not supported by your browser');
//             return;
//         }

//         // Show loading state
//         getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
//         getLocationBtn.disabled = true;
//         form.classList.add('loading-location');

//         try {
//             const position = await new Promise((resolve, reject) => {
//                 navigator.geolocation.getCurrentPosition(resolve, reject, {
//                     enableHighAccuracy: true,
//                     timeout: 5000,
//                     maximumAge: 0
//                 });
//             });

//             const address = await getAddressFromCoords(
//                 position.coords.latitude,
//                 position.coords.longitude
//             );

//             document.getElementById('address').value = address;
//         } catch (error) {
//             console.error('Error:', error);
//             alert('Unable to retrieve your location. Please enter your address manually.');
//         } finally {
//             // Reset button state
//             getLocationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
//             getLocationBtn.disabled = false;
//             form.classList.remove('loading-location');
//         }
//     });

//     // Real-time validation
//     form.querySelectorAll('input, textarea').forEach(input => {
//         input.addEventListener('blur', () => validateInput(input));
//         input.addEventListener('input', function() {
//             if (this.classList.contains('is-invalid')) {
//                 validateInput(this);
//             }
//         });
//     });

//     form.addEventListener('submit', async function(e) {
//         e.preventDefault();

//         // Validate all inputs
//         const inputs = form.querySelectorAll('input, textarea');
//         let isValid = true;
//         inputs.forEach(input => {
//             if (!validateInput(input)) {
//                 isValid = false;
//                 input.classList.add('is-invalid');
//             }
//         });

//         if (!isValid) {
//             return;
//         }

//         // Show loading state
//         buttonText.textContent = 'Submitting...';
//         spinner.classList.remove('d-none');
//         submitBtn.disabled = true;

//         try {
//             // Collect form data
//             const formData = {
//                 fullName: document.getElementById('fullName').value.trim(),
//                 email: document.getElementById('email').value.trim(),
//                 phone: document.getElementById('phone').value.trim(),
//                 occupation: document.getElementById('occupation').value.trim(),
//                 address: document.getElementById('address').value.trim()
//             };

//             // Simulate API call delay
//             await new Promise(resolve => setTimeout(resolve, 1500));

//             // Display collected data
//             resultData.textContent = JSON.stringify(formData, null, 2);
//             resultModal.show();

//             // Reset form
//             form.reset();
//             inputs.forEach(input => input.classList.remove('is-invalid'));
//         } catch (error) {
//             console.error('Error:', error);
//             alert('An error occurred while submitting the form. Please try again.');
//         } finally {
//             // Reset button state
//             buttonText.textContent = 'Submit Information';
//             spinner.classList.add('d-none');
//             submitBtn.disabled = false;
//         }
//     });
// });