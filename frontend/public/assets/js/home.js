document.addEventListener("DOMContentLoaded", () => {
  // --- Navbar Style Change on Scroll ---
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // --- Smooth Scrolling for Anchor Links ---
  // The CSS 'scroll-behavior: smooth;' is good, but this offers more control if needed.
  // For now, we will rely on the CSS implementation. This is here for future extension.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Check if the link is just for scrolling on the same page
      if (this.hash !== "") {
        const targetElement = document.querySelector(this.hash);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // --- Scroll Animation Observer ---
  // Adds a 'visible' class to elements when they enter the viewport
  const animatedElements = document.querySelectorAll(
    ".feature-card, .step, .section-title"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Unobserve after the animation has run for performance.
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  animatedElements.forEach((el) => {
    observer.observe(el);
  });

  // Profile slider logic
  const profiles = [
    {
      img: "assets/images/Thu_Huong.png",
      name: "Thu Hương",
      desc: "19 tuổi • Trà Vinh",
    },
    {
      img: "assets/images/My_Tram.png",
      name: "Mỹ Trâm",
      desc: "21 tuổi • Nghệ An",
    },
    {
      img: "assets/images/Nhu_Y.png",
      name: "Như Ý",
      desc: "22 tuổi • Huế ",
    },
    {
      img: "assets/images/Nhat_Duy.png",
      name: "Nhật Duy",
      desc: "20 tuổi • Trà Vinh",
    },
    {
      img: "assets/images/Nhat_Huy.png",
      name: "Nhất Huy",
      desc: "20 tuổi • TP.HCM",
    },
  ];

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % profiles.length;
    document.getElementById("profile-img").src = profiles[idx].img;
    document.getElementById("profile-name").textContent = profiles[idx].name;
    document.getElementById("profile-desc").textContent = profiles[idx].desc;
  }, 2000);
});
