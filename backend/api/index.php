
<?php
// API root endpoint
// This file should be placed on your Namecheap hosting

// CORS headers - CRITICAL for cross-domain requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Return API information
echo json_encode([
    'name' => 'Sounny Reservations API',
    'version' => '1.0.0',
    'status' => 'online',
    'endpoints' => [
        '/api/reservations/create.php',
        '/api/reservations/list.php',
        '/api/reservations/update.php',
        '/api/auth/login.php'
    ],
    'documentation' => 'See README.md for documentation'
]);
