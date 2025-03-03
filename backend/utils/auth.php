
<?php
// Authentication utilities
// This file should be placed on your Namecheap hosting

// JWT library is simulated here - in production consider using a proper JWT library
class JWTHandler {
    private $secretKey;
    private $issuedAt;
    private $expire;
    
    public function __construct() {
        // Secret key should be stored securely in production
        $this->secretKey = 'g6UQ634KqPGHtxuLPuAP2K6U49YWjdvN';
        $this->issuedAt = time();
        // Set expiration to 24 hours
        $this->expire = $this->issuedAt + 86400; 
    }
    
    public function generateToken($userId, $username) {
        $payload = [
            'iat' => $this->issuedAt,
            'exp' => $this->expire,
            'user_id' => $userId,
            'username' => $username
        ];
        
        // In production, use a proper JWT library
        // This is a simplified version for demonstration
        $base64Header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $base64Payload = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $this->secretKey, true);
        $base64Signature = base64_encode($signature);
        
        return "$base64Header.$base64Payload.$base64Signature";
    }
    
    public function validateToken($token) {
        if (empty($token)) {
            return false;
        }
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $this->secretKey, true);
        $computedSignature = base64_encode($signature);
        
        if ($computedSignature !== $base64Signature) {
            return false;
        }
        
        $payload = json_decode(base64_decode($base64Payload), true);
        
        // Check if token has expired
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
}

// Function to get the token from the Authorization header
function getBearerToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $matches = [];
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

// Function to verify authentication for protected endpoints
function authenticateRequest() {
    $token = getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No authentication token provided']);
        exit;
    }
    
    $jwtHandler = new JWTHandler();
    $payload = $jwtHandler->validateToken($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit;
    }
    
    return $payload;
}
