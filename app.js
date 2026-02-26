/**
 * =====================================================
 * EVENT REGISTRATION PORTAL — MAIN SCRIPT
 * =====================================================
 *
 * Features:
 *  - localStorage auto-fill (Name, Roll No, Phone)
 *  - Google Sheets integration via Google Apps Script
 *  - Full validation with toast notifications
 *  - Dark-mode toggle
 *  - Loading state & double-submit prevention
 *  - "Other" event custom input reveal
 *  - Success popup with form partial-reset
 * =====================================================
 */

'use strict';

/* =====================================================
   ① CONFIGURATION — PUT YOUR SCRIPT URL HERE
   ===================================================== */
/**
 * After deploying your Google Apps Script (see README),
 * paste the Web App URL below.
 */
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz6sJa0Vy4zF1oW3lse9Vc5JbAo8xVb5SX_IsHiTtEIbLlxIFnADmVM4uXNRvyuk_SDkQ/exec';

/* =====================================================
   ② DOM REFERENCES
   ===================================================== */
const form = document.getElementById('registration-form');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const themeToggle = document.getElementById('theme-toggle');

// Inputs
const nameInput = document.getElementById('name');
const rollInput = document.getElementById('roll');
const phoneInput = document.getElementById('phone');
const collegeInput = document.getElementById('college');
const eventNameInput = document.getElementById('event-name');
const eventStartDateInput = document.getElementById('event-start-date');
const eventEndDateInput = document.getElementById('event-end-date');
const eventCheckboxes = document.querySelectorAll('input[name="events"]');
const otherCheckbox = document.getElementById('ev-other');
const otherInput = document.getElementById('other-event');
const otherGroup = document.getElementById('group-other-event');

// Popup
const successPopup = document.getElementById('success-popup');
const popupClose = document.getElementById('popup-close');

// Toast
const toastContainer = document.getElementById('toast-container');

/* =====================================================
   ③ THEME TOGGLE
   ===================================================== */
(function initTheme() {
  // Restore saved preference or use system preference
  const saved = localStorage.getItem('ev_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ev_theme', next);
});

/* =====================================================
   ④ AUTO-FILL EVENT DATE (Today)
   ===================================================== */
(function setTodayDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  eventStartDateInput.value = today;
  eventEndDateInput.value = today;
})();

/* =====================================================
   ⑤ LOCAL STORAGE — AUTO-FILL
   ===================================================== */
const LS_KEYS = {
  name: 'ev_user_name',
  roll: 'ev_user_roll',
  phone: 'ev_user_phone',
};

/**
 * Load saved values into the form on page open.
 * Only Name, Roll Number, Phone are restored.
 */
function loadStoredUserData() {
  const savedName = localStorage.getItem(LS_KEYS.name);
  const savedRoll = localStorage.getItem(LS_KEYS.roll);
  const savedPhone = localStorage.getItem(LS_KEYS.phone);

  if (savedName) nameInput.value = savedName;
  if (savedRoll) rollInput.value = savedRoll;
  if (savedPhone) phoneInput.value = savedPhone;

  if (savedName || savedRoll || savedPhone) {
    showToast('ℹ️ Your saved details have been auto-filled.', 'info', 3500);
  }
}

/**
 * Persist Name, Roll Number, Phone to localStorage after submit.
 */
function storeUserData() {
  localStorage.setItem(LS_KEYS.name, nameInput.value.trim());
  localStorage.setItem(LS_KEYS.roll, rollInput.value.trim());
  localStorage.setItem(LS_KEYS.phone, phoneInput.value.trim());
}

// Run on page load
loadStoredUserData();

/* =====================================================
   ⑥ VALIDATION HELPERS
   ===================================================== */
/**
 * Show or clear field-level error.
 * @param {string}  fieldId  - id of the input (used to find error span)
 * @param {string}  groupId  - id of the .field-group wrapper
 * @param {string}  message  - error text (empty = clear error)
 */
function setFieldError(fieldId, groupId, message) {
  const errEl = document.getElementById(`error-${fieldId}`);
  const grpEl = document.getElementById(`group-${groupId}`);
  if (message) {
    if (errEl) errEl.textContent = message;
    if (grpEl) grpEl.classList.add('has-error');
  } else {
    if (errEl) errEl.textContent = '';
    if (grpEl) grpEl.classList.remove('has-error');
  }
}

/**
 * Run full form validation.
 * Returns { valid: boolean, data: object }.
 */
function validateForm() {
  let valid = true;

  // — Name —
  const name = nameInput.value.trim();
  if (!name) {
    setFieldError('name', 'name', 'Name is required.');
    valid = false;
  } else {
    setFieldError('name', 'name', '');
  }

  // — Roll Number —
  const roll = rollInput.value.trim();
  if (!roll) {
    setFieldError('roll', 'roll', 'Roll number is required.');
    valid = false;
  } else {
    setFieldError('roll', 'roll', '');
  }

  // — Phone —
  const phone = phoneInput.value.trim();
  if (!phone) {
    setFieldError('phone', 'phone', 'Phone number is required.');
    valid = false;
  } else if (!/^\d{10}$/.test(phone)) {
    setFieldError('phone', 'phone', 'Enter a valid 10-digit phone number.');
    valid = false;
  } else {
    setFieldError('phone', 'phone', '');
  }

  // — College —
  const college = collegeInput.value.trim();
  if (!college) {
    setFieldError('college', 'college', 'College name is required.');
    valid = false;
  } else {
    setFieldError('college', 'college', '');
  }

  // — Event Name —
  const eventName = eventNameInput.value.trim();
  if (!eventName) {
    setFieldError('event-name', 'event-name', 'Event name is required.');
    valid = false;
  } else {
    setFieldError('event-name', 'event-name', '');
  }

  // — Event Start Date —
  const eventStartDate = eventStartDateInput.value;
  if (!eventStartDate) {
    setFieldError('event-start-date', 'event-start-date', 'Start date is required.');
    valid = false;
  } else {
    setFieldError('event-start-date', 'event-start-date', '');
  }

  // — Event End Date —
  const eventEndDate = eventEndDateInput.value;
  if (!eventEndDate) {
    setFieldError('event-end-date', 'event-end-date', 'End date is required.');
    valid = false;
  } else if (eventStartDate && eventEndDate < eventStartDate) {
    setFieldError('event-end-date', 'event-end-date', 'End date must be on or after start date.');
    valid = false;
  } else {
    setFieldError('event-end-date', 'event-end-date', '');
  }

  // — Selected Events —
  const selected = getSelectedEvents();
  const evErrEl = document.getElementById('error-events');
  if (selected.length === 0) {
    if (evErrEl) evErrEl.textContent = 'Please select at least one event.';
    valid = false;
  } else {
    if (evErrEl) evErrEl.textContent = '';
  }

  // — Other event text (if "Other" checked) —
  if (otherCheckbox.checked) {
    const otherVal = otherInput.value.trim();
    if (!otherVal) {
      setFieldError('other-event', 'other-event', 'Please specify the event name.');
      valid = false;
    } else {
      setFieldError('other-event', 'other-event', '');
    }
  }

  return {
    valid,
    data: {
      name,
      roll,
      phone,
      college,
      eventName,
      eventStartDate,
      eventEndDate,
      selectedEvents: selected.join(', '),
    },
  };
}

/**
 * Collect selected event checkbox values.
 * If "Other" is checked, replace the value with the typed text.
 */
function getSelectedEvents() {
  const result = [];
  eventCheckboxes.forEach((cb) => {
    if (cb.checked) {
      if (cb.value === 'Other') {
        const custom = otherInput.value.trim();
        if (custom) result.push(custom);
        else result.push('Other');
      } else {
        result.push(cb.value);
      }
    }
  });
  return result;
}

/* =====================================================
   ⑦ REAL-TIME VALIDATION (clear errors on input)
   ===================================================== */
[nameInput, rollInput, phoneInput, collegeInput, eventNameInput, eventStartDateInput, eventEndDateInput].forEach((inp) => {
  inp.addEventListener('input', () => {
    const groupId = inp.id;
    const errId = inp.id;
    setFieldError(errId, groupId, '');
  });
});

// Phone: allow only digits
phoneInput.addEventListener('input', () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
});

/* =====================================================
   ⑧ "OTHER" TOGGLE
   ===================================================== */
otherCheckbox.addEventListener('change', () => {
  if (otherCheckbox.checked) {
    otherGroup.classList.remove('hidden');
    otherInput.focus();
  } else {
    otherGroup.classList.add('hidden');
    otherInput.value = '';
    setFieldError('other-event', 'other-event', '');
  }
});

/* =====================================================
   ⑨ SUBMIT HANDLER
   ===================================================== */
let isSubmitting = false; // Guard against double-submit

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Prevent double submission
  if (isSubmitting) {
    showToast('⏳ Submission in progress, please wait…', 'info');
    return;
  }

  const { valid, data } = validateForm();

  if (!valid) {
    showToast('⚠️ Please fix the errors above before submitting.', 'error');
    // Scroll to first error
    const firstErrGroup = document.querySelector('.has-error');
    if (firstErrGroup) firstErrGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Set loading state
  isSubmitting = true;
  setLoading(true);

  try {
    await sendToGoogleSheets(data);

    // 1. Persist user data to localStorage
    storeUserData();

    // 2. Show success popup
    showSuccessPopup();

    // 3. Partial reset — clear non-persistent fields
    partialReset();

  } catch (err) {
    console.error('Submission error:', err);
    showToast('❌ Submission failed. Please check your connection and try again.', 'error', 5000);
  } finally {
    setLoading(false);
    isSubmitting = false;
  }
});

/* =====================================================
   ⑩ GOOGLE SHEETS — FETCH
   ===================================================== */
/**
 * Sends form data to the Google Apps Script Web App.
 * The script must be deployed as "Anyone can access".
 *
 * @param {object} data - validated form data
 */
async function sendToGoogleSheets(data) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const payload = {
    timestamp,
    name: data.name,
    roll: data.roll,
    phone: data.phone,
    college: data.college,
    eventName: data.eventName,
    eventStartDate: data.eventStartDate,
    eventEndDate: data.eventEndDate,
    selectedEvents: data.selectedEvents,
  };

  // Use no-cors only if you can't set CORS headers on the script;
  // With Apps Script Web App, mode: 'no-cors' is the safe choice.
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // Apps Script doesn't support preflight
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // With no-cors, we can't read the response body — just trust it sent.
  // If you need confirmation, switch to a CORS-enabled endpoint.
  return response;
}

/* =====================================================
   ⑪ LOADING STATE
   ===================================================== */
function setLoading(state) {
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const btnIcon = submitBtn.querySelector('.btn-icon');
  submitBtn.disabled = state;
  if (state) {
    btnText.textContent = 'Submitting…';
    btnLoader.classList.remove('hidden');
    if (btnIcon) btnIcon.textContent = '⏳';
  } else {
    btnText.textContent = 'Register Now';
    btnLoader.classList.add('hidden');
    if (btnIcon) btnIcon.textContent = '🚀';
  }
}

/* =====================================================
   ⑫ SUCCESS POPUP
   ===================================================== */
function showSuccessPopup() {
  successPopup.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function hideSuccessPopup() {
  successPopup.classList.add('hidden');
  document.body.style.overflow = '';
}

popupClose.addEventListener('click', hideSuccessPopup);

// Close on overlay click
successPopup.addEventListener('click', (e) => {
  if (e.target === successPopup) hideSuccessPopup();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !successPopup.classList.contains('hidden')) {
    hideSuccessPopup();
  }
});

/* =====================================================
   ⑬ PARTIAL RESET (after submit — keep persistent data)
   ===================================================== */
function partialReset() {
  // Clear non-persistent fields
  collegeInput.value = '';
  eventNameInput.value = '';
  // Reset both dates to today
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  eventStartDateInput.value = today;
  eventEndDateInput.value = today;
  // Uncheck all events
  eventCheckboxes.forEach((cb) => { cb.checked = false; });
  // Hide other input
  otherGroup.classList.add('hidden');
  otherInput.value = '';
  // Clear all errors
  document.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  document.querySelectorAll('.has-error').forEach((el) => { el.classList.remove('has-error'); });
}

/* =====================================================
   ⑭ FULL RESET BUTTON
   ===================================================== */
resetBtn.addEventListener('click', () => {
  if (!confirm('Reset the form? This will clear all fields.')) return;
  form.reset();
  otherGroup.classList.add('hidden');
  otherInput.value = '';
  document.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
  document.querySelectorAll('.has-error').forEach((el) => { el.classList.remove('has-error'); });
  // Reload auto-fills
  loadStoredUserData();
  // Reset both dates to today
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  eventStartDateInput.value = today;
  eventEndDateInput.value = today;
  showToast('🔄 Form has been reset.', 'info');
});

/* =====================================================
   ⑮ TOAST NOTIFICATIONS
   ===================================================== */
/**
 * Show a toast message.
 * @param {string} message  - The message text
 * @param {'error'|'success'|'info'} type
 * @param {number} duration - auto-dismiss time in ms (default 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}
