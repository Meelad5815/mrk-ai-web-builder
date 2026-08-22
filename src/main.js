const instruction = document.querySelector('#instruction');
const previewTitle = document.querySelector('#preview-title');
const chips = [...document.querySelectorAll('.chip')];

function summarize(value) {
  const cleanValue = value.trim() || 'Describe the website change you want MRK to make.';
  return cleanValue.length > 90 ? `${cleanValue.slice(0, 90)}…` : cleanValue;
}

function updatePreview(value) {
  previewTitle.textContent = summarize(value);
}

instruction.addEventListener('input', (event) => updatePreview(event.target.value));

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((item) => item.classList.remove('chip--active'));
    chip.classList.add('chip--active');
    instruction.value = chip.textContent;
    updatePreview(chip.textContent);
    instruction.focus();
  });
});
