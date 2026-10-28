const form = document.getElementById('profileForm');
const summary = document.getElementById('summary');
const charCount = document.getElementById('charCount');
const toast = document.getElementById('toast');
const cancelButton = document.getElementById('cancelButton');

const defaultValues = Object.fromEntries(new FormData(form).entries());

function updateCounter() {
  charCount.textContent = summary.value.length;
}

function restoreSavedProfile() {
  const saved = localStorage.getItem('careerProfile');
  if (!saved) {
    updateCounter();
    return;
  }

  try {
    const values = JSON.parse(saved);
    Object.entries(values).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field) field.value = value;
    });
  } catch (error) {
    console.warn('Could not restore the saved career profile.', error);
  }
  updateCounter();
}

function validateForm() {
  let valid = true;
  const requiredFields = [document.getElementById('fullName'), document.getElementById('email')];

  requiredFields.forEach((field) => {
    const error = field.closest('.field').querySelector('.error');
    field.classList.remove('invalid');

    if (!field.value.trim()) {
      error.textContent = field.id === 'fullName' ? 'Please enter your full name.' : 'Please enter your email address.';
      field.classList.add('invalid');
      valid = false;
    } else if (field.type === 'email' && !field.checkValidity()) {
      error.textContent = 'Please enter a valid email address.';
      field.classList.add('invalid');
      valid = false;
    } else {
      error.textContent = '';
    }
  });

  return valid;
}

summary.addEventListener('input', updateCounter);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const values = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem('careerProfile', JSON.stringify(values));
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
});

cancelButton.addEventListener('click', () => {
  Object.entries(defaultValues).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  });
  document.querySelectorAll('.error').forEach((error) => { error.textContent = ''; });
  document.querySelectorAll('.invalid').forEach((field) => field.classList.remove('invalid'));
  updateCounter();
});

restoreSavedProfile();
