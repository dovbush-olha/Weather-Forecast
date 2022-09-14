export const tab = () => {
  const TAB_NAV = document.querySelectorAll(".tabs-nav__item");
  const TAB_CONTENT = document.querySelectorAll(".tab");
  let tabName;

  function selectTabContent(tabname) {
    TAB_CONTENT.forEach((element) => {
      if (element.classList.contains(tabname)) {
        element.classList.add("is-active");
      } else {
        element.classList.remove("is-active");
      }
    });
  }

  function selectTabNav() {
    TAB_NAV.forEach((element) => {
      element.classList.remove("is-active");
    });
    this.classList.add("is-active");
    tabName = this.getAttribute("data-tab-name");
    selectTabContent(tabName);
  }

  TAB_NAV.forEach((element) => {
    element.addEventListener("click", selectTabNav);
  });
};
