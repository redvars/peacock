function fallbackCopyTextToClipboard(text: string) {
  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = text;

  // Make the element non-visible but still in the DOM so it can be selected
  temporaryInput.setAttribute('readonly', '');
  temporaryInput.style.position = 'absolute';
  temporaryInput.style.left = '-9999px';

  document.body.appendChild(temporaryInput);
  temporaryInput.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Failed to copy text: ', err);
  } finally {
    document.body.removeChild(temporaryInput);
  }
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Use the modern Clipboard API
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text using Clipboard API: ', err);
      // Fallback if API fails for some reason
      fallbackCopyTextToClipboard(text);
    }
  } else {
    // Use the fallback method for older browsers
    fallbackCopyTextToClipboard(text);
  }
}
