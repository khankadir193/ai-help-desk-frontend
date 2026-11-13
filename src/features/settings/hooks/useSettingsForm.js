import { useState, useCallback, useMemo } from 'react';

function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!isDeepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

function getChangedFields(initial, current) {
  const diff = {};
  for (const key of Object.keys(current)) {
    if (!isDeepEqual(initial?.[key], current[key])) {
      diff[key] = current[key];
    }
  }
  return diff;
}

export function useSettingsForm({
  initialValues = {},
  onSave,
  validate: customValidate,
}) {
  const [initial, setInitial] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [prevInitialValues, setPrevInitialValues] = useState(initialValues);

  // Sync state during render when initialValues from server changes
  if (initialValues !== prevInitialValues && initialValues && Object.keys(initialValues).length > 0) {
    setPrevInitialValues(initialValues);
    setInitial(initialValues);
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSaveError(null);
  }

  // Dirty state calculation
  const isDirty = useMemo(() => {
    return !isDeepEqual(initial, values);
  }, [initial, values]);

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSuccess(false);
    setSaveError(null);
    // Clear field-specific error when modified
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (customValidate) {
        const validationErrors = customValidate(values);
        if (validationErrors && validationErrors[field]) {
          setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
        }
      }
    },
    [customValidate, values]
  );

  const handleCancel = useCallback(() => {
    setValues(initial);
    setErrors({});
    setTouched({});
    setSaveError(null);
    setIsSuccess(false);
  }, [initial]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (!isDirty || isSaving) return;

      // Run client validation
      if (customValidate) {
        const validationErrors = customValidate(values);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      const changedData = getChangedFields(initial, values);
      if (Object.keys(changedData).length === 0) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        const updated = await onSave(changedData);
        const nextInitial = updated || values;
        setInitial(nextInitial);
        setValues(nextInitial);
        setIsSuccess(true);
        setErrors({});
      } catch (err) {
        const errMessage =
          err?.response?.data?.message ||
          err?.userMessage ||
          'Failed to save settings. Please review the errors below.';
        setSaveError(errMessage);

        if (Array.isArray(err?.response?.data?.errors)) {
          const fieldErrors = {};
          err.response.data.errors.forEach((e) => {
            if (e.field) fieldErrors[e.field] = e.message;
          });
          setErrors(fieldErrors);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [isDirty, isSaving, customValidate, values, initial, onSave]
  );

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    isDirty,
    isSaving,
    saveError,
    isSuccess,
    handleChange,
    handleBlur,
    handleCancel,
    handleSubmit,
    setInitial,
  };
}

export default useSettingsForm;
