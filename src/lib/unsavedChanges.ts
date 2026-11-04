let hasUnsavedChanges = false;

export function setUnsavedChanges(value: boolean) {
  hasUnsavedChanges = value;
}

export function hasPendingUnsavedChanges() {
  return hasUnsavedChanges;
}
