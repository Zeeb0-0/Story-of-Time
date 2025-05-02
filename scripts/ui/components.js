export class UIComponents {
    static createButton(text, onClick, className = 'pixel-button') {
        const button = document.createElement('button');
        button.className = className;
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    static createSaveSlot(saveData, onClick) {
        const slot = document.createElement('div');
        slot.className = 'save-slot';
        
        if (saveData) {
            slot.innerHTML = `
                <div class="save-slot-header">
                    <span>Save ${saveData.id + 1}</span>
                </div>
                <div class="save-slot-info">
                    <div class="save-slot-timestamp">Saved: ${saveData.timestamp}</div>
                    <div class="save-slot-score">Score: ${saveData.gameState.score}</div>
                </div>
            `;
        } else {
            slot.classList.add('save-slot-empty');
            slot.innerHTML = `
                <div class="save-slot-header">
                    <span>Empty Slot</span>
                </div>
            `;
        }

        slot.addEventListener('click', onClick);
        return slot;
    }

    static createVolumeControl(id, label, value, onChange) {
        const container = document.createElement('div');
        container.className = 'volume-control';
        
        container.innerHTML = `
            <label for="${id}">${label}</label>
            <div class="slider-container">
                <input type="range" id="${id}" class="pixel-slider" 
                       min="0" max="100" value="${value * 100}">
                <span class="volume-value">${Math.round(value * 100)}%</span>
            </div>
        `;

        const slider = container.querySelector('input');
        const valueDisplay = container.querySelector('.volume-value');

        slider.addEventListener('input', (e) => {
            const newValue = e.target.value / 100;
            valueDisplay.textContent = `${Math.round(newValue * 100)}%`;
            onChange(newValue);
        });

        return container;
    }

    static createNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);

        return notification;
    }

    static createLoadingIndicator() {
        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.innerHTML = `
            <div class="coffee-cup-loader">
                <div class="coffee-liquid"></div>
                <div class="steam">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <p class="loading-text">Loading...</p>
        `;
        return loader;
    }
}