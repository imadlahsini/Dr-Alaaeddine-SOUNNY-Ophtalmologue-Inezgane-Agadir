
<?php
// Update reservation endpoint
// This file should be placed on your Namecheap hosting

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Allow both POST and PUT for flexibility
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database connection and authentication utilities
require_once '../../config/database.php';
require_once '../../utils/auth.php';

// Authenticate the request
$user = authenticateRequest();

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate reservation ID
if (!isset($data['id']) || empty($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid reservation ID']);
    exit;
}

$id = (int)$data['id'];

// Build update query based on provided fields
$updates = [];
$params = [];

// Status update
if (isset($data['status']) && !empty($data['status'])) {
    $validStatuses = ['Pending', 'Confirmed', 'Canceled', 'Not Responding'];
    $status = sanitizeInput($data['status']);
    
    if (!in_array($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid status value']);
        exit;
    }
    
    $updates[] = "status = ?";
    $params[] = $status;
}

// Name update
if (isset($data['name']) && !empty($data['name'])) {
    $name = sanitizeInput($data['name']);
    $updates[] = "name = ?";
    $params[] = $name;
}

// Phone update
if (isset($data['phone']) && !empty($data['phone'])) {
    $phone = sanitizeInput($data['phone']);
    
    if (!preg_match('/^\d{9,10}$/', $phone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
        exit;
    }
    
    $updates[] = "phone = ?";
    $params[] = $phone;
}

// Date update
if (isset($data['date']) && !empty($data['date'])) {
    $date = sanitizeInput($data['date']);
    
    if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid date format. Use DD/MM/YYYY']);
        exit;
    }
    
    $updates[] = "date = ?";
    $params[] = $date;
}

// Time slot update
if (isset($data['timeSlot']) && !empty($data['timeSlot'])) {
    $timeSlot = sanitizeInput($data['timeSlot']);
    
    $validTimeSlots = ['8h00-11h00', '11h00-14h00', '14h00-16h00'];
    if (!in_array($timeSlot, $validTimeSlots)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid time slot']);
        exit;
    }
    
    $updates[] = "time_slot = ?";
    $params[] = $timeSlot;
}

// If no updates requested
if (empty($updates)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No updates provided']);
    exit;
}

try {
    // Add reservation ID to params
    $params[] = $id;
    
    // Build the SQL query
    $sql = "UPDATE reservations SET " . implode(", ", $updates) . " WHERE id = ?";
    
    // Execute update
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Check if reservation exists
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Reservation not found']);
        exit;
    }
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Reservation updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error updating reservation']);
}
