<?php
/**
 * Resonix Society Admin Handler
 * Handles admin authentication and management operations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once 'config.php';

// Get the request data
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? $_POST['action'] ?? null;

if (!$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No action specified']);
    exit;
}

// Route the request to appropriate function
try {
    switch ($action) {
        case 'login':
            echo json_encode(handleLogin($input));
            break;
        case 'logout':
            echo json_encode(handleLogout());
            break;
        case 'check_auth':
            echo json_encode(checkAuth());
            break;
        case 'delete_event':
            echo json_encode(deleteEvent($input));
            break;
        case 'delete_project':
            echo json_encode(deleteProject($input));
            break;
        case 'approve_project':
            echo json_encode(approveProject($input));
            break;
        case 'delete_member':
            echo json_encode(deleteMember($input));
            break;
        case 'delete_news':
            echo json_encode(deleteNews($input));
            break;
        case 'delete_blog':
            echo json_encode(deleteBlog($input));
            break;
        case 'delete_gallery':
            echo json_encode(deleteGallery($input));
            break;
        case 'save_settings':
            echo json_encode(saveSettings($input));
            break;
        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Action not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}

/**
 * Handle admin login
 */
function handleLogin($input) {
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $remember = $input['remember'] ?? false;
    
    // Demo credentials - in production, use proper password hashing
    $validUsers = [
        'admin' => 'admin123',
        'moderator' => 'mod123'
    ];
    
    if (isset($validUsers[$username]) && $validUsers[$username] === $password) {
        // Set session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_login_time'] = time();
        
        // Set remember me cookie if requested
        if ($remember) {
            setcookie('admin_remember', $username, time() + (30 * 24 * 60 * 60), '/'); // 30 days
        }
        
        return [
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'username' => $username,
                'name' => ucfirst($username)
            ]
        ];
    }
    
    return [
        'success' => false,
        'message' => 'Invalid username or password'
    ];
}

/**
 * Handle admin logout
 */
function handleLogout() {
    session_destroy();
    setcookie('admin_remember', '', time() - 3600, '/');
    
    return [
        'success' => true,
        'message' => 'Logged out successfully'
    ];
}

/**
 * Check if admin is authenticated
 */
function checkAuth() {
    $isLoggedIn = $_SESSION['admin_logged_in'] ?? false;
    
    // Check remember me cookie if session is not active
    if (!$isLoggedIn && isset($_COOKIE['admin_remember'])) {
        $username = $_COOKIE['admin_remember'];
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_login_time'] = time();
        $isLoggedIn = true;
    }
    
    if ($isLoggedIn) {
        return [
            'authenticated' => true,
            'user' => [
                'username' => $_SESSION['admin_username'] ?? 'admin',
                'name' => ucfirst($_SESSION['admin_username'] ?? 'Admin'),
                'login_time' => $_SESSION['admin_login_time'] ?? time()
            ]
        ];
    }
    
    return ['authenticated' => false];
}

/**
 * Check if user is authenticated (helper function)
 */
function requireAuth() {
    $auth = checkAuth();
    if (!$auth['authenticated']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    return true;
}

/**
 * Delete an event
 */
function deleteEvent($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid event ID'];
    }
    
    try {
        $events = loadJsonData('events');
        $events = array_filter($events, function($event) use ($id) {
            return $event['id'] !== $id;
        });
        
        saveJsonData('events', array_values($events));
        
        return ['success' => true, 'message' => 'Event deleted successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to delete event'];
    }
}

/**
 * Delete a project
 */
function deleteProject($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid project ID'];
    }
    
    try {
        $projects = loadJsonData('projects');
        $projects = array_filter($projects, function($project) use ($id) {
            return $project['id'] !== $id;
        });
        
        saveJsonData('projects', array_values($projects));
        
        return ['success' => true, 'message' => 'Project deleted successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to delete project'];
    }
}

/**
 * Approve a project
 */
function approveProject($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid project ID'];
    }
    
    try {
        $projects = loadJsonData('projects');
        
        foreach ($projects as &$project) {
            if ($project['id'] === $id) {
                $project['status'] = 'published';
                break;
            }
        }
        
        saveJsonData('projects', $projects);
        
        return ['success' => true, 'message' => 'Project approved successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to approve project'];
    }
}

/**
 * Delete a team member
 */
function deleteMember($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid member ID'];
    }
    
    try {
        $team = loadJsonData('team');
        $team = array_filter($team, function($member) use ($id) {
            return $member['id'] !== $id;
        });
        
        saveJsonData('team', array_values($team));
        
        return ['success' => true, 'message' => 'Member deleted successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to delete member'];
    }
}

/**
 * Delete a news article
 */
function deleteNews($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid news ID'];
    }
    
    try {
        $news = loadJsonData('news');
        $news = array_filter($news, function($article) use ($id) {
            return $article['id'] !== $id;
        });
        
        saveJsonData('news', array_values($news));
        
        return ['success' => true, 'message' => 'News deleted successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to delete news'];
    }
}

/**
 * Delete a blog post
 */
function deleteBlog($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid blog ID'];
    }
    
    try {
        $blog = loadJsonData('blog');
        $blog = array_filter($blog, function($post) use ($id) {
            return $post['id'] !== $id;
        });
        
        saveJsonData('blog', array_values($blog));
        
        return ['success' => true, 'message' => 'Blog post deleted successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to delete blog post'];
    }
}

/**
 * Delete a gallery item
 */
function deleteGallery($input) {
    requireAuth();
    
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        return ['success' => false, 'message' => 'Invalid gallery ID'];
    }
    
    try {
        $gallery = loadJsonData('gallery');
        $gallery = array_filter($gallery, function($item) use ($id) {
            return $item['id'] !== $id;
        });
        
        saveJsonData('gallery', array_values($gallery));
        
        return ['success' => true, 'message' => 'Gallery item deleted successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to delete gallery item'];
    }
}

/**
 * Save settings
 */
function saveSettings($input) {
    requireAuth();
    
    $type = $input['type'] ?? '';
    $settings = $input['settings'] ?? [];
    
    if (!$type || !$settings) {
        return ['success' => false, 'message' => 'Invalid settings data'];
    }
    
    try {
        $currentSettings = loadJsonData('settings');
        
        // Update settings based on type
        foreach ($settings as $key => $value) {
            $currentSettings[$key] = $value;
        }
        
        saveJsonData('settings', $currentSettings);
        
        return ['success' => true, 'message' => 'Settings saved successfully'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to save settings'];
    }
}

/**
 * Load JSON data from file
 */
function loadJsonData($filename) {
    $filepath = __DIR__ . "/../data/{$filename}.json";
    
    if (!file_exists($filepath)) {
        throw new Exception("Data file not found: {$filename}.json");
    }
    
    $content = file_get_contents($filepath);
    if ($content === false) {
        throw new Exception("Failed to read data file: {$filename}.json");
    }
    
    $data = json_decode($content, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON in data file: {$filename}.json");
    }
    
    return $data;
}

/**
 * Save JSON data to file
 */
function saveJsonData($filename, $data) {
    $filepath = __DIR__ . "/../data/{$filename}.json";
    
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new Exception("Failed to encode JSON data for: {$filename}.json");
    }
    
    $result = file_put_contents($filepath, $json);
    if ($result === false) {
        throw new Exception("Failed to write data file: {$filename}.json");
    }
    
    return true;
}

?>

