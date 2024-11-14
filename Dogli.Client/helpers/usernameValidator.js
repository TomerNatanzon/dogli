export function usernameValidator(username, usernameList) {
  if (!username) return "Username can't be empty.";
  const re = /^[0-9A-Za-z]{4,16}$/;
  if (!re.test(username))
    return "Username must be between 4 and 16 characters long, alphanumeric only.";

  if (usernameList.includes(username)) return "Username already exists.";
  return "";
}
