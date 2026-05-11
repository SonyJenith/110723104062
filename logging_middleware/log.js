

const VALID_STACKS = ["backend", "frontend"];

const VALID_LEVELS = [
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
];

const VALID_PACKAGES = {
  backend: [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service",
    "auth",
    "config",
    "middleware",
    "utils",
  ],

  frontend: [
    "api",
    "component",
    "hook",
    "page",
    "state",
    "style",
    "auth",
    "config",
    "middleware",
    "utils",
  ],
};


async function Log(stack, level, packageName, message) {
  try {
    // validation logic

    const payload = {
      stack,
      level,
      package: packageName,
      message,
    };

    const response = await fetch(
      "http://4.224.186.213/evaluation-service/logs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log(data);

    return data;
  } catch (error) {
    console.error("Logger Error:", error.message);
  }
}

export default Log;