const menuOpen = document.querySelector(".menu-btn");
const menuClose = document.querySelector(".close");
const overlay = document.querySelector(".menu");
const menuaclose = document.querySelector(".aclose")
const btn_paste = document.querySelector("#paste");
const input = document.querySelector("#inputurl");
const down_btn = document.querySelector("#download")

down_btn.innerHTML = "Download"
down_btn.disabled = false;

menuOpen.addEventListener("click", () => {
  overlay.classList.add("menu-active");
});

menuClose.addEventListener("click", () => {
  overlay.classList.remove("menu-active");
});

menuaclose.addEventListener("click", () => {
  overlay.classList.remove("menu-active")
})

btn_paste.addEventListener("click", () => {
  navigator.clipboard.readText().then((v) => (input.value = v));
});

function validateForm() {
  var x = document.forms["formin"]["url"].value;
  down_btn.innerHTML = "Processing.."
  down_btn.disabled = true;
  if (x == "") {
    var notif = document.getElementById("toast");
    notif.className = "show";
    down_btn.innerHTML = "Download"
    down_btn.disabled = false;
    setTimeout(function () {
      notif.className = notif.className.replace("show", "");
    }, 5000);
    return false;
  }
}
