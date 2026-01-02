// LocalStorage helpers with JSON parsing and error handling

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Storage save error [${key}]:`, e);
    return false;
  }
}

export function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data === null ? defaultValue : JSON.parse(data);
  } catch (e) {
    console.error(`Storage load error [${key}]:`, e);
    return defaultValue;
  }
}
