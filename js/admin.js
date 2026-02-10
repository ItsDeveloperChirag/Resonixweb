/**
 * Resonix Society Admin Panel JavaScript
 * Handles all admin dashboard functionality
 */

// Global admin variables
let currentSection = 'dashboard';
let editingId = null;
let currentFilter = 'all';

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

/**
 * Initialize the admin panel
 */
function initializeAdminPanel() {
    // Check authentication
    checkAuthentication();
    
    // Initialize navigation
    initializeNavigation();
    
    // Load dashboard by default
    loadSection('dashboard');
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize mobile menu
    initializeMobileMenu();
}

/**
 * Check if user is authenticated
 */
async function checkAuthentication() {
    try {
        const response = await fetch('../php/admin_handler.php?action=check_auth');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = 'login.html';
        } else {
            // Update user info in navbar
            updateUserInfo(data.user);
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Update user info in navbar
 */
function updateUserInfo(user) {
    const userElement = document.getElementById('adminUserName');
    if (userElement && user) {
        userElement.textContent = user.name || 'Admin';
    }
}

/**
 * Initialize navigation
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Load section
            const section = this.dataset.section;
            loadSection(section);
        });
    });
}

/**
 * Initialize mobile menu
 */
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Modal save button
    document.getElementById('adminModalSave')?.addEventListener('click', handleModalSave);
    
    // Search functionality
    document.addEventListener('input', function(e) {
        if (e.target.id && e.target.id.endsWith('Search')) {
            handleSearch(e.target.value, e.target.id);
        }
    });
    
    // Logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'logout' })
        });
        
        const data = await response.json();
        if (data.success) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Load a specific section
 */
function loadSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section content
    switch (section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'events':
            loadEvents();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'team':
            loadTeamMembers();
            break;
        case 'news':
            loadNews();
            break;
        case 'blog':
            loadBlogPosts();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'contacts':
            loadContactMessages();
            break;
        case 'applications':
            loadApplications();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

/**
 * Load dashboard content
 */
async function loadDashboard() {
    try {
        // Load statistics
        const response = await fetch('../php/api.php?action=get_admin_stats');
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.stats);
            loadRecentActivities();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('dashboard-stats', 'Failed to load dashboard statistics');
    }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats(stats) {
    document.getElementById('total-events').textContent = stats.total_events || 0;
    document.getElementById('total-projects').textContent = stats.total_projects || 0;
    document.getElementById('total-members').textContent = stats.total_members || 0;
    document.getElementById('total-messages').textContent = stats.total_messages || 0;
    document.getElementById('active-events').textContent = stats.active_events || 0;
    document.getElementById('published-projects').textContent = stats.published_projects || 0;
}

/**
 * Load recent activities
 */
async function loadRecentActivities() {
    try {
        const response = await fetch('../php/api.php?action=get_recent_activities');
        const data = await response.json();
        
        if (data.success) {
            displayRecentActivities(data.activities);
        }
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

/**
 * Display recent activities
 */
function displayRecentActivities(activities) {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    if (!activities || activities.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent activities</p>';
        return;
    }
    
    const activitiesHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-time">${formatDateTime(activity.created_at)}</div>
                <div class="activity-text">${escapeHtml(activity.description)}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = activitiesHTML;
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type) {
    const icons = {
        'event': 'fa-calendar-plus',
        'project': 'fa-project-diagram',
        'member': 'fa-user-plus',
        'news': 'fa-newspaper',
        'blog': 'fa-blog',
        'gallery': 'fa-image',
        'default': 'fa-info-circle'
    };
    return icons[type] || icons.default;
}

/**
 * Load events for admin management
 */
async function loadEvents() {
    try {
        showLoading('events-content');
        const response = await fetch('../php/api.php?action=get_admin_events');
        const data = await response.json();
        
        if (data.success) {
            displayAdminEvents(data.events);
        } else {
            showError('events-content', 'Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showError('events-content', 'Error loading events');
    }
}

/**
 * Display events in admin interface
 */
function displayAdminEvents(events) {
    const container = document.getElementById('events-content');
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h4>No Events Found</h4>
                <p>No events have been created yet.</p>
                <button class="btn btn-primary" onclick="showAddEventModal()">
                    <i class="fas fa-plus me-2"></i>Add First Event
                </button>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div class="admin-toolbar">
            <div class="admin-search">
                <input type="text" class="form-control" id="eventsSearch" placeholder="Search events...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="admin-filters">
                <select class="form-select" id="eventsFilter">
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="active">Active</option>
                </select>
                <button class="btn btn-primary" onclick="showAddEventModal()">
                    <i class="fas fa-plus me-2"></i>Add Event
                </button>
            </div>
        </div>
        <div class="table-container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Registrations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${events.map(event => `
                        <tr>
                            <td>${escapeHtml(event.title)}</td>
                            <td>${formatDate(event.date)}</td>
                            <td><span class="badge bg-primary">${escapeHtml(event.type)}</span></td>
                            <td><span class="badge ${getStatusBadgeClass(event.status)}">${escapeHtml(event.status)}</span></td>
                            <td>${event.registration_count || 0}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editEvent(${event.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-info" onclick="viewEventRegistrations(${event.id})" title="View Registrations">
                                        <i class="fas fa-users"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEvent(${event.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Initialize search for events
    initializeTableSearch('eventsSearch', 'events');
}

/**
 * Load projects for admin management
 */
async function loadProjects() {
    try {
        showLoading('projects-content');
        const response = await fetch('../php/api.php?action=get_admin_projects');
        const data = await response.json();
        
        if (data.success) {
            displayAdminProjects(data.projects);
        } else {
            showError('projects-content', 'Failed to load projects');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('projects-content', 'Error loading projects');
    }
}

/**
 * Display projects in admin interface
 */
function displayAdminProjects(projects) {
    const container = document.getElementById('projects-content');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-project-diagram"></i>
                <h4>No Projects Found</h4>
                <p>No projects have been submitted yet.</p>
                <button class="btn btn-primary" onclick="showAddProjectModal()">
                    <i class="fas fa-plus me-2"></i>Add First Project
                </button>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div class="admin-toolbar">
            <div class="admin-search">
                <input type="text" class="form-control" id="projectsSearch" placeholder="Search projects...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="admin-filters">
                <select class="form-select" id="projectsFilter">
                    <option value="all">All Projects</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                </select>
                <button class="btn btn-primary" onclick="showAddProjectModal()">
                    <i class="fas fa-plus me-2"></i>Add Project
                </button>
            </div>
        </div>
        <div class="table-container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Team</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(project => `
                        <tr>
                            <td>${escapeHtml(project.title)}</td>
                            <td><span class="badge bg-secondary">${escapeHtml(project.category)}</span></td>
                            <td>${escapeHtml(project.team_members || 'Individual')}</td>
                            <td><span class="badge ${getStatusBadgeClass(project.status)}">${escapeHtml(project.status)}</span></td>
                            <td>${formatDate(project.created_at)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editProject(${project.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-success" onclick="approveProject(${project.id})" ${project.status === 'published' ? 'disabled' : ''} title="Approve">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${project.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Initialize search for projects
    initializeTableSearch('projectsSearch', 'projects');
}

/**
 * Load team members for admin management
 */
async function loadTeamMembers() {
    try {
        showLoading('team-content');
        const response = await fetch('../php/api.php?action=get_admin_team_members');
        const data = await response.json();
        
        if (data.success) {
            displayAdminTeamMembers(data.members);
        } else {
            showError('team-content', 'Failed to load team members');
        }
    } catch (error) {
        console.error('Error loading team members:', error);
        showError('team-content', 'Error loading team members');
    }
}

/**
 * Display team members in admin interface
 */
function displayAdminTeamMembers(members) {
    const container = document.getElementById('team-content');
    
    if (!members || members.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>No Team Members Found</h4>
                <p>No team members have been added yet.</p>
                <button class="btn btn-primary" onclick="showAddMemberModal()">
                    <i class="fas fa-plus me-2"></i>Add First Member
                </button>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div class="admin-toolbar">
            <div class="admin-search">
                <input type="text" class="form-control" id="teamSearch" placeholder="Search team members...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="admin-filters">
                <select class="form-select" id="teamFilter">
                    <option value="all">All Members</option>
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Technical Lead">Technical Lead</option>
                    <option value="Member">Member</option>
                </select>
                <button class="btn btn-primary" onclick="showAddMemberModal()">
                    <i class="fas fa-plus me-2"></i>Add Member
                </button>
            </div>
        </div>
        <div class="table-container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map(member => `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="member-avatar me-2">
                                        ${member.image ? `<img src="${member.image}" alt="${escapeHtml(member.name)}" class="rounded-circle" width="32" height="32">` : `<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">${member.name.charAt(0)}</div>`}
                                    </div>
                                    ${escapeHtml(member.name)}
                                </div>
                            </td>
                            <td><span class="badge bg-info">${escapeHtml(member.role)}</span></td>
                            <td>${escapeHtml(member.email || 'N/A')}</td>
                            <td><span class="badge ${getStatusBadgeClass(member.status || 'active')}">${escapeHtml(member.status || 'Active')}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editMember(${member.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMember(${member.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Initialize search for team
    initializeTableSearch('teamSearch', 'team');
}

/**
 * Load news for admin management
 */
async function loadNews() {
    try {
        showLoading('news-content');
        const response = await fetch('../php/api.php?action=get_admin_news');
        const data = await response.json();
        
        if (data.success) {
            displayAdminNews(data.news);
        } else {
            showError('news-content', 'Failed to load news');
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showError('news-content', 'Error loading news');
    }
}

/**
 * Display news in admin interface
 */
function displayAdminNews(news) {
    const container = document.getElementById('news-content');
    
    if (!news || news.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h4>No News Articles Found</h4>
                <p>No news articles have been published yet.</p>
                <button class="btn btn-primary" onclick="showAddNewsModal()">
                    <i class="fas fa-plus me-2"></i>Add First Article
                </button>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div class="admin-toolbar">
            <div class="admin-search">
                <input type="text" class="form-control" id="newsSearch" placeholder="Search news...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="admin-filters">
                <select class="form-select" id="newsFilter">
                    <option value="all">All News</option>
                    <option value="announcement">Announcements</option>
                    <option value="achievement">Achievements</option>
                    <option value="event">Event Updates</option>
                    <option value="general">General</option>
                </select>
                <button class="btn btn-primary" onclick="showAddNewsModal()">
                    <i class="fas fa-plus me-2"></i>Add News
                </button>
            </div>
        </div>
        <div class="table-container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${news.map(article => `
                        <tr>
                            <td>${escapeHtml(article.title)}</td>
                            <td><span class="badge bg-info">${escapeHtml(article.type)}</span></td>
                            <td>${formatDate(article.date)}</td>
                            <td><span class="badge ${getStatusBadgeClass(article.status)}">${escapeHtml(article.status)}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editNews(${article.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteNews(${article.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Initialize search for news
    initializeTableSearch('newsSearch', 'news');
}

/**
 * Initialize table search functionality
 */
function initializeTableSearch(searchId, type) {
    const searchInput = document.getElementById(searchId);
    if (!searchInput) return;
    
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = this.value.toLowerCase();
            filterTableRows(searchTerm, type);
        }, 300);
    });
}

/**
 * Filter table rows based on search term
 */
function filterTableRows(searchTerm, type) {
    const table = document.querySelector(`#${type}-content table tbody`);
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm) || searchTerm === '';
        row.style.display = isVisible ? '' : 'none';
    });
}

/**
 * Get CSS class for status badges
 */
function getStatusBadgeClass(status) {
    const statusClasses = {
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'pending': 'bg-warning text-dark',
        'published': 'bg-success',
        'draft': 'bg-secondary',
        'approved': 'bg-success',
        'rejected': 'bg-danger',
        'upcoming': 'bg-info',
        'past': 'bg-secondary',
        'cancelled': 'bg-danger'
    };
    return statusClasses[status?.toLowerCase()] || 'bg-secondary';
}

/**
 * Show loading state
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>
    `;
}

/**
 * Show error state
 */
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            <h4>Error</h4>
            <p>${escapeHtml(message)}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="fas fa-refresh me-2"></i>Retry
            </button>
        </div>
    `;
}

/**
 * Handle search functionality
 */
function handleSearch(searchTerm, inputId) {
    const sectionType = inputId.replace('Search', '').toLowerCase();
    filterTableRows(searchTerm.toLowerCase(), sectionType);
}

/**
 * Handle modal save functionality
 */
function handleModalSave() {
    // Implementation depends on the current modal context
    console.log('Modal save clicked');
}

/**
 * Show add event modal
 */
function showAddEventModal() {
    showToast('Add Event feature will be implemented with a full form modal', 'info');
}

/**
 * Edit event
 */
function editEvent(eventId) {
    showToast(`Edit Event ${eventId} - Feature coming soon`, 'info');
}

/**
 * Delete event
 */
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_event',
                id: eventId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Event deleted successfully', 'success');
            loadEvents(); // Reload events
        } else {
            showToast('Failed to delete event', 'error');
        }
    } catch (error) {
        console.error('Delete event error:', error);
        showToast('Error deleting event', 'error');
    }
}

/**
 * View event registrations
 */
function viewEventRegistrations(eventId) {
    showToast(`View registrations for Event ${eventId} - Feature coming soon`, 'info');
}

/**
 * Show add project modal
 */
function showAddProjectModal() {
    showToast('Add Project feature will be implemented with a full form modal', 'info');
}

/**
 * Edit project
 */
function editProject(projectId) {
    showToast(`Edit Project ${projectId} - Feature coming soon`, 'info');
}

/**
 * Approve project
 */
async function approveProject(projectId) {
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'approve_project',
                id: projectId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Project approved successfully', 'success');
            loadProjects(); // Reload projects
        } else {
            showToast('Failed to approve project', 'error');
        }
    } catch (error) {
        console.error('Approve project error:', error);
        showToast('Error approving project', 'error');
    }
}

/**
 * Delete project
 */
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_project',
                id: projectId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Project deleted successfully', 'success');
            loadProjects(); // Reload projects
        } else {
            showToast('Failed to delete project', 'error');
        }
    } catch (error) {
        console.error('Delete project error:', error);
        showToast('Error deleting project', 'error');
    }
}

/**
 * Show add member modal
 */
function showAddMemberModal() {
    showToast('Add Member feature will be implemented with a full form modal', 'info');
}

/**
 * Edit member
 */
function editMember(memberId) {
    showToast(`Edit Member ${memberId} - Feature coming soon`, 'info');
}

/**
 * Delete member
 */
async function deleteMember(memberId) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_member',
                id: memberId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Member deleted successfully', 'success');
            loadTeamMembers(); // Reload members
        } else {
            showToast('Failed to delete member', 'error');
        }
    } catch (error) {
        console.error('Delete member error:', error);
        showToast('Error deleting member', 'error');
    }
}

/**
 * Show add news modal
 */
function showAddNewsModal() {
    showToast('Add News feature will be implemented with a full form modal', 'info');
}

/**
 * Edit news
 */
function editNews(newsId) {
    showToast(`Edit News ${newsId} - Feature coming soon`, 'info');
}

/**
 * Delete news
 */
async function deleteNews(newsId) {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_news',
                id: newsId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('News deleted successfully', 'success');
            loadNews(); // Reload news
        } else {
            showToast('Failed to delete news', 'error');
        }
    } catch (error) {
        console.error('Delete news error:', error);
        showToast('Error deleting news', 'error');
    }
}

/**
 * Load blog posts for admin management
 */
async function loadBlogPosts() {
    try {
        showLoading('blog-content');
        const response = await fetch('../php/api.php?action=get_admin_blog_posts');
        const data = await response.json();
        
        if (data.success) {
            displayAdminBlogPosts(data.posts);
        } else {
            showError('blog-content', 'Failed to load blog posts');
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError('blog-content', 'Error loading blog posts');
    }
}

/**
 * Display blog posts in admin interface
 */
function displayAdminBlogPosts(posts) {
    const container = document.getElementById('blog-content');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-blog"></i>
                <h4>No Blog Posts Found</h4>
                <p>No blog posts have been published yet.</p>
                <button class="btn btn-primary" onclick="showAddBlogModal()">
                    <i class="fas fa-plus me-2"></i>Add First Post
                </button>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div class="admin-toolbar">
            <div class="admin-search">
                <input type="text" class="form-control" id="blogSearch" placeholder="Search blog posts...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="admin-filters">
                <select class="form-select" id="blogFilter">
                    <option value="all">All Posts</option>
                    <option value="tutorial">Tutorials</option>
                    <option value="technology">Technology</option>
                    <option value="research">Research</option>
                    <option value="industry">Industry</option>
                    <option value="career">Career</option>
                </select>
                <button class="btn btn-primary" onclick="showAddBlogModal()">
                    <i class="fas fa-plus me-2"></i>Add Post
                </button>
            </div>
        </div>
        <div class="table-container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>${escapeHtml(post.title)}</td>
                            <td>${escapeHtml(post.author)}</td>
                            <td><span class="badge bg-info">${escapeHtml(post.category)}</span></td>
                            <td>${formatDate(post.date)}</td>
                            <td><span class="badge ${getStatusBadgeClass(post.status)}">${escapeHtml(post.status)}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editBlog(${post.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog(${post.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Initialize search for blog
    initializeTableSearch('blogSearch', 'blog');
}

/**
 * Show add blog modal
 */
function showAddBlogModal() {
    showToast('Add Blog Post feature will be implemented with a full form modal', 'info');
}

/**
 * Edit blog post
 */
function editBlog(blogId) {
    showToast(`Edit Blog Post ${blogId} - Feature coming soon`, 'info');
}

/**
 * Delete blog post
 */
async function deleteBlog(blogId) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_blog',
                id: blogId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Blog post deleted successfully', 'success');
            loadBlogPosts(); // Reload blog posts
        } else {
            showToast('Failed to delete blog post', 'error');
        }
    } catch (error) {
        console.error('Delete blog error:', error);
        showToast('Error deleting blog post', 'error');
    }
}

/**
 * Load gallery for admin management
 */
async function loadGallery() {
    try {
        showLoading('gallery-content');
        const response = await fetch('../php/api.php?action=get_admin_gallery');
        const data = await response.json();
        
        if (data.success) {
            displayAdminGallery(data.items);
        } else {
            showError('gallery-content', 'Failed to load gallery');
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        showError('gallery-content', 'Error loading gallery');
    }
}

/**
 * Display gallery in admin interface
 */
function displayAdminGallery(items) {
    const container = document.getElementById('gallery-content');
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h4>No Gallery Items Found</h4>
                <p>No photos or videos have been uploaded yet.</p>
                <button class="btn btn-primary" onclick="showAddGalleryModal()">
                    <i class="fas fa-plus me-2"></i>Add First Item
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="admin-toolbar">
            <div class="admin-search">
                <input type="text" class="form-control" id="gallerySearch" placeholder="Search gallery...">
                <i class="fas fa-search search-icon"></i>
            </div>
            <div class="admin-filters">
                <select class="form-select" id="galleryFilter">
                    <option value="all">All Items</option>
                    <option value="photos">Photos</option>
                    <option value="videos">Videos</option>
                </select>
                <button class="btn btn-primary" onclick="showAddGalleryModal()">
                    <i class="fas fa-plus me-2"></i>Add Item
                </button>
            </div>
        </div>
        <div class="row">
            ${items.map(item => `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card gallery-admin-item">
                        <div class="gallery-admin-preview">
                            ${item.type === 'photo' ? 
                                `<img src="${item.url}" alt="${escapeHtml(item.title)}" class="card-img-top" style="height: 200px; object-fit: cover;">` :
                                `<div class="video-preview d-flex align-items-center justify-content-center bg-light" style="height: 200px;">
                                    <i class="fas fa-video fa-3x text-muted"></i>
                                </div>`
                            }
                        </div>
                        <div class="card-body">
                            <h6 class="card-title">${escapeHtml(item.title)}</h6>
                            <p class="card-text small text-muted">${escapeHtml(item.category)}</p>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-outline-primary" onclick="editGallery(${item.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteGallery(${item.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Show add gallery modal
 */
function showAddGalleryModal() {
    showToast('Add Gallery Item feature will be implemented with a full form modal', 'info');
}

/**
 * Edit gallery item
 */
function editGallery(itemId) {
    showToast(`Edit Gallery Item ${itemId} - Feature coming soon`, 'info');
}

/**
 * Delete gallery item
 */
async function deleteGallery(itemId) {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_gallery',
                id: itemId
            })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Gallery item deleted successfully', 'success');
            loadGallery(); // Reload gallery
        } else {
            showToast('Failed to delete gallery item', 'error');
        }
    } catch (error) {
        console.error('Delete gallery error:', error);
        showToast('Error deleting gallery item', 'error');
    }
}

/**
 * Load contact messages
 */
async function loadContactMessages() {
    const container = document.getElementById('contacts-content');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-envelope"></i>
            <h4>Contact Messages</h4>
            <p>Contact messages are handled through Google Forms. Check your Google Forms responses for submitted messages.</p>
            <a href="https://docs.google.com/forms" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt me-2"></i>Open Google Forms
            </a>
        </div>
    `;
}

/**
 * Load applications
 */
async function loadApplications() {
    const container = document.getElementById('applications-content');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-user-plus"></i>
            <h4>Membership Applications</h4>
            <p>Membership applications are handled through Google Forms. Check your Google Forms responses for submitted applications.</p>
            <a href="https://docs.google.com/forms" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt me-2"></i>Open Google Forms
            </a>
        </div>
    `;
}

/**
 * Load settings
 */
async function loadSettings() {
    try {
        showLoading('settings-content');
        const response = await fetch('../php/api.php?action=get_settings');
        const data = await response.json();
        
        if (data.success) {
            displaySettings(data.settings);
        } else {
            showError('settings-content', 'Failed to load settings');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showError('settings-content', 'Error loading settings');
    }
}

/**
 * Display settings
 */
function displaySettings(settings) {
    const container = document.getElementById('settings-content');
    
    container.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5>General Settings</h5>
                    </div>
                    <div class="card-body">
                        <form id="settingsForm">
                            <div class="mb-3">
                                <label class="form-label">Society Name</label>
                                <input type="text" class="form-control" value="${escapeHtml(settings.society_name || 'Resonix Society')}" name="society_name">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Contact Email</label>
                                <input type="email" class="form-control" value="${escapeHtml(settings.contact_email || 'info@resonixsociety.org')}" name="contact_email">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Contact Phone</label>
                                <input type="tel" class="form-control" value="${escapeHtml(settings.contact_phone || '+1 (555) 123-4567')}" name="contact_phone">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Address</label>
                                <textarea class="form-control" rows="3" name="address">${escapeHtml(settings.address || 'Electronics Department, University Campus')}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">About Description</label>
                                <textarea class="form-control" rows="5" name="about_description">${escapeHtml(settings.about_description || 'Empowering ECE students through innovation, learning, and collaboration.')}</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Save Settings
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Social Media</h5>
                    </div>
                    <div class="card-body">
                        <form id="socialForm">
                            <div class="mb-3">
                                <label class="form-label">Facebook URL</label>
                                <input type="url" class="form-control" value="${escapeHtml(settings.facebook_url || '')}" name="facebook_url">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Twitter URL</label>
                                <input type="url" class="form-control" value="${escapeHtml(settings.twitter_url || '')}" name="twitter_url">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Instagram URL</label>
                                <input type="url" class="form-control" value="${escapeHtml(settings.instagram_url || '')}" name="instagram_url">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">LinkedIn URL</label>
                                <input type="url" class="form-control" value="${escapeHtml(settings.linkedin_url || '')}" name="linkedin_url">
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Save Social Links
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize settings forms
    initializeSettingsForms();
}

/**
 * Initialize settings forms
 */
function initializeSettingsForms() {
    const settingsForm = document.getElementById('settingsForm');
    const socialForm = document.getElementById('socialForm');
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveSettings(this, 'general');
        });
    }
    
    if (socialForm) {
        socialForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveSettings(this, 'social');
        });
    }
}

/**
 * Save settings
 */
async function saveSettings(form, type) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const response = await fetch('../php/admin_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save_settings',
                type: type,
                settings: data
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('Settings saved successfully', 'success');
        } else {
            showToast('Failed to save settings', 'error');
        }
    } catch (error) {
        console.error('Save settings error:', error);
        showToast('Error saving settings', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('admin-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'admin-toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'admin-toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast ${bgColor} text-white" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return 'Invalid Date';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

/**
 * Format datetime string
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Invalid DateTime';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid DateTime';
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

