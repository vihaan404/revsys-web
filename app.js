// Step Intervals in days
const INTERVALS = [1, 3, 7, 14, 30, 60, 365];

// State
let fileHandle = null;
let topics = [];

// DOM Elements
const btnConnect = document.getElementById('btnConnect');
const syncStatus = document.getElementById('syncStatus');
const addForm = document.getElementById('addForm');
const btnAdd = document.getElementById('btnAdd');
const topicInput = document.getElementById('topicInput');
const tagInput = document.getElementById('tagInput');
const connectionWarning = document.getElementById('connectionWarning');
const dashboardQueue = document.getElementById('dashboardQueue');

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
        syncStatus.style.color = 'var(--success)';
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
        step: 0,
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

    if (topic.step < INTERVALS.length - 1) topic.step++;
    topic.nextReview = Date.now() + (INTERVALS[topic.step] * 24 * 60 * 60 * 1000);

    await saveToDisk();
    renderDashboard();
};

// 5. Render UI
function renderDashboard() {
    dashboardQueue.innerHTML = '';
    const now = Date.now();
    const dueTopics = topics.filter(t => t.nextReview <= now);

    if (dueTopics.length === 0) {
        dashboardQueue.innerHTML = '<p style="color: var(--text-dim);">All caught up!</p>';
        return;
    }

    dueTopics.sort((a, b) => a.nextReview - b.nextReview);

    dueTopics.forEach(topic => {
        const isOverdue = now > topic.nextReview + (24 * 60 * 60 * 1000); // 24hr threshold
        
        dashboardQueue.innerHTML += `
            <div class="card ${isOverdue ? 'overdue' : ''}">
                <span class="tag">${topic.tag}</span>
                <h3 class="topic-title">${topic.topic}</h3>
                <div class="status ${isOverdue ? 'overdue-text' : ''}">
                    ${isOverdue ? 'Overdue' : 'Due Today'}
                </div>
                <button class="btn-review" onclick="reviewTopic('${topic.id}')">Review</button>
            </div>
        `;
    });
}
