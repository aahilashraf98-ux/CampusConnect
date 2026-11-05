const COMPLAINTS_KEY = "schoolComplaints";
const IDEAS_KEY = "schoolIdeas";
const NOTICES_KEY = "schoolNotices";

function getData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

// 1. STUDENT IDEA REGISTER & VOTING
const ideaForm = document.getElementById("ideaForm");
if (ideaForm) {
    ideaForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const ideas = getData(IDEAS_KEY);
        const newIdea = {
            id: "IDEA" + Date.now(),
            title: document.getElementById("ideaTitle").value.trim(),
            category: document.getElementById("ideaCategory").value,
            description: document.getElementById("ideaDescription").value.trim(),
            author: document.getElementById("ideaAuthor").value.trim() || "Anonymous",
            votes: 1,
            status: "New"
        };
        ideas.unshift(newIdea);
        saveData(IDEAS_KEY, ideas);
        const msg = document.getElementById("ideaMessage");
        if (msg) {
            msg.textContent = "Idea submitted successfully!";
            msg.className = "mt-3 mb-0 text-success fw-bold";
        }
        ideaForm.reset();
        renderStudentIdeas();
    });
}

function renderStudentIdeas() {
    const container = document.getElementById("ideaList");
    if (!container) return;
    const ideas = getData(IDEAS_KEY);
    const filterEl = document.getElementById("ideaFilter");
    const filter = filterEl ? filterEl.value : "All";
    const filtered = ideas.filter(i => filter === "All" || i.category === filter);

    if (!filtered.length) {
        container.innerHTML = "<p class='text-muted mt-3'>No ideas found in this category.</p>";
        return;
    }

    container.innerHTML = filtered.map(i => `
        <div class="card p-3 mb-3 border-0 shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-1">${escapeHTML(i.title)}</h5>
                <span class="badge bg-secondary">${escapeHTML(i.category)}</span>
            </div>
            <p class="text-secondary small mb-2">${escapeHTML(i.description)}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">By: ${escapeHTML(i.author)}</small>
                <button class="btn btn-sm btn-outline-primary" onclick="voteIdea('${i.id}')">
                    <i class="bi bi-hand-thumbs-up"></i> Vote (${i.votes})
                </button>
            </div>
        </div>
    `).join("");
}

window.voteIdea = function(id) {
    const ideas = getData(IDEAS_KEY);
    const idea = ideas.find(i => i.id === id);
    if (idea) {
        idea.votes++;
        saveData(IDEAS_KEY, ideas);
        renderStudentIdeas();
    }
};

const ideaFilter = document.getElementById("ideaFilter");
if (ideaFilter) {
    ideaFilter.addEventListener("change", renderStudentIdeas);
}
renderStudentIdeas();

// 2. COMPLAINT REGISTER & TRACKING
const complaintForm = document.getElementById("complaintForm");
if (complaintForm) {
    complaintForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const categoryEl = document.getElementById("complaintCategory");
        const subjectEl = document.getElementById("complaintSubject");
        const detailsEl = document.getElementById("complaintDetails");
        const locationEl = document.getElementById("complaintLocation");
        const messageEl = document.getElementById("complaintMessage");

        if (!categoryEl || !subjectEl || !detailsEl) return;

        const complaint = {
            id: "MPS-" + Math.floor(100000 + Math.random() * 900000),
            category: categoryEl.value,
            subject: subjectEl.value.trim(),
            description: detailsEl.value.trim(),
            location: locationEl ? locationEl.value.trim() || "N/A" : "N/A",
            status: "Received",
            reply: "Waiting for admin review",
            date: new Date().toLocaleDateString()
        };

        const complaints = getData(COMPLAINTS_KEY);
        complaints.unshift(complaint);
        saveData(COMPLAINTS_KEY, complaints);

        if (messageEl) {
            messageEl.innerHTML = `Report created successfully! Reference ID: <strong>${complaint.id}</strong>`;
            messageEl.className = "mt-3 mb-0 text-success fw-bold";
        }
        complaintForm.reset();
    });
}

const trackForm = document.getElementById("trackForm");
if (trackForm) {
    trackForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const queryId = document.getElementById("trackingId").value.trim().toUpperCase();
        const complaints = getData(COMPLAINTS_KEY);
        const match = complaints.find(c => c.id.toUpperCase() === queryId);
        const resultContainer = document.getElementById("trackingResult");

        if (!match) {
            resultContainer.innerHTML = "<div class='alert alert-danger mt-3'>Reference number not found. Please check your ID.</div>";
            return;
        }

        resultContainer.innerHTML = `
            <div class="card p-3 mt-3 bg-light border-0 shadow-sm">
                <p class="mb-1"><strong>Reference ID:</strong> ${match.id}</p>
                <p class="mb-1"><strong>Subject:</strong> ${escapeHTML(match.subject)}</p>
                <p class="mb-1"><strong>Status:</strong> <span class="badge bg-primary">${escapeHTML(match.status)}</span></p>
                <p class="mb-0"><strong>Admin Response:</strong> ${escapeHTML(match.reply)}</p>
            </div>
        `;
    });
}

// 3. DYNAMIC NOTICES SYNC FOR STUDENT PAGE
function renderStudentNotices() {
    const container = document.getElementById("noticeListStudent");
    if (!container) return;

    const defaultNotices = [
        { title: "Student Innovation Exhibition", description: "Students can showcase creative models, technology projects and practical ideas." },
        { title: "Student Suggestions Welcome", description: "Use the Student Idea Register to suggest improvements for school life." }
    ];
    const notices = JSON.parse(localStorage.getItem(NOTICES_KEY) || JSON.stringify(defaultNotices));

    container.innerHTML = notices.map(n => {
        const title = typeof n === 'string' ? n : n.title;
        const description = typeof n === 'string' ? "Check school portal for updates." : (n.description || "");
        return `
            <div class="feature-card mt-3">
              <h5><i class="bi bi-calendar-event text-primary me-2"></i>${escapeHTML(title)}</h5>
              <p class="mb-0 text-secondary">${escapeHTML(description)}</p>
            </div>
        `;
    }).join("");
}

renderStudentNotices();
window.addEventListener("storage", function(e) {
    if (e.key === NOTICES_KEY) {
        renderStudentNotices();
    }
});