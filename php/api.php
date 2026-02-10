<?php
/**
 * Resonix Society API Endpoints
 * Handles all frontend API requests
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

// Get the action from query parameter or POST data
$action = $_GET['action'] ?? $_POST['action'] ?? null;

if (!$action) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No action specified']);
    exit;
}

// Route the request to appropriate function
try {
    switch ($action) {
        // Statistics
        case 'get_stats':
            echo json_encode(getStats());
            break;
        case 'get_admin_stats':
            echo json_encode(getAdminStats());
            break;
        case 'get_recent_activities':
            echo json_encode(getRecentActivities());
            break;

        // Events
        case 'get_events':
            echo json_encode(getEvents());
            break;
        case 'get_event':
            echo json_encode(getEvent());
            break;
        case 'get_admin_events':
            echo json_encode(getAdminEvents());
            break;

        // Projects
        case 'get_projects':
            echo json_encode(getProjects());
            break;
        case 'get_project':
            echo json_encode(getProject());
            break;
        case 'get_admin_projects':
            echo json_encode(getAdminProjects());
            break;

        // Team
        case 'get_team_members':
            echo json_encode(getTeamMembers());
            break;
        case 'get_team_member':
            echo json_encode(getTeamMember());
            break;
        case 'get_admin_team_members':
            echo json_encode(getAdminTeamMembers());
            break;

        // News
        case 'get_news':
            echo json_encode(getNews());
            break;
        case 'get_news_article':
            echo json_encode(getNewsArticle());
            break;
        case 'get_admin_news':
            echo json_encode(getAdminNews());
            break;

        // Blog
        case 'get_blog_posts':
            echo json_encode(getBlogPosts());
            break;
        case 'get_blog_post':
            echo json_encode(getBlogPost());
            break;
        case 'get_popular_posts':
            echo json_encode(getPopularPosts());
            break;
        case 'get_top_authors':
            echo json_encode(getTopAuthors());
            break;
        case 'get_admin_blog_posts':
            echo json_encode(getAdminBlogPosts());
            break;

        // Gallery
        case 'get_gallery':
            echo json_encode(getGallery());
            break;
        case 'get_admin_gallery':
            echo json_encode(getAdminGallery());
            break;

        // Settings
        case 'get_settings':
            echo json_encode(getSettings());
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

// Statistics Functions
function getStats() {
    try {
        $events = loadJsonData('events');
        $projects = loadJsonData('projects');
        $team = loadJsonData('team');
        
        return [
            'success' => true,
            'stats' => [
                'members' => count($team),
                'projects' => count($projects),
                'events' => count($events),
                'workshops' => count(array_filter($events, function($event) {
                    return $event['type'] === 'workshop';
                }))
            ]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load statistics'];
    }
}

function getAdminStats() {
    try {
        $events = loadJsonData('events');
        $projects = loadJsonData('projects');
        $team = loadJsonData('team');
        $news = loadJsonData('news');
        
        $activeEvents = count(array_filter($events, function($event) {
            return strtotime($event['date']) >= time() && $event['status'] === 'active';
        }));
        
        $publishedProjects = count(array_filter($projects, function($project) {
            return $project['status'] === 'published';
        }));
        
        return [
            'success' => true,
            'stats' => [
                'total_events' => count($events),
                'total_projects' => count($projects),
                'total_members' => count($team),
                'total_messages' => 0, // This would come from Google Forms
                'active_events' => $activeEvents,
                'published_projects' => $publishedProjects
            ]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin statistics'];
    }
}

function getRecentActivities() {
    // For demo purposes, generate some recent activities
    $activities = [
        [
            'type' => 'event',
            'description' => 'New workshop "IoT with Arduino" was created',
            'created_at' => date('Y-m-d H:i:s', time() - 3600)
        ],
        [
            'type' => 'project',
            'description' => 'Project "Smart Home System" was approved',
            'created_at' => date('Y-m-d H:i:s', time() - 7200)
        ],
        [
            'type' => 'member',
            'description' => 'New team member "John Doe" was added',
            'created_at' => date('Y-m-d H:i:s', time() - 14400)
        ],
        [
            'type' => 'news',
            'description' => 'News article "Society Achievements 2025" was published',
            'created_at' => date('Y-m-d H:i:s', time() - 21600)
        ]
    ];
    
    return [
        'success' => true,
        'activities' => $activities
    ];
}

// Events Functions
function getEvents() {
    try {
        $events = loadJsonData('events');
        $filter = $_GET['filter'] ?? 'all';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 6);
        
        // Apply filters
        if ($filter !== 'all') {
            $events = array_filter($events, function($event) use ($filter) {
                return $event['type'] === $filter;
            });
        }
        
        // Apply pagination
        $offset = ($page - 1) * $limit;
        $events = array_slice($events, $offset, $limit);
        
        return [
            'success' => true,
            'events' => array_values($events)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load events'];
    }
}

function getEvent() {
    try {
        $events = loadJsonData('events');
        $id = intval($_GET['id'] ?? 0);
        
        $event = array_filter($events, function($event) use ($id) {
            return $event['id'] === $id;
        });
        
        if (empty($event)) {
            return ['success' => false, 'message' => 'Event not found'];
        }
        
        return [
            'success' => true,
            'event' => array_values($event)[0]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load event'];
    }
}

function getAdminEvents() {
    try {
        $events = loadJsonData('events');
        
        // Add registration count (dummy data for demo)
        foreach ($events as &$event) {
            $event['registration_count'] = rand(10, 50);
        }
        
        return [
            'success' => true,
            'events' => $events
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin events'];
    }
}

// Projects Functions
function getProjects() {
    try {
        $projects = loadJsonData('projects');
        $filter = $_GET['filter'] ?? 'all';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 6);
        
        // Apply filters
        if ($filter !== 'all') {
            $projects = array_filter($projects, function($project) use ($filter) {
                return $project['category'] === $filter;
            });
        }
        
        // Only show published projects for public API
        $projects = array_filter($projects, function($project) {
            return $project['status'] === 'published';
        });
        
        // Apply pagination
        $offset = ($page - 1) * $limit;
        $projects = array_slice($projects, $offset, $limit);
        
        return [
            'success' => true,
            'projects' => array_values($projects)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load projects'];
    }
}

function getProject() {
    try {
        $projects = loadJsonData('projects');
        $id = intval($_GET['id'] ?? 0);
        
        $project = array_filter($projects, function($project) use ($id) {
            return $project['id'] === $id && $project['status'] === 'published';
        });
        
        if (empty($project)) {
            return ['success' => false, 'message' => 'Project not found'];
        }
        
        return [
            'success' => true,
            'project' => array_values($project)[0]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load project'];
    }
}

function getAdminProjects() {
    try {
        $projects = loadJsonData('projects');
        
        return [
            'success' => true,
            'projects' => $projects
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin projects'];
    }
}

// Team Functions
function getTeamMembers() {
    try {
        $team = loadJsonData('team');
        
        // Only show active members for public API
        $team = array_filter($team, function($member) {
            return ($member['status'] ?? 'active') === 'active';
        });
        
        return [
            'success' => true,
            'members' => array_values($team)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load team members'];
    }
}

function getTeamMember() {
    try {
        $team = loadJsonData('team');
        $id = intval($_GET['id'] ?? 0);
        
        $member = array_filter($team, function($member) use ($id) {
            return $member['id'] === $id && ($member['status'] ?? 'active') === 'active';
        });
        
        if (empty($member)) {
            return ['success' => false, 'message' => 'Team member not found'];
        }
        
        return [
            'success' => true,
            'member' => array_values($member)[0]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load team member'];
    }
}

function getAdminTeamMembers() {
    try {
        $team = loadJsonData('team');
        
        return [
            'success' => true,
            'members' => $team
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin team members'];
    }
}

// News Functions
function getNews() {
    try {
        $news = loadJsonData('news');
        $filter = $_GET['filter'] ?? 'all';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 6);
        
        // Apply filters
        if ($filter !== 'all') {
            $news = array_filter($news, function($article) use ($filter) {
                return $article['type'] === $filter;
            });
        }
        
        // Only show published articles for public API
        $news = array_filter($news, function($article) {
            return ($article['status'] ?? 'published') === 'published';
        });
        
        // Sort by date (newest first)
        usort($news, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        // Get featured article (first one)
        $featured = !empty($news) ? $news[0] : null;
        
        // Apply pagination to remaining articles
        $remainingNews = array_slice($news, 1);
        $offset = ($page - 1) * $limit;
        $paginatedNews = array_slice($remainingNews, $offset, $limit);
        
        return [
            'success' => true,
            'featured' => $featured,
            'news' => array_values($paginatedNews)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load news'];
    }
}

function getNewsArticle() {
    try {
        $news = loadJsonData('news');
        $id = intval($_GET['id'] ?? 0);
        
        $article = array_filter($news, function($article) use ($id) {
            return $article['id'] === $id && ($article['status'] ?? 'published') === 'published';
        });
        
        if (empty($article)) {
            return ['success' => false, 'message' => 'News article not found'];
        }
        
        return [
            'success' => true,
            'article' => array_values($article)[0]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load news article'];
    }
}

function getAdminNews() {
    try {
        $news = loadJsonData('news');
        
        return [
            'success' => true,
            'news' => $news
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin news'];
    }
}

// Blog Functions
function getBlogPosts() {
    try {
        $blog = loadJsonData('blog');
        $category = $_GET['category'] ?? 'all';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 6);
        
        // Apply filters
        if ($category !== 'all') {
            $blog = array_filter($blog, function($post) use ($category) {
                return $post['category'] === $category;
            });
        }
        
        // Only show published posts for public API
        $blog = array_filter($blog, function($post) {
            return ($post['status'] ?? 'published') === 'published';
        });
        
        // Sort by date (newest first)
        usort($blog, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        // Get featured post (first one)
        $featured = !empty($blog) ? $blog[0] : null;
        
        // Apply pagination to remaining posts
        $remainingPosts = array_slice($blog, 1);
        $offset = ($page - 1) * $limit;
        $paginatedPosts = array_slice($remainingPosts, $offset, $limit);
        
        return [
            'success' => true,
            'featured' => $featured,
            'posts' => array_values($paginatedPosts)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load blog posts'];
    }
}

function getBlogPost() {
    try {
        $blog = loadJsonData('blog');
        $id = intval($_GET['id'] ?? 0);
        
        $post = array_filter($blog, function($post) use ($id) {
            return $post['id'] === $id && ($post['status'] ?? 'published') === 'published';
        });
        
        if (empty($post)) {
            return ['success' => false, 'message' => 'Blog post not found'];
        }
        
        return [
            'success' => true,
            'post' => array_values($post)[0]
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load blog post'];
    }
}

function getPopularPosts() {
    try {
        $blog = loadJsonData('blog');
        $limit = intval($_GET['limit'] ?? 5);
        
        // Only show published posts
        $blog = array_filter($blog, function($post) {
            return ($post['status'] ?? 'published') === 'published';
        });
        
        // Sort by views (simulated with random for demo)
        shuffle($blog);
        
        return [
            'success' => true,
            'posts' => array_slice(array_values($blog), 0, $limit)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load popular posts'];
    }
}

function getTopAuthors() {
    try {
        $blog = loadJsonData('blog');
        $limit = intval($_GET['limit'] ?? 5);
        
        // Only show published posts
        $blog = array_filter($blog, function($post) {
            return ($post['status'] ?? 'published') === 'published';
        });
        
        // Count posts by author
        $authors = [];
        foreach ($blog as $post) {
            $author = $post['author'];
            if (!isset($authors[$author])) {
                $authors[$author] = ['name' => $author, 'post_count' => 0];
            }
            $authors[$author]['post_count']++;
        }
        
        // Sort by post count
        uasort($authors, function($a, $b) {
            return $b['post_count'] - $a['post_count'];
        });
        
        return [
            'success' => true,
            'authors' => array_slice(array_values($authors), 0, $limit)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load top authors'];
    }
}

function getAdminBlogPosts() {
    try {
        $blog = loadJsonData('blog');
        
        return [
            'success' => true,
            'posts' => $blog
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin blog posts'];
    }
}

// Gallery Functions
function getGallery() {
    try {
        $gallery = loadJsonData('gallery');
        $filter = $_GET['filter'] ?? 'all';
        $type = $_GET['type'] ?? 'photos';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 6);
        
        // Filter by type (photos or videos)
        $gallery = array_filter($gallery, function($item) use ($type) {
            return $item['type'] === ($type === 'videos' ? 'video' : 'photo');
        });
        
        // Apply category filters
        if ($filter !== 'all') {
            $gallery = array_filter($gallery, function($item) use ($filter) {
                return $item['category'] === $filter;
            });
        }
        
        // Apply pagination
        $offset = ($page - 1) * $limit;
        $gallery = array_slice($gallery, $offset, $limit);
        
        return [
            'success' => true,
            'items' => array_values($gallery)
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load gallery'];
    }
}

function getAdminGallery() {
    try {
        $gallery = loadJsonData('gallery');
        
        return [
            'success' => true,
            'items' => $gallery
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load admin gallery'];
    }
}

// Settings Functions
function getSettings() {
    try {
        $settings = loadJsonData('settings');
        
        return [
            'success' => true,
            'settings' => $settings
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Failed to load settings'];
    }
}

// Utility function to load JSON data
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

?>

