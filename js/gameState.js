// Game state management
const gameState = {
  // Player info
  playerName: 'Zeeb0-0',
  
  // Timestamps
  startTime: null,
  totalPlayTime: 0, // in seconds
  lastPlayed: '2025-05-04 02:03:18',
  
  // Game state
  isPlaying: false,
  currentSaveSlot: null,
  
  // Save functionality
  saveSlots: [],
  
  // Initialize game state
  init() {
    this.loadFromLocalStorage();
    this.updateLastPlayed();
    this.updateUI();
  },
  
  // Update last played timestamp
  updateLastPlayed() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    this.lastPlayed = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  },
  
  // Start tracking play time
  startPlayTimeTracking() {
    this.startTime = Date.now();
    this.isPlaying = true;
  },
  
  // Stop tracking play time
  stopPlayTimeTracking() {
    if (this.startTime && this.isPlaying) {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.totalPlayTime += elapsedSeconds;
      this.isPlaying = false;
      this.startTime = null;
    }
  },
  
  // Format play time as hours, minutes, seconds
  getFormattedPlayTime() {
    let seconds = this.totalPlayTime;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  },
  
  // Save game state to local storage
  saveToLocalStorage() {
    const data = {
      playerName: this.playerName,
      totalPlayTime: this.totalPlayTime,
      lastPlayed: this.lastPlayed,
      saveSlots: this.saveSlots
    };
    
    localStorage.setItem('storyOfTimeGameState', JSON.stringify(data));
  },
  
  // Load game state from local storage
  loadFromLocalStorage() {
    const savedData = localStorage.getItem('storyOfTimeGameState');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      this.playerName = data.playerName || this.playerName;
      this.totalPlayTime = data.totalPlayTime || 0;
      this.lastPlayed = data.lastPlayed || this.lastPlayed;
      this.saveSlots = data.saveSlots || [];
    }
  },
  
  // Create a new save in the specified slot
  createSave(slotIndex) {
    // Create save data with current game state
    const saveData = {
      timestamp: this.lastPlayed,
      playTime: this.totalPlayTime,
      // Add other game state data here as needed
    };
    
    // Ensure saveSlots array is big enough
    while (this.saveSlots.length <= slotIndex) {
      this.saveSlots.push(null);
    }
    
    // Save to specified slot
    this.saveSlots[slotIndex] = saveData;
    this.saveToLocalStorage();
  },
  
  // Load a save from the specified slot
  loadSave(slotIndex) {
    if (slotIndex < this.saveSlots.length && this.saveSlots[slotIndex]) {
      const saveData = this.saveSlots[slotIndex];
      this.totalPlayTime = saveData.playTime || 0;
      // Load other game state data here as needed
      
      this.currentSaveSlot = slotIndex;
      return true;
    }
    return false;
  },
  
  // Update UI elements with current state
  updateUI() {
    const playerNameElement = document.getElementById('playerName');
    const lastUpdateElement = document.getElementById('lastUpdate');
    const playTimeElement = document.getElementById('playTime');
    const lastPlayedElement = document.getElementById('lastPlayed');
    
    if (playerNameElement) playerNameElement.textContent = `Player: ${this.playerName}`;
    if (lastUpdateElement) lastUpdateElement.textContent = `Last Update: ${this.lastPlayed}`;
    if (playTimeElement) playTimeElement.textContent = this.getFormattedPlayTime();
    if (lastPlayedElement) lastPlayedElement.textContent = this.lastPlayed;
  }
};