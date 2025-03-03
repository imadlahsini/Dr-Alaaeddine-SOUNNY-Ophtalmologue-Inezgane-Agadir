
<?php
// API root endpoint
// This file should be placed on your Namecheap hosting

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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
