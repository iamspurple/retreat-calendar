document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById("burger");
  burgerBtn.addEventListener("click", () => {
    burgerBtn.classList.toggle("active");
  });
});
