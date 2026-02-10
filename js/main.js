/**
 * Resonix Society - Main JavaScript File  -- Chirag Kothari n
 * Handles all frontend interactions and dynamic content loading
 * https://docs.google.com/forms/d/e/1FAIpQLSciLrY-TcpinEx3IvjeuWwQK7qQQEJqtwJHkO5R3Ohvl9BijQ/viewform?usp=pp_url&entry.971842918=Chirag&entry.2135182825=demo@gmail.com&entry.2015433295=1234569875&entry.1457715363=other&entry.2042268354=Hello+this+is+a+website+testing
 * https://docs.google.com/forms/d/e/1FAIpQLSfilnXXrbe84Ulfjk-InXCq9_qLtMNPdDeiPD44k99Zh199xA/viewform?usp=pp_url&entry.712840181=chirag&entry.724457763=demo@gmail.com&entry.207804137=20622008&entry.1252972316=3rd+year&entry.87136109=Internet+of+Things+(IoT)&entry.318594314=asdgjl
 */

// Global variables
let currentPage = 1;
let isLoading = false;
const ITEMS_PER_PAGE = 6;

// Google Forms URLs - Replace these with actual Google Form URLs
const GOOGLE_FORMS = {
    contact: 'https://docs.google.com/forms/d/e/1FAIpQLSciLrY-TcpinEx3IvjeuWwQK7qQQEJqtwJHkO5R3Ohvl9BijQ/formResponse',
    membership: 'https://docs.google.com/forms/d/e/1FAIpQLSfilnXXrbe84Ulfjk-InXCq9_qLtMNPdDeiPD44k99Zh199xA/formResponse',
    project: 'https://docs.google.com/forms/d/e/1FAIpQLSdn6wgVsSULWcwCeNknQl6ATWp2NSyPSwFb1x6BZXjnPZVThw/formResponse',
    // Direct Google Form
    event_registration: 'https://docs.google.com/forms/d/e/1FAIpQLSdn6wgVsSULWcwCeNknQl6ATWp2NSyPSwFb1x6BZXjnPZVThw/viewform?usp=sharing&ouid=114471309602321894352',
    newsletter: 'https://docs.google.com/forms/d/e/YOUR_NEWSLETTER_FORM_ID/formResponse'
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize page-specific functionality
    const currentPageName = getCurrentPageName();
    
    switch(currentPageName) {
        case 'index':
            initializeHomePage();
            break;
        case 'about':
            initializeAboutPage();
            break;
        case 'events':
            initializeEventsPage();
            break;
        case 'projects':
            initializeProjectsPage();
            break;
        case 'team':
            initializeTeamPage();
            break;
        case 'faq':
            initializeFAQPage();
            break;
        case 'news':
            initializeNewsPage();
            break;
        case 'blog':
            initializeBlogPage();
            break;
        case 'gallery':
            initializeGalleryPage();
            break;
        case 'contact':
            initializeContactPage();
            break;
    }
    
    // Initialize common functionality
    initializeCommonFeatures();
}

/**
 * Get current page name from URL
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

/**
 * Initialize common features across all pages
 */
function initializeCommonFeatures() {
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize tooltips and popovers
    initializeTooltips();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize newsletter subscriptions
    initializeNewsletterForms();
    
    // Add loading animations
    addLoadingAnimations();
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                showFormErrors(form);
            }
            form.classList.add('was-validated');
        });
    });
}

/**
 * Show form validation errors
 */
function showFormErrors(form) {
    const invalidFields = form.querySelectorAll(':invalid');
    if (invalidFields.length > 0) {
        invalidFields[0].focus();
        showToast('Please fill in all required fields correctly.', 'error');
    }
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[id$="Search"]');
    searchInputs.forEach(input => {
        let debounceTimer;
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = this.value.toLowerCase();
                filterContent(searchTerm, this.id);
            }, 300);
        });
    });
}

/**
 * Filter content based on search term
 */
function filterContent(searchTerm, inputId) {
    const pageType = inputId.replace('Search', '').toLowerCase();
    const contentItems = document.querySelectorAll(`[data-searchable="${pageType}"]`);
    
    contentItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm) || searchTerm === '';
        item.style.display = isVisible ? 'block' : 'none';
    });
}

/**
 * Initialize newsletter forms
 */
function initializeNewsletterForms() {
    const newsletterForms = document.querySelectorAll('#newsletterForm, #blogSubscribeForm');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            subscribeToNewsletter(email, this);
        });
    });
}

/**
 * Subscribe to newsletter via Google Forms
 */
async function subscribeToNewsletter(email, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;
        
        // Submit to Google Forms
        const success = await submitToGoogleForm(GOOGLE_FORMS.newsletter, {
            'entry.EMAIL_FIELD': email // Replace with actual entry ID from Google Form
        });
        
        if (success) {
            showToast('Successfully subscribed to newsletter!', 'success');
            form.reset();
        } else {
            showToast('Failed to subscribe. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Submit data to Google Forms
 */
async function submitToGoogleForm(formUrl, data) {
    try {
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value);
        }
        
        // Use no-cors mode for Google Forms submission
        const response = await fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        
        // no-cors mode doesn't allow reading response, so assume success
        return true;
    } catch (error) {
        console.error('Google Forms submission error:', error);
        return false;
    }
}

/**
 * Add loading animations to content
 */
function addLoadingAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('.mission-card, .goal-card, .team-card, .project-card, .event-card').forEach(el => {
        observer.observe(el);
    });
}

// HOME PAGE FUNCTIONALITY
/**
 * Initialize home page
 */
function initializeHomePage() {
    animateCounters();
    loadFeaturedContent();
}

/**
 * Animate counter numbers
 */
function animateCounters() {
    const counters = document.querySelectorAll('[id$="-count"]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

/**
 * Animate individual counter
 */
function animateCounter(element) {
    const target = parseInt(element.dataset.target) || Math.floor(Math.random() * 100) + 50;
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.floor(current);
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
    
    element.dataset.target = target;
}

/**
 * Load featured content for home page
 */
async function loadFeaturedContent() {
    try {
        const response = await fetch('php/api.php?action=get_stats');
        const data = await response.json();
        
        if (data.success) {
            // Update counters with real data
            if (data.stats.members) document.getElementById('members-count').dataset.target = data.stats.members;
            if (data.stats.projects) document.getElementById('projects-count').dataset.target = data.stats.projects;
            if (data.stats.events) document.getElementById('events-count').dataset.target = data.stats.events;
            if (data.stats.workshops) document.getElementById('workshops-count').dataset.target = data.stats.workshops;
        }
    } catch (error) {
        console.error('Error loading featured content:', error);
        // Set default values if API fails
        document.getElementById('members-count').dataset.target = '150';
        document.getElementById('projects-count').dataset.target = '4';
        document.getElementById('events-count').dataset.target = '80';
        document.getElementById('workshops-count').dataset.target = '120';
    }
}

// ABOUT PAGE FUNCTIONALITY
/**
 * Initialize about page
 */
function initializeAboutPage() {
    animateStats();
}

/**
 * Animate statistics on about page
 */
function animateStats() {
    const stats = {
        'members-count': 80,
        'projects-count': 4,
        'events-count': 5,
        'workshops-count': 120
    };
    
    Object.entries(stats).forEach(([id, target]) => {
        const element = document.getElementById(id);
        if (element) {
            element.dataset.target = target;
            animateCounter(element);
        }
    });
}

// EVENTS PAGE FUNCTIONALITY
/**
 * Initialize events page
 */
function initializeEventsPage() {
    loadEvents();
    initializeEventFilters();
    initializeEventRegistration();
}

/**
 * Load events from API
 */
async function loadEvents(filter = 'all') {
    const container = document.getElementById('events-container');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch(`php/api.php?action=get_events&filter=${filter}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        
        if (data.success) {
            displayEvents(data.events);
        } else {
            showError(container, 'Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showError(container, 'Error loading events');
    }
}

/**
 * Display events in the container
 */
function displayEvents(events) {
    const container = document.getElementById('events-container');
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No Events Found</h4>
                    <p>There are currently no events matching your criteria. Check back later for updates!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const eventsHTML = events.map(event => `
        <div class="col-lg-6 col-md-12 mb-3" data-searchable="events" data-aos="fade-up">
            <div class="event-card" onclick="showEventDetails(${event.id})">
                <div class="event-header">
                    <h5>${escapeHtml(event.title)}</h5>
                    <span class="event-type">${escapeHtml(event.type)}</span>
                </div>
                <div class="event-body">
                    <div class="event-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formatDate(event.date)} at ${event.time}</span>
                    </div>
                    <div class="event-location mb-2">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(event.location)}</span>
                    </div>
                    <p class="event-description">${escapeHtml(event.description)}</p>
                    <div class="event-actions">
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); registerForEvent(${event.id})">
                            <i class="fas fa-sign-in-alt"></i> Register
                        </button>
                        <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); shareEvent(${event.id})">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = eventsHTML;
}

/**
 * Initialize event filters
 */
function initializeEventFilters() {
    const filterButtons = document.querySelectorAll('.event-filters .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active', 'btn-primary');
            this.classList.remove('btn-outline-primary');
            
            // Filter events
            const filter = this.dataset.filter;
            loadEvents(filter);
        });
    });
}

/**
 * Initialize event registration
 */
function initializeEventRegistration() {
    // Event registration will be handled by individual event buttons
}

/**
 * Register for an event
 */
async function registerForEvent(eventId) {
    // Open Google Form in new tab for event registration
    const registrationUrl = `${GOOGLE_FORMS.event_registration}?entry.EVENT_ID_FIELD=${eventId}`;
    window.open(registrationUrl, '_blank');
    
    // Show success message
    const modal = new bootstrap.Modal(document.getElementById('registrationModal') || createRegistrationModal());
    modal.show();
}

/**
 * Create registration success modal
 */
function createRegistrationModal() {
    const modalHtml = `
        <div class="modal fade" id="registrationModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">Registration</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <i class="fas fa-external-link-alt fa-3x text-success mb-3"></i>
                        <h4>Registration Form Opened</h4>
                        <p>Please complete the registration form in the new tab that just opened.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" data-bs-dismiss="modal">Got it!</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('registrationModal');
}

/**
 * Show event details
 */
async function showEventDetails(eventId) {
    try {
        const response = await fetch(`php/api.php?action=get_event&id=${eventId}`);
        const data = await response.json();
        
        if (data.success) {
            displayEventModal(data.event);
        }
    } catch (error) {
        console.error('Error loading event details:', error);
    }
}

/**
 * Display event in modal
 */
function displayEventModal(event) {
    const modal = document.getElementById('eventModal');
    if (!modal) return;
    
    document.getElementById('eventModalTitle').textContent = event.title;
    document.getElementById('eventModalBody').innerHTML = `
        <div class="mb-3">
            <h6><i class="fas fa-calendar-alt me-2"></i>Date & Time</h6>
            <p>${formatDate(event.date)} at ${event.time}</p>
        </div>
        <div class="mb-3">
            <h6><i class="fas fa-map-marker-alt me-2"></i>Location</h6>
            <p>${escapeHtml(event.location)}</p>
        </div>
        <div class="mb-3">
            <h6><i class="fas fa-info-circle me-2"></i>Description</h6>
            <p>${escapeHtml(event.description)}</p>
        </div>
        ${event.requirements ? `
        <div class="mb-3">
            <h6><i class="fas fa-list me-2"></i>Requirements</h6>
            <p>${escapeHtml(event.requirements)}</p>
        </div>
        ` : ''}
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// PROJECTS PAGE FUNCTIONALITY
/**
 * Initialize projects page
 */
function initializeProjectsPage() {
    loadProjects();
    initializeProjectFilters();
}

/**
 * Load projects from API
 */
async function loadProjects(filter = 'all') {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch(`php/api.php?action=get_projects&filter=${filter}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        
        if (data.success) {
            displayProjects(data.projects);
        } else {
            showError(container, 'Failed to load projects');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showError(container, 'Error loading projects');
    }
}

/**
 * Display projects in the container
 */
function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No Projects Found</h4>
                    <p>There are currently no projects matching your criteria. Check back later for updates!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const projectsHTML = projects.map(project => `
        <div class="col-lg-4 col-md-6 mb-3" data-searchable="projects" data-aos="fade-up">
            <div class="project-card " onclick="showProjectDetails(${project.id})">
                <div class="project-image">
                    ${project.image ? `<img src="${project.image}" alt="${escapeHtml(project.title)}" class="img-fluid">` : '<i class="fas fa-project-diagram"></i>'}
                </div>
                <div class="project-body">
                    <span class="project-category">${escapeHtml(project.category)}</span>
                    <h5>${escapeHtml(project.title)}</h5>
                    <p>${escapeHtml(project.description)}</p>
                    <div class="project-tags">
                        ${project.technologies.map(tech => `<span class="project-tag">${escapeHtml(tech)}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = projectsHTML;
}

/**
 * Initialize project filters
 */
function initializeProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filters .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active', 'btn-primary');
            this.classList.remove('btn-outline-primary');
            
            // Filter projects
            const filter = this.dataset.filter;
            loadProjects(filter);
        });
    });
}

/**
 * Show project details
 */
async function showProjectDetails(projectId) {
    try {
        const response = await fetch(`php/api.php?action=get_project&id=${projectId}`);
        const data = await response.json();
        
        if (data.success) {
            displayProjectModal(data.project);
        }
    } catch (error) {
        console.error('Error loading project details:', error);
    }
}

/**
 * Display project in modal
 */
function displayProjectModal(project) {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    
    document.getElementById('projectModalTitle').textContent = project.title;
    document.getElementById('projectModalBody').innerHTML = `
        <div class="mb-3">
            <span class="project-category">${escapeHtml(project.category)}</span>
        </div>
        <div class="mb-3">
            <h6><i class="fas fa-info-circle me-2"></i>Description</h6>
            <p>${escapeHtml(project.description)}</p>
        </div>
        ${project.team_members ? `
        <div class="mb-3">
            <h6><i class="fas fa-users me-2"></i>Team Members</h6>
            <p>${escapeHtml(project.team_members)}</p>
        </div>
        ` : ''}
        <div class="mb-3">
            <h6><i class="fas fa-tools me-2"></i>Technologies Used</h6>
            <div class="project-tags">
                ${project.technologies.map(tech => `<span class="project-tag">${escapeHtml(tech)}</span>`).join('')}
            </div>
        </div>
        ${project.github_url ? `
        <div class="mb-3">
            <h6><i class="fab fa-github me-2"></i>Source Code</h6>
            <a href="${escapeHtml(project.github_url)}" target="_blank" class="btn btn-outline-primary btn-sm">
                <i class="fab fa-github me-2"></i>View on GitHub
            </a>
        </div>
        ` : ''}
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// TEAM PAGE FUNCTIONALITY
/**
 * Initialize team page
 */
function initializeTeamPage() {
    loadTeamMembers();
}

/**
 * Load team members from API
 */
async function loadTeamMembers() {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch('php/api.php?action=get_team_members');
        const data = await response.json();
        
        if (data.success) {
            displayTeamMembers(data.members);
        } else {
            showError(container, 'Failed to load team members');
        }
    } catch (error) {
        console.error('Error loading team members:', error);
        showError(container, 'Error loading team members');
    }
}

/**
 * Display team members in the container
 */
function displayTeamMembers(members) {
    const container = document.getElementById('team-container');
    
    if (!members || members.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No Team Members Found</h4>
                    <p>Team information is currently being updated. Please check back later!</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Group members by role
    const groupedMembers = groupMembersByRole(members);
    
    let membersHTML = '';
    Object.entries(groupedMembers).forEach(([role, roleMembers]) => {
        // const rowClass = roleMembers.length === 1 ? 'justify-content-center' : '';
        membersHTML += `
            <div class="mb-5 " data-aos="fade-up">
                <h3 class="section-title">${role}</h3>
                <div class="row d-flex justify-content-center " >
                    ${roleMembers.map(member => `
                        <div class="col-lg-4 col-md-6 mb-3" data-searchable="team">
                            <div class="team-card h-100 " onclick="showMemberDetails(${member.id})">
                                <div class="team-header">
                                    <div class="team-avatar">
                                        ${member.image ? `<img src="${member.image}" alt="${escapeHtml(member.name)}" class="img-fluid " style="width: 100%; height: 300px; object-fit: cover;">` : `<i class="fas fa-user"></i>`}
                                    </div>
                                    <h5>${escapeHtml(member.name)}</h5>
                                    <div class="team-role">${escapeHtml(member.role)}</div>
                                    <div class="team-role">${escapeHtml(member.position)}</div>
                                </div>
                                <div class="team-info">
                                    <p>${escapeHtml(member.bio)}</p>
                                    ${member.social ? `
                                    <div class="team-social">
                                        ${member.social.email ? `<a href="mailto:${member.social.email}"><i class="fas fa-envelope"></i></a>` : ''}
                                        ${member.social.linkedin ? `<a href="${member.social.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
                                        ${member.social.github ? `<a href="${member.social.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = membersHTML;
}

/**
 * Group members by role hierarchy
 */
function groupMembersByRole(members) {
    const roleHierarchy = ['Director','Department Head','Executives','Team Head', 'Technical Head'];
    const grouped = {};
    
    roleHierarchy.forEach(role => {
        const roleMembers = members.filter(member => member.role === role);
        if (roleMembers.length > 0) {
            grouped[role] = roleMembers;
        }
    });
    
    // Add any remaining roles not in hierarchy
    members.forEach(member => {
        if (!roleHierarchy.includes(member.role)) {
            if (!grouped[member.role]) {
                grouped[member.role] = [];
            }
            grouped[member.role].push(member);
        }
    });
    
    return grouped;
}

// NEWS PAGE FUNCTIONALITY
/**
 * Initialize news page
 */
function initializeNewsPage() {
    loadNews();
    initializeNewsFilters();
}

/**
 * Load news from API
 */
async function loadNews(filter = 'all') {
    const container = document.getElementById('news-container');
    const featuredContainer = document.getElementById('featured-news');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch(`php/api.php?action=get_news&filter=${filter}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.featured && featuredContainer) {
                displayFeaturedNews(data.featured);
            }
            displayNews(data.news);
        } else {
            showError(container, 'Failed to load news');
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showError(container, 'Error loading news');
    }
}

/**
 * Display featured news
 */
function displayFeaturedNews(featuredNews) {
    const container = document.getElementById('featured-news');
    if (!container || !featuredNews) return;
    
    container.innerHTML = `
        <div class="col-12">
            <div class="card featured-post position-relative" onclick="showNewsDetails(${featuredNews.id})">
                <span class="featured-badge">Featured</span>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h3>${escapeHtml(featuredNews.title)}</h3>
                            <div class="news-meta mb-3">
                                <span><i class="fas fa-calendar me-1"></i>${formatDate(featuredNews.date)}</span>
                                <span><i class="fas fa-tag me-1"></i>${escapeHtml(featuredNews.type)}</span>
                            </div>
                            <p class="lead">${escapeHtml(featuredNews.excerpt)}</p>
                        </div>
                        <div class="col-md-4">
                            <div class="news-image bg-light rounded d-flex align-items-center justify-content-center" style="height: 200px;">
                                ${featuredNews.image ? `<img src="${featuredNews.image}" alt="${escapeHtml(featuredNews.title)}" class="img-fluid rounded">` : '<i class="fas fa-newspaper fa-3x text-muted"></i>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display news in the container
 */
function displayNews(news) {
    const container = document.getElementById('news-container');
    
    if (!news || news.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No News Found</h4>
                    <p>There are currently no news articles matching your criteria. Check back later for updates!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const newsHTML = news.map(article => `
        <div class="col-lg-6 col-md-12" data-searchable="news">
            <div class="news-card" onclick="showNewsDetails(${article.id})">
                <div class="card-body">
                    <div class="news-meta mb-2">
                        <span><i class="fas fa-calendar me-1"></i>${formatDate(article.date)}</span>
                        <span class="news-type">${escapeHtml(article.type)}</span>
                    </div>
                    <h5>${escapeHtml(article.title)}</h5>
                    <p>${escapeHtml(article.excerpt)}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = newsHTML;
}

/**
 * Initialize news filters
 */
function initializeNewsFilters() {
    const filterButtons = document.querySelectorAll('.news-filters .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active', 'btn-primary');
            this.classList.remove('btn-outline-primary');
            
            // Filter news
            const filter = this.dataset.filter;
            loadNews(filter);
        });
    });
}

// BLOG PAGE FUNCTIONALITY
/**
 * Initialize blog page
 */
function initializeBlogPage() {
    loadBlogPosts();
    initializeBlogFilters();
    loadPopularPosts();
    loadTopAuthors();
}

/**
 * Load blog posts from API
 */
async function loadBlogPosts(category = 'all') {
    const container = document.getElementById('blog-container');
    const featuredContainer = document.getElementById('featured-post');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch(`php/api.php?action=get_blog_posts&category=${category}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.featured && featuredContainer) {
                displayFeaturedPost(data.featured);
            }
            displayBlogPosts(data.posts);
        } else {
            showError(container, 'Failed to load blog posts');
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError(container, 'Error loading blog posts');
    }
}

/**
 * Display featured blog post
 */
function displayFeaturedPost(post) {
    const container = document.getElementById('featured-post');
    if (!container || !post) return;
    
    container.innerHTML = `
        <div class="card featured-post position-relative" onclick="showBlogDetails(${post.id})">
            <span class="featured-badge">Featured Post</span>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h3>${escapeHtml(post.title)}</h3>
                        <div class="blog-meta mb-3">
                            <span><i class="fas fa-user me-1"></i>${escapeHtml(post.author)}</span>
                            <span><i class="fas fa-calendar me-1"></i>${formatDate(post.date)}</span>
                            <span><i class="fas fa-tag me-1"></i>${escapeHtml(post.category)}</span>
                        </div>
                        <p class="lead">${escapeHtml(post.excerpt)}</p>
                    </div>
                    <div class="col-md-4">
                        <div class="blog-image bg-light rounded d-flex align-items-center justify-content-center" style="height: 200px;">
                            ${post.image ? `<img src="${post.image}" alt="${escapeHtml(post.title)}" class="img-fluid rounded">` : '<i class="fas fa-blog fa-3x text-muted"></i>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display blog posts
 */
function displayBlogPosts(posts) {
    const container = document.getElementById('blog-container');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No Blog Posts Found</h4>
                    <p>There are currently no blog posts matching your criteria. Check back later for updates!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const postsHTML = posts.map(post => `
        <div class="blog-post" data-searchable="blog" onclick="showBlogDetails(${post.id})">
            <div class="blog-header">
                ${post.image ? `<img src="${post.image}" alt="${escapeHtml(post.title)}" class="img-fluid">` : '<i class="fas fa-blog"></i>'}
            </div>
            <div class="blog-content">
                <div class="blog-meta mb-2">
                    <span><i class="fas fa-user me-1"></i>${escapeHtml(post.author)}</span>
                    <span><i class="fas fa-calendar me-1"></i>${formatDate(post.date)}</span>
                    <span><i class="fas fa-tag me-1"></i>${escapeHtml(post.category)}</span>
                </div>
                <h5>${escapeHtml(post.title)}</h5>
                <p>${escapeHtml(post.excerpt)}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = postsHTML;
}

/**
 * Initialize blog filters
 */
function initializeBlogFilters() {
    const filterButtons = document.querySelectorAll('.blog-categories .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active', 'btn-primary');
            this.classList.remove('btn-outline-primary');
            
            // Filter posts
            const category = this.dataset.category;
            loadBlogPosts(category);
        });
    });
}

/**
 * Load popular posts
 */
async function loadPopularPosts() {
    const container = document.getElementById('popular-posts');
    if (!container) return;
    
    try {
        const response = await fetch('php/api.php?action=get_popular_posts&limit=5');
        const data = await response.json();
        
        if (data.success && data.posts) {
            const postsHTML = data.posts.map(post => `
                <div class="d-flex mb-3">
                    <div class="flex-shrink-0">
                        <div class="bg-light rounded" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-blog text-muted"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-1">${escapeHtml(post.title)}</h6>
                        <small class="text-muted">${formatDate(post.date)}</small>
                    </div>
                </div>
            `).join('');
            container.innerHTML = postsHTML;
        }
    } catch (error) {
        console.error('Error loading popular posts:', error);
    }
}

/**
 * Load top authors
 */
async function loadTopAuthors() {
    const container = document.getElementById('top-authors');
    if (!container) return;
    
    try {
        const response = await fetch('php/api.php?action=get_top_authors&limit=5');
        const data = await response.json();
        
        if (data.success && data.authors) {
            const authorsHTML = data.authors.map(author => `
                <div class="d-flex align-items-center mb-3">
                    <div class="flex-shrink-0">
                        <div class="bg-primary text-white rounded-circle" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            ${author.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h6 class="mb-0">${escapeHtml(author.name)}</h6>
                        <small class="text-muted">${author.post_count} posts</small>
                    </div>
                </div>
            `).join('');
            container.innerHTML = authorsHTML;
        }
    } catch (error) {
        console.error('Error loading top authors:', error);
    }
}

// GALLERY PAGE FUNCTIONALITY
/**
 * Initialize gallery page
 */
function initializeGalleryPage() {
    loadGalleryItems();
    initializeGalleryFilters();
}

/**
 * Load gallery items from API
 */
async function loadGalleryItems(filter = 'all', type = 'photos') {
    const container = document.getElementById(`${type}-container`);
    if (!container) return;
    
    showLoading(container);
    
    try {
        const response = await fetch(`php/api.php?action=get_gallery&filter=${filter}&type=${type}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        
        if (data.success) {
            if (type === 'photos') {
                displayGalleryPhotos(data.items);
            } else {
                displayGalleryVideos(data.items);
            }
        } else {
            showError(container, 'Failed to load gallery items');
        }
    } catch (error) {
        console.error('Error loading gallery items:', error);
        showError(container, 'Error loading gallery items');
    }
}

/**
 * Display gallery photos
 */
function displayGalleryPhotos(photos) {
    const container = document.getElementById('photos-container');
    
    if (!photos || photos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No Photos Found</h4>
                    <p>There are currently no photos matching your criteria. Check back later for updates!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const photosHTML = photos.map(photo => `
        <div class="col-lg-4 col-md-6" data-searchable="gallery" data-aos="fade-up">
            <div class="gallery-item" onclick="showImageModal('${photo.url}', '${escapeHtml(photo.title)}', '${escapeHtml(photo.description)}')">
                <div class="gallery-image" style="background-image: url('${photo.url}'); background-size: cover; background-position: center;">
                    <div class="gallery-overlay">
                        <i class="fas fa-search-plus fa-2x text-white"></i>
                    </div>
                </div>
                <div class="gallery-info">
                    <h6>${escapeHtml(photo.title)}</h6>
                    <p class="mb-0 text-muted">${escapeHtml(photo.category)}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = photosHTML;
}

/**
 * Display gallery videos
 */
function displayGalleryVideos(videos) {
    const container = document.getElementById('videos-container');
    
    if (!videos || videos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <h4>No Videos Found</h4>
                    <p>There are currently no videos matching your criteria. Check back later for updates!</p>
                </div>
            </div>
        `;
        return;
    }
    
    const videosHTML = videos.map(video => `
        <div class="col-lg-6 col-md-12" data-searchable="gallery" data-aos="fade-up">
            <div class="gallery-item" onclick="showVideoModal('${video.embed_url}', '${escapeHtml(video.title)}', '${escapeHtml(video.description)}')">
                <div class="gallery-image">
                    ${video.thumbnail ? `<img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" class="img-fluid">` : '<i class="fas fa-video"></i>'}
                    <div class="gallery-overlay">
                        <i class="fas fa-play fa-2x text-white"></i>
                    </div>
                </div>
                <div class="gallery-info">
                    <h6>${escapeHtml(video.title)}</h6>
                    <p class="mb-0 text-muted">${escapeHtml(video.category)}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = videosHTML;
}

/**
 * Initialize gallery filters
 */
function initializeGalleryFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filters .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active', 'btn-primary');
            this.classList.remove('btn-outline-primary');
            
            // Filter gallery
            const filter = this.dataset.filter;
            const activeTab = document.querySelector('.nav-tabs .nav-link.active');
            const type = activeTab.getAttribute('href') === '#videos' ? 'videos' : 'photos';
            loadGalleryItems(filter, type);
        });
    });
    
    // Tab change event
    document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
            const type = this.getAttribute('href') === '#videos' ? 'videos' : 'photos';
            const activeFilter = document.querySelector('.gallery-filters .btn.active').dataset.filter;
            loadGalleryItems(activeFilter, type);
        });
    });
}

/**
 * Show image in modal
 */
function showImageModal(imageUrl, title, description) {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    
    document.getElementById('imageModalTitle').textContent = title;
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('imageDescription').textContent = description;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * Show video in modal
 */
function showVideoModal(embedUrl, title, description) {
    const modal = document.getElementById('videoModal');
    if (!modal) return;
    
    document.getElementById('videoModalTitle').textContent = title;
    document.getElementById('modalVideo').src = embedUrl;
    document.getElementById('videoDescription').textContent = description;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Clear video src when modal closes
    modal.addEventListener('hidden.bs.modal', function() {
        document.getElementById('modalVideo').src = '';
    });
}

// CONTACT PAGE FUNCTIONALITY
/**
 * Initialize contact page
 */
function initializeContactPage() {
    initializeContactForms();
}

/**
 * Initialize contact forms
 */
function initializeContactForms() {
    // General Contact Form
    const generalForm = document.getElementById('generalContactForm');
    if (generalForm) {
        generalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitContactForm(this, 'general');
        });
    }
    
    // Membership Form
    const membershipForm = document.getElementById('membershipForm');
    if (membershipForm) {
        membershipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitContactForm(this, 'membership');
        });
    }
    
    // Project Submission Form
    const projectForm = document.getElementById('projectSubmissionForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            console.log("KR -- Submitting project form");
            e.preventDefault();



            // submitContactForm(this, 'project');
        });
    }
}

/**
 * Submit contact form to Google Forms
 */
async function submitContactForm(form, formType) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        // Prepare form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (like checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Map form data to Google Forms entry fields
              let googleFormData = new URLSearchParams();
        let formUrl = '';

        switch (formType) {
            case 'general':
                formUrl = GOOGLE_FORMS.contact;
                googleFormData.append('entry.971842918', data.name);
                googleFormData.append('entry.2135182825', data.email);
                googleFormData.append('entry.2015433295', data.phone);
                googleFormData.append('entry.1457715363', data.subject);
                googleFormData.append('entry.2042268354', data.message);
                break;

            case 'membership':
                formUrl = GOOGLE_FORMS.membership;
                googleFormData.append('entry.712840181', data.memberName);
                googleFormData.append('entry.724457763', data.memberEmail);
                googleFormData.append('entry.207804137', data.studentId);
                googleFormData.append('entry.1252972316', data.year);
                if (Array.isArray(data['interests[]'])) {
                    data['interests[]'].forEach(interest => googleFormData.append('entry.87136109', interest));
                } else if (data['interests[]']) {
                    googleFormData.append('entry.87136109', data['interests[]']);
                }
                googleFormData.append('entry.318594314', data.motivation);
                break;

            case 'project':
                formUrl = GOOGLE_FORMS.project;
                googleFormData.append('entry.269518996', data.projectLeader);
                googleFormData.append('entry.297730359', data.projectEmail);
                googleFormData.append('entry.1222953535', data.projectTitle);
                googleFormData.append('entry.2113824827', data.projectCategory);
                googleFormData.append('entry.1437653700', data.teamMembers);
                googleFormData.append('entry.199691774', data.projectDescription);
                googleFormData.append('entry.242361708', data.technologies);
                googleFormData.append('entry.1611967558', data.projectLinks);
                break;
        }

        await fetch(formUrl, {
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: googleFormData.toString()
        });

        showSuccessModal(getSuccessMessage(formType));
        form.reset();
    } catch (error) {
        console.error('Form submission error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function getSuccessMessage(formType) {
    switch (formType) {
        case 'general':
            return 'Your message has been sent successfully. We\'ll get back to you soon!';
        case 'membership':
            return 'Your membership application has been submitted successfully!';
        case 'project':
            return 'Your project details have been submitted successfully!';
        default:
            return 'Your submission has been received successfully!';
    }
}

function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    if (modal) {
        document.getElementById('successMessage').textContent = message;
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    } else {
        showToast(message, 'success');
    }
}






//            let googleFormData = new URLSearchParams();
// let formUrl = '';
// switch (formType) {
// case 'general':
// formUrl = GOOGLE_FORMS.contact;
// googleFormData.append('entry.971842918', data.name);
// googleFormData.append('entry.2135182825', data.email);
// googleFormData.append('entry.2015433295', data.phone);
// googleFormData.append('entry.1457715363', data.subject);
// googleFormData.append('entry.2042268354', data.message);
// break;
// }


// await fetch(formUrl, {
// method: 'POST',
// mode: 'no-cors',
// headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
// body: googleFormData.toString()
// });


// showSuccessModal(getSuccessMessage(formType));
// form.reset();
// } catch (error) {
// console.error('Form submission error:', error);
// showToast('An error occurred. Please try again.', 'error');
// } finally {
// submitBtn.innerHTML = originalText;
// submitBtn.disabled = false;
// }
// }


// /**
// * Get success message based on form type
// */
// function getSuccessMessage(formType) {
// switch (formType) {
// case 'general':
// return 'Your message has been sent successfully. We\'ll get back to you soon!';
// default:
// return 'Your submission has been received successfully!';
// }
// }


// /**
// * Show success modal
// */
// function showSuccessModal(message) {
// const modal = document.getElementById('successModal');
// if (modal) {
// document.getElementById('successMessage').textContent = message;
// const bootstrapModal = new bootstrap.Modal(modal);
// bootstrapModal.show();
// } else {
// showToast(message, 'success');
// }
// }




//         let googleFormData = {};
//         let formUrl = '';
        
//         switch (formType) {
//             case 'general':
//                 formUrl = GOOGLE_FORMS.contact;
//                 googleFormData = {
//                     'entry.NAME_FIELD': data.name,
//                     'entry.EMAIL_FIELD': data.email,
//                     'entry.PHONE_FIELD': data.phone,
//                     'entry.SUBJECT_FIELD': data.subject,
//                     'entry.MESSAGE_FIELD': data.message
//                 };
//                 break;
//             case 'membership':
//                 formUrl = GOOGLE_FORMS.membership;
//                 googleFormData = {
//                     'entry.NAME_FIELD': data.memberName,
//                     'entry.EMAIL_FIELD': data.memberEmail,
//                     'entry.STUDENT_ID_FIELD': data.studentId,
//                     'entry.YEAR_FIELD': data.year,
//                     'entry.INTERESTS_FIELD': Array.isArray(data['interests[]']) ? data['interests[]'].join(', ') : data['interests[]'],
//                     'entry.MOTIVATION_FIELD': data.motivation
//                 };
//                 break;
//             case 'project':
//                 formUrl = GOOGLE_FORMS.project;
//                 googleFormData = {
//                     'entry.LEADER_FIELD': data.projectLeader,
//                     'entry.EMAIL_FIELD': data.projectEmail,
//                     'entry.TITLE_FIELD': data.projectTitle,
//                     'entry.CATEGORY_FIELD': data.projectCategory,
//                     'entry.TEAM_FIELD': data.teamMembers,
//                     'entry.DESCRIPTION_FIELD': data.projectDescription,
//                     'entry.TECHNOLOGIES_FIELD': data.technologies,
//                     'entry.LINKS_FIELD': data.projectLinks
//                 };
//                 break;
//         }
        
//         // Submit to Google Forms
//         const success = await submitToGoogleForm(formUrl, googleFormData);
        
//         if (success) {
//             showSuccessModal(getSuccessMessage(formType));
//             form.reset();
//         } else {
//             showToast('Failed to submit form. Please try again.', 'error');
//         }
//     } catch (error) {
//         console.error('Form submission error:', error);
//         showToast('An error occurred. Please try again.', 'error');
//     } finally {
//         submitBtn.innerHTML = originalText;
//         submitBtn.disabled = false;
//     }
// }

// /**
//  * Get success message based on form type
//  */
// function getSuccessMessage(formType) {
//     switch (formType) {
//         case 'general':
//             return 'Your message has been sent successfully. We\'ll get back to you soon!';
//         case 'membership':
//             return 'Your membership application has been submitted. We\'ll review it and contact you shortly!';
//         case 'project':
//             return 'Your project has been submitted for review. We\'ll evaluate it and get back to you!';
//         default:
//             return 'Your submission has been received successfully!';
//     }
// }

// /**
//  * Show success modal
//  */
// function showSuccessModal(message) {
//     const modal = document.getElementById('successModal');
//     if (modal) {
//         document.getElementById('successMessage').textContent = message;
//         const bootstrapModal = new bootstrap.Modal(modal);
//         bootstrapModal.show();
//     } else {
//         showToast(message, 'success');
//     }
// }

// FAQ PAGE FUNCTIONALITY
/**
 * Initialize FAQ page
 */
function initializeFAQPage() {
    // FAQ functionality is already handled in the HTML with inline JavaScript
    // This function can be used for additional FAQ-specific features
}

// UTILITY FUNCTIONS
/**
 * Show loading state
 */
function showLoading(container) {
    container.innerHTML = `
        <div class="col-12">
            <div class="loading-spinner text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading...</p>
            </div>
        </div>
    `;
}

/**
 * Show error state
 */
function showError(container, message) {
    container.innerHTML = `
        <div class="col-12">
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error</h4>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh me-2"></i>Try Again
                </button>
            </div>
        </div>
    `;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
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
            month: 'long',
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

/**
 * Share event function
 */
function shareEvent(eventId) {
    const url = `${window.location.origin}/events.html?event=${eventId}`;
    const text = 'Check out this event from Resonix Society!';
    
    if (navigator.share) {
        navigator.share({
            title: text,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast('Event link copied to clipboard!', 'success');
        });
    }
}

/**
 * Show member details
 */
async function showMemberDetails(memberId) {
    try {
        const response = await fetch(`php/api.php?action=get_team_member&id=${memberId}`);
        const data = await response.json();
        
        if (data.success) {
            displayMemberModal(data.member);
        }
    } catch (error) {
        console.error('Error loading member details:', error);
    }
}

/**
 * Display member in modal
 */
function displayMemberModal(member) {
    const modal = document.getElementById('memberModal');
    if (!modal) return;
    
    document.getElementById('memberModalTitle').textContent = member.name;
    document.getElementById('memberModalBody').innerHTML = `
        <div class="text-center mb-4">
            <div class="team-avatar mx-auto">
                ${member.image ? `<img src="${member.image}" alt="${escapeHtml(member.name)}" class="img-fluid " style="width: 250px; height: 300px; object-fit: cover;">` : `<i class="fas fa-user"></i>`}
            </div>
            <h4>${escapeHtml(member.name)}</h4>
            <p class="team-role">${escapeHtml(member.role)}</p>
            <p class="team-role">${escapeHtml(member.position)}</p>
        </div>
        <div class="mb-3">
            <h6><i class="fas fa-info-circle me-2"></i>About</h6>
            <p>${escapeHtml(member.bio)}</p>
        </div>
        ${member.skills ? `
        <div class="mb-3">
            <h6><i class="fas fa-cogs me-2"></i>Skills</h6>
            <p>${escapeHtml(member.skills)}</p>
        </div>
        ` : ''}
        ${member.achievements ? `
        <div class="mb-3">
            <h6><i class="fas fa-trophy me-2"></i>Achievements</h6>
            <p>${escapeHtml(member.achievements)}</p>
        </div>
        ` : ''}
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * Show news details
 */
async function showNewsDetails(newsId) {
    try {
        const response = await fetch(`php/api.php?action=get_news_article&id=${newsId}`);
        const data = await response.json();
        
        if (data.success) {
            displayNewsModal(data.article);
        }
    } catch (error) {
        console.error('Error loading news details:', error);
    }
}

/**
 * Display news in modal
 */
function displayNewsModal(article) {
    const modal = document.getElementById('newsModal');
    if (!modal) return;
    
    document.getElementById('newsModalTitle').textContent = article.title;
    document.getElementById('newsModalBody').innerHTML = `
        <div class="mb-3">
            <div class="news-meta">
                <span><i class="fas fa-calendar me-1"></i>${formatDate(article.date)}</span>
                <span class="news-type">${escapeHtml(article.type)}</span>
            </div>
        </div>
        <div class="mb-3">
            ${article.content || article.excerpt}
        </div>
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * Show blog details
 */
async function showBlogDetails(postId) {
    try {
        const response = await fetch(`php/api.php?action=get_blog_post&id=${postId}`);
        const data = await response.json();
        
        if (data.success) {
            displayBlogModal(data.post);
        }
    } catch (error) {
        console.error('Error loading blog details:', error);
    }
}

/**
 * Display blog post in modal
 */
function displayBlogModal(post) {
    const modal = document.getElementById('blogModal');
    if (!modal) return;
    
    document.getElementById('blogModalTitle').textContent = post.title;
    document.getElementById('blogModalBody').innerHTML = `
        <div class="mb-3">
            <div class="blog-meta">
                <span><i class="fas fa-user me-1"></i>${escapeHtml(post.author)}</span>
                <span><i class="fas fa-calendar me-1"></i>${formatDate(post.date)}</span>
                <span><i class="fas fa-tag me-1"></i>${escapeHtml(post.category)}</span>
            </div>
        </div>
        <div class="mb-3">
            ${post.content || post.excerpt}
        </div>
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}
// Add scrolled class to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });