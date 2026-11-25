import { useState, useEffect, useRef } from 'react';
import ticketService from '../services/ticketService';
import { isValidEmail } from '../utils/ticketValidators';
import styles from './CustomerFields.module.css';

export default function CustomerFields({
  customerName,
  customerEmail,
  onChange,
  disabled = false,
  isEditMode = false,
  inputRef = null,
  fieldErrors = {},
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const dropdownRef = useRef(null);

  const emailValid = Boolean(customerEmail && isValidEmail(customerEmail));
  const hasMinLength = Boolean(customerName && customerName.trim().length >= 2);
  const showDropdown = !disabled && !isEditMode && !isDismissed && hasMinLength && searchResults.length > 0;

  // Search customers on typing
  useEffect(() => {
    if (disabled || isEditMode || !hasMinLength) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const results = await ticketService.searchCustomers(customerName);
        if (isMounted) {
          setSearchResults(results || []);
          setIsDismissed(false);
        }
      } catch {
        // Ignore search errors
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [customerName, disabled, isEditMode, hasMinLength]);

  const handleSelectCustomer = (cust) => {
    setIsDismissed(true);
    onChange({
      customerName: cust.name,
      customerEmail: cust.email,
      customerId: cust.id,
    });
  };

  return (
    <div className={styles.row}>
      {/* Customer Name */}
      <div className={styles.fieldCol} ref={dropdownRef}>
        <label htmlFor="customer-name-input" className={styles.label}>
          Customer name <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="customer-name-input"
            ref={inputRef}
            type="text"
            className={styles.input}
            value={customerName}
            disabled={disabled}
            placeholder="Search or enter customer name"
            onChange={(e) =>
              onChange({ customerName: e.target.value, customerEmail, customerId: null })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            autoComplete="off"
            required
          />
          {showDropdown && (
            <div className={styles.autocompleteDropdown}>
              {searchResults.map((cust) => (
                <button
                  type="button"
                  key={cust.id}
                  className={styles.dropdownItem}
                  onClick={() => handleSelectCustomer(cust)}
                >
                  <span className={styles.custName}>{cust.name}</span>
                  <span className={styles.custEmail}>{cust.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={styles.subtext}>
          {isEditMode
            ? `Customer: ${customerName} · Existing customer`
            : 'Search customers or enter a new name.'}
        </span>
        {fieldErrors.customer_name && (
          <span className={styles.fieldErrorText}>{fieldErrors.customer_name}</span>
        )}
        {fieldErrors.customer_id && (
          <span className={styles.fieldErrorText}>{fieldErrors.customer_id}</span>
        )}
      </div>

      {/* Customer Email */}
      <div className={styles.fieldCol}>
        <label htmlFor="customer-email-input" className={styles.label}>
          Customer email <span className={styles.required}>*</span>
        </label>
        <input
          id="customer-email-input"
          type="email"
          className={`${styles.input} ${emailValid ? styles.validInput : ''}`}
          value={customerEmail}
          disabled={disabled}
          placeholder="customer@example.com"
          onChange={(e) =>
            onChange({ customerName, customerEmail: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          required
        />
        <span className={`${styles.subtext} ${emailValid ? styles.validText : ''}`}>
          {emailValid ? '✓ Valid email address' : 'Used for ticket updates and replies.'}
        </span>
        {fieldErrors.customer_email && (
          <span className={styles.fieldErrorText}>{fieldErrors.customer_email}</span>
        )}
      </div>
    </div>
  );
}
