let activeWebhookIndex = 0; // Default to the first webhook

const loadWebhooksAndRender = async () => {
    const config = await window.electronAPI.getConfig();
    const webhookList = document.getElementById('webhook-list');
    webhookList.innerHTML = ""; // Clear the current list

    config.webhooks.forEach((webhook, index) => {
        const container = document.createElement('div');
        container.className = 'webhook-item';

        // Radio button for selecting active webhook
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'active-webhook';
        radio.value = index;
        radio.checked = index === activeWebhookIndex; // Check the currently active webhook
        radio.addEventListener('change', () => {
            activeWebhookIndex = index;
            alert(`Active webhook set to: ${webhook.name}`);
        });

        // Display webhook name
        const label = document.createElement('label');
        label.textContent = webhook.name;

        container.appendChild(radio);
        container.appendChild(label);
        webhookList.appendChild(container);
    });
};

document.getElementById('add-webhook').addEventListener('click', async () => {
    const name = document.getElementById('webhook-name').value;
    const url = document.getElementById('webhook-url').value;

    if (!name || !url) {
        alert('Please provide both a name and a URL for the webhook.');
        return;
    }

    const config = await window.electronAPI.getConfig();
    config.webhooks = config.webhooks || []; // Ensure webhooks array exists
    config.webhooks.push({ name, url }); // Add the new webhook
    await window.electronAPI.saveConfig(config); // Save the updated config
    loadWebhooksAndRender(); // Refresh the webhook list
});

// Update the send-message button to use the active webhook
document.getElementById('send-message').addEventListener('click', async () => {
    const message = document.getElementById('message-box').value;
    const config = await window.electronAPI.getConfig();
    const activeWebhook = config.webhooks[activeWebhookIndex];

    if (!activeWebhook) {
        alert('No active webhook selected.');
        return;
    }

    const payload = {
        blocks: [
            {
                type: "section",
                text: { type: "mrkdwn", text: message },
            },
        ],
    };

    const response = await window.electronAPI.sendWebhook({
        webhookUrl: activeWebhook.url,
        payload,
    });

    alert(response.success ? 'Message sent successfully!' : `Error: ${response.error}`);
});

// Handle dynamic buttons
const loadConfigAndRenderButtons = async () => {
    const config = await window.electronAPI.getConfig();
    const buttonContainer = document.getElementById('button-container');
    buttonContainer.innerHTML = ""; // Clear existing buttons

    config.buttons.forEach((button, index) => {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'button-wrapper';

        // Create the main button
        const btn = document.createElement('button');
        btn.textContent = button.label;
        btn.addEventListener('click', async () => {
            const activeWebhook = config.webhooks[activeWebhookIndex];
            if (!activeWebhook) {
                alert('No active webhook selected.');
                return;
            }

            const response = await window.electronAPI.sendWebhook({
                webhookUrl: activeWebhook.url,
                payload: button.payload,
            });
            alert(response.success ? 'Webhook sent successfully!' : `Error: ${response.error}`);
        });

        // Create the delete button for each button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-button';
        deleteBtn.addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete the button "${button.label}"?`)) {
                config.buttons.splice(index, 1); // Remove the button from the array
                await window.electronAPI.saveConfig(config); // Save the updated config
                loadConfigAndRenderButtons(); // Refresh the button list
            }
        });

        // Append the buttons to the wrapper
        buttonWrapper.appendChild(btn);
        buttonWrapper.appendChild(deleteBtn);
        buttonContainer.appendChild(buttonWrapper);
    });
};
// document.addEventListener('DOMContentLoaded', () => {
// document.getElementById('add-button').addEventListener('click', async () => {
//     console.log('Add New Button clicked');
//     const label = prompt('Enter button label:');
//     if (!label) return;

//     const type = prompt('Enter button type (text/image):');
//     const text = prompt('Enter message text:');
//     const imageUrl = type === 'image' ? prompt('Enter image URL:') : null;

//     const payload = {
//         blocks: [
//             {
//                 type: "section",
//                 text: { type: "mrkdwn", text },
//             },
//         ],
//     };

//     if (type === 'image' && imageUrl) {
//         payload.blocks.push({
//             type: "image",
//             image_url: imageUrl,
//             alt_text: label,
//         });
//     }

//     const config = await window.electronAPI.getConfig();
//     config.buttons.push({ label, payload });
//     await window.electronAPI.saveConfig(config);
//     loadConfigAndRenderButtons();
// });
// });

// Initial load

document.getElementById('add-button').addEventListener('click', async () => {
    console.log('Opening configuration window for adding a new button');
    await window.electronAPI.openConfigWindow();
});
loadWebhooksAndRender();
loadConfigAndRenderButtons();
