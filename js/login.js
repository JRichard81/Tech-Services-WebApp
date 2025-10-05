
function login(){
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  if(user === "ADMINISTRATOR" && pass === "ADMIN123456"){
    // Sesión administrador
    localStorage.setItem('tech-session', JSON.stringify({username: user, role: 'admin'}));
    window.location.href = "admin.html"; // 🚀 Va al CRUD
  } 
  else if(user && pass){
    // Usuario normal
    localStorage.setItem('tech-session', JSON.stringify({username: user, role: 'user'}));
    window.location.href = "index.html"; // 🚀 Va al home
  }
  else {
    alert("Por favor ingresa usuario y contraseña.");
  }
}

function togglePassword(){
  const input = document.getElementById('password');
  input.type = input.type === "password" ? "text" : "password";
}
