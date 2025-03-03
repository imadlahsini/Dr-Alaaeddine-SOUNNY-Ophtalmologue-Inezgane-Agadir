
<?php
// Create reservation endpoint
// This file should be placed on your Namecheap hosting

// CORS headers - CRITICAL for cross-domain requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Log request for debugging
error_log("Received request to create.php with method: " . $_SERVER['REQUEST_METHOD']);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    error_log("Method not allowed: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database connection
require_once '../../config/database.php';

// Get JSON data
$input = file_get_contents('php://input');
error_log("Raw input: " . $input);
$data = json_decode($input, true);
error_log("Decoded data: " . print_r($data, true));

// Validate required fields
$required_fields = ['name', 'phone', 'date', 'timeSlot'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        error_log("Missing required field: $field");
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// Sanitize inputs
$name = sanitizeInput($data['name']);
$phone = sanitizeInput($data['phone']);
$date = sanitizeInput($data['date']);
$timeSlot = sanitizeInput($data['timeSlot']);

// Additional validation
if (!preg_match('/^\d{9,10}$/', $phone)) {
    http_response_code(400);
    error_log("Invalid phone number format: $phone");
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit;
}

// Date format validation (DD/MM/YYYY)
if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
    http_response_code(400);
    error_log("Invalid date format: $date");
    echo json_encode(['success' => false, 'message' => 'Invalid date format. Use DD/MM/YYYY']);
    exit;
}

// Time slot validation
$valid_time_slots = ['8h00-11h00', '11h00-14h00', '14h00-16h00'];
if (!in_array($timeSlot, $valid_time_slots)) {
    http_response_code(400);
    error_log("Invalid time slot: $timeSlot");
    echo json_encode(['success' => false, 'message' => 'Invalid time slot']);
    exit;
}

try {
    // Insert reservation into database
    $stmt = $pdo->prepare("
        INSERT INTO reservations (name, phone, date, time_slot, status) 
        VALUES (?, ?, ?, ?, 'Pending')
    ");
    
    $stmt->execute([$name, $phone, $date, $timeSlot]);
    $reservationId = $pdo->lastInsertId();
    
    error_log("Reservation created successfully with ID: $reservationId");
    http_response_code(201);
    echo json_encode([
        'success' => true, 
        'message' => 'Reservation created successfully',
        'id' => $reservationId
    ]);
} catch (PDOException $e) {
    // Log the error for debugging but don't expose details to client
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error creating reservation']);
}
