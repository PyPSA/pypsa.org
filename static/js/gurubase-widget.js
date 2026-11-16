function inject() {
  const guruScript = document.createElement("script");
  guruScript.src = "https://widget.gurubase.io/widget.latest.min.js";
  guruScript.defer = true;
  guruScript.id = "guru-widget-id";

  const widgetSettings = {
    "data-widget-id": "tqTL5kS8poTJZDw1P9X1kHN9CNiDKIBgDG1dmMjRQBo",
    "data-text": "Ask AI",
    "data-margins": JSON.stringify({ bottom: "30px", right: "30px" }),
    "data-light-mode": "auto",
    "data-name": "PyPSA",
    "data-icon-url":
      "/favicon.svg",
    "data-bg-color": "#D10A49",
    "data-overlap-content": "true",
    "data-tooltip":
      "Ask questions about PyPSA. Please note that questions and answers are visible anonymously to the PyPSA team and GuruBase.",
    "data-tooltip-side": "left",
  };

  Object.entries(widgetSettings).forEach(([key, value]) => {
    guruScript.setAttribute(key, value);
  });

  document.body.appendChild(guruScript);
}

function scheduleInject() {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(inject, { timeout: 4000 });
  } else {
    setTimeout(inject, 2000);
  }
}

if (document.readyState === "complete") scheduleInject();
else window.addEventListener("load", scheduleInject);
