
<?php
// Validation functions for reservation API endpoints

/**
 * Validates a reservation ID
 */
function validateReservationId($id) {
    if (!isset($id) || empty($id) || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid reservation ID']);
        exit;
    }
    
    return (int)$id;
}

/**
 * Validates a reservation status
 */
function validateStatus($status) {
    $validStatuses = ['Pending', 'Confirmed', 'Canceled', 'Not Responding'];
    $status = sanitizeInput($status);
    
    if (!in_array($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid status value']);
        exit;
    }
    
    return $status;
}

/**
 * Validates a phone number
 */
function validatePhone($phone) {
    $phone = sanitizeInput($phone);
    
    if (!preg_match('/^\d{9,10}$/', $phone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
        exit;
    }
    
    return $phone;
}

/**
 * Validates a date
 */
function validateDate($date) {
    $date = sanitizeInput($date);
    
    if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid date format. Use DD/MM/YYYY']);
        exit;
    }
    
    return $date;
}

/**
 * Validates a time slot
 */
function validateTimeSlot($timeSlot) {
    $timeSlot = sanitizeInput($timeSlot);
    
    $validTimeSlots = ['8h00-11h00', '11h00-14h00', '14h00-16h00'];
    if (!in_array($timeSlot, $validTimeSlots)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid time slot']);
        exit;
    }
    
    return $timeSlot;
}
