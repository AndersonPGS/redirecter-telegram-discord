export function isValidGroupId(id: string): boolean {
  if (!id || id.trim() === "" || id === "your_group_id") {
    return false;
  }
  try {
    BigInt(id);
    return true;
  } catch {
    return false;
  }
}

