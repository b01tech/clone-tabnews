import retry from "async-retry";

async function waitForAllServices() {
    console.log("Aguardando serviços...");
    await waitForWebServer();
    console.log("Serviços prontos!");

    async function waitForWebServer() {
        return retry(fetchStatusPage, {
            retries: 30, // Reduzir tentativas
            maxTimeout: 2000,
            onRetry: (err, attempt) => {
                console.log(
                    `Tentativa ${attempt} falhou, tentando novamente...`,
                );
            },
        });

        async function fetchStatusPage() {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/v1/status",
                );
                if (response.status !== 200) {
                    throw new Error(`Status ${response.status}`);
                }
                console.log("Servidor respondendo corretamente!");
            } catch (error) {
                console.log("Erro ao conectar com servidor:", error.message);
                throw error;
            }
        }
    }
}

const orchestrator = {
    waitForAllServices,
};

export default orchestrator;
