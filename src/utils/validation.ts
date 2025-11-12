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

export function hasValidGroupIds(groupIds: string[]): boolean {
  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    return false;
  }
  return groupIds.some((id) => isValidGroupId(id));
}
