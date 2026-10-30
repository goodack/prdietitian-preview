document.documentElement.classList.add('js');

// Sticky header hairline once the page scrolls
const header = document.querySelector('[data-header]');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector('[data-nav-toggle]');
const navList = document.querySelector('[data-nav-list]');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  navList.classList.toggle('is-open', !open);
});
navList.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    toggle.setAttribute('aria-expanded', 'false');
    navList.classList.remove('is-open');
  }
});

// Insurance checker
const PHONE = '<a href="tel:+19564242274">956-424-2274</a>';
const inNetwork = (name) => ({
  state: 'yes',
  status: `Yes, we're in network with ${name}.`,
  detail: `Most ${name} plans cover nutrition counseling with a registered dietitian. We'll confirm your number of visits and any copay before your first appointment.`,
});
const employer = (name) => ({
  state: 'yes',
  status: `Yes, ${name} employee plans are covered.`,
  detail: `Tell us you're with ${name} when you call and we'll confirm your benefits before your first visit.`,
});

const PLANS = {
  bcbs: inNetwork('Blue Cross Blue Shield'),
  uhc: inNetwork('UnitedHealthcare'),
  cigna: inNetwork('Cigna'),
  ambetter: inNetwork('Ambetter'),
  medicare: {
    state: 'yes',
    status: 'Yes, for diabetes and kidney disease.',
    detail: 'Medicare covers nutrition therapy for diabetes and chronic kidney disease with a referral from your doctor. We can help you request it.',
  },
  medicaid: {
    state: 'maybe',
    status: 'Yes, for patients 20 and under.',
    detail: 'Superior and Driscoll Medicaid cover visits for children, teens, and young adults up to age 20. Patients 21 and over are welcome as self-pay.',
  },
  heb: {
    state: 'yes',
    status: 'Yes. HEB partners get 6 visits a year with no copay.',
    detail: 'Bring your HEB insurance card to your first visit and we will take care of the rest.',
  },
  walmart: employer('Walmart'),
  usps: employer('US Postal Service'),
  cbp: employer('US Border Patrol'),
  isd: employer('McAllen, Mission and La Joya school district'),
  ecisd: {
    state: 'maybe',
    status: 'Yes, for diabetes care.',
    detail: 'Edinburg CISD plans cover nutrition visits for diabetes, with a copay. For other goals, ask us about self-pay.',
  },
  spikes: employer('Spikes Ford'),
  bert: employer('Bert Ogden'),
  hcid: employer('Hidalgo County Irrigation'),
  ge: employer('GE Capital'),
  other: {
    state: 'maybe',
    status: "Let's check it for you.",
    detail: `Many plans cover nutrition counseling even if they aren't listed here. Call ${PHONE} with your insurance card and we'll look it up.`,
  },
  self: {
    state: 'maybe',
    status: 'You can still see Peggy.',
    detail: `Self-pay visits are available. Call ${PHONE} to ask about current rates and packages.`,
  },
};

const planSelect = document.querySelector('[data-plan]');
const result = document.querySelector('[data-result]');
planSelect.addEventListener('change', () => {
  const plan = PLANS[planSelect.value];
  if (!plan) {
    result.removeAttribute('data-state');
    result.innerHTML = `<p class="result-status">Your answer will show here.</p><p class="result-detail">Can't find your plan? Call us at ${PHONE} and we'll check it for you.</p>`;
    return;
  }
  result.dataset.state = plan.state;
  result.innerHTML = `
    <p class="result-status">${plan.status}</p>
    <p class="result-detail">${plan.detail}</p>
    <div class="result-actions">
      <a class="btn" href="#visit" data-prefill="${planSelect.options[planSelect.selectedIndex].text}">Book my visit</a>
      <a class="btn btn-ghost-light" href="tel:+19564242274">Call 956-424-2274</a>
    </div>`;
  // Restart the small settle animation on each new answer
  const status = result.querySelector('.result-status');
  status.style.animation = 'none';
  void status.offsetWidth;
  status.style.animation = '';
});

// Carry the chosen plan into the booking form
result.addEventListener('click', (e) => {
  const link = e.target.closest('[data-prefill]');
  if (link) document.getElementById('f-insurance').value = link.dataset.prefill;
});

// Roll out the tape measure once, when the steps come into view
const ruler = document.querySelector('[data-ruler]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        ruler.classList.add('is-rolled');
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(ruler);
} else {
  ruler.classList.add('is-rolled');
}

// Appointment request: validate, then open a pre-filled email
const form = document.querySelector('[data-form]');
const msg = document.querySelector('[data-form-msg]');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.elements.name;
  const phone = form.elements.phone;
  let firstInvalid = null;
  [name, phone].forEach((field) => {
    const bad = !field.value.trim();
    field.setAttribute('aria-invalid', String(bad));
    if (bad && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    msg.textContent = 'Add your name and phone number so we can call you back.';
    msg.classList.add('is-error');
    firstInvalid.focus();
    return;
  }
  const data = new FormData(form);
  const body = [
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Email: ${data.get('email') || '-'}`,
    `Insurance or employer plan: ${data.get('insurance') || '-'}`,
    `Help with: ${data.get('reason')}`,
    `Prefers to meet: ${data.get('visit')}`,
  ].join('\n');
  window.location.href = `mailto:info@prdietitian.com?subject=${encodeURIComponent('Appointment request: ' + data.get('name'))}&body=${encodeURIComponent(body)}`;
  msg.classList.remove('is-error');
  msg.textContent = 'Your email app is opening with your request. Press send and we will call you to confirm a time.';
});
