const cube = document.querySelector("#play-cube");

if (cube) {
  let toggled = false;

  cube.addEventListener("click", () => {
    toggled = !toggled;
    cube.setAttribute("color", toggled ? "#4ecdc4" : "#ff7a59");
    cube.setAttribute(
      "animation",
      `property: rotation; to: 0 ${toggled ? 215 : 35} 0; dur: 450; easing: easeInOutQuad`
    );
    cube.setAttribute(
      "animation__bounce",
      `property: position; to: 0 ${toggled ? 1.8 : 1.4} -3; dur: 450; easing: easeInOutQuad`
    );
  });
}
