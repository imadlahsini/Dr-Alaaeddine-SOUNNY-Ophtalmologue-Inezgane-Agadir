
<?php
// Database connection configuration
// This file should be placed on your Namecheap hosting

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', '../error_log');

// Set to true in production to prevent error details from being exposed
$hideErrors = false;

if (!$hideErrors) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// Database credentials
$db_host = 'localhost';
$db_name = 'achklkhc_sounnyrdv';
$db_user = 'achklkhc_sounnyrdv';
$db_pass = 'achklkhc_sounnyrdv';

// PDO connection
try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    
    error_log("Database connection successful");
} catch (PDOException $e) {
    // In production, display a generic error message
    error_log("Database connection error: " . $e->getMessage());
    
    if ($hideErrors) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection error']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()]);
    }
    exit;
}

// Function to validate and sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
