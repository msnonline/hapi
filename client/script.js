const form = document.getElementById("contactForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  const body = JSON.stringify({ name, email, message });

  try {
    const res = await fetch("/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const result = await res.json();
    if (res.ok) {
      status.textContent = "Email sent!";
      form.reset();
    } else {
      status.textContent = result.error || "Failed to send.";
    }
  } catch (err) {
    status.textContent = "Something went wrong.";
  }
});
