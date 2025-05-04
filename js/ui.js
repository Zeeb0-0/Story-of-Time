// UI management and interactions
const UI = {
  // UI state
  isGameStarted: false,
  activeModal: null,

  // Initialize UI elements
  init() {
    this.setupEventListeners();
    this.populateSaveSlots();
  },

  // Setup event listeners for menu buttons
  setupEventListeners() {
    // Main menu buttons
    document.getElementById('startJourney').addEventListener('click', () => this.startGame());
    document.getElementById('continueJourney').addEventListener('click', () => this.showModal('saveSlotModal'));
    document.getElementById('settingsButton').addEventListener('click', () => this.showModal('settingsModal'));
    document.getElementById('statisticsButton').addEventListener('click', () => this.showModal('statisticsModal'));
    
    // Modal close buttons
    document.getElementById('closeStatsButton').addEventListener('click', () => this.hideModal('statisticsModal'));
    document.getElementById('closeSettingsButton').addEventListener('click', () => this.hideModal('settingsModal'));
    document.getElementById('backButton').addEventListener('click', () => this.hideModal('saveSlotModal'));
  },

  // Show a specific modal
  showModal(modalId) {
    // Hide any active modal first
    if (this.activeModal) {
      document.getElementById(this.activeModal).style.display = 'none';
    }
    
    // Show the requested modal
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      this.activeModal = modalId;
      
      // Update data if it's the statistics modal
      if (modalId === 'statisticsModal') {
        gameState.updateUI();
      }
    }
  },

  // Hide a specific modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      this.activeModal = null;
    }
  },

  // Start the game (new game)
  startGame() {
    this.hideMenu();
    this.isGameStarted = true;
    gameState.startPlayTimeTracking();
    
    // Create a new save in slot 0 automatically
    gameState.createSave(0);
  },

  // Continue game from save
  continueGame(saveIndex) {
    if (gameState.loadSave(saveIndex)) {
      this.hideMenu();
      this.isGameStarted = true;
      gameState.startPlayTimeTracking();
    }
  },

  // Hide the main menu
  hideMenu() {
    const menu = document.getElementById('mainMenu');
    if (menu) {
      menu.style.display = 'none';
    }
    
    // Hide any active modal as well
    if (this.activeModal) {
      this.hideModal(this.activeModal);
    }
  },

  // Show the main menu
  showMenu() {
    const menu = document.getElementById('mainMenu');
    if (menu) {
      menu.style.display = 'flex';
    }
    this.isGameStarted = false;
    gameState.stopPlayTimeTracking();
  },

  // Populate save slots in the UI
  populateSaveSlots() {
    const saveSlotContainer = document.querySelector('#saveSlotModal .modal-content');
    if (!saveSlotContainer) return;
    
    // Clear existing content
    saveSlotContainer.innerHTML = '';
    
    // Add empty message if no saves exist
    if (gameState.saveSlots.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'No saved games found.';
      saveSlotContainer.appendChild(emptyMsg);
      return;
    }
    
    // Create buttons for each save slot
    gameState.saveSlots.forEach((saveData, index) => {
      if (!saveData) return; // Skip empty slots
      
      const slotButton = document.createElement('button');
      slotButton.className = 'menu-button';
      slotButton.style.marginBottom = '10px';
      slotButton.textContent = `Save ${index + 1} - ${saveData.timestamp}`;
      slotButton.addEventListener('click', () => {
        this.continueGame(index);
      });
      
      saveSlotContainer.appendChild(slotButton);
    });
  },

  // Handle escape key for in-game menu
  handleEscape() {
    if (this.isGameStarted) {
      this.showMenu();
    } else if (this.activeModal) {
      this.hideModal(this.activeModal);
    }
  },
  
  // Save the current game
  saveGame() {
    if (gameState.currentSaveSlot !== null) {
      gameState.createSave(gameState.currentSaveSlot);
    } else {
      // If no current save slot, create in slot 0
      gameState.createSave(0);
    }
    // Update save slots UI
    this.populateSaveSlots();
  }
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  gameState.init();
  UI.init();
});