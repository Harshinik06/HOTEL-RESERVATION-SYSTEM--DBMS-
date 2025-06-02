<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Include database connection
require_once 'db_connection.php';

// Query to get all room types
$sql = "SELECT * FROM room_types";
$result = $conn->query($sql);

if ($result) {
    $rooms = array();
    
    // Fetch all room types
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
    
    // Return room types as JSON
    echo json_encode($rooms);
} else {
    // Return error
    echo json_encode(array(
        'success' => false,
        'message' => 'Failed to fetch room types: ' . $conn->error
    ));
}

// Close connection
$conn->close();
?>