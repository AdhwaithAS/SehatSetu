export default function validateFormData(formData) {
  const passwordChecks = {
    hasMinLen: formData.password?.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password || ""),
    hasLower: /[a-z]/.test(formData.password || ""),
    hasNumber: /\d/.test(formData.password || ""),
    hasSymbol: /[^A-Za-z0-9]/.test(formData.password || ""),
  };

  const errors = {};

  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Enter a valid email";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (
    !(
      passwordChecks.hasMinLen &&
      passwordChecks.hasUpper &&
      passwordChecks.hasLower &&
      passwordChecks.hasNumber &&
      passwordChecks.hasSymbol
    )
  ) {
    errors.password = "Must be 8+ chars with upper, lower, number, symbol";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm your password";
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
    errors.phone = "Enter 10-digit phone";
  }

  if (!formData.dob) errors.dob = "Required";
  if (!formData.gender) errors.gender = "Required";
  if (!formData.qualification) errors.qualification = "Required";
  if (!formData.name) errors.name = "Required";
  if (!formData.hospital) errors.hospital = "Required";
  if (!formData.about) errors.about = "Required";
  if (!formData.address) errors.address = "Required";

  if (!formData.aadhar || !/^\d{12}$/.test(formData.aadhar)) {
    errors.aadhar = "Enter 12-digit Aadhar";
  }

  return errors;
}
