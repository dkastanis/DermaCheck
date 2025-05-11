'use strict';

/** Add event listener on multiple elements */
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}

/** PRELOADER */
const preloader = document.querySelector("[data-preloader]");

window.addEventListener("load", function () {
  preloader?.classList.add("loaded");
  document.body.classList.add("loaded");
});

/** MOBILE NAVBAR */
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNav = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNav);

/** HEADER & BACK TO TOP */
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const activeElementOnScroll = function () {
  if (window.scrollY > 100) {
    header?.classList.add("active");
    backTopBtn?.classList.add("active");
  } else {
    header?.classList.remove("active");
    backTopBtn?.classList.remove("active");
  }
}

window.addEventListener("scroll", activeElementOnScroll);

/** SCROLL REVEAL */
const revealElements = document.querySelectorAll("[data-reveal]");

const revealElementOnScroll = function () {
  for (let i = 0, len = revealElements.length; i < len; i++) {
    if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15) {
      revealElements[i].classList.add("revealed");
    } else {
      revealElements[i].classList.remove("revealed");
    }
  }
}

window.addEventListener("scroll", revealElementOnScroll);
window.addEventListener("load", revealElementOnScroll);

/** TAB FUNCTIONALITY */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContent = document.querySelector("[data-tab-content]");

const tabTexts = {
  vision: `We envision a future in which every person, regardless of geography, income, or skin tone, can catch dermatological issues at their earliest, most treatable stage through frictionless, AI-enhanced assessments that fit seamlessly into everyday life. By normalizing routine skin checks as effortlessly as taking a daily step count, we aim to reduce global morbidity and mortality from skin cancer and other cutaneous diseases while empowering individuals to take charge of their skin health.`,

  mission: `Our mission is to build a clinically robust, privacy-first platform that combines AI-based imaging, explainable computer vision, and secure dermatologist collaboration to deliver instant, evidence-backed skin evaluations. We commit to meeting the highest medical-device standards, anchoring our algorithms in diverse data sets to minimize bias, and translating complex diagnostics into clear, actionable guidance that patients and clinicians alike can trust.`,

  strategy: `We will execute this mission through a three-pillar strategy: (1) Science & Safety—partner with leading academic centers for continuous algorithm validation, secure CE- and FDA-class registrations, and publish peer-reviewed outcomes; (2) Platform & Product—iterate a mobile-first UX that autofocuses, triages, and integrates with electronic health records and telederm networks via open APIs; and (3) Market & Growth—launch with high-risk populations through employer and insurer channels, expand via pharmacy kiosks and primary-care integrations across Europe and North America, and leverage real-world data to refine performance and unlock novel predictive dermatology services.`
};


addEventOnElements(tabButtons, "click", function (event) {
  const selectedTab = event.target.getAttribute("data-tab");

  // Fade-out effect
  tabContent.classList.remove("visible");

  setTimeout(() => {
    tabContent.textContent = tabTexts[selectedTab];
    tabContent.classList.add("visible");
  }, 100);

  // Toggle active class
  tabButtons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
});

/** SET DEFAULT TAB ON LOAD */
document.addEventListener("DOMContentLoaded", () => {
  const defaultTab = "vision";
  if (tabContent) {
    tabContent.textContent = tabTexts[defaultTab];
    tabContent.classList.add("visible");
  }
});
/** GOOGLE MAPS SEARCH */
document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector('input[name="location"]');
  const button = document.querySelector('.hero-card .btn');

  if (input && button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const query = input.value.trim();
      if (query) {
        const encodedQuery = encodeURIComponent(query);
        const mapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;
        window.open(mapsUrl, '_blank');
      }
    });
  }
});

/** GOOGLE MAPS SUGGESTIONS */
// This is a simple implementation of a suggestion list for cities.
// In a real-world application, you would likely want to fetch this data from a server.
document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector('input[name="location"]');
  const button = document.querySelector('.hero-card .btn');
  const suggestionList = document.getElementById('suggestion-list');

  const cities = [
  // Germany
  "Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dresden", "Leipzig", "Nuremberg", "Hannover", "Bremen", "Essen", "Mainz", "Freiburg", "Augsburg", "Wiesbaden", "Mannheim",

  // Austria
  "Vienna", "Linz", "Graz", "Salzburg", "Innsbruck", "Klagenfurt", "Wels", "St. Pölten", "Villach", "Bregenz",

  // Switzerland
  "Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lugano", "Lucerne", "St. Gallen",

  // UK
  "London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", "Glasgow", "Edinburgh", "Bristol", "Nottingham",

  // France
  "Paris", "Lyon", "Marseille", "Nice", "Toulouse", "Nantes", "Strasbourg", "Lille", "Grenoble",

  // Italy
  "Rome", "Milan", "Florence", "Naples", "Turin", "Bologna", "Venice", "Palermo", "Verona", "Genoa",

  // Spain
  "Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Zaragoza", "Malaga", "Alicante",

  // Netherlands
  "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven",

  // Other
  "Prague", "Bratislava", "Budapest", "Warsaw", "Krakow", "Copenhagen", "Oslo", "Stockholm", "Helsinki"
];


  // Autocomplete logic
  input.addEventListener("input", function () {
    const query = input.value.toLowerCase();
    suggestionList.innerHTML = "";

    if (query.length < 1) return;

    const matches = cities.filter(city => city.toLowerCase().startsWith(query));
    matches.forEach(city => {
      const li = document.createElement("li");
      li.textContent = city;
      li.addEventListener("click", () => {
        input.value = city;
        suggestionList.innerHTML = "";
      });
      suggestionList.appendChild(li);
    });
  });

  // Clear list when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".input-wrapper")) {
      suggestionList.innerHTML = "";
    }
  });

  // Google Maps redirect on button click
  if (input && button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const query = input.value.trim();
      if (query) {
        const encodedQuery = encodeURIComponent(query);
        const mapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;
        window.open(mapsUrl, '_blank');
      }
    });
  }
});

