
<?php
// Create reservation endpoint
// This file should be placed on your Namecheap hosting

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database connection
require_once '../../config/database.php';

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'phone', 'date', 'timeSlot'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
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
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit;
}

// Date format validation (DD/MM/YYYY)
if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid date format. Use DD/MM/YYYY']);
    exit;
}

// Time slot validation
$valid_time_slots = ['8h00-11h00', '11h00-14h00', '14h00-16h00'];
if (!in_array($timeSlot, $valid_time_slots)) {
    http_response_code(400);
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
    
    http_response_code(201);
    echo json_encode([
        'success' => true, 
        'message' => 'Reservation created successfully',
        'id' => $reservationId
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error creating reservation']);
}
