<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Get JSON data from request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Check if data is valid
if (!$data) {
    echo json_encode(array(
        'success' => false,
        'message' => 'Invalid data received'
    ));
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // 1. Insert guest information
    $stmt = $conn->prepare("INSERT INTO guests (first_name, last_name, email, phone, address, special_requests) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", 
        $data['firstName'], 
        $data['lastName'], 
        $data['email'], 
        $data['phone'], 
        $data['address'], 
        $data['specialRequests']
    );
    $stmt->execute();
    $guest_id = $conn->insert_id;
    $stmt->close();
    
    // 2. Insert reservation
    $stmt = $conn->prepare("INSERT INTO reservations (guest_id, check_in_date, check_out_date, adults, children, total_price, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $payment_status = 'completed';
    $stmt->bind_param("issiidss", 
        $guest_id, 
        $data['checkInDate'], 
        $data['checkOutDate'], 
        $data['adults'], 
        $data['children'], 
        $data['totalPrice'], 
        $data['paymentMethod'], 
        $payment_status
    );
    $stmt->execute();
    $reservation_id = $conn->insert_id;
    $stmt->close();
    
    // 3. Insert room bookings
    $stmt = $conn->prepare("INSERT INTO room_bookings (reservation_id, room_type, quantity, price_per_night) VALUES (?, ?, ?, ?)");
    
    foreach ($data['selectedRooms'] as $room) {
        $stmt->bind_param("isid", 
            $reservation_id, 
            $room['name'], 
            $room['quantity'], 
            $room['price']
        );
        $stmt->execute();
    }
    $stmt->close();
    
    // 4. Insert payment details
    $stmt = $conn->prepare("INSERT INTO payments (reservation_id, amount, payment_method, payment_details) VALUES (?, ?, ?, ?)");
    $payment_details_json = json_encode($data['paymentDetails']);
    $stmt->bind_param("idss", 
        $reservation_id, 
        $data['totalPrice'], 
        $data['paymentMethod'], 
        $payment_details_json
    );
    $stmt->execute();
    $stmt->close();
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode(array(
        'success' => true,
        'message' => 'Reservation created successfully',
        'reservationId' => $reservation_id
    ));
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    // Return error response
    echo json_encode(array(
        'success' => false,
        'message' => 'Failed to create reservation: ' . $e->getMessage()
    ));
}

// Close connection
$conn->close();
?>