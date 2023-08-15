const menuOpen = document.querySelector(".menu-btn");
const menuClose = document.querySelector(".close");
const overlay = document.querySelector(".menu");
const menuaclose = document.querySelector(".aclose");
const desc = document.querySelector(".desc");
const share = document.querySelector("#share");

let trimString = function (string, length) {
  return string.length > length ? string.substring(0, length) + "..." : string;
};
desc.innerHTML = trimString(desc.innerHTML, 95);

share.addEventListener("click", (event) => {
  if (navigator.share) {
    navigator
      .share({
        text: "Ingin mengunduh video dan lagu TikTok? Coba RTIK sekarang!",
        url: "https://rtik.rams.my.id/",
      })
      .then(() => {
        var notif = document.getElementById("toast");
        notif.className = "show";
        setTimeout(function () {
          notif.className = notif.className.replace("show", "");
        }, 5000);
      })
      .catch((err) => console.error(err));
  } else {
    alert("The current browser does not support the share function. :(");
  }
});

menuOpen.addEventListener("click", () => {
  overlay.classList.add("menu-active");
});

menuClose.addEventListener("click", () => {
  overlay.classList.remove("menu-active");
});

menuaclose.addEventListener("click", () => {
  overlay.classList.remove("menu-active");
});
