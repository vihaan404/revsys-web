// shivi.js - Valentine's Day Easter Egg
(function() {
    // 1. Inject the custom CSS for the modal and floating hearts
    const style = document.createElement('style');
    style.innerHTML = `
        #vday-trigger { position: fixed; bottom: 10px; right: 15px; color: #333; cursor: pointer; font-size: 14px; user-select: none; transition: color 0.3s; z-index: 1000; }
        #vday-trigger:hover { color: #e06c75; }
        
        #vday-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(18, 18, 18, 0.85); z-index: 2000; justify-content: center; align-items: center; flex-direction: column; text-align: center; backdrop-filter: blur(3px); }
        
        .vday-content { background: #1e1e1e; padding: 2.5rem; border-radius: 8px; border: 1px solid #e06c75; max-width: 400px; color: #fff; font-family: monospace; box-shadow: 0 4px 30px rgba(224, 108, 117, 0.15); z-index: 2001; }
        
        .vday-text { font-size: 18px; line-height: 1.5; margin-bottom: 20px; }
        .vday-highlight { color: #e06c75; font-weight: bold; font-size: 22px; display: block; margin-bottom: 10px;}
        
        #vday-close { background: #e06c75; color: #121212; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-family: monospace; font-size: 14px; }
        #vday-close:hover { background: #f07c85; }
        
        .floating-heart { position: fixed; color: #e06c75; pointer-events: none; animation: floatUp 4s ease-in forwards; z-index: 1999; }
        
        @keyframes floatUp {
            0% { opacity: 1; transform: translateY(100vh) scale(1); }
            100% { opacity: 0; transform: translateY(-10vh) scale(1.5); }
        }
    `;
    document.head.appendChild(style);

    // 2. Inject the tiny heart trigger in the bottom right corner
    const trigger = document.createElement('div');
    trigger.id = 'vday-trigger';
    trigger.innerHTML = '♥';
    document.body.appendChild(trigger);

    // 3. Inject the Modal (The Message)
    const modal = document.createElement('div');
    modal.id = 'vday-modal';
    modal.innerHTML = `
        <div class="vday-content">
            <span class="vday-highlight">Happy Valentine's Day</span>
            <div class="vday-text">You are looking lovely, Shivi. <br><br> I love you a lot. ❤️</div>
            <button id="vday-close">Back to studying</button>
        </div>
    `;
    document.body.appendChild(modal);

    // 4. The Logic (Clicking the heart opens modal and spawns floating hearts)
    trigger.addEventListener('click', () => {
        modal.style.display = 'flex';
        
        // Spawn 25 floating hearts randomly across the screen
        for(let i = 0; i < 25; i++) {
            setTimeout(spawnHeart, Math.random() * 800);
        }
    });

    // Close the modal
    document.getElementById('vday-close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Function to create a single floating heart
    function spawnHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '♥';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * 20 + 12) + 'px'; // Random sizes
        document.body.appendChild(heart);
        
        // Clean up the heart from the DOM after animation finishes
        setTimeout(() => heart.remove(), 4000);
    }
})();
