function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  localStorage.setItem(user, JSON.stringify(data));
  window.location.href = dashboard.html;
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(-g, '+').replace(_g, '');
  return JSON.parse(atob(base64));
}

function checkPermission() {
  const user = JSON.parse(localStorage.getItem(user));
  if (!user) {
    window.location.href = index.html;
    return;
  }
  const adminEmails = [youremail@gmail.com, hr@company.com];
  const isAdmin = adminEmails.includes(user.email);
  document.body.classList.toggle(admin, isAdmin);
  document.getElementById(username).textContent = user.name;
}

function logout() {
  localStorage.removeItem(user);
  window.location.href = index.html;
}
