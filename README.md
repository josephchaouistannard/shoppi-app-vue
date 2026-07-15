# Shoppi

Shoppi is a local-first shopping list app for Android. Simple to use, it has an optional AI categorisation feature to organise items by aisle. The app can be used independently, but an optional self-hosted sync server can be configured to allow synchronisation across devices for multiple users.

## App

The app is built with Vue and packaged for Android using [Capacitor](https://capacitorjs.com/), which provides access to native Android features. These include:

* Monitoring app state changes to trigger synchronisation.
* Accessing the camera to scan QR codes for sharing settings.

Shoppi currently supports two AI providers for item categorisation:

* **Gemini**
* **Groq**

Both providers offer free API keys. The AI provider and the optional sync server can be configured from the app's settings page.

## Sync Server

The optional sync server is an API built with [Hono](https://hono.dev/) and uses an SQLite database. It allows multiple users to keep their shopping lists synchronised across devices.

To install the server on a VPS, run the following commands:

```bash
curl -fsSL https://dl.josephchaouistannard.com/scripts/shoppi-install-script.sh -o shoppi-deploy-script.sh
chmod +x shoppi-deploy-script.sh
./shoppi-deploy-script.sh
```

The installation script:

1. Clones the [shoppi-api-hono](https://github.com/josephchaouistannard/shoppi-api-hono/) repository.
2. Builds the Docker image.
3. Starts the API on port `3000`.

Once the server is running, save the API URL and your chosen API key in the app's settings to enable synchronisation.
