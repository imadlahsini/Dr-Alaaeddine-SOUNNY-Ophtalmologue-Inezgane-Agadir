
<?php
// List reservations endpoint
// This file should be placed on your Namecheap hosting

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database connection and authentication utilities
require_once '../../config/database.php';
require_once '../../utils/auth.php';

// Authenticate the request
$user = authenticateRequest();

try {
    // Get reservations from database (newest first)
    $stmt = $pdo->query("
        SELECT id, name, phone, date, time_slot as timeSlot, status, created_at 
        FROM reservations 
        ORDER BY created_at DESC
    ");
    
    $reservations = $stmt->fetchAll();
    
    // Transform to match frontend structure
    $transformedReservations = array_map(function($reservation) {
        return [
            'id' => (int)$reservation['id'],
            'name' => $reservation['name'],
            'phone' => $reservation['phone'],
            'date' => $reservation['date'],
            'timeSlot' => $reservation['timeSlot'],
            'status' => $reservation['status'],
        ];
    }, $reservations);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $transformedReservations
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error fetching reservations']);
}
