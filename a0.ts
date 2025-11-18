
export interface DeploymentResult {
  url: string;
  qrCode: string; // This will be a data URL for the QR code image
}

// A simple function to generate a QR code data URL using an external API.
const generateQRCodeDataURL = (text: string): string => {
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedText}`;
};

/**
 * Simulates a deployment process.
 * @param flutterCode The Flutter code to "deploy".
 * @returns A promise that resolves with the deployment result.
 */
export const deploy = (flutterCode: string): Promise<DeploymentResult> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay for a more realistic feel.
    setTimeout(() => {
      // Simulate a small chance of deployment failure.
      if (Math.random() > 0.95) {
        reject(new Error("Mock deployment failed due to a transient error. Please try again."));
        return;
      }

      // Generate a unique, fake URL for the deployed app.
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const url = `https://a0-${uniqueId}.dev-app.io`;
      
      const qrCode = generateQRCodeDataURL(url);

      resolve({
        url,
        qrCode,
      });
    }, 2500); // 2.5 second delay
  });
};
