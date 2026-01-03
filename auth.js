<script>
  function protect() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      location.href = "signin.html";
    }
  }

  function logout() {
    localStorage.removeItem("isLoggedIn");
    location.href = "signin.html";
  }
</script>
