export const ALLOWED_TOP_LEVEL_CATEGORIES = ["Men", "Women", "Kids"];

export const isAllowedTopLevelCategory = (value = "") =>
  ALLOWED_TOP_LEVEL_CATEGORIES.some(
    (category) => category.toLowerCase() === String(value).trim().toLowerCase()
  );
