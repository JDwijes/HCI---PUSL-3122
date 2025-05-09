// Utility to get role safely
function getUserRole() {
    return localStorage.getItem('role')?.trim() || 'Guest';
  }
  
  // Check if current user is Admin
  function isAdmin() {
    const role = getUserRole().toLowerCase();
    return role.includes("admin");
  }
  
  // Center an object on canvas
  function centerCanvasObject(obj, canvas) {
    obj.x = canvas.width / 2;
    obj.y = canvas.height / 2;
  }
  
  // Generate a random color
  function getRandomColor() {
    const colors = ['#FF5722', '#3F51B5', '#4CAF50', '#FFC107', '#E91E63'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  