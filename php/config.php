<?php
/**
 * Resonix Society Configuration File
 * Contains application settings and constants
 */

// Prevent direct access
if (!defined('INCLUDED_FROM_API') && basename($_SERVER['PHP_SELF']) === 'config.php') {
    http_response_code(403);
    exit('Direct access not allowed');
}

// Define this constant to allow config inclusion
define('INCLUDED_FROM_API', true);

// Application Settings
define('APP_NAME', 'Resonix Society');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development, production

// Security Settings
define('ADMIN_SESSION_TIMEOUT', 3600); // 1 hour in seconds
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// File Upload Settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('UPLOAD_DIR', '../uploads/');

// Google Forms URLs (Replace with actual Google Form URLs)
define('GOOGLE_FORMS', [
    'contact' => 'https://docs.google.com/forms/d/e/YOUR_CONTACT_FORM_ID/formResponse',
    'membership' => 'https://docs.google.com/forms/d/e/YOUR_MEMBERSHIP_FORM_ID/formResponse',
    'project' => 'https://docs.google.com/forms/d/e/YOUR_PROJECT_FORM_ID/formResponse',
    'event_registration' => 'https://docs.google.com/forms/d/e/YOUR_EVENT_FORM_ID/formResponse',
    'newsletter' => 'https://docs.google.com/forms/d/e/YOUR_NEWSLETTER_FORM_ID/formResponse'
]);

// Social Media Links (Default values - can be updated via admin)
define('DEFAULT_SOCIAL_LINKS', [
    'facebook' => 'https://facebook.com/resonixsociety',
    'twitter' => 'https://twitter.com/resonixsociety',
    'instagram' => 'https://instagram.com/resonixsociety',
    'linkedin' => 'https://linkedin.com/company/resonixsociety'
]);

// Contact Information (Default values)
define('DEFAULT_CONTACT_INFO', [
    'email' => 'info@resonixsociety.org',
    'phone' => '+1 (555) 123-4567',
    'address' => 'Electronics Department, University Campus, Room 301, ECE Block'
]);

// Pagination Settings
define('DEFAULT_ITEMS_PER_PAGE', 6);
define('MAX_ITEMS_PER_PAGE', 50);

// API Response Settings
define('API_SUCCESS_CODE', 200);
define('API_ERROR_CODE', 400);
define('API_SERVER_ERROR_CODE', 500);
define('API_UNAUTHORIZED_CODE', 401);
define('API_NOT_FOUND_CODE', 404);

// Timezone
date_default_timezone_set('America/New_York');

// Error Reporting (adjust based on environment)
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// CORS Settings
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origins = [
        'http://localhost',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'https://yourdomain.com' // Add your actual domain
    ];
    
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    }
}

// Helper Functions
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function generateUniqueId() {
    return uniqid(mt_rand(), true);
}

function formatDate($date, $format = 'Y-m-d') {
    return date($format, strtotime($date));
}

function logActivity($action, $details = '') {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'details' => $details,
        'user' => $_SESSION['admin_username'] ?? 'system',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    // In a real application, you would write to a log file or database
    // For now, we'll just store in session for demonstration
    if (!isset($_SESSION['activity_log'])) {
        $_SESSION['activity_log'] = [];
    }
    
    array_unshift($_SESSION['activity_log'], $log_entry);
    
    // Keep only the last 100 entries
    $_SESSION['activity_log'] = array_slice($_SESSION['activity_log'], 0, 100);
}

// Data validation functions
function validateEventData($data) {
    $errors = [];
    
    if (empty($data['title'])) {
        $errors[] = 'Event title is required';
    }
    
    if (empty($data['date'])) {
        $errors[] = 'Event date is required';
    } elseif (!strtotime($data['date'])) {
        $errors[] = 'Invalid event date format';
    }
    
    if (empty($data['type'])) {
        $errors[] = 'Event type is required';
    }
    
    return $errors;
}

function validateProjectData($data) {
    $errors = [];
    
    if (empty($data['title'])) {
        $errors[] = 'Project title is required';
    }
    
    if (empty($data['category'])) {
        $errors[] = 'Project category is required';
    }
    
    if (empty($data['description'])) {
        $errors[] = 'Project description is required';
    }
    
    return $errors;
}

function validateTeamMemberData($data) {
    $errors = [];
    
    if (empty($data['name'])) {
        $errors[] = 'Member name is required';
    }
    
    if (empty($data['role'])) {
        $errors[] = 'Member role is required';
    }
    
    if (!empty($data['email']) && !validateEmail($data['email'])) {
        $errors[] = 'Invalid email address';
    }
    
    return $errors;
}

// File handling functions
function createDataDirectory() {
    $dataDir = __DIR__ . '/../data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
}

function createUploadsDirectory() {
    $uploadsDir = __DIR__ . '/' . UPLOAD_DIR;
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }
}

// Initialize directories
createDataDirectory();
createUploadsDirectory();

?>

