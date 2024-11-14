export function passwordValidator(password) {
  if (!password) return "Password can't be empty.";
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  const re = /(?=.*[A-Z])/;
  if (!re.test(password))
    return "Password must contain at least 1 uppercase alphabetical character.";
  return "";
}
