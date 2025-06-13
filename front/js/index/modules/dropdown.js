// js/index/modules/dropdown.js

export function show(selector) {
  document.querySelector(selector)?.classList.add('show');
}

export function hide(selector) {
  document.querySelector(selector)?.classList.remove('show');
}

export function closeAll() {
  hide('#notification-dropdown');
  hide('#user-dropdown');
  hide('#nav-student-services .dropdown-menu');
}
