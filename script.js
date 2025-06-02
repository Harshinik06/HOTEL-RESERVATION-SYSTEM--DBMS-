// Global variables
const selectedRooms = {};
let totalPrice = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates for check-in and check-out
    setDefaultDates();
    
    // Load room types from the database
    loadRoomTypes();
    
    // Add event listeners
    addEventListeners();
});

// Set default dates (today and tomorrow)
function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates as YYYY-MM-DD for the date input
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    document.getElementById('check-in').value = formatDate(today);
    document.getElementById('check-out').value = formatDate(tomorrow);
}

// Load room types from the database
function loadRoomTypes() {
    fetch('php/get_rooms.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch room types');
            }
            return response.json();
        })
        .then(roomTypes => {
            displayRoomTypes(roomTypes);
        })
        .catch(error => {
            console.error('Error loading room types:', error);
            // If API fails, load default room types
            loadDefaultRoomTypes();
        });
}

// Display room types in the UI
function displayRoomTypes(roomTypes) {
    const roomsGrid = document.getElementById('rooms-grid');
    roomsGrid.innerHTML = '';
    
    roomTypes.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.dataset.roomId = room.id;
        roomCard.dataset.roomName = room.name;
        roomCard.dataset.roomPrice = room.price_per_night;
        
        roomCard.innerHTML = `
            <div class="room-image" style="background-image: url('${room.image_url}');"></div>
            <div class="room-details">
                <h3>${room.name}</h3>
                <p>${room.description}</p>
                <div class="room-price">$${room.price_per_night} / night</div>
                <button type="button" class="btn select-room-btn">Select Room</button>
            </div>
        `;
        
        roomsGrid.appendChild(roomCard);
    });
    
    // Add event listeners to the new buttons
    addRoomSelectionListeners();
}

// Load default room types if API fails
function loadDefaultRoomTypes() {
    const defaultRooms = [
        {
            id: 'deluxe',
            name: 'Deluxe Room',
            description: 'Spacious room with a king-size bed, modern amenities, and a city view.',
            price_per_night: 150.00,
            image_url: 'https://placehold.co/300x200/1a3c40/e9c46a'
        },
        {
            id: 'executive',
            name: 'Executive Suite',
            description: 'Luxury suite with separate living area, premium amenities, and panoramic views.',
            price_per_night: 250.00,
            image_url: 'https://placehold.co/300x200/1a3c40/e9c46a'
        },
        {
            id: 'family',
            name: 'Family Room',
            description: 'Perfect for families with two queen beds, extra space, and child-friendly features.',
            price_per_night: 200.00,
            image_url: 'https://placehold.co/300x200/1a3c40/e9c46a'
        }
    ];
    
    displayRoomTypes(defaultRooms);
}

// Add event listeners to room selection buttons
function addRoomSelectionListeners() {
    document.querySelectorAll('.select-room-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomCard = this.closest('.room-card');
            const roomId = roomCard.dataset.roomId;
            const roomName = roomCard.dataset.roomName;
            const roomPrice = parseFloat(roomCard.dataset.roomPrice);
            
            // Add room to selected rooms if not already selected
            if (!selectedRooms[roomId]) {
                selectedRooms[roomId] = {
                    id: roomId,
                    name: roomName,
                    price: roomPrice,
                    quantity: 1
                };
                
                // Update UI
                updateSelectedRoomsUI();
                
                // Show selected rooms section
                document.getElementById('selected-rooms-section').style.display = 'block';
            } else {
                alert(`${roomName} is already in your selection. You can adjust the quantity below.`);
            }
        });
    });
}

// Update the selected rooms UI
function updateSelectedRoomsUI() {
    const selectedRoomsList = document.getElementById('selected-rooms-list');
    selectedRoomsList.innerHTML = '';
    totalPrice = 0;
    
    // Add each selected room to the list
    Object.keys(selectedRooms).forEach(roomId => {
        const room = selectedRooms[roomId];
        const roomTotal = room.price * room.quantity;
        totalPrice += roomTotal;
        
        const roomElement = document.createElement('div');
        roomElement.className = 'selected-room-item';
        roomElement.innerHTML = `
            <div>
                <strong>${room.name}</strong>
                <div>$${room.price} / night</div>
            </div>
            <div class="room-quantity">
                <button type="button" class="quantity-btn decrease-btn" data-room-id="${roomId}">-</button>
                <span class="quantity-value">${room.quantity}</span>
                <button type="button" class="quantity-btn increase-btn" data-room-id="${roomId}">+</button>
            </div>
            <button type="button" class="remove-room" data-room-id="${roomId}">Remove</button>
        `;
        
        selectedRoomsList.appendChild(roomElement);
    });
    
    // Update total price
    document.getElementById('total-price').textContent = `Total: $${totalPrice}`;
    
    // Update transaction summary
    updateTransactionSummary();
    
    // Add event listeners to quantity buttons and remove buttons
    addQuantityButtonListeners();
}

// Add event listeners to quantity buttons and remove buttons
function addQuantityButtonListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            if (selectedRooms[roomId].quantity > 1) {
                selectedRooms[roomId].quantity--;
                updateSelectedRoomsUI();
            }
        });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            selectedRooms[roomId].quantity++;
            updateSelectedRoomsUI();
        });
    });
    
    // Remove room buttons
    document.querySelectorAll('.remove-room').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            delete selectedRooms[roomId];
            updateSelectedRoomsUI();
            
            // Hide selected rooms section if empty
            if (Object.keys(selectedRooms).length === 0) {
                document.getElementById('selected-rooms-section').style.display = 'none';
            }
        });
    });
}

// Update transaction summary
function updateTransactionSummary() {
    const roomCharges = totalPrice;
    const taxes = roomCharges * 0.1; // 10% tax
    const serviceFee = 25; // Fixed service fee
    const total = roomCharges + taxes + serviceFee;
    
    document.getElementById('summary-room-charges').textContent = `$${roomCharges.toFixed(2)}`;
    document.getElementById('summary-taxes').textContent = `$${taxes.toFixed(2)}`;
    document.getElementById('summary-service-fee').textContent = `$${serviceFee.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}

// Add all event listeners
function addEventListeners() {
    // Payment method selection
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all payment details
            document.querySelectorAll('.payment-details').forEach(details => {
                details.classList.remove('active');
            });
            
            // Show selected payment details
            const selectedPaymentDetails = document.getElementById(`${this.value}-details`);
            if (selectedPaymentDetails) {
                selectedPaymentDetails.classList.add('active');
            }
        });
    });
    
    // Basic form validation
    document.getElementById('reservation-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const checkIn = document.getElementById('check-in').value;
        const checkOut = document.getElementById('check-out').value;
        
        if (new Date(checkIn) >= new Date(checkOut)) {
            alert('Check-out date must be after check-in date');
            return;
        }
        
        // Scroll to room selection
        document.querySelector('.room-types').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Proceed to guest details button
    document.getElementById('proceed-to-details').addEventListener('click', function() {
        if (Object.keys(selectedRooms).length === 0) {
            alert('Please select at least one room before proceeding.');
            return;
        }
        
        // Scroll to customer info section
        document.querySelector('.customer-info').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Proceed to payment button
    document.getElementById('proceed-to-payment').addEventListener('click', function() {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        if (!firstName || !lastName || !email || !phone) {
            alert('Please fill in all required guest information fields.');
            return;
        }
        
        // Scroll to payment section
        document.querySelector('.payment-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Complete reservation
    document.getElementById('payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        let isValid = true;
        let paymentDetails = {};
        
        // Validate based on payment method
        if (selectedPaymentMethod === 'credit-card') {
            const cardName = document.getElementById('card-name').value;
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;
            
            if (!cardName || !cardNumber || !expiryDate || !cvv) {
                isValid = false;
                alert('Please fill in all credit card details.');
            } else {
                paymentDetails = {
                    cardName,
                    cardNumber: cardNumber.replace(/\d(?=\d{4})/g, "*"), // Mask card number
                    expiryDate,
                    type: 'credit-card'
                };
            }
        }
        
        if (isValid) {
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner"></span> Processing...';
            submitButton.disabled = true;
            
            // Collect all reservation data
            const reservationData = {
                // Guest information
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                specialRequests: document.getElementById('special-requests').value,
                
                // Reservation details
                checkInDate: document.getElementById('check-in').value,
                checkOutDate: document.getElementById('check-out').value,
                adults: document.getElementById('adults').value,
                children: document.getElementById('children').value,
                selectedRooms: Object.values(selectedRooms),
                
                // Payment information
                totalPrice: parseFloat(document.getElementById('summary-total').textContent.replace('$', '')),
                paymentMethod: selectedPaymentMethod,
                paymentDetails: paymentDetails
            };
            
            // Send data to the server
            fetch('php/create_reservation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            })
            .then(response => response.json())
            .then(result => {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                if (result.success) {
                    // Show success message
                    document.getElementById('reservation-id').textContent = result.reservationId;
                    document.getElementById('success-message').style.display = 'block';
                    
                    // Scroll to success message
                    document.getElementById('success-message').scrollIntoView({ behavior: 'smooth' });
                    
                    // Reset the form and selected rooms
                    resetReservation();
                } else {
                    throw new Error(result.message || 'Failed to create reservation');
                }
            })
            .catch(error => {
                // Restore button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                console.error('Error submitting reservation:', error);
                alert('There was an error processing your reservation. Please try again.');
            });
        }
    });
}

// Reset reservation
function resetReservation() {
    // Clear selected rooms
    Object.keys(selectedRooms).forEach(key => delete selectedRooms[key]);
    document.getElementById('selected-rooms-section').style.display = 'none';
    
    // Reset forms
    document.getElementById('reservation-form').reset();
    document.getElementById('customer-form').reset();
    document.getElementById('payment-form').reset();
    
    // Set default dates again
    setDefaultDates();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}