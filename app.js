// Step Intervals in days
const INTERVALS = [1, 3, 7, 14, 30, 60, 90, 180, 365];

// State
let fileHandle = null;
let topics = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// DOM Elements
const btnConnect = document.getElementById('btnConnect');
const syncStatus = document.getElementById('syncStatus');
const addForm = document.getElementById('addForm');
const btnAdd = document.getElementById('btnAdd');
const topicInput = document.getElementById('topicInput');
const tagInput = document.getElementById('tagInput');
const connectionWarning = document.getElementById('connectionWarning');
const dashboardQueue = document.getElementById('dashboardQueue');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const pageIndicator = document.getElementById('pageIndicator');

// 1. Connect File via File System Access API
btnConnect.addEventListener('click', async () => {
    try {
        [fileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'JSON Sync File', accept: {'application/json': ['.json']} }],
            multiple: false
        });

        const file = await fileHandle.getFile();
        const contents = await file.text();
        topics = contents ? JSON.parse(contents) : [];
        
        syncStatus.textContent = `Connected: ${file.name}`;
        syncStatus.style.color = '#98c379'; // Green success color
        btnAdd.disabled = false;
        connectionWarning.style.display = 'none';

        renderDashboard();
    } catch (error) {
        console.error("Connection failed.", error);
    }
});

// 2. Auto-Save Logic
async function saveToDisk() {
    if (!fileHandle) return;
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(topics, null, 2));
    await writable.close();
}

// 3. Add Topic
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTopic = {
        id: crypto.randomUUID(),
        topic: topicInput.value.trim(),
        tag: tagInput.value.trim(),
        step: 9, // Using 9 down to 0 logic
        nextReview: Date.now() + (INTERVALS[0] * 24 * 60 * 60 * 1000)
    };

    topics.push(newTopic);
    topicInput.value = '';
    tagInput.value = '';

    await saveToDisk();
    renderDashboard();
});

// 4. Handle Review Action
window.reviewTopic = async (id) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    // Assuming sequences go 9, 8, 7 down to 0
    if (topic.step > 0) topic.step--;
    
    // Reverse lookup for interval mapping (9 maps to index 0, 8 to 1, etc.)
    const intervalIndex = 9 - topic.step; 
    const intervalDays = INTERVALS[intervalIndex] || 365;

    topic.nextReview = Date.now() + (intervalDays * 24 * 60 * 60 * 1000);

    await saveToDisk();
    renderDashboard();
};

// Pagination Listeners
btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderDashboard();
    }
});

btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(topics.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderDashboard();
    }
});

// Helper: Format Date like "Feb 15 12:25"
function formatNextDate(ms) {
    const d = new Date(ms);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    return d.toLocaleString('en-US', options).replace(',', ''); 
}

// 5. Render UI
function renderDashboard() {
    dashboardQueue.innerHTML = '';
    const now = Date.now();

    if (topics.length === 0) {
        dashboardQueue.innerHTML = '<p style="color: var(--text-dim);">No topics added yet.</p>';
        btnPrev.disabled = true;
        btnNext.disabled = true;
        pageIndicator.textContent = "Page 1 / 1";
        return;
    }

    // Sort ALL topics by next review date (nearest first)
    topics.sort((a, b) => a.nextReview - b.nextReview);

    // Pagination Math
    const totalPages = Math.ceil(topics.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1; 

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTopics = topics.slice(startIndex, endIndex);

    // Update Pagination UI
    pageIndicator.textContent = `Page ${currentPage} / ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;

    // Render cards
    paginatedTopics.forEach(topic => {
        const isDue = topic.nextReview <= now;
        const dateStr = formatNextDate(topic.nextReview);
        
        // Only show button if due
        const buttonHtml = isDue 
            ? `<button class="btn-review" onclick="reviewTopic('${topic.id}')">Revised it</button>` 
            : ``; 

        dashboardQueue.innerHTML += `
            <div class="card ${isDue ? 'due' : ''}">
                <div class="card-header">
                    <span>Seq ${topic.step}</span>
                    <span>[${topic.tag}]</span>
                </div>
                
                <h3 class="topic-title">${topic.topic}</h3>
                
                <div class="status ${isDue ? 'due-text' : ''}">
                    ${isDue ? 'Requires Revision' : 'Stable'}
                </div>
                
                <div class="card-footer">
                    ${buttonHtml}
                    <span class="next-date">Next: ${dateStr}</span>
                </div>
            </div>
        `;
    });
}
