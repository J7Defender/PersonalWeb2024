const urlParams = new URLSearchParams(window.location.search);
const alertMessage = urlParams.get('alert');

if (alertMessage) {
    alert(alertMessage);
}