/* 轻量交互：吸顶阴影、移动端菜单、进入视口渐显。没有框架，没有依赖。 */
(function () {
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  /* ---- header shadow on scroll ---- */
  var head = document.getElementById("siteHead");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- mobile nav ---- */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("siteNav");
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        btn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && btn.getAttribute("aria-expanded") === "true") setOpen(false);
    });
  }

  /* ---- reveal on scroll ---- */
  var targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !targets.length) {
    doc.classList.add("no-io");
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  targets.forEach(function (t) {
    io.observe(t);
  });
})();
